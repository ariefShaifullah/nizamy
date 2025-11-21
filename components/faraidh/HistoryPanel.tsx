import React from 'react';
import type { HistoryEntry } from '../../types.ts';
import { formatCurrency } from '../../utils.ts';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onLoad: (entry: HistoryEntry) => void;
  onClear: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = React.memo(({ history, onLoad, onClear }) => {
    if (history.length === 0) {
        return null;
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Riwayat Perhitungan</h3>
                <button onClick={onClear} className="text-sm font-medium text-red-600 hover:text-red-500">
                    Hapus
                </button>
            </div>
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {history.map(entry => (
                    <li key={entry.id}>
                        <button onClick={() => onLoad(entry)} className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                            <p className="font-semibold text-primary-700">
                                {formatCurrency(entry.estate)}
                            </p>
                            <p className="text-xs text-slate-500">{entry.timestamp}</p>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
});
