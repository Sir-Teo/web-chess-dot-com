import React, { useState } from 'react';
import { X, Check, Trash2, RotateCcw } from 'lucide-react';
import { Chess } from 'chess.js';

interface SetupPositionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadFen: (fen: string) => void;
}

const SetupPositionModal: React.FC<SetupPositionModalProps> = ({ isOpen, onClose, onLoadFen }) => {
    const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleLoad = () => {
        try {
            const temp = new Chess(fen); // Validate
            onLoadFen(fen);
            onClose();
        } catch (e) {
            setError('Invalid FEN string');
        }
    };

    const handleClear = () => {
        setFen('8/8/8/8/8/8/8/8 w - - 0 1');
        setError(null);
    };

    const handleReset = () => {
        setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        setError(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#262522] w-full max-w-lg rounded-xl shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-[#211f1c] border-b border-white/5">
                    <h2 className="text-white font-bold text-lg">Load Position</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">FEN String</label>
                        <textarea
                            value={fen}
                            onChange={(e) => {
                                setFen(e.target.value);
                                setError(null);
                            }}
                            className={`w-full h-24 bg-[#1b1a19] border ${error ? 'border-red-500' : 'border-white/10'} rounded-lg p-3 text-sm text-gray-200 font-mono resize-none focus:outline-none focus:border-chess-green transition-colors`}
                            placeholder="Paste FEN here..."
                        />
                        {error && (
                            <div className="text-red-500 text-xs font-bold flex items-center gap-1">
                                <X className="w-3 h-3" />
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                         <button
                            onClick={handleReset}
                            className="flex-1 bg-[#302e2b] hover:bg-[#3d3b38] text-gray-300 py-2 rounded flex items-center justify-center gap-2 text-sm font-bold transition-colors"
                         >
                             <RotateCcw className="w-4 h-4" />
                             Start Position
                         </button>
                         <button
                            onClick={handleClear}
                            className="flex-1 bg-[#302e2b] hover:bg-[#3d3b38] text-gray-300 py-2 rounded flex items-center justify-center gap-2 text-sm font-bold transition-colors"
                         >
                             <Trash2 className="w-4 h-4" />
                             Clear Board
                         </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-[#211f1c] border-t border-white/5 flex justify-end">
                    <button
                        onClick={handleLoad}
                        className="bg-chess-green hover:bg-chess-greenHover text-white px-6 py-2.5 rounded shadow-[0_4px_0_0_#457524] active:shadow-none active:translate-y-[4px] font-bold flex items-center gap-2 transition-all"
                    >
                        <Check className="w-5 h-5" />
                        Load Position
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetupPositionModal;
