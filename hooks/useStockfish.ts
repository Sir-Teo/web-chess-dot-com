import { useEffect, useRef, useState, useCallback } from 'react';
import { STOCKFISH_URL } from '../src/utils/gameAnalysis';

export interface EvalScore {
  unit: 'cp' | 'mate'; // Changed from 'type' to 'unit' to match standard
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
  const [lines, setLines] = useState<AnalysisLine[]>([]);

  useEffect(() => {
    const initWorker = async () => {
      try {
        // Fetch the script content
        const response = await fetch(STOCKFISH_URL);
        if (!response.ok) throw new Error(`Failed to fetch Stockfish: ${response.statusText}`);
        const script = await response.text();

        // Create a Blob from the script content
        // This bypasses the Same-Origin Policy for Workers
        const blob = new Blob([script], { type: 'application/javascript' });
        const objectURL = URL.createObjectURL(blob);

        const worker = new Worker(objectURL);
        workerRef.current = worker;

        worker.onmessage = (e) => {
          const line = e.data;
          
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
             // Parse Score
             let score: EvalScore = { unit: 'cp', value: 0 };
             const scoreMatch = line.match(/score (cp|mate) (-?\d+)/);
             if (scoreMatch) {
                score = {
                    unit: scoreMatch[1] as 'cp' | 'mate',
                    value: parseInt(scoreMatch[2])
                };
                // Only update main eval if it's multipv 1 or not specified
                if (!line.includes('multipv') || line.includes('multipv 1 ')) {
                    setEvalScore(score);
                }
             }

             // Parse PV
             const pvMatch = line.match(/ pv (.+)/);
             if (pvMatch) {
                 const pv = pvMatch[1];
                 if (!line.includes('multipv') || line.includes('multipv 1 ')) {
                    setBestLine(pv);
                 }

                 // Handle MultiPV - default to 1 if not specified (single line mode)
                 const multipvMatch = line.match(/multipv (\d+)/);
                 const depthMatch = line.match(/depth (\d+)/);

                 // Always update lines - use multipv 1 as default when not specified
                 const idx = multipvMatch ? parseInt(multipvMatch[1]) : 1;
                 const currentDepth = depthMatch ? parseInt(depthMatch[1]) : 0;

                 setLines(prev => {
                     const newLines = [...prev];
                     const existingIdx = newLines.findIndex(l => l.multipv === idx);
                     const newLine: AnalysisLine = { multipv: idx, pv, score, depth: currentDepth };

                     if (existingIdx >= 0) {
                         newLines[existingIdx] = newLine;
                     } else {
                         newLines.push(newLine);
                     }
                     return newLines.sort((a, b) => a.multipv - b.multipv);
                 });
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
        // Only clear lines when starting a new analysis (go command)
        if (cmd.startsWith('go')) {
             setLines([]);
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
      sendCommand, 
      resetBestMove 
  };
};
