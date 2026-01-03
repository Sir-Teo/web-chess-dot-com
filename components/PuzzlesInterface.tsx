import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import Chessboard from './Chessboard';
import PuzzlesPanel from './PuzzlesPanel';
import { PUZZLES, Puzzle } from '../utils/puzzles';

const PuzzlesInterface: React.FC = () => {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [chess, setChess] = useState(new Chess());
  const [fen, setFen] = useState(PUZZLES[0].fen);
  const [rating, setRating] = useState(400);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'none'>('none');
  const [showNextButton, setShowNextButton] = useState(false);

  const currentPuzzle = PUZZLES[currentPuzzleIndex % PUZZLES.length];

  useEffect(() => {
    // Initialize board
    const newChess = new Chess(currentPuzzle.fen);
    setChess(newChess);
    setFen(currentPuzzle.fen);
    setFeedback('none');
    setShowNextButton(false);
  }, [currentPuzzleIndex, currentPuzzle]);

  const handleMove = useCallback((from: string, to: string, promotion: string = 'q') => {
    if (feedback === 'correct') return; // Already solved

    try {
      const move = chess.move({
        from,
        to,
        promotion,
      });

      if (!move) return;

      const expectedMove = currentPuzzle.moves[0];
      const actualMoveUci = move.from + move.to;

      // Check success
      if (actualMoveUci === expectedMove || (move.promotion && actualMoveUci + move.promotion === expectedMove)) {
         setFen(chess.fen());
         setFeedback('correct');
         setRating(r => r + 10 + streak);
         setStreak(s => s + 1);
         setShowNextButton(true);
      } else {
        // Wrong move - feedback
        setFeedback('incorrect');
        setStreak(0);
        setRating(r => Math.max(100, r - 10));

        // Show the wrong move briefly then undo
        setFen(chess.fen());
        setTimeout(() => {
            chess.undo();
            setFen(chess.fen());
            setFeedback('none'); // Reset feedback to allow trying again
        }, 800);
      }

    } catch (e) {
      console.error(e);
    }
  }, [chess, feedback, currentPuzzle, streak]);

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

            <div className="rounded-sm shadow-2xl ring-4 ring-black/10">
                 <Chessboard
                    fen={fen}
                    onMove={handleMove}
                    boardOrientation={currentPuzzle.color === 'w' ? 'white' : 'black'}
                    interactable={feedback !== 'correct'}
                 />
            </div>
            
             <div className="flex justify-between items-start mt-2 px-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-gray-500 overflow-hidden border border-white/20 relative group">
                        <img src="https://picsum.photos/200" alt="Me" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-1.5">
                            <span className="text-white font-bold text-sm leading-none">Player</span>
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
