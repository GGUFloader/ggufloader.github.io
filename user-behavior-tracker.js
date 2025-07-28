/**
 * User Behavior Tracking System
 * Tracks popular content, navigation patterns, model downloads, and UI optimization insights
 */

class UserBehaviorTracker {
    constructor() {
        this.config = {
            enableContentTracking: true,
            enableNavigationTracking: true,
            enableDownloadTracking: true,
            enableHeatmapTracking: true,
            enableScrollTracking: true,
            enableClickTracking: true,
            enableFormTracking: true,
            enableSearchTracking: true,
            trackingInterval: 5000, // 5 seconds
            heatmapSampleRate: 0.1, // 10% of users
            maxEventsPerSession: 1000,
            enableDebugMode: false
        };
        
        this.sessionData = {
            sessionId: this.generateSessionId(),
            startTime: Date.now(),
            events: [],
            pageViews: [],
            interactions: [],
            downloads: [],
            searches: []
        };
        
        this.heatmapData = {
            clicks: [],
            scrollDepth: {},
            timeOnElements: {},
            mouseMovements: []
        };
        
        this.contentMetrics = {
            popularPages: {},
            timeOnPage: {},
            bounceRate: {},
            exitPages: {},
            entryPages: {}
        };
        
        this.navigationPatterns = {
            userFlows: [],
            commonPaths: {},
            dropoffPoints: {},
            conversionFunnels: {}
        };
        
        this.isTracking = false;
        this.currentPage = window.location.pathname;
        this.pageStartTime = Date.now();
        
        this.init();
    }
    
    /**
     * Initialize behavior tracking
     */
    init() {
        if (!this.shouldTrack()) {
            console.log('User behavior tracking disabled or not consented');
            return;
        }
        
        this.setupEventListeners();
        this.startTracking();
        this.trackPageView();
        
        // Setup periodic data reporting
        this.setupReporting();
        
        console.log('User behavior tracking initialized');
    }
    
    /**
     * Check if tracking should be enabled
     */
    shouldTrack() {
        // Check analytics consent
        if (window.analyticsManager && !window.analyticsManager.consentGiven) {
            return false;
        }
        
        // Check if user is admin/developer (skip tracking)
        if (this.isAdminUser()) {
            return false;
        }
        
        // Check sample rate for heatmap tracking
        if (this.config.enableHeatmapTracking && Math.random() > this.config.heatmapSampleRate) {
            this.config.enableHeatmapTracking = false;
        }
        
        return true;
    }
    
    /**
     * Check if current user is admin/developer
     */
    isAdminUser() {
        // Check for development environment
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return true;
        }
        
        // Check for admin indicators
        if (localStorage.getItem('admin_mode') === 'true') {
            return true;
        }
        
