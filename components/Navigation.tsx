'use client';

import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  BarChart3,
  Moon,
  Sun,
  Laptop,
  RotateCcw,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

export type NavTab = 'dashboard' | 'tasks' | 'timer' | 'stats';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeTaskCount: number;
  onResetAllData?: () => void;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  activeTaskCount,
  onResetAllData,
}: NavigationProps) {
  const { theme, setTheme } = useTheme();

  const menuItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'tasks',
      label: 'My Tasks',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: activeTaskCount > 0 ? activeTaskCount : undefined,
    },
    {
      id: 'timer',
      label: 'Focus Timer',
      icon: <Timer className="w-4 h-4" />,
    },
    {
      id: 'stats',
      label: 'Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-[#ececf2] dark:border-[#1e2230] bg-white dark:bg-[#12151e] h-screen sticky top-0 px-5 py-7 justify-between select-none z-20 transition-colors">
      <div>
        {/* Brand: Circular logo with bold title like M TASKMEMBER */}
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-8 h-8 rounded-full bg-[#f3a838] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            F
          </div>
          <span className="font-extrabold text-[15px] tracking-wide text-[#1c1d22] dark:text-white uppercase font-sans">
            FOCUSBOARD
          </span>
        </div>

        {/* Section: MENU */}
        <div className="mb-6">
          <p className="px-3 text-[11px] font-bold text-[#a0a5b5] dark:text-[#656c80] uppercase tracking-wider mb-3">
            MENU
          </p>
          <nav className="space-y-1" aria-label="Main Navigation">
            {menuItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                    isActive
                      ? 'bg-[#fef6e9] text-[#e0891d] dark:bg-[#f3a838]/15 dark:text-[#f3a838]'
                      : 'text-[#6f7384] dark:text-[#8e95ab] hover:text-[#1c1d22] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        isActive ? 'text-[#e0891d] dark:text-[#f3a838]' : 'text-[#9ea4b5]'
                      }
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${
                        isActive
                          ? 'bg-[#f3a838] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-[#6f7384] dark:text-[#8e95ab]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section: APPEARANCE */}
        <div>
          <p className="px-3 text-[11px] font-bold text-[#a0a5b5] dark:text-[#656c80] uppercase tracking-wider mb-3">
            APPEARANCE
          </p>
          <div className="grid grid-cols-3 gap-1 bg-[#f4f5f8] dark:bg-[#181c28] p-1 rounded-xl">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center py-2 rounded-lg text-xs transition-colors ${
                theme === 'light'
                  ? 'bg-white dark:bg-[#252b3d] text-[#1c1d22] dark:text-white shadow-xs font-semibold'
                  : 'text-[#8b8f9e] hover:text-[#1c1d22] dark:hover:text-white'
              }`}
              title="Light theme"
              aria-label="Light theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center py-2 rounded-lg text-xs transition-colors ${
                theme === 'dark'
                  ? 'bg-white dark:bg-[#252b3d] text-[#1c1d22] dark:text-white shadow-xs font-semibold'
                  : 'text-[#8b8f9e] hover:text-[#1c1d22] dark:hover:text-white'
              }`}
              title="Dark theme"
              aria-label="Dark theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`flex items-center justify-center py-2 rounded-lg text-xs transition-colors ${
                theme === 'system'
                  ? 'bg-white dark:bg-[#252b3d] text-[#1c1d22] dark:text-white shadow-xs font-semibold'
                  : 'text-[#8b8f9e] hover:text-[#1c1d22] dark:hover:text-white'
              }`}
              title="System preference"
              aria-label="System preference"
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Clean, sleek bottom reset button (no Next.js badge collision) */}
      <div className="pt-4 border-t border-[#f0f0f4] dark:border-[#1e2230]">
        <button
          onClick={() => {
            if (onResetAllData) {
              if (window.confirm('Reset sample data to fresh initial state?')) {
                onResetAllData();
              }
            }
          }}
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#8b8f9e] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors w-full"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Data</span>
        </button>
      </div>
    </aside>
  );
}

export function MobileTabBar({ currentTab, onSelectTab, activeTaskCount }: NavigationProps) {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'tasks',
      label: 'My Tasks',
      icon: <CheckSquare className="w-5 h-5" />,
      badge: activeTaskCount > 0 ? activeTaskCount : undefined,
    },
    {
      id: 'timer',
      label: 'Timer',
      icon: <Timer className="w-5 h-5" />,
    },
    {
      id: 'stats',
      label: 'Stats',
      icon: <BarChart3 className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#12151e]/95 backdrop-blur-lg border-t border-[#ececf2] dark:border-[#1e2230] px-3 py-2 flex items-center justify-around shadow-lg"
      aria-label="Mobile Navigation"
    >
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg relative text-xs font-semibold transition-colors ${
              isActive
                ? 'text-[#f3a838]'
                : 'text-[#8b8f9e] hover:text-[#1c1d22] dark:hover:text-white'
            }`}
          >
            <div className="relative">
              {tab.icon}
              {tab.badge !== undefined && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#f3a838] text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="mt-1 text-[11px]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
