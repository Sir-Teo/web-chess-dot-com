import React, { useMemo, useState } from 'react';
import { Chessboard as ReactChessboard } from 'react-chessboard';
import { Arrow } from '../hooks/useCoach';
import { useSettings, BOARD_THEMES } from '../context/SettingsContext';
import PromotionModal from './PromotionModal';

interface ChessboardProps {
  interactable?: boolean;
  fen?: string;
  onMove?: (from: string, to: string, promotion?: string) => void;
  lastMove?: { from: string; to: string } | null;
  boardOrientation?: 'white' | 'black';
  customArrows?: Arrow[];
  preMove?: { from: string, to: string } | null;
  customSquareStyles?: Record<string, React.CSSProperties>;
}

const Chessboard: React.FC<ChessboardProps> = ({
  interactable = true,
  fen,
  onMove,
  lastMove,
  boardOrientation = 'white',
  customArrows,
  preMove,
  customSquareStyles: propCustomSquareStyles
}) => {
  const { boardTheme, showCoordinates, animationSpeed } = useSettings();

  const themeColors = useMemo(() => {
    return BOARD_THEMES.find(t => t.id === boardTheme) || BOARD_THEMES[0];
  }, [boardTheme]);

  // Local state for user-drawn arrows (Right-click)
  const [userArrows, setUserArrows] = useState<Arrow[]>([]);
  const [rightClickStart, setRightClickStart] = useState<string | null>(null);

  // Promotion State
  const [promotionMove, setPromotionMove] = useState<{ from: string, to: string } | null>(null);
  
  // Custom styles for squares
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = { ...propCustomSquareStyles };

    if (lastMove) {
       // Only apply yellow if not already styled (e.g. by analysis)
       if (!styles[lastMove.from]) styles[lastMove.from] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
       if (!styles[lastMove.to]) styles[lastMove.to] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
    }

    // Highlight Pre-move (Red/Pink overlay)
    if (preMove) {
        styles[preMove.from] = { backgroundColor: 'rgba(244, 67, 54, 0.5)' }; // Red tint
        styles[preMove.to] = { backgroundColor: 'rgba(244, 67, 54, 0.5)' };
    }

    return styles;
  }, [lastMove, preMove, propCustomSquareStyles]);

  // Combine prop arrows + user arrows
  const allArrows = useMemo(() => {
      let combined = [...(customArrows || [])];

      // User arrows
      combined = [...combined, ...userArrows];

      if (!combined.length) return undefined;

      return combined.map(arrow => {
          if (Array.isArray(arrow)) {
              return { startSquare: arrow[0], endSquare: arrow[1], color: arrow[2] || 'orange' };
          }
          return arrow;
      });
  }, [customArrows, userArrows]);

  // Types for callback arguments based on react-chessboard documentation
  const onPieceDrop = (sourceSquare: string, targetSquare: string, piece: string) => {
    // Logic for pre-move handled in parent or here?
    // Parent handles actual game logic.
    if (!interactable || !onMove || !targetSquare) return false;

    // Clear arrows on move
    setUserArrows([]);

    const pieceType = piece;

    // Check for promotion (naive check, parent handles validation)
    const isPromotion = (pieceType[1] === 'P' && (
      (pieceType[0] === 'w' && targetSquare[1] === '8') ||
      (pieceType[0] === 'b' && targetSquare[1] === '1')
    ));

    if (isPromotion) {
       setPromotionMove({ from: sourceSquare, to: targetSquare });
       return true;
    }

    onMove(sourceSquare, targetSquare);
    return true;
  };

  const handlePromotionSelect = (piece: 'q' | 'r' | 'b' | 'n') => {
      if (promotionMove && onMove) {
          onMove(promotionMove.from, promotionMove.to, piece);
          setPromotionMove(null);
      }
  };

  const onSquareRightClick = (square: string) => {
      if (!rightClickStart) {
          setRightClickStart(square);
      } else {
          if (rightClickStart === square) {
              setRightClickStart(null);
          } else {
              // Draw arrow
              const newArrow: Arrow = [rightClickStart, square, 'orange'];

              // Toggle: if exists, remove. else add.
              setUserArrows(prev => {
                  const exists = prev.find(a => a[0] === rightClickStart && a[1] === square);
                  if (exists) {
                      return prev.filter(a => a !== exists);
                  }
                  return [...prev, newArrow];
              });
              setRightClickStart(null);
          }
      }
  };

  return (
    <div
      id="chessboard-wrapper"
      className="w-full h-full flex justify-center items-center relative"
      onContextMenu={(e) => {
          e.preventDefault(); // Prevent context menu globally on wrapper
      }}
    >
      <PromotionModal
        isOpen={!!promotionMove}
        color={boardOrientation === 'white' ? 'w' : 'b'} // Assuming player is playing bottom color usually
        onSelect={handlePromotionSelect}
        onClose={() => setPromotionMove(null)}
      />
      <ReactChessboard
        position={fen}
        onPieceDrop={onPieceDrop}
        onSquareRightClick={onSquareRightClick}
        boardOrientation={boardOrientation as 'white' | 'black'}
        arePiecesDraggable={interactable}
        customDarkSquareStyle={{ backgroundColor: themeColors.dark }}
        customLightSquareStyle={{ backgroundColor: themeColors.light }}
        customSquareStyles={customSquareStyles}
        customArrows={allArrows as any}
        animationDuration={animationSpeed === 'slow' ? 500 : animationSpeed === 'fast' ? 100 : 200}
        showBoardNotation={showCoordinates}
      />
    </div>
  );
};

export default Chessboard;
