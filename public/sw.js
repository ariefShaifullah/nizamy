
const CACHE_NAME = 'nizamy-cache-v6';
const QURAN_CACHE = 'nizamy-quran-data-v1';
const AUDIO_CACHE = 'nizamy-audio-cache-v1';
const ASSET_CACHE = 'nizamy-external-assets-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/android-chrome-512x512.png?v=6'
];

// Install SW
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate SW
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
    }).then(() => self.clients.claim())
  );
});

// --- BACKGROUND SYNC LOGIC (MANUAL IDB) ---
// Kita harus menggunakan raw IDB karena sw.js ini tidak di-bundle dengan library eksternal
const checkHafalanInBackground = async () => {
    try {
        const dbReq = indexedDB.open('keyval-store');
        
        dbReq.onsuccess = (e) => {
            const db = e.target.result;
            const transaction = db.transaction(['keyval'], 'readonly');
            const store = transaction.objectStore('keyval');
            
            // 1. Get Users List
            const usersReq = store.get('nizamy_hafalan_users');
            
            usersReq.onsuccess = () => {
                const users = usersReq.result;
                if (!users || !Array.isArray(users) || users.length === 0) return;

                // 2. Check each user data
                let totalDue = 0;
                let checkedCount = 0;

                users.forEach(user => {
                    const userDataReq = store.get(`nizamy_hafalan_data_${user.id}`);
                    userDataReq.onsuccess = () => {
                        const userData = userDataReq.result;
                        if (userData && userData.items) {
                            const today = new Date().toISOString().split('T')[0];
                            const due = userData.items.filter(item => item.nextReviewDate <= today).length;
                            totalDue += due;
                        }
                        
                        checkedCount++;
                        // If all checked and we have due items
                        if (checkedCount === users.length && totalDue > 0) {
                            showBackgroundNotification(totalDue);
                        }
                    };
                });
            };
        };
    } catch (err) {
        console.log('Background sync error:', err);
    }
};

const showBackgroundNotification = (count) => {
    const title = 'Waktunya Murajaah! 📖';
    const options = {
        body: `Ada ${count} hafalan yang perlu diulang hari ini agar tidak lupa. Semangat!`,
        icon: '/images/logo_nizamy.png?v=6',
        badge: '/images/logo_nizamy.png?v=6',
        tag: 'nizamy-reminder',
        renotify: true,
        requireInteraction: true,
        data: { url: '/' }
    };
    self.registration.showNotification(title, options);
};

// Handle Periodic Sync Event
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'hafalan-reminder-sync') {
        event.waitUntil(checkHafalanInBackground());
    }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. API Al-Quran (Text): Cache First
  if (url.hostname.includes('api.alquran.cloud')) {
    event.respondWith(
      caches.open(QURAN_CACHE).then((cache) => {
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

  // 2. Audio Files: Cache First
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

  // 3. External UI Assets
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

  // 4. Navigation (HTML): Network First
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
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok) {
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

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle Notification Clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
