import { useState, useEffect, useRef, useCallback } from 'react';
import { StockfishClient } from '../utils/gameAnalysis';

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

    // Cache the best move for the CURRENT position (before player moves)
    const currentPositionAnalysis = useRef<{ fen: string, bestMove: string, score: number } | null>(null);

    // Initialize Coach Engine
    useEffect(() => {
        if (isEnabled && !clientRef.current) {
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
    }, [isEnabled]);

    // Analyze the current position (to be ready when player moves)
    const onTurnStart = useCallback(async (fen: string) => {
        if (!isEnabled || !clientRef.current) return;

        // Don't re-analyze if we just did
        if (currentPositionAnalysis.current?.fen === fen) return;

        // Stop any pending
        clientRef.current.stop();

        clientRef.current.setPosition(fen);
        // Shallow search for quick feedback
        try {
            const result = await clientRef.current.go(12);
            currentPositionAnalysis.current = {
                fen,
                bestMove: result.bestMove,
                score: result.score || 0
            };
        } catch (e) {
            console.error("Coach analysis failed", e);
        }
    }, [isEnabled]);

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

        // --- SCORE CALCULATION ---
        // We need to determine how much the player lost by making this move.
        // `score` from stockfish is generally "centipawns from the side to move's perspective".
        // But stockfish.js 10 typically reports score relative to White in UCI?
        // Let's assume standard UCI behavior: "score cp x" is relative to the side to move?
        // Actually, many UCI engines report relative to side to move.
        // Let's verify standard assumption:
        // If White to move, +100 means White is winning.
        // If Black to move, +100 means Black is winning.

        // HOWEVER, stockfish.js 10 usually normalizes to White?
        // Let's stick to the previous `gameAnalysis` logic which worked:
        // "Normalized Score for "Before" position (White's perspective)"
        // This implies we treated raw engine output as White-centric?
        // Let's look at `gameAnalysis.ts`: `if (turnBefore === 'b') scoreBefore = -scoreBefore;`
        // This implies the engine outputs "Side to Move" score.
        // So let's stick to that.

        const turnBefore = fenBefore.split(' ')[1]; // 'w' or 'b'
        let scoreBefore = beforeAnalysis.score;

        // Convert to "Player Perspective" (The one who just moved)
        // If I am White, and it's my turn, scoreBefore is my advantage.
        // If I am Black, and it's my turn, scoreBefore is my advantage.
        // So `scoreBefore` is ALREADY "Player Advantage" if engine reports relative to side-to-move.

        // Now `scoreAfter`:
        // It's the opponent's turn.
        // So `scoreAfter` is "Opponent Advantage".
        // So "Player Advantage After" is `-scoreAfter`.

        const playerValBefore = scoreBefore;
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
        resetFeedback
    };
};
