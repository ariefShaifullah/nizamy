import { useEffect, useRef } from 'react';
import { checkAndSendHafalanReminder } from '../services/hafalan-reminder.service.ts';

/**
 * Hook untuk mengelola hafalan reminder dengan optimasi performa
 * - Mendaftarkan periodic sync untuk background notifications (PWA)
 * - Check hanya saat visibility change (lebih hemat battery)
 * - Throttle untuk mencegah spam check
 */
export const useHafalanReminder = () => {
  const lastCheckTime = useRef<number>(0);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Listen untuk message dari Service Worker
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'REMINDER_SENT') {
        // Sync last notification date dari SW
        const date = event.data.date;
        localStorage.setItem('nizamy_last_notif_date', date);
        console.debug('📩 Synced reminder date from SW:', date);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSWMessage);
    }

    // Initial check dengan delay untuk tidak mengganggu app load
    const initialCheckTimer = setTimeout(() => {
      performCheck();
    }, 3000); // 3 detik setelah app load

    // Register Periodic Background Sync (if supported)
    const registerPeriodicSync = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          
          // @ts-ignore - periodicSync is not yet in TypeScript types
          if (registration.periodicSync) {
            // @ts-ignore
            await registration.periodicSync.register('hafalan-reminder-sync', {
              minInterval: 24 * 60 * 60 * 1000, // 24 hours
            });
            console.debug('✅ Periodic sync registered');
          }
        } catch (error) {
          console.debug('⚠️ Periodic sync not available:', error);
        }
      }
    };

    registerPeriodicSync();

    // Optimized: Check saat user kembali ke tab (visibility change)
    // Lebih hemat daripada interval terus menerus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        performCheck();
      }
    };

    // Optimized: Check saat user kembali online
    const handleOnline = () => {
      performCheck();
    };

    // Helper function dengan throttle
    const performCheck = () => {
      const now = Date.now();
      const hourInMs = 60 * 60 * 1000;
      
      // Throttle: hanya check jika sudah lewat 1 jam sejak check terakhir
      if (now - lastCheckTime.current < hourInMs) {
        console.debug('⏭️ Skipping check (throttled)');
        return;
      }

      lastCheckTime.current = now;
      
      checkAndSendHafalanReminder().catch(err => {
        console.debug('❌ Reminder check failed:', err);
      });
    };

    // Event listeners (lebih efisien daripada setInterval)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    // Fallback: Check maksimal 2x sehari (jam 9 pagi dan jam 6 sore)
    // Hanya jika app tetap terbuka lama
    const setupSmartInterval = () => {
      // Clear existing interval
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }

      const checkSmartTiming = () => {
        const hour = new Date().getHours();
        
        // Check hanya di jam-jam strategis: 8-10 pagi atau 17-19 sore
        if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
          performCheck();
        }
      };

      // Check setiap 2 jam (lebih hemat dari setiap 1 jam)
      checkIntervalRef.current = setInterval(checkSmartTiming, 2 * 60 * 60 * 1000);
    };

    setupSmartInterval();

    // Cleanup
    return () => {
      clearTimeout(initialCheckTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage);
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);
};
