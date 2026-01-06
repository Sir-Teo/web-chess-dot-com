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
        // Positioned absolutely relative to the board container
        <div className="absolute top-2 right-2 z-30 animate-in slide-in-from-right fade-in duration-300 pointer-events-none max-w-[260px] md:max-w-[280px]">
            <div className="flex items-start gap-2 pointer-events-auto flex-row-reverse">
                <div className="relative shrink-0 pt-0">
                    <img
                        src="https://www.chess.com/bundles/web/images/coach/marty.png"
                        alt="Coach"
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-md bg-gray-200 object-cover"
                        onError={(e) => (e.currentTarget.src = 'https://www.chess.com/bundles/web/images/user-image.svg')}
                    />
                    {feedback && (
                        <div className={`absolute bottom-0 -left-1 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                            feedback.type === 'best' || feedback.type === 'excellent' ? 'bg-chess-green' :
                            feedback.type === 'blunder' || feedback.type === 'missed-win' ? 'bg-[#fa412d]' :
                            feedback.type === 'mistake' ? 'bg-[#ffa459]' :
                            feedback.type === 'inaccuracy' ? 'bg-[#f7c045]' : 'bg-[#96bc4b]'
                        }`}>
                            {(feedback.type === 'best' || feedback.type === 'excellent' || feedback.type === 'good') && <CheckCircle className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />}
                            {(feedback.type === 'blunder' || feedback.type === 'missed-win') && <XCircle className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />}
                            {feedback.type === 'mistake' && <AlertCircle className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />}
                            {feedback.type === 'inaccuracy' && <HelpCircle className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />}
                        </div>
                    )}
                </div>

                <div className="flex-1 mr-1">
                    <div className="bg-white text-[#2b2926] p-2 md:p-3 rounded-lg rounded-tr-none shadow-xl border border-black/10 relative">
                         {/* Speech Bubble Tail */}
                         <div className="absolute top-3 -right-[8px] w-0 h-0 border-t-[8px] border-t-white border-r-[8px] border-r-transparent drop-shadow-sm transform rotate-90"></div>

                         {isThinking ? (
                             <div className="flex items-center gap-1 h-6 px-1">
                                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                             </div>
                         ) : feedback ? (
                             <div className="flex flex-col gap-0.5">
                                <div className="flex items-center justify-between gap-2">
                                    <span className={`font-extrabold text-[10px] md:text-xs uppercase tracking-wide flex items-center gap-1 truncate
                                        ${feedback.type === 'blunder' || feedback.type === 'missed-win' ? 'text-[#fa412d]' :
                                          feedback.type === 'mistake' ? 'text-[#ffa459]' :
                                          feedback.type === 'best' ? 'text-chess-green' : 'text-gray-500'
                                        }`}>
                                        {feedback.type === 'missed-win' && <Trophy className="w-3 h-3" />}
                                        {getHeader(feedback.type)}
                                    </span>
                                    <button onClick={onClose} className="text-gray-300 hover:text-gray-500 shrink-0">
                                        <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </button>
                                </div>

                                <p className="text-xs md:text-sm font-medium leading-snug">{feedback.message}</p>

                                {feedback.reason && (
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                         <p className="text-[10px] md:text-xs text-gray-500 italic">
                                            "{feedback.reason}"
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            {/* Explain Button (Mock functionality as per request) */}
                                            <button className="text-[10px] font-bold text-chess-green hover:underline flex items-center gap-1">
                                                <Lightbulb className="w-3 h-3" />
                                                Why?
                                            </button>
                                        </div>
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

export default CoachFeedback;
