/**
 * Privacy-Compliant Analytics Implementation
 * Implements Google Analytics 4 with privacy controls and event tracking
 */

class AnalyticsManager {
    constructor() {
        // Use global config if available, otherwise use defaults
        const globalConfig = window.ANALYTICS_CONFIG?.googleAnalytics || {};
        this.config = {
            measurementId: globalConfig.measurementId || 'G-XXXXXXXXXX',
            enableUserConsent: globalConfig.enableUserConsent !== undefined ? globalConfig.enableUserConsent : true,
            enableCookieConsent: globalConfig.enableCookieConsent !== undefined ? globalConfig.enableCookieConsent : true,
            enableDataCollection: globalConfig.enableDataCollection !== undefined ? globalConfig.enableDataCollection : true,
            sampleRate: globalConfig.sampleRate || 100,
            enableDebugMode: globalConfig.enableDebugMode || false
        };
        
        this.consentGiven = false;
        this.initialized = false;
        this.eventQueue = [];
        
        this.init();
    }
    
    /**
     * Initialize analytics with privacy controls
     */
    init() {
        // Check for existing consent
        this.consentGiven = this.getStoredConsent();
        
        if (this.consentGiven) {
            this.loadGoogleAnalytics();
        } else {
            this.showConsentBanner();
        }
        
        // Initialize event tracking
        this.setupEventTracking();
        
        // Track page view
        this.trackPageView();
    }
    
