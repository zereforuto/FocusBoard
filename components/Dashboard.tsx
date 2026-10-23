'use client';

import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTimer } from '@/hooks/useTimer';
import { Task, FocusSessionLog, FocusBoardData } from '@/lib/types';
import { getInitialTasks, getInitialSessions } from '@/lib/utils';
import { Sidebar, MobileTabBar, NavTab } from '@/components/Navigation';
import { TaskManager } from '@/components/TaskManager';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { DailyStats } from '@/components/DailyStats';
import { DataBackup } from '@/components/DataBackup';
import { useTheme } from '@/components/ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export function Dashboard() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Load Tasks from LocalStorage safely
  const [tasks, setTasks, isTasksHydrated] = useLocalStorage<Task[]>(
    'focusboard_tasks',
    []
  );

  // Load Pomodoro sessions from LocalStorage safely
  const [sessions, setSessions, isSessionsHydrated] = useLocalStorage<FocusSessionLog[]>(
    'focusboard_sessions',
    []
  );

  // Seed sample data on first visit after hydration if storage was empty
  React.useEffect(() => {
    if (isTasksHydrated && tasks.length === 0) {
      const saved = localStorage.getItem('focusboard_tasks');
      if (saved === null) {
        setTasks(getInitialTasks());
      }
    }
  }, [isTasksHydrated, tasks.length, setTasks]);

  React.useEffect(() => {
    if (isSessionsHydrated && sessions.length === 0) {
      const saved = localStorage.getItem('focusboard_sessions');
      if (saved === null) {
        setSessions(getInitialSessions());
      }
    }
  }, [isSessionsHydrated, sessions.length, setSessions]);

  const { resolvedTheme, toggleTheme } = useTheme();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Timer callbacks wrapped in useCallback
  const handleWorkComplete = React.useCallback(() => {
    const now = new Date().toISOString();
    const currentTaskId = selectedTaskId;

    const newSession: FocusSessionLog = {
      id: `session-${Date.now()}`,
      taskId: currentTaskId || undefined,
      taskTitle: currentTaskId ? tasks.find((t) => t.id === currentTaskId)?.title : undefined,
      durationMinutes: 25,
      completedAt: now,
      mode: 'work',
    };

    setSessions((prev) => [newSession, ...prev]);

    if (currentTaskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === currentTaskId
            ? { ...t, completedSessions: (t.completedSessions || 0) + 1 }
            : t
        )
      );
    }
  }, [tasks, selectedTaskId, setSessions, setTasks]);

  const handleBreakComplete = React.useCallback(() => {
    const newSession: FocusSessionLog = {
      id: `break-${Date.now()}`,
      durationMinutes: 5,
      completedAt: new Date().toISOString(),
      mode: 'break',
    };
    setSessions((prev) => [newSession, ...prev]);
  }, [setSessions]);

  // Timer Hook
  const timer = useTimer({
    workDurationMinutes: 25,
    breakDurationMinutes: 5,
    onWorkComplete: handleWorkComplete,
    onBreakComplete: handleBreakComplete,
  });

  // Task actions
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'createdAt' | 'completedSessions'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      completedSessions: 0,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTaskId === id) {
      setSelectedTaskId(null);
    }
  };

  const handleReorderTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
  };

  const handleStartFocusOnTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setCurrentTab('timer');
    if (!timer.isRunning) {
      timer.start();
    }
  };

  const handleImportData = (imported: FocusBoardData) => {
    if (imported.tasks) setTasks(imported.tasks);
    if (imported.sessions) setSessions(imported.sessions);
  };

  const handleResetAllData = () => {
    setTasks(getInitialTasks());
    setSessions(getInitialSessions());
  };

  const fullData: FocusBoardData = {
    version: 1,
    tasks,
    sessions,
  };

  const activeTaskCount = tasks.filter((t) => !t.completed).length;

  // Prevent SSR hydration flicker
  if (!isTasksHydrated || !isSessionsHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfbfd] dark:bg-[#0d0f15]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#f3a838] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#a0a5b5] font-semibold">Loading FocusBoard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fbfbfd] dark:bg-[#0d0f15] text-[#1c1d22] dark:text-[#f4f5f8] transition-colors">
      {/* Sidebar for Desktop */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeTaskCount={activeTaskCount}
        onResetAllData={handleResetAllData}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* Top Header Bar matching the reference design layout: Dashboard title + Search bar */}
        <header className="sticky top-0 z-10 bg-[#fbfbfd]/90 dark:bg-[#0d0f15]/90 backdrop-blur-md px-6 md:px-10 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#1c1d22] dark:text-white capitalize font-sans">
              {currentTab === 'dashboard'
                ? 'Dashboard'
                : currentTab === 'tasks'
                ? 'My Tasks'
                : currentTab === 'timer'
                ? 'Pomodoro Timer'
                : 'Performance Analytics'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 text-[#8b8f9e] hover:text-[#1c1d22] dark:hover:text-white rounded-full hover:bg-[#f0f0f4] dark:hover:bg-[#181c28] transition-colors"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Content Tab Renderers */}
        <div className="px-6 md:px-10 py-2 max-w-6xl w-full mx-auto space-y-10">
          {currentTab === 'dashboard' && (
            <div className="space-y-10">
              {/* Daily Stats with dual line chart, overlapping circles and working hours */}
              <DailyStats
                tasks={tasks}
                sessions={sessions}
                onViewTasks={() => setCurrentTab('tasks')}
              />

              {/* Tasks Quick View and Focus Timer */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4 border-t border-[#f0f0f4] dark:border-[#1e2230]">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-[#1c1d22] dark:text-white">
                      Tasks Quick View
                    </h3>
                    <button
                      onClick={() => setCurrentTab('tasks')}
                      className="text-xs font-bold text-[#e0891d] dark:text-[#f3a838] hover:underline"
                    >
                      View All ({tasks.length})
                    </button>
                  </div>
                  <TaskManager
                    tasks={tasks}
                    onAddTask={handleAddTask}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                    onReorderTasks={handleReorderTasks}
                    onStartFocusOnTask={handleStartFocusOnTask}
                    activeTimerTaskId={selectedTaskId}
                  />
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-[#1c1d22] dark:text-white">
                      Focus Timer
                    </h3>
                    <button
                      onClick={() => setCurrentTab('timer')}
                      className="text-xs font-bold text-[#e0891d] dark:text-[#f3a838] hover:underline"
                    >
                      Fullscreen Timer
                    </button>
                  </div>
                  <PomodoroTimer
                    mode={timer.mode}
                    isRunning={timer.isRunning}
                    timeLeft={timer.timeLeft}
                    formattedTime={timer.formattedTime}
                    progressPercent={timer.progressPercent}
                    selectedTaskId={selectedTaskId}
                    tasks={tasks}
                    onStart={timer.start}
                    onPause={timer.pause}
                    onReset={timer.reset}
                    onSwitchMode={timer.switchMode}
                    onSelectTaskId={setSelectedTaskId}
                  />
                </div>
              </div>

              {/* Backup & Import section */}
              <DataBackup data={fullData} onImportData={handleImportData} />
            </div>
          )}

          {currentTab === 'tasks' && (
            <div className="space-y-6">
              <TaskManager
                tasks={tasks}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onReorderTasks={handleReorderTasks}
                onStartFocusOnTask={handleStartFocusOnTask}
                activeTimerTaskId={selectedTaskId}
              />
              <DataBackup data={fullData} onImportData={handleImportData} />
            </div>
          )}

          {currentTab === 'timer' && (
            <div className="space-y-8 py-4">
              <PomodoroTimer
                mode={timer.mode}
                isRunning={timer.isRunning}
                timeLeft={timer.timeLeft}
                formattedTime={timer.formattedTime}
                progressPercent={timer.progressPercent}
                selectedTaskId={selectedTaskId}
                tasks={tasks}
                onStart={timer.start}
                onPause={timer.pause}
                onReset={timer.reset}
                onSwitchMode={timer.switchMode}
                onSelectTaskId={setSelectedTaskId}
              />

              <div className="max-w-xl mx-auto p-5 rounded-2xl bg-[#f4f5f8] dark:bg-[#151821] border border-[#f0f0f4] dark:border-[#212634] text-xs text-[#8b8f9e] space-y-2">
                <p className="font-bold text-[#1c1d22] dark:text-white">
                  💡 Pomodoro Focus Flow:
                </p>
                <ul className="list-disc list-inside space-y-1 font-medium">
                  <li>25-minute deep work intervals paired with 5-minute recovery breaks.</li>
                  <li>Link any specific task in the dropdown to register completed sessions.</li>
                  <li>Gentle Web Audio chime sounds when each cycle completes.</li>
                </ul>
              </div>
            </div>
          )}

          {currentTab === 'stats' && (
            <div className="space-y-8">
              <DailyStats
                tasks={tasks}
                sessions={sessions}
                onViewTasks={() => setCurrentTab('tasks')}
              />
              <DataBackup data={fullData} onImportData={handleImportData} />
            </div>
          )}
        </div>
      </main>

      {/* Mobile Tab Bar */}
      <MobileTabBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeTaskCount={activeTaskCount}
      />
    </div>
  );
}
