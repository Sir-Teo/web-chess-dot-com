import React, { useState, useEffect } from 'react';
import { Trophy, Users, Clock, ArrowLeft, ChevronRight, Lock, Play, Star, Medal } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { ALL_BOTS, BotProfile } from '../utils/bots';

interface Tournament {
    id: string;
    name: string;
    status: 'Upcoming' | 'In Progress' | 'Completed';
    players: number;
    maxPlayers: number;
    timeControl: string; // e.g. "1+0", "3+2"
    startTime: string; // "Starts in 2m" or "14:00"
    type: 'Bullet' | 'Blitz' | 'Rapid';
    rounds: number;
    currentRound: number;
}

interface TournamentsInterfaceProps {
    onNavigate: (view: string, params?: any) => void;
}

const MOCK_TOURNAMENTS: Tournament[] = [
    {
        id: 't1',
        name: 'Hourly Bullet Arena',
        status: 'Upcoming',
        players: 45,
        maxPlayers: 100,
        timeControl: '1+0',
        startTime: 'Starts in 2m',
        type: 'Bullet',
        rounds: 5,
        currentRound: 0
    },
    {
        id: 't2',
        name: 'Daily Blitz Swiss',
        status: 'In Progress',
        players: 120,
        maxPlayers: 200,
        timeControl: '3+2',
        startTime: 'Started 10m ago',
        type: 'Blitz',
        rounds: 9,
        currentRound: 3
    },
    {
        id: 't3',
        name: 'Rapid Shield',
        status: 'Completed',
        players: 85,
        maxPlayers: 100,
        timeControl: '10+0',
        startTime: 'Ended 2h ago',
        type: 'Rapid',
        rounds: 5,
        currentRound: 5
    },
    {
        id: 't4',
        name: 'Beginner Blitz',
        status: 'Upcoming',
        players: 12,
        maxPlayers: 50,
        timeControl: '5+0',
        startTime: 'Starts in 15m',
        type: 'Blitz',
        rounds: 5,
        currentRound: 0
    }
];

// Mock Standings for a Lobby
const MOCK_STANDINGS = [
    { rank: 1, name: 'Hikaru', rating: 3200, points: 3.0 },
    { rank: 2, name: 'Magnus', rating: 3150, points: 3.0 },
    { rank: 3, name: 'Naroditsky', rating: 3000, points: 2.5 },
    { rank: 4, name: 'GothamChess', rating: 2600, points: 2.0 },
    { rank: 5, name: 'Botez', rating: 2200, points: 2.0 },
    { rank: 6, name: 'Guest99', rating: 1200, points: 1.5 },
];

