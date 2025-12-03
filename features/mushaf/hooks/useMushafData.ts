
import { useState, useRef, useCallback } from 'react';
import { fetchVersesWithWords } from '../logic/mushaf.service.ts';
import type { QuranAyah } from '../../../types.ts';

const PER_PAGE = 10; // Keep constant for consistency

export const useMushafData = (selectedSurahId: number | null) => {
    const [verses, setVerses] = useState<QuranAyah[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const abortControllerRef = useRef<AbortController | null>(null);

    const loadVerses = useCallback(async (targetPage: number, reset: boolean = false) => {
        if (!selectedSurahId) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);
        setError(null);
        
        if (reset) {
            setVerses([]);
            setHasMore(true);
            setPage(1);
        }

        try {
            const result = await fetchVersesWithWords(selectedSurahId, targetPage, PER_PAGE, controller.signal);
            
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
    }, [selectedSurahId]);

    const loadNextPage = useCallback(() => {
        if (!hasMore || loading) return;
        const nextPage = page + 1;
        setPage(nextPage);
        loadVerses(nextPage, false);
    }, [hasMore, loading, page, loadVerses]);

    const retry = useCallback(() => {
        loadVerses(page, false);
    }, [loadVerses, page]);

    // NEW: Concurrent Batching Strategy
    // Loads pages in chunks of 4 parallel requests to speed up deep jumps
    const loadUntilAyah = useCallback(async (targetAyah: number) => {
        if (!selectedSurahId || loading) return;

        const currentMaxAyah = verses.length > 0 ? verses[verses.length - 1].verse_number : 0;
        
        // If target is already loaded
        if (targetAyah <= currentMaxAyah) return; 

        const targetPage = Math.ceil(targetAyah / PER_PAGE);
        const currentPage = page;

        if (targetPage <= currentPage) return;

        setLoading(true);
        
        // Cancel pending single loads
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;
        
        try {
            const pagesToFetch = [];
            for (let p = currentPage + 1; p <= targetPage; p++) {
                pagesToFetch.push(p);
            }

            // OPTIMIZATION: Concurrent Batching
            // Fetch 4 pages at a time. Much faster than sequential, safe for API rate limits.
            const CHUNK_SIZE = 4;
            
            for (let i = 0; i < pagesToFetch.length; i += CHUNK_SIZE) {
                if (controller.signal.aborted) break;

                const chunk = pagesToFetch.slice(i, i + CHUNK_SIZE);
                
                // Fetch chunk in parallel
                const chunkResults = await Promise.all(
                    chunk.map(p => fetchVersesWithWords(selectedSurahId, p, PER_PAGE, controller.signal))
                );

                const accumulatedChunkVerses: QuranAyah[] = [];
                let hitEnd = false;

                // Flatten results (Promise.all preserves order)
                for (const result of chunkResults) {
                    accumulatedChunkVerses.push(...result.verses);
                    if (result.meta.next_page === null) {
                        hitEnd = true;
                    }
                }

                if (!controller.signal.aborted) {
                    // Update state incrementally so UI grows and doesn't feel stuck
                    setVerses(prev => [...prev, ...accumulatedChunkVerses]);
                    
                    // Update page tracking to the last page of this chunk
                    setPage(chunk[chunk.length - 1]);
                    
                    if (hitEnd) {
                        setHasMore(false);
                        break; 
                    }
                }
            }

        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error("Jump load failed", err);
                setError("Gagal memuat ayat untuk loncat.");
            }
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        }
    }, [selectedSurahId, loading, verses, page]);

    return {
        verses,
        loading,
        error,
        hasMore,
        loadVerses,
        loadNextPage,
        loadUntilAyah,
        retry
    };
};
