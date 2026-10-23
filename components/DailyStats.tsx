'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ArrowUpRight } from 'lucide-react';
import { FocusSessionLog, Task } from '@/lib/types';
import { isToday } from '@/lib/utils';
import { useTheme } from './ThemeProvider';

interface DailyStatsProps {
  tasks: Task[];
  sessions: FocusSessionLog[];
  onViewTasks?: () => void;
}

export function DailyStats({ tasks, sessions, onViewTasks }: DailyStatsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Completion percentage and metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 85;

  const tasksCompletedToday = useMemo(() => {
    return tasks.filter((t) => t.completed && isToday(t.completedAt)).length;
  }, [tasks]);

  const focusMinutesToday = useMemo(() => {
    return sessions
      .filter((s) => s.mode === 'work' && isToday(s.completedAt))
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);
  }, [sessions]);

  // Priority completion rates with sensible defaults if empty
  const highPriorityTasks = tasks.filter((t) => t.priority === 'high');
  const highPriorityDone = highPriorityTasks.filter((t) => t.completed).length;
  const highPriorityRate =
    highPriorityTasks.length > 0
      ? Math.round((highPriorityDone / highPriorityTasks.length) * 100)
      : 85;

  const medTasks = tasks.filter((t) => t.priority === 'medium');
  const medDone = medTasks.filter((t) => t.completed).length;
  const medRate = medTasks.length > 0 ? Math.round((medDone / medTasks.length) * 100) : 92;

  // 12-point trend data matching the reference line chart (01 - 12)
  const lineChartData = useMemo(() => {
    const points = [
      { day: '01', focus: 35, tasks: 22 },
      { day: '02', focus: 45, tasks: 18 },
      { day: '03', focus: 22, tasks: 42 },
      { day: '04', focus: 40, tasks: 38 },
      { day: '05', focus: 35, tasks: 24 },
      { day: '06', focus: 42, tasks: 65 },
      { day: '07', focus: 45, tasks: 40 },
      { day: '08', focus: 46, tasks: 48 },
      { day: '09', focus: 32, tasks: 26 },
      { day: '10', focus: 48, tasks: 38 },
      { day: '11', focus: 48, tasks: 42 },
      { day: '12', focus: 38, tasks: 32 },
    ];

    if (focusMinutesToday > 0) {
      points[11].focus = Math.min(70, Math.max(30, focusMinutesToday));
    }
    if (tasksCompletedToday > 0) {
      points[11].tasks = Math.min(80, 20 + tasksCompletedToday * 15);
    }

    return points;
  }, [focusMinutesToday, tasksCompletedToday]);

  // Working Hours (7 days) stacked / dual bar chart data matching the bottom right of reference
  const workingHoursData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, idx) => ({
      day,
      deepFocus:
        idx === 6
          ? Math.min(6, Math.max(2, focusMinutesToday / 30))
          : [3.8, 4.2, 4.0, 4.5, 3.9, 2.5, 3.5][idx],
      regularWork: [2.5, 2.8, 3.0, 2.7, 2.9, 1.5, 2.0][idx],
    }));
  }, [focusMinutesToday]);

  return (
    <div className="space-y-10">
      {/* Top Banner: Average performance with 90% ^ 21% vs last week + View Report */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-[#1c1d22] dark:text-white tracking-tight">
              Average performance
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-3xl md:text-4xl font-black text-[#1c1d22] dark:text-white">
                {taskCompletionRate}%
              </span>
              <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ecfdf5] text-[#10b981] dark:bg-[#10b981]/20 dark:text-[#34d399]">
                <ArrowUpRight className="w-3.5 h-3.5" />
                21%
              </span>
              <span className="text-xs text-[#a0a5b5] font-semibold">vs last week</span>
            </div>
            <p className="text-xs text-[#8b8f9e] dark:text-[#798094] mt-1.5 font-medium">
              Productivity hours from 1-12 {new Date().toLocaleString('default', { month: 'short' })}, 2026
            </p>
          </div>

          <div>
            <button
              onClick={onViewTasks}
              className="px-5 py-2.5 bg-[#f0f0f4] hover:bg-[#e4e4ea] dark:bg-[#1e2230] dark:hover:bg-[#282e42] text-[#1c1d22] dark:text-white text-xs font-bold rounded-xl transition-all shadow-2xs"
            >
              View Report
            </button>
          </div>
        </div>

        {/* Dual Line Chart (Teal & Amber) */}
        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData} margin={{ top: 15, right: 15, left: -25, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke={isDark ? '#212634' : '#f0f0f4'}
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                stroke={isDark ? '#656c80' : '#a0a5b5'}
                fontSize={12}
                fontWeight={600}
              />
              <YAxis tickLine={false} axisLine={false} stroke="transparent" fontSize={11} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="p-3 bg-white dark:bg-[#1c202c] border border-[#ececf2] dark:border-[#2b3144] rounded-xl shadow-lg text-xs space-y-1">
                        <p className="font-bold text-[#1c1d22] dark:text-white">
                          Day {payload[0].payload.day}
                        </p>
                        <p className="text-[#2dd4bf] font-bold">Focus Score: {payload[0].value}</p>
                        <p className="text-[#f3a838] font-bold">Tasks: {payload[1]?.value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="focus"
                stroke="#2dd4bf"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, stroke: '#2dd4bf', strokeWidth: 2, fill: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="tasks"
                stroke="#f3a838"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, stroke: '#f3a838', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs text-[#8b8f9e] font-semibold pt-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f3a838]" />
            <span>Last 6 days (Tasks)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2dd4bf]" />
            <span>Last 6 days (Focus Time)</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Task Complete Circular Infographic + Working Hours Bar Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#f0f0f4] dark:border-[#1e2230]">
        {/* Left: Task Complete with crisp SVG proportional circles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#1c1d22] dark:text-white">
                Task Complete
              </h3>
              <p className="text-xs text-[#a0a5b5] font-medium mt-0.5">
                Average task complete this week
              </p>
            </div>
            <button
              onClick={onViewTasks}
              className="text-xs font-bold text-[#a0a5b5] hover:text-[#1c1d22] dark:hover:text-white"
            >
              See all
            </button>
          </div>

          {/* SVG Proportional Circles matching reference graphic */}
          <div className="w-full h-56 flex items-center justify-center select-none bg-white/50 dark:bg-[#151821]/50 rounded-2xl p-2 border border-[#f0f0f4] dark:border-[#1e2230]">
            <svg viewBox="0 0 380 200" className="w-full h-full max-w-sm">
              {/* Dark Charcoal Circle: High Priority / Engineer Team */}
              <g>
                <circle
                  cx="120"
                  cy="75"
                  r="56"
                  className="fill-[#2e3444] stroke-[#475569] dark:stroke-[#5b6882]"
                  strokeWidth="2"
                />
                <text
                  x="120"
                  y="72"
                  textAnchor="middle"
                  className="fill-white font-extrabold text-sm"
                  fontSize="15"
                >
                  {highPriorityRate}%
                </text>
                <text
                  x="120"
                  y="88"
                  textAnchor="middle"
                  className="fill-slate-300 font-medium"
                  fontSize="10"
                >
                  High Priority
                </text>
              </g>

              {/* Teal Translucent Circle: Focus Tasks / Marketing Team */}
              <g>
                <circle
                  cx="125"
                  cy="125"
                  r="58"
                  className="fill-[#2dd4bf]/25 stroke-[#2dd4bf]"
                  strokeWidth="2.5"
                />
                <text
                  x="125"
                  y="122"
                  textAnchor="middle"
                  className="fill-[#0f766e] dark:fill-[#2dd4bf] font-extrabold text-sm"
                  fontSize="15"
                >
                  {medRate}%
                </text>
                <text
                  x="125"
                  y="138"
                  textAnchor="middle"
                  className="fill-[#0f766e] dark:fill-[#5eead4] font-medium"
                  fontSize="10"
                >
                  Focus Tasks
                </text>
              </g>

              {/* Amber Large Circle: Overall Done / Product Team */}
              <g>
                <circle
                  cx="255"
                  cy="100"
                  r="72"
                  className="fill-[#f3a838]/20 stroke-[#f3a838]"
                  strokeWidth="2.5"
                />
                <text
                  x="255"
                  y="98"
                  textAnchor="middle"
                  className="fill-[#b45309] dark:fill-[#f3a838] font-black"
                  fontSize="22"
                >
                  {taskCompletionRate}%
                </text>
                <text
                  x="255"
                  y="118"
                  textAnchor="middle"
                  className="fill-[#92400e] dark:fill-[#fde68a] font-bold"
                  fontSize="11"
                >
                  Overall Done
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Right: Working Hours Bar Chart with Rounded Pills */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#1c1d22] dark:text-white">
                Working Hours
              </h3>
              <p className="text-xs text-[#a0a5b5] font-medium mt-0.5">
                Average team working this week
              </p>
            </div>
            <button
              onClick={onViewTasks}
              className="text-xs font-bold text-[#a0a5b5] hover:text-[#1c1d22] dark:hover:text-white"
            >
              See all
            </button>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={workingHoursData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                barSize={14}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke={isDark ? '#212634' : '#f0f0f4'}
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  stroke={isDark ? '#656c80' : '#a0a5b5'}
                  fontSize={11}
                  fontWeight={600}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke={isDark ? '#656c80' : '#a0a5b5'}
                  fontSize={11}
                  unit=" hr"
                  domain={[0, 8]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2.5 bg-white dark:bg-[#1c202c] border border-[#ececf2] dark:border-[#2b3144] rounded-xl shadow-md text-xs space-y-1">
                          <p className="font-bold text-[#1c1d22] dark:text-white">
                            {payload[0].payload.day}
                          </p>
                          <p className="text-[#2dd4bf] font-bold">
                            Deep Focus: {payload[0].value} hrs
                          </p>
                          <p className="text-[#2e3444] dark:text-slate-300 font-bold">
                            Active Work: {payload[1]?.value} hrs
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="deepFocus" stackId="a" fill="#2dd4bf" radius={[0, 0, 0, 0]} />
                <Bar
                  dataKey="regularWork"
                  stackId="a"
                  fill={isDark ? '#475569' : '#2e3444'}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
