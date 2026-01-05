import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { ALL_BOTS } from '../utils/bots';

interface PlayCoachPanelProps {
  onStartGame: (settings: { botId: string, userColor: 'w' | 'b' | 'random' }) => void;
}

export const PlayCoachPanel: React.FC<PlayCoachPanelProps> = ({ onStartGame }) => {
  const [selectedColor, setSelectedColor] = useState<'w' | 'b' | 'random'>('w');

  // We can use a specific bot as the "Coach" opponent, or just generic.
  // The article implies you play "Against the Coach".
  // We'll just use a bot but label it as Coach.
  // Let's pick a balanced bot or the last one used.
  // For now, let's use a "Trainer" personality if available, or just Mittens/Martin.
  // Let's use 'martin' (Beginner) as default or 'nelson'.
  // Actually, usually coach mode adapts or you pick strength.
  // Article: "you can set your preferred playing strength... approximate rating"
  // So we should probably let user pick a level.
  // We can reuse the Bot list but simplified?
  // Let's just pick a generic "Coach" bot which is basically Stockfish at a certain level.
  // For simplicity, let's hardcode it to "Coach" (maybe use a specific bot ID from existing bots but allow level selection).
  // Or just let them play against "The Coach" (which might be a custom profile).

  // Let's simulate the UI from the article: Strength selector.
  const [level, setLevel] = useState(1); // 1-20

  // Map level to rating approx
  const rating = level * 150;

  return (
    <div className="flex flex-col h-full bg-[#262522]">
       <div className="p-4 border-b border-white/10">
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <span className="text-chess-green">Play Coach</span>
           </h2>
           <p className="text-gray-400 text-sm mt-1">Practice with real-time feedback</p>
       </div>

       <div className="flex-1 overflow-y-auto p-4 space-y-6">

           {/* Coach Profile */}
           <div className="flex flex-col items-center">
               <div className="w-24 h-24 rounded-full bg-gray-600 border-4 border-chess-green overflow-hidden mb-3 relative">
                   {/* Generic Coach Image */}
                   <img
                      src="https://images.chesscomfiles.com/uploads/v1/user/57539420.f35d2592.200x200o.423977759dc2.jpeg"
                      alt="Coach"
                      className="w-full h-full object-cover"
                   />
               </div>
               <h3 className="text-white font-bold text-xl">The Coach</h3>
               <span className="text-chess-green font-bold text-sm">Rating: {rating}</span>
           </div>

           {/* Settings */}
           <div className="bg-[#211f1c] rounded-lg p-4 space-y-4 border border-white/5">

               <div>
                   <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">Strength Level (1-20)</label>
                   <input
                      type="range"
                      min="1"
                      max="20"
                      value={level}
                      onChange={(e) => setLevel(parseInt(e.target.value))}
                      className="w-full accent-chess-green h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                   />
                   <div className="flex justify-between text-xs text-gray-500 mt-1 font-bold">
                       <span>Beginner</span>
                       <span>Grandmaster</span>
                   </div>
               </div>

               <div>
                   <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">I play as</label>
                   <div className="flex bg-[#302e2b] rounded-lg p-1">
                       <button
                           onClick={() => setSelectedColor('w')}
                           className={`flex-1 py-2 rounded flex items-center justify-center transition-all ${selectedColor === 'w' ? 'bg-white shadow-md' : 'hover:bg-white/5'}`}
                       >
                           <div className="w-6 h-6 bg-[#f0d9b5] rounded-full border border-black/10"></div>
                       </button>
                       <button
                           onClick={() => setSelectedColor('random')}
                           className={`flex-1 py-2 rounded flex items-center justify-center transition-all ${selectedColor === 'random' ? 'bg-[#403d39] shadow-md' : 'hover:bg-white/5'}`}
                       >
                            <span className="text-gray-400 text-lg font-bold">?</span>
                       </button>
                       <button
                           onClick={() => setSelectedColor('b')}
                           className={`flex-1 py-2 rounded flex items-center justify-center transition-all ${selectedColor === 'b' ? 'bg-black shadow-md border border-white/10' : 'hover:bg-white/5'}`}
                       >
                           <div className="w-6 h-6 bg-[#b58863] rounded-full"></div>
                       </button>
                   </div>
               </div>

           </div>

       </div>

       <div className="p-4 bg-[#211f1c] border-t border-white/5">
           <button
                onClick={() => {
                    // Find a bot close to the rating or construct a temporary one
                    // We'll use a hack to pass level via botId or just pick a bot.
                    // For now, let's use 'mittens' but we really want custom skill level.
                    // GameInterface handles activeBot. We can create a temporary bot object.
                    // But onStartGame expects an ID.
                    // Let's pick 'stockfish' or a generic one.
                    // Actually, GameInterface sets activeBot. We can pass a dummy ID that maps to a constructed bot?
                    // Or we just modify ALL_BOTS? No.
                    // Let's pass a bot ID, and maybe GameInterface should be updated to handle custom levels.
                    // But for now, let's just pick 'monitor' (level 1) or 'stella' etc based on level.
                    // To be simple, we'll just map level to an existing bot index roughly.

                    const index = Math.min(Math.floor((level / 20) * ALL_BOTS.length), ALL_BOTS.length - 1);
                    const bot = ALL_BOTS[index] || ALL_BOTS[0];

                    onStartGame({ botId: bot.id, userColor: selectedColor });
                }}
                className="w-full bg-chess-green hover:bg-chess-greenHover text-white font-black text-xl py-4 rounded-lg shadow-[0_4px_0_0_#537a32] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-3"
           >
               <Play className="w-6 h-6 fill-current" />
               Play
           </button>
       </div>
    </div>
  );
};
