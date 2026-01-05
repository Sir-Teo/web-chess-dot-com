import React, { useEffect, useState, useRef } from 'react';
import { Search, Star, HelpCircle, Loader2, BookOpen, ThumbsUp, Check, AlertCircle, XCircle, AlertTriangle, RefreshCcw } from 'lucide-react';
import { analyzeGame, GameReviewData, MoveAnalysis } from '../utils/gameAnalysis';
import { identifyOpening } from '../utils/openings';

interface GameReviewPanelProps {
    pgn?: string;
    existingData?: GameReviewData | null;
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

    return (
        <div className="w-full h-[80px] bg-[#302e2b] relative mb-2 border-b border-white/5 overflow-hidden cursor-pointer group"
             onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const x = e.clientX - rect.left;
                 const percentage = Math.max(0, Math.min(1, x / rect.width));
                 const index = Math.round(percentage * (moves.length - 1));
                 // currentMoveIndex is 1-based (moves[0] is index 1). Index 0 from click means first move.
                 if (onMoveSelect) onMoveSelect(index + 1);
             }}
        >
             <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full h-full pointer-events-none">
                 {/* Background Gradient */}
                 <defs>
                     <linearGradient id="graphGradient" x1="0" x2="0" y1="0" y2="1">
                         <stop offset="0%" stopColor="#ffffff" stopOpacity="0.05" />
                         <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
                         <stop offset="100%" stopColor="#000000" stopOpacity="0.05" />
                     </linearGradient>
                 </defs>
                 <rect x="0" y="0" width="100" height={height} fill="url(#graphGradient)" />

                 {/* Center Line */}
                 <line x1="0" y1={height/2} x2="100" y2={height/2} stroke="#ffffff" strokeOpacity="0.1" strokeWidth="0.5" />

                 {/* Area under curve (white advantage) */}
                 <polygon
                    points={`0,${height/2} ${points} 100,${height/2}`}
                    fill="#ffffff"
                    fillOpacity="0.05"
                 />

                 {/* Graph Line */}
                 <polyline
                    points={points}
                    fill="none"
                    stroke="#81b64c"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
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
  <div className="grid grid-cols-[1fr_auto_1fr] items-center py-1 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer rounded px-2">
    <div className={`text-right font-bold text-xs ${p1Value > 0 ? 'text-gray-200' : 'text-gray-600'}`}>{p1Value}</div>
    <div className="flex justify-center w-8" title={label}>
       {icon}
    </div>
    <div className={`text-left font-bold text-xs ${p2Value > 0 ? 'text-gray-200' : 'text-gray-600'}`}>{p2Value}</div>
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

