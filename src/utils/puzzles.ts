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
  },
  // NEW PUZZLES
  {
      id: "017",
      fen: "r4rk1/5ppp/p2p4/1p1P4/2p1q3/P5Q1/1PP3PP/3R1R1K b - - 0 23",
      moves: ["e4c2"],
      rating: 900,
      theme: "Free Pawn",
      color: 'b'
  },
  {
      id: "018",
      fen: "r1b2rk1/pp3ppp/4pn2/q1np4/8/P1N1PN2/1PP1BPPP/R2Q1RK1 w - - 1 11",
      moves: ["b2b4", "a5c7", "b4c5"],
      rating: 1100,
      theme: "Fork",
      color: 'w'
  },
  {
      id: "019",
      fen: "r2qk2r/pp1n1ppp/2pbpn2/3p4/2PP4/1P2PN2/P2N1PPP/R1BQK2R w KQkq - 1 9",
      moves: ["c4c5", "d6c7"],
      rating: 800,
      theme: "Space Advantage",
      color: 'w'
  },
  {
      id: "020",
      fen: "r4rk1/pp1b1ppp/1qn1p3/3p4/3P4/P1N1PNP1/1P2Q1PP/R4RK1 b - - 0 14",
      moves: ["c6a5"],
      rating: 1000,
      theme: "Knight Maneuver",
      color: 'b'
  },
  {
      id: "021",
      fen: "8/1R6/6pk/5p2/5P1K/6PP/8/r7 b - - 0 46",
      moves: ["a1a8", "g3g4", "f5g4", "h3g4"],
      rating: 1400,
      theme: "Waiting Move",
      color: 'b'
  },
  {
      id: "022",
      fen: "r5k1/5ppp/4p3/3p4/r2P4/P1R1P3/5PPP/R5K1 b - - 2 25",
      moves: ["g7g6"],
      rating: 700,
      theme: "Luft",
      color: 'b'
  },
  {
      id: "023",
      fen: "2r3k1/pp3p1p/4p1p1/3pP3/P2P4/1P2b2P/2r3P1/3RBK2 b - - 1 29",
      moves: ["c2b2", "d1d3"],
      rating: 1300,
      theme: "Rook Activity",
      color: 'b'
  },
  {
      id: "024",
      fen: "rnbqkb1r/pp3ppp/4pn2/8/2PN4/2N5/PP3PPP/R1BQKB1R w KQkq - 1 8",
      moves: ["c1e3"],
      rating: 900,
      theme: "Development",
      color: 'w'
  },
  {
      id: "025",
      fen: "r1b2rk1/ppqn1ppp/2pbpn2/8/2PP4/2NB1N2/PP3PPP/R1BQR1K1 w - - 5 10",
      moves: ["c4c5", "d6e7"],
      rating: 1000,
      theme: "Pawn Push",
      color: 'w'
  },
  {
      id: "026",
      fen: "3r2k1/p4p1p/2p3p1/4b3/N3P3/1P6/P4PPP/2R3K1 w - - 0 24",
      moves: ["g2g3"],
      rating: 800,
      theme: "Defense",
      color: 'w'
  },
  {
      id: "027",
      fen: "rnbqk2r/pp2bppp/4pn2/3p2B1/2PP4/2N2N2/PP3PPP/R2QKB1R b KQkq - 3 7",
      moves: ["h7h6", "g5h4"],
      rating: 900,
      theme: "Kick Bishop",
      color: 'b'
  },
  {
      id: "028",
      fen: "r2qk2r/1pp1bppp/p1n1bn2/3p4/3P4/P1N1PN2/1P2BPPP/R1BQK2R w KQkq - 1 9",
      moves: ["e1g1"],
      rating: 600,
      theme: "Castling",
      color: 'w'
  },
  {
      id: "029",
      fen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2P5/1PN1PN2/PB1P1PPP/R2QKB1R w KQ - 3 8",
      moves: ["d2d4"],
      rating: 800,
      theme: "Center Challenge",
      color: 'w'
  },
  {
      id: "030",
      fen: "r1b2rk1/pp1n1ppp/1q2pn2/3p4/2PP4/P1NB1N2/1P3PPP/R2Q1RK1 b - - 2 11",
      moves: ["b6b2", "c3a4"],
      rating: 1600,
      theme: "Trapped Queen",
      color: 'w'
  }
];
