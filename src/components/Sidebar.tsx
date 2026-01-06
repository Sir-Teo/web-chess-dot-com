import React, { useState, useRef } from 'react';
import { 
  LayoutDashboard,
  Gamepad2, 
  Puzzle, 
  BookOpen,
  GraduationCap, 
  Eye,
  Newspaper, 
  Users, 
  MoreHorizontal,
  Search,
  Settings,
  HelpCircle,
  MessageCircle // Added for Coach
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { openSettings } = useSettings();

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredTab(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredTab(null);
    }, 100);
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'play', icon: Gamepad2, label: 'Play' },
    { id: 'puzzles', icon: Puzzle, label: 'Puzzles' },
    { id: 'learn-lessons', icon: GraduationCap, label: 'Learn' },
    { id: 'learn-openings', icon: BookOpen, label: 'Openings' }, // Moved strictly to openings interface
    // { id: 'watch', icon: Eye, label: 'Watch' },
    // { id: 'news', icon: Newspaper, label: 'News' },
    // { id: 'social', icon: Users, label: 'Social' },
    { id: 'play-coach', icon: MessageCircle, label: 'Coach' }, // Added Coach
  ];

  return (
    <div className="flex flex-col bg-[#262522] w-full md:w-[140px] lg:w-[160px] h-auto md:h-screen z-50 fixed bottom-0 md:relative border-t md:border-t-0 md:border-r border-white/10 shadow-xl shrink-0">

      {/* Logo Area (Hidden on Mobile) */}
      <div
        className="hidden md:flex items-center justify-center h-16 mb-2 cursor-pointer"
        onClick={() => setActiveTab('dashboard')}
      >
         <h1 className="text-[#81b64c] font-black text-2xl tracking-tighter hover:text-white transition-colors">
            CHESS
         </h1>
      </div>

      {/* Main Menu */}
      <div className="flex flex-row md:flex-col justify-around md:justify-start flex-1 px-2 md:px-0 gap-1 md:gap-1 overflow-x-auto md:overflow-visible custom-scrollbar">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="relative group"
            onMouseEnter={() => handleMouseEnter(item.id)}
            onMouseLeave={handleMouseLeave}
          >
            <button
                onClick={() => setActiveTab(item.id)}
                className={`
                flex flex-col md:flex-row items-center md:gap-3 p-2 md:px-4 md:py-3 rounded-lg w-full transition-all
                ${activeTab === item.id 
                    ? 'bg-[#211f1c] text-white' 
                    : 'text-chess-text hover:bg-[#383531] hover:text-white'}
                `}
            >
                <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'text-chess-green' : 'text-[#8b8987] group-hover:text-white'}`} />
                <span className="font-semibold text-[15px] hidden md:block">{item.label}</span>
                {/* Mobile Label (Tiny) */}
                <span className="text-[10px] md:hidden mt-1">{item.label}</span>
            </button>
          </div>
        ))}

        {/* Search / More (Desktop) */}
        <div className="hidden md:block mt-2 px-4 space-y-1">
             <button className="flex items-center gap-3 p-2 text-[#8b8987] hover:text-white w-full rounded hover:bg-[#383531] transition-colors">
                 <Search className="w-5 h-5" />
                 <span className="font-semibold text-sm">Search</span>
             </button>
        </div>
      </div>

      {/* Footer Settings */}
      <div className="hidden md:flex flex-col gap-1 p-2 border-t border-white/5 bg-[#211f1c]">
           <button
             className="flex items-center gap-3 p-3 text-[#8b8987] hover:text-white hover:bg-[#383531] rounded transition-colors w-full"
             onClick={openSettings}
           >
               <Settings className="w-5 h-5" />
               <span className="font-bold text-sm">Settings</span>
           </button>
           <button className="flex items-center gap-3 p-3 text-[#8b8987] hover:text-white hover:bg-[#383531] rounded transition-colors w-full">
               <HelpCircle className="w-5 h-5" />
               <span className="font-bold text-sm">Help</span>
           </button>
      </div>
    </div>
  );
};

export default Sidebar;
