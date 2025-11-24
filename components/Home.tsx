
import React, { useState } from 'react';
import { usePWA } from '../hooks/usePWA.ts';
import { IOSInstallModal } from './IOSInstallModal.tsx';
import { PrayerWidget } from './PrayerWidget.tsx';
import {
  FaBalanceScale,
  FaHandsHelping,
  FaQuran,
} from "react-icons/fa";
import { IconContext } from "react-icons";

interface HomeProps {
  setView: (view: 'faraidh' | 'zakat' | 'hafalan') => void;
}

interface FeatureItem {
  id: string;
  title: string;
  shortDesc: string;
  desc: string;
  icon: React.ReactNode;
  style: {
    wrapperGradient: string;
    borderColor: string;
    iconBg: string;
    iconText: string;
    titleText: string;
    shadowColor: string;
  };
}

const FeatureCard: React.FC<{ feature: FeatureItem; onClick: () => void; isMobile: boolean }> = ({ feature, onClick, isMobile }) => {
  const { style } = feature;

  const commonClasses = `
        relative overflow-hidden
        flex flex-col h-full text-left
        backdrop-blur-xl border transition-all duration-500 ease-out
        ${style.wrapperGradient} ${style.borderColor}
        group
    `;

  // Mobile: Horizontal Snap Card
  if (isMobile) {
    return (
      <button
        onClick={onClick}
        className={`
                ${commonClasses}
                snap-start shrink-0 w-[70vw] h-40 justify-between p-5 rounded-[2rem]
                active:scale-[0.98] shadow-sm
              `}
      >
        {/* Decor: Big Faded Icon */}
        <div
          className={`absolute -right-6 -bottom-6 ${style.iconText} opacity-[0.07] transform rotate-12 scale-150 pointer-events-none`}
        >
          <IconContext.Provider value={{ className: "w-32 h-32" }}>
            {feature.icon}
          </IconContext.Provider>
        </div>

        <div className="flex justify-between items-start z-10 w-full">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${style.iconBg} ${style.iconText} shadow-inner ring-1 ring-white/20`}
          >
            <IconContext.Provider value={{ className: "w-6 h-6" }}>
              {feature.icon}
            </IconContext.Provider>
          </div>
        </div>

        <div className="z-10">
          <h2
            className={`text-xl font-extrabold ${style.titleText} leading-tight`}
          >
            {feature.title}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium line-clamp-1 opacity-90">
            {feature.shortDesc}
          </p>
        </div>
      </button>
    );
  }

  // Desktop: Vertical Grid Card
  return (
    <button
      onClick={onClick}
      className={`
            ${commonClasses}
            p-8 rounded-[2.5rem]
            hover:-translate-y-2 hover:shadow-2xl ${style.shadowColor}
          `}
    >
      {/* Decor: Inner Shine/Glow Top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50"></div>

      {/* Decor: Big Faded Icon */}
      <div
        className={`absolute -right-10 -top-10 ${style.iconText} opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-500 transform rotate-12 group-hover:rotate-[20deg] group-hover:scale-110`}
      >
        <IconContext.Provider value={{ className: "w-64 h-64" }}>
          {feature.icon}
        </IconContext.Provider>
      </div>

      <div
        className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 ${style.iconBg} ${style.iconText} shadow-lg ring-1 ring-white/20 z-10 relative transition-transform group-hover:scale-110 duration-300`}
      >
        <IconContext.Provider value={{ className: "w-8 h-8" }}>
          {feature.icon}
        </IconContext.Provider>
      </div>

      <div className="z-10 relative flex flex-col flex-1 w-full">
        <h2 className={`text-2xl font-extrabold ${style.titleText} mb-3`}>
          {feature.title}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-8 flex-1 opacity-90">
          {feature.desc}
        </p>

        <div
          className={`flex items-center text-sm font-bold ${style.titleText} opacity-70 group-hover:opacity-100 transition-opacity mt-auto`}
        >
          Buka Aplikasi{" "}
          <span className="ml-2 transition-transform group-hover:translate-x-1">
            &rarr;
          </span>
        </div>
      </div>
    </button>
  );
};

