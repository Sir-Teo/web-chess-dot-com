import React, { useState, useRef } from 'react';
import { 
  Gamepad2, 
  Puzzle, 
  GraduationCap, 
  Binoculars, 
  Newspaper, 
  Users, 
  MoreHorizontal, 
  Search,
  Settings,
  HelpCircle,
  ChevronLeft,
  Moon,
  Diamond,
  Cpu,
  Trophy,
  BarChart2,
  History,
  Zap,
  Calendar,
  Shield,
  BookOpen,
  User,
  Menu,
  MessageCircle,
  X,
  ChevronDown,
  ChevronUp,
  LogOut
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

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredTab(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredTab(null);
    }, 150);
  };

  const navItems = [
    { 
        id: 'play', 
        label: 'Play', 
        icon: Gamepad2,
        subItems: [
            { label: 'Play', icon: Gamepad2, action: 'play' },
            { label: 'Play Bots', icon: Cpu, action: 'play-bots' },
            { label: 'Tournaments', icon: Trophy, action: 'tournaments' },
            { label: '4 Player & Variants', icon: Users, action: 'play' },
            { label: 'Leaderboard', icon: BarChart2, action: 'play' },
            { label: 'Game History', icon: History, action: 'play' },
        ]
    },
    { 
        id: 'puzzles', 
        label: 'Puzzles', 
        icon: Puzzle,
        subItems: [
            { label: 'Solve Puzzles', icon: Puzzle, action: 'puzzles' },
            { label: 'Puzzle Rush', icon: Zap, action: 'puzzle-rush' },
            { label: 'Puzzle Battle', icon: Shield, action: 'puzzles' },
            { label: 'Daily Puzzle', icon: Calendar, action: 'daily-puzzle' },
            { label: 'Custom Puzzles', icon: BookOpen, action: 'puzzles' },
        ]
    },
    {
        id: 'multiplayer',
        label: 'Multiplayer',
        icon: Users,
        subItems: [
            { label: 'Lobby', icon: Users, action: 'multiplayer' },
        ]
    },
    { 
        id: 'learn', 
        label: 'Learn', 
        icon: GraduationCap,
        subItems: [
            { label: 'Lessons', icon: GraduationCap, action: 'learn-lessons' },
            { label: 'Analysis', icon: Search, action: 'analysis' },
            { label: 'Openings', icon: BookOpen, action: 'learn-openings' },
        ]
    },
    { id: 'watch', label: 'Watch', icon: Binoculars },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'more', label: 'More', icon: MoreHorizontal },
  ];

  const mobileNavItems = [
      { id: 'play', label: 'Play', icon: Gamepad2 },
      { id: 'puzzles', label: 'Puzzles', icon: Puzzle },
      { id: 'learn', label: 'Learn', icon: GraduationCap },
      { id: 'watch', label: 'Watch', icon: Binoculars },
      { id: 'more', label: 'More', icon: Menu }, // Opens Mobile Menu
  ];

  const handleMobileNavClick = (id: string) => {
    if (id === 'more') {
        setIsMobileMenuOpen(prev => !prev);
        setExpandedMobileMenu(null);
    } else if (id === 'learn') {
        // If already on learn tab, maybe just toggle menu?
        // Or if menu is closed, open it to Learn section
        setIsMobileMenuOpen(true);
        setExpandedMobileMenu(expandedMobileMenu === 'learn' ? null : 'learn');
    } else {
        setActiveTab(id);
        setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileSubMenu = (id: string) => {
      setExpandedMobileMenu(prev => prev === id ? null : id);
  };

  const hoveredItem = navItems.find(item => item.id === hoveredTab);

  return (
    <>
    {/* Desktop Sidebar */}
    <div className="hidden md:flex flex-col w-[140px] lg:w-[160px] bg-chess-darker h-screen border-r border-white/10 shrink-0 sticky top-0 overflow-visible z-50">
      {/* Logo Area */}
      <div className="p-4 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
        <div className="flex items-center gap-1">
          <div className="text-chess-green font-bold text-2xl tracking-tighter">Chess</div>
          <div className="text-white font-bold text-2xl tracking-tighter">.com</div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 flex flex-col gap-1 px-2">
        {navItems.map((item) => (
          <div key={item.id} onMouseEnter={() => handleMouseEnter(item.id)} onMouseLeave={handleMouseLeave}>
            <button
                onClick={() => setActiveTab(item.id === 'play' ? 'play' : item.id === 'puzzles' ? 'puzzles' : 'dashboard')}
                className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 group relative
                ${activeTab === item.id 
                    ? 'bg-[#211f1c] text-white' 
                    : 'text-chess-text hover:bg-[#383531] hover:text-white'}
                `}
            >
                <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'text-chess-green' : 'text-[#8b8987] group-hover:text-white'}`} />
                <span className="font-semibold text-[15px]">{item.label}</span>
            </button>
          </div>
        ))}

        <div className="my-2 px-2">
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-colors shadow-lg">
                <Diamond className="w-4 h-4" fill="currentColor" />
                <span>Upgrade</span>
            </button>
        </div>

        <div className="relative mt-2 px-1">
            <input 
                type="text" 
                placeholder="Search" 
                className="w-full bg-[#1b1a19] text-sm text-gray-300 rounded-md py-2 pl-9 pr-2 border border-transparent focus:border-white/20 outline-none"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto px-2 pb-4 flex flex-col gap-1">
        <button className="flex items-center gap-3 px-3 py-2 text-chess-text hover:bg-[#383531] hover:text-white rounded-md">
            <Moon className="w-5 h-5 text-[#8b8987]" />
            <span className="text-sm font-semibold">Light UI</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-chess-text hover:bg-[#383531] hover:text-white rounded-md">
            <ChevronLeft className="w-5 h-5 text-[#8b8987]" />
            <span className="text-sm font-semibold">Collapse</span>
        </button>
        <button
            onClick={openSettings}
            className="flex items-center gap-3 px-3 py-2 text-chess-text hover:bg-[#383531] hover:text-white rounded-md"
        >
            <Settings className="w-5 h-5 text-[#8b8987]" />
            <span className="text-sm font-semibold">Settings</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-chess-text hover:bg-[#383531] hover:text-white rounded-md">
            <HelpCircle className="w-5 h-5 text-[#8b8987]" />
            <span className="text-sm font-semibold">Support</span>
        </button>
      </div>
    </div>

    {/* Mobile Bottom Navigation */}
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#211f1c] border-t border-white/10 z-[60] flex justify-around items-center h-[60px] pb-safe">
        {mobileNavItems.map((item) => (
            <button 
                key={item.id}
                onClick={() => handleMobileNavClick(item.id)}
                className="flex flex-col items-center justify-center w-full h-full gap-1 active:bg-white/5"
            >
                <item.icon className={`w-6 h-6 ${activeTab === item.id && !isMobileMenuOpen ? 'text-chess-green' : 'text-[#8b8987]'}`} />
                <span className={`text-[10px] font-semibold ${activeTab === item.id && !isMobileMenuOpen ? 'text-white' : 'text-[#8b8987]'}`}>
                    {item.label}
                </span>
            </button>
        ))}
    </div>

    {/* Mobile Menu Overlay */}
    {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#211f1c] flex flex-col pb-[60px] animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-1">
                    <div className="text-chess-green font-bold text-2xl tracking-tighter">Chess</div>
                    <div className="text-white font-bold text-2xl tracking-tighter">.com</div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Menu Content */}
            <div className="flex-1 overflow-y-auto p-2">
                {/* Search */}
                <div className="relative mb-4 px-2">
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full bg-[#1b1a19] text-sm text-gray-300 rounded-md py-3 pl-10 pr-4 border border-white/10 focus:border-white/20 outline-none"
                    />
                    <Search className="w-5 h-5 absolute left-5 top-3 text-gray-500" />
                </div>

                {/* Nav Items */}
                <div className="flex flex-col gap-1">
                    {navItems.map((item) => (
                        <div key={item.id} className="flex flex-col">
                            <button
                                onClick={() => {
                                    if (item.subItems) {
                                        toggleMobileSubMenu(item.id);
                                    } else {
                                        setActiveTab(item.id);
                                        setIsMobileMenuOpen(false);
                                    }
                                }}
                                className={`
                                    w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors
                                    ${activeTab === item.id ? 'bg-[#302e2b] text-white' : 'text-[#c3c3c3] hover:bg-[#2a2926]'}
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'text-chess-green' : 'text-[#8b8987]'}`} />
                                    <span className="font-bold text-lg">{item.label}</span>
                                </div>
                                {item.subItems && (
                                    expandedMobileMenu === item.id ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />
                                )}
                            </button>

                            {/* Sub Items */}
                            {item.subItems && expandedMobileMenu === item.id && (
                                <div className="ml-12 flex flex-col gap-1 mt-1 mb-2 border-l border-white/10 pl-2">
                                    {item.subItems.map((sub, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setActiveTab(sub.action);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-400 hover:text-white hover:bg-white/5 text-left"
                                        >
                                            <sub.icon className="w-5 h-5 opacity-70" />
                                            <span className="font-semibold">{sub.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Extra Mobile Actions */}
                <div className="mt-6 border-t border-white/10 pt-4 px-2 flex flex-col gap-2">
                    <button onClick={openSettings} className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#c3c3c3] hover:bg-[#2a2926]">
                        <Settings className="w-6 h-6 text-[#8b8987]" />
                        <span className="font-bold text-lg">Settings</span>
                    </button>
                    <button className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#c3c3c3] hover:bg-[#2a2926]">
                        <Diamond className="w-6 h-6 text-blue-500" />
                        <span className="font-bold text-lg text-blue-500">Membership</span>
                    </button>
                    <button className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#c3c3c3] hover:bg-[#2a2926]">
                        <LogOut className="w-6 h-6 text-[#8b8987]" />
                        <span className="font-bold text-lg">Log Out</span>
                    </button>
                </div>
            </div>
        </div>
    )}

    {/* Flyout Menu (Desktop Only) */}
    {hoveredItem && hoveredItem.subItems && (
        <div 
            className="hidden md:flex fixed left-[140px] lg:left-[160px] top-0 bottom-0 w-[240px] bg-[#262522] shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-40 flex-col py-2 border-l border-white/5"
            onMouseEnter={() => handleMouseEnter(hoveredItem.id)}
            onMouseLeave={handleMouseLeave}
        >
            <div className="px-4 py-3 border-b border-white/5 mb-2">
                <span className="text-white font-bold text-lg">{hoveredItem.label}</span>
            </div>
            {hoveredItem.subItems.map((sub, idx) => (
                <div 
                    key={idx} 
                    onClick={() => {
                        setActiveTab(sub.action);
                        setHoveredTab(null);
                    }}
                    className="px-4 py-3 mx-2 rounded hover:bg-white/10 cursor-pointer flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                >
                    <sub.icon className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold text-sm">{sub.label}</span>
                </div>
            ))}
        </div>
    )}
    </>
  );
};

export default Sidebar;
