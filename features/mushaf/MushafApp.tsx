
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { type VirtuosoHandle } from 'react-virtuoso';
import { SURAH_DATA } from '../../constants.ts';
import { audioService } from '../../services/audio.service.ts';
import { getAyahAudioUrl, preloadAudio } from './logic/mushaf.service.ts';
import { KamusSheet } from './components/KamusSheet.tsx';
import { MushafSettingsModal } from './components/MushafSettingsModal.tsx';
import { MushafHelpModal } from './components/MushafHelpModal.tsx';
import { Modal } from '../../components/ui/Modal.tsx'; 
import type { QuranAyah, KamusData, QuranWord, BookmarkCategory } from '../../types.ts';
import { useToast } from '../../components/ui/Toast.tsx';
import { useMushafAudio } from './hooks/useMushafAudio.ts';
import { useMushafData } from './hooks/useMushafData.ts';
import { useMushafUserData } from './hooks/useMushafUserData.ts';
import { useWakeLock } from '../../hooks/useWakeLock.ts';
import { useRouter } from '../../hooks/useRouter.ts';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHashtag, FaQuestionCircle, FaCog, FaBookmark } from 'react-icons/fa';
import { PageLoader } from '../../components/ui/PageLoader.tsx';

// Sub-components
import { SurahSelection } from './components/SurahSelection.tsx';
import { MushafReader } from './components/MushafReader.tsx';
import { MushafStickyPlayer } from './components/MushafStickyPlayer.tsx';
import { MushafProvider, useMushafSettings } from './context/MushafContext.tsx';

