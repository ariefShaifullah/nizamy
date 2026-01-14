import React, { useMemo } from 'react';
import { getDynamicHadith, getGregorianDate } from '../constants.ts';

export const HeaderSection: React.FC = () => {
    const hadith = useMemo(() => getDynamicHadith(), []);

    return (
        <div className="flex flex-col mb-10 animate-fade-in-down relative px-1">
            <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    {getGregorianDate()}
                </span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
            </div>
            <div className="relative z-raised">
                <p className="text-xl md:text-2xl font-serif text-slate-800 dark:text-slate-200 leading-relaxed tracking-tight">
                    <span className="text-slate-300 dark:text-slate-700 text-4xl font-serif mr-2 relative top-2">"</span>
                    {hadith.text}
                </p>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-4 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-4 h-px bg-slate-300 dark:bg-slate-700"></span> {hadith.narrator}
                </p>
            </div>
        </div>
    );
};
