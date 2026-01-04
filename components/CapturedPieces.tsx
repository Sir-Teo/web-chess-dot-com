import React from 'react';
import { Chess } from 'chess.js';
import { useSettings } from '../context/SettingsContext';

interface CapturedPiecesProps {
  game: Chess;
  color: 'w' | 'b'; // The color of the PLAYER who captured these pieces (so we show opponent's pieces)
}

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
};

const PIECE_ORDER = ['p', 'n', 'b', 'r', 'q'];

const CapturedPieces: React.FC<CapturedPiecesProps> = ({ game, color }) => {
  const { pieceTheme } = useSettings();
  const history = game.history({ verbose: true });

  // Re-calc specific captured list for this component
  const myCaptures = history
      .filter(m => m.color === color && m.captured)
      .map(m => m.captured!);

  myCaptures.sort((a, b) => PIECE_ORDER.indexOf(a) - PIECE_ORDER.indexOf(b));

  // Calc material LOST by each side
  // pieces captured by White (m.color === 'w') are BLACK pieces (Black's loss)
  const blackLoss = history
    .filter(m => m.color === 'w' && m.captured)
    .reduce((acc, m) => acc + (PIECE_VALUES[m.captured!] || 0), 0);

  // pieces captured by Black (m.color === 'b') are WHITE pieces (White's loss)
  const whiteLoss = history
    .filter(m => m.color === 'b' && m.captured)
    .reduce((acc, m) => acc + (PIECE_VALUES[m.captured!] || 0), 0);

  // White Advantage = (Material lost by Black) - (Material lost by White)
  const whiteAdvantage = blackLoss - whiteLoss;

  const showPlus = (color === 'w' && whiteAdvantage > 0) || (color === 'b' && whiteAdvantage < 0);
  const advantageValue = Math.abs(whiteAdvantage);

  if (myCaptures.length === 0 && !showPlus) return null;

  return (
    <div className="flex items-center text-xs h-6 overflow-hidden">
      {myCaptures.map((p, i) => (
         <img
            key={i}
            src={`https://images.chesscomfiles.com/chess-themes/pieces/${pieceTheme}/150/${color === 'w' ? 'b' : 'w'}${p}.png`}
            className="w-4 h-4 -ml-1 first:ml-0 opacity-90"
            alt={p}
         />
      ))}
      {showPlus && (
          <span className="ml-1 text-[#b5b5b5] font-semibold text-[10px]">+{advantageValue}</span>
      )}
    </div>
  );
};

export default CapturedPieces;
