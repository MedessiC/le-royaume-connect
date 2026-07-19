// KILL SWITCH — this replaces the previous caching service worker.
// Goal: every client currently running the old SW gets it cleared out,
// all caches wiped, and every open tab force-reloaded from the network.
// Once you're confident every visitor has picked this up (a few days to
// a couple weeks depending on traffic), you can remove the SW entirely
// (this file + the registration call in your app).

self.addEventListener('install', () => {
  // Activate immediately, don't wait for old tabs to close
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Delete every cache this origin owns, not just our old CACHE_BASE
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      // Take control of any open tabs immediately
      await self.clients.claim();

      // Force every open tab to reload from network, then tell it to
      // drop this SW entirely so it stops intercepting fetches
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));

      // Unregister — after this, the browser stops using this SW for
      // new requests once the current clients release it
      await self.registration.unregister();
    })()
  );
});

// While this SW is still transitioning out, never intercept fetches —
// let everything hit the network directly, no cache reads or writes.
self.addEventListener('fetch', () => {
  // Intentionally not calling event.respondWith(): falls through to
  // normal browser network handling.
});