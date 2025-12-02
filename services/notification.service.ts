import type { ZakatState } from '../types.ts';

const PREF_KEY = 'nizamy_notifications_enabled';

// Extension to support standard properties that TS might not know in all envs
interface ExtendedNotificationOptions extends NotificationOptions {
    renotify?: boolean;
}

export const notificationService = {
  // Cek apakah browser support notifikasi
  isSupported: () => {
    return 'Notification' in window;
  },

  // Cek apakah user sudah mengizinkan
  getPermissionState: (): NotificationPermission => {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  },

  // Request izin ke user
  requestPermission: async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        localStorage.setItem(PREF_KEY, 'true');
        // Reset last notif date to allow immediate notification after granting
        localStorage.removeItem('nizamy_last_notif_date'); 
        return true;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
    
    // If denied or dismissed
    localStorage.setItem(PREF_KEY, 'false');
    return false;
  },

  // Cek preferensi user (dari localStorage)
  isEnabled: () => {
    return localStorage.getItem(PREF_KEY) === 'true' && Notification.permission === 'granted';
  },

  // Set toggle manual
  setEnabled: (enabled: boolean) => {
    localStorage.setItem(PREF_KEY, String(enabled));
  },

  // Update App Icon Badge (Titik merah di icon aplikasi)
  updateAppBadge: async (count: number) => {
    if ('setAppBadge' in navigator) {
      try {
        if (count > 0) {
          await (navigator as any).setAppBadge(count);
        } else {
          await (navigator as any).clearAppBadge();
        }
      } catch (error) {
        // Quietly fail if not installed PWA or not supported
        console.debug('App Badging skipped:', error);
      }
    }
  },

  // Helper internal untuk memanggil API notifikasi
  _triggerNotification: async (title: string, options: ExtendedNotificationOptions) => {
      try {
        if (!('serviceWorker' in navigator)) {
            new Notification(title, options);
            return;
        }

        const registration = await navigator.serviceWorker.ready;
        
        if (registration) {
            await registration.showNotification(title, options);
        } else {
            new Notification(title, options);
        }
    } catch (e) {
        console.error("Notification dispatch error:", e);
        try {
            new Notification(title, options);
        } catch (err2) {
            console.error("Fallback notification failed", err2);
        }
    }
  },

  // Kirim Notifikasi Tes
  sendTestNotification: async () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;

      const options: ExtendedNotificationOptions = {
          body: "Alhamdulillah, notifikasi NIZAMY sudah aktif. Kami akan mengingatkan jadwal murajaah kamu.",
          icon: '/images/logo_nizamy.png?v=5',
          badge: '/images/logo_nizamy.png?v=5',
          tag: 'nizamy-test',
          renotify: true
      };

      await notificationService._triggerNotification("Notifikasi Aktif ✅", options);
  },

  // Kirim Notifikasi Lokal (Harian)
  sendReminder: async (dueCount: number, remainingQuota: number = 0, force: boolean = false) => {
    // Validasi basic
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    
    // Cek apakah sudah notifikasi hari ini
    const lastNotifDate = localStorage.getItem('nizamy_last_notif_date');
    const today = new Date().toISOString().split('T')[0];

    // Logic: Notifikasi hanya sekali sehari, KECUALI dipaksa (force)
    if (!force && lastNotifDate === today) return; 

    let title = '';
    let body = '';

    // PRIORITAS 1: Ada jadwal Murajaah
    if (dueCount > 0) {
        title = 'Waktunya Murajaah! 📖';
        body = `Ada ${dueCount} hafalan yang perlu diulang hari ini agar tidak lupa. Semangat!`;
    } 
    // PRIORITAS 2: Murajaah beres, tapi Target Harian belum habis
    else if (remainingQuota > 0) {
        title = 'Target Belum Tuntas 🌱';
        body = `Jadwal murajaah aman, tapi kamu masih punya sisa kuota ${remainingQuota} poin hari ini. Yuk tambah hafalan baru!`;
    }
    // PRIORITAS 3: Semua beres
    else {
        return; 
    }
    
    const options: ExtendedNotificationOptions = {
      body: body,
      icon: '/images/logo_nizamy.png?v=5',
      badge: '/images/logo_nizamy.png?v=5', 
      tag: 'nizamy-reminder',
      renotify: true,
      requireInteraction: true,
      data: {
          url: '/' 
      }
    };

    await notificationService._triggerNotification(title, options);
    
    // Simpan log tanggal HANYA jika sukses terkirim
    localStorage.setItem('nizamy_last_notif_date', today);
  }
};