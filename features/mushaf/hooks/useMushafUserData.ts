
import { useCallback } from 'react';
import { useLocalStorage } from '../../../hooks/useLocalStorage.ts';
import { useToast } from '../../../components/ui/Toast.tsx';
import type { Bookmark, LastReadState, QuranAyah, BookmarkCategory } from '../../../types.ts';

export const useMushafUserData = () => {
    const { showToast } = useToast();
    const [lastRead, setLastRead] = useLocalStorage<LastReadState | null>("mushaf_lastRead", null);
    const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>("mushaf_bookmarks_v2", []);

    // Auto-save last read (for scrolling)
    const saveLastRead = useCallback((surahId: number, ayahNumber: number) => {
        if (!lastRead || lastRead.surahId !== surahId || lastRead.ayahNumber !== ayahNumber) {
            setLastRead({
                surahId,
                ayahNumber,
                timestamp: Date.now()
            });
        }
    }, [lastRead, setLastRead]);

    // Manual save last read (via Button)
    const saveLastReadManual = useCallback((ayah: QuranAyah, surahId: number) => {
        setLastRead({
            surahId: surahId,
            ayahNumber: ayah.verse_number,
            timestamp: Date.now()
        });
        showToast("✨ Posisi terakhir disimpan", "success");
    }, [setLastRead, showToast]);

    const findBookmark = useCallback((surahId: number, ayahNumber: number): Bookmark | null => {
        return bookmarks.find(b => b.surahId === surahId && b.ayahNumber === ayahNumber) || null;
    }, [bookmarks]);

    const updateBookmark = useCallback((surahId: number, ayah: QuranAyah, category: BookmarkCategory | null) => {
        const ayahNumber = ayah.verse_number;
        const bookmarkId = `${surahId}:${ayahNumber}`;

        if (category === null) {
            setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
            showToast("Penanda dihapus", "info");
        } else {
            const existingBookmark = bookmarks.find(b => b.id === bookmarkId);
            if (existingBookmark) {
                setBookmarks(prev => prev.map(b => b.id === bookmarkId ? { ...b, category } : b));
                showToast("Kategori penanda diubah", "success");
            } else {
                const newBookmark: Bookmark = {
                    id: bookmarkId,
                    surahId,
                    ayahNumber,
                    timestamp: Date.now(),
                    category
                };
                setBookmarks(prev => [...prev, newBookmark].sort((a,b) => a.surahId - b.surahId || a.ayahNumber - b.ayahNumber));
                showToast("Penanda disimpan!", "success");
            }
        }
    }, [bookmarks, setBookmarks, showToast]);

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
