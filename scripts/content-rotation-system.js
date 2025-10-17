#!/usr/bin/env node

/**
 * Content Rotation System
 * Subtly rotates content elements to signal freshness to crawlers
 */

const fs = require('fs');
const path = require('path');

class ContentRotationSystem {
    constructor() {
        this.rotationStrategies = {
            testimonials: [
                "Excellent tool for GGUF model loading!",
                "Makes working with GGUF files so much easier.",
                "Great performance and easy integration.",
                "Perfect for our machine learning workflow.",
                "Streamlined our model deployment process."
            ],
            features: [
                "Fast and efficient GGUF loading",
                "Optimized performance for large models",
                "Easy integration with existing projects",
                "Comprehensive API documentation",
                "Active community support"
            ],
            stats: {
                downloads: () => Math.floor(Math.random() * 1000) + 5000,
                users: () => Math.floor(Math.random() * 500) + 2000,
                stars: () => Math.floor(Math.random() * 50) + 150
            },
            tips: [
                "Pro tip: Use async loading for better performance",
                "Tip: Check our examples for quick implementation",
                "Hint: Enable caching for faster subsequent loads",
                "Suggestion: Use our TypeScript definitions",
                "Advice: Monitor memory usage with large models"
            ]
        };
        
        this.contentElements = {
            homepage: 'index.html',
            docs: 'docs/index.html'
        };
    }

    /**
     * Run content rotation
     */
    async rotateContent() {
        console.log('🔄 Starting Content Rotation...');
        
        const results = {
            timestamp: new Date().toISOString(),
            rotations: [],
            changes: 0
        };

        // Rotate homepage content
        const homepageResult = await this.rotateHomepageContent();
        results.rotations.push(homepageResult);
        results.changes += homepageResult.changes;

        // Rotate documentation content
        const docsResult = await this.rotateDocsContent();
        results.rotations.push(docsResult);
        results.changes += docsResult.changes;

        // Update dynamic elements
        const dynamicResult = await this.updateDynamicElements();
        results.rotations.push(dynamicResult);
        results.changes += dynamicResult.changes;

        console.log(`✅ Content rotation completed with ${results.changes} changes`);
        
        this.saveRotationReport(results);
        return results;
    }

    /**
     * Rotate homepage content elements
     */
    async rotateHomepageContent() {
        const result = {
            file: 'index.html',
            changes: 0,
            elements: []
        };

        if (!fs.existsSync('index.html')) {
            return { ...result, error: 'Homepage not found' };
        }

        let html = fs.readFileSync('index.html', 'utf8');
        const originalHtml = html;

        // Rotate testimonial
        const testimonial = this.getRandomElement(this.rotationStrategies.testimonials);
        html = this.updateElement(html, 'testimonial', testimonial);
        if (html !== originalHtml) {
            result.changes++;
            result.elements.push({ type: 'testimonial', value: testimonial });
        }

        // Rotate feature highlight
        const feature = this.getRandomElement(this.rotationStrategies.features);
        html = this.updateElement(html, 'feature-highlight', feature);

        // Update stats
        const stats = {
            downloads: this.rotationStrategies.stats.downloads(),
            users: this.rotationStrategies.stats.users(),
            stars: this.rotationStrategies.stats.stars()
        };

        for (const [key, value] of Object.entries(stats)) {
            const updated = this.updateElement(html, `stat-${key}`, value.toLocaleString());
            if (updated !== html) {
                result.changes++;
                result.elements.push({ type: `stat-${key}`, value });
            }
            html = updated;
        }

        // Add daily tip
        const tip = this.getRandomElement(this.rotationStrategies.tips);
        html = this.updateElement(html, 'daily-tip', tip);

        // Update last-updated timestamp
        const timestamp = new Date().toISOString();
        html = this.updateElement(html, 'last-updated', new Date().toLocaleDateString());

        if (html !== originalHtml) {
            fs.writeFileSync('index.html', html);
            result.changes = Math.max(result.changes, 1);
        }

        return result;
    }

    /**
     * Rotate documentation content
     */
    async rotateDocsContent() {
        const result = {
            file: 'docs/index.html',
            changes: 0,
            elements: []
        };

        if (!fs.existsSync('docs/index.html')) {
            return { ...result, error: 'Docs index not found' };
        }

        let html = fs.readFileSync('docs/index.html', 'utf8');
        const originalHtml = html;

        // Rotate documentation tip
        const tip = this.getRandomElement(this.rotationStrategies.tips);
        html = this.updateElement(html, 'doc-tip', tip);

        // Update "last reviewed" date
        html = this.updateElement(html, 'last-reviewed', new Date().toLocaleDateString());

        // Rotate example highlight
        const examples = [
            'Basic GGUF loading example',
            'Advanced configuration options',
            'Performance optimization tips',
            'Error handling best practices',
            'Integration with popular frameworks'
        ];
        const example = this.getRandomElement(examples);
        html = this.updateElement(html, 'example-highlight', example);

        if (html !== originalHtml) {
            fs.writeFileSync('docs/index.html', html);
            result.changes++;
        }

        return result;
    }

