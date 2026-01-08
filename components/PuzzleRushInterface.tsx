import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { Timer, X, Zap, Trophy, RefreshCcw, Home } from 'lucide-react';
import Chessboard from './Chessboard';
import { PUZZLES, Puzzle } from '../utils/puzzles';
import { useGameSound } from '../hooks/useGameSound';

interface PuzzleRushInterfaceProps {
    onNavigate: (view: string) => void;
}

const PuzzleRushInterface: React.FC<PuzzleRushInterfaceProps> = ({ onNavigate }) => {
    // Game State
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
    const [score, setScore] = useState(0);
    const [strikes, setStrikes] = useState(0);
    const [highScore, setHighScore] = useState(0);

    // Board State
    const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle>(PUZZLES[0]);
    const [chess, setChess] = useState(new Chess());
    const [fen, setFen] = useState('');
    const [moveIndex, setMoveIndex] = useState(0);
    const [isOpponentMoving, setIsOpponentMoving] = useState(false);
    const [wrongMove, setWrongMove] = useState(false); // Visual feedback

    const { playSound } = useGameSound();

    // Initialize High Score
    useEffect(() => {
        const saved = localStorage.getItem('puzzle_rush_highscore');
        if (saved) setHighScore(parseInt(saved, 10));
    }, []);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (gameState === 'playing' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setGameState('gameover');
                        playSound('gameEnd');
                        return 0;
                    }
                    if (prev === 11) playSound('tenSeconds');
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState, timeLeft, playSound]);

    // Initialize Puzzle
    const loadPuzzle = useCallback((puzzle: Puzzle) => {
        const game = new Chess(puzzle.fen);
        setChess(game);
        setFen(puzzle.fen);
        setMoveIndex(0);
        setIsOpponentMoving(false);
        setWrongMove(false);
    }, []);

    const startGame = () => {
        setGameState('playing');
        setTimeLeft(180);
        setScore(0);
        setStrikes(0);

        // Shuffle puzzles or pick random
        const randomPuzzle = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
        setCurrentPuzzle(randomPuzzle);
        loadPuzzle(randomPuzzle);
        playSound('gameStart');
    };

    const handleGameOver = useCallback(() => {
        setGameState('gameover');
        playSound('gameEnd');
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('puzzle_rush_highscore', score.toString());
        }
    }, [score, highScore, playSound]);

    const handleMove = useCallback((from: string, to: string, promotion: string = 'q') => {
        if (gameState !== 'playing' || isOpponentMoving) return;

        try {
            const tempGame = new Chess(chess.fen());

            // Validate promotion similar to other components
            const piece = tempGame.get(from as any);
            const isPromotion = piece?.type === 'p' && (
                (piece.color === 'w' && to[1] === '8') ||
                (piece.color === 'b' && to[1] === '1')
            );

            const moveConfig: { from: string, to: string, promotion?: string } = { from, to };
            if (isPromotion) moveConfig.promotion = promotion;

            const move = tempGame.move(moveConfig);
            if (!move) return;

            const expectedMove = currentPuzzle.moves[moveIndex];
            const playedUci = move.from + move.to + (move.promotion || '');

            const isCorrect = playedUci === expectedMove ||
                            (expectedMove.length === 4 && playedUci.startsWith(expectedMove));

            if (isCorrect) {
                setChess(tempGame);
                setFen(tempGame.fen());
                playSound('move');

                const nextIndex = moveIndex + 1;

                if (nextIndex >= currentPuzzle.moves.length) {
                    // Puzzle Solved
                    setScore(s => s + 1);
                    playSound('notify'); // Success sound

                    // Load next puzzle immediately
                    const nextPuzzle = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
                    setCurrentPuzzle(nextPuzzle);
                    setTimeout(() => loadPuzzle(nextPuzzle), 500); // Slight delay for visual confirmation

                } else {
                    // Continue Sequence
                    setMoveIndex(nextIndex);
                    setIsOpponentMoving(true);

                    setTimeout(() => {
                        try {
                            const opponentMoveUci = currentPuzzle.moves[nextIndex];
                            const from = opponentMoveUci.substring(0, 2);
                            const to = opponentMoveUci.substring(2, 4);
                            const prom = opponentMoveUci.length > 4 ? opponentMoveUci.substring(4, 5) : 'q';

                            const reply = tempGame.move({ from, to, promotion: prom });
                            if (reply) {
                                setChess(new Chess(tempGame.fen()));
                                setFen(tempGame.fen());
                                playSound('move');
                                setMoveIndex(nextIndex + 1);
                            }
                        } finally {
                            setIsOpponentMoving(false);
                        }
                    }, 300); // Faster opponent in Rush
                }
            } else {
                // Wrong Move
                setStrikes(s => {
                    const newStrikes = s + 1;
                    if (newStrikes >= 3) {
                        handleGameOver();
                    }
                    return newStrikes;
                });

                // Visual Shake / Reset
                const originalFen = chess.fen();
                setChess(tempGame); // Show wrong move
                setFen(tempGame.fen());
                setWrongMove(true);
                playSound('illegal');

                setTimeout(() => {
                    if (strikes < 2) { // Only revert if not game over
                        const revertedGame = new Chess(originalFen);
                        setChess(revertedGame);
                        setFen(originalFen);
                        setWrongMove(false);
                    }
                }, 500);
            }

        } catch(e) { console.error(e); }

    }, [gameState, isOpponentMoving, chess, currentPuzzle, moveIndex, strikes, handleGameOver, playSound, loadPuzzle]);


    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (gameState === 'start') {
        return (
            <div className="flex flex-col h-full bg-[#312e2b] items-center justify-center p-8 text-center text-white">
                <div className="mb-8 animate-bounce">
                    <Zap className="w-24 h-24 text-orange-500 fill-current" />
                </div>
                <h1 className="text-5xl font-black mb-4 tracking-tight">PUZZLE RUSH</h1>
                <p className="text-xl text-gray-400 mb-8 max-w-md">
                    Solve as many puzzles as you can in 3 minutes. Three strikes and you're out!
                </p>

                <div className="bg-[#262421] p-6 rounded-lg mb-8 border border-white/10 w-full max-w-sm">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 font-bold uppercase text-sm">High Score</span>
                        <div className="flex items-center gap-2 text-yellow-500">
                             <Trophy className="w-5 h-5 fill-current" />
                             <span className="text-2xl font-black">{highScore}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                     <button
                        onClick={() => onNavigate('puzzles')}
                        className="bg-[#383531] hover:bg-[#45423e] text-white font-bold py-4 px-8 rounded-lg shadow-lg flex items-center gap-2"
                     >
                        <Home className="w-5 h-5" /> Back
                     </button>
                     <button
                        data-testid="start-puzzle-rush"
                        onClick={startGame}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-12 rounded-lg shadow-[0_4px_0_0_#c05600] active:shadow-none active:translate-y-[4px] transition-all text-xl flex items-center gap-2"
                     >
                        <Zap className="w-6 h-6 fill-current" /> Start
                     </button>
                </div>
            </div>
        );
    }

    if (gameState === 'gameover') {
         return (
            <div className="flex flex-col h-full bg-[#312e2b] items-center justify-center p-8 text-center text-white">
                <div className="mb-6">
                    {score > 10 ? <Trophy className="w-20 h-20 text-yellow-500" /> : <X className="w-20 h-20 text-red-500" />}
                </div>
                <h1 className="text-4xl font-bold mb-2">Game Over</h1>
                <h2 className="text-6xl font-black mb-6 text-orange-500">{score}</h2>
                <p className="text-gray-400 mb-8">Puzzles Solved</p>

                <div className="flex gap-4">
                     <button
                        onClick={() => setGameState('start')}
                        className="bg-[#383531] hover:bg-[#45423e] text-white font-bold py-3 px-8 rounded-lg shadow-lg"
                     >
                        Main Menu
                     </button>
                     <button
                        onClick={startGame}
                        className="bg-chess-green hover:bg-chess-greenHover text-white font-bold py-3 px-8 rounded-lg shadow-[0_4px_0_0_#457524] active:shadow-none active:translate-y-[4px] transition-all flex items-center gap-2"
                     >
                        <RefreshCcw className="w-5 h-5" /> Play Again
                     </button>
                </div>
            </div>
         );
    }

    return (
        <div className="flex flex-col lg:flex-row h-full md:h-screen w-full overflow-hidden bg-chess-dark">
            {/* Board Area */}
            <div className="flex-none lg:flex-1 flex flex-col items-center justify-center p-2 lg:p-4 bg-[#312e2b] relative">
                 <div className="w-full max-w-[400px] lg:max-w-[85vh] aspect-square relative shadow-2xl rounded-sm ring-4 ring-black/10">
                     <Chessboard
                        fen={fen}
                        onMove={handleMove}
                        boardOrientation={currentPuzzle.color === 'w' ? 'white' : 'black'}
                        interactable={!isOpponentMoving}
                        customSquareStyles={wrongMove ? {
                             // Flash board red on wrong move? Or just rely on sound/strikes
                             // Currently component handles wrong move feedback internally usually, but here we reset it.
                             // Let's rely on standard handling.
                        } : {}}
                     />

                     {/* Strikes Overlay */}
                     {wrongMove && (
                         <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                             <X className="w-32 h-32 text-red-600 drop-shadow-2xl animate-ping" />
                         </div>
                     )}
                 </div>
            </div>

            {/* Sidebar Stats */}
            <div className="flex-1 lg:flex-none w-full lg:w-[350px] bg-[#262522] flex flex-col border-l border-white/10 shrink-0 h-auto lg:h-auto z-10 p-6 shadow-2xl">

                <div className="flex justify-between items-center mb-8">
                     <button onClick={() => setGameState('gameover')} className="text-gray-500 hover:text-white">
                         <X className="w-8 h-8" />
                     </button>
                     <div className="flex items-center gap-2 bg-[#1b1a19] px-4 py-2 rounded-full border border-white/5">
                         <Timer className={`w-6 h-6 ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`} />
                         <span className={`text-2xl font-mono font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-white'}`}>
                             {formatTime(timeLeft)}
                         </span>
                     </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#1b1a19] p-6 rounded-xl border border-white/5 flex flex-col items-center">
                        <span className="text-gray-400 font-bold uppercase text-xs mb-2 tracking-widest">Score</span>
                        <span className="text-6xl font-black text-white">{score}</span>
                    </div>

                    <div className="flex justify-center gap-4">
                        {[0, 1, 2].map(i => (
                            <div key={i} className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                ${i < strikes ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-[#1b1a19] border-white/10 text-gray-700'}
                            `}>
                                <X className="w-8 h-8" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-auto pt-6 text-center">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Best</span>
                    <div className="text-2xl font-bold text-yellow-500">{highScore}</div>
                </div>

            </div>
        </div>
    );
};

export default PuzzleRushInterface;
