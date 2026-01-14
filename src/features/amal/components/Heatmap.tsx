
import React, { useMemo } from 'react';
import type { DailyAmalLog } from '../types.ts';

interface HeatmapProps {
    data: DailyAmalLog[];
}

const getColorClass = (score: number) => {
    if (score === 0) return 'bg-slate-100 dark:bg-slate-700/50';
    if (score <= 25) return 'bg-emerald-200 dark:bg-emerald-900/60';
    if (score <= 50) return 'bg-emerald-300 dark:bg-emerald-800/80';
    if (score <= 75) return 'bg-emerald-400 dark:bg-emerald-600';
    return 'bg-emerald-500 dark:bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
};

export const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
    // Show last 5 months approx (150 days) for desktop sidebar
    // On mobile we might hide or show less via CSS logic if needed, but flex wrap handles it.
    const displayData = useMemo(() => {
        const daysToShow = 147; // 21 weeks (7 * 21)
        return data.slice(-daysToShow);
    }, [data]);

    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-4 relative z-10">
                <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Konsistensi
                </h3>
            </div>
            
            <div className="flex flex-wrap gap-1.5 content-start relative z-10">
                {displayData.map((log) => (
                    <div
                        key={log.date}
                        className={`w-2.5 h-2.5 rounded-[3px] transition-all duration-300 hover:scale-150 cursor-help ${getColorClass(log.totalScore)}`}
                        title={`${new Date(log.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}: Skor ${log.totalScore}%`}
                    ></div>
                ))}
                {/* Fill empty slots visually if needed */}
                {Array.from({ length: Math.max(0, 147 - displayData.length) }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="w-2.5 h-2.5 rounded-[3px] bg-slate-50 dark:bg-slate-800/30"></div>
                ))}
            </div>
            
            <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Jarang</span>
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-100 dark:bg-slate-700 rounded-[1px]"></div>
                    <div className="w-2 h-2 bg-emerald-300 dark:bg-emerald-700 rounded-[1px]"></div>
                    <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-500 rounded-[1px]"></div>
                </div>
                <span>Rutin</span>
            </div>
        </div>
    );
};
