import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import GameInterface from './components/GameInterface';
import PuzzlesInterface from './components/PuzzlesInterface';
import AnalysisInterface from './components/AnalysisInterface';
import OpeningsInterface from './components/OpeningsInterface';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [analysisPgn, setAnalysisPgn] = useState<string>('');
  const [analysisTab, setAnalysisTab] = useState<'analysis' | 'review'>('analysis');

  const handleAnalyze = (pgn: string, tab: 'analysis' | 'review' = 'analysis') => {
    setAnalysisPgn(pgn);
    setAnalysisTab(tab);
    setActiveTab('analysis');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'play':
        return <GameInterface initialMode="play" onAnalyze={handleAnalyze} />;
      case 'play-bots':
        return <GameInterface initialMode="bots" onAnalyze={handleAnalyze} />;
      case 'puzzles':
        return <PuzzlesInterface />;
      case 'analysis':
        return <AnalysisInterface initialPgn={analysisPgn} defaultTab={analysisTab} />;
      case 'learn-openings':
        return <OpeningsInterface onAnalyze={handleAnalyze} />;
      case 'dashboard':
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-chess-dark font-sans antialiased text-chess-text selection:bg-chess-green selection:text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col overflow-hidden relative pb-[60px] md:pb-0">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;