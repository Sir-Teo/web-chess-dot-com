import React, { useMemo } from 'react';
import { Chessboard as ReactChessboard } from 'react-chessboard';
import { Arrow } from '../hooks/useCoach';

interface ChessboardProps {
  interactable?: boolean;
  fen?: string;
  onMove?: (from: string, to: string, promotion?: string) => void;
  lastMove?: { from: string; to: string } | null;
  boardOrientation?: 'white' | 'black';
  customArrows?: Arrow[];
}

const Chessboard: React.FC<ChessboardProps> = ({
  interactable = true,
  fen,
  onMove,
  lastMove,
  boardOrientation = 'white',
  customArrows
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

  // Types for callback arguments based on react-chessboard documentation
  // sourceSquare: string (e.g. "e2")
  // targetSquare: string (e.g. "e4")
  // piece: string (e.g. "wP")
  const onPieceDrop = (sourceSquare: string, targetSquare: string, piece: string) => {
    if (!interactable || !onMove) return false;

    // Check for promotion:
    const isPromotion = (piece[1] === 'P' && (
      (piece[0] === 'w' && targetSquare[1] === '8') ||
      (piece[0] === 'b' && targetSquare[1] === '1')
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
        position={fen}
        onPieceDrop={onPieceDrop}
        boardOrientation={boardOrientation}
        arePiecesDraggable={interactable}
        customDarkSquareStyle={{ backgroundColor: '#769656' }}
        customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
        customSquareStyles={customSquareStyles}
        customArrows={customArrows}
        animationDuration={200}
      />
    </div>
  );
};

export default Chessboard;