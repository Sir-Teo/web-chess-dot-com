import { useState, useEffect, useRef, useCallback } from 'react';
import { StockfishClient, EngineScore } from '../utils/gameAnalysis';

export interface CoachSettings {
    showSuggestionArrows: boolean;
    showThreatArrows: boolean;
    showEvalBar: boolean;
    showFeedback: boolean;
}

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

export const useCoach = (isEnabled: boolean, settings: CoachSettings) => {
    const clientRef = useRef<StockfishClient | null>(null);
    const [feedback, setFeedback] = useState<CoachFeedback | null>(null);
    const [arrows, setArrows] = useState<Arrow[]>([]);
    const [threatArrows, setThreatArrows] = useState<Arrow[]>([]); // New: Threat arrows
    const [isThinking, setIsThinking] = useState(false);

    // Continuous Evaluation State
    const [currentEval, setCurrentEval] = useState<{ score: number, mate?: number, bestMove?: string }>({ score: 0 });

    // Cache the best move for the CURRENT position (before player moves)
    const currentPositionAnalysis = useRef<{ fen: string, bestMove: string, score: EngineScore | null } | null>(null);

    // Initialize Coach Engine
    useEffect(() => {
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

        const turn = fen.split(' ')[1] as 'w' | 'b';

        // Stop any pending
        clientRef.current.stop();
        clientRef.current.setPosition(fen);

        try {
            // 1. Analyze Current Position (Normal)
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
                    const mateVal = scoreObj.value;
                    whiteMate = turn === 'w' ? mateVal : -mateVal;
                    whiteScore = whiteMate > 0 ? 10000 : -10000;
                }
            }

            setCurrentEval({ score: whiteScore, mate: whiteMate, bestMove: result.bestMove });

            currentPositionAnalysis.current = {
                fen,
                bestMove: result.bestMove,
                score: scoreObj
            };

            // 2. Threat Analysis (If enabled)
            // What if we pass? (Null move analysis)
            // We construct a FEN with the active color swapped.
            // Note: This is a simplification. En passant target should be cleared.
            // Full move clock doesn't matter much for immediate threats.
            if (settings.showThreatArrows) {
                 const parts = fen.split(' ');
                 const activeColor = parts[1];
                 const newColor = activeColor === 'w' ? 'b' : 'w';
                 // Clear ep target (parts[3]) to '-' because if we pass, we can't capture en passant next?
                 // Actually, if we pass, the opponent moves. They might capture en passant if WE moved a pawn two squares previously.
                 // But wait, if we pass, we didn't move. So en passant target should be from the previous move (opponent's last move).
                 // So if it's currently our turn, the EP target is available for US to capture.
                 // If we pass, the opponent moves. The EP target is now gone (you can only capture EP immediately).
                 // So yes, clear EP target.
                 // Also need to handle halfmove clock (parts[4]) but stockfish handles it.

                 parts[1] = newColor;
                 parts[3] = '-';
                 const flippedFen = parts.join(' ');

                 clientRef.current.setPosition(flippedFen);
                 const threatResult = await clientRef.current.go(10); // Quick search for threats

                 if (threatResult.bestMove) {
                     const from = threatResult.bestMove.substring(0, 2);
                     const to = threatResult.bestMove.substring(2, 4);
                     setThreatArrows([[from, to, '#fa412d']]); // Red arrow for threat
                 } else {
                     setThreatArrows([]);
                 }
            } else {
                setThreatArrows([]);
            }

        } catch (e) {
            console.error("Coach analysis failed", e);
        }
    }, [settings.showThreatArrows]);

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

        // Clear threats on move
        setThreatArrows([]);

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

        // Prepare arrows array
        const newArrows: Arrow[] = [];

        // 2. Check if best move
        if (bestMove === playedMoveUci) {
             if (settings.showFeedback) {
                 setFeedback({
                     message: "Best move!",
                     type: 'best',
                     bestMove: beforeAnalysis.bestMove,
                     reason: "You found the optimal continuation."
                 });
             }
             if (settings.showSuggestionArrows) {
                 newArrows.push([move.from, move.to, '#81b64c']); // Chess.com Green
             }
             setArrows(newArrows);
             setIsThinking(false);
             return;
        }

        // 3. If not best, check how bad it is
        clientRef.current.setPosition(fenAfter);
        const afterResult = await clientRef.current.go(10);

        // Score Calculation (Side to Move Perspective)
        const scoreBeforeVal = getCp(beforeAnalysis.score);
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

        if (settings.showFeedback) {
            const reason = getReason(type, loss);
            setFeedback({
                message,
                type,
                scoreDiff: loss,
                bestMove: beforeAnalysis.bestMove,
                reason
            });
        }

        // Arrows logic
        if (settings.showSuggestionArrows) {
             // Show played move arrow (colored by quality)
             newArrows.push([move.from, move.to, arrowColor]);
             // Show best move arrow
             newArrows.push([bestFrom, bestTo, '#81b64c']);
        }

        setArrows(newArrows);
        setIsThinking(false);

    }, [isEnabled, settings]);

    const resetFeedback = () => {
        setFeedback(null);
        setArrows([]);
        setThreatArrows([]);
    };

    return {
        onTurnStart,
        evaluateMove,
        feedback,
        arrows: [...arrows, ...threatArrows], // Combine standard arrows and threat arrows
        isThinking,
        resetFeedback,
        currentEval // Expose evaluation
    };
};
