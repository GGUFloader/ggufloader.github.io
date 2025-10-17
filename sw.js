/**
 * Service Worker for GGUF Loader Website
 * Provides caching, offline functionality, and performance optimization
 */

const CACHE_NAME = 'gguf-loader-v1.1.0';
const STATIC_CACHE_NAME = 'gguf-loader-static-v1.1.0';
const DYNAMIC_CACHE_NAME = 'gguf-loader-dynamic-v1.1.0';
const FONT_CACHE_NAME = 'gguf-loader-fonts-v1.1.0';

// Files to cache immediately (critical resources)
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.min.css',
    '/styles.css',
    '/floating-buttons.min.js',
    '/floating-buttons.js',
    '/critical.css',
    '/preview.png',
    '/manifest.json'
];

// Files to cache on first visit (non-critical resources)
const DYNAMIC_ASSETS = [
    '/docs/installation/',
    '/docs/quick-start/',
    '/docs/addon-development/',
    '/docs/addon-api/',
    '/docs/smart-floater-example/',
    '/docs/package-structure/'
];

// Cache strategies for different resource types
const CACHE_STRATEGIES = {
    // HTML pages: Network first, cache fallback
    html: 'networkFirst',
    // CSS/JS: Cache first, network fallback
    static: 'cacheFirst',
    // Images: Cache first, network fallback
    images: 'cacheFirst',
    // Fonts: Cache first, network fallback
    fonts: 'cacheFirst',
    // API calls: Network first, cache fallback
    api: 'networkFirst',
    // External resources: Network only
    external: 'networkOnly'
};

// Cache duration settings (in seconds)
const CACHE_DURATION = {
    static: 31536000, // 1 year for static assets (CSS, JS)
    fonts: 31536000,  // 1 year for fonts
    dynamic: 86400,   // 1 day for dynamic content
    images: 604800,   // 1 week for images
    html: 3600,       // 1 hour for HTML pages
    manifest: 86400   // 1 day for manifest and service worker updates
};

/**
 * Service Worker Installation
 */
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(STATIC_CACHE_NAME).then(cache => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            }),
            
            // Skip waiting to activate immediately
            self.skipWaiting()
        ])
    );
});

/**
 * Service Worker Activation
 */
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            cleanupOldCaches(),
            
            // Claim all clients
            self.clients.claim()
        ])
    );
});

/**
 * Fetch Event Handler
 */
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external requests (except for specific allowed domains)
    if (!isAllowedOrigin(url.origin)) {
        return;
    }
    
    // Determine cache strategy based on request type
    const strategy = getCacheStrategy(request);
    
    event.respondWith(
        handleRequest(request, strategy)
    );
});

/**
 * Background Sync for offline actions
 */
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(handleBackgroundSync());
    }
});

/**
 * Push notification handler (disabled)
 */
// Push notifications disabled to avoid permission prompts
// self.addEventListener('push', event => {
//     // Notification functionality disabled
// });

/**
 * Handle different caching strategies
 */
async function handleRequest(request, strategy) {
    switch (strategy) {
        case 'cacheFirst':
            return cacheFirst(request);
        case 'networkFirst':
            return networkFirst(request);
        case 'staleWhileRevalidate':
            return staleWhileRevalidate(request);
        case 'networkOnly':
            return fetch(request);
        case 'cacheOnly':
            return caches.match(request);
        default:
            return networkFirst(request);
    }
}

/**
 * Cache First Strategy
 */
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            // Check if cache is still valid
            if (isCacheValid(cachedResponse, request)) {
                return cachedResponse;
            }
        }
        
        // Fetch from network and cache
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            await cacheResponse(request, networkResponse.clone());
        }
        return networkResponse;
        
    } catch (error) {
        console.log('Service Worker: Cache first failed, trying cache:', error);
        return caches.match(request) || createOfflineResponse(request);
    }
}

