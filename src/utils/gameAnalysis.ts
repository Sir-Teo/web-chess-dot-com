
import { Chess } from 'chess.js';

// Define Constant
export const STOCKFISH_URL = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js';

// Real implementation of StockfishClient
export interface EngineScore {
  unit: 'cp' | 'mate';
  value: number;
}

export interface AnalysisLine {
  multipv: number;
  pv: string; // UCI string "e2e4 e7e5"
  score: EngineScore;
  depth: number;
}

export interface MoveAnalysis {
    moveSan: string;
    moveIndex: number; // 0-based index in the full game history
    score: EngineScore;
    bestMove: string;
    classification: 'brilliant' | 'best' | 'great' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'book' | 'forced';
    reason?: string;
    // Internal use for next iteration, optional
    _nextBestMove?: string;
}

export interface GameReviewData {
    accuracy: number;
    moves: MoveAnalysis[];
}

// Convert a sequence of UCI moves (from a specific FEN) to SAN string
export const uciLineToSan = (fen: string, pv: string): string => {
  if (!pv) return '';
  const tempGame = new Chess(fen);
  const uciMoves = pv.split(' ');
  const sanMoves: string[] = [];

  for (const uci of uciMoves) {
    if (!uci) continue;
    const from = uci.substring(0, 2);
    const to = uci.substring(2, 4);
    const promotion = uci.length > 4 ? uci[4] : undefined;

    try {
      const move = tempGame.move({ from, to, promotion });
      if (move) sanMoves.push(move.san);
      else break;
    } catch (e) {
      break;
    }
  }
  return sanMoves.join(' ');
};

export class StockfishClient {
  private worker: Worker;
  private isReady: boolean = false;
  private onMessageCallback: ((msg: string) => void) | null = null;

  private constructor(workerUrl: string) {
    this.worker = new Worker(workerUrl);
  }

  static async create(url: string): Promise<StockfishClient> {
      try {
          const response = await fetch(url);
          const script = await response.text();
          const blob = new Blob([script], { type: 'application/javascript' });
          const blobUrl = URL.createObjectURL(blob);
          const client = new StockfishClient(blobUrl);
          await client.init();
          return client;
      } catch (e) {
          console.error("Failed to load Stockfish", e);
          throw e;
      }
  }

  async init(): Promise<void> {
    this.worker.onmessage = (e) => {
        const msg = e.data;
        if (msg === 'uciok') {
            this.isReady = true;
        }
        if (this.onMessageCallback) this.onMessageCallback(msg);
    };
    this.worker.postMessage('uci');
    // Wait for uciok
    return new Promise<void>((resolve) => {
        const check = setInterval(() => {
            if (this.isReady) {
                clearInterval(check);
                resolve();
            }
        }, 50);
    });
  }

  async setOption(name: string, value: string | number) {
      this.worker.postMessage(`setoption name ${name} value ${value}`);
  }

  setPosition(fen: string) {
      this.worker.postMessage(`position fen ${fen}`);
  }

  async go(depth: number): Promise<{ bestMove: string, score: EngineScore | null }> {
      return new Promise((resolve) => {
          let bestMove = '';
          let score: EngineScore | null = null;

          const listener = (e: MessageEvent) => {
              const msg = e.data;
              if (msg.startsWith('info') && msg.includes('score')) {
                  const parts = msg.split(' ');
                  const scoreIdx = parts.indexOf('score');
                  if (scoreIdx !== -1) {
                      const type = parts[scoreIdx + 1];
                      const val = parseInt(parts[scoreIdx + 2]);
                      if (type === 'cp' || type === 'mate') {
                          score = { unit: type as 'cp' | 'mate', value: val };
                      }
                  }
              }
              if (msg.startsWith('bestmove')) {
                  bestMove = msg.split(' ')[1];
                  this.worker.removeEventListener('message', listener);
                  resolve({ bestMove, score });
              }
          };
          this.worker.addEventListener('message', listener);
          this.worker.postMessage(`go depth ${depth}`);
      });
  }

  terminate() {
      this.worker.terminate();
  }

  stop() {
      this.worker.postMessage('stop');
  }
}

// Helper to normalize scores to white perspective centipawns (internal use)
// Mate is +/- 20000
const normalizeScore = (score: EngineScore | null): number => {
    if (!score) return 0;
    if (score.unit === 'mate') {
        return score.value > 0 ? 20000 - score.value : -20000 - score.value;
    }
    return score.value;
};

