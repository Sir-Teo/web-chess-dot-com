import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { COMMON_OPENINGS, Opening, getOpeningFromHistory } from '../src/utils/openings';

interface ExplorerPanelProps {
  fen: string;
  history?: string[];
  onPlayMove?: (move: string) => void;
}

interface MoveStat {
  san: string;
  count: number;
  whiteWin: number;
  draw: number;
  blackWin: number;
  title?: string;
}

const ExplorerPanel: React.FC<ExplorerPanelProps> = ({ fen, history, onPlayMove }) => {
  const [moves, setMoves] = useState<MoveStat[]>([]);
  const [openingName, setOpeningName] = useState<string>("");

  useEffect(() => {
    // Identify opening from history
    if (history) {
        setOpeningName(getOpeningFromHistory(history));
    }

    const game = new Chess(fen);
    const legalMoves = game.moves({ verbose: true });

    // Mock Stats Generator based on move quality (center control etc) just for visuals
    const newMoves: MoveStat[] = legalMoves.map(m => {
        // Simple hash for consistency
        const hash = m.san.charCodeAt(0) + (m.to.charCodeAt(0) || 0);
        const total = 1000 + (hash * 10);
        const w = Math.floor(Math.random() * 40) + 30;
        const d = Math.floor(Math.random() * 30) + 20;
        const b = 100 - w - d;

        return {
            san: m.san,
            count: total,
            whiteWin: w,
            draw: d,
            blackWin: b
        };
    });

    // Sort by count (popularity simulation)
    newMoves.sort((a, b) => b.count - a.count);

    setMoves(newMoves);
  }, [fen, history]);

  return (
    <div className="flex flex-col h-full bg-[#262522] text-gray-300">
        <div className="p-3 border-b border-white/10 bg-[#211f1c]">
            <h3 className="text-white font-bold text-sm">Opening Explorer</h3>
            {openingName && <div className="text-xs text-[#a0a0a0] mt-1">{openingName}</div>}
        </div>

        <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-[#706c66] uppercase bg-[#211f1c] sticky top-0">
                    <tr>
                        <th className="px-3 py-2">Move</th>
                        <th className="px-2 py-2 text-right">Games</th>
                        <th className="px-2 py-2 w-[150px]">White / Draw / Black</th>
                    </tr>
                </thead>
                <tbody>
                    {moves.map((m) => (
                        <tr
                            key={m.san}
                            className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                            onClick={() => onPlayMove && onPlayMove(m.san)}
                        >
                            <td className="px-3 py-2 font-bold text-white hover:text-chess-green">
                                {m.san}
                            </td>
                            <td className="px-2 py-2 text-right text-[#a0a0a0]">
                                {m.count.toLocaleString()}
                            </td>
                            <td className="px-2 py-2">
                                <div className="flex h-2 rounded overflow-hidden w-full opacity-80">
                                    <div style={{ width: `${m.whiteWin}%` }} className="bg-white" title={`White: ${m.whiteWin}%`}></div>
                                    <div style={{ width: `${m.draw}%` }} className="bg-gray-500" title={`Draw: ${m.draw}%`}></div>
                                    <div style={{ width: `${m.blackWin}%` }} className="bg-black" title={`Black: ${m.blackWin}%`}></div>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {moves.length === 0 && (
                        <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-[#706c66] italic">
                                No moves available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default ExplorerPanel;
