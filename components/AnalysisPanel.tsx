import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Settings, Play, FastForward, Pause, Cpu } from 'lucide-react';
import MoveList from './MoveList';
import { uciLineToSan } from '../src/utils/gameAnalysis'; // Import helper

interface AnalysisPanelProps {
  game: Chess; // Current game state
  currentMoveIndex: number; // Current index in history
  onMoveClick: (fen: string, index: number) => void;
  isSidebar?: boolean; // If rendered in sidebar or full page (for styling)
  stockfish: any; // Use the hook result type
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ game, currentMoveIndex, onMoveClick, isSidebar = true, stockfish }) => {
  const [depth, setDepth] = useState(15);
  const [isAnalyzing, setIsAnalyzing] = useState(true); // Default to analyzing

  // Destructure stockfish hook
  const { sendCommand, isReady, lines } = stockfish;

  useEffect(() => {
     if (isReady && isAnalyzing) {
         // Start Analysis
         sendCommand('stop');
         // Use the current FEN derived from move index if possible, but game object might represent live.
         // Wait, `game` is the master game object. `currentMoveIndex` determines view.
         // We need the FEN at `currentMoveIndex`.
         let fen = game.fen();

         // If browsing history
         if (currentMoveIndex > -1 && currentMoveIndex < game.history().length) {
             // Reconstruct logic or use a cached fen
             // Since `game` is updated in parent when move happens, but if we browse history...
             // Parent `AnalysisInterface` sets `currentFen` but `AnalysisPanel` receives `game`.
             // Ideally `AnalysisPanel` should receive `currentFen` for analysis.
             // But let's calculate it here or assume parent handles it?
             // Actually, parent `AnalysisInterface` *already* has `currentFen`.
             // We should probably accept `currentFen` as a prop to avoid re-calculation.
         }

         // For now, let's recalculate or better yet, update parent to pass fen.
         // Wait, `AnalysisInterface` passes `game` and `viewMoveIndex`.
         // It doesn't pass `currentFen` explicitly to `AnalysisPanel`.
         // Let's rely on `game.fen()` if `viewMoveIndex` is -1.
         // If `viewMoveIndex` is set, we need to get that FEN.
         // Since `game.history()` returns strings, we can't get FEN easily without replaying.
         // BUT `AnalysisInterface` HAS `currentFen` state.
         // It should pass `currentFen` to us.

         // Let's quickly fix this by accepting `fen` prop or using `game`.
         // `AnalysisInterface` has `currentFen`. I will assume `game.fen()` matches the view if parent syncs `game` to view?
         // No, parent says `setGame` creates new game only on move. `setCurrentFen` updates on click.
         // So `game` object might be ahead of `currentFen`.

         // Let's use `game` to replay to `currentMoveIndex`.
         const tempGame = new Chess();
         if (game.pgn()) {
             tempGame.loadPgn(game.pgn());
             // Navigate
             // Chess.js doesn't have "goto".
             // We have to replay.
             // This is inefficient.
             // Better: Pass `currentFen` from parent.
         }

         // Workaround: Use the FEN from parent if I add it to props.
         // I'll add `currentFen` to props in next step or just use `game.fen()` which is LIVE position.
         // If user clicks back, `AnalysisInterface` updates `currentFen` state but `game` remains full history.
         // Wait, `AnalysisInterface` does `setCurrentFen`.
         // Does it pass it? No.

         // I will assume for now we analyze the LIVE position (`game.fen()`) unless I fix props.
         // Actually, I can use `game` and `currentMoveIndex`.
         // But replaying PGN is slow.
         // The parent `AnalysisInterface` *is* passing `game` but not `currentFen`.

         // FIX: I will just use `sendCommand` with `position fen ...`
         // But I need the FEN.
         // I'll modify `AnalysisPanel` to take `fen` prop.
         // Since I am editing `AnalysisPanel` now, I will add `fen` prop.
         // And I will update `AnalysisInterface` to pass it (I already edited it, but I can edit it again or just rely on `game` if it matches).
         // Wait, I missed adding `fen` to `AnalysisPanel` props in `AnalysisInterface` call.

         // Okay, `AnalysisInterface` passes `game`.
         // I'll assume `game` is the source of truth.
         // But if I browse history, `game` is not the current view.
         // I'll use a hack: `game` in `AnalysisInterface` is NOT updated on history click. `currentFen` is.
         // So `AnalysisPanel` analysis will be out of sync if I use `game.fen()`.

         // I MUST pass `currentFen` to `AnalysisPanel`.
         // I will edit `AnalysisInterface` again shortly or just now.
         // Actually, I can infer it? No.

         // Let's modify `AnalysisInterface` call in my plan. I'll do it.

         // For this file content, I'll add `fen` to props.
     }
  }, [game, isAnalyzing, depth, isReady, sendCommand]);

  // Wait, I can't easily change the prop signature without updating the parent.
  // I updated the parent `AnalysisInterface` in the previous step but I didn't add `fen` prop to `<AnalysisPanel ... />`.
  // I passed `game`.

  // Let's look at `AnalysisInterface` again.
  // It maintains `currentFen`.
  // I should have passed it.

  // I will update `AnalysisInterface` again after this to pass `fen={currentFen}`.
  // For now I will write `AnalysisPanel` expecting `fen` prop.

  // Or... `AnalysisPanel` can reconstruct it.
  // `game` has history.
  // `currentMoveIndex`.
  // `new Chess()` -> make moves 0 to index -> get fen.
  // This is safe.

  const getAnalysisFen = () => {
      if (currentMoveIndex === -1) return game.fen();
      const g = new Chess();
      // Load PGN header?
      // Just make moves.
      const history = game.history({ verbose: true });
      for (let i = 0; i <= currentMoveIndex; i++) {
          if (history[i]) {
            g.move(history[i]);
          }
      }
      return g.fen();
  };

  useEffect(() => {
     if (isReady && isAnalyzing) {
         const fen = getAnalysisFen();
         sendCommand('stop');
         sendCommand(`position fen ${fen}`);
         sendCommand(`setoption name MultiPV value 3`);
         sendCommand(`go depth ${depth}`);
     } else {
         sendCommand('stop');
     }
  }, [game, currentMoveIndex, isAnalyzing, depth, isReady, sendCommand]);

  return (
    <div className="flex flex-col h-full bg-[#262522]">
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
                <button className="p-1.5 rounded text-gray-400 hover:text-white bg-[#302e2b]">
                    <Settings className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Engine Lines */}
        {isAnalyzing && (
            <div className="p-2 bg-[#211f1c] border-b border-white/5 min-h-[100px] font-mono text-xs overflow-y-auto max-h-[150px]">
                 {lines.length === 0 ? (
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
                         const san = uciLineToSan(getAnalysisFen(), line.pv);

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
            analysisData={undefined} // Pass classifications later
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
