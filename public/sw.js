
const CACHE_NAME = 'nizamy-cache-v2';
const QURAN_CACHE = 'nizamy-quran-data-v1';
const AUDIO_CACHE = 'nizamy-audio-cache-v1';
const ASSET_CACHE = 'nizamy-external-assets-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg'
];

// Install SW
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force new SW to activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate SW & Clean old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, QURAN_CACHE, AUDIO_CACHE, ASSET_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all clients immediately
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. API Al-Quran (Text): Cache First (Statis & Berat)
  // Optimization: Once fetched, we assume verse text doesn't change.
  if (url.hostname.includes('api.alquran.cloud')) {
    event.respondWith(
      caches.open(QURAN_CACHE).then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((networkResponse) => {
            // Cache valid responses only
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // 2. Audio Files: Cache First (Performance)
  if (url.hostname.includes('everyayah.com')) {
     event.respondWith(
        caches.open(AUDIO_CACHE).then((cache) => {
            return cache.match(event.request).then((response) => {
                return response || fetch(event.request).then((networkResponse) => {
                    if (networkResponse.ok) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            });
        })
     );
     return;
  }

  // 3. External UI Assets (Fonts, Icons): Stale-While-Revalidate
  // Allows offline usage of fonts and icons
  if (url.hostname.includes('fonts.googleapis.com') || 
      url.hostname.includes('fonts.gstatic.com') || 
      url.hostname.includes('cdn-icons-png.flaticon.com')) {
      event.respondWith(
        caches.open(ASSET_CACHE).then((cache) => {
          return cache.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
              if (networkResponse.ok) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            }).catch(err => console.log("External asset fetch failed (offline)", err));
            
            return cachedResponse || fetchPromise;
          });
        })
      );
      return;
  }

  // 4. Navigation (HTML): Network First (Check for App Updates)
  // This ensures users get the latest version deployed
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // 5. Assets (JS/CSS/Images): Stale-While-Revalidate
  // Serve fast from cache, but update in background for next visit
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
            });
        }
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});

// Handle Notification Clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Close the notification

  // Focus on existing window or open a new one
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // If a window is already open, focus it
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Periodic Background Sync for Hafalan Reminders
// Browser akan trigger ini saat device idle + charging (hemat battery)
self.addEventListener('periodicsync', function(event) {
  if (event.tag === 'hafalan-reminder-sync') {
    event.waitUntil(checkHafalanReminders());
  }
});

// Cache untuk hasil check terakhir (menghindari re-computation)
let reminderCache = {
  lastCheck: 0,
  totalDue: 0,
  date: ''
};

// Helper function to check hafalan reminders (optimized)
async function checkHafalanReminders() {
  try {
    const today = getLocalYYYYMMDD();
    const now = Date.now();
    const hourInMs = 60 * 60 * 1000;
    
    // Optimization 1: Cache check - jika sudah check dalam 1 jam terakhir, skip
    if (reminderCache.date === today && now - reminderCache.lastCheck < hourInMs) {
      console.debug('⏭️ Using cached reminder data');
      return;
    }
    
    // Optimization 2: Check notification preference dulu sebelum load data
    const notifEnabled = await checkNotificationPreference();
    if (!notifEnabled) {
      console.debug('⏭️ Notifications disabled, skipping check');
      return;
    }
    
    // Optimization 3: Lazy load idb-keyval hanya jika benar-benar perlu
    const { get, keys } = await import('/node_modules/idb-keyval/dist/index.js');
    
    // Get all hafalan user data keys
    const allKeys = await keys();
    const hafalanKeys = allKeys.filter(key => 
      typeof key === 'string' && key.startsWith('nizamy_hafalan_data_')
    );
    
    if (hafalanKeys.length === 0) {
      console.debug('⏭️ No hafalan data found');
      return;
    }
    
    let totalDue = 0;
    
    // Optimization 4: Process user data dengan early exit
    for (const key of hafalanKeys) {
      const userData = await get(key);
      if (!userData || !userData.items || userData.items.length === 0) continue;
      
      // Count only due items (filter lebih cepat daripada loop manual)
      const dueCount = userData.items.filter(item => item.nextReviewDate <= today).length;
      totalDue += dueCount;
      
      // Early exit jika sudah ada due items (tidak perlu cek user lain)
      if (totalDue > 0) break;
    }
    
    // Update cache
    reminderCache = {
      lastCheck: now,
      totalDue: totalDue,
      date: today
    };
    
    // Send notification if there are due items
    if (totalDue > 0) {
      await self.registration.showNotification('Waktunya Murajaah! 📖', {
        body: `Ada ${totalDue} hafalan yang perlu diulang hari ini agar tidak lupa. Semangat!`,
        icon: '/images/logo_nizamy.png',
        badge: '/images/logo_nizamy.png',
        tag: 'nizamy-reminder',
        renotify: true,
        requireInteraction: false, // Changed: jangan block user
        data: { url: '/#/hafalan' },
        silent: false // User bisa dengar notifikasi
      });
      
      // Mark as notified today
      try {
        await clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'REMINDER_SENT',
              date: today
            });
          });
        });
      } catch (e) {
        // Ignore error jika tidak ada active client
      }
    }
    
    // Update app badge (lightweight operation)
    if ('setAppBadge' in self.navigator) {
      if (totalDue > 0) {
        await self.navigator.setAppBadge(totalDue);
      } else {
        await self.navigator.clearAppBadge();
      }
    }
    
    console.debug(`✅ Reminder check complete: ${totalDue} due items`);
  } catch (error) {
    console.error('❌ Error checking hafalan reminders:', error);
  }
}

// Helper to get local date in YYYY-MM-DD format
function getLocalYYYYMMDD(d) {
  const date = d || new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to check notification preference
async function checkNotificationPreference() {
  try {
    const prefEnabled = localStorage.getItem('nizamy_notifications_enabled') === 'true';
    const permission = Notification.permission === 'granted';
    
    // Check if already notified today
    const lastNotifDate = localStorage.getItem('nizamy_last_notif_date');
    const today = getLocalYYYYMMDD();
    
    return prefEnabled && permission && lastNotifDate !== today;
  } catch (error) {
    return false;
  }
}
