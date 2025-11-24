
import React, { useEffect } from 'react';
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

    // Fix: Clear any accidental text selection caused by the Long Press gesture
    useEffect(() => {
        const clearSelection = () => {
            if (window.getSelection) {
                window.getSelection()?.removeAllRanges();
            }
        };

        // Immediate clear
        clearSelection();

        // Delayed clear to handle lingering touch events on mobile/iOS
        const timer = setTimeout(clearSelection, 150);
        return () => clearTimeout(timer);
    }, []);

    if (!data) return null;

    const isAyah = data.type === 'ayah';
    const title = isAyah ? `Opsi Ayat (${data.reference})` : 'Detail Kata (Tajwid)';
    const arabicText = isAyah 
        ? (data.data as any).text_uthmani 
        : (data.data as any).text_uthmani;

    // Logic for Word Kamus
    const tajwidRules = !isAyah 
        ? analyzeTajwid(
            arabicText, 
            data.nextWordText, // Pass next word context
            (data.data as any).location // Pass location e.g "12:11:5" for special rules
          ) 
        : [];

    // Robust Copy Helper with Mobile Fallback
    const copyToClipboard = async (text: string, label: string) => {
        if (!text) return;

        try {
            // 1. Try Modern API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                showToast(`${label} berhasil disalin!`, 'success');
                // UX FIX: Do not close modal explicitly to keep user context
            } else {
                throw new Error("Clipboard API unavailable");
            }
        } catch (err) {
            // 2. Fallback for Mobile/Legacy Browsers (execCommand)
            try {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                
                // Ensure it's not visible but part of DOM to allow focus
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                textArea.setAttribute('readonly', '');
                document.body.appendChild(textArea);
                
                textArea.focus();
                textArea.select();
                
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                
                if (successful) {
                    showToast(`${label} berhasil disalin!`, 'success');
                    // UX FIX: Modal stays open
                } else {
                    showToast(`Gagal menyalin ${label}. Izin browser dibatasi.`, 'error');
                }
            } catch (fallbackErr) {
                console.error("Copy failed", fallbackErr);
                showToast(`Gagal menyalin ${label}.`, 'error');
            }
        }
    };

    const handleCopyText = () => {
        if (!data) return;
        const text = (data.data as any).text_uthmani;
        copyToClipboard(text, 'Teks Arab');
    };

    const handleCopyTranslation = () => {
        if (!data || !isAyah) return;
        const trans = (data.data as any).translations?.[0]?.text?.replace(/<[^>]*>?/gm, '');
        const ref = data.reference;
        const fullText = `${trans} (${ref})`;
        copyToClipboard(fullText, 'Terjemahan');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-3xl shadow-2xl transform transition-transform animate-fade-in-up max-h-[85vh] overflow-y-auto flex flex-col select-none" onClick={e => e.stopPropagation()}>
                
                {/* Handle Bar */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="text-xl">{isAyah ? '⚙️' : '🔍'}</span> {title}
                        </h3>
                        {isAyah && (data.surahInfo) && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {data.surahInfo.name_complex} • {data.surahInfo.revelation_place}
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto pb-10">
                    
                    {/* Big Arabic Text Preview */}
                    <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="font-arabic text-3xl md:text-4xl text-slate-800 dark:text-white leading-[2] dir-rtl px-4">
                            {arabicText}
                        </p>
                    </div>

                    {/* Primary Actions */}
                    <div className="grid grid-cols-1 gap-3">
                        <button 
                            onClick={() => {
                                const url = isAyah 
                                    ? getAyahAudioUrl((data.data as any).verse_key.split(':')[0], (data.data as any).verse_number)
                                    : getWordAudioUrl((data.data as any).audio_url);
                                if(url) {
                                    onPlayAudio(url);
                                    // UX FIX: Modal remains open to allow user to listen repeatedly
                                } else {
                                    showToast("Audio tidak tersedia", "error");
                                }
                            }}
                            className="w-full bg-teal-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-200 dark:shadow-none active:scale-95 transition-transform"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                            Putar Audio
                        </button>

                        <div className="flex gap-3">
                            <button 
                                onClick={handleCopyText}
                                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:bg-slate-300"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                Salin Arab
                            </button>
                            {isAyah && (
                                <button 
                                    onClick={handleCopyTranslation}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:bg-slate-300"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                                    Salin Arti
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Details Section */}
                    {isAyah ? (
                        <div className="space-y-4 pt-2">
                            <div>
                                <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Terjemahan Lengkap</h4>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base text-justify">
                                        {(data.data as any).translations?.[0]?.text?.replace(/<[^>]*>?/gm, '')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Transliteration & Translation for Word */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Transliterasi</p>
                                    <p className="font-bold text-slate-700 dark:text-slate-200">{(data.data as any).transliteration?.text}</p>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Arti Kata</p>
                                    <p className="font-bold text-slate-700 dark:text-slate-200">{(data.data as any).translation?.text}</p>
                                </div>
                            </div>

                            {/* Tajwid Rules */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Analisis Tajwid & Makhraj</h4>
                                {tajwidRules.length > 0 ? (
                                    <div className="space-y-2">
                                        {tajwidRules.map((rule, idx) => (
                                            <div key={idx} className={`p-4 rounded-xl flex gap-3 items-start ${rule.color}`}>
                                                <span className="mt-0.5 font-bold text-lg">•</span>
                                                <div>
                                                    <h5 className="font-bold text-sm">{rule.name}</h5>
                                                    <p className="text-xs mt-0.5 opacity-90">{rule.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                                        <p className="text-sm text-slate-500 italic">Tidak ada hukum tajwid khusus yang terdeteksi secara otomatis pada kata ini.</p>
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