export const analyzeGame = async (
    pgn: string,
    onProgress?: (current: number, total: number) => void
): Promise<GameReviewData> => {
    // 1. Setup Game and Client
    const game = new Chess();
    game.loadPgn(pgn);
    const history = game.history({ verbose: true });

    const client = await StockfishClient.create(STOCKFISH_URL);
    await client.setOption('MultiPV', 1);

    const movesAnalysis: MoveAnalysis[] = [];
    const tempGame = new Chess(); // To replay and get FENs

    // Analyze Position 0 (Start)
    client.setPosition(tempGame.fen());
    const startAnalysis = await client.go(10); // Low depth for speed

    let currentEval = normalizeScore(startAnalysis.score);

    for (let i = 0; i < history.length; i++) {
        const move = history[i];
        const isWhite = move.color === 'w';

        // 2. Make the move to get next position
        tempGame.move(move);
        const fenAfter = tempGame.fen();

        // 3. Analyze Position After
        client.setPosition(fenAfter);
        const result = await client.go(12);

        let whiteEvalAfter = normalizeScore(result.score);
        // If it was black's turn to move (result is from white's perspective after black move),
        // Stockfish gives score relative to side to move? No, UCI 'score cp' is always side-to-move relative usually.
        // Wait, 'score cp' in UCI is relative to the side to move.
        // My normalizeScore doesn't account for who moved.

        // Actually, let's verify UCI 'score cp'.
        // "The score is from the point of view of the side to move."
        // So if White just moved, it's Black's turn. The score is for Black.
        // So `result.score.value` is for Black.
        // White Eval = -1 * result.score.value.

        // Let's refine `whiteEvalAfter`.
        // `fenAfter` is the position with `game.turn()` (next player) to move.
        // If `game.turn()` is Black, result is for Black. WhiteEval = -result.
        // If `game.turn()` is White, result is for White. WhiteEval = result.

        const turnAfter = tempGame.turn(); // 'w' or 'b'
        let rawScore = normalizeScore(result.score);
        if (turnAfter === 'b') {
            whiteEvalAfter = rawScore; // White just moved. Wait.
            // If turn is Black, side to move is Black. Score is for Black.
            // So White score is -rawScore.
             whiteEvalAfter = -rawScore;
        } else {
            // Turn is White. Side to move is White. Score is for White.
            whiteEvalAfter = rawScore;
        }

        // Calculate Loss (how much worse did I make my position?)
        // If I am White: Loss = PrevEval - NewEval (If I was +500 and now +100, Loss is 400)
        // If I am Black: Loss = NewEval - PrevEval (If I was -500 (good for black) and now -100, Loss is -100 - (-500) = 400)

        const evalDiff = isWhite
            ? currentEval - whiteEvalAfter
            : whiteEvalAfter - currentEval;

        // Classification
        let classification: MoveAnalysis['classification'] = 'good';

        const prevBestMove = i === 0 ? startAnalysis.bestMove : movesAnalysis[i-1]?._nextBestMove;
        const uciMove = move.from + move.to + (move.promotion || '');

        // Win Thresholds (CP)
        const WINNING_THRESHOLD = 700; // +7.00
        const LOST_WIN_THRESHOLD = 200; // Dropped below +2.00

        const isWinning = isWhite ? currentEval > WINNING_THRESHOLD : currentEval < -WINNING_THRESHOLD;
        const isMate = isWhite ? currentEval > 10000 : currentEval < -10000;

        const stillWinning = isWhite ? whiteEvalAfter > LOST_WIN_THRESHOLD : whiteEvalAfter < -LOST_WIN_THRESHOLD;
        const stillMate = isWhite ? whiteEvalAfter > 10000 : whiteEvalAfter < -10000;

        if (uciMove === prevBestMove) {
            classification = 'best';
        } else {
             // Missed Win Logic
            if ((isMate && !stillMate) || (isWinning && !stillWinning)) {
                // Check if the drop is significant
                if (evalDiff > 300) { // arbitrary threshold for "Missed Win"
                    classification = 'forced';
                } else {
                    classification = 'blunder';
                }
            } else if (evalDiff <= 25) {
                classification = 'great';
            } else if (evalDiff <= 60) {
                classification = 'inaccuracy';
            } else if (evalDiff <= 200) {
                classification = 'mistake';
            } else {
                classification = 'blunder';
            }
        }

        // Book Move Override
        if (i < 10 && evalDiff < 20 && classification !== 'best' && classification !== 'forced') {
             classification = 'book';
        }

        // Override for "Good" moves that aren't quite great but not inaccuracies
        if (classification === 'inaccuracy' && evalDiff < 30) classification = 'good';


        movesAnalysis.push({
            moveSan: move.san,
            moveIndex: i,
            score: { unit: 'cp', value: whiteEvalAfter }, // Store White perspective score
            bestMove: prevBestMove || '',
            classification: classification,
            _nextBestMove: result.bestMove
        });

        // Update state for next loop
        currentEval = whiteEvalAfter;

        if (onProgress) {
            onProgress(i + 1, history.length);
        }
    }

    client.terminate();

    let totalScore = 0;
    movesAnalysis.forEach(m => {
        switch (m.classification) {
            case 'brilliant':
            case 'best':
            case 'book': totalScore += 100; break;
            case 'great': totalScore += 95; break;
            case 'good': totalScore += 80; break;
            case 'inaccuracy': totalScore += 50; break;
            case 'mistake': totalScore += 20; break;
            case 'blunder':
            case 'forced':
                totalScore += 0; break;
        }
    });

    const accuracy = Math.round(totalScore / Math.max(1, movesAnalysis.length));

    return {
        accuracy,
        moves: movesAnalysis
    };
};
