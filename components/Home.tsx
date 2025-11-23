import React, { useState } from "react";
import { usePWA } from "../hooks/usePWA.ts";
import { IOSInstallModal } from "./IOSInstallModal.tsx";
import { PrayerWidget } from "./PrayerWidget.tsx";
import { FaBalanceScale, FaHandsHelping, FaQuran } from "react-icons/fa";
import { IconContext } from "react-icons";

interface HomeProps {
  setView: (view: "faraidh" | "zakat" | "hafalan") => void;
}

export const Home: React.FC<HomeProps> = ({ setView }) => {
  const { isInstallable, isIOS, isStandalone, installApp } = usePWA();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const features = [
    {
      id: "hafalan",
      title: "Hafalan Quran",
      shortDesc: "Metode SRS & Gamifikasi", // Mobile only
      desc: "Jaga hafalan Al-Quran dengan metode Spaced Repetition System dan Gamification.", // Desktop only
      icon: <FaQuran />,
      colors: {
        bg: "bg-indigo-100/80 dark:bg-indigo-900/50",
        text: "text-indigo-600 dark:text-indigo-400",
        hoverText:
          "group-hover:text-indigo-600 dark:group-hover:text-indigo-300",
        // Glass styles:
        border: "border-white/50 dark:border-slate-700/50",
        shadow: "shadow-xl shadow-indigo-100/20 dark:shadow-none",
        hoverShadow:
          "hover:shadow-2xl hover:shadow-indigo-200/40 dark:hover:shadow-indigo-900/20",
      },
    },
    {
      id: "zakat",
      title: "Kalkulator Zakat",
      shortDesc: "Maal, Fitrah & Niaga",
      desc: "Hitung Zakat Maal, Fitrah, Niaga, dan Emas dengan acuan Nisab & Haul terkini.",
      icon: <FaHandsHelping />,
      colors: {
        bg: "bg-emerald-100/80 dark:bg-emerald-900/50",
        text: "text-emerald-600 dark:text-emerald-400",
        hoverText:
          "group-hover:text-emerald-600 dark:group-hover:text-emerald-300",
        // Glass styles:
        border: "border-white/50 dark:border-slate-700/50",
        shadow: "shadow-xl shadow-emerald-100/20 dark:shadow-none",
        hoverShadow:
          "hover:shadow-2xl hover:shadow-emerald-200/40 dark:hover:shadow-emerald-900/20",
      },
    },
    {
      id: "faraidh",
      title: "Hitung Waris",
      shortDesc: "Pembagian Syariat Islam",
      desc: "Kalkulator pembagian harta warisan otomatis sesuai syariat Islam dan dalil Al-Quran.",
      icon: <FaBalanceScale />,
      colors: {
        bg: "bg-blue-100/80 dark:bg-blue-900/50",
        text: "text-blue-600 dark:text-blue-400",
        hoverText: "group-hover:text-blue-600 dark:group-hover:text-blue-300",
        // Glass styles:
        border: "border-white/50 dark:border-slate-700/50",
        shadow: "shadow-xl shadow-blue-100/20 dark:shadow-none",
        hoverShadow:
          "hover:shadow-2xl hover:shadow-blue-200/40 dark:hover:shadow-blue-900/20",
      },
    },
  ];

  // Logic to show install button
  const showInstallBtn = isInstallable || (isIOS && !isStandalone);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 animate-fade-in min-h-[80vh] flex flex-col">
      {showIOSGuide && (
        <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
      )}

      {/* 1. GREETING HEADER (Simplified) */}
      <div className="text-center mb-6">
        <div className="inline-block mb-3">
          <span className="px-5 py-2 rounded-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 font-arabic text-xl shadow-sm">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </span>
        </div>
      </div>

      {/* 2. PRAYER WIDGET (HERO SECTION) */}
      <PrayerWidget />

      {/* 3. APP FEATURES GRID */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white drop-shadow-sm">
            Aplikasi Ibadah
          </h3>
        </div>

        {/* --- MOBILE: HORIZONTAL SCROLL (PEEK CARD STYLE) --- */}
        <div className="md:hidden -mx-4 px-4 pb-8 overflow-x-auto hide-scrollbar flex gap-4 snap-x snap-mandatory scroll-pl-4">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setView(feature.id as any)}
              className={`snap-start shrink-0 w-[75vw] 
                bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl 
                p-5 rounded-3xl border ${feature.colors.border}
                flex flex-col justify-between active:scale-[0.98] transition-all duration-300 text-left h-36 relative overflow-hidden group
                ${feature.colors.shadow}
              `}
            >
              {/* Background Icon Watermark (Mobile) */}
              <div
                className={`absolute -right-4 -top-4 ${feature.colors.text} opacity-[0.08] pointer-events-none transform rotate-12`}
              >
                <IconContext.Provider value={{ className: "w-32 h-32" }}>
                  {feature.icon}
                </IconContext.Provider>
              </div>

              <div className="flex justify-between items-start z-10">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${feature.colors.bg} ${feature.colors.text} backdrop-blur-sm`}
                >
                  <IconContext.Provider value={{ className: "w-6 h-6" }}>
                    {feature.icon}
                  </IconContext.Provider>
                </div>
              </div>

              <div className="z-10">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  {feature.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {feature.shortDesc}
                </p>
              </div>
            </button>
          ))}
          {/* Spacer for last item to be easily clickable without edge hug */}
          <div className="w-4 shrink-0"></div>
        </div>

        {/* --- DESKTOP: GRID --- */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setView(feature.id as any)}
              className={`group relative 
                bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl 
                p-6 rounded-[2rem] border ${feature.colors.border}
                text-left hover:-translate-y-2 transition-all duration-300 ease-out flex flex-col h-full overflow-hidden
                ${feature.colors.shadow} ${feature.colors.hoverShadow}
              `}
            >
              {/* Background Icon Watermark (Desktop) */}
              <div
                className={`absolute -right-8 -top-8 ${feature.colors.text} opacity-[0.05] group-hover:opacity-[0.1] pointer-events-none transform rotate-12 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 ease-out`}
              >
                <IconContext.Provider value={{ className: "w-48 h-48" }}>
                  {feature.icon}
                </IconContext.Provider>
              </div>

              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${feature.colors.bg} ${feature.colors.text} shadow-sm z-10 relative backdrop-blur-sm`}
              >
                <IconContext.Provider value={{ className: "w-7 h-7" }}>
                  {feature.icon}
                </IconContext.Provider>
              </div>

              <div className="z-10 relative">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 flex-1">
                  {feature.desc}
                </p>

                <div className="flex items-center text-sm font-bold text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                  Buka Fitur{" "}
                  <span className="ml-2 transition-transform group-hover:translate-x-1">
                    &rarr;
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. FOOTER CONTENT (INSTALL & INFO) */}
      <div className="mt-auto text-center pt-8 border-t border-slate-200/50 dark:border-slate-800/50">
        {showInstallBtn && (
          <button
            onClick={() => (isIOS ? setShowIOSGuide(true) : installApp())}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900/90 dark:bg-white/90 backdrop-blur text-white dark:text-slate-900 rounded-full font-bold shadow-xl hover:scale-105 transition-transform active:scale-95 mb-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Install Aplikasi
          </button>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Data Privasi Terjaga. Tersimpan di Browser (Local Storage).
        </p>
      </div>
    </div>
  );
};
