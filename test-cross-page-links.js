/**
 * Cross-Page Link Validation Testing
 * Tests all homepage-to-documentation and documentation-to-homepage links
 * Validates breadcrumb navigation accuracy across all pages
 */

const fs = require('fs');
const path = require('path');

class CrossPageLinkValidator {
    constructor() {
        this.results = {
            homepageToDocLinks: [],
            docToHomepageLinks: [],
            breadcrumbValidation: [],
            brokenLinks: [],
            missingLinks: [],
            totalTests: 0,
            passedTests: 0,
            failedTests: 0
        };
        
        this.expectedHomepageToDocLinks = [
            // Features section links
            { section: 'features', target: 'docs/addon-api/', description: 'API Reference from Features' },
            { section: 'features', target: 'docs/addon-development/', description: 'Addon Development from Features' },
            { section: 'features', target: 'docs/smart-floater-example/', description: 'Smart Floater Example from Features' },
            
            // How-to section links
            { section: 'how-to', target: 'docs/installation/', description: 'Installation Guide from How-To' },
            { section: 'how-to', target: 'docs/quick-start/', description: 'Quick Start from How-To' },
            
            // FAQ section links
            { section: 'faq', target: 'docs/installation/', description: 'Installation Guide from FAQ' },
            { section: 'faq', target: 'docs/package-structure/', description: 'Package Structure from FAQ' },
            
            // Download section links
            { section: 'download', target: 'docs/installation/', description: 'Installation Guide from Download' },
            { section: 'download', target: 'docs/quick-start/', description: 'Quick Start from Download' }
        ];
        
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
        console.log('🔍 Starting Cross-Page Link Validation Tests...\n');
        
        try {
            await this.testHomepageToDocumentationLinks();
            await this.testDocumentationToHomepageLinks();
            await this.testBreadcrumbNavigation();
            await this.generateReport();
        } catch (error) {
            console.error('❌ Test execution failed:', error.message);
            process.exit(1);
        }
    }

    async testHomepageToDocumentationLinks() {
        console.log('📄 Testing Homepage-to-Documentation Links...');
        
        if (!fs.existsSync('index.html')) {
            this.logFailure('Homepage file (index.html) not found');
            return;
        }

        const homepageContent = fs.readFileSync('index.html', 'utf8');

        // Test links using regex patterns since we can't use DOM parsing
        await this.validateSectionLinksWithRegex(homepageContent, 'features', [
            'docs/addon-api/',
            'docs/addon-development/',
            'docs/smart-floater-example/'
        ]);

        await this.validateSectionLinksWithRegex(homepageContent, 'how-to', [
            'docs/installation/',
            'docs/quick-start/'
        ]);

        await this.validateSectionLinksWithRegex(homepageContent, 'faq', [
            'docs/installation/',
            'docs/package-structure/'
        ]);

        await this.validateSectionLinksWithRegex(homepageContent, 'download', [
            'docs/installation/',
            'docs/quick-start/'
        ]);

        console.log('✅ Homepage-to-Documentation link testing completed\n');
    }

    async validateSectionLinksWithRegex(content, sectionId, expectedLinks) {
        // Find section content using regex patterns
        const sectionPatterns = [
            new RegExp(`id=["']${sectionId}["'][^>]*>([\\s\\S]*?)(?=<(?:section|div)[^>]*id=|$)`, 'i'),
            new RegExp(`class=["'][^"']*${sectionId}[^"']*["'][^>]*>([\\s\\S]*?)(?=<(?:section|div)[^>]*class=|$)`, 'i'),
            new RegExp(`data-section=["']${sectionId}["'][^>]*>([\\s\\S]*?)(?=<(?:section|div)[^>]*data-section=|$)`, 'i')
        ];

        let sectionContent = null;
        for (const pattern of sectionPatterns) {
            const match = content.match(pattern);
            if (match) {
                sectionContent = match[1];
                break;
            }
        }

        if (!sectionContent) {
            this.logFailure(`Section "${sectionId}" not found on homepage`);
            return;
        }

        // Extract links from section content
        const linkPattern = /href=["']([^"']+)["']/gi;
        const foundLinks = [];
        let match;
        while ((match = linkPattern.exec(sectionContent)) !== null) {
            foundLinks.push(match[1]);
        }

        for (const expectedLink of expectedLinks) {
            this.results.totalTests++;
            
            const linkFound = foundLinks.some(href => 
                href && (href.includes(expectedLink) || href.endsWith(expectedLink))
            );

            if (linkFound) {
                this.logSuccess(`✓ Found link to ${expectedLink} in ${sectionId} section`);
                this.results.homepageToDocLinks.push({
                    section: sectionId,
                    target: expectedLink,
                    status: 'found'
                });
            } else {
                this.logFailure(`✗ Missing link to ${expectedLink} in ${sectionId} section`);
                this.results.missingLinks.push({
                    section: sectionId,
                    target: expectedLink,
                    type: 'homepage-to-doc'
                });
            }
        }

        // Check for broken links in this section
        for (const href of foundLinks) {
            if (href && href.startsWith('docs/')) {
                await this.validateLinkTarget(href, `${sectionId} section`);
            }
        }
    }

