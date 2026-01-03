import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Chessboard from './Chessboard';
import AnalysisPanel from './AnalysisPanel';
import GameReviewPanel from './GameReviewPanel';
import EvaluationBar from './EvaluationBar';
import { User, ChevronRight } from 'lucide-react';
import { Chess } from 'chess.js';
import { useStockfish } from '../hooks/useStockfish';
import { Arrow } from '../hooks/useCoach';

interface AnalysisInterfaceProps {
  initialPgn?: string;
  initialFen?: string;
  defaultTab?: 'analysis' | 'review';
}

const AnalysisInterface: React.FC<AnalysisInterfaceProps> = ({ initialPgn, initialFen, defaultTab }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'review'>('analysis');

  // Master game record
  const [game, setGame] = useState(new Chess());
  // Store the starting FEN separately if we loaded from FEN, so we can replay history correctly.
  // chess.js history() returns moves, but replay needs to know where to start if it wasn't the standard position.
  const [startFen, setStartFen] = useState<string | null>(null);

  // Current position index (0 = start)
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  
  // Initialize game from PGN/FEN
  useEffect(() => {
      const newGame = new Chess();
      if (initialPgn) {
          try {
              // Always assume PGN for this prop.
              newGame.loadPgn(initialPgn);
              setGame(newGame);
              setStartFen(null); // PGN usually contains setup, or assumes standard
              // Set the index to the last move to show the final position.
              setCurrentMoveIndex(newGame.history().length);
          } catch (e) {
              console.error("Failed to load PGN", e);
          }
      } else if (initialFen) {
          try {
              newGame.load(initialFen);
              setGame(newGame);
              setStartFen(initialFen);
              setCurrentMoveIndex(0);
          } catch (e) {
              console.error("Failed to load FEN", e);
          }
      }
  }, [initialPgn, initialFen]);

  // Set default tab on mount or prop change
  useEffect(() => {
      if (defaultTab) {
          setActiveTab(defaultTab);
      } else if (initialPgn && initialPgn.includes('[')) {
           // Fallback heuristic if no defaultTab provided
           setActiveTab('review');
      } else {
           setActiveTab('analysis');
      }
  }, [defaultTab, initialPgn, initialFen]);

  // Derived state for current display
  const currentFen = useMemo(() => {
      const history = game.history({ verbose: true });
      if (currentMoveIndex === 0) {
        // If at start of history, return start FEN if exists, otherwise standard start.
        // However, if game has moves, currentMoveIndex 0 means "before first move".

        if (startFen) return startFen;

        // Standard start position
        return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      }
      
      const tempGame = new Chess(startFen || undefined);
      for (let i = 0; i < currentMoveIndex; i++) {
          if (history[i]) tempGame.move(history[i]);
      }
      return tempGame.fen();
  }, [game, currentMoveIndex, startFen]);

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

  // Calculate Arrows from Best Line
  const analysisArrows = useMemo(() => {
      if (!bestLine) return undefined;
      const parts = bestLine.split(' ');
      if (parts.length > 0) {
          const move = parts[0];
          if (move.length >= 4) {
              const from = move.substring(0, 2);
              const to = move.substring(2, 4);
              return [[from, to, '#81b64c']] as Arrow[]; // Green arrow for best move
          }
      }
      return undefined;
  }, [bestLine]);

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
            // Reconstruct master game
            const newMasterGame = new Chess(startFen || undefined);

            // Replay up to current
            for(let i=0; i<currentMoveIndex; i++) {
                newMasterGame.move(history[i]);
            }
            // Add new move
            newMasterGame.move({ from, to, promotion: 'q' });
            
            setGame(newMasterGame);
            setCurrentMoveIndex(prev => prev + 1);

            // If user moves, switch to analysis to see result
            setActiveTab('analysis');
        }
    } catch (e) {}
  };

  // Format eval for text display
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

            <div className="rounded-sm shadow-2xl ring-4 ring-black/10 relative">
                 <Chessboard 
                    interactable={true} 
                    fen={currentFen} 
                    onMove={handleMove}
                    lastMove={lastMove}
                    customArrows={analysisArrows}
                 />
                 
                 {/* Eval Bar Overlay (Mobile) */}
                 {evalScore && (
                     <div className="lg:hidden absolute left-0 top-0 bottom-0 w-2 z-20 opacity-80 pointer-events-none">
                         <EvaluationBar
                            score={evalScore.type === 'cp' ? evalScore.value : 0}
                            mate={evalScore.type === 'mate' ? evalScore.value : undefined}
                         />
                     </div>
                 )}
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
            <div className="hidden lg:block absolute left-[-32px] top-0 bottom-0 w-6 my-auto h-[85vh]">
                 <EvaluationBar
                    score={evalScore?.type === 'cp' ? evalScore.value : 0}
                    mate={evalScore?.type === 'mate' ? evalScore.value : undefined}
                 />
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
                         handleFirst();
                     }}
                     onMoveSelect={(index) => {
                         setCurrentMoveIndex(index);
                         // Optional: auto switch to analysis?
                         // setActiveTab('analysis');
                         // Authentic: Review panel might stay open but board updates.
                     }}
                  />
              ) : (
                  <AnalysisPanel
                    game={game}
                    evalScore={displayEval}
                    bestLine={bestLine}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    onFirst={handleFirst}
                    onLast={handleLast}
                    currentMove={currentMoveIndex}
                    onMoveClick={(index) => setCurrentMoveIndex(index + 1)}
                  />
              )}
          </div>
      </div>
    </div>
  );
};

export default AnalysisInterface;
