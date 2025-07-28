/**
 * User Experience Testing for Cross-Page Integration
 * Tests user journey flows, content discovery effectiveness, and mobile usability
 */

const fs = require('fs');
const path = require('path');

class UserExperienceValidator {
    constructor() {
        this.results = {
            userJourneyFlows: [],
            contentDiscovery: [],
            mobileUsability: [],
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            recommendations: []
        };

        this.userJourneyScenarios = [
            {
                name: 'New User Discovery Journey',
                startPage: 'homepage',
                expectedPath: ['features', 'docs/installation/', 'docs/quick-start/'],
                description: 'User discovers GGUF Loader, learns about features, then follows installation and quick start'
            },
            {
                name: 'Developer Integration Journey',
                startPage: 'homepage',
                expectedPath: ['features', 'docs/addon-development/', 'docs/addon-api/'],
                description: 'Developer interested in building addons follows development documentation'
            },
            {
                name: 'Troubleshooting Journey',
                startPage: 'homepage',
                expectedPath: ['faq', 'docs/installation/', 'docs/package-structure/'],
                description: 'User with issues starts at FAQ and follows to detailed documentation'
            }
        ];
    }

    async runAllTests() {
        console.log('🎯 Starting User Experience Testing...\n');
        
        try {
            await this.testUserJourneyFlows();
            await this.testContentDiscoveryEffectiveness();
            await this.testMobileUsabilityForCrossPageNavigation();
            await this.generateReport();
        } catch (error) {
            console.error('❌ User experience test execution failed:', error.message);
            process.exit(1);
        }
    }

    async testUserJourneyFlows() {
        console.log('🚶 Testing User Journey Flows...');

        for (const scenario of this.userJourneyScenarios) {
            await this.validateUserJourneyScenario(scenario);
        }

        console.log('✅ User journey flow testing completed\n');
    }

    async validateUserJourneyScenario(scenario) {
        console.log(`  Testing: ${scenario.name}`);
        
        let currentPage = 'index.html';
        let journeySuccess = true;
        const journeySteps = [];

        for (let i = 0; i < scenario.expectedPath.length; i++) {
            const targetSection = scenario.expectedPath[i];
            this.results.totalTests++;

            // Check if current page has links to target
            const hasLink = await this.checkPageHasLinkTo(currentPage, targetSection);
            
            if (hasLink) {
                this.results.passedTests++;
                journeySteps.push({
                    from: currentPage,
                    to: targetSection,
                    status: 'success',
                    step: i + 1
                });
                this.logSuccess(`    ✓ Step ${i + 1}: Found path from ${currentPage} to ${targetSection}`);
                
                // Update current page for next step
                if (targetSection.startsWith('docs/')) {
                    currentPage = targetSection.endsWith('/') ? targetSection + 'index.html' : targetSection;
                }
            } else {
                this.results.failedTests++;
                journeySuccess = false;
                journeySteps.push({
                    from: currentPage,
                    to: targetSection,
                    status: 'failed',
                    step: i + 1
                });
                this.logFailure(`    ✗ Step ${i + 1}: No clear path from ${currentPage} to ${targetSection}`);
            }
        }

        // Test return journey capability
        if (currentPage !== 'index.html') {
            this.results.totalTests++;
            const hasReturnPath = await this.checkPageHasLinkTo(currentPage, 'homepage');
            
            if (hasReturnPath) {
                this.results.passedTests++;
                this.logSuccess(`    ✓ Return path: Found way back to homepage from ${currentPage}`);
            } else {
                this.results.failedTests++;
                journeySuccess = false;
                this.logFailure(`    ✗ Return path: No clear way back to homepage from ${currentPage}`);
            }
        }

        this.results.userJourneyFlows.push({
            scenario: scenario.name,
            description: scenario.description,
            success: journeySuccess,
            steps: journeySteps,
            completionRate: (journeySteps.filter(s => s.status === 'success').length / journeySteps.length) * 100
        });
    }

