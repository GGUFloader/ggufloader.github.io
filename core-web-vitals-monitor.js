/**
 * Enhanced Core Web Vitals Monitoring with Continuous Tracking and Alerts
 * Extends the existing performance monitoring with real-time alerts and dashboard
 */

class CoreWebVitalsMonitor {
    constructor() {
        this.config = {
            enableContinuousMonitoring: true,
            enableAlerts: true,
            enableDashboard: true,
            alertThresholds: {
                LCP: { warning: 2500, critical: 4000 },
                FID: { warning: 100, critical: 300 },
                CLS: { warning: 0.1, critical: 0.25 },
                FCP: { warning: 1800, critical: 3000 },
                TTFB: { warning: 800, critical: 1800 }
            },
            monitoringInterval: 30000, // 30 seconds
            alertCooldown: 300000, // 5 minutes
            maxHistoryEntries: 100
        };
        
        this.metrics = {
            current: {},
            history: [],
            alerts: []
        };
        
        this.lastAlertTime = {};
        this.observers = {};
        this.monitoringActive = false;
        
        this.init();
    }
    
    /**
     * Initialize continuous monitoring
     */
    init() {
        if (!this.isSupported()) {
            console.warn('Core Web Vitals monitoring not fully supported in this browser');
            return;
        }
        
        this.setupContinuousMonitoring();
        this.setupAlertSystem();
        this.setupDashboard();
        this.startMonitoring();
        
        // Integrate with existing analytics
        this.integrateWithAnalytics();
    }
    
    /**
     * Check if monitoring is supported
     */
    isSupported() {
        return 'PerformanceObserver' in window && 
               'performance' in window &&
               typeof window.analyticsManager !== 'undefined';
    }
    
    /**
     * Setup continuous monitoring observers
     */
    setupContinuousMonitoring() {
        // Enhanced LCP monitoring with element tracking
        try {
            this.observers.lcp = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                const lcpData = {
                    metric: 'LCP',
                    value: lastEntry.startTime,
                    timestamp: Date.now(),
                    element: this.getElementInfo(lastEntry.element),
                    url: lastEntry.url,
                    rating: this.getRating(lastEntry.startTime, this.config.alertThresholds.LCP)
                };
                
                this.updateMetric(lcpData);
                this.checkAlert(lcpData);
            });
            
