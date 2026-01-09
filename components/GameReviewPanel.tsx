import React, { useState } from 'react';
import { Trophy, XCircle, ChevronLeft, ChevronRight, AlertTriangle, Crosshair } from 'lucide-react';

interface GameReviewPanelProps {
  pgn: string;
  onStartReview: () => void;
  onAnalysisComplete?: (data: any) => void;
  existingData?: any;
}

const GameReviewPanel: React.FC<GameReviewPanelProps> = ({ pgn, onStartReview, existingData }) => {
  const [reviewState, setReviewState] = useState<'idle' | 'analyzing' | 'complete'>('idle');

  // Mock Accuracy for now
  const accuracy = 82.5;

  return (
    <div className="flex flex-col h-full bg-[#262522] text-white">
        {/* Header */}
        <div className="p-4 bg-[#211f1c] border-b border-white/5 flex items-center justify-between">
            <h2 className="font-bold text-lg">Game Review</h2>
        </div>

        {reviewState === 'idle' && !existingData ? (
             <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                 <div className="w-20 h-20 bg-[#383531] rounded-full flex items-center justify-center mb-4 shadow-inner">
                     <Trophy className="w-10 h-10 text-chess-green" />
                 </div>
                 <h3 className="text-xl font-bold mb-2">Review Your Game</h3>
                 <p className="text-gray-400 text-sm mb-6">
                     Find out where you made mistakes and learn how to improve.
                 </p>
                 <button
                    onClick={() => {
                        setReviewState('analyzing');
                        // Mock analysis delay
                        setTimeout(() => {
                            setReviewState('complete');
                            onStartReview();
                        }, 2000);
                    }}
                    className="bg-chess-green hover:bg-chess-greenHover text-white font-bold py-3 px-8 rounded-lg shadow-lg w-full transition-transform active:scale-95"
                 >
                     Start Review
                 </button>
             </div>
        ) : reviewState === 'analyzing' ? (
             <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                 <div className="w-16 h-16 border-4 border-chess-green border-t-transparent rounded-full animate-spin mb-4"></div>
                 <h3 className="text-lg font-bold">Analyzing...</h3>
                 <p className="text-gray-400 text-sm">Stockfish is checking your moves</p>
             </div>
        ) : (
             <div className="flex-1 overflow-y-auto">
                 {/* Accuracy Score */}
                 <div className="p-6 flex flex-col items-center border-b border-white/5 bg-gradient-to-b from-[#262522] to-[#211f1c]">
                     <div className="text-sm text-gray-400 font-bold uppercase mb-2">Accuracy</div>
                     <div className="text-5xl font-black text-white mb-1">{accuracy}%</div>
                     <div className="flex items-center gap-1 text-chess-green text-sm font-bold">
                         <span>Excellent</span>
                     </div>
                 </div>

                 {/* Key Moments */}
                 <div className="p-4">
                     <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Key Moments</h4>
                     <div className="space-y-2">
                         <div className="bg-[#211f1c] p-3 rounded border border-white/5 flex items-center justify-between cursor-pointer hover:bg-[#302e2b] transition-colors">
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-[#fa412d]/20 flex items-center justify-center">
                                     <XCircle className="w-5 h-5 text-[#fa412d]" />
                                 </div>
                                 <div>
                                     <div className="font-bold text-sm">2 Blunders</div>
                                     <div className="text-xs text-gray-400">Move 12, 24</div>
                                 </div>
                             </div>
                             <ChevronRight className="w-4 h-4 text-gray-500" />
                         </div>

                         <div className="bg-[#211f1c] p-3 rounded border border-white/5 flex items-center justify-center gap-3 cursor-pointer hover:bg-[#302e2b] transition-colors">
                              <div className="flex items-center gap-3 w-full">
                                 <div className="w-8 h-8 rounded-full bg-[#fea500]/20 flex items-center justify-center">
                                     <AlertTriangle className="w-5 h-5 text-[#fea500]" />
                                 </div>
                                 <div>
                                     <div className="font-bold text-sm">3 Mistakes</div>
                                     <div className="text-xs text-gray-400">Move 8, 15, 30</div>
                                 </div>
                             </div>
                             <ChevronRight className="w-4 h-4 text-gray-500" />
                         </div>

                         <div className="bg-[#211f1c] p-3 rounded border border-white/5 flex items-center justify-center gap-3 cursor-pointer hover:bg-[#302e2b] transition-colors">
                              <div className="flex items-center gap-3 w-full">
                                 <div className="w-8 h-8 rounded-full bg-[#ffc107]/20 flex items-center justify-center">
                                     <Crosshair className="w-5 h-5 text-[#ffc107]" />
                                 </div>
                                 <div>
                                     <div className="font-bold text-sm">1 Missed Win</div>
                                     <div className="text-xs text-gray-400">Move 40</div>
                                 </div>
                             </div>
                             <ChevronRight className="w-4 h-4 text-gray-500" />
                         </div>
                     </div>
                 </div>
             </div>
        )}
    </div>
  );
};

export default GameReviewPanel;
