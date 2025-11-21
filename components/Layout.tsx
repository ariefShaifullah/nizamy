import React from "react";
import { useTheme } from "./ThemeContext.tsx";
export type ViewState = "home" | "faraidh" | "zakat" | "hafalan";

interface HeaderProps {
  view: ViewState;
  setView: (v: ViewState) => void;
}

export const Header: React.FC<HeaderProps> = ({ view, setView }) => {
  const { theme, setTheme } = useTheme();

  let titleColor = "text-primary-700 dark:text-primary-400";

  let iconBgClass = "bg-primary-600";

  let iconColor = "text-primary-600 dark:text-primary-400";
  let subtitle = "";

  if (view === "zakat") {
    titleColor = "text-emerald-700 dark:text-emerald-400";
    iconBgClass = "bg-emerald-600";

    iconColor = "text-emerald-600 dark:text-emerald-400";
    subtitle = "Kalkulator Zakat";
  } else if (view === "faraidh") {
    titleColor = "text-primary-700 dark:text-primary-400";
    iconBgClass = "bg-primary-600";
    iconColor = "text-primary-600 dark:text-primary-400";
    subtitle = "Kalkulator Waris Islam";
  } else if (view === "hafalan") {
    titleColor = "text-indigo-700 dark:text-indigo-400";
    iconBgClass = "bg-indigo-600";

    iconColor = "text-indigo-600 dark:text-indigo-400";
    subtitle = "Hafalan Quran Tracker";
  }

  const toggleTheme = () => {
    if (theme === "dark") setTheme("light");
    else setTheme("dark");
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-slate-200/60 dark:border-slate-800 transition-all duration-300">
      <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
        <button
          onClick={() => setView("home")}
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity group"
        >
          <div
            className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors`}
          >
            <div
              className={`w-6 h-6 md:w-8 md:h-8 ${iconBgClass} transition-transform group-hover:scale-110`}
              style={{
                maskImage: "url(/images/logo_nizamy.png)",
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskImage: "url(/images/logo_nizamy.png)",
                WebkitMaskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
              }}
            />
          </div>
          <div className="text-left">
            <p
              className={`text-lg md:text-2xl font-bold tracking-tight leading-none ${titleColor}`}
            >
              NIZAMY
            </p>
            {view !== "home" && (
              <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium mt-0.5 truncate max-w-[150px] md:max-w-none">
                {subtitle}
              </p>
            )}
          </div>
        </button>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 md:p-2.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-500 dark:hover:text-yellow-400 border border-slate-200 dark:border-slate-700 transition-all"
            aria-label="Toggle Theme"
          >
            {/* Sun Icon */}
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
            {/* Moon Icon */}
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

          {view !== "home" && (
            <button
              onClick={() => setView("home")}
              className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-2 md:px-4 md:py-2 rounded-full transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 md:mr-1.5"
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
              <span className="hidden md:inline">Menu Utama</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export const Footer: React.FC = () => (
  <footer className="hidden md:block text-center py-8 mt-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-300">
    <div className="container mx-auto px-4">
      <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center gap-1">
        &copy; {new Date().getFullYear()} NIZAMY{" "}
        <span className="hidden sm:inline">| Islam Apps Suite</span>. Dibuat
        dengan <span className="text-red-500 animate-pulse">♥</span>
      </p>
    </div>
  </footer>
);
