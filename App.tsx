
import React, { useEffect, Suspense, useMemo } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Home } from './features/home/Home.tsx';
import { Header, Footer } from './components/layout/Layout.tsx';
import { useToast } from './components/ui/Toast.tsx';
import { usePWA } from './hooks/usePWA.ts';
import { usePageMetadata } from './hooks/usePageMetadata.ts';
import { OfflineBanner } from './components/ui/OfflineBanner.tsx';
import { useHafalanReminder } from './hooks/useHafalanReminder.ts';
import { migrateFromLocalStorage } from './services/db.service.ts';

// Lazy Load Components (Feature-Based)
const FaraidhCalculator = React.lazy(() => import('./features/faraidh/FaraidhCalculator.tsx'));
const ZakatCalculator = React.lazy(() => import('./features/zakat/ZakatCalculator.tsx'));
const HafalanTracker = React.lazy(() => import('./features/hafalan/HafalanTracker.tsx'));
const MushafApp = React.lazy(() => import('./features/mushaf/MushafApp.tsx'));
const HedeApp = React.lazy(() => import('./features/hede/HedeApp.tsx'));

// Loading Fallback Component
const PageLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 animate-fade-in">
    <div className="relative w-24 h-24 flex items-center justify-center">
      {/* Spinner Rings */}
      <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
      
      {/* Logo in the center */}
      <img
        src="/images/logo_nizamy.png?v=6"
        alt="NIZAMY Logo"
        className="w-12 h-12 object-contain animate-pulse"
      />
    </div>
    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Memuat Modul...</p>
  </div>
);

// Inner Component to use hooks that require Router context
const AppContent = () => {
  const location = useLocation();
  const { showToast } = useToast();
  const { needRefresh, updateServiceWorker } = usePWA();

  // Handle SEO & Theme Color Side Effects
  usePageMetadata();
  
  // Initialize Hafalan Reminder System
  useHafalanReminder();

  // Global Data Migration (Legacy LS -> IndexedDB)
  useEffect(() => {
    // Jalankan migrasi di background saat app start agar data history lama 
    // pindah ke storage baru dan terbaca oleh sistem Backup/Restore.
    migrateFromLocalStorage().catch(err => 
      console.error("Data migration failed:", err)
    );
  }, []);

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

  // Memoize layout class to prevent recalculation on every render
  const layoutClass = useMemo(() => {
      const path = location.pathname;
      const base = 'min-h-screen font-sans flex flex-col text-slate-800 dark:text-slate-100 transition-colors duration-300';
      
      if (path.includes('/zakat')) return `${base} selection:bg-emerald-200 selection:text-emerald-900`;
      if (path.includes('/faraidh')) return `${base} selection:bg-blue-200 selection:text-blue-900`;
      if (path.includes('/hafalan')) return `${base} selection:bg-indigo-200 selection:text-indigo-900`;
      if (path.includes('/mushaf')) return `${base} selection:bg-teal-200 selection:text-teal-900`;
      if (path.includes('/hede')) return `${base} selection:bg-purple-200 selection:text-purple-900`;
      
      return base;
  }, [location.pathname]);

  const mainPaddingClass = location.pathname === '/' 
    ? 'flex-grow' 
    : 'container mx-auto px-4 py-4 md:py-8 flex-grow pt-[calc(6rem+env(safe-area-inset-top))] md:pt-[calc(8rem+env(safe-area-inset-top))]';

  return (
    <div className={layoutClass}>
      <OfflineBanner />
      <Header />
      
      {/* PWA Update Banner */}
      {needRefresh && (
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
            <Route path="*" element={<Home />} /> {/* Fallback */}
          </Routes>
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