    /**
     * Load Google Analytics 4
     */
    loadGoogleAnalytics() {
        if (this.initialized) return;
        
        // Load gtag script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.measurementId}`;
        document.head.appendChild(script);
        
        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', this.config.measurementId, {
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            sample_rate: this.config.sampleRate,
            debug_mode: this.config.enableDebugMode
        });
        
        this.initialized = true;
        
        // Process queued events
        this.processEventQueue();
        
        console.log('Analytics initialized with privacy controls');
    }
    
    /**
     * Show privacy-compliant consent banner
     */
    showConsentBanner() {
        const banner = document.createElement('div');
        banner.id = 'analytics-consent-banner';
        banner.className = 'consent-banner';
        banner.innerHTML = `
            <div class="consent-content">
                <div class="consent-text">
                    <h3>Privacy & Analytics</h3>
                    <p>We use privacy-focused analytics to improve your experience. No personal data is collected or shared.</p>
                </div>
                <div class="consent-actions">
                    <button id="consent-accept" class="btn-accept">Accept</button>
                    <button id="consent-decline" class="btn-decline">Decline</button>
                    <a href="/privacy" class="privacy-link">Privacy Policy</a>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .consent-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: #2c3e50;
                color: white;
                padding: 1rem;
                z-index: 10000;
                box-shadow: 0 -4px 15px rgba(0,0,0,0.2);
            }
            .consent-content {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
            }
            .consent-text h3 {
                margin: 0 0 0.5rem 0;
                font-size: 1.1rem;
            }
            .consent-text p {
                margin: 0;
                font-size: 0.9rem;
                opacity: 0.9;
            }
            .consent-actions {
                display: flex;
                gap: 1rem;
                align-items: center;
            }
            .btn-accept, .btn-decline {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 500;
            }
            .btn-accept {
                background: #27ae60;
                color: white;
            }
            .btn-decline {
                background: #95a5a6;
                color: white;
            }
            .privacy-link {
                color: #3498db;
                text-decoration: none;
                font-size: 0.9rem;
            }
            @media (max-width: 768px) {
                .consent-content {
                    flex-direction: column;
                    text-align: center;
                }
                .consent-actions {
                    justify-content: center;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(banner);
        
        // Handle consent actions
        document.getElementById('consent-accept').addEventListener('click', () => {
            this.grantConsent();
            banner.remove();
        });
        
        document.getElementById('consent-decline').addEventListener('click', () => {
            this.declineConsent();
            banner.remove();
        });
    }
    
    /**
     * Grant analytics consent
     */
    grantConsent() {
        this.consentGiven = true;
        localStorage.setItem('analytics_consent', 'granted');
        localStorage.setItem('analytics_consent_date', new Date().toISOString());
        
        this.loadGoogleAnalytics();
        
        // Track consent granted event
        this.trackEvent('consent_granted', {
            event_category: 'Privacy',
            consent_type: 'analytics'
        });
    }
    
    /**
     * Decline analytics consent
     */
    declineConsent() {
        this.consentGiven = false;
        localStorage.setItem('analytics_consent', 'denied');
        localStorage.setItem('analytics_consent_date', new Date().toISOString());
        
        console.log('Analytics consent declined');
    }
    
    /**
     * Get stored consent preference
     */
    getStoredConsent() {
        const consent = localStorage.getItem('analytics_consent');
        const consentDate = localStorage.getItem('analytics_consent_date');
        
        // Check if consent is expired (30 days)
        if (consentDate) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            if (new Date(consentDate) < thirtyDaysAgo) {
                localStorage.removeItem('analytics_consent');
                localStorage.removeItem('analytics_consent_date');
                return false;
            }
        }
        
        return consent === 'granted';
    }
    
    /**
     * Track page view
     */
    trackPageView() {
        const pageData = {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname,
            content_group1: this.getContentGroup(),
            custom_map: {
                dimension1: this.getPageType(),
                dimension2: this.getUserType()
            }
        };
        
        this.trackEvent('page_view', pageData);
    }
    
    /**
     * Track custom events
     */
    trackEvent(eventName, parameters = {}) {
        if (!this.consentGiven) {
            // Queue event for later if consent not given
            this.eventQueue.push({ eventName, parameters, timestamp: Date.now() });
            return;
        }
        
        if (!this.initialized) {
            // Queue event if analytics not loaded yet
            this.eventQueue.push({ eventName, parameters, timestamp: Date.now() });
            return;
        }
        
        // Add default parameters
        const eventData = {
            ...parameters,
            timestamp: Date.now(),
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`
        };
        
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, eventData);
            
            if (this.config.enableDebugMode) {
                console.log('Analytics Event:', eventName, eventData);
            }
        }
    }
    
    /**
     * Track conversion events
     */
    trackConversion(conversionName, value = null, currency = 'USD') {
        const conversionData = {
            event_category: 'Conversion',
            event_label: conversionName,
            value: value,
            currency: currency
        };
        
        this.trackEvent('conversion', conversionData);
    }
    
    /**
     * Track download events
     */
    trackDownload(fileName, fileType, downloadUrl) {
        this.trackEvent('file_download', {
            event_category: 'Downloads',
            event_label: fileName,
            file_type: fileType,
            download_url: downloadUrl,
            page_location: window.location.href
        });
    }
    
    /**
     * Track documentation usage
     */
    trackDocumentationUsage(docPage, action, section = null) {
        this.trackEvent('documentation_usage', {
            event_category: 'Documentation',
            event_label: docPage,
            doc_action: action,
            doc_section: section,
            page_location: window.location.href
        });
    }
    
    /**
     * Track user flows
     */
    trackUserFlow(flowName, step, stepData = {}) {
        this.trackEvent('user_flow', {
            event_category: 'User Flow',
            event_label: flowName,
            flow_step: step,
            ...stepData
        });
    }
    
    /**
     * Track search events
     */
    trackSearch(searchTerm, resultsCount, searchType = 'site_search') {
        this.trackEvent('search', {
            event_category: 'Search',
            search_term: searchTerm,
            search_type: searchType,
            results_count: resultsCount
        });
    }
    
    /**
     * Track engagement events
     */
    trackEngagement(engagementType, engagementValue, context = {}) {
        this.trackEvent('engagement', {
            event_category: 'Engagement',
            engagement_type: engagementType,
            engagement_value: engagementValue,
            ...context
        });
    }
    
    /**
     * Setup automatic event tracking
     */
    setupEventTracking() {
        // Initialize cross-page analytics if enabled
        if (window.ANALYTICS_CONFIG?.crossPageIntegration?.enableCrossPageTracking) {
            this.initializeCrossPageAnalytics();
        }
        
        // Track outbound links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.hostname !== window.location.hostname) {
                this.trackEvent('outbound_link', {
                    event_category: 'Outbound Links',
                    event_label: link.href,
                    link_text: link.textContent.trim()
                });
            }
        });
        
        // Track form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.tagName === 'FORM') {
                this.trackEvent('form_submit', {
                    event_category: 'Forms',
                    event_label: form.id || form.className || 'unnamed_form',
                    form_action: form.action || window.location.href
                });
            }
        });
        
        // Track scroll depth
        this.setupScrollTracking();
        
        // Track time on page
        this.setupTimeTracking();
        
        // Track error events
        this.setupErrorTracking();
    }
    
    /**
     * Setup scroll depth tracking
     */
    setupScrollTracking() {
        let scrollDepths = [25, 50, 75, 90, 100];
        let trackedDepths = new Set();
        
        const trackScrollDepth = () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            scrollDepths.forEach(depth => {
                if (scrollPercent >= depth && !trackedDepths.has(depth)) {
                    trackedDepths.add(depth);
                    this.trackEvent('scroll_depth', {
                        event_category: 'Engagement',
                        event_label: `${depth}%`,
                        scroll_depth: depth
                    });
                }
            });
        };
        
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(trackScrollDepth, 100);
        });
    }
    
    /**
     * Setup time on page tracking
     */
    setupTimeTracking() {
        const startTime = Date.now();
        let timeThresholds = [30, 60, 120, 300, 600]; // seconds
        let trackedTimes = new Set();
        
        const trackTimeOnPage = () => {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            
            timeThresholds.forEach(threshold => {
                if (timeOnPage >= threshold && !trackedTimes.has(threshold)) {
                    trackedTimes.add(threshold);
                    this.trackEvent('time_on_page', {
                        event_category: 'Engagement',
                        event_label: `${threshold}s`,
                        time_threshold: threshold
                    });
                }
            });
        };
        
        setInterval(trackTimeOnPage, 10000); // Check every 10 seconds
        
        // Track time on page when user leaves
        window.addEventListener('beforeunload', () => {
            const totalTime = Math.round((Date.now() - startTime) / 1000);
            this.trackEvent('session_duration', {
                event_category: 'Engagement',
                session_duration: totalTime
            });
        });
    }
    
    /**
     * Setup error tracking
     */
    setupErrorTracking() {
        window.addEventListener('error', (e) => {
            this.trackEvent('javascript_error', {
                event_category: 'Errors',
                event_label: e.message,
                error_filename: e.filename,
                error_line: e.lineno,
                error_column: e.colno
            });
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            this.trackEvent('promise_rejection', {
                event_category: 'Errors',
                event_label: e.reason?.message || 'Unhandled Promise Rejection'
            });
        });
    }
    
    /**
     * Process queued events
     */
    processEventQueue() {
        while (this.eventQueue.length > 0) {
            const { eventName, parameters } = this.eventQueue.shift();
            this.trackEvent(eventName, parameters);
        }
    }
    
    /**
     * Get content group for current page
     */
    getContentGroup() {
        const path = window.location.pathname;
        
        if (path.includes('/docs/')) return 'Documentation';
        if (path.includes('/blog/')) return 'Blog';
        if (path === '/') return 'Homepage';
        
        return 'Other';
    }
    
    /**
     * Get page type
     */
    getPageType() {
        const path = window.location.pathname;
        
        if (path === '/') return 'homepage';
        if (path.includes('/docs/installation')) return 'installation_guide';
        if (path.includes('/docs/quick-start')) return 'quick_start';
        if (path.includes('/docs/addon-development')) return 'development_guide';
        if (path.includes('/docs/')) return 'documentation';
        
        return 'other';
    }
    
    /**
     * Get user type (new vs returning)
     */
    getUserType() {
        const hasVisited = localStorage.getItem('user_visited');
        if (!hasVisited) {
            localStorage.setItem('user_visited', 'true');
            return 'new_user';
        }
        return 'returning_user';
    }
    
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    
    /**
     * Initialize cross-page analytics integration
     */
    initializeCrossPageAnalytics() {
        // Listen for cross-page analytics events
        document.addEventListener('crossPageAnalytics', (event) => {
            const { eventType, data } = event.detail;
            
            // Map cross-page events to GA4 events
            switch (eventType) {
                case 'cross_page_navigation':
                    this.trackEvent('cross_page_click', {
                        event_category: 'Cross Page Integration',
                        event_label: `${data.source.page} → ${data.target.href}`,
                        source_page: data.source.page,
                        target_page: data.target.href,
                        link_text: data.source.linkText,
                        time_on_page: data.interaction.timeOnPage
                    });
                    break;
                    
                case 'content_preview_interaction':
                    this.trackEvent('content_preview', {
                        event_category: 'Content Preview',
                        event_label: data.preview.title,
                        preview_action: data.preview.action,
                        preview_source: data.preview.source,
                        time_on_page: data.timeOnPage
                    });
                    break;
                    
                case 'related_content_click':
                    this.trackEvent('related_content', {
                        event_category: 'Related Content',
                        event_label: data.content.title,
                        content_position: data.content.position,
                        source_page: data.page,
                        target_href: data.content.href
                    });
                    break;
                    
                case 'breadcrumb_navigation':
                    this.trackEvent('breadcrumb_click', {
                        event_category: 'Navigation',
                        event_label: data.breadcrumb.text,
                        breadcrumb_level: data.breadcrumb.level,
                        source_page: data.page,
                        target_href: data.breadcrumb.href
                    });
                    break;
            }
        });
        
        console.log('Cross-page analytics integration initialized');
    }
    
    /**
     * Track cross-page integration metrics
     */
    trackCrossPageMetrics(metrics) {
        this.trackEvent('cross_page_metrics', {
            event_category: 'Cross Page Integration',
            event_label: 'Performance Metrics',
            ...metrics
        });
    }
    
    /**
     * Get analytics status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            consentGiven: this.consentGiven,
            queuedEvents: this.eventQueue.length,
            crossPageEnabled: window.ANALYTICS_CONFIG?.crossPageIntegration?.enableCrossPageTracking || false
        };
    }
}

// Initialize analytics when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsManager = new AnalyticsManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsManager;
}