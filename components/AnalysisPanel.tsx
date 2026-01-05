import React, { useState } from 'react';
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
  Target,
  Settings,
  Cloud,
  ArrowRight,
  TrendingUp,
  Zap,
  Eye,
  BarChart
} from 'lucide-react';
import MoveList from './MoveList';
import { Chess } from 'chess.js';
import { AnalysisLine } from '../hooks/useStockfish';
import { GameReviewData } from '../utils/gameAnalysis';
import { AnalysisSettings } from './AnalysisInterface';

interface AnalysisPanelProps {
  game: Chess;
  currentFen?: string;
  evalScore?: string | number;
  bestLine?: string;
  lines?: AnalysisLine[];
  onNext?: () => void;
  onPrev?: () => void;
  onFirst?: () => void;
  onLast?: () => void;
  currentMove?: number;
  onMoveClick?: (index: number) => void;

  analysisData?: GameReviewData | null;

  settings?: AnalysisSettings;
  onSettingsChange?: (settings: AnalysisSettings) => void;

  depth?: number;
  onDepthChange?: (depth: number) => void;
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

// Helper to format PV with figurines
const formatPV = (pv: string, fen: string) => {
    if (!pv) return "...";
    const tempGame = new Chess(fen);
    const uciMoves = pv.split(' ').slice(0, 10);
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

const SettingsPopover: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    settings: AnalysisSettings;
    onSettingsChange: (s: AnalysisSettings) => void;
}> = ({ isOpen, onClose, settings, onSettingsChange }) => {
    if (!isOpen) return null;

    // Click outside handler could be added here or parent
    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose}></div>
            <div className="absolute top-12 right-2 bg-[#302e2b] border border-white/10 rounded-lg shadow-xl z-50 w-64 p-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-xs font-bold text-gray-400 px-2 py-1 uppercase tracking-wider mb-1">Analysis Settings</div>

                <label className="flex items-center justify-between p-2 hover:bg-white/5 rounded cursor-pointer">
                    <div className="flex items-center gap-2">
                         <Target className="w-4 h-4 text-chess-green" />
                         <span className="text-sm font-medium text-gray-200">Best Move Arrow</span>
                    </div>
                    <input
                        type="checkbox"
                        checked={settings.showArrows}
                        onChange={(e) => onSettingsChange({ ...settings, showArrows: e.target.checked })}
                        className="accent-chess-green"
                    />
                </label>

                <label className="flex items-center justify-between p-2 hover:bg-white/5 rounded cursor-pointer">
                    <div className="flex items-center gap-2">
                         <BarChart className="w-4 h-4 text-chess-green" />
                         <span className="text-sm font-medium text-gray-200">Evaluation Bar</span>
                    </div>
                    <input
                        type="checkbox"
                        checked={settings.showEvalBar}
                        onChange={(e) => onSettingsChange({ ...settings, showEvalBar: e.target.checked })}
                        className="accent-chess-green"
                    />
                </label>

                <label className="flex items-center justify-between p-2 hover:bg-white/5 rounded cursor-pointer">
                    <div className="flex items-center gap-2">
                         <Eye className="w-4 h-4 text-chess-green" />
                         <span className="text-sm font-medium text-gray-200">Highlight Moves</span>
                    </div>
                    <input
                        type="checkbox"
                        checked={settings.highlightMoves}
                        onChange={(e) => onSettingsChange({ ...settings, highlightMoves: e.target.checked })}
                        className="accent-chess-green"
                    />
                </label>

                <div className="h-px bg-white/10 my-1"></div>

