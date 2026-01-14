import React, { useCallback } from 'react';
import type { QuranAyah, QuranWord, KamusData, ReadingSession } from '../../../types.ts';
import { useSurahData } from '../../../hooks/useSurahData.ts';
import { audioService } from '../../../services/audio.service.ts';
import { getAyahAudioUrl, preloadAudio } from '../logic/mushaf.service.ts';

interface UseMushafInteractionsProps {
    session: ReadingSession | null;
    verses: QuranAyah[];
    wordMode: boolean;
    isPlaying: boolean;
    playingAyahId: number | null;
    playAudio: (url: string, type: 'ayah' | 'word', id: number) => void;
    stopAudio: () => void;
    findBookmark: (surahId: number, ayahNumber: number) => any;
    setKamusData: (data: KamusData | null) => void;
    virtuosoRef: React.RefObject<{ scrollToIndex: (opts: any) => void } | null>;
}

export const useMushafInteractions = ({
    session,
    verses,
    wordMode,
    isPlaying,
    playingAyahId,
    playAudio,
    stopAudio,
    findBookmark,
    setKamusData,
    virtuosoRef
}: UseMushafInteractionsProps) => {
    const { surahs: SURAH_DATA } = useSurahData();

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

        if (currentIndex !== -1 && virtuosoRef.current) {
            virtuosoRef.current.scrollToIndex({
                index: currentIndex,
                align: 'center',
                behavior: 'smooth'
            });
        }
    }, [session, verses, playAudio, virtuosoRef]);

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
        const [sIdStr] = ayah.verse_key.split(':');
        const sId = parseInt(sIdStr);
        const surah = SURAH_DATA.find(s => s.number === sId);

        setKamusData({
            type: 'ayah',
            data: ayah,
            surahInfo: {
                id: sId,
                name_complex: surah?.name || '',
                name_arabic: '',
                verses_count: 0,
                revelation_place: ''
            },
            reference: `QS ${sId}:${ayah.verse_number}`,
            bookmark: findBookmark(sId, ayah.verse_number)
        });
    }, [SURAH_DATA, findBookmark, setKamusData]);

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
    }, [setKamusData]);

    return {
        playAyahById,
        handleTapAyah,
        handleTapWord,
        handleLongPressAyah,
        handleLongPressWord
    };
};
