import React from 'react';
import { Chess } from 'chess.js';

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
  const history = game.history({ verbose: true });

  // Calculate captured pieces
  const captured: string[] = [];
  let materialScore = 0;

  history.forEach(move => {
      if (move.captured) {
          // If white captured something, it's a black piece (color 'b')
          // If `color` prop is 'w', we want to show pieces captured BY white (which are black pieces)

          if (move.color === color) {
              captured.push(move.captured);
              materialScore += PIECE_VALUES[move.captured] || 0;
          } else {
              materialScore -= PIECE_VALUES[move.captured] || 0;
          }
      }
  });

  // Sort captured pieces
  captured.sort((a, b) => {
      return (PIECE_VALUES[a] || 0) - (PIECE_VALUES[b] || 0);
  });

  // Only show score difference if positive for this player
  const scoreDiff = materialScore; // This logic is slightly wrong for two separate components.

  // Let's recalculate simply:
  // We need to show the pieces captured by `color`.
  // And the material advantage if any.

  // Actually, standard is:
  // Top player bar shows pieces captured BY Top Player (Bottom pieces).
  // Bottom player bar shows pieces captured BY Bottom Player (Top pieces).

  // We need global material count to decide who shows the +N.

  // Let's do a quick calculation of current board material instead of history to be robust?
  // No, history is better for "captured" visual.

  // Re-calc specific captured list for this component
  const myCaptures = history
      .filter(m => m.color === color && m.captured)
      .map(m => m.captured!);

  myCaptures.sort((a, b) => PIECE_ORDER.indexOf(a) - PIECE_ORDER.indexOf(b));

  // Calc advantage
  const whiteMaterial = history
    .filter(m => m.color === 'w' && m.captured)
    .reduce((acc, m) => acc + (PIECE_VALUES[m.captured!] || 0), 0);

  const blackMaterial = history
    .filter(m => m.color === 'b' && m.captured)
    .reduce((acc, m) => acc + (PIECE_VALUES[m.captured!] || 0), 0);

  // If I am White ('w'), my score is whiteMaterial (value of black pieces captured).
  // Wait, standard material count is remaining pieces.
  // Advantage = (My Remaining Material) - (Opponent Remaining Material).
  // Which is equivalent to (Opponent Captured Material Value) - (My Captured Material Value).

  // White Advantage = (Value of Black pieces captured by White) - (Value of White pieces captured by Black).
  const whiteAdvantage = whiteMaterial - blackMaterial;

  const showPlus = (color === 'w' && whiteAdvantage > 0) || (color === 'b' && whiteAdvantage < 0);
  const advantageValue = Math.abs(whiteAdvantage);

  if (myCaptures.length === 0 && !showPlus) return null;

  return (
    <div className="flex items-center text-xs h-6 overflow-hidden">
      {myCaptures.map((p, i) => (
         <img
            key={i}
            src={`https://www.chess.com/chess-themes/pieces/neo/150/${color === 'w' ? 'b' : 'w'}${p}.png`}
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