            this.observers.lcp.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            console.warn('LCP continuous monitoring setup failed:', e);
        }
        
        // Enhanced FID monitoring
        try {
            this.observers.fid = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    const fidData = {
                        metric: 'FID',
                        value: entry.processingStart - entry.startTime,
                        timestamp: Date.now(),
                        eventType: entry.name,
                        target: this.getElementInfo(entry.target),
                        rating: this.getRating(entry.processingStart - entry.startTime, this.config.alertThresholds.FID)
                    };
                    
                    this.updateMetric(fidData);
                    this.checkAlert(fidData);
                });
            });
            
            this.observers.fid.observe({ entryTypes: ['first-input'] });
        } catch (e) {
            console.warn('FID continuous monitoring setup failed:', e);
        }
        
        // Enhanced CLS monitoring with session tracking
        try {
            let clsValue = 0;
            let sessionValue = 0;
            let sessionEntries = [];
            
            this.observers.cls = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                
                entries.forEach((entry) => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        sessionValue += entry.value;
                        sessionEntries.push({
                            value: entry.value,
                            sources: entry.sources?.map(source => this.getElementInfo(source.node)) || [],
                            timestamp: Date.now()
                        });
                    }
                });
                
                const clsData = {
                    metric: 'CLS',
                    value: clsValue,
                    sessionValue: sessionValue,
                    timestamp: Date.now(),
                    entries: sessionEntries.slice(-5), // Keep last 5 entries
                    rating: this.getRating(clsValue, this.config.alertThresholds.CLS)
                };
                
                this.updateMetric(clsData);
                this.checkAlert(clsData);
            });
            
            this.observers.cls.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
            console.warn('CLS continuous monitoring setup failed:', e);
        }
        
        // Monitor additional metrics
        this.setupAdditionalMetrics();
    }
    
    /**
     * Setup additional performance metrics monitoring
     */
    setupAdditionalMetrics() {
        // Monitor FCP continuously
        const paintObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                if (entry.name === 'first-contentful-paint') {
                    const fcpData = {
                        metric: 'FCP',
                        value: entry.startTime,
                        timestamp: Date.now(),
                        rating: this.getRating(entry.startTime, this.config.alertThresholds.FCP)
                    };
                    
                    this.updateMetric(fcpData);
                    this.checkAlert(fcpData);
                }
            });
        });
        
        paintObserver.observe({ entryTypes: ['paint'] });
        
        // Monitor TTFB
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                const ttfb = navigation.responseStart - navigation.fetchStart;
                const ttfbData = {
                    metric: 'TTFB',
                    value: ttfb,
                    timestamp: Date.now(),
                    rating: this.getRating(ttfb, this.config.alertThresholds.TTFB)
                };
                
                this.updateMetric(ttfbData);
                this.checkAlert(ttfbData);
            }
        });
    }
    
    /**
     * Setup alert system
     */
    setupAlertSystem() {
        if (!this.config.enableAlerts) return;
        
        // Create alert container
        this.createAlertContainer();
        
        // Setup alert handlers
        this.setupAlertHandlers();
    }
    
    /**
     * Create alert container in DOM
     */
    createAlertContainer() {
        const alertContainer = document.createElement('div');
        alertContainer.id = 'cwv-alerts';
        alertContainer.className = 'cwv-alert-container';
        alertContainer.innerHTML = `
            <div class="cwv-alert-header">
                <h3>Performance Alerts</h3>
                <button class="cwv-alert-close" aria-label="Close alerts">×</button>
            </div>
            <div class="cwv-alert-list"></div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .cwv-alert-container {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 350px;
                max-height: 400px;
                background: #fff;
                border: 1px solid #e1e5e9;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                z-index: 10000;
                display: none;
                overflow: hidden;
            }
            .cwv-alert-header {
                background: #f8f9fa;
                padding: 12px 16px;
                border-bottom: 1px solid #e1e5e9;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .cwv-alert-header h3 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
                color: #2c3e50;
            }
            .cwv-alert-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #6c757d;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .cwv-alert-list {
                max-height: 320px;
                overflow-y: auto;
                padding: 8px;
            }
            .cwv-alert {
                padding: 12px;
                margin-bottom: 8px;
                border-radius: 6px;
                font-size: 13px;
                line-height: 1.4;
            }
            .cwv-alert.warning {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
            }
            .cwv-alert.critical {
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
            }
            .cwv-alert-metric {
                font-weight: 600;
                margin-bottom: 4px;
            }
            .cwv-alert-value {
                font-family: monospace;
                background: rgba(0,0,0,0.1);
                padding: 2px 4px;
                border-radius: 3px;
            }
            .cwv-alert-time {
                font-size: 11px;
                opacity: 0.7;
                margin-top: 4px;
            }
            @media (max-width: 768px) {
                .cwv-alert-container {
                    width: calc(100vw - 40px);
                    right: 20px;
                    left: 20px;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(alertContainer);
        
        // Handle close button
        alertContainer.querySelector('.cwv-alert-close').addEventListener('click', () => {
            alertContainer.style.display = 'none';
        });
    }
    
    /**
     * Setup alert handlers for administrators
     */
    setupAlertHandlers() {
        // Email alerts (if configured)
        this.setupEmailAlerts();
        
        // Browser notifications
        this.setupBrowserNotifications();
        
        // Console alerts for development
        this.setupConsoleAlerts();
    }
    
    /**
     * Setup email alerts for administrators
     */
    setupEmailAlerts() {
        // This would integrate with a backend service
        // For now, we'll log the alert data that could be sent
        this.emailAlertHandler = (alertData) => {
            console.log('Email alert would be sent:', {
                to: 'admin@ggufloader.github.io',
                subject: `Performance Alert: ${alertData.metric} ${alertData.severity}`,
                body: this.formatAlertEmail(alertData)
            });
        };
    }
    
    /**
     * Setup browser notifications
     */
    setupBrowserNotifications() {
        // Notification permissions disabled to avoid prompts
        this.browserNotificationHandler = (alertData) => {
            // Browser notifications disabled - using console logging instead
            console.log(`Performance Alert: ${alertData.metric} is ${alertData.severity}: ${alertData.value}ms`);
        };
    }
    
    /**
     * Setup console alerts for development
     */
    setupConsoleAlerts() {
        this.consoleAlertHandler = (alertData) => {
            const style = alertData.severity === 'critical' ? 
                'color: #fff; background: #dc3545; padding: 4px 8px; border-radius: 4px;' :
                'color: #856404; background: #fff3cd; padding: 4px 8px; border-radius: 4px;';
                
            console.warn(
                `%c⚠️ Performance Alert: ${alertData.metric}`,
                style,
                alertData
            );
        };
    }
    
    /**
     * Check if alert should be triggered
     */
    checkAlert(metricData) {
        if (!this.config.enableAlerts) return;
        
        const { metric, value, timestamp } = metricData;
        const thresholds = this.config.alertThresholds[metric];
        
        if (!thresholds) return;
        
        let severity = null;
        if (value >= thresholds.critical) {
            severity = 'critical';
        } else if (value >= thresholds.warning) {
            severity = 'warning';
        }
        
        if (severity) {
            // Check cooldown period
            const lastAlert = this.lastAlertTime[metric];
            if (lastAlert && (timestamp - lastAlert) < this.config.alertCooldown) {
                return;
            }
            
            const alertData = {
                ...metricData,
                severity,
                threshold: thresholds[severity],
                id: `${metric}-${timestamp}`
            };
            
            this.triggerAlert(alertData);
            this.lastAlertTime[metric] = timestamp;
        }
    }
    
    /**
     * Trigger alert
     */
    triggerAlert(alertData) {
        // Add to alerts history
        this.metrics.alerts.unshift(alertData);
        if (this.metrics.alerts.length > 50) {
            this.metrics.alerts = this.metrics.alerts.slice(0, 50);
        }
        
        // Show in UI
        this.showAlert(alertData);
        
        // Trigger handlers
        this.emailAlertHandler?.(alertData);
        this.browserNotificationHandler?.(alertData);
        this.consoleAlertHandler?.(alertData);
        
        // Send to analytics
        if (window.analyticsManager) {
            window.analyticsManager.trackEvent('performance_alert', {
                event_category: 'Performance',
                metric: alertData.metric,
                severity: alertData.severity,
                value: alertData.value,
                threshold: alertData.threshold
            });
        }
    }
    
    /**
     * Show alert in UI
     */
    showAlert(alertData) {
        const container = document.getElementById('cwv-alerts');
        const alertList = container.querySelector('.cwv-alert-list');
        
        const alertElement = document.createElement('div');
        alertElement.className = `cwv-alert ${alertData.severity}`;
        alertElement.innerHTML = `
            <div class="cwv-alert-metric">${alertData.metric} Alert</div>
            <div>Value: <span class="cwv-alert-value">${Math.round(alertData.value)}${this.getMetricUnit(alertData.metric)}</span></div>
            <div>Threshold: <span class="cwv-alert-value">${alertData.threshold}${this.getMetricUnit(alertData.metric)}</span></div>
            <div class="cwv-alert-time">${new Date(alertData.timestamp).toLocaleTimeString()}</div>
        `;
        
        alertList.insertBefore(alertElement, alertList.firstChild);
        container.style.display = 'block';
        
        // Auto-hide after 10 seconds for warnings, keep critical alerts
        if (alertData.severity === 'warning') {
            setTimeout(() => {
                if (alertElement.parentNode) {
                    alertElement.remove();
                    if (alertList.children.length === 0) {
                        container.style.display = 'none';
                    }
                }
            }, 10000);
        }
    }
    
    /**
     * Setup performance dashboard
     */
    setupDashboard() {
        if (!this.config.enableDashboard) return;
        
        this.createDashboard();
        this.updateDashboard();
        
        // Update dashboard every 30 seconds
        setInterval(() => {
            this.updateDashboard();
        }, 30000);
    }
    
    /**
     * Create performance dashboard
     */
    createDashboard() {
        // Create dashboard toggle button
        const toggleButton = document.createElement('button');
        toggleButton.id = 'cwv-dashboard-toggle';
        toggleButton.innerHTML = '📊';
        toggleButton.title = 'Performance Dashboard';
        toggleButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #2c3e50;
            color: white;
            border: none;
            font-size: 20px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 9999;
            transition: all 0.3s ease;
        `;
        
        toggleButton.addEventListener('mouseenter', () => {
            toggleButton.style.transform = 'scale(1.1)';
        });
        
        toggleButton.addEventListener('mouseleave', () => {
            toggleButton.style.transform = 'scale(1)';
        });
        
        document.body.appendChild(toggleButton);
        
        // Create dashboard panel
        const dashboard = document.createElement('div');
        dashboard.id = 'cwv-dashboard';
        dashboard.className = 'cwv-dashboard';
        dashboard.innerHTML = `
            <div class="cwv-dashboard-header">
                <h3>Performance Dashboard</h3>
                <button class="cwv-dashboard-close">×</button>
            </div>
            <div class="cwv-dashboard-content">
                <div class="cwv-metrics-grid">
                    <div class="cwv-metric-card" data-metric="LCP">
                        <div class="cwv-metric-label">LCP</div>
                        <div class="cwv-metric-value">-</div>
                        <div class="cwv-metric-rating">-</div>
                    </div>
                    <div class="cwv-metric-card" data-metric="FID">
                        <div class="cwv-metric-label">FID</div>
                        <div class="cwv-metric-value">-</div>
                        <div class="cwv-metric-rating">-</div>
                    </div>
                    <div class="cwv-metric-card" data-metric="CLS">
                        <div class="cwv-metric-label">CLS</div>
                        <div class="cwv-metric-value">-</div>
                        <div class="cwv-metric-rating">-</div>
                    </div>
                    <div class="cwv-metric-card" data-metric="FCP">
                        <div class="cwv-metric-label">FCP</div>
                        <div class="cwv-metric-value">-</div>
                        <div class="cwv-metric-rating">-</div>
                    </div>
                    <div class="cwv-metric-card" data-metric="TTFB">
                        <div class="cwv-metric-label">TTFB</div>
                        <div class="cwv-metric-value">-</div>
                        <div class="cwv-metric-rating">-</div>
                    </div>
                </div>
                <div class="cwv-history-section">
                    <h4>Recent History</h4>
                    <div class="cwv-history-list"></div>
                </div>
            </div>
        `;
        
        // Add dashboard styles
        const dashboardStyle = document.createElement('style');
        dashboardStyle.textContent = `
            .cwv-dashboard {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 600px;
                max-width: 90vw;
                max-height: 80vh;
                background: #fff;
                border: 1px solid #e1e5e9;
                border-radius: 12px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.2);
                z-index: 10001;
                display: none;
                overflow: hidden;
            }
            .cwv-dashboard-header {
                background: #f8f9fa;
                padding: 16px 20px;
                border-bottom: 1px solid #e1e5e9;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .cwv-dashboard-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #2c3e50;
            }
            .cwv-dashboard-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6c757d;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .cwv-dashboard-content {
                padding: 20px;
                max-height: calc(80vh - 80px);
                overflow-y: auto;
            }
            .cwv-metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                gap: 16px;
                margin-bottom: 24px;
            }
            .cwv-metric-card {
                background: #f8f9fa;
                padding: 16px;
                border-radius: 8px;
                text-align: center;
                border: 2px solid transparent;
                transition: all 0.3s ease;
            }
            .cwv-metric-card.good {
                border-color: #28a745;
                background: #d4edda;
            }
            .cwv-metric-card.needs-improvement {
                border-color: #ffc107;
                background: #fff3cd;
            }
            .cwv-metric-card.poor {
                border-color: #dc3545;
                background: #f8d7da;
            }
            .cwv-metric-label {
                font-size: 12px;
                font-weight: 600;
                color: #6c757d;
                margin-bottom: 8px;
            }
            .cwv-metric-value {
                font-size: 20px;
                font-weight: 700;
                color: #2c3e50;
                margin-bottom: 4px;
            }
            .cwv-metric-rating {
                font-size: 11px;
                text-transform: uppercase;
                font-weight: 600;
                opacity: 0.8;
            }
            .cwv-history-section h4 {
                margin: 0 0 12px 0;
                font-size: 14px;
                color: #2c3e50;
            }
            .cwv-history-list {
                max-height: 200px;
                overflow-y: auto;
            }
            .cwv-history-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                margin-bottom: 4px;
                background: #f8f9fa;
                border-radius: 6px;
                font-size: 13px;
            }
            .cwv-history-metric {
                font-weight: 600;
            }
            .cwv-history-value {
                font-family: monospace;
            }
            .cwv-history-time {
                color: #6c757d;
                font-size: 11px;
            }
        `;
        
        document.head.appendChild(dashboardStyle);
        document.body.appendChild(dashboard);
        
        // Handle toggle and close
        toggleButton.addEventListener('click', () => {
            dashboard.style.display = dashboard.style.display === 'none' ? 'block' : 'none';
        });
        
        dashboard.querySelector('.cwv-dashboard-close').addEventListener('click', () => {
            dashboard.style.display = 'none';
        });
    }
    
    /**
     * Update dashboard with current metrics
     */
    updateDashboard() {
        const dashboard = document.getElementById('cwv-dashboard');
        if (!dashboard) return;
        
        // Update metric cards
        Object.entries(this.metrics.current).forEach(([metric, data]) => {
            const card = dashboard.querySelector(`[data-metric="${metric}"]`);
            if (card && data) {
                const valueElement = card.querySelector('.cwv-metric-value');
                const ratingElement = card.querySelector('.cwv-metric-rating');
                
                valueElement.textContent = `${Math.round(data.value)}${this.getMetricUnit(metric)}`;
                ratingElement.textContent = data.rating;
                
                // Update card styling
                card.className = `cwv-metric-card ${data.rating}`;
            }
        });
        
        // Update history
        const historyList = dashboard.querySelector('.cwv-history-list');
        if (historyList) {
            historyList.innerHTML = '';
            
            this.metrics.history.slice(0, 10).forEach(entry => {
                const historyItem = document.createElement('div');
                historyItem.className = 'cwv-history-item';
                historyItem.innerHTML = `
                    <span class="cwv-history-metric">${entry.metric}</span>
                    <span class="cwv-history-value">${Math.round(entry.value)}${this.getMetricUnit(entry.metric)}</span>
                    <span class="cwv-history-time">${new Date(entry.timestamp).toLocaleTimeString()}</span>
                `;
                historyList.appendChild(historyItem);
            });
        }
    }
    
    /**
     * Start continuous monitoring
     */
    startMonitoring() {
        if (this.monitoringActive) return;
        
        this.monitoringActive = true;
        
        // Periodic health check
        this.monitoringInterval = setInterval(() => {
            this.performHealthCheck();
        }, this.config.monitoringInterval);
        
        console.log('Core Web Vitals continuous monitoring started');
    }
    
    /**
     * Stop monitoring
     */
    stopMonitoring() {
        this.monitoringActive = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        // Disconnect observers
        Object.values(this.observers).forEach(observer => {
            observer.disconnect();
        });
        
        console.log('Core Web Vitals monitoring stopped');
    }
    
    /**
     * Perform periodic health check
     */
    performHealthCheck() {
        const healthData = {
            timestamp: Date.now(),
            url: window.location.href,
            metrics: { ...this.metrics.current },
            memoryUsage: this.getMemoryUsage(),
            connectionInfo: this.getConnectionInfo()
        };
        
        // Send health check to analytics
        if (window.analyticsManager) {
            window.analyticsManager.trackEvent('performance_health_check', {
                event_category: 'Performance',
                ...healthData
            });
        }
    }
    
    /**
     * Update metric data
     */
    updateMetric(metricData) {
        this.metrics.current[metricData.metric] = metricData;
        
        // Add to history
        this.metrics.history.unshift(metricData);
        if (this.metrics.history.length > this.config.maxHistoryEntries) {
            this.metrics.history = this.metrics.history.slice(0, this.config.maxHistoryEntries);
        }
        
        // Update dashboard if visible
        if (document.getElementById('cwv-dashboard')?.style.display !== 'none') {
            this.updateDashboard();
        }
    }
    
    /**
     * Get element information for debugging
     */
    getElementInfo(element) {
        if (!element) return null;
        
        return {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
            src: element.src,
            href: element.href
        };
    }
    
    /**
     * Get performance rating
     */
    getRating(value, thresholds) {
        if (value <= thresholds.warning) return 'good';
        if (value <= thresholds.critical) return 'needs-improvement';
        return 'poor';
    }
    
    /**
     * Get metric unit
     */
    getMetricUnit(metric) {
        switch (metric) {
            case 'CLS':
                return '';
            default:
                return 'ms';
        }
    }
    
    /**
     * Get memory usage information
     */
    getMemoryUsage() {
        if ('memory' in performance) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }
    
    /**
     * Get connection information
     */
    getConnectionInfo() {
        if ('connection' in navigator) {
            return {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            };
        }
        return null;
    }
    
    /**
     * Format alert email
     */
    formatAlertEmail(alertData) {
        return `
Performance Alert Details:

Metric: ${alertData.metric}
Current Value: ${Math.round(alertData.value)}${this.getMetricUnit(alertData.metric)}
Threshold: ${alertData.threshold}${this.getMetricUnit(alertData.metric)}
Severity: ${alertData.severity}
Time: ${new Date(alertData.timestamp).toLocaleString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

Please investigate and take appropriate action.
        `;
    }
    
    /**
     * Integrate with existing analytics
     */
    integrateWithAnalytics() {
        // Extend existing performance monitoring
        if (window.GGUFPerformance) {
            window.GGUFPerformance.cwvMonitor = this;
        }
        
        // Add to analytics manager
        if (window.analyticsManager) {
            window.analyticsManager.cwvMonitor = this;
        }
    }
    
    /**
     * Get current status
     */
    getStatus() {
        return {
            monitoring: this.monitoringActive,
            metrics: this.metrics.current,
            alerts: this.metrics.alerts.length,
            lastUpdate: Math.max(...Object.values(this.metrics.current).map(m => m.timestamp || 0))
        };
    }
    
    /**
     * Export metrics data
     */
    exportMetrics() {
        return {
            config: this.config,
            metrics: this.metrics,
            status: this.getStatus(),
            exportTime: Date.now()
        };
    }
}

// Initialize Core Web Vitals Monitor
document.addEventListener('DOMContentLoaded', () => {
    // Wait for analytics to be ready
    setTimeout(() => {
        window.cwvMonitor = new CoreWebVitalsMonitor();
    }, 1000);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoreWebVitalsMonitor;
}