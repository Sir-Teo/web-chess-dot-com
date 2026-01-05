import React, { useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { GameReviewData } from '../utils/gameAnalysis';
import MoveClassificationIcon from './MoveClassificationIcon';

interface MoveListProps {
  game: Chess;
  onMoveClick?: (fen: string, moveIndex: number) => void;
  currentMoveIndex?: number; // -1 means latest
  analysisData?: GameReviewData | null;
}

const MoveList: React.FC<MoveListProps> = ({ game, onMoveClick, currentMoveIndex = -1, analysisData }) => {
  const history = game.history({ verbose: true });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Game Result
  const isGameOver = game.isGameOver();
  const result = isGameOver ? (game.isCheckmate() ? (game.turn() === 'w' ? '0-1' : '1-0') : '1/2-1/2') : null;
  const resultReason = isGameOver ? (game.isCheckmate() ? 'Checkmate' : game.isDraw() ? 'Draw' : 'Game Over') : null;

  // Auto-scroll to bottom only if we are at the latest move
  useEffect(() => {
    if (scrollRef.current && (currentMoveIndex === -1 || currentMoveIndex >= history.length - 1)) {
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
             if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        });
    }
  }, [history.length, currentMoveIndex]);

  const moves: { w?: { san: string, after: string, index: number }; b?: { san: string, after: string, index: number }; moveNumber: number }[] = [];

  for (let i = 0; i < history.length; i += 2) {
    moves.push({
      moveNumber: Math.floor(i / 2) + 1,
      w: { san: history[i].san, after: history[i].after, index: i },
      b: history[i + 1] ? { san: history[i + 1].san, after: history[i + 1].after, index: i + 1 } : undefined,
    });
  }

  const isSelected = (index: number) => {
      if (currentMoveIndex === -1) return index === history.length - 1;
      return currentMoveIndex === index;
  };

  const getMoveClassification = (index: number) => {
      if (!analysisData || !analysisData.moves[index]) return null;
      return analysisData.moves[index].classification;
  };

  return (
    <div className="flex flex-col h-full bg-[#262522]">
      <div className="flex items-center px-4 py-1.5 bg-[#211f1c] text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-black/20">
         <span className="w-8 text-center">#</span>
         <span className="flex-1 pl-2">White</span>
         <span className="flex-1 pl-2">Black</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar" ref={scrollRef}>
          {moves.map((move) => (
              <div key={move.moveNumber} className={`flex text-sm py-0.5 ${move.moveNumber % 2 !== 0 ? 'bg-[#262421]' : 'bg-[#2b2926]'}`}>
                  <span className="w-8 text-center text-[#555] font-mono py-1.5 text-xs">{move.moveNumber}.</span>

                  {/* White Move */}
                  {move.w && (
                      <button
                        className={`flex-1 flex items-center justify-between text-left px-2 py-1.5 transition-colors font-bold rounded-sm mx-1 ${
                            isSelected(move.w.index) ? 'bg-[#4a4845] text-white shadow-inner border-b border-white/5 ring-1 ring-white/5' : 'text-[#c3c3c3] hover:text-white hover:bg-white/5'
                        }`}
                        onClick={() => onMoveClick?.(move.w!.after, move.w!.index)}
                      >
                          <span className={isSelected(move.w.index) ? 'text-white' : 'text-[#c3c3c3]'}>{move.w.san}</span>
                          <MoveClassificationIcon classification={getMoveClassification(move.w.index)} size={12} />
                      </button>
                  )}

                  {/* Black Move */}
                  {move.b ? (
                      <button
                        className={`flex-1 flex items-center justify-between text-left px-2 py-1.5 transition-colors font-bold rounded-sm mx-1 ${
                            isSelected(move.b.index) ? 'bg-[#4a4845] text-white shadow-inner border-b border-white/5 ring-1 ring-white/5' : 'text-[#c3c3c3] hover:text-white hover:bg-white/5'
                        }`}
                        onClick={() => onMoveClick?.(move.b!.after, move.b!.index)}
                      >
                          <span className={isSelected(move.b.index) ? 'text-white' : 'text-[#c3c3c3]'}>{move.b.san}</span>
                          <MoveClassificationIcon classification={getMoveClassification(move.b.index)} size={12} />
                      </button>
                  ) : (
                      <span className="flex-1 mx-1"></span>
                  )}
              </div>
          ))}

          {moves.length === 0 && (
             <div className="flex flex-col items-center justify-center h-40 text-gray-600 text-sm font-medium italic">
                 Game Start
             </div>
          )}

          {/* Game Over Result */}
          {isGameOver && (
              <div className="flex flex-col items-center py-4 bg-[#211f1c] mt-2 border-t border-white/5">
                  <div className="text-white font-black text-xl tracking-widest">{result}</div>
                  <div className="text-gray-500 text-xs uppercase font-bold tracking-wider mt-1">{resultReason}</div>
              </div>
          )}
      </div>
    </div>
  );
};

export default MoveList;
