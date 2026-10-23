'use client';

import React, { useRef, useState } from 'react';
import { Download, Upload, Check, AlertCircle } from 'lucide-react';
import { FocusBoardData } from '@/lib/types';
import { exportDataAsJSON } from '@/lib/utils';

interface DataBackupProps {
  data: FocusBoardData;
  onImportData: (imported: FocusBoardData) => void;
}

export function DataBackup({ data, onImportData }: DataBackupProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(
    null
  );

  const handleExport = () => {
    try {
      exportDataAsJSON(data);
      setStatusMessage({ text: 'Data exported successfully!' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      setStatusMessage({ text: 'Failed to export data.', isError: true });
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed || !Array.isArray(parsed.tasks)) {
          throw new Error('Invalid FocusBoard JSON format');
        }

        onImportData(parsed);
        setStatusMessage({ text: `Successfully imported ${parsed.tasks.length} tasks!` });
        setTimeout(() => setStatusMessage(null), 3500);
      } catch (err) {
        console.error('Import parse error:', err);
        setStatusMessage({
          text: 'Invalid file format. Please upload a valid FocusBoard JSON backup.',
          isError: true,
        });
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="p-6 bg-white dark:bg-[#151821] border border-[#f0f0f4] dark:border-[#212634] rounded-2xl shadow-2xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold text-[#1c1d22] dark:text-white uppercase tracking-wider">
            Data Backup & Restore
          </h3>
          <p className="text-xs text-[#a0a5b5] font-medium mt-0.5">
            Export your tasks and pomodoro sessions as a JSON file, or restore anytime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#1c1d22] dark:text-white bg-[#f4f5f8] hover:bg-[#eaecef] dark:bg-[#181c28] dark:hover:bg-[#252b3d] rounded-full transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#e0891d] dark:text-[#f3a838] bg-[#fef6e9] hover:bg-[#fde8c5] dark:bg-[#f3a838]/15 dark:hover:bg-[#f3a838]/25 rounded-full transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`mt-4 flex items-center gap-2 text-xs p-3 rounded-xl font-medium ${
            statusMessage.isError
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
          }`}
        >
          {statusMessage.isError ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <Check className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
}
