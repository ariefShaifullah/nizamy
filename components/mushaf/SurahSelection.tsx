
import React, { useState, useMemo } from 'react';
import { SURAH_DATA } from '../../constants.ts';
import { FaSearch, FaArrowRight } from 'react-icons/fa';
import { useDebounce } from '../../hooks/useDebounce.ts';
import type { LastReadState } from '../../types.ts';

const QUICK_LINKS = [
    { number: 18, label: 'Al-Kahfi', icon: '⛰️', gradient: 'from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40', text: 'text-amber-800 dark:text-amber-200' },
    { number: 36, label: 'Ya-Sin', icon: '❤️', gradient: 'from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40', text: 'text-rose-800 dark:text-rose-200' },
    { number: 55, label: 'Ar-Rahman', icon: '🎁', gradient: 'from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40', text: 'text-emerald-800 dark:text-emerald-200' },
    { number: 56, label: 'Al-Waqi\'ah', icon: '💰', gradient: 'from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40', text: 'text-indigo-800 dark:text-indigo-200' },
    { number: 67, label: 'Al-Mulk', icon: '🛡️', gradient: 'from-sky-100 to-cyan-100 dark:from-sky-900/40 dark:to-cyan-900/40', text: 'text-sky-800 dark:text-sky-200' },
    { number: 78, label: 'Juz 30', icon: '🎓', gradient: 'from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40', text: 'text-violet-800 dark:text-violet-200' }
];

interface SurahSelectionProps {
    lastRead: LastReadState | null;
    onSelectSurah: (id: number) => void;
    onJumpToLastRead: () => void;
}

export const SurahSelection: React.FC<SurahSelectionProps> = ({ lastRead, onSelectSurah, onJumpToLastRead }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);

    const lastReadSurah = lastRead ? SURAH_DATA.find(s => s.number === lastRead.surahId) : null;

    const filteredSurahs = useMemo(() => {
        if (!debouncedSearch) return SURAH_DATA;
        const lower = debouncedSearch.toLowerCase();
        return SURAH_DATA.filter(s => 
            s.name.toLowerCase().includes(lower) || 
            s.number.toString().includes(lower) ||
            s.arti.toLowerCase().includes(lower)
        );
    }, [debouncedSearch]);

    return (
        <div className="animate-fade-in pb-20 max-w-5xl mx-auto px-3">
            {/* Title */}
            <div className="text-center mb-8 mt-4 hidden md:block">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">Mushaf Digital</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">Baca Al-Quran dengan nyaman, audio per kata & tajwid interaktif.</p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8 max-w-xl mx-auto group mt-4 md:mt-0">
                <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                    <span className="absolute left-5 top-4 text-slate-400 group-focus-within:text-teal-500 transition-colors icon-wrapper w-5 h-5">
                        <FaSearch />
                    </span>
                    <input 
                        type="text"
                        placeholder="Cari surat (Latin, Arti, atau Nomor)..."
                        className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg shadow-slate-200/50 dark:shadow-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-slate-800 dark:text-white font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Last Read */}
            {lastRead && lastReadSurah && !searchTerm && (
                <div className="mb-10 max-w-xl mx-auto animate-fade-in-down">
                    <button 
                        onClick={onJumpToLastRead}
                        className="w-full relative overflow-hidden bg-slate-900 rounded-3xl p-6 text-white shadow-2xl group text-left"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl translate-x-10 -translate-y-10 group-hover:bg-teal-500/30 transition-all"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-2">Lanjut Membaca</p>
                                <h3 className="text-2xl font-bold mb-1">{lastReadSurah.name}</h3>
                                <p className="text-slate-400 text-sm">Ayat {lastRead.ayahNumber}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform border border-white/10">
                                <div className="icon-wrapper w-5 h-5 flex items-center justify-center"><FaArrowRight /></div>
                            </div>
                        </div>
                    </button>
                </div>
            )}

            {/* Quick Links */}
            {!searchTerm && (
                <div className="mb-10">
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 pl-2">Sering Dibaca</h4>
                    <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar snap-x px-2">
                        {QUICK_LINKS.map((link) => (
                            <button
                                key={link.number}
                                onClick={() => onSelectSurah(link.number)}
                                className={`flex-shrink-0 snap-start flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm bg-gradient-to-br ${link.gradient} ${link.text} hover:scale-105 transition-transform shadow-sm border border-white/20 dark:border-white/5 min-w-[140px]`}
                            >
                                <span className="text-xl">{link.icon}</span>
                                {link.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Surah Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSurahs.map(surah => (
                    <button
                        key={surah.number}
                        onClick={() => onSelectSurah(surah.number)}
                        className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 transition-all hover:shadow-lg hover:shadow-teal-500/10 text-left overflow-hidden"
                    >
                        <div className="absolute -right-4 -bottom-4 text-8xl font-bold text-slate-50 dark:text-slate-800 group-hover:text-teal-50 dark:group-hover:text-teal-900/20 transition-colors pointer-events-none opacity-50">
                            {surah.number}
                        </div>
                        
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-serif font-bold flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-colors shadow-sm border border-slate-200 dark:border-slate-600 group-hover:border-teal-400">
                                {surah.number}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold text-slate-800 dark:text-white text-lg group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate pr-2">{surah.name}</h4>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-full">{surah.type}</span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{surah.arti} • {surah.verses} Ayat</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
