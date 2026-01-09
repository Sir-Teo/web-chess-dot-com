import React from 'react';
import { Chess } from 'chess.js';

interface CapturedPiecesProps {
  game: Chess;
  color: 'w' | 'b';
}

const CapturedPieces: React.FC<CapturedPiecesProps> = ({ game, color }) => {
  const history = game.history({ verbose: true });
  const captured: string[] = [];

  // Calculate captured pieces
  // Iterate history and find captures where color matches captured piece color
  // Actually, we need to find what the opponent captured (opposing color).
  // If `color` is 'w', we show pieces White has lost? Or pieces White has CAPTURED?
  // Usually CapturedPieces for White shows Black pieces that White captured.

  // Let's assume this component shows "Prisoners" held by `color`.
  // So if color='w', show black pieces captured.

  const targetColor = color === 'w' ? 'b' : 'w';

  history.forEach(move => {
      if (move.captured && move.color === color) {
          captured.push(move.captured); // p, n, b, r, q
      }
  });

  // Sort by value
  const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  captured.sort((a, b) => values[a] - values[b]);

  // Material Advantage
  // Calculate total material for both
  // This logic is usually outside, but we can do a simple version.

  return (
    <div className="flex items-center -space-x-1 opacity-80 h-4">
        {captured.map((p, i) => (
             <img
                key={i}
                src={`https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${targetColor}${p}.png`}
                alt={p}
                className="w-4 h-4 object-contain"
             />
        ))}
    </div>
  );
};

export default CapturedPieces;
