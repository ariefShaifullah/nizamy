
import React from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaTimes } from 'react-icons/fa';

interface MushafStickyPlayerProps {
    surahName?: string;
    surahNumber?: number;
    ayahNumber?: number;
    isPlaying: boolean;
    progress?: number;
    onTogglePlay: () => void;
    onNext: () => void;
    onPrev: () => void;
    onClose: () => void;
}

export const MushafStickyPlayer: React.FC<MushafStickyPlayerProps> = ({ 
    surahName, 
    surahNumber,
    ayahNumber, 
    isPlaying,
    progress = 0,
    onTogglePlay,
    onNext,
    onPrev,
    onClose
}) => {
    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in-up">
            {/* Glassmorphism Dock Container */}
            <div className="bg-slate-900/90 dark:bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3 md:p-4 max-w-3xl mx-auto relative overflow-hidden ring-1 ring-white/10">
                
                {/* Real Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                    <div 
                        className="h-full bg-teal-500 shadow-[0_0_10px_#14b8a6] transition-all duration-300 ease-linear"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <div className="flex items-center justify-between gap-3">
                    {/* Left: Info Track */}
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${isPlaying ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'bg-slate-800 text-slate-500'}`}>
                            {/* Display Surah:Ayah Number (e.g. 2:10) */}
                            <span className="font-bold text-xs font-sans tracking-tighter">
                                {surahNumber}:{ayahNumber}
                            </span>
                        </div>
                        <div className="overflow-hidden flex flex-col justify-center">
                            <h4 className="font-bold text-white text-sm truncate leading-tight">
                                {surahName}
                            </h4>
                            <p className="text-xs text-slate-400 truncate font-medium mt-0.5">
                                Ayat ke-{ayahNumber}
                            </p>
                        </div>
                    </div>

                    {/* Center: Controls */}
                    <div className="flex items-center gap-1 md:gap-4">
                        <button 
                            onClick={onPrev}
                            className="p-2 text-slate-400 hover:text-white transition-colors active:scale-90 rounded-full hover:bg-white/5"
                            aria-label="Ayat Sebelumnya"
                        >
                            <div className="icon-wrapper w-4 h-4"><FaStepBackward /></div>
                        </button>

                        <button 
                            onClick={onTogglePlay}
                            className="w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all mx-1"
                            aria-label={isPlaying ? "Jeda" : "Putar"}
                        >
                            {isPlaying ? (
                                <div className="icon-wrapper w-4 h-4"><FaPause /></div>
                            ) : (
                                <div className="icon-wrapper w-4 h-4 ml-0.5"><FaPlay /></div>
                            )}
                        </button>

                        <button 
                            onClick={onNext}
                            className="p-2 text-slate-400 hover:text-white transition-colors active:scale-90 rounded-full hover:bg-white/5"
                            aria-label="Ayat Selanjutnya"
                        >
                            <div className="icon-wrapper w-4 h-4"><FaStepForward /></div>
                        </button>
                    </div>

                    {/* Right: Close */}
                    <div className="border-l border-white/10 pl-3 ml-1">
                        <button 
                            onClick={onClose}
                            className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-full hover:bg-white/5"
                            aria-label="Tutup Player"
                        >
                            <div className="icon-wrapper w-4 h-4"><FaTimes /></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
