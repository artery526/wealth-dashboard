const CACHE_NAME = 'empire-shell-v17';

// Keep the first offline-capable version deliberately small. The dashboard
// already owns API caching in index.html; this cache is for the page shell.
const PRECACHE_URLS = [
  './',
  './index.html',
  './war-room.html',
  './war-room.css?v=20261003.1',
  './war-room-app.js?v=20261003.1',
  './manifest.json',
  './junshifu-map.png?v=20260910-bg4',
  './mobileBG.png?v=20260906-mobile1',
  './characterAnimations.js?v=20260908-web22',
  './AnimatedCharacter.js?v=20260918-web4',
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

  // Return the network response as soon as its headers arrive. Cache its body
  // in parallel so a slow download never makes a successful navigation serve
  // an older shell; use the cache only when the network request fails.
  if (request.mode === 'navigate') {
    const cachePath = url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname;
    const cacheUrl = new URL(cachePath, url.origin);
    cacheUrl.search = '';
    const cacheKey = new Request(cacheUrl.toString(), { method: 'GET' });
    const networkResponse = fetch(new Request(request, {cache: 'no-store'})).catch(() => null);
    const cacheUpdate = networkResponse.then(async response => {
      if (!response || !response.ok) return false;
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(cacheKey, response.clone());
        return true;
      } catch {
        return false;
      }
    });
    event.waitUntil(cacheUpdate);

    const cachedResponse = caches.match(request)
      .then(cached => cached || caches.match(cacheKey) || (url.pathname.endsWith('/war-room.html') ? null : caches.match('./index.html')))
      .catch(() => null);
    event.respondWith(networkResponse.then(response => {
      if (response) return response;
      return cachedResponse.then(cached => cached || Response.error());
    }));
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
