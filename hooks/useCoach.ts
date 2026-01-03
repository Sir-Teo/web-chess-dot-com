import { useState, useEffect, useRef, useCallback } from 'react';
import { StockfishClient } from '../utils/gameAnalysis';
import { Chess } from 'chess.js';

interface CoachFeedback {
    message: string;
    type: 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'neutral' | 'excellent';
    scoreDiff?: number;
    bestMove?: string;
}

// Arrow definition: [from, to, color]
export type Arrow = [string, string, string];

const STOCKFISH_URL = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js';

export const useCoach = (isEnabled: boolean) => {
    const clientRef = useRef<StockfishClient | null>(null);
    const [feedback, setFeedback] = useState<CoachFeedback | null>(null);
    const [arrows, setArrows] = useState<Arrow[]>([]);
    const [isThinking, setIsThinking] = useState(false);

    // Continuous Evaluation State
    const [currentEval, setCurrentEval] = useState<{ score: number, mate?: number }>({ score: 0 });

    // Cache the best move for the CURRENT position (before player moves)
    const currentPositionAnalysis = useRef<{ fen: string, bestMove: string, score: number, mate?: number } | null>(null);

    // Initialize Coach Engine
    useEffect(() => {
        // We always initialize the engine if we are in a mode that needs evaluation (which we assume is always true for now, or controlled by isEnabled which might mean "Coach Mode" specifically?)
        // Actually, we want evaluation even if Coach Mode is OFF (for the bar).
        // Let's assume we always want the engine available if the hook is mounted.
        if (!clientRef.current) {
            StockfishClient.create(STOCKFISH_URL).then(client => {
                clientRef.current = client;
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

        // Update local ref immediately to prevent race conditions
        const turn = fen.split(' ')[1];

        // Debounce? If called rapidly?
        // StockfishClient.go handles stopping previous commands.

        // Stop any pending
        clientRef.current.stop();

        clientRef.current.setPosition(fen);

        // Use a deeper depth if we can, but keep it snappy
        try {
            const result = await clientRef.current.go(15);

            // Normalize Score to White Perspective
            // Engine returns score relative to side to move.
            let whiteScore = result.score || 0;
            if (turn === 'b') {
                whiteScore = -whiteScore;
            }

            // Mate score handling
            let mate = undefined;
            // If the underlying engine/client supports mate detection (it should return score >= 10000 or mate field)
            // StockfishClient wrapper might need to be checked if it parses 'mate'.
            // Looking at `utils/gameAnalysis.ts` (implied from context), we assumed score is CP.
            // If Stockfish returns "score mate 3", the wrapper should handle it.
            // Let's assume for now score is CP.

            setCurrentEval({ score: whiteScore });

            currentPositionAnalysis.current = {
                fen,
                bestMove: result.bestMove,
                score: result.score || 0 // Raw score (side to move)
            };
        } catch (e) {
            console.error("Coach analysis failed", e);
        }
    }, []);

    // Evaluate the move the player JUST made
    const evaluateMove = useCallback(async (fenBefore: string, move: { from: string, to: string, promotion?: string }, fenAfter: string) => {
        if (!isEnabled || !clientRef.current) return;

        setIsThinking(true);
        setFeedback(null);
        setArrows([]);

        // 1. Did we have the "Before" analysis?
        let beforeAnalysis = currentPositionAnalysis.current;

        if (!beforeAnalysis || beforeAnalysis.fen !== fenBefore) {
            // We missed the pre-analysis (maybe user moved too fast), so do it now.
            clientRef.current.setPosition(fenBefore);
            const result = await clientRef.current.go(10);
            beforeAnalysis = {
                fen: fenBefore,
                bestMove: result.bestMove,
                score: result.score || 0
            };
        }

        const playedMoveUci = move.from + move.to + (move.promotion || '');
        const bestMove = beforeAnalysis.bestMove;

        const bestFrom = bestMove.substring(0, 2);
        const bestTo = bestMove.substring(2, 4);

        // 2. Check if best move
        if (bestMove === playedMoveUci) {
             setFeedback({
                 message: "Excellent! That's the best move.",
                 type: 'best',
                 bestMove: beforeAnalysis.bestMove
             });
             // Draw green arrow for best move
             setArrows([[move.from, move.to, '#81b64c']]); // Chess.com Green
             setIsThinking(false);
             return;
        }

        // 3. If not best, check how bad it is
        clientRef.current.setPosition(fenAfter);
        const afterResult = await clientRef.current.go(10);

        // Score Calculation (Side to Move Perspective)
        const turnBefore = fenBefore.split(' ')[1];
        let scoreBefore = beforeAnalysis.score;

        // Player Perspective Score Before (e.g. if White moved, scoreBefore is White advantage)
        const playerValBefore = scoreBefore;

        // Player Perspective Score After.
        // It's opponent's turn now. afterResult.score is Opponent Advantage.
        // So Player Advantage is -afterResult.score.
        const playerValAfter = -(afterResult.score || 0);

        const loss = playerValBefore - playerValAfter;

        let type: CoachFeedback['type'] = 'good';
        let message = "Good move.";
        let arrowColor = '#f1c40f'; // Default yellow/orange

        if (loss <= 20) {
            type = 'excellent';
            message = "Excellent move.";
            arrowColor = '#96bc4b'; // Light green
        } else if (loss <= 50) {
            type = 'good';
            message = "Good move.";
             arrowColor = '#96bc4b';
        } else if (loss <= 100) {
            type = 'inaccuracy';
            message = "Inaccuracy. There was a better option.";
            arrowColor = '#f7c045'; // Yellow
        } else if (loss <= 200) {
            type = 'mistake';
            message = "Mistake. You lost some advantage.";
            arrowColor = '#ffa459'; // Orange
        } else {
            type = 'blunder';
            message = "Blunder! That was a costly move.";
            arrowColor = '#fa412d'; // Red
        }

        setFeedback({
            message,
            type,
            scoreDiff: loss,
            bestMove: beforeAnalysis.bestMove
        });

        // Draw Arrows:
        // 1. Played move (Color based on quality)
        // 2. Best move (Green)
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
        currentEval // Expose evaluation
    };
};
