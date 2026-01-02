/**
 * Mobile Performance Optimizer
 * Optimizes loading times, implements lazy loading, and creates efficient caching
 * strategies for mobile cross-page navigation and content previews
 */

class MobilePerformanceOptimizer {
    constructor() {
        this.isInitialized = false;
        this.isMobile = window.innerWidth <= 768;
        this.performanceMetrics = new Map();
        this.resourceCache = new Map();
        this.lazyLoadObserver = null;
        this.prefetchQueue = [];
        this.isOnline = navigator.onLine;
        
        // Performance configuration
        this.config = {
            enableLazyLoading: true,
            enablePrefetching: true,
            enableResourceCaching: true,
            enableImageOptimization: true,
            cacheExpiry: 10 * 60 * 1000, // 10 minutes
            prefetchDelay: 2000, // 2 seconds
            intersectionThreshold: 0.1,
            maxCacheSize: 50, // Maximum cached resources
            compressionThreshold: 1024, // Compress responses larger than 1KB
            performanceMonitoring: true
        };
        
        // Performance thresholds
        this.thresholds = {
            loadTime: 3000, // 3 seconds
            renderTime: 1000, // 1 second
            interactionTime: 100, // 100ms
            memoryUsage: 50 * 1024 * 1024 // 50MB
        };
    }

    /**
     * Initialize mobile performance optimizer
     */
    async initialize() {
        if (this.isInitialized || !this.isMobile) return;
        
        try {
            this.setupPerformanceMonitoring();
            this.initializeLazyLoading();
            this.setupResourceCaching();
            this.initializePrefetching();
            this.optimizeImages();
            this.setupNetworkOptimization();
            this.setupMemoryManagement();
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('Mobile Performance Optimizer initialized');
            
            // Log initial performance metrics
            this.logPerformanceMetrics();
            
        } catch (error) {
            console.error('Failed to initialize Mobile Performance Optimizer:', error);
        }
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        if (!this.config.performanceMonitoring) return;
        
        // Monitor page load performance
        window.addEventListener('load', () => {
            this.measurePageLoadPerformance();
        });
        
        // Monitor navigation performance
        this.setupNavigationTiming();
        
        // Monitor resource loading
        this.setupResourceTiming();
        
        // Monitor memory usage
        this.setupMemoryMonitoring();
        
        // Monitor user interactions
        this.setupInteractionTiming();
    }

    /**
     * Measure page load performance
     */
    measurePageLoadPerformance() {
        if (!performance || !performance.timing) return;
        
        const timing = performance.timing;
        const metrics = {
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            loadComplete: timing.loadEventEnd - timing.navigationStart,
            domReady: timing.domComplete - timing.domLoading,
            firstPaint: this.getFirstPaintTime(),
            firstContentfulPaint: this.getFirstContentfulPaintTime()
        };
        
        this.performanceMetrics.set('pageLoad', {
            ...metrics,
            timestamp: Date.now(),
            url: window.location.pathname
        });
        
        // Check if performance is within thresholds
        if (metrics.loadComplete > this.thresholds.loadTime) {
            console.warn(`Page load time (${metrics.loadComplete}ms) exceeds threshold (${this.thresholds.loadTime}ms)`);
            this.optimizeForSlowLoading();
        }
    }

    /**
     * Get First Paint time
     */
    getFirstPaintTime() {
        if (!performance.getEntriesByType) return null;
        
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : null;
    }

    /**
     * Get First Contentful Paint time
     */
    getFirstContentfulPaintTime() {
        if (!performance.getEntriesByType) return null;
        
        const paintEntries = performance.getEntriesByType('paint');
        const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return firstContentfulPaint ? firstContentfulPaint.startTime : null;
    }

