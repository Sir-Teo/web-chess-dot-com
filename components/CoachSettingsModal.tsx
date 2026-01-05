import React from 'react';
import { X, Check } from 'lucide-react';
import { CoachSettings } from '../hooks/useCoach';

interface CoachSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: CoachSettings;
    onSettingsChange: (newSettings: CoachSettings) => void;
}

const CoachSettingsModal: React.FC<CoachSettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
    if (!isOpen) return null;

    const toggleSetting = (key: keyof CoachSettings) => {
        onSettingsChange({
            ...settings,
            [key]: !settings[key]
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#262522] w-full max-w-[400px] rounded-lg shadow-2xl flex flex-col overflow-hidden border border-white/10 relative">

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-4 border-b border-white/5">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        Coach Settings
                    </h2>
                </div>

                <div className="p-4 space-y-4">

                    {/* Suggestion Arrows */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-white font-semibold">Suggestion Arrows</span>
                            <span className="text-xs text-gray-400">Green arrows for recommended moves</span>
                        </div>
                         <button
                            onClick={() => toggleSetting('showSuggestionArrows')}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.showSuggestionArrows ? 'bg-chess-green' : 'bg-gray-600'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.showSuggestionArrows ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Threat Arrows */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-white font-semibold">Threat Arrows</span>
                            <span className="text-xs text-gray-400">Red arrows for potential threats</span>
                        </div>
                         <button
                            onClick={() => toggleSetting('showThreatArrows')}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.showThreatArrows ? 'bg-chess-green' : 'bg-gray-600'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.showThreatArrows ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Evaluation Bar */}
                    <div className="flex items-center justify-between">
                         <div className="flex flex-col">
                            <span className="text-white font-semibold">Evaluation Bar</span>
                            <span className="text-xs text-gray-400">Shows current game balance</span>
                        </div>
                         <button
                            onClick={() => toggleSetting('showEvalBar')}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.showEvalBar ? 'bg-chess-green' : 'bg-gray-600'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.showEvalBar ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Move Feedback */}
                    <div className="flex items-center justify-between">
                         <div className="flex flex-col">
                            <span className="text-white font-semibold">Move Feedback</span>
                            <span className="text-xs text-gray-400">Insight into move classification</span>
                        </div>
                         <button
                            onClick={() => toggleSetting('showFeedback')}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.showFeedback ? 'bg-chess-green' : 'bg-gray-600'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.showFeedback ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                </div>

                <div className="p-4 bg-[#211f1c] border-t border-white/5 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-chess-green hover:bg-chess-greenHover text-white font-bold py-2 px-6 rounded shadow-lg transition-colors flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Done
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CoachSettingsModal;