        return false;
    }
    
    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Setup event listeners for behavior tracking
     */
    setupEventListeners() {
        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.trackVisibilityChange();
        });
        
        // Page unload
        window.addEventListener('beforeunload', () => {
            this.trackPageExit();
            this.sendData();
        });
        
        // Click tracking
        if (this.config.enableClickTracking) {
            this.setupClickTracking();
        }
        
        // Scroll tracking
        if (this.config.enableScrollTracking) {
            this.setupScrollTracking();
        }
        
        // Form tracking
        if (this.config.enableFormTracking) {
            this.setupFormTracking();
        }
        
        // Search tracking
        if (this.config.enableSearchTracking) {
            this.setupSearchTracking();
        }
        
        // Download tracking
        if (this.config.enableDownloadTracking) {
            this.setupDownloadTracking();
        }
        
        // Navigation tracking
        if (this.config.enableNavigationTracking) {
            this.setupNavigationTracking();
        }
        
        // Heatmap tracking
        if (this.config.enableHeatmapTracking) {
            this.setupHeatmapTracking();
        }
    }
    
    /**
     * Setup click tracking
     */
    setupClickTracking() {
        document.addEventListener('click', (event) => {
            const element = event.target;
            const clickData = {
                type: 'click',
                timestamp: Date.now(),
                element: this.getElementInfo(element),
                coordinates: {
                    x: event.clientX,
                    y: event.clientY,
                    pageX: event.pageX,
                    pageY: event.pageY
                },
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                page: window.location.pathname
            };
            
            this.addEvent(clickData);
            
            // Track specific click types
            this.trackSpecialClicks(element, clickData);
        });
    }
    
    /**
     * Track special click types (buttons, links, etc.)
     */
    trackSpecialClicks(element, clickData) {
        // Track button clicks
        if (element.tagName === 'BUTTON' || element.type === 'button') {
            this.trackButtonClick(element, clickData);
        }
        
        // Track link clicks
        if (element.tagName === 'A') {
            this.trackLinkClick(element, clickData);
        }
        
        // Track floating button clicks
        if (element.closest('.floating-button')) {
            this.trackFloatingButtonClick(element, clickData);
        }
        
        // Track model comparison interactions
        if (element.closest('.model-comparison-tool')) {
            this.trackModelComparisonClick(element, clickData);
        }
        
        // Track documentation navigation
        if (element.closest('.docs-nav') || element.closest('.docs-sidebar')) {
            this.trackDocumentationNavigation(element, clickData);
        }
    }
    
    /**
     * Track button clicks
     */
    trackButtonClick(element, clickData) {
        const buttonData = {
            ...clickData,
            buttonType: 'button',
            buttonText: element.textContent.trim(),
            buttonId: element.id,
            buttonClass: element.className
        };
        
        this.addInteraction('button_click', buttonData);
        
        // Send to analytics
        if (window.analyticsManager) {
            window.analyticsManager.trackEvent('button_click', {
                event_category: 'UI Interaction',
                button_text: buttonData.buttonText,
                button_id: buttonData.buttonId,
                page_location: window.location.href
            });
        }
    }
    
    /**
     * Track link clicks
     */
    trackLinkClick(element, clickData) {
        const linkData = {
            ...clickData,
            linkType: 'link',
            linkText: element.textContent.trim(),
            linkHref: element.href,
            linkTarget: element.target,
            isExternal: element.hostname !== window.location.hostname
        };
        
        this.addInteraction('link_click', linkData);
        
        // Track external vs internal links
        const linkCategory = linkData.isExternal ? 'External Link' : 'Internal Link';
        
        if (window.analyticsManager) {
            window.analyticsManager.trackEvent('link_click', {
                event_category: linkCategory,
                link_text: linkData.linkText,
                link_url: linkData.linkHref,
                page_location: window.location.href
            });
        }
    }
    
    /**
     * Track floating button clicks
     */
    trackFloatingButtonClick(element, clickData) {
        const buttonElement = element.closest('.floating-button');
        const buttonText = buttonElement.querySelector('.btn-text')?.textContent || 
                          buttonElement.title || 
                          buttonElement.getAttribute('aria-label');
        
        const floatingButtonData = {
            ...clickData,
            buttonType: 'floating',
            buttonText: buttonText,
            buttonService: buttonElement.dataset.service,
            isServiceButton: buttonElement.classList.contains('service-btn'),
            isNavButton: buttonElement.classList.contains('nav-btn')
        };
        
        this.addInteraction('floating_button_click', floatingButtonData);
        
        if (window.analyticsManager) {
            window.analyticsManager.trackEvent('floating_button_click', {
                event_category: 'Floating Buttons',
                button_text: floatingButtonData.buttonText,
                button_type: floatingButtonData.isServiceButton ? 'service' : 'navigation',
                page_location: window.location.href
            });
        }
    }
    
    /**
     * Track model comparison tool interactions
     */
    trackModelComparisonClick(element, clickData) {
        const comparisonData = {
            ...clickData,
            toolSection: this.getModelComparisonSection(element),
            action: this.getModelComparisonAction(element)
        };
        
        this.addInteraction('model_comparison_interaction', comparisonData);
        
        if (window.analyticsManager) {
            window.analyticsManager.trackEvent('model_comparison_interaction', {
                event_category: 'Model Comparison',
                tool_section: comparisonData.toolSection,
                action: comparisonData.action,
                page_location: window.location.href
            });
        }
    }
    
    /**
     * Track documentation navigation
     */
    trackDocumentationNavigation(element, clickData) {
        const docData = {
            ...clickData,
            navType: element.closest('.docs-nav') ? 'breadcrumb' : 'sidebar',
            targetPage: element.href ? new URL(element.href).pathname : null,
            linkText: element.textContent.trim()
        };
        
        this.addInteraction('documentation_navigation', docData);
        
        if (window.analyticsManager) {
            window.analyticsManager.trackDocumentationUsage(
                docData.targetPage || 'unknown',
                'navigation',
                docData.navType
            );
        }
    }
    
    /**
     * Setup scroll tracking
     */
    setupScrollTracking() {
        let scrollTimeout;
        let maxScrollDepth = 0;
        const scrollMilestones = [25, 50, 75, 90, 100];
        const trackedMilestones = new Set();
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollPercent = Math.round(
                    (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
                );
                
                maxScrollDepth = Math.max(maxScrollDepth, scrollPercent);
                
                // Track scroll milestones
                scrollMilestones.forEach(milestone => {
                    if (scrollPercent >= milestone && !trackedMilestones.has(milestone)) {
                        trackedMilestones.add(milestone);
                        
                        const scrollData = {
                            type: 'scroll_milestone',
                            timestamp: Date.now(),
                            milestone: milestone,
                            scrollPercent: scrollPercent,
                            page: window.location.pathname
                        };
                        
                        this.addEvent(scrollData);
                        
                        if (window.analyticsManager) {
                            window.analyticsManager.trackEngagement('scroll_depth', milestone, {
                                page_location: window.location.href
                            });
                        }
                    }
                });
                
                // Update heatmap data
                if (this.config.enableHeatmapTracking) {
                    this.heatmapData.scrollDepth[window.location.pathname] = maxScrollDepth;
                }
            }, 100);
        });
    }
    
    /**
     * Setup form tracking
     */
    setupFormTracking() {
        // Track form interactions
        document.addEventListener('focus', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
                this.trackFormInteraction('focus', event.target);
            }
        });
        
        document.addEventListener('blur', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
                this.trackFormInteraction('blur', event.target);
            }
        });
        
        // Track form submissions
        document.addEventListener('submit', (event) => {
            this.trackFormSubmission(event.target);
        });
    }
    
    /**
     * Track form interactions
     */
    trackFormInteraction(action, element) {
        const formData = {
            type: 'form_interaction',
            timestamp: Date.now(),
            action: action,
            element: this.getElementInfo(element),
            formId: element.form?.id,
            fieldType: element.type,
            fieldName: element.name,
            page: window.location.pathname
        };
        
        this.addEvent(formData);
    }
    
    /**
     * Track form submissions
     */
    trackFormSubmission(form) {
        const formData = {
            type: 'form_submission',
            timestamp: Date.now(),
            formId: form.id,
            formAction: form.action,
            formMethod: form.method,
            fieldCount: form.elements.length,
            page: window.location.pathname
        };
        
        this.addEvent(formData);
        
        if (window.analyticsManager) {
            window.analyticsManager.trackEvent('form_submit', {
                event_category: 'Forms',
                form_id: formData.formId,
                form_action: formData.formAction,
                page_location: window.location.href
            });
        }
    }
    
    /**
     * Setup search tracking
     */
    setupSearchTracking() {
        // Track site search
        const searchInput = document.getElementById('site-search-input');
        if (searchInput) {
            let searchTimeout;
            
            searchInput.addEventListener('input', (event) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.trackSearch(event.target.value, 'site_search');
                }, 500);
            });
        }
        
        // Track search result clicks
        document.addEventListener('click', (event) => {
            if (event.target.closest('.search-result')) {
                this.trackSearchResultClick(event.target);
            }
        });
    }
    
    /**
     * Track search queries
     */
    trackSearch(query, searchType = 'site_search') {
        if (!query || query.length < 2) return;
        
        const searchData = {
            type: 'search',
            timestamp: Date.now(),
            query: query,
            searchType: searchType,
            page: window.location.pathname
        };
        
        this.sessionData.searches.push(searchData);
        this.addEvent(searchData);
        
        if (window.analyticsManager) {
            window.analyticsManager.trackSearch(query, 0, searchType);
        }
    }
    
    /**
     * Track search result clicks
     */
    trackSearchResultClick(element) {
        const resultData = {
            type: 'search_result_click',
            timestamp: Date.now(),
            resultText: element.textContent.trim(),
            resultUrl: element.href,
            resultPosition: this.getSearchResultPosition(element),
            page: window.location.pathname
        };
        
        this.addEvent(resultData);
    }
    
    /**
     * Setup download tracking
     */
    setupDownloadTracking() {
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link && this.isDownloadLink(link)) {
                this.trackDownload(link);
            }
        });
    }
    
    /**
     * Check if link is a download link
     */
    isDownloadLink(link) {
        const href = link.href.toLowerCase();
        const downloadExtensions = ['.zip', '.tar.gz', '.exe', '.dmg', '.deb', '.rpm', '.msi', '.pkg'];
        
        // Check file extension
        if (downloadExtensions.some(ext => href.includes(ext))) {
            return true;
        }
        
        // Check for download attribute
        if (link.hasAttribute('download')) {
            return true;
        }
        
        // Check for model download patterns
        if (href.includes('huggingface.co') && href.includes('.gguf')) {
            return true;
        }
        
        // Check for GitHub releases
        if (href.includes('github.com') && href.includes('/releases/')) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Track downloads
     */
    trackDownload(link) {
        const downloadData = {
            type: 'download',
            timestamp: Date.now(),
            fileName: this.extractFileName(link.href),
            fileUrl: link.href,
            fileType: this.getFileType(link.href),
            linkText: link.textContent.trim(),
            page: window.location.pathname,
            referrer: document.referrer
        };
        
        this.sessionData.downloads.push(downloadData);
        this.addEvent(downloadData);
        
        if (window.analyticsManager) {
            window.analyticsManager.trackDownload(
                downloadData.fileName,
                downloadData.fileType,
                downloadData.fileUrl
            );
        }
        
        // Track model-specific downloads
        if (this.isModelDownload(link.href)) {
            this.trackModelDownload(downloadData);
        }
    }
    
    /**
     * Check if download is a model file
     */
    isModelDownload(url) {
        return url.toLowerCase().includes('.gguf') || 
               url.includes('huggingface.co') ||
               url.includes('model');
    }
    
    /**
     * Track model downloads specifically
     */
    trackModelDownload(downloadData) {
        const modelData = {
            ...downloadData,
            modelName: this.extractModelName(downloadData.fileName),
            modelSize: this.extractModelSize(downloadData.fileName),
            modelType: this.extractModelType(downloadData.fileName)
        };
        
        this.addInteraction('model_download', modelData);
        
        if (window.analyticsManager) {
            window.analyticsManager.trackEvent('model_download', {
                event_category: 'Model Downloads',
                model_name: modelData.modelName,
                model_size: modelData.modelSize,
                model_type: modelData.modelType,
                page_location: window.location.href
            });
        }
    }
    
    /**
     * Setup navigation tracking
     */
    setupNavigationTracking() {
        // Track page changes (for SPAs)
        let currentPath = window.location.pathname;
        
        const checkPathChange = () => {
            if (window.location.pathname !== currentPath) {
                this.trackPageChange(currentPath, window.location.pathname);
                currentPath = window.location.pathname;
            }
        };
        
        // Check for path changes
        setInterval(checkPathChange, 1000);
        
        // Track browser navigation
        window.addEventListener('popstate', () => {
            this.trackBrowserNavigation();
        });
    }
    
    /**
     * Track page changes
     */
    trackPageChange(fromPath, toPath) {
        const navigationData = {
            type: 'page_change',
            timestamp: Date.now(),
            fromPath: fromPath,
            toPath: toPath,
            timeOnPreviousPage: Date.now() - this.pageStartTime
        };
        
        this.addEvent(navigationData);
        this.trackPageView();
        
        // Update navigation patterns
        this.updateNavigationPatterns(fromPath, toPath);
    }
    
    /**
     * Setup heatmap tracking
     */
    setupHeatmapTracking() {
        if (!this.config.enableHeatmapTracking) return;
        
        // Track mouse movements (sampled)
        let mouseMoveTimeout;
        document.addEventListener('mousemove', (event) => {
            clearTimeout(mouseMoveTimeout);
            mouseMoveTimeout = setTimeout(() => {
                if (Math.random() < 0.01) { // 1% sampling
                    this.heatmapData.mouseMovements.push({
                        x: event.clientX,
                        y: event.clientY,
                        timestamp: Date.now(),
                        page: window.location.pathname
                    });
                }
            }, 100);
        });
        
        // Track time spent on elements
        this.setupElementTimeTracking();
    }
    
    /**
     * Setup element time tracking
     */
    setupElementTimeTracking() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const elementId = this.getElementId(entry.target);
                
                if (entry.isIntersecting) {
                    // Element entered viewport
                    this.heatmapData.timeOnElements[elementId] = {
                        element: this.getElementInfo(entry.target),
                        startTime: Date.now(),
                        totalTime: this.heatmapData.timeOnElements[elementId]?.totalTime || 0
                    };
                } else {
                    // Element left viewport
                    const elementData = this.heatmapData.timeOnElements[elementId];
                    if (elementData && elementData.startTime) {
                        elementData.totalTime += Date.now() - elementData.startTime;
                        elementData.startTime = null;
                    }
                }
            });
        }, { threshold: 0.5 });
        
        // Observe key elements
        document.querySelectorAll('h1, h2, h3, .cta-button, .floating-button, .model-card').forEach(el => {
            observer.observe(el);
        });
    }
    
    /**
     * Track page view
     */
    trackPageView() {
        const pageViewData = {
            type: 'page_view',
            timestamp: Date.now(),
            page: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            screen: {
                width: screen.width,
                height: screen.height
            }
        };
        
        this.sessionData.pageViews.push(pageViewData);
        this.addEvent(pageViewData);
        
        // Update content metrics
        this.updateContentMetrics(pageViewData);
        
        this.pageStartTime = Date.now();
    }
    
    /**
     * Track page exit
     */
    trackPageExit() {
        const timeOnPage = Date.now() - this.pageStartTime;
        
        const exitData = {
            type: 'page_exit',
            timestamp: Date.now(),
            page: window.location.pathname,
            timeOnPage: timeOnPage,
            scrollDepth: this.heatmapData.scrollDepth[window.location.pathname] || 0,
            interactions: this.sessionData.interactions.filter(i => i.page === window.location.pathname).length
        };
        
        this.addEvent(exitData);
        
        // Update content metrics
        this.contentMetrics.timeOnPage[window.location.pathname] = 
            (this.contentMetrics.timeOnPage[window.location.pathname] || 0) + timeOnPage;
    }
    
    /**
     * Track visibility changes
     */
    trackVisibilityChange() {
        const visibilityData = {
            type: 'visibility_change',
            timestamp: Date.now(),
            hidden: document.hidden,
            page: window.location.pathname
        };
        
        this.addEvent(visibilityData);
    }
    
    /**
     * Start tracking
     */
    startTracking() {
        this.isTracking = true;
        
        // Periodic data collection
        this.trackingInterval = setInterval(() => {
            this.collectPeriodicData();
        }, this.config.trackingInterval);
    }
    
    /**
     * Stop tracking
     */
    stopTracking() {
        this.isTracking = false;
        
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
        }
        
        this.sendData();
    }
    
    /**
     * Collect periodic data
     */
    collectPeriodicData() {
        const periodicData = {
            type: 'periodic_data',
            timestamp: Date.now(),
            page: window.location.pathname,
            timeOnPage: Date.now() - this.pageStartTime,
            scrollPosition: window.scrollY,
            activeElement: document.activeElement?.tagName
        };
        
        this.addEvent(periodicData);
    }
    
    /**
     * Add event to session data
     */
    addEvent(eventData) {
        if (this.sessionData.events.length >= this.config.maxEventsPerSession) {
            // Remove oldest events
            this.sessionData.events = this.sessionData.events.slice(-this.config.maxEventsPerSession + 100);
        }
        
        this.sessionData.events.push(eventData);
        
        if (this.config.enableDebugMode) {
            console.log('Behavior Event:', eventData);
        }
    }
    
    /**
     * Add interaction to session data
     */
    addInteraction(type, data) {
        const interaction = {
            type: type,
            ...data
        };
        
        this.sessionData.interactions.push(interaction);
        this.addEvent(interaction);
    }
    
    /**
     * Update content metrics
     */
    updateContentMetrics(pageViewData) {
        const page = pageViewData.page;
        
        // Update popular pages
        this.contentMetrics.popularPages[page] = (this.contentMetrics.popularPages[page] || 0) + 1;
        
        // Track entry pages
        if (!document.referrer || !document.referrer.includes(window.location.hostname)) {
            this.contentMetrics.entryPages[page] = (this.contentMetrics.entryPages[page] || 0) + 1;
        }
    }
    
    /**
     * Update navigation patterns
     */
    updateNavigationPatterns(fromPath, toPath) {
        const pathKey = `${fromPath} -> ${toPath}`;
        this.navigationPatterns.commonPaths[pathKey] = (this.navigationPatterns.commonPaths[pathKey] || 0) + 1;
        
        // Track user flow
        this.navigationPatterns.userFlows.push({
            from: fromPath,
            to: toPath,
            timestamp: Date.now()
        });
    }
    
    /**
     * Setup reporting
     */
    setupReporting() {
        // Send data periodically
        setInterval(() => {
            this.sendData();
        }, 60000); // Every minute
        
        // Send data on page unload
        window.addEventListener('beforeunload', () => {
            this.sendData(true);
        });
    }
    
    /**
     * Send data to analytics
     */
    sendData(isUnloading = false) {
        if (!this.isTracking || this.sessionData.events.length === 0) return;
        
        const reportData = {
            sessionId: this.sessionData.sessionId,
            timestamp: Date.now(),
            events: [...this.sessionData.events],
            contentMetrics: { ...this.contentMetrics },
            navigationPatterns: { ...this.navigationPatterns },
            heatmapData: this.config.enableHeatmapTracking ? { ...this.heatmapData } : null,
            sessionSummary: this.getSessionSummary()
        };
        
        // Send to analytics manager
        if (window.analyticsManager) {
            window.analyticsManager.trackEvent('user_behavior_data', {
                event_category: 'User Behavior',
                session_id: this.sessionData.sessionId,
                events_count: this.sessionData.events.length,
                page_views: this.sessionData.pageViews.length,
                interactions: this.sessionData.interactions.length,
                downloads: this.sessionData.downloads.length
            });
        }
        
        // Clear sent events
        this.sessionData.events = [];
        
        if (this.config.enableDebugMode) {
            console.log('Behavior data sent:', reportData);
        }
    }
    
    /**
     * Get session summary
     */
    getSessionSummary() {
        return {
            sessionDuration: Date.now() - this.sessionData.startTime,
            pageViews: this.sessionData.pageViews.length,
            interactions: this.sessionData.interactions.length,
            downloads: this.sessionData.downloads.length,
            searches: this.sessionData.searches.length,
            mostViewedPage: this.getMostViewedPage(),
            totalScrollDepth: Object.values(this.heatmapData.scrollDepth).reduce((a, b) => a + b, 0)
        };
    }
    
    /**
     * Get most viewed page in session
     */
    getMostViewedPage() {
        const pageCounts = {};
        this.sessionData.pageViews.forEach(pv => {
            pageCounts[pv.page] = (pageCounts[pv.page] || 0) + 1;
        });
        
        return Object.keys(pageCounts).reduce((a, b) => pageCounts[a] > pageCounts[b] ? a : b, '/');
    }
    
    /**
     * Utility functions
     */
    getElementInfo(element) {
        if (!element) return null;
        
        return {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
            textContent: element.textContent?.trim().substring(0, 100),
            href: element.href,
            src: element.src
        };
    }
    
    getElementId(element) {
        return element.id || 
               element.className || 
               `${element.tagName}_${Array.from(element.parentNode.children).indexOf(element)}`;
    }
    
    getModelComparisonSection(element) {
        if (element.closest('.specs-input')) return 'specs_input';
        if (element.closest('.results-table')) return 'results_table';
        if (element.closest('.model-filters')) return 'filters';
        return 'unknown';
    }
    
    getModelComparisonAction(element) {
        if (element.tagName === 'SELECT') return 'spec_selection';
        if (element.tagName === 'BUTTON') return 'button_click';
        if (element.tagName === 'A') return 'download_link';
        return 'interaction';
    }
    
    getSearchResultPosition(element) {
        const results = document.querySelectorAll('.search-result');
        return Array.from(results).indexOf(element) + 1;
    }
    
    extractFileName(url) {
        return url.split('/').pop().split('?')[0];
    }
    
    getFileType(url) {
        const extension = url.split('.').pop().toLowerCase();
        return extension;
    }
    
    extractModelName(fileName) {
        // Extract model name from filename
        const name = fileName.replace(/\.(gguf|bin|safetensors)$/i, '');
        return name.split('-')[0] || name;
    }
    
    extractModelSize(fileName) {
        const sizeMatch = fileName.match(/(\d+[bm])/i);
        return sizeMatch ? sizeMatch[1].toUpperCase() : 'unknown';
    }
    
    extractModelType(fileName) {
        if (fileName.includes('instruct')) return 'instruct';
        if (fileName.includes('chat')) return 'chat';
        if (fileName.includes('code')) return 'code';
        return 'base';
    }
    
    /**
     * Get tracking status
     */
    getStatus() {
        return {
            tracking: this.isTracking,
            sessionId: this.sessionData.sessionId,
            eventsCount: this.sessionData.events.length,
            pageViews: this.sessionData.pageViews.length,
            interactions: this.sessionData.interactions.length,
            downloads: this.sessionData.downloads.length
        };
    }
    
    /**
     * Export session data
     */
    exportData() {
        return {
            sessionData: this.sessionData,
            contentMetrics: this.contentMetrics,
            navigationPatterns: this.navigationPatterns,
            heatmapData: this.heatmapData,
            config: this.config
        };
    }
}

// Initialize user behavior tracking
document.addEventListener('DOMContentLoaded', () => {
    // Wait for analytics to be ready
    setTimeout(() => {
        window.userBehaviorTracker = new UserBehaviorTracker();
    }, 1500);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserBehaviorTracker;
}