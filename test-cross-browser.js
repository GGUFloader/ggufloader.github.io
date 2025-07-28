#!/usr/bin/env node

/**
 * Cross-Browser Testing Script for GGUF Loader Website
 * 
 * This script tests functionality across different browsers and devices
 * using Puppeteer with different user agents and viewport configurations
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

// Test configuration
const TEST_PAGES = [
    'http://localhost:8080/',
    'http://localhost:8080/docs/',
    'http://localhost:8080/docs/installation/',
    'http://localhost:8080/docs/quick-start/',
    'http://localhost:8080/docs/addon-development/',
    'http://localhost:8080/docs/addon-api/',
    'http://localhost:8080/docs/smart-floater-example/',
    'http://localhost:8080/docs/package-structure/'
];

// Browser configurations to test
const BROWSER_CONFIGS = [
    {
        name: 'Chrome Desktop',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
        features: ['javascript', 'css-grid', 'flexbox', 'webp', 'service-worker']
    },
    {
        name: 'Firefox Desktop',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
        viewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
        features: ['javascript', 'css-grid', 'flexbox', 'webp', 'service-worker']
    },
    {
        name: 'Safari Desktop',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        viewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
        features: ['javascript', 'css-grid', 'flexbox', 'webp', 'service-worker']
    },
    {
        name: 'Edge Desktop',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        viewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
        features: ['javascript', 'css-grid', 'flexbox', 'webp', 'service-worker']
    },
    {
        name: 'Chrome Mobile',
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        viewport: { width: 375, height: 812, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
        features: ['javascript', 'css-grid', 'flexbox', 'webp', 'service-worker']
    },
    {
        name: 'Safari Mobile',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        viewport: { width: 375, height: 812, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
        features: ['javascript', 'css-grid', 'flexbox', 'webp', 'service-worker']
    },
    {
        name: 'Chrome Tablet',
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
        features: ['javascript', 'css-grid', 'flexbox', 'webp', 'service-worker']
    },
    {
        name: 'Legacy Browser Simulation',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
        viewport: { width: 1366, height: 768, deviceScaleFactor: 1 },
        features: ['javascript', 'css-grid', 'flexbox'], // No webp, no service-worker
        jsDisabled: false // Test with older feature set
    }
];

class CrossBrowserValidator {
    constructor() {
        this.browser = null;
        this.errors = [];
        this.warnings = [];
        this.results = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
        
        if (type === 'error') {
            this.errors.push(message);
        } else if (type === 'warning') {
            this.warnings.push(message);
        }
    }

    async init() {
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
        });
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async testPageInBrowser(url, browserConfig) {
        const page = await this.browser.newPage();
        
        try {
            // Configure browser environment
            await page.setUserAgent(browserConfig.userAgent);
            await page.setViewport(browserConfig.viewport);
            
            // Disable JavaScript if testing progressive enhancement
            if (browserConfig.jsDisabled) {
                await page.setJavaScriptEnabled(false);
            }
            
            // Navigate to page
            await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
            
            const testResult = {
                url,
                browser: browserConfig.name,
                tests: {}
            };

            // Test 1: Page loads successfully
            testResult.tests.pageLoad = await this.testPageLoad(page, url, browserConfig);
            
            // Test 2: Core content is accessible
            testResult.tests.contentAccessibility = await this.testContentAccessibility(page, url, browserConfig);
            
            // Test 3: Navigation works
            testResult.tests.navigation = await this.testNavigation(page, url, browserConfig);
            
            // Test 4: Interactive elements work
            if (!browserConfig.jsDisabled) {
                testResult.tests.interactivity = await this.testInteractivity(page, url, browserConfig);
            }
            
            // Test 5: Responsive design
            testResult.tests.responsiveDesign = await this.testResponsiveDesign(page, url, browserConfig);
            
            // Test 6: Performance
            testResult.tests.performance = await this.testPerformance(page, url, browserConfig);
            
            // Test 7: Feature support
            testResult.tests.featureSupport = await this.testFeatureSupport(page, url, browserConfig);
            
            // Test 8: Error handling
            testResult.tests.errorHandling = await this.testErrorHandling(page, url, browserConfig);

            return testResult;

        } catch (error) {
            this.log(`Error testing ${url} in ${browserConfig.name}: ${error.message}`, 'error');
            return {
                url,
                browser: browserConfig.name,
                error: error.message
            };
        } finally {
            await page.close();
        }
    }

    async testPageLoad(page, url, browserConfig) {
        try {
            const metrics = await page.metrics();
            const title = await page.title();
            
            if (!title || title.trim().length === 0) {
                this.log(`Empty page title for ${url} in ${browserConfig.name}`, 'error');
                return { passed: false, reason: 'Empty page title' };
            }
            
            // Check for basic page structure
            const hasMain = await page.$('main') !== null;
            const hasNav = await page.$('nav') !== null;
            const hasHeader = await page.$('header') !== null;
            
            if (!hasMain) {
                this.log(`Missing main element for ${url} in ${browserConfig.name}`, 'warning');
            }
            
            return {
                passed: true,
                title,
                hasMain,
                hasNav,
                hasHeader,
                metrics: {
                    JSEventListeners: metrics.JSEventListeners,
                    Nodes: metrics.Nodes,
                    JSHeapUsedSize: metrics.JSHeapUsedSize
                }
            };
            
        } catch (error) {
            this.log(`Page load test failed for ${url} in ${browserConfig.name}: ${error.message}`, 'error');
            return { passed: false, error: error.message };
        }
    }

    async testContentAccessibility(page, url, browserConfig) {
        try {
            // Test that main content is visible and accessible
            const mainContent = await page.evaluate(() => {
                const main = document.querySelector('main') || document.querySelector('.main-content') || document.body;
                const rect = main.getBoundingClientRect();
                
                return {
                    visible: rect.width > 0 && rect.height > 0,
                    textContent: main.textContent?.trim().length || 0,
                    hasHeadings: main.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0,
                    hasLinks: main.querySelectorAll('a').length > 0
                };
            });
            
            if (!mainContent.visible) {
                this.log(`Main content not visible for ${url} in ${browserConfig.name}`, 'error');
                return { passed: false, reason: 'Main content not visible' };
            }
            
            if (mainContent.textContent < 100) {
                this.log(`Very little text content for ${url} in ${browserConfig.name}`, 'warning');
            }
            
            return {
                passed: true,
                ...mainContent
            };
            
        } catch (error) {
            this.log(`Content accessibility test failed for ${url} in ${browserConfig.name}: ${error.message}`, 'error');
            return { passed: false, error: error.message };
        }
    }

    async testNavigation(page, url, browserConfig) {
        try {
            const navigationTests = await page.evaluate(() => {
                const navLinks = document.querySelectorAll('nav a, .nav a, .navigation a');
                const results = {
                    totalLinks: navLinks.length,
                    workingLinks: 0,
                    internalLinks: 0,
                    externalLinks: 0
                };
                
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href) {
                        if (href.startsWith('http')) {
                            results.externalLinks++;
                        } else {
                            results.internalLinks++;
                        }
                        
                        // Check if link is clickable
                        const rect = link.getBoundingClientRect();
                        if (rect.width > 0 && rect.height > 0) {
                            results.workingLinks++;
                        }
                    }
                });
                
                return results;
            });
            
            // Test mobile menu if on mobile device
            if (browserConfig.viewport.isMobile) {
                const mobileMenuTest = await page.evaluate(() => {
                    const hamburger = document.querySelector('.hamburger, .menu-toggle, [aria-label*="menu"]');
                    const mobileMenu = document.querySelector('.mobile-menu, .nav-mobile');
                    
                    return {
                        hasHamburger: !!hamburger,
                        hasMobileMenu: !!mobileMenu,
                        hamburgerVisible: hamburger ? hamburger.getBoundingClientRect().width > 0 : false
                    };
                });
                
                navigationTests.mobileMenu = mobileMenuTest;
            }
            
            return {
                passed: navigationTests.workingLinks === navigationTests.totalLinks,
                ...navigationTests
            };
            
        } catch (error) {
            this.log(`Navigation test failed for ${url} in ${browserConfig.name}: ${error.message}`, 'error');
            return { passed: false, error: error.message };
        }
    }

    async testInteractivity(page, url, browserConfig) {
        try {
            // Test floating buttons if on homepage
            let floatingButtonsTest = null;
            if (url.endsWith('/') || url.includes('index.html')) {
                floatingButtonsTest = await page.evaluate(() => {
                    const floatingButtons = document.querySelectorAll('.floating-button');
                    const results = {
                        totalButtons: floatingButtons.length,
                        visibleButtons: 0,
                        clickableButtons: 0
                    };
                    
                    floatingButtons.forEach(button => {
                        const rect = button.getBoundingClientRect();
                        if (rect.width > 0 && rect.height > 0) {
                            results.visibleButtons++;
                            
                            // Test if button responds to events
                            if (button.onclick || button.addEventListener) {
                                results.clickableButtons++;
                            }
                        }
                    });
                    
                    return results;
                });
            }
            
            // Test form interactions if any
            const formTest = await page.evaluate(() => {
                const forms = document.querySelectorAll('form');
                const inputs = document.querySelectorAll('input, select, textarea');
                
                return {
                    totalForms: forms.length,
                    totalInputs: inputs.length,
                    workingInputs: Array.from(inputs).filter(input => {
                        const rect = input.getBoundingClientRect();
                        return rect.width > 0 && rect.height > 0;
                    }).length
                };
            });
            
            // Test search functionality if present
            const searchTest = await page.evaluate(() => {
                const searchInput = document.querySelector('input[type="search"], .search-input, #search');
                const searchButton = document.querySelector('.search-button, button[type="submit"]');
                
                return {
                    hasSearch: !!searchInput,
                    hasSearchButton: !!searchButton,
                    searchVisible: searchInput ? searchInput.getBoundingClientRect().width > 0 : false
                };
            });
            
            return {
                passed: true,
                floatingButtons: floatingButtonsTest,
                forms: formTest,
                search: searchTest
            };
            
        } catch (error) {
            this.log(`Interactivity test failed for ${url} in ${browserConfig.name}: ${error.message}`, 'error');
            return { passed: false, error: error.message };
        }
    }

    async testResponsiveDesign(page, url, browserConfig) {
        try {
            const responsiveTests = await page.evaluate(() => {
                // Check for viewport meta tag
                const viewportMeta = document.querySelector('meta[name="viewport"]');
                
                // Check for responsive images
                const images = document.querySelectorAll('img');
                let responsiveImages = 0;
                images.forEach(img => {
                    const style = window.getComputedStyle(img);
                    if (style.maxWidth === '100%' || img.hasAttribute('srcset')) {
                        responsiveImages++;
                    }
                });
                
                // Check for horizontal scrolling
                const hasHorizontalScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;
                
                // Check for flexible layout
                const flexElements = document.querySelectorAll('[style*="flex"], .flex, .d-flex');
                const gridElements = document.querySelectorAll('[style*="grid"], .grid, .d-grid');
                
                return {
                    hasViewportMeta: !!viewportMeta,
                    viewportContent: viewportMeta ? viewportMeta.getAttribute('content') : null,
                    totalImages: images.length,
                    responsiveImages,
                    hasHorizontalScroll,
                    flexElements: flexElements.length,
                    gridElements: gridElements.length
                };
            });
            
            if (responsiveTests.hasHorizontalScroll) {
                this.log(`Horizontal scrolling detected for ${url} in ${browserConfig.name}`, 'error');
                return { passed: false, reason: 'Horizontal scrolling detected', ...responsiveTests };
            }
            
            if (!responsiveTests.hasViewportMeta) {
                this.log(`Missing viewport meta tag for ${url} in ${browserConfig.name}`, 'warning');
            }
            
            return {
                passed: true,
                ...responsiveTests
            };
            
        } catch (error) {
            this.log(`Responsive design test failed for ${url} in ${browserConfig.name}: ${error.message}`, 'error');
            return { passed: false, error: error.message };
        }
    }

    async testPerformance(page, url, browserConfig) {
        try {
            const performanceMetrics = await page.evaluate(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                const resources = performance.getEntriesByType('resource');
                
                return {
                    loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
                    domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
                    resourceCount: resources.length,
                    totalTransferSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
                    cachedResources: resources.filter(r => r.transferSize === 0 && r.decodedBodySize > 0).length
                };
            });
            
            // Performance thresholds (more lenient for mobile)
            const isMobile = browserConfig.viewport.isMobile;
            const loadTimeThreshold = isMobile ? 5000 : 3000; // 5s mobile, 3s desktop
            
            if (performanceMetrics.loadTime > loadTimeThreshold) {
                this.log(`Slow load time for ${url} in ${browserConfig.name}: ${performanceMetrics.loadTime}ms`, 'warning');
            }
            
            return {
                passed: performanceMetrics.loadTime <= loadTimeThreshold,
                ...performanceMetrics
            };
            
        } catch (error) {
            this.log(`Performance test failed for ${url} in ${browserConfig.name}: ${error.message}`, 'error');
            return { passed: false, error: error.message };
        }
    }

    async testFeatureSupport(page, url, browserConfig) {
        try {
            const featureTests = await page.evaluate((expectedFeatures) => {
                const results = {};
                
                // Test CSS Grid support
                results.cssGrid = CSS.supports('display', 'grid');
                
                // Test Flexbox support
                results.flexbox = CSS.supports('display', 'flex');
                
                // Test WebP support
                results.webp = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
                
                // Test Service Worker support
                results.serviceWorker = 'serviceWorker' in navigator;
                
                // Test JavaScript features
                results.javascript = true; // If this runs, JS is enabled
                results.es6 = typeof Symbol !== 'undefined';
                results.fetch = typeof fetch !== 'undefined';
                
                // Test local storage
                results.localStorage = typeof localStorage !== 'undefined';
                
                return results;
            }, browserConfig.features);
            
            // Check if expected features are supported
            const missingFeatures = browserConfig.features.filter(feature => !featureTests[feature]);
            
            if (missingFeatures.length > 0) {
                this.log(`Missing expected features for ${url} in ${browserConfig.name}: ${missingFeatures.join(', ')}`, 'warning');
            }
            
            return {
                passed: missingFeatures.length === 0,
                supportedFeatures: featureTests,
                missingFeatures
            };
            
        } catch (error) {
            this.log(`Feature support test failed for ${url} in ${browserConfig.name}: ${error.message}`, 'error');
            return { passed: false, error: error.message };
        }
    }

    async testErrorHandling(page, url, browserConfig) {
        try {
            // Collect console errors
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });
            
            // Test 404 handling by trying a non-existent page
            let notFoundTest = null;
            try {
                const notFoundUrl = url.replace(/\/$/, '') + '/non-existent-page';
                const response = await page.goto(notFoundUrl, { waitUntil: 'networkidle0', timeout: 10000 });
                notFoundTest = {
                    status: response.status(),
                    handled: response.status() === 404
                };
            } catch (error) {
                notFoundTest = { error: error.message };
            }
            
            // Go back to original page
            await page.goto(url, { waitUntil: 'networkidle0' });
            
            // Test JavaScript error handling
            const jsErrorTest = await page.evaluate(() => {
                let errorsCaught = 0;
                const originalHandler = window.onerror;
                
                window.onerror = function() {
                    errorsCaught++;
                    if (originalHandler) originalHandler.apply(this, arguments);
                };
                
                // Trigger a controlled error
                try {
                    nonExistentFunction();
                } catch (e) {
                    // Expected error
                }
                
                return { errorsCaught };
            });
            
            return {
                passed: consoleErrors.length === 0,
                consoleErrors: consoleErrors.slice(0, 5), // Limit to first 5 errors
                notFoundTest,
                jsErrorTest
            };
            
        } catch (error) {
            this.log(`Error handling test failed for ${url} in ${browserConfig.name}: ${error.message}`, 'error');
            return { passed: false, error: error.message };
        }
    }

    async validate() {
        this.log('Starting cross-browser validation...');
        
        await this.init();
        
        try {
            for (const url of TEST_PAGES) {
                this.log(`\nTesting ${url}...`);
                
                for (const browserConfig of BROWSER_CONFIGS) {
                    this.log(`  Testing in ${browserConfig.name}...`);
                    
                    const result = await this.testPageInBrowser(url, browserConfig);
                    this.results.push(result);
                    
                    // Small delay between tests
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            
            // Generate summary
            this.generateSummary();
            
        } finally {
            await this.cleanup();
        }
        
        return this.errors.length === 0;
    }

    generateSummary() {
        this.log('\n=== CROSS-BROWSER VALIDATION SUMMARY ===');
        
        const totalTests = this.results.length;
        const passedTests = this.results.filter(result => !result.error && 
            Object.values(result.tests || {}).every(test => test.passed !== false)).length;
        
        // Browser-specific analysis
        const browserResults = {};
        BROWSER_CONFIGS.forEach(config => {
            const browserTests = this.results.filter(r => r.browser === config.name);
            const browserPassed = browserTests.filter(r => !r.error && 
                Object.values(r.tests || {}).every(test => test.passed !== false)).length;
            
            browserResults[config.name] = {
                total: browserTests.length,
                passed: browserPassed,
                failed: browserTests.length - browserPassed
            };
        });
        
        this.log(`Total tests: ${totalTests}`);
        this.log(`Passed tests: ${passedTests}`);
        this.log(`Failed tests: ${totalTests - passedTests}`);
        this.log(`Errors: ${this.errors.length}`);
        this.log(`Warnings: ${this.warnings.length}`);
        
        this.log('\nBrowser-specific results:');
        Object.entries(browserResults).forEach(([browser, stats]) => {
            this.log(`  ${browser}: ${stats.passed}/${stats.total} passed`);
        });
        
        if (this.errors.length > 0) {
            this.log('\nERRORS:');
            this.errors.forEach(error => this.log(`  - ${error}`));
        }
        
        if (this.warnings.length > 0) {
            this.log('\nWARNINGS:');
            this.warnings.forEach(warning => this.log(`  - ${warning}`));
        }
        
        // Save detailed results
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests,
                passedTests,
                failedTests: totalTests - passedTests,
                browserResults
            },
            results: this.results
        };
        
        fs.writeFileSync('cross-browser-results.json', JSON.stringify(report, null, 2));
        this.log('\nDetailed results saved to cross-browser-results.json');
        
        if (this.errors.length === 0) {
            this.log('✅ All cross-browser tests passed!');
        } else {
            this.log('❌ Cross-browser validation failed!');
        }
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new CrossBrowserValidator();
    validator.validate().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Validation failed:', error);
        process.exit(1);
    });
}

module.exports = CrossBrowserValidator;