/**
 * SEO and Performance Testing for Cross-Page Integration
 * Validates internal link structure, page loading performance, and structured data markup
 */

const fs = require('fs');
const path = require('path');

class SEOPerformanceValidator {
    constructor() {
        this.results = {
            internalLinkStructure: [],
            performanceMetrics: [],
            structuredDataValidation: [],
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            seoRecommendations: [],
            performanceIssues: []
        };

        this.documentationPages = [
            'docs/addon-api/index.html',
            'docs/addon-development/index.html',
            'docs/installation/index.html',
            'docs/package-structure/index.html',
            'docs/quick-start/index.html',
            'docs/smart-floater-example/index.html'
        ];
    }

    async runAllTests() {
        console.log('🔍 Starting SEO and Performance Testing...\n');
        
        try {
            await this.validateInternalLinkStructure();
            await this.testPageLoadingPerformance();
            await this.verifyStructuredDataMarkup();
            await this.generateReport();
        } catch (error) {
            console.error('❌ SEO and performance test execution failed:', error.message);
            process.exit(1);
        }
    }

    async validateInternalLinkStructure() {
        console.log('🔗 Validating Internal Link Structure for SEO...');

        // Test homepage internal link structure
        await this.analyzeHomepageInternalLinks();
        
        // Test documentation internal links
        await this.analyzeDocumentationInternalLinks();
        
        // Test cross-page link relationships
        await this.analyzeCrossPageLinkRelationships();

        console.log('✅ Internal link structure validation completed\n');
    }

