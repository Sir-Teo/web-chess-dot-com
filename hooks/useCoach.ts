import { useState, useEffect, useRef, useCallback } from 'react';
import { StockfishClient } from '../utils/gameAnalysis';
import { Chess } from 'chess.js';

interface CoachFeedback {
    message: string;
    type: 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'neutral';
    scoreDiff?: number;
    bestMove?: string;
}

const STOCKFISH_URL = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js';

export const useCoach = (isEnabled: boolean) => {
    const clientRef = useRef<StockfishClient | null>(null);
    const [feedback, setFeedback] = useState<CoachFeedback | null>(null);
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

        // 2. Check if best move
        if (beforeAnalysis.bestMove === playedMoveUci) {
             setFeedback({
                 message: "Excellent! That's the best move.",
                 type: 'best',
                 bestMove: beforeAnalysis.bestMove
             });
             setIsThinking(false);
             return;
        }

        // 3. If not best, check how bad it is
        clientRef.current.setPosition(fenAfter);
        const afterResult = await clientRef.current.go(10);

        // Calculate Loss (Assume White for now, logic similar to gameAnalysis)
        // Adjust for perspective
        const turnBefore = fenBefore.split(' ')[1];
        let scoreBefore = beforeAnalysis.score;
        if (turnBefore === 'b') scoreBefore = -scoreBefore;

        let scoreAfter = afterResult.score || 0;
        const turnAfter = fenAfter.split(' ')[1]; // This is the OTHER person's turn now
        // Wait, fenAfter turn is the opponent.
        // If I played white, it's now black's turn.
        // Stockfish eval is always white-centric or side-to-move centric?
        // Stockfish UCI `score cp` is from the engine's side (side to move)? No, typically White-centric in some protocols, but UCI usually says:
        // "The score is from the perspective of the side to move." -> Wait, let's verify.
        // Stockfish 10 usually gives score relative to side to move.
        // Let's assume standard UCI: score is for the side to move.

        // So, `scoreBefore`: side to move was Player. Score is how good it is for Player.
        // `scoreAfter`: side to move is Opponent. Score is how good it is for Opponent.
        // So Score for Player = -scoreAfter.

        const playerValBefore = scoreBefore;
        const playerValAfter = -(scoreAfter); // Negate because it's opponent's turn

        const loss = playerValBefore - playerValAfter;

        let type: CoachFeedback['type'] = 'good';
        let message = "Good move.";

        if (loss <= 20) {
            type = 'good';
            message = "Good move.";
        } else if (loss <= 50) {
            type = 'good'; // or excellent/good distinction
            message = "Solid move.";
        } else if (loss <= 150) {
            type = 'inaccuracy';
            message = "Inaccuracy. There was a better option.";
        } else if (loss <= 300) {
            type = 'mistake';
            message = "Mistake. You lost some advantage.";
        } else {
            type = 'blunder';
            message = "Blunder! That was a costly move.";
        }

        setFeedback({
            message,
            type,
            scoreDiff: loss,
            bestMove: beforeAnalysis.bestMove
        });
        setIsThinking(false);

    }, [isEnabled]);

    const resetFeedback = () => setFeedback(null);

    return {
        onTurnStart,
        evaluateMove,
        feedback,
        isThinking,
        resetFeedback
    };
};
