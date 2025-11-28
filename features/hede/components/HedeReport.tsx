
import React, { useState, useMemo } from 'react';
import type { HedeResult, ViolationType } from '../../../types.ts';
import { FIQH_GLOSSARY, VIOLATION_STYLES } from '../constants.ts';
import { exportHedePdf } from '../logic/pdf-export.ts';
import { Modal } from '../../../components/ui/Modal.tsx';
import { useToast } from '../../../components/ui/Toast.tsx';
import { 
    FaDownload, 
    FaRedo, 
    FaBalanceScale,
    FaBook,
    FaShareAlt,
    FaExclamationCircle,
    FaSearch
} from 'react-icons/fa';

// Import Refactored Components
import { HedeCharts } from './report/HedeCharts.tsx';
import { HedeRisks } from './report/HedeRisks.tsx';
import { HedeRoadmap } from './report/HedeRoadmap.tsx';

interface HedeReportProps {
    result: HedeResult;
    onReset: () => void;
}

const ViolationBadge: React.FC<{ type: ViolationType | 'general' }> = ({ type }) => {
    if (type === 'general' || type === 'none') return <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ml-2 border bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600">Umum</span>;
    return <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ml-2 border ${VIOLATION_STYLES[type]}`}>{type}</span>;
};

export const HedeReport: React.FC<HedeReportProps> = ({ result, onReset }) => {
    const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(""); // State for modal search
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

    const handleShare = async () => {
        const text = `📊 *Hasil Audit Ekonomi Syariah (H.E.D.E)*\n\nSkor Kepatuhan: ${result.totalScore}/100\nStatus: ${result.totalScore > 80 ? 'Halal Thayyib' : result.totalScore > 50 ? 'Syubhat (Hati-hati)' : 'Kritis (Perlu Hijrah)'}\n\nDiagnosa diri Anda sekarang di NIZAMY App. Gratis & Privasi Terjaga.`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Hasil Audit H.E.D.E',
                    text: text,
                    url: window.location.href
                });
            } catch (err) {
                // User cancelled or error
            }
        } else {
            try {
                await navigator.clipboard.writeText(text);
                showToast('Hasil disalin ke clipboard!', 'success');
            } catch (e) {
                showToast('Gagal menyalin.', 'error');
            }
        }
    };

    const getFiqhTermForApproach = () => {
        if (fiqhContext.approach === 'gradual_exit') return 'Tadarruj';
        if (fiqhContext.approach === 'immediate_exit') return 'Bara\'ah';
        return 'Istiqamah';
    };

    // Filter & Sort Logic for Glossary
    const filteredGlossary = useMemo(() => {
        return FIQH_GLOSSARY
            .filter(item => 
                item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.definition.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => a.term.localeCompare(b.term)); // A-Z Sorting
    }, [searchTerm]);

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-24">
            
            {/* 1. Header & Diagnosis Dashboard */}
            <HedeCharts result={result} />

            {/* 2. Fiqh Context (Methodology) */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-indigo-900/20 border border-indigo-500/30">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
                        <div className="icon-wrapper w-10 h-10 text-3xl flex items-center justify-center text-indigo-300"><FaBalanceScale /></div>
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-wrap gap-2 items-center mb-2">
                            <span className="text-xs font-bold bg-indigo-500/30 border border-indigo-400/50 px-2 py-1 rounded text-indigo-200 uppercase tracking-wide">Rekomendasi Fiqh</span>
                            <h3 className="text-xl md:text-2xl font-bold">
                                Metode: {fiqhContext.approach === 'gradual_exit' ? 'Tadarruj (Bertahap)' : fiqhContext.approach === 'immediate_exit' ? 'Bara\'ah (Berlepas Diri)' : 'Istiqamah'}
                            </h3>
                        </div>
                        <p className="text-indigo-100 text-sm leading-relaxed opacity-90 mb-4 font-light border-l-2 border-indigo-500 pl-4">
                            "{fiqhContext.explanation}"
                        </p>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setSelectedTerm(getFiqhTermForApproach())}
                                className="text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 w-fit font-medium"
                            >
                                <span className="icon-wrapper w-3 h-3"><FaBook /></span> Pelajari Kaidah Ini
                            </button>
                            <button 
                                onClick={() => setSelectedTerm('INDEX')}
                                className="text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 w-fit font-medium"
                            >
                                Buka Kamus Muamalah
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Detailed Risks */}
            <HedeRisks risks={result.risks} onOpenTerm={(term) => setSelectedTerm(term)} />

            {/* 4. Action Roadmap */}
            <HedeRoadmap roadmap={result.roadmap} />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button onClick={onReset} className="flex-1 py-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                    <span className="icon-wrapper w-4 h-4 flex items-center justify-center"><FaRedo /></span> Ulangi
                </button>
                <button onClick={handleShare} className="flex-1 py-4 rounded-xl border border-indigo-200 dark:border-indigo-800 font-bold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-center gap-2">
                    <span className="icon-wrapper w-4 h-4 flex items-center justify-center"><FaShareAlt /></span> Bagikan
                </button>
                <button onClick={handleDownload} className="flex-1 py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2">
                    <span className="icon-wrapper w-4 h-4 flex items-center justify-center"><FaDownload /></span> Simpan PDF
                </button>
            </div>

            {/* Permanent Disclaimer */}
            <div className="mt-8 p-5 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400 dark:bg-amber-700"></div>
                <div className="flex flex-col items-center justify-center gap-2 relative z-10">
                    <div className="text-amber-500 dark:text-amber-400 text-xl"><FaExclamationCircle /></div>
                    <p className="text-[11px] md:text-xs text-amber-900 dark:text-amber-100 leading-relaxed max-w-3xl mx-auto font-medium">
                        <strong className="block text-amber-800 dark:text-amber-200 mb-1 uppercase tracking-widest text-[10px]">Disclaimer (Penafian)</strong>
                        Hasil audit ini adalah <strong>diagnosa mandiri (self-assessment)</strong> berdasarkan algoritma yang merujuk pada kaidah umum Fiqh Muamalah. 
                        Skor dan rekomendasi ini <strong>BUKAN FATWA HUKUM</strong>. Kami tidak bertanggung jawab atas keputusan finansial yang Anda ambil. 
                        Untuk kasus yang kompleks (terutama terkait hak orang lain/waris), wajib berkonsultasi langsung (Talaqqi) dengan Ustadz/Ahli Fiqh terpercaya.
                    </p>
                </div>
            </div>

            {/* Glossary Modal */}
            {selectedTerm && (
                <Modal isOpen={true} onClose={() => { setSelectedTerm(null); setSearchTerm(""); }} title="Kamus Muamalah" maxWidth="max-w-sm">
                    {/* Updated Class: Use Dynamic Height based on content type */}
                    <div className={`p-6 flex flex-col ${selectedTerm === 'INDEX' ? 'h-[60vh]' : 'h-auto'}`}>
                        {(() => {
                            if (selectedTerm === 'INDEX') {
                                return (
                                    <>
                                        <div className="mb-4 relative shrink-0">
                                            <span className="absolute left-3 top-3 text-slate-400"><FaSearch /></span>
                                            <input 
                                                type="text" 
                                                placeholder="Cari istilah (contoh: Riba)..."
                                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                                            {filteredGlossary.length === 0 ? (
                                                <div className="text-center py-10 text-slate-400 text-sm">
                                                    Istilah tidak ditemukan.
                                                </div>
                                            ) : (
                                                filteredGlossary.map(t => (
                                                    <button 
                                                        key={t.term}
                                                        onClick={() => setSelectedTerm(t.term)}
                                                        className="text-left w-full p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all flex items-center justify-between group"
                                                    >
                                                        <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{t.term}</span>
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
                                    <div className="flex items-center gap-2 mb-4">
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">{term.term}</h3>
                                        <ViolationBadge type={term.category === 'general' ? 'general' : term.category} />
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                        {term.definition}
                                    </p>
                                    <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <button 
                                            onClick={() => setSelectedTerm('INDEX')}
                                            className="w-full py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-bold"
                                        >
                                            &larr; Lihat Daftar Istilah
                                        </button>
                                        <button 
                                            onClick={() => setSelectedTerm(null)}
                                            className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
                                        >
                                            Saya Mengerti
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
