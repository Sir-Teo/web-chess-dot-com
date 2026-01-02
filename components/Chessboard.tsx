import React, { useState, useEffect } from 'react';
import { BoardState, Piece, PieceType } from '../types';
import { PIECE_IMAGES, INITIAL_BOARD } from '../constants';

interface ChessboardProps {
  interactable?: boolean;
  fen?: string;
  onMove?: (from: string, to: string) => void;
  lastMove?: { from: string; to: string } | null;
}

const fenToBoard = (fen: string): BoardState => {
  const [position] = fen.split(' ');
  const rows = position.split('/');
  const board: BoardState = [];

  for (const row of rows) {
    const boardRow: (Piece | null)[] = [];
    for (const char of row) {
      if (!isNaN(Number(char))) {
        for (let i = 0; i < Number(char); i++) {
          boardRow.push(null);
        }
      } else {
        boardRow.push({
          type: char.toLowerCase() as PieceType,
          color: char === char.toUpperCase() ? 'w' : 'b',
        });
      }
    }
    board.push(boardRow);
  }
  return board;
};

const getSquareName = (r: number, c: number): string => {
  const file = String.fromCharCode(97 + c);
  const rank = 8 - r;
  return `${file}${rank}`;
};

const getCoors = (square: string): [number, number] => {
  const col = square.charCodeAt(0) - 97;
  const row = 8 - parseInt(square[1]);
  return [row, col];
};

const Chessboard: React.FC<ChessboardProps> = ({ interactable = true, fen, onMove, lastMove: externalLastMove }) => {
  const [internalBoard, setInternalBoard] = useState<BoardState>(INITIAL_BOARD);
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  
  // Use internal state for drag/click highlights, but derive board from FEN if provided
  const displayBoard = fen ? fenToBoard(fen) : internalBoard;

  const handleSquareClick = (row: number, col: number) => {
    if (!interactable) return;

    if (selectedSquare) {
      const [prevRow, prevCol] = selectedSquare;
      
      // Deselect if clicking same square
      if (prevRow === row && prevCol === col) {
        setSelectedSquare(null);
        return;
      }

      // Move attempt
      if (onMove) {
        const from = getSquareName(prevRow, prevCol);
        const to = getSquareName(row, col);
        onMove(from, to);
        setSelectedSquare(null);
      } else {
        // Local mode (legacy support)
        const newBoard = [...internalBoard.map(r => [...r])];
        const piece = newBoard[prevRow][prevCol];
        if (piece) {
          newBoard[row][col] = piece;
          newBoard[prevRow][prevCol] = null;
          setInternalBoard(newBoard);
          setSelectedSquare(null);
        }
      }
    } else {
      // Select
      if (displayBoard[row][col]) {
        setSelectedSquare([row, col]);
      }
    }
  };

  const isSelected = (r: number, c: number) => selectedSquare?.[0] === r && selectedSquare?.[1] === c;
  
  const isLastMove = (r: number, c: number) => {
    if (externalLastMove) {
       const [fr, fc] = getCoors(externalLastMove.from);
       const [tr, tc] = getCoors(externalLastMove.to);
       return (fr === r && fc === c) || (tr === r && tc === c);
    }
    return false;
  };

  return (
    <div className="relative select-none w-full h-full">
      <div className="grid grid-rows-8 w-full h-full">
        {displayBoard.map((row, rIndex) => (
          <div key={rIndex} className="grid grid-cols-8 h-full">
            {row.map((piece, cIndex) => {
              const isDark = (rIndex + cIndex) % 2 === 1;
              const isHighlighed = isSelected(rIndex, cIndex);
              const isLast = isLastMove(rIndex, cIndex);
              
              const rankColor = isDark ? 'text-[#eeeed2]' : 'text-[#769656]';
              const fileColor = isDark ? 'text-[#eeeed2]' : 'text-[#769656]';

              const showRank = cIndex === 0;
              const showFile = rIndex === 7;

              return (
                <div
                  key={`${rIndex}-${cIndex}`}
                  onClick={() => handleSquareClick(rIndex, cIndex)}
                  className={`
                    relative flex items-center justify-center cursor-pointer w-full h-full
                    ${isDark ? 'bg-chess-board-dark' : 'bg-chess-board-light'}
                    ${isHighlighed ? '!bg-[#f7f769]/60' : ''}
                    ${isLast ? '!bg-[#f7f769]/40' : ''}
                  `}
                >
                  {showRank && (
                      <span className={`absolute top-0.5 left-0.5 text-[10px] md:text-xs font-bold leading-none select-none ${rankColor}`}>
                          {8 - rIndex}
                      </span>
                  )}
                  {showFile && (
                      <span className={`absolute bottom-0.5 right-1 text-[10px] md:text-xs font-bold leading-none select-none ${fileColor}`}>
                          {String.fromCharCode(97 + cIndex)}
                      </span>
                  )}

                  {piece && (
                    <img 
                      src={PIECE_IMAGES[`${piece.color}${piece.type}`]} 
                      alt={`${piece.color} ${piece.type}`}
                      className="w-[85%] h-[85%] object-contain select-none z-10"
                    />
                  )}
                  
                  {selectedSquare && !piece && (
                     null
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chessboard;