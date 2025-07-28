/**
 * Test Cross-Page Analytics Implementation
 * Validates that all analytics and monitoring systems are working correctly
 */

class CrossPageAnalyticsTest {
    constructor() {
        this.testResults = [];
        this.testsPassed = 0;
        this.testsFailed = 0;
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🧪 Starting Cross-Page Analytics Tests...');

        // Test analytics initialization
        await this.testAnalyticsInitialization();
        
        // Test event tracking
        await this.testEventTracking();
        
        // Test dashboard functionality
        await this.testDashboardFunctionality();
        
        // Test content suggestion monitoring
        await this.testContentSuggestionMonitoring();
        
        // Test reporting system
        await this.testReportingSystem();
        
        // Test data persistence
        await this.testDataPersistence();
        
        // Test performance monitoring
        await this.testPerformanceMonitoring();

        this.displayResults();
        return this.generateTestReport();
    }

    /**
     * Test analytics initialization
     */
    async testAnalyticsInitialization() {
        console.log('Testing analytics initialization...');

        // Test main analytics manager
        this.assert(
            typeof window.analyticsManager !== 'undefined',
            'Main analytics manager should be initialized'
        );

        // Test cross-page analytics
        this.assert(
            typeof window.CrossPageAnalytics !== 'undefined',
            'Cross-page analytics should be initialized'
        );

        // Test dashboard
        this.assert(
            typeof window.CrossPageIntegrationDashboard !== 'undefined',
            'Integration dashboard should be initialized'
        );

        // Test content suggestion monitor
        this.assert(
            typeof window.ContentSuggestionMonitor !== 'undefined',
            'Content suggestion monitor should be initialized'
        );

        // Test reporting system
        this.assert(
            typeof window.AnalyticsReportingSystem !== 'undefined',
            'Analytics reporting system should be initialized'
        );
    }

    /**
     * Test event tracking
     */
    async testEventTracking() {
        console.log('Testing event tracking...');

        if (window.CrossPageAnalytics) {
            // Test custom event tracking
            try {
                window.CrossPageAnalytics.trackCustomEvent('test_event', {
                    testProperty: 'test_value'
                });
                this.pass('Custom event tracking works');
            } catch (error) {
                this.fail('Custom event tracking failed', error);
            }

            // Test analytics summary
            try {
                const summary = window.CrossPageAnalytics.getAnalyticsSummary();
                this.assert(
                    typeof summary === 'object' && summary.sessionId,
                    'Analytics summary should contain session data'
                );
            } catch (error) {
                this.fail('Analytics summary failed', error);
            }
        }
    }

    /**
     * Test dashboard functionality
     */
    async testDashboardFunctionality() {
        console.log('Testing dashboard functionality...');

        if (window.CrossPageIntegrationDashboard) {
            try {
                // Test metrics summary
                const metrics = window.CrossPageIntegrationDashboard.getMetricsSummary();
                this.assert(
                    typeof metrics === 'object',
                    'Dashboard should provide metrics summary'
                );

                // Test dashboard initialization
                this.assert(
                    window.CrossPageIntegrationDashboard.isInitialized,
                    'Dashboard should be initialized'
                );

                this.pass('Dashboard functionality works');
            } catch (error) {
                this.fail('Dashboard functionality failed', error);
            }
        }
    }

    /**
     * Test content suggestion monitoring
     */
    async testContentSuggestionMonitoring() {
        console.log('Testing content suggestion monitoring...');

        if (window.ContentSuggestionMonitor) {
            try {
                // Test metrics collection
                const metrics = window.ContentSuggestionMonitor.getMetricsSummary();
                this.assert(
                    typeof metrics === 'object' && metrics.suggestions,
                    'Content suggestion monitor should provide metrics'
                );

                // Test effectiveness report
                const effectiveness = window.ContentSuggestionMonitor.getEffectivenessReport();
                this.assert(
                    typeof effectiveness === 'object',
                    'Content suggestion monitor should provide effectiveness report'
                );

                this.pass('Content suggestion monitoring works');
            } catch (error) {
                this.fail('Content suggestion monitoring failed', error);
            }
        }
    }

    /**
     * Test reporting system
     */
    async testReportingSystem() {
        console.log('Testing reporting system...');

        if (window.AnalyticsReportingSystem) {
            try {
                // Test report generation
                const report = await window.AnalyticsReportingSystem.generateReport('daily');
                this.assert(
                    typeof report === 'object' && report.id,
                    'Reporting system should generate reports'
                );

                // Test report history
                const history = window.AnalyticsReportingSystem.getReportHistory();
                this.assert(
                    Array.isArray(history),
                    'Reporting system should maintain report history'
                );

                this.pass('Reporting system works');
            } catch (error) {
                this.fail('Reporting system failed', error);
            }
        }
    }

    /**
     * Test data persistence
     */
    async testDataPersistence() {
        console.log('Testing data persistence...');

        try {
            // Test localStorage data
            const analyticsQueue = localStorage.getItem('analyticsQueue');
            this.assert(
                analyticsQueue !== null,
                'Analytics queue should be persisted in localStorage'
            );

            // Test cross-page metrics
            const crossPageMetrics = localStorage.getItem('crossPageIntegrationMetrics');
            this.assert(
                crossPageMetrics !== null,
                'Cross-page metrics should be persisted'
            );

            this.pass('Data persistence works');
        } catch (error) {
            this.fail('Data persistence failed', error);
        }
    }

