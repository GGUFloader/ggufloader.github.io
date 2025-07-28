#!/usr/bin/env node

/**
 * Accessibility Testing Script for GGUF Loader Website
 * 
 * This script runs comprehensive accessibility tests using axe-core
 * and validates WCAG 2.1 AA compliance
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

class AccessibilityValidator {
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
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async testPageAccessibility(url) {
        const page = await this.browser.newPage();
        
        try {
            // Navigate to page
            await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
            
            // Inject axe-core
            await page.addScriptTag({
                path: require.resolve('axe-core/axe.min.js')
            });
            
            // Run axe-core accessibility tests
            const axeResults = await page.evaluate(() => {
                return new Promise((resolve) => {
                    axe.run({
                        rules: {
                            // Configure specific rules
                            'color-contrast': { enabled: true },
                            'keyboard-navigation': { enabled: true },
                            'focus-order-semantics': { enabled: true },
                            'aria-valid-attr': { enabled: true },
                            'aria-valid-attr-value': { enabled: true },
                            'aria-roles': { enabled: true },
                            'image-alt': { enabled: true },
                            'label': { enabled: true },
                            'link-name': { enabled: true },
                            'button-name': { enabled: true }
                        }
                    }, (err, results) => {
                        if (err) {
                            resolve({ error: err.message });
                        } else {
                            resolve(results);
                        }
                    });
                });
            });
            
            // Run custom accessibility tests
            const customTests = await this.runCustomAccessibilityTests(page, url);
            
            // Test keyboard navigation
            const keyboardTests = await this.testKeyboardNavigation(page, url);
            
            // Test screen reader compatibility
            const screenReaderTests = await this.testScreenReaderCompatibility(page, url);
            
            const result = {
                url,
                axeResults,
                customTests,
                keyboardTests,
                screenReaderTests,
                timestamp: new Date().toISOString()
            };
            
            // Process axe results
            if (axeResults.violations) {
                axeResults.violations.forEach(violation => {
                    const impact = violation.impact || 'unknown';
                    const message = `${violation.id}: ${violation.description} (${violation.nodes.length} instances)`;
                    
                    if (impact === 'critical' || impact === 'serious') {
                        this.log(`${url} - ${message}`, 'error');
                    } else {
                        this.log(`${url} - ${message}`, 'warning');
                    }
                });
            }
            
            return result;
            
        } catch (error) {
            this.log(`Error testing accessibility for ${url}: ${error.message}`, 'error');
            return {
                url,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        } finally {
            await page.close();
        }
    }

    async runCustomAccessibilityTests(page, url) {
        try {
            const tests = await page.evaluate(() => {
                const results = {
                    headingStructure: { passed: true, issues: [] },
                    altText: { passed: true, issues: [] },
                    formLabels: { passed: true, issues: [] },
                    colorContrast: { passed: true, issues: [] },
                    focusIndicators: { passed: true, issues: [] },
                    semanticHTML: { passed: true, issues: [] }
                };
                
                // Test 1: Heading structure
                const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                let previousLevel = 0;
                
                headings.forEach((heading, index) => {
                    const level = parseInt(heading.tagName.charAt(1));
                    
                    if (index === 0 && level !== 1) {
                        results.headingStructure.issues.push('First heading should be h1');
                        results.headingStructure.passed = false;
                    }
                    
                    if (level > previousLevel + 1) {
                        results.headingStructure.issues.push(`Heading level jumps from h${previousLevel} to h${level}`);
                        results.headingStructure.passed = false;
                    }
                    
                    previousLevel = level;
                });
                
                // Test 2: Alt text for images
                const images = document.querySelectorAll('img');
                images.forEach(img => {
                    if (!img.alt && !img.getAttribute('aria-label')) {
                        results.altText.issues.push(`Image missing alt text: ${img.src}`);
                        results.altText.passed = false;
                    }
                });
                
                // Test 3: Form labels
                const inputs = document.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    const hasLabel = document.querySelector(`label[for="${input.id}"]`) || 
                                   input.getAttribute('aria-label') || 
                                   input.getAttribute('aria-labelledby');
                    
                    if (!hasLabel) {
                        results.formLabels.issues.push(`Form input missing label: ${input.type || input.tagName}`);
                        results.formLabels.passed = false;
                    }
                });
                
                // Test 4: Focus indicators
                const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
                focusableElements.forEach(element => {
                    const computedStyle = window.getComputedStyle(element, ':focus');
                    const hasOutline = computedStyle.outline !== 'none' && computedStyle.outline !== '0px';
                    const hasBoxShadow = computedStyle.boxShadow !== 'none';
                    
                    if (!hasOutline && !hasBoxShadow) {
                        results.focusIndicators.issues.push(`Element missing focus indicator: ${element.tagName}`);
                        results.focusIndicators.passed = false;
                    }
                });
                
                // Test 5: Semantic HTML
                const semanticElements = document.querySelectorAll('main, nav, header, footer, section, article, aside');
                if (semanticElements.length === 0) {
                    results.semanticHTML.issues.push('No semantic HTML elements found');
                    results.semanticHTML.passed = false;
                }
                
                // Check for proper main element
                const mainElements = document.querySelectorAll('main');
                if (mainElements.length === 0) {
                    results.semanticHTML.issues.push('Missing main element');
                    results.semanticHTML.passed = false;
                } else if (mainElements.length > 1) {
                    results.semanticHTML.issues.push('Multiple main elements found');
                    results.semanticHTML.passed = false;
                }
                
                return results;
            });
            
            return tests;
            
        } catch (error) {
            this.log(`Error running custom accessibility tests for ${url}: ${error.message}`, 'error');
            return { error: error.message };
        }
    }

    async testKeyboardNavigation(page, url) {
        try {
            const keyboardTests = await page.evaluate(() => {
                return new Promise((resolve) => {
                    const results = {
                        tabOrder: { passed: true, issues: [] },
                        skipLinks: { passed: true, issues: [] },
                        trapFocus: { passed: true, issues: [] }
                    };
                    
                    // Test tab order
                    const focusableElements = Array.from(document.querySelectorAll(
                        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    )).filter(el => {
                        const style = window.getComputedStyle(el);
                        return style.display !== 'none' && style.visibility !== 'hidden';
                    });
                    
                    // Check for logical tab order
                    let previousTabIndex = -1;
                    focusableElements.forEach(element => {
                        const tabIndex = parseInt(element.getAttribute('tabindex')) || 0;
                        if (tabIndex > 0 && tabIndex < previousTabIndex) {
                            results.tabOrder.issues.push('Tab order may be confusing');
                            results.tabOrder.passed = false;
                        }
                        previousTabIndex = tabIndex;
                    });
                    
                    // Check for skip links
                    const skipLinks = document.querySelectorAll('a[href^="#"]');
                    let hasSkipToMain = false;
                    skipLinks.forEach(link => {
                        if (link.textContent.toLowerCase().includes('skip') && 
                            link.textContent.toLowerCase().includes('main')) {
                            hasSkipToMain = true;
                        }
                    });
                    
                    if (!hasSkipToMain && focusableElements.length > 10) {
                        results.skipLinks.issues.push('Consider adding skip to main content link');
                        results.skipLinks.passed = false;
                    }
                    
                    resolve(results);
                });
            });
            
            return keyboardTests;
            
        } catch (error) {
            this.log(`Error testing keyboard navigation for ${url}: ${error.message}`, 'error');
            return { error: error.message };
        }
    }

    async testScreenReaderCompatibility(page, url) {
        try {
            const screenReaderTests = await page.evaluate(() => {
                const results = {
                    ariaLabels: { passed: true, issues: [] },
                    landmarks: { passed: true, issues: [] },
                    liveRegions: { passed: true, issues: [] },
                    roleAttributes: { passed: true, issues: [] }
                };
                
                // Test ARIA labels
                const elementsNeedingLabels = document.querySelectorAll('button, input, select, textarea');
                elementsNeedingLabels.forEach(element => {
                    const hasAccessibleName = element.getAttribute('aria-label') || 
                                            element.getAttribute('aria-labelledby') ||
                                            document.querySelector(`label[for="${element.id}"]`) ||
                                            element.textContent.trim();
                    
                    if (!hasAccessibleName) {
                        results.ariaLabels.issues.push(`Element missing accessible name: ${element.tagName}`);
                        results.ariaLabels.passed = false;
                    }
                });
                
                // Test landmarks
                const landmarks = document.querySelectorAll('[role="banner"], [role="navigation"], [role="main"], [role="contentinfo"], header, nav, main, footer');
                if (landmarks.length === 0) {
                    results.landmarks.issues.push('No ARIA landmarks found');
                    results.landmarks.passed = false;
                }
                
                // Test for proper role attributes
                const elementsWithRoles = document.querySelectorAll('[role]');
                const validRoles = ['alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'cell', 'checkbox', 'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition', 'dialog', 'directory', 'document', 'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading', 'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee', 'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation', 'none', 'note', 'option', 'presentation', 'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox', 'separator', 'slider', 'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'];
                
                elementsWithRoles.forEach(element => {
                    const role = element.getAttribute('role');
                    if (!validRoles.includes(role)) {
                        results.roleAttributes.issues.push(`Invalid ARIA role: ${role}`);
                        results.roleAttributes.passed = false;
                    }
                });
                
                return results;
            });
            
            return screenReaderTests;
            
        } catch (error) {
            this.log(`Error testing screen reader compatibility for ${url}: ${error.message}`, 'error');
            return { error: error.message };
        }
    }

    async validate() {
        this.log('Starting accessibility validation...');
        
        await this.init();
        
        try {
            for (const url of TEST_PAGES) {
                this.log(`\nTesting accessibility for ${url}...`);
                
                const result = await this.testPageAccessibility(url);
                this.results.push(result);
            }
            
            // Generate summary
            this.generateSummary();
            
        } finally {
            await this.cleanup();
        }
        
        return this.errors.length === 0;
    }

    generateSummary() {
        this.log('\n=== ACCESSIBILITY VALIDATION SUMMARY ===');
        
        let totalViolations = 0;
        let criticalViolations = 0;
        let seriousViolations = 0;
        
        this.results.forEach(result => {
            if (result.axeResults && result.axeResults.violations) {
                totalViolations += result.axeResults.violations.length;
                
                result.axeResults.violations.forEach(violation => {
                    if (violation.impact === 'critical') {
                        criticalViolations++;
                    } else if (violation.impact === 'serious') {
                        seriousViolations++;
                    }
                });
            }
        });
        
        this.log(`Pages tested: ${TEST_PAGES.length}`);
        this.log(`Total violations: ${totalViolations}`);
        this.log(`Critical violations: ${criticalViolations}`);
        this.log(`Serious violations: ${seriousViolations}`);
        this.log(`Errors: ${this.errors.length}`);
        this.log(`Warnings: ${this.warnings.length}`);
        
        if (this.errors.length > 0) {
            this.log('\nERRORS:');
            this.errors.forEach(error => this.log(`  - ${error}`));
        }
        
        if (this.warnings.length > 0) {
            this.log('\nWARNINGS:');
            this.warnings.forEach(warning => this.log(`  - ${warning}`));
        }
        
        // Save detailed results
        fs.writeFileSync('accessibility-results.json', JSON.stringify(this.results, null, 2));
        this.log('\nDetailed results saved to accessibility-results.json');
        
        // Generate WCAG compliance report
        this.generateWCAGReport();
        
        if (criticalViolations === 0 && seriousViolations === 0) {
            this.log('✅ All critical accessibility tests passed!');
        } else {
            this.log('❌ Accessibility validation failed!');
        }
    }

    generateWCAGReport() {
        const wcagReport = {
            testDate: new Date().toISOString(),
            standard: 'WCAG 2.1 AA',
            pages: this.results.map(result => ({
                url: result.url,
                violations: result.axeResults?.violations?.map(v => ({
                    rule: v.id,
                    impact: v.impact,
                    description: v.description,
                    wcagTags: v.tags?.filter(tag => tag.startsWith('wcag')) || []
                })) || [],
                customTests: result.customTests
            }))
        };
        
        fs.writeFileSync('wcag-compliance-report.json', JSON.stringify(wcagReport, null, 2));
        this.log('WCAG compliance report saved to wcag-compliance-report.json');
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new AccessibilityValidator();
    validator.validate().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Validation failed:', error);
        process.exit(1);
    });
}

module.exports = AccessibilityValidator;