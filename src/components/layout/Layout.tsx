import React, { useState } from 'react';
// @ts-ignore
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext.tsx';
import { GlobalSettings } from '../../features/settings/components/GlobalSettings.tsx';
import { LegalModal, type LegalType } from '../../features/settings/components/LegalModal.tsx';
import { VoiceAssistant } from '../ui/VoiceAssistant.tsx';
import { useNizamyVoice } from '../../hooks/useNizamyVoice.ts';
import { FaSun, FaMoon, FaCog, FaArrowLeft, FaShieldAlt, FaFileContract, FaMicrophone } from 'react-icons/fa';

export const Header: React.FC = () => {
    const { toggleTheme, isDark } = useTheme();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Voice Assistant Logic
    const { isListening, status, transcript, feedback, startListening, stopListening, isSupported } = useNizamyVoice();

    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';

    // Unified teal color for all pages — no more per-route color chaos
    const titleColor = 'text-teal-600 dark:text-teal-400';

    // Simple subtitle map
    const subtitleMap: Record<string, string> = {
        '/zakat': 'Kalkulator Zakat',
        '/faraidh': 'Kalkulator Waris',
        '/hafalan': 'Hafalan Quran',
        '/mushaf': 'Al-Quran',
        '/hede': 'Cek Finansial',
        '/amal': 'Amal Yaumi',
        '/sholat': 'Jadwal Sholat',
        '/scanner': 'Cek Halal',
    };
    const subtitle = Object.entries(subtitleMap).find(([path]) => location.pathname.includes(path))?.[1] || '';

    const logoStyle = {
        maskImage: 'url("/images/logo_nizamy.png?v=6")',
        WebkitMaskImage: 'url("/images/logo_nizamy.png?v=6")',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center'
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleTheme();
    };

    return (
        <>
            <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg fixed top-0 left-0 right-0 z-header border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 pt-[env(safe-area-inset-top)]">
                <div className="container mx-auto px-4 py-2.5 md:py-3 flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity focus:outline-none min-w-0">
                        <div className="md:hidden shrink-0">
                            {isHome ? (
                                <div
                                    className="w-9 h-9 bg-teal-600 dark:bg-teal-400 transition-colors"
                                    style={logoStyle}
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                    <span className="icon-wrapper w-3.5 h-3.5 flex items-center justify-center"><FaArrowLeft /></span>
                                </div>
                            )}
                        </div>

                        <div
                            className="hidden md:block w-10 h-10 bg-teal-600 dark:bg-teal-400 transition-colors"
                            style={logoStyle}
                        />

                        <div className="text-left min-w-0">
                            <p className={`text-base md:text-xl font-extrabold tracking-tight leading-none ${titleColor}`}>NIZAMY</p>
                            {!isHome && (
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mt-0.5 truncate max-w-[140px] md:max-w-none">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </Link>

                    <div className="flex items-center gap-1.5 shrink-0">
                        {/* Voice Trigger */}
                        {isSupported && (
                            <button
                                onClick={startListening}
                                className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/30 border border-teal-200 dark:border-teal-800 transition-all flex items-center justify-center active:scale-95 shadow-sm"
                                aria-label="Voice Assistant"
                            >
                                <span className="icon-wrapper w-4 h-4 flex items-center justify-center"><FaMicrophone /></span>
                            </button>
                        )}

                        {/* Theme Toggle */}
                        <button
                            onClick={handleToggle}
                            className="w-9 h-9 flex rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all items-center justify-center active:scale-95"
                            aria-label={isDark ? "Ubah ke Mode Terang" : "Ubah ke Mode Gelap"}
                        >
                            {isDark ? (
                                <div className="text-yellow-500 icon-wrapper w-4 h-4 flex items-center justify-center"><FaSun /></div>
                            ) : (
                                <div className="text-slate-500 icon-wrapper w-4 h-4 flex items-center justify-center"><FaMoon /></div>
                            )}
                        </button>

                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center active:scale-95"
                            aria-label="Pengaturan Aplikasi"
                        >
                            <span className="icon-wrapper w-4 h-4 flex items-center justify-center"><FaCog /></span>
                        </button>
                    </div>
                </div>
            </header>

            {isSettingsOpen && <GlobalSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}

            <VoiceAssistant
                isListening={isListening}
                status={status}
                transcript={transcript}
                feedback={feedback}
                onStop={stopListening}
                onRestart={startListening}
            />
        </>
    );
};

export const Footer: React.FC = () => {
    const [legalType, setLegalType] = useState<LegalType>(null);

    return (
        <>
            <footer className="hidden md:block text-center py-6 mt-12 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 transition-colors duration-200">
                <div className="container mx-auto px-4">
                    <div className="flex justify-center gap-6 mb-3 text-xs font-medium text-slate-400 dark:text-slate-500">
                        <button
                            onClick={() => setLegalType('terms')}
                            className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-1.5"
                        >
                            <span className="icon-wrapper w-3 h-3"><FaFileContract /></span> Syarat & Ketentuan
                        </button>
                        <button
                            onClick={() => setLegalType('privacy')}
                            className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-1.5"
                        >
                            <span className="icon-wrapper w-3 h-3"><FaShieldAlt /></span> Kebijakan Privasi
                        </button>
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 text-xs">
                        &copy; {new Date().getFullYear()} NIZAMY <span className="hidden sm:inline">· Islam Apps Suite</span>
                    </p>
                </div>
            </footer>

            <LegalModal type={legalType} onClose={() => setLegalType(null)} />
        </>
    );
};