import React, { useState } from 'react';
import { Bot, ChevronDown, Crown, HelpCircle, Settings, MessageCircle, BarChart, Check } from 'lucide-react';
import { BotProfile, ALL_BOTS } from '../utils/bots';

interface PlayCoachPanelProps {
    onStartGame?: (bot: BotProfile, userColor: 'w' | 'b' | 'random') => void;
}

const PlayCoachPanel: React.FC<PlayCoachPanelProps> = ({ onStartGame }) => {
  const [level, setLevel] = useState<number>(1);
  const [selectedColor, setSelectedColor] = useState<'w' | 'b' | 'random'>('w');

  // Map level (1-20) to rating/description
  const getLevelInfo = (lvl: number) => {
      const rating = lvl * 150 + 200; // Approx rating logic
      return { rating };
  };

  const handleStart = () => {
      // Find a bot or create a configuration that matches the level.
      // Since we don't have infinite bots, we'll pick the closest bot from ALL_BOTS
      // OR we can just use "Stockfish" with limited skill.
      // The article says "virtual Chess.com Coach".
      // Let's use a generic Coach profile but with skill level set.

      const info = getLevelInfo(level);

      const coachBot: BotProfile = {
          id: 'coach',
          name: 'Coach',
          rating: info.rating,
          avatar: 'https://www.chess.com/bundles/web/images/coach/marty.png', // Generic coach
          flag: 'https://www.chess.com/bundles/web/images/user-image.svg', // None or generic
          description: "I'm here to help you improve!",
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

        {/* Coach Avatar */}
        <div className="mb-6 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-4 border-chess-green p-1 bg-[#302e2b] mb-4 relative shadow-lg">
                <img
                    src="https://www.chess.com/bundles/web/images/coach/marty.png"
                    alt="Coach"
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => (e.currentTarget.src = 'https://www.chess.com/bundles/web/images/user-image.svg')}
                />
                <div className="absolute bottom-0 right-0 bg-chess-green p-1.5 rounded-full border-2 border-[#262522]">
                    <Check className="w-4 h-4 text-white" />
                </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Play Against Coach</h2>
            <p className="text-gray-400 text-center text-sm max-w-xs">
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
