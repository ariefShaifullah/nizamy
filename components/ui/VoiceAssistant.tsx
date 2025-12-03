
import React, { useState, useEffect, useMemo } from 'react';
import { FaMicrophone, FaTimes, FaCheck, FaRedoAlt } from 'react-icons/fa';
// @ts-ignore
import { useLocation } from 'react-router-dom';
import type { VoiceStatus } from '../../hooks/useNizamyVoice.ts';

interface VoiceAssistantOverlayProps {
    isListening: boolean;
    status: VoiceStatus;
    transcript: string;
    feedback: string | null;
    onStop: () => void;
    onRestart: () => void;
}

const SUGGESTIONS_DB: Record<string, string[]> = {
    '/zakat': [ "Hitung Zakat Emas 50 gram", "Hitung Zakat Maal 100 juta", "Hitung Zakat Fitrah" ],
    '/faraidh': [ "Hitung Waris 1 Milyar", "Ada istri ibu dan anak laki", "Hitung Waris" ],
    '/mushaf': [ "Buka Surat Yasin", "Buka Ayat Kursi", "Buka Al Kahfi ayat 10" ],
    '/hafalan': [ "Buka Hafalan", "Cek progres", "Kembali ke beranda" ],
    '/hede': [ "Mulai diagnosa", "Cek halal haram", "Buka Klinik Finansial" ],
    'default': [ "Hitung Zakat Emas", "Buka Surat Yasin", "Hitung Waris", "Buka Hafalan" ]
};

export const VoiceAssistant: React.FC<VoiceAssistantOverlayProps> = ({ 
    isListening, 
    status, 
    transcript, 
    feedback, 
    onStop,
    onRestart
}) => {
    const location = useLocation();
    const [suggestionIndex, setSuggestionIndex] = useState(0);
    const [dots, setDots] = useState('');
    
    const currentSuggestions = useMemo(() => {
        const path = location.pathname;
        if (path.includes('/zakat')) return SUGGESTIONS_DB['/zakat'];
        if (path.includes('/faraidh')) return SUGGESTIONS_DB['/faraidh'];
        if (path.includes('/mushaf')) return SUGGESTIONS_DB['/mushaf'];
        if (path.includes('/hafalan')) return SUGGESTIONS_DB['/hafalan'];
        if (path.includes('/hede')) return SUGGESTIONS_DB['/hede'];
        return SUGGESTIONS_DB['default'];
    }, [location.pathname]);

    // Rotation Suggestion
    useEffect(() => {
        if (isListening && status === 'listening') {
            const interval = setInterval(() => {
                setSuggestionIndex(prev => (prev + 1) % currentSuggestions.length);
            }, 3500);
            return () => clearInterval(interval);
        }
    }, [isListening, status, currentSuggestions]);

    // Loading Dots Animation
    useEffect(() => {
        if (status === 'processing') {
            const interval = setInterval(() => {
                setDots(prev => prev.length >= 3 ? '' : prev + '.');
            }, 400);
            return () => clearInterval(interval);
        }
    }, [status]);

    // Handle Interaction (The Orb is the main button)
    const handleOrbClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (status === 'listening') {
            // Tap while listening -> Force Stop (Manual Endpoint)
            onStop(); 
        } else if (status === 'standby' || status === 'error') {
            // Tap while standby/error -> Restart
            onRestart();
        }
    };

    if (!isListening) return null;

    // --- STATUS CONFIGURATION ---
    
    let title = "Mendengarkan...";
    let subtitle = `Coba katakan: "${currentSuggestions[suggestionIndex]}"`;
    
    // Status Logic
    if (transcript) {
        title = transcript;
        subtitle = "Ketuk gambar jika selesai bicara";
    }
    
    if (status === 'processing') {
        title = "Memproses" + dots;
        subtitle = "Mohon tunggu sebentar...";
    } else if (status === 'success') {
        title = feedback || "Berhasil!";
        subtitle = "Mengalihkan...";
    } else if (status === 'error') {
        title = "Maaf, tidak jelas.";
        subtitle = "Ketuk gambar untuk coba lagi";
    } else if (status === 'standby') {
        title = "Mode Siaga";
        subtitle = "Ketuk gambar untuk bicara lagi";
    }

    // Visual Style Config
    let orbBg = "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/50";
    let orbIcon = <FaMicrophone size={28} />; // Default Icon
    let orbAnimation = "";
    let orbWrapperClass = "text-white";

    if (status === 'listening') {
        orbAnimation = "animate-[pulse_2s_ease-in-out_infinite] scale-110";
    } else if (status === 'processing') {
        orbBg = "bg-slate-800 shadow-slate-500/50";
        // Spinner instead of icon
        orbIcon = (
            <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
        );
        orbAnimation = "scale-90";
    } else if (status === 'success') {
        orbBg = "bg-emerald-500 shadow-emerald-500/50";
        orbIcon = <FaCheck size={28} />;
        orbAnimation = "scale-110";
    } else if (status === 'standby' || status === 'error') {
        orbBg = "bg-slate-200 dark:bg-slate-700 shadow-none";
        orbWrapperClass = "text-slate-500 dark:text-slate-400";
        orbIcon = <FaRedoAlt size={24} />;
        orbAnimation = "scale-100 hover:scale-105";
    }

    return (
        <div className="fixed inset-0 z-overlay flex flex-col justify-end pointer-events-none font-sans">
            {/* Backdrop Blur (Click to Close) */}
            <div 
                className="absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto"
                onClick={onStop}
            />

            {/* Floating Bottom Sheet */}
            <div className={`
                relative w-full max-w-lg mx-auto 
                bg-white/10 dark:bg-slate-900/10 backdrop-blur-2xl 
                rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)]
                p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]
                transform transition-transform duration-500 ease-out pointer-events-auto
                flex flex-col items-center justify-center
                border-t border-white/20 dark:border-slate-700
                ${isListening ? 'translate-y-0' : 'translate-y-full'}
            `}>
                
                

                {/* ORB VISUALIZER */}
                <div className="relative mb-6 mt-2">
                    {/* Ripple Effect Layers (Only active when listening) */}
                    {status === 'listening' && (
                        <>
                            <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                            <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]"></div>
                        </>
                    )}
                    
                    {/* Main Orb Button */}
                    <button 
                        onClick={handleOrbClick}
                        className={`
                            relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ease-out
                            ${orbBg} ${orbAnimation} ${orbWrapperClass}
                        `}
                        aria-label="Status Indikator"
                    >
                        {orbIcon}
                    </button>
                </div>

                {/* Text Content */}
                <div className="text-center space-y-1 max-w-xs mx-auto min-h-[60px]">
                    <h3 className={`text-xl font-bold leading-tight transition-colors duration-300 ${status === 'error' ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                        {title}
                    </h3>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 animate-fade-in leading-relaxed">
                        {subtitle}
                    </p>
                </div>

            </div>
        </div>
    );
};
