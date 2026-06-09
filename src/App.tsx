import React, { useEffect, Suspense, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Home } from './features/home/Home.tsx';
import { Header, Footer } from './components/layout/Layout.tsx';
import { BottomNav } from './components/layout/BottomNav.tsx';
import { useToast } from './components/ui/Toast.tsx';
import { OfflineBanner } from './components/ui/OfflineBanner.tsx';
import { PageLoader } from './components/ui/PageLoader.tsx';
import { useAppInitialization } from './hooks/useAppInitialization.ts';
import { PageHead } from './hooks/usePageMetadata.tsx';

// Lazy Load Components (Feature-Based)
const FaraidhCalculator = React.lazy(() => import('./features/faraidh/FaraidhCalculator.tsx'));
const ZakatCalculator = React.lazy(() => import('./features/zakat/ZakatCalculator.tsx'));
const HafalanTracker = React.lazy(() => import('./features/hafalan/HafalanTracker.tsx'));
const MushafApp = React.lazy(() => import('./features/mushaf/MushafApp.tsx'));
const HedeApp = React.lazy(() => import('./features/hede/HedeApp.tsx'));
const AmalYaumiApp = React.lazy(() => import('./features/amal/AmalYaumiApp.tsx'));
const PrayerApp = React.lazy(() => import('./features/prayer/PrayerApp.tsx'));
// NEW: Scanner
const HalalScanner = React.lazy(() => import('./features/scanner/HalalScanner.tsx').then(module => ({ default: module.HalalScanner })));

// Inner Component to use hooks that require Router context
const AppContent = () => {
  const location = useLocation();
  const { showToast } = useToast();

  // Custom Hook handling all side-effects (SEO, PWA, Migration, Reminder)
  const { needRefresh, updateServiceWorker } = useAppInitialization();

  // Network Status Monitoring
  useEffect(() => {
    const handleOnline = () => showToast('Koneksi internet terhubung kembali.', 'success');
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [showToast]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Standard Layout Class
  const layoutClass = useMemo(() => {
    const path = location.pathname;
    const base = 'min-h-screen font-sans flex flex-col text-slate-800 dark:text-slate-100 transition-colors duration-300 selection:bg-teal-200 selection:text-teal-900 dark:selection:bg-teal-900/50 dark:selection:text-teal-100';

    if (path.includes('/scanner')) return `${base} bg-black text-white`; // Scanner overrides theme

    return base;
  }, [location.pathname]);

  // Hide Header/Footer on Scanner Page
  const isScanner = location.pathname === '/scanner';

  // Reduced top padding from 8rem to 5rem for better vertical alignment
  const mainPaddingClass = (location.pathname === '/' || isScanner)
    ? 'flex-grow'
    : 'container mx-auto px-4 py-4 md:py-8 flex-grow pt-[calc(5rem+env(safe-area-inset-top))] md:pt-[calc(5rem+env(safe-area-inset-top))]';

  return (
  <div className={layoutClass}>
  <PageHead />
  {!isScanner && <OfflineBanner />}
      {!isScanner && <Header />}

      {/* PWA Update Banner */}
      {needRefresh && !isScanner && import.meta.env.PROD && (
        <div className="bg-slate-900 text-white px-4 py-3 shadow-lg relative z-notification animate-fade-in-down flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 text-center sm:text-left top-20 left-0 right-0">
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

      <main className={mainPaddingClass}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/faraidh" element={<FaraidhCalculator />} />
            <Route path="/zakat" element={<ZakatCalculator />} />
            <Route path="/hafalan" element={<HafalanTracker />} />
            <Route path="/mushaf" element={<MushafApp />} />
            <Route path="/hede" element={<HedeApp />} />
            <Route path="/amal" element={<AmalYaumiApp />} />
            <Route path="/sholat" element={<PrayerApp />} />
            <Route path="/scanner" element={<HalalScanner />} />
            <Route path="*" element={<Home />} /> {/* Fallback */}
          </Routes>
        </Suspense>
      </main>

      {!isScanner && <BottomNav />}
      {!isScanner && <Footer />}
    </div>
  );
};

export default function App() {
  return (
  <BrowserRouter>
  <AppContent />
  </BrowserRouter>
  );
}