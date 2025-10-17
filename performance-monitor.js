/**
 * Performance Monitoring Script for GGUF Loader Website
 * Tracks Core Web Vitals, cache performance, and user experience metrics
 */

(function() {
    'use strict';

    // Performance monitoring configuration
    const PERFORMANCE_CONFIG = {
        enableCoreWebVitals: true,
        enableCacheMetrics: true,
        enableUserTiming: true,
        enableResourceTiming: true,
        reportingEndpoint: null, // Set to your analytics endpoint
        sampleRate: 1.0 // 100% sampling for development, reduce for production
    };

    // Core Web Vitals thresholds
    const THRESHOLDS = {
        LCP: { good: 2500, poor: 4000 },
        FID: { good: 100, poor: 300 },
        CLS: { good: 0.1, poor: 0.25 },
        FCP: { good: 1800, poor: 3000 },
        TTFB: { good: 800, poor: 1800 }
    };

    // Performance metrics storage
    let performanceMetrics = {
        coreWebVitals: {},
        cacheMetrics: {},
        resourceTiming: {},
        userTiming: {}
    };

    /**
     * Initialize performance monitoring
     */
    function initPerformanceMonitoring() {
        if (Math.random() > PERFORMANCE_CONFIG.sampleRate) {
            return; // Skip monitoring based on sample rate
        }

        // Wait for page load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startMonitoring);
        } else {
            startMonitoring();
        }
    }

    /**
     * Start all performance monitoring
     */
    function startMonitoring() {
        if (PERFORMANCE_CONFIG.enableCoreWebVitals) {
            monitorCoreWebVitals();
        }

        if (PERFORMANCE_CONFIG.enableCacheMetrics) {
            monitorCachePerformance();
        }

        if (PERFORMANCE_CONFIG.enableResourceTiming) {
            monitorResourceTiming();
        }

        if (PERFORMANCE_CONFIG.enableUserTiming) {
            monitorUserTiming();
        }

        // Report metrics after page load
        window.addEventListener('load', () => {
            setTimeout(reportMetrics, 1000);
        });

        // Report metrics before page unload
        window.addEventListener('beforeunload', reportMetrics);
    }

    /**
     * Monitor Core Web Vitals
     */
    function monitorCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    
                    performanceMetrics.coreWebVitals.LCP = {
                        value: lastEntry.startTime,
                        rating: getRating(lastEntry.startTime, THRESHOLDS.LCP),
                        element: lastEntry.element ? lastEntry.element.tagName : null
                    };
                });
                
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('LCP monitoring not supported:', e);
            }

            // First Input Delay (FID)
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry) => {
                        performanceMetrics.coreWebVitals.FID = {
                            value: entry.processingStart - entry.startTime,
                            rating: getRating(entry.processingStart - entry.startTime, THRESHOLDS.FID),
                            eventType: entry.name
                        };
                    });
                });
                
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.warn('FID monitoring not supported:', e);
            }

            // Cumulative Layout Shift (CLS)
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry) => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    });
                    
                    performanceMetrics.coreWebVitals.CLS = {
                        value: clsValue,
                        rating: getRating(clsValue, THRESHOLDS.CLS)
                    };
                });
                
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.warn('CLS monitoring not supported:', e);
            }
        }

        // First Contentful Paint (FCP) and Time to First Byte (TTFB)
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            
            if (navigation) {
                // TTFB
                const ttfb = navigation.responseStart - navigation.fetchStart;
                performanceMetrics.coreWebVitals.TTFB = {
                    value: ttfb,
                    rating: getRating(ttfb, THRESHOLDS.TTFB)
                };
            }

            // FCP
            const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
            if (fcpEntry) {
                performanceMetrics.coreWebVitals.FCP = {
                    value: fcpEntry.startTime,
                    rating: getRating(fcpEntry.startTime, THRESHOLDS.FCP)
                };
            }
        });
    }

    /**
     * Monitor cache performance
     */
    function monitorCachePerformance() {
        if ('serviceWorker' in navigator) {
            // Monitor service worker cache hits/misses
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'CACHE_PERFORMANCE') {
                    performanceMetrics.cacheMetrics = {
                        ...performanceMetrics.cacheMetrics,
                        ...event.data.metrics
                    };
                }
            });
        }

        // Monitor resource cache status
        window.addEventListener('load', () => {
            const resources = performance.getEntriesByType('resource');
            let cacheHits = 0;
            let cacheMisses = 0;

            resources.forEach((resource) => {
                // Check if resource was served from cache
                if (resource.transferSize === 0 && resource.decodedBodySize > 0) {
                    cacheHits++;
                } else {
                    cacheMisses++;
                }
            });

            performanceMetrics.cacheMetrics.resourceCache = {
                hits: cacheHits,
                misses: cacheMisses,
                hitRate: cacheHits / (cacheHits + cacheMisses)
            };
        });
    }

    /**
     * Monitor resource timing
     */
    function monitorResourceTiming() {
        window.addEventListener('load', () => {
            const resources = performance.getEntriesByType('resource');
            const resourceMetrics = {
                css: [],
                js: [],
                images: [],
                fonts: [],
                other: []
            };

            resources.forEach((resource) => {
                const url = new URL(resource.name);
                const extension = url.pathname.split('.').pop().toLowerCase();
                
                const timing = {
                    name: resource.name,
                    duration: resource.duration,
                    transferSize: resource.transferSize,
                    decodedBodySize: resource.decodedBodySize,
                    cached: resource.transferSize === 0 && resource.decodedBodySize > 0
                };

                if (['css'].includes(extension)) {
                    resourceMetrics.css.push(timing);
                } else if (['js'].includes(extension)) {
                    resourceMetrics.js.push(timing);
                } else if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg'].includes(extension)) {
                    resourceMetrics.images.push(timing);
                } else if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(extension)) {
                    resourceMetrics.fonts.push(timing);
                } else {
                    resourceMetrics.other.push(timing);
                }
            });

            performanceMetrics.resourceTiming = resourceMetrics;
        });
    }

    /**
     * Monitor user timing marks and measures
     */
    function monitorUserTiming() {
        // Add custom timing marks
        performance.mark('gguf-loader-start');
        
        window.addEventListener('load', () => {
            performance.mark('gguf-loader-loaded');
            performance.measure('gguf-loader-total', 'gguf-loader-start', 'gguf-loader-loaded');
            
            const measures = performance.getEntriesByType('measure');
            performanceMetrics.userTiming = measures.map(measure => ({
                name: measure.name,
                duration: measure.duration,
                startTime: measure.startTime
            }));
        });
    }

    /**
     * Get performance rating (good, needs-improvement, poor)
     */
    function getRating(value, thresholds) {
        if (value <= thresholds.good) return 'good';
        if (value <= thresholds.poor) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Report performance metrics
     */
    function reportMetrics() {
        // Add page info
        const pageInfo = {
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown'
        };

        const report = {
            ...performanceMetrics,
            pageInfo
        };

        // Console logging for development
        console.group('🚀 GGUF Loader Performance Report');
        console.log('Core Web Vitals:', performanceMetrics.coreWebVitals);
        console.log('Cache Metrics:', performanceMetrics.cacheMetrics);
        console.log('Resource Timing:', performanceMetrics.resourceTiming);
        console.log('User Timing:', performanceMetrics.userTiming);
        console.groupEnd();

        // Send to analytics endpoint if configured
        if (PERFORMANCE_CONFIG.reportingEndpoint) {
            sendToAnalytics(report);
        }

        // Send to Google Analytics if available
        if (typeof gtag !== 'undefined') {
            sendToGoogleAnalytics(performanceMetrics.coreWebVitals);
        }
    }

    /**
     * Send metrics to analytics endpoint
     */
    function sendToAnalytics(report) {
        try {
            fetch(PERFORMANCE_CONFIG.reportingEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(report)
            }).catch(error => {
                console.warn('Failed to send performance metrics:', error);
            });
        } catch (error) {
            console.warn('Analytics reporting failed:', error);
        }
    }

    /**
     * Send Core Web Vitals to Google Analytics
     */
    function sendToGoogleAnalytics(vitals) {
        Object.entries(vitals).forEach(([metric, data]) => {
            if (data && data.value !== undefined) {
                gtag('event', metric, {
                    event_category: 'Web Vitals',
                    value: Math.round(data.value),
                    metric_rating: data.rating,
                    custom_parameter_1: data.element || data.eventType || 'unknown'
                });
            }
        });
    }

    /**
     * Expose performance API for manual tracking
     */
    window.GGUFPerformance = {
        mark: (name) => performance.mark(name),
        measure: (name, start, end) => performance.measure(name, start, end),
        getMetrics: () => performanceMetrics,
        reportNow: reportMetrics
    };

    // Initialize monitoring
    initPerformanceMonitoring();

})();