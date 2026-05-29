import React, { createContext, useContext, useReducer, useState, useTransition, useEffect, useCallback } from 'react';
import type { HeirInputState, CalculationResult, HistoryEntry, Heir } from '../../../types.ts';
import { initialHeirsState } from '../constants.ts';
import { heirsReducer, type FaraidhAction } from '../logic/heirsReducer.ts';
import { calculateFaraidh } from '../logic/faraidh.service.ts';
import { useIndexedDB } from '../../../hooks/useIndexedDB.ts';
import { useToast } from '../../../components/ui/Toast.tsx';
import { useConfirm } from '../../../components/ui/ConfirmContext.tsx';
import { useRouter } from '../../../hooks/useRouter.ts';

// 1. Define Context State Interface
interface FaraidhContextType {
 // State
 heirs: HeirInputState;
 estate: string;
 wasiat: string;
 utang: string;
 deceasedGender: 'male' | 'female';
 result: CalculationResult | null;
 history: HistoryEntry[];
 isPending: boolean;
 
 // Actions / Setters
 dispatch: React.Dispatch<FaraidhAction>;
 setEstate: (value: string) => void;
 setWasiat: (value: string) => void;
 setUtang: (value: string) => void;
 setDeceasedGender: (value: 'male' | 'female') => void;
 
 // Logic Methods
 handleCalculate: () => void;
 loadFromHistory: (entry: HistoryEntry) => void;
 clearHistory: () => Promise<void>;
}

const FaraidhContext = createContext<FaraidhContextType | undefined>(undefined);

// 2. Custom Hook for Consumption
export const useFaraidh = () => {
    const context = useContext(FaraidhContext);
    if (!context) {
        throw new Error('useFaraidh must be used within a FaraidhProvider');
    }
    return context;
};

// 3. Provider Component
export const FaraidhProvider: React.FC<{ children: React.ReactNode; setActiveTab: (tab: 'input' | 'result' | 'history') => void }> = ({ children, setActiveTab }) => {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const { searchParams } = useRouter();

    // -- State --
    const [heirs, dispatch] = useReducer(heirsReducer, initialHeirsState);
    const [estate, setEstate] = useState<string>('100000000');
    const [wasiat, setWasiat] = useState<string>('0');
    const [utang, setUtang] = useState<string>('0');
    const [deceasedGender, setDeceasedGender] = useState<'male' | 'female'>('male');
    const [result, setResult] = useState<CalculationResult | null>(null);
    const [isPending, startTransition] = useTransition();
    const [history, setHistory] = useIndexedDB<HistoryEntry[]>('faraidhHistory', []);

    // -- Logic: Voice Command Handling --
    useEffect(() => {
        const estateParam = searchParams.get('estate');
        const heirsParam = searchParams.get('heirs');
        
        let hasUpdates = false;

        if (estateParam) {
            const val = parseInt(estateParam, 10);
            if (!isNaN(val) && val > 0) {
                setEstate(String(val));
                hasUpdates = true;
            }
        }

        if (heirsParam) {
            // Reset existing before applying new to prevent stacking logic issues
            dispatch({ type: 'RESET' }); 

            const pairs = heirsParam.split(',');
            let heirsLoadedCount = 0;

            pairs.forEach(pair => {
                const [key, valStr] = pair.split(':');
                const val = parseInt(valStr, 10);
                if (key && !isNaN(val)) {
                    dispatch({ type: 'SET_COUNT', payload: { heir: key as Heir, count: val } });
                    heirsLoadedCount++;
                    
                    // Auto-set deceased gender context
                    if (key === 'husband') setDeceasedGender('female');
                    if (key === 'wife') setDeceasedGender('male');
                }
            });
            
            if (heirsLoadedCount > 0) hasUpdates = true;
        } else if (estateParam) {
            // If only estate provided, strictly reset heirs
            dispatch({ type: 'RESET' });
        }

        if (hasUpdates) {
            showToast(`Data dimuat dari perintah suara.`, 'info');
        }
    }, [searchParams, showToast]);

    // -- Logic: Calculate --
    const handleCalculate = useCallback(() => {
    const estateValue = parseFloat(estate);
    const wasiatValue = parseFloat(wasiat) || 0;
    const utangValue = parseFloat(utang) || 0;
    if (isNaN(estateValue) || estateValue <= 0) {
    showToast("Mohon masukkan nilai harta yang valid (lebih dari 0).", 'error');
    return;
    }

    const netEstate = estateValue - utangValue - wasiatValue;
    if (netEstate <= 0) {
    showToast("Harta bersih setelah utang dan wasiat harus lebih dari 0.", 'error');
    return;
    }

    startTransition(() => {
    try {
    const calculationResult = calculateFaraidh(heirs, estateValue, deceasedGender, wasiatValue, utangValue);
    setResult(calculationResult);
 
    const newHistoryEntry: HistoryEntry = {
    id: new Date().toISOString(),
    timestamp: new Date().toLocaleString('id-ID'),
    estate: estateValue,
    heirs,
    result: calculationResult,
    wasiat: wasiatValue,
    utang: utangValue,
    };
 
    setHistory(prevHistory => [newHistoryEntry, ...prevHistory].slice(0, 10));
 
    showToast("Perhitungan selesai!", 'success');

    // Auto switch tab on mobile
    if (window.innerWidth < 1024) {
    setActiveTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    } catch (error) {
    console.error("Calculation failed:", error);
    showToast("Terjadi kesalahan dalam perhitungan.", 'error');
    }
    });
    }, [estate, wasiat, utang, heirs, setHistory, showToast, setActiveTab]);

    // -- Logic: History --
    const loadFromHistory = useCallback((entry: HistoryEntry) => {
    setEstate(String(entry.estate));
    setWasiat(String(entry.wasiat || 0));
    setUtang(String(entry.utang || 0));
    dispatch({ type: 'LOAD_STATE', payload: entry.heirs });
    setResult(entry.result);
        
        if (entry.heirs.husband > 0) setDeceasedGender('female');
        else if (entry.heirs.wife > 0) setDeceasedGender('male');
        
        if (window.innerWidth < 1024) {
            setActiveTab('result');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        showToast("Data riwayat dimuat", 'info');
    }, [showToast, setActiveTab]);

    const clearHistory = useCallback(async () => {
        const isConfirmed = await confirm({
            title: 'Hapus Riwayat',
            message: 'Apakah Anda yakin ingin menghapus semua riwayat perhitungan?',
            confirmText: 'Ya, Hapus',
            variant: 'danger'
        });

        if (isConfirmed) {
            setHistory([]);
            showToast("Riwayat dihapus", 'info');
        }
    }, [setHistory, confirm, showToast]);

    const value = {
    heirs,
    estate,
    wasiat,
    utang,
    deceasedGender,
    result,
    history,
    isPending,
    dispatch,
    setEstate,
    setWasiat,
    setUtang,
    setDeceasedGender,
    handleCalculate,
    loadFromHistory,
    clearHistory
    };

    return (
        <FaraidhContext.Provider value={value}>
            {children}
        </FaraidhContext.Provider>
    );
};