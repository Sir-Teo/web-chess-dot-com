import React, { useMemo, useState, useEffect } from 'react';
import { Chessboard as ReactChessboard } from 'react-chessboard';
import { Arrow } from '../hooks/useCoach';
import { useSettings, BOARD_THEMES } from '../context/SettingsContext';
import PromotionModal from './PromotionModal';
import { Chess } from 'chess.js';

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

  // Move highlighting state
  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});

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
        styles[preMove.from] = { backgroundColor: 'rgba(244, 67, 54, 0.6)', border: '2px solid rgba(244, 67, 54, 0.8)' }; // Red tint
        styles[preMove.to] = { backgroundColor: 'rgba(244, 67, 54, 0.6)', border: '2px solid rgba(244, 67, 54, 0.8)' };
    }

    // Merge optionSquares (high priority)
    return { ...styles, ...optionSquares };
  }, [lastMove, preMove, propCustomSquareStyles, optionSquares]);

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

  // Reset highlights on FEN change (new move made externally)
  useEffect(() => {
      setMoveFrom(null);
      setOptionSquares({});
  }, [fen]);

  // Handle Square Click for Move Highlighting and Click-to-Move
  const onSquareClick = (square: string) => {
      // Clear right-click arrows start if any
      if (rightClickStart) setRightClickStart(null);

      // We need a game instance to validate moves
      const game = new Chess(fen || undefined);

      // Case 1: Clicking a potential target square
      if (moveFrom && optionSquares[square]) {
          const move = { from: moveFrom, to: square, promotion: 'q' }; // Default promo

          // Check for promotion
          const piece = game.get(moveFrom);
          if (
              piece?.type === 'p' &&
              ((piece.color === 'w' && square[1] === '8') || (piece.color === 'b' && square[1] === '1'))
          ) {
              setPromotionMove({ from: moveFrom, to: square });
              setMoveFrom(null);
              setOptionSquares({});
              return;
          }

          if (interactable && onMove) {
              onMove(moveFrom, square);
          }

          setMoveFrom(null);
          setOptionSquares({});
          return;
      }

      // Case 2: Clicking a piece to select it
      const piece = game.get(square as any); // Cast because chess.js types might be strict
      if (piece) {
          // If we clicked the same piece, deselect
          if (moveFrom === square) {
              setMoveFrom(null);
              setOptionSquares({});
              return;
          }

          // Calculate valid moves
          const moves = game.moves({ square: square as any, verbose: true });

          // Only highlight if there are moves
          if (moves.length === 0) {
               setMoveFrom(null);
               setOptionSquares({});
               return;
          }

          const newOptionSquares: Record<string, React.CSSProperties> = {};

          // Highlight the selected square slightly
          newOptionSquares[square] = {
              background: 'rgba(255, 255, 0, 0.4)'
          };

          moves.forEach((move) => {
              const isCapture = move.flags.includes('c') || move.flags.includes('e'); // Capture or En Passant
              newOptionSquares[move.to] = {
                  background: isCapture
                    ? 'radial-gradient(circle, transparent 55%, rgba(0,0,0,0.2) 60%)' // Ring for capture
                    : 'radial-gradient(circle, rgba(0,0,0,0.2) 20%, transparent 25%)', // Dot for move
                  borderRadius: '50%',
                  cursor: 'pointer'
              };
          });

          setMoveFrom(square);
          setOptionSquares(newOptionSquares);
          return;
      }

      // Case 3: Clicking empty square (deselect)
      setMoveFrom(null);
      setOptionSquares({});
  };

  // Types for callback arguments based on react-chessboard documentation
  const onPieceDrop = (sourceSquare: string, targetSquare: string, piece: string) => {
    // Clear highlights
    setMoveFrom(null);
    setOptionSquares({});

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
      // Clear selection on right click
      if (moveFrom) {
          setMoveFrom(null);
          setOptionSquares({});
      }

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
        onSquareClick={onSquareClick}
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
