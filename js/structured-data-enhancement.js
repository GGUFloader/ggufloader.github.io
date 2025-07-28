/**
 * Structured Data Enhancement for SEO
 * Adds comprehensive structured data markup for page relationships and breadcrumbs
 */

class StructuredDataEnhancement {
    constructor() {
        this.baseUrl = 'https://ggufloader.github.io';
        this.init();
    }

    init() {
        this.enhanceWebPageStructuredData();
        this.addBreadcrumbStructuredData();
        this.addSiteNavigationStructuredData();
        this.addPageRelationshipData();
    }

    enhanceWebPageStructuredData() {
        const currentPath = window.location.pathname;
        const pageData = this.getPageData(currentPath);
        
        if (!pageData) return;

        const webPageData = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": pageData.title,
            "description": pageData.description,
            "url": window.location.href,
            "inLanguage": "en-US",
            "isPartOf": {
                "@type": "WebSite",
                "@id": `${this.baseUrl}/#website`,
                "name": "GGUF Loader",
                "url": this.baseUrl,
                "description": "Enterprise-grade local AI deployment platform",
                "publisher": {
                    "@type": "Organization",
                    "name": "GGUF Loader",
                    "url": this.baseUrl
                }
            },
            "primaryImageOfPage": {
                "@type": "ImageObject",
                "url": `${this.baseUrl}/preview.png`,
                "width": 1200,
                "height": 630
            },
            "datePublished": "2025-01-27",
            "dateModified": "2025-01-27"
        };

        // Add related pages
        if (pageData.relatedPages && pageData.relatedPages.length > 0) {
            webPageData.relatedLink = pageData.relatedPages.map(path => `${this.baseUrl}${path}`);
        }

        // Add main entity for specific page types
        if (pageData.mainEntity) {
            webPageData.mainEntity = pageData.mainEntity;
        }

        // Add about information for documentation pages
        if (currentPath.startsWith('/docs/')) {
            webPageData.about = {
                "@type": "SoftwareApplication",
                "name": "GGUF Loader",
                "applicationCategory": "DeveloperApplication",
                "operatingSystem": ["Windows", "macOS", "Linux"]
            };
        }

