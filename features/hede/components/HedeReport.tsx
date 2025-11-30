import React, { useState, useRef, useEffect } from 'react';
import type { HedeResult, HedeTab } from '../../../types.ts';
import { exportHedePdf } from '../logic/pdf-export.ts';
import { generateContractPdf, type ContractType } from '../logic/contract-templates.ts';
import { useToast } from '../../../components/ui/Toast.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import html2canvas from 'html2canvas';
import { 
    FaDownload, 
    FaRedo, 
    FaBalanceScale,
    FaBook,
    FaShareAlt,
    FaExclamationCircle,
    FaFileSignature,
    FaHandshake,
    FaPray,
    FaChartPie,
    FaListUl,
    FaRoad,
    FaArrowRight,
    FaSpinner,
    FaCopy,
    FaTimes,
    FaUsers,
    FaUserTie,
    FaFileContract,
    FaFileInvoiceDollar,
    FaInfoCircle
} from 'react-icons/fa';

import { HedeCharts } from './report/HedeCharts.tsx';
import { HedeRisks } from './report/HedeRisks.tsx';
import { HedeRoadmap } from './report/HedeRoadmap.tsx';
import { HedeOnboarding } from './report/HedeOnboarding.tsx';


interface HedeReportProps {
    result: HedeResult;
    onReset: () => void;
    onSwitchAppTab: (tab: HedeTab) => void;
    onOpenTerm: (term: string) => void;
    showOnboarding: boolean;
    onOnboardingComplete: () => void;
}

type ReportTab = 'summary' | 'details' | 'roadmap';

const TOOLKIT_ITEMS: { type: ContractType; icon: React.ReactNode; title: string; subtitle: string; color: string; }[] = [
    { type: 'qardh', icon: <FaHandshake />, title: 'Akad Qardh', subtitle: 'Utang (No Riba)', color: 'blue' },
    { type: 'mudharabah', icon: <FaBalanceScale />, title: 'Akad Mudharabah', subtitle: 'Investasi Bagi Hasil', color: 'emerald' },
    { type: 'musyarakah', icon: <FaUsers />, title: 'Akad Musyarakah', subtitle: 'Kerja Sama Modal', color: 'teal' },
    { type: 'wakalah', icon: <FaUserTie />, title: 'Akad Wakalah', subtitle: 'Agen/Dropship', color: 'sky' },
    { type: 'ijarah', icon: <FaFileContract />, title: 'Akad Ijarah', subtitle: 'Kontrak Jasa/Sewa', color: 'indigo' },
    { type: 'loan_payoff', icon: <FaFileInvoiceDollar />, title: 'Surat Pelunasan', subtitle: 'Niat Lunas KPR', color: 'rose' },
    { type: 'tathhir_guide', icon: <FaInfoCircle />, title: 'Panduan Tathhir', subtitle: 'Penyaluran Dana', color: 'amber' },
    { type: 'taubat', icon: <FaPray />, title: 'Ikrar Bara\'ah', subtitle: 'Niat Taubat', color: 'purple' },
];

const getToolkitColorClasses = (color: string) => {
    switch (color) {
        case 'blue': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
        case 'emerald': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
        case 'teal': return 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400';
        case 'sky': return 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400';
        case 'indigo': return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
        case 'rose': return 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
        case 'amber': return 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
        case 'purple': return 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
        default: return 'bg-slate-50 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400';
    }
};