    async checkPageHasLinkTo(fromPage, target) {
        try {
            const content = fs.readFileSync(fromPage, 'utf8');
            
            // Check for different types of links based on target
            if (target === 'homepage') {
                // Look for homepage links
                const homepageLinkPatterns = [
                    /href=["'][.\/]*index\.html["']/i,
                    /href=["'][.\/]*["']/i,
                    /href=["']\.\.\/["']/i
                ];
                
                return homepageLinkPatterns.some(pattern => pattern.test(content));
            } else if (target.startsWith('docs/')) {
                // Look for documentation links
                const docLinkPattern = new RegExp(`href=["'][^"']*${target.replace('/', '\\/')}[^"']*["']`, 'i');
                return docLinkPattern.test(content);
            } else {
                // Look for section links (homepage sections)
                const sectionLinkPatterns = [
                    new RegExp(`href=["'][^"']*#${target}["']`, 'i'),
                    new RegExp(`id=["']${target}["']`, 'i'),
                    new RegExp(`data-section=["']${target}["']`, 'i')
                ];
                
                return sectionLinkPatterns.some(pattern => pattern.test(content));
            }
        } catch (error) {
            return false;
        }
    }

    async testContentDiscoveryEffectiveness() {
        console.log('🔍 Testing Content Discovery Effectiveness...');

        // Test related content suggestions
        await this.testRelatedContentSuggestions();
        
        // Test cross-page content previews
        await this.testContentPreviewSystem();
        
        // Test search integration
        await this.testSearchIntegration();

        console.log('✅ Content discovery effectiveness testing completed\n');
    }

    async testRelatedContentSuggestions() {
        console.log('  Testing Related Content Suggestions...');

        const pagesToTest = [
            'index.html',
            'docs/installation/index.html',
            'docs/quick-start/index.html',
            'docs/addon-development/index.html'
        ];

        for (const page of pagesToTest) {
            if (!fs.existsSync(page)) continue;

            this.results.totalTests++;
            const content = fs.readFileSync(page, 'utf8');
            
            // Look for related content patterns
            const relatedContentPatterns = [
                /related[^>]*content/i,
                /you.*might.*also.*like/i,
                /what.*next/i,
                /see.*also/i,
                /recommended/i,
                /suggested/i
            ];

            const hasRelatedContent = relatedContentPatterns.some(pattern => pattern.test(content));
            
            if (hasRelatedContent) {
                this.results.passedTests++;
                this.logSuccess(`    ✓ Related content suggestions found in ${page}`);
                
                this.results.contentDiscovery.push({
                    page,
                    feature: 'related-content',
                    status: 'found'
                });
            } else {
                this.results.failedTests++;
                this.logFailure(`    ✗ No related content suggestions in ${page}`);
                
                this.results.contentDiscovery.push({
                    page,
                    feature: 'related-content',
                    status: 'missing'
                });
                
                this.results.recommendations.push({
                    type: 'content-discovery',
                    page,
                    suggestion: 'Add related content suggestions to improve user discovery'
                });
            }
        }
    }

    async testContentPreviewSystem() {
        console.log('  Testing Content Preview System...');

        const homepageContent = fs.readFileSync('index.html', 'utf8');
        
        // Look for content preview patterns
        const previewPatterns = [
            /preview/i,
            /snippet/i,
            /excerpt/i,
            /read.*more/i,
            /learn.*more/i,
            /expand/i
        ];

        this.results.totalTests++;
        const hasContentPreviews = previewPatterns.some(pattern => pattern.test(homepageContent));
        
        if (hasContentPreviews) {
            this.results.passedTests++;
            this.logSuccess('    ✓ Content preview system detected on homepage');
            
            this.results.contentDiscovery.push({
                page: 'homepage',
                feature: 'content-previews',
                status: 'found'
            });
        } else {
            this.results.failedTests++;
            this.logFailure('    ✗ No content preview system detected on homepage');
            
            this.results.contentDiscovery.push({
                page: 'homepage',
                feature: 'content-previews',
                status: 'missing'
            });
            
            this.results.recommendations.push({
                type: 'content-discovery',
                page: 'homepage',
                suggestion: 'Implement content preview system to show documentation snippets'
            });
        }
    }

    async testSearchIntegration() {
        console.log('  Testing Search Integration...');

        const searchFiles = ['site-search.js', 'js/enhanced-search.css'];
        let searchSystemFound = false;

        for (const file of searchFiles) {
            if (fs.existsSync(file)) {
                searchSystemFound = true;
                break;
            }
        }

        this.results.totalTests++;
        
        if (searchSystemFound) {
            this.results.passedTests++;
            this.logSuccess('    ✓ Search system integration found');
            
            this.results.contentDiscovery.push({
                page: 'site-wide',
                feature: 'search-integration',
                status: 'found'
            });
        } else {
            this.results.failedTests++;
            this.logFailure('    ✗ No search system integration found');
            
            this.results.contentDiscovery.push({
                page: 'site-wide',
                feature: 'search-integration',
                status: 'missing'
            });
            
            this.results.recommendations.push({
                type: 'content-discovery',
                page: 'site-wide',
                suggestion: 'Implement unified search across homepage and documentation'
            });
        }
    }

    async testMobileUsabilityForCrossPageNavigation() {
        console.log('📱 Testing Mobile Usability for Cross-Page Navigation...');

        // Test mobile navigation files
        await this.testMobileNavigationFiles();
        
        // Test mobile-specific CSS
        await this.testMobileCSSOptimization();
        
        // Test touch-friendly elements
        await this.testTouchFriendlyElements();

        console.log('✅ Mobile usability testing completed\n');
    }

    async testMobileNavigationFiles() {
        console.log('  Testing Mobile Navigation Files...');

        const mobileFiles = [
            'css/mobile-navigation.css',
            'js/mobile-navigation-enhancer.js',
            'js/mobile-content-preview.js',
            'js/mobile-performance-optimizer.js'
        ];

        let mobileFilesFound = 0;
        
        for (const file of mobileFiles) {
            this.results.totalTests++;
            
            if (fs.existsSync(file)) {
                this.results.passedTests++;
                mobileFilesFound++;
                this.logSuccess(`    ✓ Mobile file found: ${file}`);
                
                this.results.mobileUsability.push({
                    file,
                    status: 'found',
                    type: 'mobile-file'
                });
            } else {
                this.results.failedTests++;
                this.logFailure(`    ✗ Mobile file missing: ${file}`);
                
                this.results.mobileUsability.push({
                    file,
                    status: 'missing',
                    type: 'mobile-file'
                });
                
                this.results.recommendations.push({
                    type: 'mobile-usability',
                    file,
                    suggestion: `Create ${file} for better mobile cross-page navigation`
                });
            }
        }

        // Overall mobile support assessment
        const mobileSupport = (mobileFilesFound / mobileFiles.length) * 100;
        console.log(`    Mobile support coverage: ${mobileSupport.toFixed(1)}%`);
    }

    async testMobileCSSOptimization() {
        console.log('  Testing Mobile CSS Optimization...');

        const cssFiles = ['styles.css', 'css/mobile-navigation.css'];
        
        for (const cssFile of cssFiles) {
            if (!fs.existsSync(cssFile)) continue;

            this.results.totalTests++;
            const content = fs.readFileSync(cssFile, 'utf8');
            
            // Look for mobile-responsive patterns
            const mobilePatterns = [
                /@media.*max-width.*768px/i,
                /@media.*max-width.*576px/i,
                /mobile/i,
                /touch/i,
                /responsive/i
            ];

            const hasMobileOptimization = mobilePatterns.some(pattern => pattern.test(content));
            
            if (hasMobileOptimization) {
                this.results.passedTests++;
                this.logSuccess(`    ✓ Mobile optimization found in ${cssFile}`);
                
                this.results.mobileUsability.push({
                    file: cssFile,
                    status: 'optimized',
                    type: 'mobile-css'
                });
            } else {
                this.results.failedTests++;
                this.logFailure(`    ✗ No mobile optimization in ${cssFile}`);
                
                this.results.mobileUsability.push({
                    file: cssFile,
                    status: 'not-optimized',
                    type: 'mobile-css'
                });
                
                this.results.recommendations.push({
                    type: 'mobile-usability',
                    file: cssFile,
                    suggestion: 'Add mobile-responsive CSS for better cross-page navigation'
                });
            }
        }
    }

    async testTouchFriendlyElements() {
        console.log('  Testing Touch-Friendly Elements...');

        const homepageContent = fs.readFileSync('index.html', 'utf8');
        
        // Look for touch-friendly patterns
        const touchPatterns = [
            /min-height:\s*44px/i,
            /min-width:\s*44px/i,
            /touch-action/i,
            /tap-highlight/i,
            /-webkit-tap-highlight-color/i
        ];

        this.results.totalTests++;
        const hasTouchOptimization = touchPatterns.some(pattern => pattern.test(homepageContent));
        
        if (hasTouchOptimization) {
            this.results.passedTests++;
            this.logSuccess('    ✓ Touch-friendly elements detected');
            
            this.results.mobileUsability.push({
                page: 'homepage',
                status: 'touch-optimized',
                type: 'touch-elements'
            });
        } else {
            this.results.failedTests++;
            this.logFailure('    ✗ No touch-friendly optimization detected');
            
            this.results.mobileUsability.push({
                page: 'homepage',
                status: 'not-touch-optimized',
                type: 'touch-elements'
            });
            
            this.results.recommendations.push({
                type: 'mobile-usability',
                page: 'homepage',
                suggestion: 'Implement touch-friendly elements (min 44px touch targets)'
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
        console.log('\n📊 User Experience Testing Report');
        console.log('==================================');
        
        console.log(`\n📈 Test Summary:`);
        console.log(`  Total Tests: ${this.results.totalTests}`);
        console.log(`  Passed: ${this.results.passedTests}`);
        console.log(`  Failed: ${this.results.failedTests}`);
        console.log(`  Success Rate: ${((this.results.passedTests / this.results.totalTests) * 100).toFixed(1)}%`);

        // User Journey Analysis
        if (this.results.userJourneyFlows.length > 0) {
            console.log(`\n🚶 User Journey Analysis:`);
            this.results.userJourneyFlows.forEach(journey => {
                console.log(`  ${journey.scenario}: ${journey.completionRate.toFixed(1)}% completion rate`);
                if (!journey.success) {
                    console.log(`    ⚠️ Issues found in journey flow`);
                }
            });
        }

        // Content Discovery Analysis
        if (this.results.contentDiscovery.length > 0) {
            const discoveryFeatures = this.results.contentDiscovery.reduce((acc, item) => {
                acc[item.feature] = acc[item.feature] || { found: 0, missing: 0 };
                acc[item.feature][item.status === 'found' ? 'found' : 'missing']++;
                return acc;
            }, {});

            console.log(`\n🔍 Content Discovery Features:`);
            Object.entries(discoveryFeatures).forEach(([feature, stats]) => {
                const total = stats.found + stats.missing;
                const percentage = ((stats.found / total) * 100).toFixed(1);
                console.log(`  ${feature}: ${stats.found}/${total} (${percentage}%) implemented`);
            });
        }

        // Mobile Usability Analysis
        if (this.results.mobileUsability.length > 0) {
            const mobileFeatures = this.results.mobileUsability.reduce((acc, item) => {
                acc[item.type] = acc[item.type] || { optimized: 0, missing: 0 };
                const status = item.status === 'found' || item.status === 'optimized' || item.status === 'touch-optimized' ? 'optimized' : 'missing';
                acc[item.type][status]++;
                return acc;
            }, {});

            console.log(`\n📱 Mobile Usability Features:`);
            Object.entries(mobileFeatures).forEach(([feature, stats]) => {
                const total = stats.optimized + stats.missing;
                const percentage = ((stats.optimized / total) * 100).toFixed(1);
                console.log(`  ${feature}: ${stats.optimized}/${total} (${percentage}%) optimized`);
            });
        }

        // Recommendations
        if (this.results.recommendations.length > 0) {
            console.log(`\n💡 Recommendations for Improvement:`);
            const groupedRecommendations = this.results.recommendations.reduce((acc, rec) => {
                acc[rec.type] = acc[rec.type] || [];
                acc[rec.type].push(rec);
                return acc;
            }, {});

            Object.entries(groupedRecommendations).forEach(([type, recs]) => {
                console.log(`\n  ${type.toUpperCase()}:`);
                recs.forEach((rec, index) => {
                    console.log(`    ${index + 1}. ${rec.suggestion}`);
                    if (rec.page) console.log(`       Page: ${rec.page}`);
                    if (rec.file) console.log(`       File: ${rec.file}`);
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

        fs.writeFileSync('user-experience-test-report.json', JSON.stringify(reportData, null, 2));
        console.log('\n📄 Detailed report saved to: user-experience-test-report.json');

        // Exit with appropriate code
        if (this.results.failedTests > 0) {
            console.log('\n⚠️ Some user experience issues found. Review recommendations above.');
            process.exit(0); // Don't fail the build for UX issues, just warn
        } else {
            console.log('\n✅ All user experience tests passed!');
            process.exit(0);
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const validator = new UserExperienceValidator();
    validator.runAllTests().catch(error => {
        console.error('❌ User experience test execution failed:', error);
        process.exit(1);
    });
}

module.exports = UserExperienceValidator;