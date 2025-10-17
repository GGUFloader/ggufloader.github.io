#!/usr/bin/env node

/**
 * Quick Maintenance Status Checker
 * Provides a quick health check of cross-page integration
 */

const fs = require('fs');
const path = require('path');

class MaintenanceStatus {
    constructor() {
        this.checks = [
            { name: 'Cross-Page Maintenance Script', file: 'scripts/cross-page-maintenance.js' },
            { name: 'Content Preview Updater', file: 'scripts/content-preview-updater.js' },
            { name: 'Maintenance Test Suite', file: 'test-cross-page-maintenance.js' },
            { name: 'Cross-Page Integration Tests', file: 'test-cross-page-integration.js' },
            { name: 'Cross-Page Links Tests', file: 'test-cross-page-links.js' },
            { name: 'Maintenance Procedures Doc', file: 'CROSS_PAGE_MAINTENANCE_PROCEDURES.md' },
            { name: 'GitHub Actions Workflow', file: '.github/workflows/cross-page-maintenance.yml' }
        ];
    }

    /**
     * Run status check
     */
    async checkStatus() {
        console.log('🔍 Cross-Page Integration Maintenance Status Check\n');

        let allHealthy = true;
        const results = [];

        // Check if maintenance files exist
        for (const check of this.checks) {
            const exists = fs.existsSync(check.file);
            const status = exists ? '✅' : '❌';
            
            console.log(`${status} ${check.name}`);
            
            results.push({
                name: check.name,
                file: check.file,
                exists,
                status: exists ? 'OK' : 'MISSING'
            });
            
            if (!exists) allHealthy = false;
        }

        console.log('\n📊 Additional Checks:');

        // Check if maintenance reports directory exists
        const reportsDir = 'maintenance-reports';
        const reportsExist = fs.existsSync(reportsDir);
        console.log(`${reportsExist ? '✅' : '⚠️'} Maintenance Reports Directory`);

        // Check if logs directory exists
        const logsDir = 'maintenance-logs';
        const logsExist = fs.existsSync(logsDir);
        console.log(`${logsExist ? '✅' : '⚠️'} Maintenance Logs Directory`);

        // Check for recent maintenance activity
        const recentActivity = this.checkRecentActivity();
        console.log(`${recentActivity ? '✅' : '⚠️'} Recent Maintenance Activity`);

        // Check package.json scripts
        const packageScripts = this.checkPackageScripts();
        console.log(`${packageScripts ? '✅' : '❌'} Package.json Scripts`);

        console.log('\n📋 Summary:');
        console.log(`Total Checks: ${this.checks.length + 4}`);
        console.log(`Passed: ${results.filter(r => r.exists).length + (reportsExist ? 1 : 0) + (logsExist ? 1 : 0) + (recentActivity ? 1 : 0) + (packageScripts ? 1 : 0)}`);
        console.log(`Status: ${allHealthy && packageScripts ? '🟢 HEALTHY' : '🟡 NEEDS ATTENTION'}`);

        if (!allHealthy || !packageScripts) {
            console.log('\n⚠️  Issues found:');
            results.filter(r => !r.exists).forEach(r => {
                console.log(`   - Missing: ${r.file}`);
            });
            if (!packageScripts) {
                console.log('   - Package.json missing maintenance scripts');
            }
        }

        console.log('\n🚀 Quick Commands:');
        console.log('   npm run maintenance:cross-page        - Run full maintenance');
        console.log('   npm run test:cross-page-maintenance   - Run maintenance tests');
        console.log('   npm run content:update-previews       - Update content previews');
        console.log('   npm run dashboard:cross-page          - Start monitoring dashboard');

        return allHealthy && packageScripts;
    }

    /**
     * Check for recent maintenance activity
     */
    checkRecentActivity() {
        const dirs = ['maintenance-logs', 'maintenance-reports'];
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

        for (const dir of dirs) {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    const filePath = path.join(dir, file);
                    const stats = fs.statSync(filePath);
                    if (stats.mtime.getTime() > oneDayAgo) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Check if package.json has required scripts
     */
    checkPackageScripts() {
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const requiredScripts = [
                'maintenance:cross-page',
                'test:cross-page-maintenance',
                'content:update-previews'
            ];

            return requiredScripts.every(script => packageJson.scripts && packageJson.scripts[script]);
        } catch (error) {
            return false;
        }
    }
}

// CLI interface
if (require.main === module) {
    const status = new MaintenanceStatus();
    status.checkStatus().then(healthy => {
        process.exit(healthy ? 0 : 1);
    }).catch(error => {
        console.error('❌ Status check failed:', error.message);
        process.exit(1);
    });
}

module.exports = MaintenanceStatus;