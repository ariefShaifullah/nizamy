import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import { SURAH_DATA } from '../../constants.ts';
import { audioService } from '../../services/audio.service.ts';
import { getAyahAudioUrl } from '../../services/mushaf.service.ts';
import { AyahRenderer } from './AyahRenderer.tsx';
import { KamusSheet } from './KamusSheet.tsx';
import { MushafSettingsModal } from './MushafSettingsModal.tsx';
import { SurahHeader } from './SurahHeader.tsx';
import type { QuranAyah, KamusData, QuranWord } from '../../types.ts';
import { useToast } from '../ui/Toast.tsx';
import { useDebounce } from '../../hooks/useDebounce.ts';
import { useLocalStorage } from '../../hooks/useLocalStorage.ts';
import { useMushafAudio } from '../../hooks/useMushafAudio.ts';
import { useMushafData } from '../../hooks/useMushafData.ts';

const QUICK_LINKS = [
    { number: 18, label: 'Al-Kahfi', icon: '⛰️', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    { number: 36, label: 'Ya-Sin', icon: '❤️', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
    { number: 55, label: 'Ar-Rahman', icon: '🎁', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    { number: 56, label: 'Al-Waqi\'ah', icon: '💰', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
    { number: 67, label: 'Al-Mulk', icon: '🛡️', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { number: 78, label: 'Juz 30', icon: '🎓', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' }
];

// Skeleton Component for Loading State
const VersesSkeleton = () => (
    <div className="space-y-8 p-4 max-w-3xl mx-auto w-full animate-pulse">
        {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-4">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 self-end"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2 self-end"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full mt-2"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3"></div>
            </div>
        ))}
    </div>
);

interface LastReadState {
    surahId: number;
    ayahNumber: number;
    timestamp: number;
}

const MushafApp: React.FC = () => {
    const { showToast } = useToast();
    
    // Local Storage for Last Read
    const [lastRead, setLastRead] = useLocalStorage<LastReadState | null>("mushaf_lastRead", null);

    // Audio Logic with Auto-Next Support
    // We need to define `handleAudioEnded` before using it in the hook, or use a ref
    // To avoid circular dependency, we'll use a ref-based callback in the component body
    const nextAyahHandler = useRef<() => void>(() => {});
    const { isPlaying, playingAyahId, playingWordId, playAudio, stopAudio } = useMushafAudio({
        onEnded: () => nextAyahHandler.current()
    });

    // Navigation & Search
    const [selectedSurahId, setSelectedSurahId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);
    
    // Jump to Ayah State
    const [jumpAyahInput, setJumpAyahInput] = useState("");
    const [isJumping, setIsJumping] = useState(false);
    
    // Data Fetching Hook
    const { verses, loading, error, hasMore, loadVerses, loadNextPage, loadUntilAyah, retry } = useMushafData(selectedSurahId);
    
    // Appearance
    const [fontSize, setFontSize] = useLocalStorage("mushaf_fontSize", 32);
    const [showTranslation, setShowTranslation] = useLocalStorage("mushaf_showTranslation", true);
    const [wordMode, setWordMode] = useLocalStorage("mushaf_wordMode", false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    // Scroll Progress
    const [visibleRange, setVisibleRange] = useState({ startIndex: 0, endIndex: 0 });
    
    // Modal State
    const [kamusData, setKamusData] = useState<KamusData | null>(null);

    const virtuosoRef = useRef<VirtuosoHandle>(null);

    // --- LOGIC: AUTO-PLAY NEXT AYAH ---
    const playAyahById = useCallback((ayah: QuranAyah) => {
        const url = getAyahAudioUrl(selectedSurahId!, ayah.verse_number);
        playAudio(url, 'ayah', ayah.id);
        
        // Scroll to it
        const index = verses.findIndex(v => v.id === ayah.id);
        if (index !== -1 && virtuosoRef.current) {
            virtuosoRef.current.scrollToIndex({ index, align: 'center', behavior: 'smooth' });
        }
    }, [selectedSurahId, verses, playAudio]);

    // Update the ref handler whenever dependencies change
    useEffect(() => {
        nextAyahHandler.current = () => {
            if (!playingAyahId || verses.length === 0) return;
            
            const currentIndex = verses.findIndex(v => v.id === playingAyahId);
            if (currentIndex !== -1 && currentIndex < verses.length - 1) {
                const nextAyah = verses[currentIndex + 1];
                playAyahById(nextAyah);
            } else {
                // End of loaded list or Surah
                stopAudio();
                if (hasMore) {
                    showToast("Memuat ayat berikutnya...", "info");
                    loadNextPage(); // Attempt to load more, user can tap play again
                } else {
                    showToast("Akhir surat.", "success");
                }
            }
        };
    }, [playingAyahId, verses, hasMore, stopAudio, loadNextPage, playAyahById, showToast]);


    // --- LOGIC: SAVE LAST READ ---
    // Debounce saving last read to avoid excessive writes during fast scroll
    useEffect(() => {
        if (!selectedSurahId || verses.length === 0) return;
        
        const saveTimeout = setTimeout(() => {
            if (visibleRange.startIndex >= 0 && verses[visibleRange.startIndex]) {
                const currentAyah = verses[visibleRange.startIndex];
                setLastRead({
                    surahId: selectedSurahId,
                    ayahNumber: currentAyah.verse_number,
                    timestamp: Date.now()
                });
            }
        }, 1000);

        return () => clearTimeout(saveTimeout);
    }, [visibleRange.startIndex, selectedSurahId, verses, setLastRead]);


    // Init Data on Surah Change & Forced Scroll Reset
    useEffect(() => {
        if (selectedSurahId) {
            loadVerses(1, true);
            setVisibleRange({ startIndex: 0, endIndex: 0 });
            setJumpAyahInput(""); 
            
            // Force scroll to top
            setTimeout(() => {
                virtuosoRef.current?.scrollToIndex({ index: 0, align: 'start' });
            }, 50);
        }
    }, [selectedSurahId, loadVerses]);

    const progressPercent = useMemo(() => {
        if (!selectedSurahId) return 0;
        const surahInfo = SURAH_DATA.find(s => s.number === selectedSurahId);
        if (!surahInfo) return 0;
        return Math.min(100, ((visibleRange.endIndex) / surahInfo.verses) * 100);
    }, [selectedSurahId, visibleRange]);

    const currentVisibleAyahNumber = useMemo(() => {
        if (verses.length > 0 && verses[visibleRange.startIndex]) {
            return verses[visibleRange.startIndex].verse_number;
        }
        return null;
    }, [visibleRange, verses]);

    const filteredSurahs = useMemo(() => {
        if (!debouncedSearch) return SURAH_DATA;
        const lower = debouncedSearch.toLowerCase();
        return SURAH_DATA.filter(s => 
            s.name.toLowerCase().includes(lower) || 
            s.number.toString().includes(lower) ||
            s.arti.toLowerCase().includes(lower)
        );
    }, [debouncedSearch]);

    const handleTap = () => {
        if (navigator.vibrate) navigator.vibrate(10);
    };

    const handleTapAyah = useCallback((ayah: QuranAyah) => {
        handleTap();
        if (wordMode) return; 
        
        if (playingAyahId === ayah.id && isPlaying) {
            stopAudio();
            return;
        }
        playAyahById(ayah);
    }, [wordMode, playingAyahId, isPlaying, stopAudio, playAyahById]);

    const handleTapWord = useCallback((word: QuranWord) => {
        handleTap();
        if (!wordMode) return;
        if (word.char_type_name !== 'word') return; 
        if (!word.audio_url) {
            showToast("Audio kata ini tidak tersedia", "info");
            return; 
        }
        playAudio(word.audio_url, 'word', word.id);
    }, [wordMode, playAudio, showToast]);

    const handleLongPressAyah = useCallback((ayah: QuranAyah) => {
        audioService.playClick();
        setKamusData({
            type: 'ayah',
            data: ayah,
            surahInfo: {
                id: selectedSurahId!,
                name_complex: SURAH_DATA.find(s => s.number === selectedSurahId)?.name || '',
                name_arabic: '',
                verses_count: 0,
                revelation_place: ''
            },
            reference: `QS ${selectedSurahId}:${ayah.verse_number}`
        });
    }, [selectedSurahId]);

    const handleLongPressWord = useCallback((word: QuranWord, parentAyah: QuranAyah) => {
        audioService.playClick();
        if (word.char_type_name !== 'word') return;
        
        let nextWordText = undefined;
        if (parentAyah) {
            const currentIndex = parentAyah.words.findIndex(w => w.id === word.id);
            if (currentIndex !== -1 && currentIndex < parentAyah.words.length - 1) {
                const nextWord = parentAyah.words[currentIndex + 1];
                if (nextWord.char_type_name === 'word') {
                    nextWordText = nextWord.text_uthmani;
                }
            }
        }

        setKamusData({ 
            type: 'word', 
            data: word,
            nextWordText: nextWordText
        });
    }, []);

    // Handle Resume Reading
    const handleResume = async () => {
        if (!lastRead) return;
        handleTap();
        setSelectedSurahId(lastRead.surahId);
        
        // Wait for surah to load, then jump
        // This is tricky because 'selectedSurahId' change triggers a full reset in useEffect
        // We need to wait for that reset, then loadUntilAyah.
        // For simplicity, we can rely on the user manually scrolling or implement a "resume mode".
        // Current implementation: User goes to surah, then manually jumps or we try to auto-jump if we pass a state.
        // Better UX: Just open the surah, user can see the "Jump" input pre-filled or a toast button.
        // Let's try to auto-jump via a timeout (simple but effective for now).
        
        setTimeout(async () => {
            // We need to access the fresh 'loadUntilAyah' from the new render cycle of the new Surah
            // This is hard to do cleanly without a context or ref.
            // Workaround: show a toast offering to jump.
            showToast(`Melanjutkan ke Ayat ${lastRead.ayahNumber}...`, "info");
            
            // Note: Ideally we would call handleJumpToAyah here, but we need the data loaded first.
            // Since we can't easily bridge the state change, we'll just set the Jump Input value
            // so the user just hits "Enter" or the button.
            setJumpAyahInput(lastRead.ayahNumber.toString());
        }, 500);
    };

    // Handle Jump to Ayah
    const handleJumpToAyah = async (e?: React.FormEvent) => {
        if(e) e.preventDefault();
        
        if (!jumpAyahInput || !virtuosoRef.current || !selectedSurahId || isJumping) return;

        const targetAyah = parseInt(jumpAyahInput, 10);
        const surah = SURAH_DATA.find(s => s.number === selectedSurahId);
        
        if (surah && targetAyah > 0 && targetAyah <= surah.verses) {
            setIsJumping(true);
            try {
                await loadUntilAyah(targetAyah);
                const targetIndex = targetAyah - 1;
                
                requestAnimationFrame(() => {
                    virtuosoRef.current?.scrollToIndex({ index: targetIndex, align: 'start', behavior: 'auto' });
                });
                
                setJumpAyahInput("");
                (document.activeElement as HTMLElement)?.blur();
                
            } catch (err) {
                showToast("Gagal memuat ayat tujuan", "error");
            } finally {
                setIsJumping(false);
            }
        } else {
            showToast(`Nomor ayat tidak valid (1-${surah?.verses})`, "error");
        }
    };

    // Trigger Auto-Jump if input is pre-filled (e.g. from Resume) and Enter is pressed
    useEffect(() => {
        if (selectedSurahId && jumpAyahInput && lastRead && lastRead.surahId === selectedSurahId && lastRead.ayahNumber.toString() === jumpAyahInput) {
             handleJumpToAyah();
        }
    }, [selectedSurahId, jumpAyahInput]);

    const handleScrollProgress = useCallback((range: { startIndex: number; endIndex: number }) => {
        setVisibleRange(range);
    }, []);

    const itemRenderer = useCallback((index: number, ayah: QuranAyah) => (
        <div id={`ayah-${ayah.id}`}>
            <AyahRenderer
                ayah={ayah}
                globalIndex={index}
                isPlaying={playingAyahId === ayah.id}
                activeWordIndex={playingWordId ? ayah.words.findIndex(w => w.id === playingWordId) : null}
                wordMode={wordMode}
                fontSize={fontSize}
                showTranslation={showTranslation}
                onTapAyah={handleTapAyah}
                onLongPressAyah={handleLongPressAyah}
                onTapWord={handleTapWord}
                onLongPressWord={handleLongPressWord}
            />
        </div>
    ), [playingAyahId, playingWordId, wordMode, fontSize, showTranslation, handleTapAyah, handleLongPressAyah, handleTapWord, handleLongPressWord]);

    // Active Playing Info
    const activePlayingAyah = playingAyahId ? verses.find(v => v.id === playingAyahId) : null;
    const currentSurah = SURAH_DATA.find(s => s.number === selectedSurahId);

    // --- VIEW: SURAH SELECTION ---
    if (!selectedSurahId) {
        const lastReadSurah = lastRead ? SURAH_DATA.find(s => s.number === lastRead.surahId) : null;

        return (
            <div className="animate-fade-in pb-20 max-w-4xl mx-auto px-2">
                <div className="mb-6 text-center">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Mushaf Digital</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Baca Al-Quran dengan audio per kata & tajwid.</p>
                </div>

                {/* SEARCH */}
                <div className="relative mb-6 max-w-lg mx-auto">
                    <span className="absolute left-4 top-3.5 text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input 
                        type="text"
                        placeholder="Cari surat (Latin, Arti, atau Nomor)..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* RESUME READING CARD */}
                {lastRead && lastReadSurah && !searchTerm && (
                    <div className="mb-8 max-w-lg mx-auto animate-fade-in-down">
                        <button 
                            onClick={handleResume}
                            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-teal-500/20 flex items-center justify-between group hover:scale-[1.02] transition-transform"
                        >
                            <div className="text-left">
                                <p className="text-teal-100 text-xs font-bold uppercase tracking-wider mb-1">Terakhir Dibaca</p>
                                <h3 className="text-xl font-bold">{lastReadSurah.name}</h3>
                                <p className="text-sm opacity-90">Ayat {lastRead.ayahNumber}</p>
                            </div>
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </button>
                    </div>
                )}

                {/* QUICK LINKS */}
                {!searchTerm && (
                    <div className="mb-8">
                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 px-1">
                            Sering Dibaca
                        </h4>
                        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar -mx-2 px-2 snap-x">
                            {QUICK_LINKS.map((link) => (
                                <button
                                    key={link.number}
                                    onClick={() => { handleTap(); setSelectedSurahId(link.number); }}
                                    className={`flex-shrink-0 snap-start flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm border border-transparent hover:scale-105 transition-transform shadow-sm ${link.color}`}
                                >
                                    <span className="text-lg">{link.icon}</span>
                                    {link.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* LIST SURAH */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSurahs.map(surah => (
                        <button
                            key={surah.number}
                            onClick={() => {
                                handleTap();
                                setSelectedSurahId(surah.number);
                            }}
                            className="flex items-center p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md transition-all group text-left relative overflow-hidden"
                        >
                            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl flex items-center justify-center font-bold text-sm group-hover:bg-teal-600 group-hover:text-white transition-colors shrink-0 relative z-10">
                                {surah.number}
                            </div>
                            <div className="ml-4 flex-1 min-w-0 z-10">
                                <div className="flex justify-between items-baseline">
                                    <h4 className="font-bold text-slate-800 dark:text-white text-lg truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{surah.name}</h4>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">{surah.type}</span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{surah.arti} • {surah.verses} Ayat</p>
                            </div>
                            
                            <span className="absolute -right-2 -bottom-4 text-6xl font-bold text-slate-50 dark:text-slate-700/30 opacity-50 group-hover:opacity-100 group-hover:text-teal-50 dark:group-hover:text-teal-900/20 transition-all pointer-events-none">
                                {surah.number}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // --- VIEW: READER ---
    return (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col animate-fade-in select-none">
            {isSettingsOpen && (
                <MushafSettingsModal 
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    showTranslation={showTranslation}
                    setShowTranslation={setShowTranslation}
                    wordMode={wordMode}
                    setWordMode={setWordMode}
                    onClose={() => setIsSettingsOpen(false)}
                />
            )}

            <div className="w-full h-full flex flex-col max-w-3xl mx-auto relative bg-white dark:bg-slate-900 shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 shadow-sm transition-all pt-[env(safe-area-inset-top,0px)]">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800">
                        <div 
                            className="h-full bg-teal-500 transition-all duration-300 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center px-4 py-3">
                        <button 
                            onClick={() => { handleTap(); stopAudio(); setSelectedSurahId(null); }}
                            className="flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-2 rounded-xl transition-colors group flex-shrink-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-teal-500 transition-colors" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                            <div className="flex flex-col items-start">
                                <span className="font-bold text-sm leading-tight text-slate-800 dark:text-white">{currentSurah?.name}</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                                    {currentVisibleAyahNumber ? `Ayat ${currentVisibleAyahNumber}` : 'Memuat...'}
                                </span>
                            </div>
                        </button>

                        <div className="flex items-center gap-2">
                            {/* Jump to Ayah Input */}
                            <form onSubmit={handleJumpToAyah} className="relative hidden sm:block">
                                <input 
                                    type="number" 
                                    placeholder="Ke Ayat..." 
                                    className="w-24 pl-3 pr-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-50 disabled:cursor-wait"
                                    value={jumpAyahInput}
                                    onChange={(e) => setJumpAyahInput(e.target.value)}
                                    disabled={isJumping}
                                />
                                {isJumping && (
                                    <div className="absolute right-2 top-1.5">
                                        <div className="w-3 h-3 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </form>

                            <button
                                onClick={() => { handleTap(); setIsSettingsOpen(true); }}
                                className="p-2.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-100 dark:border-slate-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="flex-grow relative bg-white dark:bg-slate-900 w-full">
                    {error && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">{error}</p>
                            <button 
                                onClick={retry}
                                className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-lg hover:bg-teal-700 transition-all"
                            >
                                Coba Lagi
                            </button>
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
                            rangeChanged={handleScrollProgress}
                            overscan={500}
                            // Padding bottom for Sticky Player
                            className="pb-24" 
                            components={{
                                Header: () => currentSurah ? <SurahHeader surah={currentSurah} /> : null,
                                Footer: () => (
                                    <div className="py-20 px-4 text-center">
                                        {loading ? (
                                            <VersesSkeleton />
                                        ) : !hasMore ? (
                                            <div className="mt-4 mb-12">
                                                <div className="text-slate-400 text-sm italic mb-8 font-arabic opacity-70">صدق الله العظيم</div>
                                            </div>
                                        ) : null}
                                    </div>
                                )
                            }}
                            itemContent={itemRenderer}
                        />
                    )}
                </div>

                {/* STICKY AUDIO PLAYER (New) */}
                {isPlaying && activePlayingAyah && !wordMode && (
                    <div className="absolute bottom-0 left-0 right-0 z-40 animate-fade-in-up p-4 bg-gradient-to-t from-white dark:from-slate-900 via-white/90 dark:via-slate-900/90 to-transparent pt-12 pointer-events-none">
                        <div className="bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-xl text-white rounded-2xl p-4 shadow-2xl border border-slate-700/50 flex items-center gap-4 pointer-events-auto max-w-md mx-auto">
                            <div className="flex-1 min-w-0 pl-1">
                                <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider mb-0.5">Sedang Memutar</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold text-base truncate">
                                        QS {currentSurah?.name}
                                    </span>
                                    <span className="text-xs text-slate-400">Ayat {activePlayingAyah.verse_number}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {/* Visualizer */}
                                <div className="flex space-x-1 h-4 items-end">
                                    <span className="block w-1 bg-teal-500 rounded-full animate-[bounce_1s_infinite] h-full"></span>
                                    <span className="block w-1 bg-teal-500 rounded-full animate-[bounce_1.5s_infinite] h-2/3"></span>
                                    <span className="block w-1 bg-teal-500 rounded-full animate-[bounce_0.8s_infinite] h-3/4"></span>
                                    <span className="block w-1 bg-teal-500 rounded-full animate-[bounce_1.2s_infinite] h-1/2"></span>
                                </div>

                                <div className="h-8 w-[1px] bg-white/20"></div>

                                <button 
                                    onClick={() => stopAudio()}
                                    className="w-10 h-10 bg-white/10 hover:bg-red-500/20 rounded-full flex items-center justify-center transition-colors text-slate-300 hover:text-red-400"
                                    aria-label="Stop"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <KamusSheet 
                    data={kamusData} 
                    onClose={() => setKamusData(null)} 
                    onPlayAudio={(url) => playAudio(url, kamusData?.type === 'ayah' ? 'ayah' : 'word', 0)}
                />
            </div>
        </div>
    );
};

export default MushafApp;