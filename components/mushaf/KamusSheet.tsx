
import React, { useEffect, useState } from 'react';
import type { KamusData } from '../../types.ts';
import type { TajwidRule } from '../../services/tajwid.helper.ts';
import { analyzeTajwid, getMakhrajDetails } from '../../services/tajwid.helper.ts';
import { getAyahAudioUrl, getWordAudioUrl } from '../../services/mushaf.service.ts';
import { useToast } from '../ui/Toast.tsx';
import { FaTimes, FaPlay, FaCopy, FaLanguage } from 'react-icons/fa';

interface KamusSheetProps {
    data: KamusData | null;
    onClose: () => void;
    onPlayAudio: (url: string) => void;
}

// --- HELPER: Colored Text Renderer ---
const HighlightedArabicText: React.FC<{ text: string; rules: TajwidRule[]; fontSize?: string }> = ({ text, rules, fontSize = 'text-3xl md:text-4xl lg:text-5xl' }) => {
    // Create an array of character objects
    const chars = text.split('').map((char, index) => {
        // Find if this index is covered by any rule
        // We take the LAST rule found (highest priority usually) or combine styles
        const activeRule = rules.find(r => r.indexes && r.indexes.includes(index));
        return {
            char,
            colorClass: activeRule ? activeRule.color : 'text-slate-800 dark:text-slate-100'
        };
    });

    return (
        <p 
            className={`font-arabic ${fontSize} dir-rtl text-center py-6 px-2`}
            style={{ lineHeight: '2.8', direction: 'rtl' }} // RELAXED LINE HEIGHT
        >
            {chars.map((c, i) => (
                <span key={i} className={`${c.colorClass} transition-colors duration-300 relative`}>
                    {c.char}
                </span>
            ))}
        </p>
    );
};

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
    const arabicText = (data.data as any).text_uthmani;

    // ANALISIS TAJWID
    // Jika Ayat: Analisis seluruh teks ayat (tanpa context nextWord)
    // Jika Kata: Analisis kata dengan context nextWord
    const tajwidRules = isAyah 
        ? analyzeTajwid(arabicText, undefined, undefined, true) // Assume end of ayah logic applies loosely here
        : analyzeTajwid(
            arabicText, 
            data.nextWordText, 
            (data.data as any).location,
            data.isEndAyah 
          );

    const makhrajList = !isAyah
        ? getMakhrajDetails(arabicText)
        : [];

    // Copy Helper
    const copyToClipboard = async (text: string, label: string) => {
        if (!text) return;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                showToast(`${label} berhasil disalin!`, 'success');
            } else {
                throw new Error("Clipboard API unavailable");
            }
        } catch (err) {
            showToast(`Gagal menyalin ${label}.`, 'error');
        }
    };

    const handleCopyText = () => {
        copyToClipboard(arabicText, 'Teks Arab');
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
                    relative bg-white dark:bg-slate-900 w-full max-w-xl 
                    rounded-t-[2.5rem] sm:rounded-[2.5rem] 
                    shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-none 
                    border-t border-white/20 dark:border-slate-700/50
                    transform transition-transform duration-300 ease-out
                    max-h-[90vh] flex flex-col overflow-hidden
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
                <div className="px-6 pb-4 flex justify-between items-center border-b border-slate-50 dark:border-slate-800/50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            {title}
                        </h3>
                        {isAyah && data.surahInfo && (
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                {data.surahInfo.name_complex} • {data.surahInfo.revelation_place}
                            </p>
                        )}
                    </div>
                    <button 
                        onClick={handleClose} 
                        className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Tutup"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    
                    {/* Hero Arabic Text (Color Coded for BOTH Ayah and Word) */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-teal-500/5 dark:bg-teal-500/10 rounded-3xl blur-xl transform group-hover:scale-105 transition-transform duration-500"></div>
                        <div className="relative bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl px-2 shadow-sm overflow-hidden">
                             {/* Added subtle background pattern */}
                             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                                style={{ backgroundImage: 'radial-gradient(circle, #0f766e 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                            </div>
                            <HighlightedArabicText text={arabicText} rules={tajwidRules} fontSize={isAyah ? "text-2xl md:text-3xl" : undefined} />
                        </div>
                        {isAyah && (
                            <p className="text-center text-[10px] text-slate-400 mt-2 italic">
                                Teks diwarnai otomatis berdasarkan kaidah tajwid.
                            </p>
                        )}
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
                        <span className="bg-white/20 p-2 rounded-full pl-2.5">
                            <FaPlay size={14} />
                        </span>
                        Putar Audio {isAyah ? 'Ayat' : 'Kata'}
                    </button>

                    {/* Action Grid */}
                    <div className={`grid gap-3 ${isAyah ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        <button onClick={handleCopyText} className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors">
                            <FaCopy size={16} />
                            Salin Arab
                        </button>
                        {isAyah && (
                            <button onClick={handleCopyTranslation} className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors">
                                <span className="text-lg"><FaLanguage /></span>
                                Salin Arti
                            </button>
                        )}
                    </div>

                    {/* Content Detail */}
                    {isAyah ? (
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                                Terjemahan
                            </h4>
                            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <p className="text-slate-700 dark:text-slate-300 leading-loose text-base text-justify font-serif">
                                    {(data.data as any).translations?.[0]?.text?.replace(/<[^>]*>?/gm, '')}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
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
                                <div className="flex items-center gap-2 mb-3">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Analisis Tajwid
                                    </h4>
                                    <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/50 uppercase tracking-wide">
                                        Beta
                                    </span>
                                </div>
                                {tajwidRules.length > 0 ? (
                                    <div className="space-y-3">
                                        {tajwidRules.map((rule, idx) => (
                                            <div key={idx} className={`p-4 rounded-2xl border-l-4 shadow-sm bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 flex gap-4 items-start`}>
                                                <div className="mt-1">
                                                    <div className={`w-3 h-3 rounded-full ${rule.color.replace('text-', 'bg-').split(' ')[0]}`}></div>
                                                </div>
                                                <div>
                                                    <h5 className={`font-bold text-base ${rule.color}`}>{rule.name}</h5>
                                                    <p className="text-sm mt-1 opacity-90 leading-relaxed text-slate-600 dark:text-slate-300">{rule.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Tidak ada hukum tajwid khusus yang terdeteksi pada kata ini.</p>
                                    </div>
                                )}
                            </div>

                            {/* Makharijul Huruf */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                                    Bedah Makhraj Huruf
                                </h4>
                                {makhrajList.length > 0 ? (
                                    <div className="space-y-3">
                                        {makhrajList.map((m, idx) => (
                                            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex gap-4">
                                                <div className="w-12 h-12 flex-shrink-0 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-2xl font-arabic border border-slate-100 dark:border-slate-600 text-slate-800 dark:text-slate-200">
                                                    {m.letter}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap gap-2 mb-1">
                                                        <h5 className="font-bold text-slate-800 dark:text-white">{m.name}</h5>
                                                        <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-medium">{m.area}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{m.place}</p>
                                                    
                                                    {/* Sifat Pills */}
                                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                                        {m.sifat.map(s => (
                                                            <span key={s} className="text-[10px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">
                                                                {s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    {m.note && (
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 italic border-l-2 border-slate-300 pl-2">
                                                            Tips: {m.note}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-sm text-center">Data makhraj tidak tersedia.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