const TournamentsInterface: React.FC<TournamentsInterfaceProps> = ({ onNavigate }) => {
    const { user } = useUser();
    const [view, setView] = useState<'list' | 'lobby'>('list');
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
    const [isJoined, setIsJoined] = useState(false);
    const [lobbyCountdown, setLobbyCountdown] = useState(120); // 2 minutes

    // Simulate countdown in lobby
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (view === 'lobby' && selectedTournament?.status === 'Upcoming' && isJoined) {
            interval = setInterval(() => {
                setLobbyCountdown(prev => {
                    if (prev <= 0) return 0;
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [view, selectedTournament, isJoined]);

    const handleSelectTournament = (t: Tournament) => {
        setSelectedTournament(t);
        setIsJoined(false); // Reset join state when viewing new tournament
        setView('lobby');
        setLobbyCountdown(120); // Reset mock countdown
    };

    const handleJoin = () => {
        setIsJoined(true);
    };

    const handleStartGame = () => {
        // Pick a random bot as opponent for the tournament game
        const opponent = ALL_BOTS[Math.floor(Math.random() * ALL_BOTS.length)];
        const tcParts = selectedTournament?.timeControl.split('+') || ['10', '0'];
        const time = parseInt(tcParts[0]) * 60;

        // Navigate to GameInterface with special params
        onNavigate('play', {
            mode: 'tournament',
            tournamentId: selectedTournament?.id,
            opponentId: opponent.id,
            timeControl: time
        });
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (view === 'lobby' && selectedTournament) {
        return (
            <div className="flex flex-col h-full bg-[#312e2b] text-[#c3c3c3] overflow-y-auto">
                {/* Lobby Header */}
                <div className="bg-[#262421] p-6 border-b border-white/5 shadow-lg relative">
                     {/* Background Graphic */}
                     <div className="absolute top-0 right-0 h-full w-1/3 overflow-hidden pointer-events-none opacity-5">
                         <Trophy className="h-full w-full" />
                     </div>

                     <div className="max-w-6xl mx-auto relative z-10">
                         <button
                            onClick={() => setView('list')}
                            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors font-semibold"
                         >
                             <ArrowLeft className="w-4 h-4" /> Back to Tournaments
                         </button>

                         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                             <div>
                                 <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                                     {selectedTournament.name}
                                     <span className="text-sm font-normal bg-[#383531] px-2 py-1 rounded text-gray-300 border border-white/10">
                                         {selectedTournament.type}
                                     </span>
                                 </h1>
                                 <div className="flex items-center gap-6 text-gray-400 font-medium">
                                     <div className="flex items-center gap-2">
                                         <Clock className="w-4 h-4" />
                                         <span>{selectedTournament.timeControl} • {selectedTournament.rounds} Rounds</span>
                                     </div>
                                     <div className="flex items-center gap-2">
                                         <Users className="w-4 h-4" />
                                         <span>{selectedTournament.players} Players</span>
                                     </div>
                                 </div>
                             </div>

                             {selectedTournament.status === 'Upcoming' ? (
                                 !isJoined ? (
                                     <button
                                        onClick={handleJoin}
                                        className="bg-chess-green hover:bg-chess-greenHover text-white font-bold py-3 px-8 rounded-lg shadow-[0_4px_0_0_#457524] active:shadow-none active:translate-y-[4px] transition-all text-lg flex items-center gap-2"
                                     >
                                         <Play className="w-5 h-5 fill-current" /> Join Tournament
                                     </button>
                                 ) : (
                                     <div className="bg-[#1b1a19] px-6 py-3 rounded-lg border border-white/10 text-center">
                                         <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Starting In</div>
                                         <div className="text-3xl font-mono font-bold text-white">{formatTime(lobbyCountdown)}</div>
                                         {lobbyCountdown < 10 && lobbyCountdown > 0 && (
                                            <div className="text-xs text-orange-500 font-bold mt-1 animate-pulse">Get Ready!</div>
                                         )}
                                          {lobbyCountdown === 0 && (
                                             <button
                                                onClick={handleStartGame}
                                                className="mt-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-4 rounded text-sm w-full animate-bounce"
                                             >
                                                 Start Round 1
                                             </button>
                                          )}
                                     </div>
                                 )
                             ) : (
                                 <div className="bg-[#383531] px-6 py-3 rounded-lg text-center">
                                     <span className="font-bold text-white block">Status</span>
                                     <span className="text-sm text-gray-400">{selectedTournament.status}</span>
                                 </div>
                             )}
                         </div>
                     </div>
                </div>

                {/* Lobby Content */}
                <div className="flex-1 max-w-6xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                     {/* Standings */}
                     <div className="lg:col-span-2 bg-[#262421] rounded-lg border border-white/5 overflow-hidden flex flex-col">
                         <div className="p-4 bg-[#211f1c] border-b border-white/5 flex justify-between items-center">
                             <h3 className="font-bold text-white flex items-center gap-2">
                                 <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                 Standings
                             </h3>
                         </div>
                         <div className="flex-1 overflow-y-auto">
                             <table className="w-full text-left border-collapse">
                                 <thead className="bg-[#1b1a19] text-xs font-bold text-gray-500 uppercase">
                                     <tr>
                                         <th className="p-3">Rank</th>
                                         <th className="p-3">Player</th>
                                         <th className="p-3 text-right">Rating</th>
                                         <th className="p-3 text-right">Points</th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     {MOCK_STANDINGS.map((player) => (
                                         <tr key={player.rank} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                             <td className="p-3 font-bold text-gray-400">#{player.rank}</td>
                                             <td className="p-3 font-bold text-white flex items-center gap-2">
                                                 <div className={`w-2 h-2 rounded-full ${player.name === user.username ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                                 {player.name}
                                                 {player.rank <= 3 && <Medal className={`w-3 h-3 ${player.rank === 1 ? 'text-yellow-500' : player.rank === 2 ? 'text-gray-400' : 'text-orange-600'}`} />}
                                             </td>
                                             <td className="p-3 text-right text-gray-400 font-mono text-sm">{player.rating}</td>
                                             <td className="p-3 text-right font-bold text-white">{player.points}</td>
                                         </tr>
                                     ))}
                                     {isJoined && (
                                         <tr className="bg-[#2a401a] border-b border-white/5">
                                             <td className="p-3 font-bold text-chess-green">#{MOCK_STANDINGS.length + 1}</td>
                                             <td className="p-3 font-bold text-white flex items-center gap-2">
                                                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                 {user.username} (You)
                                             </td>
                                             <td className="p-3 text-right text-gray-300 font-mono text-sm">{user.rating}</td>
                                             <td className="p-3 text-right font-bold text-white">0.0</td>
                                         </tr>
                                     )}
                                 </tbody>
                             </table>
                         </div>
                     </div>

                     {/* Info / Chat */}
                     <div className="bg-[#262421] rounded-lg border border-white/5 flex flex-col">
                         <div className="p-4 bg-[#211f1c] border-b border-white/5">
                             <h3 className="font-bold text-white">Tournament Info</h3>
                         </div>
                         <div className="p-4 space-y-4 text-sm text-gray-300">
                             <div className="flex justify-between">
                                 <span className="text-gray-500">Format</span>
                                 <span className="font-bold text-white">Swiss System</span>
                             </div>
                             <div className="flex justify-between">
                                 <span className="text-gray-500">Rating Range</span>
                                 <span className="font-bold text-white">Open</span>
                             </div>
                             <div className="flex justify-between">
                                 <span className="text-gray-500">Tie Break</span>
                                 <span className="font-bold text-white">Sonneborn-Berger</span>
                             </div>

                             <div className="h-px bg-white/10 my-2"></div>

                             <div className="bg-[#1b1a19] p-3 rounded text-center text-xs text-gray-500">
                                 Matches are paired automatically. Please wait for the round to start.
                             </div>
                         </div>
                     </div>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="flex flex-col h-full bg-[#312e2b] text-[#c3c3c3] overflow-y-auto">
            <div className="max-w-6xl mx-auto w-full p-6 md:p-8">

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            <Trophy className="w-8 h-8 text-yellow-500" /> Tournaments
                        </h1>
                        <p className="text-gray-400">Compete in daily tournaments and win trophies!</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="bg-[#383531] hover:bg-[#45423e] text-white px-4 py-2 rounded font-bold transition-colors">
                            My Tournaments
                        </button>
                    </div>
                </div>

                {/* Filters (Visual Only) */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['All', 'Upcoming', 'In Progress', 'Completed', 'Bullet', 'Blitz', 'Rapid'].map(filter => (
                        <button
                            key={filter}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors whitespace-nowrap
                                ${filter === 'All' ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'}
                            `}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {MOCK_TOURNAMENTS.map(t => (
                        <div
                            key={t.id}
                            onClick={() => handleSelectTournament(t)}
                            className="bg-[#262421] rounded-lg p-4 flex flex-col md:flex-row items-center gap-6 hover:bg-[#2f2d2a] transition-colors cursor-pointer border border-transparent hover:border-white/10 group"
                        >
                            {/* Icon / Time */}
                            <div className="flex items-center justify-center w-16 h-16 bg-[#312e2b] rounded-lg shadow-inner relative overflow-hidden">
                                {t.type === 'Bullet' ? <div className="text-2xl">🚀</div> : t.type === 'Blitz' ? <div className="text-2xl">⚡</div> : <div className="text-2xl">⏱️</div>}
                                <div className="absolute bottom-0 inset-x-0 bg-black/40 text-[10px] text-center font-bold text-white py-0.5">
                                    {t.timeControl}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-white font-bold text-xl mb-1 group-hover:text-chess-green transition-colors">{t.name}</h3>
                                <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-400 font-medium">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" /> {t.players}/{t.maxPlayers}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Medal className="w-4 h-4" /> {t.type}
                                    </span>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex flex-col items-center md:items-end min-w-[140px]">
                                {t.status === 'Upcoming' ? (
                                    <>
                                        <span className="text-chess-green font-bold text-sm mb-1">{t.startTime}</span>
                                        <button className="bg-[#383531] group-hover:bg-chess-green group-hover:text-white text-gray-300 font-bold px-4 py-2 rounded transition-colors text-sm flex items-center gap-2">
                                            Join <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : t.status === 'In Progress' ? (
                                    <>
                                        <span className="text-orange-500 font-bold text-sm mb-1 animate-pulse flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-orange-500"></div> Live
                                        </span>
                                        <span className="text-gray-500 text-xs">Round {t.currentRound}/{t.rounds}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-gray-500 font-bold text-sm mb-1">Finished</span>
                                        <Lock className="w-5 h-5 text-gray-600" />
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default TournamentsInterface;
