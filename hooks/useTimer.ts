'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PomodoroMode } from '@/lib/types';
import { playGentleChime } from '@/lib/sound';

export interface UseTimerOptions {
  workDurationMinutes?: number;
  breakDurationMinutes?: number;
  onWorkComplete?: () => void;
  onBreakComplete?: () => void;
}

export function useTimer({
  workDurationMinutes = 25,
  breakDurationMinutes = 5,
  onWorkComplete,
  onBreakComplete,
}: UseTimerOptions = {}) {
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(workDurationMinutes * 60);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Keep callback refs up to date to avoid stale closures
  const onWorkCompleteRef = useRef(onWorkComplete);
  const onBreakCompleteRef = useRef(onBreakComplete);

  useEffect(() => {
    onWorkCompleteRef.current = onWorkComplete;
    onBreakCompleteRef.current = onBreakComplete;
  }, [onWorkComplete, onBreakComplete]);

  // Request notification permissions
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  }, []);

  // Show notification
  const notify = useCallback((title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.warn('Failed to send notification', e);
      }
    }
  }, []);

  // Interval timer tick
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer finished
          playGentleChime();

          if (mode === 'work') {
            notify('Focus session finished! 🎉', 'Great job! Time to take a refreshing 5-minute break.');
            if (onWorkCompleteRef.current) {
              onWorkCompleteRef.current();
            }
            // Auto switch to break
            setMode('break');
            setIsRunning(false);
            return breakDurationMinutes * 60;
          } else {
            notify('Break finished! ⚡', 'Ready to dive back into deep focus? Let\'s go!');
            if (onBreakCompleteRef.current) {
              onBreakCompleteRef.current();
            }
            // Auto switch back to work
            setMode('work');
            setIsRunning(false);
            return workDurationMinutes * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, workDurationMinutes, breakDurationMinutes, notify]);

  const start = useCallback(() => {
    requestNotificationPermission();
    setIsRunning(true);
  }, [requestNotificationPermission]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? workDurationMinutes * 60 : breakDurationMinutes * 60);
  }, [mode, workDurationMinutes, breakDurationMinutes]);

  const switchMode = useCallback(
    (newMode: PomodoroMode) => {
      setIsRunning(false);
      setMode(newMode);
      setTimeLeft(newMode === 'work' ? workDurationMinutes * 60 : breakDurationMinutes * 60);
    },
    [workDurationMinutes, breakDurationMinutes]
  );

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const totalTime = mode === 'work' ? workDurationMinutes * 60 : breakDurationMinutes * 60;
  const progressPercent = Math.max(0, Math.min(100, ((totalTime - timeLeft) / totalTime) * 100));

  return {
    mode,
    isRunning,
    timeLeft,
    formattedTime: formatTime(timeLeft),
    progressPercent,
    selectedTaskId,
    setSelectedTaskId,
    start,
    pause,
    reset,
    switchMode,
    formatTime,
  };
}
