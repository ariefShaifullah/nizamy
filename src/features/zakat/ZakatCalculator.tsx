
import React, { useState, useEffect, useRef, useReducer, useMemo } from 'react';
import type { ZakatState, ZakatSettings, ZakatResult, ZakatHistoryEntry } from '../../types.ts';
import { calculateTotalZakat } from './logic/zakat.service.ts';
import { formatNumber, formatCurrency } from '../../utils.ts';
import { FAQ } from '../../components/ui/FAQ.tsx';
import { ZAKAT_FAQ } from './constants.ts';
import { exportZakatPdf } from './logic/pdf-export.ts';
import { zakatReducer, initialZakatState } from './logic/zakatReducer.ts';
import { useLocalStorage } from '../../hooks/useLocalStorage.ts';
import { useIndexedDB } from '../../hooks/useIndexedDB.ts';
import { useToast } from '../../components/ui/Toast.tsx';
import { useConfirm } from '../../components/ui/ConfirmContext.tsx';
import { useDebounce } from '../../hooks/useDebounce.ts';
import { useRouter } from '../../hooks/useRouter.ts'; // Import router
import { FaRedo, FaTags, FaReceipt, FaCog } from 'react-icons/fa';
import { ZAKAT_TABS } from './constants.ts';
import { ZakatCategoryGrid } from './components/ZakatCategoryGrid.tsx';
import {
    FitrahView,
    MaalView,
    GoldSilverView,
    BusinessView,
    AgricultureView,
    LivestockView,
    SummaryView
} from './components/ZakatTabs.tsx';

const INITIAL_SETTINGS: ZakatSettings = {
    goldPrice: 3000000,
    silverPrice: 48000,
    ricePrice: 15000,
    riceKgPerPerson: 2.5,
    currency: 'IDR'
};

