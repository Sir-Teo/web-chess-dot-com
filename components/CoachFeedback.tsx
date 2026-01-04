import React from 'react';
import { AlertCircle, CheckCircle, HelpCircle, XCircle, Trophy, Lightbulb } from 'lucide-react';

interface CoachFeedbackProps {
    feedback: {
        message: string;
        type: 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'neutral' | 'excellent' | 'missed-win';
        bestMove?: string;
        reason?: string;
    } | null;
    isThinking: boolean;
    onClose: () => void;
}

const CoachFeedback: React.FC<CoachFeedbackProps> = ({ feedback, isThinking, onClose }) => {
    if (!feedback && !isThinking) return null;

    return (
        <div className="absolute top-16 right-4 lg:right-[460px] z-30 animate-in slide-in-from-right fade-in duration-300 pointer-events-none w-[280px]">
            <div className="flex items-start gap-3 pointer-events-auto group">
                <div className="relative shrink-0 pt-2">
                    <img
                        src="https://www.chess.com/bundles/web/images/coach/marty.png"
                        alt="Coach"
                        className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-gray-200 object-cover"
                        onError={(e) => (e.currentTarget.src = 'https://www.chess.com/bundles/web/images/user-image.svg')}
                    />
                    {feedback && (
                        <div className={`absolute bottom-0 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                            feedback.type === 'best' || feedback.type === 'excellent' ? 'bg-chess-green' :
                            feedback.type === 'blunder' || feedback.type === 'missed-win' ? 'bg-[#fa412d]' :
                            feedback.type === 'mistake' ? 'bg-[#ffa459]' :
                            feedback.type === 'inaccuracy' ? 'bg-[#f7c045]' : 'bg-[#96bc4b]'
                        }`}>
                            {(feedback.type === 'best' || feedback.type === 'excellent' || feedback.type === 'good') && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                            {(feedback.type === 'blunder' || feedback.type === 'missed-win') && <XCircle className="w-3.5 h-3.5 text-white" />}
                            {feedback.type === 'mistake' && <AlertCircle className="w-3.5 h-3.5 text-white" />}
                            {feedback.type === 'inaccuracy' && <HelpCircle className="w-3.5 h-3.5 text-white" />}
                        </div>
                    )}
                </div>

                <div className="flex-1 mt-2">
                    <div className="bg-white text-[#2b2926] p-3 rounded-lg rounded-tl-none shadow-xl border border-black/10 relative">
                         {/* Speech Bubble Tail */}
                         <div className="absolute top-0 left-[-8px] w-0 h-0 border-t-[8px] border-t-white border-l-[8px] border-l-transparent drop-shadow-sm"></div>

                         {isThinking ? (
                             <div className="flex items-center gap-1 h-6 px-1">
                                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                             </div>
                         ) : feedback ? (
                             <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className={`font-extrabold text-xs uppercase tracking-wide flex items-center gap-1
                                        ${feedback.type === 'blunder' || feedback.type === 'missed-win' ? 'text-[#fa412d]' :
                                          feedback.type === 'mistake' ? 'text-[#ffa459]' :
                                          feedback.type === 'best' ? 'text-chess-green' : 'text-gray-500'
                                        }`}>
                                        {feedback.type === 'missed-win' && <Trophy className="w-3 h-3" />}
                                        {getHeader(feedback.type)}
                                    </span>
                                    <button onClick={onClose} className="text-gray-300 hover:text-gray-500">
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </div>

                                <p className="text-sm font-medium leading-snug">{feedback.message}</p>

                                {feedback.reason && (
                                    <p className="text-xs text-gray-500 italic mt-1 border-t border-gray-100 pt-1">
                                        "{feedback.reason}"
                                    </p>
                                )}

                                {feedback.bestMove && feedback.type !== 'best' && (
                                    <div className="mt-2 flex gap-2">
                                        <button className="flex-1 bg-[#f1f1f1] hover:bg-[#e5e5e5] text-xs font-bold py-1.5 rounded text-gray-700 transition-colors flex items-center justify-center gap-1 border border-black/5">
                                            <Lightbulb className="w-3 h-3" />
                                            Show Best
                                        </button>
                                    </div>
                                )}
                             </div>
                         ) : null}
                    </div>
                </div>
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
