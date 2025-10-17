#!/usr/bin/env node

/**
 * Cross-Page Integration Dashboard
 * Provides real-time monitoring and health status of cross-page features
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

class CrossPageDashboard {
    constructor() {
        this.port = process.env.PORT || 3001;
        this.refreshInterval = 30000; // 30 seconds
        this.healthData = {
            lastUpdate: null,
            linkIntegrity: null,
            contentPreviews: null,
            functionality: null,
            performance: null,
            alerts: []
        };
        
        this.startHealthMonitoring();
    }

    /**
     * Start the dashboard server
     */
    start() {
        const server = http.createServer((req, res) => {
            const parsedUrl = url.parse(req.url, true);
            
            switch (parsedUrl.pathname) {
                case '/':
                    this.serveDashboard(res);
                    break;
                case '/api/health':
                    this.serveHealthData(res);
                    break;
                case '/api/refresh':
                    this.refreshHealthData().then(() => {
                        this.serveHealthData(res);
                    });
                    break;
                default:
                    res.writeHead(404);
                    res.end('Not Found');
            }
        });

        server.listen(this.port, () => {
            console.log(`🚀 Cross-Page Integration Dashboard running at http://localhost:${this.port}`);
        });
    }

    /**
     * Serve the main dashboard HTML
     */
    serveDashboard(res) {
        const html = this.generateDashboardHTML();
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    }

    /**
     * Serve health data as JSON
     */
    serveHealthData(res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(this.healthData, null, 2));
    }

    /**
     * Generate dashboard HTML
     */
    generateDashboardHTML() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cross-Page Integration Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header h1 { color: #333; margin-bottom: 10px; }
        .last-update { color: #666; font-size: 14px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .card h2 { color: #333; margin-bottom: 15px; font-size: 18px; }
        .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status.healthy { background: #d4edda; color: #155724; }
        .status.warning { background: #fff3cd; color: #856404; }
        .status.error { background: #f8d7da; color: #721c24; }
        .metric { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #eee; }
        .metric:last-child { border-bottom: none; }
        .metric-label { font-weight: 500; }
        .metric-value { color: #666; }
        .alerts { margin-top: 20px; }
        .alert { padding: 12px; margin-bottom: 10px; border-radius: 4px; border-left: 4px solid; }
        .alert.error { background: #f8d7da; border-color: #dc3545; color: #721c24; }
        .alert.warning { background: #fff3cd; border-color: #ffc107; color: #856404; }
        .alert.info { background: #d1ecf1; border-color: #17a2b8; color: #0c5460; }
        .refresh-btn { background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
        .refresh-btn:hover { background: #0056b3; }
        .loading { opacity: 0.6; pointer-events: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Cross-Page Integration Dashboard</h1>
            <div class="last-update">Last updated: <span id="lastUpdate">Loading...</span></div>
            <button class="refresh-btn" onclick="refreshData()">Refresh Data</button>
        </div>
        
        <div class="grid">
            <div class="card">
                <h2>Link Integrity</h2>
                <div id="linkIntegrity">Loading...</div>
            </div>
            
            <div class="card">
                <h2>Content Previews</h2>
                <div id="contentPreviews">Loading...</div>
            </div>
            
            <div class="card">
                <h2>Functionality Tests</h2>
                <div id="functionality">Loading...</div>
            </div>
            
            <div class="card">
                <h2>Performance Metrics</h2>
                <div id="performance">Loading...</div>
            </div>
        </div>
        
        <div class="alerts">
            <h2>Active Alerts</h2>
            <div id="alerts">Loading...</div>
        </div>
    </div>

    <script>
        let refreshTimer;
        
        function refreshData() {
            document.body.classList.add('loading');
            
            fetch('/api/refresh')
                .then(response => response.json())
                .then(data => {
                    updateDashboard(data);
                    document.body.classList.remove('loading');
                })
                .catch(error => {
                    console.error('Error refreshing data:', error);
                    document.body.classList.remove('loading');
                });
        }
        
        function updateDashboard(data) {
            document.getElementById('lastUpdate').textContent = 
                data.lastUpdate ? new Date(data.lastUpdate).toLocaleString() : 'Never';
            
            // Update link integrity
            const linkIntegrity = document.getElementById('linkIntegrity');
            if (data.linkIntegrity) {
                const totalLinks = data.linkIntegrity.homepageLinks.length + data.linkIntegrity.documentationLinks.length;
                const brokenLinks = data.linkIntegrity.brokenLinks.length;
                const status = brokenLinks === 0 ? 'healthy' : (brokenLinks < 5 ? 'warning' : 'error');
                
                linkIntegrity.innerHTML = \`
                    <div class="status \${status}">\${status.toUpperCase()}</div>
                    <div class="metric">
                        <span class="metric-label">Total Links</span>
                        <span class="metric-value">\${totalLinks}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Broken Links</span>
                        <span class="metric-value">\${brokenLinks}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Orphaned Content</span>
                        <span class="metric-value">\${data.linkIntegrity.orphanedContent.length}</span>
                    </div>
                \`;
            } else {
                linkIntegrity.innerHTML = '<div class="status error">NO DATA</div>';
            }
            
            // Update content previews
            const contentPreviews = document.getElementById('contentPreviews');
            if (data.contentPreviews) {
                const status = data.contentPreviews.errors.length === 0 ? 'healthy' : 'warning';
                
                contentPreviews.innerHTML = \`
                    <div class="status \${status}">\${status.toUpperCase()}</div>
                    <div class="metric">
                        <span class="metric-label">Updated Previews</span>
                        <span class="metric-value">\${data.contentPreviews.updatedPreviews.length}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Errors</span>
                        <span class="metric-value">\${data.contentPreviews.errors.length}</span>
                    </div>
                \`;
            } else {
                contentPreviews.innerHTML = '<div class="status error">NO DATA</div>';
            }
            
            // Update functionality tests
            const functionality = document.getElementById('functionality');
            if (data.functionality) {
                const totalTests = Object.values(data.functionality).reduce((sum, test) => sum + test.passed + test.failed, 0);
                const failedTests = Object.values(data.functionality).reduce((sum, test) => sum + test.failed, 0);
                const status = failedTests === 0 ? 'healthy' : (failedTests < 3 ? 'warning' : 'error');
                
                functionality.innerHTML = \`
                    <div class="status \${status}">\${status.toUpperCase()}</div>
                    <div class="metric">
                        <span class="metric-label">Total Tests</span>
                        <span class="metric-value">\${totalTests}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Failed Tests</span>
                        <span class="metric-value">\${failedTests}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Success Rate</span>
                        <span class="metric-value">\${totalTests > 0 ? ((totalTests - failedTests) / totalTests * 100).toFixed(1) : 0}%</span>
                    </div>
                \`;
            } else {
                functionality.innerHTML = '<div class="status error">NO DATA</div>';
            }
            
            // Update performance
            const performance = document.getElementById('performance');
            if (data.performance) {
                performance.innerHTML = \`
                    <div class="status healthy">MONITORED</div>
                    <div class="metric">
                        <span class="metric-label">Last Check</span>
                        <span class="metric-value">\${new Date(data.performance.lastCheck).toLocaleString()}</span>
                    </div>
                \`;
            } else {
                performance.innerHTML = '<div class="status warning">NO DATA</div>';
            }
            
            // Update alerts
            const alerts = document.getElementById('alerts');
            if (data.alerts && data.alerts.length > 0) {
                alerts.innerHTML = data.alerts.map(alert => \`
                    <div class="alert \${alert.priority === 'high' ? 'error' : alert.priority === 'medium' ? 'warning' : 'info'}">
                        <strong>[\${alert.priority.toUpperCase()}] \${alert.category}:</strong> \${alert.message}
                    </div>
                \`).join('');
            } else {
                alerts.innerHTML = '<div class="alert info">No active alerts</div>';
            }
        }
        
        // Auto-refresh every 30 seconds
        function startAutoRefresh() {
            refreshTimer = setInterval(refreshData, 30000);
        }
        
        // Initial load
        refreshData();
        startAutoRefresh();
        
        // Stop auto-refresh when page is hidden
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                clearInterval(refreshTimer);
            } else {
                startAutoRefresh();
            }
        });
    </script>
</body>
</html>`;
    }

    /**
     * Start health monitoring
     */
    startHealthMonitoring() {
        this.refreshHealthData();
        setInterval(() => {
            this.refreshHealthData();
        }, this.refreshInterval);
    }

    /**
     * Refresh health data
     */
    async refreshHealthData() {
        try {
            console.log('🔄 Refreshing health data...');
            
            // Import and run maintenance checks
            const CrossPageMaintenance = require('./cross-page-maintenance.js');
            const maintenance = new CrossPageMaintenance();
            
            const results = await maintenance.runMaintenance();
            
            this.healthData = {
                lastUpdate: new Date().toISOString(),
                linkIntegrity: results.linkIntegrity,
                contentPreviews: results.contentPreviews,
                functionality: results.functionalityTests,
                performance: {
                    lastCheck: new Date().toISOString()
                },
                alerts: results.recommendations || []
            };
            
            console.log('✅ Health data updated');
            
        } catch (error) {
            console.error('❌ Error refreshing health data:', error.message);
            
            this.healthData.alerts.push({
                priority: 'high',
                category: 'system',
                message: `Health monitoring error: ${error.message}`
            });
        }
    }
}

// CLI interface
if (require.main === module) {
    const dashboard = new CrossPageDashboard();
    dashboard.start();
}

module.exports = CrossPageDashboard;