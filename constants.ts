import { Piece, BoardState } from './types';

export const PIECE_IMAGES: Record<string, string> = {
  wp: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wp.png',
  wn: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wn.png',
  wb: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wb.png',
  wr: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wr.png',
  wq: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wq.png',
  wk: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wk.png',
  bp: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bp.png',
  bn: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bn.png',
  bb: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bb.png',
  br: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/br.png',
  bq: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bq.png',
  bk: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bk.png',
};

export const INITIAL_BOARD: BoardState = [
  [
    { type: 'r', color: 'b' }, { type: 'n', color: 'b' }, { type: 'b', color: 'b' }, { type: 'q', color: 'b' }, { type: 'k', color: 'b' }, { type: 'b', color: 'b' }, { type: 'n', color: 'b' }, { type: 'r', color: 'b' }
  ],
  [
    { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }
  ],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [
    { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }
  ],
  [
    { type: 'r', color: 'w' }, { type: 'n', color: 'w' }, { type: 'b', color: 'w' }, { type: 'q', color: 'w' }, { type: 'k', color: 'w' }, { type: 'b', color: 'w' }, { type: 'n', color: 'w' }, { type: 'r', color: 'w' }
  ]
];