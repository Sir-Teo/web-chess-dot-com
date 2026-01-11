
import { Chess } from 'chess.js';
import { identifyOpening } from './openings';

// Define Constant - using jsdelivr CDN which is more reliable
export const STOCKFISH_URL = 'https://cdn.jsdelivr.net/npm/stockfish@14.0.0/src/stockfish.js';

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
    moveNumber: number;
    moveIndex: number; // 0-based index in the full game history
    color: 'w' | 'b';
    san: string;
    from: string;
    to: string;
    fen: string;
    eval?: number; // centipawns
    mate?: number; // Mate in moves
    bestMove?: string;
    classification: 'brilliant' | 'great' | 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'book' | 'missed-win' | 'forced';
    reason?: string; // Explanation for the classification
    _nextBestMove?: string; // Internal use
}

export interface GameReviewData {
    accuracy: { w: number; b: number };
    performanceRating: { w: number; b: number };
    opening: string;
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
  private resolveCurrent: ((value: { bestMove: string, score: EngineScore | null }) => void) | null = null;
  private currentCommand: 'uci' | 'go' | null = null;
  private bestMove: string | null = null;
  private score: EngineScore | null = null;

  private constructor(worker: Worker) {
    this.worker = worker;
  }

  static async create(url: string): Promise<StockfishClient> {
      try {
          const response = await fetch(url);
          const script = await response.text();
          const blob = new Blob([script], { type: 'application/javascript' });
          const blobUrl = URL.createObjectURL(blob);
          const worker = new Worker(blobUrl);

          const client = new StockfishClient(worker);
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
        this.handleMessage(msg);
        if (this.onMessageCallback) this.onMessageCallback(msg);
    };
    this.worker.postMessage('uci');
    // Wait for uciok
    return new Promise<void>((resolve, reject) => {
        let attempts = 0;
        const check = setInterval(() => {
            attempts++;
            if (this.isReady) {
                clearInterval(check);
                resolve();
            }
            if (attempts > 200) { // 10 seconds
                clearInterval(check);
                reject(new Error("Stockfish init timeout"));
            }
        }, 50);
    });
  }

  private handleMessage(line: string) {
      if (this.currentCommand === 'go') {
          // Handle CP score
          if (line.startsWith('info') && line.includes('score cp')) {
              const match = line.match(/score cp (-?\d+)/);
              if (match) {
                   this.score = { unit: 'cp', value: parseInt(match[1]) };
              }
          }
          // Handle Mate score
          else if (line.startsWith('info') && line.includes('score mate')) {
              const match = line.match(/score mate (-?\d+)/);
              if (match) {
                  this.score = { unit: 'mate', value: parseInt(match[1]) };
              }
          }

          if (line.startsWith('bestmove')) {
              this.bestMove = line.split(' ')[1];
              if (this.resolveCurrent) {
                  this.resolveCurrent({ bestMove: this.bestMove, score: this.score });
                  this.resolveCurrent = null;
                  this.currentCommand = null;
              }
          }
      }
  }

  async setOption(name: string, value: string | number) {
      this.worker.postMessage(`setoption name ${name} value ${value}`);
  }

  setPosition(fen: string) {
      this.worker.postMessage(`position fen ${fen}`);
  }

