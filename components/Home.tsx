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
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-12">
        <span className="inline-block py-2 px-6 rounded-full bg-primary-50 text-primary-700 font-arabic text-2xl mb-4 ">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          NIZAMY <span className="text-primary-600">Apps Suite </span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Solusi digital terintegrasi untuk kebutuhan ibadah harian Anda. Hitung
          Waris, bayar Zakat, dan jaga Hafalan Al-Quran dalam satu platform.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* HAFALAN CARD */}
        <button
          onClick={() => setView("hafalan")}
          className="group relative bg-white p-8 rounded-3xl shadow-lg shadow-indigo-100/50 border border-slate-100 hover:shadow-xl hover:shadow-indigo-200/50 hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden flex flex-col h-full"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <IconContext.Provider
              value={{ className: "w-32 h-32 text-indigo-600" }}
            >
              <FaQuran />
            </IconContext.Provider>
          </div>
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform">
            <IconContext.Provider value={{ className: "h-8 w-8" }}>
              <FaQuran />
            </IconContext.Provider>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
            Hafalan (SRS)
          </h2>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed flex-1">
            Jaga hafalan Al-Quran dengan metode Spaced Repetition System.
          </p>
          <div className="mt-auto flex items-center text-indigo-600 font-bold text-sm group-hover:translate-x-2 transition-transform">
            Mulai Menghafal &rarr;
          </div>
        </button>

        {/* ZAKAT CARD */}
        <button
          onClick={() => setView("zakat")}
          className="group relative bg-white p-8 rounded-3xl shadow-lg shadow-emerald-100/50 border border-slate-100 hover:shadow-xl hover:shadow-emerald-200/50 hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden flex flex-col h-full"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <IconContext.Provider
              value={{ className: "w-32 h-32 text-emerald-600" }}
            >
              <FaHandsHelping />
            </IconContext.Provider>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
            <IconContext.Provider value={{ className: "h-8 w-8" }}>
              <FaHandsHelping />
            </IconContext.Provider>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
            Kalkulator Zakat
          </h2>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed flex-1">
            Hitung Zakat Maal, Fitrah, Profesi, dan Emas dengan acuan Nisab &
            Haul terkini.
          </p>
          <div className="mt-auto flex items-center text-emerald-600 font-bold text-sm group-hover:translate-x-2 transition-transform">
            Mulai Hitung &rarr;
          </div>
        </button>

        {/* FARAIDH CARD */}
        <button
          onClick={() => setView("faraidh")}
          className="group relative bg-white p-8 rounded-3xl shadow-lg shadow-blue-100/50 border border-slate-100 hover:shadow-xl hover:shadow-blue-200/50 hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden flex flex-col h-full"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <IconContext.Provider
              value={{ className: "w-32 h-32 text-blue-600" }}
            >
              <FaBalanceScale />
            </IconContext.Provider>
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
              <IconContext.Provider value={{ className: "h-8 w-8" }}>
                <FaBalanceScale />
              </IconContext.Provider>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
            Waris (Faraidh)
          </h2>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed flex-1">
            Kalkulator pembagian harta warisan otomatis sesuai syariat Islam dan
            dalil Al-Quran.
          </p>
          <div className="mt-auto flex items-center text-blue-600 font-bold text-sm group-hover:translate-x-2 transition-transform">
            Mulai Hitung &rarr;
          </div>
        </button>
      </div>

      <div className="mt-16 text-center border-t border-slate-200 pt-8">
        <div className="inline-flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-200 text-xs text-slate-500">
          <IconContext.Provider value={{ className: "h-3 w-3" }}>
            <FaLock />
          </IconContext.Provider>
          <span>
            Data Privasi Terjaga: Semua data hanya tersimpan di browser Anda
            (Local Storage).
          </span>
        </div>
      </div>
    </div>
  );
};
