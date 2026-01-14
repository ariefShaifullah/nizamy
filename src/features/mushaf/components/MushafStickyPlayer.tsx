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
        <div className="fixed bottom-0 left-0 right-0 z-sticky animate-fade-in-up bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]">
            <div className="relative max-w-3xl mx-auto">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
                    <div
                        className="h-full bg-teal-500 transition-all duration-300 ease-linear"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <div className="flex items-center justify-between p-3 gap-3">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all ${isPlaying ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                            <span className="font-bold text-xs font-sans tracking-tight">
                                {surahNumber}:{ayahNumber}
                            </span>
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate leading-tight">
                                {surahName}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                Ayat ke-{ayahNumber}
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            onClick={onPrev}
                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors active:scale-90"
                        >
                            <FaStepBackward />
                        </button>

                        <button
                            onClick={onTogglePlay}
                            className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-teal-700 active:scale-95 transition-all"
                        >
                            {isPlaying ? <FaPause /> : <span className="ml-1 flex items-center justify-center"><FaPlay /></span>}
                        </button>

                        <button
                            onClick={onNext}
                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors active:scale-90"
                        >
                            <FaStepForward />
                        </button>
                    </div>

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors active:scale-90 ml-2 border-l border-slate-100 dark:border-slate-800"
                    >
                        <FaTimes />
                    </button>
                </div>
            </div>
        </div>
    );
};