/**
 * Cross-Page Integration Analytics Dashboard
 * Provides real-time monitoring and insights for homepage-documentation integration
 */

class CrossPageIntegrationDashboard {
    constructor() {
        this.config = {
            updateInterval: 30000, // 30 seconds
            dataRetentionDays: 30,
            alertThresholds: {
                lowEngagement: 0.2, // 20% engagement rate
                highBounceRate: 0.7, // 70% bounce rate
                slowNavigation: 3000, // 3 seconds
                lowConversion: 0.05 // 5% conversion rate
            },
            enableRealTimeUpdates: true,
            enableAlerts: true
        };

        this.metrics = {
            crossPageNavigation: {
                homepageToDocumentation: 0,
                documentationToHomepage: 0,
                totalCrossPageClicks: 0,
                averageTimeToClick: 0,
                conversionRate: 0
            },
            contentPreview: {
                totalPreviews: 0,
                expandedPreviews: 0,
                previewToPageClicks: 0,
                engagementRate: 0,
                popularPreviews: {}
            },
            relatedContent: {
                totalSuggestions: 0,
                clickedSuggestions: 0,
                clickThroughRate: 0,
                popularSuggestions: {},
                effectivenessByPosition: {}
            },
            breadcrumbNavigation: {
                totalClicks: 0,
                levelDistribution: {},
                returnToHomepage: 0,
                navigationEfficiency: 0
            },
            userJourney: {
                commonPaths: {},
                dropoffPoints: {},
                completionRates: {},
                averageSessionDuration: 0,
                pagesPerSession: 0
            },
            performance: {
                averageLoadTime: 0,
                navigationSpeed: 0,
                errorRate: 0,
                mobilePerformance: {}
            }
        };

        this.alerts = [];
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Initialize the dashboard
     */
    init() {
        this.setupDataCollection();
        this.createDashboardUI();
        this.startRealTimeUpdates();
        this.setupEventListeners();
        
        console.log('📊 Cross-page integration dashboard initialized');
        this.isInitialized = true;
    }

    /**
     * Setup data collection from various sources
     */
    setupDataCollection() {
        // Listen for cross-page analytics events
        document.addEventListener('crossPageAnalytics', (event) => {
            this.processAnalyticsEvent(event.detail);
        });

        // Collect data from existing analytics systems
        this.collectExistingData();

        // Setup periodic data aggregation
        setInterval(() => {
            this.aggregateMetrics();
        }, this.config.updateInterval);
    }

    /**
     * Process incoming analytics events
     */
    processAnalyticsEvent(eventData) {
        const { eventType, data } = eventData;

        switch (eventType) {
            case 'cross_page_navigation':
                this.processCrossPageNavigation(data);
                break;
            case 'content_preview_interaction':
                this.processContentPreview(data);
                break;
            case 'related_content_click':
                this.processRelatedContent(data);
                break;
            case 'breadcrumb_navigation':
                this.processBreadcrumbNavigation(data);
                break;
            default:
                this.processGenericEvent(eventType, data);
        }

        this.updateDashboard();
        this.checkAlerts();
    }

    /**
     * Process cross-page navigation events
     */
    processCrossPageNavigation(data) {
        const isHomepageToDoc = data.source.page === '/' && data.target.href.includes('/docs/');
        const isDocToHomepage = data.source.page.includes('/docs/') && (data.target.href === '/' || data.target.href.includes('#'));

        if (isHomepageToDoc) {
            this.metrics.crossPageNavigation.homepageToDocumentation++;
        } else if (isDocToHomepage) {
            this.metrics.crossPageNavigation.documentationToHomepage++;
        }

        this.metrics.crossPageNavigation.totalCrossPageClicks++;
        
        // Track time to click
        if (data.interaction.timeOnPage) {
            this.updateAverageTimeToClick(data.interaction.timeOnPage);
        }

        // Update user journey
        this.updateUserJourney(data.source.page, data.target.href);
    }

    /**
     * Process content preview interactions
     */
    processContentPreview(data) {
        this.metrics.contentPreview.totalPreviews++;

        if (data.preview.action === 'expand') {
            this.metrics.contentPreview.expandedPreviews++;
        } else if (data.preview.action === 'click') {
            this.metrics.contentPreview.previewToPageClicks++;
        }

        // Track popular previews
        const previewKey = data.preview.title || data.preview.source;
        this.metrics.contentPreview.popularPreviews[previewKey] = 
            (this.metrics.contentPreview.popularPreviews[previewKey] || 0) + 1;

        // Calculate engagement rate
        this.metrics.contentPreview.engagementRate = 
            (this.metrics.contentPreview.expandedPreviews + this.metrics.contentPreview.previewToPageClicks) / 
            this.metrics.contentPreview.totalPreviews;
    }

    /**
     * Process related content clicks
     */
    processRelatedContent(data) {
        this.metrics.relatedContent.totalSuggestions++;
        this.metrics.relatedContent.clickedSuggestions++;

        // Track popular suggestions
        const suggestionKey = data.content.title;
        this.metrics.relatedContent.popularSuggestions[suggestionKey] = 
            (this.metrics.relatedContent.popularSuggestions[suggestionKey] || 0) + 1;

        // Track effectiveness by position
        const position = data.content.position;
        if (!this.metrics.relatedContent.effectivenessByPosition[position]) {
            this.metrics.relatedContent.effectivenessByPosition[position] = { clicks: 0, impressions: 0 };
        }
        this.metrics.relatedContent.effectivenessByPosition[position].clicks++;

        // Calculate click-through rate
        this.metrics.relatedContent.clickThroughRate = 
            this.metrics.relatedContent.clickedSuggestions / this.metrics.relatedContent.totalSuggestions;
    }

    /**
     * Process breadcrumb navigation
     */
    processBreadcrumbNavigation(data) {
        this.metrics.breadcrumbNavigation.totalClicks++;

        // Track level distribution
        const level = data.breadcrumb.level;
        this.metrics.breadcrumbNavigation.levelDistribution[level] = 
            (this.metrics.breadcrumbNavigation.levelDistribution[level] || 0) + 1;

        // Track returns to homepage
        if (data.breadcrumb.href === '/' || data.breadcrumb.href.includes('index.html')) {
            this.metrics.breadcrumbNavigation.returnToHomepage++;
        }
    }

    /**
     * Update average time to click
     */
    updateAverageTimeToClick(timeOnPage) {
        const currentAverage = this.metrics.crossPageNavigation.averageTimeToClick;
        const totalClicks = this.metrics.crossPageNavigation.totalCrossPageClicks;
        
        this.metrics.crossPageNavigation.averageTimeToClick = 
            ((currentAverage * (totalClicks - 1)) + timeOnPage) / totalClicks;
    }

    /**
     * Update user journey tracking
     */
    updateUserJourney(fromPage, toPage) {
        const journeyKey = `${fromPage} → ${toPage}`;
        this.metrics.userJourney.commonPaths[journeyKey] = 
            (this.metrics.userJourney.commonPaths[journeyKey] || 0) + 1;
    }

    /**
     * Collect data from existing analytics systems
     */
    collectExistingData() {
        // Get data from localStorage analytics queue
        const analyticsQueue = JSON.parse(localStorage.getItem('analyticsQueue') || '[]');
        
        analyticsQueue.forEach(event => {
            if (event.eventType && event.data) {
                this.processAnalyticsEvent({ eventType: event.eventType, data: event.data });
            }
        });

        // Get data from user behavior tracker if available
        if (window.userBehaviorTracker) {
            const behaviorData = window.userBehaviorTracker.getAnalyticsSummary();
            this.processBehaviorData(behaviorData);
        }
    }

    /**
     * Process behavior data from user behavior tracker
     */
    processBehaviorData(behaviorData) {
        if (behaviorData.navigationPath) {
            behaviorData.navigationPath.forEach(path => {
                if (path.page) {
                    this.updateUserJourney(path.page.referrer || 'direct', path.page.path);
                }
            });
        }

        if (behaviorData.timeOnSite) {
            this.metrics.userJourney.averageSessionDuration = behaviorData.timeOnSite;
        }
    }

    /**
     * Aggregate metrics from various sources
     */
    aggregateMetrics() {
        // Calculate conversion rates
        this.calculateConversionRates();
        
        // Update performance metrics
        this.updatePerformanceMetrics();
        
        // Clean old data
        this.cleanOldData();
        
        // Save metrics to localStorage
        this.saveMetrics();
    }

    /**
     * Calculate conversion rates
     */
    calculateConversionRates() {
        const totalPageViews = this.getTotalPageViews();
        
        if (totalPageViews > 0) {
            this.metrics.crossPageNavigation.conversionRate = 
                this.metrics.crossPageNavigation.totalCrossPageClicks / totalPageViews;
        }

        // Calculate navigation efficiency
        const totalBreadcrumbClicks = this.metrics.breadcrumbNavigation.totalClicks;
        const returnClicks = this.metrics.breadcrumbNavigation.returnToHomepage;
        
        if (totalBreadcrumbClicks > 0) {
            this.metrics.breadcrumbNavigation.navigationEfficiency = returnClicks / totalBreadcrumbClicks;
        }
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics() {
        // Get performance data from browser API
        if (performance && performance.getEntriesByType) {
            const navigationEntries = performance.getEntriesByType('navigation');
            
            if (navigationEntries.length > 0) {
                const entry = navigationEntries[0];
                this.metrics.performance.averageLoadTime = entry.loadEventEnd - entry.loadEventStart;
                this.metrics.performance.navigationSpeed = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
            }
        }

        // Check for mobile performance
        if (window.innerWidth <= 768) {
            this.updateMobilePerformanceMetrics();
        }
    }

    /**
     * Update mobile performance metrics
     */
    updateMobilePerformanceMetrics() {
        this.metrics.performance.mobilePerformance = {
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            connectionType: navigator.connection?.effectiveType || 'unknown',
            touchSupport: 'ontouchstart' in window
        };
    }

    /**
     * Get total page views from analytics
     */
    getTotalPageViews() {
        // This would typically come from your analytics system
        // For now, estimate based on cross-page navigation
        return this.metrics.crossPageNavigation.totalCrossPageClicks * 2; // Rough estimate
    }

    /**
     * Create dashboard UI
     */
    createDashboardUI() {
        // Only create UI in development or if explicitly enabled
        if (!this.shouldShowDashboard()) {
            return;
        }

        this.createDashboardContainer();
        this.createMetricsDisplay();
        this.createChartsAndGraphs();
        this.createAlertsPanel();
    }

    /**
     * Check if dashboard should be shown
     */
    shouldShowDashboard() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               localStorage.getItem('show_analytics_dashboard') === 'true';
    }

    /**
     * Create dashboard container
     */
    createDashboardContainer() {
        const dashboard = document.createElement('div');
        dashboard.id = 'cross-page-analytics-dashboard';
        dashboard.className = 'analytics-dashboard';
        dashboard.innerHTML = `
            <div class="dashboard-header">
                <h3>📊 Cross-Page Integration Analytics</h3>
                <button class="dashboard-toggle" onclick="this.parentElement.parentElement.classList.toggle('minimized')">−</button>
            </div>
            <div class="dashboard-content">
                <div class="metrics-grid" id="metrics-grid"></div>
                <div class="charts-container" id="charts-container"></div>
                <div class="alerts-panel" id="alerts-panel"></div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .analytics-dashboard {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 400px;
                max-height: 600px;
                background: #2c3e50;
                color: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 12px;
                overflow: hidden;
                transition: all 0.3s ease;
            }
            .analytics-dashboard.minimized {
                height: 40px;
            }
            .analytics-dashboard.minimized .dashboard-content {
                display: none;
            }
            .dashboard-header {
                background: #34495e;
                padding: 10px 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #4a5f7a;
            }
            .dashboard-header h3 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
            }
            .dashboard-toggle {
                background: none;
                border: none;
                color: white;
                font-size: 16px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .dashboard-content {
                padding: 15px;
                max-height: 540px;
                overflow-y: auto;
            }
            .metrics-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-bottom: 15px;
            }
            .metric-card {
                background: #34495e;
                padding: 10px;
                border-radius: 4px;
                border-left: 3px solid #3498db;
            }
            .metric-card.warning {
                border-left-color: #f39c12;
            }
            .metric-card.error {
                border-left-color: #e74c3c;
            }
            .metric-title {
                font-size: 10px;
                color: #bdc3c7;
                margin-bottom: 5px;
                text-transform: uppercase;
            }
            .metric-value {
                font-size: 18px;
                font-weight: bold;
                color: white;
            }
            .metric-change {
                font-size: 10px;
                margin-top: 2px;
            }
            .metric-change.positive {
                color: #2ecc71;
            }
            .metric-change.negative {
                color: #e74c3c;
            }
            .charts-container {
                margin-bottom: 15px;
            }
            .chart {
                background: #34495e;
                padding: 10px;
                border-radius: 4px;
                margin-bottom: 10px;
            }
            .chart-title {
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 10px;
                color: #ecf0f1;
            }
            .alerts-panel {
                background: #34495e;
                border-radius: 4px;
                padding: 10px;
            }
            .alert {
                padding: 8px;
                margin-bottom: 8px;
                border-radius: 4px;
                font-size: 11px;
            }
            .alert.warning {
                background: rgba(243, 156, 18, 0.2);
                border-left: 3px solid #f39c12;
            }
            .alert.error {
                background: rgba(231, 76, 60, 0.2);
                border-left: 3px solid #e74c3c;
            }
            .alert.info {
                background: rgba(52, 152, 219, 0.2);
                border-left: 3px solid #3498db;
            }
            @media (max-width: 768px) {
                .analytics-dashboard {
                    width: 300px;
                    right: 10px;
                    top: 10px;
                }
                .metrics-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(dashboard);

        this.dashboardElement = dashboard;
    }

    /**
     * Create metrics display
     */
    createMetricsDisplay() {
        const metricsGrid = document.getElementById('metrics-grid');
        if (!metricsGrid) return;

        const metricsToShow = [
            {
                key: 'crossPageClicks',
                title: 'Cross-Page Clicks',
                value: () => this.metrics.crossPageNavigation.totalCrossPageClicks,
                format: 'number'
            },
            {
                key: 'conversionRate',
                title: 'Conversion Rate',
                value: () => this.metrics.crossPageNavigation.conversionRate,
                format: 'percentage'
            },
            {
                key: 'previewEngagement',
                title: 'Preview Engagement',
                value: () => this.metrics.contentPreview.engagementRate,
                format: 'percentage'
            },
            {
                key: 'relatedContentCTR',
                title: 'Related Content CTR',
                value: () => this.metrics.relatedContent.clickThroughRate,
                format: 'percentage'
            },
            {
                key: 'avgTimeToClick',
                title: 'Avg Time to Click',
                value: () => this.metrics.crossPageNavigation.averageTimeToClick,
                format: 'time'
            },
            {
                key: 'navigationEfficiency',
                title: 'Navigation Efficiency',
                value: () => this.metrics.breadcrumbNavigation.navigationEfficiency,
                format: 'percentage'
            }
        ];

        metricsGrid.innerHTML = metricsToShow.map(metric => `
            <div class="metric-card" id="metric-${metric.key}">
                <div class="metric-title">${metric.title}</div>
                <div class="metric-value" id="value-${metric.key}">
                    ${this.formatMetricValue(metric.value(), metric.format)}
                </div>
                <div class="metric-change" id="change-${metric.key}"></div>
            </div>
        `).join('');
    }

    /**
     * Format metric value based on type
     */
    formatMetricValue(value, format) {
        switch (format) {
            case 'percentage':
                return `${(value * 100).toFixed(1)}%`;
            case 'time':
                return `${(value / 1000).toFixed(1)}s`;
            case 'number':
                return value.toLocaleString();
            default:
                return value;
        }
    }

    /**
     * Create charts and graphs
     */
    createChartsAndGraphs() {
        const chartsContainer = document.getElementById('charts-container');
        if (!chartsContainer) return;

        // Create simple text-based charts for now
        chartsContainer.innerHTML = `
            <div class="chart">
                <div class="chart-title">Popular Cross-Page Paths</div>
                <div id="popular-paths"></div>
            </div>
            <div class="chart">
                <div class="chart-title">Content Preview Performance</div>
                <div id="preview-performance"></div>
            </div>
        `;

        this.updateCharts();
    }

    /**
     * Update charts with current data
     */
    updateCharts() {
        this.updatePopularPathsChart();
        this.updatePreviewPerformanceChart();
    }

    /**
     * Update popular paths chart
     */
    updatePopularPathsChart() {
        const pathsElement = document.getElementById('popular-paths');
        if (!pathsElement) return;

        const paths = Object.entries(this.metrics.userJourney.commonPaths)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        if (paths.length === 0) {
            pathsElement.innerHTML = '<div style="color: #95a5a6; font-style: italic;">No data yet</div>';
            return;
        }

        pathsElement.innerHTML = paths.map(([path, count]) => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="font-size: 10px; color: #bdc3c7;">${path}</span>
                <span style="font-weight: bold;">${count}</span>
            </div>
        `).join('');
    }