/**
 * Network First Strategy
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            await cacheResponse(request, networkResponse.clone());
        }
        return networkResponse;
        
    } catch (error) {
        console.log('Service Worker: Network first failed, trying cache:', error);
        const cachedResponse = await caches.match(request);
        return cachedResponse || createOfflineResponse(request);
    }
}

/**
 * Stale While Revalidate Strategy
 */
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    // Fetch from network in background
    const networkResponsePromise = fetch(request).then(response => {
        if (response.ok) {
            cacheResponse(request, response.clone());
        }
        return response;
    }).catch(() => null);
    
    // Return cached response immediately if available
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Otherwise wait for network response
    return networkResponsePromise || createOfflineResponse(request);
}

/**
 * Cache response with appropriate cache name
 */
async function cacheResponse(request, response) {
    const cacheName = getCacheName(request);
    const cache = await caches.open(cacheName);
    
    // Add cache headers
    const responseWithHeaders = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
            ...response.headers,
            'sw-cache-time': Date.now(),
            'cache-control': getCacheControl(request)
        }
    });
    
    return cache.put(request, responseWithHeaders);
}

/**
 * Determine cache strategy based on request
 */
function getCacheStrategy(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const extension = pathname.split('.').pop().toLowerCase();
    
    // HTML pages
    if (pathname.endsWith('/') || extension === 'html') {
        return CACHE_STRATEGIES.html;
    }
    
    // Static assets (CSS, JS)
    if (['css', 'js'].includes(extension)) {
        return CACHE_STRATEGIES.static;
    }
    
    // Images
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg'].includes(extension)) {
        return CACHE_STRATEGIES.images;
    }
    
    // Fonts
    if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(extension)) {
        return CACHE_STRATEGIES.fonts;
    }
    
    // API calls
    if (pathname.startsWith('/api/')) {
        return CACHE_STRATEGIES.api;
    }
    
    // Default to network first
    return CACHE_STRATEGIES.html;
}

/**
 * Get appropriate cache name for request
 */
function getCacheName(request) {
    const url = new URL(request.url);
    const extension = url.pathname.split('.').pop().toLowerCase();
    
    if (['css', 'js'].includes(extension)) {
        return STATIC_CACHE_NAME;
    }
    
    if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(extension)) {
        return FONT_CACHE_NAME;
    }
    
    return DYNAMIC_CACHE_NAME;
}

/**
 * Get cache control header for request
 */
function getCacheControl(request) {
    const url = new URL(request.url);
    const extension = url.pathname.split('.').pop().toLowerCase();
    
    if (['css', 'js'].includes(extension)) {
        return `public, max-age=${CACHE_DURATION.static}, immutable`;
    }
    
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'].includes(extension)) {
        return `public, max-age=${CACHE_DURATION.images}`;
    }
    
    if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(extension)) {
        return `public, max-age=${CACHE_DURATION.fonts}, immutable`;
    }
    
    if (url.pathname.endsWith('/') || extension === 'html') {
        return `public, max-age=${CACHE_DURATION.html}`;
    }
    
    return `public, max-age=${CACHE_DURATION.dynamic}`;
}

/**
 * Check if cached response is still valid
 */
function isCacheValid(response, request) {
    const cacheTime = response.headers.get('sw-cache-time');
    if (!cacheTime) return true; // No timestamp, assume valid
    
    const age = Date.now() - parseInt(cacheTime);
    const maxAge = getCacheMaxAge(request);
    
    return age < maxAge * 1000; // Convert to milliseconds
}

/**
 * Get cache max age for request type
 */
function getCacheMaxAge(request) {
    const url = new URL(request.url);
    const extension = url.pathname.split('.').pop().toLowerCase();
    
    if (['css', 'js'].includes(extension)) {
        return CACHE_DURATION.static;
    }
    
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'].includes(extension)) {
        return CACHE_DURATION.images;
    }
    
    if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(extension)) {
        return CACHE_DURATION.fonts;
    }
    
    if (url.pathname.endsWith('/') || extension === 'html') {
        return CACHE_DURATION.html;
    }
    
    return CACHE_DURATION.dynamic;
}