    async testDocumentationToHomepageLinks() {
        console.log('📚 Testing Documentation-to-Homepage Links...');

        for (const docPage of this.documentationPages) {
            if (!fs.existsSync(docPage)) {
                this.logFailure(`Documentation page ${docPage} not found`);
                continue;
            }

            const docContent = fs.readFileSync(docPage, 'utf8');
            await this.validateDocumentationPageLinksWithRegex(docContent, docPage);
        }

        console.log('✅ Documentation-to-Homepage link testing completed\n');
    }

    async validateDocumentationPageLinksWithRegex(content, pagePath) {
        // Extract all href attributes using regex
        const linkPattern = /href=["']([^"']+)["']/gi;
        const foundLinks = [];
        let match;
        while ((match = linkPattern.exec(content)) !== null) {
            foundLinks.push(match[1]);
        }

        let homepageLinkFound = false;
        let contextualLinksFound = 0;

        for (const href of foundLinks) {
            // Check for homepage links
            if (href === '/' || href === '../' || href === '../index.html' || href.includes('index.html')) {
                homepageLinkFound = true;
                this.logSuccess(`✓ Found homepage link in ${pagePath}`);
            }

            // Check for contextual homepage section links
            if (href && (href.includes('#') && !href.startsWith('#'))) {
                contextualLinksFound++;
                this.logSuccess(`✓ Found contextual homepage link in ${pagePath}: ${href}`);
            }
        }

        this.results.totalTests++;
        if (homepageLinkFound) {
            this.results.passedTests++;
            this.results.docToHomepageLinks.push({
                page: pagePath,
                homepageLink: 'found',
                contextualLinks: contextualLinksFound
            });
        } else {
            this.results.failedTests++;
            this.logFailure(`✗ No homepage link found in ${pagePath}`);
            this.results.missingLinks.push({
                page: pagePath,
                target: 'homepage',
                type: 'doc-to-homepage'
            });
        }
    }

    async testBreadcrumbNavigation() {
        console.log('🍞 Testing Breadcrumb Navigation...');

        // Test breadcrumbs on documentation pages
        for (const docPage of this.documentationPages) {
            if (!fs.existsSync(docPage)) continue;

            const docContent = fs.readFileSync(docPage, 'utf8');
            await this.validateBreadcrumbsWithRegex(docContent, docPage);
        }

        console.log('✅ Breadcrumb navigation testing completed\n');
    }

