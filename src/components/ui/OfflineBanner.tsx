
import React, { useState, useEffect } from 'react';
import { FaWifi } from 'react-icons/fa';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-slate-800 dark:bg-slate-900 text-white px-4 py-2 text-xs md:text-sm font-medium text-center fixed top-[env(safe-area-inset-top)] left-0 right-0 z-header animate-fade-in-down shadow-md flex items-center justify-center gap-2">
      <div className="h-4 w-4 text-slate-400"><FaWifi/></div>
      <span>Anda sedang offline. Audio & data online tidak tersedia.</span>
    </div>
  );
};