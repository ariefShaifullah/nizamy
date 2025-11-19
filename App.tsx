
import React, { useState, useEffect } from 'react';
import { FaraidhCalculator } from './components/FaraidhCalculator.tsx';
import { ZakatCalculator } from './components/ZakatCalculator.tsx';
import { Home } from "./components/Home.tsx";

type ViewState = 'home' | 'faraidh' | 'zakat';

const Header: React.FC<{
  view: ViewState;
  setView: (v: ViewState) => void;
}> = ({ view, setView }) => (
  <header className="bg-white shadow-sm sticky top-0 z-20 backdrop-blur-sm border-b border-slate-200">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <button
        onClick={() => setView("home")}
        className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`w-8 h-8 ${
            view === "zakat" ? "text-emerald-600" : "text-primary-600"
          }`}
        >
          <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03ZM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 0 0 .372-.648V7.93ZM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 0 0 .372.648L11.25 22.18Z" />
        </svg>
        <div className="text-left">
          <p
            className={`text-xl md:text-2xl font-bold tracking-tight leading-none ${
              view === "zakat" ? "text-emerald-700" : "text-primary-700"
            }`}
          >
            NIZAMY
          </p>
          {view !== "home" && (
            <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider font-medium mt-0.5">
              {view === "faraidh"
                ? "Kalkulator Waris Islam"
                : "Kalkulator Zakat"}
            </p>
          )}
        </div>
      </button>

      {view !== "home" && (
        <button
          onClick={() => setView("home")}
          className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <span className="hidden sm:inline">Menu Utama</span>
        </button>
      )}
    </div>
  </header>
);

const Footer: React.FC = () => (
  <footer className="text-center py-8 mt-12 border-t border-slate-200">
    <p className="text-slate-500 text-sm">
      &copy; {new Date().getFullYear()} NIZAMY: Kalkulator Waris & Zakat. Dibuat
      dengan <span className="text-red-500">&hearts;</span> untuk umat.
    </p>
  </footer>
);

export default function App() {
  const [view, setView] = useState<ViewState>("home");

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("theme");
  }, []);

  return (
    <div
      className={`min-h-screen font-sans bg-slate-50 text-slate-800 ${
        view === "zakat"
          ? "selection:bg-emerald-200 selection:text-emerald-900"
          : "selection:bg-blue-200 selection:text-blue-900"
      }`}
    >
      <Header view={view} setView={setView} />
      <main className="container mx-auto px-4 py-8">
        {view === "home" && <Home setView={setView} />}
        {view === "faraidh" && <FaraidhCalculator />}
        {view === "zakat" && <ZakatCalculator />}
      </main>
      <Footer />
    </div>
  );
}