    /**
     * Test performance monitoring
     */
    async testPerformanceMonitoring() {
        console.log('Testing performance monitoring...');

        try {
            // Test performance API availability
            this.assert(
                typeof performance !== 'undefined',
                'Performance API should be available'
            );

            // Test navigation timing
            if (performance.getEntriesByType) {
                const navEntries = performance.getEntriesByType('navigation');
                this.assert(
                    navEntries.length > 0,
                    'Navigation timing data should be available'
                );
            }

            this.pass('Performance monitoring works');
        } catch (error) {
            this.fail('Performance monitoring failed', error);
        }
    }

    /**
     * Test assertion helper
     */
    assert(condition, message) {
        if (condition) {
            this.pass(message);
        } else {
            this.fail(message);
        }
    }

    /**
     * Record test pass
     */
    pass(message) {
        this.testResults.push({
            status: 'PASS',
            message: message,
            timestamp: Date.now()
        });
        this.testsPassed++;
        console.log('✅', message);
    }

    /**
     * Record test failure
     */
    fail(message, error = null) {
        this.testResults.push({
            status: 'FAIL',
            message: message,
            error: error ? error.message : null,
            timestamp: Date.now()
        });
        this.testsFailed++;
        console.error('❌', message, error);
    }

    /**
     * Display test results
     */
    displayResults() {
        console.log('\n📊 Test Results Summary:');
        console.log(`✅ Passed: ${this.testsPassed}`);
        console.log(`❌ Failed: ${this.testsFailed}`);
        console.log(`📈 Success Rate: ${((this.testsPassed / (this.testsPassed + this.testsFailed)) * 100).toFixed(1)}%`);

        if (this.testsFailed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(result => result.status === 'FAIL')
                .forEach(result => {
                    console.log(`  - ${result.message}`);
                    if (result.error) {
                        console.log(`    Error: ${result.error}`);
                    }
                });
        }
    }

    /**
     * Generate test report
     */
    generateTestReport() {
        return {
            timestamp: Date.now(),
            totalTests: this.testsPassed + this.testsFailed,
            passed: this.testsPassed,
            failed: this.testsFailed,
            successRate: (this.testsPassed / (this.testsPassed + this.testsFailed)) * 100,
            results: this.testResults,
            environment: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            }
        };
    }

    /**
     * Simulate cross-page navigation for testing
     */
    simulateCrossPageNavigation() {
        console.log('🔄 Simulating cross-page navigation...');

        // Create a fake link element
        const fakeLink = document.createElement('a');
        fakeLink.href = '/docs/installation';
        fakeLink.textContent = 'Installation Guide';
        fakeLink.className = 'cross-page-link';

        // Create a fake click event
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            clientX: 100,
            clientY: 100
        });

        // Dispatch the event
        fakeLink.dispatchEvent(clickEvent);

        this.pass('Cross-page navigation simulation completed');
    }

    /**
     * Simulate content preview interaction
     */
    simulateContentPreviewInteraction() {
        console.log('🔄 Simulating content preview interaction...');

        // Create a fake preview element
        const fakePreview = document.createElement('div');
        fakePreview.className = 'content-preview';
        fakePreview.innerHTML = `
            <h3 class="preview-title">Test Preview</h3>
            <p>This is a test preview content</p>
            <button class="expand-btn">Expand</button>
        `;

        document.body.appendChild(fakePreview);

        // Simulate click on expand button
        const expandBtn = fakePreview.querySelector('.expand-btn');
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true
        });

        expandBtn.dispatchEvent(clickEvent);

        // Clean up
        document.body.removeChild(fakePreview);

        this.pass('Content preview interaction simulation completed');
    }

    /**
     * Run integration tests with simulated interactions
     */
    async runIntegrationTests() {
        console.log('🧪 Running integration tests with simulated interactions...');

        // Wait for systems to initialize
        await this.waitForInitialization();

        // Simulate interactions
        this.simulateCrossPageNavigation();
        this.simulateContentPreviewInteraction();

        // Wait for events to be processed
        await this.wait(1000);

        // Check if events were tracked
        if (window.CrossPageAnalytics) {
            const summary = window.CrossPageAnalytics.getAnalyticsSummary();
            this.assert(
                summary.interactions > 0,
                'Simulated interactions should be tracked'
            );
        }

        this.pass('Integration tests completed');
    }

    /**
     * Wait for systems to initialize
     */
    async waitForInitialization() {
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts) {
            if (window.CrossPageAnalytics && 
                window.CrossPageIntegrationDashboard && 
                window.ContentSuggestionMonitor && 
                window.AnalyticsReportingSystem) {
                return;
            }
            await this.wait(100);
            attempts++;
        }

        throw new Error('Systems failed to initialize within timeout');
    }

    /**
     * Wait helper
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Auto-run tests when page loads (only in development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', async () => {
        // Wait a bit for all systems to initialize
        setTimeout(async () => {
            const tester = new CrossPageAnalyticsTest();
            
            try {
                const report = await tester.runAllTests();
                
                // Also run integration tests
                await tester.runIntegrationTests();
                
                // Store test report
                localStorage.setItem('analyticsTestReport', JSON.stringify(report));
                
                console.log('🎉 All analytics tests completed!');
                
            } catch (error) {
                console.error('❌ Test execution failed:', error);
            }
        }, 2000);
    });
}

// Export for manual testing
window.CrossPageAnalyticsTest = CrossPageAnalyticsTest;

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrossPageAnalyticsTest;
}