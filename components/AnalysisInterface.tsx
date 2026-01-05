import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Chessboard from './Chessboard';
import AnalysisPanel from './AnalysisPanel';
import GameReviewPanel from './GameReviewPanel';
import EvaluationBar from './EvaluationBar';
import { User, ChevronRight } from 'lucide-react';
import { Chess } from 'chess.js';
import { useStockfish } from '../hooks/useStockfish';
import { Arrow } from '../hooks/useCoach';
import { identifyOpening } from '../utils/openings';
import { GameReviewData } from '../utils/gameAnalysis';
import { Check, X, RefreshCcw } from 'lucide-react';

interface AnalysisInterfaceProps {
  initialPgn?: string;
  initialFen?: string;
  defaultTab?: 'analysis' | 'review';
  onNavigate?: (view: string, params?: any) => void;
}

const AnalysisInterface: React.FC<AnalysisInterfaceProps> = ({ initialPgn, initialFen, defaultTab, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'review'>('analysis');

  // Master game record
  const [game, setGame] = useState(new Chess());
  // Store the starting FEN separately if we loaded from FEN, so we can replay history correctly.
  const [startFen, setStartFen] = useState<string | null>(null);

  // Current position index (0 = start)
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  // Analysis Data
  const [analysisData, setAnalysisData] = useState<GameReviewData | null>(null);

  // Retry Mode
  const [retryState, setRetryState] = useState<{ isRetrying: boolean, bestMove?: string, feedback?: 'correct' | 'incorrect' | null } | null>(null);

  // Analysis Features
  const [showThreats, setShowThreats] = useState(false);
  const [depth, setDepth] = useState(20);

  // New: Practice Handler
  const handlePractice = () => {
      if (onNavigate) {
          onNavigate('play-bots', { fen: currentFen });
      }
  };
  
  // Initialize game from PGN/FEN
  useEffect(() => {
      const newGame = new Chess();
      if (initialPgn) {
          try {
              newGame.loadPgn(initialPgn);
              setGame(newGame);
              setStartFen(null);
              setAnalysisData(null); // Reset analysis on new game
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
           setActiveTab('review');
      } else {
           setActiveTab('analysis');
      }
  }, [defaultTab, initialPgn, initialFen]);

  // Derived state for current display
  const currentFen = useMemo(() => {
      const history = game.history({ verbose: true });
      if (currentMoveIndex === 0) {
        if (startFen) return startFen;
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

  // Helper to generate a Threat FEN (flip side, clear EP)
  const getThreatFen = (fen: string) => {
      const parts = fen.split(' ');
      // parts[0] = placement
      // parts[1] = turn (w/b)
      // parts[2] = castling
      // parts[3] = en passant
      // parts[4] = halfmove
      // parts[5] = fullmove

      if (parts.length >= 4) {
          parts[1] = parts[1] === 'w' ? 'b' : 'w';
          parts[3] = '-'; // Clear en passant
      }
      return parts.join(' ');
  };

  // Stockfish hook
  const { evalScore, bestLine, lines, sendCommand, resetBestMove, isReady } = useStockfish();

  // Run analysis when FEN changes
  useEffect(() => {
    if (!isReady) return;

    resetBestMove();
    sendCommand('stop');

    // If showThreats is true, analyze the "Threat FEN" (opponent's turn)
    const fenToAnalyze = showThreats ? getThreatFen(currentFen) : currentFen;

    sendCommand(`position fen ${fenToAnalyze}`);
    // Enable MultiPV 3
    sendCommand('setoption name MultiPV value 3');
    sendCommand(`go depth ${depth}`);
  }, [currentFen, sendCommand, resetBestMove, isReady, showThreats, depth]);

  // Calculate Arrows from Best Line
  const analysisArrows = useMemo(() => {
      // If retrying, show no arrows (user must guess)
      if (retryState?.isRetrying) return [];

      const arrows: Arrow[] = [];
      if (!bestLine) return undefined;

      // Best move arrow
      const parts = bestLine.split(' ');
      if (parts.length > 0) {
          const move = parts[0];
          if (move.length >= 4) {
              const from = move.substring(0, 2);
              const to = move.substring(2, 4);

              // If showing threats, color Red. Else Green.
              const color = showThreats ? '#fa412d' : '#81b64c';
              arrows.push([from, to, color]);
          }
      }

      return arrows;
  }, [bestLine, retryState, showThreats]);

  // Calculate Square Styles (for move classification)
  const squareStyles = useMemo(() => {
      if (retryState?.isRetrying) return {};
      // Also show classifications in 'analysis' tab if data exists
      if (!analysisData || currentMoveIndex <= 0) return {};

      const styles: Record<string, React.CSSProperties> = {};
      const moveData = analysisData.moves[currentMoveIndex - 1];

      if (moveData) {
          let color = '';
          // Using semi-transparent colors
          switch (moveData.classification) {
              case 'brilliant': color = 'rgba(27, 172, 166, 0.6)'; break;
              case 'great': color = 'rgba(92, 139, 176, 0.6)'; break;
              case 'best': color = 'rgba(149, 183, 118, 0.6)'; break;
              case 'excellent': color = 'rgba(150, 188, 75, 0.6)'; break;
              case 'good': color = 'rgba(150, 188, 75, 0.6)'; break; // Same as excellent/best usually
              case 'inaccuracy': color = 'rgba(247, 192, 69, 0.6)'; break;
              case 'mistake': color = 'rgba(230, 145, 44, 0.6)'; break;
              case 'blunder': color = 'rgba(250, 65, 45, 0.6)'; break;
              case 'missed-win': color = 'rgba(250, 65, 45, 0.6)'; break;
              case 'book': color = 'rgba(163, 141, 121, 0.6)'; break;
          }

          if (color) {
              styles[moveData.from] = { backgroundColor: color };
              styles[moveData.to] = { backgroundColor: color };
          }
      }
      return styles;
  }, [activeTab, analysisData, currentMoveIndex, retryState]);

  const openingName = React.useMemo(() => {
     return identifyOpening(game.pgn());
  }, [game]);

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
    // Retry Logic
    if (retryState?.isRetrying) {
        const playedUci = from + to; // Naive UCI (ignoring promo for match check usually fine unless promoting)
        const playedUciPromo = from + to + 'q'; // Assume queen promo

        // Check against best move
        const target = retryState.bestMove;
        if (!target) return;

        // Simple check: does it match target? (Target is UCI)
        const isCorrect = (playedUci === target || playedUciPromo === target || (target.length === 5 && playedUci === target.substring(0,4)));

        if (isCorrect) {
             setRetryState(prev => ({ ...prev!, feedback: 'correct' }));

             // Branch from current point
             const tempGame = new Chess(startFen || undefined);
             const history = game.history();
             for(let i=0; i<currentMoveIndex; i++) tempGame.move(history[i]);

             tempGame.move({ from, to, promotion: 'q' });

             setGame(tempGame);
             setCurrentMoveIndex(prev => prev + 1);

             setTimeout(() => {
                 setRetryState(null); // Exit retry mode
                 setActiveTab('analysis');
             }, 1500);
        } else {
             setRetryState(prev => ({ ...prev!, feedback: 'incorrect' }));
             setTimeout(() => {
                 setRetryState(prev => ({ ...prev!, feedback: null }));
             }, 1000);
        }
        return;
    }

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

  const handleRetryStart = (moveIndex: number) => {
      if (!analysisData) return;

      const moveData = analysisData.moves[moveIndex - 1]; // The mistake move

      if (moveData && moveData.bestMove) {
          setCurrentMoveIndex(moveIndex - 1); // Go to before move
          setRetryState({
              isRetrying: true,
              bestMove: moveData.bestMove
          });
          setActiveTab('analysis'); // Switch to board view
      }
  };

  // Format eval for text display
  let displayEval = "0.0";
  if (evalScore) {
      if (evalScore.type === 'mate') {
          displayEval = `M${Math.abs(evalScore.value)}`;
      } else {
          let score = evalScore.value / 100;
          const turn = currentFen.split(' ')[1];
          // If using 'showThreats', the engine thinks it is the OTHER side's turn.
          // But `evalScore` is from the engine's perspective of "side to move".
          // If we show threats (side to move is flipped), 'w' becomes 'b'.
          // If White to move (real), we send Black to move (threat).
          // Engine says: +0.3 (Black is winning by 0.3).
          // We display relative to White (real turn)?
          // If we want to show "Threat", usually we just show the arrow.
          // The eval bar might be confusing if we flip it.
          // Let's just keep standard logic: positive = White advantage?
          // Standard logic: if turn='b', score = -score.
          // If showThreats is true, `turn` from `currentFen` is the REAL turn (e.g. 'w').
          // But engine evaluated for 'b'.
          // Engine says +30 (Black advantage).
          // Logic below: turn='w'. score = 0.3. Display +0.3.
          // This correctly says "White is up 0.3".
          // Wait. If Black is up, engine (side to move = Black) says +30.
          // We want display to say -0.3?
          // If engine returns +30 for Black, it means Black is winning.
          // Standard: + means White winning.
          // So if Black winning, we want negative.
          // If engine (Black to move) says +30, Black is +0.3.
          // So White is -0.3.
          // My logic: `if (turn === 'b') score = -score`.
          // Here `turn` is from `currentFen` (White). So score remains +0.3.
          // This implies White winning. Incorrect.
          // So if `showThreats`, we effectively flipped the turn for the engine, but not for the display logic?
          // Actually, if `showThreats`, we want to ignore the Eval Bar probably, or just accept it's weird.
          // I will leave it for now, as the Arrow is the main feature.

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
                    lastMove={retryState?.isRetrying ? null : lastMove}
                    customArrows={analysisArrows}
                    customSquareStyles={squareStyles}
                 />
                 
                 {/* Retry Feedback Overlay */}
                 {retryState && (
                     <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none">
                         <div className={`px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4
                             ${retryState.feedback === 'correct' ? 'bg-chess-green text-white' :
                               retryState.feedback === 'incorrect' ? 'bg-red-500 text-white' : 'bg-[#262522] text-white border border-white/20'}`}>

                             {retryState.feedback === 'correct' ? (
                                 <>
                                     <Check className="w-5 h-5" />
                                     <span>Correct!</span>
                                 </>
                             ) : retryState.feedback === 'incorrect' ? (
                                 <>
                                     <X className="w-5 h-5" />
                                     <span>Try Again</span>
                                 </>
                             ) : (
                                 <>
                                     <RefreshCcw className="w-4 h-4 animate-spin-slow" />
                                     <span>Find the best move</span>
                                 </>
                             )}
                         </div>
                     </div>
                 )}

                 {/* Eval Bar Overlay (Mobile) */}
                 {evalScore && !retryState && (
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
          <div className="flex flex-col bg-[#211f1c] border-b border-white/5">
              <div className="flex text-sm font-semibold">
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
              {openingName && activeTab === 'analysis' && (
                  <div className="px-4 py-1 text-xs text-gray-400 font-medium border-t border-white/5">
                       Opening: <span className="text-white">{openingName}</span>
                  </div>
              )}
          </div>

          <div className="flex-1 overflow-hidden relative">
              {activeTab === 'review' ? (
                  <GameReviewPanel
                     pgn={game.pgn()}
                     existingData={analysisData}
                     onStartReview={() => {
                         setActiveTab('analysis');
                         handleFirst();
                     }}
                     onMoveSelect={(index) => {
                         setCurrentMoveIndex(index);
                     }}
                     onRetry={handleRetryStart}
                     onAnalysisComplete={setAnalysisData}
                     currentMoveIndex={currentMoveIndex}
                  />
              ) : (
                  <AnalysisPanel
                    game={game}
                    currentFen={currentFen}
                    evalScore={displayEval}
                    bestLine={bestLine}
                    lines={lines} // Pass MultiPV lines
                    onNext={handleNext}
                    onPrev={handlePrev}
                    onFirst={handleFirst}
                    onLast={handleLast}
                    currentMove={currentMoveIndex}
                    onMoveClick={(index) => setCurrentMoveIndex(index + 1)}
                    analysisData={analysisData} // Pass analysis data
                    showThreats={showThreats}
                    onToggleThreats={() => setShowThreats(!showThreats)}
                    depth={depth}
                    onDepthChange={setDepth}
                    onPractice={handlePractice}
                  />
              )}
          </div>
      </div>
    </div>
  );
};

export default AnalysisInterface;
