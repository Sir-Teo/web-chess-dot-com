import { useState, useEffect, useRef, useCallback } from 'react';
import { StockfishClient, EngineScore } from '../utils/gameAnalysis';

interface CoachFeedback {
    message: string;
    type: 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'neutral' | 'excellent' | 'missed-win';
    scoreDiff?: number;
    bestMove?: string;
    reason?: string;
}

// Arrow definition: [from, to, color]
export type Arrow = [string, string, string];

const STOCKFISH_URL = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js';

export const useCoach = (isEnabled: boolean, settings?: any) => {
    const clientRef = useRef<StockfishClient | null>(null);
    const [feedback, setFeedback] = useState<CoachFeedback | null>(null);
    const [arrows, setArrows] = useState<Arrow[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // Continuous Evaluation State
    // Includes FEN to verify the evaluation matches the current board state
    const [currentEval, setCurrentEval] = useState<{ score: number, mate?: number, bestMove?: string, fen?: string }>({ score: 0 });

    // Cache the best move for the CURRENT position (before player moves)
    const currentPositionAnalysis = useRef<{ fen: string, bestMove: string, score: EngineScore | null } | null>(null);

    // Initialize Coach Engine
    useEffect(() => {
        if (!clientRef.current) {
            StockfishClient.create(STOCKFISH_URL).then(client => {
                clientRef.current = client;
                setIsReady(true);
            });
        }
        return () => {
            if (clientRef.current) {
                clientRef.current.terminate();
                clientRef.current = null;
            }
        };
    }, []);

    // Analyze the current position (to be ready when player moves AND update eval bar)
    const onTurnStart = useCallback(async (fen: string) => {
        if (!clientRef.current) return;

        const turn = fen.split(' ')[1] as 'w' | 'b';

        // Stop any pending
        clientRef.current.stop();
        clientRef.current.setPosition(fen);

        // Mark as thinking (for the continuous analysis part)
        // We don't expose this "isThinking" generally for the UI (except for specific feedback requests),
        // but we might want to know if eval is stale.

        try {
            const result = await clientRef.current.go(15);
            const scoreObj = result.score;

            // Normalize Score to White Perspective for Eval Bar
            let whiteScore = 0;
            let whiteMate: number | undefined = undefined;

            if (scoreObj) {
                if (scoreObj.unit === 'cp') {
                    whiteScore = turn === 'w' ? scoreObj.value : -scoreObj.value;
                } else {
                    // Mate
                    // Score is relative to side to move
                    // If turn is White and value is +1, White mates in 1.
                    // If turn is Black and value is +1, Black mates in 1 (Bad for White).
                    const mateVal = scoreObj.value;
                    whiteMate = turn === 'w' ? mateVal : -mateVal;

                    // For bar fill calculation, we also need a high CP value
                    whiteScore = whiteMate > 0 ? 10000 : -10000;
                }
            }

            setCurrentEval({ score: whiteScore, mate: whiteMate, bestMove: result.bestMove, fen });

            currentPositionAnalysis.current = {
                fen,
                bestMove: result.bestMove,
                score: scoreObj
            };
        } catch (e) {
            console.error("Coach analysis failed", e);
        }
    }, []);

    // Helper to get CP for comparison
    const getCp = (score: EngineScore | null): number => {
        if (!score) return 0;
        if (score.unit === 'cp') return score.value;
        // Mate scores are extremely high value
        return score.value > 0 ? 20000 - (score.value * 100) : -20000 - (score.value * 100);
    };

    // Helper to generate reason text
    const getReason = (type: string, diff: number, pieceCaptured?: boolean, isCheck?: boolean) => {
         if (type === 'missed-win') return "You missed a forced checkmate sequence. Look for checks and captures!";
         if (type === 'blunder') {
             if (diff > 500) return "You gave away a decisive advantage. Always check for hanging pieces.";
             return "This move likely hangs a piece or misses a simple tactical defense.";
         }
         if (type === 'mistake') return "This allows your opponent to gain a significant advantage or coordinate their pieces.";
         if (type === 'inaccuracy') return "There was a slightly better move available, but this is playable.";
         if (type === 'best') return "This is the best move in the position! Great find.";
         if (type === 'excellent') return "A very strong move. You are playing accurately.";
         if (type === 'good') return "A solid move that maintains the position.";
         return "";
    };

    // Evaluate the move the player JUST made
    const evaluateMove = useCallback(async (fenBefore: string, move: { from: string, to: string, promotion?: string }, fenAfter: string) => {
        if (!isEnabled || !clientRef.current) return;

        setIsThinking(true);
        setFeedback(null);
        setArrows([]);

        // 1. Did we have the "Before" analysis?
        let beforeAnalysis = currentPositionAnalysis.current;

        if (!beforeAnalysis || beforeAnalysis.fen !== fenBefore) {
            // We missed the pre-analysis, do it now.
            clientRef.current.setPosition(fenBefore);
            const result = await clientRef.current.go(10);
            beforeAnalysis = {
                fen: fenBefore,
                bestMove: result.bestMove,
                score: result.score
            };
        }

        const playedMoveUci = move.from + move.to + (move.promotion || '');
        const bestMove = beforeAnalysis.bestMove;

        const bestFrom = bestMove.substring(0, 2);
        const bestTo = bestMove.substring(2, 4);

        // 2. Check if best move
        if (bestMove === playedMoveUci) {
             setFeedback({
                 message: "Best move!",
                 type: 'best',
                 bestMove: beforeAnalysis.bestMove,
                 reason: "You found the optimal continuation."
             });
             setArrows([[move.from, move.to, '#81b64c']]); // Chess.com Green
             setIsThinking(false);
             return;
        }

        // 3. If not best, check how bad it is
        clientRef.current.setPosition(fenAfter);
        const afterResult = await clientRef.current.go(10);

        // Score Calculation (Side to Move Perspective)
        // Before score (Player's turn)
        const scoreBeforeVal = getCp(beforeAnalysis.score);

        // After score (Opponent's turn)
        // If we want Player's advantage after move, it is -(Opponent Advantage)
        const scoreAfterValOpponent = getCp(afterResult.score);
        const scoreAfterValPlayer = -scoreAfterValOpponent;

        const loss = scoreBeforeVal - scoreAfterValPlayer;

        let type: CoachFeedback['type'] = 'good';
        let message = "Good move.";
        let arrowColor = '#f1c40f'; // Default yellow/orange

        // Check for missed mate
        if (beforeAnalysis.score?.unit === 'mate' && beforeAnalysis.score.value > 0 &&
           (afterResult.score?.unit !== 'mate' || (afterResult.score?.unit === 'mate' && afterResult.score.value < 0))) {
               type = 'missed-win';
               message = "Missed Win";
               arrowColor = '#fa412d';
        } else if (loss <= 20) {
            type = 'excellent';
            message = "Excellent";
            arrowColor = '#96bc4b'; // Light green
        } else if (loss <= 50) {
            type = 'good';
            message = "Good";
             arrowColor = '#96bc4b';
        } else if (loss <= 150) {
            type = 'inaccuracy';
            message = "Inaccuracy";
            arrowColor = '#f7c045'; // Yellow
        } else if (loss <= 300) {
            type = 'mistake';
            message = "Mistake";
            arrowColor = '#ffa459'; // Orange
        } else {
            type = 'blunder';
            message = "Blunder";
            arrowColor = '#fa412d'; // Red
        }

        const reason = getReason(type, loss);

        setFeedback({
            message,
            type,
            scoreDiff: loss,
            bestMove: beforeAnalysis.bestMove,
            reason
        });

        setArrows([
            [move.from, move.to, arrowColor],       // Played
            [bestFrom, bestTo, '#81b64c']  // Best
        ]);

        setIsThinking(false);

    }, [isEnabled]);

    const resetFeedback = () => {
        setFeedback(null);
        setArrows([]);
    };

    return {
        onTurnStart,
        evaluateMove,
        feedback,
        arrows,
        isThinking,
        resetFeedback,
        currentEval, // Expose evaluation
        isReady // <--- Expose readiness
    };
};
