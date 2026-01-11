# Chess.com Clone

A fully-featured web-based chess platform built with React and TypeScript that replicates the functionality and user experience of Chess.com.

## Features

### Game Modes
- **Play** - Rated online games with matchmaking simulation
- **Play a Friend** - Pass-and-play or online via shared game links
- **Play Bots** - 17+ AI opponents with varying skill levels (from beginner to GM)
- **Play Coach** - Practice mode with real-time guidance and analysis
- **Tournaments** - Tournament bracket system with participant management

### Puzzles & Training
- **Solve Puzzles** - Curated chess puzzles with difficulty ratings
- **Puzzle Rush** - Timed puzzle challenges with streak tracking
- **Daily Puzzle** - Featured puzzle updated daily
- **Custom Puzzles** - Create and solve custom puzzles

### Learning & Analysis
- **Lessons** - Structured chess lessons with progress tracking
- **Openings** - Opening theory explorer with 100+ common openings
- **Analysis Board** - Full game analysis powered by Stockfish engine
  - PGN import/export
  - Move evaluation and best-move suggestions
  - Position evaluation with analysis depth control

### Customization
- **6 Board Themes** - Choose your preferred board appearance
- **7 Piece Sets** - Neo, Wood, Alpha, Classic, Icy, Glass, Game Room
- **Animation Speed** - Adjustable piece movement speed
- **Sound Effects** - Move, capture, and check sounds
- **Move Input Methods** - Drag-and-drop or click-to-move

## Tech Stack

- **Frontend**: React 18.3.1 + TypeScript 5.8.2
- **Build Tool**: Vite 5.4.21
- **Styling**: Tailwind CSS
- **Chess Logic**: chess.js 1.0.0-beta.8
- **Chess UI**: react-chessboard 4.7.2
- **Multiplayer**: PeerJS 1.5.5 (P2P networking)
- **Chess Engine**: Stockfish.js 10.0.0 (Web Worker)
- **Icons**: lucide-react 0.562.0

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Sir-Teo/web-chess-dot-com.git
cd web-chess-dot-com
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Architecture

This is a **fully client-side application** with no backend server:

- **State Management**: React Context API for global settings and user profiles
- **Data Persistence**: Browser localStorage for user preferences and game history
- **Multiplayer**: Direct peer-to-peer connections via PeerJS
- **AI Analysis**: Stockfish chess engine running in a Web Worker
- **Responsive Design**: Mobile-optimized with adaptive UI

## Project Structure

```
/
├── components/          # React components (30+ files)
│   ├── GameInterface.tsx       # Main gameplay component
│   ├── AnalysisInterface.tsx   # Game analysis panel
│   ├── PuzzlesInterface.tsx    # Puzzle solver
│   ├── MultiplayerInterface.tsx # P2P multiplayer
│   └── ...
├── context/            # Global state management
│   ├── SettingsContext.tsx    # Theme, animation, sound preferences
│   └── UserContext.tsx        # User profile and ratings
├── hooks/              # Custom React hooks
│   ├── useGameTimer.ts        # Timer management
│   ├── useStockfish.ts        # Engine integration
│   ├── useCoach.ts            # Coaching logic
│   └── ...
├── src/utils/          # Utility data & logic
│   ├── bots.ts                # Bot profiles
│   ├── puzzles.ts             # Chess puzzles
│   ├── openings.ts            # Opening definitions
│   └── lessons.ts             # Lesson content
└── public/             # Static assets

```

## Key Features Detail

### Real-time Analysis
- Stockfish engine runs in a separate Web Worker thread for non-blocking analysis
- Configurable analysis depth (1-20 levels)
- Move classification (brilliant, great, best, good, inaccuracy, mistake, blunder)
- Real-time position evaluation bar

### Multiplayer System
- No server required - uses WebRTC via PeerJS
- Create or join games with shareable peer IDs
- Real-time move synchronization
- Game lobby for browsing available matches

### Mobile Support
- Responsive design with mobile-first approach
- Bottom navigation bar on small screens
- Safe area insets for notched devices
- Touch-optimized chessboard controls

## Documentation

For detailed technical documentation, see [docs/documentation.md](docs/documentation.md)

## License

This project is a clone for educational purposes.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## Acknowledgments

- Chess logic powered by [chess.js](https://github.com/jhlywa/chess.js)
- Chess engine powered by [Stockfish.js](https://github.com/nmrugg/stockfish.js)
- Chessboard UI by [react-chessboard](https://github.com/Clariity/react-chessboard)
- P2P networking by [PeerJS](https://peerjs.com/)
