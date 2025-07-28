#!/usr/bin/env node

/**
 * Cache Headers Testing Script for GGUF Loader Website
 * 
 * This script validates HTTP cache headers for optimal performance
 * and ensures proper caching strategies are implemented
 */

const https = require('https');
const http = require('http');
const fs = require('fs');

// Test configuration
const SITE_URL = 'https://ggufloader.github.io';
const TEST_PATHS = [
    '/',
    '/docs/',
    '/docs/installation/',
    '/docs/quick-start/',
    '/docs/addon-development/',
    '/docs/addon-api/',
    '/docs/smart-floater-example/',
    '/docs/package-structure/',
    '/styles.css',
    '/styles.min.css',
    '/floating-buttons.js',
    '/floating-buttons.min.js',
    '/model-comparison.js',
    '/analytics.js',
    '/preview.png',
    '/manifest.json',
    '/sitemap.xml',
    '/robots.txt',
    '/sw.js'
];

class CacheHeadersValidator {
    constructor() {
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

    async testCacheHeaders(path) {
        return new Promise((resolve) => {
            const url = new URL(path, SITE_URL);
            const client = url.protocol === 'https:' ? https : http;
            
            const req = client.request(url, {
                method: 'HEAD',
                timeout: 10000,
                headers: {
                    'User-Agent': 'GGUF-Loader-Cache-Test/1.0'
                }
            }, (res) => {
                const headers = res.headers;
                const result = {
                    path,
                    statusCode: res.statusCode,
                    headers: {
                        cacheControl: headers['cache-control'],
                        expires: headers['expires'],
                        etag: headers['etag'],
                        lastModified: headers['last-modified'],
                        contentType: headers['content-type'],
                        contentEncoding: headers['content-encoding'],
                        vary: headers['vary'],
                        pragma: headers['pragma']
                    },
                    tests: {}
                };
                
                // Test cache control
                result.tests.cacheControl = this.validateCacheControl(headers['cache-control'], path);
                
                // Test ETag presence
                result.tests.etag = this.validateETag(headers['etag'], path);
                
                // Test compression
                result.tests.compression = this.validateCompression(headers['content-encoding'], headers['content-type'], path);
                
                // Test content type
                result.tests.contentType = this.validateContentType(headers['content-type'], path);
                
                // Test security headers
                result.tests.security = this.validateSecurityHeaders(headers, path);
                
                // Test performance headers
                result.tests.performance = this.validatePerformanceHeaders(headers, path);
                
                resolve(result);
            });
            
            req.on('error', (error) => {
                this.log(`Error testing ${path}: ${error.message}`, 'error');
                resolve({
                    path,
                    error: error.message
                });
            });
            
            req.on('timeout', () => {
                this.log(`Timeout testing ${path}`, 'error');
                req.destroy();
                resolve({
                    path,
                    error: 'Request timeout'
                });
            });
            
            req.end();
        });
    }

    validateCacheControl(cacheControl, path) {
        if (!cacheControl) {
            this.log(`Missing Cache-Control header for ${path}`, 'warning');
            return { passed: false, reason: 'Missing Cache-Control header' };
        }
        
        // Different cache strategies for different file types
        const fileExtension = path.split('.').pop();
        
        if (['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg', 'woff', 'woff2', 'ico'].includes(fileExtension)) {
            // Static assets should have long cache times
            if (!cacheControl.includes('max-age') || !cacheControl.match(/max-age=(\d+)/) || parseInt(cacheControl.match(/max-age=(\d+)/)[1]) < 86400) {
                this.log(`Static asset ${path} should have longer cache time (min 24h)`, 'warning');
                return { passed: false, reason: 'Static asset needs longer cache time' };
            }
            
            // Versioned assets can have immutable cache
            if (path.includes('.min.') || path.includes('-v') || path.includes('?v=')) {
                if (!cacheControl.includes('immutable')) {
                    this.log(`Versioned asset ${path} could use immutable cache`, 'info');
                }
            }
        } else if (path.endsWith('.json') && (path.includes('manifest') || path.includes('sitemap'))) {
            // Manifest and sitemap should have moderate cache times
            if (!cacheControl.includes('max-age') || parseInt(cacheControl.match(/max-age=(\d+)/)?.[1] || 0) < 3600) {
                this.log(`${path} should have at least 1 hour cache time`, 'warning');
                return { passed: false, reason: 'Manifest/sitemap needs longer cache time' };
            }
        } else {
            // HTML pages should have shorter cache times or be revalidated
            if (cacheControl.includes('no-cache') || cacheControl.includes('no-store')) {
                return { passed: true, reason: 'Appropriate no-cache for HTML' };
            }
            
            if (cacheControl.includes('max-age')) {
                const maxAge = parseInt(cacheControl.match(/max-age=(\d+)/)[1]);
                if (maxAge > 3600) { // More than 1 hour
                    this.log(`HTML page ${path} has very long cache time`, 'warning');
                    return { passed: false, reason: 'HTML page cache time too long' };
                }
            }
            
            // HTML should include must-revalidate or no-cache
            if (!cacheControl.includes('must-revalidate') && !cacheControl.includes('no-cache')) {
                this.log(`HTML page ${path} should include must-revalidate`, 'info');
            }
        }
        
        return { passed: true, reason: 'Cache-Control header appropriate' };
    }

    validateETag(etag, path) {
        if (!etag) {
            this.log(`Missing ETag header for ${path}`, 'warning');
            return { passed: false, reason: 'Missing ETag header' };
        }
        
        // Check ETag format (should be quoted)
        if (!etag.startsWith('"') || !etag.endsWith('"')) {
            this.log(`ETag for ${path} should be quoted`, 'warning');
            return { passed: false, reason: 'ETag not properly quoted' };
        }
        
        return { passed: true, reason: 'ETag header present and properly formatted' };
    }

    validateCompression(contentEncoding, contentType, path) {
        const compressibleTypes = [
            'text/html',
            'text/css',
            'application/javascript',
            'text/javascript',
            'application/json',
            'text/xml',
            'application/xml',
            'image/svg+xml',
            'text/plain'
        ];
        
        if (contentType && compressibleTypes.some(type => contentType.includes(type))) {
            if (!contentEncoding || (!contentEncoding.includes('gzip') && !contentEncoding.includes('br') && !contentEncoding.includes('deflate'))) {
                this.log(`Compressible content ${path} is not compressed`, 'warning');
                return { passed: false, reason: 'Compressible content not compressed' };
            }
            
            // Prefer Brotli for better compression
            if (contentEncoding.includes('gzip') && !contentEncoding.includes('br')) {
                this.log(`${path} uses gzip, consider Brotli for better compression`, 'info');
            }
        }
        
        return { passed: true, reason: 'Compression appropriate' };
    }

    validateContentType(contentType, path) {
        if (!contentType) {
            this.log(`Missing Content-Type header for ${path}`, 'warning');
            return { passed: false, reason: 'Missing Content-Type header' };
        }
        
        const fileExtension = path.split('.').pop();
        const expectedTypes = {
            'html': 'text/html',
            'css': 'text/css',
            'js': 'application/javascript',
            'json': 'application/json',
            'xml': 'application/xml',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
            'webp': 'image/webp',
            'avif': 'image/avif',
            'ico': 'image/x-icon',
            'woff': 'font/woff',
            'woff2': 'font/woff2'
        };
        
        if (expectedTypes[fileExtension] && !contentType.includes(expectedTypes[fileExtension])) {
            this.log(`Incorrect Content-Type for ${path}: expected ${expectedTypes[fileExtension]}, got ${contentType}`, 'warning');
            return { passed: false, reason: 'Incorrect Content-Type' };
        }
        
        // Check for charset on text content
        if (contentType.includes('text/') && !contentType.includes('charset')) {
            this.log(`Text content ${path} should specify charset`, 'warning');
            return { passed: false, reason: 'Missing charset in Content-Type' };
        }
        
        return { passed: true, reason: 'Content-Type appropriate' };
    }

    validateSecurityHeaders(headers, path) {
        const issues = [];
        
        // Check for security headers on HTML pages
        if (!path.includes('.') || path.endsWith('.html')) {
            if (!headers['x-content-type-options']) {
                issues.push('Missing X-Content-Type-Options header');
            }
            
            if (!headers['x-frame-options'] && !headers['content-security-policy']) {
                issues.push('Missing X-Frame-Options or CSP frame-ancestors');
            }
            
            if (!headers['referrer-policy']) {
                issues.push('Missing Referrer-Policy header');
            }
        }
        
        if (issues.length > 0) {
            issues.forEach(issue => this.log(`${path}: ${issue}`, 'warning'));
            return { passed: false, reason: issues.join(', ') };
        }
        
        return { passed: true, reason: 'Security headers appropriate' };
    }

    validatePerformanceHeaders(headers, path) {
        const issues = [];
        
        // Check for performance-related headers
        if (!headers['vary'] && (headers['content-encoding'] || headers['accept-encoding'])) {
            issues.push('Missing Vary header for compressed content');
        }
        
        // Check for preload hints on critical resources
        if (path.endsWith('.css') && !headers['link']) {
            this.log(`CSS file ${path} could benefit from preload hints`, 'info');
        }
        
        if (issues.length > 0) {
            issues.forEach(issue => this.log(`${path}: ${issue}`, 'warning'));
            return { passed: false, reason: issues.join(', ') };
        }
        
        return { passed: true, reason: 'Performance headers appropriate' };
    }

    async validate() {
        this.log('Starting cache headers validation...');
        
        for (const path of TEST_PATHS) {
            this.log(`Testing ${path}...`);
            const result = await this.testCacheHeaders(path);
            this.results.push(result);
            
            // Add small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Generate detailed analysis
        this.generateAnalysis();
        
        // Summary
        this.log('\n=== CACHE HEADERS VALIDATION SUMMARY ===');
        this.log(`Paths tested: ${TEST_PATHS.length}`);
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
            this.log('✅ All cache headers validations passed!');
        } else if (this.errors.length === 0) {
            this.log('⚠️  Cache headers validation passed with warnings');
        } else {
            this.log('❌ Cache headers validation failed!');
        }
        
        return this.errors.length === 0;
    }

    generateAnalysis() {
        const analysis = {
            timestamp: new Date().toISOString(),
            summary: {
                totalPaths: TEST_PATHS.length,
                errors: this.errors.length,
                warnings: this.warnings.length
            },
            results: this.results,
            recommendations: this.generateRecommendations()
        };
        
        fs.writeFileSync('cache-headers-analysis.json', JSON.stringify(analysis, null, 2));
        this.log('Detailed analysis saved to cache-headers-analysis.json');
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Analyze results for patterns
        const staticAssets = this.results.filter(r => r.path.match(/\.(css|js|png|jpg|jpeg|gif|webp|avif|svg|woff|woff2|ico)$/));
        const htmlPages = this.results.filter(r => !r.path.includes('.') || r.path.endsWith('.html'));
        
        // Static asset recommendations
        const shortCachedAssets = staticAssets.filter(r => 
            r.headers?.cacheControl && 
            (!r.headers.cacheControl.includes('max-age') || 
             parseInt(r.headers.cacheControl.match(/max-age=(\d+)/)?.[1] || 0) < 86400)
        );
        
        if (shortCachedAssets.length > 0) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                title: 'Increase cache duration for static assets',
                description: 'Static assets should have long cache times (1 year) with proper versioning',
                affectedPaths: shortCachedAssets.map(r => r.path)
            });
        }
        
        // Compression recommendations
        const uncompressedAssets = this.results.filter(r => 
            r.headers?.contentType?.includes('text/') && 
            !r.headers?.contentEncoding
        );
        
        if (uncompressedAssets.length > 0) {
            recommendations.push({
                type: 'performance',
                priority: 'medium',
                title: 'Enable compression for text-based assets',
                description: 'Enable gzip or Brotli compression for better performance',
                affectedPaths: uncompressedAssets.map(r => r.path)
            });
        }
        
        return recommendations;
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new CacheHeadersValidator();
    validator.validate().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = CacheHeadersValidator;