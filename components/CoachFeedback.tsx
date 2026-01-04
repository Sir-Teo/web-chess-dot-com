import React from 'react';
import { AlertCircle, CheckCircle, HelpCircle, XCircle, Trophy } from 'lucide-react';

interface CoachFeedbackProps {
    feedback: {
        message: string;
        type: 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'neutral' | 'excellent' | 'missed-win';
        bestMove?: string;
    } | null;
    isThinking: boolean;
    onClose: () => void;
}

const CoachFeedback: React.FC<CoachFeedbackProps> = ({ feedback, isThinking, onClose }) => {
    if (!feedback && !isThinking) return null;

    return (
        <div className="absolute top-20 right-4 lg:right-[450px] z-50 animate-in slide-in-from-right fade-in duration-300 pointer-events-none">
            <div className="flex items-start gap-3 max-w-xs pointer-events-auto group">
                <div className="relative shrink-0">
                    <img
                        src="https://www.chess.com/bundles/web/images/coach/marty.png"
                        alt="Coach"
                        className="w-16 h-16 rounded-full border-4 border-white shadow-lg bg-gray-200 object-cover"
                        onError={(e) => (e.currentTarget.src = 'https://www.chess.com/bundles/web/images/user-image.svg')}
                    />
                    {feedback && (
                        <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                            feedback.type === 'best' || feedback.type === 'excellent' ? 'bg-chess-green' :
                            feedback.type === 'blunder' || feedback.type === 'missed-win' ? 'bg-[#fa412d]' :
                            feedback.type === 'mistake' ? 'bg-[#ffa459]' :
                            feedback.type === 'inaccuracy' ? 'bg-[#f7c045]' : 'bg-[#96bc4b]'
                        }`}>
                            {(feedback.type === 'best' || feedback.type === 'excellent' || feedback.type === 'good') && <CheckCircle className="w-4 h-4 text-white" />}
                            {(feedback.type === 'blunder' || feedback.type === 'missed-win') && <XCircle className="w-4 h-4 text-white" />}
                            {feedback.type === 'mistake' && <AlertCircle className="w-4 h-4 text-white" />}
                            {feedback.type === 'inaccuracy' && <HelpCircle className="w-4 h-4 text-white" />}
                        </div>
                    )}
                </div>

                <div className="flex-1 mt-2">
                    <div className="bg-white text-[#2b2926] p-4 rounded-2xl rounded-tl-none shadow-xl border border-black/5 relative after:content-[''] after:absolute after:top-0 after:-left-[10px] after:w-0 after:h-0 after:border-t-[10px] after:border-t-white after:border-l-[10px] after:border-l-transparent drop-shadow-sm">
                         {isThinking ? (
                             <div className="flex items-center gap-1.5 h-5">
                                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                             </div>
                         ) : feedback ? (
                             <>
                                <p className="font-extrabold text-sm mb-1 uppercase tracking-wide text-gray-500 flex items-center gap-1">
                                    {feedback.type === 'missed-win' && <Trophy className="w-3 h-3 text-[#fa412d]" />}
                                    {getHeader(feedback.type)}
                                </p>
                                <p className="text-[15px] font-medium leading-snug">{feedback.message}</p>
                                {feedback.bestMove && feedback.type !== 'best' && (
                                    <div className="mt-2 text-xs font-mono bg-gray-100 p-1.5 rounded text-gray-600 inline-block border border-gray-200">
                                        Best: <span className="font-bold text-black">{formatMove(feedback.bestMove)}</span>
                                    </div>
                                )}
                             </>
                         ) : null}
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="bg-black/50 hover:bg-black/70 text-white rounded-full p-1 self-center backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                >
                    <XCircle className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const getHeader = (type: string) => {
    switch (type) {
        case 'best': return 'Best Move';
        case 'excellent': return 'Excellent';
        case 'good': return 'Good';
        case 'inaccuracy': return 'Inaccuracy';
        case 'mistake': return 'Mistake';
        case 'blunder': return 'Blunder';
        case 'missed-win': return 'Missed Win';
        default: return 'Coach';
    }
};

const formatMove = (uci: string) => {
    if (!uci || uci.length < 4) return uci;
    return `${uci.substring(0, 2)} ➝ ${uci.substring(2, 4)}`;
};

export default CoachFeedback;