                 <label className="flex items-center justify-between p-2 hover:bg-white/5 rounded cursor-pointer group">
                    <div className="flex items-center gap-2">
                         <Zap className="w-4 h-4 text-red-500" />
                         <span className="text-sm font-medium text-gray-200 group-hover:text-red-400">Show Threats</span>
                    </div>
                    <input
                        type="checkbox"
                        checked={settings.showThreats}
                        onChange={(e) => onSettingsChange({ ...settings, showThreats: e.target.checked })}
                        className="accent-red-500"
                    />
                </label>
            </div>
        </>
    );
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
    analysisData,
    settings = { showArrows: true, showEvalBar: true, highlightMoves: true, showThreats: false },
    onSettingsChange,
    depth = 20,
    onDepthChange,
    onPractice
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const turn = currentFen?.split(' ')[1] as 'w' | 'b' || 'w';

  // Format the main PV line
  const formattedBestLine = React.useMemo(() => {
    return formatPV(bestLine, currentFen || game.fen());
  }, [bestLine, currentFen, game]);

  return (
    <div className="flex flex-col h-full bg-[#262522] text-[#c3c3c3]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#211f1c] border-b border-black/20 relative z-30">
        <div className="flex items-center gap-2 text-gray-200">
          <Search className="w-5 h-5 opacity-70" />
          <span className="font-bold text-base">Engine Analysis</span>
        </div>

        {/* Toggle Controls */}
        <div className="flex gap-1 relative">
            {/* Show Threats Quick Toggle */}
            <button
                onClick={() => onSettingsChange && onSettingsChange({ ...settings, showThreats: !settings.showThreats })}
                className={`p-1.5 rounded transition-colors ${settings.showThreats ? 'text-red-500 bg-red-500/10' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                title="Show Threats"
            >
                <Target className="w-5 h-5" />
            </button>

            {/* Settings Toggle */}
            <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-1.5 rounded transition-colors ${isSettingsOpen ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
            >
                <Settings className="w-5 h-5" />
            </button>

            <SettingsPopover
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                onSettingsChange={(s) => {
                    if (onSettingsChange) onSettingsChange(s);
                }}
            />
        </div>
      </div>

      {/* Engine Stats Area */}
      <div className="bg-[#211f1c] p-3 border-b border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-chess-green" />
                  <span className="font-semibold text-gray-300">Stockfish 10 (Lite)</span>
                  <span className="bg-[#302e2b] px-1.5 py-0.5 rounded border border-white/5 text-[10px] font-mono">
                     D{depth}
                  </span>
              </div>

              <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
                  <Cloud className="w-3.5 h-3.5" />
                  <select
                    value={depth}
                    onChange={(e) => onDepthChange && onDepthChange(parseInt(e.target.value))}
                    className="bg-transparent text-[10px] font-bold outline-none cursor-pointer appearance-none"
                  >
                      <option value={15}>Depth 15</option>
                      <option value={18}>Depth 18</option>
                      <option value={20}>Depth 20</option>
                      <option value={22}>Depth 22</option>
                  </select>
              </div>
          </div>

          {/* MultiPV Display (Lines) */}
          <div className="flex flex-col gap-1">
              {settings.showThreats ? (
                  <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-center">
                      <span className="text-red-400 font-bold text-sm flex items-center justify-center gap-2">
                          <Target className="w-4 h-4" />
                          Viewing Threats
                      </span>
                      <div className="text-xs text-red-300/70 mt-1">
                          Showing opponent's best response if you pass.
                      </div>
                  </div>
              ) : lines.length > 0 ? (
                  lines.map((line, idx) => (
                      <div key={line.multipv} className="flex gap-2 bg-[#2a2926] p-1.5 rounded border border-white/5 text-xs hover:bg-[#32312e] cursor-pointer transition-colors group">
                           {/* Score Box */}
                           <div className={`
                               w-12 flex items-center justify-center rounded font-mono font-bold
                               ${formatScore(line.score, turn).includes('-')
                                   ? 'bg-[#b33939]/20 text-white'
                                   : 'bg-[#5da02c]/20 text-chess-green'}
                           `}>
                               {formatScore(line.score, turn)}
                           </div>

                           {/* Line */}
                           <div className="font-medium text-gray-400 break-all flex-1 group-hover:text-gray-200 leading-snug">
                               {formatPV(line.pv, currentFen || game.fen())}
                           </div>
                      </div>
                  ))
              ) : (
                  <div className="bg-[#2a2926] p-2 rounded border border-white/5 text-xs text-gray-400 h-10 flex items-center justify-center italic">
                      Calculating lines...
                  </div>
              )}
          </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        <MoveList
            game={game}
            currentMoveIndex={currentMove === 0 ? -2 : currentMove - 1}
            onMoveClick={(_fen, index) => onMoveClick?.(index)}
            analysisData={analysisData}
        />
      </div>

      {/* Footer Controls */}
      <div className="bg-[#211f1c] border-t border-black/20">
         {/* Navigation */}
         <div className="flex items-center p-1 gap-1 border-b border-white/5">
             <button onClick={onFirst} className="flex-1 h-10 flex items-center justify-center bg-[#2b2926] hover:bg-[#363430] rounded text-gray-400 hover:text-white transition-colors">
                <SkipBack className="w-5 h-5 fill-current" />
             </button>
             <button onClick={onPrev} className="flex-1 h-10 flex items-center justify-center bg-[#2b2926] hover:bg-[#363430] rounded text-gray-400 hover:text-white transition-colors">
                <ChevronLeft className="w-7 h-7" />
             </button>
             <button onClick={onNext} className="flex-1 h-10 flex items-center justify-center bg-[#2b2926] hover:bg-[#363430] rounded text-gray-400 hover:text-white transition-colors">
                <ChevronRight className="w-7 h-7" />
             </button>
             <button onClick={onLast} className="flex-1 h-10 flex items-center justify-center bg-[#2b2926] hover:bg-[#363430] rounded text-gray-400 hover:text-white transition-colors">
                <SkipForward className="w-5 h-5 fill-current" />
             </button>
         </div>

         {/* Bottom Actions */}
         <div className="flex items-center justify-between p-2 px-4">
             <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white group transition-colors">
                 <PlusCircle className="w-5 h-5 group-hover:text-white" />
                 <span className="text-[9px] font-bold uppercase tracking-wide">New</span>
             </button>
             <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white group transition-colors">
                 <Save className="w-5 h-5 group-hover:text-white" />
                 <span className="text-[9px] font-bold uppercase tracking-wide">Save</span>
             </button>
             <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white group transition-colors">
                 <Star className="w-5 h-5 group-hover:text-white" />
                 <span className="text-[9px] font-bold uppercase tracking-wide">Review</span>
             </button>
             <button
                 onClick={onPractice}
                 className="flex flex-col items-center gap-1 text-gray-400 hover:text-white group transition-colors"
                 title="Practice Position vs Computer"
             >
                 <Target className="w-5 h-5 group-hover:text-white" />
                 <span className="text-[9px] font-bold uppercase tracking-wide">Practice</span>
             </button>
             <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white group transition-colors">
                 <MoreHorizontal className="w-5 h-5 group-hover:text-white" />
                 <span className="text-[9px] font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100">More</span>
             </button>
         </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;
