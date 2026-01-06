
import React, { useCallback, useMemo, useEffect, useState } from 'react';
import type { QuranAyah, QuranWord, LastReadState, Bookmark, BookmarkCategory } from '../../../types.ts';
import { SURAH_DATA, ARABIC_SURAH_NAMES } from '../../../constants.ts';
import { useLongPress } from '../../../hooks/useLongPress.ts';
import { FaEllipsisH, FaPlay, FaBookmark, FaStar, FaCertificate } from 'react-icons/fa';
import { useMushafSettings } from '../context/MushafContext.tsx';
import { isSafari } from '../../../utils.ts';

interface AyahRendererProps {
    ayah: QuranAyah;
    globalIndex: number;
    isPlaying: boolean;
    isHighlighted?: boolean; // New Prop
    activeWordIndex: number | null;
    lastRead: LastReadState | null;
    bookmarks: Bookmark[];
    mode: 'surah' | 'juz'; // Added Mode Context
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

// Inline Header Component (Redesigned)
const InlineSurahHeader: React.FC<{ surahId: number }> = ({ surahId }) => {
    const surah = SURAH_DATA.find(s => s.number === surahId);
    if (!surah) return null;

    return (
        <div className="relative mx-4 md:mx-8 mt-12 mb-8 overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm group transition-all hover:shadow-md">
            {/* Decorative Side Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-teal-400 to-emerald-600"></div>

            {/* Pattern Background */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/4 opacity-[0.03] dark:opacity-[0.05] pointer-events-none text-slate-900 dark:text-white">
                 <FaCertificate size={140} />
            </div>

            <div className="relative p-5 pl-7 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Number Badge */}
                    <div className="relative w-12 h-12 shrink-0 flex items-center justify-center text-teal-600 dark:text-teal-400">
                         <div className="absolute inset-0 opacity-20 drop-shadow-sm">
                            <FaCertificate size="100%" />
                         </div>
                         <span className="relative text-sm font-bold font-sans z-10 pt-0.5">{surah.number}</span>
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

export const AyahRenderer: React.FC<AyahRendererProps> = React.memo(({ 
    ayah, globalIndex, isPlaying, isHighlighted, activeWordIndex, lastRead, bookmarks, mode,
    onTapAyah, onLongPressAyah, onTapWord, onLongPressWord 
}) => {
    
    // 1. Consume Context
    const { fontSize, showTranslation, wordMode } = useMushafSettings();
    const [animateHighlight, setAnimateHighlight] = useState(false);

    // Get Surah ID from verse key (e.g., "2:1" -> 2)
    const [surahIdStr] = ayah.verse_key.split(':');
    const surahId = parseInt(surahIdStr);

    // Effect to trigger animation only once when highlighted
    useEffect(() => {
        if (isHighlighted) {
            setAnimateHighlight(true);
            const timer = setTimeout(() => setAnimateHighlight(false), 2000); // 2s glow
            return () => clearTimeout(timer);
        }
    }, [isHighlighted]);

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
    const lineHeight = useMemo(() => {
        const base = 2.0;
        const scale = Math.max(0, (fontSize - 24) * 0.02); 
        return base + scale;
    }, [fontSize]);

    const isLastRead = lastRead?.surahId === surahId && lastRead?.ayahNumber === ayah.verse_number;
    
    const bookmarkForAyah = useMemo(() => 
        bookmarks.find(b => b.surahId === surahId && b.ayahNumber === ayah.verse_number),
    [bookmarks, surahId, ayah.verse_number]);

    // Determine background class
    let bgClass = 'bg-transparent';
    if (isPlaying) {
        bgClass = 'bg-teal-50/60 dark:bg-teal-900/10';
    } else if (animateHighlight) {
        bgClass = 'bg-yellow-100/50 dark:bg-yellow-900/30 transition-colors duration-1000';
    }

    // Logic: Only show Inline Header in JUZ mode when a new Surah starts
    // In Surah mode, the Big Header is already shown at the top of the list
    const showInlineHeader = mode === 'juz' && ayah.verse_number === 1;

    return (
        <div data-verse-index={globalIndex} data-verse-number={ayah.verse_number}>
            {showInlineHeader && (
                <InlineSurahHeader surahId={surahId} />
            )}

            <div className={`relative py-8 md:py-12 transition-all duration-500 border-b border-slate-100 dark:border-slate-800/50 group ${bgClass}`}>
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
                        {ayah.words.map((word, index) => (
                            <WordItem 
                                key={`${ayah.id}-${word.id}-${index}`} 
                                word={word} 
                                // Tajwid rules are now pre-calculated in service, simple lookup
                                tajwidRules={word.tajwidRules || []}
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
        prevProps.isHighlighted === nextProps.isHighlighted && 
        prevProps.globalIndex === nextProps.globalIndex &&
        prevProps.mode === nextProps.mode && 
        // FIX: Check function references to prevent stale closures when wordMode changes
        prevProps.onTapAyah === nextProps.onTapAyah &&
        prevProps.onTapWord === nextProps.onTapWord &&
        
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
        if (isSafari || !wordMode || tajwidRules.length === 0) {
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
        prev.word.id === next.word.id &&
        // CRITICAL FIX: Ensure handler updates are respected
        prev.onTap === next.onTap &&
        prev.onLongPress === next.onLongPress
    );
});
