import React from 'react';
import { X, Check } from 'lucide-react';
import { useSettings, BOARD_THEMES, PIECE_THEMES, BoardThemeId, PieceThemeId } from '../context/SettingsContext';
import { Chessboard as ReactChessboard } from 'react-chessboard';

const SettingsModal: React.FC = () => {
    const {
        isSettingsOpen,
        closeSettings,
        boardTheme, setBoardTheme,
        pieceTheme, setPieceTheme,
        showCoordinates, setShowCoordinates,
        animationSpeed, setAnimationSpeed,
        soundEnabled, setSoundEnabled,
        moveMethod, setMoveMethod
    } = useSettings();

    if (!isSettingsOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#262522] w-full max-w-4xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/10">

                {/* Sidebar */}
                <div className="w-full md:w-64 bg-[#211f1c] border-b md:border-b-0 md:border-r border-white/5 flex flex-col">
                    <div className="p-4 border-b border-white/5">
                        <h2 className="text-xl font-bold text-white">Settings</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <button className="w-full text-left px-4 py-3 bg-[#302e2b] text-white font-semibold border-l-4 border-chess-green">
                            Themes & Board
                        </button>
                        <button className="w-full text-left px-4 py-3 text-gray-400 hover:text-white hover:bg-[#2a2926] transition-colors">
                            Live Chess
                        </button>
                         <button className="w-full text-left px-4 py-3 text-gray-400 hover:text-white hover:bg-[#2a2926] transition-colors">
                            Daily Chess
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                        {/* Board Theme Section */}
                        <section>
                            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                Board Theme
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {BOARD_THEMES.map((theme) => (
                                    <div
                                        key={theme.id}
                                        onClick={() => setBoardTheme(theme.id)}
                                        className={`
                                            cursor-pointer rounded-lg p-1 border-2 transition-all relative group
                                            ${boardTheme === theme.id ? 'border-chess-green bg-white/5' : 'border-transparent hover:bg-white/5'}
                                        `}
                                    >
                                        <div className="aspect-video w-full rounded overflow-hidden flex shadow-sm mb-2">
                                            <div style={{ backgroundColor: theme.light }} className="flex-1 h-full"></div>
                                            <div style={{ backgroundColor: theme.dark }} className="flex-1 h-full"></div>
                                        </div>
                                        <div className="flex justify-between items-center px-1">
                                            <span className={`text-sm font-medium ${boardTheme === theme.id ? 'text-white' : 'text-gray-400'}`}>
                                                {theme.name}
                                            </span>
                                            {boardTheme === theme.id && <Check className="w-4 h-4 text-chess-green" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="w-full h-px bg-white/5" />

                        {/* Piece Theme Section */}
                        <section>
                            <h3 className="text-white font-bold text-lg mb-4">Piece Set</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {PIECE_THEMES.map((theme) => (
                                    <div
                                        key={theme.id}
                                        onClick={() => setPieceTheme(theme.id)}
                                        className={`
                                            cursor-pointer rounded-lg p-2 border-2 transition-all flex flex-col items-center gap-2
                                            ${pieceTheme === theme.id ? 'border-chess-green bg-white/5' : 'border-transparent hover:bg-white/5'}
                                        `}
                                    >
                                        <img
                                            src={`https://images.chesscomfiles.com/chess-themes/pieces/${theme.id}/150/wp.png`}
                                            alt={theme.name}
                                            className="w-12 h-12"
                                        />
                                        <span className={`text-sm font-medium ${pieceTheme === theme.id ? 'text-white' : 'text-gray-400'}`}>
                                            {theme.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="w-full h-px bg-white/5" />

                        {/* General Options */}
                        <section className="space-y-4">
                            <h3 className="text-white font-bold text-lg mb-4">Board Options</h3>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">Show Coordinates</span>
                                <button
                                    onClick={() => setShowCoordinates(!showCoordinates)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${showCoordinates ? 'bg-chess-green' : 'bg-gray-600'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${showCoordinates ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">Sound</span>
                                <button
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${soundEnabled ? 'bg-chess-green' : 'bg-gray-600'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                             <div className="flex items-center justify-between">
                                <span className="text-gray-300">Move Animation</span>
                                <div className="flex bg-[#302e2b] rounded p-1">
                                    {(['slow', 'normal', 'fast'] as const).map(speed => (
                                        <button
                                            key={speed}
                                            onClick={() => setAnimationSpeed(speed)}
                                            className={`px-3 py-1 rounded text-xs font-bold capitalize transition-colors ${animationSpeed === speed ? 'bg-[#45423e] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            {speed}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-[#211f1c] border-t border-white/5 flex justify-end gap-3">
                        <button
                            onClick={closeSettings}
                            className="bg-chess-green hover:bg-chess-greenHover text-white font-bold py-2 px-6 rounded shadow-lg transition-colors flex items-center gap-2"
                        >
                            <Check className="w-5 h-5" />
                            Save
                        </button>
                    </div>
                </div>

                <button
                    onClick={closeSettings}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white md:hidden"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default SettingsModal;
