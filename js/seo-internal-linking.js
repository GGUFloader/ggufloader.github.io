/**
 * SEO-Friendly Internal Linking System
 * Implements descriptive anchor text, logical link hierarchy, and structured data
 */

class SEOInternalLinking {
    constructor() {
        this.linkMappings = this.initializeLinkMappings();
        this.pageRelationships = this.initializePageRelationships();
        this.init();
    }

    initializeLinkMappings() {
        return {
            // Homepage sections to documentation mappings
            'features': {
                'addon-system': {
                    url: '/docs/addon-development/',
                    anchor: 'Learn how to create custom addons for GGUF Loader',
                    context: 'addon development guide'
                },
                'smart-floater': {
                    url: '/docs/smart-floater-example/',
                    anchor: 'Explore the Smart Floating Assistant implementation',
                    context: 'Smart Floater example documentation'
                },
                'api-integration': {
                    url: '/docs/addon-api/',
                    anchor: 'View complete API reference for developers',
                    context: 'comprehensive API documentation'
                },
                'installation': {
                    url: '/docs/installation/',
                    anchor: 'Get detailed installation instructions',
                    context: 'complete installation guide'
                }
            },
            'how-to': {
                'installation-steps': {
                    url: '/docs/installation/',
                    anchor: 'Follow the complete installation guide',
                    context: 'step-by-step installation instructions'
                },
                'quick-start': {
                    url: '/docs/quick-start/',
                    anchor: 'Get started with GGUF Loader in minutes',
                    context: 'quick start tutorial'
                },
                'model-loading': {
                    url: '/docs/quick-start/#model-loading',
                    anchor: 'Learn how to load and run AI models',
                    context: 'model loading instructions'
                }
            },
            'faq': {
                'installation-help': {
                    url: '/docs/installation/#troubleshooting',
                    anchor: 'Find solutions in our installation troubleshooting guide',
                    context: 'installation troubleshooting documentation'
                },
                'addon-development': {
                    url: '/docs/addon-development/',
                    anchor: 'Learn addon development with our comprehensive guide',
                    context: 'addon development tutorial'
                },
                'api-reference': {
                    url: '/docs/addon-api/',
                    anchor: 'Explore the complete API reference',
                    context: 'detailed API documentation'
                }
            },
            'download': {
                'installation-guide': {
                    url: '/docs/installation/',
                    anchor: 'View complete installation instructions',
                    context: 'detailed installation guide'
                },
                'quick-start': {
                    url: '/docs/quick-start/',
                    anchor: 'Get started immediately with our quick start guide',
                    context: 'quick start tutorial'
                }
            }
        };
    }

    initializePageRelationships() {
        return {
            '/': {
                title: 'GGUF Loader - Enterprise-Grade Local AI Platform',
                type: 'homepage',
                relatedPages: [
                    '/docs/installation/',
                    '/docs/quick-start/',
                    '/docs/addon-development/'
                ]
            },
            '/docs/': {
                title: 'Documentation Hub',
                type: 'documentation-hub',
                relatedPages: [
                    '/',
                    '/docs/installation/',
                    '/docs/quick-start/'
                ]
            },
            '/docs/installation/': {
                title: 'Installation Guide',
                type: 'documentation',
                category: 'getting-started',
                relatedPages: [
                    '/',
                    '/docs/quick-start/',
                    '/docs/'
                ]
            },
            '/docs/quick-start/': {
                title: 'Quick Start Guide',
                type: 'documentation',
                category: 'getting-started',
                relatedPages: [
                    '/',
                    '/docs/installation/',
                    '/docs/addon-development/'
                ]
            },
            '/docs/addon-development/': {
                title: 'Addon Development Guide',
                type: 'documentation',
                category: 'development',
                relatedPages: [
                    '/',
                    '/docs/addon-api/',
                    '/docs/smart-floater-example/'
                ]
            },
            '/docs/addon-api/': {
                title: 'API Reference',
                type: 'documentation',
                category: 'development',
                relatedPages: [
                    '/',
                    '/docs/addon-development/',
                    '/docs/smart-floater-example/'
                ]
            },
            '/docs/smart-floater-example/': {
                title: 'Smart Floater Example',
                type: 'documentation',
                category: 'examples',
                relatedPages: [
                    '/',
                    '/docs/addon-development/',
                    '/docs/addon-api/'
                ]
            },
            '/docs/package-structure/': {
                title: 'Package Structure',
                type: 'documentation',
                category: 'advanced',
                relatedPages: [
                    '/',
                    '/docs/addon-development/',
                    '/docs/'
                ]
            }
        };
    }

