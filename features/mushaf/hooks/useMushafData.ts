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

    // New Function: Load data up to specific ayah efficiently
    const loadUntilAyah = useCallback(async (targetAyah: number) => {
        if (!selectedSurahId || loading) return;

        const currentMaxAyah = verses.length > 0 ? verses[verses.length - 1].verse_number : 0;
        
        // Assumption: We append data. If targetAyah is less than the last loaded ayah, 
        // we assume it's already loaded (simplification for Infinite Scroll).
        if (targetAyah <= currentMaxAyah) return; 

        const targetPage = Math.ceil(targetAyah / PER_PAGE);
        const currentPage = page;

        if (targetPage <= currentPage) return;

        setLoading(true);
        
        // Cancel any pending single page loads to avoid race conditions
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        try {
            // Create array of pages to fetch: e.g. Page 2, 3, 4, 5
            // Fetching in parallel is much faster than sequential for jumps
            const pagesToFetch = [];
            for (let p = currentPage + 1; p <= targetPage; p++) {
                pagesToFetch.push(p);
            }

            const promises = pagesToFetch.map(p => fetchVersesWithWords(selectedSurahId, p, PER_PAGE));
            const results = await Promise.all(promises);

            // Combine all new verses in order
            const newVerses = results.flatMap(r => r.verses);
            
            setVerses(prev => [...prev, ...newVerses]);
            setPage(targetPage);
            
            // Update hasMore based on the last result
            if (results.length > 0) {
                const lastResult = results[results.length - 1];
                if (lastResult.meta.next_page === null) {
                    setHasMore(false);
                }
            }

        } catch (err: any) {
            console.error("Jump load failed", err);
            setError("Gagal memuat ayat untuk loncat.");
        } finally {
            setLoading(false);
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