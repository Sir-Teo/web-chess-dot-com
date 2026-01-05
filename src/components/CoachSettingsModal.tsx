import React from 'react';
import { X, Check } from 'lucide-react';
import { CoachSettings } from '../hooks/useCoach';

interface CoachSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: CoachSettings;
    onUpdateSettings: (settings: CoachSettings) => void;
}

const CoachSettingsModal: React.FC<CoachSettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
    if (!isOpen) return null;

    const toggleSetting = (key: keyof CoachSettings) => {
        onUpdateSettings({
            ...settings,
            [key]: !settings[key]
        });
    };

    return (
        <div className="absolute top-10 right-0 z-50 animate-in fade-in zoom-in-95 duration-200 w-64">
            <div className="bg-[#262522] text-white rounded-lg shadow-2xl border border-white/10 p-4">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
                    <h3 className="font-bold text-sm text-gray-200">Coach Settings</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSetting('showSuggestionArrows')}>
                        <span className="text-sm font-semibold text-gray-300">Suggestion Arrows</span>
                         <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.showSuggestionArrows ? 'bg-chess-green' : 'bg-gray-600'}`}>
                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.showSuggestionArrows ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSetting('showThreatArrows')}>
                        <span className="text-sm font-semibold text-gray-300">Threat Arrows</span>
                         <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.showThreatArrows ? 'bg-chess-green' : 'bg-gray-600'}`}>
                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.showThreatArrows ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSetting('showEvalBar')}>
                        <span className="text-sm font-semibold text-gray-300">Evaluation Bar</span>
                         <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.showEvalBar ? 'bg-chess-green' : 'bg-gray-600'}`}>
                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.showEvalBar ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSetting('showFeedback')}>
                        <span className="text-sm font-semibold text-gray-300">Move Feedback</span>
                         <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.showFeedback ? 'bg-chess-green' : 'bg-gray-600'}`}>
                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.showFeedback ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoachSettingsModal;
