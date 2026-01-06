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
      // Smothered Mate Pattern (Corrected 2)
      // White Knight on h6. Black King on h8. Black Rook on g8.
      // Square f7 must be empty for N to land on it.
      // Rook on g8 is pinned by Bishop on a2.
      // FEN: 6rk/7p/7N/8/8/8/B7/7K w - - 0 1
      // Removed p on f7.
      fen: "6rk/7p/7N/8/8/8/B7/7K w - - 0 1",
      moves: ["h6f7"],
      rating: 800,
      theme: "Smothered Mate",
      color: 'w'
  },
  {
      id: "004",
      // White to move. Mate in 2.
      // 1. Qe8+ Rxe8 2. Rxe8#
      fen: "r5k1/5ppp/8/8/4Q3/8/5PPP/4R1K1 w - - 0 1",
      moves: ["e4e8", "a8e8", "e1e8"],
      rating: 1000,
      theme: "Back Rank Sacrifice",
      color: 'w'
  },
  {
      id: "005",
      // Arabian Mate Pattern
      // White R on a7, N on f6. Black K on h8.
      // 1. Rh7#
      fen: "7k/R7/5N2/8/8/8/8/7K w - - 0 1",
      moves: ["a7h7"],
      rating: 900,
      theme: "Arabian Mate",
      color: 'w'
  },
  {
      id: "006",
      // Back Rank Mate for Black
      // Black Rook on a8. White K on g1. White pawns f2,g2,h2.
      // 1... Ra1#
      // FEN: r5k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1
      fen: "r5k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1",
      moves: ["a8a1"],
      rating: 300,
      theme: "Back Rank Mate",
      color: 'b'
  }
];
