
import React, { useCallback, useMemo } from 'react';
import type { QuranAyah, QuranWord, LastReadState, Bookmark, BookmarkCategory } from '../../../types.ts';
import { useLongPress } from '../../../hooks/useLongPress.ts';
import { FaEllipsisH, FaPlay, FaBookmark, FaStar } from 'react-icons/fa';
import { analyzeTajwid } from '../logic/tajwid.helper.ts';

// --- BROWSER DETECTION ---
// Safari (WebKit) has a known issue where wrapping individual Arabic letters in <span> 
// breaks the cursive ligatures (huruf terputus). 
// To preserve the sanctity of the Quranic text, we disable coloring on Safari.
const IS_SAFARI = typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

interface AyahRendererProps {
    ayah: QuranAyah;
    globalIndex: number;
    isPlaying: boolean;
    activeWordIndex: number | null;
    wordMode: boolean;
    fontSize: number;
    showTranslation: boolean;
    lastRead: LastReadState | null;
    bookmarks: Bookmark[];
    onTapAyah: (ayah: QuranAyah) => void; 
    onLongPressAyah: (ayah: QuranAyah) => void;
    onTapWord: (word: QuranWord) => void;
    onLongPressWord: (word: QuranWord, parentAyah: QuranAyah) => void;
}

const CATEGORY_COLORS: Record<BookmarkCategory, string> = {
    general: 'text-amber-500 dark:text-amber-400',
    favorite: 'text-rose-500 dark:text-rose-400',
    memorize: 'text-indigo-500 dark:text-indigo-400',
    study: 'text-sky-500 dark:text-sky-400',
};

