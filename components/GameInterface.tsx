import React, { useState, useEffect, useCallback, useRef } from 'react';
import Chessboard from './Chessboard';
import { Settings, Flag, XCircle, Search, ChevronRight, RotateCcw, MessageCircle, AlertCircle } from 'lucide-react';
import GameReviewPanel from './GameReviewPanel';
import PlayBotsPanel, { BotProfile } from './PlayBotsPanel';
import MoveList from './MoveList';
import CapturedPieces from './CapturedPieces';
import CoachFeedback from './CoachFeedback';
import EvaluationBar from './EvaluationBar';
import { Chess } from 'chess.js';
import { useStockfish } from '../hooks/useStockfish';
import { useCoach } from '../hooks/useCoach';
import { useGameTimer } from '../hooks/useGameTimer';
import { useGameSound } from '../hooks/useGameSound';
import { useSettings } from '../context/SettingsContext';

interface GameInterfaceProps {
  initialMode?: 'play' | 'bots' | 'review';
  initialTimeControl?: number;
  onAnalyze?: (pgn: string, tab?: 'analysis' | 'review') => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ initialMode = 'play', initialTimeControl = 600, onAnalyze }) => {
  const [activePanel, setActivePanel] = useState<'play' | 'review' | 'bots'>(initialMode);
  const [activeBot, setActiveBot] = useState<BotProfile | null>(null);

  const { openSettings } = useSettings();

  // Game State
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [viewFen, setViewFen] = useState<string | null>(null); // For history navigation
  const [viewMoveIndex, setViewMoveIndex] = useState<number>(-1); // -1 = live
  const [lastMove, setLastMove] = useState<{from: string, to: string} | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<string>('');
  
  // New: Start Game Flag to show board in Play Friend mode
  const [hasGameStarted, setHasGameStarted] = useState(false);

  // Coach Mode State
  const [isCoachMode, setIsCoachMode] = useState(false);

  // Sounds
  const { playSound } = useGameSound();

  // Timer State
  const [timeControl, setTimeControl] = useState(initialTimeControl);
  const { whiteTime, blackTime, formatTime, startTimer, stopTimer, resetTimer } = useGameTimer(
    timeControl,
    game.turn(),
    isGameOver,
    (loser) => {
      setIsGameOver(true);
      setGameResult(loser === 'w' ? 'Black Won (Time)' : 'White Won (Time)');
      playSound('gameEnd');
    }
  );

  // Engine for Bot
  const { bestMove, sendCommand, resetBestMove, isReady } = useStockfish();

  // Coach Hook (also provides analysis/evaluation)
  const {
      onTurnStart,
      evaluateMove,
      feedback,
      arrows: coachArrows,
      isThinking: isCoachThinking,
      resetFeedback,
      currentEval
  } = useCoach(true); // Always enable for evaluation bar

  // Sync state if prop changes
  useEffect(() => {
    if (initialMode) setActivePanel(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (initialTimeControl) setTimeControl(initialTimeControl);
  }, [initialTimeControl]);

  const isBotMode = activePanel === 'bots';
  const isReviewMode = activePanel === 'review';

  // Check Game Over
  useEffect(() => {
     if (game.isGameOver()) {
         setIsGameOver(true);
         stopTimer();
         playSound('gameEnd');
         if (game.isCheckmate()) setGameResult(game.turn() === 'w' ? 'Black Won' : 'White Won');
         else if (game.isDraw()) setGameResult('Draw');
         else setGameResult('Game Over');
     } else {
         if (!isGameOver && game.history().length > 0) {
             startTimer();
         }
     }
  }, [game, fen, stopTimer, startTimer, isGameOver, playSound]);

  // Coach: On turn start (Continuous Analysis)
  useEffect(() => {
      if (!isGameOver) {
           onTurnStart(game.fen());
      }
  }, [game.fen(), isGameOver, onTurnStart]);

  // Handle User Move
  const onMove = useCallback(async (from: string, to: string, promotion: string = 'q') => {
      if (game.isGameOver() || viewFen) return;

      const newGame = new Chess();
      try {
        newGame.loadPgn(game.pgn());
      } catch (e) {
        // Fallback for empty game or parsing error
        newGame.load(game.fen());
      }

      // Save fen before move for coach evaluation
      const fenBefore = newGame.fen();
      const move = newGame.move({ from, to, promotion });

      if (move) {
          // Sound effects
          if (newGame.isCheckmate() || newGame.isCheck()) {
              playSound('check');
          } else if (move.captured) {
              playSound('capture');
          } else if (move.flags.includes('k') || move.flags.includes('q')) { // Castle
              playSound('castle');
          } else if (move.flags.includes('p')) { // Promotion
              playSound('promote');
          } else {
              playSound('move');
          }

          const fenAfter = newGame.fen();
          setGame(newGame);
          setFen(fenAfter);
          setLastMove({ from, to });

          // Trigger Coach Evaluation
          if (isCoachMode) {
              evaluateMove(fenBefore, { from, to, promotion }, fenAfter);
          } else {
              resetFeedback();
          }

          // Trigger Bot Response if in Bot Mode and game not over
          if (isBotMode && activeBot && !newGame.isGameOver()) {
              resetBestMove();
              // Small delay for realism
              setTimeout(() => {
                  if (activeBot.skillLevel !== undefined) {
                       sendCommand(`setoption name Skill Level value ${activeBot.skillLevel}`);
                  }
                  sendCommand(`position fen ${newGame.fen()}`);
                  sendCommand(`go depth ${activeBot.depth || 10}`);
              }, 500);
          }
      }
  }, [game, isBotMode, activeBot, sendCommand, resetBestMove, playSound, isCoachMode, evaluateMove, resetFeedback]);

  // Handle Engine Move (Bot)
  useEffect(() => {
      if (isBotMode && bestMove && !game.isGameOver()) {
          const from = bestMove.substring(0, 2);
          const to = bestMove.substring(2, 4);
          const promotion = bestMove.length > 4 ? bestMove.substring(4, 5) : undefined;
          
          if (game.turn() === 'b') {
              const newGame = new Chess();
              try {
                newGame.loadPgn(game.pgn());
              } catch (e) {
                newGame.load(game.fen());
              }
              const move = newGame.move({ from, to, promotion });

              if (move) {
                  if (newGame.isCheckmate() || newGame.isCheck()) {
                     playSound('check');
                  } else if (move.captured) {
                     playSound('capture');
                  } else if (move.flags.includes('k') || move.flags.includes('q')) {
                     playSound('castle');
                  } else if (move.flags.includes('p')) {
                     playSound('promote');
                  } else {
                     playSound('move');
                  }

                  setGame(newGame);
                  setFen(newGame.fen());
                  setLastMove({ from, to });
              }
          }
          resetBestMove();
      }
  }, [bestMove, isBotMode, game, resetBestMove, playSound]);

  // Reset game when switching modes
  useEffect(() => {
      if (!isReviewMode) {
          if (activePanel === 'play' || activePanel === 'bots') {
              // Only reset if actually changing context?
              // For now, let's reset if we go TO play or bots.
              // But if we are in 'bots' and select a bot, we don't want to reset until 'Play' is clicked.
          }
      }
  }, [activePanel, isReviewMode]);

  const handleNewGame = useCallback(() => {
      const newGame = new Chess();
      setGame(newGame);
      setFen(newGame.fen());
      setViewFen(null);
      setViewMoveIndex(-1);
      setLastMove(null);
      setIsGameOver(false);
      setGameResult('');
      setHasGameStarted(true); // Ensure board is shown
      resetTimer();
      resetFeedback();
      playSound('gameStart');
  }, [resetTimer, playSound, resetFeedback]);

  const handleStartBotGame = (bot: BotProfile) => {
      setActiveBot(bot);
      handleNewGame();
  };

  const handleStartHumanGame = () => {
    setActiveBot(null);
    handleNewGame();
    setActivePanel('play');
  };

  // Update timer on new game or time control change
  useEffect(() => {
      resetTimer();
  }, [timeControl, resetTimer]);

  const getTimeControlLabel = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      return `${mins} min`;
  };

  // Determine if board should be interactable
  // If bot mode: only white turn.
  // If human mode: any turn.
  const isInteractable = !isGameOver && !viewFen && (
      isBotMode ? game.turn() === 'w' : true // In human mode (Play Friend), both can move
  );

  return (
    <div className="flex flex-col lg:flex-row h-full md:h-screen w-full overflow-hidden bg-chess-dark">
      
      {/* Left Area (Board) */}
      <div className="flex-none lg:flex-1 flex flex-col items-center justify-center p-2 lg:p-4 bg-[#312e2b] relative">
        
        {/* Coach Feedback Overlay */}
        <CoachFeedback
            feedback={feedback}
            isThinking={isCoachThinking}
            onClose={resetFeedback}
        />

        {/* Evaluation Bar Desktop */}
        {(isReviewMode || isBotMode || isCoachMode) && !isGameOver && (
             <div className="hidden lg:block absolute left-4 top-1/2 -translate-y-1/2 h-[80vh] w-6 z-0">
                <EvaluationBar score={currentEval.score} mate={currentEval.mate} />
            </div>
        )}

        <div className="w-full max-w-[400px] lg:max-w-[calc(100vh_-_10rem)] relative flex flex-col justify-center">
            
            {/* Opponent Info (Black) */}
            <div className="flex justify-between items-end mb-1 px-1">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-gray-500 overflow-hidden border border-white/20 relative group">
                        {activeBot ? (
                           <img src={activeBot.avatar} alt={activeBot.name} className="w-full h-full object-cover" />
                        ) : (
                           <img src="https://picsum.photos/id/64/100" alt="Opponent" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-1.5">
                           <span className="text-white font-bold text-sm leading-none">
                              {activeBot ? activeBot.name : "Opponent"}
                           </span>
                           {activeBot && <img src={activeBot.flag} className="w-3 h-2 shadow-sm" alt="Flag" />}
                           {activeBot && (
                               <span className="bg-yellow-600 text-[9px] px-1 rounded text-white font-bold leading-tight border border-white/10 hidden md:inline-block" title="Bot">BOT</span>
                           )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 h-4">
                             {activeBot ? (
                                <span className="text-xs text-gray-400 font-semibold">({activeBot.rating})</span>
                             ) : (
                                <span className="text-xs text-gray-500">1200</span>
                             )}
                             <CapturedPieces game={game} color="b" />
                        </div>
                    </div>
                </div>
                {(activePanel === 'play' || isBotMode) && (
                    <div className={`
                        px-2 py-1 md:px-3 md:py-1.5 rounded font-mono font-bold text-lg md:text-xl shadow-inner border
                        ${game.turn() === 'b' && !isGameOver ? 'bg-white text-black' : 'bg-[#262421] text-white border-white/5'}
                    `}>
                        {formatTime(blackTime)}
                    </div>
                )}
            </div>

            <div className="rounded-sm shadow-2xl ring-4 ring-black/10 relative aspect-square">
                 <Chessboard 
                    interactable={isInteractable}
                    fen={viewFen || fen}
                    onMove={onMove}
                    lastMove={lastMove}
                    boardOrientation="white"
                    customArrows={isCoachMode && !viewFen ? coachArrows : undefined}
                 />

                 {/* Game Over Overlay */}
                 {isGameOver && (
                     <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 z-20 backdrop-blur-sm animate-in fade-in duration-300">
                         <h2 className="text-3xl font-black text-white mb-2 text-center shadow-black drop-shadow-md">{gameResult}</h2>
                         <div className="flex flex-col w-full gap-3 mt-4 max-w-[200px]">
                            <button 
                                onClick={() => {
                                    if (onAnalyze) onAnalyze(game.pgn(), 'review');
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

            {/* Player Info (White) */}
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
                         <div className="flex items-center gap-2 mt-1 h-4">
                             <span className="text-xs text-gray-500">850</span>
                             <CapturedPieces game={game} color="w" />
                        </div>
                    </div>
                </div>
                {(activePanel === 'play' || isBotMode) && (
                    <div className={`
                        px-2 py-1 md:px-3 md:py-1.5 rounded font-mono font-bold text-lg md:text-xl shadow-[0_4px_0_0_rgba(160,160,160,1)] cursor-default
                        ${game.turn() === 'w' && !isGameOver ? 'bg-white text-black' : 'bg-[#c3c3c3] text-black'}
                    `}>
                        {formatTime(whiteTime)}
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
              <GameReviewPanel
                  pgn={game.pgn()}
                  onStartReview={() => {
                      if (onAnalyze) onAnalyze(game.pgn(), 'review');
                  }}
              />
          ) : activePanel === 'bots' && !activeBot ? (
              <PlayBotsPanel onStartGame={handleStartBotGame} />
          ) : (activePanel === 'bots' && activeBot) || hasGameStarted ? (
               // Active Game View (Move List)
               <div className="flex flex-col h-full bg-[#262522]">
                   <div className="flex items-center justify-between px-4 py-2 bg-[#211f1c] border-b border-white/5">
                        <span className="font-bold text-white text-sm">Game vs {isBotMode ? activeBot?.name : 'Opponent'}</span>
                        <div className="flex gap-2">

                             {/* Coach Toggle */}
                             <button
                                onClick={() => setIsCoachMode(!isCoachMode)}
                                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${isCoachMode ? 'bg-chess-green text-white' : 'text-gray-400 hover:text-white'}`}
                                title="Toggle Coach Mode"
                             >
                                 <MessageCircle className="w-4 h-4" />
                                 <span className="text-xs font-bold">Coach</span>
                             </button>

                             <div className="w-px bg-white/10 mx-1"></div>

                             <button className="text-gray-400 hover:text-white" title="Resign" onClick={() => { setIsGameOver(true); setGameResult('Aborted'); }}>
                                 <Flag className="w-4 h-4" />
                             </button>
                             <button className="text-gray-400 hover:text-white" title="Abort" onClick={handleNewGame}>
                                 <XCircle className="w-4 h-4" />
                             </button>
                        </div>
                   </div>
                   <MoveList
                        game={game}
                        currentMoveIndex={viewMoveIndex}
                        onMoveClick={(fen, index) => {
                            setViewFen(fen);
                            setViewMoveIndex(index);
                            // Also update board last move indicator?
                            // This would require parsing the move to get from/to.
                            // For now, we just show the board position.
                            setLastMove(null);
                        }}
                   />

                   <div className="mt-auto bg-[#211f1c] p-2 flex gap-1 border-t border-white/5">
                        {/* Live Button when viewing history */}
                        {viewFen && (
                             <button
                                className="w-full mb-2 bg-[#383531] hover:bg-[#45423e] text-chess-green font-bold py-1 rounded"
                                onClick={() => {
                                    setViewFen(null);
                                    setViewMoveIndex(-1);
                                    // Restore last move indicator
                                    const history = game.history({ verbose: true });
                                    if (history.length > 0) {
                                        const last = history[history.length - 1];
                                        setLastMove({ from: last.from, to: last.to });
                                    }
                                }}
                             >
                                 Back to Live Game
                             </button>
                        )}
                        <button className="flex-1 bg-[#383531] hover:bg-[#45423e] rounded flex items-center justify-center py-3 text-gray-400 hover:text-white transition-colors font-bold text-sm" onClick={() => { setIsGameOver(true); setGameResult('Resigned'); }}>
                            Resign
                        </button>
                        <button className="flex-1 bg-[#383531] hover:bg-[#45423e] rounded flex items-center justify-center py-3 text-gray-400 hover:text-white transition-colors font-bold text-sm">
                            Draw
                        </button>
                   </div>
               </div>
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
                        <button
                            onClick={handleNewGame}
                            className="w-full bg-chess-green hover:bg-chess-greenHover text-white font-bold py-3 md:py-4 rounded-lg shadow-[0_4px_0_0_#537a32] active:shadow-none active:translate-y-[4px] transition-all text-xl flex items-center justify-center gap-2"
                        >
                            <span>Play</span>
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={handleStartHumanGame}
                                className="bg-[#383531] hover:bg-[#45423e] text-gray-300 py-3 rounded font-semibold text-sm transition-colors border-b-4 border-[#252422] active:border-b-0 active:translate-y-1"
                            >
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
                            <Settings
                                className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white"
                                onClick={openSettings}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {[600, 60, 900].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTimeControl(t)}
                                    className={`
                                        py-2 rounded text-sm font-semibold border border-transparent transition-colors
                                        ${timeControl === t ? 'bg-[#302e2b] text-white border-white/20' : 'bg-[#211f1c] text-[#c3c3c3] hover:bg-[#302e2b] hover:border-white/10'}
                                    `}
                                >
                                    {getTimeControlLabel(t)}
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
