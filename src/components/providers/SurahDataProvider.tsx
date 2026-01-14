import React, { useEffect, useState, ReactNode } from 'react';
import { useSurahData } from '../../hooks/useSurahData.ts';

interface SurahDataProviderProps {
    children: ReactNode;
}

/**
 * Provider that preloads surah data on app initialization.
 * This ensures synchronous getters (SURAH_DATA, ARABIC_SURAH_NAMES) work in components.
 */
export const SurahDataProvider: React.FC<SurahDataProviderProps> = ({ children }) => {
    const { isLoading, error } = useSurahData();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            setIsReady(true);
        }
    }, [isLoading]);

    // Optional: Show loading state while surah data loads
    // For now, render children immediately since data loads fast
    // and proxies handle the initial empty state gracefully

    if (error) {
        console.error('Failed to load surah data:', error);
    }

    return <>{children}</>;
};
