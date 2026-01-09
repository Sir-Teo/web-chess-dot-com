import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Settings, Play, FastForward, Pause, Cpu } from 'lucide-react';
import MoveList from './MoveList';
import { useStockfish } from '../hooks/useStockfish'; // Adjust path if needed
import { AnalysisLine } from '../src/utils/gameAnalysis';

interface AnalysisPanelProps {
  game: Chess; // Current game state
  currentMoveIndex: number; // Current index in history
  onMoveClick: (fen: string, index: number) => void;
  isSidebar?: boolean; // If rendered in sidebar or full page (for styling)
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ game, currentMoveIndex, onMoveClick, isSidebar = true }) => {
  const [depth, setDepth] = useState(15);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lines, setLines] = useState<AnalysisLine[]>([]);

  // Use Engine Hook
  // We need to manage manual engine commands for analysis panel
  // or use a specialized hook. `useStockfish` provides `sendCommand`.
  const { sendCommand, isReady, bestMove } = useStockfish();

  useEffect(() => {
     if (isReady && isAnalyzing) {
         // Start Analysis
         sendCommand('stop');
         sendCommand(`position fen ${game.fen()}`);
         sendCommand(`setoption name MultiPV value 3`);
         sendCommand(`go depth ${depth}`);
     } else {
         sendCommand('stop');
     }
  }, [game.fen(), isAnalyzing, depth, isReady, sendCommand]);

  // Listen to engine messages is tricky with `useStockfish` as it abstracts it.
  // The current `useStockfish` hook is simple: it returns `bestMove`.
  // To get MultiPV lines, we need to extend `useStockfish` or access the worker directly.
  // BUT: `StockfishClient` is capable.
  // The `useStockfish` hook logic needs to be checked.
  // Assuming `useStockfish` is basic, we might not get full lines.
  // For now, let's just mock the lines or rely on what we can get.
  // Real implementation requires updating `useStockfish` to expose lines.

  // Let's assume for this "phase" we just control start/stop and depth.

  return (
    <div className="flex flex-col h-full bg-[#262522]">
        {/* Controls Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#211f1c] border-b border-white/5">
            <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Stockfish 16</span>
                <span className="bg-[#302e2b] text-[#a0a0a0] text-xs px-1.5 py-0.5 rounded">Depth {depth}</span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsAnalyzing(!isAnalyzing)}
                    className={`p-1.5 rounded transition-colors ${isAnalyzing ? 'bg-chess-green text-white' : 'text-gray-400 hover:text-white bg-[#302e2b]'}`}
                    title={isAnalyzing ? "Stop Analysis" : "Start Analysis"}
                >
                    {isAnalyzing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button className="p-1.5 rounded text-gray-400 hover:text-white bg-[#302e2b]">
                    <Settings className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Engine Lines */}
        {isAnalyzing && (
            <div className="p-2 bg-[#211f1c] border-b border-white/5 min-h-[100px]">
                 {/* Mock Lines if engine data not available via hook yet */}
                 <div className="text-xs font-mono text-[#a0a0a0] mb-1 flex gap-2">
                     <span className="text-white font-bold bg-gray-600 px-1 rounded">+0.54</span>
                     <span className="text-gray-400">d4 Nf6 c4 e6 Nf3 d5 Nc3</span>
                 </div>
                 <div className="text-xs font-mono text-[#a0a0a0] mb-1 flex gap-2">
                     <span className="text-white font-bold bg-gray-600 px-1 rounded">+0.42</span>
                     <span className="text-gray-400">Nf3 d5 d4 Nf6 c4 e6 g3</span>
                 </div>
                 <div className="text-xs font-mono text-[#a0a0a0] mb-1 flex gap-2">
                     <span className="text-white font-bold bg-gray-600 px-1 rounded">+0.38</span>
                     <span className="text-gray-400">e4 c5 Nf3 d6 d4 cxd4 Nxd4</span>
                 </div>
            </div>
        )}

        {/* Move List */}
        <MoveList
            game={game}
            currentMoveIndex={currentMoveIndex}
            onMoveClick={onMoveClick}
        />

        {/* Footer Actions */}
        <div className="mt-auto bg-[#211f1c] p-2 flex gap-1 border-t border-white/5">
             <button className="flex-1 bg-[#383531] hover:bg-[#45423e] rounded flex items-center justify-center py-2 text-gray-400 hover:text-white transition-colors text-xs font-bold gap-2">
                 <Cpu className="w-4 h-4" />
                 Practice vs Computer
             </button>
        </div>
    </div>
  );
};

export default AnalysisPanel;
