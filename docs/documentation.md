# Chess.com Clone - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Core Components](#core-components)
5. [State Management](#state-management)
6. [Custom Hooks](#custom-hooks)
7. [Game Modes](#game-modes)
8. [Multiplayer System](#multiplayer-system)
9. [Chess Engine Integration](#chess-engine-integration)
10. [Data Flow](#data-flow)
11. [Theme System](#theme-system)
12. [Audio System](#audio-system)
13. [Development Guide](#development-guide)

---

## Architecture Overview

This is a **fully client-side Single Page Application (SPA)** with no backend server. All game logic, state management, and data persistence are handled in the browser.

### Key Architectural Decisions

1. **No Backend Server**: All functionality runs client-side for simplicity and portability
2. **Web Workers**: Stockfish chess engine runs in a separate thread to prevent UI blocking
3. **P2P Networking**: WebRTC via PeerJS enables multiplayer without a centralized server
4. **localStorage Persistence**: User profiles, settings, and game history are stored locally
5. **Context API**: Global state management without Redux complexity
6. **Component-Based Architecture**: Modular React components with clear separation of concerns

### High-Level Data Flow

```
User Input (UI Events)
    ↓
React Components
    ↓
Custom Hooks (useGameTimer, useStockfish, useCoach, etc.)
    ↓
Context API (SettingsContext, UserContext)
    ↓
chess.js (Move Validation & Game State)
    ↓
react-chessboard (Visual Rendering)
    ↓
localStorage (Persistence)
```

---

## Technology Stack

### Core Framework
- **React 18.3.1**: UI library with hooks and functional components
- **TypeScript 5.8.2**: Type safety and enhanced developer experience
- **Vite 5.4.21**: Fast build tool and development server

### Chess Libraries
- **chess.js 1.0.0-beta.8**: Chess move validation, FEN/PGN parsing, game rules
- **react-chessboard 4.7.2**: Interactive chessboard component with drag-and-drop
- **Stockfish.js 10.0.0**: Chess engine for analysis and AI opponents

### Networking & Real-time
- **PeerJS 1.5.5**: WebRTC wrapper for peer-to-peer connections

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework (CDN-based)
- **lucide-react 0.562.0**: Icon library
- **classnames 2.5.1**: Conditional CSS class management

### Browser APIs
- **Web Workers**: For running Stockfish in background thread
- **Web Audio API**: For playing sound effects
- **localStorage**: For persisting user data and settings

---

## Project Structure

```
/web-chess-dot-com/
│
├── components/                    # React UI components (30 files)
│   ├── GameInterface.tsx          # Main gameplay hub (57KB)
│   ├── Sidebar.tsx                # Navigation with flyout menus
│   ├── Chessboard.tsx             # Chessboard wrapper component
│   ├── Dashboard.tsx              # Home screen
│   ├── AnalysisInterface.tsx      # Game analysis panel
│   ├── PuzzlesInterface.tsx       # Puzzle solver
│   ├── MultiplayerInterface.tsx   # P2P multiplayer
│   ├── TournamentsInterface.tsx   # Tournament brackets
│   ├── LessonsInterface.tsx       # Learning module
│   ├── OpeningsInterface.tsx      # Opening explorer
│   ├── ProfileInterface.tsx       # User profile page
│   ├── SettingsModal.tsx          # Settings overlay
│   ├── CoachFeedback.tsx          # Real-time coaching
│   ├── EvaluationBar.tsx          # Position evaluation display
│   ├── GameReviewPanel.tsx        # Post-game analysis
│   └── [15 other components]      # Modals, panels, UI elements
│
├── context/                       # Global state management (2 files)
│   ├── SettingsContext.tsx        # Theme, animation, sound preferences
│   └── UserContext.tsx            # User profile (rating, avatar, etc.)
│
├── hooks/                         # Custom React hooks (6 files)
│   ├── useGameTimer.ts            # Time control with warnings
│   ├── useStockfish.ts            # Stockfish Web Worker integration
│   ├── useCoach.ts                # Coaching logic
│   ├── useGameSound.ts            # Audio playback
│   ├── useBotChatter.ts           # Bot personality dialogue
│   └── useLessonProgress.ts       # Lesson tracking
│
├── src/utils/                     # Utility data & logic (5 files)
│   ├── bots.ts                    # 17+ bot profiles with personalities
│   ├── puzzles.ts                 # 100+ chess puzzles
│   ├── openings.ts                # 100+ opening definitions (ECO codes)
│   ├── lessons.ts                 # Structured lesson content
│   └── gameAnalysis.ts            # Stockfish client wrapper
│
├── utils/                         # General utilities
│   └── gameAnalysis.ts            # Game analysis logic
│
├── public/assets/sounds/          # Audio files
│   ├── move.mp3                   # Move sound
│   ├── capture.mp3                # Capture sound
│   ├── check.mp3                  # Check sound
│   └── 10-seconds.mp3             # Time warning
│
├── types.ts                       # TypeScript type definitions
├── constants.ts                   # Piece images, initial board state
├── App.tsx                        # Main app with providers
├── index.tsx                      # React root
├── index.html                     # HTML entry point
├── vite.config.ts                 # Vite configuration
└── tsconfig.json                  # TypeScript config
```

---

## Core Components

### GameInterface.tsx (57.6 KB)

The central gameplay component that orchestrates all game modes.

**Responsibilities:**
- Manages chess.js instance for game state
- Handles move validation and execution
- Coordinates timer, coach, and analysis systems
- Manages game modes (play, vs bot, coach mode)
- Handles promotions, time controls, and game termination
- Integrates with Stockfish for bot moves and coaching

**Key State:**
- `game`: chess.js instance
- `gamePosition`: Current FEN string
- `moveHistory`: Array of moves in SAN notation
- `selectedSquare`: Currently selected piece
- `gameMode`: Current mode (play/bot/coach)
- `timer`: Time remaining for both players

**Props:**
```typescript
interface GameInterfaceProps {
  gameMode?: 'play' | 'bot' | 'coach' | 'friend';
  botDifficulty?: number;
  timeControl?: { time: number; increment: number };
}
```

### AnalysisInterface.tsx

Full-featured analysis board with Stockfish integration.

**Features:**
- PGN import/export
- Position setup via FEN
- Move navigation (forward/backward)
- Stockfish analysis with depth control
- Best move suggestions
- Position evaluation
- Drawing arrows on the board

**State:**
- `game`: chess.js instance for analysis
- `moveHistory`: Analyzed moves
- `currentMoveIndex`: Position in move history
- `evaluation`: Stockfish evaluation score
- `bestMove`: Engine's recommended move
- `analysisDepth`: Stockfish search depth (1-20)

### PuzzlesInterface.tsx

Puzzle-solving interface with multiple modes.

**Features:**
- Loads puzzles from `src/utils/puzzles.ts`
- Validates user moves against solution
- Provides hints (highlighting destination square)
- Tracks success/failure statistics
- Multiple difficulty levels (rating-based)
- Puzzle Rush mode with timer

**Puzzle Data Structure:**
```typescript
interface Puzzle {
  id: string;
  fen: string;              // Starting position
  moves: string[];          // Solution moves in UCI format
  rating: number;           // Difficulty rating
  themes: string[];         // Tactical themes (fork, pin, etc.)
}
```

### MultiplayerInterface.tsx

Peer-to-peer multiplayer using PeerJS.

**Connection Flow:**
1. User creates a game and gets a peer ID
2. Peer ID is shared with opponent (copy link)
3. Opponent joins using the peer ID
4. PeerJS establishes WebRTC DataConnection
5. Moves are synchronized via peer.send()

**Message Types:**
```typescript
interface GameMessage {
  type: 'move' | 'resign' | 'draw_offer' | 'chat';
  data: {
    from?: string;
    to?: string;
    promotion?: string;
    message?: string;
  };
}
```

**State:**
- `peerId`: Local peer ID
- `connection`: PeerJS DataConnection
- `isConnected`: Connection status
- `opponentPeerId`: Remote peer ID

### Sidebar.tsx

Main navigation component with flyout menus.

**Features:**
- Hover-triggered flyout submenus
- Active tab highlighting
- Mobile-responsive (hamburger menu)
- Icons from lucide-react
- Settings modal trigger

**Navigation Structure:**
```
Play
├── Play Online
├── Play a Friend
├── Play Computer
├── Play Coach
└── Tournaments

Puzzles
├── Solve Puzzles
├── Puzzle Rush
├── Daily Puzzle
└── Custom Puzzles

Learn
├── Lessons
├── Openings
└── Analysis

Profile
└── Game History
```

### SettingsModal.tsx

Global settings configuration overlay.

**Configurable Settings:**
- Board theme (6 options)
- Piece theme (7 options)
- Animation speed (slow/normal/fast)
- Sound effects (on/off)
- Move method (drag/click)
- Show coordinates (on/off)

**Persistence:**
All settings are saved to localStorage via SettingsContext.

---

## State Management

### Context API Architecture

Two primary contexts provide global state:

#### 1. SettingsContext

Manages user preferences and persists to localStorage.

**State Schema:**
```typescript
interface SettingsState {
  boardTheme: 'blue' | 'brown' | 'green' | 'gray' | 'purple' | 'red';
  pieceTheme: 'neo' | 'wood' | 'alpha' | 'classic' | 'icy' | 'glass' | 'game-room';
  animationSpeed: 'slow' | 'normal' | 'fast';
  soundEnabled: boolean;
  moveMethod: 'drag' | 'click';
  showCoordinates: boolean;
}
```

**Usage:**
```typescript
import { useSettings } from '../context/SettingsContext';

function MyComponent() {
  const { boardTheme, pieceTheme, updateSettings } = useSettings();

  return (
    <button onClick={() => updateSettings({ boardTheme: 'green' })}>
      Change Theme
    </button>
  );
}
```

**Persistence:**
- Saves to `localStorage['chessSettings']` on every update
- Loads from localStorage on mount
- Falls back to defaults if no saved settings exist

#### 2. UserContext

Manages user profile and game statistics.

**State Schema:**
```typescript
interface UserState {
  username: string;
  rating: number;
  avatar: string;
  country: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDraw: number;
  puzzleRating: number;
  puzzlesSolved: number;
}
```

**Usage:**
```typescript
import { useUser } from '../context/UserContext';

function Profile() {
  const { user, updateUser } = useUser();

  return <div>Rating: {user.rating}</div>;
}
```

**Game History:**
- Stores game records in localStorage
- Tracks wins, losses, draws
- Maintains rating changes over time

### Local Component State

Components use React hooks for ephemeral state:

- `useState`: For component-specific state (selected square, modals, etc.)
- `useEffect`: For side effects (timers, Stockfish initialization)
- `useMemo`: For expensive computations (board styles, theme colors)
- `useCallback`: For stable function references

---

## Custom Hooks

### useGameTimer.ts

Manages chess clock with increment support.

**Features:**
- Countdown timer for both players
- Time increment after each move
- Low-time warning (10 seconds)
- Automatic timeout detection

**API:**
```typescript
interface UseGameTimerReturn {
  whiteTime: number;          // Seconds remaining
  blackTime: number;
  isRunning: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  switchTurn: () => void;     // Switches clock and adds increment
  resetTimer: (timeControl: { time: number; increment: number }) => void;
}

const timer = useGameTimer({
  initialTime: 600,           // 10 minutes
  increment: 0,               // No increment
  onTimeout: (color) => {
    console.log(`${color} ran out of time`);
  }
});
```

**Implementation Details:**
- Uses `setInterval` for countdown (1000ms intervals)
- Plays warning sound at 10 seconds
- Calls `onTimeout` callback when time expires
- Automatically switches active clock on `switchTurn()`

### useStockfish.ts

Integrates Stockfish chess engine via Web Worker.

**Features:**
- Initializes Stockfish in separate thread
- Sends UCI commands to engine
- Parses engine output (evaluation, best move, mate scores)
- Configurable analysis depth

**API:**
```typescript
interface UseStockfishReturn {
  evaluation: number | null;      // Position evaluation in centipawns
  bestMove: string | null;        // Best move in UCI format (e.g., "e2e4")
  isAnalyzing: boolean;
  analyzePosition: (fen: string, depth?: number) => void;
  stopAnalysis: () => void;
  makeEngineMove: (fen: string, skillLevel: number) => Promise<string>;
}

const stockfish = useStockfish();

// Analyze position
stockfish.analyzePosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 15);

// Get engine move for bot
const move = await stockfish.makeEngineMove(currentFen, 10);
```

**UCI Protocol:**
```
position fen <FEN_STRING>
go depth <DEPTH>
stop
```

**Engine Output Parsing:**
- Extracts evaluation from `info score cp <value>`
- Detects mate in N from `info score mate <moves>`
- Parses best move from `bestmove <move>`

### useCoach.ts

Provides real-time coaching and move suggestions.

**Features:**
- Analyzes current position
- Identifies threats and tactical opportunities
- Classifies moves (brilliant, great, best, good, inaccuracy, mistake, blunder)
- Suggests better alternatives for poor moves

**API:**
```typescript
interface UseCoachReturn {
  suggestion: string | null;      // Text suggestion
  bestMove: string | null;        // Recommended move
  threats: string[];              // Detected threats
  showSuggestion: boolean;
  analyzedMove: (from: string, to: string) => MoveQuality;
}

type MoveQuality = 'brilliant' | 'great' | 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
```

**Move Classification Logic:**
```typescript
const evaluationDrop = previousEval - currentEval;

if (evaluationDrop < 20) return 'best';
if (evaluationDrop < 50) return 'good';
if (evaluationDrop < 100) return 'inaccuracy';
if (evaluationDrop < 300) return 'mistake';
return 'blunder';
```

### useGameSound.ts

Manages audio playback for game events.

**Features:**
- Plays sounds for moves, captures, checks
- Plays warning sound at low time
- Respects user's sound preference from settings

**API:**
```typescript
interface UseGameSoundReturn {
  playMoveSound: () => void;
  playCaptureSound: () => void;
  playCheckSound: () => void;
  playTimeWarningSound: () => void;
}

const sound = useGameSound();

// Play sound on move
if (isCapture) {
  sound.playCaptureSound();
} else {
  sound.playMoveSound();
}
```

**Implementation:**
Uses Web Audio API with preloaded Audio elements:
```typescript
const moveSound = new Audio('/assets/sounds/move.mp3');
moveSound.play();
```

### useBotChatter.ts

Generates personality-based dialogue for bot opponents.

**Features:**
- Pre-defined personality profiles for each bot
- Context-aware messages (game start, good move, blunder, checkmate)
- Random selection from message pools

**API:**
```typescript
interface UseBotChatterReturn {
  getMessage: (event: ChatEvent, botId: string) => string;
}

type ChatEvent = 'gameStart' | 'goodMove' | 'blunder' | 'checkmate' | 'draw';

const chatter = useBotChatter();
const message = chatter.getMessage('gameStart', 'bot-beginner-1');
// Returns: "Good luck! I'm still learning."
```

---

## Game Modes

### 1. Play Online (Simulated)

**Description:** Simulated online matchmaking experience.

**Flow:**
1. User selects time control (Bullet, Blitz, Rapid, Classical)
2. Simulated "searching for opponent" animation
3. Match created with simulated opponent (random username, rating)
4. Game plays like standard chess with timer
5. Opponent moves are randomized (not using engine)

**Limitations:**
- No real matchmaking (single-player simulation)
- Opponent moves are random legal moves
- No persistent online leaderboard

### 2. Play a Friend

**Two Modes:**

**Pass-and-Play:**
- Single device, alternating turns
- No timer by default
- Simple local multiplayer

**Online via Link:**
- Uses PeerJS for P2P connection
- Share link with peer ID
- Real-time move synchronization
- Works across different networks

**Online Setup:**
```typescript
// Host creates game
const peer = new Peer();
peer.on('open', (id) => {
  // Share this ID: https://yourapp.com/play?peer=<id>
});

// Opponent joins
const connection = peer.connect(hostPeerId);
connection.on('data', (data) => {
  // Receive opponent's move
});
```

### 3. Play Computer (Bots)

**Bot Profiles:** 17+ bots with different skill levels and personalities.

**Bot Configuration:**
```typescript
interface Bot {
  id: string;
  name: string;
  rating: number;
  description: string;
  avatar: string;
  skillLevel: number;        // 0-20 for Stockfish
  personality: {
    aggressive: boolean;
    chatty: boolean;
    messages: {
      gameStart: string[];
      goodMove: string[];
      blunder: string[];
    };
  };
}
```

**Examples:**
- **Beth (Beginner, 400 rating)**: Skill level 1, friendly messages
- **Magnus (GM, 2850 rating)**: Skill level 20, minimal chat
- **Tal (Aggressive, 2650 rating)**: Prefers tactical complications

**Engine Integration:**
```typescript
const move = await stockfish.makeEngineMove(fen, bot.skillLevel);
game.move(move);
```

### 4. Play Coach

**Description:** Practice mode with real-time AI coaching.

**Features:**
- Real-time move suggestions
- Threat detection
- Move quality assessment
- Alternative move recommendations

**Coach Panel:**
```
[Your Move: e4]
Quality: Good move
Evaluation: +0.3

Better: Nf3 leads to +0.5
Threats: Opponent can develop knight to f6
```

**Configuration:**
- Toggle suggestions on/off
- Adjust suggestion frequency
- Show/hide best move arrows

### 5. Tournaments

**Features:**
- Bracket-style elimination
- Multiple participants (simulated)
- Progression through rounds
- Winner declaration

**Tournament Structure:**
```typescript
interface Tournament {
  id: string;
  name: string;
  participants: Player[];
  rounds: Round[];
  currentRound: number;
  winner: Player | null;
}

interface Round {
  matches: Match[];
}

interface Match {
  player1: Player;
  player2: Player;
  winner: Player | null;
}
```

---

## Multiplayer System

### PeerJS Integration

**Architecture:**
```
Player A (Host)                    Player B (Opponent)
    |                                     |
    ├── Creates Peer ID                   |
    ├── Shares link with ID               |
    |                                     ├── Connects to Peer ID
    ├── Accepts connection                |
    |                                     |
    ├── Sends move ──────────────────────>├── Receives move
    |                                     |
    |<─────────────────────────────────── ├── Sends move back
    ├── Receives move                     |
```

### Connection Setup

**Host:**
```typescript
import Peer from 'peerjs';

const peer = new Peer();

peer.on('open', (id) => {
  console.log('Your peer ID:', id);
  // Share: https://app.com/play?peer=<id>
});

peer.on('connection', (conn) => {
  conn.on('data', (data) => {
    // Handle opponent's move
    handleOpponentMove(data);
  });

  conn.on('open', () => {
    console.log('Connected!');
  });
});
```

**Opponent:**
```typescript
const peer = new Peer();
const hostPeerId = new URLSearchParams(window.location.search).get('peer');

const connection = peer.connect(hostPeerId);

connection.on('open', () => {
  console.log('Connected to host');
});

connection.on('data', (data) => {
  handleOpponentMove(data);
});

// Send move
connection.send({
  type: 'move',
  from: 'e2',
  to: 'e4'
});
```

### Move Synchronization

**Message Format:**
```typescript
interface MoveMessage {
  type: 'move';
  from: string;      // Source square (e.g., 'e2')
  to: string;        // Target square (e.g., 'e4')
  promotion?: 'q' | 'r' | 'b' | 'n';
  timestamp: number;
}
```

**Validation:**
```typescript
connection.on('data', (data: MoveMessage) => {
  // Validate it's opponent's turn
  if (game.turn() !== opponentColor) {
    console.error('Not opponent\'s turn');
    return;
  }

  // Validate move is legal
  const move = game.move({
    from: data.from,
    to: data.to,
    promotion: data.promotion
  });

  if (!move) {
    console.error('Illegal move received');
    return;
  }

  // Update UI
  setGamePosition(game.fen());
});
```

### Error Handling

**Connection Issues:**
```typescript
connection.on('error', (err) => {
  console.error('Connection error:', err);
  showError('Connection lost. Please try reconnecting.');
});

peer.on('error', (err) => {
  if (err.type === 'peer-unavailable') {
    showError('Opponent not found. Check the peer ID.');
  }
});
```

**Disconnection:**
```typescript
connection.on('close', () => {
  showNotification('Opponent disconnected.');
  pauseGame();
});
```

---

## Chess Engine Integration

### Stockfish.js Architecture

**Web Worker Setup:**
```typescript
// Initialize worker
const stockfishWorker = new Worker('/stockfish.js');

// Send UCI commands
stockfishWorker.postMessage('uci');
stockfishWorker.postMessage('isready');

// Listen for responses
stockfishWorker.onmessage = (event) => {
  const line = event.data;

  if (line.includes('bestmove')) {
    const move = line.split(' ')[1];
    console.log('Best move:', move);
  }

  if (line.includes('info score cp')) {
    const evaluation = parseInt(line.split('cp')[1]);
    console.log('Evaluation:', evaluation);
  }
};
```

### UCI Protocol Commands

**Position Setup:**
```
uci                           # Initialize engine
isready                       # Wait for ready
position fen <FEN>            # Set position
go depth 15                   # Analyze to depth 15
stop                          # Stop analysis
```

**Skill Level:**
```
setoption name Skill Level value 10
```

### Parsing Engine Output

**Evaluation Extraction:**
```typescript
function parseEvaluation(output: string): number | null {
  // Example: "info depth 15 score cp 25"
  const cpMatch = output.match(/score cp (-?\d+)/);
  if (cpMatch) {
    return parseInt(cpMatch[1]) / 100; // Convert centipawns to pawns
  }

  // Example: "info depth 15 score mate 3"
  const mateMatch = output.match(/score mate (-?\d+)/);
  if (mateMatch) {
    const mateIn = parseInt(mateMatch[1]);
    return mateIn > 0 ? 9999 : -9999; // Indicate forced mate
  }

  return null;
}
```

**Best Move Extraction:**
```typescript
function parseBestMove(output: string): string | null {
  // Example: "bestmove e2e4 ponder e7e5"
  const match = output.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
  return match ? match[1] : null;
}
```

### Analysis Depth Configuration

**Depth vs. Performance:**
- **Depth 1-5**: Instant, basic evaluation
- **Depth 10-15**: ~1-3 seconds, good accuracy
- **Depth 20+**: 10+ seconds, near-perfect play

**Dynamic Depth:**
```typescript
// Adjust depth based on position complexity
const pieceCount = game.board().flat().filter(p => p !== null).length;

let depth = 15; // Default
if (pieceCount < 10) {
  depth = 20; // Endgame: deeper analysis
} else if (pieceCount > 25) {
  depth = 12; // Opening: faster analysis
}

stockfish.analyzePosition(fen, depth);
```

---

## Data Flow

### Game Move Flow

```
User clicks piece
    ↓
onSquareClick(square) handler
    ↓
Validate square selection
    ↓
User clicks destination
    ↓
Validate move with chess.js
    ↓
[If promotion needed]
    ↓
Show promotion modal → Get piece type
    ↓
Execute move: game.move({ from, to, promotion })
    ↓
Update FEN: setGamePosition(game.fen())
    ↓
Update move history
    ↓
Play sound effect
    ↓
Switch timer
    ↓
[If multiplayer] Send move to opponent
    ↓
[If vs bot] Request engine move
    ↓
Check game over conditions
    ↓
Update UI
```

### Analysis Flow

```
User loads PGN or sets up position
    ↓
Parse PGN → Load into chess.js
    ↓
Initialize Stockfish worker
    ↓
User clicks "Analyze"
    ↓
Send position to Stockfish
    ↓
stockfish.analyzePosition(fen, depth)
    ↓
Worker processes UCI commands
    ↓
Engine computes for N seconds
    ↓
Worker returns evaluation + best move
    ↓
Update EvaluationBar component
    ↓
Draw arrow showing best move
    ↓
Display in analysis panel
```

### Settings Persistence Flow

```
User changes setting in SettingsModal
    ↓
updateSettings({ key: value })
    ↓
SettingsContext updates state
    ↓
useEffect triggers on state change
    ↓
Serialize settings to JSON
    ↓
localStorage.setItem('chessSettings', json)
    ↓
All subscribed components re-render
    ↓
Chessboard updates theme/animation
```

---

## Theme System

### Board Themes

**Available Themes:**
```typescript
const boardThemes = {
  blue: {
    lightSquare: '#DEE3E6',
    darkSquare: '#8CA2AD'
  },
  brown: {
    lightSquare: '#F0D9B5',
    darkSquare: '#B58863'
  },
  green: {
    lightSquare: '#FFFFDD',
    darkSquare: '#86A666'
  },
  gray: {
    lightSquare: '#E8E8E8',
    darkSquare: '#A0A0A0'
  },
  purple: {
    lightSquare: '#E4C9F5',
    darkSquare: '#9B59B6'
  },
  red: {
    lightSquare: '#FFE4E1',
    darkSquare: '#CD5C5C'
  }
};
```

**Usage:**
```typescript
const { boardTheme } = useSettings();
const theme = boardThemes[boardTheme];

<Chessboard
  customLightSquareStyle={{ backgroundColor: theme.lightSquare }}
  customDarkSquareStyle={{ backgroundColor: theme.darkSquare }}
/>
```

### Piece Themes

Piece themes are handled by react-chessboard via image URLs:

```typescript
const pieceThemes = {
  neo: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/',
  wood: 'https://images.chesscomfiles.com/chess-themes/pieces/wood/',
  alpha: 'https://images.chesscomfiles.com/chess-themes/pieces/alpha/',
  classic: 'https://images.chesscomfiles.com/chess-themes/pieces/classic/',
  icy: 'https://images.chesscomfiles.com/chess-themes/pieces/icy/',
  glass: 'https://images.chesscomfiles.com/chess-themes/pieces/glass/',
  'game-room': 'https://images.chesscomfiles.com/chess-themes/pieces/game_room/'
};
```

### Animation Speed

Maps to CSS transition duration:

```typescript
const animationSpeeds = {
  slow: 500,    // 500ms
  normal: 200,  // 200ms
  fast: 100     // 100ms
};

<Chessboard
  animationDuration={animationSpeeds[animationSpeed]}
/>
```

---

## Audio System

### Sound Files

Located in `/public/assets/sounds/`:
- `move.mp3`: Standard piece movement
- `capture.mp3`: Piece capture
- `check.mp3`: Check alert
- `10-seconds.mp3`: Time warning at 10 seconds

### Implementation

**Preloading:**
```typescript
const sounds = {
  move: new Audio('/assets/sounds/move.mp3'),
  capture: new Audio('/assets/sounds/capture.mp3'),
  check: new Audio('/assets/sounds/check.mp3'),
  timeWarning: new Audio('/assets/sounds/10-seconds.mp3')
};

// Preload
Object.values(sounds).forEach(sound => {
  sound.load();
});
```

**Playback:**
```typescript
function playSound(type: keyof typeof sounds) {
  const { soundEnabled } = useSettings();

  if (!soundEnabled) return;

  const sound = sounds[type];
  sound.currentTime = 0; // Reset to start
  sound.play().catch(err => {
    console.error('Audio playback failed:', err);
  });
}
```

**Context-Aware Playback:**
```typescript
// After move
if (capturedPiece) {
  playSound('capture');
} else if (game.inCheck()) {
  playSound('check');
} else {
  playSound('move');
}
```

---

## Development Guide

### Getting Started

1. **Clone repository:**
```bash
git clone https://github.com/Sir-Teo/web-chess-dot-com.git
cd web-chess-dot-com
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run development server:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
npm run preview
```

### Project Scripts

```json
{
  "dev": "vite",              // Start dev server (port 5173)
  "build": "vite build",      // Build for production
  "preview": "vite preview"   // Preview production build
}
```

### Adding a New Component

1. Create file in `/components/MyComponent.tsx`
2. Use functional component with TypeScript:

```typescript
import React from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <div className="p-4 bg-gray-800 rounded">
      <h2 className="text-xl text-white">{title}</h2>
      <button onClick={onAction} className="mt-2 px-4 py-2 bg-blue-500 rounded">
        Click Me
      </button>
    </div>
  );
};
```

3. Import and use in parent component:
```typescript
import { MyComponent } from './components/MyComponent';

<MyComponent title="Hello" onAction={() => console.log('Clicked')} />
```

### Adding a New Bot

1. Edit `/src/utils/bots.ts`
2. Add bot profile:

```typescript
export const bots: Bot[] = [
  // ... existing bots
  {
    id: 'bot-custom-1',
    name: 'CustomBot',
    rating: 1500,
    description: 'A custom bot for testing',
    avatar: '/avatars/custom.png',
    skillLevel: 12,
    personality: {
      aggressive: true,
      chatty: false,
      messages: {
        gameStart: ['Let\'s play!'],
        goodMove: ['Nice move!'],
        blunder: ['Oops!']
      }
    }
  }
];
```

### Adding Puzzles

1. Edit `/src/utils/puzzles.ts`
2. Add puzzle object:

```typescript
export const puzzles: Puzzle[] = [
  // ... existing puzzles
  {
    id: 'puzzle-new-1',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    moves: ['f3e5', 'c6e5', 'd1f3', 'e5c4'],  // Solution in UCI
    rating: 1400,
    themes: ['fork', 'tactics']
  }
];
```

### Testing Multiplayer Locally

1. Start dev server
2. Open two browser windows:
   - Window 1: Create game, note peer ID
   - Window 2: Navigate to `http://localhost:5173/play?peer=<PEER_ID>`
3. Make moves in each window to test synchronization

### Debugging Stockfish

Enable console logging in useStockfish.ts:

```typescript
stockfishWorker.onmessage = (event) => {
  console.log('[Stockfish]', event.data);  // Log all engine output

  // ... rest of handler
};
```

### Code Style Guidelines

- Use functional components with hooks (no class components)
- Prefer `const` over `let`
- Use TypeScript interfaces for props
- Extract complex logic into custom hooks
- Keep components under 300 lines (split if larger)
- Use Tailwind for styling (avoid inline styles)
- Add comments for complex algorithms

### Performance Optimization

**Memoization:**
```typescript
const boardStyles = useMemo(() => ({
  lightSquare: boardThemes[boardTheme].lightSquare,
  darkSquare: boardThemes[boardTheme].darkSquare
}), [boardTheme]);
```

**Callback Stability:**
```typescript
const handleMove = useCallback((from: string, to: string) => {
  // Move logic
}, [game, gamePosition]);
```

**Conditional Rendering:**
```typescript
{isAnalyzing && <LoadingSpinner />}
{!isAnalyzing && <AnalysisResults />}
```

### Browser Compatibility

**Tested Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features:**
- Web Workers (for Stockfish)
- localStorage (for persistence)
- WebRTC (for multiplayer via PeerJS)

### Common Issues

**Issue: Stockfish not loading**
- Check if `stockfish.js` is in `/public/` directory
- Verify Web Worker initialization in browser console

**Issue: PeerJS connection fails**
- Ensure both users have network access
- Check firewall/NAT settings
- Verify PeerJS server is accessible

**Issue: Sounds not playing**
- Check browser autoplay policy (user interaction required)
- Verify sound files exist in `/public/assets/sounds/`
- Ensure `soundEnabled` is true in settings

---

## Future Enhancements

### Potential Features
- **Backend Server**: Real matchmaking, persistent accounts, leaderboards
- **Chess Variants**: Chess960, 3-check, King of the Hill
- **Study Mode**: Collaborative board analysis
- **Video Lessons**: Integrate video content
- **Mobile App**: React Native port
- **Social Features**: Friends, chat, clubs
- **Advanced Statistics**: Opening repertoire, heatmaps
- **Twitch Integration**: Stream viewer interaction

### Technical Improvements
- **Database**: PostgreSQL for user accounts and game history
- **WebSocket Server**: For real-time multiplayer (replace PeerJS)
- **CDN**: Serve static assets (images, sounds) from CDN
- **Progressive Web App**: Offline support, install prompt
- **Server-Side Rendering**: Next.js for SEO and performance
- **Testing**: Unit tests (Jest), E2E tests (Playwright)
- **CI/CD**: Automated builds and deployments

---

## Conclusion

This Chess.com clone demonstrates a sophisticated client-side architecture with advanced React patterns, real-time game logic, AI integration, and peer-to-peer networking. The modular design, custom hooks, and Context API make it easy to extend with new features while maintaining code quality.

For questions or contributions, please refer to the main README or open an issue on GitHub.