    /**
     * Setup navigation timing monitoring
     */
    setupNavigationTiming() {
        // Monitor navigation performance using Performance Observer
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.entryType === 'navigation') {
                        this.performanceMetrics.set('navigation', {
                            duration: entry.duration,
                            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                            loadEvent: entry.loadEventEnd - entry.loadEventStart,
                            timestamp: Date.now()
                        });
                    }
                });
            });
            
            try {
                observer.observe({ entryTypes: ['navigation'] });
            } catch (error) {
                console.warn('Navigation timing observer not supported:', error);
            }
        }
    }

    /**
     * Setup resource timing monitoring
     */
    setupResourceTiming() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.entryType === 'resource') {
                        // Track slow resources
                        if (entry.duration > 1000) { // Resources taking more than 1 second
                            console.warn(`Slow resource detected: ${entry.name} (${entry.duration}ms)`);
                            this.optimizeResource(entry);
                        }
                        
                        // Cache resource timing data
                        this.performanceMetrics.set(`resource_${entry.name}`, {
                            duration: entry.duration,
                            size: entry.transferSize,
                            cached: entry.transferSize === 0,
                            timestamp: Date.now()
                        });
                    }
                });
            });
            
            try {
                observer.observe({ entryTypes: ['resource'] });
            } catch (error) {
                console.warn('Resource timing observer not supported:', error);
            }
        }
    }

    /**
     * Setup memory monitoring
     */
    setupMemoryMonitoring() {
        if (!performance.memory) return;
        
        setInterval(() => {
            const memory = performance.memory;
            const memoryUsage = {
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                limit: memory.jsHeapSizeLimit,
                timestamp: Date.now()
            };
            
            this.performanceMetrics.set('memory', memoryUsage);
            
            // Check memory usage threshold
            if (memoryUsage.used > this.thresholds.memoryUsage) {
                console.warn(`Memory usage (${memoryUsage.used} bytes) exceeds threshold`);
                this.performMemoryCleanup();
            }
        }, 30000); // Check every 30 seconds
    }

    /**
     * Setup interaction timing
     */
    setupInteractionTiming() {
        ['click', 'touchstart', 'keydown'].forEach(eventType => {
            document.addEventListener(eventType, (event) => {
                const startTime = performance.now();
                
                requestAnimationFrame(() => {
                    const endTime = performance.now();
                    const duration = endTime - startTime;
                    
                    if (duration > this.thresholds.interactionTime) {
                        console.warn(`Slow interaction detected: ${eventType} (${duration}ms)`);
                    }
                    
                    this.performanceMetrics.set(`interaction_${eventType}`, {
                        duration,
                        timestamp: Date.now()
                    });
                });
            }, { passive: true });
        });
    }

    /**
     * Initialize lazy loading for content and images
     */
    initializeLazyLoading() {
        if (!this.config.enableLazyLoading || !window.IntersectionObserver) return;
        
        this.lazyLoadObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadLazyElement(entry.target);
                    this.lazyLoadObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: this.config.intersectionThreshold,
            rootMargin: '50px'
        });
        
        // Observe existing lazy elements
        this.observeLazyElements();
        
        // Setup mutation observer for dynamically added elements
        this.setupLazyLoadMutationObserver();
    }

    /**
     * Observe lazy elements
     */
    observeLazyElements() {
        // Lazy load images
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.lazyLoadObserver.observe(img);
        });
        
        // Lazy load content previews
        document.querySelectorAll('.content-preview[data-lazy]').forEach(preview => {
            this.lazyLoadObserver.observe(preview);
        });
        
        // Lazy load iframes
        document.querySelectorAll('iframe[data-src]').forEach(iframe => {
            this.lazyLoadObserver.observe(iframe);
        });
    }

    /**
     * Setup mutation observer for lazy loading
     */
    setupLazyLoadMutationObserver() {
        if (!window.MutationObserver) return;
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check for lazy images
                        if (node.tagName === 'IMG' && node.dataset.src) {
                            this.lazyLoadObserver.observe(node);
                        }
                        
                        // Check for lazy content
                        if (node.classList && node.classList.contains('content-preview') && node.dataset.lazy) {
                            this.lazyLoadObserver.observe(node);
                        }
                        
                        // Check for lazy elements within added nodes
                        node.querySelectorAll && node.querySelectorAll('img[data-src], .content-preview[data-lazy], iframe[data-src]').forEach(element => {
                            this.lazyLoadObserver.observe(element);
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Load lazy element
     */
    loadLazyElement(element) {
        const startTime = performance.now();
        
        if (element.tagName === 'IMG') {
            this.loadLazyImage(element);
        } else if (element.classList.contains('content-preview')) {
            this.loadLazyContent(element);
        } else if (element.tagName === 'IFRAME') {
            this.loadLazyIframe(element);
        }
        
        // Measure loading time
        const endTime = performance.now();
        this.performanceMetrics.set(`lazy_load_${element.tagName}`, {
            duration: endTime - startTime,
            timestamp: Date.now()
        });
    }

    /**
     * Load lazy image
     */
    loadLazyImage(img) {
        const src = img.dataset.src;
        if (!src) return;
        
        // Create a new image to preload
        const newImg = new Image();
        newImg.onload = () => {
            img.src = src;
            img.classList.add('lazy-loaded');
            img.removeAttribute('data-src');
        };
        newImg.onerror = () => {
            img.classList.add('lazy-error');
            console.warn(`Failed to load lazy image: ${src}`);
        };
        newImg.src = src;
    }

    /**
     * Load lazy content
     */
    loadLazyContent(element) {
        const contentId = element.dataset.contentId;
        if (!contentId) return;
        
        // Check cache first
        const cached = this.resourceCache.get(`content_${contentId}`);
        if (cached && Date.now() - cached.timestamp < this.config.cacheExpiry) {
            element.innerHTML = cached.content;
            element.classList.add('lazy-loaded');
            element.removeAttribute('data-lazy');
            return;
        }
        
        // Load content dynamically
        this.loadContentPreview(contentId).then(content => {
            element.innerHTML = content;
            element.classList.add('lazy-loaded');
            element.removeAttribute('data-lazy');
            
            // Cache the content
            this.resourceCache.set(`content_${contentId}`, {
                content,
                timestamp: Date.now()
            });
        }).catch(error => {
            element.classList.add('lazy-error');
            console.warn(`Failed to load lazy content: ${contentId}`, error);
        });
    }

    /**
     * Load lazy iframe
     */
    loadLazyIframe(iframe) {
        const src = iframe.dataset.src;
        if (!src) return;
        
        iframe.src = src;
        iframe.classList.add('lazy-loaded');
        iframe.removeAttribute('data-src');
    }

    /**
     * Setup resource caching
     */
    setupResourceCaching() {
        if (!this.config.enableResourceCaching) return;
        
        // Intercept fetch requests for caching
        this.setupFetchInterception();
        
        // Setup cache cleanup
        this.setupCacheCleanup();
    }

    /**
     * Setup fetch interception for caching
     */
    setupFetchInterception() {
        const originalFetch = window.fetch;
        
        window.fetch = async (url, options = {}) => {
            // Only cache GET requests
            if (options.method && options.method !== 'GET') {
                return originalFetch(url, options);
            }
            
            const cacheKey = `fetch_${url}`;
            const cached = this.resourceCache.get(cacheKey);
            
            // Return cached response if valid
            if (cached && Date.now() - cached.timestamp < this.config.cacheExpiry) {
                return new Response(cached.data, {
                    status: cached.status,
                    statusText: cached.statusText,
                    headers: cached.headers
                });
            }
            
            try {
                const response = await originalFetch(url, options);
                
                // Cache successful responses
                if (response.ok) {
                    const clonedResponse = response.clone();
                    const data = await clonedResponse.text();
                    
                    // Only cache if under compression threshold or if it compresses well
                    if (data.length < this.config.compressionThreshold || this.shouldCacheResponse(data)) {
                        this.resourceCache.set(cacheKey, {
                            data,
                            status: response.status,
                            statusText: response.statusText,
                            headers: Object.fromEntries(response.headers.entries()),
                            timestamp: Date.now()
                        });
                        
                        // Manage cache size
                        this.manageCacheSize();
                    }
                }
                
                return response;
            } catch (error) {
                console.warn(`Fetch failed for ${url}:`, error);
                throw error;
            }
        };
    }

    /**
     * Check if response should be cached
     */
    shouldCacheResponse(data) {
        // Simple compression ratio check
        const compressed = this.compressString(data);
        const compressionRatio = compressed.length / data.length;
        return compressionRatio < 0.7; // Cache if compresses to less than 70%
    }

    /**
     * Simple string compression simulation
     */
    compressString(str) {
        // This is a simplified compression check
        // In a real implementation, you might use actual compression
        return str.replace(/\s+/g, ' ').trim();
    }

    /**
     * Manage cache size
     */
    manageCacheSize() {
        if (this.resourceCache.size <= this.config.maxCacheSize) return;
        
        // Remove oldest entries
        const entries = Array.from(this.resourceCache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        const toRemove = entries.slice(0, entries.length - this.config.maxCacheSize);
        toRemove.forEach(([key]) => {
            this.resourceCache.delete(key);
        });
    }

    /**
     * Setup cache cleanup
     */
    setupCacheCleanup() {
        // Clean expired cache entries every 5 minutes
        setInterval(() => {
            const now = Date.now();
            const toDelete = [];
            
            this.resourceCache.forEach((value, key) => {
                if (now - value.timestamp > this.config.cacheExpiry) {
                    toDelete.push(key);
                }
            });
            
            toDelete.forEach(key => {
                this.resourceCache.delete(key);
            });
            
            if (toDelete.length > 0) {
                console.log(`Cleaned ${toDelete.length} expired cache entries`);
            }
        }, 5 * 60 * 1000);
    }

    /**
     * Initialize prefetching
     */
    initializePrefetching() {
        if (!this.config.enablePrefetching) return;
        
        // Prefetch on hover
        this.setupHoverPrefetching();
        
        // Prefetch based on user behavior
        this.setupBehaviorBasedPrefetching();
        
        // Prefetch critical resources
        this.prefetchCriticalResources();
    }

    /**
     * Setup hover prefetching
     */
    setupHoverPrefetching() {
        document.addEventListener('mouseenter', (event) => {
            const link = event.target.closest('a');
            if (link && this.shouldPrefetchLink(link)) {
                this.prefetchResource(link.href);
            }
        }, true);
        
        // Touch devices - prefetch on touch start
        document.addEventListener('touchstart', (event) => {
            const link = event.target.closest('a');
            if (link && this.shouldPrefetchLink(link)) {
                setTimeout(() => {
                    this.prefetchResource(link.href);
                }, 100); // Small delay to avoid unnecessary prefetching
            }
        }, { passive: true });
    }

    /**
     * Check if link should be prefetched
     */
    shouldPrefetchLink(link) {
        const href = link.getAttribute('href');
        
        // Skip external links, anchors, and already prefetched
        if (!href || 
            href.startsWith('#') || 
            href.startsWith('mailto:') || 
            href.startsWith('tel:') ||
            link.hostname !== window.location.hostname ||
            this.prefetchQueue.includes(href)) {
            return false;
        }
        
        return true;
    }

    /**
     * Prefetch resource
     */
    prefetchResource(url) {
        if (this.prefetchQueue.includes(url)) return;
        
        this.prefetchQueue.push(url);
        
        // Use link prefetch if supported
        if (document.createElement('link').relList.supports('prefetch')) {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
        } else {
            // Fallback to fetch prefetch
            fetch(url, { method: 'GET' }).catch(() => {
                // Ignore prefetch errors
            });
        }
    }

    /**
     * Setup behavior-based prefetching
     */
    setupBehaviorBasedPrefetching() {
        // Prefetch likely next pages based on current page
        setTimeout(() => {
            const currentPath = window.location.pathname;
            const nextPages = this.getPredictedNextPages(currentPath);
            
            nextPages.forEach(page => {
                this.prefetchResource(page);
            });
        }, this.config.prefetchDelay);
    }

    /**
     * Get predicted next pages
     */
    getPredictedNextPages(currentPath) {
        const predictions = [];
        
        if (currentPath === '/') {
            predictions.push('/docs/', '/docs/quick-start/', '/docs/installation/');
        } else if (currentPath.includes('/docs/installation/')) {
            predictions.push('/docs/quick-start/', '/', '/docs/addon-development/');
        } else if (currentPath.includes('/docs/quick-start/')) {
            predictions.push('/docs/addon-development/', '/docs/addon-api/', '/');
        } else if (currentPath.includes('/docs/')) {
            predictions.push('/', '/docs/');
        }
        
        return predictions;
    }

    /**
     * Prefetch critical resources
     */
    prefetchCriticalResources() {
        const criticalResources = [
            '/css/mobile-navigation.css',
            '/js/mobile-navigation-enhancer.js',
            '/js/mobile-content-preview.js'
        ];
        
        criticalResources.forEach(resource => {
            this.prefetchResource(resource);
        });
    }

    /**
     * Optimize images
     */
    optimizeImages() {
        if (!this.config.enableImageOptimization) return;
        
        // Convert images to lazy loading
        document.querySelectorAll('img:not([data-src])').forEach(img => {
            if (this.shouldLazyLoadImage(img)) {
                this.convertToLazyImage(img);
            }
        });
        
        // Setup responsive images
        this.setupResponsiveImages();
    }

    /**
     * Check if image should be lazy loaded
     */
    shouldLazyLoadImage(img) {
        const rect = img.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Don't lazy load images in viewport or critical images
        return rect.top > viewportHeight && !img.classList.contains('critical');
    }

    /**
     * Convert image to lazy loading
     */
    convertToLazyImage(img) {
        const src = img.src;
        img.dataset.src = src;
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
        
        if (this.lazyLoadObserver) {
            this.lazyLoadObserver.observe(img);
        }
    }

    /**
     * Setup responsive images
     */
    setupResponsiveImages() {
        // Add loading="lazy" to images that support it
        document.querySelectorAll('img').forEach(img => {
            if (!img.hasAttribute('loading') && 'loading' in HTMLImageElement.prototype) {
                img.loading = 'lazy';
            }
        });
    }

    /**
     * Setup network optimization
     */
    setupNetworkOptimization() {
        // Monitor network status
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleNetworkChange();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleNetworkChange();
        });
        
        // Monitor connection quality
        this.monitorConnectionQuality();
    }

    /**
     * Handle network change
     */
    handleNetworkChange() {
        if (this.isOnline) {
            // Resume prefetching and caching
            this.config.enablePrefetching = true;
            this.config.enableResourceCaching = true;
        } else {
            // Disable prefetching to save bandwidth
            this.config.enablePrefetching = false;
            // Keep caching for offline access
        }
    }

    /**
     * Monitor connection quality
     */
    monitorConnectionQuality() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            const updateForConnection = () => {
                // Adjust optimization based on connection
                if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                    this.config.enablePrefetching = false;
                    this.config.maxCacheSize = 20;
                } else if (connection.effectiveType === '3g') {
                    this.config.enablePrefetching = true;
                    this.config.maxCacheSize = 30;
                } else {
                    this.config.enablePrefetching = true;
                    this.config.maxCacheSize = 50;
                }
            };
            
            updateForConnection();
            connection.addEventListener('change', updateForConnection);
        }
    }

    /**
     * Setup memory management
     */
    setupMemoryManagement() {
        // Clean up on page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.performMemoryCleanup();
            }
        });
        
        // Clean up on low memory (if supported)
        if ('memory' in performance) {
            window.addEventListener('beforeunload', () => {
                this.performMemoryCleanup();
            });
        }
    }

    /**
     * Perform memory cleanup
     */
    performMemoryCleanup() {
        // Clear old performance metrics
        const now = Date.now();
        const oldMetrics = [];
        
        this.performanceMetrics.forEach((value, key) => {
            if (now - value.timestamp > 5 * 60 * 1000) { // 5 minutes old
                oldMetrics.push(key);
            }
        });
        
        oldMetrics.forEach(key => {
            this.performanceMetrics.delete(key);
        });
        
        // Clear old cache entries
        this.manageCacheSize();
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        console.log('Memory cleanup performed');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;
            
            if (wasMobile !== this.isMobile) {
                if (!this.isMobile) {
                    this.destroy();
                }
            }
        });
        
        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.optimizeForOrientation();
            }, 100);
        });
    }

    /**
     * Optimize for orientation change
     */
    optimizeForOrientation() {
        // Recalculate lazy loading thresholds
        if (this.lazyLoadObserver) {
            // Re-observe elements that might now be in viewport
            document.querySelectorAll('img[data-src], .content-preview[data-lazy]').forEach(element => {
                const rect = element.getBoundingClientRect();
                if (rect.top <= window.innerHeight + 100) {
                    this.loadLazyElement(element);
                }
            });
        }
    }

    /**
     * Optimize for slow loading
     */
    optimizeForSlowLoading() {
        // Reduce cache size
        this.config.maxCacheSize = Math.max(20, this.config.maxCacheSize - 10);
        
        // Disable prefetching temporarily
        this.config.enablePrefetching = false;
        
        // Increase lazy loading threshold
        this.config.intersectionThreshold = 0.05;
        
        console.log('Optimizations applied for slow loading');
    }

    /**
     * Optimize resource
     */
    optimizeResource(resourceEntry) {
        // Add resource to prefetch queue for next visit
        if (resourceEntry.name.includes('.css') || resourceEntry.name.includes('.js')) {
            this.prefetchResource(resourceEntry.name);
        }
    }

    /**
     * Load content preview (placeholder implementation)
     */
    async loadContentPreview(contentId) {
        // This would integrate with the existing content preview system
        if (window.mobileContentPreview) {
            return window.mobileContentPreview.generateMobilePreview(contentId);
        }
        
        return `<div class="content-preview-placeholder">Loading ${contentId}...</div>`;
    }

    /**
     * Log performance metrics
     */
    logPerformanceMetrics() {
        if (!this.config.performanceMonitoring) return;
        
        console.group('Mobile Performance Metrics');
        this.performanceMetrics.forEach((value, key) => {
            console.log(`${key}:`, value);
        });
        console.log('Cache size:', this.resourceCache.size);
        console.log('Prefetch queue:', this.prefetchQueue.length);
        console.groupEnd();
    }

    /**
     * Get performance report
     */
    getPerformanceReport() {
        return {
            metrics: Object.fromEntries(this.performanceMetrics),
            cacheStats: {
                size: this.resourceCache.size,
                maxSize: this.config.maxCacheSize
            },
            prefetchStats: {
                queueSize: this.prefetchQueue.length
            },
            config: this.config,
            isOnline: this.isOnline,
            isMobile: this.isMobile
        };
    }

    /**
     * Destroy optimizer and clean up
     */
    destroy() {
        // Disconnect observers
        if (this.lazyLoadObserver) {
            this.lazyLoadObserver.disconnect();
        }
        
        // Clear caches
        this.resourceCache.clear();
        this.performanceMetrics.clear();
        this.prefetchQueue = [];
        
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('orientationchange', this.optimizeForOrientation);
        
        this.isInitialized = false;
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth <= 768) {
        const optimizer = new MobilePerformanceOptimizer();
        optimizer.initialize();
        
        // Make globally available
        window.mobilePerformanceOptimizer = optimizer;
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobilePerformanceOptimizer;
}

window.MobilePerformanceOptimizer = MobilePerformanceOptimizer;