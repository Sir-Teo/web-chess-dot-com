import React, { useEffect, useState, useRef } from 'react';
import { Search, Star, HelpCircle, Loader2, BookOpen, ThumbsUp, Check, AlertCircle, XCircle, AlertTriangle, RefreshCcw } from 'lucide-react';
import { analyzeGame, GameReviewData, MoveAnalysis } from '../utils/gameAnalysis';
import { identifyOpening } from '../utils/openings';

interface GameReviewPanelProps {
    pgn?: string;
    onStartReview?: () => void;
    onMoveSelect?: (moveIndex: number) => void;
    onRetry?: (moveIndex: number) => void;
    onAnalysisComplete?: (data: GameReviewData) => void;
    currentMoveIndex?: number;
}

const EvaluationGraph: React.FC<{ moves: MoveAnalysis[], currentMoveIndex: number, onMoveSelect?: (index: number) => void }> = ({ moves, currentMoveIndex, onMoveSelect }) => {
    if (moves.length === 0) return null;

    const height = 60;
    const maxCp = 800;

    const getY = (evalCp: number | undefined, mate: number | undefined) => {
        let val = 0;
        if (mate !== undefined) {
             val = mate > 0 ? maxCp : -maxCp;
        } else {
             val = evalCp ?? 0;
        }

        // Clamp
        val = Math.max(-maxCp, Math.min(maxCp, val));
        const percent = (val + maxCp) / (2 * maxCp); // 0 to 1
        return height - (percent * height);
    };

    const points = moves.map((m, i) => {
        const x = (i / (moves.length - 1)) * 100; // Percent width
        const y = getY(m.eval, m.mate);
        return `${x},${y}`;
    }).join(' ');

    // Highlight current move
    const currentX = currentMoveIndex > 0 ? ((currentMoveIndex - 1) / (moves.length - 1)) * 100 : 0;

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (moves.length === 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        const percentage = x / width;
        const moveIndex = Math.round(percentage * (moves.length - 1));

        // Dispatch event to parent or use context?
        // The component is self-contained here, so we need a callback prop on EvaluationGraph or pass it down.
        // For now, let's assume we can trigger the select.
        // Since EvaluationGraph is internal, we need to modify its props.
    };

    return (
        <div className="w-full h-[60px] bg-[#302e2b] relative mb-2 border-b border-white/5 overflow-hidden cursor-pointer group"
             onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const x = e.clientX - rect.left;
                 const percentage = Math.max(0, Math.min(1, x / rect.width));
                 const index = Math.round(percentage * (moves.length - 1));
                 if (onMoveSelect) onMoveSelect(index + 1); // +1 because moves are 1-based or array is 0-based but UI might expect something else.
                 // Actually currentMoveIndex logic elsewhere seems to use 1-based (0 is start).
                 // Moves array is 0-based.
                 // If I click start (left), index 0. That corresponds to move 1?
                 // No, usually left is start of game.
                 // Let's assume index + 1 matches currentMoveIndex logic.
             }}
        >
             <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full h-full pointer-events-none">
                 {/* Center Line */}
                 <line x1="0" y1={height/2} x2="100" y2={height/2} stroke="#ffffff" strokeOpacity="0.1" strokeWidth="0.5" />

                 {/* Graph Line */}
                 <polyline
                    points={points}
                    fill="none"
                    stroke="#81b64c"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                 />

                 {/* Current Move Indicator Line */}
                 {currentMoveIndex > 0 && (
                     <line
                        x1={currentX} y1="0"
                        x2={currentX} y2={height}
                        stroke="white"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                        strokeDasharray="2,2"
                     />
                 )}

                 {/* Hover Line (Visual only) */}
                 <line
                    x1="0" y1="0" x2="0" y2={height}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ transform: `translateX(${currentX}%)` }} // Simple hack, real hover needs mouse tracking
                 />
             </svg>
        </div>
    );
};

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

