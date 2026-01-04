import React, { useMemo } from 'react';
import { Chessboard as ReactChessboard } from 'react-chessboard';
import { Arrow } from '../hooks/useCoach';
import { useSettings, BOARD_THEMES } from '../context/SettingsContext';

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
  const { boardTheme, showCoordinates, animationSpeed } = useSettings();

  const themeColors = useMemo(() => {
    return BOARD_THEMES.find(t => t.id === boardTheme) || BOARD_THEMES[0];
  }, [boardTheme]);
  
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

  // Convert tuple arrows to object arrows for react-chessboard
  const formattedArrows = useMemo(() => {
      if (!customArrows) return undefined;
      // Check if it's already in correct format or tuple
      return customArrows.map(arrow => {
          if (Array.isArray(arrow)) {
              return { startSquare: arrow[0], endSquare: arrow[1], color: arrow[2] || 'green' };
          }
          return arrow; // Assume it's already correct if not array
      });
  }, [customArrows]);

  // Types for callback arguments based on react-chessboard documentation
  // sourceSquare: string (e.g. "e2")
  // targetSquare: string (e.g. "e4")
  // piece: string (e.g. "wP")
  const onPieceDrop = (sourceSquare: string, targetSquare: string, piece: string) => {
    if (!interactable || !onMove || !targetSquare) return false;

    // piece is object in newer version? or string? documentation says DraggingPieceDataType
    // but based on typical usage it might be just string in older versions or different here.
    // Let's assume pieceType or verify.
    // In types.d.ts: piece is DraggingPieceDataType { isSparePiece, position, pieceType }

    const pieceType = piece;

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
    <div
      id="chessboard-wrapper"
      className="w-full h-full flex justify-center items-center"
      style={{ userSelect: 'none' }}
    >
      <ReactChessboard
        id="GameBoard"
        position={fen}
        onPieceDrop={onPieceDrop}
        boardOrientation={boardOrientation as 'white' | 'black'}
        arePiecesDraggable={interactable}
        customDarkSquareStyle={{ backgroundColor: themeColors.dark }}
        customLightSquareStyle={{ backgroundColor: themeColors.light }}
        customSquareStyles={customSquareStyles}
        customArrows={formattedArrows as any}
        animationDuration={animationSpeed === 'slow' ? 500 : animationSpeed === 'fast' ? 100 : 200}
        showBoardNotation={showCoordinates}
      />
    </div>
  );
};

export default Chessboard;
