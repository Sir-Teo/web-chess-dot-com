import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, Award } from 'lucide-react';
import { Chess } from 'chess.js';
import Chessboard from './Chessboard';
import { LESSONS, Lesson, LessonChallenge } from '../utils/lessons';
import { useGameSound } from '../hooks/useGameSound';

interface LessonsInterfaceProps {
    onNavigate?: (view: string) => void;
}

const LessonsInterface: React.FC<LessonsInterfaceProps> = ({ onNavigate }) => {
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const { playSound } = useGameSound();

    // Derived state
    const currentChallenge = selectedLesson?.challenges[currentChallengeIndex];

    useEffect(() => {
        if (selectedLesson && currentChallenge) {
            const newGame = new Chess(currentChallenge.fen);
            setGame(newGame);
            setFen(currentChallenge.fen);
            setShowSuccess(false);
        }
    }, [currentChallengeIndex]); // Only update on index change, select handles initial

    const handleLessonSelect = (lesson: Lesson) => {
        // Initialize state synchronously to prevent FOUC (Flash of Unstyled Content / Wrong Board)
        const firstChallenge = lesson.challenges[0];
        const newGame = new Chess(firstChallenge.fen);

        setSelectedLesson(lesson);
        setCurrentChallengeIndex(0);
        setGame(newGame);
        setFen(firstChallenge.fen);
        setShowSuccess(false);
    };

    const handleBack = () => {
        setSelectedLesson(null);
    };

    const handleMove = (from: string, to: string) => {
        if (!currentChallenge || showSuccess) return;

        try {
            const tempGame = new Chess(game.fen());
            const move = tempGame.move({ from, to, promotion: 'q' });

            if (!move) return;

            const expectedMove = currentChallenge.moves[0]; // Currently only supporting 1-move challenges for simplicity, or sequence start
            const userMoveUci = from + to;

            // Check if move matches expected (simplified for now, full sequence logic would need state)
            // For now, let's assume challenges are single moves or we just validate the first move.
            // If the challenge has multiple moves, we'd need a sub-index.

            // Let's implement simple exact match for now.
            if (userMoveUci === expectedMove || (userMoveUci + 'q') === expectedMove) {
                setGame(tempGame);
                setFen(tempGame.fen());
                playSound('move');
                setShowSuccess(true);
                playSound('notify');
            } else {
                 // Invalid for this lesson
                 const originalFen = game.fen();
                 setGame(tempGame);
                 setFen(tempGame.fen());
                 playSound('move'); // Play move sound first

                 // Snap back
                 setTimeout(() => {
                     const resetGame = new Chess(originalFen);
                     setGame(resetGame);
                     setFen(originalFen);
                 }, 500);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleNextChallenge = () => {
        if (!selectedLesson) return;
        if (currentChallengeIndex < selectedLesson.challenges.length - 1) {
            setCurrentChallengeIndex(prev => prev + 1);
        } else {
            // Lesson Complete
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
                            interactable={!showSuccess}
                        />
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
                         <div className="mb-6">
                            <span className="text-chess-green font-bold uppercase text-xs tracking-wider">
                                Challenge {currentChallengeIndex + 1} of {selectedLesson.challenges.length}
                            </span>
                         </div>

                         {!showSuccess ? (
                             <>
                                <h3 className="text-white text-2xl font-bold mb-4">
                                    {currentChallenge?.instruction}
                                </h3>
                                <p className="text-gray-400">
                                    Make the correct move on the board to continue.
                                </p>
                             </>
                         ) : (
                             <div className="animate-in fade-in zoom-in duration-300">
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
