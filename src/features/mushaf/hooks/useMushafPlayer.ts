
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { audioService } from '../../../services/audio.service.ts';
import { getAyahAudioUrl, preloadAudio } from '../logic/mushaf.service.ts';
import { useMushafAudio } from './useMushafAudio.ts';
import { useToast } from '../../../components/ui/Toast.tsx';
import type { QuranAyah, ReadingSession } from '../../../types.ts';

interface UseMushafPlayerReturn {
    // Audio state
    isPlaying: boolean;
    playingAyahId: number | null;
    playingWordId: number | null;
    progress: number;

    // Active playing info
    activePlayingAyah: QuranAyah | null;
    playingSurahName: string;
    playingSurahNum: number;
    playingAyahNum: number;

    // Actions
    playAyahById: (ayah: QuranAyah) => void;
    handleNextTrack: () => void;
    handlePrevTrack: () => void;
    togglePlayPause: () => void;
    stopAudio: () => void;
    playAudio: (url: string, type: 'ayah' | 'word', id: number) => void;
}

interface UseMushafPlayerProps {
    session: ReadingSession | null;
    verses: QuranAyah[];
    hasMore: boolean;
    loadNextPage: () => void;
    currentSurahName: string;
    getSurahByNumber: (num: number) => { name: string } | undefined;
}

/**
 * Extracted hook for managing Mushaf audio playback.
 * Handles play/pause, track navigation, and prefetching.
 */
export const useMushafPlayer = ({
    session,
    verses,
    hasMore,
    loadNextPage,
    currentSurahName,
    getSurahByNumber,
}: UseMushafPlayerProps): UseMushafPlayerReturn => {
    const { showToast } = useToast();

    // Next ayah callback ref
    const nextAyahHandler = useRef<() => void>(() => { });

    // Core audio hook
    const { isPlaying, playingAyahId, playingWordId, progress, playAudio, stopAudio } = useMushafAudio({
        onEnded: () => {
            if (nextAyahHandler.current) nextAyahHandler.current();
        }
    });

    // Play a specific ayah
    const playAyahById = useCallback((ayah: QuranAyah) => {
        if (!session) return;

        const [surahIdStr, ayahNumStr] = ayah.verse_key.split(':');
        const sId = parseInt(surahIdStr);
        const aNum = parseInt(ayahNumStr);

        const url = getAyahAudioUrl(sId, aNum);
        playAudio(url, 'ayah', ayah.id);

        // Smart prefetch next ayah
        const currentIndex = verses.findIndex(v => v.id === ayah.id);
        if (currentIndex !== -1 && currentIndex < verses.length - 1) {
            const nextAyah = verses[currentIndex + 1];
            const [nSId, nANum] = nextAyah.verse_key.split(':');
            const nextUrl = getAyahAudioUrl(parseInt(nSId), parseInt(nANum));
            preloadAudio(nextUrl);
        }
    }, [session, verses, playAudio]);

    // Next track
    const handleNextTrack = useCallback(() => {
        if (!playingAyahId || verses.length === 0) return;
        const currentIndex = verses.findIndex(v => v.id === playingAyahId);
        if (currentIndex !== -1 && currentIndex < verses.length - 1) {
            playAyahById(verses[currentIndex + 1]);
        } else if (hasMore) {
            showToast("Memuat ayat berikutnya...", "info");
            loadNextPage();
        } else {
            showToast("Akhir bacaan.", "info");
            stopAudio();
        }
    }, [playingAyahId, verses, hasMore, loadNextPage, playAyahById, stopAudio, showToast]);

    // Previous track
    const handlePrevTrack = useCallback(() => {
        if (!playingAyahId || verses.length === 0) return;
        const currentIndex = verses.findIndex(v => v.id === playingAyahId);
        if (currentIndex > 0) {
            playAyahById(verses[currentIndex - 1]);
        } else {
            showToast("Awal bacaan.", "info");
        }
    }, [playingAyahId, verses, playAyahById, showToast]);

    // Toggle play/pause
    const togglePlayPause = useCallback(() => {
        if (isPlaying) {
            stopAudio();
        } else {
            if (playingAyahId) {
                const ayah = verses.find(v => v.id === playingAyahId);
                if (ayah) playAyahById(ayah);
            }
        }
    }, [isPlaying, playingAyahId, stopAudio, verses, playAyahById]);

    // Update next track handler
    useEffect(() => {
        nextAyahHandler.current = handleNextTrack;
    }, [handleNextTrack]);

    // Compute active playing info
    const activePlayingAyah = playingAyahId ? verses.find(v => v.id === playingAyahId) : null;

    const { playingSurahName, playingSurahNum, playingAyahNum } = useMemo(() => {
        let surahName = currentSurahName;
        let surahNum = session?.id || 0;
        let ayahNum = 0;

        if (activePlayingAyah) {
            const [sIdStr, aNumStr] = activePlayingAyah.verse_key.split(':');
            surahNum = parseInt(sIdStr);
            ayahNum = parseInt(aNumStr);
            const s = getSurahByNumber(surahNum);
            if (s) surahName = s.name;
        }

        return { playingSurahName: surahName, playingSurahNum: surahNum, playingAyahNum: ayahNum };
    }, [activePlayingAyah, currentSurahName, session, getSurahByNumber]);

    return {
        isPlaying,
        playingAyahId,
        playingWordId,
        progress,
        activePlayingAyah,
        playingSurahName,
        playingSurahNum,
        playingAyahNum,
        playAyahById,
        handleNextTrack,
        handlePrevTrack,
        togglePlayPause,
        stopAudio,
        playAudio,
    };
};
