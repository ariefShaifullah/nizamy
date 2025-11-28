import React, { useState, useMemo } from 'react';
import type { HedeResult, ViolationType, HedeTab } from '../../../types.ts';
import { FIQH_GLOSSARY, VIOLATION_STYLES } from '../constants.ts';
import { exportHedePdf } from '../logic/pdf-export.ts';
import { generateContractPdf, type ContractType } from '../logic/contract-templates.ts';
import { Modal } from '../../../components/ui/Modal.tsx';
import { useToast } from '../../../components/ui/Toast.tsx';
import { 
    FaDownload, 
    FaRedo, 
    FaBalanceScale,
    FaBook,
    FaShareAlt,
    FaExclamationCircle,
    FaSearch,
    FaFileSignature,
    FaHandshake,
    FaPray,
    FaChartPie,
    FaListUl,
    FaRoad
} from 'react-icons/fa';

import { HedeCharts } from './report/HedeCharts.tsx';
import { HedeRisks } from './report/HedeRisks.tsx';
import { HedeRoadmap } from './report/HedeRoadmap.tsx';

interface HedeReportProps {
    result: HedeResult;
    onReset: () => void;
    onSwitchAppTab: (tab: HedeTab) => void;
}

type ReportTab = 'summary' | 'details' | 'roadmap';

