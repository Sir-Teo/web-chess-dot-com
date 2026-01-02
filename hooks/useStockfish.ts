import { useEffect, useRef, useState, useCallback } from 'react';

// Using a slightly newer version or sticking to the one that works.
// v10 is old but reliable for simple JS.
// However, for "Coach mode" we might want something faster, but let's stick to this to ensure it works on GitHub pages without WASM headers issues.
const STOCKFISH_URL = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js';

export interface EvalScore {
  type: 'cp' | 'mate';
  value: number;
}

export const useStockfish = () => {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [bestMove, setBestMove] = useState<string | null>(null);
  const [evalScore, setEvalScore] = useState<EvalScore | null>(null);
  const [bestLine, setBestLine] = useState<string>('');

  useEffect(() => {
    const initWorker = async () => {
      try {
        const response = await fetch(STOCKFISH_URL);
        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);
        const worker = new Worker(objectURL);
        workerRef.current = worker;

        worker.onmessage = (e) => {
          const line = e.data;
          // console.log("SF:", line); // Debug
          
          if (line === 'uciok') {
            setIsReady(true);
          }

          if (line.startsWith('bestmove')) {
            const move = line.split(' ')[1];
            if (move && move !== '(none)') {
               setBestMove(move);
            }
          }

          if (line.startsWith('info') && line.includes('score')) {
             const scoreMatch = line.match(/score (cp|mate) (-?\d+)/);
             if (scoreMatch) {
                setEvalScore({
                    type: scoreMatch[1] as 'cp' | 'mate',
                    value: parseInt(scoreMatch[2])
                });
             }
             const pvMatch = line.match(/ pv (.+)/);
             if (pvMatch) {
               setBestLine(pvMatch[1]);
             }
          }
        };

        worker.postMessage('uci');
      } catch (error) {
        console.error("Stockfish init failed", error);
      }
    };

    initWorker();

    return () => {
      if (workerRef.current) {
          workerRef.current.terminate();
      }
    };
  }, []);

  const sendCommand = useCallback((cmd: string) => {
    if (workerRef.current) {
        workerRef.current.postMessage(cmd);
    }
  }, []);

  const resetBestMove = useCallback(() => {
    setBestMove(null);
  }, []);

  return { 
      isReady, 
      bestMove, 
      evalScore, 
      bestLine, 
      sendCommand, 
      resetBestMove 
  };
};
