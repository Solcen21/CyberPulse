const CACHE_NAME = 'cyberpulse-v12';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './main.js',
    './icon-192.png',
    './icon-512.png',
    './manifest.json'
];

// Install Event: Cache core assets
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching all: app shell and content');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Fetch Event: Network first for core assets, bypass for external APIs
self.addEventListener('fetch', (event) => {
    // Only handle GET requests and local/same-origin HTTP/HTTPS schemes
    if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
        return;
    }

    const url = new URL(event.request.url);
    const isCoreAsset = [
        '/index.html', '/style.css', '/main.js', '/sw.js',
        '/manifest.json', '/icon-192.png', '/icon-512.png', '/'
    ].some(p => url.pathname === p || url.pathname.endsWith(p));

    if (isCoreAsset) {
        event.respondWith(
            fetch(event.request)
                .then(res => {
                    if (res.status === 200) {
                        const clone = res.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return res;
                })
                .catch(() => caches.match(event.request))
        );
    }
});

// Activate Event: Cleanup old caches and claim clients immediately
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        }).then(() => self.clients.claim())
    );
});
