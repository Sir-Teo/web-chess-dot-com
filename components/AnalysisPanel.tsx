import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Settings, Play, FastForward, Pause, Cpu, RotateCcw, Copy, Check } from 'lucide-react';
import MoveList from './MoveList';
import AnalysisSettingsModal from './AnalysisSettingsModal';
import { uciLineToSan, GameReviewData } from '../src/utils/gameAnalysis'; // Import helper

interface AnalysisPanelProps {
  game: Chess; // Current game state
  currentMoveIndex: number; // Current index in history
  onMoveClick: (fen: string, index: number) => void;
  isSidebar?: boolean; // If rendered in sidebar or full page (for styling)
  stockfish: any; // Use the hook result type
  fen?: string; // Current FEN to analyze
  analysisData?: GameReviewData;
  onNavigate?: (view: string, params?: any) => void;
  onReset?: () => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
    game,
    currentMoveIndex,
    onMoveClick,
    isSidebar = true,
    stockfish,
    fen,
    analysisData,
    onNavigate,
    onReset
}) => {
  const [depth, setDepth] = useState(15);
  const [isAnalyzing, setIsAnalyzing] = useState(true); // Default to analyzing
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [engineSettings, setEngineSettings] = useState(() => {
      const defaultSettings = { lines: 3, threads: 1, hash: 32 };
      try {
          const saved = localStorage.getItem('analysis_engine_settings');
          if (saved) {
              const parsed = JSON.parse(saved);
              return { ...defaultSettings, ...parsed };
          }
      } catch (e) {
          // Ignore parse errors, use defaults
      }
      return defaultSettings;
  });

  // Destructure stockfish hook
  const { sendCommand, isReady, isLoading, error, lines } = stockfish;

  const handleCopyPgn = () => {
      navigator.clipboard.writeText(game.pgn());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const updateSettings = (newSettings: any) => {
      setEngineSettings(newSettings);
      localStorage.setItem('analysis_engine_settings', JSON.stringify(newSettings));
  };

  useEffect(() => {
     if (isReady && isAnalyzing) {
         // Start Analysis - proper UCI command sequence
         sendCommand('stop');

         // Reset engine state for new analysis
         sendCommand('ucinewgame');

         // Apply settings
         sendCommand(`setoption name MultiPV value ${engineSettings.lines}`);
         sendCommand(`setoption name Threads value ${engineSettings.threads}`);
         sendCommand(`setoption name Hash value ${engineSettings.hash}`);

         // Sync command - engine processes commands in order
         sendCommand('isready');

         // Use the passed FEN or fallback to game.fen()
         const targetFen = fen || game.fen();

         sendCommand(`position fen ${targetFen}`);
         sendCommand(`go depth ${depth}`);
     } else if (!isAnalyzing) {
         sendCommand('stop');
     }
  }, [fen, game, isAnalyzing, depth, isReady, sendCommand, engineSettings]);

  return (
    <div className="flex flex-col h-full bg-[#262522]">
        <AnalysisSettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            initialSettings={engineSettings}
            onSave={updateSettings}
        />

        {/* Controls Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#211f1c] border-b border-white/5">
            <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Stockfish 16 (Lite)</span>
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
                <button
                    onClick={() => setShowSettings(true)}
                    className="p-1.5 rounded text-gray-400 hover:text-white bg-[#302e2b]"
                >
                    <Settings className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Engine Lines */}
        {isAnalyzing && (
            <div className="p-2 bg-[#211f1c] border-b border-white/5 min-h-[100px] font-mono text-xs overflow-y-auto max-h-[150px]">
                 {error ? (
                     <div className="text-red-400 italic p-2">Engine error: {error}</div>
                 ) : isLoading ? (
                     <div className="text-[#706c66] italic p-2">Loading engine...</div>
                 ) : !isReady ? (
                     <div className="text-[#706c66] italic p-2">Initializing...</div>
                 ) : lines.length === 0 ? (
                     <div className="text-[#706c66] italic p-2">Calculating...</div>
                 ) : (
                     lines.map((line: any) => {
                         const scoreVal = line.score.unit === 'cp'
                             ? (line.score.value > 0 ? '+' : '') + (line.score.value / 100).toFixed(2)
                             : `M${Math.abs(line.score.value)}`;

                         // Colorize score
                         const scoreClass = line.score.value > 0
                             ? (line.score.value > 100 ? 'text-green-400' : 'text-white')
                             : (line.score.value < -100 ? 'text-red-400' : 'text-white');

                         // Convert PV to SAN
                         const san = uciLineToSan(fen || game.fen(), line.pv);

                         return (
                             <div key={line.multipv} className="mb-1.5 flex gap-2 items-start group hover:bg-white/5 p-1 rounded">
                                 <span className={`font-bold bg-[#383531] px-1.5 py-0.5 rounded min-w-[3.5em] text-center ${scoreClass}`}>
                                     {scoreVal}
                                 </span>
                                 <span className="text-gray-400 group-hover:text-gray-300 break-words flex-1 leading-relaxed">
                                     {san}
                                 </span>
                             </div>
                         );
                     })
                 )}
            </div>
        )}

        {/* Move List */}
        <MoveList
            game={game}
            currentMoveIndex={currentMoveIndex}
            onMoveClick={onMoveClick}
            analysisData={analysisData}
        />

        {/* Footer Actions */}
        <div className="mt-auto bg-[#211f1c] p-2 flex flex-col gap-2 border-t border-white/5">
            <div className="flex gap-1">
                <button
                    onClick={handleCopyPgn}
                    className="flex-1 bg-[#302e2b] hover:bg-[#3d3a36] rounded flex items-center justify-center py-2 text-gray-400 hover:text-white transition-colors text-xs font-bold gap-2"
                >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy PGN"}
                </button>
                <button
                     onClick={onReset}
                     className="flex-1 bg-[#302e2b] hover:bg-[#3d3a36] rounded flex items-center justify-center py-2 text-gray-400 hover:text-white transition-colors text-xs font-bold gap-2"
                >
                     <RotateCcw className="w-4 h-4" />
                     Reset
                </button>
            </div>
             <button
                 onClick={() => {
                     if (onNavigate) {
                         onNavigate('play-bots', { initialFen: fen || game.fen(), practiceTitle: 'Practice Position' });
                     }
                 }}
                 className="w-full bg-[#383531] hover:bg-[#45423e] rounded flex items-center justify-center py-2 text-gray-400 hover:text-white transition-colors text-xs font-bold gap-2"
             >
                 <Cpu className="w-4 h-4" />
                 Practice vs Computer
             </button>
        </div>
    </div>
  );
};

export default AnalysisPanel;
