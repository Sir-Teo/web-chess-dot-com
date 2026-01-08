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
  },
  {
      id: "007",
      fen: "r1b1k2r/pppp1ppp/2n2n2/4p3/1b2P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 5",
      moves: ["c3d5", "f6d5", "e4d5"],
      rating: 1000,
      theme: "Center Control",
      color: 'w'
  },
  {
      id: "008",
      fen: "6k1/5ppp/8/8/8/8/4QPPP/6K1 w - - 0 1",
      moves: ["e2e8"],
      rating: 400,
      theme: "Mate in 1",
      color: 'w'
  },
  {
      id: "009",
      fen: "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 2 3",
      moves: ["f2f4"],
      rating: 800,
      theme: "Vienna Gambit",
      color: 'w'
  },
  {
      id: "010",
      fen: "r2qk2r/ppp2ppp/2np1n2/2b1p1B1/2B1P1b1/2NP1N2/PPP2PPP/R2QK2R w KQkq - 1 7",
      moves: ["c3d5"],
      rating: 1100,
      theme: "Pin Pressure",
      color: 'w'
  },
  {
      id: "011",
      fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      moves: ["f1b5"],
      rating: 500,
      theme: "Ruy Lopez",
      color: 'w'
  },
  {
      id: "012",
      fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      moves: ["g1f3"],
      rating: 600,
      theme: "Sicilian Defense",
      color: 'w'
  },
  {
      id: "013",
      fen: "rn1qkbnr/ppp1pppp/8/3p4/4P1b1/5N2/PPPP1PPP/RNBQKB1R w KQkq - 1 3",
      moves: ["e4d5", "d8d5", "b1c3"],
      rating: 900,
      theme: "Development",
      color: 'w'
  },
  {
      id: "014",
      fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQ1RK1 b kq - 0 5",
      moves: ["f6e4", "d2d4", "e5d4", "c3d4", "c5b6"],
      rating: 1300,
      theme: "Center Attack",
      color: 'b'
  },
  {
      id: "015",
      fen: "2r3k1/1b3ppp/p3p3/1p6/1P1P4/P1n1P1P1/5P1P/2R2BK1 w - - 0 25",
      moves: ["f1g2", "c3e2", "g1f1", "c8c1", "f1e2", "b7g2"],
      rating: 1600,
      theme: "Fork / Hanging Piece",
      color: 'w'
  },
  {
      id: "016",
      fen: "4r1k1/pp3ppp/8/8/3P4/2P2Q2/PP3KPP/4r3 w - - 0 25",
      moves: ["f3b7", "e1e7", "f2f3"],
      rating: 1200,
      theme: "Queen Ending",
      color: 'w'
  }
];
