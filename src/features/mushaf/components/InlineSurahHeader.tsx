import React from 'react';
import { useSurahData } from '../../../hooks/useSurahData.ts';

interface InlineSurahHeaderProps {
    surahId: number;
}

/**
 * Inline header displayed at the start of a new surah in Juz mode.
 * Shows surah number, name (Arabic and translation), verse count, and revelation type.
 */
export const InlineSurahHeader: React.FC<InlineSurahHeaderProps> = ({ surahId }) => {
    const { surahs: SURAH_DATA, arabicNames: ARABIC_SURAH_NAMES } = useSurahData();
    const surah = SURAH_DATA.find(s => s.number === surahId);
    if (!surah) return null;

    return (
        <div className="relative mx-4 md:mx-8 mt-12 mb-8 overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm group transition-all hover:shadow-md">
            {/* Decorative Side Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-teal-400 to-emerald-600"></div>

            <div className="relative p-5 pl-7 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Number Badge */}
                    <div className="relative w-12 h-12 shrink-0 flex items-center justify-center bg-teal-50 dark:bg-teal-900/30 rounded-xl text-teal-600 dark:text-teal-400">
                        <span className="relative text-lg font-bold font-sans z-10">{surah.number}</span>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">
                            {surah.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span className="font-medium text-teal-600 dark:text-teal-400">{surah.arti}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                            <span>{surah.verses} Ayat</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                            <span className="uppercase tracking-wider text-[10px]">{surah.type}</span>
                        </div>
                    </div>
                </div>

                <div className="text-right pl-2">
                    <span className="font-arabic text-3xl md:text-4xl text-slate-700 dark:text-slate-300 opacity-90" style={{ fontFamily: '"Amiri", serif' }}>
                        {ARABIC_SURAH_NAMES[surah.name] || surah.name}
                    </span>
                </div>
            </div>
        </div>
    );
};
