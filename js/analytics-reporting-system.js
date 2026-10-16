/**
 * Analytics Reporting System
 * Generates comprehensive reports for cross-page integration performance
 */

class AnalyticsReportingSystem {
    constructor() {
        this.config = {
            reportingInterval: 86400000, // 24 hours
            retentionPeriod: 2592000000, // 30 days
            enableAutomaticReports: true,
            enableEmailReports: false, // Would require backend integration
            reportFormats: ['json', 'csv', 'html'],
            enableRealTimeAlerts: true
        };

        this.reportTypes = {
            daily: 'Daily Performance Report',
            weekly: 'Weekly Analytics Summary',
            monthly: 'Monthly Integration Report',
            realTime: 'Real-Time Monitoring Report',
            custom: 'Custom Date Range Report'
        };

        this.dataCollectors = [];
        this.reportHistory = [];
        this.alertThresholds = {
            lowEngagement: 0.15,
            highBounceRate: 0.8,
            slowPerformance: 5000,
            errorRate: 0.05
        };

        this.init();
    }

    /**
     * Initialize the reporting system
     */
    init() {
        this.registerDataCollectors();
        this.setupAutomaticReporting();
        this.loadReportHistory();
        this.setupRealTimeMonitoring();

        console.log('📊 Analytics reporting system initialized');
    }

    /**
     * Register data collectors from various analytics systems
     */
    registerDataCollectors() {
        // Register cross-page analytics
        if (window.CrossPageAnalytics) {
            this.dataCollectors.push({
                name: 'CrossPageAnalytics',
                instance: window.CrossPageAnalytics,
                dataMethod: 'getAnalyticsSummary'
            });
        }

        // Register dashboard
        if (window.CrossPageIntegrationDashboard) {
            this.dataCollectors.push({
                name: 'IntegrationDashboard',
                instance: window.CrossPageIntegrationDashboard,
                dataMethod: 'getMetricsSummary'
            });
        }

        // Register content suggestion monitor
        if (window.ContentSuggestionMonitor) {
            this.dataCollectors.push({
                name: 'ContentSuggestionMonitor',
                instance: window.ContentSuggestionMonitor,
                dataMethod: 'getMetricsSummary'
            });
        }

        // Register user behavior tracker
        if (window.userBehaviorTracker) {
            this.dataCollectors.push({
                name: 'UserBehaviorTracker',
                instance: window.userBehaviorTracker,
                dataMethod: 'getAnalyticsSummary'
            });
        }

        // Register main analytics manager
        if (window.analyticsManager) {
            this.dataCollectors.push({
                name: 'AnalyticsManager',
                instance: window.analyticsManager,
                dataMethod: 'getStatus'
            });
        }
    }

    /**
     * Setup automatic reporting
     */
    setupAutomaticReporting() {
        if (!this.config.enableAutomaticReports) return;

        // Daily reports
        setInterval(() => {
            this.generateReport('daily');
        }, this.config.reportingInterval);

        // Weekly reports (every Sunday)
        const now = new Date();
        const msUntilSunday = (7 - now.getDay()) * 24 * 60 * 60 * 1000;
        setTimeout(() => {
            this.generateReport('weekly');
            setInterval(() => {
                this.generateReport('weekly');
            }, 7 * 24 * 60 * 60 * 1000); // Weekly
        }, msUntilSunday);

        // Monthly reports (first day of month)
        const msUntilFirstOfMonth = this.getMillisecondsUntilFirstOfMonth();
        setTimeout(() => {
            this.generateReport('monthly');
            setInterval(() => {
                this.generateReport('monthly');
            }, 30 * 24 * 60 * 60 * 1000); // Approximately monthly
        }, msUntilFirstOfMonth);
    }

    /**
     * Setup real-time monitoring
     */
    setupRealTimeMonitoring() {
        if (!this.config.enableRealTimeAlerts) return;

        setInterval(() => {
            this.checkRealTimeAlerts();
        }, 60000); // Check every minute
    }

    /**
     * Generate comprehensive report
     */
    async generateReport(reportType, dateRange = null) {
        const reportData = await this.collectReportData(dateRange);
        const report = this.compileReport(reportType, reportData);
        
        this.saveReport(report);
        this.processReport(report);

        return report;
    }

