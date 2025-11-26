import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import { SURAH_DATA } from '../../constants.ts';
import { audioService } from '../../services/audio.service.ts';
import { getAyahAudioUrl } from '../../services/mushaf.service.ts';
import { AyahRenderer } from './AyahRenderer.tsx';
import { KamusSheet } from './KamusSheet.tsx';
import { MushafSettingsModal } from './MushafSettingsModal.tsx';
import { MushafHelpModal } from './MushafHelpModal.tsx';
import { SurahHeader } from './SurahHeader.tsx';
import { Modal } from '../Modal.tsx'; 
import type { QuranAyah, KamusData, QuranWord } from '../../types.ts';
import { useToast } from '../ui/Toast.tsx';
import { useDebounce } from '../../hooks/useDebounce.ts';
import { useLocalStorage } from '../../hooks/useLocalStorage.ts';
import { useMushafAudio } from '../../hooks/useMushafAudio.ts';
import { useMushafData } from '../../hooks/useMushafData.ts';

// Quick Links with distinct styling
const QUICK_LINKS = [
    { number: 18, label: 'Al-Kahfi', icon: '⛰️', gradient: 'from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40', text: 'text-amber-800 dark:text-amber-200' },
    { number: 36, label: 'Ya-Sin', icon: '❤️', gradient: 'from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40', text: 'text-rose-800 dark:text-rose-200' },
    { number: 55, label: 'Ar-Rahman', icon: '🎁', gradient: 'from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40', text: 'text-emerald-800 dark:text-emerald-200' },
    { number: 56, label: 'Al-Waqi\'ah', icon: '💰', gradient: 'from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40', text: 'text-indigo-800 dark:text-indigo-200' },
    { number: 67, label: 'Al-Mulk', icon: '🛡️', gradient: 'from-sky-100 to-cyan-100 dark:from-sky-900/40 dark:to-cyan-900/40', text: 'text-sky-800 dark:text-sky-200' },
    { number: 78, label: 'Juz 30', icon: '🎓', gradient: 'from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40', text: 'text-violet-800 dark:text-violet-200' }
];

// Skeleton Component for Loading State
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

interface LastReadState {
    surahId: number;
    ayahNumber: number;
    timestamp: number;
}

