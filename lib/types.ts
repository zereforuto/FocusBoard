export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string; // YYYY-MM-DD
  priority: Priority;
  completedSessions: number; // completed pomodoro sessions for this task
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
}

export type FilterType = 'all' | 'active' | 'completed' | 'today';

export type PomodoroMode = 'work' | 'break';

export interface FocusSessionLog {
  id: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  completedAt: string; // ISO string
  mode: PomodoroMode;
}

export interface FocusBoardData {
  version: number;
  tasks: Task[];
  sessions: FocusSessionLog[];
  settings?: {
    workDurationMinutes?: number;
    breakDurationMinutes?: number;
    soundEnabled?: boolean;
    notificationsEnabled?: boolean;
  };
}