    /**
     * Collect data from all registered collectors
     */
    async collectReportData(dateRange = null) {
        const collectedData = {
            timestamp: Date.now(),
            dateRange: dateRange || this.getDefaultDateRange(),
            sources: {}
        };

        for (const collector of this.dataCollectors) {
            try {
                if (collector.instance && typeof collector.instance[collector.dataMethod] === 'function') {
                    collectedData.sources[collector.name] = collector.instance[collector.dataMethod]();
                }
            } catch (error) {
                console.warn(`Failed to collect data from ${collector.name}:`, error);
                collectedData.sources[collector.name] = { error: error.message };
            }
        }

        // Add localStorage data
        collectedData.sources.LocalStorage = this.collectLocalStorageData();

        // Add performance data
        collectedData.sources.Performance = this.collectPerformanceData();

        return collectedData;
    }

    /**
     * Collect data from localStorage
     */
    collectLocalStorageData() {
        const data = {};

        try {
            // Analytics queue
            data.analyticsQueue = JSON.parse(localStorage.getItem('analyticsQueue') || '[]');
            
            // Cross-page metrics
            data.crossPageMetrics = JSON.parse(localStorage.getItem('crossPageIntegrationMetrics') || '{}');
            
            // Suggestion batches
            data.suggestionBatches = JSON.parse(localStorage.getItem('suggestionBatches') || '[]');
            
            // User behavior data
            data.userBehaviorData = JSON.parse(localStorage.getItem('userBehaviorData') || '{}');

        } catch (error) {
            console.warn('Failed to collect localStorage data:', error);
            data.error = error.message;
        }

        return data;
    }

    /**
     * Collect performance data
     */
    collectPerformanceData() {
        const data = {
            navigation: {},
            resources: [],
            memory: {},
            connection: {}
        };

        try {
            // Navigation timing
            if (performance.getEntriesByType) {
                const navEntries = performance.getEntriesByType('navigation');
                if (navEntries.length > 0) {
                    const nav = navEntries[0];
                    data.navigation = {
                        domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
                        loadComplete: nav.loadEventEnd - nav.loadEventStart,
                        firstPaint: nav.responseEnd - nav.requestStart,
                        ttfb: nav.responseStart - nav.requestStart
                    };
                }

                // Resource timing
                data.resources = performance.getEntriesByType('resource')
                    .filter(entry => entry.name.includes('js/') || entry.name.includes('css/'))
                    .map(entry => ({
                        name: entry.name,
                        duration: entry.duration,
                        size: entry.transferSize
                    }));
            }

            // Memory usage (if available)
            if (performance.memory) {
                data.memory = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                };
            }

            // Connection info (if available)
            if (navigator.connection) {
                data.connection = {
                    effectiveType: navigator.connection.effectiveType,
                    downlink: navigator.connection.downlink,
                    rtt: navigator.connection.rtt
                };
            }

        } catch (error) {
            console.warn('Failed to collect performance data:', error);
            data.error = error.message;
        }