export const AyahRenderer: React.FC<AyahRendererProps> = React.memo(({ 
    ayah, globalIndex, isPlaying, activeWordIndex, wordMode, fontSize, showTranslation, lastRead, bookmarks,
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

    // --- Dynamic Line Height Calculation ---
    // Taller line height for smaller fonts to prevent crowding
    // Tighter line height for very large fonts to keep text cohesive
    const lineHeight = useMemo(() => {
        const base = 2.0;
        const scale = Math.max(0, (fontSize - 24) * 0.02); 
        // 24px -> 2.0
        // 40px -> 2.32
        // 60px -> 2.72
        return base + scale;
    }, [fontSize]);

    const isLastRead = lastRead?.surahId === parseInt(ayah.verse_key.split(':')[0]) && lastRead?.ayahNumber === ayah.verse_number;
    
    const bookmarkForAyah = useMemo(() => 
        bookmarks.find(b => b.surahId === parseInt(ayah.verse_key.split(':')[0]) && b.ayahNumber === ayah.verse_number),
    [bookmarks, ayah.verse_key, ayah.verse_number]);

    const processedWords = useMemo(() => {
        return ayah.words.map((word, index) => {
            if (word.char_type_name !== 'word') return { word, rules: [] };
            
            const nextWord = index < ayah.words.length - 1 ? ayah.words[index + 1] : null;
            const isEndAyah = index === ayah.words.length - 1;
            
            const rules = analyzeTajwid(
                word.text_uthmani, 
                nextWord?.text_uthmani, 
                word.location, 
                isEndAyah
            );
            return { word, rules };
        });
    }, [ayah.words]);

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
            <div className="flex justify-between items-center mb-6 px-5 md:px-10">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold font-sans bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        {ayah.verse_key}
                    </span>
                    {isLastRead && (
                        <div className="text-teal-500 dark:text-teal-400 animate-fade-in" title="Terakhir dibaca">
                            <FaBookmark />
                        </div>
                    )}
                    {bookmarkForAyah && (
                        <div className={`${CATEGORY_COLORS[bookmarkForAyah.category]} animate-fade-in`} title="Penanda Tersimpan">
                            <FaStar />
                        </div>
                    )}
                </div>
                
                <div className="flex gap-1">
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

            <div 
                className="w-full text-right px-5 md:px-10 mb-6 touch-manipulation" 
                dir="rtl"
                {...(!wordMode ? ayahGestures : {})}
            >
                <div 
                    className="text-slate-800 dark:text-slate-100 tracking-normal text-justify"
                    style={{ 
                        fontFamily: '"Amiri", "Traditional Arabic", serif',
                        lineHeight: lineHeight,
                        fontSize: `${fontSize}px`,
                        textAlignLast: 'right',
                        fontFeatureSettings: '"cv01" 1, "cv02" 1, "ss01" 1',
                        WebkitFontFeatureSettings: '"cv01" 1, "cv02" 1, "ss01" 1'
                    }}
                >
                    {processedWords.map((item, index) => (
                        <WordItem 
                            key={`${ayah.id}-${item.word.id}-${index}`} 
                            word={item.word} 
                            tajwidRules={item.rules}
                            parentAyah={ayah}
                            isActive={activeWordIndex === index}
                            wordMode={wordMode}
                            fontSize={fontSize}
                            onTap={onTapWord}
                            onLongPress={onLongPressWord}
                        />
                    ))}
                    
                    <span 
                        className={`inline-flex items-center justify-center mx-2 align-middle select-none h-[0.9em] w-[0.9em] relative bottom-[0.15em] ${isPlaying ? 'text-teal-600 dark:text-teal-400' : 'text-slate-300 dark:text-slate-600'}`}
                        style={{ fontSize: `${fontSize}px` }}
                    >
                        <span className="text-[1em] leading-none" style={{ fontFamily: '"Amiri", serif' }}>۝</span>
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

            {showTranslation && (
                <div 
                    className="px-5 md:px-10"
                    {...(!wordMode ? ayahGestures : {})}
                >
                    <p className="text-slate-600 dark:text-slate-400 text-[15px] md:text-[17px] leading-8 font-sans border-l-2 border-slate-200 dark:border-slate-800 pl-4">
                        {ayah.translations?.[0]?.text}
                    </p>
                </div>
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    const areLastReadsEqual = (prev: LastReadState | null, next: LastReadState | null) => {
        if (prev === next) return true;
        if (!prev || !next) return false;
        return prev.surahId === next.surahId && prev.ayahNumber === next.ayahNumber;
    };

    const areBookmarksEqual = (prev: Bookmark[], next: Bookmark[]) => {
        const ayahKey = `${parseInt(prevProps.ayah.verse_key.split(':')[0])}:${prevProps.ayah.verse_number}`;
        const prevBookmark = prev.find(b => b.id === ayahKey);
        const nextBookmark = next.find(b => b.id === ayahKey);

        if (!prevBookmark && !nextBookmark) return true; // Both null
        if (!prevBookmark || !nextBookmark) return false; // One is null
        return prevBookmark.category === nextBookmark.category; // Compare category
    };
    
    return (
        prevProps.ayah.id === nextProps.ayah.id &&
        prevProps.isPlaying === nextProps.isPlaying &&
        prevProps.activeWordIndex === nextProps.activeWordIndex &&
        prevProps.wordMode === nextProps.wordMode &&
        prevProps.fontSize === nextProps.fontSize &&
        prevProps.showTranslation === nextProps.showTranslation &&
        prevProps.globalIndex === nextProps.globalIndex &&
        areLastReadsEqual(prevProps.lastRead, nextProps.lastRead) &&
        areBookmarksEqual(prevProps.bookmarks, nextProps.bookmarks)
    );
});

const WordItem: React.FC<{ 
    word: QuranWord; 
    tajwidRules: any[];
    parentAyah: QuranAyah; 
    isActive: boolean; 
    wordMode: boolean;
    fontSize: number;
    onTap: (word: QuranWord) => void; 
    onLongPress: (word: QuranWord, parentAyah: QuranAyah) => void;
}> = React.memo(({ word, tajwidRules, parentAyah, isActive, wordMode, fontSize, onTap, onLongPress }) => {
    
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
    
    if (isWaqaf) {
        return (
            <span 
                className="inline-block text-amber-600 dark:text-amber-500 pointer-events-none px-1 opacity-80 select-none relative -top-[0.4em]"
                style={{ fontSize: `${fontSize * 0.55}px`, fontFamily: '"Amiri", serif' }}
            >
                {word.text_uthmani}
            </span>
        );
    }

    if (!isInteractive) {
         return (
            <span 
                className="inline-block text-slate-800 dark:text-slate-100 px-0.5 select-none"
                style={{ fontFamily: '"Amiri", serif' }}
            >
                {word.text_uthmani}
            </span>
        );
    }

    const renderColoredText = () => {
        // Fix for Safari: Return plain text if Safari or no rules/wordMode
        if (IS_SAFARI || !wordMode || tajwidRules.length === 0) {
            return word.text_uthmani;
        }

        const chars = word.text_uthmani.split('');
        return chars.map((char, i) => {
            const rule = tajwidRules.find(r => r.indexes.includes(i));
            if (rule) {
                return <span key={i} className={`${rule.color}`}>{char}</span>;
            }
            return <span key={i}>{char}</span>;
        });
    };

    return (
        <span
            {...(wordMode ? wordGestures : {})}
            onContextMenu={(e) => e.preventDefault()}
            className={`
                inline-block rounded-lg transition-all duration-200 select-none cursor-pointer
                relative
                ${wordMode ? 'py-1 my-0.5' : 'py-0 my-0'} 
                ${isActive 
                    ? 'bg-teal-50 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 px-2 mx-1 shadow-sm ring-1 ring-teal-200 dark:ring-teal-800 rounded-xl' 
                    : wordMode
                        ? 'hover:text-teal-600 dark:hover:text-teal-400 active:scale-95 px-1 mx-0.5 hover:bg-slate-100 dark:hover:bg-slate-800/50' 
                        : 'text-slate-800 dark:text-slate-100 px-0.5 mx-0.5'
                }
            `}
            style={{ fontFamily: '"Amiri", serif' }}
        >
            {renderColoredText()}
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
