/**
 * Content Relationship Analyzer
 * Analyzes content similarity between homepage sections and documentation pages
 * Provides relevance scoring for cross-page content recommendations
 */

class ContentRelationshipAnalyzer {
    constructor() {
        this.contentMap = new Map();
        this.keywordWeights = {
            title: 3.0,
            heading: 2.5,
            description: 2.0,
            content: 1.0,
            tags: 1.5
        };
        this.stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
            'this', 'that', 'these', 'those', 'you', 'your', 'we', 'our', 'it', 'its'
        ]);
        this.initialized = false;
    }

    /**
     * Initialize the analyzer with content from both homepage and documentation
     */
    async initialize() {
        if (this.initialized) return;
        
        try {
            await this.analyzeHomepageContent();
            await this.analyzeDocumentationContent();
            this.initialized = true;
            console.log('Content Relationship Analyzer initialized');
        } catch (error) {
            console.error('Failed to initialize Content Relationship Analyzer:', error);
        }
    }

    /**
     * Analyze homepage content sections
     */
    async analyzeHomepageContent() {
        const homepageContent = {
            hero: this.extractHeroContent(),
            features: this.extractFeaturesContent(),
            howTo: this.extractHowToContent(),
            faq: this.extractFAQContent(),
            models: this.extractModelsContent(),
            testimonials: this.extractTestimonialsContent()
        };

        for (const [section, content] of Object.entries(homepageContent)) {
            if (content) {
                this.contentMap.set(`homepage-${section}`, {
                    type: 'homepage',
                    section: section,
                    ...content,
                    keywords: this.extractKeywords(content),
                    url: `/#${section}`
                });
            }
        }
    }

    /**
     * Analyze documentation content
     */
    async analyzeDocumentationContent() {
        const docPages = [
            { path: '/docs/installation/', file: '_docs/installation.md' },
            { path: '/docs/quick-start/', file: '_docs/quick-start.md' },
            { path: '/docs/addon-development/', file: '_docs/addon-development.md' },
            { path: '/docs/addon-api/', file: '_docs/addon-api.md' },
            { path: '/docs/smart-floater-example/', file: '_docs/smart-floater-example.md' },
            { path: '/docs/package-structure/', file: '_docs/package-structure.md' }
        ];

        for (const doc of docPages) {
            try {
                const content = await this.fetchDocumentationContent(doc.file);
                if (content) {
                    this.contentMap.set(doc.path, {
                        type: 'documentation',
                        path: doc.path,
                        ...content,
                        keywords: this.extractKeywords(content),
                        url: doc.path
                    });
                }
            } catch (error) {
                console.warn(`Failed to analyze ${doc.file}:`, error);
            }
        }
    }

    /**
     * Extract hero section content
     */
    extractHeroContent() {
        const heroSection = document.querySelector('.hero, .hero-section');
        if (!heroSection) return null;

        return {
            title: this.getTextContent(heroSection.querySelector('h1')),
            description: this.getTextContent(heroSection.querySelector('.hero-description, .hero-subtitle')),
            content: this.getTextContent(heroSection),
            tags: ['getting-started', 'overview', 'introduction']
        };
    }

    /**
     * Extract features section content
     */
    extractFeaturesContent() {
        const featuresSection = document.querySelector('#features, .features');
        if (!featuresSection) return null;

        const features = Array.from(featuresSection.querySelectorAll('.feature-card, .feature-item'))
            .map(card => ({
                title: this.getTextContent(card.querySelector('h3, h4')),
                description: this.getTextContent(card.querySelector('p, .feature-description'))
            }));

        return {
            title: 'Features',
            description: 'Core features and capabilities',
            content: features.map(f => `${f.title} ${f.description}`).join(' '),
            features: features,
            tags: ['features', 'capabilities', 'functionality']
        };
    }

    /**
     * Extract how-to section content
     */
    extractHowToContent() {
        const howToSection = document.querySelector('#how-to, .how-to');
        if (!howToSection) return null;

        return {
            title: 'How To Use',
            description: this.getTextContent(howToSection.querySelector('p, .section-description')),
            content: this.getTextContent(howToSection),
            tags: ['tutorial', 'guide', 'instructions', 'usage']
        };
    }

    /**
     * Extract FAQ content
     */
    extractFAQContent() {
        const faqSection = document.querySelector('#faq, .faq');
        if (!faqSection) return null;

        const faqs = Array.from(faqSection.querySelectorAll('.faq-item, .question'))
            .map(item => ({
                question: this.getTextContent(item.querySelector('.question, h3, h4')),
                answer: this.getTextContent(item.querySelector('.answer, p'))
            }));

        return {
            title: 'Frequently Asked Questions',
            description: 'Common questions and answers',
            content: faqs.map(f => `${f.question} ${f.answer}`).join(' '),
            faqs: faqs,
            tags: ['faq', 'questions', 'help', 'support']
        };
    }

    /**
     * Extract models section content
     */
    extractModelsContent() {
        const modelsSection = document.querySelector('#models, .models');
        if (!modelsSection) return null;

        return {
            title: 'Models',
            description: 'Supported AI models and formats',
            content: this.getTextContent(modelsSection),
            tags: ['models', 'gguf', 'ai', 'llama', 'mistral']
        };
    }

    /**
     * Extract testimonials content
     */
    extractTestimonialsContent() {
        const testimonialsSection = document.querySelector('#testimonials, .testimonials');
        if (!testimonialsSection) return null;

        return {
            title: 'Testimonials',
            description: 'User experiences and feedback',
            content: this.getTextContent(testimonialsSection),
            tags: ['testimonials', 'reviews', 'feedback', 'users']
        };
    }

    /**
     * Fetch documentation content (simulated - in real implementation would fetch from server)
     */
    async fetchDocumentationContent(filePath) {
        // In a real implementation, this would fetch the actual markdown content
        // For now, we'll extract from the existing DOM if available
        const docPath = filePath.replace('_docs/', 'docs/').replace('.md', '/');
        
        // Try to get content from existing DOM elements or return mock data
        return this.getMockDocumentationContent(filePath);
    }

    /**
     * Get mock documentation content based on file path
     */
    getMockDocumentationContent(filePath) {
        const mockContent = {
            '_docs/installation.md': {
                title: 'Installation Guide',
                description: 'Complete guide to installing GGUF Loader on Windows, macOS, and Linux systems',
                content: 'installation setup python pip requirements system dependencies',
                tags: ['installation', 'setup', 'getting-started', 'python', 'pip']
            },
            '_docs/quick-start.md': {
                title: 'Quick Start Guide',
                description: 'Get up and running with GGUF Loader in just a few minutes',
                content: 'quick start tutorial first steps model loading chat assistant',
                tags: ['quick-start', 'tutorial', 'beginner', 'getting-started']
            },
            '_docs/addon-development.md': {
                title: 'Addon Development',
                description: 'Create custom GGUF Loader addons',
                content: 'addon development api python custom extensions plugins',
                tags: ['development', 'addon', 'api', 'python', 'extensions']
            },
            '_docs/addon-api.md': {
                title: 'Addon API Reference',
                description: 'Complete API reference for developing GGUF Loader addons',
                content: 'api reference documentation methods classes functions development',
                tags: ['api', 'reference', 'development', 'documentation']
            },
            '_docs/smart-floater-example.md': {
                title: 'Smart Floater Example',
                description: 'Learn from the built-in addon example',
                content: 'smart floater addon example implementation tutorial code',
                tags: ['example', 'smart-floater', 'addon', 'tutorial']
            },
            '_docs/package-structure.md': {
                title: 'Package Structure',
                description: 'Understanding GGUF Loader\'s architecture',
                content: 'package structure architecture technical implementation details',
                tags: ['architecture', 'structure', 'technical', 'advanced']
            }
        };

        return mockContent[filePath] || null;
    }

    /**
     * Extract keywords from content
     */
    extractKeywords(content) {
        const text = `${content.title || ''} ${content.description || ''} ${content.content || ''} ${(content.tags || []).join(' ')}`;
        
        return this.tokenizeAndWeight(text)
            .filter(([word]) => !this.stopWords.has(word.toLowerCase()) && word.length > 2)
            .slice(0, 20); // Top 20 keywords
    }

    /**
     * Tokenize text and assign weights
     */
    tokenizeAndWeight(text) {
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 0);

        const wordCounts = new Map();
        words.forEach(word => {
            wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        });

        return Array.from(wordCounts.entries())
            .sort((a, b) => b[1] - a[1]);
    }

    /**
     * Calculate similarity score between two content items
     */
    calculateSimilarity(content1, content2) {
        const keywords1 = new Set(content1.keywords.map(([word]) => word));
        const keywords2 = new Set(content2.keywords.map(([word]) => word));
        
        const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
        const union = new Set([...keywords1, ...keywords2]);
        
        // Jaccard similarity
        const jaccardSimilarity = intersection.size / union.size;
        
        // Tag similarity bonus
        const tags1 = new Set(content1.tags || []);
        const tags2 = new Set(content2.tags || []);
        const tagIntersection = new Set([...tags1].filter(x => tags2.has(x)));
        const tagBonus = tagIntersection.size > 0 ? 0.2 : 0;
        
        return Math.min(jaccardSimilarity + tagBonus, 1.0);
    }

    /**
     * Get related content for a given page or section
     */
    getRelatedContent(currentPath, maxResults = 5) {
        if (!this.initialized) {
            console.warn('Analyzer not initialized');
            return [];
        }

        const currentContent = this.contentMap.get(currentPath);
        if (!currentContent) {
            console.warn(`Content not found for path: ${currentPath}`);
            return [];
        }

        const similarities = [];
        
        for (const [path, content] of this.contentMap.entries()) {
            if (path === currentPath) continue;
            
            const similarity = this.calculateSimilarity(currentContent, content);
            if (similarity > 0.1) { // Minimum similarity threshold
                similarities.push({
                    path,
                    content,
                    similarity,
                    title: content.title,
                    description: content.description,
                    url: content.url,
                    type: content.type
                });
            }
        }

        return similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, maxResults);
    }

    /**
     * Get content suggestions based on keywords
     */
    getContentSuggestions(keywords, currentPath = null, maxResults = 5) {
        if (!this.initialized) {
            console.warn('Analyzer not initialized');
            return [];
        }

        const keywordSet = new Set(keywords.map(k => k.toLowerCase()));
        const suggestions = [];

        for (const [path, content] of this.contentMap.entries()) {
            if (path === currentPath) continue;

            let score = 0;
            const contentKeywords = content.keywords.map(([word]) => word.toLowerCase());
            
            // Calculate keyword match score
            for (const keyword of keywordSet) {
                if (contentKeywords.includes(keyword)) {
                    score += 1;
                }
            }

            // Tag match bonus
            const contentTags = (content.tags || []).map(t => t.toLowerCase());
            for (const keyword of keywordSet) {
                if (contentTags.includes(keyword)) {
                    score += 0.5;
                }
            }

            if (score > 0) {
                suggestions.push({
                    path,
                    content,
                    score,
                    title: content.title,
                    description: content.description,
                    url: content.url,
                    type: content.type
                });
            }
        }

        return suggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults);
    }

    /**
     * Utility function to get text content safely
     */
    getTextContent(element) {
        return element ? element.textContent.trim() : '';
    }

    /**
     * Get content map for debugging
     */
    getContentMap() {
        return this.contentMap;
    }
}

// Export for use in other modules
window.ContentRelationshipAnalyzer = ContentRelationshipAnalyzer;