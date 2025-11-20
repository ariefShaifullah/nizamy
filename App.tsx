
import React, { useState, useEffect } from 'react';
import { FaraidhCalculator } from './components/FaraidhCalculator.tsx';
import { ZakatCalculator } from './components/ZakatCalculator.tsx';
import { HafalanTracker } from "./components/HafalanTracker.tsx";
import { Home } from "./components/Home.tsx";
import { Header, Footer, type ViewState } from "./components/Layout.tsx";

export default function App() {
  const [view, setView] = useState<ViewState>("home");

  useEffect(() => {
    // Theme cleanup
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("theme");
  }, []);

  // Dynamic SEO Title
  useEffect(() => {
    const baseTitle = "NIZAMY";
    switch (view) {
      case "faraidh":
        document.title = `${baseTitle} | Kalkulator Waris Islam (Faraidh)`;
        break;
      case "zakat":
        document.title = `${baseTitle} | Kalkulator Zakat Online (Fitrah & Maal)`;
        break;
      case "hafalan":
        document.title = `${baseTitle} | Hafalan Quran Tracker (SRS)`;
        break;
      default:
        document.title = `${baseTitle}: Aplikasi Islam Terlengkap (Waris, Zakat, Hafalan)`;
    }
  }, [view]);

  // Base class for body depending on view for subtle theming
  let bgClass = "bg-slate-50 text-slate-800";
  if (view === "zakat")
    bgClass += " selection:bg-emerald-200 selection:text-emerald-900";
  else if (view === "faraidh")
    bgClass += " selection:bg-blue-200 selection:text-blue-900";
  else if (view === "hafalan")
    bgClass += " selection:bg-indigo-200 selection:text-indigo-900";

  return (
    <div className={`min-h-screen font-sans flex flex-col ${bgClass}`}>
      <Header view={view} setView={setView} />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {view === "home" && <Home setView={setView} />}
        {view === "faraidh" && <FaraidhCalculator />}
        {view === "zakat" && <ZakatCalculator />}
        {view === "hafalan" && <HafalanTracker />}
      </main>
      <Footer />
    </div>
  );
}
