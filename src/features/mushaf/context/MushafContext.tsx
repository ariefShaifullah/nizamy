
import React, { createContext, useContext, useState } from 'react';
import { useLocalStorage } from '../../../hooks/useLocalStorage.ts';

interface MushafContextType {
    fontSize: number;
    setFontSize: (size: number) => void;
    showTranslation: boolean;
    setShowTranslation: (show: boolean) => void;
    wordMode: boolean;
    setWordMode: (mode: boolean) => void;
}

const MushafContext = createContext<MushafContextType | undefined>(undefined);

export const useMushafSettings = () => {
    const context = useContext(MushafContext);
    if (!context) {
        throw new Error('useMushafSettings must be used within a MushafProvider');
    }
    return context;
};

export const MushafProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [fontSize, setFontSize] = useLocalStorage("mushaf_fontSize", 32);
    const [showTranslation, setShowTranslation] = useLocalStorage("mushaf_showTranslation", true);
    const [wordMode, setWordMode] = useLocalStorage("mushaf_wordMode", false);

    return (
        <MushafContext.Provider value={{
            fontSize, setFontSize,
            showTranslation, setShowTranslation,
            wordMode, setWordMode
        }}>
            {children}
        </MushafContext.Provider>
    );
};
