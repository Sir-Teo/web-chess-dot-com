import React, { useState } from 'react';
import { Bot, ChevronDown, Crown, HelpCircle, Settings, MessageCircle, BarChart, Check } from 'lucide-react';
import { BotProfile, ALL_BOTS } from '../utils/bots';

interface PlayCoachPanelProps {
    onStartGame?: (bot: BotProfile, userColor: 'w' | 'b' | 'random') => void;
}

const PlayCoachPanel: React.FC<PlayCoachPanelProps> = ({ onStartGame }) => {
  const [level, setLevel] = useState<number>(1);
  const [selectedColor, setSelectedColor] = useState<'w' | 'b' | 'random'>('w');
  const [selectedCoachId, setSelectedCoachId] = useState<string>('marty');

  // Map level (1-20) to rating/description
  const getLevelInfo = (lvl: number) => {
      const rating = lvl * 150 + 200; // Approx rating logic
      return { rating };
  };

  const COACHES = [
      { id: 'marty', name: 'Marty', image: 'https://www.chess.com/bundles/web/images/coach/marty.png', style: 'Balanced' },
      { id: 'anna', name: 'Anna', image: 'https://images.chesscomfiles.com/uploads/v1/user/12345678.png', style: 'Attacking' }, // Mock image
      { id: 'danny', name: 'Danny', image: 'https://images.chesscomfiles.com/uploads/v1/user/87654321.png', style: 'Positional' },
      { id: 'fabiano', name: 'Fabiano', image: 'https://images.chesscomfiles.com/uploads/v1/user/13579246.png', style: 'Grandmaster' }
  ];

  const handleStart = () => {
      const info = getLevelInfo(level);
      const selectedCoach = COACHES.find(c => c.id === selectedCoachId) || COACHES[0];

      const coachBot: BotProfile = {
          id: selectedCoachId,
          name: selectedCoach.name,
          rating: info.rating,
          avatar: selectedCoach.image,
          flag: 'https://www.chess.com/bundles/web/images/user-image.svg',
          description: `I'm ${selectedCoach.name}, let's improve your ${selectedCoach.style} chess!`,
          skillLevel: Math.min(20, Math.max(0, level)), // 0-20
          depth: Math.min(20, Math.max(1, level + 2))
      };

      if (onStartGame) {
          onStartGame(coachBot, selectedColor);
      }
  };

  return (
    <div className="flex flex-col h-full bg-[#262522] text-[#c3c3c3]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#211f1c] border-b border-black/20 shadow-sm">
        <MessageCircle className="w-6 h-6 text-chess-green" />
        <span className="font-bold text-white text-lg">Play Coach</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col items-center">

        {/* Coach Selection */}
        <div className="flex gap-4 mb-6">
            {COACHES.map(coach => (
                <button
                    key={coach.id}
                    onClick={() => setSelectedCoachId(coach.id)}
                    className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-all ${selectedCoachId === coach.id ? 'bg-[#302e2b] ring-2 ring-chess-green' : 'hover:bg-[#302e2b]/50'}`}
                >
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 relative">
                        <img src={coach.image} alt={coach.name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://www.chess.com/bundles/web/images/user-image.svg')} />
                        {selectedCoachId === coach.id && (
                             <div className="absolute inset-0 bg-chess-green/20" />
                        )}
                    </div>
                    <span className={`text-xs font-bold ${selectedCoachId === coach.id ? 'text-white' : 'text-gray-400'}`}>{coach.name}</span>
                </button>
            ))}
        </div>

        {/* Active Coach Display */}
        <div className="mb-6 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-white mb-1">Play Against Coach {COACHES.find(c => c.id === selectedCoachId)?.name}</h2>
            <p className="text-gray-400 text-sm max-w-xs">
                {COACHES.find(c => c.id === selectedCoachId)?.style} style coaching.
                Get real-time feedback, detailed analysis, and improve your game move by move.
            </p>
        </div>

        {/* Level Selector */}
        <div className="w-full max-w-sm mb-8 bg-[#211f1c] p-4 rounded-lg border border-white/5">
            <div className="flex justify-between items-end mb-4">
                <span className="text-white font-bold uppercase text-xs tracking-wider">Playing Strength</span>
                <div className="text-right">
                    <div className="text-2xl font-black text-white">{level}</div>
                    <div className="text-xs text-gray-500 font-bold">Rating: ~{getLevelInfo(level).rating}</div>
                </div>
            </div>

            <input
                type="range"
                min="1"
                max="20"
                value={level}
                onChange={(e) => setLevel(parseInt(e.target.value))}
                className="w-full h-2 bg-[#383531] rounded-lg appearance-none cursor-pointer accent-chess-green"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2 font-bold">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Advanced</span>
                <span>Master</span>
            </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-4 bg-[#211f1c] border-t border-black/20 space-y-3">

         {/* Color Selection */}
         <div className="flex justify-center gap-4 py-2">
            <button
                onClick={() => setSelectedColor('w')}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor === 'w' ? 'bg-white border-chess-green ring-2 ring-chess-green/50' : 'bg-[#f0f0f0] border-transparent opacity-50 hover:opacity-100'}`}
                title="Play as White"
            >
                <div className="w-6 h-6 bg-[#f0f0f0] rounded-full border border-gray-300 shadow-inner" />
            </button>
            <button
                onClick={() => setSelectedColor('random')}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all bg-gradient-to-r from-white to-black ${selectedColor === 'random' ? 'border-chess-green ring-2 ring-chess-green/50' : 'border-transparent opacity-50 hover:opacity-100'}`}
                title="Random Side"
            >
                <HelpCircle className="w-6 h-6 text-gray-400 mix-blend-difference" />
            </button>
            <button
                onClick={() => setSelectedColor('b')}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor === 'b' ? 'bg-black border-chess-green ring-2 ring-chess-green/50' : 'bg-[#303030] border-transparent opacity-50 hover:opacity-100'}`}
                title="Play as Black"
            >
                <div className="w-6 h-6 bg-[#303030] rounded-full border border-gray-600 shadow-inner" />
            </button>
         </div>

        <button
            data-testid="play-coach-start"
            onClick={handleStart}
            className="w-full bg-chess-green hover:bg-chess-greenHover text-white font-bold text-2xl py-4 rounded-lg shadow-[0_4px_0_0_#457524] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center relative top-[-2px]"
        >
            Play Coach
        </button>
      </div>
    </div>
  );
};

export default PlayCoachPanel;
