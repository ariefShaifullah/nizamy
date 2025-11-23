import React, { useState } from "react";
import { useTheme } from "./ThemeContext.tsx";
import { GlobalSettings } from "./GlobalSettings.tsx";
import { LegalModal, type LegalType } from "./LegalModal.tsx";

export type ViewState = "home" | "faraidh" | "zakat" | "hafalan";

interface HeaderProps {
  view: ViewState;
  setView: (v: ViewState) => void;
}

export const Header: React.FC<HeaderProps> = ({ view, setView }) => {
  const { theme, setTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isHome = view === "home";

  let titleColor = "text-primary-700 dark:text-primary-400";
  let subtitle = "";

  // Determine logo hue rotation based on theme color assumption (Base logo = Blue/Primary)
  let logoFilter = "none";

  if (view === "zakat") {
    titleColor = "text-emerald-700 dark:text-emerald-400";
    subtitle = "Kalkulator Zakat";
    logoFilter = "hue-rotate(-60deg)"; // Blue -> Emerald
  } else if (view === "faraidh") {
    titleColor = "text-primary-700 dark:text-primary-400";
    subtitle = "Kalkulator Waris Islam";
    logoFilter = "none"; // Blue Base
  } else if (view === "hafalan") {
    titleColor = "text-indigo-700 dark:text-indigo-400";
    subtitle = "Hafalan Quran Tracker";
    logoFilter = "hue-rotate(30deg)"; // Blue -> Indigo
  }

  const toggleTheme = () => {
    if (theme === "dark") setTheme("light");
    else setTheme("dark");
  };

  return (
    <>
      {/* Added pt-[env(safe-area-inset-top)] for iOS Notch compatibility */}
      {/* Glassmorphism Header */}
      <header className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm sticky top-0 z-30 border-b border-white/20 dark:border-slate-700/50 transition-all duration-300 pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          <button
            onClick={() => setView("home")}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity group focus:outline-none"
          >
            {/* Mobile: Contextual Icon (Logo on Home, Back Arrow on Inner Pages) */}
            <div className="md:hidden">
              {isHome ? (
                <img
                  src="/images/logo_nizamy.png"
                  alt="NIZAMY Logo"
                  className="w-10 h-10 object-contain transition-all duration-500 drop-shadow-sm"
                  style={{ filter: logoFilter }}
                />
              ) : (
                <div className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/20 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="w-5 h-5 animate-fade-in"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Desktop: Always Logo */}
            <img
              src="/images/logo_nizamy.png"
              alt="NIZAMY Logo"
              className="hidden md:block w-11 h-11 object-contain transition-all duration-500 drop-shadow-sm"
              style={{ filter: logoFilter }}
            />

            <div className="text-left">
              <p
                className={`text-lg md:text-2xl font-extrabold tracking-tight leading-none ${titleColor} drop-shadow-sm`}
              >
                NIZAMY
              </p>
              {!isHome && (
                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium mt-0.5 truncate max-w-[150px] md:max-w-none animate-fade-in">
                  {subtitle}
                </p>
              )}
            </div>
          </button>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 md:p-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700 hover:text-indigo-500 dark:hover:text-yellow-400 border border-white/20 dark:border-slate-700 transition-all shadow-sm"
              aria-label="Toggle Theme"
            >
              {/* Sun Icon (Visible in Dark Mode) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 hidden dark:block"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              {/* Moon Icon (Visible in Light Mode) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 block dark:hidden"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </button>

            {/* Global Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 md:p-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700 border border-white/20 dark:border-slate-700 transition-all shadow-sm"
              aria-label="Pengaturan Aplikasi"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            {!isHome && (
              <button
                onClick={() => setView("home")}
                className="hidden md:flex items-center text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md hover:bg-white/80 dark:hover:bg-slate-700 px-3 py-2 md:px-4 md:py-2 rounded-full transition-all active:scale-95 border border-white/20 dark:border-slate-700 shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Menu</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Render Global Settings Modal */}
      {isSettingsOpen && (
        <GlobalSettings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
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
              onClick={() => setLegalType("terms")}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Syarat & Ketentuan
            </button>
            <button
              onClick={() => setLegalType("privacy")}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Kebijakan Privasi
            </button>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center gap-1">
            &copy; {new Date().getFullYear()} NIZAMY{" "}
            <span className="hidden sm:inline">| Islam Apps Suite</span>. Dibuat
            dengan <span className="text-red-500 animate-pulse">♥</span>
          </p>
        </div>
      </footer>

      {/* Render Legal Modal */}
      <LegalModal type={legalType} onClose={() => setLegalType(null)} />
    </>
  );
};
