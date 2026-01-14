
import { useState, useEffect } from 'react';

export interface SurahInfo {
    number: number;
    name: string;
    verses: number;
    arti: string;
    type: 'Makkiyah' | 'Madaniyah';
}

interface SurahDataState {
    surahs: SurahInfo[];
    arabicNames: Record<string, string>;
    isLoading: boolean;
    error: string | null;
}

let cachedData: { surahs: SurahInfo[]; arabicNames: Record<string, string> } | null = null;
let cachedError: string | null = null;
let loadingPromise: Promise<void> | null = null;

/**
 * Hook to lazy-load surah data from JSON.
 * Data is cached globally to prevent duplicate fetches.
 */
export const useSurahData = (): SurahDataState => {
    const [state, setState] = useState<SurahDataState>({
        surahs: cachedData?.surahs || [],
        arabicNames: cachedData?.arabicNames || {},
        isLoading: !cachedData && !cachedError,
        error: cachedError,
    });

    useEffect(() => {
        // If data or error already exists, we are done
        if (cachedData || cachedError) {
            setState({
                surahs: cachedData?.surahs || [],
                arabicNames: cachedData?.arabicNames || {},
                isLoading: false,
                error: cachedError,
            });
            return;
        }

        let isMounted = true;

        const loadData = async () => {
            // Initialize fetch if not already in progress
            if (!loadingPromise) {
                loadingPromise = (async () => {
                    try {
                        const response = await fetch('/data/surahs.json');
                        if (!response.ok) throw new Error(`Failed to load surah data: ${response.status}`);

                        const data = await response.json();
                        cachedData = {
                            surahs: data.surahs,
                            arabicNames: data.arabicNames,
                        };
                        cachedError = null;
                    } catch (err) {
                        console.error("Surah data load failed:", err);
                        cachedError = err instanceof Error ? err.message : 'Unknown error';
                        cachedData = null;
                    }
                })();
            }

            // Wait for the shared promise to complete
            await loadingPromise;

            // Update local state if component is still mounted
            if (isMounted) {
                setState({
                    surahs: cachedData?.surahs || [],
                    arabicNames: cachedData?.arabicNames || {},
                    isLoading: false,
                    error: cachedError,
                });
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    return state;
};

/**
 * Utility functions for synchronous access when data is pre-loaded.
 * Use ONLY after ensuring data is loaded (e.g., after useSurahData returns isLoading: false).
 */
export const getSurahData = (): SurahInfo[] => cachedData?.surahs || [];
export const getArabicNames = (): Record<string, string> => cachedData?.arabicNames || {};
export const getSurahByNumber = (num: number): SurahInfo | undefined =>
    cachedData?.surahs.find(s => s.number === num);
