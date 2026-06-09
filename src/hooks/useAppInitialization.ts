import { useEffect } from 'react';
import { usePWA } from './usePWA.ts';
import { usePageMetadata } from './usePageMetadata.tsx';
import { useHafalanReminder } from './useHafalanReminder.ts';
import { migrateFromLocalStorage } from '../services/db.service.ts';

/**
 * Hook to handle all global application side-effects and initializations.
 * Keeps the main App component clean.
 */
export const useAppInitialization = () => {
  // 1. PWA Logic (Install Prompt & SW Updates)
  const { needRefresh, updateServiceWorker } = usePWA();

  // 2. SEO & Theme Color Metadata
  usePageMetadata();
  
  // 3. Hafalan Notification System
  useHafalanReminder();

  // 4. Data Migration (Legacy LocalStorage -> IndexedDB)
  useEffect(() => {
    migrateFromLocalStorage().catch(err => 
      console.error("Data migration failed:", err)
    );
  }, []);

  return {
    needRefresh,
    updateServiceWorker
  };
};