const MushafApp: React.FC = () => {
    const { showToast } = useToast();
    
    // Local Storage
    const [lastRead, setLastRead] = useLocalStorage<LastReadState | null>("mushaf_lastRead", null);
    const [fontSize, setFontSize] = useLocalStorage("mushaf_fontSize", 32);
    const [showTranslation, setShowTranslation] = useLocalStorage("mushaf_showTranslation", true);
    const [wordMode, setWordMode] = useLocalStorage("mushaf_wordMode", false);

    // Audio & Data Hooks
    const nextAyahHandler = useRef<() => void>(() => {});
    const { isPlaying, playingAyahId, playingWordId, playAudio, stopAudio } = useMushafAudio({
        onEnded: () => nextAyahHandler.current()
    });

    // Navigation & State
    const [selectedSurahId, setSelectedSurahId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);
    
    // Jumping State
    const [jumpAyahInput, setJumpAyahInput] = useState("");
    const [isJumping, setIsJumping] = useState(false);
    const [isJumpModalOpen, setIsJumpModalOpen] = useState(false); 

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false); // Tutorial State
    const [visibleRange, setVisibleRange] = useState({ startIndex: 0, endIndex: 0 });
    const [kamusData, setKamusData] = useState<KamusData | null>(null);

    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const jumpInputRef = useRef<HTMLInputElement>(null); 
    
    const { verses, loading, error, hasMore, loadVerses, loadNextPage, loadUntilAyah, retry } = useMushafData(selectedSurahId);

    // Check Tutorial Seen
    useEffect(() => {
        const hasSeen = localStorage.getItem('nizamy_mushaf_tutorial_seen');
        if (!hasSeen && selectedSurahId) {
            setIsHelpOpen(true);
        }
    }, [selectedSurahId]);

    const closeHelp = () => {
        localStorage.setItem('nizamy_mushaf_tutorial_seen', 'true');
        setIsHelpOpen(false);
    };

    // --- AUDIO LOGIC ---
    const playAyahById = useCallback((ayah: QuranAyah) => {
        const url = getAyahAudioUrl(selectedSurahId!, ayah.verse_number);
        playAudio(url, 'ayah', ayah.id);
        
        const index = verses.findIndex(v => v.id === ayah.id);
        if (index !== -1 && virtuosoRef.current) {
            virtuosoRef.current.scrollToIndex({ index, align: 'center', behavior: 'smooth' });
        }
    }, [selectedSurahId, verses, playAudio]);

    useEffect(() => {
        nextAyahHandler.current = () => {
            if (!playingAyahId || verses.length === 0) return;
            const currentIndex = verses.findIndex(v => v.id === playingAyahId);
            if (currentIndex !== -1 && currentIndex < verses.length - 1) {
                playAyahById(verses[currentIndex + 1]);
            } else {
                stopAudio();
                if (hasMore) {
                    showToast("Memuat ayat berikutnya...", "info");
                    loadNextPage(); 
                } else {
                    showToast("Akhir surat.", "success");
                }
            }
        };
    }, [playingAyahId, verses, hasMore, stopAudio, loadNextPage, playAyahById, showToast]);

    // --- LAST READ LOGIC ---
    useEffect(() => {
        if (!selectedSurahId || verses.length === 0) return;
        const saveTimeout = setTimeout(() => {
            if (visibleRange.startIndex >= 0 && verses[visibleRange.startIndex]) {
                setLastRead({
                    surahId: selectedSurahId,
                    ayahNumber: verses[visibleRange.startIndex].verse_number,
                    timestamp: Date.now()
                });
            }
        }, 1000);
        return () => clearTimeout(saveTimeout);
    }, [visibleRange.startIndex, selectedSurahId, verses, setLastRead]);

    // --- INIT & NAVIGATION ---
    useEffect(() => {
        if (selectedSurahId) {
            loadVerses(1, true);
            setVisibleRange({ startIndex: 0, endIndex: 0 });
            setJumpAyahInput(""); 
            setTimeout(() => {
                virtuosoRef.current?.scrollToIndex({ index: 0, align: 'start' });
            }, 50);
        }
    }, [selectedSurahId, loadVerses]);

    // Auto-focus modal input
    useEffect(() => {
        if (isJumpModalOpen && jumpInputRef.current) {
            setTimeout(() => jumpInputRef.current?.focus(), 100);
        }
    }, [isJumpModalOpen]);

    const handleJumpToAyah = async (e?: React.FormEvent) => {
        if(e) e.preventDefault();
        if (!jumpAyahInput || !selectedSurahId || isJumping) return;

        const targetAyah = parseInt(jumpAyahInput, 10);
        const surah = SURAH_DATA.find(s => s.number === selectedSurahId);
        
        if (surah && targetAyah > 0 && targetAyah <= surah.verses) {
            setIsJumping(true);
            setIsJumpModalOpen(false); // Close modal immediately
            try {
                await loadUntilAyah(targetAyah);
                requestAnimationFrame(() => {
                    virtuosoRef.current?.scrollToIndex({ index: targetAyah - 1, align: 'start', behavior: 'auto' });
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

    // --- RENDER HELPERS ---
    const progressPercent = useMemo(() => {
        if (!selectedSurahId) return 0;
        const surahInfo = SURAH_DATA.find(s => s.number === selectedSurahId);
        if (!surahInfo) return 0;
        return Math.min(100, ((visibleRange.endIndex) / surahInfo.verses) * 100);
    }, [selectedSurahId, visibleRange]);

    const currentVisibleAyahNumber = useMemo(() => {
        if (verses.length > 0 && verses[verses.length - 1]) {
            // Use endIndex to show current reading position more accurately during scroll
            // But for the header, startIndex is safer to show "What's at the top"
            if (verses[visibleRange.startIndex]) {
                return verses[visibleRange.startIndex].verse_number;
            }
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

    const handleTapAyah = useCallback((ayah: QuranAyah) => {
        if (wordMode) return;
        if (playingAyahId === ayah.id && isPlaying) {
            stopAudio();
        } else {
            playAyahById(ayah);
        }
    }, [wordMode, playingAyahId, isPlaying, stopAudio, playAyahById]);

    const handleTapWord = useCallback((word: QuranWord) => {
        if (!wordMode || word.char_type_name !== 'word' || !word.audio_url) return;
        playAudio(word.audio_url, 'word', word.id);
    }, [wordMode, playAudio]);

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
        let isEndAyah = false;

        if (parentAyah) {
            const wordsList = parentAyah.words.filter(w => w.char_type_name !== 'end');
            const currentIndex = wordsList.findIndex(w => w.id === word.id);
            
            if (currentIndex !== -1) {
                // Check next word for Tajwid
                if (currentIndex < wordsList.length - 1) {
                    nextWordText = wordsList[currentIndex + 1].text_uthmani;
                }
                // Check if this is the last real word (Tajwid Waqaf context)
                if (currentIndex === wordsList.length - 1) {
                    isEndAyah = true;
                }
            }
        }
        setKamusData({ type: 'word', data: word, nextWordText, isEndAyah });
    }, []);

    // --- VIEW: SURAH LIST ---
    if (!selectedSurahId) {
        const lastReadSurah = lastRead ? SURAH_DATA.find(s => s.number === lastRead.surahId) : null;

        return (
            <div className="animate-fade-in pb-20 max-w-5xl mx-auto px-3">
                {/* Only show title on Desktop to save mobile space */}
                <div className="text-center mb-8 mt-4 hidden md:block">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">Mushaf Digital</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">Baca Al-Quran dengan nyaman, audio per kata & tajwid interaktif.</p>
                </div>

                {/* Search Bar - Adjusted margin for mobile */}
                <div className="relative mb-8 max-w-xl mx-auto group mt-4 md:mt-0">
                    <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative">
                        <span className="absolute left-5 top-4 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </span>
                        <input 
                            type="text"
                            placeholder="Cari surat (Latin, Arti, atau Nomor)..."
                            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg shadow-slate-200/50 dark:shadow-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-slate-800 dark:text-white font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Last Read */}
                {lastRead && lastReadSurah && !searchTerm && (
                    <div className="mb-10 max-w-xl mx-auto animate-fade-in-down">
                        <button 
                            onClick={() => { setSelectedSurahId(lastRead.surahId); setTimeout(() => setJumpAyahInput(lastRead.ayahNumber.toString()), 500); }}
                            className="w-full relative overflow-hidden bg-slate-900 rounded-3xl p-6 text-white shadow-2xl group text-left"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl translate-x-10 -translate-y-10 group-hover:bg-teal-500/30 transition-all"></div>
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-2">Lanjut Membaca</p>
                                    <h3 className="text-2xl font-bold mb-1">{lastReadSurah.name}</h3>
                                    <p className="text-slate-400 text-sm">Ayat {lastRead.ayahNumber}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform border border-white/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                </div>
                            </div>
                        </button>
                    </div>
                )}

                {/* Quick Links */}
                {!searchTerm && (
                    <div className="mb-10">
                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 pl-2">Sering Dibaca</h4>
                        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar snap-x px-2">
                            {QUICK_LINKS.map((link) => (
                                <button
                                    key={link.number}
                                    onClick={() => setSelectedSurahId(link.number)}
                                    className={`flex-shrink-0 snap-start flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm bg-gradient-to-br ${link.gradient} ${link.text} hover:scale-105 transition-transform shadow-sm border border-white/20 dark:border-white/5 min-w-[140px]`}
                                >
                                    <span className="text-xl">{link.icon}</span>
                                    {link.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Surah Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSurahs.map(surah => (
                        <button
                            key={surah.number}
                            onClick={() => setSelectedSurahId(surah.number)}
                            className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 transition-all hover:shadow-lg hover:shadow-teal-500/10 text-left overflow-hidden"
                        >
                            <div className="absolute -right-4 -bottom-4 text-8xl font-bold text-slate-50 dark:text-slate-800 group-hover:text-teal-50 dark:group-hover:text-teal-900/20 transition-colors pointer-events-none opacity-50">
                                {surah.number}
                            </div>
                            
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-serif font-bold flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-colors shadow-sm border border-slate-200 dark:border-slate-600 group-hover:border-teal-400">
                                    {surah.number}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-bold text-slate-800 dark:text-white text-lg group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate pr-2">{surah.name}</h4>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-full">{surah.type}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{surah.arti} • {surah.verses} Ayat</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const currentSurah = SURAH_DATA.find(s => s.number === selectedSurahId);
    const activePlayingAyah = playingAyahId ? verses.find(v => v.id === playingAyahId) : null;

    // --- VIEW: READER ---
    return (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col animate-fade-in select-none">
            {/* Vertical Progress Ribbon (Left Side) - Adjusted Top Position to start below header */}
            <div className="fixed left-0 top-[calc(4rem+env(safe-area-inset-top))] bottom-0 w-1.5 z-20 bg-slate-100 dark:bg-slate-800/50 pointer-events-none">
                <div 
                    className="relative w-full bg-teal-500 transition-all duration-500 ease-out rounded-b-full"
                    style={{ height: `${progressPercent}%` }}
                >
                    {/* Bead/Tip for Bookmark effect */}
                    <div className="absolute -bottom-1.5 -left-0.5 w-2.5 h-2.5 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.8)] border border-teal-200 dark:border-teal-900"></div>
                </div>
            </div>

            {/* Navigation Bar */}
            <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 pt-[env(safe-area-inset-top)]">
                <div className="flex justify-between items-center px-4 py-3 max-w-5xl mx-auto w-full pl-6 md:pl-4">
                    <button 
                        onClick={() => { stopAudio(); setSelectedSurahId(null); }}
                        className="flex items-center gap-3 group"
                    >
                        <div className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 group-hover:text-teal-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </div>
                        <div>
                            <h1 className="font-bold text-base text-slate-800 dark:text-white leading-tight">{currentSurah?.name}</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                {currentVisibleAyahNumber ? `Ayat ${currentVisibleAyahNumber}` : 'Memuat...'}
                            </p>
                        </div>
                    </button>

                    <div className="flex items-center gap-2">
                        {/* Desktop Jump Input */}
                        <form onSubmit={handleJumpToAyah} className="relative hidden sm:block">
                            <input 
                                type="number" 
                                placeholder="Ke Ayat..." 
                                className="w-28 pl-3 pr-2 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                value={jumpAyahInput}
                                onChange={(e) => setJumpAyahInput(e.target.value)}
                                disabled={isJumping}
                            />
                        </form>

                        {/* Mobile Jump Trigger */}
                        <button 
                            onClick={() => setIsJumpModalOpen(true)}
                            className="sm:hidden p-2.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            aria-label="Loncat ke Ayat"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* Help Trigger (New) */}
                        <button
                            onClick={() => setIsHelpOpen(true)}
                            className="p-2.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            aria-label="Bantuan"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>

                        {/* Settings Trigger */}
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Reader Area with Left Padding for Progress Bar */}
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
                        rangeChanged={(range) => setVisibleRange(range)}
                        overscan={500}
                        className="pb-32 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]"
                        components={{
                            Header: () => currentSurah ? <SurahHeader surah={currentSurah} /> : null,
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
                                    onTapAyah={handleTapAyah}
                                    onLongPressAyah={handleLongPressAyah}
                                    onTapWord={handleTapWord}
                                    onLongPressWord={handleLongPressWord}
                                />
                            </div>
                        )}
                    />
                )}
            </div>

            {/* Sticky Player */}
            {isPlaying && activePlayingAyah && !wordMode && (
                <div className="absolute bottom-0 left-0 right-0 z-40 p-4 pb-8 bg-gradient-to-t from-white dark:from-slate-950 via-white/95 dark:via-slate-950/95 to-transparent pt-12 pl-6">
                    <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-2xl p-4 shadow-2xl shadow-slate-900/20 border border-slate-700/50 flex items-center gap-4 max-w-md mx-auto backdrop-blur-xl">
                        <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 animate-pulse">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" /></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-0.5">Sedang Memutar</p>
                            <div className="flex items-baseline gap-2">
                                <span className="font-bold truncate">QS {currentSurah?.name}</span>
                                <span className="text-xs text-slate-400">Ayat {activePlayingAyah.verse_number}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => stopAudio()}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                </div>
            )}

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

            {isHelpOpen && (
                <MushafHelpModal onClose={closeHelp} />
            )}

            {/* Mobile Jump Modal */}
            {isJumpModalOpen && (
                <Modal isOpen={true} onClose={() => setIsJumpModalOpen(false)} title="Loncat ke Ayat" maxWidth="max-w-sm">
                    <div className="p-6">
                        <form onSubmit={(e) => { handleJumpToAyah(e); }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Masukkan Nomor Ayat (1-{currentSurah?.verses})
                                </label>
                                <input 
                                    ref={jumpInputRef}
                                    type="number" 
                                    inputMode="numeric"
                                    placeholder="Contoh: 25" 
                                    className="w-full p-4 text-xl font-bold text-center bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                                    value={jumpAyahInput}
                                    onChange={(e) => setJumpAyahInput(e.target.value)}
                                    disabled={isJumping}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsJumpModalOpen(false)}
                                    className="flex-1 py-3 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isJumping || !jumpAyahInput}
                                    className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isJumping ? 'Memuat...' : 'Pergi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}

            <KamusSheet 
                data={kamusData} 
                onClose={() => setKamusData(null)} 
                onPlayAudio={(url) => playAudio(url, kamusData?.type === 'ayah' ? 'ayah' : 'word', 0)}
            />
        </div>
    );
};

export default MushafApp;