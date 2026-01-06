import React from 'react';
import { X, Settings } from 'lucide-react';
import { CoachSettings } from '../hooks/useCoach';

interface CoachSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: CoachSettings;
    onSettingsChange: (settings: CoachSettings) => void;
}

const CoachSettingsModal: React.FC<CoachSettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
  if (!isOpen) return null;

  const handleChange = (key: keyof CoachSettings, value: boolean) => {
      onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <>
      <style>{`
        @keyframes animate-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-in {
          animation: animate-in 0.2s ease-out;
        }
      `}</style>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in">
        <div className="bg-[#262522] w-full max-w-md rounded-lg shadow-xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#211f1c]">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-chess-green" />
              <h2 className="text-white font-bold text-lg">Coach Settings</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <div className="space-y-6">
                {/* Visual Aids */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Visual Aids</h3>
                    <div className="space-y-3">
                        <Toggle
                            label="Move Suggestions"
                            description="Show arrows for best moves"
                            checked={settings.showSuggestionArrows}
                            onChange={(v) => handleChange('showSuggestionArrows', v)}
                        />
                        <Toggle
                            label="Show Threats"
                            description="Highlight opponent's threats"
                            checked={settings.showThreatArrows}
                            onChange={(v) => handleChange('showThreatArrows', v)}
                        />
                        <Toggle
                            label="Evaluation Bar"
                            description="Show advantage graph"
                            checked={settings.showEvalBar}
                            onChange={(v) => handleChange('showEvalBar', v)}
                        />
                    </div>
                </div>

                {/* Feedback */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Feedback</h3>
                     <div className="space-y-3">
                        <Toggle
                            label="Coach Feedback"
                            description="Show text explanations for moves"
                            checked={settings.showFeedback}
                            onChange={(v) => handleChange('showFeedback', v)}
                        />
                     </div>
                </div>
            </div>
          </div>

          <div className="p-4 bg-[#211f1c] border-t border-white/10 flex justify-end">
            <button
                onClick={onClose}
                className="bg-chess-green hover:bg-chess-greenHover text-white font-bold py-2 px-6 rounded shadow transition-colors"
            >
                Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const Toggle = ({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between group cursor-pointer" onClick={() => onChange(!checked)}>
        <div>
            <div className="text-white font-bold text-sm">{label}</div>
            <div className="text-xs text-gray-400">{description}</div>
        </div>
        <div className={`w-12 h-6 rounded-full relative transition-colors ${checked ? 'bg-chess-green' : 'bg-[#383531]'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'left-7' : 'left-1'}`} />
        </div>
    </div>
);

export default CoachSettingsModal;
