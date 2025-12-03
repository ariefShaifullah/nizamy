
import React, { useState, useMemo, useEffect } from 'react';
import { HedeWizard } from './components/HedeWizard.tsx';
import { HedeReport } from './components/HedeReport.tsx';
import { HedeHistory } from './components/HedeHistory.tsx';
import { TathhirCalculator } from './components/TathhirCalculator.tsx';
import { HedeAnalyzing } from './components/report/HedeAnalyzing.tsx';
import type { HedeResult, HedeHistoryEntry, ViolationType, HedeTab } from '../../types.ts';
import { useLocalStorage } from '../../hooks/useLocalStorage.ts';
import { useIndexedDB } from '../../hooks/useIndexedDB.ts';
import { 
    FaShieldAlt, 
    FaHistory, 
    FaBroom, 
    FaBookOpen, 
    FaStethoscope, 
    FaLightbulb, 
    FaSearch, 
    FaCheckCircle, 
    FaArrowRight, 
    FaHeart 
} from 'react-icons/fa';
import { FAQ } from '../../components/ui/FAQ.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { HEDE_FAQ, FIQH_GLOSSARY } from './constants.ts';
import { useToast } from '../../components/ui/Toast.tsx';
import { useConfirm } from '../../components/ui/ConfirmContext.tsx';
import { calculateRiskScore } from './logic/hede.service.ts';
import { audioService } from '../../services/audio.service.ts';

type WizardState = 'idle' | 'pre-wizard' | 'wizard' | 'analyzing';
type ViewState = 'landing' | 'report';

// --- SUB-COMPONENT: Landing Screen ---
const HedeLandingScreen: React.FC<{ 
    onStartAudit: () => void; 
    onViewFaq: () => void;
}> = ({ onStartAudit, onViewFaq }) => {
    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-[2.5rem] p-8 md:p-12 text-center shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
            <div className="relative z-raised flex flex-col items-center">
                <div className="w-24 h-24 bg-linear-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 shadow-md border border-white dark:border-slate-700">
                    <div className="icon-wrapper w-12 h-12 flex items-center justify-center text-5xl drop-shadow-sm"><FaStethoscope /></div>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">Klinik Finansial</h1>
                <p className="font-bold text-purple-600 dark:text-purple-400 text-sm md:text-base uppercase tracking-widest mb-4">Cek Kesehatan Finansial

</p>
                <p className="hidden md:block text-base md:text-lg font-medium text-slate-500 dark:text-slate-400 mb-12 max-w-2xl leading-relaxed">
                    Cek kesehatan finansial Anda dari Riba, Gharar, & Maysir. Dapatkan roadmap hijrah personal untuk menuju harta yang lebih berkah.
                </p>
                
                <button onClick={onStartAudit} className="group w-full md:w-auto px-10 py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-purple-200/80 dark:shadow-none hover:shadow-2xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3">
                    Mulai Diagnosa
                    <div className="icon-wrapper w-5 h-5 group-hover:translate-x-1 transition-transform flex items-center justify-center"><FaArrowRight /></div>
                </button>

                <div className="flex items-center justify-center gap-4 mt-8 lg:hidden">
                    <button onClick={onViewFaq} className="text-xs font-bold text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5">
                        <FaLightbulb /> Panduan & FAQ
                    </button>
                </div>

                <p className="mt-6 text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800">
                    🔒 Data diproses 100% lokal di perangkat Anda.
                </p>
            </div>
        </div>
    );
};


