import { useEffect, useRef, useState, useCallback } from 'react';

// Using a slightly newer version or sticking to the one that works.
// v10 is old but reliable for simple JS.
const STOCKFISH_URL = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js';

export interface EvalScore {
  type: 'cp' | 'mate';
  value: number;
}

export interface AnalysisLine {
    multipv: number;
    pv: string;
    score: EvalScore;
    depth: number;
}

export const useStockfish = () => {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [bestMove, setBestMove] = useState<string | null>(null);
  const [evalScore, setEvalScore] = useState<EvalScore | null>(null);
  const [bestLine, setBestLine] = useState<string>('');

  // New States
  const [depth, setDepth] = useState<number>(0);
  const [nps, setNps] = useState<number>(0);

  // MultiPV Lines
  const [lines, setLines] = useState<AnalysisLine[]>([]);

  useEffect(() => {
    const initWorker = async () => {
      try {
        const response = await fetch(STOCKFISH_URL);
        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);
        const worker = new Worker(objectURL);
        workerRef.current = worker;

        let uciOk = false;

        worker.onmessage = (e) => {
          const line = e.data;
          
          if (line === 'uciok') {
            uciOk = true;
            worker.postMessage('isready');
          }

          if (line === 'readyok') {
             // Configure default options
             worker.postMessage('setoption name Hash value 32');
             worker.postMessage('setoption name Threads value 1');
             worker.postMessage('setoption name MultiPV value 3'); // Default MultiPV
             setIsReady(true);
          }

          if (line.startsWith('bestmove')) {
            const move = line.split(' ')[1];
            if (move && move !== '(none)') {
               setBestMove(move);
            }
          }

          if (line.startsWith('info') && line.includes('score')) {
             // Parse Score
             let score: EvalScore = { type: 'cp', value: 0 };
             const scoreMatch = line.match(/score (cp|mate) (-?\d+)/);
             if (scoreMatch) {
                score = {
                    type: scoreMatch[1] as 'cp' | 'mate',
                    value: parseInt(scoreMatch[2])
                };
                // Only update main eval if it's multipv 1 or not specified
                if (!line.includes('multipv') || line.includes('multipv 1 ')) {
                    setEvalScore(score);
                }
             }

             // Parse depth and nps
             const depthMatch = line.match(/depth (\d+)/);
             if (depthMatch && (!line.includes('multipv') || line.includes('multipv 1 '))) {
                 setDepth(parseInt(depthMatch[1]));
             }

             const npsMatch = line.match(/nps (\d+)/);
             if (npsMatch) {
                 setNps(parseInt(npsMatch[1]));
             }

             // Parse PV
             const pvMatch = line.match(/ pv (.+)/);
             if (pvMatch) {
                 const pv = pvMatch[1];
                 if (!line.includes('multipv') || line.includes('multipv 1 ')) {
                    setBestLine(pv);
                 }

                 // Handle MultiPV
                 const multipvMatch = line.match(/multipv (\d+)/);
                 const currentDepth = depthMatch ? parseInt(depthMatch[1]) : 0;

                 if (multipvMatch) {
                     const idx = parseInt(multipvMatch[1]);

                     setLines(prev => {
                         const newLines = [...prev];
                         // Replace or add
                         const existingIdx = newLines.findIndex(l => l.multipv === idx);
                         const newLine: AnalysisLine = { multipv: idx, pv, score, depth: currentDepth };

                         if (existingIdx >= 0) {
                             newLines[existingIdx] = newLine;
                         } else {
                             newLines.push(newLine);
                         }
                         // Sort by multipv
                         return newLines.sort((a, b) => a.multipv - b.multipv);
                     });
                 }
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
        // If sending a new position or new go command, clear old lines
        if (cmd.startsWith('position') || cmd.startsWith('go')) {
             setLines([]);
             setDepth(0); // Reset depth on new search
             setNps(0);
        }
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
      lines,
      depth,
      nps,
      sendCommand, 
      resetBestMove 
  };
};
