import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { CheckCircle, XCircle, RotateCcw, Calendar, Share2, ArrowLeft } from 'lucide-react';
import Chessboard from './Chessboard';
import { PUZZLES, Puzzle } from '../utils/puzzles';
import { useGameSound } from '../hooks/useGameSound';

interface DailyPuzzleInterfaceProps {
    onNavigate: (view: string) => void;
}

const DailyPuzzleInterface: React.FC<DailyPuzzleInterfaceProps> = ({ onNavigate }) => {
    const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState('');
    const [status, setStatus] = useState<'solving' | 'solved' | 'failed' | 'complete'>('solving');
    const [moveIndex, setMoveIndex] = useState(0);
    const [isOpponentMoving, setIsOpponentMoving] = useState(false);
    const [wrongMove, setWrongMove] = useState(false);
    const [alreadySolvedToday, setAlreadySolvedToday] = useState(false);

    const { playSound } = useGameSound();

    // Select Daily Puzzle
    useEffect(() => {
        // Deterministic selection based on date
        const today = new Date();
        const start = new Date(today.getFullYear(), 0, 0);
        const diff = (today.getTime() - start.getTime()) + ((start.getTimezoneOffset() - today.getTimezoneOffset()) * 60 * 1000);
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

        const puzzleIndex = dayOfYear % PUZZLES.length;
        const dailyPuzzle = PUZZLES[puzzleIndex];

        setPuzzle(dailyPuzzle);
        setGame(new Chess(dailyPuzzle.fen));
        setFen(dailyPuzzle.fen);

        // Check Local Storage
        const solvedKey = `daily_puzzle_solved_${today.getFullYear()}_${today.getMonth()}_${today.getDate()}`;
        if (localStorage.getItem(solvedKey)) {
            setAlreadySolvedToday(true);
            setStatus('complete');
        }
    }, []);

    const markSolved = () => {
        const today = new Date();
        const solvedKey = `daily_puzzle_solved_${today.getFullYear()}_${today.getMonth()}_${today.getDate()}`;
        localStorage.setItem(solvedKey, 'true');
        setStatus('solved');
        setAlreadySolvedToday(true);
        playSound('notify');
    };

    const handleMove = useCallback((from: string, to: string, promotion: string = 'q') => {
        if (!puzzle || status !== 'solving' || isOpponentMoving) return;

        try {
            const tempGame = new Chess(game.fen());

             // Promotion check
            const piece = tempGame.get(from as any);
            const isPromotion = piece?.type === 'p' && (
                (piece.color === 'w' && to[1] === '8') ||
                (piece.color === 'b' && to[1] === '1')
            );
            const moveConfig = { from, to, promotion: isPromotion ? promotion : undefined };

            const move = tempGame.move(moveConfig);
            if (!move) return;

            const expectedMove = puzzle.moves[moveIndex];
            const playedUci = move.from + move.to + (move.promotion || '');
            const isCorrect = playedUci === expectedMove || (expectedMove.length === 4 && playedUci.startsWith(expectedMove));

            if (isCorrect) {
                setGame(tempGame);
                setFen(tempGame.fen());
                playSound('move');

                const nextIndex = moveIndex + 1;
                if (nextIndex >= puzzle.moves.length) {
                    markSolved();
                } else {
                    setMoveIndex(nextIndex);
                    setIsOpponentMoving(true);

                    setTimeout(() => {
                        const oppMoveUci = puzzle.moves[nextIndex];
                        const from = oppMoveUci.substring(0, 2);
                        const to = oppMoveUci.substring(2, 4);
                        const prom = oppMoveUci.length > 4 ? oppMoveUci.substring(4, 5) : 'q';

                        const reply = tempGame.move({ from, to, promotion: prom });
                        if (reply) {
                            setGame(new Chess(tempGame.fen()));
                            setFen(tempGame.fen());
                            playSound('move');
                            setMoveIndex(nextIndex + 1);
                        }
                        setIsOpponentMoving(false);
                    }, 600);
                }
            } else {
                // Wrong move
                const originalFen = game.fen();
                setGame(tempGame);
                setFen(tempGame.fen());
                playSound('illegal');
                setWrongMove(true);
                setStatus('failed');

                // Allow retry after delay or keep failed state?
                // Standard Daily Puzzle allows retry but maybe marks as "failed attempt"
                setTimeout(() => {
                     setGame(new Chess(originalFen));
                     setFen(originalFen);
                     setWrongMove(false);
                     setStatus('solving');
                }, 1000);
            }

        } catch (e) { console.error(e); }
    }, [game, puzzle, status, isOpponentMoving, moveIndex, playSound]);

    const handleRetry = () => {
        if (!puzzle) return;
        setGame(new Chess(puzzle.fen));
        setFen(puzzle.fen);
        setMoveIndex(0);
        setStatus('solving');
        setIsOpponentMoving(false);
        setWrongMove(false);
    };

    if (!puzzle) return <div className="text-white p-8">Loading...</div>;

    return (
        <div className="flex flex-col lg:flex-row h-full md:h-screen w-full overflow-hidden bg-chess-dark">
            <div className="flex-none lg:flex-1 flex flex-col items-center justify-center p-2 lg:p-4 bg-[#312e2b]">
                 <div className="w-full max-w-[400px] lg:max-w-[85vh] aspect-square relative shadow-2xl rounded-sm ring-4 ring-black/10">
                     <Chessboard
                        fen={fen}
                        onMove={handleMove}
                        boardOrientation={puzzle.color === 'w' ? 'white' : 'black'}
                        interactable={status === 'solving' && !isOpponentMoving}
                        customSquareStyles={wrongMove ? {} : {}}
                     />

                     {status === 'solved' || status === 'complete' ? (
                         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-in fade-in">
                             <div className="bg-[#262421] p-8 rounded-lg border border-white/10 text-center shadow-2xl transform scale-100">
                                 <CheckCircle className="w-16 h-16 text-chess-green mx-auto mb-4" />
                                 <h2 className="text-3xl font-bold text-white mb-2">Solved!</h2>
                                 <p className="text-gray-400 mb-6">You completed today's puzzle.</p>
                                 <div className="flex gap-4 justify-center">
                                      <button
                                          onClick={() => onNavigate('dashboard')}
                                          className="bg-[#383531] hover:bg-[#45423e] text-white font-bold py-2 px-6 rounded-lg shadow-lg"
                                      >
                                          Home
                                      </button>
                                      <button
                                          onClick={() => onNavigate('puzzles')}
                                          className="bg-chess-green hover:bg-chess-greenHover text-white font-bold py-2 px-6 rounded-lg shadow-lg"
                                      >
                                          More Puzzles
                                      </button>
                                 </div>
                             </div>
                         </div>
                     ) : null}
                 </div>
            </div>

            <div className="flex-1 lg:flex-none w-full lg:w-[400px] bg-[#262522] flex flex-col border-l border-white/10 shrink-0 h-auto lg:h-auto z-10 shadow-2xl">
                 <div className="p-6 border-b border-white/5 bg-[#211f1c]">
                     <div className="flex items-center gap-4 mb-2">
                         <button onClick={() => onNavigate('dashboard')} className="text-gray-400 hover:text-white">
                             <ArrowLeft className="w-6 h-6" />
                         </button>
                         <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                             <Calendar className="w-6 h-6 text-chess-green" />
                             Daily Puzzle
                         </h1>
                     </div>
                     <p className="text-gray-400 ml-10">
                         {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                     </p>
                 </div>

                 <div className="flex-1 p-8 flex flex-col items-center text-center">
                     <h2 className="text-xl font-bold text-white mb-6">
                         {puzzle.color === 'w' ? "White to Move" : "Black to Move"}
                     </h2>

                     <div className="bg-[#1b1a19] p-6 rounded-lg border border-white/5 w-full mb-8">
                         <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                             <span className="text-gray-400 text-sm font-bold uppercase">Theme</span>
                             <span className="text-chess-green font-bold">{puzzle.theme}</span>
                         </div>
                         <div className="flex justify-between items-center">
                             <span className="text-gray-400 text-sm font-bold uppercase">Rating</span>
                             <span className="text-white font-bold">{puzzle.rating}</span>
                         </div>
                     </div>

                     {status === 'complete' && (
                         <div className="w-full bg-chess-green/10 border border-chess-green/30 p-4 rounded-lg mb-6">
                             <p className="text-chess-green font-bold">You have already solved today's puzzle!</p>
                             <button onClick={handleRetry} className="mt-2 text-sm text-gray-300 hover:text-white underline">
                                 Solve Again
                             </button>
                         </div>
                     )}

                     <div className="mt-auto w-full">
                         <button className="w-full bg-[#383531] hover:bg-[#45423e] text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 mb-3">
                             <Share2 className="w-4 h-4" /> Share Puzzle
                         </button>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default DailyPuzzleInterface;
