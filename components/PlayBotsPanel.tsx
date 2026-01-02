import React, { useState } from 'react';
import { Bot, ChevronDown, Crown, HelpCircle, Settings } from 'lucide-react';

export interface BotProfile {
    id: string;
    name: string;
    rating: number;
    avatar: string;
    flag: string;
    description: string;
    skillLevel: number; // 0-20
    depth: number;
}

const BOTS: BotProfile[] = [
    {
        id: 'martin',
        name: 'Martin',
        rating: 250,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/165768852.17066896.200x200o.e40702464731.jpeg',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Bulgaria.svg',
        description: "I can't wait to play with you! I'm still learning, but I'll try my best.",
        skillLevel: 0,
        depth: 1
    },
    {
        id: 'elani',
        name: 'Elani',
        rating: 400,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/36423376.50535356.200x200o.70932845c088.jpeg',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Flag_of_Saint_Kitts_and_Nevis.svg/200px-Flag_of_Saint_Kitts_and_Nevis.svg.png',
        description: "Hi! I'm Elani. I play chess for fun. Let's have a good game!",
        skillLevel: 2,
        depth: 3
    },
    {
        id: 'aron',
        name: 'Aron',
        rating: 700,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/36423380.01633519.200x200o.748722201402.jpeg',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Flag_of_Ecuador.svg/200px-Flag_of_Ecuador.svg.png',
        description: "Chess is all about strategy. Think before you move!",
        skillLevel: 5,
        depth: 5
    },
    {
        id: 'emir',
        name: 'Emir',
        rating: 1000,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/36423384.80875416.200x200o.d23192023199.jpeg',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/200px-Flag_of_Turkey.svg.png',
        description: "I've been studying openings. Prepared for a challenge?",
        skillLevel: 8,
        depth: 8
    },
    {
        id: 'sven',
        name: 'Sven',
        rating: 1200,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/36423386.d5252f9a.200x200o.b01103038626.jpeg',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_Finland.svg/200px-Flag_of_Finland.svg.png',
        description: "Consistency is key. I make few mistakes.",
        skillLevel: 10,
        depth: 10
    },
    {
        id: 'nelson',
        name: 'Nelson',
        rating: 1300,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/36423390.62725203.200x200o.662660060936.jpeg',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/200px-Flag_of_the_United_States.svg.png',
        description: "Watch out for my Queen! I love aggressive play.",
        skillLevel: 11,
        depth: 11
    },
    {
        id: 'antonio',
        name: 'Antonio',
        rating: 1500,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/36423396.f8007204.200x200o.364402636608.jpeg',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Spain.svg/200px-Flag_of_Spain.svg.png',
        description: "Solid positional play is my style. Can you break my defense?",
        skillLevel: 13,
        depth: 13
    },
    {
        id: 'isabel',
        name: 'Isabel',
        rating: 1600,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/36423400.95759086.200x200o.520443226298.jpeg',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/200px-Flag_of_Brazil.svg.png',
        description: "I calculate deeply. Don't leave any loose pieces!",
        skillLevel: 14,
        depth: 14
    },
    {
        id: 'li',
        name: 'Li',
        rating: 2000,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/36423412.72370605.200x200o.447470462067.jpeg',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/200px-Flag_of_the_People%27s_Republic_of_China.svg.png',
        description: "I play at a master level. Prepare yourself.",
        skillLevel: 18,
        depth: 18
    },
    {
        id: 'stockfish',
        name: 'Stockfish',
        rating: 3200,
        avatar: 'https://images.chesscomfiles.com/uploads/v1/user/17094202.94994200.200x200o.c81530260796.png',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/200px-Flag_of_Europe.svg.png',
        description: "I am the strongest chess engine. Good luck.",
        skillLevel: 20,
        depth: 22
    }
];

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
  const [selectedBot, setSelectedBot] = useState<BotProfile>(BOTS[0]);
  const [expandedCategory, setExpandedCategory] = useState<string>('Beginner');

  const categories = [
      { label: 'Beginner', bots: BOTS.slice(0, 3) },
      { label: 'Intermediate', bots: BOTS.slice(3, 6) },
      { label: 'Advanced', bots: BOTS.slice(6, 8) },
      { label: 'Master', bots: BOTS.slice(8, 10) }
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
