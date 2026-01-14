
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouter } from '../../../hooks/useRouter.ts';
import { useToast } from '../../../components/ui/Toast.tsx';
import { getSurahData, type SurahInfo } from '../../../hooks/useSurahData.ts';
import type { ReadingSession } from '../../../types.ts';

interface UseMushafSessionReturn {
    session: ReadingSession | null;
    setSession: React.Dispatch<React.SetStateAction<ReadingSession | null>>;
    currentSurahName: string;

    // Jump Modal State
    jumpAyahInput: string;
    setJumpAyahInput: React.Dispatch<React.SetStateAction<string>>;
    isJumping: boolean;
    isJumpModalOpen: boolean;
    setIsJumpModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    jumpInputRef: React.RefObject<HTMLInputElement>;

    // Initial navigation state
    initialTargetKey: string | null;
    initialListIndex: number | null;
    setInitialListIndex: React.Dispatch<React.SetStateAction<number | null>>;

    // Actions
    jumpTo: (surahId: number, ayahNumber: number, mode?: 'surah' | 'juz', juzId?: number) => void;
    handleJumpToAyah: (e?: React.FormEvent) => Promise<void>;
    resetSession: () => void;
}

/**
 * Extracted hook for managing Mushaf session state and navigation.
 * Handles URL deep-linking, session switching, and jump navigation.
 */
export const useMushafSession = (): UseMushafSessionReturn => {
    const { showToast } = useToast();
    const { searchParams } = useRouter();
    const navigate = useNavigate();

    // Session State
    const [session, setSession] = useState<ReadingSession | null>(null);

    // Jump State
    const [jumpAyahInput, setJumpAyahInput] = useState("");
    const [isJumping, setIsJumping] = useState(false);
    const [isJumpModalOpen, setIsJumpModalOpen] = useState(false);
    const [initialTargetKey, setInitialTargetKey] = useState<string | null>(null);
    const [initialListIndex, setInitialListIndex] = useState<number | null>(null);

    const jumpInputRef = useRef<HTMLInputElement>(null);

    // Compute current surah name
    const currentSurahName = (() => {
        if (!session) return "NIZAMY Mushaf";
        const surahs = getSurahData();
        if (session.type === 'surah') {
            const s = surahs.find((x: SurahInfo) => x.number === session.id);
            return s ? `Surat ${s.name}` : `Surat ${session.id}`;
        }
        return `Juz ${session.id}`;
    })();

    // Dynamic Title Effect
    useEffect(() => {
        document.title = `${currentSurahName} - NIZAMY`;
    }, [currentSurahName]);

    // Focus jump input when modal opens
    useEffect(() => {
        if (isJumpModalOpen && jumpInputRef.current) {
            setTimeout(() => jumpInputRef.current?.focus(), 150);
        }
    }, [isJumpModalOpen]);

    // Deep Link / Query Param Handling
    useEffect(() => {
        const surahParam = searchParams.get('surah');
        const juzParam = searchParams.get('juz');
        const ayahParam = searchParams.get('ayah');
        const queryParam = searchParams.get('q');

        if (queryParam) {
            setSession(null);
            return;
        }

        // PRIORITY: JUZ Mode Check FIRST
        if (juzParam) {
            const juzId = parseInt(juzParam, 10);
            if (!isNaN(juzId) && juzId >= 1 && juzId <= 30) {
                let targetKey = null;
                if (surahParam && ayahParam) {
                    targetKey = `${surahParam}:${ayahParam}`;
                }

                const isSameSession = session?.type === 'juz' && session.id === juzId;
                if (!isSameSession) {
                    if (targetKey) setInitialTargetKey(targetKey);
                    setSession({ type: 'juz', id: juzId });
                }
            }
        }
        // Then SURAH Mode
        else if (surahParam) {
            const surahId = parseInt(surahParam, 10);
            if (!isNaN(surahId) && surahId >= 1 && surahId <= 114) {
                const targetKey = ayahParam ? `${surahId}:${ayahParam}` : null;

                const isSameSession = session?.type === 'surah' && session.id === surahId;

                if (!isSameSession) {
                    if (targetKey) setInitialTargetKey(targetKey);
                    setSession({ type: 'surah', id: surahId });
                }
            }
        }
    }, [searchParams]);

    // Navigation Functions
    const jumpTo = useCallback((surahId: number, ayahNumber: number, mode?: 'surah' | 'juz', juzId?: number) => {
        if (mode === 'juz' && juzId) {
            navigate(`/mushaf?juz=${juzId}&surah=${surahId}&ayah=${ayahNumber}`);
        } else {
            navigate(`/mushaf?surah=${surahId}&ayah=${ayahNumber}`);
        }
    }, [navigate]);

    const handleJumpToAyah = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!jumpAyahInput || !session || isJumping) return;

        const targetAyah = parseInt(jumpAyahInput, 10);
        const surahs = getSurahData();

        if (session.type === 'surah') {
            const surah = surahs.find((s: SurahInfo) => s.number === session.id);
            if (surah && targetAyah > 0 && targetAyah <= surah.verses) {
                setIsJumpModalOpen(false);
                setJumpAyahInput("");
                navigate(`/mushaf?surah=${session.id}&ayah=${targetAyah}`);
            } else {
                showToast(`Nomor ayat tidak valid (1-${surah?.verses})`, "error");
            }
        } else {
            showToast("Fitur loncat ayat manual belum tersedia di mode Juz.", "info");
            setIsJumpModalOpen(false);
        }
    }, [jumpAyahInput, session, isJumping, navigate, showToast]);

    const resetSession = useCallback(() => {
        setSession(null);
        setInitialTargetKey(null);
        setInitialListIndex(null);
        navigate('/mushaf');
    }, [navigate]);

    return {
        session,
        setSession,
        currentSurahName,
        jumpAyahInput,
        setJumpAyahInput,
        isJumping,
        isJumpModalOpen,
        setIsJumpModalOpen,
        jumpInputRef,
        initialTargetKey,
        initialListIndex,
        setInitialListIndex,
        jumpTo,
        handleJumpToAyah,
        resetSession,
    };
};
