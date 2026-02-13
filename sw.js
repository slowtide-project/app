// =========================================================================
// Service Worker for Slowtide PWA
// =========================================================================

const CACHE_NAME = 'slowtide-v3';
const STATIC_ASSETS = [
    './',
    './index.html',
    './css/styles.css',
    './assets/icon.png',
    './js/app.js',
    './js/config.js',
    './js/state.js',
    './js/audio.js',
    './js/systems.js',
    './js/storage.js',
    './js/utils.js',
    './js/admin.js',
    './js/analytics.js',
    './js/modes/activities.js',
    './js/modes/story.js',
    './js/views/activities/particles.js',
    './js/views/activities/sorting.js',
    './js/views/activities/bubbles.js',
    './js/views/activities/liquid.js',
    './js/views/activities/marbles.js',
    './js/views/story/forest.js',
    './js/views/story/beach.js',
    './js/views/story/meadow.js',
    './js/views/story/night.js',
    './js/views/story/lake.js'
];

// Install event - cache all static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Only handle HTTP/HTTPS requests
    if (!event.request.url.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version if found
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                // Try to fetch from network
                return fetch(fetchRequest)
                    .then((response) => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache successful responses (only for HTTP/HTTPS requests)
                        if (event.request.url.startsWith('http')) {
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                        }

                        return response;
                    })
                    .catch(() => {
                        // If network fails, try to serve cached index.html for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});