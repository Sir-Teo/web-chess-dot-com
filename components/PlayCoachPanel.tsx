import React, { useState } from 'react';
import { HelpCircle, MessageCircle, Check } from 'lucide-react';
import { BotProfile, ALL_BOTS } from '../utils/bots';

interface PlayCoachPanelProps {
    onStartGame?: (bot: BotProfile, userColor: 'w' | 'b' | 'random') => void;
}

const PlayCoachPanel: React.FC<PlayCoachPanelProps> = ({ onStartGame }) => {
  const [level, setLevel] = useState<number>(1);
  const [selectedColor, setSelectedColor] = useState<'w' | 'b' | 'random'>('w');
  const [selectedPersona, setSelectedPersona] = useState<string>('marty'); // 'marty' or bot.id

  // Map level (1-20) to rating/description
  const getLevelInfo = (lvl: number) => {
      const rating = lvl * 150 + 200; // Approx rating logic
      return { rating };
  };

  const handleStart = () => {
      let coachBot: BotProfile;

      if (selectedPersona === 'marty') {
          // Generic "Marty" Coach
          const info = getLevelInfo(level);
          coachBot = {
              id: 'coach',
              name: 'Coach',
              rating: info.rating,
              avatar: 'https://www.chess.com/bundles/web/images/coach/marty.png',
              flag: 'https://www.chess.com/bundles/web/images/user-image.svg',
              description: "I'm here to help you improve!",
              skillLevel: Math.min(20, Math.max(0, level)),
              depth: Math.min(20, Math.max(1, level + 2))
          };
      } else {
          // Specific Bot as Coach
          const bot = ALL_BOTS.find(b => b.id === selectedPersona);
          if (bot) {
              coachBot = { ...bot };
              // Maybe adjust skill if user wants? For now, keep bot's native skill
              // Or override with slider if we want to allow "Easy Nelson"
              // Let's allow overriding skill level using the slider if it's selected?
              // Or just trust the bot's definition.
              // Let's use the slider to override for now to allow easier practice against personalities.
              coachBot.skillLevel = Math.min(20, Math.max(0, level));
              coachBot.depth = Math.min(20, Math.max(1, level + 2));
              // Also update rating display roughly? No, keep bot rating to identify it.
          } else {
              // Fallback
              coachBot = {
                  id: 'coach',
                  name: 'Coach',
                  rating: 1200,
                  avatar: 'https://www.chess.com/bundles/web/images/coach/marty.png',
                  flag: '',
                  description: "Generic Coach",
                  skillLevel: 10,
                  depth: 10
              };
          }
      }

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
                    src={selectedPersona === 'marty'
                        ? 'https://www.chess.com/bundles/web/images/coach/marty.png'
                        : ALL_BOTS.find(b => b.id === selectedPersona)?.avatar || 'https://www.chess.com/bundles/web/images/user-image.svg'
                    }
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

        {/* Persona Selector */}
        <div className="w-full max-w-sm mb-4">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block tracking-wider">Opponent Persona</label>
            <div className="grid grid-cols-1 gap-2">
                <button
                    onClick={() => setSelectedPersona('marty')}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${selectedPersona === 'marty' ? 'bg-chess-green/10 border-chess-green ring-1 ring-chess-green/50' : 'bg-[#211f1c] border-white/5 hover:border-white/10'}`}
                >
                    <img src="https://www.chess.com/bundles/web/images/coach/marty.png" className="w-8 h-8 rounded-full" />
                    <div className="text-left">
                        <div className="text-white font-bold text-sm">Marty (Standard)</div>
                        <div className="text-xs text-gray-500">The classic friendly coach</div>
                    </div>
                </button>

                <div className="bg-[#211f1c] rounded-lg border border-white/5 overflow-hidden">
                     <div className="p-2 text-xs font-bold text-gray-500 bg-[#1b1a19] border-b border-white/5 uppercase">Or select a bot</div>
                     <div className="max-h-40 overflow-y-auto custom-scrollbar p-1 space-y-1">
                         {ALL_BOTS.slice(0, 10).map(bot => (
                             <button
                                key={bot.id}
                                onClick={() => setSelectedPersona(bot.id)}
                                className={`w-full flex items-center gap-2 p-2 rounded transition-colors ${selectedPersona === bot.id ? 'bg-chess-green/20 text-white' : 'hover:bg-white/5 text-gray-300'}`}
                             >
                                 <img src={bot.avatar} className="w-6 h-6 rounded-full" />
                                 <span className="text-sm font-semibold">{bot.name} <span className="text-xs opacity-60">({bot.rating})</span></span>
                             </button>
                         ))}
                     </div>
                </div>
            </div>
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
