// Generate a unique cache name based on service worker timestamp
const CACHE_BASE = 'le-royaume-connect';
const CACHE_VERSION = Date.now(); // Use current timestamp for auto-update
const CACHE_NAME = `${CACHE_BASE}-${CACHE_VERSION}`;
const urlsToCache = [
  '/offline.html',
];

const shouldUseNetworkFirst = (request) => {
  const url = new URL(request.url);
  return (
    request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname === '/version.txt' ||
    url.pathname === '/service-worker.js'
  );
};

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(err => {
        console.log('Cache.addAll error:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete caches that don't match current version or base name
          if (cacheName.startsWith(CACHE_BASE) && cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  if (shouldUseNetworkFirst(event.request)) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((response) => response)
        .catch(() => caches.match(event.request).then((response) => response || caches.match('/offline.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => caches.match('/offline.html'));
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    // Clear all caches when requested by client
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith(CACHE_BASE)) {
            console.log('Clearing cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    });
  }
});
