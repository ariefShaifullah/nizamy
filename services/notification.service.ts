const PREF_KEY = "nizamy_notifications_enabled";

// Extension to support standard properties that TS might not know in all envs
interface ExtendedNotificationOptions extends NotificationOptions {
  renotify?: boolean;
}

export const notificationService = {
  // Cek apakah browser support notifikasi
  isSupported: () => {
    return "Notification" in window;
  },

  // Cek apakah user sudah mengizinkan
  getPermissionState: (): NotificationPermission => {
    if (!("Notification" in window)) return "denied";
    return Notification.permission;
  },

  // Request izin ke user
  requestPermission: async (): Promise<boolean> => {
    if (!("Notification" in window)) return false;

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        localStorage.setItem(PREF_KEY, "true");
        return true;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }

    // If denied or dismissed
    localStorage.setItem(PREF_KEY, "false");
    return false;
  },

  // Cek preferensi user (dari localStorage)
  isEnabled: () => {
    return (
      localStorage.getItem(PREF_KEY) === "true" &&
      Notification.permission === "granted"
    );
  },

  // Set toggle manual
  setEnabled: (enabled: boolean) => {
    localStorage.setItem(PREF_KEY, String(enabled));
  },

  // Update App Icon Badge (Titik merah di icon aplikasi)
  updateAppBadge: async (count: number) => {
    if ("setAppBadge" in navigator) {
      try {
        if (count > 0) {
          await (navigator as any).setAppBadge(count);
        } else {
          await (navigator as any).clearAppBadge();
        }
      } catch (error) {
        // Quietly fail if not installed PWA or not supported
        console.debug("App Badging skipped:", error);
      }
    }
  },

  // Kirim Notifikasi Lokal
  sendReminder: async (count: number) => {
    // Validasi basic
    if (!("Notification" in window) || Notification.permission !== "granted")
      return;

    // Cek apakah sudah notifikasi hari ini (biar ga spam tiap refresh)
    const lastNotifDate = localStorage.getItem("nizamy_last_notif_date");
    const today = new Date().toISOString().split("T")[0];

    if (lastNotifDate === today && count > 0) return; // Only skip if we have items (test notification might pass 0)

    const title = "Waktunya Murajaah! 📖";

    const options: ExtendedNotificationOptions = {
      body:
        count > 0
          ? `Ada ${count} hafalan yang perlu diulang hari ini agar tidak lupa. Semangat!`
          : `Notifikasi aktif! Kami akan mengingatkan jadwal murajaah kamu.`,
      icon: "/images/icon.svg",
      badge: "/images/icon.svg", // Monochrome icon for Android status bar usually recommended
      tag: "murajaah-reminder", // Mencegah duplikasi tumpukan notifikasi
      renotify: true, // Vibrate/Sound again even if tag exists
      requireInteraction: true, // Notifikasi tidak hilang otomatis (Desktop)
      data: {
        url: "/", // URL to open
      },
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

      // Simpan log tanggal biar ga spam
      if (count > 0) {
        localStorage.setItem("nizamy_last_notif_date", today);
      }
    } catch (e) {
      console.error("Notification dispatch error:", e);
    }
  },
};
