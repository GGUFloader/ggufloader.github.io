/**
 * Internal Link Reporter
 * Generates reports for ongoing SEO optimization and link analysis
 */

class InternalLinkReporter {
    constructor() {
        this.links = [];
        this.pageData = {};
        this.init();
    }

    init() {
        this.analyzeCurrentPage();
        this.generateReport();
    }

    analyzeCurrentPage() {
        const currentUrl = window.location.pathname;
        const currentTitle = document.title;
        
        this.pageData = {
            url: currentUrl,
            title: currentTitle,
            lastAnalyzed: new Date().toISOString(),
            internalLinks: [],
            externalLinks: [],
            brokenLinks: [],
            linkMetrics: {}
        };

        // Analyze all links on the page
        const allLinks = document.querySelectorAll('a[href]');
        
        allLinks.forEach((link, index) => {
            const href = link.getAttribute('href');
            const text = link.textContent.trim();
            const title = link.getAttribute('title') || '';
            
            const linkData = {
                id: `link-${index}`,
                href: href,
                text: text,
                title: title,
                isInternal: this.isInternalLink(href),
                isDescriptive: this.isDescriptiveText(text),
                hasTitle: !!title,
                element: link,
                context: this.getLinkContext(link),
                section: this.getLinkSection(link),
                priority: this.calculateLinkPriority(link, href)
            };

            if (linkData.isInternal) {
                this.pageData.internalLinks.push(linkData);
            } else {
                this.pageData.externalLinks.push(linkData);
            }

            this.links.push(linkData);
        });

        // Calculate link metrics
        this.calculateLinkMetrics();
    }

    isInternalLink(href) {
        if (!href) return false;
        return href.startsWith('/') || 
               href.startsWith('#') || 
               href.includes('ggufloader.github.io') ||
               (!href.includes('://') && !href.startsWith('mailto:'));
    }

    isDescriptiveText(text) {
        if (!text || text.length < 3) return false;
        
        const genericTexts = [
            'click here', 'read more', 'learn more', 'here', 'link', 
            'more', 'this', 'page', 'site', 'website'
        ];
        
        return !genericTexts.includes(text.toLowerCase());
    }

    getLinkContext(link) {
        const parent = link.closest('article, section, div, p');
        if (!parent) return 'unknown';
        
        // Try to find a heading or identifier
        const heading = parent.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading) {
            return heading.textContent.trim();
        }
        
        // Check for ID or class that might indicate context
        if (parent.id) {
            return parent.id;
        }
        
        if (parent.className) {
            const relevantClasses = parent.className.split(' ')
                .filter(cls => cls.includes('section') || cls.includes('content') || cls.includes('feature'));
            if (relevantClasses.length > 0) {
                return relevantClasses[0];
            }
        }
        
