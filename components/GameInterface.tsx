import React, { useState, useEffect, useCallback, useRef } from 'react';
import Chessboard from './Chessboard';
import { Settings, Flag, XCircle, Search, ChevronRight, RotateCcw, MessageCircle, AlertCircle, Copy, Check, Lightbulb, Undo2 } from 'lucide-react';
import GameReviewPanel from './GameReviewPanel';
import PlayBotsPanel from './PlayBotsPanel';
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
import { ALL_BOTS, BotProfile } from '../utils/bots';
import { identifyOpening } from '../utils/openings';

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

  // New: Simulated Matching State
  const [isSearching, setIsSearching] = useState(false);
  const [searchState, setSearchState] = useState<'searching' | 'found' | null>(null);
  const [isPlayFriendMode, setIsPlayFriendMode] = useState(false);
  const [copied, setCopied] = useState(false);

  // New: Play Mode (online vs local)
  const [playMode, setPlayMode] = useState<'online' | 'pass-and-play'>('online');
  const [onlineOpponent, setOnlineOpponent] = useState<{name: string, rating: number, avatar: string, flag: string} | null>(null);

  // User Color (default 'w')
  const [userColor, setUserColor] = useState<'w' | 'b'>('w');

  // Coach Mode State
  const [isCoachMode, setIsCoachMode] = useState(false);

  // Chat/Bot Messages
  const [botMessage, setBotMessage] = useState<string | null>(null);
  const [openingName, setOpeningName] = useState<string>("");

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

  // Hint State
  const [hintArrow, setHintArrow] = useState<{ from: string, to: string } | null>(null);

  // Sync state if prop changes
  useEffect(() => {
    if (initialMode) setActivePanel(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (initialTimeControl) setTimeControl(initialTimeControl);
  }, [initialTimeControl]);

  const isBotMode = activePanel === 'bots';
  const isReviewMode = activePanel === 'review';
  const isEngineOpponent = isBotMode || (activePanel === 'play' && playMode === 'online');

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

      // Ensure it's user's turn if playing against engine/bot
      if (isEngineOpponent && game.turn() !== userColor) return;

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

          // Identify Opening
          const op = identifyOpening(newGame.pgn());
          if (op && op !== "Unknown Opening") {
              setOpeningName(op);
          }

          // Trigger Coach Evaluation
          if (isCoachMode) {
              evaluateMove(fenBefore, { from, to, promotion }, fenAfter);
          } else {
              resetFeedback();
          }

          // Clear hint on move
          setHintArrow(null);

          // Trigger Bot Response if in Bot Mode/Online and game not over
          if (isEngineOpponent && activeBot && !newGame.isGameOver()) {
              resetBestMove();
              setBotMessage(null); // Clear old message

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
  }, [game, isEngineOpponent, activeBot, sendCommand, resetBestMove, playSound, isCoachMode, evaluateMove, resetFeedback, userColor]);

  // Handle Engine Move (Bot)
  useEffect(() => {
      if (isEngineOpponent && bestMove && !game.isGameOver()) {
          const from = bestMove.substring(0, 2);
          const to = bestMove.substring(2, 4);
          const promotion = bestMove.length > 4 ? bestMove.substring(4, 5) : undefined;
          
          // Ensure engine moves only on its turn
          if (game.turn() !== userColor) {
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
  }, [bestMove, isEngineOpponent, game, resetBestMove, playSound]);

  // Reset game when switching modes
  useEffect(() => {
      if (!isReviewMode) {
          // Logic for reset if needed
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
      setIsSearching(false);
      setSearchState(null);
      setIsPlayFriendMode(false);
      setBotMessage(null);
      setOpeningName("");
      playSound('gameStart');

      if (activeBot) {
          setTimeout(() => setBotMessage("Good luck! Have fun."), 1000);
          setTimeout(() => setBotMessage(null), 5000);
      }
  }, [resetTimer, playSound, resetFeedback, activeBot]);

  // Automatic Engine Move Start
  useEffect(() => {
     if (isEngineOpponent && activeBot && game.history().length === 0 && game.turn() !== userColor && !isGameOver) {
         // It's engine's turn at start of game
         const timeout = setTimeout(() => {
             if (activeBot.skillLevel !== undefined) {
                 sendCommand(`setoption name Skill Level value ${activeBot.skillLevel}`);
             }
             sendCommand(`position fen ${game.fen()}`);
             sendCommand(`go depth ${activeBot.depth || 10}`);
         }, 1000);
         return () => clearTimeout(timeout);
     }
  }, [game, isEngineOpponent, activeBot, userColor, isGameOver, sendCommand]);

  const handleHint = useCallback(() => {
      // Use best move from current coach evaluation
      if (currentEval.bestMove) {
          const from = currentEval.bestMove.substring(0, 2);
          const to = currentEval.bestMove.substring(2, 4);
          setHintArrow({ from, to });
          // Auto clear after 3 seconds
          setTimeout(() => setHintArrow(null), 3000);
      }
  }, [currentEval]);

  const handleUndo = useCallback(() => {
      if (game.history().length === 0 || isGameOver) return;

      // Create new game instance to modify
      const g = new Chess();
      try {
        g.loadPgn(game.pgn());
      } catch (e) {
        g.load(game.fen());
      }

      if (isEngineOpponent) {
          // Logic for Bot Games:
          if (g.turn() === userColor) {
              // If it's the user's turn, the Bot moved last.
              // To "Retry", we typically want to undo the Bot's move AND the User's move,
              // so the user can play a different move.
              g.undo(); // Undo Bot's move
              g.undo(); // Undo User's move
          } else {
              // If it's the Bot's turn, the User moved last (and Bot is thinking).
              // We just undo the User's move to let them correct it immediately.
              g.undo();
          }
      } else {
          // Pass and Play: Simple undo (go back one half-move)
          g.undo();
      }

      setGame(g);
      setFen(g.fen());
      setLastMove(null);

      // Update last move highlight based on new history
      const h = g.history({verbose: true});
      if (h.length > 0) {
          const last = h[h.length - 1];
          setLastMove({ from: last.from, to: last.to });
      }

      resetFeedback();
      resetBestMove(); // Stop bot if it was thinking to prevent race condition
      setHintArrow(null);
  }, [game, isEngineOpponent, userColor, resetFeedback, resetBestMove]);

  const handleStartBotGame = (bot: BotProfile, color: 'w' | 'b' | 'random') => {
      setActiveBot(bot);
      setOnlineOpponent(null);
      setPlayMode('online'); // Treat bot games as 'online' in terms of engine interaction

      let finalColor: 'w' | 'b' = 'w';
      if (color === 'random') {
          finalColor = Math.random() > 0.5 ? 'w' : 'b';
      } else {
          finalColor = color;
      }
      setUserColor(finalColor);

      handleNewGame();
  };

  const handleExit = useCallback(() => {
    setActiveBot(null);
    setOnlineOpponent(null);
    setHasGameStarted(false);
    setIsGameOver(false);
    setGameResult('');
  }, []);

  const handleStartHumanGame = () => {
    setIsPlayFriendMode(true);
    setPlayMode('pass-and-play');
    setActivePanel('play');
    setActiveBot(null);
    setOnlineOpponent(null);
    setHasGameStarted(false);
  };

  const handleOnlinePlay = () => {
    setIsSearching(true);
    setSearchState('searching');
    setActiveBot(null);
    setOnlineOpponent(null);
    setPlayMode('online');

    // Simulate searching
    setTimeout(() => {
        setSearchState('found');
        playSound('notify');

        // Pick random bot but pretend it's a human
        const randomBot = ALL_BOTS[Math.floor(Math.random() * ALL_BOTS.length)];
        // Generate pseudo-human profile
        const randomName = `Guest${Math.floor(Math.random() * 899999 + 100000)}`;
        const randomAvatar = `https://picsum.photos/seed/${randomName}/200`;
        const randomCountry = randomBot.flag;

        setOnlineOpponent({
            name: randomName,
            rating: randomBot.rating + Math.floor(Math.random() * 100 - 50),
            avatar: randomAvatar,
            flag: randomCountry
        });

        setTimeout(() => {
             setActiveBot(randomBot); // The engine
             handleNewGame();
        }, 1500);

    }, 2500);
  };

  const handleCopyLink = () => {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
  // If engine/online mode: only user's turn.
  // If human/pass-and-play mode: any turn.
  const isInteractable = !isGameOver && !viewFen && (
      isEngineOpponent ? game.turn() === userColor : true
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
            
            {/* Opponent Info (Top) */}
            <div className="flex justify-between items-end mb-1 px-1 relative">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-gray-500 overflow-hidden border border-white/20 relative group">
                        {onlineOpponent ? (
                            <img src={onlineOpponent.avatar} alt={onlineOpponent.name} className="w-full h-full object-cover" />
                        ) : activeBot ? (
                           <img src={activeBot.avatar} alt={activeBot.name} className="w-full h-full object-cover" />
                        ) : (
                           <img src="https://picsum.photos/id/64/100" alt="Opponent" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-1.5">
                           <span className="text-white font-bold text-sm leading-none">
                              {onlineOpponent ? onlineOpponent.name : activeBot ? activeBot.name : "Opponent"}
                           </span>
                           {(onlineOpponent || activeBot) && <img src={onlineOpponent ? onlineOpponent.flag : activeBot?.flag} className="w-3 h-2 shadow-sm" alt="Flag" />}
                           {activeBot && !onlineOpponent && (
                               <span className="bg-yellow-600 text-[9px] px-1 rounded text-white font-bold leading-tight border border-white/10 hidden md:inline-block" title="Bot">BOT</span>
                           )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 h-4">
                             {(onlineOpponent || activeBot) ? (
                                <span className="text-xs text-gray-400 font-semibold">({onlineOpponent ? onlineOpponent.rating : activeBot?.rating})</span>
                             ) : (
                                <span className="text-xs text-gray-500">1200</span>
                             )}
                             <CapturedPieces game={game} color={userColor === 'w' ? 'b' : 'w'} />
                        </div>
                    </div>
                </div>

                {/* Bot Chat Bubble */}
                {botMessage && (
                     <div className="absolute left-14 bottom-12 bg-white text-black text-xs font-bold px-3 py-2 rounded-xl rounded-bl-none shadow-lg animate-in fade-in zoom-in duration-200 z-10 max-w-[200px]">
                         {botMessage}
                         <div className="absolute bottom-[-6px] left-[0px] w-0 h-0 border-l-[10px] border-l-white border-b-[10px] border-b-transparent"></div>
                     </div>
                )}

                {(activePanel === 'play' || isBotMode) && (
                    <div className={`
                        px-2 py-1 md:px-3 md:py-1.5 rounded font-mono font-bold text-lg md:text-xl shadow-inner border
                        ${game.turn() === (userColor === 'w' ? 'b' : 'w') && !isGameOver ? 'bg-white text-black' : 'bg-[#262421] text-white border-white/5'}
                    `}>
                        {formatTime(userColor === 'w' ? blackTime : whiteTime)}
                    </div>
                )}
            </div>

            <div className="rounded-sm shadow-2xl ring-4 ring-black/10 relative aspect-square">
                 <Chessboard 
                    key={userColor} // Force re-mount on color change to ensure orientation updates
                    interactable={isInteractable}
                    fen={viewFen || fen}
                    onMove={onMove}
                    lastMove={lastMove}
                    boardOrientation={userColor === 'w' ? 'white' : 'black'}
                    customArrows={(isCoachMode && !viewFen) ? coachArrows : (hintArrow && !viewFen) ? [[hintArrow.from, hintArrow.to, '#f1c40f']] : undefined}
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
                                {activeBot ? "Rematch" : "New Game"}
                            </button>
                            <button
                                onClick={handleExit}
                                className="w-full bg-[#262421] hover:bg-[#363430] text-gray-300 font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                            >
                                <XCircle className="w-5 h-5" />
                                {activeBot ? "New Bot" : "Back to Home"}
                            </button>
                         </div>
                     </div>
                 )}
            </div>

            {/* Player Info (Bottom) */}
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
                             <CapturedPieces game={game} color={userColor} />
                             {openingName && (
                                 <span className="text-[10px] text-gray-400 ml-1 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 hidden sm:inline-block truncate max-w-[150px]" title={openingName}>
                                     {openingName}
                                 </span>
                             )}
                        </div>
                    </div>
                </div>
                {(activePanel === 'play' || isBotMode) && (
                    <div className={`
                        px-2 py-1 md:px-3 md:py-1.5 rounded font-mono font-bold text-lg md:text-xl shadow-[0_4px_0_0_rgba(160,160,160,1)] cursor-default
                        ${game.turn() === userColor && !isGameOver ? 'bg-white text-black' : 'bg-[#c3c3c3] text-black'}
                    `}>
                        {formatTime(userColor === 'w' ? whiteTime : blackTime)}
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
                        <span className="font-bold text-white text-sm">
                            Game vs {onlineOpponent ? onlineOpponent.name : activeBot ? activeBot.name : 'Opponent'}
                        </span>
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

                   <div className="mt-auto bg-[#211f1c] p-2 flex flex-col gap-1 border-t border-white/5">
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

                        {/* Game Controls: Hint/Undo for Bots */}
                        {isBotMode && !isGameOver && (
                             <div className="flex gap-1 mb-1">
                                 <button
                                     onClick={handleHint}
                                     className="flex-1 bg-[#383531] hover:bg-[#45423e] rounded flex items-center justify-center py-2 text-gray-300 hover:text-white transition-colors"
                                     title="Hint"
                                 >
                                     <Lightbulb className="w-5 h-5" />
                                 </button>
                                 <button
                                     onClick={handleUndo}
                                     className="flex-1 bg-[#383531] hover:bg-[#45423e] rounded flex items-center justify-center py-2 text-gray-300 hover:text-white transition-colors"
                                     title="Takeback"
                                 >
                                     <Undo2 className="w-5 h-5" />
                                 </button>
                             </div>
                        )}

                        <div className="flex gap-1">
                            <button className="flex-1 bg-[#383531] hover:bg-[#45423e] rounded flex items-center justify-center py-3 text-gray-400 hover:text-white transition-colors font-bold text-sm" onClick={() => { setIsGameOver(true); setGameResult('Resigned'); }}>
                                Resign
                            </button>
                            <button className="flex-1 bg-[#383531] hover:bg-[#45423e] rounded flex items-center justify-center py-3 text-gray-400 hover:text-white transition-colors font-bold text-sm">
                                Draw
                            </button>
                        </div>
                   </div>
               </div>
          ) : isSearching ? (
             <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
                 {searchState === 'searching' ? (
                     <>
                        <div className="w-24 h-24 relative mb-6">
                            <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-t-chess-green rounded-full animate-spin"></div>
                            <img src="https://picsum.photos/200" className="absolute inset-2 rounded-full opacity-50" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Searching...</h3>
                        <p className="text-gray-400 mb-8">Finding an opponent for you</p>
                        <button
                            onClick={() => { setIsSearching(false); setSearchState(null); }}
                            className="bg-[#383531] hover:bg-[#45423e] text-white px-8 py-3 rounded-lg font-bold"
                        >
                            Cancel
                        </button>
                     </>
                 ) : (
                    <>
                        <div className="w-24 h-24 relative mb-6">
                            <div className="absolute inset-0 rounded-full border-4 border-chess-green animate-ping"></div>
                             <div className="w-full h-full rounded-full bg-chess-green flex items-center justify-center">
                                 <Check className="w-12 h-12 text-white" />
                             </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Opponent Found!</h3>
                        <p className="text-gray-400">Starting game...</p>
                    </>
                 )}
             </div>
          ) : isPlayFriendMode ? (
              <div className="flex-1 flex flex-col p-6 text-center animate-in fade-in">
                   <div className="mb-6">
                        <div className="w-16 h-16 bg-[#383531] rounded-full flex items-center justify-center mx-auto mb-4">
                             <Search className="w-8 h-8 text-chess-green" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Play a Friend</h2>
                        <p className="text-gray-400 text-sm">Share this link to invite someone to play.</p>
                   </div>

                   <div className="bg-[#1b1a19] p-4 rounded-lg border border-white/10 mb-6">
                       <label className="text-xs text-gray-500 font-bold uppercase block text-left mb-2">Challenge Link</label>
                       <div className="flex gap-2">
                           <input
                              readOnly
                              value={window.location.href}
                              className="flex-1 bg-[#262522] border border-white/10 rounded px-3 py-2 text-gray-300 text-sm focus:outline-none"
                           />
                           <button
                              onClick={handleCopyLink}
                              className="bg-[#383531] hover:bg-[#45423e] px-3 rounded flex items-center justify-center transition-colors relative"
                              title="Copy"
                           >
                               {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />}
                           </button>
                       </div>
                   </div>

                   <button
                        onClick={handleNewGame}
                        className="w-full bg-chess-green hover:bg-chess-greenHover text-white font-bold py-4 rounded-lg shadow-[0_4px_0_0_#537a32] active:shadow-none active:translate-y-[4px] transition-all text-xl mb-3"
                   >
                        Start Game
                   </button>
                   <button
                        onClick={() => setIsPlayFriendMode(false)}
                        className="text-gray-400 hover:text-white font-semibold text-sm"
                   >
                        Cancel
                   </button>
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
                            onClick={handleOnlinePlay}
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
