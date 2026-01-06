export interface Puzzle {
  id: string;
  fen: string;
  moves: string[]; // Expected move sequence (UCI format, e.g. "e2e4")
  rating: number;
  theme: string;
  color: 'w' | 'b'; // Who is moving?
}

export const PUZZLES: Puzzle[] = [
  {
    id: "001",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    moves: ["h5f7"],
    rating: 400,
    theme: "Mate in 1",
    color: 'w'
  },
  {
    id: "002",
    fen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    moves: ["e1e8"],
    rating: 600,
    theme: "Back Rank Mate",
    color: 'w'
  },
  {
      id: "003",
      fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P1Q1/8/PPPP1PPP/RNB1K1NR b KQkq - 3 4",
      moves: ["d8f6"], // Defending f7/g7? No, random puzzle.
      rating: 800,
      theme: "Opening",
      color: 'b'
  },
  {
      id: "004",
      // White to move. Mate in 2.
      // 1. Qe8+ Rxe8 2. Rxe8#
      // Corrected FEN: Rooks on e1, e4. Black R on a8. Black K on g8.
      fen: "r5k1/5ppp/8/8/4Q3/8/5PPP/4R1K1 w - - 0 1",
      moves: ["e4e8", "a8e8", "e1e8"],
      rating: 1200,
      theme: "Back Rank Sacrifice",
      color: 'w'
  }
];
