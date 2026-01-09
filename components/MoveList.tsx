import React, { useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Search } from 'lucide-react';
import { MoveAnalysis } from '../src/utils/gameAnalysis';

interface MoveListProps {
  game: Chess;
  currentMoveIndex: number;
  onMoveClick: (fen: string, index: number) => void;
  analysisData?: MoveAnalysis[]; // Optional analysis data to show classification
}

const MoveList: React.FC<MoveListProps> = ({ game, currentMoveIndex, onMoveClick, analysisData }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const history = game.history({ verbose: true });

  // Create pairs of moves
  const movePairs: { white?: any, black?: any, index: number }[] = [];
  for (let i = 0; i < history.length; i += 2) {
      movePairs.push({
          white: history[i],
          black: history[i + 1],
          index: i
      });
  }

  // Scroll to active move
  useEffect(() => {
    if (scrollRef.current) {
        // Find active element
        const activeEl = scrollRef.current.querySelector('[data-active="true"]');
        if (activeEl) {
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if (currentMoveIndex === -1 && history.length > 0) {
            // If live (-1) and has history, scroll to bottom
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }
  }, [currentMoveIndex, history.length]);

  // Helper to get move classification style/icon
  const getMoveClass = (index: number) => {
      if (!analysisData || !analysisData[index]) return null;
      // return analysisData[index].classification; // e.g. 'blunder', 'brilliant'
      // For now, we assume simple strings if we had them.
      // But we will just use a visual marker if needed.
      return null;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#262522]" ref={scrollRef}>
      <div className="w-full text-sm font-semibold">
          {movePairs.map((pair, i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? 'bg-[#262522]' : 'bg-[#211f1c]'}`}
              >
                  <div className="w-12 py-1.5 pl-4 text-[#706c66] flex items-center">
                      {i + 1}.
                  </div>
                  <button
                      onClick={() => onMoveClick(pair.white.after, pair.index)}
                      data-active={currentMoveIndex === pair.index}
                      className={`
                          flex-1 py-1.5 pl-2 text-left hover:bg-white/5 transition-colors flex items-center gap-2 relative
                          ${currentMoveIndex === pair.index ? 'bg-[#484644] text-white ring-inset ring-1 ring-white/10' : 'text-gray-300'}
                      `}
                  >
                      <span>{pair.white.san}</span>
                      {getMoveClass(pair.index) && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                  </button>
                  {pair.black ? (
                      <button
                          onClick={() => onMoveClick(pair.black.after, pair.index + 1)}
                          data-active={currentMoveIndex === pair.index + 1}
                          className={`
                              flex-1 py-1.5 pl-2 text-left hover:bg-white/5 transition-colors flex items-center gap-2 relative
                              ${currentMoveIndex === pair.index + 1 ? 'bg-[#484644] text-white ring-inset ring-1 ring-white/10' : 'text-gray-300'}
                          `}
                      >
                          <span>{pair.black.san}</span>
                      </button>
                  ) : (
                      <div className="flex-1"></div>
                  )}
              </div>
          ))}

          {/* Empty State */}
          {history.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-[#706c66] italic opacity-50">
                   Game start
              </div>
          )}
      </div>
    </div>
  );
};

export default MoveList;
