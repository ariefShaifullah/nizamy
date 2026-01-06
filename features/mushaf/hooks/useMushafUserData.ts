
import { useCallback } from 'react';
import { useLocalStorage } from '../../../hooks/useLocalStorage.ts';
import { useToast } from '../../../components/ui/Toast.tsx';
import type { Bookmark, LastReadState, QuranAyah, BookmarkCategory } from '../../../types.ts';

export const useMushafUserData = () => {
    const { showToast } = useToast();
    const [lastRead, setLastRead] = useLocalStorage<LastReadState | null>("mushaf_lastRead", null);
    const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>("mushaf_bookmarks_v2", []);

    // Auto-save last read (for scrolling)
    const saveLastRead = useCallback((surahId: number, ayahNumber: number, mode: 'surah' | 'juz' = 'surah', juzId?: number) => {
        if (!lastRead || lastRead.surahId !== surahId || lastRead.ayahNumber !== ayahNumber || lastRead.mode !== mode) {
            setLastRead({
                mode,
                surahId,
                juzId,
                ayahNumber,
                timestamp: Date.now()
            });
        }
    }, [lastRead, setLastRead]);

    // Manual save last read (via Button in KamusSheet)
    // FIX: Added mode and juzId params so manual save respects the current viewing mode
    const saveLastReadManual = useCallback((ayah: QuranAyah, surahId: number, mode: 'surah' | 'juz' = 'surah', juzId?: number) => {
        setLastRead({
            mode, 
            surahId: surahId,
            juzId,
            ayahNumber: ayah.verse_number,
            timestamp: Date.now()
        });
        showToast("✨ Posisi terakhir disimpan", "success");
    }, [setLastRead, showToast]);

    const findBookmark = useCallback((surahId: number, ayahNumber: number): Bookmark | null => {
        return bookmarks.find(b => b.surahId === surahId && b.ayahNumber === ayahNumber) || null;
    }, [bookmarks]);

    // Update Bookmark Logic
    const updateBookmark = useCallback((
        surahId: number, 
        ayah: QuranAyah, 
        category: BookmarkCategory | null,
        mode: 'surah' | 'juz' = 'surah',
        juzId?: number
    ) => {
        const ayahNumber = ayah.verse_number;
        const bookmarkId = `${surahId}:${ayahNumber}`;

        if (category === null) {
            setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
            showToast("Penanda dihapus", "info");
        } else {
            setBookmarks(prev => {
                const existingIndex = prev.findIndex(b => b.id === bookmarkId);
                const newBookmark: Bookmark = {
                    id: bookmarkId,
                    surahId,
                    ayahNumber,
                    timestamp: Date.now(),
                    category,
                    mode,  // Save the context (Juz/Surah)
                    juzId  // Save the Juz ID if applicable
                };

                if (existingIndex >= 0) {
                    // Update existing
                    const updated = [...prev];
                    updated[existingIndex] = newBookmark;
                    return updated;
                } else {
                    // Add new and sort
                    return [...prev, newBookmark].sort((a,b) => a.surahId - b.surahId || a.ayahNumber - b.ayahNumber);
                }
            });
            showToast("Penanda disimpan!", "success");
        }
    }, [setBookmarks, showToast]);

    const removeBookmarkById = useCallback((bookmarkId: string) => {
        setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
        showToast("Penanda dihapus", "info");
    }, [setBookmarks, showToast]);

    return {
        lastRead,
        bookmarks,
        saveLastRead,
        saveLastReadManual,
        findBookmark,
        updateBookmark,
        removeBookmarkById
    };
};