  async go(depth: number): Promise<{ bestMove: string, score: EngineScore | null }> {
      return new Promise((resolve) => {
          this.currentCommand = 'go';
          this.score = null;
          this.bestMove = null;
          this.resolveCurrent = resolve;
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

// Convert score to CP for comparison logic
const getComparisonScore = (score: EngineScore, turn: 'w' | 'b'): number => {
    let cp = 0;
    if (score.unit === 'cp') {
        cp = score.value;
    } else {
        // Mate
        if (score.value > 0) cp = 10000 - score.value; // Positive Mate (e.g. M1 = 9999)
        else cp = -10000 - score.value; // Negative Mate (e.g. -M1 = -9999)
    }

    // Engine returns score relative to side to move.
    // If it's Black's turn, a positive score means Black is winning.
    // We normalize to White perspective for consistent loss calculation.
    if (turn === 'b') {
        cp = -cp;
    }
    return cp;
};

export const analyzeGame = async (
    pgn: string,
    onProgress?: (current: number, total: number) => void
): Promise<GameReviewData> => {
    // 1. Setup Engine
    let client: StockfishClient | null = null;
    try {
        client = await StockfishClient.create(STOCKFISH_URL);
        await client.setOption('MultiPV', 1);
    } catch (e) {
        console.warn("Analysis engine failed to load, proceeding with move parsing only.", e);
    }

    // 2. Parse Game
    const game = new Chess();
    try {
        game.loadPgn(pgn);
    } catch (e) {
        console.error("Invalid PGN for analysis", e);
        return { accuracy: { w: 0, b: 0 }, performanceRating: { w: 400, b: 400 }, opening: "Unknown", moves: [] };
    }

    const history = game.history({ verbose: true });

    // Identify Opening
    const openingName = identifyOpening(pgn);

    // Reconstruct game states
    const tempGame = new Chess();
    const movesToAnalyze: { fenBefore: string, fenAfter: string, move: any }[] = [];

    for (const move of history) {
        const fenBefore = tempGame.fen();
        tempGame.move(move);
        const fenAfter = tempGame.fen();
        movesToAnalyze.push({ fenBefore, fenAfter, move });
    }

    const results: MoveAnalysis[] = [];

    // Analyze Loop
    // Reduced depth to 12 for better performance
    const DEPTH = 12;

    for (let i = 0; i < movesToAnalyze.length; i++) {
        if (onProgress) onProgress(i + 1, movesToAnalyze.length);

        const { fenBefore, fenAfter, move } = movesToAnalyze[i];
        const turnBefore = fenBefore.split(' ')[1] as 'w' | 'b';
        const turnAfter = fenAfter.split(' ')[1] as 'w' | 'b';

        let classification: MoveAnalysis['classification'] = 'book';
        let evalCp = 0;
        let evalMate: number | undefined = undefined;
        let bestMove = '';
        let reason = "";

        if (client) {
            try {
                // A. Evaluate position BEFORE (to see what was expected)
                client.setPosition(fenBefore);
                const bestMoveResult = await client.go(DEPTH);
                bestMove = bestMoveResult.bestMove;

                let scoreBefore = 0;
                let scoreBeforeObj = bestMoveResult.score;
                let mateBefore: number | undefined = undefined;

                if (scoreBeforeObj) {
                    scoreBefore = getComparisonScore(scoreBeforeObj, turnBefore);
                    if (scoreBeforeObj.unit === 'mate') {
                        mateBefore = turnBefore === 'w' ? scoreBeforeObj.value : -scoreBeforeObj.value;
                    }
                }

                // B. Check if played move matches best move
                const playedMoveUci = move.from + move.to + (move.promotion || '');
                classification = 'good';
                evalCp = scoreBefore;

                // Check for forced mate sequence
                const isForcedMate = mateBefore !== undefined &&
                                     ((turnBefore === 'w' && mateBefore > 0) || (turnBefore === 'b' && mateBefore < 0));

                // Identify capture/check context
                const isCapture = move.captured || move.flags.includes('c') || move.flags.includes('e');
                const isCheck = move.san.includes('+');

                if (bestMove === playedMoveUci) {
                    classification = 'best';
                    if (isForcedMate) {
                        classification = 'great'; // Finding mate is great
                        reason = "You found the correct winning move!";
                    } else if (isCapture) {
                        reason = "Best move. You captured the right piece.";
                    } else {
                        reason = "This was the best move in the position.";
                    }
                } else {
                    // C. Evaluate RESULTING position
                    client.setPosition(fenAfter);
                    const afterResult = await client.go(DEPTH);

                    let scoreAfter = 0;
                    const scoreAfterObj = afterResult.score;
                    let mateAfter: number | undefined = undefined;

                    if (scoreAfterObj) {
                        scoreAfter = getComparisonScore(scoreAfterObj, turnAfter);
                        evalCp = scoreAfter; // This is the eval *after* the move
                        if (scoreAfterObj.unit === 'mate') {
                            mateAfter = turnAfter === 'w' ? scoreAfterObj.value : -scoreAfterObj.value;
                        }
                    }
                    evalMate = mateAfter; // Store for UI

                    const isWhite = move.color === 'w';
                    const loss = isWhite ? (scoreBefore - scoreAfter) : (scoreAfter - scoreBefore);

                    // CLASSIFICATION LOGIC

                    // 1. Missed Win
                    // If we had a mate (isForcedMate) and now we don't (or mate is much slower/lost)
                    if (isForcedMate) {
                         // Check if we still have mate
                         const stillHasMate = mateAfter !== undefined && ((isWhite && mateAfter > 0) || (!isWhite && mateAfter < 0));
                         if (!stillHasMate) {
                             classification = 'missed-win';
                             reason = "You missed a forced checkmate sequence.";
                         } else {
                             // Still mate but maybe slower?
                             classification = 'good'; // or inaccuracy
                             reason = "You still have a mate, but there was a faster way.";
                         }
                    }
                    // 2. Blunder (High CP Loss or Losing winning position)
                    else if (loss > 200) {
                        classification = 'blunder';
                        if (isCapture) {
                            reason = "This capture was a blunder.";
                        } else if (loss > 500) {
                             reason = "A critical error that loses the game.";
                        } else {
                            reason = "You gave away a significant advantage.";
                        }
                    }
                    // 3. Mistake
                    else if (loss > 100) {
                        classification = 'mistake';
                        if (isCapture) {
                             reason = "This capture hurts your position.";
                        } else if (isCheck) {
                             reason = "This check was a mistake.";
                        } else {
                             reason = "This move hurts your position.";
                        }
                    }
                    // 4. Inaccuracy
                    else if (loss > 50) {
                        classification = 'inaccuracy';
                        reason = "There was a slightly better move.";
                    }
                    // 5. Good/Excellent
                    else if (loss > 20) {
                        classification = 'good';
                        reason = "A solid move.";
                    } else {
                        classification = 'excellent';
                        reason = "An excellent move!";
                    }
                }
            } catch (err) {
                console.error("Error analyzing move", i, err);
            }
        }

        // Book Move Override
        if (i < 8 && classification !== 'best' && classification !== 'missed-win' && classification !== 'blunder') {
             // Heuristic: If early in game and not a disaster, call it book or good.
             // We could check if it is in Opening DB, but for now simple heuristic.
             // classification = 'book';
        }

        results.push({
            moveNumber: Math.floor(i / 2) + 1,
            moveIndex: i,
            color: move.color,
            san: move.san,
            from: move.from,
            to: move.to,
            fen: fenAfter,
            eval: evalCp,
            mate: evalMate,
            bestMove: bestMove,
            classification: classification,
            reason: reason
        });
    }

    if (client) {
        client.terminate();
    }
    return calculateStats(results, openingName);
};

const calculateStats = (moves: MoveAnalysis[], opening: string): GameReviewData => {
    let wScore = 0, bScore = 0;
    let wMoves = 0, bMoves = 0;

    for (const m of moves) {
        const score = m.classification === 'best' ? 100 :
                      m.classification === 'great' ? 95 :
                      m.classification === 'excellent' ? 90 :
                      m.classification === 'good' ? 80 :
                      m.classification === 'book' ? 100 :
                      m.classification === 'inaccuracy' ? 50 :
                      m.classification === 'mistake' ? 20 :
                      m.classification === 'missed-win' ? 0 :
                      m.classification === 'blunder' ? 0 : 0;

        if (m.color === 'w') {
            wScore += score;
            wMoves++;
        } else {
            bScore += score;
            bMoves++;
        }
    }

    const wAccuracy = wMoves ? Math.round(wScore / wMoves) : 0;
    const bAccuracy = bMoves ? Math.round(bScore / bMoves) : 0;

    // Estimate Elo based on accuracy
    // Simple linear interpolation for fun
    // 100 -> 2800, 50 -> 400
    const wElo = Math.max(100, Math.round(400 + (wAccuracy - 50) * 48));
    const bElo = Math.max(100, Math.round(400 + (bAccuracy - 50) * 48));

    return {
        accuracy: {
            w: wAccuracy,
            b: bAccuracy
        },
        performanceRating: {
            w: wElo,
            b: bElo
        },
        opening,
        moves
    };
};
