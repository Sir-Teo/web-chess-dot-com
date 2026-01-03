import { Chess } from 'chess.js';

export interface MoveAnalysis {
    moveNumber: number;
    color: 'w' | 'b';
    san: string;
    from: string;
    to: string;
    fen: string;
    eval?: number; // centipawns
    bestMove?: string;
    classification: 'brilliant' | 'great' | 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'book';
}

export interface GameReviewData {
    accuracy: { w: number; b: number };
    moves: MoveAnalysis[];
}

// A simple promise-based wrapper for Stockfish commands
export class StockfishClient {
    private worker: Worker;
    private resolveCurrent: ((value: any) => void) | null = null;
    private currentCommand: 'uci' | 'go' | null = null;
    private bestMove: string | null = null;
    private score: number | null = null; // cp

    constructor(workerUrl: string) {
        this.worker = new Worker(workerUrl);
    }

    static async create(url: string): Promise<StockfishClient> {
        const response = await fetch(url);
        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);
        const client = new StockfishClient(objectURL);

        await client.init();
        return client;
    }

    private init(): Promise<void> {
        return new Promise((resolve) => {
            this.worker.onmessage = (e) => {
                const line = e.data;
                if (line === 'uciok') {
                    resolve();
                }
                this.handleMessage(line);
            };
            this.worker.postMessage('uci');
        });
    }

    private handleMessage(line: string) {
        if (this.currentCommand === 'go') {
            // Handle CP score
            if (line.startsWith('info') && line.includes('score cp')) {
                const match = line.match(/score cp (-?\d+)/);
                if (match) {
                     this.score = parseInt(match[1]);
                }
            }
            // Handle Mate score
            else if (line.startsWith('info') && line.includes('score mate')) {
                const match = line.match(/score mate (-?\d+)/);
                if (match) {
                    const mateIn = parseInt(match[1]);
                    // Convert mate to a high CP value for comparison
                    // If mate is positive (we win), big positive number.
                    // If mate is negative (we lose), big negative number.
                    this.score = mateIn > 0 ? (10000 - mateIn) : (-10000 - mateIn);
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

    public setPosition(fen: string): void {
        this.worker.postMessage(`position fen ${fen}`);
    }

    public async go(depth: number): Promise<{ bestMove: string, score: number | null }> {
        // If a command is already running, we might want to wait or throw, but here we assume sequential usage
        // or that the previous one will be overwritten by 'stop' if we implement it.
        return new Promise((resolve) => {
            this.currentCommand = 'go';
            this.score = null;
            this.bestMove = null;
            this.resolveCurrent = resolve;
            this.worker.postMessage(`go depth ${depth}`);
        });
    }

    public stop(): void {
        if (this.currentCommand === 'go') {
            this.worker.postMessage('stop');
            // The worker will emit 'bestmove' which will resolve the promise in handleMessage
        }
    }

    public terminate() {
        this.worker.terminate();
    }
}

export const analyzeGame = async (pgn: string): Promise<GameReviewData> => {
    // 1. Setup Engine
    const client = await StockfishClient.create('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js');

    // 2. Parse Game
    const game = new Chess();
    game.loadPgn(pgn);
    const history = game.history({ verbose: true });

    // Reconstruct game states
    const tempGame = new Chess();
    const movesToAnalyze: { fenBefore: string, fenAfter: string, move: any }[] = [];

    // Start FEN
    // let currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    for (const move of history) {
        const fenBefore = tempGame.fen();
        tempGame.move(move);
        const fenAfter = tempGame.fen();
        movesToAnalyze.push({ fenBefore, fenAfter, move });
    }

    const results: MoveAnalysis[] = [];
    let lastEvalCp = 0; // Evaluation of previous position (from White's perspective)

    // 3. Analyze Loop
    for (let i = 0; i < movesToAnalyze.length; i++) {
        const { fenBefore, fenAfter, move } = movesToAnalyze[i];

        // A. Evaluate the position BEFORE the move to find the Best Move and its score.
        client.setPosition(fenBefore);
        const bestMoveResult = await client.go(10); // Depth 10

        const bestMove = bestMoveResult.bestMove;

        // Normalized Score for "Before" position (White's perspective)
        let scoreBefore = bestMoveResult.score || 0;
        const turnBefore = fenBefore.split(' ')[1];
        if (turnBefore === 'b') scoreBefore = -scoreBefore;

        // B. Check if played move matches best move
        const playedMoveUci = move.from + move.to + (move.promotion || '');
        let classification: MoveAnalysis['classification'] = 'good';

        if (bestMove === playedMoveUci) {
            classification = 'best';
            lastEvalCp = scoreBefore;
        } else {
            // C. If not best move, we need to evaluate the RESULTING position (`fenAfter`)
            // to see how much we lost.

            client.setPosition(fenAfter);
            const afterResult = await client.go(10);

            // Score for `fenAfter` (White's perspective)
            let scoreAfter = afterResult.score || 0;
            const turnAfter = fenAfter.split(' ')[1];
            if (turnAfter === 'b') scoreAfter = -scoreAfter;

            // Calculate Centipawn Loss
            // If White moved: We want to Maximize score. Loss = scoreBefore - scoreAfter.
            // If Black moved: We want to Minimize score. Loss = scoreAfter - scoreBefore.

            const isWhite = move.color === 'w';
            const loss = isWhite ? (scoreBefore - scoreAfter) : (scoreAfter - scoreBefore);

            if (loss <= 20) classification = 'excellent';
            else if (loss <= 50) classification = 'good';
            else if (loss <= 100) classification = 'inaccuracy';
            else if (loss <= 200) classification = 'mistake';
            else classification = 'blunder';

            lastEvalCp = scoreAfter;
        }

        results.push({
            moveNumber: Math.floor(i / 2) + 1,
            color: move.color,
            san: move.san,
            from: move.from,
            to: move.to,
            fen: fenAfter, // The FEN resulting from the move
            eval: lastEvalCp,
            bestMove: bestMove,
            classification: classification
        });
    }

    client.terminate();
    return calculateAccuracy(results);
};


const calculateAccuracy = (moves: MoveAnalysis[]): GameReviewData => {
    let wScore = 0, bScore = 0;
    let wMoves = 0, bMoves = 0;

    for (const m of moves) {
        const score = m.classification === 'best' ? 100 :
                      m.classification === 'excellent' ? 90 :
                      m.classification === 'great' ? 95 :
                      m.classification === 'good' ? 80 :
                      m.classification === 'inaccuracy' ? 50 :
                      m.classification === 'mistake' ? 20 : 0;

        if (m.color === 'w') {
            wScore += score;
            wMoves++;
        } else {
            bScore += score;
            bMoves++;
        }
    }

    return {
        accuracy: {
            w: wMoves ? Math.round(wScore / wMoves) : 0,
            b: bMoves ? Math.round(bScore / bMoves) : 0
        },
        moves
    };
};
