
import React from 'react';
import { Virtuoso, type VirtuosoHandle, type ListRange } from 'react-virtuoso';
import { AyahRenderer } from './AyahRenderer.tsx';
import { SurahHeader } from './SurahHeader.tsx';
import { SURAH_DATA } from '../../../constants.ts';
import type { QuranAyah, QuranWord } from '../../../types.ts';

// Skeleton Component
const VersesSkeleton = () => (
    <div className="space-y-8 p-4 max-w-3xl mx-auto w-full animate-pulse">
        {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-4">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4 self-end opacity-50"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-full w-1/2 self-end opacity-30"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full mt-4"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3"></div>
            </div>
        ))}
    </div>
);

interface MushafReaderProps {
    surah: typeof SURAH_DATA[0];
    verses: QuranAyah[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    loadNextPage: () => void;
    retry: () => void;
    virtuosoRef: React.RefObject<VirtuosoHandle>;
    onRangeChange: (range: ListRange) => void;
    
    // Settings & State
    isPlaying: boolean;
    playingAyahId: number | null;
    playingWordId: number | null;
    wordMode: boolean;
    fontSize: number;
    showTranslation: boolean;

    // Handlers
    onTapAyah: (ayah: QuranAyah) => void;
    onLongPressAyah: (ayah: QuranAyah) => void;
    onTapWord: (word: QuranWord) => void;
    onLongPressWord: (word: QuranWord, parentAyah: QuranAyah) => void;
}

export const MushafReader: React.FC<MushafReaderProps> = ({
    surah,
    verses,
    loading,
    error,
    hasMore,
    loadNextPage,
    retry,
    virtuosoRef,
    onRangeChange,
    isPlaying,
    playingAyahId,
    playingWordId,
    wordMode,
    fontSize,
    showTranslation,
    onTapAyah,
    onLongPressAyah,
    onTapWord,
    onLongPressWord
}) => {
    return (
        <div className="flex-grow relative w-full max-w-3xl mx-auto bg-white dark:bg-slate-950 pl-5">
            {error && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-6 text-center">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 text-3xl">⚠️</div>
                    <p className="text-slate-700 dark:text-slate-300 mb-6 font-medium">{error}</p>
                    <button onClick={retry} className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/30">Coba Lagi</button>
                </div>
            )}

            {loading && verses.length === 0 ? (
                <VersesSkeleton />
            ) : (
                <Virtuoso
                    ref={virtuosoRef}
                    style={{ height: '100%' }}
                    data={verses}
                    endReached={loadNextPage}
                    rangeChanged={onRangeChange}
                    overscan={500}
                    className="pb-32 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]"
                    components={{
                        Header: () => surah ? <SurahHeader surah={surah} /> : null,
                        Footer: () => !hasMore && !loading && (
                            <div className="py-20 text-center">
                                <p className="text-emerald-600/50 dark:text-emerald-400/50 font-arabic text-xl">صدق الله العظيم</p>
                            </div>
                        )
                    }}
                    itemContent={(index, ayah) => (
                        <div id={`ayah-${ayah.id}`}>
                            <AyahRenderer
                                ayah={ayah}
                                globalIndex={index}
                                isPlaying={playingAyahId === ayah.id}
                                activeWordIndex={playingWordId ? ayah.words.findIndex(w => w.id === playingWordId) : null}
                                wordMode={wordMode}
                                fontSize={fontSize}
                                showTranslation={showTranslation}
                                onTapAyah={onTapAyah}
                                onLongPressAyah={onLongPressAyah}
                                onTapWord={onTapWord}
                                onLongPressWord={onLongPressWord}
                            />
                        </div>
                    )}
                />
            )}
        </div>
    );
};
