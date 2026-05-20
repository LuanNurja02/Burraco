'use client';

import { useState, useEffect, useCallback } from 'react';

interface GameTimerProps {
  gameStatus: 'active' | 'paused' | 'finished';
}

export default function GameTimer({ gameStatus }: GameTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'stopwatch' | 'countdown'>('stopwatch');
  const [countdownMinutes, setCountdownMinutes] = useState(60);
  const [countdownSeconds, setCountdownSeconds] = useState(60 * 60);

  const formatTime = useCallback((totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (mode === 'stopwatch') {
        setSeconds((s) => s + 1);
      } else {
        setCountdownSeconds((s) => {
          if (s <= 0) {
            setIsRunning(false);
            return 0;
          }
          return s - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode]);

  useEffect(() => {
    if (gameStatus === 'finished') {
      setIsRunning(false);
    }
  }, [gameStatus]);

  const toggleTimer = () => {
    if (!isRunning && mode === 'countdown' && countdownSeconds <= 0) {
      setCountdownSeconds(countdownMinutes * 60);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'stopwatch') {
      setSeconds(0);
    } else {
      setCountdownSeconds(countdownMinutes * 60);
    }
  };

  const switchMode = () => {
    setIsRunning(false);
    if (mode === 'stopwatch') {
      setMode('countdown');
      setCountdownSeconds(countdownMinutes * 60);
    } else {
      setMode('stopwatch');
      setSeconds(0);
    }
  };

  const displayTime = mode === 'stopwatch' ? seconds : countdownSeconds;
  const isLow = mode === 'countdown' && countdownSeconds <= 300 && countdownSeconds > 0;

  return (
    <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={switchMode}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium"
        >
          {mode === 'stopwatch' ? '⏱ Cronometro' : '⏳ Countdown'}
        </button>
        {mode === 'countdown' && !isRunning && (
          <select
            value={countdownMinutes}
            onChange={(e) => {
              const mins = parseInt(e.target.value);
              setCountdownMinutes(mins);
              setCountdownSeconds(mins * 60);
            }}
            className="text-xs bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-2 py-1"
          >
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
            <option value={90}>90 min</option>
            <option value={120}>120 min</option>
          </select>
        )}
      </div>

      <div className={`text-3xl font-mono font-bold text-center py-2 ${
        isLow ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-gray-900 dark:text-white'
      }`}>
        {formatTime(displayTime)}
      </div>

      <div className="flex justify-center space-x-2 mt-2">
        <button
          onClick={toggleTimer}
          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
            isRunning
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
        >
          {isRunning ? '⏸ Pausa' : '▶ Avvia'}
        </button>
        <button
          onClick={resetTimer}
          className="px-4 py-1.5 rounded text-sm font-medium bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 transition-colors"
        >
          ↺ Reset
        </button>
      </div>
    </div>
  );
}
