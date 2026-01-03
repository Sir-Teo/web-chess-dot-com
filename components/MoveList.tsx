import React, { useEffect, useRef } from 'react';
import { Chess } from 'chess.js';

interface MoveListProps {
  game: Chess;
  onMoveClick?: (fen: string, moveIndex: number) => void;
  currentMoveIndex?: number; // -1 means latest
}

const MoveList: React.FC<MoveListProps> = ({ game, onMoveClick, currentMoveIndex = -1 }) => {
  const history = game.history({ verbose: true });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom only if we are at the latest move
  useEffect(() => {
    if (scrollRef.current && (currentMoveIndex === -1 || currentMoveIndex >= history.length - 1)) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
      // If currentMoveIndex is -1, it usually means "live", which is essentially after the last move.
      // But if we want to highlight the *last played move*, that would be history.length - 1.
      // Let's assume currentMoveIndex tracks the index of the move *just made*.
      if (currentMoveIndex === -1) return index === history.length - 1;
      return currentMoveIndex === index;
  };

  return (
    <div className="flex flex-col h-full bg-[#262522]">
      <div className="flex items-center px-4 py-2 bg-[#211f1c] text-xs font-semibold text-gray-400 border-b border-white/10">
         <span className="w-8 text-center">#</span>
         <span className="flex-1">White</span>
         <span className="flex-1">Black</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar" ref={scrollRef}>
          {moves.map((move) => (
              <div key={move.moveNumber} className={`flex text-sm py-1 ${move.moveNumber % 2 === 0 ? 'bg-white/5' : ''}`}>
                  <span className="w-8 text-center text-[#898886] font-mono py-1">{move.moveNumber}.</span>

                  {/* White Move */}
                  {move.w && (
                      <button
                        className={`flex-1 text-left px-2 py-1 rounded transition-colors font-semibold ${
                            isSelected(move.w.index) ? 'bg-[#484542] text-white' : 'text-white hover:bg-white/10'
                        }`}
                        onClick={() => onMoveClick?.(move.w!.after, move.w!.index)}
                      >
                          {move.w.san}
                      </button>
                  )}

                  {/* Black Move */}
                  {move.b ? (
                      <button
                        className={`flex-1 text-left px-2 py-1 rounded transition-colors font-semibold ${
                            isSelected(move.b.index) ? 'bg-[#484542] text-white' : 'text-white hover:bg-white/10'
                        }`}
                        onClick={() => onMoveClick?.(move.b!.after, move.b!.index)}
                      >
                          {move.b.san}
                      </button>
                  ) : (
                      <span className="flex-1"></span>
                  )}
              </div>
          ))}

          {moves.length === 0 && (
             <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm italic">
                 Game has not started
             </div>
          )}
      </div>
    </div>
  );
};

export default MoveList;
