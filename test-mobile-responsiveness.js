#!/usr/bin/env node

/**
 * Mobile Responsiveness Testing Script for GGUF Loader Website
 * 
 * This script tests responsive design across different viewport sizes
 * and validates touch-friendly interface requirements
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

const VIEWPORT_SIZES = [
    { name: 'Mobile Portrait', width: 375, height: 667, deviceScaleFactor: 2 },
    { name: 'Mobile Landscape', width: 667, height: 375, deviceScaleFactor: 2 },
    { name: 'Tablet Portrait', width: 768, height: 1024, deviceScaleFactor: 2 },
    { name: 'Tablet Landscape', width: 1024, height: 768, deviceScaleFactor: 2 },
    { name: 'Desktop Small', width: 1280, height: 720, deviceScaleFactor: 1 },
    { name: 'Desktop Large', width: 1920, height: 1080, deviceScaleFactor: 1 }
];

const TOUCH_TARGET_MIN_SIZE = 44; // Minimum touch target size in pixels

class MobileResponsivenessValidator {
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

    async testPageResponsiveness(url, viewport) {
        const page = await this.browser.newPage();
        
        try {
            // Set viewport
            await page.setViewport(viewport);
            
            // Navigate to page
            await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
            
            // Test results for this page/viewport combination
            const testResult = {
                url,
                viewport: viewport.name,
                tests: {}
            };

            // Test 1: Check for horizontal scrolling
            testResult.tests.horizontalScrolling = await this.checkHorizontalScrolling(page, url, viewport.name);
            
            // Test 2: Validate touch target sizes
            testResult.tests.touchTargets = await this.validateTouchTargets(page, url, viewport.name);
            
            // Test 3: Check text readability
            testResult.tests.textReadability = await this.checkTextReadability(page, url, viewport.name);
            
            // Test 4: Validate navigation functionality
            testResult.tests.navigation = await this.validateNavigation(page, url, viewport.name);
            
            // Test 5: Check image responsiveness
            testResult.tests.imageResponsiveness = await this.checkImageResponsiveness(page, url, viewport.name);
            
            // Test 6: Validate floating buttons on mobile
            if (viewport.width <= 768) {
                testResult.tests.floatingButtons = await this.validateFloatingButtons(page, url, viewport.name);
            }

            return testResult;

        } catch (error) {
            this.log(`Error testing ${url} on ${viewport.name}: ${error.message}`, 'error');
            return {
                url,
                viewport: viewport.name,
                error: error.message
            };
        } finally {
            await page.close();
        }
    }

    async checkHorizontalScrolling(page, url, viewportName) {
        try {
            const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
            const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
            
            const hasHorizontalScroll = scrollWidth > clientWidth;
            
            if (hasHorizontalScroll) {
                this.log(`Horizontal scrolling detected on ${url} (${viewportName})`, 'error');
                return { passed: false, scrollWidth, clientWidth };
            }
            
            return { passed: true, scrollWidth, clientWidth };
            
        } catch (error) {
            this.log(`Error checking horizontal scrolling on ${url}: ${error.message}`, 'error');
            return { passed: false, error: error.message };
        }
    }

    async validateTouchTargets(page, url, viewportName) {
        try {
            const touchTargets = await page.evaluate((minSize) => {
                const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [role="button"], [tabindex]');
                const results = [];
                
                interactiveElements.forEach((element, index) => {
                    const rect = element.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(element);
                    
                    // Skip hidden elements
                    if (rect.width === 0 || rect.height === 0 || computedStyle.display === 'none') {
                        return;
                    }
                    
                    const width = Math.max(rect.width, parseFloat(computedStyle.minWidth) || 0);
                    const height = Math.max(rect.height, parseFloat(computedStyle.minHeight) || 0);
                    
                    results.push({
                        index,
                        tagName: element.tagName,
                        className: element.className,
                        width,
                        height,
                        meetsMinSize: width >= minSize && height >= minSize,
                        text: element.textContent?.trim().substring(0, 50) || ''
                    });
                });
                
                return results;
            }, TOUCH_TARGET_MIN_SIZE);
            
            const failedTargets = touchTargets.filter(target => !target.meetsMinSize);
            
            if (failedTargets.length > 0) {
                failedTargets.forEach(target => {
                    this.log(`Touch target too small on ${url} (${viewportName}): ${target.tagName}.${target.className} (${target.width}x${target.height}px)`, 'error');
                });
            }
            
            return {
                passed: failedTargets.length === 0,
                totalTargets: touchTargets.length,
                failedTargets: failedTargets.length,
                details: failedTargets
            };
            
        } catch (error) {
            this.log(`Error validating touch targets on ${url}: ${error.message}`, 'error');
            return { passed: false, error: error.message };
        }
    }

    async checkTextReadability(page, url, viewportName) {
        try {
            const textElements = await page.evaluate(() => {
                const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span, div');
                const results = [];
                
                elements.forEach(element => {
                    const computedStyle = window.getComputedStyle(element);
                    const fontSize = parseFloat(computedStyle.fontSize);
                    const lineHeight = parseFloat(computedStyle.lineHeight);
                    
                    // Skip elements with no text content
                    if (!element.textContent?.trim()) return;
                    
                    results.push({
                        tagName: element.tagName,
                        fontSize,
                        lineHeight,
                        textContent: element.textContent.trim().substring(0, 100)
                    });
                });
                
                return results;
            });
            
            const minFontSize = 16; // Minimum readable font size on mobile
            const smallTextElements = textElements.filter(el => el.fontSize < minFontSize);
            
            if (smallTextElements.length > 0) {
                this.log(`Small text detected on ${url} (${viewportName}): ${smallTextElements.length} elements below ${minFontSize}px`, 'warning');
            }
            
            return {
                passed: smallTextElements.length === 0,
                totalElements: textElements.length,
                smallTextElements: smallTextElements.length,
                minFontSize
            };
            
        } catch (error) {
            this.log(`Error checking text readability on ${url}: ${error.message}`, 'error');
            return { passed: false, error: error.message };
        }
    }

    async validateNavigation(page, url, viewportName) {
        try {
            const navigationTests = await page.evaluate(() => {
                const results = {
                    mobileMenu: false,
                    hamburgerButton: false,
                    navigationLinks: 0,
                    workingLinks: 0
                };
                
                // Check for mobile menu
                const mobileMenus = document.querySelectorAll('.mobile-menu, .hamburger-menu, [class*="mobile"], [class*="hamburger"]');
                results.mobileMenu = mobileMenus.length > 0;
                
                // Check for hamburger button
                const hamburgerButtons = document.querySelectorAll('.hamburger, .menu-toggle, [aria-label*="menu"], [aria-label*="Menu"]');
                results.hamburgerButton = hamburgerButtons.length > 0;
                
                // Count navigation links
                const navLinks = document.querySelectorAll('nav a, .nav a, .navigation a');
                results.navigationLinks = navLinks.length;
                
                // Test if links are clickable (basic check)
                navLinks.forEach(link => {
                    const rect = link.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        results.workingLinks++;
                    }
                });
                
                return results;
            });
            
            // For mobile viewports, expect mobile navigation features
            if (viewportName.includes('Mobile') || viewportName.includes('Tablet')) {
                if (!navigationTests.mobileMenu && !navigationTests.hamburgerButton) {
                    this.log(`Missing mobile navigation on ${url} (${viewportName})`, 'warning');
                }
            }
            
            return {
                passed: navigationTests.workingLinks === navigationTests.navigationLinks,
                ...navigationTests
            };
            
        } catch (error) {
            this.log(`Error validating navigation on ${url}: ${error.message}`, 'error');
            return { passed: false, error: error.message };
        }
    }

    async checkImageResponsiveness(page, url, viewportName) {
        try {
            const imageTests = await page.evaluate(() => {
                const images = document.querySelectorAll('img');
                const results = [];
                
                images.forEach(img => {
                    const rect = img.getBoundingClientRect();
                    const naturalWidth = img.naturalWidth;
                    const displayWidth = rect.width;
                    
                    results.push({
                        src: img.src,
                        alt: img.alt,
                        naturalWidth,
                        displayWidth,
                        hasAlt: !!img.alt,
                        isResponsive: img.style.maxWidth === '100%' || img.style.width === '100%' || 
                                     window.getComputedStyle(img).maxWidth === '100%',
                        overflowing: displayWidth > window.innerWidth
                    });
                });
                
                return results;
            });
            
            const overflowingImages = imageTests.filter(img => img.overflowing);
            const missingAltImages = imageTests.filter(img => !img.hasAlt);
            
            if (overflowingImages.length > 0) {
                this.log(`Images overflowing viewport on ${url} (${viewportName}): ${overflowingImages.length} images`, 'error');
            }
            
            if (missingAltImages.length > 0) {
                this.log(`Images missing alt text on ${url} (${viewportName}): ${missingAltImages.length} images`, 'warning');
            }
            
            return {
                passed: overflowingImages.length === 0,
                totalImages: imageTests.length,
                overflowingImages: overflowingImages.length,
                missingAltImages: missingAltImages.length
            };
            
        } catch (error) {
            this.log(`Error checking image responsiveness on ${url}: ${error.message}`, 'error');
            return { passed: false, error: error.message };
        }
    }

    async validateFloatingButtons(page, url, viewportName) {
        try {
            const buttonTests = await page.evaluate((minTouchSize) => {
                const floatingButtons = document.querySelectorAll('.floating-button');
                const results = {
                    totalButtons: floatingButtons.length,
                    visibleButtons: 0,
                    touchFriendlyButtons: 0,
                    overlappingButtons: 0
                };
                
                const buttonRects = [];
                
                floatingButtons.forEach(button => {
                    const rect = button.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(button);
                    
                    // Check if button is visible
                    if (rect.width > 0 && rect.height > 0 && computedStyle.display !== 'none') {
                        results.visibleButtons++;
                        
                        // Check if button meets touch target size
                        if (rect.width >= minTouchSize && rect.height >= minTouchSize) {
                            results.touchFriendlyButtons++;
                        }
                        
                        buttonRects.push(rect);
                    }
                });
                
                // Check for overlapping buttons
                for (let i = 0; i < buttonRects.length; i++) {
                    for (let j = i + 1; j < buttonRects.length; j++) {
                        const rect1 = buttonRects[i];
                        const rect2 = buttonRects[j];
                        
                        if (rect1.left < rect2.right && rect2.left < rect1.right &&
                            rect1.top < rect2.bottom && rect2.top < rect1.bottom) {
                            results.overlappingButtons++;
                        }
                    }
                }
                
                return results;
            }, TOUCH_TARGET_MIN_SIZE);
            
            if (buttonTests.overlappingButtons > 0) {
                this.log(`Overlapping floating buttons on ${url} (${viewportName}): ${buttonTests.overlappingButtons} overlaps`, 'error');
            }
            
            if (buttonTests.touchFriendlyButtons < buttonTests.visibleButtons) {
                this.log(`Non-touch-friendly floating buttons on ${url} (${viewportName}): ${buttonTests.visibleButtons - buttonTests.touchFriendlyButtons} buttons`, 'error');
            }
            
            return {
                passed: buttonTests.overlappingButtons === 0 && buttonTests.touchFriendlyButtons === buttonTests.visibleButtons,
                ...buttonTests
            };
            
        } catch (error) {
            this.log(`Error validating floating buttons on ${url}: ${error.message}`, 'error');
            return { passed: false, error: error.message };
        }
    }

    async validate() {
        this.log('Starting mobile responsiveness validation...');
        
        await this.init();
        
        try {
            for (const url of TEST_PAGES) {
                this.log(`\nTesting ${url}...`);
                
                for (const viewport of VIEWPORT_SIZES) {
                    this.log(`  Testing on ${viewport.name} (${viewport.width}x${viewport.height})`);
                    
                    const result = await this.testPageResponsiveness(url, viewport);
                    this.results.push(result);
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
        this.log('\n=== MOBILE RESPONSIVENESS VALIDATION SUMMARY ===');
        
        const totalTests = this.results.length;
        const passedTests = this.results.filter(result => !result.error && 
            Object.values(result.tests || {}).every(test => test.passed)).length;
        
        this.log(`Total tests: ${totalTests}`);
        this.log(`Passed tests: ${passedTests}`);
        this.log(`Failed tests: ${totalTests - passedTests}`);
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
        fs.writeFileSync('mobile-responsiveness-results.json', JSON.stringify(this.results, null, 2));
        this.log('\nDetailed results saved to mobile-responsiveness-results.json');
        
        if (this.errors.length === 0) {
            this.log('✅ All mobile responsiveness tests passed!');
        } else {
            this.log('❌ Mobile responsiveness validation failed!');
        }
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new MobileResponsivenessValidator();
    validator.validate().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Validation failed:', error);
        process.exit(1);
    });
}

module.exports = MobileResponsivenessValidator;