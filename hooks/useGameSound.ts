import { useCallback, useRef } from 'react';

// Using standard chess.com sound URLs which are publicly accessible on their CDN for themes
// If these fail, we might need local assets.
const SOUNDS = {
  move: 'https://images.chesscomfiles.com/chess-themes/sounds/_Common/standard/move-self.mp3',
  capture: 'https://images.chesscomfiles.com/chess-themes/sounds/_Common/standard/capture.mp3',
  check: 'https://images.chesscomfiles.com/chess-themes/sounds/_Common/standard/move-check.mp3',
  castle: 'https://images.chesscomfiles.com/chess-themes/sounds/_Common/standard/castle.mp3',
  promote: 'https://images.chesscomfiles.com/chess-themes/sounds/_Common/standard/promote.mp3',
  notify: 'https://images.chesscomfiles.com/chess-themes/sounds/_Common/standard/notify.mp3',
  gameEnd: 'https://images.chesscomfiles.com/chess-themes/sounds/_Common/standard/game-end.mp3',
  illegal: 'https://images.chesscomfiles.com/chess-themes/sounds/_Common/standard/illegal.mp3',
  gameStart: 'https://images.chesscomfiles.com/chess-themes/sounds/_Common/standard/game-start.mp3',
  tenSeconds: 'https://images.chesscomfiles.com/chess-themes/sounds/_Common/standard/ten_seconds.mp3', // Low time warning
};

export const useGameSound = () => {
  const audioCache = useRef<Record<string, HTMLAudioElement>>({});

  const playSound = useCallback((type: keyof typeof SOUNDS) => {
    try {
        const url = SOUNDS[type];
        if (!audioCache.current[type]) {
            audioCache.current[type] = new Audio(url);
        }

        const audio = audioCache.current[type];
        audio.currentTime = 0;
        audio.play().catch(e => {
            // Audio play failed (often due to user interaction policy)
            console.warn("Audio play failed", e);
        });
    } catch (error) {
        console.error("Sound error", error);
    }
  }, []);

  return { playSound };
};
