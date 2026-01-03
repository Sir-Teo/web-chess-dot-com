import React from 'react';
import { Puzzle as PuzzleIcon, Zap, Calendar, Shield, BookOpen } from 'lucide-react';

interface PuzzlesPanelProps {
    rating: number;
    streak: number;
    feedback: 'correct' | 'incorrect' | 'none';
    onNextPuzzle: () => void;
    showNextButton: boolean;
}

const PuzzleModeButton: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  subtitle?: string; 
  iconBg: string 
}> = ({ icon, title, subtitle, iconBg }) => (
  <button className="w-full bg-[#2a2926] hover:bg-[#32312e] p-3 rounded-lg flex items-center gap-4 group transition-all border-b-4 border-black/10 active:border-b-0 active:translate-y-1">
    <div className={`w-10 h-10 ${iconBg} rounded flex items-center justify-center`}>
       {icon}
    </div>
    <div className="text-left">
       <div className="text-white font-bold text-base">{title}</div>
       {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
    </div>
  </button>
);

const PuzzlesPanel: React.FC<PuzzlesPanelProps> = ({ rating, streak, feedback, onNextPuzzle, showNextButton }) => {
  return (
    <div className="flex flex-col h-full bg-[#262522] text-[#c3c3c3]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#211f1c] border-b border-black/20 shadow-sm">
        <div className="flex items-center gap-2">
          <PuzzleIcon className="w-6 h-6 text-orange-400" fill="currentColor" />
          <span className="font-bold text-white text-xl">Puzzles</span>
        </div>
        <div className="flex gap-0.5 items-end">
           <span className="text-xs font-bold text-gray-500 mb-0.5">Rank</span>
           <span className="text-white text-xl font-bold">Wood</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-6">
        
        {/* Coach Bubble / Feedback */}
        <div className="flex gap-4 items-start">
            <div className="shrink-0 relative mt-1">
                <img 
                    src="https://www.chess.com/bundles/web/images/coach/marty.png" 
                    alt="Coach" 
                    className="w-12 h-12 rounded-lg object-cover bg-gray-600"
                    onError={(e) => (e.currentTarget.src = 'https://www.chess.com/bundles/web/images/user-image.svg')} 
                />
            </div>
            <div className={`text-[#2b2926] p-3 rounded-xl rounded-tl-none text-[15px] leading-snug shadow-md relative font-medium transition-colors duration-300
                ${feedback === 'correct' ? 'bg-[#81b64c] text-white' : feedback === 'incorrect' ? 'bg-[#fa412d] text-white' : 'bg-white'}
            `}>
                <div className={`absolute top-0 left-[-8px] w-0 h-0 border-t-[10px] border-l-[10px] border-l-transparent drop-shadow-sm
                     ${feedback === 'correct' ? 'border-t-[#81b64c]' : feedback === 'incorrect' ? 'border-t-[#fa412d]' : 'border-t-white'}
                `}></div>

                {feedback === 'correct' ? (
                    <span>Excellent! That is the best move. Keep it up!</span>
                ) : feedback === 'incorrect' ? (
                    <span>That is not the correct move. Try again!</span>
                ) : (
                    <span>Find the best move for {streak % 2 === 0 ? 'White' : 'Black'}! Focus on checks, captures, and threats.</span>
                )}
            </div>
        </div>

        {/* Rating Card */}
        <div>
             <div className="flex justify-between items-end mb-1">
                 <span className="text-3xl font-black text-white">{rating}</span>
                 {streak > 0 && <span className="text-green-500 font-bold">+{streak * 5}</span>}
             </div>
             <div className="w-full h-4 bg-[#1b1a19] rounded-full overflow-hidden flex">
                 <div className="w-[15%] h-full bg-[#81b64c]"></div>
             </div>
             <div className="flex justify-end mt-1">
                 <div className="bg-[#3d2918] text-[#c48d5d] px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                    <PuzzleIcon className="w-3 h-3" fill="currentColor" />
                    <span>{streak}</span>
                 </div>
             </div>
        </div>

        {/* Main Action */}
        {showNextButton ? (
             <button
                onClick={onNextPuzzle}
                className="w-full bg-[#81b64c] hover:bg-[#a3d160] text-white font-bold text-2xl py-5 rounded-lg shadow-[0_4px_0_0_#457524] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center animate-pulse"
             >
                Next Puzzle
            </button>
        ) : (
            <button className="w-full bg-[#3d3b38] text-gray-400 font-bold text-2xl py-5 rounded-lg cursor-not-allowed flex items-center justify-center border-b-4 border-black/20">
                Solve...
            </button>
        )}

        {/* Secondary Actions */}
        <div className="space-y-3 opacity-50 pointer-events-none filter grayscale">
             <PuzzleModeButton 
                title="Puzzle Rush" 
                icon={<Zap className="w-6 h-6 text-white" fill="currentColor" />} 
                iconBg="bg-orange-500" 
             />
             <PuzzleModeButton 
                title="Daily Puzzle" 
                icon={<Calendar className="w-6 h-6 text-white" />} 
                iconBg="bg-green-500" 
             />
        </div>

      </div>
      
      {/* Footer Stats Mock */}
      <div className="bg-[#211f1c] p-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-sm text-gray-400 font-semibold">
              <div className="w-4 h-4 rounded bg-blue-400"></div>
              <span>Stats</span>
          </div>
      </div>
    </div>
  );
};

export default PuzzlesPanel;
