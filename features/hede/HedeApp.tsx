
import React, { useState } from 'react';
import { HedeWizard } from './components/HedeWizard.tsx';
import { HedeReport } from './components/HedeReport.tsx';
import { HedeHistory } from './components/HedeHistory.tsx';
import { TathhirCalculator } from './components/TathhirCalculator.tsx';
import type { HedeResult, HedeHistoryEntry, ViolationType } from '../../types.ts';
import { useLocalStorage } from '../../hooks/useLocalStorage.ts';
import { 
    FaShieldAlt, 
    FaHistory, 
    FaBroom, 
    FaBookOpen, 
    FaStethoscope,
    FaLightbulb,
    FaSearch,
    FaCheckCircle,
    FaArrowRight
} from 'react-icons/fa';
import { FAQ } from '../../components/ui/FAQ.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { HEDE_FAQ, FIQH_GLOSSARY } from './constants.ts';
import { useToast } from '../../components/ui/Toast.tsx';

type HedeTab = 'diagnosa' | 'tathhir' | 'history' | 'guide';

// WCAG Contrast Fix for Main App Badges
const ViolationBadge: React.FC<{ type: ViolationType | 'general' }> = ({ type }) => {
    if (type === 'general' || type === 'none') return <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 font-bold">Umum</span>;
    
    const badgeStyles: Record<string, string> = {
        riba: 'bg-red-100 text-red-900 border-red-200 dark:bg-red-900/40 dark:text-red-100 dark:border-red-800',
        gharar: 'bg-orange-100 text-orange-900 border-orange-200 dark:bg-orange-900/40 dark:text-orange-100 dark:border-orange-800',
        maysir: 'bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-900/40 dark:text-purple-100 dark:border-purple-800',
        zulm: 'bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700',
    };

    return <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border ${badgeStyles[type]}`}>{type}</span>;
};

const HedeApp: React.FC = () => {
    const { showToast } = useToast();
    
    // Data Persistence
    const [result, setResult] = useLocalStorage<HedeResult | null>('hede_last_result', null);
    const [history, setHistory] = useLocalStorage<HedeHistoryEntry[]>('hede_history', []);
    
    // View State
    const [activeTab, setActiveTab] = useState<HedeTab>('diagnosa');
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    
    // Dictionary State
    const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
    const [dictSearch, setDictSearch] = useState("");

    const handleStartAudit = () => {
        setIsWizardOpen(true);
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

    // Filter & Sort Logic for Sidebar Glossary
    const filteredGlossary = FIQH_GLOSSARY
        .filter(item => 
            item.term.toLowerCase().includes(dictSearch.toLowerCase()) ||
            item.definition.toLowerCase().includes(dictSearch.toLowerCase())
        )
        .sort((a, b) => a.term.localeCompare(b.term)); // Ensure consistent A-Z sorting

    const termDetail = selectedTerm ? FIQH_GLOSSARY.find(t => t.term === selectedTerm) : null;

    // --- RENDER CONTENT ---

    // IMMERSIVE OVERLAY MODE (WIZARD)
    if (isWizardOpen) {
        return (
            <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 overflow-y-auto animate-fade-in custom-scrollbar">
                <HedeWizard onComplete={handleCompleteAudit} onCancel={() => setIsWizardOpen(false)} />
            </div>
        );
    }

    return (
        <div className="min-h-screen animate-fade-in pb-32 md:pb-12 max-w-7xl mx-auto">
            
            {/* --- DESKTOP NAVIGATION (Top Tabs) --- */}
            <div className="hidden md:flex justify-center gap-4 mb-8 pt-4">
                {[
                    { id: 'diagnosa', icon: <FaStethoscope />, label: 'Diagnosa & Laporan' },
                    { id: 'tathhir', icon: <FaBroom />, label: 'Kalkulator Tathhir' },
                    { id: 'history', icon: <FaHistory />, label: 'Jurnal Hijrah' },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => switchTab(tab.id as HedeTab)}
                        className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all ${
                            activeTab === tab.id
                            ? "bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none scale-105"
                            : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700"
                        }`}
                    >
                        <span className="icon-wrapper w-4 h-4">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* --- MAIN LAYOUT GRID --- */}
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 px-4 md:px-6">
                
                {/* LEFT COLUMN: MAIN CONTENT (Span 8) */}
                <div className="lg:col-span-8 w-full min-w-0 flex flex-col gap-8">
                    
                    {/* 1. DIAGNOSA TAB */}
                    {(activeTab === 'diagnosa' || (activeTab === 'guide' && window.innerWidth >= 1024)) && (
                        <div className="w-full">
                            {!result ? (
                                // Intro View
                                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-[2.5rem] p-8 md:p-12 text-center shadow-xl shadow-purple-900/20 relative overflow-hidden group">
                                    {/* Animated Background Elements */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-white/10 transition-colors duration-700"></div>
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
                                    
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center text-white mb-6 backdrop-blur-md border border-white/10 shadow-inner">
                                            <div className="icon-wrapper w-12 h-12 flex items-center justify-center text-5xl drop-shadow-md">
                                                <FaShieldAlt />
                                            </div>
                                        </div>
                                        
                                        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 drop-shadow-sm leading-tight">
                                            HEDE
                                        </h1>
                                        <p className="text-sm md:text-lg font-medium text-purple-100 mb-8 max-w-lg leading-relaxed">
                                            Halal Economic Diagnostic Engine.<br/>
                                            <span className="opacity-75 text-sm font-normal">Cek kesehatan finansial Anda dari Riba, Gharar, & Maysir sekarang.</span>
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mb-10 text-left">
                                            {[
                                                { icon: <FaCheckCircle />, text: "Deteksi Riba & Gharar" },
                                                { icon: <FaCheckCircle />, text: "Analisis Pekerjaan" },
                                                { icon: <FaCheckCircle />, text: "Privasi 100% Aman" }
                                            ].map((feature, i) => (
                                                <div key={i} className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm hover:bg-white/20 transition-colors">
                                                    <span className="text-emerald-300 text-lg flex-shrink-0">{feature.icon}</span>
                                                    <span className="text-sm font-bold text-slate-100 leading-tight">{feature.text}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <button 
                                            onClick={handleStartAudit}
                                            className="group w-full md:w-auto px-10 py-4 bg-white text-indigo-900 rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            Mulai Diagnosa
                                            <div className="icon-wrapper w-5 h-5 group-hover:translate-x-1 transition-transform flex items-center justify-center">
                                                <FaArrowRight />
                                            </div>
                                        </button>
                                        
                                        <p className="mt-6 text-[10px] opacity-60 bg-black/20 px-3 py-1 rounded-full">
                                            🔒 Data diproses lokal di perangkat ini (Offline Ready).
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                // Report View
                                <div className="w-full">
                                    <div className="mb-6 flex justify-between items-center bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl border border-purple-100 dark:border-purple-800">
                                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                            <span className="text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm"><FaStethoscope/></span> 
                                            Laporan Diagnosa
                                        </h2>
                                        <button onClick={handleReset} className="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">
                                            Ulangi Tes
                                        </button>
                                    </div>
                                    <HedeReport result={result} onReset={handleReset} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. TATHHIR TAB */}
                    {activeTab === 'tathhir' && (
                        <div className="w-full">
                            <TathhirCalculator />
                        </div>
                    )}

                    {/* 3. HISTORY TAB */}
                    {activeTab === 'history' && (
                        <div className="w-full">
                            <HedeHistory 
                                history={history} 
                                onLoad={handleLoadHistory} 
                                onClear={handleClearHistory}
                                onBack={() => switchTab('diagnosa')}
                            />
                        </div>
                    )}

                    {/* 4. GUIDE TAB (Mobile View Only) */}
                    {activeTab === 'guide' && (
                        <div className="w-full lg:hidden">
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                                <FAQ 
                                    title="Kamus Muamalah"
                                    subtitle="Istilah penting dalam ekonomi syariah"
                                    data={HEDE_FAQ}
                                />
                            </div>
                        </div>
                    )}

                    {/* DESKTOP FOOTER */}
                    <div className="hidden lg:block border-t border-slate-200 dark:border-slate-700 pt-8">
                        <FAQ 
                            title="Panduan HEDE"
                            subtitle="Pertanyaan seputar metode diagnosa dan hukum fiqh."
                            data={HEDE_FAQ}
                        />
                    </div>
                </div>

                {/* RIGHT COLUMN: STICKY SIDEBAR (Span 4) - Desktop Only */}
                <div className="hidden lg:block lg:col-span-4 min-w-0">
                    <div className="sticky top-24 space-y-6">
                        {/* Info Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/20 transition-colors"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                        <FaLightbulb />
                                    </div>
                                    <h3 className="font-bold text-lg">Tahukah Anda?</h3>
                                </div>
                                <p className="text-sm opacity-90 leading-relaxed font-medium">
                                    Mengeluarkan harta haram (Tathhir) itu <strong>bukan sedekah</strong>, melainkan membuang kotoran agar sisa harta menjadi suci & berkah.
                                </p>
                            </div>
                        </div>

                        {/* Kamus Muamalah Widget */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-350px)]">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                                    <span className="text-indigo-500"><FaBookOpen /></span>
                                    Kamus Muamalah
                                </h3>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-400 text-xs"><FaSearch /></span>
                                    <input 
                                        type="text" 
                                        placeholder="Cari istilah..." 
                                        className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none transition-all text-slate-700 dark:text-slate-200"
                                        value={dictSearch}
                                        onChange={(e) => setDictSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="overflow-y-auto custom-scrollbar p-2 space-y-1">
                                {filteredGlossary.length === 0 ? (
                                    <p className="text-center text-xs text-slate-400 py-4">Istilah tidak ditemukan.</p>
                                ) : (
                                    filteredGlossary.map((item, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setSelectedTerm(item.term)}
                                            className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between group border border-transparent hover:border-slate-100 dark:hover:border-slate-600"
                                        >
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                {item.term}
                                            </span>
                                            <ViolationBadge type={item.category} />
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- BOTTOM NAVIGATION BAR (Mobile Only) --- */}
            {/* Added pb-safe for iOS Home Indicator protection and adjusted z-index */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 px-2 z-50 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
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
                            ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 font-bold transform -translate-y-1" 
                            : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
                        }`}
                    >
                        <span className="icon-wrapper w-5 h-5 mb-1 text-lg">{tab.icon}</span>
                        <span className="text-[10px] uppercase tracking-wide">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Term Definition Modal */}
            {termDetail && (
                <Modal isOpen={true} onClose={() => setSelectedTerm(null)} title="Definisi Istilah" maxWidth="max-w-sm">
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{termDetail.term}</h3>
                            <ViolationBadge type={termDetail.category === 'general' ? 'general' : termDetail.category} />
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                            {termDetail.definition}
                        </p>
                        <button 
                            onClick={() => setSelectedTerm(null)}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
                        >
                            Tutup
                        </button>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export default HedeApp;
