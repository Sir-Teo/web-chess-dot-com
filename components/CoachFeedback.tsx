import React from 'react';
import { AlertCircle, CheckCircle, HelpCircle, XCircle, Info } from 'lucide-react';

interface CoachFeedbackProps {
    feedback: {
        message: string;
        type: 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'neutral';
        bestMove?: string;
    } | null;
    isThinking: boolean;
    onClose: () => void;
}

const CoachFeedback: React.FC<CoachFeedbackProps> = ({ feedback, isThinking, onClose }) => {
    if (!feedback && !isThinking) return null;

    return (
        <div className="absolute top-20 right-4 lg:right-[450px] z-50 animate-in slide-in-from-right fade-in duration-300 pointer-events-none">
            <div className="flex items-start gap-3 max-w-xs pointer-events-auto">
                <div className="relative shrink-0">
                    <img
                        src="https://www.chess.com/bundles/web/images/coach/marty.png"
                        alt="Coach"
                        className="w-14 h-14 rounded-full border-4 border-white shadow-lg bg-gray-200"
                        onError={(e) => (e.currentTarget.src = 'https://www.chess.com/bundles/web/images/user-image.svg')}
                    />
                    {feedback && (
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                            feedback.type === 'best' || feedback.type === 'good' ? 'bg-chess-green' :
                            feedback.type === 'blunder' ? 'bg-red-500' :
                            feedback.type === 'mistake' ? 'bg-orange-500' : 'bg-yellow-400'
                        }`}>
                            {feedback.type === 'best' && <CheckCircle className="w-4 h-4 text-white" />}
                            {feedback.type === 'good' && <CheckCircle className="w-4 h-4 text-white" />}
                            {feedback.type === 'blunder' && <XCircle className="w-4 h-4 text-white" />}
                            {feedback.type === 'mistake' && <AlertCircle className="w-4 h-4 text-white" />}
                            {feedback.type === 'inaccuracy' && <HelpCircle className="w-4 h-4 text-white" />}
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <div className="bg-white text-[#2b2926] p-3 rounded-2xl rounded-tl-none shadow-xl border border-black/5 relative">
                         {isThinking ? (
                             <div className="flex items-center gap-2 text-gray-500">
                                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                             </div>
                         ) : feedback ? (
                             <>
                                <p className="font-bold text-sm mb-1">{getHeader(feedback.type)}</p>
                                <p className="text-sm leading-snug">{feedback.message}</p>
                                {feedback.bestMove && feedback.type !== 'best' && (
                                    <div className="mt-2 text-xs font-mono bg-gray-100 p-1 rounded text-gray-600 inline-block border border-gray-200">
                                        Best: {feedback.bestMove}
                                    </div>
                                )}
                             </>
                         ) : null}
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="bg-black/50 hover:bg-black/70 text-white rounded-full p-1 self-center backdrop-blur-sm transition-colors"
                >
                    <XCircle className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

const getHeader = (type: string) => {
    switch (type) {
        case 'best': return 'Perfect!';
        case 'good': return 'Good job.';
        case 'inaccuracy': return 'Inaccuracy';
        case 'mistake': return 'Mistake';
        case 'blunder': return 'Blunder!';
        default: return 'Coach';
    }
};

export default CoachFeedback;
