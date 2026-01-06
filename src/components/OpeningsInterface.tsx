import React, { useState } from 'react';
import { Play, CheckCircle, Search, BookOpen, ChevronLeft, Target, ArrowRight } from 'lucide-react';
import Chessboard from './Chessboard';
import { Chess } from 'chess.js';

interface Opening {
    id: string;
    title: string;
    description: string;
    fen: string;
    duration: string;
    challenges: number;
    moves: string[]; // SAN sequence
}

const OPENINGS: Opening[] = [
  {
    id: 'italian',
    title: 'Learn The Italian Game',
    description: "The Italian Game has been a popular opening for centuries and it's still played at the highest level today. Learn the key ideas to play the Italian with either side.",
    // Corrected FEN for 1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5
    fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    duration: '30 min',
    challenges: 10,
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5']
  },
  {
    id: 'two-knights',
    title: 'Learn The Two Knights Defense',
    description: "Learn the key ideas for both sides in the Two Knights Defense, an aggressive counter-attacking weapon.",
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    duration: '23 min',
    challenges: 10,
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6']
  },
  {
    id: 'ruy-lopez',
    title: 'Learn The Ruy Lopez',
    description: "One of the oldest and most trusted openings in chess. Master the Spanish Game and control the center.",
    fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    duration: '45 min',
    challenges: 15,
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5']
  },
  {
    id: 'sicilian',
    title: 'Learn The Sicilian Defense',
    description: "The most popular and aggressive response to 1.e4. Fight for the center from move one!",
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    duration: '40 min',
    challenges: 12,
    moves: ['e4', 'c5']
  },
  {
      id: 'french',
      title: 'Learn The French Defense',
      description: "A solid and resilient defense against 1.e4. Learn to counter-attack the white center.",
      fen: 'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
      duration: '35 min',
      challenges: 10,
      moves: ['e4', 'e6']
  },
  {
      id: 'caro-kann',
      title: 'Learn The Caro-Kann',
      description: "A rock-solid defense for Black. Known for its endgame resilience and pawn structure.",
      fen: 'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
      duration: '35 min',
      challenges: 10,
      moves: ['e4', 'c6']
  }
];

interface OpeningsInterfaceProps {
    onAnalyze?: (pgn: string) => void;
    onNavigate?: (view: string, params?: any) => void;
}

