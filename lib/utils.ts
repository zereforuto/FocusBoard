import { FocusBoardData, Task } from './types';

/**
 * Checks if a date string (YYYY-MM-DD) matches today in local time.
 */
export function isToday(dateString?: string): boolean {
  if (!dateString) return false;
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  return dateString.startsWith(todayStr);
}

/**
 * Get date string for today in YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for friendly display
 */
export function formatFriendlyDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    }
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Generates initial sample tasks for an onboarding experience
 */
export function getInitialTasks(): Task[] {
  const today = getTodayDateString();
  return [
    {
      id: 'task-1',
      title: 'Complete project planning document',
      completed: false,
      dueDate: today,
      priority: 'high',
      completedSessions: 2,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      title: 'Review pull requests & respond to team',
      completed: false,
      dueDate: today,
      priority: 'medium',
      completedSessions: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      title: 'Set up FocusBoard workflow & customize theme',
      completed: true,
      dueDate: today,
      priority: 'low',
      completedSessions: 1,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      completedAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      title: 'Brainstorm design system improvements',
      completed: false,
      priority: 'medium',
      completedSessions: 0,
      createdAt: new Date().toISOString(),
    },
  ];
}

/**
 * Generates initial mock session history for past 7 days to showcase chart
 */
export function getInitialSessions() {
  const sessions = [];
  const now = new Date();

  // Create some realistic history across past 7 days
  const dailyMins = [25, 50, 75, 50, 25, 75, 50]; // last 7 days distribution
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const count = Math.floor(dailyMins[6 - i] / 25);
    for (let c = 0; c < count; c++) {
      sessions.push({
        id: `init-session-${i}-${c}`,
        durationMinutes: 25,
        completedAt: d.toISOString(),
        mode: 'work' as const,
      });
    }
  }

  return sessions;
}

/**
 * Triggers browser download of FocusBoard data
 */
export function exportDataAsJSON(data: FocusBoardData) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = getTodayDateString();
  a.download = `focusboard-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
