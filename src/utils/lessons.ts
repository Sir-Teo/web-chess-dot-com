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
            }
        ]
    }
];