    /**
     * Update preview performance chart
     */
    updatePreviewPerformanceChart() {
        const performanceElement = document.getElementById('preview-performance');
        if (!performanceElement) return;

        const previews = Object.entries(this.metrics.contentPreview.popularPreviews)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);

        if (previews.length === 0) {
            performanceElement.innerHTML = '<div style="color: #95a5a6; font-style: italic;">No preview data yet</div>';
            return;
        }

        performanceElement.innerHTML = previews.map(([preview, count]) => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="font-size: 10px; color: #bdc3c7;">${preview.substring(0, 20)}...</span>
                <span style="font-weight: bold;">${count}</span>
            </div>
        `).join('');
    }

    /**
     * Create alerts panel
     */
    createAlertsPanel() {
        const alertsPanel = document.getElementById('alerts-panel');
        if (!alertsPanel) return;

        alertsPanel.innerHTML = `
            <div style="font-size: 12px; font-weight: 600; margin-bottom: 10px; color: #ecf0f1;">
                Alerts & Insights
            </div>
            <div id="alerts-list"></div>
        `;

        this.updateAlertsPanel();
    }

    /**
     * Update alerts panel
     */
    updateAlertsPanel() {
        const alertsList = document.getElementById('alerts-list');
        if (!alertsList) return;

        if (this.alerts.length === 0) {
            alertsList.innerHTML = '<div style="color: #2ecc71; font-style: italic;">All systems normal</div>';
            return;
        }

        alertsList.innerHTML = this.alerts.map(alert => `
            <div class="alert ${alert.type}">
                <strong>${alert.title}</strong><br>
                ${alert.message}
            </div>
        `).join('');
    }

    /**
     * Check for alerts based on thresholds
     */
    checkAlerts() {
        this.alerts = []; // Clear existing alerts

        // Check engagement rate
        if (this.metrics.contentPreview.engagementRate < this.config.alertThresholds.lowEngagement) {
            this.alerts.push({
                type: 'warning',
                title: 'Low Preview Engagement',
                message: `Preview engagement rate is ${(this.metrics.contentPreview.engagementRate * 100).toFixed(1)}%. Consider improving preview content.`
            });
        }

        // Check conversion rate
        if (this.metrics.crossPageNavigation.conversionRate < this.config.alertThresholds.lowConversion) {
            this.alerts.push({
                type: 'warning',
                title: 'Low Cross-Page Conversion',
                message: `Cross-page conversion rate is ${(this.metrics.crossPageNavigation.conversionRate * 100).toFixed(1)}%. Review link placement and content.`
            });
        }

        // Check navigation speed
        if (this.metrics.crossPageNavigation.averageTimeToClick > this.config.alertThresholds.slowNavigation) {
            this.alerts.push({
                type: 'info',
                title: 'Slow Navigation',
                message: `Average time to cross-page click is ${(this.metrics.crossPageNavigation.averageTimeToClick / 1000).toFixed(1)}s. Users may need clearer navigation cues.`
            });
        }

        // Check for positive trends
        if (this.metrics.crossPageNavigation.totalCrossPageClicks > 10) {
            this.alerts.push({
                type: 'info',
                title: 'Good Activity',
                message: `${this.metrics.crossPageNavigation.totalCrossPageClicks} cross-page navigations recorded. Integration is working well.`
            });
        }

        this.updateAlertsPanel();
    }

    /**
     * Update dashboard display
     */
    updateDashboard() {
        if (!this.shouldShowDashboard() || !this.dashboardElement) {
            return;
        }

        this.updateMetricsDisplay();
        this.updateCharts();
    }

    /**
     * Update metrics display with current values
     */
    updateMetricsDisplay() {
        const updates = [
            { key: 'crossPageClicks', value: this.metrics.crossPageNavigation.totalCrossPageClicks, format: 'number' },
            { key: 'conversionRate', value: this.metrics.crossPageNavigation.conversionRate, format: 'percentage' },
            { key: 'previewEngagement', value: this.metrics.contentPreview.engagementRate, format: 'percentage' },
            { key: 'relatedContentCTR', value: this.metrics.relatedContent.clickThroughRate, format: 'percentage' },
            { key: 'avgTimeToClick', value: this.metrics.crossPageNavigation.averageTimeToClick, format: 'time' },
            { key: 'navigationEfficiency', value: this.metrics.breadcrumbNavigation.navigationEfficiency, format: 'percentage' }
        ];

        updates.forEach(update => {
            const valueElement = document.getElementById(`value-${update.key}`);
            if (valueElement) {
                valueElement.textContent = this.formatMetricValue(update.value, update.format);
            }
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.config.enableRealTimeUpdates) {
                this.updateDashboard();
            }
        });

        // Listen for window resize
        window.addEventListener('resize', () => {
            this.updateMobilePerformanceMetrics();
        });
    }

    /**
     * Start real-time updates
     */
    startRealTimeUpdates() {
        if (!this.config.enableRealTimeUpdates) return;

        setInterval(() => {
            this.aggregateMetrics();
            this.updateDashboard();
        }, this.config.updateInterval);
    }

    /**
     * Save metrics to localStorage
     */
    saveMetrics() {
        const metricsData = {
            timestamp: Date.now(),
            metrics: this.metrics,
            alerts: this.alerts
        };

        localStorage.setItem('crossPageIntegrationMetrics', JSON.stringify(metricsData));
    }

    /**
     * Load metrics from localStorage
     */
    loadMetrics() {
        const saved = localStorage.getItem('crossPageIntegrationMetrics');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.metrics) {
                    this.metrics = { ...this.metrics, ...data.metrics };
                }
                if (data.alerts) {
                    this.alerts = data.alerts;
                }
            } catch (e) {
                console.warn('Failed to load saved metrics:', e);
            }
        }
    }

    /**
     * Clean old data
     */
    cleanOldData() {
        const cutoffTime = Date.now() - (this.config.dataRetentionDays * 24 * 60 * 60 * 1000);
        
        // This would typically clean data older than the retention period
        // For now, we'll just limit the size of certain collections
        
        // Limit user journey paths
        const pathEntries = Object.entries(this.metrics.userJourney.commonPaths);
        if (pathEntries.length > 100) {
            const topPaths = pathEntries
                .sort(([,a], [,b]) => b - a)
                .slice(0, 50)
                .reduce((acc, [path, count]) => {
                    acc[path] = count;
                    return acc;
                }, {});
            
            this.metrics.userJourney.commonPaths = topPaths;
        }
    }

    /**
     * Export metrics data
     */
    exportMetrics() {
        const exportData = {
            timestamp: Date.now(),
            metrics: this.metrics,
            alerts: this.alerts,
            config: this.config
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `cross-page-analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Get current metrics summary
     */
    getMetricsSummary() {
        return {
            crossPageNavigation: { ...this.metrics.crossPageNavigation },
            contentPreview: { ...this.metrics.contentPreview },
            relatedContent: { ...this.metrics.relatedContent },
            breadcrumbNavigation: { ...this.metrics.breadcrumbNavigation },
            userJourney: { ...this.metrics.userJourney },
            performance: { ...this.metrics.performance },
            alerts: [...this.alerts],
            lastUpdated: Date.now()
        };
    }

    /**
     * Process generic events
     */
    processGenericEvent(eventType, data) {
        // Handle other event types that might be relevant
        console.log(`📊 Processing generic event: ${eventType}`, data);
    }
}

// Initialize dashboard when DOM is ready
let crossPageDashboard;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        crossPageDashboard = new CrossPageIntegrationDashboard();
        window.CrossPageIntegrationDashboard = crossPageDashboard;
    });
} else {
    crossPageDashboard = new CrossPageIntegrationDashboard();
    window.CrossPageIntegrationDashboard = crossPageDashboard;
}

// Export for Node.js environments (testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrossPageIntegrationDashboard;
}