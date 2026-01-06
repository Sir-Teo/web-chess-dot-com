export interface LessonChallenge {
    fen: string;
    moves: string[]; // Expected sequence
    instruction: string;
    explanation: string; // Shown after success
}

export interface Lesson {
    id: string;
    title: string;
    category: 'Beginner' | 'Intermediate' | 'Advanced';
    description: string;
    image: string;
    challenges: LessonChallenge[];
}

export const LESSONS: Lesson[] = [
    {
        id: 'moving-pieces',
        title: 'Moving the Pieces',
        category: 'Beginner',
        description: 'Learn how each chess piece moves.',
        image: 'https://images.chesscomfiles.com/uploads/v1/article/25780.0e0176b6.668x375o.5042614b1497.jpeg',
        challenges: [
            {
                // Added Kings to avoid invalid FEN error from chess.js
                fen: '8/8/8/3R4/8/8/8/4K2k w - - 0 1',
                moves: ['d5d8'],
                instruction: 'The Rook moves in straight lines. Move the rook to the top rank.',
                explanation: 'Great! Rooks can move as far as they want up, down, left, or right.'
            },
            {
                fen: '8/8/8/4B3/8/8/8/4K2k w - - 0 1',
                moves: ['e5h8'],
                instruction: 'The Bishop moves diagonally. Move the bishop to the corner (h8).',
                explanation: 'Excellent! Bishops always stay on the same color square.'
            },
            {
                fen: '8/8/8/3Q4/8/8/8/4K2k w - - 0 1',
                moves: ['d5h1'],
                instruction: 'The Queen is the most powerful piece. Move her to the bottom right corner (h1).',
                explanation: 'Correct! The Queen combines the power of the Rook and Bishop.'
            }
        ]
    },
    {
        id: 'special-moves',
        title: 'Special Moves',
        category: 'Beginner',
        description: 'Castling, En Passant, and Pawn Promotion.',
        image: 'https://images.chesscomfiles.com/uploads/v1/article/25782.16489376.668x375o.5a9141709405.jpeg',
        challenges: [
            {
                fen: 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1',
                moves: ['e1g1'],
                instruction: 'Castle Kingside (Short Castling). Move the King two squares to the right.',
                explanation: 'Good! Castling safeguards your King and activates your Rook.'
            },
            {
                fen: 'rnbqkb1r/ppp1pppp/5n2/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3',
                moves: ['e5d6'],
                instruction: 'Perform "En Passant". Capture the black pawn that just moved two squares.',
                explanation: 'You got it! En Passant is a special pawn capture rule.'
            },
            {
                fen: '8/P7/8/8/8/8/8/k1K5 w - - 0 1',
                moves: ['a7a8q'],
                instruction: 'Promote the pawn to a Queen.',
                explanation: 'Perfect! Pawns can become any piece (except a King) when they reach the other side.'
            }
        ]
    },
    {
        id: 'checkmate-patterns',
        title: 'Checkmate Patterns',
        category: 'Beginner',
        description: 'Learn the most common checkmate patterns to win games.',
        image: 'https://images.chesscomfiles.com/uploads/v1/article/25838.45564887.668x375o.1d0115016550.jpeg',
        challenges: [
            {
                fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
                moves: ['e1e8'],
                instruction: 'Deliver a Back Rank Mate.',
                explanation: 'Perfect! The king is trapped behind his own pawns.'
            },
            {
                fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
                moves: ['h5f7'],
                instruction: 'Execute the Scholar\'s Mate.',
                explanation: 'You got it! This is a classic trap in the opening.'
            },
            {
                fen: '8/8/8/4k3/R7/1R6/8/7K w - - 0 1',
                moves: ['a4a5', 'e5d6', 'b3b6'],
                instruction: 'Perform a Ladder Mate. Start by checking the King with the lower rook.',
                explanation: 'Well done! The two rooks work together to force the King to the edge and deliver checkmate.'
            }
        ]
    },
    {
        id: 'tactics-basics',
        title: 'Basic Tactics',
        category: 'Intermediate',
        description: 'Forks, Pins, and Skewers.',
        image: 'https://images.chesscomfiles.com/uploads/v1/article/25836.26252174.668x375o.5042614b1497.jpeg',
        challenges: [
             {
                // Simple Knight Fork
                // Black King on e8, Rook on a8.
                // White Knight on e4.
                // Move: Nd6+ -> Forks King and Rook? No, if King is on e8, Nd6 is check. Ra8 is not attacked.
                // Let's optimize.
                // Black King on e8. Black Rook on c8.
                // White Knight on e4.
                // Nd6+ attacks e8 and c8.
                fen: '2r1k3/8/8/8/4N3/8/8/4K3 w - - 0 1',
                moves: ['e4d6', 'e8d8', 'd6c8'],
                instruction: 'Fork the King and Rook with your Knight.',
                explanation: 'Nice! A fork attacks two pieces at once.'
             },
             {
                 // Pin: White Rook on e1, Black Queen on e5, Black King on e8.
                 fen: '4k3/8/8/4q3/8/8/8/4R1K1 w - - 0 1',
                 moves: ['e1e5'], // Capture pinned piece.
                 instruction: 'The Black Queen is pinned to the King. Capture it!',
                 explanation: 'Correct! Pinned pieces cannot move out of the line of attack.'
             }
        ]
    }
];
