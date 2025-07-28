#!/usr/bin/env node

/**
 * Maintenance System Validation
 * Validates that all maintenance components are properly configured
 */

const fs = require('fs');
const path = require('path');

class MaintenanceSystemValidator {
    constructor() {
        this.issues = [];
        this.warnings = [];
        this.validations = 0;
    }

    /**
     * Run all validations
     */
    async validate() {
        console.log('🔍 Validating Cross-Page Integration Maintenance System...\n');

        this.validateFiles();
        this.validatePackageScripts();
        this.validateDirectories();
        this.validateGitHubWorkflow();
        this.validateDocumentation();

        this.generateReport();
        return this.issues.length === 0;
    }

    /**
     * Validate required files exist
     */
    validateFiles() {
        console.log('📁 Validating Files...');
        
        const requiredFiles = [
            'scripts/cross-page-maintenance.js',
            'scripts/content-preview-updater.js',
            'scripts/maintenance-integration.js',
            'scripts/cross-page-dashboard.js',
            'scripts/maintenance-status.js',
            'test-cross-page-maintenance.js',
            'CROSS_PAGE_MAINTENANCE_PROCEDURES.md',
            'MAINTENANCE_SYSTEM_README.md'
        ];

        requiredFiles.forEach(file => {
            this.validations++;
            if (fs.existsSync(file)) {
                console.log(`  ✅ ${file}`);
            } else {
                console.log(`  ❌ ${file}`);
                this.issues.push(`Missing required file: ${file}`);
            }
        });

        // Check for optional files
        const optionalFiles = [
            'scripts/integration-maintenance.js',
            'test-cross-page-integration.js',
            'test-cross-page-links.js'
        ];

        optionalFiles.forEach(file => {
            if (fs.existsSync(file)) {
                console.log(`  ℹ️  ${file} (optional)`);
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
                'maintenance:cross-page',
                'maintenance:cross-page:links',
                'maintenance:cross-page:previews',
                'maintenance:cross-page:test',
                'test:cross-page-maintenance',
                'content:update-previews',
                'content:watch-previews',
                'dashboard:cross-page',
                'maintenance:status',
                'maintenance:integration',
                'maintenance:integration:daily',
                'maintenance:integration:weekly',
                'maintenance:integration:monthly',
                'maintenance:check-status'
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
     * Validate required directories
     */
    validateDirectories() {
        console.log('\n📂 Validating Directories...');
        
        const requiredDirs = [
            'scripts',
            '.github/workflows'
        ];

        const optionalDirs = [
            'maintenance-logs',
            'maintenance-reports'
        ];

        requiredDirs.forEach(dir => {
            this.validations++;
            if (fs.existsSync(dir)) {
                console.log(`  ✅ ${dir}/`);
            } else {
                console.log(`  ❌ ${dir}/`);
                this.issues.push(`Missing required directory: ${dir}`);
            }
        });

        optionalDirs.forEach(dir => {
            if (fs.existsSync(dir)) {
                console.log(`  ℹ️  ${dir}/ (will be created automatically)`);
            } else {
                console.log(`  ⚠️  ${dir}/ (will be created when needed)`);
                this.warnings.push(`Directory ${dir} will be created automatically when needed`);
            }
        });
    }

    /**
     * Validate GitHub workflow
     */
    validateGitHubWorkflow() {
        console.log('\n🔄 Validating GitHub Workflow...');
        
        const workflowFile = '.github/workflows/cross-page-maintenance.yml';
        this.validations++;
        
        if (fs.existsSync(workflowFile)) {
            console.log(`  ✅ ${workflowFile}`);
            
            try {
                const workflowContent = fs.readFileSync(workflowFile, 'utf8');
                
                // Check for key workflow components
                const requiredComponents = [
                    'cross-page-maintenance',
                    'test:cross-page-maintenance',
                    'maintenance:cross-page',
                    'content:update-previews'
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
     * Validate documentation
     */
    validateDocumentation() {
        console.log('\n📚 Validating Documentation...');
        
        const docFiles = [
            'CROSS_PAGE_MAINTENANCE_PROCEDURES.md',
            'MAINTENANCE_SYSTEM_README.md'
        ];

        docFiles.forEach(docFile => {
            this.validations++;
            if (fs.existsSync(docFile)) {
                console.log(`  ✅ ${docFile}`);
                
                try {
                    const content = fs.readFileSync(docFile, 'utf8');
                    
                    // Check for key sections
                    const keySections = ['Overview', 'Usage', 'Maintenance'];
                    const foundSections = keySections.filter(section => 
                        content.includes(`# ${section}`) || content.includes(`## ${section}`)
                    );
                    
                    if (foundSections.length > 0) {
                        console.log(`    ℹ️  Contains ${foundSections.length}/${keySections.length} key sections`);
                    }
                    
                } catch (error) {
                    this.warnings.push(`Error reading ${docFile}: ${error.message}`);
                }
            } else {
                console.log(`  ❌ ${docFile}`);
                this.issues.push(`Missing documentation: ${docFile}`);
            }
        });
    }

    /**
     * Generate validation report
     */
    generateReport() {
        console.log('\n📊 Validation Summary:');
        console.log(`   Total Validations: ${this.validations}`);
        console.log(`   Issues Found: ${this.issues.length}`);
        console.log(`   Warnings: ${this.warnings.length}`);
        
        if (this.issues.length === 0) {
            console.log('   Status: 🟢 HEALTHY');
        } else if (this.issues.length < 3) {
            console.log('   Status: 🟡 NEEDS ATTENTION');
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
            console.log('\n🎉 Maintenance system is properly configured!');
            console.log('\n🚀 Quick Start Commands:');
            console.log('   npm run maintenance:check-status    - Check system health');
            console.log('   npm run maintenance:integration     - Run maintenance');
            console.log('   npm run test:cross-page-maintenance - Run tests');
            console.log('   npm run dashboard:cross-page        - Start dashboard');
        }
    }
}

// CLI interface
if (require.main === module) {
    const validator = new MaintenanceSystemValidator();
    validator.validate().then(isValid => {
        process.exit(isValid ? 0 : 1);
    }).catch(error => {
        console.error('❌ Validation failed:', error.message);
        process.exit(1);
    });
}

module.exports = MaintenanceSystemValidator;