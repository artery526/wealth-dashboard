const CACHE_NAME = 'empire-shell-v7';

// Keep the first offline-capable version deliberately small. The dashboard
// already owns API caching in index.html; this cache is for the page shell.
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './junshifu-map.png?v=20260910-bg4',
  './mobileBG.png?v=20260906-mobile1',
  './characterAnimations.js?v=20260908-web22',
  './AnimatedCharacter.js?v=20260908-web3',
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

  // Always request the deployed HTML first. A cached shell must not hide a
  // newly published dashboard on mobile browsers.
  if (request.mode === 'navigate') {
    const refresh = fetch(new Request(request, {cache: 'no-store'})).then(networkResponse => {
      if (networkResponse && networkResponse.ok) {
        const responseCopy = networkResponse.clone();
        return caches.open(CACHE_NAME).then(cache => cache.put('./index.html', responseCopy)).then(() => networkResponse);
      }
      return networkResponse;
    }).catch(() => null);
    event.respondWith(refresh.then(networkResponse => networkResponse || caches.match(request).then(cached => cached || caches.match('./index.html'))));
    return;
  }

  // JavaScript and CSS define the rendered dashboard. Prefer the deployed
  // asset on every load so a same-URL release cannot remain stale in the
  // service-worker cache; use the cached copy only when offline.
  if (/\.(js|css)(\?|$)/i.test(url.pathname)) {
    event.respondWith(
      fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.ok) {
          const responseCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseCopy));
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
