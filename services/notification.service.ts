
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

  // Kirim Notifikasi Lokal
  sendReminder: async (dueCount: number, remainingQuota: number = 0) => {
    // Validasi basic
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    
    // Cek apakah sudah notifikasi hari ini (biar ga spam tiap refresh)
    const lastNotifDate = localStorage.getItem('nizamy_last_notif_date');
    const today = new Date().toISOString().split('T')[0];

    // Logic: Notifikasi hanya sekali sehari, KECUALI status berubah signifikan (misal pagi belum selesai, sore diingatkan lagi bisa ditambahkan logic jam)
    // Untuk saat ini kita batasi 1x sehari agar tidak mengganggu.
    if (lastNotifDate === today) return; 

    let title = '';
    let body = '';

    // PRIORITAS 1: Ada jadwal Murajaah
    if (dueCount > 0) {
        title = 'Waktunya Murajaah! 📖';
        body = `Ada ${dueCount} hafalan yang perlu diulang hari ini agar tidak lupa. Semangat!`;
    } 
    // PRIORITAS 2: Murajaah beres, tapi Target Harian (Poin) belum habis
    else if (remainingQuota > 0) {
        title = 'Target Belum Tuntas 🌱';
        body = `Jadwal murajaah aman, tapi kamu masih punya sisa kuota ${remainingQuota} poin hari ini. Yuk tambah hafalan baru!`;
    }
    // PRIORITAS 3: Semua beres (Opsional, biasanya diam lebih baik)
    else {
        return; // Tidak perlu notifikasi jika semua beres
    }
    
    const options: ExtendedNotificationOptions = {
      body: body,
      icon: '/images/logo_nizamy.png',
      badge: '/images/logo_nizamy.png', 
      tag: 'nizamy-reminder', // Tag yang sama akan menimpa notifikasi sebelumnya
      renotify: true,
      requireInteraction: true,
      data: {
          url: '/' 
      }
    };

    try {
        // Prioritaskan Service Worker Registration untuk notifikasi (Lebih reliable di Android/PWA)
        let swRegistration = await navigator.serviceWorker.getRegistration();
        
        if (swRegistration) {
            await swRegistration.showNotification(title, options);
        } else {
            // Fallback ke Regular Notification API (Desktop biasa)
            new Notification(title, options);
        }
        
        // Simpan log tanggal
        localStorage.setItem('nizamy_last_notif_date', today);
    } catch (e) {
        console.error("Notification dispatch error:", e);
    }
  }
};
