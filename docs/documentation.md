# Chess.com Clone - Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Architecture](#architecture)
4. [Core Features](#core-features)
5. [Component Reference](#component-reference)
6. [Custom Hooks](#custom-hooks)
7. [Utilities & Game Logic](#utilities--game-logic)
8. [State Management](#state-management)
9. [Styling & Theming](#styling--theming)
10. [Advanced Topics](#advanced-topics)
11. [API Reference](#api-reference)
12. [Contributing](#contributing)

---

## Project Overview

A feature-rich chess platform built with React 18, TypeScript, and Vite. This is a client-side application that provides a complete chess experience including:

- Multiple game modes (Online, Bots, Coach, Multiplayer)
- Puzzle solving and training
- Interactive lessons
- Opening database with 88+ openings
- Full game analysis with Stockfish
- P2P multiplayer via PeerJS
- Tournament system

### Tech Stack

```json
{
  "Frontend": "React 18.3.1 + TypeScript 5.8.2",
  "Build Tool": "Vite 5.4.21",
  "Chess Logic": "chess.js 1.0.0-beta.8",
  "UI Library": "react-chessboard 4.7.2",
  "Icons": "lucide-react 0.562.0",
  "Chess Engine": "Stockfish.js 10.0.0",
  "P2P Networking": "PeerJS 1.5.5",
  "Styling": "TailwindCSS (CDN)"
}
```

---

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd web-chess-dot-com

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### Environment Setup

Create a `.env` file in the root directory (optional):

```env
GEMINI_API_KEY=your_api_key_here
```

---

## Architecture

### Project Structure

```
/web-chess-dot-com
├── App.tsx                    # Main router component
├── index.tsx                  # React DOM entry point
├── types.ts                   # Global TypeScript definitions
├── constants.ts               # Global constants
│
├── components/                # React components (29 total)
│   ├── GameInterface.tsx
│   ├── AnalysisInterface.tsx
│   ├── PuzzlesInterface.tsx
│   ├── Dashboard.tsx
│   ├── Sidebar.tsx
│   └── ...
│
├── context/                   # React Context providers
│   ├── SettingsContext.tsx
│   └── UserContext.tsx
│
├── hooks/                     # Custom React hooks
│   ├── useStockfish.ts
│   ├── useGameTimer.ts
│   ├── useCoach.ts
│   ├── useBotChatter.ts
│   ├── useGameSound.ts
│   └── useLessonProgress.ts
│
├── src/utils/                 # Utility functions
│   ├── gameAnalysis.ts
│   ├── puzzles.ts
│   ├── bots.ts
│   ├── openings.ts
│   └── lessons.ts
│
├── public/                    # Static assets
├── vite.config.ts            # Vite configuration
└── tsconfig.json             # TypeScript configuration
```

### Routing System

The application uses hash-based routing without React Router:

```typescript
// In App.tsx
const [currentView, setCurrentView] = useState<string>('dashboard');

const onNavigate = (view: string, state?: any) => {
  setCurrentView(view);
  // Optional: Update URL hash
  window.location.hash = `#${view}`;
};

// Available views
const views = [
  'dashboard',      // Home page
  'play',          // Online play
  'play-bots',     // Play against AI
  'play-coach',    // Coach mode
  'puzzles',       // Puzzle solver
  'analysis',      // Game analysis
  'learn-openings', // Opening database
  'multiplayer',   // P2P gaming
  'tournaments',   // Tournament brackets
  'profile'        // User profile
];
```

---

## Core Features

### 1. Game Modes

#### Online Play

```typescript
// GameInterface.tsx
const GameInterface = ({ gameMode }: { gameMode: 'online' | 'friend' | 'bot' }) => {
  const [game] = useState(new Chess());
  const [position, setPosition] = useState(game.fen());

  const makeMove = (sourceSquare: string, targetSquare: string) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (move) {
        setPosition(game.fen());
        playSound('move');

        // Check game state
        if (game.isCheckmate()) {
          handleGameEnd('checkmate');
        } else if (game.isDraw()) {
          handleGameEnd('draw');
        }
      }

      return move !== null;
    } catch (error) {
      return false;
    }
  };

  return (
    <Chessboard
      position={position}
      onPieceDrop={makeMove}
      boardWidth={600}
      customBoardStyle={{
        borderRadius: '4px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
      }}
    />
  );
};
```

#### Playing Against Bots

```typescript
import { BEGINNER_BOTS, INTERMEDIATE_BOTS, ADVANCED_BOTS } from '@/src/utils/bots';

// Select a bot
const selectedBot = BEGINNER_BOTS[0]; // Martin (250 rating)

// Initialize Stockfish for bot
const stockfish = await StockfishClient.create(
  'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js'
);

// Set bot difficulty
await stockfish.setOption('Skill Level', selectedBot.skillLevel);

// Get bot move
const getBotMove = async (fen: string) => {
  await stockfish.setPosition(fen);
  const result = await stockfish.go(selectedBot.depth);
  return result.bestMove; // e.g., "e2e4"
};

// Make bot move
useEffect(() => {
  if (game.turn() === 'b' && !game.isGameOver()) {
    setTimeout(async () => {
      const botMove = await getBotMove(game.fen());
      const [from, to] = [
        botMove.substring(0, 2),
        botMove.substring(2, 4)
      ];
      game.move({ from, to, promotion: 'q' });
      setPosition(game.fen());
    }, 500);
  }
}, [position]);
```

#### Coach Mode

```typescript
import { useCoach } from '@/hooks/useCoach';

const CoachGame = () => {
  const [game] = useState(new Chess());
  const coach = useCoach(true, {
    showEvaluation: true,
    showHints: true,
    moveAnalysis: 'detailed'
  });

  const handleMove = async (from: string, to: string) => {
    // Evaluate move before making it
    const evaluation = await coach.evaluateMove(game, { from, to });

    game.move({ from, to });
    setPosition(game.fen());

    // Show coach feedback
    setFeedback({
      quality: evaluation.quality, // "Best", "Good", "Mistake"
      message: evaluation.feedback, // "Excellent! You're controlling the center."
      suggestedMove: evaluation.alternative, // If there's a better move
      arrows: evaluation.arrows // Visual arrows on board
    });
  };

  return (
    <>
      <Chessboard
        position={position}
        onPieceDrop={handleMove}
        customArrows={feedback.arrows}
      />
      <CoachPanel feedback={feedback} />
    </>
  );
};
```

### 2. Puzzle System

#### Loading Puzzles

```typescript
import { PUZZLES } from '@/src/utils/puzzles';

// Get puzzle by theme
const matePuzzles = PUZZLES.filter(p => p.theme.includes('Mate'));

// Get puzzle by difficulty
const beginnerPuzzles = PUZZLES.filter(p => p.rating < 1000);

// Example puzzle structure
const examplePuzzle = {
  id: "001",
  fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
  moves: ["h5f7"], // Solution: Qxf7# is checkmate
  rating: 400,
  theme: "Mate in 1",
  color: 'w'
};
```

#### Puzzle Interface Implementation

```typescript
const PuzzlesInterface = () => {
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [game] = useState(new Chess());
  const [solutionIndex, setSolutionIndex] = useState(0);

  const puzzle = PUZZLES[currentPuzzle];

  // Load puzzle
  useEffect(() => {
    game.load(puzzle.fen);
    setPosition(game.fen());
    setSolutionIndex(0);
  }, [currentPuzzle]);

  const checkSolution = (from: string, to: string) => {
    const moveUCI = from + to;
    const expectedMove = puzzle.moves[solutionIndex];

    if (moveUCI === expectedMove) {
      game.move({ from, to });
      setPosition(game.fen());
      setSolutionIndex(solutionIndex + 1);

      // Check if puzzle complete
      if (solutionIndex + 1 === puzzle.moves.length) {
        showSuccess("Puzzle solved!");
        updateRating(puzzle.rating);
      } else {
        // Make opponent's response
        setTimeout(() => makeOpponentMove(), 500);
      }
      return true;
    } else {
      showError("Not quite! Try again.");
      return false;
    }
  };

  return (
    <div className="puzzle-container">
      <div className="puzzle-info">
        <h2>{puzzle.theme}</h2>
        <p>Rating: {puzzle.rating}</p>
        <p>Move {solutionIndex + 1} of {puzzle.moves.length}</p>
      </div>
      <Chessboard
        position={position}
        onPieceDrop={checkSolution}
      />
      <button onClick={() => setCurrentPuzzle(currentPuzzle + 1)}>
        Next Puzzle
      </button>
    </div>
  );
};
```

### 3. Game Analysis

#### Analyzing a Game

```typescript
import { analyzeGame } from '@/src/utils/gameAnalysis';

const AnalysisInterface = () => {
  const [pgn, setPgn] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleAnalyze = async () => {
    try {
      const result = await analyzeGame(pgn, (progressPercent) => {
        setProgress(progressPercent);
      });

      setAnalysis(result);

      // Analysis result structure:
      console.log({
        moves: result.moves,           // Array of analyzed moves
        accuracy: result.accuracy,     // { w: 85, b: 78 }
        performanceRating: result.performanceRating, // { w: 2100, b: 1950 }
        opening: result.opening,       // "Sicilian Defense: Najdorf"
        whiteElo: result.whiteElo,    // Player ratings
        blackElo: result.blackElo,
        gameResult: result.gameResult  // "1-0", "0-1", or "1/2-1/2"
      });

    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  return (
    <div>
      <textarea
        value={pgn}
        onChange={(e) => setPgn(e.target.value)}
        placeholder="Paste PGN here..."
      />
      <button onClick={handleAnalyze}>Analyze</button>

      {progress > 0 && (
        <div className="progress-bar">
          <div style={{ width: `${progress}%` }}>
            Analyzing... {progress}%
          </div>
        </div>
      )}

      {analysis && <AnalysisReport analysis={analysis} />}
    </div>
  );
};
```

#### Understanding Move Classifications

```typescript
// Move analysis output
interface MoveAnalysis {
  moveNumber: number;
  color: 'w' | 'b';
  san: string;              // Standard Algebraic Notation: "Nf3"
  from: string;             // "g1"
  to: string;               // "f3"
  eval: number;             // Centipawns (+50 = +0.5 advantage)
  mate?: number;            // If mate found: mate in N moves
  classification: MoveClassification;
  reason: string;
}

type MoveClassification =
  | 'brilliant'    // Unexpected, amazing move
  | 'best'         // Computer's top choice
  | 'great'        // Within 0.25 eval of best
  | 'good'         // Within 0.5 eval of best
  | 'inaccuracy'   // Loses 0.5-1.0 eval
  | 'mistake'      // Loses 1.0-2.0 eval
  | 'blunder';     // Loses 2.0+ eval

// Example: Display move with icon
const MoveListItem = ({ move }: { move: MoveAnalysis }) => {
  const getIcon = (classification: string) => {
    switch (classification) {
      case 'brilliant': return '‼️';
      case 'best': return '✓';
      case 'good': return '✓';
      case 'inaccuracy': return '?!';
      case 'mistake': return '?';
      case 'blunder': return '??';
      default: return '';
    }
  };

  return (
    <div className={`move ${move.classification}`}>
      <span>{move.moveNumber}. {move.san}</span>
      <span>{getIcon(move.classification)}</span>
      <span>{move.eval > 0 ? '+' : ''}{(move.eval / 100).toFixed(2)}</span>
    </div>
  );
};
```

### 4. Opening Explorer

```typescript
import { OPENINGS } from '@/src/utils/openings';

const OpeningsInterface = () => {
  const [selectedOpening, setSelectedOpening] = useState(null);
  const [game] = useState(new Chess());

  // Filter openings by category
  const ecodeCodes = {
    'A': 'Flank Openings',
    'B': 'Semi-Open Games',
    'C': 'Open Games',
    'D': "Queen's Gambit",
    'E': 'Indian Defenses'
  };

  const filterByEco = (code: string) => {
    return OPENINGS.filter(o => o.eco?.startsWith(code));
  };

  // Play through opening moves
  const playOpening = (opening: typeof OPENINGS[0]) => {
    game.reset();
    const moves = opening.moves.split(' ');

    moves.forEach((move, index) => {
      setTimeout(() => {
        game.move(move);
        setPosition(game.fen());
      }, index * 1000); // 1 second between moves
    });
  };

  return (
    <div className="openings-explorer">
      <div className="openings-list">
        {Object.entries(ecodeCodes).map(([code, name]) => (
          <div key={code}>
            <h3>{name} ({code}00-{code}99)</h3>
            {filterByEco(code).map(opening => (
              <button
                key={opening.name}
                onClick={() => {
                  setSelectedOpening(opening);
                  playOpening(opening);
                }}
              >
                {opening.name} - {opening.eco}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="opening-board">
        <Chessboard position={position} />
        {selectedOpening && (
          <div className="opening-info">
            <h2>{selectedOpening.name}</h2>
            <p>ECO: {selectedOpening.eco}</p>
            <p>Moves: {selectedOpening.moves}</p>
          </div>
        )}
      </div>
    </div>
  );
};
```

### 5. P2P Multiplayer

```typescript
import Peer from 'peerjs';

const MultiplayerInterface = () => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [connection, setConnection] = useState(null);
  const [myId, setMyId] = useState('');
  const [game] = useState(new Chess());

  // Initialize peer connection
  useEffect(() => {
    const newPeer = new Peer({
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      }
    });

    newPeer.on('open', (id) => {
      setMyId(id);
      console.log('My peer ID:', id);
    });

    // Handle incoming connections
    newPeer.on('connection', (conn) => {
      setConnection(conn);
      setupConnection(conn);
    });

    setPeer(newPeer);

    return () => {
      newPeer.destroy();
    };
  }, []);

  // Connect to opponent
  const connectToOpponent = (opponentId: string) => {
    if (!peer) return;

    const conn = peer.connect(opponentId);
    conn.on('open', () => {
      setConnection(conn);
      setupConnection(conn);
    });
  };

  // Setup message handlers
  const setupConnection = (conn: any) => {
    conn.on('data', (data: any) => {
      if (data.type === 'move') {
        // Receive opponent's move
        game.move({
          from: data.from,
          to: data.to,
          promotion: data.promotion
        });
        setPosition(game.fen());
      } else if (data.type === 'chat') {
        addChatMessage(data.message);
      }
    });
  };

  // Send move to opponent
  const sendMove = (from: string, to: string, promotion?: string) => {
    if (!connection) return;

    connection.send({
      type: 'move',
      from,
      to,
      promotion: promotion || 'q'
    });
  };

  const handleMove = (from: string, to: string) => {
    const move = game.move({ from, to, promotion: 'q' });
    if (move) {
      setPosition(game.fen());
      sendMove(from, to);
    }
    return move !== null;
  };

  return (
    <div>
      <div className="connection-info">
        <p>Your ID: {myId}</p>
        <input
          placeholder="Opponent's ID"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              connectToOpponent(e.currentTarget.value);
            }
          }}
        />
      </div>

      <Chessboard
        position={position}
        onPieceDrop={handleMove}
      />
    </div>
  );
};
```

---

## Component Reference

### GameInterface

Main game component that handles all game modes.

```typescript
interface GameInterfaceProps {
  gameMode: 'online' | 'friend' | 'bot' | 'coach';
  botId?: string;
  timeControl?: number; // In seconds
  initialFen?: string;
  onGameEnd?: (result: GameResult) => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({
  gameMode,
  botId,
  timeControl,
  initialFen,
  onGameEnd
}) => {
  const [game] = useState(new Chess(initialFen));
  const [position, setPosition] = useState(game.fen());
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);

  // Timer hook
  const { time, start, pause } = useGameTimer({
    initialTime: timeControl || 600,
    onTimeOut: (color) => handleGameEnd('timeout', color)
  });

  // Stockfish hook (for bots and analysis)
  const { isReady, evaluate, getBestMove } = useStockfish();

  // Game sound effects
  const { playMoveSound, playCheckSound, playGameEndSound } = useGameSound();

  return (
    <div className="game-interface">
      <PlayerPanel
        player="opponent"
        time={time.black}
        capturedPieces={capturedPieces.white}
      />

      <div className="board-container">
        {gameMode === 'bot' && <EvaluationBar evaluation={evaluation} />}

        <Chessboard
          position={position}
          onPieceDrop={handleMove}
          customBoardStyle={getBoardStyle()}
          customDarkSquareStyle={{ backgroundColor: settings.darkSquare }}
          customLightSquareStyle={{ backgroundColor: settings.lightSquare }}
        />
      </div>

      <PlayerPanel
        player="you"
        time={time.white}
        capturedPieces={capturedPieces.black}
      />

      <MoveList moves={moveHistory} />
    </div>
  );
};
```

### Chessboard Component

Wrapper around react-chessboard with custom styling.

```typescript
import { Chessboard as ReactChessboard } from 'react-chessboard';

interface ChessboardProps {
  position: string;
  onPieceDrop: (from: string, to: string) => boolean;
  boardOrientation?: 'white' | 'black';
  customArrows?: Arrow[];
  highlightedSquares?: string[];
  boardWidth?: number;
}

const Chessboard: React.FC<ChessboardProps> = ({
  position,
  onPieceDrop,
  boardOrientation = 'white',
  customArrows = [],
  highlightedSquares = [],
  boardWidth = 600
}) => {
  const { settings } = useSettings();

  // Generate square styles for highlights
  const getSquareStyles = () => {
    const styles: { [square: string]: React.CSSProperties } = {};

    highlightedSquares.forEach(square => {
      styles[square] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
        borderRadius: '50%'
      };
    });

    return styles;
  };

  return (
    <ReactChessboard
      id="chess-board"
      position={position}
      onPieceDrop={onPieceDrop}
      boardOrientation={boardOrientation}
      boardWidth={boardWidth}
      customArrows={customArrows}
      customSquareStyles={getSquareStyles()}
      customBoardStyle={{
        borderRadius: '4px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
      }}
      customDarkSquareStyle={{
        backgroundColor: getBoardTheme().dark
      }}
      customLightSquareStyle={{
        backgroundColor: getBoardTheme().light
      }}
      animationDuration={settings.animationSpeed}
      arePiecesDraggable={!game.isGameOver()}
    />
  );
};
```

### Dashboard

Home screen with user stats and quick actions.

```typescript
const Dashboard = ({ onNavigate }: { onNavigate: (view: string) => void }) => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    puzzlesSolved: 0,
    currentStreak: 0
  });

  useEffect(() => {
    // Load stats from localStorage
    const savedStats = localStorage.getItem('chess_stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  return (
    <div className="dashboard">
      <header className="user-header">
        <img src={user.avatar} alt={user.username} />
        <div>
          <h1>{user.username}</h1>
          <p>{user.country} • Rating: {user.rating}</p>
          {user.isPremium && <span className="premium-badge">Premium</span>}
        </div>
      </header>

      <div className="quick-actions">
        <button onClick={() => onNavigate('play')}>
          <PlayIcon />
          <span>Play Online</span>
        </button>
        <button onClick={() => onNavigate('play-bots')}>
          <BotIcon />
          <span>Play vs Computer</span>
        </button>
        <button onClick={() => onNavigate('puzzles')}>
          <PuzzleIcon />
          <span>Solve Puzzles</span>
        </button>
        <button onClick={() => onNavigate('learn-lessons')}>
          <BookIcon />
          <span>Learn</span>
        </button>
      </div>

      <div className="stats-grid">
        <StatCard title="Games Played" value={stats.gamesPlayed} />
        <StatCard title="Win Rate" value={`${Math.round(stats.wins / stats.gamesPlayed * 100)}%`} />
        <StatCard title="Puzzles Solved" value={stats.puzzlesSolved} />
        <StatCard title="Current Streak" value={stats.currentStreak} />
      </div>

      <DailyPuzzle onNavigate={onNavigate} />
      <RecentGames />
    </div>
  );
};
```

---

## Custom Hooks

### useStockfish

Interface with Stockfish chess engine.

```typescript
import { useState, useEffect, useRef } from 'react';

interface StockfishOptions {
  depth?: number;
  skillLevel?: number;
  threads?: number;
}

interface EvaluationResult {
  eval: number;      // Centipawns
  mate?: number;     // Mate in N moves
  bestMove: string;  // UCI format: "e2e4"
  pv: string[];      // Principal variation
}

export const useStockfish = (options: StockfishOptions = {}) => {
  const [isReady, setIsReady] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const stockfishRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Load Stockfish from CDN
    const worker = new Worker(
      'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js'
    );

    worker.onmessage = (event) => {
      const message = event.data;

      if (message === 'uciok') {
        setIsReady(true);
      } else if (message.startsWith('bestmove')) {
        const parts = message.split(' ');
        const bestMove = parts[1];
        setEvaluation(prev => ({ ...prev!, bestMove }));
      } else if (message.includes('score')) {
        parseEvaluation(message);
      }
    };

    // Initialize UCI
    worker.postMessage('uci');
    worker.postMessage('ucinewgame');
    worker.postMessage('isready');

    // Set options
    if (options.skillLevel !== undefined) {
      worker.postMessage(`setoption name Skill Level value ${options.skillLevel}`);
    }
    if (options.threads) {
      worker.postMessage(`setoption name Threads value ${options.threads}`);
    }

    stockfishRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  const parseEvaluation = (message: string) => {
    // Parse: "info depth 12 score cp 50 pv e2e4 e7e5"
    const match = message.match(/score (cp|mate) (-?\d+)/);
    if (!match) return;

    const [, type, value] = match;

    if (type === 'cp') {
      setEvaluation(prev => ({
        ...prev!,
        eval: parseInt(value)
      }));
    } else if (type === 'mate') {
      setEvaluation(prev => ({
        ...prev!,
        mate: parseInt(value)
      }));
    }
  };

  const evaluate = async (fen: string, depth: number = 12): Promise<EvaluationResult> => {
    return new Promise((resolve) => {
      if (!stockfishRef.current) return;

      const worker = stockfishRef.current;

      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(`go depth ${depth}`);

      // Wait for evaluation to complete
      const checkEval = setInterval(() => {
        if (evaluation?.bestMove) {
          clearInterval(checkEval);
          resolve(evaluation);
        }
      }, 100);
    });
  };

  const getBestMove = async (fen: string): Promise<string> => {
    const result = await evaluate(fen, options.depth || 12);
    return result.bestMove;
  };

  const stop = () => {
    stockfishRef.current?.postMessage('stop');
  };

  return {
    isReady,
    evaluation,
    evaluate,
    getBestMove,
    stop
  };
};

// Usage example
const MyComponent = () => {
  const { isReady, evaluate, getBestMove } = useStockfish({
    depth: 15,
    skillLevel: 10
  });

  useEffect(() => {
    if (isReady) {
      evaluate(game.fen()).then(result => {
        console.log('Best move:', result.bestMove);
        console.log('Evaluation:', result.eval / 100);
      });
    }
  }, [isReady, position]);
};
```

### useGameTimer

Chess clock implementation.

```typescript
interface TimerOptions {
  initialTime: number;      // Seconds
  increment?: number;       // Fischer increment
  onTimeOut?: (color: 'w' | 'b') => void;
  onLowTime?: (color: 'w' | 'b') => void;
}

export const useGameTimer = (options: TimerOptions) => {
  const [time, setTime] = useState({
    white: options.initialTime,
    black: options.initialTime
  });
  const [isRunning, setIsRunning] = useState(false);
  const [activeColor, setActiveColor] = useState<'w' | 'b'>('w');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start timer
  const start = (color: 'w' | 'b') => {
    setActiveColor(color);
    setIsRunning(true);
  };

  // Pause timer
  const pause = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Switch turn (with increment)
  const switchTurn = () => {
    const currentColor = activeColor;
    const nextColor = currentColor === 'w' ? 'b' : 'w';

    // Add increment to current player
    if (options.increment) {
      setTime(prev => ({
        ...prev,
        [currentColor]: prev[currentColor] + options.increment!
      }));
    }

    setActiveColor(nextColor);
  };

  // Timer tick
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTime(prev => {
        const newTime = {
          ...prev,
          [activeColor]: prev[activeColor] - 1
        };

        // Check for timeout
        if (newTime[activeColor] <= 0) {
          pause();
          options.onTimeOut?.(activeColor);
          newTime[activeColor] = 0;
        }

        // Check for low time (< 30 seconds)
        if (newTime[activeColor] === 30) {
          options.onLowTime?.(activeColor);
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, activeColor]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    time,
    formattedTime: {
      white: formatTime(time.white),
      black: formatTime(time.black)
    },
    isRunning,
    activeColor,
    start,
    pause,
    switchTurn
  };
};

// Usage example
const GameWithTimer = () => {
  const timer = useGameTimer({
    initialTime: 600,    // 10 minutes
    increment: 5,        // 5 second increment
    onTimeOut: (color) => {
      alert(`${color === 'w' ? 'White' : 'Black'} ran out of time!`);
    }
  });

  useEffect(() => {
    timer.start('w');
  }, []);

  const handleMove = (from: string, to: string) => {
    // Make move
    game.move({ from, to });

    // Switch timer
    timer.switchTurn();
  };

  return (
    <div>
      <div>Black: {timer.formattedTime.black}</div>
      <Chessboard position={position} onPieceDrop={handleMove} />
      <div>White: {timer.formattedTime.white}</div>
    </div>
  );
};
```

### useCoach

Provides move suggestions and feedback.

```typescript
interface CoachSettings {
  showEvaluation: boolean;
  showHints: boolean;
  moveAnalysis: 'simple' | 'detailed';
  feedbackLevel: 'basic' | 'advanced';
}

interface MoveEvaluation {
  quality: 'best' | 'great' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  feedback: string;
  alternative?: string;
  arrows?: Arrow[];
  evalDiff: number;
}

export const useCoach = (enabled: boolean, settings: CoachSettings) => {
  const { evaluate, getBestMove } = useStockfish({ depth: 15 });
  const [currentEval, setCurrentEval] = useState(0);
  const [lastEval, setLastEval] = useState(0);

  const evaluateMove = async (
    game: Chess,
    move: { from: string; to: string }
  ): Promise<MoveEvaluation> => {
    if (!enabled) {
      return {
        quality: 'good',
        feedback: '',
        evalDiff: 0
      };
    }

    // Get position before move
    const fenBefore = game.fen();
    const evalBefore = await evaluate(fenBefore);

    // Make temporary move
    const tempGame = new Chess(fenBefore);
    tempGame.move(move);
    const fenAfter = tempGame.fen();
    const evalAfter = await evaluate(fenAfter);

    // Get best move for comparison
    const bestMove = evalBefore.bestMove;
    const playedMove = move.from + move.to;

    // Calculate eval difference
    const evalDiff = Math.abs(evalBefore.eval - evalAfter.eval);

    // Classify move
    let quality: MoveEvaluation['quality'];
    let feedback: string;
    let arrows: Arrow[] = [];

    if (playedMove === bestMove) {
      quality = 'best';
      feedback = settings.feedbackLevel === 'advanced'
        ? "Excellent! That's the engine's top choice."
        : "Great move!";
    } else if (evalDiff < 25) {
      quality = 'great';
      feedback = "Very good move!";
    } else if (evalDiff < 50) {
      quality = 'good';
      feedback = "Good move.";
    } else if (evalDiff < 100) {
      quality = 'inaccuracy';
      feedback = "Not the best move. Consider other options.";
      if (settings.showHints) {
        arrows.push({
          from: bestMove.substring(0, 2),
          to: bestMove.substring(2, 4),
          color: 'green'
        });
      }
    } else if (evalDiff < 200) {
      quality = 'mistake';
      feedback = "That's a mistake. You're losing advantage.";
      arrows.push({
        from: bestMove.substring(0, 2),
        to: bestMove.substring(2, 4),
        color: 'yellow'
      });
    } else {
      quality = 'blunder';
      feedback = "Blunder! This move loses significant material or position.";
      arrows.push({
        from: bestMove.substring(0, 2),
        to: bestMove.substring(2, 4),
        color: 'red'
      });
    }

    setLastEval(evalBefore.eval);
    setCurrentEval(evalAfter.eval);

    return {
      quality,
      feedback,
      alternative: quality !== 'best' ? bestMove : undefined,
      arrows: settings.showHints ? arrows : [],
      evalDiff
    };
  };

  const getHint = async (game: Chess): Promise<string> => {
    const bestMove = await getBestMove(game.fen());
    return bestMove;
  };

  return {
    evaluateMove,
    getHint,
    currentEval,
    lastEval
  };
};
```

### useGameSound

Manages chess sound effects.

```typescript
export const useGameSound = () => {
  const { settings } = useSettings();
  const [audioContext] = useState(() => new AudioContext());

  const playSound = (type: 'move' | 'capture' | 'check' | 'castle' | 'gameEnd') => {
    if (!settings.soundEnabled) return;

    const frequencies = {
      move: 440,      // A4
      capture: 523,   // C5
      check: 659,     // E5
      castle: 349,    // F4
      gameEnd: 294    // D4
    };

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequencies[type];
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.2
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  const playMoveSound = (game: Chess) => {
    const history = game.history({ verbose: true });
    const lastMove = history[history.length - 1];

    if (!lastMove) return;

    if (game.isCheck()) {
      playSound('check');
    } else if (lastMove.captured) {
      playSound('capture');
    } else if (lastMove.flags.includes('k') || lastMove.flags.includes('q')) {
      playSound('castle');
    } else {
      playSound('move');
    }
  };

  const playCheckSound = () => playSound('check');
  const playGameEndSound = () => playSound('gameEnd');

  return {
    playSound,
    playMoveSound,
    playCheckSound,
    playGameEndSound
  };
};

// Usage
const GameComponent = () => {
  const { playMoveSound } = useGameSound();

  const handleMove = (from: string, to: string) => {
    const move = game.move({ from, to });
    if (move) {
      setPosition(game.fen());
      playMoveSound(game);
    }
  };
};
```

---

## Utilities & Game Logic

### Game Analysis (gameAnalysis.ts)

Complete game analysis with Stockfish.

```typescript
// src/utils/gameAnalysis.ts
import { Chess } from 'chess.js';

export interface GameReviewData {
  moves: MoveAnalysis[];
  accuracy: { w: number; b: number };
  performanceRating: { w: number; b: number };
  opening?: string;
  whiteElo?: number;
  blackElo?: number;
  gameResult: string;
}

export interface MoveAnalysis {
  moveNumber: number;
  color: 'w' | 'b';
  san: string;
  from: string;
  to: string;
  eval: number;
  mate?: number;
  classification: MoveClassification;
  reason: string;
}

type MoveClassification =
  | 'brilliant'
  | 'best'
  | 'great'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder';

class StockfishClient {
  private worker: Worker;
  private messageHandlers: Map<string, (message: string) => void>;

  constructor(worker: Worker) {
    this.worker = worker;
    this.messageHandlers = new Map();

    this.worker.onmessage = (event) => {
      const message = event.data;

      // Trigger registered handlers
      this.messageHandlers.forEach((handler) => {
        handler(message);
      });
    };
  }

  static async create(url: string): Promise<StockfishClient> {
    const worker = new Worker(url);
    const client = new StockfishClient(worker);
    await client.init();
    return client;
  }

  async init(): Promise<void> {
    return new Promise((resolve) => {
      this.onMessage('uciok', () => {
        resolve();
      });

      this.worker.postMessage('uci');
    });
  }

  onMessage(keyword: string, callback: (message: string) => void): void {
    const handler = (message: string) => {
      if (message.includes(keyword)) {
        callback(message);
      }
    };

    this.messageHandlers.set(keyword, handler);
  }

  setPosition(fen: string): void {
    this.worker.postMessage(`position fen ${fen}`);
  }

  async go(depth: number): Promise<{ bestMove: string; score: number; mate?: number }> {
    return new Promise((resolve) => {
      let bestMove = '';
      let score = 0;
      let mate: number | undefined;

      this.onMessage('score', (message) => {
        const cpMatch = message.match(/score cp (-?\d+)/);
        const mateMatch = message.match(/score mate (-?\d+)/);

        if (cpMatch) {
          score = parseInt(cpMatch[1]);
        } else if (mateMatch) {
          mate = parseInt(mateMatch[1]);
          score = mate > 0 ? 10000 : -10000;
        }
      });

      this.onMessage('bestmove', (message) => {
        const parts = message.split(' ');
        bestMove = parts[1];
        resolve({ bestMove, score, mate });
      });

      this.worker.postMessage(`go depth ${depth}`);
    });
  }

  async setOption(name: string, value: any): Promise<void> {
    this.worker.postMessage(`setoption name ${name} value ${value}`);
  }

  terminate(): void {
    this.worker.terminate();
  }
}

export async function analyzeGame(
  pgn: string,
  onProgress?: (percent: number) => void
): Promise<GameReviewData> {

  const game = new Chess();
  game.loadPgn(pgn);

  const history = game.history({ verbose: true });
  const moves: MoveAnalysis[] = [];

  // Create Stockfish client
  const stockfish = await StockfishClient.create(
    'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js'
  );

  // Reset game to start
  game.reset();

  let prevEval = 0;

  // Analyze each move
  for (let i = 0; i < history.length; i++) {
    const move = history[i];

    // Get position before move
    const fenBefore = game.fen();
    stockfish.setPosition(fenBefore);
    const evalBefore = await stockfish.go(12);

    // Make the move
    game.move(move.san);

    // Get position after move
    const fenAfter = game.fen();
    stockfish.setPosition(fenAfter);
    const evalAfter = await stockfish.go(12);

    // Calculate if this was the best move
    const expectedMove = evalBefore.bestMove;
    const actualMove = move.from + move.to;

    const evalDiff = Math.abs(evalBefore.score - evalAfter.score);

    // Classify move
    let classification: MoveClassification;
    let reason: string;

    if (actualMove === expectedMove) {
      classification = 'best';
      reason = "Engine's top choice";
    } else if (evalDiff < 25) {
      classification = 'great';
      reason = 'Very close to best';
    } else if (evalDiff < 50) {
      classification = 'good';
      reason = 'Reasonable move';
    } else if (evalDiff < 100) {
      classification = 'inaccuracy';
      reason = `Lost ${evalDiff} centipawns`;
    } else if (evalDiff < 200) {
      classification = 'mistake';
      reason = `Lost ${evalDiff} centipawns`;
    } else {
      classification = 'blunder';
      reason = `Lost ${evalDiff} centipawns`;
    }

    moves.push({
      moveNumber: Math.floor(i / 2) + 1,
      color: move.color,
      san: move.san,
      from: move.from,
      to: move.to,
      eval: evalAfter.score,
      mate: evalAfter.mate,
      classification,
      reason
    });

    prevEval = evalAfter.score;

    // Report progress
    if (onProgress) {
      onProgress(Math.round((i + 1) / history.length * 100));
    }
  }

  // Calculate accuracy
  const whiteAccurate = moves.filter(m =>
    m.color === 'w' && ['best', 'great', 'good'].includes(m.classification)
  ).length;
  const blackAccurate = moves.filter(m =>
    m.color === 'b' && ['best', 'great', 'good'].includes(m.classification)
  ).length;

  const whiteMoves = moves.filter(m => m.color === 'w').length;
  const blackMoves = moves.filter(m => m.color === 'b').length;

  const accuracy = {
    w: Math.round((whiteAccurate / whiteMoves) * 100),
    b: Math.round((blackAccurate / blackMoves) * 100)
  };

  // Estimate performance rating
  const performanceRating = {
    w: 800 + (accuracy.w * 20),
    b: 800 + (accuracy.b * 20)
  };

  stockfish.terminate();

  return {
    moves,
    accuracy,
    performanceRating,
    gameResult: game.isCheckmate()
      ? (game.turn() === 'w' ? '0-1' : '1-0')
      : game.isDraw()
      ? '1/2-1/2'
      : '*'
  };
}
```

### Bot Profiles (bots.ts)

```typescript
// src/utils/bots.ts

export interface BotProfile {
  id: string;
  name: string;
  rating: number;
  avatar: string;
  flag: string;
  description: string;
  skillLevel: number;  // 0-20
  depth: number;       // Search depth
  personality?: string[];
}

export const BEGINNER_BOTS: BotProfile[] = [
  {
    id: 'martin',
    name: 'Martin',
    rating: 250,
    avatar: '/avatars/martin.png',
    flag: '🇺🇸',
    description: 'Loves hanging pieces',
    skillLevel: 0,
    depth: 1,
    personality: [
      "Oops, did I leave that hanging?",
      "Chess is hard!",
      "Maybe I should have protected that..."
    ]
  },
  {
    id: 'elani',
    name: 'Elani',
    rating: 400,
    avatar: '/avatars/elani.png',
    flag: '🇧🇷',
    description: 'Learning the basics',
    skillLevel: 2,
    depth: 2,
    personality: [
      "Getting better every day!",
      "Hmm, interesting move...",
      "Let me think about this..."
    ]
  },
  {
    id: 'mittens',
    name: 'Mittens',
    rating: 1,
    avatar: '/avatars/mittens.png',
    flag: '🐱',
    description: 'Mysterious cat with deadly tactics',
    skillLevel: 20,
    depth: 22,
    personality: [
      "Meow... checkmate.",
      "I see everything.",
      "Your fate is sealed."
    ]
  }
];

export const INTERMEDIATE_BOTS: BotProfile[] = [
  {
    id: 'nelson',
    name: 'Nelson',
    rating: 1300,
    avatar: '/avatars/nelson.png',
    flag: '🇺🇸',
    description: 'Solid positional player',
    skillLevel: 10,
    depth: 12
  },
  {
    id: 'sven',
    name: 'Sven',
    rating: 1200,
    avatar: '/avatars/sven.png',
    flag: '🇸🇪',
    description: 'Tactical opportunist',
    skillLevel: 8,
    depth: 10
  }
];

export const ADVANCED_BOTS: BotProfile[] = [
  {
    id: 'hikaru',
    name: 'Hikaru',
    rating: 2800,
    avatar: '/avatars/hikaru.png',
    flag: '🇯🇵',
    description: 'Speed chess master',
    skillLevel: 20,
    depth: 20
  },
  {
    id: 'supercomputer',
    name: 'SuperComputer',
    rating: 3200,
    avatar: '/avatars/computer.png',
    flag: '🤖',
    description: 'Maximum strength',
    skillLevel: 20,
    depth: 22
  }
];

export const ALL_BOTS = [
  ...BEGINNER_BOTS,
  ...INTERMEDIATE_BOTS,
  ...ADVANCED_BOTS
];

export function getBotById(id: string): BotProfile | undefined {
  return ALL_BOTS.find(bot => bot.id === id);
}

export function getBotsByRating(minRating: number, maxRating: number): BotProfile[] {
  return ALL_BOTS.filter(bot =>
    bot.rating >= minRating && bot.rating <= maxRating
  );
}
```

---

## State Management

### SettingsContext

Manages user preferences and UI settings.

```typescript
// context/SettingsContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface BoardTheme {
  name: string;
  light: string;
  dark: string;
}

interface Settings {
  // Board appearance
  boardTheme: string;
  pieceTheme: string;
  showCoordinates: boolean;
  highlightMoves: boolean;

  // Gameplay
  premoveEnabled: boolean;
  autoQueen: boolean;
  moveMethod: 'drag' | 'click';

  // Audio
  soundEnabled: boolean;
  soundVolume: number;

  // Animation
  animationSpeed: number;
  showArrows: boolean;

  // UI
  darkMode: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  boardTheme: 'green',
  pieceTheme: 'neo',
  showCoordinates: true,
  highlightMoves: true,
  premoveEnabled: true,
  autoQueen: true,
  moveMethod: 'drag',
  soundEnabled: true,
  soundVolume: 0.5,
  animationSpeed: 300,
  showArrows: true,
  darkMode: false
};

export const BOARD_THEMES: { [key: string]: BoardTheme } = {
  green: {
    name: 'Green',
    light: '#EEEED2',
    dark: '#769656'
  },
  brown: {
    name: 'Brown',
    light: '#F0D9B5',
    dark: '#B58863'
  },
  blue: {
    name: 'Blue',
    light: '#DEE3E6',
    dark: '#8CA2AD'
  },
  gray: {
    name: 'Gray',
    light: '#E8E8E8',
    dark: '#ABABAB'
  },
  purple: {
    name: 'Purple',
    light: '#E3CFC6',
    dark: '#8E6E8E'
  },
  orange: {
    name: 'Orange',
    light: '#FFE4B5',
    dark: '#CD853F'
  }
};

export const PIECE_THEMES = [
  'neo',
  'wood',
  'alpha',
  'classic',
  'icy',
  'game_room',
  'glass'
];

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
  getBoardTheme: () => BoardTheme;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('chess_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('chess_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const getBoardTheme = () => {
    return BOARD_THEMES[settings.boardTheme] || BOARD_THEMES.green;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        getBoardTheme
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

// Usage example
const SettingsModal = () => {
  const { settings, updateSettings, getBoardTheme } = useSettings();

  return (
    <div className="settings-modal">
      <h2>Settings</h2>

      <div className="setting-group">
        <label>Board Theme</label>
        <select
          value={settings.boardTheme}
          onChange={(e) => updateSettings({ boardTheme: e.target.value })}
        >
          {Object.keys(BOARD_THEMES).map(theme => (
            <option key={theme} value={theme}>
              {BOARD_THEMES[theme].name}
            </option>
          ))}
        </select>
      </div>

      <div className="setting-group">
        <label>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
          />
          Enable Sounds
        </label>
      </div>

      <div className="setting-group">
        <label>Animation Speed</label>
        <input
          type="range"
          min="100"
          max="500"
          value={settings.animationSpeed}
          onChange={(e) => updateSettings({ animationSpeed: parseInt(e.target.value) })}
        />
      </div>
    </div>
  );
};
```

### UserContext

Manages user profile and statistics.

```typescript
// context/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  username: string;
  country: string;
  rating: number;
  avatar: string;
  isPremium: boolean;
  joinDate: number;
}

interface GameStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  puzzlesSolved: number;
  currentStreak: number;
  highestRating: number;
}

interface UserContextType {
  user: UserProfile;
  stats: GameStats;
  updateUser: (updates: Partial<UserProfile>) => void;
  updateStats: (updates: Partial<GameStats>) => void;
  recordGame: (result: 'win' | 'loss' | 'draw', ratingChange: number) => void;
  recordPuzzle: (success: boolean) => void;
}

const DEFAULT_USER: UserProfile = {
  username: `Guest${Math.floor(Math.random() * 10000)}`,
  country: '🌍',
  rating: 1200,
  avatar: '/avatars/default.png',
  isPremium: false,
  joinDate: Date.now()
};

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  puzzlesSolved: 0,
  currentStreak: 0,
  highestRating: 1200
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('chess_user_profile');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('chess_user_stats');
    return saved ? JSON.parse(saved) : DEFAULT_STATS;
  });

  // Persist user
  useEffect(() => {
    localStorage.setItem('chess_user_profile', JSON.stringify(user));
  }, [user]);

  // Persist stats
  useEffect(() => {
    localStorage.setItem('chess_user_stats', JSON.stringify(stats));
  }, [stats]);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const updateStats = (updates: Partial<GameStats>) => {
    setStats(prev => ({ ...prev, ...updates }));
  };

  const recordGame = (result: 'win' | 'loss' | 'draw', ratingChange: number) => {
    setStats(prev => {
      const newStats = { ...prev, gamesPlayed: prev.gamesPlayed + 1 };

      if (result === 'win') {
        newStats.wins += 1;
        newStats.currentStreak += 1;
      } else if (result === 'loss') {
        newStats.losses += 1;
        newStats.currentStreak = 0;
      } else {
        newStats.draws += 1;
      }

      return newStats;
    });

    setUser(prev => {
      const newRating = prev.rating + ratingChange;
      return {
        ...prev,
        rating: newRating,
        highestRating: Math.max(prev.rating, newRating)
      };
    });
  };

  const recordPuzzle = (success: boolean) => {
    if (success) {
      setStats(prev => ({
        ...prev,
        puzzlesSolved: prev.puzzlesSolved + 1
      }));
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        stats,
        updateUser,
        updateStats,
        recordGame,
        recordPuzzle
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

// Usage example
const ProfilePage = () => {
  const { user, stats, updateUser } = useUser();

  return (
    <div className="profile">
      <img src={user.avatar} alt={user.username} />
      <h1>{user.username}</h1>
      <p>{user.country} • Rating: {user.rating}</p>

      <div className="stats">
        <div>Games: {stats.gamesPlayed}</div>
        <div>Win Rate: {Math.round(stats.wins / stats.gamesPlayed * 100)}%</div>
        <div>Streak: {stats.currentStreak}</div>
        <div>Puzzles: {stats.puzzlesSolved}</div>
      </div>

      <button onClick={() => updateUser({
        username: prompt('Enter new username:') || user.username
      })}>
        Change Username
      </button>
    </div>
  );
};
```

---

## Styling & Theming

### TailwindCSS Configuration

```html
<!-- index.html -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          chess: {
            dark: '#312E2B',
            light: '#EEEED2',
            green: '#769656',
            brown: '#B58863'
          }
        }
      }
    },
    darkMode: 'class'
  }
</script>
```

### Component Styling Examples

```typescript
// Button component with TailwindCSS
const Button = ({
  variant = 'primary',
  children,
  onClick
}: {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const variants = {
    primary: 'bg-green-600 hover:bg-green-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  return (
    <button
      className={`
        px-4 py-2 rounded-lg font-semibold
        transition-colors duration-200
        ${variants[variant]}
      `}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Card component
const Card = ({ children, className = '' }: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`
      bg-white dark:bg-gray-800
      rounded-lg shadow-lg
      p-6
      ${className}
    `}>
      {children}
    </div>
  );
};

// Responsive layout
const GameLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="
      container mx-auto
      px-4 sm:px-6 lg:px-8
      py-8
      grid grid-cols-1 lg:grid-cols-3
      gap-6
    ">
      {children}
    </div>
  );
};
```

---

## Advanced Topics

### FEN (Forsyth-Edwards Notation)

Understanding chess positions:

```typescript
// FEN structure: pieces position / active color / castling / en passant / halfmove / fullmove
const startingFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// Parse FEN
const parseFEN = (fen: string) => {
  const [
    position,
    activeColor,
    castling,
    enPassant,
    halfmove,
    fullmove
  ] = fen.split(' ');

  return {
    position,        // Board layout
    activeColor,     // 'w' or 'b'
    castling,        // 'KQkq' or '-'
    enPassant,       // Square or '-'
    halfmove: parseInt(halfmove),
    fullmove: parseInt(fullmove)
  };
};

// Generate custom position
const customPosition = (pieces: { [square: string]: string }): string => {
  const game = new Chess();
  game.clear();

  Object.entries(pieces).forEach(([square, piece]) => {
    game.put({ type: piece[1], color: piece[0] }, square);
  });

  return game.fen();
};

// Example: Queen vs Rook endgame
const endgameFEN = customPosition({
  e1: 'wK',
  h8: 'bK',
  d5: 'wQ',
  a8: 'bR'
});
```

### PGN (Portable Game Notation)

```typescript
// Generate PGN
const generatePGN = (
  moves: string[],
  white: string,
  black: string,
  result: string
): string => {
  const headers = [
    `[Event "Casual Game"]`,
    `[Site "Chess.com Clone"]`,
    `[Date "${new Date().toISOString().split('T')[0]}"]`,
    `[White "${white}"]`,
    `[Black "${black}"]`,
    `[Result "${result}"]`
  ];

  const moveText = moves.reduce((acc, move, index) => {
    if (index % 2 === 0) {
      return acc + `${Math.floor(index / 2) + 1}. ${move} `;
    }
    return acc + `${move} `;
  }, '');

  return headers.join('\n') + '\n\n' + moveText + result;
};

// Parse PGN
const parsePGN = (pgn: string) => {
  const game = new Chess();
  game.loadPgn(pgn);

  return {
    headers: game.header(),
    moves: game.history({ verbose: true }),
    fen: game.fen()
  };
};

// Export game
const exportGame = (game: Chess): string => {
  return generatePGN(
    game.history(),
    'Player1',
    'Player2',
    game.isCheckmate() ? (game.turn() === 'w' ? '0-1' : '1-0') : '1/2-1/2'
  );
};
```

### UCI (Universal Chess Interface)

Communicating with Stockfish:

```typescript
// UCI commands
const UCI_COMMANDS = {
  // Initialize
  UCI: 'uci',
  UCI_NEW_GAME: 'ucinewgame',
  IS_READY: 'isready',

  // Options
  SET_OPTION: (name: string, value: any) => `setoption name ${name} value ${value}`,

  // Position
  POSITION_START: 'position startpos',
  POSITION_FEN: (fen: string) => `position fen ${fen}`,
  POSITION_MOVES: (moves: string[]) => `position startpos moves ${moves.join(' ')}`,

  // Search
  GO_INFINITE: 'go infinite',
  GO_DEPTH: (depth: number) => `go depth ${depth}`,
  GO_MOVETIME: (ms: number) => `go movetime ${ms}`,
  STOP: 'stop',
  QUIT: 'quit'
};

// Example: Full UCI session
const analyzePosition = async (fen: string, depth: number = 15) => {
  const worker = new Worker('stockfish.js');

  return new Promise((resolve) => {
    let bestMove = '';
    let evaluation = 0;

    worker.onmessage = (event) => {
      const message = event.data;

      if (message === 'readyok') {
        // Engine is ready, set position
        worker.postMessage(`position fen ${fen}`);
        worker.postMessage(`go depth ${depth}`);
      } else if (message.includes('bestmove')) {
        bestMove = message.split(' ')[1];
        worker.terminate();
        resolve({ bestMove, evaluation });
      } else if (message.includes('score cp')) {
        const match = message.match(/score cp (-?\d+)/);
        if (match) evaluation = parseInt(match[1]);
      }
    };

    worker.postMessage('uci');
    worker.postMessage('isready');
  });
};
```

---

## API Reference

### Chess.js API

```typescript
import { Chess } from 'chess.js';

// Create new game
const game = new Chess();

// Load position
game.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
game.loadPgn('1. e4 e5 2. Nf3 Nc6');

// Make moves
game.move('e4');
game.move({ from: 'e2', to: 'e4' });
game.move({ from: 'e7', to: 'e8', promotion: 'q' });

// Undo
game.undo();

// Get moves
const moves = game.moves();                    // ['e4', 'e3', 'Nf3', ...]
const verboseMoves = game.moves({ verbose: true });  // Detailed move objects

// Game state
game.isCheck();           // boolean
game.isCheckmate();       // boolean
game.isStalemate();       // boolean
game.isDraw();            // boolean
game.isGameOver();        // boolean
game.isThreefoldRepetition();  // boolean
game.isInsufficientMaterial(); // boolean

// Position
game.fen();               // Current FEN
game.pgn();               // Current PGN
game.turn();              // 'w' or 'b'
game.history();           // ['e4', 'e5', 'Nf3', ...]
game.get('e4');           // Get piece at square

// Square info
game.squareColor('e4');   // 'light' or 'dark'

// Reset
game.reset();             // Back to start
game.clear();             // Empty board

// Put/remove pieces
game.put({ type: 'p', color: 'w' }, 'e4');
game.remove('e4');
```

### React-Chessboard API

```typescript
import { Chessboard } from 'react-chessboard';

<Chessboard
  // Position (FEN or 'start')
  position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

  // Event handlers
  onPieceDrop={(from, to) => boolean}
  onSquareClick={(square) => void}
  onSquareRightClick={(square) => void}

  // Appearance
  boardWidth={600}
  boardOrientation="white"  // or "black"

  // Styling
  customBoardStyle={{ borderRadius: '4px' }}
  customDarkSquareStyle={{ backgroundColor: '#769656' }}
  customLightSquareStyle={{ backgroundColor: '#EEEED2' }}
  customSquareStyles={{ e4: { backgroundColor: 'yellow' } }}

  // Pieces
  customPieces={{}}

  // Arrows
  customArrows={[
    ['e2', 'e4', 'green'],
    ['d2', 'd4', 'red']
  ]}

  // Behavior
  arePiecesDraggable={true}
  animationDuration={300}
  showBoardNotation={true}

  // Pre-moves
  customPremoveDarkSquareStyle={{ backgroundColor: 'red' }}
  customPremoveLightSquareStyle={{ backgroundColor: 'pink' }}
/>
```

---

## Contributing

### Development Workflow

```bash
# 1. Clone repo
git clone <repo-url>
cd web-chess-dot-com

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Install dependencies
npm install

# 4. Start dev server
npm run dev

# 5. Make changes...

# 6. Build for production
npm run build

# 7. Test production build
npm run preview

# 8. Commit changes
git add .
git commit -m "feat: Add new feature"

# 9. Push and create PR
git push origin feature/my-feature
```

### Code Style

```typescript
// Use TypeScript for all new files
interface Props {
  value: string;
  onChange: (value: string) => void;
}

// Use functional components with hooks
const MyComponent: React.FC<Props> = ({ value, onChange }) => {
  const [state, setState] = useState('');

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  return <div>{value}</div>;
};

// Use meaningful variable names
const handleMoveSubmit = () => {
  // ...
};

// Extract complex logic into utilities
const calculateRating = (wins: number, losses: number): number => {
  // ...
};
```

### Adding New Features

#### Example: Adding a New Bot

```typescript
// 1. Add bot to src/utils/bots.ts
export const NEW_BOT: BotProfile = {
  id: 'newbot',
  name: 'NewBot',
  rating: 1500,
  avatar: '/avatars/newbot.png',
  flag: '🤖',
  description: 'Description here',
  skillLevel: 12,
  depth: 14
};

// Update ALL_BOTS array
export const ALL_BOTS = [
  ...BEGINNER_BOTS,
  ...INTERMEDIATE_BOTS,
  NEW_BOT,  // Add here
  ...ADVANCED_BOTS
];

// 2. Add avatar image to public/avatars/

// 3. Test in PlayBotsInterface component
```

#### Example: Adding a New Board Theme

```typescript
// In context/SettingsContext.tsx
export const BOARD_THEMES: { [key: string]: BoardTheme } = {
  // ... existing themes
  neon: {
    name: 'Neon',
    light: '#00FF00',
    dark: '#FF00FF'
  }
};
```

---

## Performance Optimization

### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive component renders
const MoveList = memo(({ moves }: { moves: Move[] }) => {
  return (
    <div>
      {moves.map((move, i) => (
        <MoveItem key={i} move={move} />
      ))}
    </div>
  );
});

// Memoize expensive calculations
const MyComponent = ({ game }: { game: Chess }) => {
  const legalMoves = useMemo(() => {
    return game.moves({ verbose: true });
  }, [game.fen()]);

  const handleMove = useCallback((from: string, to: string) => {
    game.move({ from, to });
  }, [game]);
};
```

### Web Worker for Analysis

```typescript
// analysis.worker.ts
self.onmessage = (event) => {
  const { fen, depth } = event.data;

  // Load Stockfish
  const stockfish = new Worker('stockfish.js');

  stockfish.onmessage = (e) => {
    if (e.data.includes('bestmove')) {
      self.postMessage({ bestmove: e.data.split(' ')[1] });
    }
  };

  stockfish.postMessage('uci');
  stockfish.postMessage(`position fen ${fen}`);
  stockfish.postMessage(`go depth ${depth}`);
};

// In component
const worker = new Worker('analysis.worker.ts');

worker.onmessage = (event) => {
  console.log('Best move:', event.data.bestmove);
};

worker.postMessage({ fen: game.fen(), depth: 15 });
```

---

## Testing

### Unit Testing Example

```typescript
// gameAnalysis.test.ts
import { analyzeGame } from '@/src/utils/gameAnalysis';

describe('Game Analysis', () => {
  it('should classify brilliant moves', async () => {
    const pgn = '1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7#';
    const analysis = await analyzeGame(pgn);

    expect(analysis.moves).toHaveLength(7);
    expect(analysis.gameResult).toBe('1-0');
    expect(analysis.moves[6].classification).toBe('best');
  });

  it('should detect blunders', async () => {
    const pgn = '1. e4 e5 2. Qh4 Nf6 3. Qxe5';  // Loses queen
    const analysis = await analyzeGame(pgn);

    const lastMove = analysis.moves[analysis.moves.length - 1];
    expect(lastMove.classification).toBe('blunder');
  });
});
```

---

## Troubleshooting

### Common Issues

**Issue: Stockfish not loading**
```typescript
// Solution: Check CORS and ensure CDN is accessible
const STOCKFISH_URL = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js';

fetch(STOCKFISH_URL)
  .then(response => {
    if (!response.ok) {
      console.error('Stockfish CDN unavailable');
    }
  });
```

**Issue: Move not executing**
```typescript
// Solution: Validate move format
const makeMove = (from: string, to: string) => {
  try {
    const move = game.move({
      from: from.toLowerCase(),  // Ensure lowercase
      to: to.toLowerCase(),
      promotion: 'q'
    });

    if (!move) {
      console.error('Illegal move:', from, to);
      console.log('Legal moves:', game.moves());
    }

    return move !== null;
  } catch (error) {
    console.error('Move error:', error);
    return false;
  }
};
```

**Issue: PeerJS connection failing**
```typescript
// Solution: Add better error handling
const peer = new Peer({
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  }
});

peer.on('error', (error) => {
  console.error('PeerJS Error:', error);
  alert('Connection failed. Please try again.');
});
```

---

## Resources

### Chess Programming

- [Chess.js Documentation](https://github.com/jhlywa/chess.js/blob/master/README.md)
- [Stockfish Wiki](https://github.com/official-stockfish/Stockfish/wiki)
- [UCI Protocol](https://www.chessprogramming.org/UCI)
- [FEN Notation](https://www.chessprogramming.org/Forsyth-Edwards_Notation)
- [PGN Specification](https://www.chessclub.com/help/PGN-spec)

### React & TypeScript

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

---

## License

MIT License - See LICENSE file for details.

---

## Credits

Built with ❤️ using:
- React 18
- TypeScript
- Stockfish.js
- chess.js
- react-chessboard
- PeerJS

---

*Last updated: 2026-01-11*
