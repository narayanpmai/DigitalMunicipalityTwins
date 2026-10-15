// Municipal Digital Twin & Citizen PWA Service Worker (v8 - modern ehr tabs update)
const CACHE_NAME = 'p5-citizen-pwa-v8';
const STATIC_ASSETS = [
  '/',
  '/pwa',
  '/badapatra',
  '/favicon.svg',
  '/manifest.json',
  '/gov-design-system.css',
  '/badapatra-data.json',
  '/panchpokhari-logo.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('SW pre-cache non-critical notice:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Cache-First for static assets & badapatra-data.json, Network-First for dynamic APIs
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  // 1. Offline Badapatra JSON & Local Assets: Stale-While-Revalidate
  if (url.pathname.includes('badapatra-data.json') || url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 2. Navigation / Page requests: Network first falling back to cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          url.origin === self.location.origin &&
          (url.pathname.endsWith('.js') ||
            url.pathname.endsWith('.css') ||
            url.pathname.endsWith('.svg') ||
            url.pathname.endsWith('.png') ||
            url.pathname.endsWith('.woff2'))
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('/pwa') || caches.match('/');
          }
        });
      })
  );
});

// 3. Web Push Notification Listener
self.addEventListener('push', (event) => {
  let payload = {
    title: 'पाँचपोखरी थाङपाल गाउँपालिका',
    body: 'नयाँ सार्वजनिक सूचना वा आपतकालीन पूर्वसूचना प्राप्त भएको छ।',
    url: '/pwa?tab=notifications'
  };

  try {
    if (event.data) {
      payload = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [300, 100, 300, 100, 300],
    data: { url: payload.url || '/pwa' },
    actions: [
      { action: 'open', title: '📱 एपमा हेर्नुहोस्' },
      { action: 'dismiss', title: 'बन्द गर्नुहोस्' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// 4. Notification Click Action
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/pwa';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
