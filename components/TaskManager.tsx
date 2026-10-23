'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Calendar,
  GripVertical,
  CheckCircle2,
  CheckSquare,
  Circle,
  Trash2,
  Edit2,
  Play,
  Flame,
  Check,
  X,
} from 'lucide-react';
import { Task, Priority, FilterType } from '@/lib/types';
import { isToday, formatFriendlyDate } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface TaskManagerProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedSessions'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onReorderTasks: (newTasks: Task[]) => void;
  onStartFocusOnTask: (taskId: string) => void;
  activeTimerTaskId?: string | null;
}

export function TaskManager({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onReorderTasks,
  onStartFocusOnTask,
  activeTimerTaskId,
}: TaskManagerProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');

  // Edit task form state
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('medium');

  // Drag-and-drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleStartAdd = () => {
    setIsAdding(true);
    setNewTitle('');
    setNewDueDate('');
    setNewPriority('medium');
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      dueDate: newDueDate || undefined,
      priority: newPriority,
      completed: false,
    });

    setNewTitle('');
    setNewDueDate('');
    setNewPriority('medium');
    setIsAdding(false);
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDueDate(task.dueDate || '');
    setEditPriority(task.priority);
  };

  const handleSaveEdit = (id: string) => {
    if (!editTitle.trim()) return;
    onUpdateTask(id, {
      title: editTitle.trim(),
      dueDate: editDueDate || undefined,
      priority: editPriority,
    });
    setEditingTaskId(null);
  };

  const handleToggleComplete = (task: Task) => {
    const nextCompleted = !task.completed;
    onUpdateTask(task.id, {
      completed: nextCompleted,
      completedAt: nextCompleted ? new Date().toISOString() : undefined,
    });

    if (nextCompleted) {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#f3a838', '#2dd4bf', '#2e3444', '#10b981'],
        });
      } catch {
        // Fallback
      }
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!task.title.toLowerCase().includes(q)) return false;
    }

    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    if (filter === 'today') return isToday(task.dueDate);
    return true;
  });

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const draggedItem = filteredTasks[draggedIndex];
    const targetItem = filteredTasks[dragOverIndex];

    const actualDraggedIdx = tasks.findIndex((t) => t.id === draggedItem.id);
    const actualTargetIdx = tasks.findIndex((t) => t.id === targetItem.id);

    if (actualDraggedIdx !== -1 && actualTargetIdx !== -1) {
      const updated = [...tasks];
      const [removed] = updated.splice(actualDraggedIdx, 1);
      updated.splice(actualTargetIdx, 0, removed);
      onReorderTasks(updated);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/50';
      case 'medium':
        return 'bg-[#fef6e9] text-[#e0891d] dark:bg-[#f3a838]/15 dark:text-[#f3a838] border-[#fde8c5] dark:border-[#f3a838]/30';
      case 'low':
        return 'bg-[#ecfdf5] text-[#059669] dark:bg-[#059669]/15 dark:text-[#34d399] border-[#a7f3d0] dark:border-[#059669]/30';
    }
  };

  return (
    <div className="space-y-5">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-5 pr-10 py-2.5 bg-[#f0f0f4] dark:bg-[#181c28] border-none rounded-full text-xs placeholder:text-[#a0a5b5] text-[#1c1d22] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#f3a838]/30 transition-all font-medium"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a0a5b5] hover:text-[#1c1d22] dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[#a0a5b5] pointer-events-none" />
          )}
        </div>

        <button
          onClick={handleStartAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#f3a838] hover:bg-[#e0891d] text-white text-xs font-bold rounded-full shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Pills with numbers */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {(
          [
            { id: 'all', label: 'All Tasks', count: tasks.length },
            {
              id: 'active',
              label: 'Active',
              count: tasks.filter((t) => !t.completed).length,
            },
            {
              id: 'today',
              label: 'Due Today',
              count: tasks.filter((t) => isToday(t.dueDate) && !t.completed).length,
            },
            {
              id: 'completed',
              label: 'Completed',
              count: tasks.filter((t) => t.completed).length,
            },
          ] as { id: FilterType; label: string; count: number }[]
        ).map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#1c1d22] text-white dark:bg-white dark:text-[#1c1d22]'
                  : 'bg-[#f4f5f8] dark:bg-[#181c28] text-[#8b8f9e] hover:text-[#1c1d22] dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-white/20 dark:bg-black/20'
                    : 'bg-[#e5e7eb] dark:bg-[#252b3d] text-[#6b7280]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Add Task Card / Inline Expansion */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, y: -8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            onSubmit={handleSaveNew}
            className="p-5 bg-white dark:bg-[#151821] border border-[#ececf2] dark:border-[#212634] rounded-2xl shadow-md space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#1c1d22] dark:text-white uppercase tracking-wider">
                Create New Task
              </h3>
              <button
                type="button"
                onClick={handleCancelAdd}
                className="text-[#a0a5b5] hover:text-[#1c1d22] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <input
                type="text"
                required
                autoFocus
                placeholder="What are you working on next?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#f4f5f8] dark:bg-[#181c28] border-none rounded-xl text-xs text-[#1c1d22] dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#f3a838]/40"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-[#6f7384] dark:text-[#8e95ab] bg-[#f4f5f8] dark:bg-[#181c28] px-3 py-1.5 rounded-xl font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#a0a5b5]" />
                <span>Due:</span>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="bg-transparent text-xs text-[#1c1d22] dark:text-white outline-hidden font-semibold"
                />
              </div>

              <div className="flex items-center gap-1 text-xs text-[#6f7384] dark:text-[#8e95ab] font-medium">
                <span>Priority:</span>
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setNewPriority(p)}
                    className={`px-3 py-1 rounded-full capitalize font-bold text-[11px] transition-all border ${
                      newPriority === p
                        ? p === 'high'
                          ? 'bg-rose-500 text-white border-rose-500'
                          : p === 'medium'
                          ? 'bg-[#f3a838] text-white border-[#f3a838]'
                          : 'bg-emerald-500 text-white border-emerald-500'
                        : 'border-[#e2e8f0] dark:border-[#2b3144] text-[#8b8f9e] hover:bg-[#f4f5f8] dark:hover:bg-[#181c28]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#f0f0f4] dark:border-[#212634]">
              <button
                type="button"
                onClick={handleCancelAdd}
                className="px-4 py-1.5 text-xs font-semibold text-[#8b8f9e] hover:text-[#1c1d22] dark:hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 text-xs font-bold text-white bg-[#f3a838] hover:bg-[#e0891d] rounded-full shadow-xs transition-colors"
              >
                Save Task
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Task List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 px-4 border border-dashed border-[#ececf2] dark:border-[#212634] rounded-2xl bg-[#fafafa] dark:bg-[#12151e]/50"
            >
              <div className="w-10 h-10 mx-auto rounded-full bg-[#f4f5f8] dark:bg-[#181c28] flex items-center justify-center text-[#a0a5b5] mb-3">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-[#1c1d22] dark:text-white uppercase tracking-wider">
                No tasks found
              </h4>
              <p className="text-xs text-[#a0a5b5] mt-1 font-medium">
                {searchQuery
                  ? 'No tasks matched your search query.'
                  : filter === 'completed'
                  ? 'No completed tasks yet.'
                  : 'Start by clicking "New Task" above.'}
              </p>
            </motion.div>
          ) : (
            filteredTasks.map((task, index) => {
              const isEditing = editingTaskId === task.id;
              const isTimerLinked = activeTimerTaskId === task.id;
              const isDueToday = isToday(task.dueDate);
              const isDragged = draggedIndex === index;
              const isOver = dragOverIndex === index;

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  draggable={!isEditing}
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className={`group relative flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                    isDragged ? 'opacity-40 scale-98 border-[#f3a838]' : ''
                  } ${
                    isOver ? 'border-t-2 border-t-[#f3a838]' : ''
                  } ${
                    task.completed
                      ? 'bg-[#fcfcfd] dark:bg-[#12151e]/60 border-[#ececf2]/60 dark:border-[#212634]/60 opacity-60'
                      : 'bg-white dark:bg-[#151821] border-[#f0f0f4] dark:border-[#212634] shadow-2xs hover:border-[#dedee6] dark:hover:border-[#2f3547]'
                  }`}
                >
                  {/* Grip Handle */}
                  <div
                    className="cursor-grab active:cursor-grabbing text-[#c2c5d0] dark:text-[#4a5063] hover:text-[#8b8f9e] pt-0.5"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Completion Toggle */}
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="pt-0.5 text-[#c2c5d0] hover:text-[#f3a838] transition-colors focus:outline-hidden"
                    title={task.completed ? 'Mark incomplete' : 'Mark completed'}
                    aria-label={task.completed ? 'Mark incomplete' : 'Mark completed'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-[#2dd4bf] fill-[#2dd4bf]/20" />
                    ) : (
                      <Circle className="w-5 h-5 hover:stroke-[#f3a838]" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs font-semibold bg-[#f4f5f8] dark:bg-[#181c28] border border-[#f3a838] rounded-lg focus:outline-hidden text-[#1c1d22] dark:text-white"
                          autoFocus
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="date"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                            className="text-xs bg-[#f4f5f8] dark:bg-[#181c28] px-2 py-1 rounded-md border border-[#ececf2] dark:border-[#2b3144] text-[#1c1d22] dark:text-white font-medium"
                          />
                          <select
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value as Priority)}
                            className="text-xs bg-[#f4f5f8] dark:bg-[#181c28] px-2 py-1 rounded-md border border-[#ececf2] dark:border-[#2b3144] capitalize text-[#1c1d22] dark:text-white font-medium"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                          <div className="ml-auto flex gap-1">
                            <button
                              onClick={() => setEditingTaskId(null)}
                              className="p-1 text-[#8b8f9e] hover:text-[#1c1d22] dark:hover:text-white rounded-md"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSaveEdit(task.id)}
                              className="p-1 bg-[#f3a838] text-white rounded-md hover:bg-[#e0891d]"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p
                          className={`text-xs font-semibold transition-all leading-snug break-words ${
                            task.completed
                              ? 'line-through text-[#a0a5b5] dark:text-[#656c80]'
                              : 'text-[#1c1d22] dark:text-white'
                          }`}
                        >
                          {task.title}
                        </p>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${getPriorityBadge(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>

                          {task.dueDate && (
                            <span
                              className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isDueToday
                                  ? 'bg-[#fef6e9] text-[#e0891d] dark:bg-[#f3a838]/15 dark:text-[#f3a838] border border-[#fde8c5] dark:border-[#f3a838]/30'
                                  : 'bg-[#f4f5f8] dark:bg-[#181c28] text-[#8b8f9e] border border-[#ececf2] dark:border-[#212634]'
                              }`}
                            >
                              <Calendar className="w-3 h-3" />
                              {isDueToday ? 'Today' : formatFriendlyDate(task.dueDate)}
                            </span>
                          )}

                          {task.completedSessions > 0 && (
                            <span
                              className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef6e9] text-[#e0891d] dark:bg-[#f3a838]/15 dark:text-[#f3a838] border border-[#fde8c5] dark:border-[#f3a838]/30"
                              title={`${task.completedSessions} pomodoro(s)`}
                            >
                              <Flame className="w-3 h-3 text-[#f3a838]" />
                              <span>{task.completedSessions}</span>
                            </span>
                          )}

                          {isTimerLinked && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-[#2dd4bf] animate-pulse">
                              Active in Focus
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      {!task.completed && (
                        <button
                          onClick={() => onStartFocusOnTask(task.id)}
                          className="p-1.5 text-[#8b8f9e] hover:text-[#f3a838] hover:bg-[#fef6e9] dark:hover:bg-[#f3a838]/20 rounded-lg transition-colors"
                          title="Focus on this task in Timer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      )}
                      <button
                        onClick={() => handleStartEdit(task)}
                        className="p-1.5 text-[#8b8f9e] hover:text-[#1c1d22] dark:hover:text-white hover:bg-[#f4f5f8] dark:hover:bg-[#181c28] rounded-lg transition-colors"
                        title="Edit task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 text-[#8b8f9e] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
