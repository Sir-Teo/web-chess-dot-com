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
      fen: "3r2k1/5ppp/8/8/8/8/4QPPP/3R2K1 w - - 0 1",
      moves: ["e2e8", "d8e8", "d1e8"],
      rating: 1200,
      theme: "Mate in 2 (Sacrifice)",
      color: 'w'
  }
];
