
import React, { useState, useEffect, Suspense } from "react";
import { Home } from "./components/Home.tsx";
import { Header, Footer, type ViewState } from "./components/Layout.tsx";
import { useToast } from "./components/ui/Toast.tsx";
import { usePWA } from "./hooks/usePWA.ts";

// Lazy Load Components to optimize initial bundle size
// Note: These components now use default exports for simpler lazy loading
const FaraidhCalculator = React.lazy(
  () => import("./components/faraidh/FaraidhCalculator.tsx")
);
const ZakatCalculator = React.lazy(
  () => import("./components/zakat/ZakatCalculator.tsx")
);
const HafalanTracker = React.lazy(
  () => import("./components/hafalan/HafalanTracker.tsx")
);

// Loading Fallback Component
const PageLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 animate-fade-in">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
    </div>
    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
      Memuat Modul...
    </p>
  </div>
);

export default function App() {
  const [view, setView] = useState<ViewState>("home");
  const { showToast } = useToast();
  const { needRefresh, updateServiceWorker } = usePWA();

  // Network Status Monitoring
  useEffect(() => {
    const handleOnline = () =>
      showToast("Koneksi internet terhubung kembali.", "success");
    const handleOffline = () =>
      showToast(
        "Anda sedang offline. Aplikasi berjalan dalam mode terbatas.",
        "info"
      );

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [showToast]);

  // Dynamic SEO Title & Theme Color
  useEffect(() => {
    const baseTitle = "NIZAMY";
    let themeColor = "#4f46e5"; // Default Indigo

    switch (view) {
      case "faraidh":
        document.title = `${baseTitle} | Kalkulator Waris Islam (Faraidh)`;
        themeColor = "#0284c7"; // Sky/Blue
        break;
      case "zakat":
        document.title = `${baseTitle} | Kalkulator Zakat Online (Fitrah & Maal)`;
        themeColor = "#059669"; // Emerald
        break;
      case "hafalan":
        document.title = `${baseTitle} | Hafalan Quran Tracker (SRS)`;
        themeColor = "#4338ca"; // Indigo
        break;
      default:
        document.title = `${baseTitle}: Aplikasi Ibadah Islam (Waris, Zakat, Hafalan)`;
        themeColor = "#4f46e5";
    }

    // Update Meta Theme Color for Mobile Browsers
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", themeColor);
    }
  }, [view]);

  // Base class for body depending on view for subtle theming
  let bgClass =
    "bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300";
  if (view === "zakat")
    bgClass += " selection:bg-emerald-200 selection:text-emerald-900";
  else if (view === "faraidh")
    bgClass += " selection:bg-blue-200 selection:text-blue-900";
  else if (view === "hafalan")
    bgClass += " selection:bg-indigo-200 selection:text-indigo-900";

  return (
    <div className={`min-h-screen font-sans flex flex-col ${bgClass}`}>
      <Header view={view} setView={setView} />

      {/* PWA Update Banner */}
      {needRefresh && (
        <div className="bg-slate-900 text-white px-4 py-3 shadow-lg relative z-50 animate-fade-in-down flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 text-center sm:text-left">
          <p className="text-sm font-medium">
            ✨ Versi baru aplikasi tersedia! Update untuk fitur terbaru.
          </p>
          <button
            onClick={() => updateServiceWorker()}
            className="bg-white text-slate-900 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-slate-100 transition-colors whitespace-nowrap"
          >
            Update Sekarang
          </button>
        </div>
      )}

      <main className="container mx-auto px-4 py-4 md:py-8 flex-grow">
        <Suspense fallback={<PageLoader />}>
          {view === "home" && <Home setView={setView} />}
          {view === "faraidh" && <FaraidhCalculator />}
          {view === "zakat" && <ZakatCalculator />}
          {view === "hafalan" && <HafalanTracker />}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
