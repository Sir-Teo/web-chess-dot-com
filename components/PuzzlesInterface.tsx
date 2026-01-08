import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import Chessboard from './Chessboard';
import PuzzlesPanel from './PuzzlesPanel';
import { PUZZLES, Puzzle } from '../utils/puzzles';
import { useGameSound } from '../hooks/useGameSound';
import { useUser } from '../context/UserContext';

const PuzzlesInterface: React.FC = () => {
  const { user } = useUser();
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [chess, setChess] = useState(new Chess());
  const [fen, setFen] = useState(PUZZLES[0].fen);
  const [rating, setRating] = useState(400);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'none'>('none');
  const [showNextButton, setShowNextButton] = useState(false);
  const [moveIndex, setMoveIndex] = useState(0); // Tracks progress in multi-move sequence
  const [isOpponentMoving, setIsOpponentMoving] = useState(false);

  const { playSound } = useGameSound();

  const currentPuzzle = PUZZLES[currentPuzzleIndex % PUZZLES.length];

  useEffect(() => {
    // Initialize board
    const newChess = new Chess(currentPuzzle.fen);
    setChess(newChess);
    setFen(currentPuzzle.fen);
    setFeedback('none');
    setShowNextButton(false);
    setMoveIndex(0);
    setIsOpponentMoving(false);
  }, [currentPuzzleIndex, currentPuzzle]);

  const handleMove = useCallback((from: string, to: string, promotion: string = 'q') => {
    if (feedback === 'correct' || isOpponentMoving) return;

    try {
      const tempGame = new Chess(chess.fen());

      // Determine if move is a promotion
      // Note: chess.js move({ promotion: 'q' }) might fail if not a promotion.
      // We should detect if it's a pawn moving to rank 8/1.
      const piece = tempGame.get(from as any);
      const isPromotion = piece?.type === 'p' && (
          (piece.color === 'w' && to[1] === '8') ||
          (piece.color === 'b' && to[1] === '1')
      );

      const moveConfig: { from: string, to: string, promotion?: string } = { from, to };
      if (isPromotion) {
          moveConfig.promotion = promotion;
      }

      const move = tempGame.move(moveConfig);

      if (!move) return;

      const expectedMove = currentPuzzle.moves[moveIndex];
      const playedUci = move.from + move.to + (move.promotion || '');

      // Allow flexible promotion match if puzzle doesn't specify it explicitly (though it should)
      const isCorrect = playedUci === expectedMove || (expectedMove.length === 4 && playedUci.startsWith(expectedMove));

      if (isCorrect) {
         // Create a new instance for state to ensure immutability and correct re-renders
         const newChessUser = new Chess(tempGame.fen());
         setChess(newChessUser);
         setFen(tempGame.fen());
         playSound('move');

         const nextIndex = moveIndex + 1;

         if (nextIndex >= currentPuzzle.moves.length) {
             // Puzzle Complete
             setFeedback('correct');
             const bonus = 5 + Math.min(streak, 10);
             setRating(r => r + 8 + bonus);
             setStreak(s => s + 1);
             setShowNextButton(true);
             playSound('gameEnd'); // Or success sound
         } else {
             // Correct move, but puzzle continues
             setMoveIndex(nextIndex);
             setIsOpponentMoving(true);

             // Opponent Reply
             setTimeout(() => {
                 try {
                     const opponentMoveUci = currentPuzzle.moves[nextIndex];
                     const from = opponentMoveUci.substring(0, 2);
                     const to = opponentMoveUci.substring(2, 4);
                     // Check promotion for opponent
                     // We can rely on tempGame to check piece type again
                     const piece = tempGame.get(from as any);
                     const isOpponentPromotion = piece?.type === 'p' && (
                          (piece.color === 'w' && to[1] === '8') ||
                          (piece.color === 'b' && to[1] === '1')
                     );

                     const moveConfig: { from: string, to: string, promotion?: string } = { from, to };
                     if (isOpponentPromotion) {
                         const promotionChar = opponentMoveUci.length > 4 ? opponentMoveUci.substring(4, 5) : 'q';
                         moveConfig.promotion = promotionChar;
                     }

                     const replyMove = tempGame.move(moveConfig);
                     if (replyMove) {
                         // Create a new instance for state
                         const newChessOpponent = new Chess(tempGame.fen());
                         setChess(newChessOpponent);
                         setFen(tempGame.fen());
                         playSound('move'); // Opponent move sound
                         setMoveIndex(nextIndex + 1);
                     } else {
                         console.error("Opponent move failed", opponentMoveUci);
                     }
                 } catch (err) {
                     console.error("Error during opponent move", err);
                 } finally {
                     setIsOpponentMoving(false);
                 }
             }, 500); // 500ms delay for natural feel
         }

      } else {
        // Wrong move - feedback
        setFeedback('incorrect');
        setStreak(0);
        setRating(r => Math.max(100, r - 12)); // Lose points
        playSound('notify'); // Error sound

        // Show the wrong move briefly then undo
        // We use a new instance for the wrong move visualization too
        const newChessWrong = new Chess(tempGame.fen());
        setChess(newChessWrong);
        setFen(tempGame.fen());

        setTimeout(() => {
            // Undo logic: We need to revert to the state BEFORE the user move.
            // Since tempGame was mutated, we can undo() it, OR better, just use the 'chess' state from closure?
            // No, 'chess' state from closure is the starting state of this move.
            // So we can just reset to that.

            // However, handleMove closure captures 'chess'.
            // So we can just restore 'chess' (the one before the move).
            // But 'chess' is an object. We want to trigger re-render.
            // So create a clone of the ORIGINAL 'chess' (from closure).
            const originalChess = new Chess(chess.fen());
            setChess(originalChess);
            setFen(originalChess.fen());
            setFeedback('none');
        }, 1000);
      }

    } catch (e) {
      console.error(e);
    }
  }, [chess, feedback, currentPuzzle, streak, moveIndex, isOpponentMoving, playSound]);

  const handleNextPuzzle = () => {
    setCurrentPuzzleIndex(prev => prev + 1);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full md:h-screen w-full overflow-hidden bg-chess-dark">
      
      {/* Left Area (Board) */}
      <div className="flex-none lg:flex-1 flex flex-col items-center justify-center p-2 lg:p-4 bg-[#312e2b] relative">
        <div className="w-full max-w-[400px] lg:max-w-[85vh] aspect-square relative flex flex-col justify-center">
             {/* Puzzle Header Info */}
             <div className="flex justify-between items-end mb-2 px-1">
                <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-lg">
                        {currentPuzzle.color === 'w' ? 'White to Move' : 'Black to Move'}
                    </span>
                    <span className="text-gray-400 text-sm">({currentPuzzle.theme})</span>
                </div>
            </div>

            <div className="rounded-sm shadow-2xl ring-4 ring-black/10 relative">
                 <Chessboard
                    fen={fen}
                    onMove={handleMove}
                    boardOrientation={currentPuzzle.color === 'w' ? 'white' : 'black'}
                    interactable={feedback !== 'correct' && !isOpponentMoving}
                 />
                 {isOpponentMoving && (
                     <div className="absolute inset-0 z-10 bg-transparent cursor-wait"></div>
                 )}
            </div>
            
             <div className="flex justify-between items-start mt-2 px-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-gray-500 overflow-hidden border border-white/20 relative group">
                        <img src={user.avatar} alt="Me" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-1.5">
                            <span className="text-white font-bold text-sm leading-none">{user.username}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="flex-1 lg:flex-none w-full lg:w-[350px] xl:w-[420px] bg-[#262522] flex flex-col border-l border-white/10 shrink-0 h-auto lg:h-auto z-10 relative shadow-2xl overflow-hidden">
          <PuzzlesPanel
            rating={rating}
            streak={streak}
            feedback={feedback}
            onNextPuzzle={handleNextPuzzle}
            showNextButton={showNextButton}
          />
      </div>
    </div>
  );
};

export default PuzzlesInterface;
