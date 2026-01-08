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
      fen: "3r2k1/5ppp/8/8/8/8/4QPPP/4R1K1 w - - 0 1",
      moves: ["e2e8", "d8e8", "e1e8"],
      rating: 1200,
      theme: "Mate in 2 (Sacrifice)",
      color: 'w'
  },
  {
      id: "004",
      fen: "r1b2rk1/pp1p1ppp/2n1p3/q7/1bP1n3/1PN2N2/PB1QPPPP/R3KB1R w KQ - 5 10",
      moves: ["d2c2", "e4c3"],
      rating: 1400,
      theme: "Pin",
      color: 'b'
  },
  {
      id: "005",
      fen: "5rk1/pp4pp/4p3/2R5/3Q4/1P3qP1/P6P/6K1 b - - 2 28",
      moves: ["f3f1"],
      rating: 800,
      theme: "Mate in 1",
      color: 'b'
  },
  {
      id: "006",
      fen: "r3k2r/ppp2ppp/2n1bn2/2b1p3/4P3/2P2N2/PP1NBPPP/R1B1K2R b KQkq - 0 8",
      moves: ["f6g4", "e1g1", "g4f2", "f1f2"],
      rating: 1500,
      theme: "Fork / Discovery",
      color: 'b'
  }
];
