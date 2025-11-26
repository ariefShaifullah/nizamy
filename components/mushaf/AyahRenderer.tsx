
import React, { useCallback } from 'react';
import type { QuranAyah, QuranWord } from '../../types.ts';
import { useLongPress } from '../../hooks/useLongPress.ts';
import { FaEllipsisH, FaPlay } from 'react-icons/fa';

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
        { delay: 500, shouldPreventDefault: true }
    );

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onLongPressAyah(ayah);
    };

    // UX: Dynamic Line Height agar harakat tidak bertabrakan
    // Semakin besar font, semakin renggang barisnya
    const lineHeight = fontSize > 40 ? 2.8 : 2.5; 

    return (
        <div 
            data-verse-index={globalIndex}
            data-verse-number={ayah.verse_number}
            className={`relative py-8 md:py-12 transition-all duration-500 border-b border-slate-100 dark:border-slate-800/50 group ${
                isPlaying 
                ? 'bg-teal-50/60 dark:bg-teal-900/10' 
                : 'bg-transparent'
            }`}
        >
            {/* Top Info Bar (Nomor Surat & Menu) */}
            {/* UX Rule: Sembunyikan Play Button global jika sedang mode per kata untuk mencegah error klik */}
            <div className="flex justify-between items-center mb-6 px-5 md:px-10">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold font-sans bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        {ayah.verse_key}
                    </span>
                </div>
                
                <div className="flex gap-1">
                     {/* Tombol Play Ayat HANYA muncul jika BUKAN mode kata */}
                     {!wordMode && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onTapAyah(ayah); }}
                            className={`p-2.5 rounded-full transition-all active:scale-90 ${
                                isPlaying 
                                ? 'bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-400' 
                                : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400'
                            }`}
                            title="Putar Audio Ayat Ini"
                        >
                            <div className="icon-wrapper w-3 h-3"><FaPlay /></div>
                        </button>
                     )}
                    <button 
                        onClick={handleMenuClick}
                        className="p-2.5 rounded-full bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        title="Opsi Lainnya (Tafsir/Tajwid)"
                    >
                        <div className="icon-wrapper w-3.5 h-3.5"><FaEllipsisH /></div>
                    </button>
                </div>
            </div>

            {/* ARABIC TEXT AREA */}
            <div 
                className="w-full text-right px-5 md:px-10 mb-6 touch-manipulation" 
                dir="rtl"
                {...(!wordMode ? ayahGestures : {})}
            >
                <div 
                    className="text-slate-800 dark:text-slate-100 font-arabic tracking-normal text-justify leading-loose"
                    style={{ 
                        lineHeight: lineHeight,
                        fontSize: `${fontSize}px`,
                        textAlignLast: 'right' // Pastikan baris terakhir (nomor ayat) ada di kiri (karena RTL)
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
                    
                    {/* Inline End of Ayah Symbol (Circle with Number) */}
                    {/* Ini digabung dalam flow teks agar layoutnya natural seperti di Mushaf cetak */}
                    <span 
                        className={`inline-flex items-center justify-center mx-2 align-middle select-none h-[0.9em] w-[0.9em] relative bottom-[0.15em] ${isPlaying ? 'text-teal-600 dark:text-teal-400' : 'text-slate-300 dark:text-slate-600'}`}
                        style={{ fontSize: `${fontSize}px` }}
                    >
                        <span className="font-arabic text-[1em] leading-none">۝</span>
                        <span 
                            className="absolute inset-0 flex items-center justify-center font-sans font-bold text-slate-500 dark:text-slate-900"
                            style={{ 
                                fontSize: '0.35em', 
                                paddingTop: '0.1em',
                                color: isPlaying ? '#0f766e' : 'inherit' 
                            }}
                        >
                            {ayah.verse_number}
                        </span>
                    </span>
                </div>
            </div>

            {/* Translation Area */}
            {showTranslation && (
                <div 
                    className="px-5 md:px-10"
                    {...(!wordMode ? ayahGestures : {})}
                >
                    <p className="text-slate-600 dark:text-slate-400 text-[15px] md:text-[17px] leading-8 font-sans border-l-2 border-slate-200 dark:border-slate-800 pl-4">
                        {ayah.translations?.[0]?.text?.replace(/<[^>]*>?/gm, '')}
                    </p>
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
        { delay: 300, shouldPreventDefault: true }
    );

    if (word.char_type_name === 'end') return null; 

    const isWaqaf = word.char_type_name === 'pause';
    const isInteractive = word.char_type_name === 'word' && !!word.audio_url;
    
    // Waqaf signs (tanda berhenti)
    if (isWaqaf) {
        return (
            <span 
                className="inline-block text-amber-600 dark:text-amber-500 pointer-events-none font-arabic px-1 opacity-80 select-none relative -top-[0.4em]"
                style={{ fontSize: `${fontSize * 0.55}px` }}
            >
                {word.text_uthmani}
            </span>
        );
    }

    // Non-interactive text
    if (!isInteractive) {
         return (
            <span className="inline-block text-slate-800 dark:text-slate-100 font-arabic px-0.5 select-none">
                {word.text_uthmani}
            </span>
        );
    }

    // Interactive Word with optimized Hit Area
    return (
        <span
            {...(wordMode ? wordGestures : {})}
            onContextMenu={(e) => e.preventDefault()}
            className={`
                inline-block rounded-lg transition-all duration-200 font-arabic select-none cursor-pointer
                relative
                ${wordMode ? 'py-2 my-1' : 'py-0 my-0'} 
                ${isActive 
                    ? 'text-teal-700 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-900/50 shadow-sm px-2 mx-1' 
                    : wordMode
                        ? 'hover:text-teal-600 dark:hover:text-teal-400 active:scale-95 px-2 mx-0.5 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-md' 
                        : 'text-slate-800 dark:text-slate-100 px-0.5 mx-0.5'
                }
            `}
        >
            {word.text_uthmani}
        </span>
    );
}, (prev, next) => {
    return (
        prev.isActive === next.isActive &&
        prev.wordMode === next.wordMode &&
        prev.fontSize === next.fontSize &&
        prev.word.id === next.word.id
    );
});
