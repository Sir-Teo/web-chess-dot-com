import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import GameInterface from './components/GameInterface';
import PuzzlesInterface from './components/PuzzlesInterface';
import AnalysisInterface from './components/AnalysisInterface';
import OpeningsInterface from './components/OpeningsInterface';
import LessonsInterface from './components/LessonsInterface';
import SettingsModal from './components/SettingsModal';
import ProfileInterface from './components/ProfileInterface';
import { SettingsProvider } from './context/SettingsContext';
import { UserProvider } from './context/UserContext';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [analysisData, setAnalysisData] = useState<{ pgn?: string, fen?: string }>({});
  const [analysisTab, setAnalysisTab] = useState<'analysis' | 'review'>('analysis');
  const [gameParams, setGameParams] = useState<any>({});

  // Parse URL Hash on Mount
  useEffect(() => {
    const hash = window.location.hash.substring(1); // Remove '#'
    if (hash) {
      const params = new URLSearchParams(hash);
      const mode = params.get('mode');
      const tc = params.get('tc');
      const fen = params.get('fen');

      if (mode === 'friend') {
        // "Play a Friend" Link
        setGameParams({
          timeControl: tc ? parseInt(tc, 10) : 600,
          fen: fen || undefined
        });
        setActiveTab('play-friend'); // Special internal tab for friend link handling
      } else if (mode === 'analysis') {
         // Link to analysis?
         if (fen) {
             setAnalysisData({ fen });
             setActiveTab('analysis');
         }
      }
    }
  }, []);

  const handleAnalyze = (data: string, tab: 'analysis' | 'review' = 'analysis') => {
    // Detect if data is FEN or PGN
    // FEN usually has slashes and no brackets or move numbers starting with 1.
    // PGN usually has headers [Event ...] or moves 1. e4
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
            initialMode="play"
            initialTimeControl={gameParams.timeControl}
            initialFen={gameParams.fen}
            onAnalyze={handleAnalyze}
          />
        );
      case 'play-friend':
        // Special case: Render GameInterface but force it into "Friend" mode
        return (
           <GameInterface
             initialMode="friend" // We need to support this in GameInterface
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
        return <PuzzlesInterface />;
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
      case 'dashboard':
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-chess-dark font-sans antialiased text-chess-text selection:bg-chess-green selection:text-white">
      <Sidebar activeTab={activeTab === 'play-friend' ? 'play' : activeTab} setActiveTab={handleNavigate} />
      
      <main className="flex-1 flex flex-col overflow-hidden relative pb-[60px] md:pb-0">
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
