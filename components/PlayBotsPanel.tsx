import React from 'react';
import { BotProfile, ALL_BOTS } from '../src/utils/bots';
import { Brain } from 'lucide-react';

interface PlayBotsPanelProps {
  onStartGame: (bot: BotProfile, color: 'w' | 'b' | 'random') => void;
  practiceTitle?: string;
}

const PlayBotsPanel: React.FC<PlayBotsPanelProps> = ({ onStartGame, practiceTitle }) => {
  return (
    <div className="flex flex-col h-full bg-[#262522] text-white">
        <div className="p-4 border-b border-white/5">
             <h2 className="text-xl font-bold flex items-center gap-2">
                 <Brain className="w-6 h-6 text-chess-green" />
                 {practiceTitle || "Play Computer"}
             </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
             {ALL_BOTS.map(bot => (
                 <div
                    key={bot.id}
                    className="bg-[#211f1c] rounded-lg p-3 hover:bg-[#302e2b] transition-colors cursor-pointer border border-transparent hover:border-white/10"
                    onClick={() => onStartGame(bot, 'random')}
                 >
                     <div className="flex items-center gap-3 mb-2">
                         <img src={bot.avatar} alt={bot.name} className="w-10 h-10 rounded shadow-sm" />
                         <div>
                             <div className="font-bold text-sm leading-tight">{bot.name}</div>
                             <div className="text-xs text-[#a0a0a0] font-semibold">{bot.rating}</div>
                         </div>
                     </div>
                     <p className="text-[10px] text-gray-400 line-clamp-2 leading-snug">
                         {bot.description}
                     </p>
                 </div>
             ))}
        </div>
    </div>
  );
};

export default PlayBotsPanel;
