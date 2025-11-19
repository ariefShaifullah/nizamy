import React from "react";
import {
  FaBalanceScale,
  FaHandsHelping,
  FaArrowRight,
  FaLock,
} from "react-icons/fa";
import { IconContext } from "react-icons";

interface HomeProps {
  setView: (view: "faraidh" | "zakat") => void;
}

export const Home: React.FC<HomeProps> = ({ setView }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          NIZAMY:{" "}
          <span className="text-primary-600">Kalkulator Waris & Zakat</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Platform perhitungan Islami terpercaya untuk menunaikan kewajiban
          Faraidh (Waris) dan Zakat sesuai tuntunan Al-Qur'an dan Sunnah.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* FARAIDH CARD */}
        <button
          onClick={() => setView("faraidh")}
          className="group relative bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden"
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
            <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
              Kalkulator Waris (Faraidh)
            </h2>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Hitung pembagian harta warisan secara mendetail, akurat, dan
              transparan berdasarkan dalil syariat.
            </p>
            <span className="inline-flex items-center font-semibold text-blue-600">
              Mulai Hitung Waris{" "}
              <IconContext.Provider value={{ className: "ml-2" }}>
                <FaArrowRight />
              </IconContext.Provider>
            </span>
          </div>
        </button>

        {/* ZAKAT CARD */}
        <button
          onClick={() => setView("zakat")}
          className="group relative bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <IconContext.Provider
              value={{ className: "w-32 h-32 text-emerald-600" }}
            >
              <FaHandsHelping />
            </IconContext.Provider>
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
              <IconContext.Provider value={{ className: "h-8 w-8" }}>
                <FaHandsHelping />
              </IconContext.Provider>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
              Kalkulator Zakat Lengkap
            </h2>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Hitung kewajiban Zakat Fitrah, Maal, Emas/Perak, Perniagaan,
              hingga Pertanian dengan mudah dan sesuai nisab.
            </p>
            <span className="inline-flex items-center font-semibold text-emerald-600">
              Mulai Hitung Zakat{" "}
              <IconContext.Provider value={{ className: "ml-2" }}>
                <FaArrowRight />
              </IconContext.Provider>
            </span>
          </div>
        </button>
      </div>

      <div className="mt-16 text-center">
        <div className="inline-flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200 text-sm text-yellow-800">
          <IconContext.Provider value={{ className: "h-5 w-5" }}>
            <FaLock />
          </IconContext.Provider>
          <span>
            Privasi Terjaga: Data Anda hanya diproses di browser ini dan tidak
            dikirim ke server.
          </span>
        </div>
      </div>
    </div>
  );
};
