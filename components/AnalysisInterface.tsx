import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import Chessboard from './Chessboard';
import AnalysisPanel from './AnalysisPanel';
import GameReviewPanel from './GameReviewPanel';
import ExplorerPanel from './ExplorerPanel';
import EvaluationBar from './EvaluationBar';
import { useStockfish } from '../hooks/useStockfish';
import { Search, BookOpen, Activity, X } from 'lucide-react';
import { GameReviewData } from '../src/utils/gameAnalysis';

interface AnalysisInterfaceProps {
  initialPgn?: string;
  initialFen?: string;
  defaultTab?: 'analysis' | 'review' | 'explorer';
  onNavigate?: (view: string, params?: any) => void;
}

interface RetryState {
    isActive: boolean;
    fen: string;
    moveIndex: number;
    bestMove: string; // The move we want the user to find
    originalMove: string; // The mistake they made
}

const AnalysisInterface: React.FC<AnalysisInterfaceProps> = ({
    initialPgn,
    initialFen,
    defaultTab = 'analysis',
    onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'review' | 'explorer'>(defaultTab);

  // Game State
  const [game, setGame] = useState(() => {
      const g = new Chess();
      if (initialPgn) {
          try { g.loadPgn(initialPgn); } catch(e) {}
      } else if (initialFen) {
          try { g.load(initialFen); } catch(e) {}
      }
      return g;
  });
  const [currentFen, setCurrentFen] = useState(game.fen());
  const [viewMoveIndex, setViewMoveIndex] = useState<number>(-1); // -1 = Live/Last
  
  // Stored analysis data
  const [analysisData, setAnalysisData] = useState<GameReviewData | undefined>(undefined);

  // Retry / Problem Solving State
  const [retryState, setRetryState] = useState<RetryState | null>(null);
  const [retryFeedback, setRetryFeedback] = useState<'none' | 'success' | 'failure'>('none');

  // Update game if props change
  useEffect(() => {
      if (initialPgn) {
          const g = new Chess();
          try {
              g.loadPgn(initialPgn);
              setGame(g);
              setCurrentFen(g.fen());
              setViewMoveIndex(g.history().length - 1);
          } catch(e) {}
      } else if (initialFen) {
           const g = new Chess();
          try {
              g.load(initialFen);
              setGame(g);
              setCurrentFen(g.fen());
              setViewMoveIndex(-1);
          } catch(e) {}
      }
  }, [initialPgn, initialFen]);

  // Engine Hook - Shared instance for Analysis Panel and Eval Bar
  const stockfish = useStockfish();
  const { isReady, bestMove, evalScore } = stockfish;

  const onMoveClick = (fen: string, index: number) => {
      if (retryState?.isActive) return; // Lock navigation during retry
      setCurrentFen(fen);
      setViewMoveIndex(index);
  };

  const handleReset = () => {
      const g = new Chess();
      setGame(g);
      setCurrentFen(g.fen());
      setViewMoveIndex(-1);
      setAnalysisData(undefined);
      setRetryState(null);
  };

  const handleRetry = (fen: string, moveIndex: number, bestMoveSan: string) => {
      // Setup retry environment
      // 1. Move to the position BEFORE the mistake (which is 'fen')
      setCurrentFen(fen);
      setViewMoveIndex(moveIndex); // This should align with the move just made? No, before.

      // Wait, 'moveIndex' in GameReview is usually the index of the move made.
      // So if I made move 5, I want to see the board after move 4.
      // The `fen` passed from GameReviewPanel should be the position *before* the mistake.

      // We need the UCI best move to validate (Chessboard usually returns detailed move object, but let's compare SAN or UCI)
      // Ideally we get UCI from analysis, but our analysisData has 'bestMove' (UCI) or SAN?
      // checking src/utils/gameAnalysis.ts: movesAnalysis has `bestMove: string` (UCI probably) and `_nextBestMove` (UCI).

      // Find the move in our game history to get the original move text
      const history = game.history({ verbose: true });
      const originalMove = history[moveIndex] ? history[moveIndex].san : '';

      setRetryState({
          isActive: true,
          fen: fen,
          moveIndex: moveIndex,
          bestMove: bestMoveSan, // Expecting UCI here actually
          originalMove: originalMove
      });
      setRetryFeedback('none');
      setActiveTab('analysis'); // Switch to board view
  };

  const handleUserMove = (from: string, to: string, promotion: string = 'q') => {
      // If Retrying
      if (retryState?.isActive) {
          const tempGame = new Chess(currentFen);
          try {
              const move = tempGame.move({ from, to, promotion });
              if (move) {
                  // Check against best move
                  // We need to compare UCI: from + to + promotion
                  const uci = move.from + move.to + (move.promotion || '');

                  // retryState.bestMove is expected to be UCI based on useStockfish and gameAnalysis
                  // But wait, gameAnalysis `bestMove` comes from `prevBestMove` which is UCI.

                  if (uci === retryState.bestMove) {
                      setRetryFeedback('success');
                      // Show the move on board
                      setCurrentFen(tempGame.fen());

                      // Auto-exit after delay? Or let user click 'Next'?
                      // For now, let them bask in glory
                  } else {
                      setRetryFeedback('failure');
                      // Don't update board, just show error
                      setTimeout(() => setRetryFeedback('none'), 1000);
                  }
              }
          } catch(e) {}
          return;
      }

      // Normal Analysis Mode
      const newGame = new Chess();
      try {
          // If viewing the latest move, we can try to preserve history (PGN)
          if (viewMoveIndex === -1) {
             try {
                 newGame.loadPgn(game.pgn());
                 if (newGame.fen() !== game.fen()) {
                     newGame.load(game.fen());
                 }
             } catch (e) {
                 newGame.load(game.fen());
             }
          } else {
             // If browsing history, we fork
             newGame.load(currentFen);
          }
      } catch(e) {
          newGame.load(currentFen);
      }

      const move = newGame.move({ from, to, promotion });
      if (move) {
          setGame(newGame);
          setCurrentFen(newGame.fen());
          setViewMoveIndex(-1); // Live
      }
  };

  const handleCancelRetry = () => {
      setRetryState(null);
      setRetryFeedback('none');
      // Revert to game state
      setCurrentFen(game.fen());
      setViewMoveIndex(-1);
  };

  // Generate Arrows
  const customArrows = useMemo(() => {
      if (retryState?.isActive) {
          // During retry, maybe don't show the best move arrow immediately? Or do we?
          // Usually we hide it so they have to guess.
          return [];
      }
      if (activeTab === 'analysis' && bestMove) {
          const from = bestMove.substring(0, 2);
          const to = bestMove.substring(2, 4);
          return [[from, to, '#a3d154']]; // Green
      }
      return [];
  }, [bestMove, activeTab, retryState]);

  return (
    <div className="flex flex-col lg:flex-row h-full md:h-screen w-full overflow-hidden bg-chess-dark text-white">
        {/* Left Board Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 lg:p-4 bg-[#312e2b] relative">

            {/* Retry Banner */}
            {retryState?.isActive && (
                <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 px-6 py-3 rounded-lg shadow-xl font-bold flex items-center gap-4
                    ${retryFeedback === 'success' ? 'bg-green-600 text-white' :
                      retryFeedback === 'failure' ? 'bg-red-600 text-white' : 'bg-[#262522] text-white border border-white/10'}
                `}>
                    {retryFeedback === 'success' ? (
                        <>
                            <span>Correct! Great find.</span>
                            <button onClick={handleCancelRetry} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs ml-2">
                                Return to Game
                            </button>
                        </>
                    ) : retryFeedback === 'failure' ? (
                        <span>Incorrect. Try again.</span>
                    ) : (
                        <>
                            <span className="text-orange-400">Retry Mistake</span>
                            <span className="text-sm font-normal text-gray-300">Find the best move instead of <span className="font-bold text-white">{retryState.originalMove}</span></span>
                            <button onClick={handleCancelRetry} className="ml-2 p-1 hover:bg-white/10 rounded">
                                <X className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Evaluation Bar */}
            <div className="hidden lg:block absolute left-4 top-1/2 -translate-y-1/2 h-[80vh] w-6 z-0">
                <EvaluationBar score={evalScore?.value || 0} mate={evalScore?.unit === 'mate' ? evalScore.value : undefined} />
            </div>

            <div className="w-full max-w-[calc(100vh_-_8rem)] aspect-square shadow-2xl">
                 <Chessboard 
                    fen={currentFen}
                    onMove={handleUserMove}
                    interactable={true}
                    boardOrientation="white"
                    customArrows={customArrows as any}
                 />
            </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex-none w-full lg:w-[400px] bg-[#262522] flex flex-col border-l border-white/10 z-10 shadow-xl">
             {/* Tabs */}
             <div className="flex bg-[#211f1c] border-b border-white/5">
                 <button
                    onClick={() => setActiveTab('analysis')}
                    className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors
                        ${activeTab === 'analysis' ? 'border-chess-green text-white bg-[#262522]' : 'border-transparent text-gray-400 hover:text-white hover:bg-[#2a2926]'}
                    `}
                 >
                     <Search className="w-4 h-4" />
                     Analysis
                 </button>
                 <button
                    onClick={() => setActiveTab('review')}
                    className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors
                        ${activeTab === 'review' ? 'border-chess-green text-white bg-[#262522]' : 'border-transparent text-gray-400 hover:text-white hover:bg-[#2a2926]'}
                    `}
                 >
                     <Activity className="w-4 h-4" />
                     Review
                 </button>
                 <button
                    onClick={() => setActiveTab('explorer')}
                    className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors
                        ${activeTab === 'explorer' ? 'border-chess-green text-white bg-[#262522]' : 'border-transparent text-gray-400 hover:text-white hover:bg-[#2a2926]'}
                    `}
                 >
                     <BookOpen className="w-4 h-4" />
                     Explorer
                 </button>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-hidden relative">
                 {activeTab === 'analysis' && (
                     <AnalysisPanel
                        game={game}
                        currentMoveIndex={viewMoveIndex}
                        onMoveClick={onMoveClick}
                        stockfish={stockfish}
                        fen={currentFen} // Pass current view FEN
                        analysisData={analysisData} // Pass review data
                        onNavigate={onNavigate}
                        onReset={handleReset}
                     />
                 )}
                 {activeTab === 'review' && (
                     <GameReviewPanel
                        pgn={game.pgn()}
                        onStartReview={() => {}}
                        onAnalysisComplete={setAnalysisData}
                        existingData={analysisData}
                        currentMoveIndex={viewMoveIndex}
                        onMoveClick={onMoveClick}
                        onRetry={handleRetry}
                     />
                 )}
                 {activeTab === 'explorer' && (
                     <ExplorerPanel
                        fen={currentFen}
                        history={game.history()}
                        onPlayMove={(san) => {
                             const g = new Chess(currentFen);
                             try {
                                 const m = g.move(san);
                                 if (m) {
                                     handleUserMove(m.from, m.to, m.promotion);
                                 }
                             } catch(e) {}
                        }}
                     />
                 )}
             </div>
        </div>
    </div>
  );
};

export default AnalysisInterface;
