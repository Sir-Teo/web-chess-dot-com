# Chess.com Clone

A high-fidelity web-based chess platform built with React and TypeScript, featuring interactive gameplay, AI analysis, and comprehensive learning tools.

## Features

- **Multiple Game Modes**: Play online, against AI bots, locally (pass-and-play), or with friends via P2P
- **Advanced Analysis**: Stockfish-powered game analysis with move classification (Brilliant, Blunder, etc.)
- **Puzzles & Training**: Standard puzzles, Puzzle Rush, daily challenges, and progressive lessons
- **Opening Study**: 100+ chess openings with ECO classification
- **Customization**: Multiple board and piece themes, settings for animations, sounds, and move input
- **Performance Tracking**: Elo estimation, accuracy ratings, and detailed statistics

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Chess Engine**: chess.js + Stockfish.js
- **UI Components**: react-chessboard, lucide-react
- **Networking**: PeerJS for multiplayer

## Quick Start

**Prerequisites**: Node.js

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app runs on `http://localhost:3000`

## Project Structure

```
├── App.tsx                     # Main router and state
├── components/                 # React components (29 total)
│   ├── GameInterface.tsx       # Main game UI
│   ├── AnalysisInterface.tsx   # Game analysis & review
│   ├── PuzzlesInterface.tsx    # Puzzle modes
│   └── ...
├── context/                    # User & settings context
├── hooks/                      # Custom React hooks
├── src/utils/                  # Game analysis, puzzles, openings
└── types.ts                    # TypeScript interfaces
```

## Key Features Detail

### Game Analysis
- Real-time Stockfish evaluation
- Move classification with centipawn analysis
- Opening identification
- Player accuracy and performance rating

### Learning Tools
- Interactive lessons with progression tracking
- Opening database with detailed variations
- Coach mode with move feedback
- Bot opponents with adjustable difficulty

### Customization
- 6 board themes (Green, Brown, Blue, Gray, Purple, Orange)
- 7 piece sets (Neo, Wood, Alpha, Classic, Icy, Game Room, Glass)
- Configurable animations, sounds, and controls

## License

MIT