export const HedeReport: React.FC<HedeReportProps> = ({ result, onReset, onSwitchAppTab, onOpenTerm, showOnboarding, onOnboardingComplete }) => {
    const [activeTab, setActiveTab] = useState<ReportTab>('summary');
    const { showToast } = useToast();
    const fiqhContext = result.fiqhContext;
    const shareCardRef = useRef<HTMLDivElement>(null);

    // New state for share modal
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareImageData, setShareImageData] = useState<{ url: string; blob: Blob | null }>({ url: '', blob: null });
    const [isGeneratingShare, setIsGeneratingShare] = useState(false);

    const handleDownload = async () => {
        showToast('Mengunduh laporan...', 'info');
        try { await exportHedePdf(result); showToast('Laporan berhasil diunduh.', 'success'); } 
        catch (error) { console.error(error); showToast('Gagal mengunduh laporan.', 'error'); }
    };

    const handleDownloadTemplate = async (type: ContractType) => {
        showToast('Menyiapkan dokumen...', 'info');
        try { await generateContractPdf(type); showToast('Dokumen berhasil diunduh.', 'success'); } 
        catch (error) { console.error(error); showToast('Gagal membuat dokumen.', 'error'); }
    };

    const handleRoadmapAction = (actionString: string) => {
        // Parse 'internal:type:arg'
        const parts = actionString.split(':');
        const type = parts[1]; // e.g., 'toolkit' or 'tathhir'
        const arg = parts[2]; // e.g., 'loan_payoff'

        if (type === 'tathhir') {
            onSwitchAppTab('tathhir');
        } else if (type === 'toolkit' && arg) {
            handleDownloadTemplate(arg as ContractType);
        }
    };

    const prepareAndOpenShareModal = async () => {
        const element = shareCardRef.current;
        if (!element || isGeneratingShare) return;

        setIsGeneratingShare(true);
        showToast('Menyiapkan gambar...', 'info');

        try {
            const canvas = await html2canvas(element, {
                backgroundColor: window.getComputedStyle(document.documentElement).getPropertyValue('content') === 'dark' ? '#0f172a' : '#ffffff',
                scale: 2,
            });

            const imageUrl = canvas.toDataURL('image/png');
            const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
            
            setShareImageData({ url: imageUrl, blob });
            setIsShareModalOpen(true);

        } catch (error) {
            console.error("Failed to generate share image:", error);
            showToast('Gagal membuat gambar pratinjau.', 'error');
        } finally {
            setIsGeneratingShare(false);
        }
    };
    
    const shareImage = async () => {
        if (!shareImageData.blob) return;
        
        const file = new File([shareImageData.blob], 'hede_report.png', { type: 'image/png' });
        const shareData = {
            files: [file],
            title: 'Hasil Audit Finansial Syariah Saya',
            text: `Lihat hasil audit ekonomi syariah saya! Skor Kepatuhan: ${result.totalScore}/100. Cek punyamu di NIZAMY App.`,
        };
        
        try {
            await navigator.share(shareData);
        } catch (error) {
            console.error("Share API failed:", error);
            showToast('Gagal membagikan gambar.', 'error');
        }
    };

    const copySummaryText = async () => {
        const fallbackText = `📊 *Hasil Audit Finansial - NIZAMY*\n\nSkor Kepatuhan: ${result.totalScore}/100\nStatus: ${result.totalScore > 80 ? 'Halal Thayyib' : result.totalScore > 50 ? 'Syubhat (Hati-hati)' : 'Kritis'}\n\nDiagnosa ekonomi syariah mandiri sekarang di NIZAMY App.`;
        try {
            await navigator.clipboard.writeText(fallbackText);
            showToast('Ringkasan berhasil disalin!', 'success');
        } catch (e) {
            console.error("Clipboard API failed:", e);
            showToast('Gagal menyalin hasil. Coba di browser modern.', 'error');
        }
    };


    const TABS = [
        { id: 'summary', label: 'Ringkasan', icon: <FaChartPie /> },
        { id: 'details', label: 'Detail Risiko', icon: <FaListUl /> },
        { id: 'roadmap', label: 'Roadmap', icon: <FaRoad /> },
    ];

    const TabNavigation = () => (
        <div id="hede-tab-navigation" className="p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl gap-1 sticky top-[calc(env(safe-area-inset-top)+4.5rem)] md:top-24 z-30 flex">
            {TABS.map(tab => (
                <button
                    key={tab.id}
                    id={`hede-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id as ReportTab)}
                    className={`flex-1 py-3 px-3 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                        activeTab === tab.id
                        ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800'
                    }`}
                >
                    <span className="icon-wrapper w-4 h-4 shrink-0">{tab.icon}</span>
                    <span className={`${activeTab === tab.id ? 'inline' : 'hidden md:inline'}`}>
                        {activeTab === tab.id ? tab.label : ''}
                        <span className="hidden sm:inline">{activeTab !== tab.id ? tab.label : ''}</span>
                    </span>
                </button>
            ))}
        </div>
    );

    const canShareFiles = typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [new File([], "t.png", { type: "image/png" })] });

    return (
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-10 animate-fade-in relative">
            
            {showOnboarding && <HedeOnboarding onClose={onOnboardingComplete} setActiveTab={setActiveTab} />}
            
            <TabNavigation />

            {/* Tab Content */}
            <div className="md:mt-6">
                <div className={activeTab === 'summary' ? 'block' : 'hidden'}>
                    <div className="animate-fade-in space-y-10">
                        <section id="hede-score-section">
                            <HedeCharts ref={shareCardRef} result={result} />
                        </section>
                        <section className="bg-slate-900 text-white rounded-4xl p-8 md:p-10 relative overflow-hidden shadow-2xl shadow-indigo-900/30">
                            <div className="absolute inset-0 bg-linear-to-br from-indigo-900 via-purple-900 to-slate-900 opacity-90"></div>
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                            <div className="relative z-10 flex flex-col lg:flex-row items-start gap-8">
                                <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner shrink-0">
                                    <span className="icon-wrapper w-12 h-12 text-4xl flex items-center justify-center text-indigo-200"><FaBalanceScale /></span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-3 items-center mb-3">
                                        <span className="text-xs font-bold bg-indigo-500 px-3 py-1 rounded-full text-white uppercase tracking-widest shadow-sm">Rekomendasi Fiqh</span>
                                        <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                                            Metode: {fiqhContext.approach === 'gradual_exit' ? 'Tadarruj (Bertahap)' : fiqhContext.approach === 'immediate_exit' ? 'Bara\'ah (Berlepas Diri)' : 'Istiqamah'}
                                        </h3>
                                    </div>
                                    <p className="text-indigo-100 text-base leading-relaxed opacity-90 mb-6 font-light max-w-3xl">
                                        "{fiqhContext.explanation}"
                                    </p>
                                </div>
                            </div>
                        </section>
                         {result.risks.length > 0 && (
                            <div className="text-center">
                                <button onClick={() => setActiveTab('details')} className="group w-full md:w-auto px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3">
                                    Lihat {result.risks.length} Risiko Terdeteksi
                                    <div className="icon-wrapper w-5 h-5 group-hover:translate-x-1 transition-transform flex items-center justify-center"><FaArrowRight /></div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                <div id="hede-details-section" className={activeTab === 'details' ? 'block' : 'hidden'}>
                    <section className="animate-fade-in bg-white dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-4 md:p-8 shadow-sm">
                        <HedeRisks risks={result.risks} onOpenTerm={onOpenTerm} onSwitchAppTab={onSwitchAppTab} />
                    </section>
                </div>

                <div id="hede-roadmap-section" className={activeTab === 'roadmap' ? 'block' : 'hidden'}>
                    <div className="animate-fade-in space-y-10">
                        <section>
                            <HedeRoadmap roadmap={result.roadmap} onInternalAction={handleRoadmapAction} />
                        </section>
                        <section className="bg-cyan-50 dark:bg-cyan-900/10 rounded-[2.5rem] p-6 md:p-8 border border-cyan-100 dark:border-cyan-800/30">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 rounded-xl"><span className="icon-wrapper w-6 h-6"><FaFileSignature /></span></div>
                                <div>
                                    <h3 className="font-bold text-xl text-slate-800 dark:text-white">Toolkit Hijrah</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Unduh template akad & dokumen pendukung.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {TOOLKIT_ITEMS.map(item => (
                                    <button 
                                        key={item.type}
                                        onClick={() => handleDownloadTemplate(item.type)} 
                                        className="flex flex-col items-center justify-center text-center p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-cyan-400 hover:shadow-md transition-all group h-full"
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${getToolkitColorClasses(item.color)}`}>
                                            <span className="icon-wrapper w-6 h-6 flex items-center justify-center">{item.icon}</span>
                                        </div>
                                        <span className="font-bold text-slate-700 dark:text-slate-200 text-sm leading-tight">{item.title}</span>
                                        <span className="text-[10px] text-slate-400 mt-1">{item.subtitle}</span>
                                        <span className={`mt-3 text-xs font-bold ${getToolkitColorClasses(item.color).split(' ')[1]} flex items-center gap-1`}><span className="icon-wrapper w-3 h-3 flex items-center justify-center"><FaDownload /></span> Unduh</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button onClick={onReset} className="py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 hover:border-slate-300"><span className="icon-wrapper w-4 h-4"><FaRedo /></span> Ulangi Diagnosa</button>
                <button onClick={prepareAndOpenShareModal} disabled={isGeneratingShare} className="py-4 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/50 font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-2 hover:border-indigo-200 disabled:opacity-50">
                    {isGeneratingShare ? <span className="animate-spin icon-wrapper w-4 h-4"><FaSpinner/></span> : <span className="icon-wrapper w-4 h-4"><FaShareAlt /></span>}
                    Bagikan
                </button>
                <button onClick={handleDownload} className="py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 transform hover:-translate-y-1"><span className="icon-wrapper w-4 h-4"><FaDownload /></span> Simpan PDF</button>
            </div>

            <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-100 dark:border-amber-800 text-center relative overflow-hidden">
                <div className="flex flex-col items-center justify-center gap-3 relative z-10">
                    <div className="text-amber-500 dark:text-amber-400 text-2xl"><span className="icon-wrapper w-8 h-8 flex items-center justify-center"><FaExclamationCircle /></span></div>
                    <p className="text-xs text-amber-900 dark:text-amber-100 leading-relaxed max-w-2xl mx-auto font-medium">
                        <strong className="block text-amber-800 dark:text-amber-200 mb-1 uppercase tracking-widest text-[10px]">Disclaimer Penting</strong>
                        Hasil audit ini adalah <strong>diagnosa mandiri (self-assessment)</strong>. Skor dan rekomendasi ini <strong>BUKAN FATWA HUKUM</strong>. Untuk kasus yang kompleks, wajib berkonsultasi langsung (Talaqqi) dengan Ustadz/Ahli Fiqh terpercaya.
                    </p>
                </div>
            </div>

            {isShareModalOpen && (
                <Modal isOpen={true} onClose={() => setIsShareModalOpen(false)} title="Bagikan Laporan" maxWidth="max-w-md">
                    <div className="p-6 space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                             <img src={shareImageData.url} alt="Pratinjau Laporan HEDE" className="w-full rounded-lg" />
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                           <a 
                                href={shareImageData.url} 
                                download="hede_report.png"
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                <FaDownload /> Unduh Gambar
                            </a>
                            {canShareFiles && (
                                <button 
                                    onClick={shareImage}
                                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                                >
                                    <FaShareAlt /> Bagikan Gambar...
                                </button>
                            )}
                             <button 
                                onClick={copySummaryText}
                                className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                            >
                                <FaCopy /> Salin Teks
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};