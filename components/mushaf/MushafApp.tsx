
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { type VirtuosoHandle } from 'react-virtuoso';
import { SURAH_DATA } from '../../constants.ts';
import { audioService } from '../../services/audio.service.ts';
import { getAyahAudioUrl } from '../../services/mushaf.service.ts';
import { KamusSheet } from './KamusSheet.tsx';
import { MushafSettingsModal } from './MushafSettingsModal.tsx';
import { MushafHelpModal } from './MushafHelpModal.tsx';
import { Modal } from '../Modal.tsx'; 
import type { QuranAyah, KamusData, QuranWord, LastReadState } from '../../types.ts';
import { useToast } from '../ui/Toast.tsx';
import { useLocalStorage } from '../../hooks/useLocalStorage.ts';
import { useMushafAudio } from '../../hooks/useMushafAudio.ts';
import { useMushafData } from '../../hooks/useMushafData.ts';
import { FaArrowLeft, FaHashtag, FaQuestionCircle, FaCog } from 'react-icons/fa';

// Sub-components
import { SurahSelection } from './SurahSelection.tsx';
import { MushafReader } from './MushafReader.tsx';
import { MushafStickyPlayer } from './MushafStickyPlayer.tsx';

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

    const handleJumpToLastRead = () => {
        if (lastRead) {
            setSelectedSurahId(lastRead.surahId);
            setTimeout(() => setJumpAyahInput(lastRead.ayahNumber.toString()), 500);
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
            if (verses[visibleRange.startIndex]) {
                return verses[visibleRange.startIndex].verse_number;
            }
        }
        return null;
    }, [visibleRange, verses]);

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
                if (currentIndex < wordsList.length - 1) {
                    nextWordText = wordsList[currentIndex + 1].text_uthmani;
                }
                if (currentIndex === wordsList.length - 1) {
                    isEndAyah = true;
                }
            }
        }
        setKamusData({ type: 'word', data: word, nextWordText, isEndAyah });
    }, []);

    // --- VIEW: SURAH LIST ---
    if (!selectedSurahId) {
        return (
            <SurahSelection 
                lastRead={lastRead} 
                onSelectSurah={setSelectedSurahId} 
                onJumpToLastRead={handleJumpToLastRead}
            />
        );
    }

    const currentSurah = SURAH_DATA.find(s => s.number === selectedSurahId)!;
    const activePlayingAyah = playingAyahId ? verses.find(v => v.id === playingAyahId) : null;

    // --- VIEW: READER ---
    return (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col animate-fade-in select-none">
            {/* Vertical Progress Ribbon (Left Side) */}
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
                        <div className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 group-hover:text-teal-600 transition-colors icon-wrapper w-10 h-10 flex items-center justify-center">
                            <FaArrowLeft />
                        </div>
                        <div>
                            <h1 className="font-bold text-base text-slate-800 dark:text-white leading-tight">{currentSurah.name}</h1>
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
                            className="sm:hidden p-2.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors icon-wrapper w-10 h-10 flex items-center justify-center"
                            aria-label="Loncat ke Ayat"
                        >
                            <FaHashtag />
                        </button>

                        {/* Help Trigger */}
                        <button
                            onClick={() => setIsHelpOpen(true)}
                            className="p-2.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors icon-wrapper w-10 h-10 flex items-center justify-center"
                            aria-label="Bantuan"
                        >
                            <FaQuestionCircle />
                        </button>

                        {/* Settings Trigger */}
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors icon-wrapper w-10 h-10 flex items-center justify-center"
                        >
                            <FaCog />
                        </button>
                    </div>
                </div>
            </div>

            {/* Reader Area */}
            <MushafReader
                surah={currentSurah}
                verses={verses}
                loading={loading}
                error={error}
                hasMore={hasMore}
                loadNextPage={loadNextPage}
                retry={retry}
                virtuosoRef={virtuosoRef}
                onRangeChange={setVisibleRange}
                isPlaying={isPlaying}
                playingAyahId={playingAyahId}
                playingWordId={playingWordId}
                wordMode={wordMode}
                fontSize={fontSize}
                showTranslation={showTranslation}
                onTapAyah={handleTapAyah}
                onLongPressAyah={handleLongPressAyah}
                onTapWord={handleTapWord}
                onLongPressWord={handleLongPressWord}
            />

            {/* Sticky Player */}
            {isPlaying && activePlayingAyah && !wordMode && (
                <MushafStickyPlayer
                    surahName={currentSurah.name}
                    ayahNumber={activePlayingAyah.verse_number}
                    onStop={() => stopAudio()}
                />
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
                                    Masukkan Nomor Ayat (1-{currentSurah.verses})
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
