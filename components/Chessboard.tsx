import React, { useMemo } from 'react';
import { Chessboard as ReactChessboard } from 'react-chessboard';
import { PieceType } from '../types';

interface ChessboardProps {
  interactable?: boolean;
  fen?: string;
  onMove?: (from: string, to: string, promotion?: string) => void;
  lastMove?: { from: string; to: string } | null;
  boardOrientation?: 'white' | 'black';
}

const Chessboard: React.FC<ChessboardProps> = ({
  interactable = true,
  fen,
  onMove,
  lastMove,
  boardOrientation = 'white'
}) => {
  
  // Custom styles for squares
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    // Highlight last move
    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
      styles[lastMove.to] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
    }

    return styles;
  }, [lastMove]);

  const onPieceDrop = ({ sourceSquare, targetSquare, piece }: { sourceSquare: string; targetSquare: string | null; piece: { pieceType: string } }) => {
    if (!interactable || !onMove || !targetSquare) return false;

    // piece.pieceType is like "wP", "bK" etc.
    const pieceType = piece.pieceType;

    // Check for promotion:
    const isPromotion = (pieceType[1] === 'P' && (
      (pieceType[0] === 'w' && targetSquare[1] === '8') ||
      (pieceType[0] === 'b' && targetSquare[1] === '1')
    ));

    if (isPromotion) {
       onMove(sourceSquare, targetSquare, 'q');
       return true;
    }

    onMove(sourceSquare, targetSquare);
    return true;
  };

  return (
    <div className="w-full h-full" style={{ userSelect: 'none' }}>
      <ReactChessboard
        options={{
            position: fen,
            onPieceDrop: onPieceDrop,
            boardOrientation: boardOrientation,
            allowDragging: interactable,
            darkSquareStyle: { backgroundColor: '#769656' },
            lightSquareStyle: { backgroundColor: '#eeeed2' },
            squareStyles: customSquareStyles,
            animationDurationInMs: 200,
        }}
      />
    </div>
  );
};

export default Chessboard;