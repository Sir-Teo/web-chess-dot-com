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
    classification: 'brilliant' | 'great' | 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'book' | 'missed-win';
    reason?: string; // Explanation for the classification
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
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Stockfish init timed out"));
            }, 10000);

            this.worker.onmessage = (e) => {
                const line = e.data;
                if (line === 'uciok') {
                    clearTimeout(timeout);
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

export const analyzeGame = async (pgn: string, onProgress?: (progress: number) => void): Promise<GameReviewData> => {
    // 1. Setup Engine
    let client: StockfishClient | null = null;
    try {
        client = await StockfishClient.create('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js');
    } catch (e) {
        console.warn("Analysis engine failed to load, proceeding with move parsing only.", e);
    }

    // 2. Parse Game
    const game = new Chess();
    try {
        game.loadPgn(pgn);
    } catch (e) {
        console.error("Invalid PGN for analysis", e);
        return { accuracy: { w: 0, b: 0 }, moves: [] };
    }

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

    // 3. Analyze Loop
    for (let i = 0; i < movesToAnalyze.length; i++) {
        if (onProgress) onProgress((i / movesToAnalyze.length) * 100);

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
                const bestMoveResult = await client.go(15);
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

                if (bestMove === playedMoveUci) {
                    classification = 'best';
                    if (isForcedMate) {
                        classification = 'great'; // Finding mate is great
                        reason = "You found the correct winning move!";
                    } else {
                        reason = "This was the best move in the position.";
                    }

                    // If best move, we can just assume eval stays roughly same (or improves if opponent made mistake before)
                    // But technically we should eval after to be sure of the *resulting* position score for the graph
                    // However, to save time, we can reuse scoreBefore as a proxy,
                    // or do a quick check. Let's reuse scoreBefore for "best" to save 50% compute.
                    // WAIT: Graph needs score of resulting position. If we played best, score is maintained.
                } else {
                    // C. Evaluate RESULTING position
                    client.setPosition(fenAfter);
                    const afterResult = await client.go(15);

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
                    // Loss calculation:
                    // If White moved, loss = Before - After (e.g. 500 - 400 = 100 loss)
                    // If Black moved, loss = After - Before (e.g. -400 - -500 = 100 loss)
                    // Wait.
                    // White Before: 500. White After: 400. Loss 100.
                    // Black Before: 500 (White winning). Black moves. After: 600 (White winning more).
                    // Black Before (from Black perspective): -500. After: -600. Loss 100.
                    // Using normalized (White perspective) scores:
                    // If White moved: Loss = scoreBefore - scoreAfter.
                    // If Black moved: Loss = scoreAfter - scoreBefore.

                    const loss = isWhite ? (scoreBefore - scoreAfter) : (scoreAfter - scoreBefore);

                    // CLASSIFICATION LOGIC

                    // 1. Missed Win
                    // If we had a mate (isForcedMate) and now we don't (or mate is much slower/lost)
                    if (isForcedMate) {
                         // Check if we still have mate
                         const stillHasMate = mateAfter !== undefined && ((isWhite && mateAfter > 0) || (!isWhite && mateAfter < 0));
                         if (!stillHasMate) {
                             classification = 'missed-win';
                             reason = "You missed a forced checkmate.";
                         } else {
                             // Still mate but maybe slower?
                             classification = 'good'; // or inaccuracy
                             reason = "You still have a mate, but there was a faster way.";
                         }
                    }
                    // 2. Blunder (High CP Loss or Losing winning position)
                    else if (loss > 200) {
                        classification = 'blunder';
                        reason = "You gave away a significant advantage.";
                        // Check for hung piece (approx 300+)
                        if (loss > 250) reason = "You may have hung a piece or missed a tactic.";
                    }
                    // 3. Mistake
                    else if (loss > 100) {
                        classification = 'mistake';
                        reason = "This move hurts your position.";
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
            classification: classification,
            reason: reason
        });
    }

    if (client) {
        client.terminate();
    }
    return calculateAccuracy(results);
};


const calculateAccuracy = (moves: MoveAnalysis[]): GameReviewData => {
    let wScore = 0, bScore = 0;
    let wMoves = 0, bMoves = 0;

    for (const m of moves) {
        const score = m.classification === 'best' ? 100 :
                      m.classification === 'great' ? 95 :
                      m.classification === 'excellent' ? 90 :
                      m.classification === 'good' ? 80 :
                      m.classification === 'inaccuracy' ? 50 :
                      m.classification === 'mistake' ? 20 :
                      m.classification === 'missed-win' ? 0 : 0; // Missed win is like a blunder

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
