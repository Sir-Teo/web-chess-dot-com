import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import GameInterface from './components/GameInterface';
import PuzzlesInterface from './components/PuzzlesInterface';
import PuzzleRushInterface from './components/PuzzleRushInterface';
import DailyPuzzleInterface from './components/DailyPuzzleInterface';
import AnalysisInterface from './components/AnalysisInterface';
import OpeningsInterface from './components/OpeningsInterface';
import LessonsInterface from './components/LessonsInterface';
import SettingsModal from './components/SettingsModal';
import ProfileInterface from './components/ProfileInterface';
import MultiplayerInterface from './components/MultiplayerInterface';
import TournamentsInterface from './components/TournamentsInterface';
import { SettingsProvider } from './context/SettingsContext';
import { UserProvider } from './context/UserContext';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [analysisData, setAnalysisData] = useState<{ pgn?: string, fen?: string }>({});
  const [analysisTab, setAnalysisTab] = useState<'analysis' | 'review'>('analysis');
  const [gameParams, setGameParams] = useState<any>({});

  // Parse URL Hash on Mount to determine initial view
  useEffect(() => {
    const hash = window.location.hash.substring(1); // Remove '#'
    if (hash) {
      // Check for mode-specific params first (e.g., ?mode=friend)
      const params = new URLSearchParams(hash);
      const mode = params.get('mode');
      const tc = params.get('tc');
      const fen = params.get('fen');

      if (mode === 'friend') {
        setGameParams({
          timeControl: tc ? parseInt(tc, 10) : 600,
          fen: fen || undefined
        });
        setActiveTab('play-friend');
      } else if (mode === 'analysis') {
         if (fen) {
             setAnalysisData({ fen });
             setActiveTab('analysis');
         }
      } else {
         // Check if the hash path corresponds to a valid tab
         // e.g., #puzzles -> activeTab = 'puzzles'
         const cleanHash = hash.split('?')[0];
         const validTabs = ['dashboard', 'play', 'puzzles', 'learn-lessons', 'learn-openings', 'profile', 'puzzle-rush', 'daily-puzzle', 'analysis', 'multiplayer', 'tournaments'];

         if (validTabs.includes(cleanHash)) {
             setActiveTab(cleanHash);
         }
      }
    }
  }, []);

  const handleAnalyze = (data: string, tab: 'analysis' | 'review' = 'analysis') => {
    // Detect if data is FEN or PGN
    const isFen = data.includes('/') && !data.includes('[') && !data.includes('1.');

    if (isFen) {
        setAnalysisData({ fen: data });
    } else {
        setAnalysisData({ pgn: data });
    }

    setAnalysisTab(tab);
    setActiveTab('analysis');
  };

  const handleNavigate = (view: string, params?: any) => {
    setActiveTab(view);
    setGameParams(params || {});
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'play':
        return (
          <GameInterface
            initialMode={gameParams.mode === 'tournament' ? 'tournament' : 'play'}
            initialTimeControl={gameParams.timeControl}
            initialFen={gameParams.fen}
            onAnalyze={handleAnalyze}
            tournamentParams={gameParams.mode === 'tournament' ? {
                tournamentId: gameParams.tournamentId,
                opponentId: gameParams.opponentId
            } : undefined}
            onNavigate={handleNavigate}
          />
        );
      case 'play-friend':
        return (
           <GameInterface
             initialMode="friend"
             initialTimeControl={gameParams.timeControl}
             initialFen={gameParams.fen}
             onAnalyze={handleAnalyze}
           />
        );
      case 'play-bots':
        return (
            <GameInterface
                initialMode="bots"
                initialFen={gameParams.fen}
                onAnalyze={handleAnalyze}
            />
        );
      case 'play-coach':
        return (
            <GameInterface
                initialMode="coach"
                initialFen={gameParams.fen}
                onAnalyze={handleAnalyze}
            />
        );
      case 'puzzles':
        return <PuzzlesInterface onNavigate={handleNavigate} />;
      case 'puzzle-rush':
        return <PuzzleRushInterface onNavigate={handleNavigate} />;
      case 'daily-puzzle':
        return <DailyPuzzleInterface onNavigate={handleNavigate} />;
      case 'analysis':
        return (
            <AnalysisInterface
                initialPgn={analysisData.pgn}
                initialFen={analysisData.fen}
                defaultTab={analysisTab}
                onNavigate={handleNavigate}
            />
        );
      case 'learn-openings':
        return <OpeningsInterface onAnalyze={handleAnalyze} onNavigate={handleNavigate} />;
      case 'learn-lessons':
        return <LessonsInterface onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfileInterface onNavigate={handleNavigate} />;
      case 'multiplayer':
        return <MultiplayerInterface onNavigate={handleNavigate} />;
      case 'tournaments':
        return <TournamentsInterface onNavigate={handleNavigate} />;
      case 'dashboard':
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-chess-dark font-sans antialiased text-chess-text selection:bg-chess-green selection:text-white">
      <Sidebar activeTab={activeTab === 'play-friend' ? 'play' : activeTab} setActiveTab={handleNavigate} />
      
      <main className="flex-1 flex flex-col overflow-hidden relative pb-nav-mobile md:pb-0">
        {renderContent()}
      </main>

      <SettingsModal />
    </div>
  );
};

const App: React.FC = () => {
    return (
        <UserProvider>
            <SettingsProvider>
                <AppContent />
            </SettingsProvider>
        </UserProvider>
    );
};

export default App;
