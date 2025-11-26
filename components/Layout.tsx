
import React, { useState } from 'react';
import { useTheme } from './ThemeContext.tsx';
import { GlobalSettings } from './GlobalSettings.tsx';
import { LegalModal, type LegalType } from './LegalModal.tsx';
import { FaBars, FaSun, FaMoon, FaCog, FaArrowLeft, FaShieldAlt, FaFileContract } from 'react-icons/fa';

export type ViewState = 'home' | 'faraidh' | 'zakat' | 'hafalan' | 'mushaf';

interface HeaderProps {
    view: ViewState;
    setView: (v: ViewState) => void;
}

export const Header: React.FC<HeaderProps> = ({ view, setView }) => {
    const { theme, setTheme } = useTheme();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const isHome = view === 'home';

    let titleColor = 'text-indigo-600 dark:text-indigo-400'; // Default Base
    let subtitle = '';

    // Dynamic Theming based on Active Module
    if (view === 'zakat') {
        titleColor = 'text-emerald-600 dark:text-emerald-400';
        subtitle = 'Kalkulator Zakat';
    } else if (view === 'faraidh') {
        titleColor = 'text-blue-600 dark:text-blue-400';
        subtitle = 'Kalkulator Waris Islam';
    } else if (view === 'hafalan') {
        titleColor = 'text-indigo-600 dark:text-indigo-400';
        subtitle = 'Hafalan Quran Tracker';
    } else if (view === 'mushaf') {
        titleColor = 'text-teal-600 dark:text-teal-400';
        subtitle = 'Mushaf & Kamus Tajwid';
    } else {
        // Home / Default
        titleColor = 'text-indigo-600 dark:text-indigo-400';
    }

    // Helper for Logo Masking (Replacing PNG color dynamically)
    const logoBgClass = titleColor.replace(/text-/g, 'bg-');
    
    const logoStyle = {
        maskImage: 'url("/images/logo_nizamy.png")',
        WebkitMaskImage: 'url("/images/logo_nizamy.png")',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center'
    };

    const toggleTheme = () => {
      if (theme === 'dark') setTheme('light');
      else setTheme('dark');
    };

    return (
      <>
      <header className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm sticky top-0 z-30 border-b border-white/20 dark:border-slate-700/50 transition-all duration-300 pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          <button onClick={() => setView('home')} className="flex items-center space-x-3 hover:opacity-80 transition-opacity group focus:outline-none">
             
             {/* Mobile: Contextual Icon (Logo on Home, Back Arrow on Inner Pages) */}
             <div className="md:hidden">
                {isHome ? (
                    <div 
                        className={`w-10 h-10 transition-all duration-500 drop-shadow-sm ${logoBgClass}`}
                        style={logoStyle}
                    />
                ) : (
                    <div className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/20 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm icon-wrapper w-9 h-9 flex items-center justify-center">
                        <FaArrowLeft />
                    </div>
                )}
             </div>

             {/* Desktop: Always Logo */}
             <div 
                className={`hidden md:block w-11 h-11 transition-all duration-500 drop-shadow-sm ${logoBgClass}`}
                style={logoStyle}
             />

            <div className="text-left">
                <p className={`text-lg md:text-2xl font-extrabold tracking-tight leading-none ${titleColor} drop-shadow-sm`}>NIZAMY</p>
                {!isHome && (
                    <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium mt-0.5 truncate max-w-[150px] md:max-w-none animate-fade-in">
                        {subtitle}
                    </p>
                )}
            </div>
          </button>
          
          {/* Right Side Actions */}
          <div className="flex items-center gap-2 md:gap-3">
              {/* Theme Toggle */}
              <button 
                  onClick={toggleTheme}
                  className="p-2 md:p-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700 hover:text-indigo-500 dark:hover:text-yellow-400 border border-white/20 dark:border-slate-700 transition-all shadow-sm icon-wrapper w-10 h-10 flex items-center justify-center"
                  aria-label="Toggle Theme"
              >
                  {theme === 'dark' ? <FaSun /> : <FaMoon />}
              </button>

              {/* Global Settings Button */}
              <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 md:p-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700 border border-white/20 dark:border-slate-700 transition-all shadow-sm icon-wrapper w-10 h-10 flex items-center justify-center"
                  aria-label="Pengaturan Aplikasi"
              >
                  <FaCog />
              </button>

              {!isHome && (
                 <button 
                    onClick={() => setView('home')} 
                    className="hidden md:flex items-center text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md hover:bg-white/80 dark:hover:bg-slate-700 px-3 py-2 md:px-4 md:py-2 rounded-full transition-all active:scale-95 border border-white/20 dark:border-slate-700 shadow-sm"
                 >
                    <span className="icon-wrapper w-4 h-4 mr-1.5"><FaBars /></span>
                    <span>Menu</span>
                 </button>
              )}
          </div>
        </div>
      </header>
      
      {isSettingsOpen && <GlobalSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
      </>
    );
};

export const Footer: React.FC = () => {
  const [legalType, setLegalType] = useState<LegalType>(null);

  return (
    <>
      <footer className="hidden md:block text-center py-8 mt-12 border-t border-white/20 dark:border-slate-700 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md transition-colors duration-300">
        <div className="container mx-auto px-4">
            <div className="flex justify-center gap-6 mb-4 text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400">
                <button 
                    onClick={() => setLegalType('terms')}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"
                >
                    <span className="icon-wrapper w-4 h-4"><FaFileContract /></span> Syarat & Ketentuan
                </button>
                <button 
                    onClick={() => setLegalType('privacy')}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"
                >
                    <span className="icon-wrapper w-4 h-4"><FaShieldAlt /></span> Kebijakan Privasi
                </button>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center gap-1">
            &copy; {new Date().getFullYear()} NIZAMY <span className="hidden sm:inline">| Islam Apps Suite</span>. Dibuat dengan <span className="text-red-500 animate-pulse">♥</span>
            </p>
        </div>
      </footer>
      
      <LegalModal type={legalType} onClose={() => setLegalType(null)} />
    </>
  );
};
