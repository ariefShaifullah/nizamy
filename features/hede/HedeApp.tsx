
import React, { useState, useEffect } from 'react';
import { HedeWizard } from './components/HedeWizard.tsx';
import { HedeReport } from './components/HedeReport.tsx';
import { HedeHistory } from './components/HedeHistory.tsx';
import { TathhirCalculator } from './components/TathhirCalculator.tsx';
import type { HedeResult, HedeHistoryEntry } from '../../types.ts';
import { useLocalStorage } from '../../hooks/useLocalStorage.ts';
import { 
    FaShieldAlt, 
    FaArrowRight, 
    FaHistory, 
    FaBroom, 
    FaBookOpen, 
    FaStethoscope 
} from 'react-icons/fa';
import { FAQ } from '../../components/ui/FAQ.tsx';
import { HEDE_FAQ } from './constants.ts';
import { useToast } from '../../components/ui/Toast.tsx';

type HedeTab = 'diagnosa' | 'tathhir' | 'history' | 'guide';

const HedeApp: React.FC = () => {
    const { showToast } = useToast();
    
    // Data Persistence
    const [result, setResult] = useLocalStorage<HedeResult | null>('hede_last_result', null);
    const [history, setHistory] = useLocalStorage<HedeHistoryEntry[]>('hede_history', []);
    
    // View State
    const [activeTab, setActiveTab] = useState<HedeTab>('diagnosa');
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    const handleStartAudit = () => {
        setIsWizardOpen(true);
        // No scroll needed here as the overlay covers everything
    };
    
    const handleCompleteAudit = (data: HedeResult) => {
        setResult(data);
        
        const newEntry: HedeHistoryEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            totalScore: data.totalScore,
            riskLevel: data.riskLevel,
            result: data
        };
        
        setHistory(prev => [newEntry, ...prev].slice(0, 20));
        
        setIsWizardOpen(false);
        setActiveTab('diagnosa');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast('Hasil diagnosa tersimpan di Jurnal', 'success');
    };

    const handleReset = () => {
        setResult(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLoadHistory = (entry: HedeHistoryEntry) => {
        setResult(entry.result);
        setActiveTab('diagnosa');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast('Laporan lama dimuat', 'info');
    };

    const handleClearHistory = () => {
        setHistory([]);
        showToast('Jurnal berhasil dibersihkan', 'info');
    };

    const switchTab = (tab: HedeTab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- RENDER CONTENT ---

    // IMMERSIVE OVERLAY MODE
    // Uses fixed positioning and high z-index to cover Global Header (z-50) and Bottom Nav
    if (isWizardOpen) {
        return (
            <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 overflow-y-auto animate-fade-in">
                <HedeWizard onComplete={handleCompleteAudit} onCancel={() => setIsWizardOpen(false)} />
            </div>
        );
    }

    return (
        <div className="min-h-screen animate-fade-in pb-24 md:pb-12">
            
            {/* --- TAB CONTENT --- */}
            
            {/* 1. DIAGNOSA TAB */}
            {activeTab === 'diagnosa' && (
                <div className="w-full">
                    {!result ? (
                        // Intro View (Empty State)
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-xl mx-auto px-6 pt-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-20 rounded-full"></div>
                                <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 mb-4 transform -rotate-6 transition-transform hover:rotate-0 duration-500">
                                    <div className="icon-wrapper w-12 h-12 flex items-center justify-center text-5xl">
                                        <FaShieldAlt />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                                    H.E.D.E
                                </h1>
                                <p className="text-sm md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                                    Halal Economic Diagnostic Engine
                                </p>
                            </div>

                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                                Deteksi dini kesehatan ekonomi Anda dari paparan Riba, Gharar, dan Maysir dengan algoritma Fiqh Muamalah.
                            </p>

                            <button 
                                onClick={handleStartAudit}
                                className="w-full group px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 mt-4"
                            >
                                Mulai Diagnosa
                                <div className="icon-wrapper w-5 h-5 group-hover:translate-x-1 transition-transform flex items-center justify-center">
                                    <FaArrowRight />
                                </div>
                            </button>
                        </div>
                    ) : (
                        // Report View
                        <div className="w-full">
                            <div className="max-w-5xl mx-auto mb-4 px-4 md:px-0 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <span className="text-purple-600 dark:text-purple-400"><FaStethoscope/></span> Hasil Diagnosa
                                </h2>
                                <button onClick={handleReset} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">
                                    Reset
                                </button>
                            </div>
                            <HedeReport result={result} onReset={handleReset} />
                        </div>
                    )}
                </div>
            )}

            {/* 2. TATHHIR TAB */}
            {activeTab === 'tathhir' && (
                <div className="w-full px-4 md:px-0 pt-4">
                    <div className="max-w-2xl mx-auto mb-6 text-center">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Pembersihan Harta</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Hitung & keluarkan hak yang bukan milik kita.</p>
                    </div>
                    <TathhirCalculator />
                </div>
            )}

            {/* 3. HISTORY TAB */}
            {activeTab === 'history' && (
                <div className="w-full px-4 md:px-0 pt-4">
                    <HedeHistory 
                        history={history} 
                        onLoad={handleLoadHistory} 
                        onClear={handleClearHistory}
                        onBack={() => switchTab('diagnosa')}
                    />
                </div>
            )}

            {/* 4. GUIDE TAB */}
            {activeTab === 'guide' && (
                <div className="max-w-3xl mx-auto px-4 pt-4">
                    <FAQ 
                        title="Panduan & Fiqh"
                        subtitle="Kamus istilah dan penjelasan metode H.E.D.E"
                        data={HEDE_FAQ}
                    />
                </div>
            )}

            {/* --- BOTTOM NAVIGATION BAR (Mobile Only) --- */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 px-2 z-50 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                {[
                    { id: 'diagnosa', icon: <FaStethoscope />, label: 'Diagnosa' },
                    { id: 'tathhir', icon: <FaBroom />, label: 'Tathhir' },
                    { id: 'history', icon: <FaHistory />, label: 'Jurnal' },
                    { id: 'guide', icon: <FaBookOpen />, label: 'Panduan' },
                ].map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => switchTab(tab.id as HedeTab)} 
                        className={`flex-1 flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${
                            activeTab === tab.id 
                            ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 scale-105 font-bold" 
                            : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
                        }`}
                    >
                        <span className="icon-wrapper w-5 h-5 mb-1">{tab.icon}</span>
                        <span className="text-[10px] uppercase tracking-wide">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* --- DESKTOP NAVIGATION (Simple Tabs) --- */}
            <div className="hidden md:flex justify-center gap-4 mb-8">
                {[
                    { id: 'diagnosa', icon: <FaStethoscope />, label: 'Diagnosa' },
                    { id: 'tathhir', icon: <FaBroom />, label: 'Kalkulator Tathhir' },
                    { id: 'history', icon: <FaHistory />, label: 'Jurnal Hijrah' },
                    { id: 'guide', icon: <FaBookOpen />, label: 'Panduan' },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => switchTab(tab.id as HedeTab)}
                        className={`px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${
                            activeTab === tab.id
                            ? "bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none"
                            : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                    >
                        <span className="icon-wrapper w-4 h-4">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

        </div>
    );
};

export default HedeApp;
