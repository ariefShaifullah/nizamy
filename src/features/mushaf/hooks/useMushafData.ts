
import { useState, useRef, useCallback, useEffect } from 'react';
import { fetchVersesWithWords } from '../logic/mushaf.service.ts';
import type { QuranAyah, ReadingSession } from '../../../types.ts';

const PER_PAGE = 10;

export const useMushafData = (session: ReadingSession | null) => {
    const [verses, setVerses] = useState<QuranAyah[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);

    // 1. AUTO RESET when session changes
    useEffect(() => {
        setVerses([]);
        setPage(1);
        setHasMore(true);
        setLoading(false);
        setError(null);
    }, [session?.type, session?.id]);

    const loadVerses = useCallback(async (targetPage: number, reset: boolean = false) => {
        if (!session) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);
        setError(null);

        try {
            const result = await fetchVersesWithWords(session.type, session.id, targetPage, PER_PAGE, controller.signal);

            if (!controller.signal.aborted) {
                if (reset) {
                    setVerses(result.verses);
                } else {
                    setVerses(prev => [...prev, ...result.verses]);
                }

                if (result.meta.next_page === null) {
                    setHasMore(false);
                }
                setLoading(false);
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error(err);
                setError("Gagal memuat data. Periksa koneksi internet.");
                setLoading(false);
            }
        }
    }, [session]);

    const loadNextPage = useCallback(() => {
        if (!hasMore || loading) return;
        const nextPage = page + 1;
        setPage(nextPage);
        loadVerses(nextPage, false);
    }, [hasMore, loading, page, loadVerses]);

    const retry = useCallback(() => {
        loadVerses(page, false);
    }, [loadVerses, page]);

    // 2. DIRECT JUMP WITH CONTEXT
    // Fix: Instead of loading just the target page, we load ALL pages from 1 to targetPage.
    // This ensures the user can scroll UP to the beginning of the Surah.
    const jumpToPage = useCallback(async (targetAyahNumber: number): Promise<number> => {
        if (!session) return -1;

        // Calculate needed page (1-based)
        const targetPage = Math.ceil(targetAyahNumber / PER_PAGE);

        setLoading(true);
        setVerses([]); // Clear current list

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            // Create array of pages [1, 2, ..., targetPage]
            // We fetch all preceding pages so the virtual list has the full context from Ayah 1.
            const pagesToFetch = Array.from({ length: targetPage }, (_, i) => i + 1);

            // Fetch concurrently
            const results = await Promise.all(
                pagesToFetch.map(p => fetchVersesWithWords(session.type, session.id, p, PER_PAGE, controller.signal))
            );

            if (!controller.signal.aborted) {
                // Combine all verses
                const allVerses = results.flatMap(r => r.verses);
                const lastResult = results[results.length - 1];

                setVerses(allVerses);
                setPage(targetPage);
                setHasMore(lastResult.meta.next_page !== null);
                setLoading(false);

                // Find index of target ayah in the complete list
                // Since we loaded from Page 1, the index should simply be ayahNumber - 1 (if data is perfect),
                // but finding it by ID/Number is safer.
                const indexInList = allVerses.findIndex(v => v.verse_number === targetAyahNumber);
                return indexInList !== -1 ? indexInList : 0;
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error("Jump failed", err);
                setError("Gagal memuat ayat.");
                setLoading(false);
            }
        }
        return -1;
    }, [session]);

    // 3. SEQUENTIAL FINDER (Fallback for Juz Mode or complex cases)
    const findAndLoadVerse = useCallback(async (targetKey: string): Promise<number> => {
        if (!session || loading) return -1;

        // Check memory first
        let foundIndex = verses.findIndex(v => v.verse_key === targetKey);
        if (foundIndex !== -1) return foundIndex;

        if (!hasMore) return -1;

        setLoading(true);

        if (abortControllerRef.current) abortControllerRef.current.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        let currentPage = page + 1;
        if (verses.length === 0) currentPage = 1;

        try {
            // Concurrent fetch for speed (fetch 3 pages ahead)
            const CHUNK_SIZE = 3;

            while (true) {
                if (controller.signal.aborted) break;

                const chunkPages = [];
                for (let i = 0; i < CHUNK_SIZE; i++) chunkPages.push(currentPage + i);

                const chunkResults = await Promise.all(
                    chunkPages.map(p => fetchVersesWithWords(session.type, session.id, p, PER_PAGE, controller.signal))
                );

                const newVerses: QuranAyah[] = [];
                let hitEnd = false;

                for (const res of chunkResults) {
                    newVerses.push(...res.verses);
                    if (res.meta.next_page === null) hitEnd = true;
                }

                if (!controller.signal.aborted) {
                    setVerses(prev => [...prev, ...newVerses]);
                    setPage(chunkPages[chunkPages.length - 1]);

                    const matchInBatch = newVerses.findIndex(v => v.verse_key === targetKey);

                    if (matchInBatch !== -1) {
                        setLoading(false);
                        return verses.length + matchInBatch;
                    }

                    if (hitEnd) {
                        setHasMore(false);
                        break;
                    }

                    currentPage += CHUNK_SIZE;
                }
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error("Deep search failed", err);
                setError("Gagal mencari ayat.");
            }
        } finally {
            if (!controller.signal.aborted) setLoading(false);
        }
        return -1;
    }, [session, loading, verses, page, hasMore]);

    return {
        verses,
        loading,
        error,
        hasMore,
        loadVerses,
        loadNextPage,
        findAndLoadVerse,
        jumpToPage, // New capability
        retry
    };
};