    async analyzeHomepageInternalLinks() {
        console.log('  Analyzing Homepage Internal Links...');

        if (!fs.existsSync('index.html')) {
            this.logFailure('Homepage file not found');
            return;
        }

        const homepageContent = fs.readFileSync('index.html', 'utf8');
        
        // Extract all internal links
        const internalLinkPattern = /href=["']([^"']*(?:docs\/[^"']*|#[^"']*))["']/gi;
        const internalLinks = [];
        let match;
        
        while ((match = internalLinkPattern.exec(homepageContent)) !== null) {
            internalLinks.push(match[1]);
        }

        this.results.totalTests++;
        
        if (internalLinks.length >= 10) {
            this.results.passedTests++;
            this.logSuccess(`✓ Good internal link density: ${internalLinks.length} internal links found`);
            
            this.results.internalLinkStructure.push({
                page: 'homepage',
                internalLinkCount: internalLinks.length,
                status: 'good-density',
                links: internalLinks
            });
        } else {
            this.results.failedTests++;
            this.logFailure(`✗ Low internal link density: only ${internalLinks.length} internal links found`);
            
            this.results.internalLinkStructure.push({
                page: 'homepage',
                internalLinkCount: internalLinks.length,
                status: 'low-density',
                links: internalLinks
            });
            
            this.results.seoRecommendations.push({
                type: 'internal-linking',
                page: 'homepage',
                issue: 'Low internal link density',
                recommendation: 'Add more contextual links to documentation pages'
            });
        }

        // Check for anchor text diversity
        const anchorTextPattern = /<a[^>]*href=["'][^"']*docs\/[^"']*["'][^>]*>([^<]+)<\/a>/gi;
        const anchorTexts = [];
        
        while ((match = anchorTextPattern.exec(homepageContent)) !== null) {
            anchorTexts.push(match[1].trim());
        }

        this.results.totalTests++;
        const uniqueAnchorTexts = [...new Set(anchorTexts)];
        
        if (uniqueAnchorTexts.length >= anchorTexts.length * 0.8) {
            this.results.passedTests++;
            this.logSuccess(`✓ Good anchor text diversity: ${uniqueAnchorTexts.length}/${anchorTexts.length} unique`);
        } else {
            this.results.failedTests++;
            this.logFailure(`✗ Poor anchor text diversity: ${uniqueAnchorTexts.length}/${anchorTexts.length} unique`);
            
            this.results.seoRecommendations.push({
                type: 'anchor-text',
                page: 'homepage',
                issue: 'Poor anchor text diversity',
                recommendation: 'Use more varied and descriptive anchor text for internal links'
            });
        }
    }

    async analyzeDocumentationInternalLinks() {
        console.log('  Analyzing Documentation Internal Links...');

        for (const docPage of this.documentationPages) {
            if (!fs.existsSync(docPage)) continue;

            const content = fs.readFileSync(docPage, 'utf8');
            
            // Count internal links within documentation
            const docInternalLinkPattern = /href=["']([^"']*(?:\.\.\/[^"']*|docs\/[^"']*|#[^"']*))["']/gi;
            const internalLinks = [];
            let match;
            
            while ((match = docInternalLinkPattern.exec(content)) !== null) {
                internalLinks.push(match[1]);
            }

            this.results.totalTests++;
            
            if (internalLinks.length >= 3) {
                this.results.passedTests++;
                this.logSuccess(`✓ ${docPage}: ${internalLinks.length} internal links found`);
                
                this.results.internalLinkStructure.push({
                    page: docPage,
                    internalLinkCount: internalLinks.length,
                    status: 'adequate',
                    links: internalLinks
                });
            } else {
                this.results.failedTests++;
                this.logFailure(`✗ ${docPage}: only ${internalLinks.length} internal links found`);
                
                this.results.internalLinkStructure.push({
                    page: docPage,
                    internalLinkCount: internalLinks.length,
                    status: 'insufficient',
                    links: internalLinks
                });
                
                this.results.seoRecommendations.push({
                    type: 'internal-linking',
                    page: docPage,
                    issue: 'Insufficient internal links',
                    recommendation: 'Add more contextual links to related documentation and homepage sections'
                });
            }
        }
    }

    async analyzeCrossPageLinkRelationships() {
        console.log('  Analyzing Cross-Page Link Relationships...');

        // Check if homepage links to all documentation pages
        const homepageContent = fs.readFileSync('index.html', 'utf8');
        let homepageLinksToAllDocs = true;
        
        for (const docPage of this.documentationPages) {
            const docPath = docPage.replace('/index.html', '/');
            const linkPattern = new RegExp(`href=["'][^"']*${docPath.replace('/', '\\/')}[^"']*["']`, 'i');
            
            if (!linkPattern.test(homepageContent)) {
                homepageLinksToAllDocs = false;
                this.results.seoRecommendations.push({
                    type: 'cross-page-linking',
                    page: 'homepage',
                    issue: `Missing link to ${docPage}`,
                    recommendation: `Add contextual link to ${docPage} from relevant homepage section`
                });
            }
        }

        this.results.totalTests++;
        
        if (homepageLinksToAllDocs) {
            this.results.passedTests++;
            this.logSuccess('✓ Homepage links to all documentation pages');
        } else {
            this.results.failedTests++;
            this.logFailure('✗ Homepage missing links to some documentation pages');
        }

        // Check if all documentation pages link back to homepage
        let allDocsLinkToHomepage = true;
        
        for (const docPage of this.documentationPages) {
            if (!fs.existsSync(docPage)) continue;
            
            const content = fs.readFileSync(docPage, 'utf8');
            const homepageLinkPattern = /href=["']([^"']*(?:\.\.\/|index\.html|^\/))[^"']*["']/i;
            
            if (!homepageLinkPattern.test(content)) {
                allDocsLinkToHomepage = false;
                this.results.seoRecommendations.push({
                    type: 'cross-page-linking',
                    page: docPage,
                    issue: 'Missing homepage link',
                    recommendation: 'Add clear navigation link back to homepage'
                });
            }
        }

        this.results.totalTests++;
        
        if (allDocsLinkToHomepage) {
            this.results.passedTests++;
            this.logSuccess('✓ All documentation pages link back to homepage');
        } else {
            this.results.failedTests++;
            this.logFailure('✗ Some documentation pages missing homepage links');
        }
    }

    async testPageLoadingPerformance() {
        console.log('🚀 Testing Page Loading Performance...');

        // Test critical resource loading
        await this.testCriticalResourceLoading();
        
        // Test image optimization
        await this.testImageOptimization();
        
        // Test CSS and JS optimization
        await this.testAssetOptimization();

        console.log('✅ Page loading performance testing completed\n');
    }

    async testCriticalResourceLoading() {
        console.log('  Testing Critical Resource Loading...');

        const homepageContent = fs.readFileSync('index.html', 'utf8');
        
        // Check for preload directives
        const preloadPattern = /<link[^>]*rel=["']preload["'][^>]*>/gi;
        const preloadLinks = homepageContent.match(preloadPattern) || [];

        this.results.totalTests++;
        
        if (preloadLinks.length >= 3) {
            this.results.passedTests++;
            this.logSuccess(`✓ Good resource preloading: ${preloadLinks.length} preload directives found`);
            
            this.results.performanceMetrics.push({
                metric: 'resource-preloading',
                value: preloadLinks.length,
                status: 'good',
                details: preloadLinks
            });
        } else {
            this.results.failedTests++;
            this.logFailure(`✗ Insufficient resource preloading: only ${preloadLinks.length} preload directives`);
            
            this.results.performanceMetrics.push({
                metric: 'resource-preloading',
                value: preloadLinks.length,
                status: 'needs-improvement',
                details: preloadLinks
            });
            
            this.results.performanceIssues.push({
                type: 'resource-loading',
                issue: 'Insufficient resource preloading',
                recommendation: 'Add preload directives for critical CSS, fonts, and JavaScript files'
            });
        }

        // Check for critical CSS inlining
        const inlineCSSPattern = /<style[^>]*>[\s\S]*?<\/style>/gi;
        const inlineCSS = homepageContent.match(inlineCSSPattern) || [];

        this.results.totalTests++;
        
        if (inlineCSS.length >= 1) {
            this.results.passedTests++;
            this.logSuccess(`✓ Critical CSS inlined: ${inlineCSS.length} inline style blocks found`);
            
            this.results.performanceMetrics.push({
                metric: 'critical-css-inlining',
                value: inlineCSS.length,
                status: 'implemented'
            });
        } else {
            this.results.failedTests++;
            this.logFailure('✗ No critical CSS inlining detected');
            
            this.results.performanceMetrics.push({
                metric: 'critical-css-inlining',
                value: 0,
                status: 'missing'
            });
            
            this.results.performanceIssues.push({
                type: 'critical-css',
                issue: 'No critical CSS inlining',
                recommendation: 'Inline critical above-the-fold CSS to improve initial render time'
            });
        }
    }

    async testImageOptimization() {
        console.log('  Testing Image Optimization...');

        const homepageContent = fs.readFileSync('index.html', 'utf8');
        
        // Check for lazy loading
        const lazyLoadPattern = /loading=["']lazy["']/gi;
        const lazyImages = homepageContent.match(lazyLoadPattern) || [];

        this.results.totalTests++;
        
        if (lazyImages.length >= 1) {
            this.results.passedTests++;
            this.logSuccess(`✓ Image lazy loading implemented: ${lazyImages.length} lazy-loaded images`);
            
            this.results.performanceMetrics.push({
                metric: 'image-lazy-loading',
                value: lazyImages.length,
                status: 'implemented'
            });
        } else {
            this.results.failedTests++;
            this.logFailure('✗ No image lazy loading detected');
            
            this.results.performanceMetrics.push({
                metric: 'image-lazy-loading',
                value: 0,
                status: 'missing'
            });
            
            this.results.performanceIssues.push({
                type: 'image-optimization',
                issue: 'No image lazy loading',
                recommendation: 'Implement lazy loading for images to improve initial page load time'
            });
        }

        // Check for responsive images
        const responsiveImagePattern = /<picture[^>]*>[\s\S]*?<\/picture>|<img[^>]*srcset=/gi;
        const responsiveImages = homepageContent.match(responsiveImagePattern) || [];

        this.results.totalTests++;
        
        if (responsiveImages.length >= 1) {
            this.results.passedTests++;
            this.logSuccess(`✓ Responsive images implemented: ${responsiveImages.length} responsive image elements`);
            
            this.results.performanceMetrics.push({
                metric: 'responsive-images',
                value: responsiveImages.length,
                status: 'implemented'
            });
        } else {
            this.results.failedTests++;
            this.logFailure('✗ No responsive images detected');
            
            this.results.performanceMetrics.push({
                metric: 'responsive-images',
                value: 0,
                status: 'missing'
            });
            
            this.results.performanceIssues.push({
                type: 'image-optimization',
                issue: 'No responsive images',
                recommendation: 'Implement responsive images using srcset or picture elements'
            });
        }
    }

    async testAssetOptimization() {
        console.log('  Testing CSS and JavaScript Optimization...');

        const homepageContent = fs.readFileSync('index.html', 'utf8');
        
        // Check for async/defer JavaScript loading
        const asyncJSPattern = /<script[^>]*(?:async|defer)[^>]*>/gi;
        const asyncJS = homepageContent.match(asyncJSPattern) || [];

        this.results.totalTests++;
        
        if (asyncJS.length >= 2) {
            this.results.passedTests++;
            this.logSuccess(`✓ Async JavaScript loading: ${asyncJS.length} async/defer scripts found`);
            
            this.results.performanceMetrics.push({
                metric: 'async-javascript',
                value: asyncJS.length,
                status: 'optimized'
            });
        } else {
            this.results.failedTests++;
            this.logFailure(`✗ Limited async JavaScript loading: only ${asyncJS.length} async/defer scripts`);
            
            this.results.performanceMetrics.push({
                metric: 'async-javascript',
                value: asyncJS.length,
                status: 'needs-optimization'
            });
            
            this.results.performanceIssues.push({
                type: 'javascript-optimization',
                issue: 'Limited async JavaScript loading',
                recommendation: 'Add async or defer attributes to non-critical JavaScript files'
            });
        }

        // Check for CSS optimization
        const cssLinkPattern = /<link[^>]*rel=["']stylesheet["'][^>]*>/gi;
        const cssLinks = homepageContent.match(cssLinkPattern) || [];

        this.results.totalTests++;
        
        if (cssLinks.length <= 5) {
            this.results.passedTests++;
            this.logSuccess(`✓ CSS file count optimized: ${cssLinks.length} CSS files`);
            
            this.results.performanceMetrics.push({
                metric: 'css-file-count',
                value: cssLinks.length,
                status: 'optimized'
            });
        } else {
            this.results.failedTests++;
            this.logFailure(`✗ Too many CSS files: ${cssLinks.length} CSS files found`);
            
            this.results.performanceMetrics.push({
                metric: 'css-file-count',
                value: cssLinks.length,
                status: 'needs-optimization'
            });
            
            this.results.performanceIssues.push({
                type: 'css-optimization',
                issue: 'Too many CSS files',
                recommendation: 'Consider concatenating CSS files to reduce HTTP requests'
            });
        }
    }

    async verifyStructuredDataMarkup() {
        console.log('📊 Verifying Structured Data Markup...');

        // Test JSON-LD structured data
        await this.testJSONLDStructuredData();
        
        // Test Open Graph markup
        await this.testOpenGraphMarkup();
        
        // Test schema.org markup
        await this.testSchemaOrgMarkup();

        console.log('✅ Structured data markup verification completed\n');
    }

    async testJSONLDStructuredData() {
        console.log('  Testing JSON-LD Structured Data...');

        const homepageContent = fs.readFileSync('index.html', 'utf8');
        
        // Extract JSON-LD scripts
        const jsonLDPattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
        const jsonLDScripts = [];
        let match;
        
        while ((match = jsonLDPattern.exec(homepageContent)) !== null) {
            try {
                const jsonData = JSON.parse(match[1]);
                jsonLDScripts.push(jsonData);
            } catch (error) {
                // Invalid JSON-LD
            }
        }

        this.results.totalTests++;
        
        if (jsonLDScripts.length >= 2) {
            this.results.passedTests++;
            this.logSuccess(`✓ Rich JSON-LD structured data: ${jsonLDScripts.length} valid JSON-LD scripts found`);
            
            this.results.structuredDataValidation.push({
                type: 'json-ld',
                count: jsonLDScripts.length,
                status: 'comprehensive',
                schemas: jsonLDScripts.map(script => script['@type']).filter(Boolean)
            });
        } else {
            this.results.failedTests++;
            this.logFailure(`✗ Limited JSON-LD structured data: only ${jsonLDScripts.length} valid scripts`);
            
            this.results.structuredDataValidation.push({
                type: 'json-ld',
                count: jsonLDScripts.length,
                status: 'limited',
                schemas: jsonLDScripts.map(script => script['@type']).filter(Boolean)
            });
            
            this.results.seoRecommendations.push({
                type: 'structured-data',
                issue: 'Limited JSON-LD structured data',
                recommendation: 'Add more comprehensive JSON-LD markup for better search engine understanding'
            });
        }

        // Check for specific schema types
        const schemaTypes = jsonLDScripts.map(script => script['@type']).filter(Boolean);
        const expectedSchemas = ['SoftwareApplication', 'FAQPage', 'WebSite'];
        
        this.results.totalTests++;
        const foundExpectedSchemas = expectedSchemas.filter(schema => 
            schemaTypes.some(type => type === schema || (Array.isArray(type) && type.includes(schema)))
        );
        
        if (foundExpectedSchemas.length >= 2) {
            this.results.passedTests++;
            this.logSuccess(`✓ Essential schema types found: ${foundExpectedSchemas.join(', ')}`);
        } else {
            this.results.failedTests++;
            this.logFailure(`✗ Missing essential schema types. Found: ${foundExpectedSchemas.join(', ')}`);
            
            this.results.seoRecommendations.push({
                type: 'structured-data',
                issue: 'Missing essential schema types',
                recommendation: 'Add SoftwareApplication, FAQPage, and WebSite schema markup'
            });
        }
    }

    async testOpenGraphMarkup() {
        console.log('  Testing Open Graph Markup...');

        const homepageContent = fs.readFileSync('index.html', 'utf8');
        
        // Check for essential Open Graph tags
        const essentialOGTags = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];
        const foundOGTags = [];
        
        for (const tag of essentialOGTags) {
            const pattern = new RegExp(`<meta[^>]*property=["']${tag}["'][^>]*>`, 'i');
            if (pattern.test(homepageContent)) {
                foundOGTags.push(tag);
            }
        }

        this.results.totalTests++;
        
        if (foundOGTags.length >= 4) {
            this.results.passedTests++;
            this.logSuccess(`✓ Comprehensive Open Graph markup: ${foundOGTags.length}/${essentialOGTags.length} essential tags found`);
            
            this.results.structuredDataValidation.push({
                type: 'open-graph',
                foundTags: foundOGTags,
                status: 'comprehensive'
            });
        } else {
            this.results.failedTests++;
            this.logFailure(`✗ Incomplete Open Graph markup: only ${foundOGTags.length}/${essentialOGTags.length} essential tags found`);
            
            this.results.structuredDataValidation.push({
                type: 'open-graph',
                foundTags: foundOGTags,
                status: 'incomplete'
            });
            
            const missingTags = essentialOGTags.filter(tag => !foundOGTags.includes(tag));
            this.results.seoRecommendations.push({
                type: 'open-graph',
                issue: 'Incomplete Open Graph markup',
                recommendation: `Add missing Open Graph tags: ${missingTags.join(', ')}`
            });
        }
    }

    async testSchemaOrgMarkup() {
        console.log('  Testing Schema.org Markup...');

        // Check documentation pages for schema markup
        let pagesWithSchema = 0;
        
        for (const docPage of this.documentationPages) {
            if (!fs.existsSync(docPage)) continue;
            
            const content = fs.readFileSync(docPage, 'utf8');
            
            // Look for schema.org markup patterns
            const schemaPatterns = [
                /itemscope/i,
                /itemtype=["']https?:\/\/schema\.org\//i,
                /itemprop=/i
            ];
            
            const hasSchema = schemaPatterns.some(pattern => pattern.test(content));
            
            if (hasSchema) {
                pagesWithSchema++;
            }
        }

        this.results.totalTests++;
        
        if (pagesWithSchema >= this.documentationPages.length * 0.5) {
            this.results.passedTests++;
            this.logSuccess(`✓ Good schema.org coverage: ${pagesWithSchema}/${this.documentationPages.length} pages have schema markup`);
            
            this.results.structuredDataValidation.push({
                type: 'schema-org',
                pagesWithSchema,
                totalPages: this.documentationPages.length,
                status: 'good-coverage'
            });
        } else {
            this.results.failedTests++;
            this.logFailure(`✗ Poor schema.org coverage: only ${pagesWithSchema}/${this.documentationPages.length} pages have schema markup`);
            
            this.results.structuredDataValidation.push({
                type: 'schema-org',
                pagesWithSchema,
                totalPages: this.documentationPages.length,
                status: 'poor-coverage'
            });
            
            this.results.seoRecommendations.push({
                type: 'schema-org',
                issue: 'Poor schema.org coverage',
                recommendation: 'Add schema.org markup to documentation pages for better search engine understanding'
            });
        }
    }

    logSuccess(message) {
        console.log(`  ${message}`);
    }

    logFailure(message) {
        console.log(`  ${message}`);
    }

    async generateReport() {
        console.log('\n📊 SEO and Performance Testing Report');
        console.log('======================================');
        
        console.log(`\n📈 Test Summary:`);
        console.log(`  Total Tests: ${this.results.totalTests}`);
        console.log(`  Passed: ${this.results.passedTests}`);
        console.log(`  Failed: ${this.results.failedTests}`);
        console.log(`  Success Rate: ${((this.results.passedTests / this.results.totalTests) * 100).toFixed(1)}%`);

        // Internal Link Structure Analysis
        if (this.results.internalLinkStructure.length > 0) {
            console.log(`\n🔗 Internal Link Structure:`);
            const totalInternalLinks = this.results.internalLinkStructure.reduce((sum, page) => sum + page.internalLinkCount, 0);
            console.log(`  Total internal links across all pages: ${totalInternalLinks}`);
            
            const pagesWithGoodLinking = this.results.internalLinkStructure.filter(page => 
                page.status === 'good-density' || page.status === 'adequate'
            ).length;
            console.log(`  Pages with adequate internal linking: ${pagesWithGoodLinking}/${this.results.internalLinkStructure.length}`);
        }

        // Performance Metrics Analysis
        if (this.results.performanceMetrics.length > 0) {
            console.log(`\n🚀 Performance Metrics:`);
            this.results.performanceMetrics.forEach(metric => {
                const status = metric.status === 'good' || metric.status === 'optimized' || metric.status === 'implemented' ? '✅' : '⚠️';
                console.log(`  ${status} ${metric.metric}: ${metric.value} (${metric.status})`);
            });
        }

        // Structured Data Analysis
        if (this.results.structuredDataValidation.length > 0) {
            console.log(`\n📊 Structured Data Markup:`);
            this.results.structuredDataValidation.forEach(validation => {
                const status = validation.status === 'comprehensive' || validation.status === 'good-coverage' ? '✅' : '⚠️';
                console.log(`  ${status} ${validation.type}: ${validation.status}`);
                
                if (validation.schemas) {
                    console.log(`    Schema types: ${validation.schemas.join(', ')}`);
                }
                if (validation.foundTags) {
                    console.log(`    Found tags: ${validation.foundTags.join(', ')}`);
                }
                if (validation.pagesWithSchema !== undefined) {
                    console.log(`    Coverage: ${validation.pagesWithSchema}/${validation.totalPages} pages`);
                }
            });
        }

        // SEO Recommendations
        if (this.results.seoRecommendations.length > 0) {
            console.log(`\n💡 SEO Recommendations:`);
            const groupedRecommendations = this.results.seoRecommendations.reduce((acc, rec) => {
                acc[rec.type] = acc[rec.type] || [];
                acc[rec.type].push(rec);
                return acc;
            }, {});

            Object.entries(groupedRecommendations).forEach(([type, recs]) => {
                console.log(`\n  ${type.toUpperCase()}:`);
                recs.forEach((rec, index) => {
                    console.log(`    ${index + 1}. ${rec.issue}`);
                    console.log(`       → ${rec.recommendation}`);
                    if (rec.page) console.log(`       Page: ${rec.page}`);
                });
            });
        }

        // Performance Issues
        if (this.results.performanceIssues.length > 0) {
            console.log(`\n⚡ Performance Improvement Opportunities:`);
            const groupedIssues = this.results.performanceIssues.reduce((acc, issue) => {
                acc[issue.type] = acc[issue.type] || [];
                acc[issue.type].push(issue);
                return acc;
            }, {});

            Object.entries(groupedIssues).forEach(([type, issues]) => {
                console.log(`\n  ${type.toUpperCase()}:`);
                issues.forEach((issue, index) => {
                    console.log(`    ${index + 1}. ${issue.issue}`);
                    console.log(`       → ${issue.recommendation}`);
                });
            });
        }

        // Save detailed report
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: this.results.totalTests,
                passedTests: this.results.passedTests,
                failedTests: this.results.failedTests,
                successRate: ((this.results.passedTests / this.results.totalTests) * 100).toFixed(1)
            },
            results: this.results
        };

        fs.writeFileSync('seo-performance-test-report.json', JSON.stringify(reportData, null, 2));
        console.log('\n📄 Detailed report saved to: seo-performance-test-report.json');

        // Exit with appropriate code
        if (this.results.failedTests > 0) {
            console.log('\n⚠️ Some SEO and performance issues found. Review recommendations above.');
            process.exit(0); // Don't fail the build for SEO issues, just warn
        } else {
            console.log('\n✅ All SEO and performance tests passed!');
            process.exit(0);
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const validator = new SEOPerformanceValidator();
    validator.runAllTests().catch(error => {
        console.error('❌ SEO and performance test execution failed:', error);
        process.exit(1);
    });
}

module.exports = SEOPerformanceValidator;