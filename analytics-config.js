/**
 * Analytics Configuration
 * Centralized configuration for all analytics and monitoring systems
 */

window.ANALYTICS_CONFIG = {
    // Google Analytics 4 Configuration
    googleAnalytics: {
        measurementId: 'G-XXXXXXXXXX', // Replace with actual GA4 measurement ID
        enableDebugMode: false, // Set to true for development
        sampleRate: 100, // 100% sampling for production
        enableUserConsent: true,
        enableCookieConsent: true
    },
    
    // Core Web Vitals Monitoring Configuration
    coreWebVitals: {
        enableContinuousMonitoring: true,
        enableAlerts: true,
        enableDashboard: true,
        monitoringInterval: 30000, // 30 seconds
        alertCooldown: 300000, // 5 minutes
        alertThresholds: {
            LCP: { warning: 2500, critical: 4000 },
            FID: { warning: 100, critical: 300 },
            CLS: { warning: 0.1, critical: 0.25 },
            FCP: { warning: 1800, critical: 3000 },
            TTFB: { warning: 800, critical: 1800 }
        }
    },
    
    // User Behavior Tracking Configuration
    userBehavior: {
        enableContentTracking: true,
        enableNavigationTracking: true,
        enableDownloadTracking: true,
        enableHeatmapTracking: true,
        enableScrollTracking: true,
        enableClickTracking: true,
        enableFormTracking: true,
        enableSearchTracking: true,
        heatmapSampleRate: 0.1, // 10% of users for heatmap
        trackingInterval: 5000, // 5 seconds
        maxEventsPerSession: 1000
    },
    
    // Cross-Page Integration Analytics Configuration
    crossPageIntegration: {
        enableCrossPageTracking: true,
        enableContentPreviewTracking: true,
        enableRelatedContentTracking: true,
        enableBreadcrumbTracking: true,
        enableUserJourneyTracking: true,
        enableFeatureFlagTracking: true,
        trackingBatchSize: 10,
        trackingBatchInterval: 300000, // 5 minutes
        enablePerformanceMonitoring: true,
        enableConversionTracking: true,
        sessionTimeout: 1800000, // 30 minutes
        enableDebugMode: false
    },
    
    // Privacy and Compliance
    privacy: {
        enableConsentBanner: true,
        consentExpiryDays: 30,
        enableDataMinimization: true,
        enableAnonymization: true,
        respectDoNotTrack: true
    },
    
    // Development and Debugging
    development: {
        enableConsoleLogging: false, // Set to true for development
        enableDebugDashboard: false,
        enableTestMode: false
    },
    
    // Performance Optimization
    performance: {
        enableLazyLoading: true,
        enableScriptDefer: true,
        enableEventThrottling: true,
        batchEventSending: true,
        maxBatchSize: 50
    }
};

// Environment-specific overrides
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Development environment
    window.ANALYTICS_CONFIG.googleAnalytics.enableDebugMode = true;
    window.ANALYTICS_CONFIG.development.enableConsoleLogging = true;
    window.ANALYTICS_CONFIG.development.enableDebugDashboard = true;
    window.ANALYTICS_CONFIG.userBehavior.heatmapSampleRate = 1.0; // 100% in development
}

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.ANALYTICS_CONFIG;
}