const OpeningsInterface: React.FC<OpeningsInterfaceProps> = ({ onAnalyze, onNavigate }) => {
  const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null);
  const [previewMoveIndex, setPreviewMoveIndex] = useState(0);

  // Helper to generate FEN for preview
  const getPreviewFen = (opening: Opening, index: number) => {
      const game = new Chess();
      for (let i = 0; i < index && i < opening.moves.length; i++) {
          game.move(opening.moves[i]);
      }
      return game.fen();
  };

  const handleStartLearning = () => {
      if (OPENINGS.length > 0) {
          setSelectedOpening(OPENINGS[0]);
      }
  };

  const handlePractice = (opening: Opening) => {
      if (onNavigate) {
          // Calculate the final FEN of the opening moves to start from
          const game = new Chess();
          for (const move of opening.moves) game.move(move);
          onNavigate('play-bots', { fen: game.fen() });
      }
  };

  const handleAnalyzeOpening = (opening: Opening) => {
      if (onAnalyze) {
           // Create PGN string
           const pgn = opening.moves.map((m, i) => {
               if (i % 2 === 0) return `${Math.floor(i/2) + 1}. ${m}`;
               return m;
           }).join(' ');
           onAnalyze(pgn);
      }
  };

  if (selectedOpening) {
      const currentFen = getPreviewFen(selectedOpening, previewMoveIndex);

      return (
          <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden bg-chess-dark">
              {/* Left: Board */}
              <div className="flex-none lg:flex-1 flex flex-col items-center justify-center p-4 bg-[#312e2b]">
                  <div className="w-full max-w-[60vh] aspect-square shadow-2xl rounded-sm overflow-hidden">
                      <Chessboard
                        fen={currentFen}
                        interactable={false}
                        lastMove={previewMoveIndex > 0 ? (() => {
                             const game = new Chess();
                             for(let i=0; i<previewMoveIndex; i++) game.move(selectedOpening.moves[i]);
                             const history = game.history({verbose: true});
                             const last = history[history.length - 1];
                             return last ? { from: last.from, to: last.to } : null;
                        })() : null}
                      />
                  </div>

                  {/* Move Controls */}
                  <div className="flex items-center gap-4 mt-6 bg-[#262421] px-6 py-3 rounded-full shadow-lg border border-white/10">
                      <button
                        onClick={() => setPreviewMoveIndex(0)}
                        disabled={previewMoveIndex === 0}
                        className="text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                      >
                          <ChevronLeft className="w-6 h-6" />
                      </button>
                      <span className="text-white font-mono font-bold min-w-[80px] text-center">
                          {previewMoveIndex === 0 ? "Start" :
                           selectedOpening.moves[previewMoveIndex - 1]}
                      </span>
                      <button
                        onClick={() => setPreviewMoveIndex(prev => Math.min(prev + 1, selectedOpening.moves.length))}
                        disabled={previewMoveIndex >= selectedOpening.moves.length}
                        className="text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                      >
                          <ArrowRight className="w-6 h-6" />
                      </button>
                  </div>
              </div>

              {/* Right: Details */}
              <div className="flex-1 lg:flex-none w-full lg:w-[450px] bg-[#262522] border-l border-white/10 flex flex-col shadow-2xl">
                  {/* Header */}
                  <div className="p-4 border-b border-white/5 flex items-center gap-2">
                      <button onClick={() => { setSelectedOpening(null); setPreviewMoveIndex(0); }} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                          <ChevronLeft className="w-6 h-6" />
                      </button>
                      <h2 className="text-lg font-bold text-white">Back to Openings</h2>
                  </div>

                  <div className="p-8 flex-1 overflow-y-auto">
                      <div className="flex items-center gap-2 mb-4">
                          <BookOpen className="w-6 h-6 text-chess-green" />
                          <span className="text-chess-green font-bold uppercase tracking-wider text-sm">Opening Course</span>
                      </div>

                      <h1 className="text-3xl font-bold text-white mb-4">{selectedOpening.title}</h1>
                      <p className="text-gray-400 leading-relaxed text-lg mb-8">{selectedOpening.description}</p>

                      <div className="bg-[#302e2b] rounded-lg p-4 border border-white/5 mb-8">
                          <h3 className="text-white font-bold mb-2">Main Line</h3>
                          <p className="font-mono text-chess-green text-sm">
                              {selectedOpening.moves.map((m, i) => (
                                  <span key={i} className={i < previewMoveIndex ? "text-white font-bold" : "text-gray-500"}>
                                      {i % 2 === 0 ? `${Math.floor(i/2)+1}. ` : ""}{m}{" "}
                                  </span>
                              ))}
                          </p>
                      </div>

                      <div className="space-y-3">
                          <button
                            onClick={() => handlePractice(selectedOpening)}
                            className="w-full bg-chess-green hover:bg-chess-greenHover text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95"
                          >
                              <Target className="w-6 h-6" />
                              Practice vs Computer
                          </button>

                          <button
                            onClick={() => handleAnalyzeOpening(selectedOpening)}
                            className="w-full bg-[#3d3b38] hover:bg-[#45423e] text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center gap-3 transition-colors"
                          >
                              <Search className="w-6 h-6" />
                              Analyze with Stockfish
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-[#312e2b] text-[#c3c3c3] overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full p-6 md:p-8">
        
        {/* Banner */}
        <div className="bg-[#262421] rounded-lg p-6 mb-8 flex flex-col md:flex-row items-start gap-6 shadow-lg border border-white/5 relative overflow-hidden">
            {/* Coach Avatar */}
            <div className="flex-shrink-0 z-10">
                <div className="flex items-center gap-2 mb-2">
                    <img 
                        src="https://www.chess.com/bundles/web/images/coach/marty.png" 
                        className="w-12 h-12 rounded-lg"
                        alt="Coach"
                    />
                    <span className="font-bold text-white">Chess.com Coach</span>
                </div>
            </div>

            <div className="flex-1 z-10">
                <h2 className="text-white font-bold text-xl md:text-2xl mb-2">
                    Do you want to learn how to play every mainstream chess opening?
                </h2>
                <p className="text-gray-400 mb-4">
                    Learn the main lines and key ideas in fifty different openings!
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2"></div>
                        <span>Watch an introductory video, explaining the goals for each side in every mainstream opening.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2"></div>
                        <span>Check out the individual courses in each opening for extra tactics practice and model games!</span>
                    </li>
                </ul>
            </div>
            
            <button
                onClick={handleStartLearning}
                className="bg-chess-green hover:bg-chess-greenHover text-white font-bold py-3 px-6 rounded-lg shadow-[0_4px_0_0_#457524] active:shadow-none active:translate-y-[4px] transition-all whitespace-nowrap z-10 self-start md:self-center"
            >
                Start Learning
            </button>
            
            {/* Background Decoration */}
             <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
                <BookOpen className="w-64 h-64" />
             </div>
        </div>

        {/* Search Bar */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Opening Courses</h1>
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Search openings..." 
                    className="bg-[#262421] text-gray-300 pl-10 pr-4 py-2 rounded-md border border-white/10 focus:border-white/30 outline-none w-64"
                />
                <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" />
            </div>
        </div>

        {/* List */}
        <div className="space-y-4">
            {OPENINGS.map((opening) => (
                <div 
                    key={opening.id} 
                    onClick={() => {
                        setSelectedOpening(opening);
                        setPreviewMoveIndex(0);
                    }}
                    className="bg-[#262421] rounded-lg p-4 flex flex-col md:flex-row gap-6 hover:bg-[#2f2d2a] transition-colors cursor-pointer group border border-transparent hover:border-white/10"
                >
                    {/* Thumbnail Board */}
                    <div className="w-full md:w-48 aspect-square flex-shrink-0 relative rounded-md bg-[#312e2b] shadow-inner">
                        <div className="absolute inset-0 z-0 pointer-events-none opacity-90">
                             <Chessboard interactable={false} fen={opening.fen} />
                        </div>
                        {/* Play Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors z-10">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                <Play className="w-8 h-8 text-black ml-1 fill-black" />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-center">
                        <h3 className="text-white font-bold text-2xl mb-2 group-hover:text-chess-green transition-colors">{opening.title}</h3>
                        <p className="text-gray-400 mb-4 leading-relaxed">{opening.description}</p>
                        
                        <div className="flex items-center gap-6 text-sm font-semibold text-gray-500">
                            <div className="flex items-center gap-2">
                                <Play className="w-4 h-4 fill-current" />
                                <span>{opening.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                <span>{opening.challenges} Challenges</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
};

export default OpeningsInterface;
