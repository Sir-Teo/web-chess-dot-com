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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bestMove, setBestMove] = useState<string | null>(null);
  const [evalScore, setEvalScore] = useState<EvalScore | null>(null);
  const [bestLine, setBestLine] = useState<string>('');
  const [lines, setLines] = useState<AnalysisLine[]>([]);

  useEffect(() => {
    const initWorker = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch the script content
        const response = await fetch(STOCKFISH_URL);
        if (!response.ok) throw new Error(`Failed to fetch Stockfish: ${response.statusText}`);
        const script = await response.text();

        // Validate script content
        if (!script || script.length < 1000) {
          throw new Error('Invalid Stockfish script received');
        }

        // Create a Blob from the script content
        // This bypasses the Same-Origin Policy for Workers
        const blob = new Blob([script], { type: 'application/javascript' });
        const objectURL = URL.createObjectURL(blob);

        const worker = new Worker(objectURL);
        workerRef.current = worker;

        worker.onerror = (e) => {
          console.error("Stockfish worker error", e);
          setError('Engine worker error');
          setIsLoading(false);
        };

        worker.onmessage = (e) => {
          // Ensure we have a string and trim whitespace
          const line = typeof e.data === 'string' ? e.data.trim() : String(e.data).trim();

          if (line === 'uciok') {
            setIsReady(true);
            setIsLoading(false);
          }

          if (line.startsWith('bestmove')) {
            const move = line.split(' ')[1];
            if (move && move !== '(none)') {
               setBestMove(move);
            }
          }

          if (line.startsWith('info') && line.includes('score')) {
             // Parse Score - use more lenient regex with flexible whitespace
             let score: EvalScore = { unit: 'cp', value: 0 };
             const scoreMatch = line.match(/score\s+(cp|mate)\s+(-?\d+)/);
             if (scoreMatch) {
                score = {
                    unit: scoreMatch[1] as 'cp' | 'mate',
                    value: parseInt(scoreMatch[2])
                };
                // Only update main eval if it's multipv 1 or not specified
                const multipvCheck = line.match(/multipv\s+(\d+)/);
                if (!multipvCheck || multipvCheck[1] === '1') {
                    setEvalScore(score);
                }
             }

             // Parse PV - capture moves after 'pv' and trim any trailing fields
             const pvMatch = line.match(/\spv\s+(.+)/);
             if (pvMatch) {
                 // Clean up PV - remove any trailing non-move fields and trim
                 let pv = pvMatch[1].trim();
                 // PV should only contain moves (like "e2e4 e7e5 g1f3")
                 // Remove any trailing info fields that might have been captured
                 pv = pv.replace(/\s+(string|bmc|wdl|hashfull|tbhits|cpuload)\s+.*$/i, '').trim();

                 const multipvMatch = line.match(/multipv\s+(\d+)/);
                 if (!multipvMatch || multipvMatch[1] === '1') {
                    setBestLine(pv);
                 }

                 // Handle MultiPV - default to 1 if not specified (single line mode)
                 const depthMatch = line.match(/depth\s+(\d+)/);

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
        setError(error instanceof Error ? error.message : 'Failed to initialize engine');
        setIsLoading(false);
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
      isLoading,
      error,
      bestMove,
      evalScore,
      bestLine,
      lines,
      sendCommand,
      resetBestMove
  };
};
