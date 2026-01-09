import React from 'react';
import { X, Check, ArrowRight } from 'lucide-react';

interface CoachFeedbackProps {
    feedback: {
        message: string;
        type: 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'neutral' | 'excellent' | 'missed-win';
        scoreDiff?: number;
        bestMove?: string;
        reason?: string;
    } | null;
    isThinking: boolean;
    onClose: () => void;
}

const CoachFeedback: React.FC<CoachFeedbackProps> = ({ feedback, isThinking, onClose }) => {
    if (isThinking) {
        return (
             <div className="absolute top-4 right-4 z-30 animate-in fade-in slide-in-from-right-4">
                <div className="bg-white text-black p-3 rounded-lg shadow-xl border-l-4 border-gray-400 flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    <span className="font-bold text-sm">Coach is analyzing...</span>
                </div>
            </div>
        );
    }

    if (!feedback) return null;

    let borderColor = 'border-gray-400';
    let icon = <Check className="w-5 h-5 text-gray-500" />;
    let bgColor = 'bg-white';

    switch (feedback.type) {
        case 'best':
        case 'excellent':
             borderColor = 'border-[#81b64c]';
             icon = <Check className="w-5 h-5 text-[#81b64c]" />;
             break;
        case 'good':
             borderColor = 'border-[#96bc4b]';
             icon = <Check className="w-5 h-5 text-[#96bc4b]" />;
             break;
        case 'inaccuracy':
             borderColor = 'border-[#f7c045]'; // Yellow
             icon = <div className="text-[#f7c045] font-bold text-lg">?!</div>;
             break;
        case 'mistake':
             borderColor = 'border-[#ffa459]'; // Orange
             icon = <div className="text-[#ffa459] font-bold text-lg">?</div>;
             break;
        case 'blunder':
        case 'missed-win':
             borderColor = 'border-[#fa412d]'; // Red
             icon = <div className="text-[#fa412d] font-bold text-lg">??</div>;
             break;
    }

    return (
        <div className="absolute top-4 right-4 z-30 animate-in fade-in slide-in-from-right-4 max-w-[280px]">
            <div className={`bg-white text-black p-4 rounded-lg shadow-xl border-l-4 ${borderColor} relative`}>
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-black"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                        {icon}
                    </div>
                    <div>
                        <h4 className="font-black text-lg leading-tight">{feedback.message}</h4>
                        {feedback.scoreDiff && Math.abs(feedback.scoreDiff) > 0 && (
                            <span className="text-xs font-bold text-gray-500">
                                {feedback.scoreDiff > 0 ? `+${(feedback.scoreDiff / 100).toFixed(1)}` : (feedback.scoreDiff / 100).toFixed(1)}
                            </span>
                        )}
                    </div>
                </div>

                <p className="text-sm text-gray-600 font-medium leading-snug mb-2">
                    {feedback.reason}
                </p>

                {feedback.bestMove && feedback.type !== 'best' && (
                     <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2 text-xs font-bold text-gray-500">
                         <span>Best was</span>
                         <span className="bg-gray-200 px-1.5 py-0.5 rounded text-black font-mono">
                             {feedback.bestMove}
                         </span>
                     </div>
                )}
            </div>
        </div>
    );
};

export default CoachFeedback;
