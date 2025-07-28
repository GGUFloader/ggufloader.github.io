#!/usr/bin/env node

/**
 * Comprehensive Test Runner for GGUF Loader Website
 * 
 * This script runs all automated tests including:
 * - SEO validation
 * - Performance testing (Lighthouse)
 * - Accessibility testing
 * - Mobile responsiveness
 * - Structured data validation
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
    constructor() {
        this.results = {
            seo: null,
            lighthouse: null,
            accessibility: null,
            mobile: null,
            structuredData: null,
            cacheHeaders: null,
            crossBrowser: null,
            waveAccessibility: null
        };
        this.startTime = Date.now();
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const colors = {
            info: '\x1b[36m',    // Cyan
            success: '\x1b[32m', // Green
            warning: '\x1b[33m', // Yellow
            error: '\x1b[31m',   // Red
            reset: '\x1b[0m'     // Reset
        };
        
        const color = colors[type] || colors.info;
        console.log(`${color}[${timestamp}] ${type.toUpperCase()}: ${message}${colors.reset}`);
    }

    async runCommand(command, args = [], options = {}) {
        return new Promise((resolve, reject) => {
            this.log(`Running: ${command} ${args.join(' ')}`);
            
            const process = spawn(command, args, {
                stdio: 'inherit',
                shell: true,
                ...options
            });
            
            process.on('close', (code) => {
                if (code === 0) {
                    resolve(code);
                } else {
                    reject(new Error(`Command failed with exit code ${code}`));
                }
            });
            
            process.on('error', (error) => {
                reject(error);
            });
        });
    }

    async checkDependencies() {
        this.log('Checking dependencies...');
        
        const requiredFiles = [
            'validate-seo.js',
            'test-accessibility.js',
            'test-mobile-responsiveness.js',
            'test-structured-data.js',
            'test-cache-headers-node.js',
            'test-cross-browser.js',
            'test-wave-accessibility.js',
            'lighthouserc.js'
        ];
        
        const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
        
        if (missingFiles.length > 0) {
            throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
        }
        
        // Check if node_modules exists
        if (!fs.existsSync('node_modules')) {
            this.log('Installing dependencies...', 'warning');
            await this.runCommand('npm', ['install']);
        }
        
        this.log('Dependencies check passed', 'success');
    }

    async startLocalServer() {
        this.log('Starting local server...');
        
        return new Promise((resolve, reject) => {
            const server = spawn('python', ['-m', 'http.server', '8080'], {
                stdio: 'pipe',
                shell: true
            });
            
            let serverReady = false;
            
            server.stdout.on('data', (data) => {
                const output = data.toString();
                if (output.includes('Serving HTTP') && !serverReady) {
                    serverReady = true;
                    this.log('Local server started on http://localhost:8080', 'success');
                    resolve(server);
                }
            });
            
            server.stderr.on('data', (data) => {
                const output = data.toString();
                if (output.includes('Address already in use')) {
                    this.log('Server already running on port 8080', 'warning');
                    resolve(null); // Server already running
                } else {
                    this.log(`Server error: ${output}`, 'error');
                }
            });
            
            server.on('error', (error) => {
                reject(error);
            });
            
            // Timeout after 10 seconds
            setTimeout(() => {
                if (!serverReady) {
                    reject(new Error('Server failed to start within 10 seconds'));
                }
            }, 10000);
        });
    }

    async runSEOTests() {
        this.log('Running SEO validation tests...');
        
        try {
            await this.runCommand('node', ['validate-seo.js']);
            this.results.seo = { passed: true, timestamp: new Date().toISOString() };
            this.log('SEO tests passed', 'success');
        } catch (error) {
            this.results.seo = { passed: false, error: error.message, timestamp: new Date().toISOString() };
            this.log(`SEO tests failed: ${error.message}`, 'error');
        }
    }

    async runLighthouseTests() {
        this.log('Running Lighthouse performance tests...');
        
        try {
            await this.runCommand('npx', ['lhci', 'autorun']);
            this.results.lighthouse = { passed: true, timestamp: new Date().toISOString() };
            this.log('Lighthouse tests passed', 'success');
        } catch (error) {
            this.results.lighthouse = { passed: false, error: error.message, timestamp: new Date().toISOString() };
            this.log(`Lighthouse tests failed: ${error.message}`, 'error');
        }
    }

    async runAccessibilityTests() {
        this.log('Running accessibility tests...');
        
        try {
            await this.runCommand('node', ['test-accessibility.js']);
            this.results.accessibility = { passed: true, timestamp: new Date().toISOString() };
            this.log('Accessibility tests passed', 'success');
        } catch (error) {
            this.results.accessibility = { passed: false, error: error.message, timestamp: new Date().toISOString() };
            this.log(`Accessibility tests failed: ${error.message}`, 'error');
        }
    }

    async runMobileTests() {
        this.log('Running mobile responsiveness tests...');
        
        try {
            await this.runCommand('node', ['test-mobile-responsiveness.js']);
            this.results.mobile = { passed: true, timestamp: new Date().toISOString() };
            this.log('Mobile responsiveness tests passed', 'success');
        } catch (error) {
            this.results.mobile = { passed: false, error: error.message, timestamp: new Date().toISOString() };
            this.log(`Mobile responsiveness tests failed: ${error.message}`, 'error');
        }
    }

    async runStructuredDataTests() {
        this.log('Running structured data validation tests...');
        
        try {
            await this.runCommand('node', ['test-structured-data.js']);
            this.results.structuredData = { passed: true, timestamp: new Date().toISOString() };
            this.log('Structured data tests passed', 'success');
        } catch (error) {
            this.results.structuredData = { passed: false, error: error.message, timestamp: new Date().toISOString() };
            this.log(`Structured data tests failed: ${error.message}`, 'error');
        }
    }

    async runCacheHeadersTests() {
        this.log('Running cache headers validation tests...');
        
        try {
            await this.runCommand('node', ['test-cache-headers-node.js']);
            this.results.cacheHeaders = { passed: true, timestamp: new Date().toISOString() };
            this.log('Cache headers tests passed', 'success');
        } catch (error) {
            this.results.cacheHeaders = { passed: false, error: error.message, timestamp: new Date().toISOString() };
            this.log(`Cache headers tests failed: ${error.message}`, 'error');
        }
    }

    async runCrossBrowserTests() {
        this.log('Running cross-browser compatibility tests...');
        
        try {
            await this.runCommand('node', ['test-cross-browser.js']);
            this.results.crossBrowser = { passed: true, timestamp: new Date().toISOString() };
            this.log('Cross-browser tests passed', 'success');
        } catch (error) {
            this.results.crossBrowser = { passed: false, error: error.message, timestamp: new Date().toISOString() };
            this.log(`Cross-browser tests failed: ${error.message}`, 'error');
        }
    }

    async runWAVEAccessibilityTests() {
        this.log('Running WAVE accessibility tests...');
        
        try {
            await this.runCommand('node', ['test-wave-accessibility.js']);
            this.results.waveAccessibility = { passed: true, timestamp: new Date().toISOString() };
            this.log('WAVE accessibility tests passed', 'success');
        } catch (error) {
            this.results.waveAccessibility = { passed: false, error: error.message, timestamp: new Date().toISOString() };
            this.log(`WAVE accessibility tests failed: ${error.message}`, 'error');
        }
    }

    generateSummaryReport() {
        const endTime = Date.now();
        const duration = Math.round((endTime - this.startTime) / 1000);
        
        const summary = {
            testRun: {
                startTime: new Date(this.startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
                duration: `${duration} seconds`
            },
            results: this.results,
            summary: {
                totalTests: Object.keys(this.results).length,
                passedTests: Object.values(this.results).filter(r => r && r.passed).length,
                failedTests: Object.values(this.results).filter(r => r && !r.passed).length
            }
        };
        
        // Save summary report
        fs.writeFileSync('test-summary-report.json', JSON.stringify(summary, null, 2));
        
        // Generate HTML report
        this.generateHTMLReport(summary);
        
        return summary;
    }

    generateHTMLReport(summary) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GGUF Loader Website Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .test-result { margin: 20px 0; padding: 15px; border-radius: 6px; border-left: 4px solid; }
        .passed { background: #d4edda; border-color: #28a745; }
        .failed { background: #f8d7da; border-color: #dc3545; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .summary-number { font-size: 2em; font-weight: bold; margin-bottom: 10px; }
        .passed-number { color: #28a745; }
        .failed-number { color: #dc3545; }
        .total-number { color: #007bff; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 GGUF Loader Website Test Report</h1>
        <p><strong>Test Run:</strong> ${summary.testRun.startTime}</p>
        <p><strong>Duration:</strong> ${summary.testRun.duration}</p>
    </div>
    
    <div class="summary">
        <div class="summary-card">
            <div class="summary-number total-number">${summary.summary.totalTests}</div>
            <div>Total Tests</div>
        </div>
        <div class="summary-card">
            <div class="summary-number passed-number">${summary.summary.passedTests}</div>
            <div>Passed</div>
        </div>
        <div class="summary-card">
            <div class="summary-number failed-number">${summary.summary.failedTests}</div>
            <div>Failed</div>
        </div>
    </div>
    
    <h2>Test Results</h2>
    
    ${Object.entries(summary.results).map(([testName, result]) => {
        if (!result) return '';
        
        const status = result.passed ? 'passed' : 'failed';
        const icon = result.passed ? '✅' : '❌';
        const title = testName.charAt(0).toUpperCase() + testName.slice(1).replace(/([A-Z])/g, ' $1');
        
        return `
        <div class="test-result ${status}">
            <h3>${icon} ${title}</h3>
            <p><strong>Status:</strong> ${result.passed ? 'PASSED' : 'FAILED'}</p>
            <p><strong>Timestamp:</strong> ${result.timestamp}</p>
            ${result.error ? `<p><strong>Error:</strong> ${result.error}</p>` : ''}
        </div>
        `;
    }).join('')}
    
    <h2>Additional Reports</h2>
    <ul>
        <li><a href="accessibility-results.json">Accessibility Test Results (JSON)</a></li>
        <li><a href="mobile-responsiveness-results.json">Mobile Responsiveness Results (JSON)</a></li>
        <li><a href="wcag-compliance-report.json">WCAG Compliance Report (JSON)</a></li>
        <li><a href="cache-headers-analysis.json">Cache Headers Analysis (JSON)</a></li>
        <li><a href="cross-browser-results.json">Cross-Browser Test Results (JSON)</a></li>
        <li><a href="wave-accessibility-results.json">WAVE Accessibility Results (JSON)</a></li>
        <li><a href="test-summary-report.json">Complete Test Summary (JSON)</a></li>
    </ul>
    
    <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d;">
        <p>Generated by GGUF Loader Website Test Suite</p>
    </footer>
</body>
</html>
        `;
        
        fs.writeFileSync('test-report.html', html);
        this.log('HTML report generated: test-report.html', 'success');
    }

    printSummary(summary) {
        this.log('\n' + '='.repeat(60));
        this.log('COMPREHENSIVE TEST SUMMARY', 'info');
        this.log('='.repeat(60));
        
        this.log(`Test Duration: ${summary.testRun.duration}`);
        this.log(`Total Tests: ${summary.summary.totalTests}`);
        this.log(`Passed: ${summary.summary.passedTests}`, 'success');
        this.log(`Failed: ${summary.summary.failedTests}`, summary.summary.failedTests > 0 ? 'error' : 'info');
        
        this.log('\nDetailed Results:');
        Object.entries(summary.results).forEach(([testName, result]) => {
            if (result) {
                const status = result.passed ? 'PASSED' : 'FAILED';
                const type = result.passed ? 'success' : 'error';
                this.log(`  ${testName}: ${status}`, type);
            }
        });
        
        this.log('\nReports Generated:');
        this.log('  - test-report.html (Main HTML report)');
        this.log('  - test-summary-report.json (JSON summary)');
        this.log('  - accessibility-results.json (Accessibility details)');
        this.log('  - mobile-responsiveness-results.json (Mobile test details)');
        this.log('  - wcag-compliance-report.json (WCAG compliance)');
        this.log('  - cache-headers-analysis.json (Cache headers analysis)');
        this.log('  - cross-browser-results.json (Cross-browser compatibility)');
        this.log('  - wave-accessibility-results.json (WAVE accessibility analysis)');
        
        if (summary.summary.failedTests === 0) {
            this.log('\n🎉 All tests passed! Website is ready for production.', 'success');
        } else {
            this.log('\n⚠️  Some tests failed. Please review the reports and fix issues.', 'warning');
        }
    }

    async run() {
        let server = null;
        
        try {
            this.log('Starting comprehensive website testing...', 'info');
            
            // Check dependencies
            await this.checkDependencies();
            
            // Start local server
            server = await this.startLocalServer();
            
            // Wait a moment for server to be fully ready
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Run all tests
            await this.runSEOTests();
            await this.runStructuredDataTests();
            await this.runCacheHeadersTests();
            await this.runCrossBrowserTests();
            await this.runAccessibilityTests();
            await this.runWAVEAccessibilityTests();
            await this.runMobileTests();
            await this.runLighthouseTests();
            
            // Generate reports
            const summary = this.generateSummaryReport();
            this.printSummary(summary);
            
            return summary.summary.failedTests === 0;
            
        } catch (error) {
            this.log(`Test run failed: ${error.message}`, 'error');
            return false;
        } finally {
            // Clean up server
            if (server) {
                server.kill();
                this.log('Local server stopped', 'info');
            }
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    const runner = new TestRunner();
    runner.run().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Test runner failed:', error);
        process.exit(1);
    });
}

module.exports = TestRunner;