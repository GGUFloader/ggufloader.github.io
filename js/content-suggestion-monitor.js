/**
 * Content Suggestion Monitoring System
 * Tracks effectiveness of content suggestions and related links across homepage and documentation
 */

class ContentSuggestionMonitor {
    constructor() {
        this.config = {
            trackingEnabled: true,
            batchSize: 20,
            batchInterval: 300000, // 5 minutes
            impressionThreshold: 1000, // milliseconds in viewport to count as impression
            enableHeatmapTracking: true,
            enableA11yTracking: true
        };

        this.metrics = {
            suggestions: {
                totalImpressions: 0,
                totalClicks: 0,
                clickThroughRate: 0,
                byPosition: {},
                byType: {},
                bySource: {},
                byTarget: {}
            },
            relatedContent: {
                totalShown: 0,
                totalClicked: 0,
                effectiveness: {},
                popularContent: {},
                conversionPaths: {}
            },
            contentPreviews: {
                totalPreviews: 0,
                expandedPreviews: 0,
                clickedPreviews: 0,
                engagementByContent: {},
                timeToInteraction: []
            },
            userBehavior: {
                scrollPatterns: {},
                hoverTimes: {},
                clickPatterns: {},
                abandonmentPoints: {}
            },
            performance: {
                loadTimes: [],
                renderTimes: [],
                interactionTimes: [],
                errorRates: {}
            }
        };

        this.impressionObserver = null;
        this.eventQueue = [];
        this.sessionStartTime = Date.now();
        this.currentPage = window.location.pathname;

        this.init();
    }

    /**
     * Initialize the monitoring system
     */
    init() {
        if (!this.config.trackingEnabled) return;

        this.setupImpressionTracking();
        this.setupClickTracking();
        this.setupHoverTracking();
        this.setupScrollTracking();
        this.setupPerformanceTracking();
        this.setupBatchProcessing();
        this.setupEventListeners();

        console.log('📊 Content suggestion monitoring initialized');
    }

