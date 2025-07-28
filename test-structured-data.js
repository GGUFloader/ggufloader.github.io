#!/usr/bin/env node

/**
 * Structured Data Testing Script for GGUF Loader Website
 * 
 * This script validates JSON-LD structured data across all pages
 * and ensures compliance with schema.org standards
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuration
const SITE_URL = 'https://ggufloader.github.io';
const TEST_PAGES = [
    { file: 'index.html', expectedSchemas: ['SoftwareApplication', 'Organization'] },
    { file: 'docs/index.html', expectedSchemas: ['WebPage', 'BreadcrumbList'] },
    { file: 'docs/installation/index.html', expectedSchemas: ['TechArticle', 'BreadcrumbList'] },
    { file: 'docs/quick-start/index.html', expectedSchemas: ['HowTo', 'BreadcrumbList'] },
    { file: 'docs/addon-development/index.html', expectedSchemas: ['TechArticle', 'BreadcrumbList'] },
    { file: 'docs/addon-api/index.html', expectedSchemas: ['APIReference', 'BreadcrumbList'] },
    { file: 'docs/smart-floater-example/index.html', expectedSchemas: ['CodeRepository', 'BreadcrumbList'] },
    { file: 'docs/package-structure/index.html', expectedSchemas: ['TechArticle', 'BreadcrumbList'] }
];

class StructuredDataValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.validSchemas = [];
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

    validateJsonLd(filePath, expectedSchemas) {
        try {
            if (!fs.existsSync(filePath)) {
                this.log(`File not found: ${filePath}`, 'error');
                return false;
            }

            const content = fs.readFileSync(filePath, 'utf8');
            const dom = new JSDOM(content);
            const document = dom.window.document;
            
            const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
            
            if (jsonLdScripts.length === 0) {
                this.log(`No JSON-LD structured data found in ${filePath}`, 'error');
                return false;
            }

            let foundSchemas = [];
            let allValid = true;

            jsonLdScripts.forEach((script, index) => {
                try {
                    const jsonData = JSON.parse(script.textContent);
                    
                    // Validate basic structure
                    if (!this.validateBasicStructure(jsonData, filePath, index)) {
                        allValid = false;
                        return;
                    }

                    const schemaType = jsonData['@type'];
                    foundSchemas.push(schemaType);

                    // Validate specific schema types
                    if (!this.validateSchemaType(jsonData, schemaType, filePath)) {
                        allValid = false;
                    }

                } catch (parseError) {
                    this.log(`Invalid JSON-LD syntax in ${filePath} (script ${index + 1}): ${parseError.message}`, 'error');
                    allValid = false;
                }
            });

            // Check if all expected schemas are present
            expectedSchemas.forEach(expectedSchema => {
                if (!foundSchemas.includes(expectedSchema)) {
                    this.log(`Missing expected schema ${expectedSchema} in ${filePath}`, 'error');
                    allValid = false;
                }
            });

            if (allValid) {
                this.log(`✓ Valid structured data in ${filePath}: ${foundSchemas.join(', ')}`);
                this.validSchemas.push({ file: filePath, schemas: foundSchemas });
            }

            return allValid;

        } catch (error) {
            this.log(`Error validating structured data in ${filePath}: ${error.message}`, 'error');
            return false;
        }
    }

    validateBasicStructure(jsonData, filePath, index) {
        // Check required properties
        if (!jsonData['@context']) {
            this.log(`Missing @context in ${filePath} (script ${index + 1})`, 'error');
            return false;
        }

        if (!jsonData['@type']) {
            this.log(`Missing @type in ${filePath} (script ${index + 1})`, 'error');
            return false;
        }

        // Validate @context
        if (jsonData['@context'] !== 'https://schema.org') {
            this.log(`Invalid @context in ${filePath} (script ${index + 1}): expected https://schema.org`, 'error');
            return false;
        }

        return true;
    }

    validateSchemaType(jsonData, schemaType, filePath) {
        switch (schemaType) {
            case 'SoftwareApplication':
                return this.validateSoftwareApplication(jsonData, filePath);
            case 'TechArticle':
                return this.validateTechArticle(jsonData, filePath);
            case 'HowTo':
                return this.validateHowTo(jsonData, filePath);
            case 'APIReference':
                return this.validateAPIReference(jsonData, filePath);
            case 'CodeRepository':
                return this.validateCodeRepository(jsonData, filePath);
            case 'BreadcrumbList':
                return this.validateBreadcrumbList(jsonData, filePath);
            case 'Organization':
                return this.validateOrganization(jsonData, filePath);
            case 'WebPage':
                return this.validateWebPage(jsonData, filePath);
            default:
                this.log(`Unknown schema type ${schemaType} in ${filePath}`, 'warning');
                return true;
        }
    }

    validateSoftwareApplication(jsonData, filePath) {
        const required = ['name', 'applicationCategory', 'operatingSystem'];
        const recommended = ['softwareVersion', 'offers', 'downloadUrl', 'featureList'];
        
        return this.validateRequiredFields(jsonData, required, filePath, 'SoftwareApplication') &&
               this.validateRecommendedFields(jsonData, recommended, filePath, 'SoftwareApplication');
    }

    validateTechArticle(jsonData, filePath) {
        const required = ['headline', 'author', 'publisher', 'datePublished'];
        const recommended = ['description', 'mainEntityOfPage', 'articleSection'];
        
        return this.validateRequiredFields(jsonData, required, filePath, 'TechArticle') &&
               this.validateRecommendedFields(jsonData, recommended, filePath, 'TechArticle');
    }

    validateHowTo(jsonData, filePath) {
        const required = ['name', 'step'];
        const recommended = ['description', 'totalTime', 'supply', 'tool'];
        
        let valid = this.validateRequiredFields(jsonData, required, filePath, 'HowTo');
        
        // Validate steps structure
        if (jsonData.step && Array.isArray(jsonData.step)) {
            jsonData.step.forEach((step, index) => {
                if (!step['@type'] || step['@type'] !== 'HowToStep') {
                    this.log(`Invalid step structure in ${filePath} (step ${index + 1})`, 'error');
                    valid = false;
                }
                if (!step.name || !step.text) {
                    this.log(`Missing name or text in step ${index + 1} in ${filePath}`, 'error');
                    valid = false;
                }
            });
        }
        
        return valid && this.validateRecommendedFields(jsonData, recommended, filePath, 'HowTo');
    }

    validateAPIReference(jsonData, filePath) {
        const required = ['name', 'programmingLanguage'];
        const recommended = ['description', 'targetProduct', 'author'];
        
        return this.validateRequiredFields(jsonData, required, filePath, 'APIReference') &&
               this.validateRecommendedFields(jsonData, recommended, filePath, 'APIReference');
    }

    validateCodeRepository(jsonData, filePath) {
        const required = ['name', 'programmingLanguage'];
        const recommended = ['description', 'codeRepository', 'author'];
        
        return this.validateRequiredFields(jsonData, required, filePath, 'CodeRepository') &&
               this.validateRecommendedFields(jsonData, recommended, filePath, 'CodeRepository');
    }

    validateBreadcrumbList(jsonData, filePath) {
        const required = ['itemListElement'];
        
        let valid = this.validateRequiredFields(jsonData, required, filePath, 'BreadcrumbList');
        
        // Validate breadcrumb items
        if (jsonData.itemListElement && Array.isArray(jsonData.itemListElement)) {
            jsonData.itemListElement.forEach((item, index) => {
                if (!item['@type'] || item['@type'] !== 'ListItem') {
                    this.log(`Invalid breadcrumb item structure in ${filePath} (item ${index + 1})`, 'error');
                    valid = false;
                }
                if (!item.position || !item.name || !item.item) {
                    this.log(`Missing required fields in breadcrumb item ${index + 1} in ${filePath}`, 'error');
                    valid = false;
                }
            });
        }
        
        return valid;
    }

    validateOrganization(jsonData, filePath) {
        const required = ['name'];
        const recommended = ['url', 'logo', 'description'];
        
        return this.validateRequiredFields(jsonData, required, filePath, 'Organization') &&
               this.validateRecommendedFields(jsonData, recommended, filePath, 'Organization');
    }

    validateWebPage(jsonData, filePath) {
        const required = ['name'];
        const recommended = ['description', 'url', 'mainEntity'];
        
        return this.validateRequiredFields(jsonData, required, filePath, 'WebPage') &&
               this.validateRecommendedFields(jsonData, recommended, filePath, 'WebPage');
    }

    validateRequiredFields(jsonData, requiredFields, filePath, schemaType) {
        let valid = true;
        
        requiredFields.forEach(field => {
            if (!jsonData[field]) {
                this.log(`Missing required field '${field}' in ${schemaType} schema in ${filePath}`, 'error');
                valid = false;
            }
        });
        
        return valid;
    }

    validateRecommendedFields(jsonData, recommendedFields, filePath, schemaType) {
        recommendedFields.forEach(field => {
            if (!jsonData[field]) {
                this.log(`Missing recommended field '${field}' in ${schemaType} schema in ${filePath}`, 'warning');
            }
        });
        
        return true; // Warnings don't fail validation
    }

    async validate() {
        this.log('Starting structured data validation...');
        
        let allValid = true;
        
        for (const testPage of TEST_PAGES) {
            this.log(`\nValidating ${testPage.file}...`);
            const isValid = this.validateJsonLd(testPage.file, testPage.expectedSchemas);
            if (!isValid) {
                allValid = false;
            }
        }
        
        // Summary
        this.log('\n=== STRUCTURED DATA VALIDATION SUMMARY ===');
        this.log(`Pages tested: ${TEST_PAGES.length}`);
        this.log(`Valid schemas found: ${this.validSchemas.length}`);
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
        
        if (allValid) {
            this.log('✅ All structured data validations passed!');
        } else {
            this.log('❌ Structured data validation failed!');
        }
        
        return allValid;
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new StructuredDataValidator();
    validator.validate().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = StructuredDataValidator;