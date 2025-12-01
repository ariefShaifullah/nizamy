import React, { useState } from 'react';
// @ts-ignore
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext.tsx';
import { GlobalSettings } from '../../features/settings/components/GlobalSettings.tsx';
import { LegalModal, type LegalType } from '../../features/settings/components/LegalModal.tsx';
import { FaBars, FaSun, FaMoon, FaCog, FaArrowLeft, FaShieldAlt, FaFileContract } from 'react-icons/fa';

export const Header: React.FC = () => {
    // Consume simpler API from Context
    const { toggleTheme, isDark } = useTheme(); 
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';

    let titleColor = 'text-indigo-600 dark:text-indigo-400';
    let subtitle = '';

    if (location.pathname.includes('/zakat')) {
        titleColor = 'text-emerald-600 dark:text-emerald-400';
        subtitle = 'Kalkulator Zakat';
    } else if (location.pathname.includes('/faraidh')) {
        titleColor = 'text-blue-600 dark:text-blue-400';
        subtitle = 'Kalkulator Waris Islam';
    } else if (location.pathname.includes('/hafalan')) {
        titleColor = 'text-indigo-600 dark:text-indigo-400';
        subtitle = 'Hafalan Quran Tracker';
    } else if (location.pathname.includes('/mushaf')) {
        titleColor = 'text-teal-600 dark:text-teal-400';
        subtitle = 'Mushaf & Kamus Tajwid';
    } else if (location.pathname.includes('/hede')) {
        titleColor = 'text-purple-600 dark:text-purple-400';
        subtitle = 'Klinik Finansial';
    }

    const logoBgClass = titleColor.replace(/text-/g, 'bg-');
    
    const logoStyle = {
        maskImage: 'url("/images/logo_nizamy.png?v=2")',
        WebkitMaskImage: 'url("/images/logo_nizamy.png?v=2")',
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
      <header className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-white/20 dark:border-slate-700/50 transition-all duration-300 pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity group focus:outline-none">
             
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
          </Link>
          
          <div className="flex items-center gap-2 md:gap-3">
              <button 
                  onClick={handleToggle}
                  className="p-2 md:p-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700 hover:text-indigo-500 dark:hover:text-yellow-400 border border-white/20 dark:border-slate-700 transition-all shadow-sm icon-wrapper w-10 h-10 flex items-center justify-center active:scale-95 group"
                  aria-label={isDark ? "Ubah ke Mode Terang" : "Ubah ke Mode Gelap"}
                  title={isDark ? "Mode Terang" : "Mode Gelap"}
              >
                  {isDark ? (
                      <div className="text-yellow-400 animate-fade-in"><FaSun  /></div>
                  ) : (
                      <div className="text-indigo-600 animate-fade-in"><FaMoon  /></div>
                  )}
              </button>

              <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 md:p-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700 border border-white/20 dark:border-slate-700 transition-all shadow-sm icon-wrapper w-10 h-10 flex items-center justify-center active:scale-95"
                  aria-label="Pengaturan Aplikasi"
              >
                  <FaCog />
              </button>

              {!isHome && (
                 <button 
                    onClick={() => navigate('/')} 
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