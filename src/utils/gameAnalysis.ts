
import { Chess } from 'chess.js';

// Real implementation of StockfishClient
export interface EngineScore {
  unit: 'cp' | 'mate';
  value: number;
}

export interface AnalysisLine {
  multipv: number;
  pv: string; // UCI string "e2e4 e7e5"
  score: EngineScore;
  depth: number;
}

export interface MoveAnalysis {
    classification: 'brilliant' | 'best' | 'great' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'book' | 'forced';
    reason?: string;
}

export interface GameReviewData {
    accuracy: number;
    moves: MoveAnalysis[];
}

// Convert a sequence of UCI moves (from a specific FEN) to SAN string
export const uciLineToSan = (fen: string, pv: string): string => {
  if (!pv) return '';
  const tempGame = new Chess(fen);
  const uciMoves = pv.split(' ');
  const sanMoves: string[] = [];

  for (const uci of uciMoves) {
    if (!uci) continue;
    const from = uci.substring(0, 2);
    const to = uci.substring(2, 4);
    const promotion = uci.length > 4 ? uci[4] : undefined;

    try {
      const move = tempGame.move({ from, to, promotion });
      if (move) sanMoves.push(move.san);
      else break;
    } catch (e) {
      break;
    }
  }
  return sanMoves.join(' ');
};

// Placeholder for analyzeGame function - Will be implemented fully in next steps
export const analyzeGame = async (pgn: string): Promise<GameReviewData> => {
    // This would invoke Stockfish to analyze the full game
    // For now, return mock data
    return {
        accuracy: 85,
        moves: []
    };
};

export class StockfishClient {
  private worker: Worker;
  private isReady: boolean = false;
  private onMessageCallback: ((msg: string) => void) | null = null;

  private constructor(workerUrl: string) {
    this.worker = new Worker(workerUrl);
  }

  static async create(url: string): Promise<StockfishClient> {
      try {
          const response = await fetch(url);
          const script = await response.text();
          const blob = new Blob([script], { type: 'application/javascript' });
          const blobUrl = URL.createObjectURL(blob);
          const client = new StockfishClient(blobUrl);
          await client.init();
          return client;
      } catch (e) {
          console.error("Failed to load Stockfish", e);
          throw e;
      }
  }

  async init(): Promise<void> {
    this.worker.onmessage = (e) => {
        const msg = e.data;
        if (msg === 'uciok') {
            this.isReady = true;
        }
        if (this.onMessageCallback) this.onMessageCallback(msg);
    };
    this.worker.postMessage('uci');
    // Wait for uciok
    return new Promise<void>((resolve) => {
        const check = setInterval(() => {
            if (this.isReady) {
                clearInterval(check);
                resolve();
            }
        }, 50);
    });
  }

  async setOption(name: string, value: string | number) {
      this.worker.postMessage(`setoption name ${name} value ${value}`);
  }

  setPosition(fen: string) {
      this.worker.postMessage(`position fen ${fen}`);
  }

  async go(depth: number): Promise<{ bestMove: string, score: EngineScore | null }> {
      return new Promise((resolve) => {
          let bestMove = '';
          let score: EngineScore | null = null;

          const listener = (e: MessageEvent) => {
              const msg = e.data;
              if (msg.startsWith('info') && msg.includes('score')) {
                  const parts = msg.split(' ');
                  const scoreIdx = parts.indexOf('score');
                  if (scoreIdx !== -1) {
                      const type = parts[scoreIdx + 1];
                      const val = parseInt(parts[scoreIdx + 2]);
                      if (type === 'cp' || type === 'mate') {
                          score = { unit: type as 'cp' | 'mate', value: val };
                      }
                  }
              }
              if (msg.startsWith('bestmove')) {
                  bestMove = msg.split(' ')[1];
                  this.worker.removeEventListener('message', listener);
                  resolve({ bestMove, score });
              }
          };
          this.worker.addEventListener('message', listener);
          this.worker.postMessage(`go depth ${depth}`);
      });
  }

  terminate() {
      this.worker.terminate();
  }

  stop() {
      this.worker.postMessage('stop');
  }
}