    /**
     * Setup impression tracking using Intersection Observer
     */
    setupImpressionTracking() {
        this.impressionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.trackImpression(entry.target);
                }
            });
        }, {
            threshold: 0.5, // 50% visible
            rootMargin: '0px 0px -50px 0px' // Account for fold
        });

        // Observe suggestion elements
        this.observeSuggestionElements();

        // Re-observe when new content is added
        const mutationObserver = new MutationObserver(() => {
            this.observeSuggestionElements();
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Observe suggestion elements for impressions
     */
    observeSuggestionElements() {
        const selectors = [
            '.related-content-item',
            '.content-preview',
            '.suggestion-card',
            '.cross-page-link',
            '.breadcrumb-nav a',
            '.documentation-link',
            '.homepage-link'
        ];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                if (!element.dataset.monitored) {
                    this.impressionObserver.observe(element);
                    element.dataset.monitored = 'true';
                }
            });
        });
    }

    /**
     * Track impression of suggestion element
     */
    trackImpression(element) {
        const impressionData = {
            type: 'impression',
            timestamp: Date.now(),
            element: this.getElementInfo(element),
            position: this.getElementPosition(element),
            viewport: this.getViewportInfo(),
            page: this.currentPage,
            sessionTime: Date.now() - this.sessionStartTime
        };

        this.metrics.suggestions.totalImpressions++;
        this.updatePositionMetrics(impressionData.position, 'impression');
        this.updateTypeMetrics(impressionData.element.type, 'impression');

        this.queueEvent(impressionData);

        // Start timing for potential interaction
        element.dataset.impressionTime = Date.now().toString();
    }

    /**
     * Setup click tracking for suggestions
     */
    setupClickTracking() {
        document.addEventListener('click', (event) => {
            const element = event.target.closest([
                '.related-content-item',
                '.content-preview',
                '.suggestion-card',
                '.cross-page-link',
                '.breadcrumb-nav a',
                '.documentation-link',
                '.homepage-link'
            ].join(','));

            if (element) {
                this.trackSuggestionClick(element, event);
            }
        });
    }

    /**
     * Track suggestion click
     */
    trackSuggestionClick(element, event) {
        const impressionTime = parseInt(element.dataset.impressionTime || '0');
        const timeToClick = impressionTime ? Date.now() - impressionTime : null;

        const clickData = {
            type: 'click',
            timestamp: Date.now(),
            element: this.getElementInfo(element),
            position: this.getElementPosition(element),
            timeToClick: timeToClick,
            clickCoordinates: {
                x: event.clientX,
                y: event.clientY
            },
            page: this.currentPage,
            target: this.getClickTarget(element),
            sessionTime: Date.now() - this.sessionStartTime
        };

        this.metrics.suggestions.totalClicks++;
        this.updatePositionMetrics(clickData.position, 'click');
        this.updateTypeMetrics(clickData.element.type, 'click');
        this.updateClickThroughRate();

        // Track related content specifically
        if (element.closest('.related-content')) {
            this.trackRelatedContentClick(clickData);
        }

        // Track content preview specifically
        if (element.closest('.content-preview')) {
            this.trackContentPreviewClick(clickData);
        }

        this.queueEvent(clickData);

        // Send to main analytics
        this.sendToAnalytics('suggestion_click', clickData);
    }

    /**
     * Track related content clicks
     */
    trackRelatedContentClick(clickData) {
        this.metrics.relatedContent.totalClicked++;
        
        const contentKey = clickData.element.text || clickData.element.title || 'unknown';
        this.metrics.relatedContent.popularContent[contentKey] = 
            (this.metrics.relatedContent.popularContent[contentKey] || 0) + 1;

        // Track conversion path
        const pathKey = `${this.currentPage} → ${clickData.target}`;
        this.metrics.relatedContent.conversionPaths[pathKey] = 
            (this.metrics.relatedContent.conversionPaths[pathKey] || 0) + 1;
    }

    /**
     * Track content preview clicks
     */
    trackContentPreviewClick(clickData) {
        this.metrics.contentPreviews.totalClicked++;

        if (clickData.timeToClick) {
            this.metrics.contentPreviews.timeToInteraction.push(clickData.timeToClick);
        }

        const contentKey = clickData.element.title || clickData.element.text || 'unknown';
        if (!this.metrics.contentPreviews.engagementByContent[contentKey]) {
            this.metrics.contentPreviews.engagementByContent[contentKey] = {
                impressions: 0,
                clicks: 0,
                expansions: 0
            };
        }
        this.metrics.contentPreviews.engagementByContent[contentKey].clicks++;
    }

    /**
     * Setup hover tracking
     */
    setupHoverTracking() {
        let hoverTimeout;
        let hoverStartTime;

        document.addEventListener('mouseenter', (event) => {
            const element = event.target.closest([
                '.related-content-item',
                '.content-preview',
                '.suggestion-card'
            ].join(','));

            if (element) {
                hoverStartTime = Date.now();
                hoverTimeout = setTimeout(() => {
                    this.trackHover(element, Date.now() - hoverStartTime);
                }, 1000); // Track hovers longer than 1 second
            }
        }, true);

        document.addEventListener('mouseleave', (event) => {
            const element = event.target.closest([
                '.related-content-item',
                '.content-preview',
                '.suggestion-card'
            ].join(','));

            if (element && hoverTimeout) {
                clearTimeout(hoverTimeout);
                
                if (hoverStartTime) {
                    const hoverDuration = Date.now() - hoverStartTime;
                    if (hoverDuration > 500) { // Only track meaningful hovers
                        this.trackHover(element, hoverDuration);
                    }
                }
            }
        }, true);
    }

    /**
     * Track hover behavior
     */
    trackHover(element, duration) {
        const hoverData = {
            type: 'hover',
            timestamp: Date.now(),
            element: this.getElementInfo(element),
            duration: duration,
            page: this.currentPage
        };

        const elementKey = hoverData.element.id || hoverData.element.class || 'unknown';
        if (!this.metrics.userBehavior.hoverTimes[elementKey]) {
            this.metrics.userBehavior.hoverTimes[elementKey] = [];
        }
        this.metrics.userBehavior.hoverTimes[elementKey].push(duration);

        this.queueEvent(hoverData);
    }

    /**
     * Setup scroll tracking for suggestions
     */
    setupScrollTracking() {
        let scrollTimeout;
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.trackScrollBehavior(lastScrollY, window.scrollY);
                lastScrollY = window.scrollY;
            }, 150);
        });
    }

    /**
     * Track scroll behavior around suggestions
     */
    trackScrollBehavior(previousY, currentY) {
        const direction = currentY > previousY ? 'down' : 'up';
        const speed = Math.abs(currentY - previousY);

        // Check if user scrolled past suggestions without interacting
        const visibleSuggestions = this.getVisibleSuggestions();
        
        if (visibleSuggestions.length > 0) {
            const scrollData = {
                type: 'scroll_past_suggestions',
                timestamp: Date.now(),
                direction: direction,
                speed: speed,
                visibleSuggestions: visibleSuggestions.length,
                page: this.currentPage
            };

            this.queueEvent(scrollData);
        }
    }

    /**
     * Get currently visible suggestions
     */
    getVisibleSuggestions() {
        const suggestions = document.querySelectorAll([
            '.related-content-item',
            '.content-preview',
            '.suggestion-card'
        ].join(','));

        return Array.from(suggestions).filter(element => {
            const rect = element.getBoundingClientRect();
            return rect.top >= 0 && rect.bottom <= window.innerHeight;
        });
    }

    /**
     * Setup performance tracking
     */
    setupPerformanceTracking() {
        // Track suggestion load times
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
                if (entry.name.includes('suggestion') || entry.name.includes('related')) {
                    this.metrics.performance.loadTimes.push({
                        name: entry.name,
                        duration: entry.duration,
                        timestamp: Date.now()
                    });
                }
            });
        });

        observer.observe({ entryTypes: ['measure', 'navigation'] });

        // Track interaction response times
        this.trackInteractionPerformance();
    }

    /**
     * Track interaction performance
     */
    trackInteractionPerformance() {
        let interactionStart;

        document.addEventListener('mousedown', (event) => {
            const element = event.target.closest([
                '.related-content-item',
                '.content-preview',
                '.suggestion-card'
            ].join(','));

            if (element) {
                interactionStart = performance.now();
            }
        });

        document.addEventListener('click', (event) => {
            const element = event.target.closest([
                '.related-content-item',
                '.content-preview',
                '.suggestion-card'
            ].join(','));

            if (element && interactionStart) {
                const interactionTime = performance.now() - interactionStart;
                this.metrics.performance.interactionTimes.push({
                    element: this.getElementInfo(element),
                    duration: interactionTime,
                    timestamp: Date.now()
                });
            }
        });
    }

    /**
     * Setup batch processing
     */
    setupBatchProcessing() {
        setInterval(() => {
            this.processBatch();
        }, this.config.batchInterval);

        // Process on page unload
        window.addEventListener('beforeunload', () => {
            this.processBatch(true);
        });
    }

    /**
     * Process event batch
     */
    processBatch(isUnloading = false) {
        if (this.eventQueue.length === 0) return;

        const batch = {
            timestamp: Date.now(),
            page: this.currentPage,
            sessionId: this.getSessionId(),
            events: [...this.eventQueue],
            metrics: this.getMetricsSummary()
        };

        // Send batch to analytics
        this.sendBatch(batch, isUnloading);

        // Clear queue
        this.eventQueue = [];
    }

    /**
     * Send batch to analytics endpoint
     */
    sendBatch(batch, isUnloading = false) {
        const payload = JSON.stringify(batch);

        if (isUnloading && navigator.sendBeacon) {
            navigator.sendBeacon('/analytics/suggestions', payload);
        } else {
            // Store in localStorage for later sending
            this.storeBatch(batch);
        }

        // Send to main analytics system
        if (window.analyticsManager) {
            window.analyticsManager.trackEvent('suggestion_batch', {
                event_category: 'Content Suggestions',
                batch_size: batch.events.length,
                page_location: window.location.href
            });
        }
    }

    /**
     * Store batch in localStorage
     */
    storeBatch(batch) {
        const stored = JSON.parse(localStorage.getItem('suggestionBatches') || '[]');
        stored.push(batch);

        // Keep only last 10 batches
        if (stored.length > 10) {
            stored.splice(0, stored.length - 10);
        }

        localStorage.setItem('suggestionBatches', JSON.stringify(stored));
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for page changes
        window.addEventListener('popstate', () => {
            this.handlePageChange();
        });

        // Listen for visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.processBatch();
            }
        });

        // Listen for content preview expansions
        document.addEventListener('click', (event) => {
            if (event.target.closest('.expand-preview')) {
                this.trackPreviewExpansion(event.target.closest('.content-preview'));
            }
        });
    }

    /**
     * Handle page change
     */
    handlePageChange() {
        this.processBatch();
        this.currentPage = window.location.pathname;
        this.sessionStartTime = Date.now();
        
        // Re-observe elements on new page
        setTimeout(() => {
            this.observeSuggestionElements();
        }, 100);
    }

    /**
     * Track preview expansion
     */
    trackPreviewExpansion(previewElement) {
        this.metrics.contentPreviews.expandedPreviews++;

        const expansionData = {
            type: 'preview_expansion',
            timestamp: Date.now(),
            element: this.getElementInfo(previewElement),
            page: this.currentPage
        };

        const contentKey = expansionData.element.title || expansionData.element.text || 'unknown';
        if (this.metrics.contentPreviews.engagementByContent[contentKey]) {
            this.metrics.contentPreviews.engagementByContent[contentKey].expansions++;
        }

        this.queueEvent(expansionData);
    }

    /**
     * Get element information
     */
    getElementInfo(element) {
        return {
            tagName: element.tagName,
            id: element.id,
            class: element.className,
            text: element.textContent?.trim().substring(0, 100),
            title: element.title || element.getAttribute('aria-label'),
            href: element.href || element.querySelector('a')?.href,
            type: this.getSuggestionType(element)
        };
    }

    /**
     * Get suggestion type
     */
    getSuggestionType(element) {
        if (element.closest('.related-content')) return 'related_content';
        if (element.closest('.content-preview')) return 'content_preview';
        if (element.closest('.breadcrumb-nav')) return 'breadcrumb';
        if (element.classList.contains('cross-page-link')) return 'cross_page_link';
        if (element.classList.contains('documentation-link')) return 'documentation_link';
        if (element.classList.contains('homepage-link')) return 'homepage_link';
        return 'unknown';
    }

    /**
     * Get element position information
     */
    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        const parent = element.closest('.suggestions-container, .related-content-container, main, section');
        const siblings = parent ? Array.from(parent.children) : [];
        
        return {
            index: siblings.indexOf(element),
            total: siblings.length,
            rect: {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            },
            viewport: {
                percentageFromTop: (rect.top / window.innerHeight) * 100,
                percentageFromLeft: (rect.left / window.innerWidth) * 100
            }
        };
    }

    /**
     * Get viewport information
     */
    getViewportInfo() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            scrollY: window.scrollY,
            scrollX: window.scrollX
        };
    }

    /**
     * Get click target
     */
    getClickTarget(element) {
        return element.href || 
               element.querySelector('a')?.href || 
               element.dataset.target || 
               'unknown';
    }

    /**
     * Update position metrics
     */
    updatePositionMetrics(position, action) {
        const positionKey = `position_${position.index}`;
        
        if (!this.metrics.suggestions.byPosition[positionKey]) {
            this.metrics.suggestions.byPosition[positionKey] = {
                impressions: 0,
                clicks: 0,
                ctr: 0
            };
        }

        this.metrics.suggestions.byPosition[positionKey][action === 'click' ? 'clicks' : 'impressions']++;
        
        // Update CTR
        const positionData = this.metrics.suggestions.byPosition[positionKey];
        positionData.ctr = positionData.impressions > 0 ? positionData.clicks / positionData.impressions : 0;
    }

    /**
     * Update type metrics
     */
    updateTypeMetrics(type, action) {
        if (!this.metrics.suggestions.byType[type]) {
            this.metrics.suggestions.byType[type] = {
                impressions: 0,
                clicks: 0,
                ctr: 0
            };
        }

        this.metrics.suggestions.byType[type][action === 'click' ? 'clicks' : 'impressions']++;
        
        // Update CTR
        const typeData = this.metrics.suggestions.byType[type];
        typeData.ctr = typeData.impressions > 0 ? typeData.clicks / typeData.impressions : 0;
    }

    /**
     * Update click-through rate
     */
    updateClickThroughRate() {
        this.metrics.suggestions.clickThroughRate = 
            this.metrics.suggestions.totalImpressions > 0 ? 
            this.metrics.suggestions.totalClicks / this.metrics.suggestions.totalImpressions : 0;
    }

    /**
     * Queue event for batch processing
     */
    queueEvent(eventData) {
        this.eventQueue.push(eventData);

        if (this.eventQueue.length >= this.config.batchSize) {
            this.processBatch();
        }
    }

    /**
     * Send to main analytics system
     */
    sendToAnalytics(eventType, data) {
        if (window.analyticsManager) {
            window.analyticsManager.trackEvent(eventType, {
                event_category: 'Content Suggestions',
                ...data
            });
        }

        // Send to cross-page analytics
        if (window.CrossPageAnalytics) {
            window.CrossPageAnalytics.trackCustomEvent(eventType, data);
        }
    }

    /**
     * Get session ID
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('suggestionMonitorSessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('suggestionMonitorSessionId', sessionId);
        }
        return sessionId;
    }

    /**
     * Get metrics summary
     */
    getMetricsSummary() {
        return {
            suggestions: { ...this.metrics.suggestions },
            relatedContent: { ...this.metrics.relatedContent },
            contentPreviews: { ...this.metrics.contentPreviews },
            userBehavior: {
                averageHoverTime: this.calculateAverageHoverTime(),
                scrollPatterns: { ...this.metrics.userBehavior.scrollPatterns }
            },
            performance: {
                averageLoadTime: this.calculateAverageLoadTime(),
                averageInteractionTime: this.calculateAverageInteractionTime()
            }
        };
    }

    /**
     * Calculate average hover time
     */
    calculateAverageHoverTime() {
        const allHoverTimes = Object.values(this.metrics.userBehavior.hoverTimes).flat();
        return allHoverTimes.length > 0 ? 
            allHoverTimes.reduce((sum, time) => sum + time, 0) / allHoverTimes.length : 0;
    }

    /**
     * Calculate average load time
     */
    calculateAverageLoadTime() {
        const loadTimes = this.metrics.performance.loadTimes;
        return loadTimes.length > 0 ? 
            loadTimes.reduce((sum, entry) => sum + entry.duration, 0) / loadTimes.length : 0;
    }

    /**
     * Calculate average interaction time
     */
    calculateAverageInteractionTime() {
        const interactionTimes = this.metrics.performance.interactionTimes;
        return interactionTimes.length > 0 ? 
            interactionTimes.reduce((sum, entry) => sum + entry.duration, 0) / interactionTimes.length : 0;
    }

    /**
     * Get effectiveness report
     */
    getEffectivenessReport() {
        return {
            overallCTR: this.metrics.suggestions.clickThroughRate,
            bestPerformingType: this.getBestPerformingType(),
            bestPerformingPosition: this.getBestPerformingPosition(),
            topRelatedContent: this.getTopRelatedContent(),
            previewEngagement: this.getPreviewEngagement(),
            recommendations: this.generateRecommendations()
        };
    }

    /**
     * Get best performing suggestion type
     */
    getBestPerformingType() {
        const types = Object.entries(this.metrics.suggestions.byType);
        return types.length > 0 ? 
            types.reduce((best, [type, data]) => data.ctr > best.ctr ? { type, ...data } : best, { ctr: 0 }) : null;
    }

    /**
     * Get best performing position
     */
    getBestPerformingPosition() {
        const positions = Object.entries(this.metrics.suggestions.byPosition);
        return positions.length > 0 ? 
            positions.reduce((best, [position, data]) => data.ctr > best.ctr ? { position, ...data } : best, { ctr: 0 }) : null;
    }

    /**
     * Get top related content
     */
    getTopRelatedContent() {
        return Object.entries(this.metrics.relatedContent.popularContent)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
    }

    /**
     * Get preview engagement
     */
    getPreviewEngagement() {
        const total = this.metrics.contentPreviews.totalPreviews;
        return {
            expansionRate: total > 0 ? this.metrics.contentPreviews.expandedPreviews / total : 0,
            clickRate: total > 0 ? this.metrics.contentPreviews.totalClicked / total : 0,
            averageTimeToInteraction: this.metrics.contentPreviews.timeToInteraction.length > 0 ?
                this.metrics.contentPreviews.timeToInteraction.reduce((sum, time) => sum + time, 0) / 
                this.metrics.contentPreviews.timeToInteraction.length : 0
        };
    }

    /**
     * Generate recommendations based on data
     */
    generateRecommendations() {
        const recommendations = [];

        // CTR recommendations
        if (this.metrics.suggestions.clickThroughRate < 0.05) {
            recommendations.push({
                type: 'improvement',
                priority: 'high',
                message: 'Low click-through rate detected. Consider improving suggestion relevance or placement.'
            });
        }

        // Position recommendations
        const bestPosition = this.getBestPerformingPosition();
        if (bestPosition && bestPosition.position !== 'position_0') {
            recommendations.push({
                type: 'optimization',
                priority: 'medium',
                message: `Position ${bestPosition.position.split('_')[1]} performs best. Consider moving top content there.`
            });
        }

        // Preview recommendations
        const previewEngagement = this.getPreviewEngagement();
        if (previewEngagement.expansionRate < 0.1) {
            recommendations.push({
                type: 'content',
                priority: 'medium',
                message: 'Low preview expansion rate. Consider making previews more compelling.'
            });
        }

        return recommendations;
    }
}

// Initialize monitoring when DOM is ready
let contentSuggestionMonitor;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        contentSuggestionMonitor = new ContentSuggestionMonitor();
        window.ContentSuggestionMonitor = contentSuggestionMonitor;
    });
} else {
    contentSuggestionMonitor = new ContentSuggestionMonitor();
    window.ContentSuggestionMonitor = contentSuggestionMonitor;
}

// Export for Node.js environments (testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentSuggestionMonitor;
}