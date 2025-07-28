/**
 * Test script to verify cache headers are working correctly
 * Run this in the browser console to test caching implementation
 */

(function() {
    'use strict';

    console.log('🧪 Testing GGUF Loader Cache Headers Implementation');

    // Test different resource types
    const testResources = [
        { url: '/styles.css', type: 'CSS', expectedMaxAge: 31536000 },
        { url: '/floating-buttons.js', type: 'JavaScript', expectedMaxAge: 31536000 },
        { url: '/preview.png', type: 'Image', expectedMaxAge: 604800 },
        { url: '/manifest.json', type: 'Manifest', expectedMaxAge: 86400 },
        { url: '/', type: 'HTML', expectedMaxAge: 3600 }
    ];

    async function testCacheHeaders() {
        console.group('📋 Cache Headers Test Results');

        for (const resource of testResources) {
            try {
                const response = await fetch(resource.url, { method: 'HEAD' });
                const cacheControl = response.headers.get('cache-control');
                const expires = response.headers.get('expires');
                const etag = response.headers.get('etag');
                const lastModified = response.headers.get('last-modified');

                console.group(`${resource.type}: ${resource.url}`);
                console.log('✅ Status:', response.status);
                console.log('📦 Cache-Control:', cacheControl || 'Not set');
                console.log('⏰ Expires:', expires || 'Not set');
                console.log('🏷️ ETag:', etag || 'Not set');
                console.log('📅 Last-Modified:', lastModified || 'Not set');

                // Check if cache control matches expected
                if (cacheControl) {
                    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
                    if (maxAgeMatch) {
                        const maxAge = parseInt(maxAgeMatch[1]);
                        const expected = resource.expectedMaxAge;
                        if (maxAge === expected) {
                            console.log('✅ Max-Age correct:', maxAge);
                        } else {
                            console.warn('⚠️ Max-Age mismatch. Expected:', expected, 'Got:', maxAge);
                        }
                    }
                }

                console.groupEnd();
            } catch (error) {
                console.error(`❌ Failed to test ${resource.url}:`, error);
            }
        }

        console.groupEnd();
    }

    function testServiceWorkerCache() {
        if ('serviceWorker' in navigator && 'caches' in window) {
            console.group('🔧 Service Worker Cache Test');

            caches.keys().then(cacheNames => {
                console.log('📦 Available caches:', cacheNames);

                cacheNames.forEach(cacheName => {
                    caches.open(cacheName).then(cache => {
                        cache.keys().then(requests => {
                            console.log(`📁 Cache "${cacheName}" contains ${requests.length} items:`);
                            requests.slice(0, 5).forEach(request => {
                                console.log('  -', request.url);
                            });
                            if (requests.length > 5) {
                                console.log(`  ... and ${requests.length - 5} more items`);
                            }
                        });
                    });
                });
            });

            console.groupEnd();
        } else {
            console.warn('⚠️ Service Worker or Cache API not supported');
        }
    }

    function testPerformanceMetrics() {
        console.group('📊 Performance Metrics Test');

        // Test Core Web Vitals if available
        if (window.GGUFPerformance) {
            const metrics = window.GGUFPerformance.getMetrics();
            console.log('📈 Current performance metrics:', metrics);
        } else {
            console.warn('⚠️ Performance monitoring not loaded yet');
        }

        // Test resource timing
        const resources = performance.getEntriesByType('resource');
        const cachedResources = resources.filter(r => r.transferSize === 0 && r.decodedBodySize > 0);
        const cacheHitRate = cachedResources.length / resources.length;

        console.log('📊 Resource cache statistics:');
        console.log('  Total resources:', resources.length);
        console.log('  Cached resources:', cachedResources.length);
        console.log('  Cache hit rate:', (cacheHitRate * 100).toFixed(1) + '%');

        console.groupEnd();
    }

    function testFontLoading() {
        console.group('🔤 Font Loading Test');

        // Check if fonts are loaded
        if (document.fonts) {
            console.log('📝 Font loading status:', document.fonts.status);
            console.log('📚 Loaded fonts:', document.fonts.size);

            document.fonts.forEach(font => {
                console.log('  -', font.family, font.weight, font.style, font.status);
            });

            // Test font-display: swap
            const computedStyle = getComputedStyle(document.body);
            console.log('🎨 Body font-family:', computedStyle.fontFamily);
        } else {
            console.warn('⚠️ Font Loading API not supported');
        }

        console.groupEnd();
    }

    // Run all tests
    async function runAllTests() {
        console.log('🚀 Starting cache implementation tests...\n');

        await testCacheHeaders();
        testServiceWorkerCache();
        testPerformanceMetrics();
        testFontLoading();

        console.log('\n✅ Cache implementation tests completed!');
        console.log('💡 Check the console output above for detailed results.');
    }

    // Export test functions to global scope
    window.testCacheImplementation = {
        runAll: runAllTests,
        headers: testCacheHeaders,
        serviceWorker: testServiceWorkerCache,
        performance: testPerformanceMetrics,
        fonts: testFontLoading
    };

    // Auto-run tests if this script is loaded directly
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(runAllTests, 2000); // Wait 2 seconds for everything to load
        });
    } else {
        setTimeout(runAllTests, 2000);
    }

})();