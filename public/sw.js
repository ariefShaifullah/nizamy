
const CACHE_NAME = 'nizamy-cache-v4';
const QURAN_CACHE = 'nizamy-quran-data-v1';
const AUDIO_CACHE = 'nizamy-audio-cache-v1';
const ASSET_CACHE = 'nizamy-external-assets-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/android-chrome-512x512.png?v=4'
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
            // IMPORTANT: Clone response immediately before opening cache
            // Opening cache is async, and by the time it resolves, the original response body 
            // might be consumed by the browser if we don't clone it synchronously here.
            const responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
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
