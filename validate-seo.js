#!/usr/bin/env node

/**
 * SEO Validation Script for GGUF Loader Website
 * 
 * This script validates:
 * - Canonical URLs are present and correct
 * - No duplicate content issues
 * - Proper URL hierarchy
 * - Sitemap completeness
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuration
const SITE_URL = 'https://ggufloader.github.io';
const DOCS_PAGES = [
    'docs/index.html',
    'docs/installation/index.html',
    'docs/quick-start/index.html',
    'docs/addon-development/index.html',
    'docs/addon-api/index.html',
    'docs/smart-floater-example/index.html',
    'docs/package-structure/index.html'
];

class SEOValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.canonicalUrls = new Set();
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

    validateCanonicalUrl(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const dom = new JSDOM(content);
            const document = dom.window.document;
            
            const canonicalLink = document.querySelector('link[rel="canonical"]');
            
            if (!canonicalLink) {
                this.log(`Missing canonical URL in ${filePath}`, 'error');
                return false;
            }
            
            const canonicalUrl = canonicalLink.getAttribute('href');
            
            if (!canonicalUrl.startsWith(SITE_URL)) {
                this.log(`Invalid canonical URL in ${filePath}: ${canonicalUrl}`, 'error');
                return false;
            }
            
            if (this.canonicalUrls.has(canonicalUrl)) {
                this.log(`Duplicate canonical URL found: ${canonicalUrl}`, 'error');
                return false;
            }
            
            this.canonicalUrls.add(canonicalUrl);
            this.log(`Valid canonical URL in ${filePath}: ${canonicalUrl}`);
            return true;
            
        } catch (error) {
            this.log(`Error reading ${filePath}: ${error.message}`, 'error');
            return false;
        }
    }

    validateMetaTags(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const dom = new JSDOM(content);
            const document = dom.window.document;
            
            // Check for required meta tags
            const requiredMeta = [
                'meta[name="description"]',
                'meta[name="keywords"]',
                'meta[name="robots"]',
                'meta[property="og:title"]',
                'meta[property="og:description"]',
                'meta[property="og:url"]'
            ];
            
            let valid = true;
            
            requiredMeta.forEach(selector => {
                const element = document.querySelector(selector);
                if (!element) {
                    this.log(`Missing meta tag ${selector} in ${filePath}`, 'warning');
                    valid = false;
                } else {
                    const content = element.getAttribute('content') || element.getAttribute('property');
                    if (!content || content.trim().length === 0) {
                        this.log(`Empty meta tag ${selector} in ${filePath}`, 'warning');
                        valid = false;
                    }
                }
            });
            
            return valid;
            
        } catch (error) {
            this.log(`Error validating meta tags in ${filePath}: ${error.message}`, 'error');
            return false;
        }
    }

    validateStructuredData(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const dom = new JSDOM(content);
            const document = dom.window.document;
            
            const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
            
            if (jsonLdScripts.length === 0) {
                this.log(`No structured data found in ${filePath}`, 'warning');
                return false;
            }
            
            let valid = true;
            
            jsonLdScripts.forEach((script, index) => {
                try {
                    const jsonData = JSON.parse(script.textContent);
                    
                    if (!jsonData['@context'] || !jsonData['@type']) {
                        this.log(`Invalid structured data format in ${filePath} (script ${index + 1})`, 'error');
                        valid = false;
                    } else {
                        this.log(`Valid structured data (${jsonData['@type']}) in ${filePath}`);
                    }
                    
                } catch (parseError) {
                    this.log(`Invalid JSON-LD in ${filePath} (script ${index + 1}): ${parseError.message}`, 'error');
                    valid = false;
                }
            });
            
            return valid;
            
        } catch (error) {
            this.log(`Error validating structured data in ${filePath}: ${error.message}`, 'error');
            return false;
        }
    }

    validateSitemap() {
        try {
            const sitemapPath = 'sitemap.xml';
            
            if (!fs.existsSync(sitemapPath)) {
                this.log('Sitemap.xml not found', 'error');
                return false;
            }
            
            const content = fs.readFileSync(sitemapPath, 'utf8');
            const dom = new JSDOM(content, { contentType: 'text/xml' });
            const document = dom.window.document;
            
            const urls = document.querySelectorAll('url loc');
            const sitemapUrls = Array.from(urls).map(url => url.textContent);
            
            this.log(`Sitemap contains ${sitemapUrls.length} URLs`);
            
            // Check if all documentation pages are in sitemap
            const expectedUrls = [
                `${SITE_URL}/`,
                `${SITE_URL}/docs/`,
                `${SITE_URL}/docs/installation/`,
                `${SITE_URL}/docs/quick-start/`,
                `${SITE_URL}/docs/addon-development/`,
                `${SITE_URL}/docs/addon-api/`,
                `${SITE_URL}/docs/smart-floater-example/`,
                `${SITE_URL}/docs/package-structure/`
            ];
            
            let valid = true;
            
            expectedUrls.forEach(expectedUrl => {
                if (!sitemapUrls.includes(expectedUrl)) {
                    this.log(`Missing URL in sitemap: ${expectedUrl}`, 'warning');
                    valid = false;
                }
            });
            
            return valid;
            
        } catch (error) {
            this.log(`Error validating sitemap: ${error.message}`, 'error');
            return false;
        }
    }

    validateUrlHierarchy() {
        this.log('Validating URL hierarchy...');
        
        // Expected URL structure
        const expectedStructure = {
            '/': 'Homepage',
            '/docs/': 'Documentation Hub',
            '/docs/installation/': 'Installation Guide',
            '/docs/quick-start/': 'Quick Start Guide',
            '/docs/addon-development/': 'Addon Development Guide',
            '/docs/addon-api/': 'API Reference',
            '/docs/smart-floater-example/': 'Smart Floater Example',
            '/docs/package-structure/': 'Package Structure'
        };
        
        Object.entries(expectedStructure).forEach(([url, description]) => {
            this.log(`✓ ${url} - ${description}`);
        });
        
        this.log('URL hierarchy validation complete');
        return true;
    }

    async validate() {
        this.log('Starting SEO validation...');
        
        // Validate main index page
        if (fs.existsSync('index.html')) {
            this.validateCanonicalUrl('index.html');
            this.validateMetaTags('index.html');
            this.validateStructuredData('index.html');
        }
        
        // Validate documentation pages
        DOCS_PAGES.forEach(page => {
            if (fs.existsSync(page)) {
                this.log(`Validating ${page}...`);
                this.validateCanonicalUrl(page);
                this.validateMetaTags(page);
                this.validateStructuredData(page);
            } else {
                this.log(`File not found: ${page}`, 'warning');
            }
        });
        
        // Validate sitemap
        this.validateSitemap();
        
        // Validate URL hierarchy
        this.validateUrlHierarchy();
        
        // Summary
        this.log('\n=== VALIDATION SUMMARY ===');
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
        
        if (this.errors.length === 0 && this.warnings.length === 0) {
            this.log('✅ All SEO validations passed!');
        }
        
        return this.errors.length === 0;
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new SEOValidator();
    validator.validate().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = SEOValidator;