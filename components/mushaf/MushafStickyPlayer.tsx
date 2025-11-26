
import React from 'react';
import { FaMusic, FaStop } from 'react-icons/fa';

interface MushafStickyPlayerProps {
    surahName?: string;
    ayahNumber?: number;
    onStop: () => void;
}

export const MushafStickyPlayer: React.FC<MushafStickyPlayerProps> = ({ surahName, ayahNumber, onStop }) => {
    return (
        <div className="absolute bottom-0 left-0 right-0 z-40 p-4 pb-8 bg-gradient-to-t from-white dark:from-slate-950 via-white/95 dark:via-slate-950/95 to-transparent pt-12 pl-6">
            <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-2xl p-4 shadow-2xl shadow-slate-900/20 border border-slate-700/50 flex items-center gap-4 max-w-md mx-auto backdrop-blur-xl">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 animate-pulse icon-wrapper w-5 h-5">
                    <FaMusic />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-0.5">Sedang Memutar</p>
                    <div className="flex items-baseline gap-2">
                        <span className="font-bold truncate">QS {surahName}</span>
                        <span className="text-xs text-slate-400">Ayat {ayahNumber}</span>
                    </div>
                </div>
                <button 
                    onClick={onStop}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white icon-wrapper w-8 h-8 flex items-center justify-center"
                >
                    <FaStop />
                </button>
            </div>
        </div>
    );
};
