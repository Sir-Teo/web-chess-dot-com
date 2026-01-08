import React, { useState } from 'react';
import { Play, CheckCircle, Search, BookOpen, ChevronLeft, Monitor, Book } from 'lucide-react';
import Chessboard from './Chessboard';

const OPENINGS = [
  {
    id: 'italian',
    title: 'Learn The Italian Game',
    description: "The Italian Game has been a popular opening for centuries and it's still played at the highest level today. Learn the key ideas to play the Italian with either side.",
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 4 5',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd3'],
    duration: '30 min',
    challenges: 10
  },
  {
    id: 'two-knights',
    title: 'Learn The Two Knights Defense',
    description: "Learn the key ideas for both sides in the Two Knights Defense.",
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5', 'Na5'],
    duration: '23 min',
    challenges: 10
  },
  {
    id: 'ruy-lopez',
    title: 'Learn The Ruy Lopez',
    description: "One of the oldest and most trusted openings in chess. Master the Spanish Game.",
    fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7'],
    duration: '45 min',
    challenges: 15
  },
  {
    id: 'sicilian',
    title: 'Learn The Sicilian Defense',
    description: "The most popular and aggressive response to 1.e4. Fight for the center!",
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
    duration: '40 min',
    challenges: 12
  },
  {
      id: 'french',
      title: 'Learn The French Defense',
      description: "A solid and resilient defense for Black against 1.e4. Challenge White's center from the start.",
      fen: 'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
      moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6', 'Bg5', 'Be7'],
      duration: '35 min',
      challenges: 10
  },
  {
      id: 'caro-kann',
      title: 'Learn The Caro-Kann',
      description: "A solid, safe, and positional opening for Black. Similar to the French but the Bishop is not bad!",
      fen: 'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
      moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5'],
      duration: '30 min',
      challenges: 8
  },
  {
      id: 'queens-gambit',
      title: 'Learn The Queen\'s Gambit',
      description: "One of the oldest known openings. White offers a pawn to gain control of the center.",
      fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2',
      moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7'],
      duration: '50 min',
      challenges: 15
  }
];

interface OpeningsInterfaceProps {
    onAnalyze?: (pgn: string) => void;
    onNavigate?: (view: string, params?: any) => void;
}

const OpeningsInterface: React.FC<OpeningsInterfaceProps> = ({ onAnalyze, onNavigate }) => {
  const [selectedOpening, setSelectedOpening] = useState<typeof OPENINGS[0] | null>(null);

  const handleStartLearning = () => {
      // Just pick the first opening for the banner button
      if (OPENINGS.length > 0) {
          setSelectedOpening(OPENINGS[0]);
      }
  };

  const handleAnalyzeOpening = () => {
      if (onAnalyze && selectedOpening) {
          onAnalyze(selectedOpening.fen);
      }
  };

  const handlePracticeOpening = () => {
      if (onNavigate && selectedOpening) {
          onNavigate('play-bots', { fen: selectedOpening.fen });
      }
  };

  if (selectedOpening) {
      return (
          <div className="flex flex-col lg:flex-row h-full md:h-screen w-full overflow-hidden bg-chess-dark">
              {/* Board Area */}
              <div className="flex-none lg:flex-1 flex flex-col items-center justify-center p-2 lg:p-4 bg-[#312e2b]">
                   <div className="w-full max-w-[400px] lg:max-w-[85vh] aspect-square relative shadow-2xl rounded-sm">
                        <Chessboard
                            fen={selectedOpening.fen}
                            interactable={false}
                        />
                   </div>
              </div>

              {/* Sidebar (Details) */}
              <div className="flex-1 lg:flex-none w-full lg:w-[400px] bg-[#262522] flex flex-col border-l border-white/10 relative shadow-2xl">
                   <div className="flex items-center gap-2 p-4 border-b border-white/5 bg-[#211f1c]">
                         <button onClick={() => setSelectedOpening(null)} className="text-gray-400 hover:text-white">
                             <ChevronLeft className="w-6 h-6" />
                         </button>
                         <h2 className="text-white font-bold truncate">Opening Course</h2>
                   </div>

                   <div className="flex-1 p-6 flex flex-col overflow-y-auto">
                        <h1 className="text-3xl font-bold text-white mb-4 leading-tight">{selectedOpening.title}</h1>

                        <div className="flex items-center gap-4 mb-6 text-sm font-semibold text-gray-400">
                             <div className="flex items-center gap-1.5">
                                 <Book className="w-4 h-4" />
                                 <span>{selectedOpening.challenges} Lessons</span>
                             </div>
                             <div className="flex items-center gap-1.5">
                                 <Play className="w-4 h-4" />
                                 <span>{selectedOpening.duration}</span>
                             </div>
                        </div>

                        <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                            {selectedOpening.description}
                        </p>

                        <div className="space-y-3 mt-auto mb-8">
                             <button
                                onClick={handleAnalyzeOpening}
                                className="w-full bg-[#383531] hover:bg-[#45423e] text-white font-bold py-4 rounded-lg shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 group"
                             >
                                 <Search className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                                 <div className="flex flex-col items-start">
                                     <span className="leading-none text-base">Analyze Opening</span>
                                     <span className="text-xs text-gray-500 font-normal">Explore lines and variations</span>
                                 </div>
                             </button>

                             <button
                                onClick={handlePracticeOpening}
                                className="w-full bg-chess-green hover:bg-chess-greenHover text-white font-bold py-4 rounded-lg shadow-[0_4px_0_0_#457524] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-3"
                             >
                                 <Monitor className="w-6 h-6" />
                                 <div className="flex flex-col items-start">
                                     <span className="leading-none text-base">Practice vs Computer</span>
                                     <span className="text-xs text-green-200 font-normal">Play this position against a bot</span>
                                 </div>
                             </button>
                        </div>

                        <div className="bg-[#211f1c] rounded p-4 border border-white/5">
                            <h4 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Included in this course</h4>
                            <ul className="space-y-2 text-gray-300 text-sm">
                                <li className="flex gap-2">
                                    <CheckCircle className="w-4 h-4 text-chess-green flex-shrink-0" />
                                    <span>Main ideas and plans</span>
                                </li>
                                <li className="flex gap-2">
                                    <CheckCircle className="w-4 h-4 text-chess-green flex-shrink-0" />
                                    <span>Common tactical patterns</span>
                                </li>
                                <li className="flex gap-2">
                                    <CheckCircle className="w-4 h-4 text-chess-green flex-shrink-0" />
                                    <span>Model games from grandmasters</span>
                                </li>
                            </ul>
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
                    onClick={() => setSelectedOpening(opening)}
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
