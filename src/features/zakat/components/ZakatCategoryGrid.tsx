import React from 'react';
import type { ZakatTab } from '../types.ts';

interface ZakatCategoryGridProps {
    tabs: { id: string; label: string; icon: string }[];
    activeTab: string;
    onSelect: (id: string) => void;
}

export const ZakatCategoryGrid: React.FC<ZakatCategoryGridProps> = ({ tabs, activeTab, onSelect }) => {
    // Filter out 'summary' from the grid as it's usually handled by a separate action button on mobile
    const displayTabs = tabs.filter(t => t.id !== 'summary');

    return (
        <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in px-1">
            {displayTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onSelect(tab.id)}
                        className={`group flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-95 aspect-square ${isActive
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200/50 dark:shadow-none'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
                            }`}
                    >
                        <div className="w-10 h-10 mb-2 flex items-center justify-center filter drop-shadow-sm transition-transform group-hover:scale-110">
                            {tab.icon.startsWith('/') ? <img src={tab.icon} alt={tab.label} className="w-full h-full object-contain" /> : <span className="text-2xl">{tab.icon}</span>}
                        </div>
                        <span className={`text-[10px] sm:text-xs font-bold ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};
