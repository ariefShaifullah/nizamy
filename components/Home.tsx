import React from "react";
import {
  FaBalanceScale,
  FaHandsHelping,
  FaQuran,
  FaLock,
} from "react-icons/fa";
import { IconContext } from "react-icons";

interface HomeProps {
  setView: (view: "faraidh" | "zakat" | "hafalan") => void;
}

export const Home: React.FC<HomeProps> = ({ setView }) => {
  const features = [
    {
      id: "hafalan",
      title: "Hafalan Quran",
      shortDesc: "Metode SRS & Gamifikasi",
      desc: "Jaga hafalan Al-Quran dengan metode Spaced Repetition System dan Gamification.",
      icon: FaQuran, // store the icon component, not JSX
      colors: {
        bg: "bg-indigo-50",
        text: "text-indigo-600",
        hoverText: "group-hover:text-indigo-600",
        border: "hover:border-indigo-200",
        shadow: "shadow-indigo-100/50",
        hoverShadow: "hover:shadow-indigo-200/50",
        gradient: "from-indigo-50 to-indigo-100",
        cta: "bg-indigo-50",
      },
    },
    {
      id: "zakat",
      title: "Kalkulator Zakat",
      shortDesc: "Maal, Fitrah & Niaga",
      desc: "Hitung Zakat Maal, Fitrah, dan Niaga dengan acuan Nisab & Haul terkini.",
      icon: FaHandsHelping,
      colors: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        hoverText: "group-hover:text-emerald-600",
        border: "hover:border-emerald-200",
        shadow: "shadow-emerald-100/50",
        hoverShadow: "hover:shadow-emerald-200/50",
        gradient: "from-emerald-50 to-emerald-100",
        cta: "bg-emerald-50",
      },
    },
    {
      id: "faraidh",
      title: "Waris (Faraidh)",
      shortDesc: "Sesuai Syariat Islam",
      desc: "Kalkulator pembagian harta warisan otomatis sesuai syariat Islam dan dalil Al-Quran.",
      icon: FaBalanceScale,
      colors: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        hoverText: "group-hover:text-blue-600",
        border: "hover:border-blue-200",
        shadow: "shadow-blue-100/50",
        hoverShadow: "hover:shadow-blue-200/50",
        gradient: "from-blue-50 to-blue-100",
        cta: "bg-blue-50",
      },
    },
  ];

  // Wrap entire UI in an IconContext.Provider to supply default className/size
  return (
    <IconContext.Provider value={{ className: "h-7 w-7" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-4 py-2 md:py-8 animate-fade-in">
        {/* HEADER */}
        <div className="text-center mb-6 md:mb-12 pt-2 md:pt-4">
          <span className="inline-block py-1 px-4 md:py-2 md:px-8 text-primary-700 font-arabic text-xl md:text-3xl mb-3 md:mb-6 ">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </span>
          <h1 className="text-2xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-2 md:mb-6">
            NIZAMY{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-500">
              Apps
            </span>
          </h1>
          <p className="hidden md:block text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed px-2">
            Solusi digital terintegrasi untuk kebutuhan ibadah harian Anda.
            Hitung Waris, bayar Zakat, dan jaga Hafalan Al-Quran dalam satu
            platform.
          </p>
          <p className="md:hidden text-sm text-slate-500 px-6">
            Waris, Zakat & Hafalan Quran
          </p>
        </div>
        {/* MOBILE */}
        <div className="md:hidden mb-8 -mx-4">
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory hide-scrollbar px-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.id}
                  onClick={() => setView(feature.id as any)}
                  className="snap-center shrink-0 w-[75vw] h-32 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 active:scale-[0.97] transition-transform text-left"
                >
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center ${feature.colors.bg} ${feature.colors.text}`}
                  >
                    <Icon />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-slate-900 leading-tight mb-1">
                      {feature.title}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                      {feature.shortDesc}
                    </p>
                  </div>
                </button>
              );
            })}
            <div className="w-4 shrink-0" />
          </div>
        </div>
        {
          /* DESKTOP */
        }
        <div className="hidden md:grid grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => setView(feature.id as any)}
                className={`group relative bg-white p-8 rounded-3xl shadow-lg ${feature.colors.shadow} border border-slate-100 hover:shadow-xl ${feature.colors.hoverShadow} hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 text-left overflow-hidden flex flex-col h-full`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                  {/* override size for the big background icon */}
                  <IconContext.Provider value={{ className: "w-40 h-40" }}>
                    <Icon />
                  </IconContext.Provider>
                </div>

                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.colors.gradient} rounded-2xl flex items-center justify-center mb-6 ${feature.colors.text} group-hover:scale-110 transition-transform shadow-inner`}
                >
                  <Icon />
                </div>

                <h2
                  className={`text-2xl font-bold text-slate-900 mb-2 ${feature.colors.hoverText} transition-colors`}
                >
                  {feature.title}
                </h2>

                <p className="text-slate-500 mb-6 text-sm leading-relaxed flex-1">
                  {feature.desc}
                </p>

                <div
                  className={`mt-auto flex items-center ${feature.colors.text} font-bold text-sm group-hover:translate-x-2 transition-transform ${feature.colors.cta} w-fit px-4 py-2 rounded-full`}
                >
                  Mulai Sekarang →
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-4 md:mt-16 text-center md:border-t border-slate-200 pt-2 md:pt-8 pb-8 md:pb-0">
          <div className="inline-flex items-center space-x-2 bg-slate-50 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-slate-200 text-[10px] md:text-xs text-slate-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 md:h-4 md:w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Data Privasi Terjaga: Tersimpan di Browser (Local Storage).
            </span>
          </div>
        </div>
      </div>
    </IconContext.Provider>
  );
};