        this.addStructuredData(webPageData, 'webpage-enhanced');
    }

    addBreadcrumbStructuredData() {
        const currentPath = window.location.pathname;
        const breadcrumbItems = this.generateBreadcrumbItems(currentPath);
        
        if (breadcrumbItems.length <= 1) return;

        const breadcrumbData = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbItems
        };

        this.addStructuredData(breadcrumbData, 'breadcrumb-enhanced');
    }

    addSiteNavigationStructuredData() {
        const navigationData = {
            "@context": "https://schema.org",
            "@type": "SiteNavigationElement",
            "name": "Main Navigation",
            "url": this.baseUrl,
            "hasPart": [
                {
                    "@type": "SiteNavigationElement",
                    "name": "Features",
                    "url": `${this.baseUrl}/#features`,
                    "description": "GGUF Loader features and capabilities"
                },
                {
                    "@type": "SiteNavigationElement",
                    "name": "How-To Guides",
                    "url": `${this.baseUrl}/#how-to`,
                    "description": "Step-by-step guides and tutorials"
                },
                {
                    "@type": "SiteNavigationElement",
                    "name": "FAQ",
                    "url": `${this.baseUrl}/#faq`,
                    "description": "Frequently asked questions"
                },
                {
                    "@type": "SiteNavigationElement",
                    "name": "Documentation",
                    "url": `${this.baseUrl}/docs/`,
                    "description": "Complete documentation and guides",
                    "hasPart": [
                        {
                            "@type": "SiteNavigationElement",
                            "name": "Installation Guide",
                            "url": `${this.baseUrl}/docs/installation/`,
                            "description": "Complete installation instructions"
                        },
                        {
                            "@type": "SiteNavigationElement",
                            "name": "Quick Start",
                            "url": `${this.baseUrl}/docs/quick-start/`,
                            "description": "Get started in minutes"
                        },
                        {
                            "@type": "SiteNavigationElement",
                            "name": "Addon Development",
                            "url": `${this.baseUrl}/docs/addon-development/`,
                            "description": "Create custom addons"
                        },
                        {
                            "@type": "SiteNavigationElement",
                            "name": "API Reference",
                            "url": `${this.baseUrl}/docs/addon-api/`,
                            "description": "Complete API documentation"
                        }
                    ]
                }
            ]
        };

        this.addStructuredData(navigationData, 'site-navigation');
    }

    addPageRelationshipData() {
        const currentPath = window.location.pathname;
        
        // Add specific structured data based on page type
        if (currentPath === '/') {
            this.addHomepageRelationshipData();
        } else if (currentPath.startsWith('/docs/')) {
            this.addDocumentationRelationshipData(currentPath);
        }
    }

    addHomepageRelationshipData() {
        const homepageRelationships = {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "GGUF Loader Homepage",
            "description": "Enterprise-grade local AI deployment platform homepage",
            "url": this.baseUrl,
            "hasPart": [
                {
                    "@type": "WebPageElement",
                    "name": "Features Section",
                    "url": `${this.baseUrl}/#features`,
                    "description": "GGUF Loader features and capabilities",
                    "isPartOf": {
                        "@id": `${this.baseUrl}/#webpage`
                    }
                },
                {
                    "@type": "WebPageElement",
                    "name": "How-To Section",
                    "url": `${this.baseUrl}/#how-to`,
                    "description": "Step-by-step guides and tutorials",
                    "isPartOf": {
                        "@id": `${this.baseUrl}/#webpage`
                    }
                },
                {
                    "@type": "WebPageElement",
                    "name": "FAQ Section",
                    "url": `${this.baseUrl}/#faq`,
                    "description": "Frequently asked questions and answers",
                    "isPartOf": {
                        "@id": `${this.baseUrl}/#webpage`
                    }
                }
            ],
            "relatedLink": [
                `${this.baseUrl}/docs/`,
                `${this.baseUrl}/docs/installation/`,
                `${this.baseUrl}/docs/quick-start/`
            ]
        };

        this.addStructuredData(homepageRelationships, 'homepage-relationships');
    }

    addDocumentationRelationshipData(currentPath) {
        const pageData = this.getPageData(currentPath);
        if (!pageData) return;

        const docRelationships = {
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "headline": pageData.title,
            "description": pageData.description,
            "url": window.location.href,
            "author": {
                "@type": "Person",
                "name": "Hussain Nazary",
                "url": "https://www.linkedin.com/in/hussain-nazary-188b4385"
            },
            "publisher": {
                "@type": "Organization",
                "name": "GGUF Loader",
                "url": this.baseUrl
            },
            "datePublished": "2025-01-27",
            "dateModified": "2025-01-27",
            "articleSection": pageData.category || "Documentation",
            "about": {
                "@type": "SoftwareApplication",
                "name": "GGUF Loader",
                "applicationCategory": "DeveloperApplication",
                "operatingSystem": ["Windows", "macOS", "Linux"],
                "url": this.baseUrl
            },
            "isPartOf": {
                "@type": "WebSite",
                "@id": `${this.baseUrl}/#website`
            }
        };

        // Add related articles
        if (pageData.relatedPages && pageData.relatedPages.length > 0) {
            docRelationships.relatedLink = pageData.relatedPages.map(path => `${this.baseUrl}${path}`);
        }

        // Add specific structured data for different documentation types
        if (currentPath.includes('installation')) {
            docRelationships["@type"] = "HowTo";
            docRelationships.name = "How to Install GGUF Loader";
            docRelationships.totalTime = "PT10M";
            docRelationships.supply = [
                {
                    "@type": "HowToSupply",
                    "name": "Python 3.8 or higher"
                },
                {
                    "@type": "HowToSupply",
                    "name": "4GB RAM minimum"
                }
            ];
        } else if (currentPath.includes('quick-start')) {
            docRelationships["@type"] = "HowTo";
            docRelationships.name = "GGUF Loader Quick Start Guide";
            docRelationships.totalTime = "PT5M";
        } else if (currentPath.includes('addon-development')) {
            docRelationships.keywords = ["addon development", "Python", "API", "extensions"];
            docRelationships.programmingLanguage = "Python";
        }

        this.addStructuredData(docRelationships, 'documentation-relationships');
    }

    generateBreadcrumbItems(currentPath) {
        const items = [];
        
        // Always include homepage
        items.push({
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": this.baseUrl
        });

        // Add documentation hub if in docs
        if (currentPath.startsWith('/docs/') && currentPath !== '/docs/') {
            items.push({
                "@type": "ListItem",
                "position": 2,
                "name": "Documentation",
                "item": `${this.baseUrl}/docs/`
            });
        }

        // Add current page if not homepage
        if (currentPath !== '/') {
            const pageData = this.getPageData(currentPath);
            if (pageData) {
                items.push({
                    "@type": "ListItem",
                    "position": items.length + 1,
                    "name": pageData.title,
                    "item": window.location.href
                });
            }
        }

        return items;
    }

    getPageData(path) {
        const pageData = {
            '/': {
                title: 'GGUF Loader - Enterprise-Grade Local AI Platform',
                description: 'Enterprise-grade local AI deployment platform for Windows, macOS, Linux. Run Mistral, LLaMA, and DeepSeek models offline.',
                relatedPages: ['/docs/', '/docs/installation/', '/docs/quick-start/'],
                mainEntity: {
                    "@type": "SoftwareApplication",
                    "name": "GGUF Loader",
                    "applicationCategory": "DeveloperApplication"
                }
            },
            '/docs/': {
                title: 'Documentation Hub',
                description: 'Complete documentation for GGUF Loader including installation, quick start, and addon development guides.',
                relatedPages: ['/', '/docs/installation/', '/docs/quick-start/', '/docs/addon-development/']
            },
            '/docs/installation/': {
                title: 'Installation Guide',
                description: 'Complete installation instructions for GGUF Loader on Windows, macOS, and Linux systems.',
                category: 'Getting Started',
                relatedPages: ['/', '/docs/quick-start/', '/docs/']
            },
            '/docs/quick-start/': {
                title: 'Quick Start Guide',
                description: 'Get up and running with GGUF Loader in just a few minutes with this step-by-step guide.',
                category: 'Getting Started',
                relatedPages: ['/', '/docs/installation/', '/docs/addon-development/']
            },
            '/docs/addon-development/': {
                title: 'Addon Development Guide',
                description: 'Learn to create custom addons for GGUF Loader with examples and best practices.',
                category: 'Development',
                relatedPages: ['/', '/docs/addon-api/', '/docs/smart-floater-example/']
            },
            '/docs/addon-api/': {
                title: 'API Reference',
                description: 'Complete API reference documentation for GGUF Loader addon developers.',
                category: 'Development',
                relatedPages: ['/', '/docs/addon-development/', '/docs/smart-floater-example/']
            },
            '/docs/smart-floater-example/': {
                title: 'Smart Floater Example',
                description: 'Detailed example of the Smart Floating Assistant addon implementation.',
                category: 'Examples',
                relatedPages: ['/', '/docs/addon-development/', '/docs/addon-api/']
            },
            '/docs/package-structure/': {
                title: 'Package Structure',
                description: 'Technical documentation of GGUF Loader architecture and package structure.',
                category: 'Advanced',
                relatedPages: ['/', '/docs/addon-development/', '/docs/']
            }
        };

        return pageData[path] || null;
    }

    addStructuredData(data, identifier) {
        // Check if structured data with this identifier already exists
        const existingScript = document.querySelector(`script[type="application/ld+json"][data-enhanced="${identifier}"]`);
        if (existingScript) {
            return; // Don't add duplicate structured data
        }

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-enhanced', identifier);
        script.textContent = JSON.stringify(data, null, 2);
        document.head.appendChild(script);
    }
}

// Initialize structured data enhancement when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    new StructuredDataEnhancement();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StructuredDataEnhancement;
}