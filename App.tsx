import React, { useEffect, Suspense } from 'react';
import { Home } from './components/Home.tsx';
import { Header, Footer } from './components/Layout.tsx';
import { useToast } from './components/ui/Toast.tsx';
import { usePWA } from './hooks/usePWA.ts';
import { useRouter } from './hooks/useRouter.ts';
import { OfflineBanner } from './components/ui/OfflineBanner.tsx';

// Lazy Load Components to optimize initial bundle size
const FaraidhCalculator = React.lazy(() => import('./components/faraidh/FaraidhCalculator.tsx'));
const ZakatCalculator = React.lazy(() => import('./components/zakat/ZakatCalculator.tsx'));
const HafalanTracker = React.lazy(() => import('./components/hafalan/HafalanTracker.tsx'));
const MushafApp = React.lazy(() => import('./components/mushaf/MushafApp.tsx'));

// Loading Fallback Component
const PageLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 animate-fade-in">
    <div className="relative w-24 h-24 flex items-center justify-center">
      {/* Spinner Rings */}
      <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
      
      {/* Logo in the center */}
      <img
        src="/images/logo_nizamy.png"
        alt="NIZAMY Logo"
        className="w-12 h-12 object-contain animate-pulse"
      />
    </div>
    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Memuat Modul...</p>
  </div>
);

export default function App() {
  const { view, setView } = useRouter();
  const { showToast } = useToast();
  const { needRefresh, updateServiceWorker } = usePWA();

  // Network Status Monitoring (Toast only for reconnection)
  useEffect(() => {
    const handleOnline = () => showToast('Koneksi internet terhubung kembali.', 'success');
    // Offline is now handled by OfflineBanner, so we don't need a toast that disappears
    
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [showToast]);

  // Dynamic SEO Title & Theme Color
  useEffect(() => {
    const baseTitle = "NIZAMY";
    let themeColor = "#4f46e5"; // Default Indigo

    switch (view) {
      case 'faraidh':
        document.title = `${baseTitle} | Kalkulator Waris Islam (Faraidh)`;
        themeColor = "#0284c7"; // Sky/Blue
        break;
      case 'zakat':
        document.title = `${baseTitle} | Kalkulator Zakat Online (Fitrah & Maal)`;
        themeColor = "#059669"; // Emerald
        break;
      case 'hafalan':
        document.title = `${baseTitle} | Hafalan Quran Tracker (SRS)`;
        themeColor = "#4338ca"; // Indigo
        break;
      case 'mushaf':
        document.title = `${baseTitle} | Mushaf Digital & Kamus Tajwid`;
        themeColor = "#0d9488"; // Teal
        break;
      default:
        document.title = `${baseTitle}: Aplikasi Ibadah Islam (Waris, Zakat, Hafalan)`;
        themeColor = "#4f46e5";
    }

    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", themeColor);
    }
  }, [view]);

  // Base text color
  let textClass = 'text-slate-800 dark:text-slate-100 transition-colors duration-300';
  if (view === 'zakat') textClass += ' selection:bg-emerald-200 selection:text-emerald-900';
  else if (view === 'faraidh') textClass += ' selection:bg-blue-200 selection:text-blue-900';
  else if (view === 'hafalan') textClass += ' selection:bg-indigo-200 selection:text-indigo-900';
  else if (view === 'mushaf') textClass += ' selection:bg-teal-200 selection:text-teal-900';

  return (
    <div className={`min-h-screen font-sans flex flex-col ${textClass}`}>
      <OfflineBanner />
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

      <main className={view === 'home' ? 'flex-grow' : 'container mx-auto px-4 py-4 md:py-8 flex-grow'}>
        <Suspense fallback={<PageLoader />}>
          {view === 'home' && <Home setView={setView} />}
          {view === 'faraidh' && <FaraidhCalculator />}
          {view === 'zakat' && <ZakatCalculator />}
          {view === 'hafalan' && <HafalanTracker />}
          {view === 'mushaf' && <MushafApp />}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}