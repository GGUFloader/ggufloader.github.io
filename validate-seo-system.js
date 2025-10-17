#!/usr/bin/env node

/**
 * SEO System Validation
 * Validates that all SEO freshness components are working correctly
 */

const fs = require('fs');
const path = require('path');

class SEOSystemValidator {
    constructor() {
        this.issues = [];
        this.warnings = [];
        this.validations = 0;
    }

    /**
     * Run all validations
     */
    async validate() {
        console.log('🔍 Validating SEO Freshness System...\n');

        this.validateScripts();
        this.validatePackageScripts();
        this.validateGitHubWorkflow();
        this.validateGeneratedFiles();
        this.validateConfiguration();

        this.generateReport();
        return this.issues.length === 0;
    }

    /**
     * Validate SEO scripts exist
     */
    validateScripts() {
        console.log('📁 Validating SEO Scripts...');
        
        const requiredScripts = [
            'scripts/seo-freshness-simulator.js',
            'scripts/content-rotation-system.js',
            'scripts/bot-signal-generator.js',
            'scripts/daily-seo-orchestrator.js'
        ];

        requiredScripts.forEach(script => {
            this.validations++;
            if (fs.existsSync(script)) {
                console.log(`  ✅ ${script}`);
            } else {
                console.log(`  ❌ ${script}`);
                this.issues.push(`Missing required script: ${script}`);
            }
        });
    }