/**
 * Check if origin is allowed for caching
 */
function isAllowedOrigin(origin) {
    const allowedOrigins = [
        'https://ggufloader.github.io',
        'http://localhost:4000',
        'http://127.0.0.1:4000',
        self.location.origin
    ];
    
    return allowedOrigins.includes(origin);
}

/**
 * Clean up old caches
 */
async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const currentCaches = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, FONT_CACHE_NAME];
    
    return Promise.all(
        cacheNames
            .filter(cacheName => !currentCaches.includes(cacheName))
            .map(cacheName => {
                console.log('Service Worker: Deleting old cache:', cacheName);
                return caches.delete(cacheName);
            })
    );
}

/**
 * Create offline response for failed requests
 */
function createOfflineResponse(request) {
    const url = new URL(request.url);
    
    // For HTML pages, return offline page
    if (url.pathname.endsWith('/') || url.pathname.endsWith('.html')) {
        return new Response(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Offline - GGUF Loader</title>
                <style>
                    body { 
                        font-family: 'Segoe UI', sans-serif; 
                        text-align: center; 
                        padding: 2rem; 
                        background: #f8f9fa; 
                    }
                    .offline-container { 
                        max-width: 600px; 
                        margin: 0 auto; 
                        background: white; 
                        padding: 2rem; 
                        border-radius: 8px; 
                        box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
                    }
                    h1 { color: #2c3e50; }
                    p { color: #6c757d; line-height: 1.6; }
                    .retry-btn { 
                        background: #3498db; 
                        color: white; 
                        padding: 1rem 2rem; 
                        border: none; 
                        border-radius: 5px; 
                        cursor: pointer; 
                        font-size: 1rem; 
                        margin-top: 1rem; 
                    }
                </style>
            </head>
            <body>
                <div class="offline-container">
                    <h1>🔌 You're Offline</h1>
                    <p>It looks like you're not connected to the internet. Some features may not be available.</p>
                    <p>GGUF Loader works offline too! You can still browse cached content and use downloaded models.</p>
                    <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
                </div>
            </body>
            </html>
        `, {
            status: 200,
            headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache'
            }
        });
    }
    
    // For other resources, return a generic offline response
    return new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable'
    });
}

/**
 * Handle background sync
 */
async function handleBackgroundSync() {
    // Implement background sync logic here
    console.log('Service Worker: Handling background sync');
    
    // Example: Sync offline actions when back online
    try {
        // Perform any queued actions
        await syncOfflineActions();
    } catch (error) {
        console.error('Service Worker: Background sync failed:', error);
    }
}

/**
 * Sync offline actions
 */
async function syncOfflineActions() {
    // Implement offline action synchronization
    // This could include form submissions, analytics events, etc.
    console.log('Service Worker: Syncing offline actions');
}

/**
 * Report cache performance metrics to main thread
 */
function reportCachePerformance() {
    caches.keys().then(cacheNames => {
        const cacheMetrics = {
            cacheCount: cacheNames.length,
            cacheNames: cacheNames,
            timestamp: Date.now()
        };
        
        // Send metrics to main thread
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'CACHE_PERFORMANCE',
                    metrics: cacheMetrics
                });
            });
        });
    });
}

/**
 * Preload critical resources
 */
async function preloadCriticalResources() {
    const cache = await caches.open(STATIC_CACHE_NAME);
    
    // Preload additional critical resources
    const criticalResources = [
        '/styles.css',
        '/floating-buttons.js'
    ];
    
    return Promise.all(
        criticalResources.map(async (url) => {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    await cache.put(url, response);
                }
            } catch (error) {
                console.log(`Service Worker: Failed to preload ${url}:`, error);
            }
        })
    );
}

// Preload critical resources after installation
self.addEventListener('install', event => {
    event.waitUntil(preloadCriticalResources());
});

// Report cache performance periodically
setInterval(reportCachePerformance, 300000); // Every 5 minutes

console.log('Service Worker: Loaded successfully');