const GameReviewPanel: React.FC<GameReviewPanelProps> = ({ pgn, existingData, onStartReview, onMoveSelect, onRetry, onAnalysisComplete, currentMoveIndex = -1 }) => {
  const [data, setData] = useState<GameReviewData | null>(existingData || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const analysisAbortController = useRef<AbortController | null>(null);

  useEffect(() => {
      if (existingData) {
          setData(existingData);
          return;
      }

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
  }, [pgn, existingData]);

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

  // Key Moments Navigation
  const keyMomentIndices = data?.moves.reduce((acc, move, idx) => {
      if (['blunder', 'mistake', 'missed-win'].includes(move.classification)) {
          acc.push(idx + 1); // 1-based index
      }
      return acc;
  }, [] as number[]) || [];

  const handleNextKeyMoment = () => {
      if (!onMoveSelect || keyMomentIndices.length === 0) return;
      const next = keyMomentIndices.find(idx => idx > currentMoveIndex);
      if (next) onMoveSelect(next);
      else onMoveSelect(keyMomentIndices[0]); // Loop or stop? Let's loop.
  };

  const handlePrevKeyMoment = () => {
      if (!onMoveSelect || keyMomentIndices.length === 0) return;
      // find last index < current
      const prev = [...keyMomentIndices].reverse().find(idx => idx < currentMoveIndex);
      if (prev) onMoveSelect(prev);
      else onMoveSelect(keyMomentIndices[keyMomentIndices.length - 1]);
  };

  return (
    <div className="flex flex-col h-full bg-[#262522] text-[#c3c3c3]">
      {/* Header */}
      <div className="flex flex-col border-b border-black/20 shadow-sm bg-[#211f1c]">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gray-700 flex items-center justify-center text-white">
                <Star className="w-3 h-3 fill-current" />
              </div>
              <h2 className="font-bold text-white text-base">Game Review</h2>
            </div>
          </div>

          {/* Opening Name */}
          {!isAnalyzing && openingName && (
              <div className="px-4 py-1 pb-2 text-[10px] text-gray-400 font-medium flex justify-between items-center">
                  <span>Opening: <span className="text-white">{openingName}</span></span>
                  {keyMomentIndices.length > 0 && (
                      <div className="flex gap-1">
                          <button onClick={handlePrevKeyMoment} className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-[9px] text-gray-300">Prev</button>
                          <button onClick={handleNextKeyMoment} className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-[9px] text-gray-300">Next</button>
                      </div>
                  )}
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
              <Loader2 className="w-8 h-8 text-chess-green animate-spin" />
              <div className="text-lg font-bold text-white">Analyzing...</div>
              <div className="w-48 bg-[#1b1a19] rounded-full h-1.5 overflow-hidden">
                <div
                    className="bg-chess-green h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                ></div>
              </div>
          </div>
      )}

      {!isAnalyzing && data && (
      <div className="flex-1 overflow-y-auto custom-scrollbar" ref={scrollRef}>
        
        {/* Coach Bubble */}
        <div className="p-3 flex gap-3">
            <div className="shrink-0 relative">
                <img 
                    src="https://www.chess.com/bundles/web/images/coach/marty.png" 
                    alt="Coach" 
                    className="w-10 h-10 rounded-lg object-cover bg-gray-600 shadow"
                    onError={(e) => (e.currentTarget.src = 'https://www.chess.com/bundles/web/images/user-image.svg')} 
                />
            </div>
            <div className="bg-white text-[#2b2926] p-2.5 rounded-lg rounded-tl-none text-sm leading-snug shadow-sm relative font-medium w-full">
                <div className="absolute top-0 left-[-6px] w-0 h-0 border-t-[8px] border-t-white border-l-[8px] border-l-transparent drop-shadow-sm"></div>
                {currentMoveAnalysis ? (
                     <div className="flex flex-col gap-1.5">
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
                                className="self-start bg-chess-green hover:bg-chess-greenHover text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 transition-colors shadow-sm"
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
        <div className="grid grid-cols-2 gap-2 px-3 py-1 mb-2">
            <div className="flex flex-col items-center bg-[#211f1c] rounded p-2 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                     <div className="w-6 h-6 rounded bg-gray-600"></div>
                     <span className="text-[10px] font-bold text-gray-400 uppercase">White</span>
                </div>
                <div className="text-2xl font-black text-white leading-none">
                    {data.accuracy.w}
                </div>
                <span className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">Accuracy</span>
            </div>
            <div className="flex flex-col items-center bg-[#211f1c] rounded p-2 border border-white/5">
                 <div className="flex items-center gap-2 mb-1">
                     <div className="w-6 h-6 rounded bg-black border border-gray-600"></div>
                     <span className="text-[10px] font-bold text-gray-400 uppercase">Black</span>
                </div>
                <div className="text-2xl font-black text-white leading-none">
                    {data.accuracy.b}
                </div>
                <span className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">Accuracy</span>
            </div>
        </div>

        <div className="h-px bg-white/5 mx-3 my-1"></div>

        {/* Stats Grid */}
        <div className="px-2 pb-4 space-y-0.5">
            <MoveStatRow 
                label="Brilliant" 
                p1Value={countMoves('brilliant', 'w')} p2Value={countMoves('brilliant', 'b')}
                colorClass="text-[#1baca6]"
                icon={<div className="w-4 h-4 rounded-full bg-[#1baca6] flex items-center justify-center text-white font-black text-[9px] shadow-sm">!!</div>}
            />
            <MoveStatRow 
                label="Great" 
                p1Value={countMoves('great', 'w')} p2Value={countMoves('great', 'b')}
                colorClass="text-[#5c8bb0]"
                icon={<div className="w-4 h-4 rounded-full bg-[#5c8bb0] flex items-center justify-center text-white font-black text-[9px] shadow-sm">!</div>}
            />
            <MoveStatRow 
                label="Best" 
                p1Value={countMoves('best', 'w')} p2Value={countMoves('best', 'b')}
                colorClass="text-[#95b776]"
                icon={<div className="w-4 h-4 rounded-full bg-[#95b776] flex items-center justify-center text-white shadow-sm"><Star className="w-2.5 h-2.5 fill-white" /></div>}
            />
            <MoveStatRow 
                label="Mistake" 
                p1Value={countMoves('mistake', 'w')} p2Value={countMoves('mistake', 'b')}
                colorClass="text-[#e6912c]"
                icon={<div className="w-4 h-4 rounded-full bg-[#e6912c] flex items-center justify-center text-white font-black text-[9px] shadow-sm">?</div>}
            />
            <MoveStatRow 
                label="Blunder" 
                p1Value={countMoves('blunder', 'w')} p2Value={countMoves('blunder', 'b')}
                colorClass="text-[#fa412d]"
                icon={<div className="w-4 h-4 rounded-full bg-[#fa412d] flex items-center justify-center text-white font-black text-[9px] shadow-sm">??</div>}
            />
             <MoveStatRow
                label="Missed Win"
                p1Value={countMoves('missed-win', 'w')} p2Value={countMoves('missed-win', 'b')}
                colorClass="text-[#fa412d]"
                icon={<div className="w-4 h-4 rounded bg-[#fa412d] flex items-center justify-center text-white font-black text-[9px] shadow-sm">M</div>}
            />
        </div>

        {/* Moves List with Analysis */}
        <div className="mt-2 border-t border-white/10 pt-2">
            <h3 className="px-4 text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wider">Move by Move</h3>
            <div className="flex flex-col">
                {moveRows.map((row, i) => (
                    <div key={i} className="flex text-sm py-0.5 hover:bg-white/5">
                        <div className="w-8 flex items-center justify-center text-gray-500 font-mono text-xs">{row.moveNumber}.</div>

                        {/* White Move */}
                        {row.w && (
                            <button
                                onClick={() => onMoveSelect && onMoveSelect(i * 2 + 1)}
                                className={`flex-1 flex items-center justify-between gap-2 px-2 py-1 cursor-pointer rounded transition-colors mx-1
                                    ${currentMoveIndex === i * 2 + 1 ? 'ring-1 ring-white/20 bg-white/10' : ''}
                                    ${getClassificationColor(row.w.classification)}`}
                            >
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-white text-xs">{row.w.san}</span>
                                    <ClassificationIcon classification={row.w.classification} />
                                </div>
                                <span className="text-[9px] font-mono opacity-60">{getEvalDisplay(row.w)}</span>
                            </button>
                        )}

                        {/* Black Move */}
                        {row.b ? (
                            <button
                                onClick={() => onMoveSelect && onMoveSelect(i * 2 + 2)}
                                className={`flex-1 flex items-center justify-between gap-2 px-2 py-1 cursor-pointer rounded transition-colors mx-1
                                    ${currentMoveIndex === i * 2 + 2 ? 'ring-1 ring-white/20 bg-white/10' : ''}
                                    ${getClassificationColor(row.b.classification)}`}
                            >
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-white text-xs">{row.b.san}</span>
                                    <ClassificationIcon classification={row.b.classification} />
                                </div>
                                <span className="text-[9px] font-mono opacity-60">{getEvalDisplay(row.b)}</span>
                            </button>
                        ) : (
                            <div className="flex-1 mx-1"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>

      </div>
      )}

      {/* Footer Button */}
      {!isAnalyzing && (
      <div className="p-3 bg-[#211f1c] border-t border-black/20">
        <button
            onClick={onStartReview}
            className="w-full bg-[#81b64c] hover:bg-[#a3d160] text-white font-bold text-lg py-2.5 rounded shadow-[0_4px_0_0_#457524] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center relative top-[-2px]"
        >
            Review Moves
        </button>
      </div>
      )}
    </div>
  );
};

export default GameReviewPanel;
