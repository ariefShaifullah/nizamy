import React, { useEffect, useRef } from "react";

export type ViewState = "home" | "faraidh" | "zakat" | "hafalan";

interface HeaderProps {
  view: ViewState;
  setView: (v: ViewState) => void;
}

export const Header: React.FC<HeaderProps> = ({ view, setView }) => {
  let titleColor = "text-primary-700";
  let iconBgClass = "bg-primary-600";
  let iconColor = "text-primary-600";
  let subtitle = "";

  if (view === "zakat") {
    titleColor = "text-emerald-700";
    iconBgClass = "bg-emerald-600";
    iconColor = "text-emerald-600";
    subtitle = "Kalkulator Zakat";
  } else if (view === "faraidh") {
    titleColor = "text-primary-700";
    iconBgClass = "bg-primary-600";
    iconColor = "text-primary-600";
    subtitle = "Kalkulator Waris Islam";
  } else if (view === "hafalan") {
    titleColor = "text-indigo-700";
    iconBgClass = "bg-indigo-600";
    iconColor = "text-indigo-600";
    subtitle = "Hafalan Quran Tracker";
  }

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-slate-200/60 transition-all duration-300">
      <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
        <button
          onClick={() => setView("home")}
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity group"
        >
          <div
            className={`p-2 rounded-xl bg-slate-50 group-hover:bg-slate-100 transition-colors`}
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
              <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider font-medium mt-0.5 truncate max-w-[150px] md:max-w-none">
                {subtitle}
              </p>
            )}
          </div>
        </button>

        <div className="flex items-center gap-2 md:gap-3">
          {view !== "home" && (
            <button
              onClick={() => setView("home")}
              className="text-xs md:text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center bg-slate-50 hover:bg-slate-100 px-3 py-2 md:px-4 md:py-2 rounded-full transition-all active:scale-95 border border-slate-200"
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
  <footer className="hidden md:block text-center py-8 mt-12 border-t border-slate-200 bg-white">
    <div className="container mx-auto px-4">
      <p className="text-slate-500 text-sm flex items-center justify-center gap-1">
        &copy; {new Date().getFullYear()} NIZAMY{" "}
        <span className="hidden sm:inline">| Islam Apps Suite</span>. Dibuat
        dengan <span className="text-red-500 animate-pulse">♥</span>
      </p>
    </div>
  </footer>
);