    /**
     * Validate package.json scripts
     */
    validatePackageScripts() {
        console.log('\n📦 Validating Package Scripts...');
        
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const requiredScripts = [
                'seo:daily',
                'seo:freshness',
                'seo:rotate',
                'seo:signals',
                'seo:all'
            ];

            requiredScripts.forEach(script => {
                this.validations++;
                if (packageJson.scripts && packageJson.scripts[script]) {
                    console.log(`  ✅ ${script}`);
                } else {
                    console.log(`  ❌ ${script}`);
                    this.issues.push(`Missing package script: ${script}`);
                }
            });

        } catch (error) {
            this.issues.push(`Error reading package.json: ${error.message}`);
        }
    }

    /**
     * Validate GitHub workflow
     */
    validateGitHubWorkflow() {
        console.log('\n🔄 Validating GitHub Workflow...');
        
        const workflowFile = '.github/workflows/daily-seo-freshness.yml';
        this.validations++;
        
        if (fs.existsSync(workflowFile)) {
            console.log(`  ✅ ${workflowFile}`);
            
            try {
                const workflowContent = fs.readFileSync(workflowFile, 'utf8');
                
                // Check for key workflow components
                const requiredComponents = [
                    'daily-seo-orchestrator.js',
                    'cron:',
                    'workflow_dispatch',
                    'ping-search-engines'
                ];

                requiredComponents.forEach(component => {
                    if (workflowContent.includes(component)) {
                        console.log(`    ✅ Contains ${component}`);
                    } else {
                        console.log(`    ⚠️  Missing ${component}`);
                        this.warnings.push(`GitHub workflow missing component: ${component}`);
                    }
                });

            } catch (error) {
                this.warnings.push(`Error reading workflow file: ${error.message}`);
            }
        } else {
            console.log(`  ❌ ${workflowFile}`);
            this.issues.push(`Missing GitHub workflow: ${workflowFile}`);
        }
    }

    /**
     * Validate generated files (if they exist)
     */
    validateGeneratedFiles() {
        console.log('\n📄 Checking Generated Files...');
        
        const generatedFiles = [
            { file: 'sitemap.xml', required: false },
            { file: 'robots.txt', required: false },
            { file: 'feed.xml', required: false },
            { file: 'structured-data.json', required: false },
            { file: 'dynamic-content.json', required: false },
            { file: 'master-freshness-indicator.json', required: false }
        ];

        generatedFiles.forEach(({ file, required }) => {
            if (fs.existsSync(file)) {
                console.log(`  ✅ ${file} (exists)`);
                
                // Check if file is recent (within 25 hours)
                const stats = fs.statSync(file);
                const hoursSince = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
                
                if (hoursSince > 25) {
                    console.log(`    ⚠️  ${file} is ${hoursSince.toFixed(1)} hours old`);
                    this.warnings.push(`${file} may be stale (${hoursSince.toFixed(1)} hours old)`);
                } else {
                    console.log(`    ℹ️  ${file} updated ${hoursSince.toFixed(1)} hours ago`);
                }
            } else {
                if (required) {
                    console.log(`  ❌ ${file} (missing)`);
                    this.issues.push(`Required file missing: ${file}`);
                } else {
                    console.log(`  ⚪ ${file} (will be generated)`);
                }
            }
        });
    }

    /**
     * Validate configuration
     */
    validateConfiguration() {
        console.log('\n⚙️  Validating Configuration...');
        
        // Check if base URL is configured
        const scriptsToCheck = [
            'scripts/seo-freshness-simulator.js',
            'scripts/bot-signal-generator.js',
            'scripts/daily-seo-orchestrator.js'
        ];

        scriptsToCheck.forEach(scriptPath => {
            if (fs.existsSync(scriptPath)) {
                const content = fs.readFileSync(scriptPath, 'utf8');
                
                if (content.includes('your-domain.com')) {
                    console.log(`  ⚠️  ${scriptPath} needs base URL configuration`);
                    this.warnings.push(`Update base URL in ${scriptPath}`);
                } else {
                    console.log(`  ✅ ${scriptPath} appears configured`);
                }
            }
        });

        // Check GitHub workflow URL
        const workflowFile = '.github/workflows/daily-seo-freshness.yml';
        if (fs.existsSync(workflowFile)) {
            const content = fs.readFileSync(workflowFile, 'utf8');
            
            if (content.includes('your-domain.com')) {
                console.log(`  ⚠️  ${workflowFile} needs domain configuration`);
                this.warnings.push(`Update domain in ${workflowFile}`);
            } else {
                console.log(`  ✅ ${workflowFile} appears configured`);
            }
        }
    }

    /**
     * Generate validation report
     */
    generateReport() {
        console.log('\n📊 Validation Summary:');
        console.log(`   Total Validations: ${this.validations}`);
        console.log(`   Issues Found: ${this.issues.length}`);
        console.log(`   Warnings: ${this.warnings.length}`);
        
        if (this.issues.length === 0 && this.warnings.length === 0) {
            console.log('   Status: 🟢 PERFECT');
        } else if (this.issues.length === 0) {
            console.log('   Status: 🟡 GOOD (with warnings)');
        } else if (this.issues.length < 3) {
            console.log('   Status: 🟠 NEEDS ATTENTION');
        } else {
            console.log('   Status: 🔴 CRITICAL ISSUES');
        }

        if (this.issues.length > 0) {
            console.log('\n❌ Issues to Fix:');
            this.issues.forEach((issue, index) => {
                console.log(`   ${index + 1}. ${issue}`);
            });
        }

        if (this.warnings.length > 0) {
            console.log('\n⚠️  Warnings:');
            this.warnings.forEach((warning, index) => {
                console.log(`   ${index + 1}. ${warning}`);
            });
        }

        if (this.issues.length === 0) {
            console.log('\n🎉 SEO Freshness System is ready!');
            console.log('\n🚀 Quick Start Commands:');
            console.log('   npm run seo:daily           - Run full daily orchestration');
            console.log('   npm run seo:freshness       - Update sitemaps and feeds');
            console.log('   npm run seo:rotate          - Rotate content elements');
            console.log('   npm run seo:signals         - Generate bot signals');
            
            console.log('\n📅 Automation:');
            console.log('   - GitHub Actions will run daily at 2:30 AM UTC');
            console.log('   - Manual triggers available in Actions tab');
            console.log('   - Search engines will be pinged automatically');
            
            console.log('\n🔧 Configuration Needed:');
            if (this.warnings.some(w => w.includes('base URL') || w.includes('domain'))) {
                console.log('   - Update base URLs in scripts with your actual domain');
                console.log('   - Configure GitHub workflow with your domain');
            } else {
                console.log('   - System appears fully configured');
            }
        }
    }
}

// CLI interface
if (require.main === module) {
    const validator = new SEOSystemValidator();
    validator.validate().then(isValid => {
        process.exit(isValid ? 0 : 1);
    }).catch(error => {
        console.error('❌ Validation failed:', error.message);
        process.exit(1);
    });
}

module.exports = SEOSystemValidator;