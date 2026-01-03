import React, { useState } from 'react';
import { Bot, ChevronDown, Crown, HelpCircle, Settings } from 'lucide-react';
import { BotProfile, ALL_BOTS, BEGINNER_BOTS, INTERMEDIATE_BOTS, ADVANCED_BOTS, MASTER_BOTS } from '../utils/bots';
export type { BotProfile };

const BotCategory: React.FC<{ label: string; count: number; isOpen?: boolean; onClick?: () => void }> = ({ label, count, isOpen, onClick }) => (
  <div onClick={onClick} className={`flex items-center justify-between p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${isOpen ? 'bg-white/5' : ''}`}>
      <div className="flex items-center gap-3">
         <div className="w-10 h-10 rounded-full bg-[#302e2b] flex items-center justify-center border border-white/10">
            <img src={`https://www.chess.com/bundles/web/images/bots/${label.toLowerCase()}.png`} 
                 className="w-full h-full object-cover opacity-80" 
                 onError={(e) => {
                     e.currentTarget.style.display = 'none';
                     e.currentTarget.parentElement?.classList.add('text-gray-500');
                 }}
            />
            <Bot className="w-6 h-6 text-gray-500 absolute" style={{zIndex: -1}} />
         </div>
         <div className="flex flex-col">
             <span className="text-white font-bold text-base">{label}</span>
             <span className="text-xs text-gray-500 font-semibold">{count} bots</span>
         </div>
      </div>
      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${!isOpen ? '-rotate-90' : ''}`} />
  </div>
);

interface PlayBotsPanelProps {
    onStartGame?: (bot: BotProfile) => void;
}

const PlayBotsPanel: React.FC<PlayBotsPanelProps> = ({ onStartGame }) => {
  const [selectedBot, setSelectedBot] = useState<BotProfile>(ALL_BOTS[0]);
  const [expandedCategory, setExpandedCategory] = useState<string>('Beginner');

  const categories = [
      { label: 'Beginner', bots: BEGINNER_BOTS },
      { label: 'Intermediate', bots: INTERMEDIATE_BOTS },
      { label: 'Advanced', bots: ADVANCED_BOTS },
      { label: 'Master', bots: MASTER_BOTS }
  ];

  return (
    <div className="flex flex-col h-full bg-[#262522] text-[#c3c3c3]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#211f1c] border-b border-black/20 shadow-sm">
        <Bot className="w-6 h-6 text-blue-400" />
        <span className="font-bold text-white text-lg">Play Bots</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        
        {/* Chat Bubble */}
        <div className="p-4 flex gap-4">
            <div className="shrink-0 relative">
                <img 
                    src={selectedBot.avatar}
                    alt={selectedBot.name}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-600 border border-white/10"
                />
            </div>
            <div className="bg-white text-[#2b2926] p-3 rounded-xl rounded-tl-none text-[15px] leading-snug shadow-md relative font-medium">
                <div className="absolute top-0 left-[-8px] w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent drop-shadow-sm"></div>
                {selectedBot.description}
            </div>
        </div>

        {/* Selected Bot Preview */}
        <div className="px-4 pb-2">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-white font-bold text-lg">{selectedBot.name}</span>
                <span className="text-gray-400 text-lg">{selectedBot.rating}</span>
                <img src={selectedBot.flag} className="w-4 h-3 shadow-sm" alt="Flag" />
            </div>
        </div>

        {/* Categories List */}
        <div className="border-t border-white/5">
            {categories.map(cat => (
                <div key={cat.label}>
                    <BotCategory
                        label={cat.label}
                        count={cat.bots.length}
                        isOpen={expandedCategory === cat.label}
                        onClick={() => setExpandedCategory(expandedCategory === cat.label ? '' : cat.label)}
                    />
                    {expandedCategory === cat.label && (
                         <div className="bg-[#2a2926] p-2 space-y-2">
                            {cat.bots.map(bot => (
                                <div
                                    key={bot.id}
                                    onClick={() => setSelectedBot(bot)}
                                    className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all ${selectedBot.id === bot.id ? 'bg-[#363430] border-white/10 ring-1 ring-white/10' : 'border-transparent hover:bg-[#302e2b]'}`}
                                >
                                    <div className="w-12 h-12 rounded overflow-hidden border border-white/10 relative">
                                        <img src={bot.avatar} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className={`font-bold ${selectedBot.id === bot.id ? 'text-white' : 'text-gray-300'}`}>{bot.name}</span>
                                            <img src={bot.flag} className="w-4 h-3" />
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">Rating: {bot.rating}</div>
                                    </div>
                                </div>
                            ))}
                         </div>
                    )}
                </div>
            ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-[#211f1c] border-t border-black/20 space-y-3">
         <div className="flex justify-between items-center px-1">
             <div className="flex items-center gap-1 cursor-pointer hover:text-white">
                 <Crown className="w-5 h-5 text-[#f1c40f]" fill="currentColor" />
                 <Crown className="w-5 h-5 text-[#f1c40f]" fill="currentColor" />
                 <ChevronDown className="w-3 h-3 ml-1" />
             </div>
             <div className="flex gap-3 text-gray-500">
                 <Settings className="w-6 h-6 hover:text-white cursor-pointer" />
                 <HelpCircle className="w-6 h-6 hover:text-white cursor-pointer" />
             </div>
         </div>
        <button
            onClick={() => onStartGame && onStartGame(selectedBot)}
            className="w-full bg-[#81b64c] hover:bg-[#a3d160] text-white font-bold text-2xl py-4 rounded-lg shadow-[0_4px_0_0_#457524] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center relative top-[-2px]"
        >
            Play
        </button>
      </div>
    </div>
  );
};

export default PlayBotsPanel;