// --- SUB-COMPONENT: Pre-Wizard Onboarding Screen ---
const PreWizardScreen: React.FC<{ onStart: () => void; onCancel: () => void }> = ({ onStart, onCancel }) => {
  return (
    <div className="fixed inset-0 z-overlay bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-center border border-slate-100 dark:border-slate-700">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">Bismillah, Mari Periksa Kesehatan Ekonomi Kita.</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base">Ini adalah alat introspeksi, bukan penghakiman.</p>
        
        <div className="space-y-3 text-left mb-8 sm:mb-10">
          <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="icon-wrapper w-5 h-5 text-emerald-500 shrink-0 mt-1"><FaCheckCircle /></div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Jujur & Amanah</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">Jawaban Anda akan menentukan akurasi hasil.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="icon-wrapper w-5 h-5 text-blue-500 shrink-0 mt-1"><FaShieldAlt /></div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">100% Privasi</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">Semua data hanya tersimpan di perangkat Anda.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="icon-wrapper w-5 h-5 text-rose-500 shrink-0 mt-1"><FaHeart /></div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Bukan Menghakimi</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">Setiap perjalanan hijrah itu unik.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={onCancel} className="w-full sm:w-auto px-6 py-3 text-slate-500 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Batal</button>
            <button onClick={onStart} className="w-full sm:flex-1 py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-colors shadow-lg">Lanjut, Saya Siap</button>
        </div>
      </div>
    </div>
  );
};


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
    const { confirm } = useConfirm();
    
    // OPTIMIZED: Data Persistence using IndexedDB for heavy objects
    const [result, setResult] = useIndexedDB<HedeResult | null>('hede_last_result', null);
    const [history, setHistory] = useIndexedDB<HedeHistoryEntry[]>('hede_history', []);
    
    // LIFTED STATE: Roadmap Progress
    // Shared between Report (for projection) and History (for trends)
    // Keep in LocalStorage as it's a simple array of strings and accessed synchronously by UI often
    const [completedSteps, setCompletedSteps] = useLocalStorage<string[]>('hede_roadmap_progress', []);

    // View State
    const [activeTab, setActiveTab] = useState<HedeTab>('diagnosa');
    const [wizardState, setWizardState] = useState<WizardState>('idle');
    const [view, setView] = useState<ViewState>('landing');
    const [analyzingAnswers, setAnalyzingAnswers] = useState<Record<string, string> | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    
    // Dictionary State
    const [isDictOpen, setIsDictOpen] = useState(false);
    const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
    const [dictSearch, setDictSearch] = useState("");
    const [isFaqOpen, setIsFaqOpen] = useState(false);

    const handleStartAudit = () => {
        setWizardState('pre-wizard');
    };
    
    const handleWizardComplete = (answers: Record<string, string>) => {
        setAnalyzingAnswers(answers);
        setWizardState('analyzing');
    };

    const handleCancelWizard = () => {
        setWizardState('idle');
        setAnalyzingAnswers(null);
    };

    const toggleStep = (action: string) => {
        // Haptic Feedback
        if (navigator.vibrate) navigator.vibrate(15);

        setCompletedSteps(prev => {
            const isExist = prev.includes(action);
            if (isExist) {
                audioService.playClick(); 
                return prev.filter(a => a !== action);
            } else {
                audioService.playSuccess();
                return [...prev, action];
            }
        });
    };

    useEffect(() => {
        let analysisTimeout: ReturnType<typeof setTimeout>;
        if (wizardState === 'analyzing' && analyzingAnswers) {
            analysisTimeout = setTimeout(() => {
                const data = calculateRiskScore(analyzingAnswers);
                setResult(data);
                
                const newEntry: HedeHistoryEntry = {
                    id: Date.now().toString(),
                    timestamp: new Date().toISOString(),
                    totalScore: data.totalScore,
                    riskLevel: data.riskLevel,
                    result: data
                };
                
                // Clear previous roadmap progress on new diagnosis to allow fresh start?
                // Option A: Keep progress (Continuous improvement). 
                // Option B: Reset (New snapshot). 
                // Decision: Keep progress for now, as roadmap items might be same.
                // But usually a new diagnosis means a reset of state. 
                // Let's reset completedSteps IF the new result has different roadmap items or just to be safe.
                setCompletedSteps([]); // Reset roadmap progress on new diagnosis
                
                setHistory(prev => [newEntry, ...prev].slice(0, 20));
                
                setWizardState('idle');
                setActiveTab('diagnosa');
                setView('report'); 
                setShowOnboarding(true); 
                window.scrollTo({ top: 0, behavior: 'smooth' });
                showToast('Hasil diagnosa tersimpan di Jurnal', 'success');
            }, 2500); 
        }
        return () => clearTimeout(analysisTimeout);
    }, [wizardState, analyzingAnswers, setResult, setHistory, showToast, setCompletedSteps]);


    const handleReset = () => {
        setResult(null);
        setView('landing'); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLoadHistory = (entry: HedeHistoryEntry) => {
        setResult(entry.result);
        setView('report');
        setActiveTab('diagnosa');
        // When loading old history, we might want to preserve current roadmap progress OR load historical?
        // Current design: Roadmap progress is global 'current state'.
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast('Laporan lama dimuat', 'info');
    };

    const handleClearHistory = () => {
        setHistory([]);
        setCompletedSteps([]);
        showToast('Jurnal berhasil dibersihkan', 'info');
    };

    const switchTab = (tab: HedeTab) => {
        if (tab === 'diagnosa') {
            setView('landing');
        }
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleOpenTerm = (term: string) => {
        setSelectedTerm(term);
        if (window.innerWidth < 1024) {
            setIsDictOpen(true);
        }
    };
    
    const handleSidebarTermClick = (term: string) => {
        setSelectedTerm(term);
    };

    const filteredGlossary = useMemo(() =>
        FIQH_GLOSSARY.filter(item => 
            item.term.toLowerCase().includes(dictSearch.toLowerCase()) || 
            item.definition.toLowerCase().includes(dictSearch.toLowerCase())
        ).sort((a, b) => a.term.localeCompare(b.term)), 
    [dictSearch]);

    const termDetail = selectedTerm ? FIQH_GLOSSARY.find(t => t.term === selectedTerm) : null;
    
    // --- RENDER LOGIC ---

    if (wizardState === 'pre-wizard') {
        return <PreWizardScreen onStart={() => setWizardState('wizard')} onCancel={handleCancelWizard} />;
    }
    
    if (wizardState === 'wizard') {
        return (
            <div className="fixed inset-0 z-overlay bg-slate-50 dark:bg-slate-950 overflow-y-auto animate-fade-in custom-scrollbar">
                <HedeWizard onComplete={handleWizardComplete} onCancel={handleCancelWizard} />
            </div>
        );
    }

    if (wizardState === 'analyzing') {
        return <HedeAnalyzing />;
    }

    const mainNavTabs = [
        { id: 'diagnosa', icon: <FaStethoscope />, label: 'Diagnosa' },
        { id: 'tathhir', icon: <FaBroom />, label: 'Tathhir' },
        { id: 'history', icon: <FaHistory />, label: 'Jurnal Hijrah' },
        { id: 'kamus', icon: <FaBookOpen />, label: 'Kamus' },
    ];
    
    const renderContent = () => {
        switch (activeTab) {
            case 'diagnosa':
                if (view === 'report' && result) {
                    return (
                        <HedeReport 
                            result={result} 
                            onReset={handleReset} 
                            onSwitchAppTab={switchTab} 
                            onOpenTerm={handleOpenTerm}
                            showOnboarding={showOnboarding}
                            onOnboardingComplete={() => setShowOnboarding(false)}
                            completedSteps={completedSteps}
                            onToggleStep={toggleStep}
                        />
                    );
                }
                return (
                    <HedeLandingScreen 
                        onStartAudit={handleStartAudit}
                        onViewFaq={() => setIsFaqOpen(true)}
                    />
                );
            case 'tathhir':
                return <TathhirCalculator />;
            case 'history':
                return (
                    <HedeHistory 
                        history={history} 
                        onLoad={handleLoadHistory} 
                        onClear={handleClearHistory}
                        currentResult={result}
                        completedSteps={completedSteps}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen animate-fade-in pb-32 md:pb-12 max-w-7xl mx-auto">
            <div className="hidden md:flex justify-center gap-4 mb-8 pt-4">
                {mainNavTabs.filter(tab => tab.id !== 'kamus').map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => tab.id === 'kamus' ? setIsDictOpen(true) : switchTab(tab.id as HedeTab)}
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

            <div className="lg:grid lg:grid-cols-12 lg:gap-8 px-4 md:px-6">
                <div className="lg:col-span-8 w-full min-w-0 flex flex-col gap-8">
                    {renderContent()}
                    <div className="hidden lg:block border-t border-slate-200 dark:border-slate-700 pt-8"><FAQ title="Panduan Klinik Finansial" subtitle="Pertanyaan seputar metode diagnosa dan hukum fiqh." data={HEDE_FAQ} /></div>
                </div>

                <div className="hidden lg:block lg:col-span-4 min-w-0">
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-linear-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/20 transition-colors"></div>
                            <div className="relative z-raised">
                                <div className="flex items-center gap-3 mb-3"><div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"><FaLightbulb /></div><h3 className="font-bold text-lg">Tahukah Anda?</h3></div>
                                <p className="text-sm opacity-90 leading-relaxed font-medium">Mengeluarkan harta haram (Tathhir) itu <strong>bukan sedekah</strong>, melainkan membuang kotoran agar sisa harta menjadi suci & berkah.</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-350px)]">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm sticky top-0 z-sticky">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2"><span className="text-indigo-500"><FaBookOpen /></span>Kamus Muamalah</h3>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-400 text-xs"><FaSearch /></span>
                                    <input type="text" placeholder="Cari istilah..." className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none transition-all text-slate-700 dark:text-slate-200" value={dictSearch} onChange={(e) => setDictSearch(e.target.value)} />
                                </div>
                            </div>
                            <div className="overflow-y-auto custom-scrollbar p-2 space-y-1">
                                {filteredGlossary.map((item, idx) => (
                                    <button key={idx} onClick={() => handleSidebarTermClick(item.term)} className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between group border border-transparent hover:border-slate-100 dark:hover:border-slate-600">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{item.term}</span>
                                        <ViolationBadge type={item.category} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div 
              className="md:hidden fixed bottom-0 left-0 right-0 bg-white/55 dark:bg-slate-900/55 border-t border-slate-200 dark:border-slate-800 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 px-2 z-navigation flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
              style={{
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)'
              }}
            >
                {mainNavTabs.map(tab => (
                    <button key={tab.id} onClick={() => tab.id === 'kamus' ? setIsDictOpen(true) : switchTab(tab.id as HedeTab)} className={`flex-1 flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${activeTab === tab.id ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 font-bold transform -translate-y-1" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium"}`}>
                        <span className="icon-wrapper w-5 h-5 mb-1 text-lg">{tab.icon}</span><span className="text-[10px] uppercase tracking-wide">{tab.label}</span>
                    </button>
                ))}
            </div>
            
            <Modal isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} title="Panduan & FAQ" maxWidth="max-w-2xl">
                <div className="p-2 md:p-0">
                    <FAQ title="" subtitle="" data={HEDE_FAQ} />
                </div>
            </Modal>

            <Modal isOpen={isDictOpen} onClose={() => { setIsDictOpen(false); setSelectedTerm(null); setDictSearch(""); }} title="Kamus Muamalah" maxWidth="max-w-md">
                <div className="p-4 flex flex-col h-[70vh]">
                    <div className="mb-4 relative shrink-0">
                        <span className="absolute left-4 top-3.5 text-slate-400 icon-wrapper w-4 h-4"><FaSearch /></span>
                        <input type="text" placeholder="Cari istilah..." className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={dictSearch} onChange={(e) => setDictSearch(e.target.value)} autoFocus />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                        {filteredGlossary.map(t => (
                            <button key={t.term} onClick={() => handleOpenTerm(t.term)} className="text-left w-full p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-between group">
                                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm group-hover:text-indigo-600">{t.term}</span>
                                <ViolationBadge type={t.category} />
                            </button>
                        ))}
                    </div>
                </div>
            </Modal>
            
            {termDetail && (
                <Modal isOpen={true} onClose={() => setSelectedTerm(null)} title="Definisi Istilah" maxWidth="max-w-sm">
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-4"><h3 className="text-xl font-bold text-slate-800 dark:text-white">{termDetail.term}</h3><ViolationBadge type={termDetail.category} /></div>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">{termDetail.definition}</p>
                        <button onClick={() => setSelectedTerm(null)} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700">Tutup</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default HedeApp;
