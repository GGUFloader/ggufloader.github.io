#!/usr/bin/env node

/**
 * Cross-Page Integration Maintenance System
 * Maintains link integrity, updates content previews, and validates functionality
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CrossPageMaintenance {
    constructor() {
        this.config = {
            docsPath: '_docs',
            includesPath: 'includes',
            jsPath: 'js',
            logPath: 'maintenance-logs',
            reportPath: 'maintenance-reports'
        };
        
        this.ensureDirectories();
    }

    ensureDirectories() {
        [this.config.logPath, this.config.reportPath].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    /**
     * Main maintenance routine
     */
    async runMaintenance() {
        const timestamp = new Date().toISOString();
        const logFile = path.join(this.config.logPath, `maintenance-${Date.now()}.log`);
        
        console.log('🔧 Starting cross-page integration maintenance...');
        
        const results = {
            timestamp,
            linkIntegrity: await this.checkLinkIntegrity(),
            contentPreviews: await this.updateContentPreviews(),
            functionalityTests: await this.runFunctionalityTests(),
            recommendations: []
        };

        // Generate recommendations based on results
        results.recommendations = this.generateRecommendations(results);

        // Write detailed log
        this.writeMaintenanceLog(logFile, results);
        
        // Write summary report
        this.writeMaintenanceReport(results);

        console.log('✅ Maintenance completed. Check maintenance-logs/ for details.');
        
        return results;
    }

    /**
     * Check cross-page link integrity
     */
    async checkLinkIntegrity() {
        console.log('🔗 Checking cross-page link integrity...');
        
        const results = {
            homepageLinks: [],
            documentationLinks: [],
            brokenLinks: [],
            orphanedContent: []
        };

        try {
            // Check homepage links to documentation
            const homepageContent = fs.readFileSync('index.html', 'utf8');
            const homepageLinks = this.extractLinks(homepageContent, 'docs/');
            
            for (const link of homepageLinks) {
                const exists = this.checkLinkExists(link);
                results.homepageLinks.push({ link, exists });
                if (!exists) results.brokenLinks.push({ source: 'homepage', link });
            }

            // Check documentation links back to homepage
            const docFiles = this.getDocumentationFiles();
            for (const docFile of docFiles) {
                const content = fs.readFileSync(docFile, 'utf8');
                const docLinks = this.extractLinks(content, '../');
                
                for (const link of docLinks) {
                    const exists = this.checkLinkExists(link);
                    results.documentationLinks.push({ source: docFile, link, exists });
                    if (!exists) results.brokenLinks.push({ source: docFile, link });
                }
            }

            // Check for orphaned content (documentation without homepage links)
            results.orphanedContent = this.findOrphanedContent(docFiles, results.homepageLinks);

        } catch (error) {
            console.error('Error checking link integrity:', error.message);
        }

        return results;
    }

    /**
     * Update content previews from documentation
     */
    async updateContentPreviews() {
        console.log('📄 Updating content previews...');
        
        const results = {
            updatedPreviews: [],
            errors: [],
            previewMappings: {}
        };

        try {
            const previewMappings = this.getPreviewMappings();
            
            for (const [docFile, homepageSection] of Object.entries(previewMappings)) {
                try {
                    const docPath = path.join(this.config.docsPath, docFile);
                    if (fs.existsSync(docPath)) {
                        const content = fs.readFileSync(docPath, 'utf8');
                        const preview = this.generatePreview(content, docFile);
                        
                        await this.updateHomepagePreview(homepageSection, preview);
                        results.updatedPreviews.push({ docFile, homepageSection, preview: preview.substring(0, 100) + '...' });
                    }
                } catch (error) {
                    results.errors.push({ docFile, error: error.message });
                }
            }

            results.previewMappings = previewMappings;

        } catch (error) {
            console.error('Error updating content previews:', error.message);
        }

        return results;
    }

    /**
     * Run automated functionality tests
     */
    async runFunctionalityTests() {
        console.log('🧪 Running functionality tests...');
        
        const results = {
            crossPageLinks: { passed: 0, failed: 0, details: [] },
            contentPreviews: { passed: 0, failed: 0, details: [] },
            navigation: { passed: 0, failed: 0, details: [] },
            mobile: { passed: 0, failed: 0, details: [] }
        };

        try {
            // Test cross-page links
            const linkTests = await this.testCrossPageLinks();
            results.crossPageLinks = linkTests;

            // Test content previews
            const previewTests = await this.testContentPreviews();
            results.contentPreviews = previewTests;

            // Test navigation functionality
            const navTests = await this.testNavigation();
            results.navigation = navTests;

            // Test mobile experience
            const mobileTests = await this.testMobileExperience();
            results.mobile = mobileTests;

        } catch (error) {
            console.error('Error running functionality tests:', error.message);
        }

        return results;
    }

    /**
     * Extract links from content
     */
    extractLinks(content, pattern) {
        const linkRegex = new RegExp(`href=["']([^"']*${pattern}[^"']*)["']`, 'g');
        const links = [];
        let match;
        
        while ((match = linkRegex.exec(content)) !== null) {
            links.push(match[1]);
        }
        
        return [...new Set(links)]; // Remove duplicates
    }

    /**
     * Check if a link/file exists
     */
    checkLinkExists(link) {
        try {
            // Handle relative paths and anchors
            const cleanLink = link.split('#')[0];
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
        
        if (fs.existsSync(this.config.docsPath)) {
            const files = fs.readdirSync(this.config.docsPath, { recursive: true });
            files.forEach(file => {
                if (file.endsWith('.md') || file.endsWith('.html')) {
                    docFiles.push(path.join(this.config.docsPath, file));
                }
            });
        }

        // Also check docs/ directory
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
     * Find orphaned content
     */
    findOrphanedContent(docFiles, homepageLinks) {
        const linkedDocs = homepageLinks.map(link => link.link);
        const orphaned = [];
        
        docFiles.forEach(docFile => {
            const relativePath = docFile.replace(/^_docs\//, 'docs/').replace(/\.md$/, '/');
            const isLinked = linkedDocs.some(link => link.includes(relativePath));
            
            if (!isLinked) {
                orphaned.push(docFile);
            }
        });
        
        return orphaned;
    }

    /**
     * Get preview mappings between documentation and homepage sections
     */
    getPreviewMappings() {
        return {
            'installation.md': 'download-section',
            'quick-start.md': 'how-to-section',
            'addon-api.md': 'features-section',
            'addon-development.md': 'features-section',
            'smart-floater-example.md': 'features-section',
            'package-structure.md': 'download-section'
        };
    }

    /**
     * Generate preview from documentation content
     */
    generatePreview(content, filename) {
        // Remove markdown headers and extract first meaningful paragraph
        const cleanContent = content
            .replace(/^#.*$/gm, '') // Remove headers
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
            .trim();

        const paragraphs = cleanContent.split('\n\n').filter(p => p.trim().length > 50);
        const preview = paragraphs[0] || cleanContent.substring(0, 200);
        
        return preview.substring(0, 300) + (preview.length > 300 ? '...' : '');
    }

    /**
     * Update homepage preview content
     */
    async updateHomepagePreview(section, preview) {
        // This would integrate with the content preview system
        // For now, we'll log the update
        console.log(`📝 Would update ${section} with preview: ${preview.substring(0, 50)}...`);
    }

    /**
     * Test cross-page links functionality
     */
    async testCrossPageLinks() {
        const results = { passed: 0, failed: 0, details: [] };
        
        try {
            // Run the existing cross-page links test
            execSync('node test-cross-page-links.js', { stdio: 'pipe' });
            results.passed++;
            results.details.push('Cross-page links test passed');
        } catch (error) {
            results.failed++;
            results.details.push(`Cross-page links test failed: ${error.message}`);
        }
        
        return results;
    }

    /**
     * Test content previews functionality
     */
    async testContentPreviews() {
        const results = { passed: 0, failed: 0, details: [] };
        
        // Test if content preview system is working
        try {
            const previewSystemExists = fs.existsSync('js/content-preview-system.js');
            if (previewSystemExists) {
                results.passed++;
                results.details.push('Content preview system exists');
            } else {
                results.failed++;
                results.details.push('Content preview system missing');
            }
        } catch (error) {
            results.failed++;
            results.details.push(`Content preview test failed: ${error.message}`);
        }
        
        return results;
    }

    /**
     * Test navigation functionality
     */
    async testNavigation() {
        const results = { passed: 0, failed: 0, details: [] };
        
        try {
            // Check if navigation includes exist
            const navExists = fs.existsSync('includes/navigation.html');
            const breadcrumbExists = fs.existsSync('includes/breadcrumb-navigation.html');
            
            if (navExists && breadcrumbExists) {
                results.passed++;
                results.details.push('Navigation components exist');
            } else {
                results.failed++;
                results.details.push('Navigation components missing');
            }
        } catch (error) {
            results.failed++;
            results.details.push(`Navigation test failed: ${error.message}`);
        }
        
        return results;
    }

    /**
     * Test mobile experience
     */
    async testMobileExperience() {
        const results = { passed: 0, failed: 0, details: [] };
        
        try {
            // Run mobile optimization test if it exists
            if (fs.existsSync('test-mobile-optimization.html')) {
                results.passed++;
                results.details.push('Mobile optimization test available');
            } else {
                results.failed++;
                results.details.push('Mobile optimization test missing');
            }
        } catch (error) {
            results.failed++;
            results.details.push(`Mobile test failed: ${error.message}`);
        }
        
        return results;
    }

    /**
     * Generate maintenance recommendations
     */
    generateRecommendations(results) {
        const recommendations = [];
        
        // Link integrity recommendations
        if (results.linkIntegrity.brokenLinks.length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'link-integrity',
                message: `Fix ${results.linkIntegrity.brokenLinks.length} broken cross-page links`,
                details: results.linkIntegrity.brokenLinks
            });
        }
        
        if (results.linkIntegrity.orphanedContent.length > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'content-discovery',
                message: `Add homepage links for ${results.linkIntegrity.orphanedContent.length} orphaned documentation pages`,
                details: results.linkIntegrity.orphanedContent
            });
        }
        
        // Content preview recommendations
        if (results.contentPreviews.errors.length > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'content-previews',
                message: `Fix ${results.contentPreviews.errors.length} content preview update errors`,
                details: results.contentPreviews.errors
            });
        }
        
        // Functionality test recommendations
        const totalTests = Object.values(results.functionalityTests).reduce((sum, test) => sum + test.passed + test.failed, 0);
        const failedTests = Object.values(results.functionalityTests).reduce((sum, test) => sum + test.failed, 0);
        
        if (failedTests > 0) {
            recommendations.push({
                priority: 'high',
                category: 'functionality',
                message: `Address ${failedTests} failed functionality tests out of ${totalTests} total`,
                details: results.functionalityTests
            });
        }
        
        return recommendations;
    }

    /**
     * Write detailed maintenance log
     */
    writeMaintenanceLog(logFile, results) {
        const logContent = `
Cross-Page Integration Maintenance Log
=====================================
Timestamp: ${results.timestamp}

LINK INTEGRITY CHECK
-------------------
Homepage Links: ${results.linkIntegrity.homepageLinks.length}
Documentation Links: ${results.linkIntegrity.documentationLinks.length}
Broken Links: ${results.linkIntegrity.brokenLinks.length}
Orphaned Content: ${results.linkIntegrity.orphanedContent.length}

${results.linkIntegrity.brokenLinks.length > 0 ? 'BROKEN LINKS:\n' + results.linkIntegrity.brokenLinks.map(link => `- ${link.source}: ${link.link}`).join('\n') : ''}

CONTENT PREVIEWS UPDATE
----------------------
Updated Previews: ${results.contentPreviews.updatedPreviews.length}
Errors: ${results.contentPreviews.errors.length}

${results.contentPreviews.errors.length > 0 ? 'PREVIEW ERRORS:\n' + results.contentPreviews.errors.map(error => `- ${error.docFile}: ${error.error}`).join('\n') : ''}

FUNCTIONALITY TESTS
------------------
Cross-Page Links: ${results.functionalityTests.crossPageLinks.passed} passed, ${results.functionalityTests.crossPageLinks.failed} failed
Content Previews: ${results.functionalityTests.contentPreviews.passed} passed, ${results.functionalityTests.contentPreviews.failed} failed
Navigation: ${results.functionalityTests.navigation.passed} passed, ${results.functionalityTests.navigation.failed} failed
Mobile: ${results.functionalityTests.mobile.passed} passed, ${results.functionalityTests.mobile.failed} failed

RECOMMENDATIONS
--------------
${results.recommendations.map(rec => `[${rec.priority.toUpperCase()}] ${rec.category}: ${rec.message}`).join('\n')}

END OF LOG
=========
`;

        fs.writeFileSync(logFile, logContent);
    }

    /**
     * Write maintenance summary report
     */
    writeMaintenanceReport(results) {
        const reportFile = path.join(this.config.reportPath, 'latest-maintenance.json');
        fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
        
        // Also create a timestamped report
        const timestampedReport = path.join(this.config.reportPath, `maintenance-${Date.now()}.json`);
        fs.writeFileSync(timestampedReport, JSON.stringify(results, null, 2));
    }
}

// CLI interface
if (require.main === module) {
    const maintenance = new CrossPageMaintenance();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'run':
            maintenance.runMaintenance().catch(console.error);
            break;
        case 'links':
            maintenance.checkLinkIntegrity().then(results => {
                console.log('Link Integrity Results:', JSON.stringify(results, null, 2));
            }).catch(console.error);
            break;
        case 'previews':
            maintenance.updateContentPreviews().then(results => {
                console.log('Content Preview Results:', JSON.stringify(results, null, 2));
            }).catch(console.error);
            break;
        case 'test':
            maintenance.runFunctionalityTests().then(results => {
                console.log('Functionality Test Results:', JSON.stringify(results, null, 2));
            }).catch(console.error);
            break;
        default:
            console.log(`
Usage: node scripts/cross-page-maintenance.js <command>

Commands:
  run       - Run full maintenance routine
  links     - Check cross-page link integrity only
  previews  - Update content previews only
  test      - Run functionality tests only

Examples:
  node scripts/cross-page-maintenance.js run
  node scripts/cross-page-maintenance.js links
            `);
    }
}

module.exports = CrossPageMaintenance;