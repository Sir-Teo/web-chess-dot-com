
import { Chess } from 'chess.js';

export interface Opening {
    name: string;
    moves: string; // "e4 c5"
}

// A small subset of common openings
export const COMMON_OPENINGS: Opening[] = [
    { name: "Sicilian Defense", moves: "e4 c5" },
    { name: "Sicilian Defense: Najdorf Variation", moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6" },
    { name: "Sicilian Defense: Dragon Variation", moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6" },
    { name: "French Defense", moves: "e4 e6" },
    { name: "French Defense: Advance Variation", moves: "e4 e6 d4 d5 e5" },
    { name: "French Defense: Exchange Variation", moves: "e4 e6 d4 d5 exd5" },
    { name: "Caro-Kann Defense", moves: "e4 c6" },
    { name: "Caro-Kann Defense: Advance Variation", moves: "e4 c6 d4 d5 e5" },
    { name: "Ruy Lopez", moves: "e4 e5 Nf3 Nc6 Bb5" },
    { name: "Ruy Lopez: Berlin Defense", moves: "e4 e5 Nf3 Nc6 Bb5 Nf6" },
    { name: "Italian Game", moves: "e4 e5 Nf3 Nc6 Bc4" },
    { name: "Italian Game: Giuoco Piano", moves: "e4 e5 Nf3 Nc6 Bc4 Bc5" },
    { name: "Queen's Gambit", moves: "d4 d5 c4" },
    { name: "Queen's Gambit Declined", moves: "d4 d5 c4 e6" },
    { name: "Slav Defense", moves: "d4 d5 c4 c6" },
    { name: "King's Indian Defense", moves: "d4 Nf6 c4 g6" },
    { name: "Nimzo-Indian Defense", moves: "d4 Nf6 c4 e6 Nc3 Bb4" },
    { name: "English Opening", moves: "c4" },
    { name: "Reti Opening", moves: "Nf3" },
    { name: "Scandinavian Defense", moves: "e4 d5" },
    { name: "Alekhine's Defense", moves: "e4 Nf6" },
    { name: "Pirc Defense", moves: "e4 d6 d4 Nf6 Nc3 g6" },
    { name: "London System", moves: "d4 d5 Bf4" },
    { name: "Vienna Game", moves: "e4 e5 Nc3" },
    { name: "Four Knights Game", moves: "e4 e5 Nf3 Nc6 Nc3 Nf6" },
    { name: "Scotch Game", moves: "e4 e5 Nf3 Nc6 d4" },
    { name: "Philidor Defense", moves: "e4 e5 Nf3 d6" },
    { name: "Modern Defense", moves: "e4 g6" },
    { name: "Dutch Defense", moves: "d4 f5" },
    { name: "Catalan Opening", moves: "d4 Nf6 c4 e6 g3" }
];

export const identifyOpening = (pgn: string): string => {
    // Clean PGN to just get moves
    // PGN might contain headers, comments, move numbers.
    // Easiest is to load into chess.js and get history.
    try {
        const game = new Chess();
        game.loadPgn(pgn);
        const history = game.history();
        const moveString = history.join(' ');

        // Find the longest matching opening
        let bestMatch = "";
        let longestLen = 0;

        for (const op of COMMON_OPENINGS) {
            if (moveString.startsWith(op.moves)) {
                if (op.moves.length > longestLen) {
                    bestMatch = op.name;
                    longestLen = op.moves.length;
                }
            }
        }

        return bestMatch || "Unknown Opening";
    } catch (e) {
        return "Unknown Opening";
    }
};

export const getOpeningFromHistory = (history: string[]): string => {
    const moveString = history.join(' ');
    let bestMatch = "";
    let longestLen = 0;

    for (const op of COMMON_OPENINGS) {
        if (moveString.startsWith(op.moves)) {
            if (op.moves.length > longestLen) {
                bestMatch = op.name;
                longestLen = op.moves.length;
            }
        }
    }
    return bestMatch || "Unknown Opening";
}
