import { useState, useEffect, useRef, useCallback } from 'react';

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

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = useCallback(() => setIsRunning(true), []);
  const stopTimer = useCallback(() => setIsRunning(false), []);

  const resetTimer = useCallback(() => {
    setTimeLeft({ white: initialTime, black: initialTime });
    setIsRunning(false);
  }, [initialTime]);

  useEffect(() => {
    if (isRunning && !isGameOver) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const color = turn === 'w' ? 'white' : 'black';
          const newTime = Math.max(0, prev[color] - 1);

          if (newTime === 0) {
            clearInterval(timerRef.current!);
            onTimeout?.(color === 'white' ? 'w' : 'b');
          }

          return {
            ...prev,
            [color]: newTime,
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, turn, isGameOver, onTimeout]);

  return {
    whiteTime: timeLeft.white,
    blackTime: timeLeft.black,
    formatTime,
    startTimer,
    stopTimer,
    resetTimer,
  };
};
