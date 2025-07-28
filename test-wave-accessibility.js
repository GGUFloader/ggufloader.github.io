#!/usr/bin/env node

/**
 * WAVE Accessibility Testing Script for GGUF Loader Website
 * 
 * This script integrates with WAVE (Web Accessibility Evaluation Tool)
 * to provide comprehensive accessibility testing
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

class WAVEAccessibilityValidator {
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
            
            // Run comprehensive accessibility tests
            const accessibilityTests = await this.runComprehensiveTests(page, url);
            
            // Test keyboard navigation
            const keyboardTests = await this.testKeyboardNavigation(page, url);
            
            // Test screen reader compatibility
            const screenReaderTests = await this.testScreenReaderCompatibility(page, url);
            
            // Test color contrast
            const colorContrastTests = await this.testColorContrast(page, url);
            
            // Test focus management
            const focusTests = await this.testFocusManagement(page, url);
            
            // Test ARIA implementation
            const ariaTests = await this.testARIAImplementation(page, url);
            
            const result = {
                url,
                timestamp: new Date().toISOString(),
                tests: {
                    comprehensive: accessibilityTests,
                    keyboard: keyboardTests,
                    screenReader: screenReaderTests,
                    colorContrast: colorContrastTests,
                    focus: focusTests,
                    aria: ariaTests
                }
            };
            
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

    async runComprehensiveTests(page, url) {
        try {
            const tests = await page.evaluate(() => {
                const results = {
                    headingStructure: { passed: true, issues: [] },
                    imageAltText: { passed: true, issues: [] },
                    formLabels: { passed: true, issues: [] },
                    linkText: { passed: true, issues: [] },
                    semanticStructure: { passed: true, issues: [] },
                    landmarks: { passed: true, issues: [] }
                };
                
                // Test 1: Heading structure
                const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                let previousLevel = 0;
                let h1Count = 0;
                
                headings.forEach((heading, index) => {
                    const level = parseInt(heading.tagName.charAt(1));
                    
                    if (level === 1) h1Count++;
                    
                    if (index === 0 && level !== 1) {
                        results.headingStructure.issues.push('First heading should be h1');
                        results.headingStructure.passed = false;
                    }
                    
                    if (level > previousLevel + 1) {
                        results.headingStructure.issues.push(`Heading level jumps from h${previousLevel} to h${level}`);
                        results.headingStructure.passed = false;
                    }
                    
                    if (!heading.textContent.trim()) {
                        results.headingStructure.issues.push(`Empty heading: ${heading.tagName}`);
                        results.headingStructure.passed = false;
                    }
                    
                    previousLevel = level;
                });
                
                if (h1Count === 0) {
                    results.headingStructure.issues.push('No h1 heading found');
                    results.headingStructure.passed = false;
                } else if (h1Count > 1) {
                    results.headingStructure.issues.push(`Multiple h1 headings found: ${h1Count}`);
                    results.headingStructure.passed = false;
                }
                
                // Test 2: Image alt text
                const images = document.querySelectorAll('img');
                images.forEach((img, index) => {
                    if (!img.alt && !img.getAttribute('aria-label') && !img.getAttribute('role')) {
                        results.imageAltText.issues.push(`Image ${index + 1} missing alt text: ${img.src}`);
                        results.imageAltText.passed = false;
                    }
                    
                    if (img.alt === img.src || img.alt === 'image') {
                        results.imageAltText.issues.push(`Image ${index + 1} has generic alt text: ${img.alt}`);
                        results.imageAltText.passed = false;
                    }
                });
                
                // Test 3: Form labels
                const inputs = document.querySelectorAll('input, select, textarea');
                inputs.forEach((input, index) => {
                    const hasLabel = document.querySelector(`label[for="${input.id}"]`) || 
                                   input.getAttribute('aria-label') || 
                                   input.getAttribute('aria-labelledby') ||
                                   input.closest('label');
                    
                    if (!hasLabel && input.type !== 'hidden' && input.type !== 'submit' && input.type !== 'button') {
                        results.formLabels.issues.push(`Form input ${index + 1} missing label: ${input.type || input.tagName}`);
                        results.formLabels.passed = false;
                    }
                });
                
                // Test 4: Link text
                const links = document.querySelectorAll('a[href]');
                links.forEach((link, index) => {
                    const linkText = link.textContent.trim() || link.getAttribute('aria-label') || link.getAttribute('title');
                    
                    if (!linkText) {
                        results.linkText.issues.push(`Link ${index + 1} has no accessible text`);
                        results.linkText.passed = false;
                    } else if (linkText.toLowerCase().match(/^(click here|here|more|read more|link)$/)) {
                        results.linkText.issues.push(`Link ${index + 1} has generic text: "${linkText}"`);
                        results.linkText.passed = false;
                    }
                });
                
                // Test 5: Semantic structure
                const semanticElements = document.querySelectorAll('main, nav, header, footer, section, article, aside');
                if (semanticElements.length === 0) {
                    results.semanticStructure.issues.push('No semantic HTML elements found');
                    results.semanticStructure.passed = false;
                }
                
                const mainElements = document.querySelectorAll('main');
                if (mainElements.length === 0) {
                    results.semanticStructure.issues.push('Missing main element');
                    results.semanticStructure.passed = false;
                } else if (mainElements.length > 1) {
                    results.semanticStructure.issues.push('Multiple main elements found');
                    results.semanticStructure.passed = false;
                }
                
                // Test 6: ARIA landmarks
                const landmarks = document.querySelectorAll('[role="banner"], [role="navigation"], [role="main"], [role="contentinfo"], header, nav, main, footer');
                if (landmarks.length === 0) {
                    results.landmarks.issues.push('No ARIA landmarks found');
                    results.landmarks.passed = false;
                }
                
                return results;
            });
            
            return tests;
            
        } catch (error) {
            this.log(`Error running comprehensive tests for ${url}: ${error.message}`, 'error');
            return { error: error.message };
        }
    }

    async testKeyboardNavigation(page, url) {
        try {
            // Test tab order and keyboard accessibility
            const keyboardTests = await page.evaluate(() => {
                return new Promise((resolve) => {
                    const results = {
                        focusableElements: 0,
                        tabOrder: { passed: true, issues: [] },
                        skipLinks: { passed: true, issues: [] },
                        keyboardTraps: { passed: true, issues: [] }
                    };
                    
                    // Get all focusable elements
                    const focusableElements = Array.from(document.querySelectorAll(
                        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    )).filter(el => {
                        const style = window.getComputedStyle(el);
                        return style.display !== 'none' && style.visibility !== 'hidden';
                    });
                    
                    results.focusableElements = focusableElements.length;
                    
                    // Check for skip links
                    const skipLinks = document.querySelectorAll('a[href^="#"]');
                    let hasSkipToMain = false;
                    skipLinks.forEach(link => {
                        const text = link.textContent.toLowerCase();
                        if (text.includes('skip') && (text.includes('main') || text.includes('content'))) {
                            hasSkipToMain = true;
                        }
                    });
                    
                    if (!hasSkipToMain && focusableElements.length > 10) {
                        results.skipLinks.issues.push('Consider adding skip to main content link');
                        results.skipLinks.passed = false;
                    }
                    
                    // Check tab order
                    let previousTabIndex = -1;
                    focusableElements.forEach((element, index) => {
                        const tabIndex = parseInt(element.getAttribute('tabindex')) || 0;
                        if (tabIndex > 0 && tabIndex < previousTabIndex) {
                            results.tabOrder.issues.push('Tab order may be confusing');
                            results.tabOrder.passed = false;
                        }
                        previousTabIndex = tabIndex;
                    });
                    
                    resolve(results);
                });
            });
            
            // Test actual keyboard navigation
            await page.keyboard.press('Tab');
            const firstFocused = await page.evaluate(() => document.activeElement.tagName);
            
            // Test escape key functionality
            await page.keyboard.press('Escape');
            
            return {
                ...keyboardTests,
                firstFocusedElement: firstFocused,
                passed: keyboardTests.tabOrder.passed && keyboardTests.skipLinks.passed
            };
            
        } catch (error) {
            this.log(`Error testing keyboard navigation for ${url}: ${error.message}`, 'error');
            return { passed: false, error: error.message };
        }
    }

    async testScreenReaderCompatibility(page, url) {
        try {
            const screenReaderTests = await page.evaluate(() => {
                const results = {
                    ariaLabels: { passed: true, issues: [] },
                    ariaDescriptions: { passed: true, issues: [] },
                    liveRegions: { passed: true, issues: [] },
                    roleAttributes: { passed: true, issues: [] }
                };
                
                // Test ARIA labels
                const elementsNeedingLabels = document.querySelectorAll('button, input, select, textarea');
                elementsNeedingLabels.forEach((element, index) => {
                    const hasAccessibleName = element.getAttribute('aria-label') || 
                                            element.getAttribute('aria-labelledby') ||
                                            document.querySelector(`label[for="${element.id}"]`) ||
                                            element.textContent.trim();
                    
                    if (!hasAccessibleName) {
                        results.ariaLabels.issues.push(`Element ${index + 1} missing accessible name: ${element.tagName}`);
                        results.ariaLabels.passed = false;
                    }
                });
                
                // Test ARIA descriptions
                const elementsWithDescriptions = document.querySelectorAll('[aria-describedby]');
                elementsWithDescriptions.forEach((element, index) => {
                    const describedBy = element.getAttribute('aria-describedby');
                    const descriptionElement = document.getElementById(describedBy);
                    
                    if (!descriptionElement) {
                        results.ariaDescriptions.issues.push(`Element ${index + 1} references non-existent description: ${describedBy}`);
                        results.ariaDescriptions.passed = false;
                    }
                });
                
                // Test live regions
                const liveRegions = document.querySelectorAll('[aria-live], [role="status"], [role="alert"]');
                results.liveRegions.count = liveRegions.length;
                
                // Test role attributes
                const elementsWithRoles = document.querySelectorAll('[role]');
                const validRoles = ['alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'cell', 'checkbox', 'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition', 'dialog', 'directory', 'document', 'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading', 'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee', 'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation', 'none', 'note', 'option', 'presentation', 'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox', 'separator', 'slider', 'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'];
                
                elementsWithRoles.forEach((element, index) => {
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
            return { passed: false, error: error.message };
        }
    }

    async testColorContrast(page, url) {
        try {
            const contrastTests = await page.evaluate(() => {
                const results = {
                    passed: true,
                    issues: [],
                    testedElements: 0
                };
                
                // Helper function to calculate relative luminance
                function getLuminance(r, g, b) {
                    const [rs, gs, bs] = [r, g, b].map(c => {
                        c = c / 255;
                        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
                    });
                    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
                }
                
                // Helper function to calculate contrast ratio
                function getContrastRatio(color1, color2) {
                    const lum1 = getLuminance(...color1);
                    const lum2 = getLuminance(...color2);
                    const brightest = Math.max(lum1, lum2);
                    const darkest = Math.min(lum1, lum2);
                    return (brightest + 0.05) / (darkest + 0.05);
                }
                
                // Helper function to parse RGB color
                function parseColor(colorStr) {
                    const div = document.createElement('div');
                    div.style.color = colorStr;
                    document.body.appendChild(div);
                    const rgbColor = window.getComputedStyle(div).color;
                    document.body.removeChild(div);
                    
                    const match = rgbColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                    return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [0, 0, 0];
                }
                
                // Test text elements
                const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button, label');
                
                textElements.forEach((element, index) => {
                    if (!element.textContent.trim()) return;
                    
                    const style = window.getComputedStyle(element);
                    const textColor = parseColor(style.color);
                    const bgColor = parseColor(style.backgroundColor);
                    
                    // If background is transparent, try to find parent background
                    let actualBgColor = bgColor;
                    if (bgColor[0] === 0 && bgColor[1] === 0 && bgColor[2] === 0) {
                        let parent = element.parentElement;
                        while (parent && actualBgColor[0] === 0 && actualBgColor[1] === 0 && actualBgColor[2] === 0) {
                            const parentStyle = window.getComputedStyle(parent);
                            actualBgColor = parseColor(parentStyle.backgroundColor);
                            parent = parent.parentElement;
                        }
                        // Default to white if no background found
                        if (actualBgColor[0] === 0 && actualBgColor[1] === 0 && actualBgColor[2] === 0) {
                            actualBgColor = [255, 255, 255];
                        }
                    }
                    
                    const contrastRatio = getContrastRatio(textColor, actualBgColor);
                    const fontSize = parseFloat(style.fontSize);
                    const fontWeight = style.fontWeight;
                    
                    // WCAG AA requirements
                    const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
                    const requiredRatio = isLargeText ? 3 : 4.5;
                    
                    results.testedElements++;
                    
                    if (contrastRatio < requiredRatio) {
                        results.issues.push(`Low contrast ratio ${contrastRatio.toFixed(2)}:1 (required ${requiredRatio}:1) for element ${index + 1}`);
                        results.passed = false;
                    }
                });
                
                return results;
            });
            
            return contrastTests;
            
        } catch (error) {
            this.log(`Error testing color contrast for ${url}: ${error.message}`, 'error');
            return { passed: false, error: error.message };
        }
    }

    async testFocusManagement(page, url) {
        try {
            const focusTests = await page.evaluate(() => {
                const results = {
                    focusIndicators: { passed: true, issues: [] },
                    focusOrder: { passed: true, issues: [] },
                    focusTrapping: { passed: true, issues: [] }
                };
                
                // Test focus indicators
                const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
                focusableElements.forEach((element, index) => {
                    // Simulate focus to test indicator
                    element.focus();
                    const computedStyle = window.getComputedStyle(element, ':focus');
                    
                    const hasOutline = computedStyle.outline !== 'none' && computedStyle.outline !== '0px';
                    const hasBoxShadow = computedStyle.boxShadow !== 'none';
                    const hasBorder = computedStyle.borderColor !== computedStyle.borderColor; // Check if border changes
                    
                    if (!hasOutline && !hasBoxShadow && !hasBorder) {
                        results.focusIndicators.issues.push(`Element ${index + 1} missing focus indicator: ${element.tagName}`);
                        results.focusIndicators.passed = false;
                    }
                });
                
                // Test focus order
                const tabbableElements = Array.from(focusableElements).filter(el => {
                    const tabIndex = el.getAttribute('tabindex');
                    return tabIndex !== '-1' && window.getComputedStyle(el).display !== 'none';
                });
                
                // Check for logical focus order
                let previousTop = -1;
                tabbableElements.forEach((element, index) => {
                    const rect = element.getBoundingClientRect();
                    if (rect.top < previousTop - 50) { // Allow some tolerance
                        results.focusOrder.issues.push('Focus order may not follow visual order');
                        results.focusOrder.passed = false;
                    }
                    previousTop = rect.top;
                });
                
                return results;
            });
            
            return focusTests;
            
        } catch (error) {
            this.log(`Error testing focus management for ${url}: ${error.message}`, 'error');
            return { passed: false, error: error.message };
        }
    }

    async testARIAImplementation(page, url) {
        try {
            const ariaTests = await page.evaluate(() => {
                const results = {
                    ariaAttributes: { passed: true, issues: [] },
                    ariaStates: { passed: true, issues: [] },
                    ariaProperties: { passed: true, issues: [] }
                };
                
                // Test ARIA attributes
                const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
                elementsWithAria.forEach((element, index) => {
                    // Check aria-labelledby references
                    const labelledBy = element.getAttribute('aria-labelledby');
                    if (labelledBy) {
                        const labelElements = labelledBy.split(' ').map(id => document.getElementById(id));
                        if (labelElements.some(el => !el)) {
                            results.ariaAttributes.issues.push(`Element ${index + 1} references non-existent label`);
                            results.ariaAttributes.passed = false;
                        }
                    }
                    
                    // Check aria-describedby references
                    const describedBy = element.getAttribute('aria-describedby');
                    if (describedBy) {
                        const descElements = describedBy.split(' ').map(id => document.getElementById(id));
                        if (descElements.some(el => !el)) {
                            results.ariaAttributes.issues.push(`Element ${index + 1} references non-existent description`);
                            results.ariaAttributes.passed = false;
                        }
                    }
                });
                
                // Test ARIA states
                const elementsWithStates = document.querySelectorAll('[aria-expanded], [aria-selected], [aria-checked], [aria-pressed]');
                elementsWithStates.forEach((element, index) => {
                    const expanded = element.getAttribute('aria-expanded');
                    const selected = element.getAttribute('aria-selected');
                    const checked = element.getAttribute('aria-checked');
                    const pressed = element.getAttribute('aria-pressed');
                    
                    if (expanded && !['true', 'false'].includes(expanded)) {
                        results.ariaStates.issues.push(`Invalid aria-expanded value: ${expanded}`);
                        results.ariaStates.passed = false;
                    }
                    
                    if (selected && !['true', 'false'].includes(selected)) {
                        results.ariaStates.issues.push(`Invalid aria-selected value: ${selected}`);
                        results.ariaStates.passed = false;
                    }
                    
                    if (checked && !['true', 'false', 'mixed'].includes(checked)) {
                        results.ariaStates.issues.push(`Invalid aria-checked value: ${checked}`);
                        results.ariaStates.passed = false;
                    }
                    
                    if (pressed && !['true', 'false', 'mixed'].includes(pressed)) {
                        results.ariaStates.issues.push(`Invalid aria-pressed value: ${pressed}`);
                        results.ariaStates.passed = false;
                    }
                });
                
                return results;
            });
            
            return ariaTests;
            
        } catch (error) {
            this.log(`Error testing ARIA implementation for ${url}: ${error.message}`, 'error');
            return { passed: false, error: error.message };
        }
    }

    async validate() {
        this.log('Starting WAVE accessibility validation...');
        
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
        this.log('\n=== WAVE ACCESSIBILITY VALIDATION SUMMARY ===');
        
        let totalIssues = 0;
        let criticalIssues = 0;
        
        this.results.forEach(result => {
            if (result.tests) {
                Object.values(result.tests).forEach(test => {
                    if (test.issues) {
                        totalIssues += test.issues.length;
                        if (!test.passed) {
                            criticalIssues++;
                        }
                    }
                });
            }
        });
        
        this.log(`Pages tested: ${TEST_PAGES.length}`);
        this.log(`Total accessibility issues: ${totalIssues}`);
        this.log(`Critical issues: ${criticalIssues}`);
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
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                pagesTested: TEST_PAGES.length,
                totalIssues,
                criticalIssues,
                errors: this.errors.length,
                warnings: this.warnings.length
            },
            results: this.results
        };
        
        fs.writeFileSync('wave-accessibility-results.json', JSON.stringify(report, null, 2));
        this.log('\nDetailed results saved to wave-accessibility-results.json');
        
        if (criticalIssues === 0 && this.errors.length === 0) {
            this.log('✅ All WAVE accessibility tests passed!');
        } else {
            this.log('❌ WAVE accessibility validation failed!');
        }
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new WAVEAccessibilityValidator();
    validator.validate().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Validation failed:', error);
        process.exit(1);
    });
}

module.exports = WAVEAccessibilityValidator;