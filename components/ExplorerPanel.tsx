import React, { useMemo } from 'react';
import { Chess } from 'chess.js';
import { BookOpen, HelpCircle } from 'lucide-react';
import { COMMON_OPENINGS } from '../utils/openings';

interface ExplorerPanelProps {
    game: Chess;
    currentFen: string;
    onMoveClick: (moveSan: string) => void;
}

interface MoveStats {
    san: string;
    games: number;
    winRateWhite: number;
    winRateDraw: number;
    winRateBlack: number;
    isBook: boolean;
    openingName?: string;
}

const ExplorerPanel: React.FC<ExplorerPanelProps> = ({ game, currentFen, onMoveClick }) => {

    // Calculate candidate moves and their "stats"
    const candidates = useMemo(() => {
        const tempGame = new Chess(currentFen);
        const validMoves = tempGame.moves({ verbose: true });

        // Get current history to check against book
        const currentHistory = game.history();

        const moves: MoveStats[] = validMoves.map(m => {
            // Check if this move leads to a book position
            const potentialHistory = [...currentHistory, m.san].join(' ');

            // Find if any opening starts with this sequence
            const matchingOpening = COMMON_OPENINGS.find(op => op.moves === potentialHistory || op.moves.startsWith(potentialHistory + ' '));

            // Mock stats based on move hash to be deterministic but varied
            const hash = m.san.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const games = Math.floor(1000 + (hash * 123) % 50000);
            const white = 30 + (hash % 40);
            const draw = 20 + (hash % 20);
            const black = 100 - white - draw;

            return {
                san: m.san,
                games: matchingOpening ? games * 2 : games / 10, // Boost games for book moves
                winRateWhite: white,
                winRateDraw: draw,
                winRateBlack: black,
                isBook: !!matchingOpening,
                openingName: matchingOpening?.moves === potentialHistory ? matchingOpening.name : undefined
            };
        });

        // Sort: Book moves first, then by "games" count (popularity)
        return moves.sort((a, b) => {
            if (a.isBook && !b.isBook) return -1;
            if (!a.isBook && b.isBook) return 1;
            return b.games - a.games;
        });

    }, [currentFen, game]);

    const totalGames = candidates.reduce((acc, m) => acc + m.games, 0);

    return (
        <div className="flex flex-col h-full bg-[#262522] text-[#c3c3c3]">
             {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#211f1c] border-b border-black/20">
                <div className="flex items-center gap-2 text-gray-200">
                    <BookOpen className="w-5 h-5 opacity-70" />
                    <span className="font-bold text-base">Opening Explorer</span>
                </div>
            </div>

            {/* List Header */}
            <div className="grid grid-cols-[1fr_1fr_2fr] gap-2 px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-white/5">
                <div>Move</div>
                <div className="text-center">Games</div>
                <div className="flex justify-between w-full">
                   <span>W</span>
                   <span>D</span>
                   <span>B</span>
                </div>
            </div>

            {/* Move List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {candidates.length > 0 ? (
                    candidates.map((move, i) => (
                        <div
                            key={i}
                            onClick={() => onMoveClick(move.san)}
                            className="grid grid-cols-[1fr_1fr_2fr] gap-2 px-4 py-1.5 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 group transition-colors"
                        >
                            {/* Move Name */}
                            <div className="flex flex-col justify-center">
                                <span className="font-bold text-sm text-gray-200 group-hover:text-white flex items-center gap-1.5">
                                    {move.san}
                                    {move.isBook && <BookOpen className="w-3 h-3 text-[#a38d79]" />}
                                </span>
                                {move.openingName && (
                                    <span className="text-[9px] text-[#a38d79] truncate max-w-[100px] leading-tight">{move.openingName}</span>
                                )}
                            </div>

                            {/* Games Count */}
                            <div className="flex items-center justify-center text-xs font-mono text-gray-400">
                                {move.games.toLocaleString()}
                            </div>

                            {/* Win Rates */}
                            <div className="flex items-center h-full gap-0.5 opacity-80 group-hover:opacity-100">
                                <div className="h-2 bg-gray-200 rounded-l-sm" style={{ width: `${move.winRateWhite}%` }}></div>
                                <div className="h-2 bg-gray-500" style={{ width: `${move.winRateDraw}%` }}></div>
                                <div className="h-2 bg-black border border-gray-700 rounded-r-sm" style={{ width: `${move.winRateBlack}%` }}></div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 flex flex-col items-center justify-center text-gray-500 text-center gap-2">
                        <HelpCircle className="w-8 h-8 opacity-20" />
                        <p className="text-sm">No moves found for this position.</p>
                        <p className="text-xs opacity-60">Game might be over or position invalid.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-2 bg-[#211f1c] border-t border-black/20 text-center">
                 <span className="text-[10px] text-gray-500">
                     Based on {totalGames.toLocaleString()} master games (simulated)
                 </span>
            </div>
        </div>
    );
};

export default ExplorerPanel;