    init() {
        this.enhanceExistingLinks();
        this.addContextualLinks();
        this.generateStructuredData();
        this.optimizeLinkHierarchy();
    }

    enhanceExistingLinks() {
        const links = document.querySelectorAll('a[href]');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            const currentText = link.textContent.trim();
            
            // Skip if link already has descriptive text or is an image
            if (currentText.length > 20 || link.querySelector('img') || link.classList.contains('enhanced-link')) {
                return;
            }

            // Enhance internal links with descriptive anchor text
            if (this.isInternalLink(href)) {
                const enhancedText = this.getDescriptiveAnchorText(href, currentText);
                if (enhancedText && enhancedText !== currentText) {
                    link.textContent = enhancedText;
                    link.classList.add('enhanced-link');
                    
                    // Add title attribute for additional context
                    const context = this.getLinkContext(href);
                    if (context) {
                        link.setAttribute('title', context);
                    }
                }
            }
        });
    }

    addContextualLinks() {
        const currentPath = window.location.pathname;
        const currentPage = this.pageRelationships[currentPath];
        
        if (!currentPage) return;

        // Add contextual links based on page type and content
        this.addHomepageContextualLinks();
        this.addDocumentationContextualLinks();
        this.addCrossReferenceLinks();
    }

    addHomepageContextualLinks() {
        if (window.location.pathname !== '/') return;

        // Add links to features section
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            this.enhanceFeaturesSection(featuresSection);
        }

        // Add links to how-to section
        const howToSection = document.getElementById('how-to');
        if (howToSection) {
            this.enhanceHowToSection(howToSection);
        }

        // Add links to FAQ section
        const faqSection = document.getElementById('faq');
        if (faqSection) {
            this.enhanceFAQSection(faqSection);
        }

        // Add links to download section
        const downloadSection = document.querySelector('.download-section, #download');
        if (downloadSection) {
            this.enhanceDownloadSection(downloadSection);
        }
    }

    enhanceFeaturesSection(section) {
        const featureItems = section.querySelectorAll('.feature-item, .feature-card');
        
        featureItems.forEach(item => {
            const title = item.querySelector('h3, h4, .feature-title');
            if (!title) return;

            const titleText = title.textContent.toLowerCase();
            
            // Add relevant documentation links based on feature content
            if (titleText.includes('addon') || titleText.includes('extension')) {
                this.addContextualLink(item, {
                    url: '/docs/addon-development/',
                    text: 'Learn addon development',
                    context: 'Complete guide to creating custom addons'
                });
            }
            
            if (titleText.includes('smart') || titleText.includes('floater') || titleText.includes('assistant')) {
                this.addContextualLink(item, {
                    url: '/docs/smart-floater-example/',
                    text: 'Explore Smart Floater implementation',
                    context: 'Detailed Smart Floating Assistant example'
                });
            }
            
            if (titleText.includes('api') || titleText.includes('integration')) {
                this.addContextualLink(item, {
                    url: '/docs/addon-api/',
                    text: 'View API reference',
                    context: 'Complete API documentation for developers'
                });
            }
        });
    }

    enhanceHowToSection(section) {
        const steps = section.querySelectorAll('.step, .how-to-item, li');
        
        steps.forEach(step => {
            const content = step.textContent.toLowerCase();
            
            if (content.includes('install') || content.includes('setup')) {
                this.addContextualLink(step, {
                    url: '/docs/installation/',
                    text: 'View detailed installation guide',
                    context: 'Complete installation instructions for all platforms'
                });
            }
            
            if (content.includes('start') || content.includes('begin') || content.includes('first')) {
                this.addContextualLink(step, {
                    url: '/docs/quick-start/',
                    text: 'Follow our quick start guide',
                    context: 'Get up and running in minutes'
                });
            }
        });
    }

    enhanceFAQSection(section) {
        const faqItems = section.querySelectorAll('.faq-item, .faq-question, dt, .accordion-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.question, dt, .accordion-header') || item;
            const answer = item.querySelector('.answer, dd, .accordion-content') || item.nextElementSibling;
            
            if (!answer) return;

            const questionText = question.textContent.toLowerCase();
            const answerText = answer.textContent.toLowerCase();
            
            // Add relevant links based on FAQ content
            if (questionText.includes('install') || answerText.includes('install')) {
                this.addContextualLink(answer, {
                    url: '/docs/installation/',
                    text: 'Read our comprehensive installation guide',
                    context: 'Detailed installation instructions and troubleshooting'
                });
            }
            
            if (questionText.includes('addon') || answerText.includes('addon')) {
                this.addContextualLink(answer, {
                    url: '/docs/addon-development/',
                    text: 'Learn about addon development',
                    context: 'Complete guide to creating custom addons'
                });
            }
            
            if (questionText.includes('api') || answerText.includes('api')) {
                this.addContextualLink(answer, {
                    url: '/docs/addon-api/',
                    text: 'Explore our API documentation',
                    context: 'Complete API reference for developers'
                });
            }
        });
    }

    enhanceDownloadSection(section) {
        const downloadItems = section.querySelectorAll('.download-item, .download-option');
        
        downloadItems.forEach(item => {
            // Add installation guide link
            this.addContextualLink(item, {
                url: '/docs/installation/',
                text: 'View installation instructions',
                context: 'Complete setup guide for your platform'
            });
            
            // Add quick start link
            this.addContextualLink(item, {
                url: '/docs/quick-start/',
                text: 'Get started quickly',
                context: 'Quick start tutorial and first steps'
            });
        });
    }

    addDocumentationContextualLinks() {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/docs/')) return;

        // Add "Back to Homepage" links in documentation
        this.addHomepageReturnLinks();
        
        // Add related documentation links
        this.addRelatedDocumentationLinks();
        
        // Add "What's Next" sections
        this.addWhatsNextSections();
    }

    addHomepageReturnLinks() {
        const content = document.querySelector('.docs-content, .documentation-content, main');
        if (!content) return;

        // Add contextual homepage links based on documentation type
        const currentPath = window.location.pathname;
        let homepageSection = '';
        let linkText = 'Return to homepage';
        let context = 'GGUF Loader homepage';

        if (currentPath.includes('installation')) {
            homepageSection = '#download';
            linkText = 'Explore download options on homepage';
            context = 'View download section and model information';
        } else if (currentPath.includes('quick-start')) {
            homepageSection = '#how-to';
            linkText = 'See more guides on homepage';
            context = 'View how-to section and additional resources';
        } else if (currentPath.includes('addon')) {
            homepageSection = '#features';
            linkText = 'Discover addon features on homepage';
            context = 'View addon system features and capabilities';
        }

        const homepageLink = this.createContextualLink({
            url: '/' + homepageSection,
            text: linkText,
            context: context,
            className: 'homepage-return-link'
        });

        // Insert at the beginning of content
        content.insertBefore(homepageLink, content.firstChild);
    }

    addRelatedDocumentationLinks() {
        const currentPath = window.location.pathname;
        const currentPage = this.pageRelationships[currentPath];
        
        if (!currentPage || !currentPage.relatedPages) return;

        const relatedSection = document.createElement('section');
        relatedSection.className = 'related-documentation';
        relatedSection.innerHTML = `
            <h3>Related Documentation</h3>
            <ul class="related-links"></ul>
        `;

        const relatedList = relatedSection.querySelector('.related-links');
        
        currentPage.relatedPages.forEach(pagePath => {
            const relatedPage = this.pageRelationships[pagePath];
            if (!relatedPage) return;

            const listItem = document.createElement('li');
            const link = this.createContextualLink({
                url: pagePath,
                text: `Explore ${relatedPage.title}`,
                context: `Learn more about ${relatedPage.title.toLowerCase()}`,
                className: 'related-doc-link'
            });
            
            listItem.appendChild(link);
            relatedList.appendChild(listItem);
        });

        // Insert before footer or at end of content
        const content = document.querySelector('.docs-content, .documentation-content, main');
        const footer = document.querySelector('footer');
        
        if (content) {
            if (footer) {
                content.insertBefore(relatedSection, footer);
            } else {
                content.appendChild(relatedSection);
            }
        }
    }

    addWhatsNextSections() {
        const currentPath = window.location.pathname;
        let nextSteps = [];

        // Define logical next steps based on current page
        if (currentPath.includes('installation')) {
            nextSteps = [
                {
                    url: '/docs/quick-start/',
                    text: 'Get started with your first AI model',
                    context: 'Quick start guide for immediate results'
                },
                {
                    url: '/#features',
                    text: 'Explore GGUF Loader features',
                    context: 'Discover all available features and capabilities'
                }
            ];
        } else if (currentPath.includes('quick-start')) {
            nextSteps = [
                {
                    url: '/docs/addon-development/',
                    text: 'Learn to create custom addons',
                    context: 'Extend GGUF Loader with your own addons'
                },
                {
                    url: '/docs/smart-floater-example/',
                    text: 'Study the Smart Floater example',
                    context: 'Learn from a real addon implementation'
                }
            ];
        } else if (currentPath.includes('addon-development')) {
            nextSteps = [
                {
                    url: '/docs/addon-api/',
                    text: 'Explore the complete API reference',
                    context: 'Detailed API documentation for advanced development'
                },
                {
                    url: '/docs/smart-floater-example/',
                    text: 'See a complete addon example',
                    context: 'Learn from the Smart Floating Assistant implementation'
                }
            ];
        }

        if (nextSteps.length === 0) return;

        const whatsNextSection = document.createElement('section');
        whatsNextSection.className = 'whats-next-section';
        whatsNextSection.innerHTML = `
            <h3>What's Next?</h3>
            <div class="next-steps"></div>
        `;

        const nextStepsContainer = whatsNextSection.querySelector('.next-steps');
        
        nextSteps.forEach(step => {
            const stepElement = document.createElement('div');
            stepElement.className = 'next-step';
            
            const link = this.createContextualLink({
                url: step.url,
                text: step.text,
                context: step.context,
                className: 'next-step-link'
            });
            
            stepElement.appendChild(link);
            nextStepsContainer.appendChild(stepElement);
        });

        // Insert at end of main content
        const content = document.querySelector('.docs-content, .documentation-content, main');
        if (content) {
            content.appendChild(whatsNextSection);
        }
    }

    addCrossReferenceLinks() {
        // Add cross-reference links within content based on keywords
        const content = document.querySelector('.docs-content, .documentation-content, main, .container');
        if (!content) return;

        const textNodes = this.getTextNodes(content);
        
        textNodes.forEach(node => {
            const text = node.textContent;
            let modifiedText = text;
            
            // Look for opportunities to add contextual links
            const linkOpportunities = this.findLinkOpportunities(text);
            
            linkOpportunities.forEach(opportunity => {
                if (!this.shouldAddLink(node, opportunity)) return;
                
                const linkElement = this.createContextualLink({
                    url: opportunity.url,
                    text: opportunity.linkText,
                    context: opportunity.context,
                    className: 'contextual-cross-reference'
                });
                
                // Replace text with link
                const wrapper = document.createElement('span');
                wrapper.innerHTML = modifiedText.replace(
                    opportunity.originalText,
                    linkElement.outerHTML
                );
                
                node.parentNode.replaceChild(wrapper, node);
            });
        });
    }

    findLinkOpportunities(text) {
        const opportunities = [];
        const lowerText = text.toLowerCase();
        
        // Define keyword patterns and their corresponding links
        const patterns = [
            {
                keywords: ['installation guide', 'install instructions', 'setup guide'],
                url: '/docs/installation/',
                linkText: 'installation guide',
                context: 'Complete installation instructions'
            },
            {
                keywords: ['quick start', 'getting started', 'first steps'],
                url: '/docs/quick-start/',
                linkText: 'quick start guide',
                context: 'Get up and running quickly'
            },
            {
                keywords: ['addon development', 'create addon', 'build addon'],
                url: '/docs/addon-development/',
                linkText: 'addon development guide',
                context: 'Learn to create custom addons'
            },
            {
                keywords: ['api reference', 'api documentation', 'api docs'],
                url: '/docs/addon-api/',
                linkText: 'API reference',
                context: 'Complete API documentation'
            },
            {
                keywords: ['smart floater', 'floating assistant', 'smart assistant'],
                url: '/docs/smart-floater-example/',
                linkText: 'Smart Floater example',
                context: 'Smart Floating Assistant implementation'
            }
        ];
        
        patterns.forEach(pattern => {
            pattern.keywords.forEach(keyword => {
                if (lowerText.includes(keyword)) {
                    opportunities.push({
                        originalText: keyword,
                        url: pattern.url,
                        linkText: pattern.linkText,
                        context: pattern.context
                    });
                }
            });
        });
        
        return opportunities;
    }

    shouldAddLink(node, opportunity) {
        // Don't add links inside existing links
        if (node.closest('a')) return false;
        
        // Don't add links in navigation or headers
        if (node.closest('nav, header, .nav-menu')) return false;
        
        // Don't add duplicate links in the same paragraph
        const paragraph = node.closest('p, div, section');
        if (paragraph && paragraph.querySelector(`a[href="${opportunity.url}"]`)) return false;
        
        return true;
    }

    addContextualLink(container, linkData) {
        const existingLink = container.querySelector(`a[href="${linkData.url}"]`);
        if (existingLink) return; // Don't add duplicate links
        
        const link = this.createContextualLink(linkData);
        
        // Find appropriate insertion point
        const insertionPoint = container.querySelector('.link-container, .actions, .footer') || container;
        
        if (insertionPoint === container) {
            container.appendChild(link);
        } else {
            insertionPoint.appendChild(link);
        }
    }

    createContextualLink(linkData) {
        const link = document.createElement('a');
        link.href = linkData.url;
        link.textContent = linkData.text;
        link.title = linkData.context;
        link.className = linkData.className || 'contextual-link';
        
        // Add structured data attributes
        link.setAttribute('data-link-type', 'contextual');
        link.setAttribute('data-link-context', linkData.context);
        
        return link;
    }

    generateStructuredData() {
        const currentPath = window.location.pathname;
        const currentPage = this.pageRelationships[currentPath];
        
        if (!currentPage) return;

        // Generate WebPage structured data with internal links
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": currentPage.title,
            "url": window.location.href,
            "isPartOf": {
                "@type": "WebSite",
                "name": "GGUF Loader",
                "url": "https://ggufloader.github.io"
            },
            "relatedLink": currentPage.relatedPages?.map(path => 
                `https://ggufloader.github.io${path}`
            ) || []
        };

        // Add breadcrumb structured data
        if (currentPath.startsWith('/docs/')) {
            structuredData.breadcrumb = {
                "@type": "BreadcrumbList",
                "itemListElement": this.generateBreadcrumbStructuredData()
            };
        }

        // Add to page if not already present
        if (!document.querySelector('script[type="application/ld+json"][data-seo-links]')) {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.setAttribute('data-seo-links', 'true');
            script.textContent = JSON.stringify(structuredData);
            document.head.appendChild(script);
        }
    }

    generateBreadcrumbStructuredData() {
        const breadcrumbItems = [];
        const currentPath = window.location.pathname;
        
        // Always include homepage
        breadcrumbItems.push({
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://ggufloader.github.io"
        });
        
        // Add documentation hub if in docs
        if (currentPath.startsWith('/docs/') && currentPath !== '/docs/') {
            breadcrumbItems.push({
                "@type": "ListItem",
                "position": 2,
                "name": "Documentation",
                "item": "https://ggufloader.github.io/docs/"
            });
        }
        
        // Add current page
        const currentPage = this.pageRelationships[currentPath];
        if (currentPage && currentPath !== '/') {
            breadcrumbItems.push({
                "@type": "ListItem",
                "position": breadcrumbItems.length + 1,
                "name": currentPage.title,
                "item": window.location.href
            });
        }
        
        return breadcrumbItems;
    }

    optimizeLinkHierarchy() {
        // Ensure proper link hierarchy for SEO
        const allLinks = document.querySelectorAll('a[href]');
        
        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            if (this.isInternalLink(href)) {
                // Add rel attributes for link relationships
                if (href === '/' || href.startsWith('/#')) {
                    link.setAttribute('rel', 'home');
                } else if (href.startsWith('/docs/')) {
                    link.setAttribute('rel', 'documentation');
                }
                
                // Ensure proper anchor text length and descriptiveness
                const text = link.textContent.trim();
                if (text.length < 3 || this.isGenericText(text)) {
                    const betterText = this.getDescriptiveAnchorText(href, text);
                    if (betterText) {
                        link.textContent = betterText;
                    }
                }
            }
        });
    }

    isInternalLink(href) {
        if (!href) return false;
        return href.startsWith('/') || href.startsWith('#') || 
               href.includes('ggufloader.github.io');
    }

    isGenericText(text) {
        const genericTexts = ['click here', 'read more', 'learn more', 'here', 'link', 'more'];
        return genericTexts.includes(text.toLowerCase());
    }

    getDescriptiveAnchorText(href, currentText) {
        const page = this.pageRelationships[href.split('#')[0]];
        if (!page) return null;
        
        // Return descriptive text based on page type
        if (href.includes('installation')) {
            return 'Complete installation guide';
        } else if (href.includes('quick-start')) {
            return 'Quick start tutorial';
        } else if (href.includes('addon-development')) {
            return 'Addon development guide';
        } else if (href.includes('addon-api')) {
            return 'API reference documentation';
        } else if (href.includes('smart-floater')) {
            return 'Smart Floater example';
        } else if (href.includes('package-structure')) {
            return 'Package structure documentation';
        } else if (href === '/docs/') {
            return 'Documentation hub';
        } else if (href === '/') {
            return 'GGUF Loader homepage';
        }
        
        return page.title || currentText;
    }

    getLinkContext(href) {
        const page = this.pageRelationships[href.split('#')[0]];
        if (!page) return null;
        
        const contexts = {
            '/': 'GGUF Loader homepage with features, downloads, and getting started information',
            '/docs/': 'Documentation hub with links to all guides and references',
            '/docs/installation/': 'Complete installation instructions for Windows, macOS, and Linux',
            '/docs/quick-start/': 'Quick start guide to get up and running in minutes',
            '/docs/addon-development/': 'Comprehensive guide to creating custom addons',
            '/docs/addon-api/': 'Complete API reference for addon developers',
            '/docs/smart-floater-example/': 'Detailed example of the Smart Floating Assistant addon',
            '/docs/package-structure/': 'Technical documentation of GGUF Loader architecture'
        };
        
        return contexts[href.split('#')[0]] || `Learn more about ${page.title}`;
    }

    getTextNodes(element) {
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip text nodes in script, style, or existing links
                    if (node.parentElement.closest('script, style, a, nav, header')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return node.textContent.trim().length > 0 ? 
                           NodeFilter.FILTER_ACCEPT : 
                           NodeFilter.FILTER_REJECT;
                }
            }
        );
        
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        return textNodes;
    }
}

// Initialize SEO Internal Linking when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    new SEOInternalLinking();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SEOInternalLinking;
}