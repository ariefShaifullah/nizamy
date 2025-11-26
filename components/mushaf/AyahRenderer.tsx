
import React, { useCallback } from 'react';
import type { QuranAyah, QuranWord } from '../../types.ts';
import { useLongPress } from '../../hooks/useLongPress.ts';
import { FaEllipsisV } from 'react-icons/fa';

interface AyahRendererProps {
    ayah: QuranAyah;
    globalIndex: number;
    isPlaying: boolean;
    activeWordIndex: number | null;
    wordMode: boolean;
    fontSize: number;
    showTranslation: boolean;
    onTapAyah: (ayah: QuranAyah) => void; 
    onLongPressAyah: (ayah: QuranAyah) => void;
    onTapWord: (word: QuranWord) => void;
    onLongPressWord: (word: QuranWord, parentAyah: QuranAyah) => void;
}

export const AyahRenderer: React.FC<AyahRendererProps> = React.memo(({ 
    ayah, globalIndex, isPlaying, activeWordIndex, wordMode, fontSize, showTranslation,
    onTapAyah, onLongPressAyah, onTapWord, onLongPressWord 
}) => {
    
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

    // Trigger explicit long press action via button click
    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onLongPressAyah(ayah);
    };

    // UX Improvement: Line Height Multiplier
    const lineHeight = '2.8'; 

    return (
        <div 
            data-verse-index={globalIndex}
            data-verse-number={ayah.verse_number}
            className={`relative px-4 md:px-8 pl-6 md:pl-10 py-8 md:py-10 transition-colors duration-500 border-b border-slate-100 dark:border-slate-800/50 select-none ${
                isPlaying 
                ? 'bg-teal-50/60 dark:bg-teal-900/20' 
                : 'bg-transparent hover:bg-slate-50/80 dark:hover:bg-slate-800/20'
            }`}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Number Badge & Context Menu */}
            <div className="absolute left-4 top-4 flex gap-3 items-center opacity-70 hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md font-sans">
                    {ayah.verse_key}
                </span>
                
                {/* Visual Indicator for Context Menu (Long Press Alternative) */}
                <button 
                    onClick={handleMenuClick}
                    className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors"
                    aria-label="Opsi Ayat"
                >
                    <FaEllipsisV size={12} />
                </button>

                {isPlaying && (
                    <div className="flex gap-0.5 items-end h-3 ml-1">
                        <div className="w-1 bg-teal-500 rounded-full animate-[bounce_1s_infinite]"></div>
                        <div className="w-1 bg-teal-500 rounded-full animate-[bounce_1.2s_infinite]"></div>
                        <div className="w-1 bg-teal-500 rounded-full animate-[bounce_0.8s_infinite]"></div>
                    </div>
                )}
            </div>

            {/* ARABIC TEXT AREA */}
            <div 
                className="w-full text-right mb-8 mt-6 touch-manipulation" 
                dir="rtl"
                {...(!wordMode ? ayahGestures : {})}
            >
                <div 
                    className="text-slate-800 dark:text-slate-100"
                    style={{ 
                        lineHeight: lineHeight,
                        fontSize: `${fontSize}px`
                    }}
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
                        className={`inline-flex items-center justify-center mx-2 bg-[url('/images/ayah-end.svg')] bg-contain bg-center bg-no-repeat text-center font-bold font-sans align-middle select-none ${isPlaying ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400 dark:text-slate-600'}`}
                        style={{ 
                            width: `${fontSize * 1.1}px`, 
                            height: `${fontSize * 1.1}px`,
                            fontSize: `${fontSize * 0.45}px`,
                            lineHeight: 1,
                            marginBottom: '0.3em' // Visual alignment fix
                        }}
                    >
                        {ayah.verse_number}
                    </span>
                </div>
            </div>

            {/* Translation */}
            {showTranslation && (
                <div 
                    className="text-slate-600 dark:text-slate-400 text-[15px] md:text-[17px] leading-loose font-sans px-1 touch-manipulation text-justify max-w-3xl ml-auto select-none"
                    dir="ltr"
                    {...(!wordMode ? ayahGestures : {})}
                >
                    {ayah.translations?.[0]?.text?.replace(/<[^>]*>?/gm, '')}
                </div>
            )}
        </div>
    );
}, (prevProps, nextProps) => {
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
                className="inline-block text-amber-600 dark:text-amber-500 pointer-events-none font-arabic px-1 opacity-80 select-none"
                style={{ fontSize: `${fontSize * 0.6}px`, verticalAlign: 'top', marginTop: '0.2em' }}
            >
                {word.text_uthmani}
            </span>
        );
    }

    if (!isInteractive) {
         return (
            <span 
                className="inline-block text-slate-800 dark:text-slate-100 font-arabic px-0.5 pointer-events-none select-none"
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
                inline-block px-0.5 rounded-lg transition-all duration-200 font-arabic select-none cursor-pointer
                ${isActive 
                    ? 'text-teal-600 dark:text-teal-400 scale-110 drop-shadow-sm bg-teal-50/50 dark:bg-teal-900/30' 
                    : wordMode
                        ? 'hover:text-teal-600 dark:hover:text-teal-400 active:scale-95' 
                        : 'text-slate-800 dark:text-slate-100'
                }
            `}
        >
            {word.text_uthmani}
        </span>
    );
}, (prev, next) => {
    // Optimization: Only re-render if active state changes or global settings change.
    // This prevents inactive words from re-rendering when activeWordIndex changes on siblings.
    return (
        prev.isActive === next.isActive &&
        prev.wordMode === next.wordMode &&
        prev.fontSize === next.fontSize &&
        prev.word.id === next.word.id
    );
});
