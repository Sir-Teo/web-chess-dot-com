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
  const { boardTheme, pieceTheme, showCoordinates, animationSpeed } = useSettings();

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

  const customPieces = useMemo(() => {
      const pieces = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
      const pieceComponents: Record<string, (args: any) => JSX.Element> = {};

      pieces.forEach(p => {
          pieceComponents[p] = ({ squareWidth }) => (
            <div
                style={{
                    width: squareWidth,
                    height: squareWidth,
                    backgroundImage: `url(https://images.chesscomfiles.com/chess-themes/pieces/${pieceTheme}/150/${p}.png)`,
                    backgroundSize: '100%',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                }}
            />
          );
      });
      return pieceComponents;
  }, [pieceTheme]);

  // Types for callback arguments based on react-chessboard documentation
  // sourceSquare: string (e.g. "e2")
  // targetSquare: string (e.g. "e4")
  // piece: string (e.g. "wP")
  const onDrop = (sourceSquare: string, targetSquare: string, piece: string) => {
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
    <div
      id="chessboard-wrapper"
      className="w-full h-full flex justify-center items-center"
      style={{ userSelect: 'none' }}
    >
      <ReactChessboard
        id="GameBoard"
        position={fen}
        onDrop={onDrop}
        boardOrientation={boardOrientation}
        arePiecesDraggable={interactable}
        customDarkSquareStyle={{ backgroundColor: themeColors.dark }}
        customLightSquareStyle={{ backgroundColor: themeColors.light }}
        customSquareStyles={customSquareStyles}
        customArrows={customArrows}
        animationDuration={animationSpeed === 'slow' ? 500 : animationSpeed === 'fast' ? 100 : 200}
        showBoardNotation={showCoordinates}
        customPieces={customPieces}
      />
    </div>
  );
};

export default Chessboard;