        return 'content';
    }

    getLinkSection(link) {
        const sections = [
            { selector: '#features', name: 'Features' },
            { selector: '#how-to', name: 'How-To' },
            { selector: '#faq', name: 'FAQ' },
            { selector: '#model-comparison', name: 'Model Comparison' },
            { selector: '#roadmap', name: 'Roadmap' },
            { selector: '#contact', name: 'Contact' },
            { selector: 'nav', name: 'Navigation' },
            { selector: 'header', name: 'Header' },
            { selector: 'footer', name: 'Footer' },
            { selector: '.docs-content', name: 'Documentation' },
            { selector: 'main', name: 'Main Content' }
        ];

        for (const section of sections) {
            if (link.closest(section.selector)) {
                return section.name;
            }
        }

        return 'Other';
    }

    calculateLinkPriority(link, href) {
        let priority = 1;

        // High priority for documentation links
        if (href.includes('/docs/')) {
            priority += 3;
        }

        // High priority for homepage sections
        if (href.startsWith('/#')) {
            priority += 2;
        }

        // Boost for navigation links
        if (link.closest('nav')) {
            priority += 2;
        }

        // Boost for descriptive anchor text
        if (this.isDescriptiveText(link.textContent)) {
            priority += 1;
        }

        // Boost for links with title attributes
        if (link.getAttribute('title')) {
            priority += 1;
        }

        return Math.min(priority, 10); // Cap at 10
    }

    calculateLinkMetrics() {
        const metrics = {
            totalLinks: this.links.length,
            internalLinks: this.pageData.internalLinks.length,
            externalLinks: this.pageData.externalLinks.length,
            descriptiveLinks: this.links.filter(link => link.isDescriptive).length,
            linksWithTitles: this.links.filter(link => link.hasTitle).length,
            averageLinkTextLength: 0,
            linksBySection: {},
            linksByPriority: {},
            seoScore: 0
        };

        // Calculate average link text length
        const totalTextLength = this.links.reduce((sum, link) => sum + link.text.length, 0);
        metrics.averageLinkTextLength = totalTextLength / this.links.length;

        // Group links by section
        this.links.forEach(link => {
            const section = link.section;
            if (!metrics.linksBySection[section]) {
                metrics.linksBySection[section] = 0;
            }
            metrics.linksBySection[section]++;
        });

        // Group links by priority
        this.links.forEach(link => {
            const priority = link.priority;
            if (!metrics.linksByPriority[priority]) {
                metrics.linksByPriority[priority] = 0;
            }
            metrics.linksByPriority[priority]++;
        });

        // Calculate SEO score (0-100)
        let seoScore = 0;
        
        // Descriptive text score (30 points max)
        const descriptiveRatio = metrics.descriptiveLinks / metrics.totalLinks;
        seoScore += descriptiveRatio * 30;
        
        // Internal linking score (25 points max)
        const internalRatio = metrics.internalLinks / metrics.totalLinks;
        seoScore += Math.min(internalRatio * 40, 25); // Cap at 25 points
        
        // Title attribute score (20 points max)
        const titleRatio = metrics.linksWithTitles / metrics.totalLinks;
        seoScore += titleRatio * 20;
        
        // Link text length score (15 points max)
        const idealLength = 25; // Ideal link text length
        const lengthScore = Math.max(0, 15 - Math.abs(metrics.averageLinkTextLength - idealLength));
        seoScore += lengthScore;
        
        // Link distribution score (10 points max)
        const sectionCount = Object.keys(metrics.linksBySection).length;
        seoScore += Math.min(sectionCount * 2, 10);

        metrics.seoScore = Math.round(seoScore);
        this.pageData.linkMetrics = metrics;
    }

    generateReport() {
        const report = {
            pageInfo: {
                url: this.pageData.url,
                title: this.pageData.title,
                analyzedAt: this.pageData.lastAnalyzed
            },
            metrics: this.pageData.linkMetrics,
            recommendations: this.generateRecommendations(),
            linkDetails: {
                internal: this.pageData.internalLinks,
                external: this.pageData.externalLinks
            }
        };

        // Store report in localStorage for debugging
        localStorage.setItem('linkAnalysisReport', JSON.stringify(report, null, 2));
        
        // Log summary to console
        this.logReportSummary(report);
        
        return report;
    }

    generateRecommendations() {
        const recommendations = [];
        const metrics = this.pageData.linkMetrics;

        // Check descriptive link text
        const nonDescriptiveLinks = this.links.filter(link => !link.isDescriptive);
        if (nonDescriptiveLinks.length > 0) {
            recommendations.push({
                type: 'descriptive-text',
                priority: 'high',
                message: `${nonDescriptiveLinks.length} links have non-descriptive anchor text`,
                details: nonDescriptiveLinks.map(link => ({
                    text: link.text,
                    href: link.href,
                    suggestion: this.suggestBetterAnchorText(link.href)
                }))
            });
        }

        // Check for missing title attributes
        const linksWithoutTitles = this.pageData.internalLinks.filter(link => !link.hasTitle);
        if (linksWithoutTitles.length > 0) {
            recommendations.push({
                type: 'missing-titles',
                priority: 'medium',
                message: `${linksWithoutTitles.length} internal links missing title attributes`,
                details: linksWithoutTitles.slice(0, 5) // Show first 5
            });
        }

        // Check link distribution
        const sectionCounts = metrics.linksBySection;
        const unevenDistribution = Object.values(sectionCounts).some(count => count > metrics.totalLinks * 0.5);
        if (unevenDistribution) {
            recommendations.push({
                type: 'link-distribution',
                priority: 'low',
                message: 'Links are unevenly distributed across page sections',
                details: sectionCounts
            });
        }

        // Check for opportunities to add more internal links
        if (metrics.internalLinks < 5 && this.pageData.url !== '/') {
            recommendations.push({
                type: 'internal-linking',
                priority: 'high',
                message: 'Consider adding more internal links to improve site navigation',
                details: 'Add contextual links to related pages and sections'
            });
        }

        // SEO score recommendations
        if (metrics.seoScore < 70) {
            recommendations.push({
                type: 'seo-score',
                priority: 'medium',
                message: `SEO score is ${metrics.seoScore}/100. Focus on improving link quality`,
                details: 'Improve anchor text, add title attributes, and ensure good link distribution'
            });
        }

        return recommendations;
    }

    suggestBetterAnchorText(href) {
        const suggestions = {
            '/docs/installation/': 'Complete installation guide',
            '/docs/quick-start/': 'Quick start tutorial',
            '/docs/addon-development/': 'Addon development guide',
            '/docs/addon-api/': 'API reference documentation',
            '/docs/smart-floater-example/': 'Smart Floater example',
            '/docs/package-structure/': 'Package structure documentation',
            '/docs/': 'Documentation hub',
            '/': 'GGUF Loader homepage',
            '/#features': 'Explore features',
            '/#how-to': 'View how-to guides',
            '/#faq': 'Read frequently asked questions',
            '/#model-comparison': 'Compare AI models'
        };

        return suggestions[href] || 'Descriptive link text needed';
    }

    logReportSummary(report) {
        console.group('🔗 Internal Link Analysis Report');
        console.log('📄 Page:', report.pageInfo.title);
        console.log('🔗 Total Links:', report.metrics.totalLinks);
        console.log('🏠 Internal Links:', report.metrics.internalLinks);
        console.log('🌐 External Links:', report.metrics.externalLinks);
        console.log('📝 Descriptive Links:', report.metrics.descriptiveLinks);
        console.log('🏷️ Links with Titles:', report.metrics.linksWithTitles);
        console.log('📊 SEO Score:', report.metrics.seoScore + '/100');
        
        if (report.recommendations.length > 0) {
            console.group('💡 Recommendations');
            report.recommendations.forEach(rec => {
                console.log(`${rec.priority.toUpperCase()}: ${rec.message}`);
            });
            console.groupEnd();
        }
        
        console.log('📋 Full report available in localStorage as "linkAnalysisReport"');
        console.groupEnd();
    }

    // Public method to get current report
    getReport() {
        return JSON.parse(localStorage.getItem('linkAnalysisReport') || '{}');
    }

    // Public method to export report
    exportReport() {
        const report = this.getReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `link-analysis-${window.location.pathname.replace(/\//g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize link reporter when DOM is ready (only in development/testing)
document.addEventListener('DOMContentLoaded', function() {
    // Only run in development or when explicitly requested
    if (window.location.hostname === 'localhost' || 
        window.location.search.includes('analyze-links=true') ||
        localStorage.getItem('enableLinkAnalysis') === 'true') {
        
        new InternalLinkReporter();
        
        // Add global function to export report
        window.exportLinkReport = function() {
            const reporter = new InternalLinkReporter();
            reporter.exportReport();
        };
        
        console.log('🔗 Link analysis enabled. Use exportLinkReport() to download report.');
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InternalLinkReporter;
}