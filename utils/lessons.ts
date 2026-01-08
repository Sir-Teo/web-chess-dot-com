export interface LessonChallenge {
    fen: string;
    moves: string[]; // Expected sequence (User, Opponent, User, Opponent...)
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
                fen: '8/8/8/3R4/8/8/8/4K2k w - - 0 1',
                moves: ['d5d8'],
                instruction: 'The Rook moves in straight lines. Move the rook to the top rank to check the King.',
                explanation: 'Great! Rooks can move as far as they want up, down, left, or right.'
            },
            {
                fen: '8/8/8/4B3/8/8/8/4K2k w - - 0 1',
                moves: ['e5h8'],
                instruction: 'The Bishop moves diagonally. Move the bishop to the corner (h8) to attack.',
                explanation: 'Excellent! Bishops always stay on the same color square.'
            },
            {
                fen: '8/8/8/8/3Q4/8/8/4K2k w - - 0 1',
                moves: ['d4h8'],
                instruction: 'The Queen is powerful! She combines the moves of Rook and Bishop. Move to h8.',
                explanation: 'Perfect! The Queen is the most valuable piece.'
            }
        ]
    },
    {
        id: 'basic-tactics',
        title: 'Basic Tactics',
        category: 'Beginner',
        description: 'Learn fundamental tactical patterns like Forks and Pins.',
        image: 'https://images.chesscomfiles.com/uploads/v1/article/25838.45564887.668x375o.1d0115016550.jpeg',
        challenges: [
            {
                // Knight Fork
                // White Knight e5. Black King h8, Queen d8.
                fen: '3q3k/8/8/4N3/8/8/8/6K1 w - - 0 1',
                moves: ['e5f7', 'h8g8', 'f7d8'],
                instruction: 'Perform a Knight Fork! Attack both the King and the Queen simultaneously.',
                explanation: 'You got it! The Knight forked the King and Queen, winning the Queen on the next move.'
            },
            {
                // Pin
                // White Bishop c4. Black Queen f7, King g8.
                fen: '6k1/5q2/8/8/2B5/8/8/6K1 w - - 0 1',
                moves: ['c4f7', 'g8f8', 'f7e8'],
                instruction: 'The Black Queen is pinned to the King! Capture it.',
                explanation: 'Well done. The Queen could not escape because it was pinned by your Bishop.'
            }
        ]
    },
    {
        id: 'checkmate-patterns',
        title: 'Checkmate Patterns',
        category: 'Intermediate',
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
    },
    {
        id: 'italian-game',
        title: 'The Italian Game',
        category: 'Beginner',
        description: 'Master the first moves of this classic opening.',
        image: 'https://images.chesscomfiles.com/uploads/v1/article/25838.45564887.668x375o.1d0115016550.jpeg',
        challenges: [
            {
                fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4'],
                instruction: 'Play the first 3 moves of the Italian Game (e4, Nf3, Bc4) for White.',
                explanation: 'Excellent! You have controlled the center, developed your knight, and placed your bishop on an active diagonal.'
            }
        ]
    },
    {
        id: 'castling',
        title: 'Castling',
        category: 'Beginner',
        description: 'Learn how to castle to protect your King.',
        image: 'https://images.chesscomfiles.com/uploads/v1/article/25838.45564887.668x375o.1d0115016550.jpeg',
        challenges: [
            {
                fen: '4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1',
                moves: ['e1g1'],
                instruction: 'Castle Kingside (Short Castle).',
                explanation: 'Great! The King moves two squares to the right, and the Rook jumps over.'
            },
            {
                fen: '4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1',
                moves: ['e1c1'],
                instruction: 'Castle Queenside (Long Castle).',
                explanation: 'Perfect! The King moves two squares to the left.'
            }
        ]
    },
    {
        id: 'en-passant',
        title: 'En Passant',
        category: 'Intermediate',
        description: 'The special pawn capture rule everyone forgets!',
        image: 'https://images.chesscomfiles.com/uploads/v1/article/25838.45564887.668x375o.1d0115016550.jpeg',
        challenges: [
            {
                fen: 'rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2',
                moves: ['f7f5', 'e5f6'],
                instruction: 'Black plays f5. Perform En Passant capture!',
                explanation: 'Correct! You can only capture en passant immediately after the pawn moves two squares.'
            }
        ]
    },
    {
        id: 'queen-vs-pawn',
        title: 'Queen vs Pawn',
        category: 'Advanced',
        description: 'Winning with a Queen against a Pawn on the 7th rank.',
        image: 'https://images.chesscomfiles.com/uploads/v1/article/25838.45564887.668x375o.1d0115016550.jpeg',
        challenges: [
            {
                fen: '8/2P5/8/8/8/6Q1/8/4K1k1 w - - 0 1',
                moves: ['g3e3', 'g1f1', 'e3f3', 'f1g1', 'f3g3', 'g1f1', 'g3h2'],
                instruction: 'Force the King in front of the pawn to bring your King closer.',
                explanation: 'Well done! By forcing the King to block the pawn, you gain time to bring your own King.'
            }
        ]
    }
];
