import React from 'react';
import { 
  Gamepad2, 
  Puzzle, 
  GraduationCap, 
  Zap, 
  Clock, 
  Cpu, 
  Users,
  MoreHorizontal,
  MessageCircle
} from 'lucide-react';
import Chessboard from './Chessboard';
import { useLessonProgress } from '../hooks/useLessonProgress';
import { LESSONS } from '../src/utils/lessons';
import { useUser } from '../context/UserContext';

interface DashboardProps {
  onNavigate: (view: string, params?: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { isLessonComplete } = useLessonProgress();
  const { user } = useUser();

  const nextLesson = React.useMemo(() => {
    return LESSONS.find(l => !isLessonComplete(l.id)) || LESSONS[0];
  }, [isLessonComplete]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      
      {/* User Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-md bg-gray-600 overflow-hidden border-2 border-white/10">
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white text-2xl font-bold">{user.username}</span>
              <span className="text-xl">{user.country}</span>
            </div>
            <div className="flex items-center gap-4 text-gray-400 text-sm mt-1">
              <div className="flex items-center gap-1">
                 <span className="w-2 h-2 rounded-full bg-green-500"></span>
                 <span>Online</span>
              </div>
              <span>•</span>
              <span>{user.isPremium ? 'Diamond Member' : 'Free Member'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
            <button
                onClick={() => onNavigate('profile')}
                className="bg-[#383531] hover:bg-[#4a4743] text-gray-300 px-3 py-1.5 rounded text-sm font-semibold transition-colors"
            >
                Edit Profile
            </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Stats */}
        <div className="space-y-4">
          <div className="bg-[#262421] rounded-lg p-4 cursor-pointer hover:bg-[#2a2926] transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                 <Gamepad2 className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
                 <div>
                    <h3 className="text-white font-bold text-lg">Play</h3>
                    <p className="text-2xl font-black text-white">30 <span className="text-gray-500 text-lg font-normal">🏆</span></p>
                 </div>
              </div>
              <img src="https://www.chess.com/bundles/web/images/color-icons/blitz.svg" className="w-10 h-10 opacity-80" alt="Blitz" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate('puzzles')}
            className="bg-[#262421] rounded-lg p-4 cursor-pointer hover:bg-[#2a2926] transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                 <Puzzle className="w-8 h-8 text-orange-400" />
                 <div>
                    <h3 className="text-white font-bold text-lg">Puzzles</h3>
                    <p className="text-2xl font-black text-white">45</p>
                 </div>
              </div>
               <img src="https://www.chess.com/bundles/web/images/color-icons/puzzles.svg" className="w-10 h-10 opacity-80" alt="Puzzles" />
            </div>
          </div>

          <div
             onClick={() => onNavigate('learn-lessons')}
             className="bg-[#262421] rounded-lg p-4 cursor-pointer hover:bg-[#2a2926] transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                 <GraduationCap className="w-8 h-8 text-blue-400" />
                 <div>
                    <h3 className="text-white font-bold text-lg">Next Lesson</h3>
                    <p className="text-sm text-gray-400">{nextLesson.title}</p>
                 </div>
              </div>
              <img src="https://www.chess.com/bundles/web/images/color-icons/lessons.svg" className="w-10 h-10 opacity-80" alt="Lessons" />
            </div>
          </div>
        </div>

        {/* Center Col: Actions */}
        <div className="space-y-2">
           <button 
             onClick={() => onNavigate('play', { timeControl: 900 })}
             className="w-full bg-[#383531] hover:bg-[#45423e] p-3 rounded-lg flex items-center justify-between group transition-all"
           >
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-[#312e2b] rounded-full flex items-center justify-center">
                 <Clock className="text-chess-green w-6 h-6" />
               </div>
               <div className="text-left">
                 <div className="text-white font-bold">Play 15 | 10</div>
                 <div className="text-xs text-gray-500">Rapid</div>
               </div>
             </div>
             <div className="bg-[#2b2926] px-2 py-1 rounded text-xs text-gray-400 group-hover:bg-[#312e2b]">Fast</div>
           </button>

           <button 
              onClick={() => onNavigate('play', { timeControl: 600 })}
              className="w-full bg-[#383531] hover:bg-[#45423e] p-3 rounded-lg flex items-center gap-3 group transition-all"
            >
               <div className="w-10 h-10 flex items-center justify-center">
                 <img src="https://www.chess.com/bundles/web/images/color-icons/handshake.svg" className="w-8 h-8" alt="Hand" />
               </div>
               <div className="text-left">
                 <div className="text-white font-bold">New Game</div>
                 <div className="text-xs text-gray-500">Custom time controls</div>
               </div>
           </button>

           <button 
                onClick={() => onNavigate('play-bots')}
                className="w-full bg-[#383531] hover:bg-[#45423e] p-3 rounded-lg flex items-center gap-3 group transition-all"
            >
               <div className="w-10 h-10 flex items-center justify-center">
                 <Cpu className="text-gray-300 w-7 h-7" />
               </div>
               <div className="text-left">
                 <div className="text-white font-bold">Play Bots</div>
                 <div className="text-xs text-gray-500">Challenge computer personalities</div>
               </div>
           </button>

           <button
                onClick={() => onNavigate('play-coach')}
                className="w-full bg-[#383531] hover:bg-[#45423e] p-3 rounded-lg flex items-center gap-3 group transition-all"
            >
               <div className="w-10 h-10 flex items-center justify-center">
                 <MessageCircle className="text-chess-green w-7 h-7" />
               </div>
               <div className="text-left">
                 <div className="text-white font-bold">Play Coach</div>
                 <div className="text-xs text-gray-500">Practice with feedback</div>
               </div>
           </button>

            <button
                onClick={() => onNavigate('play', { timeControl: 600 })}
                className="w-full bg-[#383531] hover:bg-[#45423e] p-3 rounded-lg flex items-center gap-3 group transition-all"
            >
               <div className="w-10 h-10 flex items-center justify-center">
                 <Users className="text-blue-400 w-7 h-7" />
               </div>
               <div className="text-left">
                 <div className="text-white font-bold">Play a Friend</div>
                 <div className="text-xs text-gray-500">Invite someone to play</div>
               </div>
           </button>

           <button
                onClick={() => onNavigate('multiplayer')}
                className="w-full bg-[#383531] hover:bg-[#45423e] p-3 rounded-lg flex items-center gap-3 group transition-all"
            >
               <div className="w-10 h-10 flex items-center justify-center">
                 <Users className="text-green-400 w-7 h-7" />
               </div>
               <div className="text-left">
                 <div className="text-white font-bold">Multiplayer (P2P)</div>
                 <div className="text-xs text-gray-500">Real-time online</div>
               </div>
           </button>
        </div>

        {/* Right Col: Daily Preview */}
        <div className="bg-[#262421] rounded-lg overflow-hidden">
             <div className="p-3 bg-[#2a2926] border-b border-white/5 flex justify-between items-center">
                <span className="font-bold text-gray-300">Daily Games (0)</span>
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
             </div>
             <div className="p-8 flex flex-col items-center justify-center text-center h-64">
                <div className="w-24 h-24 opacity-20 mb-4">
                  <Chessboard interactable={false} />
                </div>
                <p className="text-gray-400 text-sm mb-4">No Daily games yet</p>
                <button
                  onClick={() => onNavigate('play', { timeControl: 86400 })}
                  className="bg-chess-green hover:bg-chess-greenHover text-white font-bold py-2 px-6 rounded shadow-md transition-colors"
                >
                  Start New Game
                </button>
             </div>
        </div>

      </div>

      {/* Recommended Section Title */}
      <div className="mt-10 mb-4 flex items-center gap-2">
         <img src="https://www.chess.com/bundles/web/images/color-icons/tournaments.svg" className="w-6 h-6" alt="Icon" />
         <h2 className="text-white font-bold text-lg">Recommended Match</h2>
      </div>
      
      <div className="bg-[#262421] p-4 rounded-lg flex flex-col sm:flex-row items-center gap-4 border border-white/5">
         <div className="w-full sm:w-16 h-32 sm:h-16 rounded overflow-hidden">
            <img src="https://picsum.photos/id/1/200/200" alt="Rec" className="w-full h-full object-cover" />
         </div>
         <div className="flex-1 text-center sm:text-left">
            <h4 className="text-white font-bold">MagnusCarlsen vs Hikaru</h4>
            <p className="text-sm text-gray-400">Speed Chess Championship 2024</p>
         </div>
         <button className="bg-[#383531] text-white px-4 py-2 rounded font-semibold hover:bg-[#45423e] w-full sm:w-auto">
            Watch
         </button>
      </div>

    </div>
  );
};

export default Dashboard;
