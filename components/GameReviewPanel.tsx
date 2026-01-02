import React, { useEffect, useState } from 'react';
import { Search, Star, HelpCircle, Loader2 } from 'lucide-react';
import { analyzeGame, GameReviewData, MoveAnalysis } from '../utils/gameAnalysis';

interface GameReviewPanelProps {
    pgn?: string;
    onStartReview?: () => void;
}

const MoveStatRow: React.FC<{
  label: string;
  p1Value: number;
  p2Value: number;
  icon: React.ReactNode;
  colorClass: string;
}> = ({ label, p1Value, p2Value, icon, colorClass }) => (
  <div className="grid grid-cols-[1fr_auto_1fr] items-center py-1.5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer rounded px-2">
    <div className={`text-right font-bold ${p1Value > 0 ? 'text-gray-200' : 'text-gray-600'}`}>{p1Value}</div>
    <div className="flex justify-center w-12" title={label}>
       {icon}
    </div>
    <div className={`text-left font-bold ${p2Value > 0 ? 'text-gray-200' : 'text-gray-600'}`}>{p2Value}</div>
  </div>
);

const GameReviewPanel: React.FC<GameReviewPanelProps> = ({ pgn, onStartReview }) => {
  const [data, setData] = useState<GameReviewData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
      if (pgn && !data && !isAnalyzing) {
          setIsAnalyzing(true);
          analyzeGame(pgn).then(result => {
              setData(result);
              setIsAnalyzing(false);
          });
      }
  }, [pgn]);

  const countMoves = (classification: MoveAnalysis['classification'], color: 'w' | 'b') => {
      if (!data) return 0;
      return data.moves.filter(m => m.classification === classification && m.color === color).length;
  };

  return (
    <div className="flex flex-col h-full bg-[#262522] text-[#c3c3c3]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#211f1c] border-b border-black/20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="font-bold text-white text-lg">Game Review</span>
        </div>
        <button className="text-gray-500 hover:text-white transition-colors">
            <Search className="w-5 h-5" />
        </button>
      </div>

      {isAnalyzing && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-chess-green animate-spin" />
              <div className="text-xl font-bold text-white">Analyzing Game...</div>
              <p className="text-gray-500">Stockfish is reviewing your moves</p>
          </div>
      )}

      {!isAnalyzing && data && (
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        
        {/* Coach Bubble */}
        <div className="p-4 flex gap-4">
            <div className="shrink-0 relative">
                <img 
                    src="https://www.chess.com/bundles/web/images/coach/marty.png" 
                    alt="Coach" 
                    className="w-12 h-12 rounded-lg object-cover bg-gray-600"
                    onError={(e) => (e.currentTarget.src = 'https://www.chess.com/bundles/web/images/user-image.svg')} 
                />
            </div>
            <div className="bg-white text-[#2b2926] p-3 rounded-xl rounded-tl-none text-[15px] leading-snug shadow-md relative font-medium">
                <div className="absolute top-0 left-[-8px] w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent drop-shadow-sm"></div>
                {data.accuracy.w > 80 ? "Great job! You played very accurately." : "There were some missed opportunities, let's review them."}
            </div>
        </div>

        {/* Players & Accuracy */}
        <div className="grid grid-cols-2 gap-4 px-4 py-2 mb-2">
            <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-gray-400 mb-1 truncate max-w-full">White</span>
                <div className="relative mb-2">
                     <img src="https://picsum.photos/200" className="w-10 h-10 rounded border border-white/20" />
                </div>
                <div className="bg-white text-black font-black text-xl px-3 py-1 rounded min-w-[60px] text-center shadow">
                    {data.accuracy.w}
                </div>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-gray-400 mb-1 truncate max-w-full">Black</span>
                <div className="relative mb-2">
                     <img src="https://picsum.photos/id/64/100" className="w-10 h-10 rounded border border-white/20" />
                </div>
                <div className="bg-[#403d39] text-gray-400 font-black text-xl px-3 py-1 rounded min-w-[60px] text-center shadow border border-white/10">
                    {data.accuracy.b}
                </div>
            </div>
        </div>

        <div className="h-px bg-white/10 mx-4 my-2"></div>

        {/* Stats Grid */}
        <div className="px-2 pb-4 space-y-0.5">
            <MoveStatRow 
                label="Brilliant" 
                p1Value={countMoves('brilliant', 'w')} p2Value={countMoves('brilliant', 'b')}
                colorClass="text-[#1baca6]"
                icon={<div className="w-5 h-5 rounded-full bg-[#1baca6] flex items-center justify-center text-white font-black text-[10px] shadow-sm">!!</div>} 
            />
            <MoveStatRow 
                label="Great" 
                p1Value={countMoves('great', 'w')} p2Value={countMoves('great', 'b')}
                colorClass="text-[#5c8bb0]"
                icon={<div className="w-5 h-5 rounded-full bg-[#5c8bb0] flex items-center justify-center text-white font-black text-[10px] shadow-sm">!</div>} 
            />
            <MoveStatRow 
                label="Best" 
                p1Value={countMoves('best', 'w')} p2Value={countMoves('best', 'b')}
                colorClass="text-[#95b776]"
                icon={<div className="w-5 h-5 rounded-full bg-[#95b776] flex items-center justify-center text-white shadow-sm"><Star className="w-3 h-3 fill-white" /></div>} 
            />
            <MoveStatRow 
                label="Mistake" 
                p1Value={countMoves('mistake', 'w')} p2Value={countMoves('mistake', 'b')}
                colorClass="text-[#e6912c]"
                icon={<div className="w-5 h-5 rounded-full bg-[#e6912c] flex items-center justify-center text-white font-black text-[10px] shadow-sm">?</div>} 
            />
            <MoveStatRow 
                label="Blunder" 
                p1Value={countMoves('blunder', 'w')} p2Value={countMoves('blunder', 'b')}
                colorClass="text-[#fa412d]"
                icon={<div className="w-5 h-5 rounded-full bg-[#fa412d] flex items-center justify-center text-white font-black text-[10px] shadow-sm">??</div>} 
            />
             <MoveStatRow 
                label="Inaccuracy" 
                p1Value={countMoves('inaccuracy', 'w')} p2Value={countMoves('inaccuracy', 'b')}
                colorClass="text-[#f7c045]"
                icon={<div className="w-5 h-5 rounded-full bg-[#f7c045] flex items-center justify-center text-white font-black text-[10px] shadow-sm">?!</div>} 
            />
        </div>
      </div>
      )}

      {/* Footer Button */}
      {!isAnalyzing && (
      <div className="p-4 bg-[#211f1c] border-t border-black/20">
        <button
            onClick={onStartReview}
            className="w-full bg-[#81b64c] hover:bg-[#a3d160] text-white font-bold text-xl py-3.5 rounded-lg shadow-[0_4px_0_0_#457524] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center relative top-[-2px]"
        >
            Review Moves
        </button>
      </div>
      )}
    </div>
  );
};

export default GameReviewPanel;
