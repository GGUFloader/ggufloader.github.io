#!/usr/bin/env node

/**
 * Maintenance Integration Script
 * Orchestrates all cross-page maintenance procedures
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MaintenanceIntegration {
    constructor() {
        this.procedures = {
            daily: [
                'Link integrity check',
                'Content preview sync',
                'Basic functionality tests'
            ],
            weekly: [
                'Full maintenance routine',
                'Performance validation',
                'Mobile optimization check'
            ],
            monthly: [
                'Comprehensive audit',
                'Analytics review',
                'Documentation update'
            ]
        };
    }

    /**
     * Run maintenance procedures based on schedule
     */
    async runMaintenance(schedule = 'daily') {
        console.log(`🔧 Running ${schedule} maintenance procedures...\n`);

        const results = {
            schedule,
            timestamp: new Date().toISOString(),
            procedures: [],
            summary: {
                total: 0,
                passed: 0,
                failed: 0
            }
        };

        try {
            switch (schedule) {
                case 'daily':
                    await this.runDailyMaintenance(results);
                    break;
                case 'weekly':
                    await this.runWeeklyMaintenance(results);
                    break;
                case 'monthly':
                    await this.runMonthlyMaintenance(results);
                    break;
                default:
                    await this.runDailyMaintenance(results);
            }

            this.generateMaintenanceReport(results);
            this.logMaintenanceResults(results);

        } catch (error) {
            console.error('❌ Maintenance failed:', error.message);
            results.procedures.push({
                name: 'Maintenance Execution',
                status: 'failed',
                error: error.message
            });
        }

        return results;
    }

    /**
     * Run daily maintenance procedures
     */
    async runDailyMaintenance(results) {
        console.log('📅 Daily Maintenance Procedures:');

        // 1. Link integrity check
        await this.runProcedure(results, 'Link Integrity Check', async () => {
            const CrossPageMaintenance = require('./cross-page-maintenance.js');
            const maintenance = new CrossPageMaintenance();
            const linkResults = await maintenance.checkLinkIntegrity();
            
            if (linkResults.brokenLinks.length > 0) {
                throw new Error(`${linkResults.brokenLinks.length} broken links found`);
            }
            
            return `${linkResults.homepageLinks.length + linkResults.documentationLinks.length} links validated`;
        });

        // 2. Content preview synchronization
        await this.runProcedure(results, 'Content Preview Sync', async () => {
            const ContentPreviewUpdater = require('./content-preview-updater.js');
            const updater = new ContentPreviewUpdater();
            const updateResults = await updater.updatePreviews();
            
            return `${updateResults.updated.length} previews updated, ${updateResults.skipped.length} skipped`;
        });

        // 3. Basic functionality tests
        await this.runProcedure(results, 'Functionality Tests', async () => {
            const CrossPageMaintenanceTests = require(path.join(__dirname, '..', 'test-cross-page-maintenance.js'));
            const tester = new CrossPageMaintenanceTests();
            const testResults = await tester.runAllTests();
            
            if (testResults.failed > 0) {
                throw new Error(`${testResults.failed} tests failed`);
            }
            
            return `${testResults.passed} tests passed`;
        });
    }

    /**
     * Run weekly maintenance procedures
     */
    async runWeeklyMaintenance(results) {
        console.log('📅 Weekly Maintenance Procedures:');

        // Run daily procedures first
        await this.runDailyMaintenance(results);

        // 4. Full maintenance routine
        await this.runProcedure(results, 'Full Maintenance Routine', async () => {
            const CrossPageMaintenance = require('./cross-page-maintenance.js');
            const maintenance = new CrossPageMaintenance();
            const maintenanceResults = await maintenance.runMaintenance();
            
            const totalRecommendations = maintenanceResults.recommendations.length;
            const highPriorityIssues = maintenanceResults.recommendations.filter(r => r.priority === 'high').length;
            
            if (highPriorityIssues > 0) {
                throw new Error(`${highPriorityIssues} high priority issues found`);
            }
            
            return `Maintenance completed with ${totalRecommendations} recommendations`;
        });

        // 5. Performance validation
        await this.runProcedure(results, 'Performance Validation', async () => {
            // Check if performance monitoring files exist
            const perfFiles = ['performance-monitor.js', 'critical.css', 'sw.js'];
            const missingFiles = perfFiles.filter(file => !fs.existsSync(file));
            
            if (missingFiles.length > 0) {
                throw new Error(`Missing performance files: ${missingFiles.join(', ')}`);
            }
            
            return `${perfFiles.length} performance components validated`;
        });
    }

    /**
     * Run monthly maintenance procedures
     */
    async runMonthlyMaintenance(results) {
        console.log('📅 Monthly Maintenance Procedures:');

        // Run weekly procedures first
        await this.runWeeklyMaintenance(results);

        // 6. Comprehensive audit
        await this.runProcedure(results, 'Comprehensive Audit', async () => {
            const auditResults = {
                files: 0,
                components: 0,
                integrations: 0
            };

            // Audit maintenance files
            const maintenanceFiles = [
                'scripts/cross-page-maintenance.js',
                'scripts/content-preview-updater.js',
                'test-cross-page-maintenance.js',
                'CROSS_PAGE_MAINTENANCE_PROCEDURES.md'
            ];

            auditResults.files = maintenanceFiles.filter(file => fs.existsSync(file)).length;

            // Audit integration components
            const integrationComponents = [
                'js/content-preview-system.js',
                'js/homepage-content-integration.js',
                'css/content-preview.css',
                'includes/breadcrumb-navigation.html'
            ];

            auditResults.components = integrationComponents.filter(file => fs.existsSync(file)).length;

            // Audit cross-page integrations
            const integrations = [
                'js/cross-page-analytics.js',
                'js/seo-internal-linking.js',
                'js/related-content-system.js'
            ];

            auditResults.integrations = integrations.filter(file => fs.existsSync(file)).length;

            return `Audit: ${auditResults.files} maintenance files, ${auditResults.components} components, ${auditResults.integrations} integrations`;
        });

        // 7. Documentation update check
        await this.runProcedure(results, 'Documentation Update', async () => {
            const docFile = 'CROSS_PAGE_MAINTENANCE_PROCEDURES.md';
            
            if (!fs.existsSync(docFile)) {
                throw new Error('Maintenance procedures documentation missing');
            }

            const stats = fs.statSync(docFile);
            const daysSinceUpdate = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
            
            if (daysSinceUpdate > 90) {
                throw new Error(`Documentation not updated in ${Math.floor(daysSinceUpdate)} days`);
            }
            
            return `Documentation last updated ${Math.floor(daysSinceUpdate)} days ago`;
        });
    }

    /**
     * Run a single maintenance procedure
     */
    async runProcedure(results, name, procedure) {
        console.log(`  🔄 ${name}...`);
        
        const procedureResult = {
            name,
            status: 'running',
            startTime: new Date().toISOString(),
            message: '',
            error: null
        };

        results.procedures.push(procedureResult);
        results.summary.total++;

        try {
            const message = await procedure();
            procedureResult.status = 'passed';
            procedureResult.message = message;
            procedureResult.endTime = new Date().toISOString();
            
            console.log(`    ✅ ${name}: ${message}`);
            results.summary.passed++;
            
        } catch (error) {
            procedureResult.status = 'failed';
            procedureResult.error = error.message;
            procedureResult.endTime = new Date().toISOString();
            
            console.log(`    ❌ ${name}: ${error.message}`);
            results.summary.failed++;
        }
    }

    /**
     * Generate maintenance report
     */
    generateMaintenanceReport(results) {
        const reportDir = 'maintenance-reports';
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        const reportFile = path.join(reportDir, `maintenance-${results.schedule}-${Date.now()}.json`);
        fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));

        // Also update the latest report
        const latestFile = path.join(reportDir, `latest-${results.schedule}-maintenance.json`);
        fs.writeFileSync(latestFile, JSON.stringify(results, null, 2));

        console.log(`\n📄 Report saved: ${reportFile}`);
    }

    /**
     * Log maintenance results
     */
    logMaintenanceResults(results) {
        const logDir = 'maintenance-logs';
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const logContent = `
Cross-Page Integration Maintenance Log
=====================================
Schedule: ${results.schedule}
Timestamp: ${results.timestamp}

SUMMARY
-------
Total Procedures: ${results.summary.total}
Passed: ${results.summary.passed}
Failed: ${results.summary.failed}
Success Rate: ${results.summary.total > 0 ? ((results.summary.passed / results.summary.total) * 100).toFixed(1) : 0}%

PROCEDURES
----------
${results.procedures.map(proc => `
${proc.status === 'passed' ? '✅' : '❌'} ${proc.name}
   Status: ${proc.status}
   ${proc.message ? `Message: ${proc.message}` : ''}
   ${proc.error ? `Error: ${proc.error}` : ''}
   Duration: ${proc.endTime ? new Date(proc.endTime).getTime() - new Date(proc.startTime).getTime() : 0}ms
`).join('')}

END OF LOG
=========
`;

        const logFile = path.join(logDir, `maintenance-${results.schedule}-${Date.now()}.log`);
        fs.writeFileSync(logFile, logContent);

        console.log(`📝 Log saved: ${logFile}`);
        console.log(`\n📊 Maintenance Summary: ${results.summary.passed}/${results.summary.total} procedures passed`);
        
        if (results.summary.failed > 0) {
            console.log('⚠️  Some procedures failed. Please review the logs and address the issues.');
        } else {
            console.log('🎉 All maintenance procedures completed successfully!');
        }
    }
}

// CLI interface
if (require.main === module) {
    const integration = new MaintenanceIntegration();
    const schedule = process.argv[2] || 'daily';
    
    integration.runMaintenance(schedule).catch(error => {
        console.error('❌ Maintenance integration failed:', error.message);
        process.exit(1);
    });
}

module.exports = MaintenanceIntegration;