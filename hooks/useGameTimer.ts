import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameSound } from './useGameSound';

type TimerState = {
  white: number;
  black: number;
};

export const useGameTimer = (
  initialTime: number, // in seconds
  turn: 'w' | 'b',
  isGameOver: boolean,
  onTimeout?: (loser: 'w' | 'b') => void
) => {
  const [timeLeft, setTimeLeft] = useState<TimerState>({
    white: initialTime,
    black: initialTime,
  });
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { playSound } = useGameSound();

  // Track if we played low time warning
  const lowTimeWarned = useRef<Record<'w'|'b', boolean>>({ w: false, b: false });

  // Format time as MM:SS (or M:SS.d if low)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);

    // If under 20 seconds, maybe show decimal? Authentic chess.com shows tenths under 20s.
    // However, our interval is 1s, so decimals won't update smoothly without a tighter loop.
    // We stick to MM:SS for now.

    if (m === 0 && s < 10) {
        // Just visual distinction (handled by caller styling usually, but we output text)
        return `0:0${s}`;
    }

    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = useCallback(() => setIsRunning(true), []);
  const stopTimer = useCallback(() => setIsRunning(false), []);

  const resetTimer = useCallback(() => {
    setTimeLeft({ white: initialTime, black: initialTime });
    setIsRunning(false);
    lowTimeWarned.current = { w: false, b: false };
  }, [initialTime]);

  useEffect(() => {
    if (isRunning && !isGameOver) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const color = turn === 'w' ? 'white' : 'black';
          const newTime = Math.max(0, prev[color] - 0.1); // Change to 0.1s for smoother if we wanted decimals, but let's stick to 1s logic for stability first.

          // Revert to 1s logic for now as 0.1 requires state update optimization
          const currentVal = prev[color];
          if (currentVal <= 0) return prev;

          const nextVal = currentVal - 1;

          if (nextVal <= 0) {
            clearInterval(timerRef.current!);
            onTimeout?.(color === 'white' ? 'w' : 'b');
            return { ...prev, [color]: 0 };
          }

          // Low time warning (10 seconds)
          const side = color === 'white' ? 'w' : 'b';
          if (nextVal <= 10 && !lowTimeWarned.current[side]) {
               playSound('tenSeconds');
               lowTimeWarned.current[side] = true;
          }

          return {
            ...prev,
            [color]: nextVal,
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, turn, isGameOver, onTimeout, playSound]);

  return {
    whiteTime: timeLeft.white,
    blackTime: timeLeft.black,
    formatTime,
    startTimer,
    stopTimer,
    resetTimer,
  };
};