const ClassificationIcon: React.FC<{ classification: MoveAnalysis['classification'] }> = ({ classification }) => {
    switch (classification) {
        case 'brilliant': return <div className="text-[#1baca6] font-black text-xs">!!</div>;
        case 'great': return <div className="text-[#5c8bb0] font-black text-xs">!</div>;
        case 'best': return <Star className="w-3 h-3 text-[#95b776] fill-current" />;
        case 'excellent': return <ThumbsUp className="w-3 h-3 text-[#96bc4b]" />;
        case 'good': return <Check className="w-3 h-3 text-[#96bc4b]" />;
        case 'inaccuracy': return <div className="text-[#f7c045] font-black text-xs">?!</div>;
        case 'mistake': return <div className="text-[#e6912c] font-black text-xs">?</div>;
        case 'blunder': return <div className="text-[#fa412d] font-black text-xs">??</div>;
        case 'missed-win': return <div className="bg-[#fa412d] w-4 h-4 rounded text-white flex items-center justify-center font-black text-[10px]">M</div>;
        case 'book': return <BookOpen className="w-3 h-3 text-[#a38d79]" />;
        default: return null;
    }
};

const getClassificationColor = (classification: MoveAnalysis['classification']) => {
    switch (classification) {
        case 'brilliant': return 'bg-[#1baca6]/20 text-[#1baca6]';
        case 'great': return 'bg-[#5c8bb0]/20 text-[#5c8bb0]';
        case 'best': return 'bg-[#95b776]/20 text-[#95b776]';
        case 'blunder': return 'bg-[#fa412d]/20 text-[#fa412d]';
        case 'missed-win': return 'bg-[#ff8f87]/20 text-[#fa412d]';
        case 'mistake': return 'bg-[#e6912c]/20 text-[#e6912c]';
        case 'inaccuracy': return 'bg-[#f7c045]/20 text-[#f7c045]';
        default: return 'hover:bg-white/5';
    }
}

const getEvalDisplay = (move: MoveAnalysis) => {
    if (move.mate !== undefined) {
        return `M${Math.abs(move.mate)}`;
    }
    if (move.eval !== undefined) {
        const val = move.eval / 100;
        return (val > 0 ? "+" : "") + val.toFixed(1);
    }
    return "";
}

