'use client';

import React from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { PomodoroMode, Task } from '@/lib/types';

interface PomodoroTimerProps {
  mode: PomodoroMode;
  isRunning: boolean;
  timeLeft: number;
  formattedTime: string;
  progressPercent: number;
  selectedTaskId: string | null;
  tasks: Task[];
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSwitchMode: (mode: PomodoroMode) => void;
  onSelectTaskId: (taskId: string | null) => void;
}

export function PomodoroTimer({
  mode,
  isRunning,
  formattedTime,
  progressPercent,
  selectedTaskId,
  tasks,
  onStart,
  onPause,
  onReset,
  onSwitchMode,
  onSelectTaskId,
}: PomodoroTimerProps) {
  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  const activeTasks = tasks.filter((t) => !t.completed);

  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-white dark:bg-[#151821] border border-[#f0f0f4] dark:border-[#212634] rounded-3xl shadow-xs max-w-xl mx-auto w-full transition-all">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#f4f5f8] dark:bg-[#181c28] rounded-full mb-8">
        <button
          onClick={() => onSwitchMode('work')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
            mode === 'work'
              ? 'bg-[#f3a838] text-white shadow-xs'
              : 'text-[#8b8f9e] hover:text-[#1c1d22] dark:hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Deep Focus (25m)</span>
        </button>

        <button
          onClick={() => onSwitchMode('break')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
            mode === 'break'
              ? 'bg-[#2dd4bf] text-white shadow-xs'
              : 'text-[#8b8f9e] hover:text-[#1c1d22] dark:hover:text-white'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Break (5m)</span>
        </button>
      </div>

      {/* Circular Progress Gauge & Big Digits */}
      <div className="relative w-60 h-60 md:w-68 md:h-68 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 240 240">
          <circle
            cx="120"
            cy="120"
            r="100"
            className="stroke-[#f0f0f4] dark:stroke-[#1e2230]"
            strokeWidth="9"
            fill="transparent"
          />
          <circle
            cx="120"
            cy="120"
            r="100"
            className={`transition-all duration-1000 ease-linear ${
              mode === 'work' ? 'stroke-[#f3a838]' : 'stroke-[#2dd4bf]'
            }`}
            strokeWidth="9"
            strokeDasharray={2 * Math.PI * 100}
            strokeDashoffset={2 * Math.PI * 100 * (1 - progressPercent / 100)}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-5xl md:text-6xl font-extrabold tracking-tight text-[#1c1d22] dark:text-white font-mono tabular-nums">
            {formattedTime}
          </span>
          <span className="text-[11px] uppercase tracking-wider font-bold text-[#a0a5b5] mt-2">
            {mode === 'work' ? 'Deep Work' : 'Rest Break'}
          </span>
        </div>
      </div>

      {/* Task Link selector */}
      <div className="w-full max-w-sm mt-6 mb-7 text-center">
        <label className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#8b8f9e] mb-2">
          <LinkIcon className="w-3 h-3" />
          <span>Linked Task for this session:</span>
        </label>
        <select
          value={selectedTaskId || ''}
          onChange={(e) => onSelectTaskId(e.target.value || null)}
          className="w-full px-4 py-2.5 bg-[#f4f5f8] dark:bg-[#181c28] border-none rounded-xl text-xs font-semibold text-[#1c1d22] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#f3a838]/30"
        >
          <option value="">No task linked (General focus)</option>
          {activeTasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title} ({t.completedSessions} done)
            </option>
          ))}
        </select>
        {selectedTask && (
          <div className="mt-2 text-xs text-[#e0891d] dark:text-[#f3a838] font-bold flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Target: {selectedTask.title}</span>
          </div>
        )}
      </div>

      {/* Timer Controls Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={onReset}
          className="p-3 text-[#8b8f9e] hover:text-[#1c1d22] dark:hover:text-white bg-[#f4f5f8] dark:bg-[#181c28] hover:bg-[#eaecef] rounded-full transition-all shadow-2xs"
          title="Reset Timer"
          aria-label="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {isRunning ? (
          <button
            onClick={onPause}
            className="flex items-center gap-2 px-8 py-3 bg-[#2e3444] hover:bg-[#252a37] text-white rounded-full font-bold shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all text-xs"
            aria-label="Pause Timer"
          >
            <Pause className="w-4 h-4 fill-current" />
            <span>Pause</span>
          </button>
        ) : (
          <button
            onClick={onStart}
            className={`flex items-center gap-2 px-8 py-3 text-white rounded-full font-bold shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all text-xs ${
              mode === 'work'
                ? 'bg-[#f3a838] hover:bg-[#e0891d]'
                : 'bg-[#2dd4bf] hover:bg-[#14b8a6]'
            }`}
            aria-label="Start Timer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Session</span>
          </button>
        )}
      </div>
    </div>
  );
}
