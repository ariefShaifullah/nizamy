
import React, { useEffect, useState } from 'react';
import type { KamusData } from '../../types.ts';
import { analyzeTajwid } from '../../services/tajwid.helper.ts';
import { getAyahAudioUrl, getWordAudioUrl } from '../../services/mushaf.service.ts';
import { useToast } from '../ui/Toast.tsx';

interface KamusSheetProps {
    data: KamusData | null;
    onClose: () => void;
    onPlayAudio: (url: string) => void;
}

export const KamusSheet: React.FC<KamusSheetProps> = ({ data, onClose, onPlayAudio }) => {
    const { showToast } = useToast();
    const [isClosing, setIsClosing] = useState(false);

    // Clear selection to prevent UI glitch on mobile
    useEffect(() => {
        const clearSelection = () => {
            if (window.getSelection) {
                window.getSelection()?.removeAllRanges();
            }
        };
        clearSelection();
        const timer = setTimeout(clearSelection, 150);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300); // Match animation duration
    };

    if (!data) return null;

    const isAyah = data.type === 'ayah';
    const title = isAyah ? `Opsi Ayat (${data.reference})` : 'Detail Kata & Tajwid';
    const arabicText = isAyah 
        ? (data.data as any).text_uthmani 
        : (data.data as any).text_uthmani;

    const tajwidRules = !isAyah 
        ? analyzeTajwid(
            arabicText, 
            data.nextWordText, 
            (data.data as any).location 
          ) 
        : [];

    // Copy Helper
    const copyToClipboard = async (text: string, label: string) => {
        if (!text) return;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                showToast(`${label} berhasil disalin!`, 'success');
            } else {
                // Fallback logic omitted for brevity, assuming modern browser support for PWA
                throw new Error("Clipboard API unavailable");
            }
        } catch (err) {
            showToast(`Gagal menyalin ${label}.`, 'error');
        }
    };

    const handleCopyText = () => {
        const text = (data.data as any).text_uthmani;
        copyToClipboard(text, 'Teks Arab');
    };

    const handleCopyTranslation = () => {
        if (!isAyah) return;
        const trans = (data.data as any).translations?.[0]?.text?.replace(/<[^>]*>?/gm, '');
        const ref = data.reference;
        const fullText = `${trans} (${ref})`;
        copyToClipboard(fullText, 'Terjemahan');
    };

    return (
        <div 
            className={`fixed inset-0 z-[100] flex items-end justify-center sm:items-center transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            {/* Sheet Content */}
            <div 
                className={`
                    relative bg-white dark:bg-slate-900 w-full max-w-lg 
                    rounded-t-[2.5rem] sm:rounded-[2.5rem] 
                    shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-none 
                    border-t border-white/20 dark:border-slate-700/50
                    transform transition-transform duration-300 ease-out
                    max-h-[85vh] flex flex-col overflow-hidden
                    ${isClosing ? 'translate-y-full sm:scale-95' : 'translate-y-0 sm:scale-100'}
                    sm:mb-8
                `}
                onClick={e => e.stopPropagation()}
            >
                {/* Drag Handle */}
                <div className="w-full flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing" onClick={handleClose}>
                    <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                </div>

                {/* Header Actions */}
                <div className="px-6 pb-2 flex justify-between items-center border-b border-slate-50 dark:border-slate-800/50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            {title}
                        </h3>
                        {isAyah && data.surahInfo && (
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                {data.surahInfo.name_complex} • {data.surahInfo.revelation_place}
                            </p>
                        )}
                    </div>
                    <button 
                        onClick={handleClose} 
                        className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    
                    {/* Hero Arabic Text */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-teal-500/5 dark:bg-teal-500/10 rounded-3xl blur-xl transform group-hover:scale-105 transition-transform duration-500"></div>
                        <div className="relative bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-8 text-center shadow-sm">
                            <p className="font-arabic text-4xl md:text-5xl text-slate-800 dark:text-slate-100 leading-[2] dir-rtl">
                                {arabicText}
                            </p>
                        </div>
                    </div>

                    {/* Play Button */}
                    <button 
                        onClick={() => {
                            const url = isAyah 
                                ? getAyahAudioUrl((data.data as any).verse_key.split(':')[0], (data.data as any).verse_number)
                                : getWordAudioUrl((data.data as any).audio_url);
                            
                            if(url) {
                                onPlayAudio(url);
                            } else {
                                showToast("Audio tidak tersedia", "error");
                            }
                        }}
                        className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 active:scale-[0.98] transition-all"
                    >
                        <span className="bg-white/20 p-1 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 pl-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                        </span>
                        Putar Audio {isAyah ? 'Ayat' : 'Kata'}
                    </button>

                    {/* Action Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleCopyText} className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                            Salin Arab
                        </button>
                        {isAyah && (
                            <button onClick={handleCopyTranslation} className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                                Salin Arti
                            </button>
                        )}
                    </div>

                    {/* Content Detail */}
                    {isAyah ? (
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Terjemahan</h4>
                            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base text-justify font-serif">
                                    {(data.data as any).translations?.[0]?.text?.replace(/<[^>]*>?/gm, '')}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Word Info Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase mb-1">Transliterasi</p>
                                    <p className="font-bold text-indigo-900 dark:text-indigo-100 text-lg">{(data.data as any).transliteration?.text}</p>
                                </div>
                                <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-2xl border border-teal-100 dark:border-teal-800/50">
                                    <p className="text-xs text-teal-600 dark:text-teal-400 font-bold uppercase mb-1">Arti Kata</p>
                                    <p className="font-bold text-teal-900 dark:text-teal-100 text-lg">{(data.data as any).translation?.text}</p>
                                </div>
                            </div>

                            {/* Tajwid Analysis */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                    Analisis Tajwid 
                                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">Beta</span>
                                </h4>
                                {tajwidRules.length > 0 ? (
                                    <div className="space-y-3">
                                        {tajwidRules.map((rule, idx) => (
                                            <div key={idx} className={`p-4 rounded-2xl border-l-4 shadow-sm ${rule.color} bg-opacity-20 dark:bg-opacity-20 flex gap-4 items-start`}>
                                                <div className="mt-1">
                                                    <div className="w-2 h-2 rounded-full bg-current"></div>
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-base">{rule.name}</h5>
                                                    <p className="text-sm mt-1 opacity-90 leading-relaxed">{rule.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Tidak ada hukum tajwid khusus yang terdeteksi pada kata ini.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
