
// Real implementation of StockfishClient
export interface EngineScore {
  unit: 'cp' | 'mate';
  value: number;
}

export interface AnalysisLine {
  id: number;
  score: EngineScore;
  moves: string[];
}

export class StockfishClient {
  private worker: Worker;
  private isReady: boolean = false;
  private onMessageCallback: ((msg: string) => void) | null = null;

  private constructor(workerUrl: string) {
    // Create blob from code to avoid cross-origin issues if URL is external
    // Actually, for this environment, we might need a specific handling.
    // The previous memory said: "Stockfish.js ... by fetching the script ... and creating a Blob URL"
    // But since I don't have the fetch logic here, I will rely on the caller passing a valid URL
    // or implement the fetch-blob logic if `workerUrl` is a CDN link.
    // However, `new Worker(url)` works for same origin. For CDN, we need Blob.

    // Let's assume the caller handles the Blob creation OR we do it here.
    // The previous `useCoach` calls `StockfishClient.create(STOCKFISH_URL)`.
    // We should implement the static create method to handle the fetch.
    this.worker = new Worker(workerUrl); // Placeholder, will be replaced in create
  }

  static async create(url: string): Promise<StockfishClient> {
      try {
          const response = await fetch(url);
          const script = await response.text();
          const blob = new Blob([script], { type: 'application/javascript' });
          const blobUrl = URL.createObjectURL(blob);
          const client = new StockfishClient(blobUrl); // Use private constructor logic effectively
          // We can't use private ctor easily with async create in TS strict, but we can cast or just make ctor public/internal
          // Re-instantiate properly
          client.worker = new Worker(blobUrl);
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
                  // Parse score
                  // info depth 10 seldepth 14 multipv 1 score cp 45 ...
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
