import React, { useState, useEffect } from 'react';
import { Trophy, XCircle, ChevronLeft, ChevronRight, AlertTriangle, Crosshair, CheckCircle, Search } from 'lucide-react';
import { analyzeGame, GameReviewData, MoveAnalysis } from '../src/utils/gameAnalysis';

import { Chess } from 'chess.js';

interface GameReviewPanelProps {
  pgn: string;
  onStartReview: () => void;
  onAnalysisComplete?: (data: GameReviewData) => void;
  existingData?: GameReviewData;
  currentMoveIndex?: number; // To highlight key moments in list? Or navigate to them.
  onMoveClick?: (fen: string, index: number) => void;
}

const GameReviewPanel: React.FC<GameReviewPanelProps> = ({ pgn, onStartReview, onAnalysisComplete, existingData, onMoveClick }) => {
  const [reviewState, setReviewState] = useState<'idle' | 'analyzing' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState<GameReviewData | null>(null);

  // Stats
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
      setBlunders(reviewData.moves.filter(m => m.classification === 'blunder'));
      setMistakes(reviewData.moves.filter(m => m.classification === 'mistake'));
      setMissedWins(reviewData.moves.filter(m => m.classification === 'forced')); // Assuming 'forced' or 'missed-win' logic
  };

  const handleMomentClick = (moments: MoveAnalysis[]) => {
      if (moments.length > 0 && onMoveClick) {
          // Reconstruct game to get FEN for the first moment
          // This is a bit inefficient to do every click, but robust
          const tempGame = new Chess();
          tempGame.loadPgn(pgn);
          const history = tempGame.history({ verbose: true });

          const targetIndex = moments[0].moveIndex;
          if (history[targetIndex]) {
               onMoveClick(history[targetIndex].after, targetIndex);
          }
      }
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

  return (
    <div className="flex flex-col h-full bg-[#262522] text-white">
        {/* Header */}
        <div className="p-4 bg-[#211f1c] border-b border-white/5 flex items-center justify-between">
            <h2 className="font-bold text-lg">Game Review</h2>
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
             <div className="flex-1 overflow-y-auto">
                 {/* Accuracy Score */}
                 <div className="p-6 flex flex-col items-center border-b border-white/5 bg-gradient-to-b from-[#262522] to-[#211f1c]">
                     <div className="text-sm text-gray-400 font-bold uppercase mb-2">Accuracy</div>
                     <div className="text-5xl font-black text-white mb-1">{data?.accuracy}%</div>
                     <div className="flex items-center gap-1 text-chess-green text-sm font-bold">
                         {data?.accuracy && data.accuracy >= 90 ? "Excellent" : data?.accuracy && data.accuracy >= 70 ? "Good" : "Inaccuracy"}
                     </div>
                 </div>

                 {/* Key Moments */}
                 <div className="p-4">
                     <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Key Moments</h4>
                     <div className="space-y-2">
                         <div
                            onClick={() => handleMomentClick(blunders)}
                            className="bg-[#211f1c] p-3 rounded border border-white/5 flex items-center justify-between cursor-pointer hover:bg-[#302e2b] transition-colors"
                         >
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-[#fa412d]/20 flex items-center justify-center">
                                     <XCircle className="w-5 h-5 text-[#fa412d]" />
                                 </div>
                                 <div>
                                     <div className="font-bold text-sm">{blunders.length} Blunders</div>
                                     <div className="text-xs text-gray-400">
                                         {blunders.length > 0 ? `Moves: ${blunders.map(b => Math.ceil((b.moveIndex + 1)/2)).join(', ')}` : 'None'}
                                     </div>
                                 </div>
                             </div>
                             <ChevronRight className="w-4 h-4 text-gray-500" />
                         </div>

                         <div
                            onClick={() => handleMomentClick(mistakes)}
                            className="bg-[#211f1c] p-3 rounded border border-white/5 flex items-center justify-center gap-3 cursor-pointer hover:bg-[#302e2b] transition-colors"
                         >
                              <div className="flex items-center gap-3 w-full">
                                 <div className="w-8 h-8 rounded-full bg-[#fea500]/20 flex items-center justify-center">
                                     <AlertTriangle className="w-5 h-5 text-[#fea500]" />
                                 </div>
                                 <div>
                                     <div className="font-bold text-sm">{mistakes.length} Mistakes</div>
                                     <div className="text-xs text-gray-400">
                                         {mistakes.length > 0 ? `Moves: ${mistakes.map(b => Math.ceil((b.moveIndex + 1)/2)).join(', ')}` : 'None'}
                                     </div>
                                 </div>
                             </div>
                             <ChevronRight className="w-4 h-4 text-gray-500" />
                         </div>

                         <div
                            onClick={() => handleMomentClick(missedWins)}
                            className="bg-[#211f1c] p-3 rounded border border-white/5 flex items-center justify-center gap-3 cursor-pointer hover:bg-[#302e2b] transition-colors"
                         >
                              <div className="flex items-center gap-3 w-full">
                                 <div className="w-8 h-8 rounded-full bg-[#ffc107]/20 flex items-center justify-center">
                                     <Crosshair className="w-5 h-5 text-[#ffc107]" />
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
