import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';

interface EngineSettings {
    lines: number;
    threads: number;
    hash: number;
}

interface AnalysisSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialSettings: EngineSettings;
    onSave: (settings: EngineSettings) => void;
}

const AnalysisSettingsModal: React.FC<AnalysisSettingsModalProps> = ({
    isOpen,
    onClose,
    initialSettings,
    onSave
}) => {
    const [settings, setSettings] = useState<EngineSettings>(initialSettings);

    // Reset internal state when modal opens or initialSettings change
    useEffect(() => {
        if (isOpen) {
            setSettings(initialSettings);
        }
    }, [isOpen, initialSettings]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(settings);
        onClose();
    };

    const handleReset = () => {
        setSettings({
            lines: 3,
            threads: 1,
            hash: 32
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[#262522] w-full max-w-md rounded-lg shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-[#211f1c] border-b border-white/5">
                    <h2 className="text-lg font-bold text-white">Analysis Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* MultiPV / Lines */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-gray-200 font-medium">Multiple Lines (MultiPV)</label>
                            <span className="text-chess-green font-bold">{settings.lines}</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            step="1"
                            value={settings.lines}
                            onChange={(e) => setSettings({...settings, lines: parseInt(e.target.value)})}
                            className="w-full accent-chess-green h-2 bg-[#302e2b] rounded-lg appearance-none cursor-pointer"
                        />
                        <p className="text-xs text-gray-500">Show multiple best moves. Higher values may slow down analysis.</p>
                    </div>

                    {/* Threads */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-gray-200 font-medium">Threads</label>
                            <span className="text-chess-green font-bold">{settings.threads}</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="8" // Capped at 8 generally safe, browser limits apply
                            step="1"
                            value={settings.threads}
                            onChange={(e) => setSettings({...settings, threads: parseInt(e.target.value)})}
                            className="w-full accent-chess-green h-2 bg-[#302e2b] rounded-lg appearance-none cursor-pointer"
                        />
                         <p className="text-xs text-gray-500">Number of CPU threads to use. Recommended: 1-4 depending on device.</p>
                    </div>

                    {/* Hash Size */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-gray-200 font-medium">Hash Size (MB)</label>
                            <span className="text-chess-green font-bold">{settings.hash} MB</span>
                        </div>
                         <select
                            value={settings.hash}
                            onChange={(e) => setSettings({...settings, hash: parseInt(e.target.value)})}
                            className="w-full bg-[#302e2b] text-white border border-white/10 rounded p-2 focus:ring-2 focus:ring-chess-green focus:outline-none"
                         >
                             <option value="16">16 MB</option>
                             <option value="32">32 MB (Default)</option>
                             <option value="64">64 MB</option>
                             <option value="128">128 MB</option>
                             <option value="256">256 MB</option>
                             <option value="512">512 MB</option>
                         </select>
                        <p className="text-xs text-gray-500">Memory used for transposition table. Higher is better for deep analysis.</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-[#211f1c] border-t border-white/5 flex justify-between items-center">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 text-gray-400 hover:text-white px-4 py-2 rounded hover:bg-white/5 transition-colors text-sm font-medium"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset Defaults
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-chess-green hover:bg-green-600 text-white px-6 py-2 rounded font-bold shadow-lg shadow-green-900/20 transition-all active:scale-95"
                    >
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnalysisSettingsModal;