const ViolationBadge: React.FC<{ type: ViolationType | 'general' }> = ({ type }) => {
    if (type === 'general' || type === 'none') return <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ml-2 border bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600">Umum</span>;
    return <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ml-2 border ${VIOLATION_STYLES[type]}`}>{type}</span>;
};

export const HedeReport: React.FC<HedeReportProps> = ({ result, onReset, onSwitchAppTab }) => {
    const [activeTab, setActiveTab] = useState<ReportTab>('summary');
    const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(""); 
    const { showToast } = useToast();
    const fiqhContext = result.fiqhContext;

    const handleDownload = async () => {
        showToast('Mengunduh laporan...', 'info');
        try {
            await exportHedePdf(result);
            showToast('Laporan berhasil diunduh.', 'success');
        } catch (error) {
            console.error(error);
            showToast('Gagal mengunduh laporan.', 'error');
        }
    };

    const handleDownloadTemplate = async (type: ContractType) => {
        showToast('Menyiapkan dokumen...', 'info');
        try {
            await generateContractPdf(type);
            showToast('Dokumen berhasil diunduh.', 'success');
        } catch (error) {
            console.error(error);
            showToast('Gagal membuat dokumen.', 'error');
        }
    };

    const handleShare = async () => {
        const text = `📊 *Hasil Audit H.E.D.E - NIZAMY*\n\nSkor Kepatuhan: ${result.totalScore}/100\nStatus: ${result.totalScore > 80 ? 'Halal Thayyib' : result.totalScore > 50 ? 'Syubhat (Hati-hati)' : 'Kritis'}\n\nDiagnosa ekonomi syariah mandiri sekarang di NIZAMY App.`;
        if (navigator.share) {
            try { await navigator.share({ title: 'Hasil Audit H.E.D.E', text: text, url: window.location.href }); } catch (err) {}
        } else {
            try { await navigator.clipboard.writeText(text); showToast('Disalin ke clipboard!', 'success'); } catch (e) { showToast('Gagal menyalin.', 'error'); }
        }
    };

    const getFiqhTermForApproach = () => {
        if (fiqhContext.approach === 'gradual_exit') return 'Tadarruj';
        if (fiqhContext.approach === 'immediate_exit') return 'Bara\'ah';
        return 'Istiqamah';
    };

    const filteredGlossary = useMemo(() => {
        return FIQH_GLOSSARY
            .filter(item => item.term.toLowerCase().includes(searchTerm.toLowerCase()) || item.definition.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => a.term.localeCompare(b.term));
    }, [searchTerm]);

    const TABS = [
        { id: 'summary', label: 'Ringkasan', icon: <FaChartPie /> },
        { id: 'details', label: 'Detail Risiko', icon: <FaListUl /> },
        { id: 'roadmap', label: 'Roadmap', icon: <FaRoad /> },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-24">
            
            <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-2xl flex gap-1 sticky top-[calc(env(safe-area-inset-top)+4.5rem)] md:top-24 z-20">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ReportTab)}
                        className={`flex-1 py-3 px-2 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                            activeTab === tab.id
                            ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800'
                        }`}
                    >
                        <span className="icon-wrapper w-4 h-4">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'summary' && (
                    <div className="animate-fade-in space-y-10">
                        <section>
                            <HedeCharts result={result} />
                        </section>
                        <section className="bg-slate-900 text-white rounded-[2rem] p-8 md:p-10 relative overflow-hidden shadow-2xl shadow-indigo-900/30">
                            {/* ... Fiqh Context ... */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 opacity-90"></div>
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                            <div className="relative z-10 flex flex-col lg:flex-row items-start gap-8">
                                <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner flex-shrink-0">
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
                                    <div className="flex flex-wrap gap-3">
                                        <button onClick={() => setSelectedTerm(getFiqhTermForApproach())} className="text-sm bg-white text-indigo-900 hover:bg-indigo-50 px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 font-bold active:scale-95">
                                            <span className="icon-wrapper w-4 h-4"><FaBook /></span> Pelajari Kaidah Ini
                                        </button>
                                        <button onClick={() => setSelectedTerm('INDEX')} className="text-sm bg-indigo-800/50 hover:bg-indigo-800 px-5 py-2.5 rounded-xl transition-all border border-indigo-500/30 flex items-center gap-2 font-medium">
                                            Buka Kamus Muamalah
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
                
                {activeTab === 'details' && (
                    <section className="animate-fade-in bg-white dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-4 md:p-8 shadow-sm">
                        <HedeRisks risks={result.risks} onOpenTerm={(term) => setSelectedTerm(term)} onSwitchAppTab={onSwitchAppTab} />
                    </section>
                )}

                {activeTab === 'roadmap' && (
                    <div className="animate-fade-in space-y-10">
                        <section>
                            <HedeRoadmap roadmap={result.roadmap} />
                        </section>
                        <section className="bg-cyan-50 dark:bg-cyan-900/10 rounded-[2.5rem] p-6 md:p-8 border border-cyan-100 dark:border-cyan-800/30">
                            {/* ... TOOLKIT HIJRAH ... */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 rounded-xl">
                                    <span className="icon-wrapper w-6 h-6"><FaFileSignature /></span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-slate-800 dark:text-white">Toolkit Hijrah</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Unduh template akad & dokumen pendukung.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <button onClick={() => handleDownloadTemplate('qardh')} className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-cyan-400 hover:shadow-md transition-all group">
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><span className="icon-wrapper w-6 h-6 flex items-center justify-center"><FaHandshake /></span></div>
                                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">Akad Qardh</span>
                                    <span className="text-[10px] text-slate-400 mt-1">Utang Piutang (No Riba)</span>
                                    <span className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1"><span className="icon-wrapper w-3 h-3 flex items-center justify-center"><FaDownload /></span> Unduh PDF</span>
                                </button>
                                <button onClick={() => handleDownloadTemplate('mudharabah')} className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-cyan-400 hover:shadow-md transition-all group">
                                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><span className="icon-wrapper w-6 h-6 flex items-center justify-center"><FaBalanceScale /></span></div>
                                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">Akad Mudharabah</span>
                                    <span className="text-[10px] text-slate-400 mt-1">Investasi Bagi Hasil</span>
                                    <span className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><span className="icon-wrapper w-3 h-3 flex items-center justify-center"><FaDownload /></span> Unduh PDF</span>
                                </button>
                                <button onClick={() => handleDownloadTemplate('taubat')} className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-cyan-400 hover:shadow-md transition-all group">
                                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><span className="icon-wrapper w-6 h-6 flex items-center justify-center"><FaPray /></span></div>
                                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">Ikrar Bara'ah</span>
                                    <span className="text-[10px] text-slate-400 mt-1">Pernyataan Taubat</span>
                                    <span className="mt-3 text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1"><span className="icon-wrapper w-3 h-3 flex items-center justify-center"><FaDownload /></span> Unduh PDF</span>
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </div>


            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button onClick={onReset} className="py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 hover:border-slate-300">
                    <span className="icon-wrapper w-4 h-4"><FaRedo /></span> Ulangi Diagnosa
                </button>
                <button onClick={handleShare} className="py-4 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/50 font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-2 hover:border-indigo-200">
                    <span className="icon-wrapper w-4 h-4"><FaShareAlt /></span> Bagikan
                </button>
                <button onClick={handleDownload} className="py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 transform hover:-translate-y-1">
                    <span className="icon-wrapper w-4 h-4"><FaDownload /></span> Simpan PDF
                </button>
            </div>

            {/* Permanent Disclaimer */}
            <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-100 dark:border-amber-800 text-center relative overflow-hidden">
                <div className="flex flex-col items-center justify-center gap-3 relative z-10">
                    <div className="text-amber-500 dark:text-amber-400 text-2xl"><span className="icon-wrapper w-8 h-8 flex items-center justify-center"><FaExclamationCircle /></span></div>
                    <p className="text-xs text-amber-900 dark:text-amber-100 leading-relaxed max-w-2xl mx-auto font-medium">
                        <strong className="block text-amber-800 dark:text-amber-200 mb-1 uppercase tracking-widest text-[10px]">Disclaimer Penting</strong>
                        Hasil audit ini adalah <strong>diagnosa mandiri (self-assessment)</strong>. Skor dan rekomendasi ini <strong>BUKAN FATWA HUKUM</strong>. 
                        Untuk kasus yang kompleks (terutama terkait hak orang lain/waris/utang piutang), wajib berkonsultasi langsung (Talaqqi) dengan Ustadz/Ahli Fiqh terpercaya.
                    </p>
                </div>
            </div>

            {/* Glossary Modal */}
            {selectedTerm && (
                <Modal isOpen={true} onClose={() => { setSelectedTerm(null); setSearchTerm(""); }} title="Kamus Muamalah" maxWidth="max-w-md">
                    <div className={`p-6 flex flex-col ${selectedTerm === 'INDEX' ? 'h-[70vh]' : 'h-auto'}`}>
                        {(() => {
                            if (selectedTerm === 'INDEX') {
                                return (
                                    <>
                                        <div className="mb-4 relative shrink-0">
                                            <span className="absolute left-4 top-3.5 text-slate-400 icon-wrapper w-4 h-4"><FaSearch /></span>
                                            <input 
                                                type="text" 
                                                placeholder="Cari istilah (contoh: Riba)..."
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                                            {filteredGlossary.length === 0 ? (
                                                <div className="text-center py-20 text-slate-400 text-sm">Istilah tidak ditemukan.</div>
                                            ) : (
                                                filteredGlossary.map(t => (
                                                    <button 
                                                        key={t.term}
                                                        onClick={() => setSelectedTerm(t.term)}
                                                        className="text-left w-full p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all flex items-center justify-between group"
                                                    >
                                                        <span className="font-bold text-slate-700 dark:text-slate-200 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{t.term}</span>
                                                        <ViolationBadge type={t.category === 'general' ? 'general' : t.category} />
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </>
                                );
                            }

                            const term = FIQH_GLOSSARY.find(t => t.term === selectedTerm);
                            if (!term) return <p className="text-center text-slate-500">Definisi tidak ditemukan.</p>;
                            
                            return (
                                <div className="flex flex-col">
                                    <div className="flex items-center justify-between gap-2 mb-6">
                                        <h3 className="text-2xl font-black text-slate-800 dark:text-white">{term.term}</h3>
                                        <ViolationBadge type={term.category === 'general' ? 'general' : term.category} />
                                    </div>
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800 mb-6">
                                        <p className="text-slate-700 dark:text-slate-200 text-sm leading-loose">
                                            {term.definition}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <button 
                                            onClick={() => setSelectedTerm('INDEX')}
                                            className="w-full py-3 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 text-sm font-bold transition-colors border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
                                        >
                                            &larr; Lihat Daftar Istilah
                                        </button>
                                        <button 
                                            onClick={() => setSelectedTerm(null)}
                                            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                                        >
                                            Tutup
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </Modal>
            )}
        </div>
    );
};