const ZakatCalculator: React.FC = () => {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const { searchParams } = useRouter();

    const [activeTab, setActiveTab] = useState('fitrah');
    const [settings, setSettings] = useLocalStorage<ZakatSettings>('zakatSettings', INITIAL_SETTINGS);
    const [history, setHistory] = useIndexedDB<ZakatHistoryEntry[]>('zakatHistory', []);

    const initZakatState = () => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('zakatState');
            if (saved) return JSON.parse(saved);
        }
        return initialZakatState;
    };

    const [state, dispatch] = useReducer(zakatReducer, initialZakatState, initZakatState);
    const debouncedState = useDebounce(state, 1000);

    const result = useMemo(() => {
        return calculateTotalZakat(state, settings);
    }, [state, settings]);

    const [showSettings, setShowSettings] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        localStorage.setItem('zakatState', JSON.stringify(debouncedState));
    }, [debouncedState]);

    // --- HANDLE VOICE COMMAND PARAMS ---
    useEffect(() => {
        const action = searchParams.get('action');
        const amountStr = searchParams.get('amount');
        const type = searchParams.get('type');
        const targetTab = searchParams.get('tab');

        // MODE 1: NAVIGATION ONLY (e.g. "Buka Zakat Pertanian")
        if (targetTab && !action) {
            // Validate tab exists
            if (ZAKAT_TABS.some(t => t.id === targetTab)) {
                setActiveTab(targetTab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            return;
        }

        // MODE 2: CALCULATION (e.g. "Hitung Zakat Emas 100 gram")
        if (action === 'calculate' && amountStr) {
            const amount = parseFloat(amountStr);

            if (!isNaN(amount) && amount > 0) {
                // 1. Reset state to ensure clean calculation
                dispatch({ type: 'RESET' });

                // 2. Map 'type' to specific input field
                let targetKey: keyof ZakatState = 'cash'; // Default to Maal/Cash

                switch (type) {
                    case 'gold':
                        targetKey = 'goldWeight';
                        break;
                    case 'business':
                        targetKey = 'bizAssets';
                        break;
                    case 'agri':
                        targetKey = 'agriHarvest';
                        break;
                    case 'livestock':
                        targetKey = 'livestockValue';
                        break;
                    case 'fitrah':
                        targetKey = 'fitrahPeople'; // Logic usually sends small number here
                        break;
                    default:
                        targetKey = 'cash'; // 'maal' falls here
                }

                // 3. Update Value
                dispatch({ type: 'SET_VALUE', payload: { key: targetKey, value: amount } });

                // 4. DIRECTLY Jump to Summary (Result) - No Flicker
                setActiveTab('summary');
                window.scrollTo({ top: 0, behavior: 'smooth' });

                showToast('Hasil perhitungan ditampilkan.', 'success');
            }
        }
    }, [searchParams]);

    const handleInputChange = (key: keyof ZakatState, value: any) => {
        dispatch({ type: 'SET_VALUE', payload: { key, value } });
    };

    const handleSettingChange = (key: keyof ZakatSettings, value: number) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleReset = async () => {
        const isConfirmed = await confirm({
            title: 'Reset Input',
            message: 'Apakah Anda yakin ingin menghapus semua nilai input zakat?',
            confirmText: 'Ya, Reset',
            variant: 'info'
        });

        if (isConfirmed) {
            dispatch({ type: 'RESET' });
            setActiveTab('fitrah');
            showToast("Input berhasil direset", 'info');
        }
    };

    const handleSaveHistory = () => {
        if (!result) return;
        const newEntry: ZakatHistoryEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleString('id-ID'),
            state: state,
            result: result
        };

        setHistory(prev => [newEntry, ...prev].slice(0, 10));
        showToast("Perhitungan berhasil disimpan!", 'success');
    };

    const handleLoadHistory = async (entry: ZakatHistoryEntry) => {
        const isConfirmed = await confirm({
            title: 'Muat Data',
            message: 'Muat data riwayat ini? Input saat ini akan digantikan.',
            confirmText: 'Muat',
            variant: 'info'
        });

        if (isConfirmed) {
            dispatch({ type: 'LOAD_STATE', payload: entry.state });
            setActiveTab('summary');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast("Riwayat dimuat", 'info');
        }
    };

    const handleClearHistory = async () => {
        const isConfirmed = await confirm({
            title: 'Hapus Riwayat',
            message: 'Hapus semua riwayat perhitungan zakat?',
            confirmText: 'Hapus Semua',
            variant: 'danger'
        });

        if (isConfirmed) {
            setHistory([]);
            showToast("Riwayat dihapus", 'info');
        }
    };

    const goToSummary = () => {
        setActiveTab('summary');
        if (navRef.current) {
            navRef.current.scrollTo({ left: navRef.current.scrollWidth, behavior: 'smooth' });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleSwitchTab = (id: string) => {
        setActiveTab(id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleDownloadPDF = () => {
        exportZakatPdf(result, state);
        showToast("Mengunduh PDF...", 'info');
    };

    return (
        <div className="max-w-7xl mx-auto animate-fade-in pb-32 lg:pb-12 relative">
            <div className="text-center mb-6 lg:mb-8 pt-4 lg:pt-0">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-emerald-900 dark:text-emerald-400 sm:text-5xl drop-shadow-sm">
                    Kalkulator Zakat
                </h1>
                <p className="mt-3 max-w-2xl mx-auto text-base md:text-lg text-slate-600 dark:text-slate-400 px-4">
                    Hitung <strong>Zakat Fitrah</strong> dan <strong>Maal</strong> akurat sesuai Nisab & Haul.
                </p>
            </div>

            {/* DASHBOARD TICKER */}
            <div className="bg-slate-900 text-white rounded-2xl shadow-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden mt-4 lg:mt-0">
                <div className="absolute inset-0 bg-linear-to-r from-emerald-900 to-slate-900 opacity-50"></div>
                <div className="relative z-raised flex flex-wrap justify-center md:justify-start gap-4 md:gap-8 w-full md:w-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Harga Emas (per gram)</span>
                        <span className="text-xl font-mono font-bold text-yellow-400">{formatCurrency(settings.goldPrice)}</span>
                    </div>
                    <div className="w-px h-10 bg-slate-700 hidden md:block"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Harga Beras (per kg)</span>
                        <span className="text-xl font-mono font-bold text-white">{formatCurrency(settings.ricePrice)}</span>
                    </div>
                </div>

                <div className="relative z-raised flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
                    <button onClick={handleReset} className="text-xs font-bold px-4 py-2 rounded-lg bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-white transition-colors border border-slate-700 flex items-center gap-2">
                        <span className="icon-wrapper w-3 h-3"><FaRedo /></span> Reset
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`text-xs font-bold px-4 py-2 rounded-lg border transition-colors flex items-center shadow-sm ${showSettings ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700'}`}
                    >
                        <span className="icon-wrapper w-3 h-3 mr-2"><FaCog /></span>
                        Atur Harga
                    </button>
                </div>
            </div>

            {showSettings && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-8 animate-fade-in-down shadow-xl relative z-dropdown">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
                            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3"><FaTags /></span>
                            Asumsi Harga Pasar (Nisab)
                        </h3>
                        <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold uppercase">Tutup</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: "Harga Emas / Gram", key: "goldPrice" as keyof ZakatSettings, hint: "Acuan Nisab Maal (85g)" },
                            { label: "Harga Perak / Gram", key: "silverPrice" as keyof ZakatSettings, hint: "Acuan Nisab Perak (595g)" },
                            { label: "Harga Beras / Kg", key: "ricePrice" as keyof ZakatSettings, hint: "Acuan Zakat Fitrah & Pertanian" }
                        ].map((field) => (
                            <div key={field.key}>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">{field.label}</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">Rp</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={settings[field.key] === 0 ? '' : formatNumber(settings[field.key] as number)}
                                        onChange={(e) => handleSettingChange(field.key, parseInt(e.target.value.replace(/\D/g, '') || '0', 10))}
                                        className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl py-2.5 pl-10 pr-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-bold"
                                    />
                                </div>
                                {field.hint && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">{field.hint}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
                <div className="w-full lg:w-64 shrink-0 top-[74px] lg:top-24 z-raised py-2 lg:py-0 mb-2 lg:mb-0">
                    {/* Mobile: Grid Selector */}
                    <div className="lg:hidden">
                        <ZakatCategoryGrid tabs={ZAKAT_TABS} activeTab={activeTab} onSelect={handleSwitchTab} />
                    </div>

                    {/* Desktop: Vertical Sidebar */}
                    <div className="hidden lg:block relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-700 rounded-2xl shadow-lg lg:bg-transparent lg:border-0 lg:shadow-none lg:rounded-none lg:backdrop-blur-none overflow-hidden lg:overflow-visible">
                        <div ref={navRef} className="flex lg:flex-col overflow-x-auto lg:overflow-visible space-x-2 lg:space-x-0 lg:space-y-2 hide-scrollbar p-2 lg:p-0" aria-label="Tabs">
                            {ZAKAT_TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleSwitchTab(tab.id)}
                                    className={`whitespace-nowrap px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center shrink-0 border ${activeTab === tab.id
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200/50 dark:shadow-none border-emerald-600 lg:translate-x-2'
                                        : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-transparent hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400'
                                        }`}
                                >
                                    <span className="mr-3 text-lg">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full min-w-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-emerald-100/20 dark:shadow-none border border-white/50 dark:border-slate-700/50 md:min-h-[500px] p-6 md:p-8 relative">
                    {activeTab === 'fitrah' && <FitrahView state={state} settings={settings} onChange={handleInputChange} onNext={goToSummary} />}
                    {activeTab === 'maal' && <MaalView state={state} settings={settings} onChange={handleInputChange} onNext={goToSummary} />}
                    {activeTab === 'gold' && <GoldSilverView state={state} settings={settings} onChange={handleInputChange} onNext={goToSummary} />}
                    {activeTab === 'business' && <BusinessView state={state} settings={settings} onChange={handleInputChange} onNext={goToSummary} />}
                    {activeTab === 'agri' && <AgricultureView state={state} settings={settings} onChange={handleInputChange} onNext={goToSummary} />}
                    {activeTab === 'livestock' && <LivestockView state={state} settings={settings} onChange={handleInputChange} onNext={goToSummary} />}
                    {activeTab === 'summary' && (
                        <SummaryView
                            result={result}
                            state={state}
                            history={history}
                            onSaveHistory={handleSaveHistory}
                            onDownloadPDF={handleDownloadPDF}
                            onClearHistory={handleClearHistory}
                            onLoadHistory={handleLoadHistory}
                        />
                    )}
                </div>
            </div>

            <div className="hidden lg:block">
                <FAQ
                    title="FAQ Zakat"
                    subtitle="Pelajari lebih lanjut tentang Nisab & Haul."
                    data={ZAKAT_FAQ}
                />
            </div>

            {/* Mobile Sticky Action Bar */}
            {activeTab !== 'summary' && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-navigation bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                    <button
                        onClick={goToSummary}
                        className="w-full flex items-center justify-center bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-2xl hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-600/20"
                    >
                        <span className="icon-wrapper w-5 h-5 mr-2.5"><FaReceipt /></span>
                        <span className="text-base tracking-wide uppercase">Lihat Hasil</span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default ZakatCalculator;
