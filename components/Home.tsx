import React from "react";

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
            <svg
              className="w-32 h-32 text-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                />
              </svg>
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
              <svg
                className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </span>
          </div>
        </button>

        {/* ZAKAT CARD */}
        <button
          onClick={() => setView("zakat")}
          className="group relative bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg
              className="w-32 h-32 text-emerald-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
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
              <svg
                className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </span>
          </div>
        </button>
      </div>

      <div className="mt-16 text-center">
        <div className="inline-flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200 text-sm text-yellow-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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
            Privasi Terjaga: Data Anda hanya diproses di browser ini dan tidak
            dikirim ke server.
          </span>
        </div>
      </div>
    </div>
  );
};