const GameReviewPanel: React.FC<GameReviewPanelProps> = ({ pgn, onStartReview, onMoveSelect, onRetry, onAnalysisComplete, currentMoveIndex = -1 }) => {
  const [data, setData] = useState<GameReviewData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const analysisAbortController = useRef<AbortController | null>(null);

  useEffect(() => {
      if (!pgn) return;

      if (analysisAbortController.current) {
          analysisAbortController.current.abort();
      }
      analysisAbortController.current = new AbortController();

      const currentPgn = pgn;
      setIsAnalyzing(true);
      setProgress(0);
      setData(null);

      analyzeGame(pgn, (p) => setProgress(Math.round(p))).then(result => {
          if (currentPgn === pgn) {
             setData(result);
             setIsAnalyzing(false);
             if (onAnalysisComplete) {
                 onAnalysisComplete(result);
             }
          }
      }).catch(e => {
          console.error("Analysis failed", e);
          setIsAnalyzing(false);
      });

      return () => {};
  }, [pgn]);

  const countMoves = (classification: MoveAnalysis['classification'], color: 'w' | 'b') => {
      if (!data) return 0;
      return data.moves.filter(m => m.classification === classification && m.color === color).length;
  };

  const moveRows: { moveNumber: number, w?: MoveAnalysis, b?: MoveAnalysis }[] = [];
  if (data) {
      for (let i = 0; i < data.moves.length; i += 2) {
          moveRows.push({
              moveNumber: Math.floor(i / 2) + 1,
              w: data.moves[i],
              b: data.moves[i + 1]
          });
      }
  }

  // Determine current move for feedback
  const currentMoveAnalysis = data?.moves[currentMoveIndex - 1];
  const isBadMove = currentMoveAnalysis && ['blunder', 'mistake', 'inaccuracy', 'missed-win'].includes(currentMoveAnalysis.classification);

  const openingName = pgn ? identifyOpening(pgn) : "";

  return (
    <div className="flex flex-col h-full bg-[#262522] text-[#c3c3c3]">
      {/* Header */}
      <div className="flex flex-col border-b border-black/20 shadow-sm bg-[#211f1c]">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <h2 className="font-bold text-white text-lg">Game Review</h2>
            </div>
            <button className="text-gray-500 hover:text-white transition-colors">
                <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Opening Name */}
          {!isAnalyzing && openingName && (
              <div className="px-4 py-1 pb-2 text-xs text-gray-400 font-medium">
                  Opening: <span className="text-white">{openingName}</span>
              </div>
          )}

          {/* Graph */}
          {!isAnalyzing && data && (
              <EvaluationGraph
                  moves={data.moves}
                  currentMoveIndex={currentMoveIndex}
                  onMoveSelect={onMoveSelect}
              />
          )}
      </div>

      {isAnalyzing && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-chess-green animate-spin" />
              <div className="text-xl font-bold text-white">Analyzing Game...</div>
              <p className="text-gray-500">Stockfish is reviewing your moves</p>

              <div className="w-full bg-[#1b1a19] rounded-full h-2.5 mt-2 overflow-hidden">
                <div
                    className="bg-chess-green h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-400 font-mono">{progress}%</span>
          </div>
      )}

      {!isAnalyzing && data && (
      <div className="flex-1 overflow-y-auto custom-scrollbar" ref={scrollRef}>
        
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
            <div className="bg-white text-[#2b2926] p-3 rounded-xl rounded-tl-none text-[15px] leading-snug shadow-md relative font-medium w-full">
                <div className="absolute top-0 left-[-8px] w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent drop-shadow-sm"></div>
                {currentMoveAnalysis ? (
                     <div className="flex flex-col gap-2">
                         <span>
                             <span className="font-bold capitalize">{currentMoveAnalysis.classification.replace('-', ' ')}</span>
                             {currentMoveAnalysis.classification === 'best' || currentMoveAnalysis.classification === 'great' || currentMoveAnalysis.classification === 'brilliant'
                                ? "! "
                                : ". "}
                             {currentMoveAnalysis.reason}
                         </span>
                         {isBadMove && onRetry && (
                             <button
                                onClick={() => onRetry(currentMoveIndex)}
                                className="self-start bg-chess-green hover:bg-chess-greenHover text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
                             >
                                 <RefreshCcw className="w-3 h-3" />
                                 Retry
                             </button>
                         )}
                     </div>
                ) : (
                    data.accuracy.w > 80 ? "Great job! You played very accurately." : "There were some missed opportunities, let's review them."
                )}
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
                label="Missed Win"
                p1Value={countMoves('missed-win', 'w')} p2Value={countMoves('missed-win', 'b')}
                colorClass="text-[#fa412d]"
                icon={<div className="w-5 h-5 rounded bg-[#fa412d] flex items-center justify-center text-white font-black text-[10px] shadow-sm">M</div>}
            />
        </div>

        {/* Moves List with Analysis */}
        <div className="mt-4 border-t border-white/10 pt-2">
            <h3 className="px-4 text-xs font-bold text-gray-500 uppercase mb-2">Move by Move</h3>
            <div className="flex flex-col">
                {moveRows.map((row, i) => (
                    <div key={i} className="flex text-sm py-0.5 hover:bg-white/5">
                        <div className="w-10 flex items-center justify-center text-gray-500 font-mono text-xs">{row.moveNumber}.</div>

                        {/* White Move */}
                        {row.w && (
                            <button
                                onClick={() => onMoveSelect && onMoveSelect(i * 2 + 1)}
                                className={`flex-1 flex items-center justify-between gap-2 px-2 py-1 cursor-pointer rounded transition-colors
                                    ${currentMoveIndex === i * 2 + 1 ? 'ring-2 ring-white/50 bg-white/10' : ''}
                                    ${getClassificationColor(row.w.classification)}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">{row.w.san}</span>
                                    <ClassificationIcon classification={row.w.classification} />
                                </div>
                                <span className="text-[10px] font-mono opacity-70">{getEvalDisplay(row.w)}</span>
                            </button>
                        )}

                        {/* Black Move */}
                        {row.b ? (
                            <button
                                onClick={() => onMoveSelect && onMoveSelect(i * 2 + 2)}
                                className={`flex-1 flex items-center justify-between gap-2 px-2 py-1 cursor-pointer rounded transition-colors
                                    ${currentMoveIndex === i * 2 + 2 ? 'ring-2 ring-white/50 bg-white/10' : ''}
                                    ${getClassificationColor(row.b.classification)}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">{row.b.san}</span>
                                    <ClassificationIcon classification={row.b.classification} />
                                </div>
                                <span className="text-[10px] font-mono opacity-70">{getEvalDisplay(row.b)}</span>
                            </button>
                        ) : (
                            <div className="flex-1"></div>
                        )}
                    </div>
                ))}
            </div>
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