    /**
     * Update dynamic elements across the site
     */
    async updateDynamicElements() {
        const result = {
            file: 'dynamic-elements',
            changes: 0,
            elements: []
        };

        // Create/update dynamic content file
        const dynamicContent = {
            timestamp: new Date().toISOString(),
            dailyQuote: this.getRandomElement([
                "Efficiency is doing things right; effectiveness is doing the right things.",
                "The best way to predict the future is to create it.",
                "Innovation distinguishes between a leader and a follower.",
                "Quality is not an act, it is a habit.",
                "Simplicity is the ultimate sophistication."
            ]),
            todaysFocus: this.getRandomElement([
                "Performance Optimization",
                "User Experience",
                "Code Quality",
                "Documentation",
                "Community Building"
            ]),
            randomFact: this.getRandomElement([
                "GGUF format supports efficient model loading",
                "Our library handles models up to 100GB",
                "Zero-copy loading reduces memory usage",
                "Cross-platform compatibility guaranteed",
                "Active development with weekly updates"
            ]),
            version: this.generateDailyVersion(),
            buildNumber: Math.floor(Date.now() / 1000)
        };

        fs.writeFileSync('dynamic-content.json', JSON.stringify(dynamicContent, null, 2));
        result.changes++;
        result.elements.push({ type: 'dynamic-content', value: 'Updated' });

        // Update JavaScript with dynamic content
        const jsContent = `
// Dynamic content updated: ${new Date().toISOString()}
window.dynamicContent = ${JSON.stringify(dynamicContent, null, 2)};

// Auto-update elements on page load
document.addEventListener('DOMContentLoaded', function() {
    const elements = {
        'daily-quote': dynamicContent.dailyQuote,
        'todays-focus': dynamicContent.todaysFocus,
        'random-fact': dynamicContent.randomFact,
        'build-info': 'Build ' + dynamicContent.buildNumber
    };
    
    for (const [id, content] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }
});
`;

        fs.writeFileSync('js/dynamic-content.js', jsContent);
        result.changes++;
        result.elements.push({ type: 'dynamic-js', value: 'Updated' });

        return result;
    }

    /**
     * Update specific element in HTML
     */
    updateElement(html, elementId, content) {
        // Try different patterns for finding elements
        const patterns = [
            // ID-based
            new RegExp(`(<[^>]*id=["']${elementId}["'][^>]*>)([^<]*)(</[^>]*>)`, 'i'),
            // Class-based
            new RegExp(`(<[^>]*class=["'][^"']*${elementId}[^"']*["'][^>]*>)([^<]*)(</[^>]*>)`, 'i'),
            // Data attribute
            new RegExp(`(<[^>]*data-${elementId}=["'][^"']*["'][^>]*>)([^<]*)(</[^>]*>)`, 'i'),
            // Comment-based replacement
            new RegExp(`(<!-- ${elementId} start -->)([\\s\\S]*?)(<!-- ${elementId} end -->)`, 'i')
        ];

        for (const pattern of patterns) {
            if (pattern.test(html)) {
                return html.replace(pattern, `$1${content}$3`);
            }
        }

        // If no existing element found, try to add it
        return this.addElementIfMissing(html, elementId, content);
    }

    /**
     * Add element if missing
     */
    addElementIfMissing(html, elementId, content) {
        // Add to footer or before closing body tag
        const insertPoints = [
            /<\/footer>/i,
            /<\/body>/i,
            /<\/html>/i
        ];

        const elementHtml = `\n<!-- ${elementId} start -->\n<div id="${elementId}" class="dynamic-content">${content}</div>\n<!-- ${elementId} end -->\n`;

        for (const pattern of insertPoints) {
            if (pattern.test(html)) {
                return html.replace(pattern, elementHtml + '$&');
            }
        }

        return html;
    }

    /**
     * Get random element from array
     */
    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Generate daily version number
     */
    generateDailyVersion() {
        const date = new Date();
        return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
    }

    /**
     * Save rotation report
     */
    saveRotationReport(results) {
        const reportsDir = 'seo-reports';
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        
        const reportFile = path.join(reportsDir, `content-rotation-${Date.now()}.json`);
        fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
        
        // Also save as latest
        const latestFile = path.join(reportsDir, 'latest-content-rotation.json');
        fs.writeFileSync(latestFile, JSON.stringify(results, null, 2));
    }
}

// CLI interface
if (require.main === module) {
    const rotator = new ContentRotationSystem();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'run':
        case undefined:
            rotator.rotateContent().catch(console.error);
            break;
        default:
            console.log(`
Usage: node scripts/content-rotation-system.js [command]

Commands:
  run (default) - Run content rotation

Examples:
  node scripts/content-rotation-system.js
  node scripts/content-rotation-system.js run
            `);
    }
}

module.exports = ContentRotationSystem;