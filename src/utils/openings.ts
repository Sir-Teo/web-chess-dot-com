
import { Chess } from 'chess.js';

export interface Opening {
    name: string;
    moves: string; // "e4 c5"
    eco?: string;
}

// Comprehensive list of common openings
export const COMMON_OPENINGS: Opening[] = [
    // A00-A39
    { name: "Polish Opening", moves: "b4", eco: "A00" },
    { name: "Bird's Opening", moves: "f4", eco: "A02" },
    { name: "Reti Opening", moves: "Nf3", eco: "A04" },
    { name: "King's Indian Attack", moves: "Nf3 d5 g3", eco: "A07" },
    { name: "English Opening", moves: "c4", eco: "A10" },
    { name: "English Opening: Anglo-Indian", moves: "c4 Nf6", eco: "A15" },
    { name: "English Opening: King's English", moves: "c4 e5", eco: "A20" },
    { name: "English Opening: Symmetrical", moves: "c4 c5", eco: "A30" },

    // B00-B99 (Semi-Open Games)
    { name: "Nimzowitsch Defense", moves: "e4 Nc6", eco: "B00" },
    { name: "Scandinavian Defense", moves: "e4 d5", eco: "B01" },
    { name: "Alekhine's Defense", moves: "e4 Nf6", eco: "B02" },
    { name: "Alekhine's Defense: Chase Variation", moves: "e4 Nf6 e5 Nd5 c4", eco: "B02" },
    { name: "Modern Defense", moves: "e4 g6", eco: "B06" },
    { name: "Pirc Defense", moves: "e4 d6 d4 Nf6 Nc3 g6", eco: "B07" },
    { name: "Caro-Kann Defense", moves: "e4 c6", eco: "B10" },
    { name: "Caro-Kann Defense: Advance Variation", moves: "e4 c6 d4 d5 e5", eco: "B12" },
    { name: "Caro-Kann Defense: Exchange Variation", moves: "e4 c6 d4 d5 exd5", eco: "B13" },
    { name: "Caro-Kann Defense: Classical Variation", moves: "e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5", eco: "B18" },
    { name: "Sicilian Defense", moves: "e4 c5", eco: "B20" },
    { name: "Sicilian Defense: Alapin Variation", moves: "e4 c5 c3", eco: "B22" },
    { name: "Sicilian Defense: Closed", moves: "e4 c5 Nc3", eco: "B23" },
    { name: "Sicilian Defense: Open", moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4", eco: "B50" },
    { name: "Sicilian Defense: Dragon Variation", moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6", eco: "B70" },
    { name: "Sicilian Defense: Scheveningen Variation", moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 e6", eco: "B80" },
    { name: "Sicilian Defense: Najdorf Variation", moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6", eco: "B90" },

    // C00-C99 (Open Games)
    { name: "French Defense", moves: "e4 e6", eco: "C00" },
    { name: "French Defense: Advance Variation", moves: "e4 e6 d4 d5 e5", eco: "C02" },
    { name: "French Defense: Tarrasch Variation", moves: "e4 e6 d4 d5 Nd2", eco: "C03" },
    { name: "French Defense: Winawer Variation", moves: "e4 e6 d4 d5 Nc3 Bb4", eco: "C15" },
    { name: "Open Game", moves: "e4 e5", eco: "C20" },
    { name: "Center Game", moves: "e4 e5 d4", eco: "C21" },
    { name: "Vienna Game", moves: "e4 e5 Nc3", eco: "C25" },
    { name: "King's Gambit", moves: "e4 e5 f4", eco: "C30" },
    { name: "King's Gambit Accepted", moves: "e4 e5 f4 exf4", eco: "C33" },
    { name: "Petrov's Defense", moves: "e4 e5 Nf3 Nf6", eco: "C42" },
    { name: "Scotch Game", moves: "e4 e5 Nf3 Nc6 d4", eco: "C45" },
    { name: "Four Knights Game", moves: "e4 e5 Nf3 Nc6 Nc3 Nf6", eco: "C47" },
    { name: "Italian Game", moves: "e4 e5 Nf3 Nc6 Bc4", eco: "C50" },
    { name: "Italian Game: Evans Gambit", moves: "e4 e5 Nf3 Nc6 Bc4 Bc5 b4", eco: "C51" },
    { name: "Italian Game: Giuoco Piano", moves: "e4 e5 Nf3 Nc6 Bc4 Bc5", eco: "C53" },
    { name: "Two Knights Defense", moves: "e4 e5 Nf3 Nc6 Bc4 Nf6", eco: "C55" },
    { name: "Ruy Lopez", moves: "e4 e5 Nf3 Nc6 Bb5", eco: "C60" },
    { name: "Ruy Lopez: Exchange Variation", moves: "e4 e5 Nf3 Nc6 Bb5 a6 Bxc6", eco: "C68" },
    { name: "Ruy Lopez: Berlin Defense", moves: "e4 e5 Nf3 Nc6 Bb5 Nf6", eco: "C65" },
    { name: "Ruy Lopez: Open Defense", moves: "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Nxe4", eco: "C80" },
    { name: "Ruy Lopez: Marshall Attack", moves: "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 O-O c3 d5", eco: "C89" },
    { name: "Ruy Lopez: Closed Defense", moves: "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3", eco: "C92" },

    // D00-D99 (Closed Games)
    { name: "Queen's Pawn Game", moves: "d4 d5", eco: "D00" },
    { name: "London System", moves: "d4 d5 Bf4", eco: "D02" },
    { name: "Queen's Gambit", moves: "d4 d5 c4", eco: "D06" },
    { name: "Queen's Gambit Declined", moves: "d4 d5 c4 e6", eco: "D30" },
    { name: "Queen's Gambit Declined: Tarrasch", moves: "d4 d5 c4 e6 Nc3 c5", eco: "D32" },
    { name: "Slav Defense", moves: "d4 d5 c4 c6", eco: "D10" },
    { name: "Semi-Slav Defense", moves: "d4 d5 c4 c6 Nc3 Nf6 Nf3 e6", eco: "D43" },
    { name: "Queen's Gambit Accepted", moves: "d4 d5 c4 dxc4", eco: "D20" },
    { name: "Gruenfeld Defense", moves: "d4 Nf6 c4 g6 Nc3 d5", eco: "D80" },

    // E00-E99 (Indian Defenses)
    { name: "Catalan Opening", moves: "d4 Nf6 c4 e6 g3", eco: "E00" },
    { name: "Nimzo-Indian Defense", moves: "d4 Nf6 c4 e6 Nc3 Bb4", eco: "E20" },
    { name: "Queen's Indian Defense", moves: "d4 Nf6 c4 e6 Nf3 b6", eco: "E12" },
    { name: "King's Indian Defense", moves: "d4 Nf6 c4 g6", eco: "E60" },
    { name: "King's Indian Defense: Classical", moves: "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5", eco: "E90" },
    { name: "Dutch Defense", moves: "d4 f5", eco: "A80" }, // Note: Dutch is A80 but fits here conceptually
    { name: "Dutch Defense: Leningrad", moves: "d4 f5 c4 Nf6 g3 g6 Bg2 Bg7 Nf3", eco: "A87" },
    { name: "Dutch Defense: Stonewall", moves: "d4 f5 c4 Nf6 g3 e6 Bg2 d5 Nf3 c6 O-O Bd6", eco: "A90" },
    { name: "Benoni Defense", moves: "d4 Nf6 c4 c5", eco: "A56" },
    { name: "Modern Benoni", moves: "d4 Nf6 c4 c5 d5 e6", eco: "A60" },
    { name: "Benko Gambit", moves: "d4 Nf6 c4 c5 d5 b5", eco: "A57" }
];

export const identifyOpening = (pgn: string): string => {
    // Clean PGN to just get moves
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
