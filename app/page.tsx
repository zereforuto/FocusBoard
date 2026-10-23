'use client';

import dynamic from 'next/dynamic';

const Dashboard = dynamic(
  () => import('@/components/Dashboard').then((mod) => mod.Dashboard),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading FocusBoard...</p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return <Dashboard />;
}