        return data;
    }

    /**
     * Compile report from collected data
     */
    compileReport(reportType, collectedData) {
        const report = {
            id: this.generateReportId(),
            type: reportType,
            title: this.reportTypes[reportType] || 'Analytics Report',
            generatedAt: new Date().toISOString(),
            dateRange: collectedData.dateRange,
            summary: this.generateSummary(collectedData),
            metrics: this.compileMetrics(collectedData),
            insights: this.generateInsights(collectedData),
            recommendations: this.generateRecommendations(collectedData),
            alerts: this.checkAlerts(collectedData),
            rawData: collectedData
        };

        return report;
    }

    /**
     * Generate report summary
     */
    generateSummary(data) {
        const summary = {
            totalPageViews: 0,
            crossPageNavigations: 0,
            contentSuggestionClicks: 0,
            averageEngagementRate: 0,
            topPerformingContent: [],
            keyMetrics: {}
        };

        try {
            // Extract key metrics from different sources
            if (data.sources.IntegrationDashboard) {
                const dashboard = data.sources.IntegrationDashboard;
                summary.crossPageNavigations = dashboard.crossPageNavigation?.totalCrossPageClicks || 0;
                summary.averageEngagementRate = dashboard.contentPreview?.engagementRate || 0;
            }

            if (data.sources.ContentSuggestionMonitor) {
                const suggestions = data.sources.ContentSuggestionMonitor;
                summary.contentSuggestionClicks = suggestions.suggestions?.totalClicks || 0;
                summary.topPerformingContent = Object.entries(suggestions.relatedContent?.popularContent || {})
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5);
            }

            if (data.sources.UserBehaviorTracker) {
                const behavior = data.sources.UserBehaviorTracker;
                summary.totalPageViews = behavior.pageViews?.length || 0;
            }

            // Calculate key metrics
            summary.keyMetrics = {
                conversionRate: this.calculateConversionRate(data),
                bounceRate: this.calculateBounceRate(data),
                averageSessionDuration: this.calculateAverageSessionDuration(data),
                mobileUsage: this.calculateMobileUsage(data)
            };

        } catch (error) {
            console.warn('Failed to generate summary:', error);
            summary.error = error.message;
        }

        return summary;
    }

    /**
     * Compile metrics from all sources
     */
    compileMetrics(data) {
        const metrics = {
            crossPageIntegration: {},
            contentSuggestions: {},
            userBehavior: {},
            performance: {},
            errors: []
        };

        try {
            // Cross-page integration metrics
            if (data.sources.IntegrationDashboard) {
                metrics.crossPageIntegration = data.sources.IntegrationDashboard;
            }

            // Content suggestion metrics
            if (data.sources.ContentSuggestionMonitor) {
                metrics.contentSuggestions = data.sources.ContentSuggestionMonitor;
            }

            // User behavior metrics
            if (data.sources.UserBehaviorTracker) {
                metrics.userBehavior = data.sources.UserBehaviorTracker;
            }

            // Performance metrics
            if (data.sources.Performance) {
                metrics.performance = data.sources.Performance;
            }

            // Collect errors from all sources
            Object.entries(data.sources).forEach(([source, sourceData]) => {
                if (sourceData.error) {
                    metrics.errors.push({
                        source: source,
                        error: sourceData.error,
                        timestamp: Date.now()
                    });
                }
            });

        } catch (error) {
            console.warn('Failed to compile metrics:', error);
            metrics.compilationError = error.message;
        }

        return metrics;
    }

    /**
     * Generate insights from data
     */
    generateInsights(data) {
        const insights = [];

        try {
            // Cross-page navigation insights
            const crossPageData = data.sources.IntegrationDashboard?.crossPageNavigation;
            if (crossPageData) {
                if (crossPageData.conversionRate > 0.1) {
                    insights.push({
                        type: 'positive',
                        category: 'Cross-Page Navigation',
                        message: `Strong cross-page conversion rate of ${(crossPageData.conversionRate * 100).toFixed(1)}%`,
                        impact: 'high'
                    });
                }

                if (crossPageData.averageTimeToClick < 3000) {
                    insights.push({
                        type: 'positive',
                        category: 'User Experience',
                        message: `Users quickly find cross-page links (avg ${(crossPageData.averageTimeToClick / 1000).toFixed(1)}s)`,
                        impact: 'medium'
                    });
                }
            }

            // Content suggestion insights
            const suggestionData = data.sources.ContentSuggestionMonitor?.suggestions;
            if (suggestionData) {
                const bestType = this.getBestPerformingType(suggestionData.byType);
                if (bestType) {
                    insights.push({
                        type: 'informational',
                        category: 'Content Suggestions',
                        message: `${bestType.type} suggestions perform best with ${(bestType.ctr * 100).toFixed(1)}% CTR`,
                        impact: 'medium'
                    });
                }
            }

            // Performance insights
            const perfData = data.sources.Performance;
            if (perfData?.navigation) {
                if (perfData.navigation.loadComplete < 2000) {
                    insights.push({
                        type: 'positive',
                        category: 'Performance',
                        message: `Fast page load times (${perfData.navigation.loadComplete.toFixed(0)}ms)`,
                        impact: 'high'
                    });
                } else if (perfData.navigation.loadComplete > 5000) {
                    insights.push({
                        type: 'warning',
                        category: 'Performance',
                        message: `Slow page load times (${perfData.navigation.loadComplete.toFixed(0)}ms)`,
                        impact: 'high'
                    });
                }
            }

            // User behavior insights
            const behaviorData = data.sources.UserBehaviorTracker;
            if (behaviorData?.timeOnSite > 120000) { // 2 minutes
                insights.push({
                    type: 'positive',
                    category: 'Engagement',
                    message: `High user engagement with average session duration of ${(behaviorData.timeOnSite / 60000).toFixed(1)} minutes`,
                    impact: 'high'
                });
            }

        } catch (error) {
            console.warn('Failed to generate insights:', error);
            insights.push({
                type: 'error',
                category: 'System',
                message: `Failed to generate insights: ${error.message}`,
                impact: 'low'
            });
        }

        return insights;
    }

    /**
     * Generate recommendations
     */
    generateRecommendations(data) {
        const recommendations = [];

        try {
            // Cross-page navigation recommendations
            const crossPageData = data.sources.IntegrationDashboard?.crossPageNavigation;
            if (crossPageData) {
                if (crossPageData.conversionRate < 0.05) {
                    recommendations.push({
                        priority: 'high',
                        category: 'Cross-Page Integration',
                        title: 'Improve Cross-Page Conversion',
                        description: 'Low cross-page conversion rate detected. Consider improving link visibility and placement.',
                        actions: [
                            'Review link placement on homepage',
                            'Improve call-to-action text',
                            'Add more contextual links',
                            'Test different link styles'
                        ]
                    });
                }

                if (crossPageData.averageTimeToClick > 10000) {
                    recommendations.push({
                        priority: 'medium',
                        category: 'User Experience',
                        title: 'Reduce Time to Navigation',
                        description: 'Users take too long to find cross-page links. Improve navigation clarity.',
                        actions: [
                            'Make links more prominent',
                            'Add navigation hints',
                            'Improve page layout',
                            'Consider adding a navigation guide'
                        ]
                    });
                }
            }

            // Content suggestion recommendations
            const suggestionData = data.sources.ContentSuggestionMonitor;
            if (suggestionData?.suggestions?.clickThroughRate < 0.03) {
                recommendations.push({
                    priority: 'high',
                    category: 'Content Suggestions',
                    title: 'Improve Suggestion Relevance',
                    description: 'Low click-through rate on content suggestions indicates poor relevance.',
                    actions: [
                        'Review suggestion algorithm',
                        'Improve content matching',
                        'Test different suggestion formats',
                        'Add user feedback mechanism'
                    ]
                });
            }

            // Performance recommendations
            const perfData = data.sources.Performance;
            if (perfData?.navigation?.loadComplete > 3000) {
                recommendations.push({
                    priority: 'high',
                    category: 'Performance',
                    title: 'Optimize Page Load Speed',
                    description: 'Slow page load times may impact user experience and conversions.',
                    actions: [
                        'Optimize JavaScript loading',
                        'Compress images and assets',
                        'Enable browser caching',
                        'Consider using a CDN'
                    ]
                });
            }

            // Mobile recommendations
            if (this.calculateMobileUsage(data) > 0.6) {
                recommendations.push({
                    priority: 'medium',
                    category: 'Mobile Experience',
                    title: 'Optimize for Mobile',
                    description: 'High mobile usage detected. Ensure optimal mobile experience.',
                    actions: [
                        'Test mobile navigation',
                        'Optimize touch targets',
                        'Improve mobile loading speed',
                        'Test cross-page flows on mobile'
                    ]
                });
            }

        } catch (error) {
            console.warn('Failed to generate recommendations:', error);
            recommendations.push({
                priority: 'low',
                category: 'System',
                title: 'Fix Recommendation Generation',
                description: `Error generating recommendations: ${error.message}`,
                actions: ['Check analytics system configuration']
            });
        }

        return recommendations;
    }

    /**
     * Check for alerts
     */
    checkAlerts(data) {
        const alerts = [];

        try {
            // Check engagement rate
            const engagementRate = data.sources.IntegrationDashboard?.contentPreview?.engagementRate || 0;
            if (engagementRate < this.alertThresholds.lowEngagement) {
                alerts.push({
                    level: 'warning',
                    category: 'Engagement',
                    message: `Low engagement rate: ${(engagementRate * 100).toFixed(1)}%`,
                    threshold: this.alertThresholds.lowEngagement,
                    value: engagementRate
                });
            }

            // Check performance
            const loadTime = data.sources.Performance?.navigation?.loadComplete || 0;
            if (loadTime > this.alertThresholds.slowPerformance) {
                alerts.push({
                    level: 'error',
                    category: 'Performance',
                    message: `Slow page load: ${loadTime.toFixed(0)}ms`,
                    threshold: this.alertThresholds.slowPerformance,
                    value: loadTime
                });
            }

            // Check error rate
            const errorCount = data.sources.Performance?.errors?.length || 0;
            const totalRequests = data.sources.Performance?.resources?.length || 1;
            const errorRate = errorCount / totalRequests;
            
            if (errorRate > this.alertThresholds.errorRate) {
                alerts.push({
                    level: 'error',
                    category: 'Errors',
                    message: `High error rate: ${(errorRate * 100).toFixed(1)}%`,
                    threshold: this.alertThresholds.errorRate,
                    value: errorRate
                });
            }

        } catch (error) {
            console.warn('Failed to check alerts:', error);
            alerts.push({
                level: 'error',
                category: 'System',
                message: `Alert checking failed: ${error.message}`,
                value: null
            });
        }

        return alerts;
    }

    /**
     * Check real-time alerts
     */
    checkRealTimeAlerts() {
        this.collectReportData().then(data => {
            const alerts = this.checkAlerts(data);
            
            alerts.forEach(alert => {
                if (alert.level === 'error') {
                    this.triggerAlert(alert);
                }
            });
        }).catch(error => {
            console.warn('Failed to check real-time alerts:', error);
        });
    }

    /**
     * Trigger alert
     */
    triggerAlert(alert) {
        console.warn('🚨 Analytics Alert:', alert);

        // Browser notifications disabled to avoid prompts
        // Using console logging instead

        // Store alert for dashboard
        const storedAlerts = JSON.parse(localStorage.getItem('analyticsAlerts') || '[]');
        storedAlerts.push({
            ...alert,
            timestamp: Date.now()
        });

        // Keep only last 50 alerts
        if (storedAlerts.length > 50) {
            storedAlerts.splice(0, storedAlerts.length - 50);
        }

        localStorage.setItem('analyticsAlerts', JSON.stringify(storedAlerts));
    }

    /**
     * Save report
     */
    saveReport(report) {
        // Save to localStorage
        const reports = JSON.parse(localStorage.getItem('analyticsReports') || '[]');
        reports.push({
            id: report.id,
            type: report.type,
            generatedAt: report.generatedAt,
            summary: report.summary
        });

        // Keep only last 30 reports
        if (reports.length > 30) {
            reports.splice(0, reports.length - 30);
        }

        localStorage.setItem('analyticsReports', JSON.stringify(reports));
        localStorage.setItem(`analyticsReport_${report.id}`, JSON.stringify(report));

        this.reportHistory.push(report);
    }

    /**
     * Process report (send notifications, etc.)
     */
    processReport(report) {
        // Log report generation
        console.log(`📊 Generated ${report.type} report:`, report.id);

        // Send to dashboard if available
        if (window.CrossPageIntegrationDashboard) {
            // Dashboard can display report summary
            console.log('Report summary:', report.summary);
        }

        // Trigger alerts if any
        if (report.alerts.length > 0) {
            report.alerts.forEach(alert => {
                if (alert.level === 'error') {
                    this.triggerAlert(alert);
                }
            });
        }
    }

    /**
     * Export report in different formats
     */
    exportReport(reportId, format = 'json') {
        const report = JSON.parse(localStorage.getItem(`analyticsReport_${reportId}`) || '{}');
        
        if (!report.id) {
            throw new Error('Report not found');
        }

        switch (format) {
            case 'json':
                return this.exportAsJSON(report);
            case 'csv':
                return this.exportAsCSV(report);
            case 'html':
                return this.exportAsHTML(report);
            default:
                throw new Error('Unsupported format');
        }
    }

    /**
     * Export as JSON
     */
    exportAsJSON(report) {
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, `analytics-report-${report.id}.json`);
    }

    /**
     * Export as CSV
     */
    exportAsCSV(report) {
        const csvData = this.convertToCSV(report);
        const blob = new Blob([csvData], { type: 'text/csv' });
        this.downloadBlob(blob, `analytics-report-${report.id}.csv`);
    }

    /**
     * Export as HTML
     */
    exportAsHTML(report) {
        const htmlContent = this.generateHTMLReport(report);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        this.downloadBlob(blob, `analytics-report-${report.id}.html`);
    }

    /**
     * Generate HTML report
     */
    generateHTMLReport(report) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>${report.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .metric { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .alert { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .alert.warning { background: #fff3cd; border-left: 4px solid #ffc107; }
        .alert.error { background: #f8d7da; border-left: 4px solid #dc3545; }
        .recommendation { background: #d1ecf1; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #17a2b8; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${report.title}</h1>
        <p>Generated: ${new Date(report.generatedAt).toLocaleString()}</p>
        <p>Report ID: ${report.id}</p>
    </div>

    <h2>Summary</h2>
    <div class="metric">
        <h3>Key Metrics</h3>
        <ul>
            <li>Cross-Page Navigations: ${report.summary.crossPageNavigations}</li>
            <li>Content Suggestion Clicks: ${report.summary.contentSuggestionClicks}</li>
            <li>Average Engagement Rate: ${(report.summary.averageEngagementRate * 100).toFixed(1)}%</li>
            <li>Conversion Rate: ${(report.summary.keyMetrics.conversionRate * 100).toFixed(1)}%</li>
        </ul>
    </div>

    <h2>Alerts</h2>
    ${report.alerts.map(alert => `
        <div class="alert ${alert.level}">
            <strong>${alert.category}:</strong> ${alert.message}
        </div>
    `).join('')}

    <h2>Recommendations</h2>
    ${report.recommendations.map(rec => `
        <div class="recommendation">
            <h4>${rec.title} (${rec.priority} priority)</h4>
            <p>${rec.description}</p>
            <ul>
                ${rec.actions.map(action => `<li>${action}</li>`).join('')}
            </ul>
        </div>
    `).join('')}

    <h2>Insights</h2>
    ${report.insights.map(insight => `
        <div class="metric">
            <strong>${insight.category}:</strong> ${insight.message}
        </div>
    `).join('')}
</body>
</html>`;
    }

    /**
     * Helper methods
     */
    generateReportId() {
        return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getDefaultDateRange() {
        const end = new Date();
        const start = new Date(end.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
        return { start: start.toISOString(), end: end.toISOString() };
    }

    getMillisecondsUntilFirstOfMonth() {
        const now = new Date();
        const firstOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return firstOfNextMonth.getTime() - now.getTime();
    }

    calculateConversionRate(data) {
        const crossPageClicks = data.sources.IntegrationDashboard?.crossPageNavigation?.totalCrossPageClicks || 0;
        const totalPageViews = data.sources.UserBehaviorTracker?.pageViews?.length || 1;
        return crossPageClicks / totalPageViews;
    }

    calculateBounceRate(data) {
        // Simplified bounce rate calculation
        const totalSessions = data.sources.UserBehaviorTracker?.pageViews?.length || 1;
        const singlePageSessions = Math.floor(totalSessions * 0.3); // Estimate
        return singlePageSessions / totalSessions;
    }

    calculateAverageSessionDuration(data) {
        return data.sources.UserBehaviorTracker?.timeOnSite || 0;
    }

    calculateMobileUsage(data) {
        // Estimate mobile usage based on viewport width
        return window.innerWidth <= 768 ? 0.7 : 0.3; // Simplified
    }

    getBestPerformingType(typeData) {
        if (!typeData) return null;
        
        return Object.entries(typeData)
            .reduce((best, [type, data]) => 
                data.ctr > (best?.ctr || 0) ? { type, ...data } : best, null);
    }

    convertToCSV(report) {
        // Simplified CSV conversion
        const rows = [
            ['Metric', 'Value'],
            ['Report ID', report.id],
            ['Generated At', report.generatedAt],
            ['Cross-Page Navigations', report.summary.crossPageNavigations],
            ['Content Suggestion Clicks', report.summary.contentSuggestionClicks],
            ['Engagement Rate', (report.summary.averageEngagementRate * 100).toFixed(1) + '%']
        ];

        return rows.map(row => row.join(',')).join('\n');
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    loadReportHistory() {
        const reports = JSON.parse(localStorage.getItem('analyticsReports') || '[]');
        this.reportHistory = reports;
    }

    /**
     * Public API
     */
    getReportHistory() {
        return this.reportHistory;
    }

    getReport(reportId) {
        return JSON.parse(localStorage.getItem(`analyticsReport_${reportId}`) || '{}');
    }

    deleteReport(reportId) {
        localStorage.removeItem(`analyticsReport_${reportId}`);
        this.reportHistory = this.reportHistory.filter(r => r.id !== reportId);
        
        const reports = JSON.parse(localStorage.getItem('analyticsReports') || '[]');
        const updatedReports = reports.filter(r => r.id !== reportId);
        localStorage.setItem('analyticsReports', JSON.stringify(updatedReports));
    }
}

// Initialize reporting system
let analyticsReportingSystem;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        analyticsReportingSystem = new AnalyticsReportingSystem();
        window.AnalyticsReportingSystem = analyticsReportingSystem;
    });
} else {
    analyticsReportingSystem = new AnalyticsReportingSystem();
    window.AnalyticsReportingSystem = analyticsReportingSystem;
}

// Export for Node.js environments (testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsReportingSystem;
}