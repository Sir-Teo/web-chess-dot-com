import React from 'react';
import { 
  Search, 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft, 
  SkipForward, 
  SkipBack,
  PlusCircle, 
  Save, 
  Star, 
  MoreHorizontal,
  Activity
} from 'lucide-react';
import MoveList from './MoveList';
import { Chess } from 'chess.js';

interface AnalysisPanelProps {
  game: Chess; // Added game prop
  evalScore?: string | number;
  bestLine?: string;
  onNext?: () => void;
  onPrev?: () => void;
  onFirst?: () => void;
  onLast?: () => void;
  currentMove?: number;
  onMoveClick?: (index: number) => void; // Added onMoveClick
}

const AnalysisMenuItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  expanded?: boolean;
}> = ({ icon, label, expanded }) => (
  <div className="border-b border-white/5">
    <button className={`w-full flex items-center justify-between p-4 hover:bg-[#2a2926] transition-colors ${expanded ? 'bg-[#2a2926]' : ''}`}>
      <div className="flex items-center gap-3 text-gray-300">
        {icon}
        <span className="font-bold text-[15px]">{label}</span>
      </div>
      {expanded ? (
        <ChevronDown className="w-5 h-5 text-gray-500" />
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-500" />
      )}
    </button>
  </div>
);

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ 
    game,
    evalScore = "+0.33", 
    bestLine = "...", 
    onNext, 
    onPrev, 
    onFirst, 
    onLast,
    currentMove = 0,
    onMoveClick
}) => {
  return (
    <div className="flex flex-col h-full bg-[#262522] text-[#c3c3c3]">
      {/* Header */}
      <div className="flex items-center justify-center py-3 bg-[#211f1c] border-b border-black/20 shadow-sm relative">
        <div className="flex items-center gap-2 text-gray-400">
          <Search className="w-5 h-5" />
          <span className="font-bold text-lg text-white">Analysis</span>
        </div>
      </div>

      {/* Engine Stats */}
      <div className="bg-[#211f1c] p-4 border-b border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-chess-green" />
                  <span className="font-bold text-white">Stockfish 16</span>
                  <span className="text-xs bg-[#302e2b] px-1.5 py-0.5 rounded text-gray-400 border border-white/10">Depth 20</span>
              </div>
              <div className={`font-mono font-bold text-lg ${String(evalScore).includes('-') ? 'text-white' : 'text-chess-green'}`}>
                  {evalScore}
              </div>
          </div>
          <div className="bg-[#2a2926] p-2 rounded border border-white/5 text-xs font-mono text-gray-400 break-all leading-relaxed h-12 overflow-hidden">
              <span className="text-chess-green font-bold mr-2">PV:</span>
              {bestLine}
          </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {/* Move List */}
        <MoveList
            game={game}
            currentMoveIndex={currentMove === 0 ? -2 : currentMove - 1} // MoveList expects index of move in history (0-based). currentMove is 1-based (0 is start).
            onMoveClick={(_fen, index) => onMoveClick?.(index)}
        />
      </div>

      {/* Footer Controls */}
      <div className="bg-[#211f1c] border-t border-black/20">
         {/* Navigation */}
         <div className="flex items-center p-1 gap-1 border-b border-white/5">
             <button onClick={onFirst} className="flex-1 h-12 flex items-center justify-center bg-[#2b2926] hover:bg-[#363430] rounded text-gray-400 hover:text-white transition-colors">
                <SkipBack className="w-6 h-6 fill-current" />
             </button>
             <button onClick={onPrev} className="flex-1 h-12 flex items-center justify-center bg-[#2b2926] hover:bg-[#363430] rounded text-gray-400 hover:text-white transition-colors">
                <ChevronLeft className="w-8 h-8" />
             </button>
             <button onClick={onNext} className="flex-1 h-12 flex items-center justify-center bg-[#2b2926] hover:bg-[#363430] rounded text-gray-400 hover:text-white transition-colors">
                <ChevronRight className="w-8 h-8" />
             </button>
             <button onClick={onLast} className="flex-1 h-12 flex items-center justify-center bg-[#2b2926] hover:bg-[#363430] rounded text-gray-400 hover:text-white transition-colors">
                <SkipForward className="w-6 h-6 fill-current" />
             </button>
         </div>

         {/* Bottom Actions */}
         <div className="flex items-center justify-between p-2 px-4">
             <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white group">
                 <PlusCircle className="w-6 h-6 group-hover:text-white" />
                 <span className="text-[10px] font-bold">New</span>
             </button>
             <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white group">
                 <Save className="w-6 h-6 group-hover:text-white" />
                 <span className="text-[10px] font-bold">Save</span>
             </button>
             <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white group">
                 <Star className="w-6 h-6 group-hover:text-white" />
                 <span className="text-[10px] font-bold">Review</span>
             </button>
             <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white group">
                 <MoreHorizontal className="w-6 h-6 group-hover:text-white" />
                 <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100">More</span>
             </button>
         </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;
