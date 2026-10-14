/* Service worker: makes repeat visits and tool switches fast.
 *  - /assets/* files have a content hash in their name, so they never change: cache-first.
 *  - Pages (HTML) are network-first so a new deploy is always picked up; the cached copy is only a fallback
 *    when the visitor is offline.
 * To switch it off, delete this file and the registration block at the bottom of src/main.tsx. */
const CACHE = 'five-letter-words-v1';
const MAX_ASSETS = 60;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key !== CACHE) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

async function trim(cache) {
  const keys = (await cache.keys()).filter((r) => r.url.includes('/assets/'));
  for (const r of keys.slice(0, Math.max(0, keys.length - MAX_ASSETS))) await cache.delete(r);
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok && res.type === 'basic') {
    await cache.put(request, res.clone());
    trim(cache);
  }
  return res;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request);
    if (res.ok && res.type === 'basic') cache.put(request, res.clone());
    return res;
  } catch (err) {
    const scope = new URL(self.registration.scope).pathname;
    return (await cache.match(request)) || (await cache.match(scope)) || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const scope = new URL(self.registration.scope).pathname;
  if (url.pathname.startsWith(scope + 'assets/')) {
    event.respondWith(cacheFirst(request));
  } else if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
  }
});
