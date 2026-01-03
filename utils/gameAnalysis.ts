import { Chess } from 'chess.js';

export interface MoveAnalysis {
    moveNumber: number;
    color: 'w' | 'b';
    san: string;
    from: string;
    to: string;
    fen: string;
    eval?: number; // centipawns
    mate?: number; // Mate in moves
    bestMove?: string;
    classification: 'brilliant' | 'great' | 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'book';
}

export interface GameReviewData {
    accuracy: { w: number; b: number };
    moves: MoveAnalysis[];
}

export interface EngineScore {
    unit: 'cp' | 'mate';
    value: number;
}

// A simple promise-based wrapper for Stockfish commands
export class StockfishClient {
    private worker: Worker;
    private resolveCurrent: ((value: { bestMove: string, score: EngineScore | null }) => void) | null = null;
    private currentCommand: 'uci' | 'go' | null = null;
    private bestMove: string | null = null;
    private score: EngineScore | null = null;

    // Make constructor private to force usage of async create
    private constructor(worker: Worker) {
        this.worker = worker;
    }

    static async create(url: string): Promise<StockfishClient> {
        // Fetch script content to create a local Blob URL
        // This bypasses Cross-Origin Worker restrictions (CORS) when using CDNs
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch Stockfish from ${url}`);

        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);
        const worker = new Worker(objectURL);

        const client = new StockfishClient(worker);
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

    public setPosition(fen: string): void {
        this.worker.postMessage(`position fen ${fen}`);
    }

    public async go(depth: number): Promise<{ bestMove: string, score: EngineScore | null }> {
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

    for (const move of history) {
        const fenBefore = tempGame.fen();
        tempGame.move(move);
        const fenAfter = tempGame.fen();
        movesToAnalyze.push({ fenBefore, fenAfter, move });
    }

    const results: MoveAnalysis[] = [];
    let lastEvalCp = 0; // Evaluation of previous position (White's perspective)

    // 3. Analyze Loop
    for (let i = 0; i < movesToAnalyze.length; i++) {
        const { fenBefore, fenAfter, move } = movesToAnalyze[i];
        const turnBefore = fenBefore.split(' ')[1] as 'w' | 'b';
        const turnAfter = fenAfter.split(' ')[1] as 'w' | 'b';

        // A. Evaluate the position BEFORE the move to find the Best Move and its score.
        client.setPosition(fenBefore);
        const bestMoveResult = await client.go(10); // Depth 10

        const bestMove = bestMoveResult.bestMove;

        // Normalized Score for "Before" position (White's perspective)
        let scoreBefore = 0;
        let scoreBeforeObj = bestMoveResult.score;

        if (scoreBeforeObj) {
            scoreBefore = getComparisonScore(scoreBeforeObj, turnBefore);
        }

        // B. Check if played move matches best move
        const playedMoveUci = move.from + move.to + (move.promotion || '');
        let classification: MoveAnalysis['classification'] = 'good';
        let evalCp = scoreBefore; // Default to before score unless recalculated
        let evalMate: number | undefined = undefined;

        if (scoreBeforeObj && scoreBeforeObj.unit === 'mate') {
            // Adjust mate for display: if it's White's turn and score is positive, it's M(value).
            // If it's Black's turn and score is positive, it's M(value) FOR BLACK (which is negative for white).
            // Wait, engine score is always relative to side to move.
            // If side to move is White, +M1 means White mates in 1.
            // If side to move is Black, +M1 means Black mates in 1.
            // In our `eval` field (CP), we normalized to White perspective.
            // For `mate` field, we should probably store "moves to mate".
            // Convention: Positive = White mates, Negative = Black mates.

            const mateVal = scoreBeforeObj.value;
            evalMate = turnBefore === 'w' ? mateVal : -mateVal;
        }

        if (bestMove === playedMoveUci) {
            classification = 'best';
            lastEvalCp = scoreBefore;
        } else {
            // C. If not best move, we need to evaluate the RESULTING position (`fenAfter`)
            // to see how much we lost.

            client.setPosition(fenAfter);
            const afterResult = await client.go(10);

            // Score for `fenAfter` (White's perspective)
            let scoreAfter = 0;
            const scoreAfterObj = afterResult.score;
            if (scoreAfterObj) {
                scoreAfter = getComparisonScore(scoreAfterObj, turnAfter);

                // Update eval for display (Use AFTER score if we played sub-optimally)
                evalCp = scoreAfter;

                if (scoreAfterObj.unit === 'mate') {
                    const mateVal = scoreAfterObj.value;
                    evalMate = turnAfter === 'w' ? mateVal : -mateVal;
                } else {
                    evalMate = undefined;
                }
            }

            // Calculate Centipawn Loss
            // If White moved: We want to Maximize score. Loss = scoreBefore - scoreAfter.
            // If Black moved: We want to Minimize score. Loss = scoreAfter - scoreBefore.
            // (Note: scoreBefore/After are already White-relative)

            const isWhite = move.color === 'w';
            const loss = isWhite ? (scoreBefore - scoreAfter) : (scoreAfter - scoreBefore);

            // Thresholds calibrated for typical engine evaluations (CP)
            // Mate changes (huge jumps) will trigger Blunder/Mistake correctly due to 10000 scaling.
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
            fen: fenAfter,
            eval: evalCp,
            mate: evalMate,
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
