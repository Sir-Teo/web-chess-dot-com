import React, { useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Search } from 'lucide-react';
import { MoveAnalysis, GameReviewData } from '../src/utils/gameAnalysis';
import MoveClassificationIcon from './MoveClassificationIcon';

interface MoveListProps {
  game: Chess;
  currentMoveIndex: number;
  onMoveClick: (fen: string, index: number) => void;
  analysisData?: GameReviewData; // Accepts full review data
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

  // Helper to get move classification
  const getMoveAnalysis = (index: number) => {
      if (!analysisData || !analysisData.moves || !analysisData.moves[index]) return null;
      return analysisData.moves[index];
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#262522]" ref={scrollRef}>
      <div className="w-full text-sm font-semibold">
          {movePairs.map((pair, i) => {
              const whiteAnalysis = getMoveAnalysis(pair.index);
              const blackAnalysis = pair.black ? getMoveAnalysis(pair.index + 1) : null;

              return (
                <div
                    key={i}
                    className={`flex ${i % 2 === 0 ? 'bg-[#262522]' : 'bg-[#211f1c]'}`}
                >
                    <div className="w-12 py-1.5 pl-4 text-[#706c66] flex items-center text-xs">
                        {i + 1}.
                    </div>

                    {/* White Move */}
                    <button
                        onClick={() => onMoveClick(pair.white.after, pair.index)}
                        data-active={currentMoveIndex === pair.index}
                        className={`
                            flex-1 py-1.5 pl-2 text-left hover:bg-white/5 transition-colors flex items-center justify-between pr-2 relative
                            ${currentMoveIndex === pair.index ? 'bg-[#484644] text-white ring-inset ring-1 ring-white/10' : 'text-gray-300'}
                        `}
                    >
                        <span className="truncate">{pair.white.san}</span>
                        {whiteAnalysis && (
                            <MoveClassificationIcon classification={whiteAnalysis.classification} size={10} />
                        )}
                    </button>

                    {/* Black Move */}
                    {pair.black ? (
                        <button
                            onClick={() => onMoveClick(pair.black.after, pair.index + 1)}
                            data-active={currentMoveIndex === pair.index + 1}
                            className={`
                                flex-1 py-1.5 pl-2 text-left hover:bg-white/5 transition-colors flex items-center justify-between pr-2 relative
                                ${currentMoveIndex === pair.index + 1 ? 'bg-[#484644] text-white ring-inset ring-1 ring-white/10' : 'text-gray-300'}
                            `}
                        >
                            <span className="truncate">{pair.black.san}</span>
                             {blackAnalysis && (
                                <MoveClassificationIcon classification={blackAnalysis.classification} size={10} />
                            )}
                        </button>
                    ) : (
                        <div className="flex-1"></div>
                    )}
                </div>
              );
          })}

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
