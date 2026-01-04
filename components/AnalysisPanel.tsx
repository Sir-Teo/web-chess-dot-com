import React from 'react';
import { 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  SkipForward, 
  SkipBack,
  PlusCircle, 
  Save, 
  Star, 
  MoreHorizontal,
  Activity,
  FlipHorizontal,
  Target,
  Settings,
  Cloud
} from 'lucide-react';
import MoveList from './MoveList';
import { Chess } from 'chess.js';
import { AnalysisLine } from '../hooks/useStockfish';

interface AnalysisPanelProps {
  game: Chess;
  currentFen?: string;
  evalScore?: string | number;
  bestLine?: string;
  lines?: AnalysisLine[]; // Added lines prop
  onNext?: () => void;
  onPrev?: () => void;
  onFirst?: () => void;
  onLast?: () => void;
  currentMove?: number;
  onMoveClick?: (index: number) => void;

  // New props for improved Analysis UI
  showThreats?: boolean;
  onToggleThreats?: () => void;

  // Settings controls
  depth?: number;
  onDepthChange?: (depth: number) => void;

  // New action
  onPractice?: () => void;
}

// Helper to format eval
const formatScore = (score: { type: 'cp' | 'mate', value: number }, turn: 'w' | 'b') => {
    if (score.type === 'mate') {
        return `M${Math.abs(score.value)}`;
    }
    let val = score.value / 100;
    if (turn === 'b') val = -val;
    return val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2);
};

// Helper to format PV
const formatPV = (pv: string, fen: string) => {
    if (!pv) return "...";
    const tempGame = new Chess(fen);
    const uciMoves = pv.split(' ').slice(0, 8);
    const sanMoves = [];

    for (const uci of uciMoves) {
        if (uci.length < 4) continue;
        const from = uci.substring(0, 2);
        const to = uci.substring(2, 4);
        const promotion = uci.length > 4 ? uci.substring(4, 5) : undefined;
        try {
            const move = tempGame.move({ from, to, promotion: promotion || 'q' });
            if (move) sanMoves.push(move.san);
        } catch (e) {
            break;
        }
    }
    return sanMoves.join(' ');
};

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
    game,
    currentFen,
    evalScore = "+0.33",
    bestLine = "...",
    lines = [],
    onNext,
    onPrev,
    onFirst,
    onLast,
    currentMove = 0,
    onMoveClick,
    showThreats,
    onToggleThreats,
    depth = 20,
    onDepthChange
}) => {

  const turn = currentFen?.split(' ')[1] as 'w' | 'b' || 'w';

  // Format the main PV line from UCI to SAN (if lines empty)
  const formattedBestLine = React.useMemo(() => {
    return formatPV(bestLine, currentFen || game.fen());
  }, [bestLine, currentFen, game]);

  return (
    <div className="flex flex-col h-full bg-[#262522] text-[#c3c3c3]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#211f1c] border-b border-black/20 shadow-sm relative">
        <div className="flex items-center gap-2 text-gray-400">
          <Search className="w-5 h-5" />
          <span className="font-bold text-lg text-white">Analysis</span>
        </div>

        {/* Toggle Controls */}
        <div className="flex gap-2">
            <button
                onClick={onToggleThreats}
                className={`p-1.5 rounded hover:bg-white/10 transition-colors ${showThreats ? 'text-red-500 bg-red-500/10' : 'text-gray-400'}`}
                title="Show Threats"
            >
                <Target className="w-5 h-5" />
            </button>
            <button className="p-1.5 rounded hover:bg-white/10 text-gray-400 transition-colors">
                <Settings className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Engine Stats */}
      <div className="bg-[#211f1c] p-4 border-b border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-chess-green" />
                  <span className="font-bold text-white">Stockfish 16</span>

                  {/* Depth Selector (Mock Cloud Analysis) */}
                  <div className="flex items-center gap-1 bg-[#302e2b] px-1.5 py-0.5 rounded border border-white/10 ml-2">
                      <Cloud className="w-3 h-3 text-blue-400" />
                      <select
                        value={depth}
                        onChange={(e) => onDepthChange && onDepthChange(parseInt(e.target.value))}
                        className="bg-transparent text-xs text-gray-300 font-mono outline-none cursor-pointer"
                      >
                          <option value={15}>Depth 15</option>
                          <option value={20}>Depth 20</option>
                          <option value={25}>Depth 25</option>
                          <option value={30}>Depth 30</option>
                      </select>
                  </div>
              </div>
          </div>

          {/* MultiPV Display */}
          <div className="flex flex-col gap-1 mt-2">
              {lines.length > 0 ? (
                  lines.map((line) => (
                      <div key={line.multipv} className="flex gap-2 bg-[#2a2926] p-1.5 rounded border border-white/5 text-xs hover:bg-[#32312e] cursor-pointer transition-colors group">
                           <div className={`font-mono font-bold w-12 text-right ${
                               formatScore(line.score, turn).includes('-') ? 'text-white' : 'text-chess-green'
                           }`}>
                               {formatScore(line.score, turn)}
                           </div>
                           <div className="font-mono text-gray-400 break-all flex-1 group-hover:text-gray-300">
                               {formatPV(line.pv, currentFen || game.fen())}
                           </div>
                      </div>
                  ))
              ) : (
                  <div className="bg-[#2a2926] p-2 rounded border border-white/5 text-xs font-mono text-gray-400 break-all leading-relaxed h-12 overflow-hidden flex items-center">
                      <div className="flex gap-2 w-full">
                           <span className={`font-mono font-bold ${String(evalScore).includes('-') ? 'text-white' : 'text-chess-green'}`}>
                               {evalScore}
                           </span>
                           <span className="truncate">{formattedBestLine}</span>
                      </div>
                  </div>
              )}
          </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {/* Move List */}
        <MoveList
            game={game}
            currentMoveIndex={currentMove === 0 ? -2 : currentMove - 1}
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
             <button
                 onClick={onPractice}
                 className="flex flex-col items-center gap-1 text-gray-400 hover:text-white group"
                 title="Practice Position vs Computer"
             >
                 <Target className="w-6 h-6 group-hover:text-white" />
                 <span className="text-[10px] font-bold">Practice</span>
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
