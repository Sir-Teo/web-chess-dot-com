import React, { useState, useEffect, useCallback, useRef } from 'react';
import Chessboard from './Chessboard';
import { Settings, Flag, XCircle, Search, ChevronRight, RotateCcw } from 'lucide-react';
import GameReviewPanel from './GameReviewPanel';
import PlayBotsPanel from './PlayBotsPanel';
import { Chess } from 'chess.js';
import { useStockfish } from '../hooks/useStockfish';

interface GameInterfaceProps {
  initialMode?: 'play' | 'bots' | 'review';
  onAnalyze?: (pgn: string) => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ initialMode = 'play', onAnalyze }) => {
  const [activePanel, setActivePanel] = useState<'play' | 'review' | 'bots'>(initialMode);
  
  // Game State
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [lastMove, setLastMove] = useState<{from: string, to: string} | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<string>('');
  
  // Engine
  const { bestMove, sendCommand, resetBestMove } = useStockfish();

  // Sync state if prop changes
  useEffect(() => {
    if (initialMode) setActivePanel(initialMode);
  }, [initialMode]);

  const isBotMode = activePanel === 'bots';
  const isReviewMode = activePanel === 'review';

  // Check Game Over
  useEffect(() => {
     if (game.isGameOver()) {
         setIsGameOver(true);
         if (game.isCheckmate()) setGameResult(game.turn() === 'w' ? 'Black Won' : 'White Won');
         else if (game.isDraw()) setGameResult('Draw');
         else setGameResult('Game Over');
     } else {
         setIsGameOver(false);
     }
  }, [game, fen]);

  // Handle User Move
  const onMove = useCallback((from: string, to: string) => {
      if (game.isGameOver()) return;

      try {
          const move = game.move({ from, to, promotion: 'q' });
          if (move) {
              setFen(game.fen());
              setLastMove({ from, to });
              setGame(new Chess(game.fen())); // Immutable update for re-render
              
              // Trigger Bot Response if in Bot Mode and game not over
              if (isBotMode && !game.isGameOver()) {
                  resetBestMove();
                  // Small delay for realism
                  setTimeout(() => {
                      sendCommand(`position fen ${game.fen()}`);
                      sendCommand('go depth 10'); // Adjust depth for difficulty
                  }, 500);
              }
          }
      } catch (e) {
          // Illegal move
      }
  }, [game, isBotMode, sendCommand, resetBestMove]);

  // Handle Engine Move (Bot)
  useEffect(() => {
      if (isBotMode && bestMove && !game.isGameOver()) {
          const from = bestMove.substring(0, 2);
          const to = bestMove.substring(2, 4);
          const promotion = bestMove.length > 4 ? bestMove.substring(4, 5) : undefined;
          
          try {
             // Check if it's actually the bot's turn (Black)
             if (game.turn() === 'b') {
                 const move = game.move({ from, to, promotion });
                 if (move) {
                     setFen(game.fen());
                     setLastMove({ from, to });
                     setGame(new Chess(game.fen()));
                 }
             }
          } catch (e) {
              console.error("Bot tried illegal move", bestMove);
          }
          resetBestMove();
      }
  }, [bestMove, isBotMode, game, resetBestMove]);

  // Reset game when switching modes
  useEffect(() => {
      const newGame = new Chess();
      setGame(newGame);
      setFen(newGame.fen());
      setLastMove(null);
      setIsGameOver(false);
  }, [activePanel]);

  const handleNewGame = () => {
      const newGame = new Chess();
      setGame(newGame);
      setFen(newGame.fen());
      setLastMove(null);
      setIsGameOver(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full md:h-screen w-full overflow-hidden bg-chess-dark">
      
      {/* Left Area (Board) */}
      <div className="flex-none lg:flex-1 flex flex-col items-center justify-center p-2 lg:p-4 bg-[#312e2b] relative">
        
        {/* Evaluation Bar Desktop */}
        {isReviewMode && (
             <div className="hidden lg:block absolute left-4 top-1/2 -translate-y-1/2 h-[80vh] w-6 bg-[#262421] rounded overflow-hidden border border-black/20 shadow-lg">
                <div className="h-[45%] bg-white w-full transition-all duration-500"></div>
                <div className="h-[55%] bg-[#312e2b] w-full transition-all duration-500"></div>
                <div className="absolute top-1/2 left-0 w-full text-[10px] text-center text-gray-500 font-mono -mt-2 bg-black/20 backdrop-blur-sm">-0.3</div>
            </div>
        )}

        <div className="w-full max-w-[400px] lg:max-w-[85vh] aspect-square relative flex flex-col justify-center">
            
            {/* Opponent Info */}
            <div className="flex justify-between items-end mb-1 px-1">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-gray-500 overflow-hidden border border-white/20 relative group">
                        {isBotMode ? (
                           <img src="https://images.chesscomfiles.com/uploads/v1/user/165768852.17066896.200x200o.e40702464731.jpeg" alt="Martin" className="w-full h-full object-cover" />
                        ) : (
                           <img src="https://picsum.photos/id/64/100" alt="Opponent" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-1.5">
                           <span className="text-white font-bold text-sm leading-none">
                              {isBotMode ? "New Year's Martin" : "martin-2026-BOT"}
                           </span>
                           <img src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Bulgaria.svg" className="w-3 h-2 shadow-sm" alt="Flag" />
                           {(!isBotMode || isReviewMode) && (
                               <span className="bg-yellow-600 text-[9px] px-1 rounded text-white font-bold leading-tight border border-white/10 hidden md:inline-block" title="Bot">BOT</span>
                           )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                             {isBotMode ? (
                                <span className="text-xs text-gray-400 font-semibold">(260)</span>
                             ) : (
                                <span className="text-xs text-gray-500">1200</span>
                             )}
                        </div>
                    </div>
                </div>
                {activePanel === 'play' && (
                    <div className="bg-[#262421] text-white px-2 py-1 md:px-3 md:py-1.5 rounded font-mono font-bold text-lg md:text-xl shadow-inner border border-white/5">
                        10:00
                    </div>
                )}
            </div>

            <div className="rounded-sm overflow-hidden shadow-2xl ring-4 ring-black/10 relative">
                 <Chessboard 
                    interactable={!isGameOver && (activePanel === 'play' || isBotMode)} 
                    fen={fen}
                    onMove={onMove}
                    lastMove={lastMove}
                 />

                 {/* Game Over Overlay */}
                 {isGameOver && (
                     <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 z-20 backdrop-blur-sm animate-in fade-in duration-300">
                         <h2 className="text-3xl font-black text-white mb-2 text-center shadow-black drop-shadow-md">{gameResult}</h2>
                         <div className="flex flex-col w-full gap-3 mt-4 max-w-[200px]">
                            <button 
                                onClick={() => {
                                    if (onAnalyze) onAnalyze(game.pgn());
                                }}
                                className="w-full bg-chess-green hover:bg-chess-greenHover text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                            >
                                <Search className="w-5 h-5" />
                                Game Review
                            </button>
                            <button 
                                onClick={handleNewGame}
                                className="w-full bg-[#383531] hover:bg-[#45423e] text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                            >
                                <RotateCcw className="w-5 h-5" />
                                New Game
                            </button>
                         </div>
                     </div>
                 )}
            </div>

            {/* Player Info */}
            <div className="flex justify-between items-start mt-1 px-1">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-gray-500 overflow-hidden border border-white/20 relative group">
                        <img src="https://picsum.photos/200" alt="Me" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-1.5">
                            <span className="text-white font-bold text-sm leading-none">MasterTeo1205</span>
                            <span className="text-lg md:text-xl leading-none">🇺🇸</span>
                        </div>
                         <div className="flex items-center gap-2 mt-1">
                             <span className="text-xs text-gray-500">850</span>
                        </div>
                    </div>
                </div>
                {activePanel === 'play' && (
                    <div className="bg-[#c3c3c3] text-black px-2 py-1 md:px-3 md:py-1.5 rounded font-mono font-bold text-lg md:text-xl shadow-[0_4px_0_0_rgba(160,160,160,1)] cursor-default">
                        09:56
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="flex-1 lg:flex-none w-full lg:w-[350px] xl:w-[420px] bg-[#262522] flex flex-col border-l border-white/10 shrink-0 h-auto lg:h-auto z-10 relative shadow-2xl overflow-hidden">
          
          {/* Mock Tab Switcher */}
          <div className="absolute top-0 left-[-40px] flex flex-col gap-2 p-2 z-0 pointer-events-none md:pointer-events-auto opacity-0 md:opacity-100">
             {activePanel !== 'bots' && (
                 <button 
                    onClick={() => setActivePanel(activePanel === 'play' ? 'review' : 'play')}
                    className="bg-[#262522] p-2 rounded-l-md text-gray-400 hover:text-white shadow-lg border-y border-l border-white/10 pointer-events-auto"
                    title="Toggle View"
                 >
                    <ChevronRight className={`w-5 h-5 transition-transform ${activePanel === 'play' ? 'rotate-180' : ''}`} />
                 </button>
             )}
          </div>

          {activePanel === 'review' ? (
              <GameReviewPanel />
          ) : activePanel === 'bots' ? (
              <PlayBotsPanel />
          ) : (
            <>
                {/* Play Panel Content */}
                <div className="flex bg-[#211f1c] text-sm font-semibold border-b border-white/5">
                    <button className="flex-1 py-3 text-white border-b-2 border-chess-green bg-[#262522]">New Game</button>
                    <button className="flex-1 py-3 text-[#c3c3c3] hover:text-white hover:bg-[#2a2926]">Games</button>
                    <button className="flex-1 py-3 text-[#c3c3c3] hover:text-white hover:bg-[#2a2926]">Players</button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-center">
                    <div className="mb-4 md:mb-6">
                        <img src="https://www.chess.com/bundles/web/images/color-icons/handshake.svg" alt="Start" className="w-12 h-12 md:w-16 md:h-16 opacity-50 mx-auto mb-2" />
                        <h3 className="text-white font-bold text-lg">Play Chess</h3>
                    </div>
                    
                    <div className="w-full space-y-2">
                        <button className="w-full bg-chess-green hover:bg-chess-greenHover text-white font-bold py-3 md:py-4 rounded-lg shadow-[0_4px_0_0_#537a32] active:shadow-none active:translate-y-[4px] transition-all text-xl flex items-center justify-center gap-2">
                            <span>Play</span>
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                            <button className="bg-[#383531] hover:bg-[#45423e] text-gray-300 py-3 rounded font-semibold text-sm transition-colors border-b-4 border-[#252422] active:border-b-0 active:translate-y-1">
                                Play Friend
                            </button>
                            <button 
                                onClick={() => setActivePanel('bots')}
                                className="bg-[#383531] hover:bg-[#45423e] text-gray-300 py-3 rounded font-semibold text-sm transition-colors border-b-4 border-[#252422] active:border-b-0 active:translate-y-1"
                            >
                                Play Computer
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 md:mt-8 w-full">
                        <div className="flex justify-between items-center mb-2 px-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">Time Controls</span>
                            <Settings className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {['10 min', '1 min', '15 | 10'].map(t => (
                                <button key={t} className="bg-[#211f1c] hover:bg-[#302e2b] text-[#c3c3c3] py-2 rounded text-sm font-semibold border border-transparent hover:border-white/10 transition-colors">
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Controls */}
                <div className="bg-[#211f1c] p-2 flex gap-1 border-t border-white/5">
                    <button className="flex-1 bg-[#383531] hover:bg-[#45423e] rounded flex items-center justify-center py-3 text-gray-400 hover:text-white transition-colors" title="Resign" onClick={() => { setIsGameOver(true); setGameResult('Aborted'); }}>
                        <Flag className="w-5 h-5" />
                    </button>
                    <button className="flex-1 bg-[#383531] hover:bg-[#45423e] rounded flex items-center justify-center py-3 text-gray-400 hover:text-white transition-colors" title="Draw">
                        <span className="font-bold text-lg">½</span>
                    </button>
                    <button className="flex-1 bg-[#383531] hover:bg-[#45423e] rounded flex items-center justify-center py-3 text-gray-400 hover:text-white transition-colors" title="Abort" onClick={handleNewGame}>
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
            </>
          )}
      </div>
    </div>
  );
};

export default GameInterface;