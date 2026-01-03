import React, { useEffect, useRef } from 'react';
import { Chess } from 'chess.js';

interface MoveListProps {
  game: Chess;
  onMoveClick?: (fen: string) => void; // For navigating history
}

const MoveList: React.FC<MoveListProps> = ({ game, onMoveClick }) => {
  const history = game.history({ verbose: true });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length]);

  const moves: { w?: string; b?: string; index: number }[] = [];

  for (let i = 0; i < history.length; i += 2) {
    moves.push({
      index: Math.floor(i / 2) + 1,
      w: history[i]?.san,
      b: history[i + 1]?.san,
    });
  }

  return (
    <div className="flex flex-col h-full bg-[#262522]">
      <div className="flex items-center px-4 py-2 bg-[#211f1c] text-xs font-semibold text-gray-400 border-b border-white/10">
         <span className="w-8 text-center">#</span>
         <span className="flex-1">White</span>
         <span className="flex-1">Black</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar" ref={scrollRef}>
          {moves.map((move) => (
              <div key={move.index} className={`flex text-sm py-1 ${move.index % 2 === 0 ? 'bg-white/5' : ''}`}>
                  <span className="w-8 text-center text-[#898886] font-mono py-1">{move.index}.</span>
                  <button
                    className="flex-1 text-left px-2 py-1 text-white hover:bg-white/10 rounded transition-colors font-semibold"
                    onClick={() => {
                        // Logic to jump to move would go here if we implemented history navigation during play
                    }}
                  >
                      {move.w}
                  </button>
                  <button
                    className="flex-1 text-left px-2 py-1 text-white hover:bg-white/10 rounded transition-colors font-semibold"
                    onClick={() => {}}
                  >
                      {move.b || ''}
                  </button>
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
