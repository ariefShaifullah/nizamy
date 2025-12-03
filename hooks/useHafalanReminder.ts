
import { useEffect, useRef } from 'react';
import { checkAndSendHafalanReminder } from '../services/hafalan-reminder.service.ts';

/**
 * Hook untuk mengelola hafalan reminder dengan optimasi performa
 * - Mendaftarkan periodic sync untuk background notifications (PWA)
 * - Check hanya saat visibility change (lebih hemat battery)
 */
export const useHafalanReminder = () => {
  const lastCheckTime = useRef<number>(0);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // 1. Listen untuk message dari Service Worker (jika notif diklik/dikirim dari BG)
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'REMINDER_SENT') {
        const date = event.data.date;
        localStorage.setItem('nizamy_last_notif_date', date);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSWMessage);
    }

    // 2. Initial check saat app dibuka
    const initialCheckTimer = setTimeout(() => {
      performCheck();
    }, 3000); 

    // 3. Register Periodic Background Sync (CRITICAL UNTUK BACKGROUND NOTIF)
    const registerPeriodicSync = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          
          // @ts-ignore - periodicSync types belum standar di TS
          if (registration.periodicSync) {
            // Minta izin status dulu
            const status = await navigator.permissions.query({
              // @ts-ignore
              name: 'periodic-background-sync',
            });

            if (status.state === 'granted') {
                // @ts-ignore
                await registration.periodicSync.register('hafalan-reminder-sync', {
                  minInterval: 12 * 60 * 60 * 1000, // Minimal 12 jam sekali (kebijakan browser)
                });
                console.debug('✅ Periodic sync registered');
            }
          }
        } catch (error) {
          // Fitur ini mungkin tidak didukung di semua browser (terutama iOS/Firefox)
          console.debug('⚠️ Periodic sync setup failed:', error);
        }
      }
    };

    registerPeriodicSync();

    // 4. Check saat user kembali ke tab (Foreground Check)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        performCheck();
      }
    };

    const handleOnline = () => {
      performCheck();
    };

    const performCheck = () => {
      const now = Date.now();
      const hourInMs = 60 * 60 * 1000;
      
      // Throttle: hanya check jika sudah lewat 1 jam sejak check terakhir di sesi ini
      if (now - lastCheckTime.current < hourInMs) {
        return;
      }

      lastCheckTime.current = now;
      
      checkAndSendHafalanReminder().catch(err => {
        console.debug('❌ Reminder check failed:', err);
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    // 5. Fallback Interval (Jika app dibiarkan terbuka seharian)
    const checkSmartTiming = () => {
        const hour = new Date().getHours();
        // Check di jam strategis (Pagi/Sore)
        if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
          performCheck();
        }
    };
    checkIntervalRef.current = setInterval(checkSmartTiming, 2 * 60 * 60 * 1000);

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