    async validateBreadcrumbsWithRegex(content, pagePath) {
        // Look for breadcrumb patterns in the HTML
        const breadcrumbPatterns = [
            /class=["'][^"']*breadcrumb[^"']*["']/i,
            /role=["']navigation["'][^>]*aria-label=["'][^"']*breadcrumb[^"']*["']/i,
            /<nav[^>]*aria-label=["'][^"']*breadcrumb[^"']*["']/i
        ];

        let breadcrumbFound = false;
        let breadcrumbContent = null;

        for (const pattern of breadcrumbPatterns) {
            const match = content.match(pattern);
            if (match) {
                breadcrumbFound = true;
                // Extract the breadcrumb section content
                const startIndex = content.indexOf(match[0]);
                const endIndex = content.indexOf('>', startIndex);
                const tagEnd = content.indexOf('</', endIndex);
                breadcrumbContent = content.substring(endIndex + 1, tagEnd);
                break;
            }
        }

        this.results.totalTests++;
        
        if (breadcrumbFound) {
            this.results.passedTests++;
            
            // Count links in breadcrumb
            const linkPattern = /href=["']([^"']+)["']/gi;
            const links = [];
            let match;
            while ((match = linkPattern.exec(breadcrumbContent || '')) !== null) {
                links.push(match[1]);
            }

            const hasHomepageLink = links.some(href => 
                href === '/' || href === '../' || href.includes('index.html')
            );

            this.results.breadcrumbValidation.push({
                page: pagePath,
                breadcrumbFound: true,
                hasHomepageLink,
                linkCount: links.length
            });

            this.logSuccess(`✓ Breadcrumb navigation found in ${pagePath} with ${links.length} links`);
            
            if (!hasHomepageLink) {
                this.logFailure(`✗ Breadcrumb in ${pagePath} missing homepage link`);
            }
        } else {
            this.results.failedTests++;
            this.results.breadcrumbValidation.push({
                page: pagePath,
                breadcrumbFound: false,
                hasHomepageLink: false,
                linkCount: 0
            });
            this.logFailure(`✗ No breadcrumb navigation found in ${pagePath}`);
        }
    }

    async validateLinkTarget(href, context) {
        // Convert relative paths to file system paths
        let targetPath = href;
        
        if (href.startsWith('docs/')) {
            // Check if it's a directory link (should have index.html)
            if (href.endsWith('/')) {
                targetPath = href + 'index.html';
            }
        }

        this.results.totalTests++;

        if (fs.existsSync(targetPath)) {
            this.results.passedTests++;
            this.logSuccess(`✓ Link target exists: ${href} (from ${context})`);
        } else {
            this.results.failedTests++;
            this.results.brokenLinks.push({
                href,
                context,
                targetPath
            });
            this.logFailure(`✗ Broken link: ${href} (from ${context}) - Target not found: ${targetPath}`);
        }
    }

    logSuccess(message) {
        console.log(`  ${message}`);
        this.results.passedTests++;
    }

    logFailure(message) {
        console.log(`  ${message}`);
        this.results.failedTests++;
    }

    async generateReport() {
        console.log('\n📊 Cross-Page Link Validation Report');
        console.log('=====================================');
        
        console.log(`\n📈 Test Summary:`);
        console.log(`  Total Tests: ${this.results.totalTests}`);
        console.log(`  Passed: ${this.results.passedTests}`);
        console.log(`  Failed: ${this.results.failedTests}`);
        console.log(`  Success Rate: ${((this.results.passedTests / this.results.totalTests) * 100).toFixed(1)}%`);

        if (this.results.homepageToDocLinks.length > 0) {
            console.log(`\n🏠➡️📚 Homepage-to-Documentation Links: ${this.results.homepageToDocLinks.length} found`);
        }

        if (this.results.docToHomepageLinks.length > 0) {
            console.log(`\n📚➡️🏠 Documentation-to-Homepage Links: ${this.results.docToHomepageLinks.length} found`);
        }

        if (this.results.breadcrumbValidation.length > 0) {
            const validBreadcrumbs = this.results.breadcrumbValidation.filter(b => b.breadcrumbFound).length;
            console.log(`\n🍞 Breadcrumb Navigation: ${validBreadcrumbs}/${this.results.breadcrumbValidation.length} pages have breadcrumbs`);
        }

        if (this.results.brokenLinks.length > 0) {
            console.log(`\n❌ Broken Links Found: ${this.results.brokenLinks.length}`);
            this.results.brokenLinks.forEach(link => {
                console.log(`  - ${link.href} (from ${link.context})`);
            });
        }

        if (this.results.missingLinks.length > 0) {
            console.log(`\n⚠️ Missing Links: ${this.results.missingLinks.length}`);
            this.results.missingLinks.forEach(link => {
                console.log(`  - ${link.target} missing from ${link.section || link.page}`);
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

        fs.writeFileSync('cross-page-link-validation-report.json', JSON.stringify(reportData, null, 2));
        console.log('\n📄 Detailed report saved to: cross-page-link-validation-report.json');

        // Exit with appropriate code
        if (this.results.failedTests > 0) {
            console.log('\n❌ Some tests failed. Please review the issues above.');
            process.exit(1);
        } else {
            console.log('\n✅ All cross-page link validation tests passed!');
            process.exit(0);
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const validator = new CrossPageLinkValidator();
    validator.runAllTests().catch(error => {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    });
}

module.exports = CrossPageLinkValidator;