// --- WRAPPER COMPONENT FOR CONTEXT ---
const MushafAppContent: React.FC = () => {
    const { showToast } = useToast();
    const { searchParams } = useRouter();
    const navigate = useNavigate();
    
    // Consume Context
    const { wordMode } = useMushafSettings();
    
    // Custom Hooks
    const { 
        lastRead, 
        bookmarks, 
        saveLastRead, 
        saveLastReadManual, 
        findBookmark, 
        updateBookmark, 
        removeBookmarkById 
    } = useMushafUserData();

    // Audio Hook
    const nextAyahHandler = useRef<() => void>(() => {});
    const { isPlaying, playingAyahId, playingWordId, progress, playAudio, stopAudio } = useMushafAudio({
        onEnded: () => {
            if (nextAyahHandler.current) nextAyahHandler.current();
        }
    });

    // Navigation & State
    const [selectedSurahId, setSelectedSurahId] = useState<number | null>(null);
    const { requestLock, releaseLock } = useWakeLock();

    // Jumping State
    const [jumpAyahInput, setJumpAyahInput] = useState("");
    const [isJumping, setIsJumping] = useState(false);
    const [isJumpModalOpen, setIsJumpModalOpen] = useState(false); 
    
    // New: Specific state for initial jump target
    const [initialAyahTarget, setInitialAyahTarget] = useState<number | null>(null);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false); 
    const [kamusData, setKamusData] = useState<KamusData | null>(null);
    
    const [visibleAyahNumber, setVisibleAyahNumber] = useState<number | null>(null);

    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const jumpInputRef = useRef<HTMLInputElement>(null); 
    
    const { verses, loading, error, hasMore, loadVerses, loadNextPage, loadUntilAyah, retry } = useMushafData(selectedSurahId);

    // Dynamic Title Effect
    const currentSurah = useMemo(() => SURAH_DATA.find(s => s.number === selectedSurahId), [selectedSurahId]);
    useEffect(() => {
        if (currentSurah) {
            document.title = `Surat ${currentSurah.name} - NIZAMY Mushaf`;
        } else {
            document.title = `NIZAMY | Mushaf Digital & Kamus Tajwid`;
        }
    }, [currentSurah]);

    // Tutorial Check
    useEffect(() => {
        const hasSeen = localStorage.getItem('nizamy_mushaf_tutorial_seen');
        if (!hasSeen && selectedSurahId) {
            setIsHelpOpen(true);
        }
    }, [selectedSurahId]);

    // --- DEEP LINK / QUERY PARAM HANDLING ---
    useEffect(() => {
        const surahParam = searchParams.get('surah');
        const ayahParam = searchParams.get('ayah');
        const queryParam = searchParams.get('q'); 

        if (queryParam) {
            setSelectedSurahId(null);
            return;
        }

        if (surahParam) {
            const surahId = parseInt(surahParam, 10);
            if (!isNaN(surahId) && surahId >= 1 && surahId <= 114) {
                // If switching Surah or Initial Load
                if (surahId !== selectedSurahId) {
                    if (ayahParam) {
                        const ayahId = parseInt(ayahParam, 10);
                        if (!isNaN(ayahId)) {
                            setInitialAyahTarget(ayahId);
                        }
                    } else {
                        setInitialAyahTarget(null);
                    }
                    setSelectedSurahId(surahId);
                } 
                // If Same Surah, but changing Ayah (In-App Jump)
                else if (ayahParam) {
                    const ayahId = parseInt(ayahParam, 10);
                    if (!isNaN(ayahId)) {
                        handleInternalJump(ayahId);
                    }
                }
            }
        }
    }, [searchParams]);

    // Used for jumps AFTER initial load (scrolling)
    const handleInternalJump = async (targetAyah: number) => {
        if (isJumping) return;
        setIsJumping(true);
        showToast(`Melompat ke ayat ${targetAyah}...`, 'info');
        try {
            await loadUntilAyah(targetAyah);
            setTimeout(() => {
                requestAnimationFrame(() => {
                    virtuosoRef.current?.scrollToIndex({ 
                        index: targetAyah - 1, 
                        align: 'center', // Put it in the middle for better context
                        behavior: 'smooth' 
                    });
                });
            }, 100);
        } catch (err) {
            showToast("Gagal memuat posisi.", "error");
        } finally {
            setIsJumping(false);
        }
    };

    // Handle Wake Lock
    useEffect(() => {
        if (selectedSurahId) {
            requestLock();
        } else {
            releaseLock();
        }
        return () => {
            releaseLock();
        };
    }, [selectedSurahId, requestLock, releaseLock]);

    const closeHelp = () => {
        localStorage.setItem('nizamy_mushaf_tutorial_seen', 'true');
        setIsHelpOpen(false);
    };

    // --- AUDIO LOGIC ---
    const playAyahById = useCallback((ayah: QuranAyah) => {
        if (!selectedSurahId) return;
        const url = getAyahAudioUrl(selectedSurahId, ayah.verse_number);
        playAudio(url, 'ayah', ayah.id);
        
        // --- SMART PREFETCH ---
        const currentIndex = verses.findIndex(v => v.id === ayah.id);
        if (currentIndex !== -1 && currentIndex < verses.length - 1) {
            const nextAyah = verses[currentIndex + 1];
            const nextUrl = getAyahAudioUrl(selectedSurahId, nextAyah.verse_number);
            preloadAudio(nextUrl);
        }

        // Scroll to active
        if (currentIndex !== -1 && virtuosoRef.current) {
            virtuosoRef.current.scrollToIndex({ index: currentIndex, align: 'center', behavior: 'smooth' });
        }
    }, [selectedSurahId, verses, playAudio]);

    const handleNextTrack = useCallback(() => {
        if (!playingAyahId || verses.length === 0) return;
        const currentIndex = verses.findIndex(v => v.id === playingAyahId);
        if (currentIndex !== -1 && currentIndex < verses.length - 1) {
            playAyahById(verses[currentIndex + 1]);
        } else if (hasMore) {
            showToast("Memuat ayat berikutnya...", "info");
            loadNextPage();
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

    // --- VISIBILITY TRACKING ENGINE ---
    useEffect(() => {
        if (!visibleAyahNumber || !selectedSurahId) return;

        const saveTimeout = setTimeout(() => {
            saveLastRead(selectedSurahId, visibleAyahNumber);
        }, 2000); 

        return () => clearTimeout(saveTimeout);
    }, [visibleAyahNumber, selectedSurahId, saveLastRead]);

    // --- JUMP/NAV LOGIC ---
    const jumpTo = (surahId: number, ayahNumber: number) => {
        // Clean navigation to trigger re-mount logic in effect
        navigate(`/mushaf?surah=${surahId}&ayah=${ayahNumber}`);
    };

    // --- INIT VIEW LOGIC ---
    useEffect(() => {
        if (selectedSurahId) {
            const initReader = async () => {
                // If there's an initial target, we must load ENOUGH verses to reach it immediately.
                if (initialAyahTarget) {
                    setIsJumping(true);
                    try {
                        // Batch load until target is available in memory
                        await loadUntilAyah(initialAyahTarget);
                    } catch (e) {
                        console.error("Jump load failed", e);
                    } finally {
                        setIsJumping(false);
                    }
                } else {
                    // Standard load page 1
                    await loadVerses(1, true);
                }
                setJumpAyahInput(""); 
            };
            initReader();
        }
    }, [selectedSurahId]); 

    useEffect(() => {
        if (isJumpModalOpen && jumpInputRef.current) {
            setTimeout(() => jumpInputRef.current?.focus(), 150);
        }
    }, [isJumpModalOpen]);

    const handleJumpToAyah = async (e?: React.FormEvent) => {
        if(e) e.preventDefault();
        if (!jumpAyahInput || !selectedSurahId || isJumping) return;

        const targetAyah = parseInt(jumpAyahInput, 10);
        const surah = SURAH_DATA.find(s => s.number === selectedSurahId);
        
        if (surah && targetAyah > 0 && targetAyah <= surah.verses) {
            setIsJumpModalOpen(false);
            setJumpAyahInput("");
            navigate(`/mushaf?surah=${selectedSurahId}&ayah=${targetAyah}`);
        } else {
            showToast(`Nomor ayat tidak valid (1-${surah?.verses})`, "error");
        }
    };

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
            reference: `QS ${selectedSurahId}:${ayah.verse_number}`,
            bookmark: findBookmark(selectedSurahId, ayah.verse_number)
        });
    }, [selectedSurahId, currentSurah, findBookmark]);

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
        setKamusData({ type: 'word', data: word, nextWordText, isEndAyah, bookmark: null });
    }, []);

    // Wrapper to update bookmark and close sheet
    const handleUpdateBookmark = (ayah: QuranAyah, category: BookmarkCategory | null) => {
        if (!selectedSurahId) return;
        updateBookmark(selectedSurahId, ayah, category);
        setKamusData(null);
    };

    // Wrapper for Save Last Read Manual
    const handleSetLastReadManual = (ayah: QuranAyah) => {
        if (!selectedSurahId) return;
        saveLastReadManual(ayah, selectedSurahId);
        setKamusData(null);
    };

    if (!selectedSurahId || !currentSurah) {
        return (
            <SurahSelection 
                lastRead={lastRead}
                bookmarks={bookmarks}
                onSelectSurah={(id) => navigate(`/mushaf?surah=${id}`)}
                onJumpToLastRead={() => {
                    if(lastRead) jumpTo(lastRead.surahId, lastRead.ayahNumber);
                }}
                onJumpToBookmark={(surahId, ayahNumber) => jumpTo(surahId, ayahNumber)}
                onRemoveBookmark={removeBookmarkById}
                initialSearchQuery={searchParams.get('q') || ''} 
            />
        );
    }

    const progressPercent = currentSurah && visibleAyahNumber 
        ? (visibleAyahNumber / currentSurah.verses) * 100 
        : 0;

    const activePlayingAyah = playingAyahId ? verses.find(v => v.id === playingAyahId) : null;

    // Wait until verses array contains the initial target before rendering Reader
    // BUG FIX: Added `&& loading` check. 
    // If loading finishes but verses.length is still less than target (edge case),
    // we stop blocking so user doesn't get stuck on spinner.
    if (initialAyahTarget && verses.length < initialAyahTarget && loading) {
        return (
            <PageLoader isFullScreen message={`Menyiapkan Ayat ${initialAyahTarget}...`} />
        );
    }

    return (
        <div className="fixed inset-0 z-header bg-white dark:bg-slate-950 flex flex-col animate-fade-in select-none">
            {isJumping && (
                <div className="fixed inset-0 z-loading flex items-center justify-center bg-black/20 backdrop-blur-[1px] pointer-events-none">
                    <div className="bg-white dark:bg-slate-800 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100 dark:border-slate-700 animate-fade-in-up">
                        <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-bold text-slate-700 dark:text-white text-sm">Melompat ke ayat...</p>
                    </div>
                </div>
            )}

            <div className="fixed left-0 top-[calc(4rem+env(safe-area-inset-top))] bottom-0 w-1 z-dropdown bg-slate-100 dark:bg-slate-800/50 pointer-events-none">
                <div 
                    className="relative w-full bg-teal-500 transition-all duration-500 ease-out rounded-b-full opacity-80"
                    style={{ height: `${progressPercent}%` }}
                ></div>
            </div>

            <div className="sticky top-0 z-tooltip bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 pt-[env(safe-area-inset-top)]">
                <div className="flex justify-between items-center px-4 py-3 max-w-3xl mx-auto w-full">
                    <button 
                        onClick={() => { stopAudio(); setSelectedSurahId(null); setInitialAyahTarget(null); navigate('/mushaf'); }}
                        className="flex items-center gap-3 group p-1 pr-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                    >
                        <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:shadow-sm transition-all icon-wrapper w-8 h-8 flex items-center justify-center">
                            <FaArrowLeft />
                        </div>
                        <div>
                            <h1 className="font-bold text-base text-slate-800 dark:text-white leading-none">{currentSurah.name}</h1>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 uppercase tracking-wide">
                                {visibleAyahNumber ? `Ayat ${visibleAyahNumber}` : 'Memuat...'}
                            </p>
                        </div>
                    </button>

                    <div className="flex items-center gap-1">
                        {lastRead && lastRead.surahId === selectedSurahId && (
                           <button 
                                onClick={() => {
                                    setJumpAyahInput(String(lastRead.ayahNumber));
                                    setTimeout(() => handleJumpToAyah(), 0);
                                }}
                                className="p-2.5 rounded-xl text-teal-500 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 transition-colors"
                                aria-label="Lompat ke Penanda"
                                title={`Lompat ke Ayat ${lastRead.ayahNumber}`}
                           >
                               <div className="icon-wrapper w-4 h-4"><FaBookmark /></div>
                           </button>
                        )}
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

            <MushafReader
                // CRITICAL: Changing key forces remount when Surah changes,
                // ensuring `initialTopMostItemIndex` is respected on new mount.
                key={selectedSurahId} 
                surah={currentSurah}
                verses={verses}
                loading={loading}
                error={error}
                hasMore={hasMore}
                loadNextPage={loadNextPage}
                retry={retry}
                virtuosoRef={virtuosoRef}
                onVisibleAyahChange={setVisibleAyahNumber}
                // Pass the initial index (0-based) for native jump on mount
                initialIndex={initialAyahTarget ? initialAyahTarget - 1 : 0}
                lastRead={lastRead}
                bookmarks={bookmarks}
                isPlaying={isPlaying}
                playingAyahId={playingAyahId}
                playingWordId={playingWordId}
                onTapAyah={handleTapAyah}
                onLongPressAyah={handleLongPressAyah}
                onTapWord={handleTapWord}
                onLongPressWord={handleLongPressWord}
            />

            {isPlaying && activePlayingAyah && (
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
                    onClose={() => setIsSettingsOpen(false)}
                />
            )}

            {isHelpOpen && (
                <MushafHelpModal onClose={closeHelp} />
            )}

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
                onPlayAudio={(url) => playAudio(url, kamusData?.type === 'ayah' ? 'ayah' : 'word', kamusData?.data.id || 0)}
                onSetLastRead={handleSetLastReadManual}
                onUpdateBookmark={handleUpdateBookmark}
            />
        </div>
    );
};

export default function MushafApp() {
    return (
        <MushafProvider>
            <MushafAppContent />
        </MushafProvider>
    );
}
