const CACHE_NAME = 'empire-shell-v4';

// Keep the first offline-capable version deliberately small. The dashboard
// already owns API caching in index.html; this cache is for the page shell.
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './advisor-zhuge.png',
  './pangtong.png',
  './bg-inkwash.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys
        .filter(key => key.startsWith('empire-shell-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache API responses, write/read tokens, or cross-origin data here.
  if (url.origin !== self.location.origin || url.pathname.includes('/api/')) {
    return;
  }

  // Large media remains on normal browser HTTP caching and is not precached.
  if (/\.(mp4|webm|mov|mp3|wav)(\?|$)/i.test(url.pathname)) {
    return;
  }

  // Navigation must prefer the deployed HTML. A stale cached index can hide a
  // newly published layout on phones until the service worker refreshes it.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.ok) {
          const responseCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', responseCopy));
        }
        return networkResponse;
      }).catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then(networkResponse => {
        if (!networkResponse || !networkResponse.ok) return networkResponse;

        const responseCopy = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, responseCopy));
        return networkResponse;
      });
    })
  );
});
