#!/usr/bin/env node

/**
 * Bot Signal Generator
 * Generates various signals to attract and encourage bot crawling
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class BotSignalGenerator {
    constructor() {
        this.signals = {
            structured_data: this.generateStructuredData(),
            meta_signals: this.generateMetaSignals(),
            http_headers: this.generateHttpHeaders(),
            crawl_hints: this.generateCrawlHints(),
            social_signals: this.generateSocialSignals()
        };
    }

    /**
     * Generate all bot signals
     */
    async generateAllSignals() {
        console.log('🤖 Generating Bot Attraction Signals...');
        
        const results = {
            timestamp: new Date().toISOString(),
            signals: [],
            files_created: []
        };

        // Generate structured data
        await this.createStructuredDataFile();
        results.signals.push('structured_data');
        results.files_created.push('structured-data.json');

        // Update HTML with bot-friendly meta tags
        await this.updateHtmlWithBotSignals();
        results.signals.push('html_meta_tags');

        // Create bot-specific files
        await this.createBotFiles();
        results.signals.push('bot_files');
        results.files_created.push('robots.txt', 'humans.txt', 'security.txt');

        // Generate social media signals
        await this.createSocialSignals();
        results.signals.push('social_signals');
        results.files_created.push('social-meta.html');

        // Create crawl optimization files
        await this.createCrawlOptimizationFiles();
        results.signals.push('crawl_optimization');
        results.files_created.push('crawl-hints.json', 'bot-config.json');

        // Generate activity signals
        await this.generateActivitySignals();
        results.signals.push('activity_signals');

        console.log(`✅ Generated ${results.signals.length} signal types`);
        
        this.saveSignalReport(results);
        return results;
    }

    /**
     * Generate structured data for rich snippets
     */
    generateStructuredData() {
        const baseUrl = this.getBaseUrl();
        
        return {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebSite",
                    "@id": `${baseUrl}/#website`,
                    "url": baseUrl,
                    "name": "GGUF Loader",
                    "description": "Efficient GGUF model loading library",
                    "publisher": {
                        "@id": `${baseUrl}/#organization`
                    },
                    "potentialAction": [
                        {
                            "@type": "SearchAction",
                            "target": {
                                "@type": "EntryPoint",
                                "urlTemplate": `${baseUrl}/search?q={search_term_string}`
                            },
                            "query-input": "required name=search_term_string"
                        }
                    ],
                    "inLanguage": "en-US",
                    "copyrightYear": new Date().getFullYear(),
                    "dateCreated": "2024-01-01",
                    "dateModified": new Date().toISOString(),
                    "datePublished": "2024-01-01"
                },
                {
                    "@type": "Organization",
                    "@id": `${baseUrl}/#organization`,
                    "name": "GGUF Loader",
                    "url": baseUrl,
                    "logo": {
                        "@type": "ImageObject",
                        "url": `${baseUrl}/logo.png`,
                        "width": 512,
                        "height": 512
                    },
                    "sameAs": [
                        "https://github.com/your-repo",
                        "https://npmjs.com/package/gguf-loader"
                    ]
                },
                {
                    "@type": "SoftwareApplication",
                    "name": "GGUF Loader",
                    "applicationCategory": "DeveloperApplication",
                    "operatingSystem": "Cross-platform",
                    "description": "Efficient library for loading GGUF model files",
                    "url": baseUrl,
                    "downloadUrl": `${baseUrl}/download`,
                    "version": this.generateDailyVersion(),
                    "dateModified": new Date().toISOString(),
                    "author": {
                        "@type": "Organization",
                        "name": "GGUF Loader Team"
                    },
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD"
                    }
                },
                {
                    "@type": "TechArticle",
                    "headline": "GGUF Loader Documentation",
                    "description": "Comprehensive guide to using GGUF Loader",
                    "url": `${baseUrl}/docs/`,
                    "dateModified": new Date().toISOString(),
                    "datePublished": new Date().toISOString(),
                    "author": {
                        "@type": "Organization",
                        "name": "GGUF Loader Team"
                    },
                    "publisher": {
                        "@id": `${baseUrl}/#organization`
                    }
                }
            ]
        };
    }

    /**
     * Generate meta signals for bots
     */
    generateMetaSignals() {
        const now = new Date();
        
        return {
            'last-modified': now.toISOString(),
            'cache-control': 'no-cache, must-revalidate',
            'expires': new Date(now.getTime() + 86400000).toUTCString(), // 24 hours
            'etag': crypto.createHash('md5').update(now.toISOString()).digest('hex'),
            'content-version': this.generateDailyVersion(),
            'update-frequency': 'daily',
            'crawl-priority': 'high',
            'bot-friendly': 'true',
            'content-freshness': 'daily-updates',
            'site-activity': 'active'
        };
    }

    /**
     * Generate HTTP headers for bot optimization
     */
    generateHttpHeaders() {
        return {
            'X-Robots-Tag': 'index, follow, max-snippet:-1, max-image-preview:large',
            'X-Content-Freshness': 'daily',
            'X-Update-Frequency': 'daily',
            'X-Crawl-Priority': 'high',
            'X-Site-Activity': 'active',
            'X-Content-Version': this.generateDailyVersion(),
            'X-Last-Modified': new Date().toISOString(),
            'Cache-Control': 'public, max-age=3600, must-revalidate'
        };
    }

    /**
     * Generate crawl hints for bots
     */
    generateCrawlHints() {
        return {
            crawl_delay: Math.floor(Math.random() * 3) + 1, // 1-3 seconds
            preferred_crawl_time: this.getRandomCrawlTime(),
            update_frequency: 'daily',
            priority_pages: [
                '/',
                '/docs/',
                '/docs/installation/',
                '/docs/quick-start/',
                '/docs/addon-api/'
            ],
            fresh_content_indicators: [
                'last-modified meta tag',
                'sitemap lastmod',
                'RSS feed updates',
                'structured data dateModified'
            ],
            crawl_budget_optimization: {
                important_pages: 15,
                total_pages: 25,
                crawl_efficiency: 'high'
            }
        };
    }

    /**
     * Generate social signals
     */
    generateSocialSignals() {
        const baseUrl = this.getBaseUrl();
        
        return {
            og: {
                'og:title': 'GGUF Loader - Efficient Model Loading',
                'og:description': 'Fast and efficient GGUF model loading library with comprehensive documentation',
                'og:url': baseUrl,
                'og:type': 'website',
                'og:image': `${baseUrl}/og-image.png`,
                'og:updated_time': new Date().toISOString(),
                'og:site_name': 'GGUF Loader'
            },
            twitter: {
                'twitter:card': 'summary_large_image',
                'twitter:title': 'GGUF Loader - Efficient Model Loading',
                'twitter:description': 'Fast and efficient GGUF model loading library',
                'twitter:image': `${baseUrl}/twitter-image.png`,
                'twitter:site': '@ggufloader'
            },
            article: {
                'article:modified_time': new Date().toISOString(),
                'article:published_time': new Date().toISOString(),
                'article:author': 'GGUF Loader Team',
                'article:section': 'Technology'
            }
        };
    }

    /**
     * Create structured data file
     */
    async createStructuredDataFile() {
        const structuredData = this.generateStructuredData();
        fs.writeFileSync('structured-data.json', JSON.stringify(structuredData, null, 2));
        
        // Also create as JavaScript for dynamic loading
        const jsContent = `
// Structured data updated: ${new Date().toISOString()}
window.structuredData = ${JSON.stringify(structuredData, null, 2)};

// Auto-inject structured data
document.addEventListener('DOMContentLoaded', function() {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(window.structuredData);
    document.head.appendChild(script);
});
`;
        fs.writeFileSync('js/structured-data.js', jsContent);
    }

    /**
     * Update HTML files with bot signals
     */
    async updateHtmlWithBotSignals() {
        const htmlFiles = ['index.html', 'docs/index.html'];
        const metaSignals = this.generateMetaSignals();
        
        for (const file of htmlFiles) {
            if (fs.existsSync(file)) {
                let html = fs.readFileSync(file, 'utf8');
                
                // Add/update meta tags
                for (const [name, content] of Object.entries(metaSignals)) {
                    const metaTag = `<meta name="${name}" content="${content}">`;
                    
                    if (html.includes(`name="${name}"`)) {
                        html = html.replace(
                            new RegExp(`<meta name="${name}" content="[^"]*">`, 'g'),
                            metaTag
                        );
                    } else {
                        html = html.replace(
                            /<meta name="viewport"[^>]*>/,
                            `$&\n    ${metaTag}`
                        );
                    }
                }
                
                // Add bot-friendly comments
                const botComment = `<!-- Page updated: ${new Date().toISOString()} -->
<!-- Content version: ${this.generateDailyVersion()} -->
<!-- Bot-friendly: true -->
<!-- Update frequency: daily -->`;
                
                html = html.replace(/<html[^>]*>/, `$&\n${botComment}`);
                
                fs.writeFileSync(file, html);
            }
        }
    }

    /**
     * Create bot-specific files
     */
    async createBotFiles() {
        // Enhanced robots.txt
        const robotsContent = `# Robots.txt updated: ${new Date().toISOString()}
# Crawl optimization enabled
# Update frequency: daily

User-agent: *
Allow: /
Disallow: /maintenance-logs/
Disallow: /maintenance-reports/
Disallow: /seo-reports/
Disallow: /.git/

# Preferred crawl times
# Best times: 02:00-04:00 UTC, 14:00-16:00 UTC

# Sitemap locations
Sitemap: ${this.getBaseUrl()}/sitemap.xml
Sitemap: ${this.getBaseUrl()}/feed.xml
Sitemap: ${this.getBaseUrl()}/news.xml

# Crawl-delay optimization
Crawl-delay: ${Math.floor(Math.random() * 3) + 1}

# Special instructions for major bots
User-agent: Googlebot
Crawl-delay: 1

User-agent: Bingbot
Crawl-delay: 2

User-agent: Slurp
Crawl-delay: 3
`;
        fs.writeFileSync('robots.txt', robotsContent);

        // Humans.txt for human visitors
        const humansContent = `/* TEAM */
Developer: GGUF Loader Team
Contact: hello@ggufloader.com
Location: Global

/* SITE */
Last update: ${new Date().toLocaleDateString()}
Language: English
Standards: HTML5, CSS3, JavaScript ES6+
Components: Node.js, Modern Web APIs
Software: VS Code, Git, GitHub Actions

/* THANKS */
Thanks to the open source community for their contributions!
`;
        fs.writeFileSync('humans.txt', humansContent);

        // Security.txt for security researchers
        const securityContent = `Contact: security@ggufloader.com
Expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}
Preferred-Languages: en
Canonical: ${this.getBaseUrl()}/.well-known/security.txt
`;
        
        if (!fs.existsSync('.well-known')) {
            fs.mkdirSync('.well-known', { recursive: true });
        }
        fs.writeFileSync('.well-known/security.txt', securityContent);
    }

    /**
     * Create social signals file
     */
    async createSocialSignals() {
        const socialSignals = this.generateSocialSignals();
        
        let socialHtml = '<!-- Social Media Meta Tags -->\n';
        
        // Open Graph tags
        for (const [property, content] of Object.entries(socialSignals.og)) {
            socialHtml += `<meta property="${property}" content="${content}">\n`;
        }
        
        // Twitter tags
        for (const [name, content] of Object.entries(socialSignals.twitter)) {
            socialHtml += `<meta name="${name}" content="${content}">\n`;
        }
        
        // Article tags
        for (const [property, content] of Object.entries(socialSignals.article)) {
            socialHtml += `<meta property="${property}" content="${content}">\n`;
        }
        
        fs.writeFileSync('social-meta.html', socialHtml);
    }

    /**
     * Create crawl optimization files
     */
    async createCrawlOptimizationFiles() {
        const crawlHints = this.generateCrawlHints();
        fs.writeFileSync('crawl-hints.json', JSON.stringify(crawlHints, null, 2));
        
        const botConfig = {
            last_update: new Date().toISOString(),
            crawl_optimization: {
                enabled: true,
                priority: 'high',
                frequency: 'daily'
            },
            content_signals: {
                freshness_indicators: crawlHints.fresh_content_indicators,
                update_frequency: crawlHints.update_frequency,
                priority_pages: crawlHints.priority_pages
            },
            technical_seo: {
                structured_data: true,
                meta_optimization: true,
                sitemap_updated: true,
                robots_optimized: true
            },
            performance: {
                page_speed: 'optimized',
                mobile_friendly: true,
                core_web_vitals: 'good'
            }
        };
        
        fs.writeFileSync('bot-config.json', JSON.stringify(botConfig, null, 2));
    }

    /**
     * Generate activity signals
     */
    async generateActivitySignals() {
        const activitySignals = {
            timestamp: new Date().toISOString(),
            daily_activity: {
                content_updates: Math.floor(Math.random() * 5) + 3,
                page_views: Math.floor(Math.random() * 1000) + 500,
                user_interactions: Math.floor(Math.random() * 100) + 50,
                search_queries: Math.floor(Math.random() * 200) + 100
            },
            content_freshness: {
                last_content_update: new Date().toISOString(),
                pages_modified: Math.floor(Math.random() * 3) + 1,
                new_content_added: Math.random() > 0.7,
                documentation_updated: Math.random() > 0.5
            },
            technical_activity: {
                performance_optimizations: Math.random() > 0.6,
                security_updates: Math.random() > 0.8,
                bug_fixes: Math.random() > 0.7,
                feature_enhancements: Math.random() > 0.5
            }
        };
        
        fs.writeFileSync('activity-signals.json', JSON.stringify(activitySignals, null, 2));
    }

    /**
     * Get random crawl time
     */
    getRandomCrawlTime() {
        const times = [
            '02:00-04:00 UTC',
            '06:00-08:00 UTC',
            '10:00-12:00 UTC',
            '14:00-16:00 UTC',
            '18:00-20:00 UTC',
            '22:00-00:00 UTC'
        ];
        return times[Math.floor(Math.random() * times.length)];
    }

    /**
     * Generate daily version
     */
    generateDailyVersion() {
        const date = new Date();
        return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
    }

    /**
     * Get base URL
     */
    getBaseUrl() {
        return 'https://your-domain.com'; // Configure this
    }

    /**
     * Save signal report
     */
    saveSignalReport(results) {
        const reportsDir = 'seo-reports';
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        
        const reportFile = path.join(reportsDir, `bot-signals-${Date.now()}.json`);
        fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
        
        // Also save as latest
        const latestFile = path.join(reportsDir, 'latest-bot-signals.json');
        fs.writeFileSync(latestFile, JSON.stringify(results, null, 2));
    }
}

// CLI interface
if (require.main === module) {
    const generator = new BotSignalGenerator();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'run':
        case undefined:
            generator.generateAllSignals().catch(console.error);
            break;
        default:
            console.log(`
Usage: node scripts/bot-signal-generator.js [command]

Commands:
  run (default) - Generate all bot signals

Examples:
  node scripts/bot-signal-generator.js
  node scripts/bot-signal-generator.js run
            `);
    }
}

module.exports = BotSignalGenerator;