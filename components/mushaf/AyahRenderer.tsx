
import React, { useCallback } from 'react';
import type { QuranAyah, QuranWord } from '../../types.ts';
import { useLongPress } from '../../hooks/useLongPress.ts';

interface AyahRendererProps {
    ayah: QuranAyah;
    globalIndex: number;
    isPlaying: boolean;
    activeWordIndex: number | null;
    wordMode: boolean;
    fontSize: number;
    showTranslation: boolean;
    // Callbacks from parent must be stable
    onTapAyah: (ayah: QuranAyah) => void; 
    onLongPressAyah: (ayah: QuranAyah) => void;
    onTapWord: (word: QuranWord) => void;
    onLongPressWord: (word: QuranWord, parentAyah: QuranAyah) => void;
}

export const AyahRenderer: React.FC<AyahRendererProps> = React.memo(({ 
    ayah, globalIndex, isPlaying, activeWordIndex, wordMode, fontSize, showTranslation,
    onTapAyah, onLongPressAyah, onTapWord, onLongPressWord 
}) => {
    
    // OPTIMIZATION: Wrap handlers in useCallback.
    // This ensures that 'handleTap' and 'handleLongPress' maintain stable references
    // unless their dependencies change. This allows useLongPress to return stable event handlers,
    // which in turn allows React.memo to skip re-rendering this component if props haven't changed.
    const handleTap = useCallback(() => {
        onTapAyah(ayah);
    }, [onTapAyah, ayah]);

    const handleLongPress = useCallback(() => {
        onLongPressAyah(ayah);
    }, [onLongPressAyah, ayah]);

    const ayahGestures = useLongPress(
        handleLongPress,
        handleTap,
        { delay: 600, shouldPreventDefault: true }
    );

    const lineHeight = fontSize * 2.3; 

    return (
        <div 
            data-verse-index={globalIndex}
            data-verse-number={ayah.verse_number}
            className={`relative px-5 py-8 transition-all duration-500 border-b border-slate-50 dark:border-slate-800 select-none ${
                isPlaying 
                ? 'bg-teal-50/50 dark:bg-teal-900/10' 
                : 'bg-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
            }`}
            onContextMenu={(e) => e.preventDefault()} // Block context menu
        >
            {/* Audio Playing Indicator */}
            {isPlaying && (
                <div className="absolute left-4 top-4 flex gap-0.5 items-end h-3">
                    <div className="w-1 bg-teal-500 rounded-full animate-[bounce_1s_infinite]"></div>
                    <div className="w-1 bg-teal-500 rounded-full animate-[bounce_1.2s_infinite]"></div>
                    <div className="w-1 bg-teal-500 rounded-full animate-[bounce_0.8s_infinite]"></div>
                </div>
            )}

            {/* ARABIC TEXT AREA */}
            <div 
                className="w-full text-right mb-6 touch-manipulation" 
                dir="rtl"
                {...(!wordMode ? ayahGestures : {})}
            >
                <div 
                    className="inline leading-relaxed"
                    style={{ lineHeight: `${lineHeight}px` }}
                >
                    {ayah.words.map((word, index) => (
                        <WordItem 
                            key={`${ayah.id}-${word.id}-${index}`} 
                            word={word} 
                            parentAyah={ayah}
                            isActive={activeWordIndex === index}
                            wordMode={wordMode}
                            fontSize={fontSize}
                            onTap={onTapWord}
                            onLongPress={onLongPressWord}
                        />
                    ))}
                    
                    {/* End of Ayah Marker */}
                    <span 
                        className={`inline-flex items-center justify-center w-9 h-9 mx-2 bg-[url('/images/ayah-end.svg')] bg-contain bg-center bg-no-repeat text-[12px] font-bold font-sans align-middle relative -top-1 select-none ${isPlaying ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400 dark:text-slate-600'}`}
                    >
                        {ayah.verse_number}
                    </span>
                </div>
            </div>

            {/* Translation */}
            {showTranslation && (
                <div 
                    className="text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed font-sans px-1 touch-manipulation text-justify select-none"
                    dir="ltr"
                    {...(!wordMode ? ayahGestures : {})}
                >
                    {ayah.translations?.[0]?.text?.replace(/<[^>]*>?/gm, '')}
                </div>
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison to optimize list rendering
    // Only re-render if specific visual props change
    return (
        prevProps.ayah.id === nextProps.ayah.id &&
        prevProps.isPlaying === nextProps.isPlaying &&
        prevProps.activeWordIndex === nextProps.activeWordIndex &&
        prevProps.wordMode === nextProps.wordMode &&
        prevProps.fontSize === nextProps.fontSize &&
        prevProps.showTranslation === nextProps.showTranslation &&
        prevProps.globalIndex === nextProps.globalIndex
    );
});

const WordItem: React.FC<{ 
    word: QuranWord; 
    parentAyah: QuranAyah;
    isActive: boolean; 
    wordMode: boolean;
    fontSize: number;
    onTap: (word: QuranWord) => void; 
    onLongPress: (word: QuranWord, parentAyah: QuranAyah) => void;
}> = React.memo(({ word, parentAyah, isActive, wordMode, fontSize, onTap, onLongPress }) => {
    
    // OPTIMIZATION: Wrap handlers for words as well
    const handleTap = useCallback(() => {
        onTap(word);
    }, [onTap, word]);

    const handleLongPress = useCallback(() => {
        onLongPress(word, parentAyah);
    }, [onLongPress, word, parentAyah]);

    const wordGestures = useLongPress(
        handleLongPress,
        handleTap,
        { delay: 400, shouldPreventDefault: true }
    );

    if (word.char_type_name === 'end') return null; 

    const isWaqaf = word.char_type_name === 'pause';
    const isInteractive = word.char_type_name === 'word' && !!word.audio_url;
    
    if (isWaqaf) {
        return (
            <span 
                className="inline-block text-amber-600 dark:text-amber-500 pointer-events-none font-arabic px-1 opacity-90 select-none"
                style={{ fontSize: `${fontSize * 0.65}px`, verticalAlign: 'top', marginTop: '-5px' }}
            >
                {word.text_uthmani}
            </span>
        );
    }

    if (!isInteractive) {
         return (
            <span 
                className="inline-block text-slate-800 dark:text-slate-100 font-arabic px-0.5 pointer-events-none select-none"
                style={{ fontSize: `${fontSize}px` }}
            >
                {word.text_uthmani}
            </span>
        );
    }

    return (
        <span
            {...(wordMode ? wordGestures : {})}
            onContextMenu={(e) => e.preventDefault()}
            className={`
                inline-block px-0.5 rounded-lg transition-all duration-200 font-arabic select-none
                ${isActive 
                    ? 'text-teal-600 dark:text-teal-400 drop-shadow-sm' 
                    : wordMode
                        ? 'text-slate-800 dark:text-slate-100 cursor-pointer active:text-teal-600 hover:text-teal-600 dark:hover:text-teal-400 active:scale-95' 
                        : 'text-slate-800 dark:text-slate-100'
                }
            `}
            style={{ 
                fontSize: `${fontSize}px`
            }}
        >
            {word.text_uthmani}
        </span>
    );
});
