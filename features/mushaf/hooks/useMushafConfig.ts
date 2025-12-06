
import { useLocalStorage } from '../../../hooks/useLocalStorage.ts';
import { useToast } from '../../../components/ui/Toast.tsx';
import type { LastReadState, Bookmark, BookmarkCategory, QuranAyah } from '../../../types.ts';
import { useCallback } from 'react';

export const useMushafConfig = () => {
    const { showToast } = useToast();
    
    // Persistent Settings
    const [lastRead, setLastRead] = useLocalStorage<LastReadState | null>("mushaf_lastRead", null);
    const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>("mushaf_bookmarks_v2", []);
    const [fontSize, setFontSize] = useLocalStorage("mushaf_fontSize", 32);
    const [showTranslation, setShowTranslation] = useLocalStorage("mushaf_showTranslation", true);
    const [wordMode, setWordMode] = useLocalStorage("mushaf_wordMode", false);

    const handleSetLastRead = useCallback((ayah: QuranAyah, surahId: number) => {
        const newLastRead: LastReadState = {
            surahId: surahId,
            ayahNumber: ayah.verse_number,
            timestamp: Date.now()
        };
        setLastRead(newLastRead);
        showToast("✨ Posisi terakhir disimpan", "success");
    }, [setLastRead, showToast]);

    const findBookmark = useCallback((surahId: number, ayahNumber: number): Bookmark | null => {
        return bookmarks.find(b => b.surahId === surahId && b.ayahNumber === ayahNumber) || null;
    }, [bookmarks]);

    const updateBookmark = useCallback((ayah: QuranAyah, surahId: number, category: BookmarkCategory | null) => {
        const ayahNumber = ayah.verse_number;
        const bookmarkId = `${surahId}:${ayahNumber}`;

        if (category === null) {
            setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
            showToast("Penanda dihapus", "info");
        } else {
            const existingBookmark = bookmarks.find(b => b.surahId === surahId && b.ayahNumber === ayahNumber);
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
        lastRead, setLastRead,
        bookmarks, 
        fontSize, setFontSize,
        showTranslation, setShowTranslation,
        wordMode, setWordMode,
        handleSetLastRead,
        updateBookmark,
        removeBookmarkById,
        findBookmark
    };
};
