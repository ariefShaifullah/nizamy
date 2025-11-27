import React from 'react';
import type { HistoryEntry } from '../../../types.ts';
import { formatCurrency } from '../../../utils.ts';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onLoad: (entry: HistoryEntry) => void;
  onClear: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = React.memo(
  ({ history, onLoad, onClear }) => {
    if (history.length === 0) {
      return null;
    }

    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 transition-colors">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Riwayat Perhitungan
          </h3>
          <button
            onClick={onClear}
            className="text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
          >
            Hapus
          </button>
        </div>
        <ul className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {history.map((entry) => (
            <li key={entry.id}>
              <button
                onClick={() => onLoad(entry)}
                className="w-full text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600"
              >
                <p className="font-semibold text-primary-700 dark:text-primary-400">
                  {formatCurrency(entry.estate)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {entry.timestamp}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
);