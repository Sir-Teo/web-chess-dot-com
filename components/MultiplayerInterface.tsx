import React, { useState, useEffect, useRef } from 'react';
import { Peer, DataConnection } from 'peerjs';
import { Copy, Check, Users, Link2, Wifi, WifiOff } from 'lucide-react';
import Chessboard from './Chessboard';
import { Chess } from 'chess.js';
import { useGameSound } from '../hooks/useGameSound';

interface MultiplayerInterfaceProps {
    onNavigate: (view: string) => void;
}

const MultiplayerInterface: React.FC<MultiplayerInterfaceProps> = ({ onNavigate }) => {
    const [peerId, setPeerId] = useState<string>('');
    const [connectId, setConnectId] = useState<string>('');
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [gameId, setGameId] = useState<string | null>(null);

    // Peer refs
    const peerRef = useRef<Peer | null>(null);
    const connRef = useRef<DataConnection | null>(null);

    // Game State
    const [game, setGame] = useState(new Chess());
    const gameRef = useRef(game);
    const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const [myColor, setMyColor] = useState<'w' | 'b' | null>(null);
    const [lastMove, setLastMove] = useState<{from: string, to: string} | null>(null);
    const [copied, setCopied] = useState(false);

    const { playSound } = useGameSound();

    // Initialize Peer
    useEffect(() => {
        const peer = new Peer();

        peer.on('open', (id) => {
            setPeerId(id);
        });

        peer.on('connection', (conn) => {
            handleConnection(conn);
        });

        peerRef.current = peer;

        return () => {
            if (peerRef.current) peerRef.current.destroy();
        };
    }, []);

    const handleConnection = (conn: DataConnection) => {
        connRef.current = conn;
        setConnectionStatus('connected');

        conn.on('data', (data: any) => {
            if (data.type === 'move') {
                const { from, to, promotion } = data;
                makeMove(from, to, promotion, false);
            } else if (data.type === 'start') {
                // Host decides colors, guest receives
                setMyColor(data.color);
                setGameId(data.gameId);
                resetGame();
                playSound('gameStart');
            } else if (data.type === 'rematch') {
                resetGame();
                playSound('gameStart');
            }
        });

        conn.on('close', () => {
            setConnectionStatus('disconnected');
            setGameId(null);
            setMyColor(null);
        });
    };

    const connectToPeer = () => {
        if (!connectId || !peerRef.current) return;
        setConnectionStatus('connecting');

        const conn = peerRef.current.connect(connectId);
        conn.on('open', () => {
             handleConnection(conn);
             // Once connected, wait for host to start game
        });
    };

    const startHostGame = () => {
        if (!connRef.current) return;
        const newGameId = Math.random().toString(36).substr(2, 9);
        setGameId(newGameId);

        // Randomize colors
        const hostColor = Math.random() > 0.5 ? 'w' : 'b';
        setMyColor(hostColor);

        connRef.current.send({
            type: 'start',
            color: hostColor === 'w' ? 'b' : 'w', // Send opponent their color
            gameId: newGameId
        });

        resetGame();
        playSound('gameStart');
    };

    const resetGame = () => {
        const newGame = new Chess();
        setGame(newGame);
        gameRef.current = newGame;
        setFen(newGame.fen());
        setLastMove(null);
    };

    const makeMove = (from: string, to: string, promotion: string = 'q', isMyMove: boolean = true) => {
        // Use the ref to ensure we have the latest game state even in closures
        const tempGame = new Chess(gameRef.current.fen());
        try {
            const move = tempGame.move({ from, to, promotion });
            if (move) {
                setGame(tempGame);
                gameRef.current = tempGame;
                setFen(tempGame.fen());
                setLastMove({ from, to });

                if (move.captured) playSound('capture');
                else if (move.flags.includes('k') || move.flags.includes('q')) playSound('castle');
                else if (tempGame.isCheck()) playSound('check');
                else playSound('move');

                if (tempGame.isGameOver()) playSound('gameEnd');

                if (isMyMove && connRef.current) {
                    connRef.current.send({
                        type: 'move',
                        from,
                        to,
                        promotion
                    });
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleCopyId = () => {
        navigator.clipboard.writeText(peerId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (connectionStatus === 'connected' && gameId) {
        return (
            <div className="flex flex-col h-full bg-[#312e2b] items-center justify-center p-4">
                 <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4">
                      {/* Board */}
                      <div className="flex-1 flex justify-center">
                           <div className="w-full max-w-[600px] aspect-square">
                               <Chessboard
                                   fen={fen}
                                   boardOrientation={myColor === 'w' ? 'white' : 'black'}
                                   interactable={!game.isGameOver() && game.turn() === myColor}
                                   onMove={(from, to, prom) => makeMove(from, to, prom, true)}
                                   lastMove={lastMove}
                               />
                           </div>
                      </div>

                      {/* Sidebar */}
                      <div className="w-full md:w-[300px] bg-[#262421] p-4 rounded-lg flex flex-col">
                           <div className="flex items-center gap-2 mb-4 text-green-400 font-bold">
                               <Wifi className="w-5 h-5" />
                               <span>Connected</span>
                           </div>

                           <div className="flex-1 overflow-y-auto mb-4 bg-[#211f1c] rounded p-2 text-gray-400 text-sm">
                               {game.history().map((m, i) => (
                                   <span key={i} className="mr-2">
                                       {i % 2 === 0 ? `${Math.floor(i/2) + 1}.` : ''} {m}
                                   </span>
                               ))}
                           </div>

                           {game.isGameOver() && (
                               <button
                                   onClick={() => {
                                       resetGame();
                                       if (connRef.current) connRef.current.send({ type: 'rematch' });
                                   }}
                                   className="w-full bg-chess-green text-white font-bold py-3 rounded mb-2"
                               >
                                   Rematch
                               </button>
                           )}

                           <button
                               onClick={() => {
                                   if (connRef.current) {
                                       connRef.current.close();
                                   }
                                   setConnectionStatus('disconnected');
                                   setGameId(null);
                               }}
                               className="w-full bg-[#383531] text-gray-300 hover:text-white font-bold py-3 rounded"
                           >
                               Leave Game
                           </button>
                      </div>
                 </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#302e2b] items-center justify-center p-6 text-white">
            <div className="w-full max-w-md bg-[#262421] p-8 rounded-lg shadow-2xl border border-white/10">
                <div className="text-center mb-8">
                     <Users className="w-16 h-16 text-chess-green mx-auto mb-4" />
                     <h1 className="text-3xl font-bold mb-2">Multiplayer</h1>
                     <p className="text-gray-400">Play real-time with a friend using Peer-to-Peer connection.</p>
                </div>

                {connectionStatus === 'connected' ? (
                     <div className="text-center">
                         <div className="flex items-center justify-center gap-2 text-green-400 mb-6">
                             <Wifi className="w-6 h-6" />
                             <span className="font-bold">Connected to Opponent!</span>
                         </div>
                         <button
                             onClick={startHostGame}
                             className="w-full bg-chess-green hover:bg-chess-greenHover text-white font-bold py-4 rounded-lg shadow-[0_4px_0_0_#457524] active:shadow-none active:translate-y-[4px] transition-all text-xl mb-3"
                         >
                             Start Game
                         </button>
                         <p className="text-sm text-gray-500">Only one player needs to start.</p>
                     </div>
                ) : (
                    <div className="space-y-6">
                        {/* My ID */}
                        <div className="bg-[#1b1a19] p-4 rounded-lg border border-white/10">
                             <label className="text-xs text-gray-500 font-bold uppercase block text-left mb-2">Your ID (Share this)</label>
                             <div className="flex gap-2">
                                 <input
                                     readOnly
                                     value={peerId || 'Generating...'}
                                     className="flex-1 bg-[#262522] border border-white/10 rounded px-3 py-2 text-gray-300 text-sm focus:outline-none font-mono"
                                 />
                                 <button
                                     onClick={handleCopyId}
                                     className="bg-[#383531] hover:bg-[#45423e] px-3 rounded flex items-center justify-center transition-colors relative"
                                     title="Copy"
                                     disabled={!peerId}
                                 >
                                     {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />}
                                 </button>
                             </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[#262421] text-gray-500">OR</span>
                            </div>
                        </div>

                        {/* Connect Form */}
                        <div>
                             <label className="text-xs text-gray-500 font-bold uppercase block text-left mb-2">Connect to Friend</label>
                             <div className="flex gap-2">
                                 <input
                                     value={connectId}
                                     onChange={(e) => setConnectId(e.target.value)}
                                     placeholder="Enter Friend's ID"
                                     className="flex-1 bg-[#262522] border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-chess-green focus:outline-none font-mono"
                                 />
                                 <button
                                     onClick={connectToPeer}
                                     disabled={!connectId || connectionStatus === 'connecting'}
                                     className="bg-chess-green hover:bg-chess-greenHover disabled:opacity-50 text-white font-bold px-4 rounded flex items-center gap-2"
                                 >
                                     {connectionStatus === 'connecting' ? '...' : <Link2 className="w-4 h-4" />}
                                     Connect
                                 </button>
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MultiplayerInterface;