export const Home: React.FC<HomeProps> = ({ setView }) => {
  const { isInstallable, isIOS, isStandalone, installApp } = usePWA();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  
  const features: FeatureItem[] = [
    {
      id: "hafalan",
      title: "Hafalan Quran",
      shortDesc: "Metode SRS & Gamifikasi",
      desc: "Jaga hafalan Al-Quran dengan metode Spaced Repetition System (SRS) yang cerdas, lengkap dengan target harian dan gamifikasi.",
      icon: <FaQuran />,
      style: {
        wrapperGradient:
          "bg-gradient-to-br from-indigo-50/80 via-indigo-50/40 to-purple-50/80 dark:from-indigo-900/40 dark:via-slate-900/60 dark:to-purple-900/40",
        borderColor: "border-indigo-200/50 dark:border-indigo-700/50",
        iconBg: "bg-indigo-100 dark:bg-indigo-500/20",
        iconText: "text-indigo-600 dark:text-indigo-300",
        titleText: "text-slate-800 dark:text-white",
        shadowColor:
          "hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/30",
      },
    },
    {
      id: "zakat",
      title: "Kalkulator Zakat",
      shortDesc: "Maal, Fitrah & Niaga",
      desc: "Hitung Zakat Maal, Fitrah, Niaga, dan Emas dengan akurat. Dilengkapi fitur update harga emas otomatis dan penyesuaian nisab.",
      icon: <FaHandsHelping />,
      style: {
        wrapperGradient:
          "bg-gradient-to-br from-emerald-50/80 via-emerald-50/40 to-teal-50/80 dark:from-emerald-900/40 dark:via-slate-900/60 dark:to-teal-900/40",
        borderColor: "border-emerald-200/50 dark:border-emerald-700/50",
        iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
        iconText: "text-emerald-600 dark:text-emerald-300",
        titleText: "text-slate-800 dark:text-white",
        shadowColor:
          "hover:shadow-emerald-200/50 dark:hover:shadow-emerald-900/30",
      },
    },
    {
      id: "faraidh",
      title: "Hitung Waris",
      shortDesc: "Pembagian Syariat Islam",
      desc: "Kalkulator pembagian harta warisan (Faraidh) otomatis yang menangani kasus Hajb, Aul, dan Radd sesuai dalil Al-Quran dan Sunnah.",
      icon: <FaBalanceScale />,
      style: {
        wrapperGradient:
          "bg-gradient-to-br from-blue-50/80 via-blue-50/40 to-cyan-50/80 dark:from-blue-900/40 dark:via-slate-900/60 dark:to-cyan-900/40",
        borderColor: "border-blue-200/50 dark:border-blue-700/50",
        iconBg: "bg-blue-100 dark:bg-blue-500/20",
        iconText: "text-blue-600 dark:text-blue-300",
        titleText: "text-slate-800 dark:text-white",
        shadowColor: "hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30",
      },
    },
  ];

  const showInstallBtn = isInstallable || (isIOS && !isStandalone);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 animate-fade-in min-h-[80vh] flex flex-col">
      {showIOSGuide && (
        <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
      )}

      {/* 1. GREETING HEADER */}
      <div className="text-center mb-8 mt-2">
        <div className="inline-block mb-4 animate-fade-in-down">
          <span className="px-6 py-2.5 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/50 dark:border-white/10 text-slate-700 dark:text-slate-300 font-arabic text-xl md:text-2xl shadow-sm">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </span>
        </div>
      </div>

      {/* 2. PRAYER WIDGET */}
      <div className="mb-10">
        <PrayerWidget />
      </div>

      {/* 3. APP FEATURES GRID */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6 px-1">
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
            Aplikasi Ibadah
          </h3>
        </div>

        {/* --- MOBILE: HORIZONTAL SCROLL (PEEK CARD STYLE) --- */}
        <div className="md:hidden -mx-4 px-4 pb-8 overflow-x-auto hide-scrollbar flex gap-4 snap-x snap-mandatory scroll-pl-4">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onClick={() => setView(feature.id as any)}
              isMobile={true}
            />
          ))}
          {/* Spacer to allow scrolling to the very end easily */}
          <div className="w-2 shrink-0"></div>
        </div>

        {/* --- DESKTOP: GRID --- */}
        <div className="hidden md:grid grid-cols-3 gap-8">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onClick={() => setView(feature.id as any)}
              isMobile={false}
            />
          ))}
        </div>
      </div>

      {/* 4. FOOTER CONTENT */}
      <div className="mt-auto text-center pt-10 border-t border-slate-200/60 dark:border-slate-800/60">
        {showInstallBtn && (
          <button
            onClick={() => (isIOS ? setShowIOSGuide(true) : installApp())}
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold shadow-xl hover:scale-105 transition-transform active:scale-95 mb-8 ring-4 ring-slate-200 dark:ring-slate-700"
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

        <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500 text-xs">
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Data Privasi Terjaga (Local Storage)</span>
          </div>
          <p>v1.7.0 • NIZAMY Suite</p>
        </div>
      </div>
    </div>
  );
};
