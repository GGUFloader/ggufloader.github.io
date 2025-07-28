#!/usr/bin/env node

/**
 * Automated Cross-Page Integration Testing
 * Validates ongoing functionality of cross-page features
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CrossPageMaintenanceTests {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            details: []
        };
    }

    /**
     * Run all maintenance tests
     */
    async runAllTests() {
        console.log('🧪 Running Cross-Page Integration Maintenance Tests...\n');

        await this.testLinkIntegrity();
        await this.testContentPreviewSystem();
        await this.testNavigationComponents();
        await this.testMobileOptimization();
        await this.testSEOIntegration();
        await this.testPerformanceImpact();

        this.generateTestReport();
        return this.testResults;
    }

    /**
     * Test cross-page link integrity
     */
    async testLinkIntegrity() {
        console.log('🔗 Testing Link Integrity...');

        try {
            // Test homepage to documentation links
            const homepageContent = fs.readFileSync('index.html', 'utf8');
            const docLinks = this.extractDocumentationLinks(homepageContent);
            
            let validLinks = 0;
            let brokenLinks = [];

            for (const link of docLinks) {
                if (this.validateLink(link)) {
                    validLinks++;
                } else {
                    brokenLinks.push(link);
                }
            }

            if (brokenLinks.length === 0) {
                this.addTestResult(true, 'Link Integrity', `All ${validLinks} homepage-to-documentation links are valid`);
            } else {
                this.addTestResult(false, 'Link Integrity', `${brokenLinks.length} broken links found: ${brokenLinks.join(', ')}`);
            }

            // Test documentation to homepage links
            await this.testDocumentationLinks();

            // Test breadcrumb navigation links
            await this.testBreadcrumbLinks();

        } catch (error) {
            this.addTestResult(false, 'Link Integrity', `Test failed: ${error.message}`);
        }
    }

    /**
     * Test content preview system
     */
    async testContentPreviewSystem() {
        console.log('📄 Testing Content Preview System...');

        try {
            // Check if content preview system exists
            const previewSystemExists = fs.existsSync('js/content-preview-system.js');
            if (!previewSystemExists) {
                this.addTestResult(false, 'Content Previews', 'Content preview system file missing');
                return;
            }

            // Check if preview CSS exists
            const previewCSSExists = fs.existsSync('css/content-preview.css');
            if (!previewCSSExists) {
                this.addTestResult(false, 'Content Previews', 'Content preview CSS file missing');
                return;
            }

            // Test preview generation functionality
            const previewContent = fs.readFileSync('js/content-preview-system.js', 'utf8');
            const hasPreviewGeneration = previewContent.includes('generatePreview') || previewContent.includes('createPreview');
            
            if (hasPreviewGeneration) {
                this.addTestResult(true, 'Content Previews', 'Content preview system is properly implemented');
            } else {
                this.addTestResult(false, 'Content Previews', 'Content preview generation functionality missing');
            }

            // Test preview integration in homepage
            const homepageContent = fs.readFileSync('index.html', 'utf8');
            const hasPreviewIntegration = homepageContent.includes('content-preview') || homepageContent.includes('doc-preview');
            
            if (hasPreviewIntegration) {
                this.addTestResult(true, 'Content Previews', 'Homepage has content preview integration');
            } else {
                this.addTestResult(false, 'Content Previews', 'Homepage missing content preview integration');
            }

        } catch (error) {
            this.addTestResult(false, 'Content Previews', `Test failed: ${error.message}`);
        }
    }

    /**
     * Test navigation components
     */
    async testNavigationComponents() {
        console.log('🧭 Testing Navigation Components...');

        try {
            // Test main navigation
            const navExists = fs.existsSync('includes/navigation.html');
            if (navExists) {
                const navContent = fs.readFileSync('includes/navigation.html', 'utf8');
                const hasDocLinks = navContent.includes('docs/') || navContent.includes('documentation');
                
                if (hasDocLinks) {
                    this.addTestResult(true, 'Navigation', 'Main navigation includes documentation links');
                } else {
                    this.addTestResult(false, 'Navigation', 'Main navigation missing documentation links');
                }
            } else {
                this.addTestResult(false, 'Navigation', 'Main navigation file missing');
            }

            // Test breadcrumb navigation
            const breadcrumbExists = fs.existsSync('includes/breadcrumb-navigation.html');
            if (breadcrumbExists) {
                this.addTestResult(true, 'Navigation', 'Breadcrumb navigation component exists');
            } else {
                this.addTestResult(false, 'Navigation', 'Breadcrumb navigation component missing');
            }

            // Test mobile navigation
            const mobileNavExists = fs.existsSync('css/mobile-navigation.css');
            if (mobileNavExists) {
                this.addTestResult(true, 'Navigation', 'Mobile navigation styles exist');
            } else {
                this.addTestResult(false, 'Navigation', 'Mobile navigation styles missing');
            }

        } catch (error) {
            this.addTestResult(false, 'Navigation', `Test failed: ${error.message}`);
        }
    }

    /**
     * Test mobile optimization
     */
    async testMobileOptimization() {
        console.log('📱 Testing Mobile Optimization...');

        try {
            // Check mobile-specific JavaScript
            const mobileJSFiles = [
                'js/mobile-navigation-enhancer.js',
                'js/mobile-content-preview.js',
                'js/mobile-performance-optimizer.js'
            ];

            let mobileFilesExist = 0;
            for (const file of mobileJSFiles) {
                if (fs.existsSync(file)) {
                    mobileFilesExist++;
                }
            }

            if (mobileFilesExist === mobileJSFiles.length) {
                this.addTestResult(true, 'Mobile Optimization', 'All mobile optimization files exist');
            } else {
                this.addTestResult(false, 'Mobile Optimization', `${mobileJSFiles.length - mobileFilesExist} mobile optimization files missing`);
            }

            // Check mobile CSS
            const mobileCSSExists = fs.existsSync('css/mobile-navigation.css');
            if (mobileCSSExists) {
                this.addTestResult(true, 'Mobile Optimization', 'Mobile CSS exists');
            } else {
                this.addTestResult(false, 'Mobile Optimization', 'Mobile CSS missing');
            }

            // Test mobile test file
            const mobileTestExists = fs.existsSync('test-mobile-optimization.html');
            if (mobileTestExists) {
                this.addTestResult(true, 'Mobile Optimization', 'Mobile test file exists');
            } else {
                this.addTestResult(false, 'Mobile Optimization', 'Mobile test file missing');
            }

        } catch (error) {
            this.addTestResult(false, 'Mobile Optimization', `Test failed: ${error.message}`);
        }
    }

    /**
     * Test SEO integration
     */
    async testSEOIntegration() {
        console.log('🔍 Testing SEO Integration...');

        try {
            // Check SEO-related files
            const seoFiles = [
                'js/seo-internal-linking.js',
                'js/structured-data-enhancement.js',
                'sitemap.xml',
                'sitemap.html'
            ];

            let seoFilesExist = 0;
            for (const file of seoFiles) {
                if (fs.existsSync(file)) {
                    seoFilesExist++;
                }
            }

            if (seoFilesExist === seoFiles.length) {
                this.addTestResult(true, 'SEO Integration', 'All SEO files exist');
            } else {
                this.addTestResult(false, 'SEO Integration', `${seoFiles.length - seoFilesExist} SEO files missing`);
            }

            // Test structured data in homepage
            const homepageContent = fs.readFileSync('index.html', 'utf8');
            const hasStructuredData = homepageContent.includes('application/ld+json') || homepageContent.includes('schema.org');
            
            if (hasStructuredData) {
                this.addTestResult(true, 'SEO Integration', 'Homepage has structured data');
            } else {
                this.addTestResult(false, 'SEO Integration', 'Homepage missing structured data');
            }

            // Test internal linking
            const internalLinkReporterExists = fs.existsSync('js/internal-link-reporter.js');
            if (internalLinkReporterExists) {
                this.addTestResult(true, 'SEO Integration', 'Internal link reporter exists');
            } else {
                this.addTestResult(false, 'SEO Integration', 'Internal link reporter missing');
            }

        } catch (error) {
            this.addTestResult(false, 'SEO Integration', `Test failed: ${error.message}`);
        }
    }

    /**
     * Test performance impact
     */
    async testPerformanceImpact() {
        console.log('⚡ Testing Performance Impact...');

        try {
            // Check if performance monitoring exists
            const perfMonitorExists = fs.existsSync('performance-monitor.js');
            if (perfMonitorExists) {
                this.addTestResult(true, 'Performance', 'Performance monitor exists');
            } else {
                this.addTestResult(false, 'Performance', 'Performance monitor missing');
            }

            // Check critical CSS
            const criticalCSSExists = fs.existsSync('critical.css');
            if (criticalCSSExists) {
                this.addTestResult(true, 'Performance', 'Critical CSS exists');
            } else {
                this.addTestResult(false, 'Performance', 'Critical CSS missing');
            }

            // Check service worker
            const serviceWorkerExists = fs.existsSync('sw.js');
            if (serviceWorkerExists) {
                this.addTestResult(true, 'Performance', 'Service worker exists');
            } else {
                this.addTestResult(false, 'Performance', 'Service worker missing');
            }

            // Test if Lighthouse config exists
            const lighthouseConfigExists = fs.existsSync('lighthouserc.js');
            if (lighthouseConfigExists) {
                this.addTestResult(true, 'Performance', 'Lighthouse configuration exists');
            } else {
                this.addTestResult(false, 'Performance', 'Lighthouse configuration missing');
            }

        } catch (error) {
            this.addTestResult(false, 'Performance', `Test failed: ${error.message}`);
        }
    }

    /**
     * Test documentation links from documentation pages
     */
    async testDocumentationLinks() {
        const docFiles = this.getDocumentationFiles();
        let validDocLinks = 0;
        let brokenDocLinks = [];

        for (const docFile of docFiles) {
            try {
                const content = fs.readFileSync(docFile, 'utf8');
                const homeLinks = this.extractHomepageLinks(content);
                
                for (const link of homeLinks) {
                    if (this.validateLink(link)) {
                        validDocLinks++;
                    } else {
                        brokenDocLinks.push({ file: docFile, link });
                    }
                }
            } catch (error) {
                brokenDocLinks.push({ file: docFile, error: error.message });
            }
        }

        if (brokenDocLinks.length === 0) {
            this.addTestResult(true, 'Documentation Links', `All ${validDocLinks} documentation-to-homepage links are valid`);
        } else {
            this.addTestResult(false, 'Documentation Links', `${brokenDocLinks.length} broken documentation links found`);
        }
    }

    /**
     * Test breadcrumb links
     */
    async testBreadcrumbLinks() {
        try {
            if (fs.existsSync('includes/breadcrumb-navigation.html')) {
                const breadcrumbContent = fs.readFileSync('includes/breadcrumb-navigation.html', 'utf8');
                const hasValidStructure = breadcrumbContent.includes('breadcrumb') && breadcrumbContent.includes('href');
                
                if (hasValidStructure) {
                    this.addTestResult(true, 'Breadcrumb Links', 'Breadcrumb navigation has valid structure');
                } else {
                    this.addTestResult(false, 'Breadcrumb Links', 'Breadcrumb navigation structure invalid');
                }
            }
        } catch (error) {
            this.addTestResult(false, 'Breadcrumb Links', `Test failed: ${error.message}`);
        }
    }

    /**
     * Extract documentation links from content
     */
    extractDocumentationLinks(content) {
        const docLinkRegex = /href=["']([^"']*docs\/[^"']*)["']/g;
        const links = [];
        let match;
        
        while ((match = docLinkRegex.exec(content)) !== null) {
            links.push(match[1]);
        }
        
        return [...new Set(links)];
    }

    /**
     * Extract homepage links from content
     */
    extractHomepageLinks(content) {
        const homeLinkRegex = /href=["']([^"']*(?:\.\.\/|index\.html|#)[^"']*)["']/g;
        const links = [];
        let match;
        
        while ((match = homeLinkRegex.exec(content)) !== null) {
            links.push(match[1]);
        }
        
        return [...new Set(links)];
    }

    /**
     * Validate if a link exists
     */
    validateLink(link) {
        try {
            const cleanLink = link.split('#')[0];
            if (cleanLink === '' || cleanLink === '../' || cleanLink === './') return true;
            
            const filePath = cleanLink.startsWith('/') ? cleanLink.substring(1) : cleanLink;
            return fs.existsSync(filePath) || fs.existsSync(path.join('docs', filePath));
        } catch (error) {
            return false;
        }
    }

    /**
     * Get all documentation files
     */
    getDocumentationFiles() {
        const docFiles = [];
        
        // Check _docs directory
        if (fs.existsSync('_docs')) {
            const files = fs.readdirSync('_docs', { recursive: true });
            files.forEach(file => {
                if (file.endsWith('.md')) {
                    docFiles.push(path.join('_docs', file));
                }
            });
        }

        // Check docs directory
        if (fs.existsSync('docs')) {
            const files = fs.readdirSync('docs', { recursive: true });
            files.forEach(file => {
                if (file.endsWith('.html')) {
                    docFiles.push(path.join('docs', file));
                }
            });
        }
        
        return docFiles;
    }

    /**
     * Add test result
     */
    addTestResult(passed, category, message) {
        if (passed) {
            this.testResults.passed++;
            console.log(`  ✅ ${category}: ${message}`);
        } else {
            this.testResults.failed++;
            console.log(`  ❌ ${category}: ${message}`);
        }
        
        this.testResults.details.push({
            passed,
            category,
            message,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Generate test report
     */
    generateTestReport() {
        const total = this.testResults.passed + this.testResults.failed;
        const successRate = total > 0 ? ((this.testResults.passed / total) * 100).toFixed(1) : 0;
        
        console.log('\n📊 Test Results Summary:');
        console.log(`   Total Tests: ${total}`);
        console.log(`   Passed: ${this.testResults.passed}`);
        console.log(`   Failed: ${this.testResults.failed}`);
        console.log(`   Success Rate: ${successRate}%`);
        
        // Write detailed report
        const reportPath = 'maintenance-reports';
        if (!fs.existsSync(reportPath)) {
            fs.mkdirSync(reportPath, { recursive: true });
        }
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total,
                passed: this.testResults.passed,
                failed: this.testResults.failed,
                successRate: parseFloat(successRate)
            },
            details: this.testResults.details
        };
        
        fs.writeFileSync(
            path.join(reportPath, 'cross-page-maintenance-test-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        console.log(`\n📄 Detailed report saved to: ${reportPath}/cross-page-maintenance-test-report.json`);
        
        if (this.testResults.failed > 0) {
            console.log('\n⚠️  Some tests failed. Please review the issues above.');
            process.exit(1);
        } else {
            console.log('\n🎉 All tests passed! Cross-page integration is working correctly.');
        }
    }
}

// CLI interface
if (require.main === module) {
    const tester = new CrossPageMaintenanceTests();
    tester.runAllTests().catch(console.error);
}

module.exports = CrossPageMaintenanceTests;