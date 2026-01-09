import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import Chessboard from './Chessboard';
import AnalysisPanel from './AnalysisPanel';
import GameReviewPanel from './GameReviewPanel';
import ExplorerPanel from './ExplorerPanel';
import EvaluationBar from './EvaluationBar';
import { useStockfish } from '../hooks/useStockfish';
import { Search, BookOpen, Activity } from 'lucide-react';
import { GameReviewData } from '../src/utils/gameAnalysis';

interface AnalysisInterfaceProps {
  initialPgn?: string;
  initialFen?: string;
  defaultTab?: 'analysis' | 'review' | 'explorer';
  onNavigate?: (view: string, params?: any) => void;
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
      setCurrentFen(fen);
      setViewMoveIndex(index);
  };

  const handleReset = () => {
      const g = new Chess();
      setGame(g);
      setCurrentFen(g.fen());
      setViewMoveIndex(-1);
      setAnalysisData(undefined);
  };

  const handleUserMove = (from: string, to: string, promotion: string = 'q') => {
      const newGame = new Chess();
      try {
          // If viewing the latest move, we can try to preserve history (PGN)
          if (viewMoveIndex === -1) {
             // Clone game state including history if possible
             // However, loading PGN clears headers/comments, but keeps move history.
             try {
                 newGame.loadPgn(game.pgn());
                 // Double check if FEN matches (handling possible PGN load errors)
                 if (newGame.fen() !== game.fen()) {
                     // Fallback if PGN load results in different state (e.g. if loaded from FEN init)
                     newGame.load(game.fen());
                 }
             } catch (e) {
                 newGame.load(game.fen());
             }
          } else {
             // If browsing history, we fork from that position (clearing future history)
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

  // Generate Arrows for Best Move (Visuals)
  const bestMoveArrow = useMemo(() => {
      if (!bestMove) return [];
      const from = bestMove.substring(0, 2);
      const to = bestMove.substring(2, 4);
      return [[from, to, '#a3d154']]; // Green
  }, [bestMove]);

  return (
    <div className="flex flex-col lg:flex-row h-full md:h-screen w-full overflow-hidden bg-chess-dark text-white">
        {/* Left Board Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 lg:p-4 bg-[#312e2b] relative">
            {/* Evaluation Bar */}
            <div className="hidden lg:block absolute left-4 top-1/2 -translate-y-1/2 h-[80vh] w-6 z-0">
                <EvaluationBar score={evalScore?.value || 0} mate={evalScore?.unit === 'mate' ? evalScore.value : undefined} />
            </div>

            <div className="w-full max-w-[calc(100vh_-_8rem)] aspect-square shadow-2xl">
                 <Chessboard 
                    fen={currentFen}
                    onMove={handleUserMove}
                    interactable={true}
                    boardOrientation="white" // Configurable later
                    customArrows={activeTab === 'analysis' ? bestMoveArrow as any : []}
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
