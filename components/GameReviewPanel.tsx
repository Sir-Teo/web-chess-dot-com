
import React, { useState, useEffect } from 'react';
import { Trophy, XCircle, ChevronLeft, ChevronRight, AlertTriangle, Crosshair, CheckCircle, Search, BookOpen, Star, ThumbsUp, Zap } from 'lucide-react';
import { analyzeGame, GameReviewData, MoveAnalysis } from '../src/utils/gameAnalysis';
import EvaluationGraph from './EvaluationGraph';
import MoveClassificationIcon from './MoveClassificationIcon';

import { Chess } from 'chess.js';

interface GameReviewPanelProps {
  pgn: string;
  onStartReview: () => void;
  onAnalysisComplete?: (data: GameReviewData) => void;
  existingData?: GameReviewData;
  currentMoveIndex?: number; // To highlight key moments in list? Or navigate to them.
  onMoveClick?: (fen: string, index: number) => void;
  onRetry?: (fen: string, moveIndex: number, bestMove: string) => void;
}

const GameReviewPanel: React.FC<GameReviewPanelProps> = ({ pgn, onStartReview, onAnalysisComplete, existingData, onMoveClick, onRetry, currentMoveIndex }) => {
  const [reviewState, setReviewState] = useState<'idle' | 'analyzing' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState<GameReviewData | null>(null);

  // Stats Breakdown
  const [stats, setStats] = useState({
      brilliant: 0,
      great: 0,
      best: 0,
      good: 0,
      book: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
      forced: 0
  });

  const [blunders, setBlunders] = useState<MoveAnalysis[]>([]);
  const [mistakes, setMistakes] = useState<MoveAnalysis[]>([]);
  const [missedWins, setMissedWins] = useState<MoveAnalysis[]>([]);

  useEffect(() => {
      if (existingData) {
          setData(existingData);
          processStats(existingData);
          setReviewState('complete');
      }
  }, [existingData]);

  const processStats = (reviewData: GameReviewData) => {
      const counts = {
          brilliant: 0,
          great: 0,
          best: 0,
          good: 0,
          book: 0,
          inaccuracy: 0,
          mistake: 0,
          blunder: 0,
          forced: 0
      };

      reviewData.moves.forEach(m => {
          if (counts[m.classification] !== undefined) {
              counts[m.classification]++;
          }
      });
      setStats(counts);

      setBlunders(reviewData.moves.filter(m => m.classification === 'blunder'));
      setMistakes(reviewData.moves.filter(m => m.classification === 'mistake'));
      setMissedWins(reviewData.moves.filter(m => m.classification === 'forced'));
  };

  const handleMomentClick = (moments: MoveAnalysis[]) => {
      if (moments.length > 0 && onMoveClick) {
          const tempGame = new Chess();
          tempGame.loadPgn(pgn);
          const history = tempGame.history({ verbose: true });

          const targetIndex = moments[0].moveIndex;
          if (history[targetIndex]) {
               // Show result AFTER the mistake
               onMoveClick(history[targetIndex].after, targetIndex);
          }
      }
  };

  const handleRetryClick = (e: React.MouseEvent, moment: MoveAnalysis) => {
      e.stopPropagation();
      if (!onRetry) return;

      const tempGame = new Chess();
      tempGame.loadPgn(pgn);
      const history = tempGame.history({ verbose: true });

      // We want the position BEFORE the mistake
      const targetIndex = moment.moveIndex;
      const fenBefore = targetIndex === 0
           ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
           : history[targetIndex - 1].after;

      onRetry(fenBefore, targetIndex, moment.bestMove);
  };

  const handleStartReview = async () => {
      setReviewState('analyzing');
      setProgress(0);
      try {
          const result = await analyzeGame(pgn, (curr, total) => {
              setProgress(Math.round((curr / total) * 100));
          });
          setData(result);
          processStats(result);
          setReviewState('complete');
          if (onAnalysisComplete) {
              onAnalysisComplete(result);
          }
          onStartReview();
      } catch (e) {
          console.error("Analysis Failed", e);
          setReviewState('idle');
      }
  };

  const renderStatBar = (label: string, count: number, color: string, icon: React.ReactNode) => (
      <div className="flex items-center gap-2 mb-1">
          <div className={`w-6 h-6 rounded flex items-center justify-center ${color} bg-opacity-20`}>
              {icon}
          </div>
          <div className="flex-1">
              <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-300 font-medium">{label}</span>
                  <span className="font-bold text-white">{count}</span>
              </div>
              <div className="h-1.5 w-full bg-[#383531] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${data ? (count / Math.max(1, data.moves.length)) * 100 : 0}%` }}
                  />
              </div>
          </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#262522] text-white">
        {/* Header */}
        <div className="p-4 bg-[#211f1c] border-b border-white/5 flex items-center justify-between shrink-0">
            <h2 className="font-bold text-lg">Game Review</h2>
            {data && <div className="text-xs text-gray-400">{data.moves.length} moves</div>}
        </div>

        {reviewState === 'idle' && !existingData ? (
             <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                 <div className="w-20 h-20 bg-[#383531] rounded-full flex items-center justify-center mb-4 shadow-inner">
                     <Search className="w-10 h-10 text-chess-green" />
                 </div>
                 <h3 className="text-xl font-bold mb-2">Review Your Game</h3>
                 <p className="text-gray-400 text-sm mb-6">
                     Find out where you made mistakes and learn how to improve.
                 </p>
                 <button
                    onClick={handleStartReview}
                    className="bg-chess-green hover:bg-chess-greenHover text-white font-bold py-3 px-8 rounded-lg shadow-lg w-full transition-transform active:scale-95"
                 >
                     Start Review
                 </button>
             </div>
        ) : reviewState === 'analyzing' ? (
             <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                 <div className="w-16 h-16 relative flex items-center justify-center mb-4">
                     <div className="absolute inset-0 border-4 border-[#383531] rounded-full"></div>
                     <div
                        className="absolute inset-0 border-4 border-chess-green rounded-full border-t-transparent animate-spin"
                     ></div>
                 </div>
                 <h3 className="text-lg font-bold">Analyzing...</h3>
                 <p className="text-gray-400 text-sm mb-2">Stockfish is checking your moves</p>
                 <div className="text-2xl font-black text-white">{progress}%</div>
             </div>
        ) : (
             <div className="flex-1 overflow-y-auto custom-scrollbar">
                 {/* Evaluation Graph */}
                 {data && (
                     <div className="shrink-0 h-32 bg-[#211f1c] border-b border-white/5">
                        <EvaluationGraph
                            moves={data.moves}
                            currentMoveIndex={currentMoveIndex !== undefined ? currentMoveIndex : -1}
                            onMoveClick={(idx) => {
                                if (onMoveClick && data) {
                                    const tempGame = new Chess();
                                    tempGame.loadPgn(pgn);
                                    const history = tempGame.history({ verbose: true });
                                    if (history[idx]) {
                                        onMoveClick(history[idx].after, idx);
                                    }
                                }
                            }}
                        />
                     </div>
                 )}

                 {/* Accuracy Score */}
                 <div className="p-4 flex flex-col items-center border-b border-white/5 bg-gradient-to-b from-[#262522] to-[#211f1c]">
                     <div className="text-xs text-gray-400 font-bold uppercase mb-1">Accuracy</div>
                     <div className="text-6xl font-black text-white mb-1 tracking-tighter">{data?.accuracy}</div>
                     <div className={`text-sm font-bold ${data?.accuracy && data.accuracy >= 90 ? "text-green-400" : "text-yellow-400"}`}>
                         {data?.accuracy && data.accuracy >= 90 ? "Excellent" : data?.accuracy && data.accuracy >= 70 ? "Good" : "Inaccuracy"}
                     </div>
                 </div>

                 {/* Classification Breakdown */}
                 <div className="p-4 border-b border-white/5">
                     <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Move Breakdown</h4>
                     <div className="space-y-2">
                         {renderStatBar("Brilliant", stats.brilliant, "text-teal-400 bg-teal-400", <Zap className="w-3 h-3" />)}
                         {renderStatBar("Great", stats.great, "text-blue-400 bg-blue-400", <Star className="w-3 h-3" />)}
                         {renderStatBar("Best", stats.best, "text-green-500 bg-green-500", <CheckCircle className="w-3 h-3" />)}
                         {renderStatBar("Excellent", stats.good, "text-green-300 bg-green-300", <ThumbsUp className="w-3 h-3" />)}
                         {renderStatBar("Book", stats.book, "text-amber-700 bg-amber-700", <BookOpen className="w-3 h-3" />)}
                         {renderStatBar("Inaccuracy", stats.inaccuracy, "text-yellow-400 bg-yellow-400", <AlertTriangle className="w-3 h-3" />)}
                         {renderStatBar("Mistake", stats.mistake, "text-orange-400 bg-orange-400", <AlertTriangle className="w-3 h-3" />)}
                         {renderStatBar("Blunder", stats.blunder, "text-red-500 bg-red-500", <XCircle className="w-3 h-3" />)}
                         {renderStatBar("Missed Win", stats.forced, "text-pink-500 bg-pink-500", <Crosshair className="w-3 h-3" />)}
                     </div>
                 </div>

                 {/* Key Moments */}
                 <div className="p-4">
                     <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Key Moments</h4>
                     <div className="space-y-2">
                         {/* Detailed List for Blunders to allow individual Retry */}
                         <div className="space-y-1">
                             {blunders.map((b, i) => (
                                 <div
                                     key={i}
                                     onClick={() => handleMomentClick([b])}
                                     className="bg-[#211f1c] p-2 rounded border border-white/5 flex items-center justify-between cursor-pointer hover:bg-[#302e2b] transition-colors group"
                                 >
                                     <div className="flex items-center gap-3">
                                         <div className="w-6 h-6 rounded-full bg-[#fa412d]/20 flex items-center justify-center">
                                             <XCircle className="w-3 h-3 text-[#fa412d]" />
                                         </div>
                                         <div className="text-xs font-bold text-gray-300">
                                             Move {Math.ceil((b.moveIndex + 1) / 2)}
                                         </div>
                                     </div>
                                     <button
                                         onClick={(e) => handleRetryClick(e, b)}
                                         className="opacity-0 group-hover:opacity-100 bg-[#383531] hover:bg-chess-green text-white text-[10px] px-2 py-1 rounded transition-all"
                                     >
                                         Retry
                                     </button>
                                 </div>
                             ))}
                             {blunders.length === 0 && (
                                <div className="text-center text-xs text-gray-500 py-2">No Blunders</div>
                             )}
                         </div>

                         <div className="my-2 border-t border-white/5"></div>

                         <div className="space-y-1">
                             {mistakes.map((b, i) => (
                                 <div
                                     key={i}
                                     onClick={() => handleMomentClick([b])}
                                     className="bg-[#211f1c] p-2 rounded border border-white/5 flex items-center justify-between cursor-pointer hover:bg-[#302e2b] transition-colors group"
                                 >
                                     <div className="flex items-center gap-3">
                                         <div className="w-6 h-6 rounded-full bg-[#fea500]/20 flex items-center justify-center">
                                             <AlertTriangle className="w-3 h-3 text-[#fea500]" />
                                         </div>
                                         <div className="text-xs font-bold text-gray-300">
                                             Move {Math.ceil((b.moveIndex + 1) / 2)}
                                         </div>
                                     </div>
                                     <button
                                         onClick={(e) => handleRetryClick(e, b)}
                                         className="opacity-0 group-hover:opacity-100 bg-[#383531] hover:bg-chess-green text-white text-[10px] px-2 py-1 rounded transition-all"
                                     >
                                         Retry
                                     </button>
                                 </div>
                             ))}
                             {mistakes.length === 0 && (
                                <div className="text-center text-xs text-gray-500 py-2">No Mistakes</div>
                             )}
                         </div>

                         {missedWins.length > 0 && (
                             <>
                                 <div className="my-2 border-t border-white/5"></div>
                                 <div
                                    onClick={() => handleMomentClick(missedWins)}
                                    className="bg-[#211f1c] p-3 rounded border border-white/5 flex items-center justify-center gap-3 cursor-pointer hover:bg-[#302e2b] transition-colors"
                                 >
                                      <div className="flex items-center gap-3 w-full">
                                         <div className="w-8 h-8 rounded-full bg-[#ec4899]/20 flex items-center justify-center">
                                             <Crosshair className="w-5 h-5 text-[#ec4899]" />
                                         </div>
                                         <div>
                                             <div className="font-bold text-sm">{missedWins.length} Missed Wins</div>
                                             <div className="text-xs text-gray-400">
                                                 {missedWins.length > 0 ? `Moves: ${missedWins.map(b => Math.ceil((b.moveIndex + 1)/2)).join(', ')}` : 'None'}
                                             </div>
                                         </div>
                                     </div>
                                     <ChevronRight className="w-4 h-4 text-gray-500" />
                                 </div>
                             </>
                         )}
                     </div>
                 </div>

                 {/* Retake / Retry Button? */}
                  <div className="p-4">
                     <button
                        onClick={handleStartReview}
                        className="w-full py-2 bg-[#302e2b] hover:bg-[#3d3a36] text-gray-300 hover:text-white rounded font-bold text-sm transition-colors"
                     >
                         Re-Analyze Game
                     </button>
                 </div>
             </div>
        )}
    </div>
  );
};

export default GameReviewPanel;
