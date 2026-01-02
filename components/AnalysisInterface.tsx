import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Chessboard from './Chessboard';
import AnalysisPanel from './AnalysisPanel';
import GameReviewPanel from './GameReviewPanel';
import { User, ChevronRight } from 'lucide-react';
import { Chess } from 'chess.js';
import { useStockfish } from '../hooks/useStockfish';

interface AnalysisInterfaceProps {
  initialPgn?: string;
  initialFen?: string;
}

const AnalysisInterface: React.FC<AnalysisInterfaceProps> = ({ initialPgn, initialFen }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'review'>('review');

  // Master game record
  const [game, setGame] = useState(new Chess());
  // Current position index (0 = start)
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  
  // Initialize game from PGN/FEN
  useEffect(() => {
      const newGame = new Chess();
      if (initialPgn) {
          try {
              if (initialPgn.split('/').length > 7 && !initialPgn.includes('[')) {
                 newGame.load(initialPgn);
                 setGame(newGame);
                 setCurrentMoveIndex(0);
                 // If loaded from FEN, probably analysis, but here we assume PGN usually for review
              } else {
                 newGame.loadPgn(initialPgn);
                 setGame(newGame);
                 setCurrentMoveIndex(newGame.history().length);
              }
          } catch (e) {
              console.error("Failed to load PGN/FEN", e);
          }
      } else if (initialFen) {
          newGame.load(initialFen);
          setGame(newGame);
          setCurrentMoveIndex(0);
      }

      // Default to review tab if we have a game history
      if (initialPgn) setActiveTab('review');
  }, [initialPgn, initialFen]);

  // Derived state for current display
  const currentFen = useMemo(() => {
      const history = game.history({ verbose: true });
      if (currentMoveIndex === 0) {
        if (history.length === 0) return game.fen();
        return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      }
      
      const tempGame = new Chess();
      for (let i = 0; i < currentMoveIndex; i++) {
          if (history[i]) tempGame.move(history[i]);
      }
      return tempGame.fen();
  }, [game, currentMoveIndex]);

  const lastMove = useMemo(() => {
       const history = game.history({ verbose: true });
       if (currentMoveIndex > 0 && history[currentMoveIndex - 1]) {
           return { from: history[currentMoveIndex - 1].from, to: history[currentMoveIndex - 1].to };
       }
       return null;
  }, [game, currentMoveIndex]);

  // Stockfish hook
  const { evalScore, bestLine, sendCommand, resetBestMove } = useStockfish();

  // Run analysis when FEN changes
  useEffect(() => {
    resetBestMove();
    sendCommand('stop');
    sendCommand(`position fen ${currentFen}`);
    sendCommand('go depth 20');
  }, [currentFen, sendCommand, resetBestMove]);

  // Navigation handlers
  const handleNext = () => {
      if (currentMoveIndex < game.history().length) {
          setCurrentMoveIndex(prev => prev + 1);
      }
  };
  const handlePrev = () => {
      if (currentMoveIndex > 0) {
          setCurrentMoveIndex(prev => prev - 1);
      }
  };
  const handleFirst = () => setCurrentMoveIndex(0);
  const handleLast = () => setCurrentMoveIndex(game.history().length);
  
  // Interactive Move (Make move on board)
  const handleMove = (from: string, to: string) => {
    const tempGame = new Chess(currentFen);
    try {
        const move = tempGame.move({ from, to, promotion: 'q' });
        if (move) {
            const history = game.history();
            const newMasterGame = new Chess();
            for(let i=0; i<currentMoveIndex; i++) {
                newMasterGame.move(history[i]);
            }
            newMasterGame.move({ from, to, promotion: 'q' });
            
            setGame(newMasterGame);
            setCurrentMoveIndex(prev => prev + 1);

            // If user moves, switch to analysis to see result
            setActiveTab('analysis');
        }
    } catch (e) {}
  };

  // Calculate bar height based on eval
  const getBarHeight = () => {
     if (!evalScore) return 50;
     if (evalScore.type === 'mate') return evalScore.value > 0 ? 100 : 0;
     
     // White's perspective score
     let score = evalScore.value / 100;
     const turn = currentFen.split(' ')[1];
     if (turn === 'b') score = -score;

     const clamped = Math.max(-5, Math.min(5, score));
     return 50 + (clamped * 10);
  };

  const whiteBarHeight = getBarHeight();
  
  // Format eval
  let displayEval = "0.0";
  if (evalScore) {
      if (evalScore.type === 'mate') {
          displayEval = `M${Math.abs(evalScore.value)}`;
      } else {
          let score = evalScore.value / 100;
          const turn = currentFen.split(' ')[1];
          if (turn === 'b') score = -score;
          displayEval = score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2);
      }
  }

  return (
    <div className="flex flex-col lg:flex-row h-full md:h-screen w-full overflow-hidden bg-chess-dark">
      
      {/* Left Area (Board) */}
      <div className="flex-none lg:flex-1 flex flex-col items-center justify-center p-2 lg:p-4 bg-[#312e2b] relative">
        <div className="w-full max-w-[400px] lg:max-w-[85vh] aspect-square relative flex flex-col justify-center">
            
            {/* Top Player Info (Black) */}
             <div className="flex justify-between items-end mb-1 px-1">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#262421] rounded flex items-center justify-center border border-white/10">
                        <User className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
                    </div>
                    <span className="text-white font-bold text-xs md:text-sm">Black</span>
                </div>
            </div>

            <div className="rounded-sm overflow-hidden shadow-2xl ring-4 ring-black/10 relative">
                 <Chessboard 
                    interactable={true} 
                    fen={currentFen} 
                    onMove={handleMove}
                    lastMove={lastMove}
                 />
                 
                 {/* Eval Bar Overlay (Mobile) */}
                 <div className="lg:hidden absolute left-0 top-0 bottom-0 w-2 z-20 opacity-80 pointer-events-none">
                     <div className="absolute top-0 left-0 w-full bg-[#312e2b] transition-all duration-500" style={{ height: `${100 - whiteBarHeight}%` }}></div>
                     <div className="absolute bottom-0 left-0 w-full bg-white transition-all duration-500" style={{ height: `${whiteBarHeight}%` }}></div>
                 </div>
            </div>
            
            {/* Bottom Player Info (White) */}
             <div className="flex justify-between items-start mt-1 px-1">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#c3c3c3] rounded flex items-center justify-center border border-white/10 overflow-hidden">
                         <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <span className="text-white font-bold text-xs md:text-sm">White</span>
                </div>
            </div>
            
            {/* Eval Bar (Desktop) */}
             <div className="hidden lg:block absolute left-[-24px] top-1/2 -translate-y-1/2 h-[85vh] w-6 bg-[#262421] rounded overflow-hidden border border-black/20 shadow-lg">
                <div className="absolute top-0 left-0 w-full bg-[#312e2b] transition-all duration-500" style={{ height: `${100 - whiteBarHeight}%` }}></div>
                <div className="absolute bottom-0 left-0 w-full bg-white transition-all duration-500" style={{ height: `${whiteBarHeight}%` }}></div>
                <div className={`absolute left-0 w-full text-[10px] text-center font-mono font-bold ${whiteBarHeight > 50 ? 'text-[#312e2b] bottom-1' : 'text-white top-1'}`}>
                    {displayEval}
                </div>
            </div>

        </div>
      </div>

      {/* Right Sidebar */}
      <div className="flex-1 lg:flex-none w-full lg:w-[350px] xl:w-[420px] bg-[#262522] flex flex-col border-l border-white/10 shrink-0 h-auto lg:h-auto z-10 relative shadow-2xl overflow-hidden">

          {/* Tab Toggle */}
          <div className="flex bg-[#211f1c] text-sm font-semibold border-b border-white/5">
              <button
                  onClick={() => setActiveTab('review')}
                  className={`flex-1 py-3 border-b-2 hover:bg-[#2a2926] transition-colors ${activeTab === 'review' ? 'text-white border-chess-green' : 'text-[#c3c3c3] border-transparent'}`}
              >
                  Review
              </button>
              <button
                  onClick={() => setActiveTab('analysis')}
                  className={`flex-1 py-3 border-b-2 hover:bg-[#2a2926] transition-colors ${activeTab === 'analysis' ? 'text-white border-chess-green' : 'text-[#c3c3c3] border-transparent'}`}
              >
                  Analysis
              </button>
          </div>

          <div className="flex-1 overflow-hidden relative">
              {activeTab === 'review' ? (
                  <GameReviewPanel
                     pgn={game.pgn()}
                     onStartReview={() => {
                         setActiveTab('analysis');
                         handleFirst(); // Start at beginning
                     }}
                  />
              ) : (
                  <AnalysisPanel
                    evalScore={displayEval}
                    bestLine={bestLine}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    onFirst={handleFirst}
                    onLast={handleLast}
                    currentMove={currentMoveIndex}
                    totalMoves={game.history().length}
                  />
              )}
          </div>
      </div>
    </div>
  );
};

export default AnalysisInterface;