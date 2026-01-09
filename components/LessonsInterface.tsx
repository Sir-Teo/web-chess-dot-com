import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, CheckCircle, Award, RotateCcw } from 'lucide-react';
import { Chess } from 'chess.js';
import Chessboard from './Chessboard';
import { LESSONS, Lesson, LessonChallenge } from '../src/utils/lessons';
import { useGameSound } from '../hooks/useGameSound';
import { useLessonProgress } from '../hooks/useLessonProgress';

interface LessonsInterfaceProps {
    onNavigate?: (view: string) => void;
}

const LessonsInterface: React.FC<LessonsInterfaceProps> = ({ onNavigate }) => {
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // Multi-move support state
    const [moveIndex, setMoveIndex] = useState(0);
    const [isOpponentMoving, setIsOpponentMoving] = useState(false);
    const [wrongMove, setWrongMove] = useState(false);

    const { playSound } = useGameSound();
    const { markLessonComplete, isLessonComplete } = useLessonProgress();

    // Derived state
    const currentChallenge = selectedLesson?.challenges[currentChallengeIndex];

    // Initialize or Reset Challenge
    useEffect(() => {
        if (selectedLesson && currentChallenge) {
            const newGame = new Chess(currentChallenge.fen);
            setGame(newGame);
            setFen(currentChallenge.fen);
            setShowSuccess(false);
            setMoveIndex(0);
            setIsOpponentMoving(false);
            setWrongMove(false);
        }
    }, [currentChallengeIndex, selectedLesson]);

    const handleLessonSelect = (lesson: Lesson) => {
        setSelectedLesson(lesson);
        setCurrentChallengeIndex(0);
    };

    const handleBack = () => {
        setSelectedLesson(null);
    };

    const handleRetry = () => {
        if (currentChallenge) {
            const newGame = new Chess(currentChallenge.fen);
            setGame(newGame);
            setFen(currentChallenge.fen);
            setMoveIndex(0);
            setIsOpponentMoving(false);
            setWrongMove(false);
            setShowSuccess(false);
        }
    };

    const handleMove = useCallback((from: string, to: string, promotion: string = 'q') => {
        if (!currentChallenge || showSuccess || isOpponentMoving) return;

        try {
            const tempGame = new Chess(game.fen());

            // Check for promotion logic if needed, though usually standard in chess.js
            // But we need to ensure the move object includes promotion if strictly required
            // For UI simplicity, we default to 'q' in callback, but let's check pawn rank
            const piece = tempGame.get(from as any);
            const isPromotion = piece?.type === 'p' && (
                (piece.color === 'w' && to[1] === '8') ||
                (piece.color === 'b' && to[1] === '1')
            );

            const moveConfig: { from: string, to: string, promotion?: string } = { from, to };
            if (isPromotion) moveConfig.promotion = promotion;

            const move = tempGame.move(moveConfig);
            if (!move) return;

            const expectedMove = currentChallenge.moves[moveIndex];
            const userMoveUci = move.from + move.to + (move.promotion || '');

            // Flexible match (ignore promotion if expected doesn't specify it, or handle "e7e8q")
            const isCorrect = userMoveUci === expectedMove ||
                              (expectedMove.length === 4 && userMoveUci.startsWith(expectedMove));

            if (isCorrect) {
                setGame(tempGame);
                setFen(tempGame.fen());
                playSound('move');
                setWrongMove(false);

                const nextIndex = moveIndex + 1;

                if (nextIndex >= currentChallenge.moves.length) {
                    // Challenge Complete
                    setShowSuccess(true);
                    playSound('notify');
                } else {
                    // Continue Sequence -> Opponent Turn
                    setMoveIndex(nextIndex);
                    setIsOpponentMoving(true);

                    // Opponent Reply
                    setTimeout(() => {
                        try {
                             const opponentMoveUci = currentChallenge.moves[nextIndex];
                             const opFrom = opponentMoveUci.substring(0, 2);
                             const opTo = opponentMoveUci.substring(2, 4);
                             const opProm = opponentMoveUci.length > 4 ? opponentMoveUci.substring(4, 5) : undefined;

                             const opMoveConfig = { from: opFrom, to: opTo, promotion: opProm || 'q' };
                             const reply = tempGame.move(opMoveConfig);

                             if (reply) {
                                 setGame(tempGame);
                                 setFen(tempGame.fen());
                                 playSound('move');
                                 setMoveIndex(nextIndex + 1); // Ready for next user move
                             }
                        } catch (err) {
                            console.error("Opponent move error", err);
                        } finally {
                            setIsOpponentMoving(false);
                        }
                    }, 600);
                }

            } else {
                 // Invalid for this lesson
                 const originalFen = game.fen();
                 setGame(tempGame); // Show the wrong move briefly
                 setFen(tempGame.fen());
                 playSound('move'); // Play move sound

                 setWrongMove(true);
                 // Snap back
                 setTimeout(() => {
                     const resetGame = new Chess(originalFen);
                     setGame(resetGame);
                     setFen(originalFen);
                     setWrongMove(false);
                 }, 800);
            }
        } catch (e) {
            console.error(e);
        }
    }, [game, currentChallenge, moveIndex, showSuccess, isOpponentMoving, playSound]);

    const handleNextChallenge = () => {
        if (!selectedLesson) return;
        if (currentChallengeIndex < selectedLesson.challenges.length - 1) {
            setCurrentChallengeIndex(prev => prev + 1);
        } else {
            // Lesson Complete
            markLessonComplete(selectedLesson.id);
            handleBack();
        }
    };

    if (selectedLesson) {
        return (
            <div className="flex flex-col lg:flex-row h-full md:h-screen w-full overflow-hidden bg-chess-dark">
                {/* Board Area */}
                <div className="flex-none lg:flex-1 flex flex-col items-center justify-center p-2 lg:p-4 bg-[#312e2b]">
                    <div className="w-full max-w-[400px] lg:max-w-[85vh] aspect-square relative">
                        <Chessboard
                            fen={fen}
                            onMove={handleMove}
                            interactable={!showSuccess && !isOpponentMoving}
                        />
                         {isOpponentMoving && (
                             <div className="absolute inset-0 z-10 bg-transparent cursor-wait"></div>
                         )}
                    </div>
                </div>

                {/* Sidebar (Lesson Content) */}
                <div className="flex-1 lg:flex-none w-full lg:w-[400px] bg-[#262522] flex flex-col border-l border-white/10 relative shadow-2xl">
                     <div className="flex items-center gap-2 p-4 border-b border-white/5 bg-[#211f1c]">
                         <button onClick={handleBack} className="text-gray-400 hover:text-white">
                             <ChevronLeft className="w-6 h-6" />
                         </button>
                         <h2 className="text-white font-bold truncate">{selectedLesson.title}</h2>
                     </div>

                     <div className="flex-1 p-6 flex flex-col items-center text-center overflow-y-auto">
                         <div className="mb-6 flex items-center gap-2">
                            <span className="text-chess-green font-bold uppercase text-xs tracking-wider">
                                Challenge {currentChallengeIndex + 1} of {selectedLesson.challenges.length}
                            </span>
                         </div>

                         {!showSuccess ? (
                             <>
                                <h3 className="text-white text-2xl font-bold mb-4">
                                    {currentChallenge?.instruction}
                                </h3>
                                <p className="text-gray-400 mb-6">
                                    {wrongMove ? "That's not the right move. Try again!" : "Make the correct move on the board to continue."}
                                </p>
                                <button
                                    onClick={handleRetry}
                                    className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-semibold"
                                >
                                    <RotateCcw className="w-4 h-4" /> Reset Position
                                </button>
                             </>
                         ) : (
                             <div className="animate-in fade-in zoom-in duration-300 w-full">
                                <div className="w-16 h-16 bg-chess-green rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <CheckCircle className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-white text-2xl font-bold mb-2">Excellent!</h3>
                                <p className="text-gray-300 mb-8">{currentChallenge?.explanation}</p>

                                <button
                                    onClick={handleNextChallenge}
                                    className="bg-chess-green hover:bg-chess-greenHover text-white font-bold py-3 px-8 rounded shadow-lg transform active:scale-95 transition-all w-full"
                                >
                                    {currentChallengeIndex < selectedLesson.challenges.length - 1 ? 'Next Challenge' : 'Finish Lesson'}
                                </button>
                             </div>
                         )}
                     </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-[#312e2b] overflow-y-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Lessons</h1>
                    <p className="text-gray-400">Master the game with our interactive lessons.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {LESSONS.map((lesson) => (
                        <div
                            key={lesson.id}
                            onClick={() => handleLessonSelect(lesson)}
                            className="bg-[#262421] rounded-lg overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform duration-300 shadow-lg border border-white/5 hover:border-white/20"
                        >
                            <div className="aspect-video w-full overflow-hidden relative">
                                <img
                                    src={lesson.image}
                                    alt={lesson.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white uppercase">
                                    {lesson.category}
                                </div>
                                {isLessonComplete(lesson.id) && (
                                     <div className="absolute top-2 right-2 bg-chess-green shadow-lg w-6 h-6 rounded-full flex items-center justify-center z-10">
                                         <CheckCircle className="w-4 h-4 text-white" />
                                     </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                            </div>

                            <div className="p-5">
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-chess-green transition-colors">
                                    {lesson.title}
                                </h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                    {lesson.description}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold">
                                    <Award className="w-4 h-4" />
                                    <span>{lesson.challenges.length} Challenges</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LessonsInterface;
