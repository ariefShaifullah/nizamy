
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { type VirtuosoHandle } from 'react-virtuoso';
import { SURAH_DATA } from '../../constants.ts';
import { audioService } from '../../services/audio.service.ts';
import { getAyahAudioUrl } from './logic/mushaf.service.ts';
import { KamusSheet } from './components/KamusSheet.tsx';
import { MushafSettingsModal } from './components/MushafSettingsModal.tsx';
import { MushafHelpModal } from './components/MushafHelpModal.tsx';
import { Modal } from '../../components/ui/Modal.tsx'; 
import type { QuranAyah, KamusData, QuranWord, LastReadState } from '../../types.ts';
import { useToast } from '../../components/ui/Toast.tsx';
import { useLocalStorage } from '../../hooks/useLocalStorage.ts';
import { useMushafAudio } from './hooks/useMushafAudio.ts';
import { useMushafData } from './hooks/useMushafData.ts';
import { FaArrowLeft, FaHashtag, FaQuestionCircle, FaCog } from 'react-icons/fa';

// Sub-components
import { SurahSelection } from './components/SurahSelection.tsx';
import { MushafReader } from './components/MushafReader.tsx';
import { MushafStickyPlayer } from './components/MushafStickyPlayer.tsx';

const MushafApp: React.FC = () => {
    const { showToast } = useToast();
    
    // Local Storage
    const [lastRead, setLastRead] = useLocalStorage<LastReadState | null>("mushaf_lastRead", null);
    const [fontSize, setFontSize] = useLocalStorage("mushaf_fontSize", 32);
    const [showTranslation, setShowTranslation] = useLocalStorage("mushaf_showTranslation", true);
    const [wordMode, setWordMode] = useLocalStorage("mushaf_wordMode", false);

    // Audio & Data Hooks
    const nextAyahHandler = useRef<() => void>(() => {});
    
    const { isPlaying, playingAyahId, playingWordId, progress, playAudio, stopAudio } = useMushafAudio({
        onEnded: () => {
            if (nextAyahHandler.current) nextAyahHandler.current();
        }
    });

    // Navigation & State
    const [selectedSurahId, setSelectedSurahId] = useState<number | null>(null);
    
    // Jumping State
    const [jumpAyahInput, setJumpAyahInput] = useState("");
    const [isJumping, setIsJumping] = useState(false);
    const [isJumpModalOpen, setIsJumpModalOpen] = useState(false); 
    const [pendingJumpAyah, setPendingJumpAyah] = useState<number | null>(null);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false); 
    const [visibleRange, setVisibleRange] = useState({ startIndex: 0, endIndex: 0 });
    const [kamusData, setKamusData] = useState<KamusData | null>(null);

    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const jumpInputRef = useRef<HTMLInputElement>(null); 
    
    const { verses, loading, error, hasMore, loadVerses, loadNextPage, loadUntilAyah, retry } = useMushafData(selectedSurahId);

    // Tutorial Check
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
        
        // Auto-scroll to active ayah with offset
        const index = verses.findIndex(v => v.id === ayah.id);
        if (index !== -1 && virtuosoRef.current) {
            virtuosoRef.current.scrollToIndex({ index, align: 'center', behavior: 'smooth' });
        }
    }, [selectedSurahId, verses, playAudio]);

    // Next/Prev Logic
    const handleNextTrack = useCallback(() => {
        if (!playingAyahId || verses.length === 0) return;
        const currentIndex = verses.findIndex(v => v.id === playingAyahId);
        if (currentIndex !== -1 && currentIndex < verses.length - 1) {
            playAyahById(verses[currentIndex + 1]);
        } else if (hasMore) {
            showToast("Memuat ayat berikutnya...", "info");
            loadNextPage();
            // Listener in effect will handle playing next when loaded if we track state
        } else {
            showToast("Akhir surat.", "info");
            stopAudio();
        }
    }, [playingAyahId, verses, hasMore, loadNextPage, playAyahById, stopAudio, showToast]);

    const handlePrevTrack = useCallback(() => {
        if (!playingAyahId || verses.length === 0) return;
        const currentIndex = verses.findIndex(v => v.id === playingAyahId);
        if (currentIndex > 0) {
            playAyahById(verses[currentIndex - 1]);
        } else {
            showToast("Awal surat.", "info");
        }
    }, [playingAyahId, verses, playAyahById, showToast]);

    const togglePlayPause = useCallback(() => {
        if (isPlaying) {
            stopAudio();
        } else {
            if (playingAyahId) {
                const ayah = verses.find(v => v.id === playingAyahId);
                if(ayah) playAyahById(ayah);
            }
        }
    }, [isPlaying, playingAyahId, stopAudio, verses, playAyahById]);

    useEffect(() => {
        nextAyahHandler.current = handleNextTrack;
    }, [handleNextTrack]);

    // --- LAST READ SAVER ---
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

    // --- INIT VIEW & HANDLE JUMP ---
    useEffect(() => {
        if (selectedSurahId) {
            const initReader = async () => {
                await loadVerses(1, true);
                setVisibleRange({ startIndex: 0, endIndex: 0 });
                setJumpAyahInput(""); 

                if (pendingJumpAyah) {
                    showToast(`Melompat ke ayat ${pendingJumpAyah}...`, 'info');
                    try {
                        if (pendingJumpAyah > 10) {
                            await loadUntilAyah(pendingJumpAyah);
                        }
                        
                        // Use requestAnimationFrame for robust UI update after data load
                        requestAnimationFrame(() => {
                            setTimeout(() => {
                                virtuosoRef.current?.scrollToIndex({ 
                                    index: pendingJumpAyah - 1, 
                                    align: 'start', 
                                    behavior: 'auto' 
                                });
                                setPendingJumpAyah(null);
                            }, 100);
                        });
                    } catch (err) {
                        console.error(err);
                        showToast("Gagal memuat posisi terakhir.", "error");
                    }
                } else {
                    // Small delay to ensure virtualizer is mounted
                    requestAnimationFrame(() => {
                        virtuosoRef.current?.scrollToIndex({ index: 0, align: 'start' });
                    });
                }
            };

            initReader();
        }
    }, [selectedSurahId]);

    useEffect(() => {
        if (isJumpModalOpen && jumpInputRef.current) {
            // Wait for modal animation
            setTimeout(() => jumpInputRef.current?.focus(), 150);
        }
    }, [isJumpModalOpen]);

    const handleJumpToAyah = async (e?: React.FormEvent) => {
        if(e) e.preventDefault();
        if (!jumpAyahInput || !selectedSurahId || isJumping) return;

        const targetAyah = parseInt(jumpAyahInput, 10);
        const surah = SURAH_DATA.find(s => s.number === selectedSurahId);
        
        if (surah && targetAyah > 0 && targetAyah <= surah.verses) {
            setIsJumping(true);
            setIsJumpModalOpen(false); 
            
            try {
                // Preload data if needed
                await loadUntilAyah(targetAyah);
                
                requestAnimationFrame(() => {
                    virtuosoRef.current?.scrollToIndex({ 
                        index: targetAyah - 1, 
                        align: 'start', 
                        behavior: 'smooth' 
                    });
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

    const currentSurah = useMemo(() => SURAH_DATA.find(s => s.number === selectedSurahId), [selectedSurahId]);
    
    const progressPercent = useMemo(() => {
        if (!currentSurah) return 0;
        return Math.min(100, ((visibleRange.endIndex) / currentSurah.verses) * 100);
    }, [currentSurah, visibleRange]);

    const currentVisibleAyahNumber = useMemo(() => {
        if (verses.length > 0 && verses[visibleRange.startIndex]) {
            return verses[visibleRange.startIndex].verse_number;
        }
        return null;
    }, [visibleRange, verses]);

    // Interaction Handlers
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
        if (!selectedSurahId) return;
        
        setKamusData({
            type: 'ayah',
            data: ayah,
            surahInfo: {
                id: selectedSurahId,
                name_complex: currentSurah?.name || '',
                name_arabic: '',
                verses_count: 0,
                revelation_place: ''
            },
            reference: `QS ${selectedSurahId}:${ayah.verse_number}`
        });
    }, [selectedSurahId, currentSurah]);

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

    if (!selectedSurahId || !currentSurah) {
        return (
            <SurahSelection 
                lastRead={lastRead} 
                onSelectSurah={setSelectedSurahId} 
                onJumpToLastRead={() => {
                    if(lastRead) {
                        setPendingJumpAyah(lastRead.ayahNumber); 
                        setSelectedSurahId(lastRead.surahId);
                    }
                }}
            />
        );
    }

    const activePlayingAyah = playingAyahId ? verses.find(v => v.id === playingAyahId) : null;

    return (
        // Update z-index to 60 to stay above Main Header (z-50)
        <div className="fixed inset-0 z-[60] bg-white dark:bg-slate-950 flex flex-col animate-fade-in select-none">
            {/* Progress Ribbon */}
            <div className="fixed left-0 top-[calc(4rem+env(safe-area-inset-top))] bottom-0 w-1 z-20 bg-slate-100 dark:bg-slate-800/50 pointer-events-none">
                <div 
                    className="relative w-full bg-teal-500 transition-all duration-500 ease-out rounded-b-full opacity-80"
                    style={{ height: `${progressPercent}%` }}
                ></div>
            </div>

            {/* Navigation Header */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 pt-[env(safe-area-inset-top)]">
                <div className="flex justify-between items-center px-4 py-3 max-w-3xl mx-auto w-full">
                    <button 
                        onClick={() => { stopAudio(); setSelectedSurahId(null); setPendingJumpAyah(null); }}
                        className="flex items-center gap-3 group p-1 pr-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                    >
                        <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:shadow-sm transition-all icon-wrapper w-8 h-8 flex items-center justify-center">
                            <FaArrowLeft />
                        </div>
                        <div>
                            <h1 className="font-bold text-base text-slate-800 dark:text-white leading-none">{currentSurah.name}</h1>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 uppercase tracking-wide">
                                {currentVisibleAyahNumber ? `Ayat ${currentVisibleAyahNumber}` : 'Memuat...'}
                            </p>
                        </div>
                    </button>

                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => setIsJumpModalOpen(true)}
                            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Loncat ke Ayat"
                            title="Loncat ke Ayat"
                        >
                            <div className="icon-wrapper w-4 h-4"><FaHashtag /></div>
                        </button>

                        <button
                            onClick={() => setIsHelpOpen(true)}
                            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Bantuan"
                        >
                            <div className="icon-wrapper w-4 h-4"><FaQuestionCircle /></div>
                        </button>

                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="icon-wrapper w-4 h-4"><FaCog /></div>
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

            {/* Floating Sticky Player (New Dock Design) */}
            {isPlaying && activePlayingAyah && !wordMode && (
                <MushafStickyPlayer
                    surahName={currentSurah.name}
                    surahNumber={currentSurah.number}
                    ayahNumber={activePlayingAyah.verse_number}
                    isPlaying={isPlaying}
                    progress={progress}
                    onTogglePlay={togglePlayPause}
                    onNext={handleNextTrack}
                    onPrev={handlePrevTrack}
                    onClose={() => stopAudio()}
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

            {/* Unified Jump Modal */}
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
