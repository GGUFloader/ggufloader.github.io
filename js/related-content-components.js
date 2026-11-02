/**
 * Related Content Components
 * Creates "Related Content" widgets and "You Might Also Like" sections
 * Provides contextual recommendations based on current page content
 */

class RelatedContentComponents {
    constructor(analyzer) {
        this.analyzer = analyzer;
        this.components = new Map();
        this.initialized = false;
    }

    /**
     * Initialize related content components
     */
    async initialize() {
        if (this.initialized) return;
        
        try {
            await this.analyzer.initialize();
            this.createStylesheet();
            this.initialized = true;
            console.log('Related Content Components initialized');
        } catch (error) {
            console.error('Failed to initialize Related Content Components:', error);
        }
    }

    /**
     * Create CSS stylesheet for related content components
     */
    createStylesheet() {
        const style = document.createElement('style');
        style.textContent = `
            .related-content-widget {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                border-left: 4px solid #0078d4;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            }

            .related-content-title {
                font-size: 1.2rem;
                font-weight: 600;
                color: #2c3e50;
                margin: 0 0 15px 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .related-content-title::before {
                content: "🔗";
                font-size: 1rem;
            }

            .related-content-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .related-content-item {
                margin-bottom: 12px;
                padding: 12px;
                background: white;
                border-radius: 6px;
                border: 1px solid #e9ecef;
                transition: all 0.2s ease;
            }

            .related-content-item:hover {
                border-color: #0078d4;
                box-shadow: 0 2px 8px rgba(0, 120, 212, 0.1);
                transform: translateY(-1px);
            }

            .related-content-link {
                text-decoration: none;
                color: inherit;
                display: block;
            }

            .related-content-item-title {
                font-weight: 600;
                color: #0078d4;
                margin: 0 0 4px 0;
                font-size: 0.95rem;
            }

            .related-content-item-description {
                color: #6c757d;
                font-size: 0.85rem;
                line-height: 1.4;
                margin: 0;
            }

            .related-content-type-badge {
                display: inline-block;
                background: #e3f2fd;
                color: #1976d2;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 0.7rem;
                font-weight: 500;
                text-transform: uppercase;
                margin-left: 8px;
            }

            .related-content-type-badge.homepage {
                background: #e8f5e8;
                color: #2e7d32;
            }

            .related-content-type-badge.documentation {
                background: #fff3e0;
                color: #f57c00;
            }

            .you-might-like-widget {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 12px;
                padding: 25px;
                margin: 30px 0;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            }

            .you-might-like-title {
                font-size: 1.3rem;
                font-weight: 700;
                margin: 0 0 20px 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .you-might-like-title::before {
                content: "✨";
                font-size: 1.2rem;
            }

            .you-might-like-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
            }

            .you-might-like-item {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 15px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                transition: all 0.3s ease;
            }

            .you-might-like-item:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-2px);
                box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
            }

            .you-might-like-link {
                text-decoration: none;
                color: white;
                display: block;
            }

            .you-might-like-item-title {
                font-weight: 600;
                margin: 0 0 8px 0;
                font-size: 1rem;
            }

            .you-might-like-item-description {
                font-size: 0.85rem;
                opacity: 0.9;
                line-height: 1.4;
                margin: 0;
            }

            .contextual-recommendations {
                background: #fff;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                position: relative;
            }

            .contextual-recommendations::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, #0078d4, #00bcf2);
                border-radius: 8px 8px 0 0;
            }

            .contextual-title {
                font-size: 1.1rem;
                font-weight: 600;
                color: #495057;
                margin: 0 0 15px 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .contextual-title::before {
                content: "💡";
                font-size: 1rem;
            }

            .contextual-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
            }

            .contextual-item {
                padding: 12px;
                background: #f8f9fa;
                border-radius: 6px;
                border-left: 3px solid #0078d4;
                transition: all 0.2s ease;
            }

            .contextual-item:hover {
                background: #e3f2fd;
                transform: translateX(3px);
            }

            .contextual-link {
                text-decoration: none;
                color: inherit;
                display: block;
            }

            .contextual-item-title {
                font-weight: 600;
                color: #2c3e50;
                margin: 0 0 4px 0;
                font-size: 0.9rem;
            }

            .contextual-item-description {
                color: #6c757d;
                font-size: 0.8rem;
                line-height: 1.3;
                margin: 0;
            }

            @media (max-width: 768px) {
                .related-content-widget,
                .you-might-like-widget,
                .contextual-recommendations {
                    margin: 15px 0;
                    padding: 15px;
                }

                .you-might-like-grid,
                .contextual-grid {
                    grid-template-columns: 1fr;
                }

                .related-content-title,
                .you-might-like-title {
                    font-size: 1.1rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Create a related content widget
     */
    createRelatedContentWidget(currentPath, options = {}) {
        const {
            title = "Related Content",
            maxItems = 4,
            showType = true,
            className = "related-content-widget"
        } = options;

        const relatedContent = this.analyzer.getRelatedContent(currentPath, maxItems);
        
        if (relatedContent.length === 0) {
            return null;
        }

        const widget = document.createElement('div');
        widget.className = className;
        
        const titleElement = document.createElement('h3');
        titleElement.className = 'related-content-title';
        titleElement.textContent = title;
        
        const list = document.createElement('ul');
        list.className = 'related-content-list';
        
        relatedContent.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = 'related-content-item';
            
            const link = document.createElement('a');
            link.href = item.url;
            link.className = 'related-content-link';
            
            const itemTitle = document.createElement('h4');
            itemTitle.className = 'related-content-item-title';
            itemTitle.textContent = item.title;
            
            if (showType) {
                const badge = document.createElement('span');
                badge.className = `related-content-type-badge ${item.type}`;
                badge.textContent = item.type;
                itemTitle.appendChild(badge);
            }
            
            const description = document.createElement('p');
            description.className = 'related-content-item-description';
            description.textContent = item.description;
            
            link.appendChild(itemTitle);
            link.appendChild(description);
            listItem.appendChild(link);
            list.appendChild(listItem);
        });
        
        widget.appendChild(titleElement);
        widget.appendChild(list);
        
        return widget;
    }

    /**
     * Create a "You Might Also Like" widget
     */
    createYouMightLikeWidget(currentPath, options = {}) {
        const {
            title = "You Might Also Like",
            maxItems = 3,
            className = "you-might-like-widget"
        } = options;

        const relatedContent = this.analyzer.getRelatedContent(currentPath, maxItems);
        
        if (relatedContent.length === 0) {
            return null;
        }

        const widget = document.createElement('div');
        widget.className = className;
        
        const titleElement = document.createElement('h3');
        titleElement.className = 'you-might-like-title';
        titleElement.textContent = title;
        
        const grid = document.createElement('div');
        grid.className = 'you-might-like-grid';
        
        relatedContent.forEach(item => {
            const gridItem = document.createElement('div');
            gridItem.className = 'you-might-like-item';
            
            const link = document.createElement('a');
            link.href = item.url;
            link.className = 'you-might-like-link';
            
            const itemTitle = document.createElement('h4');
            itemTitle.className = 'you-might-like-item-title';
            itemTitle.textContent = item.title;
            
            const description = document.createElement('p');
            description.className = 'you-might-like-item-description';
            description.textContent = item.description;
            
            link.appendChild(itemTitle);
            link.appendChild(description);
            gridItem.appendChild(link);
            grid.appendChild(gridItem);
        });
        
        widget.appendChild(titleElement);
        widget.appendChild(grid);
        
        return widget;
    }

    /**
     * Create contextual recommendations based on keywords
     */
    createContextualRecommendations(keywords, currentPath = null, options = {}) {
        const {
            title = "Based on Your Interest",
            maxItems = 4,
            className = "contextual-recommendations"
        } = options;

        const suggestions = this.analyzer.getContentSuggestions(keywords, currentPath, maxItems);
        
        if (suggestions.length === 0) {
            return null;
        }

        const widget = document.createElement('div');
        widget.className = className;
        
        const titleElement = document.createElement('h3');
        titleElement.className = 'contextual-title';
        titleElement.textContent = title;
        
        const grid = document.createElement('div');
        grid.className = 'contextual-grid';
        
        suggestions.forEach(item => {
            const gridItem = document.createElement('div');
            gridItem.className = 'contextual-item';
            
            const link = document.createElement('a');
            link.href = item.url;
            link.className = 'contextual-link';
            
            const itemTitle = document.createElement('h4');
            itemTitle.className = 'contextual-item-title';
            itemTitle.textContent = item.title;
            
            const description = document.createElement('p');
            description.className = 'contextual-item-description';
            description.textContent = item.description;
            
            link.appendChild(itemTitle);
            link.appendChild(description);
            gridItem.appendChild(link);
            grid.appendChild(gridItem);
        });
        
        widget.appendChild(titleElement);
        widget.appendChild(grid);
        
        return widget;
    }

    /**
     * Auto-inject related content widgets into pages
     */
    autoInjectWidgets() {
        const currentPath = this.getCurrentPath();
        
        // Inject into homepage sections
        if (currentPath.startsWith('/#') || currentPath === '/') {
            this.injectHomepageWidgets(currentPath);
        }
        
        // Inject into documentation pages
        if (currentPath.startsWith('/docs/')) {
            this.injectDocumentationWidgets(currentPath);
        }
    }

    /**
     * Inject widgets into homepage
     */
    injectHomepageWidgets(currentPath) {
        // Add related content after features section
        const featuresSection = document.querySelector('#features, .features');
        if (featuresSection) {
            const widget = this.createYouMightLikeWidget('homepage-features', {
                title: "Learn More About These Features"
            });
            if (widget) {
                featuresSection.parentNode.insertBefore(widget, featuresSection.nextSibling);
            }
        }

        // Add contextual recommendations after FAQ
        const faqSection = document.querySelector('#faq, .faq');
        if (faqSection) {
            const widget = this.createContextualRecommendations(
                ['help', 'support', 'troubleshooting', 'guide'],
                'homepage-faq',
                { title: "Need More Help?" }
            );
            if (widget) {
                faqSection.parentNode.insertBefore(widget, faqSection.nextSibling);
            }
        }
    }

    /**
     * Inject widgets into documentation pages
     */
    injectDocumentationWidgets(currentPath) {
        // Find main content area
        const mainContent = document.querySelector('main, .docs-content, .content, article');
        if (!mainContent) return;

        // Add related content widget at the end of content
        const relatedWidget = this.createRelatedContentWidget(currentPath);
        if (relatedWidget) {
            mainContent.appendChild(relatedWidget);
        }

        // Add "You Might Also Like" widget
        const youMightLikeWidget = this.createYouMightLikeWidget(currentPath);
        if (youMightLikeWidget) {
            mainContent.appendChild(youMightLikeWidget);
        }
    }

    /**
     * Get current page path
     */
    getCurrentPath() {
        return window.location.pathname + window.location.hash;
    }

    /**
     * Initialize widgets when DOM is ready
     */
    initializeOnReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initialize().then(() => {
                    this.autoInjectWidgets();
                });
            });
        } else {
            this.initialize().then(() => {
                this.autoInjectWidgets();
            });
        }
    }

    /**
     * Manually add widget to specific element
     */
    addWidgetToElement(element, widgetType, currentPath, options = {}) {
        if (!this.initialized) {
            console.warn('Components not initialized');
            return null;
        }

        let widget = null;
        
        switch (widgetType) {
            case 'related':
                widget = this.createRelatedContentWidget(currentPath, options);
                break;
            case 'youMightLike':
                widget = this.createYouMightLikeWidget(currentPath, options);
                break;
            case 'contextual':
                if (options.keywords) {
                    widget = this.createContextualRecommendations(options.keywords, currentPath, options);
                }
                break;
        }

        if (widget && element) {
            element.appendChild(widget);
            return widget;
        }

        return null;
    }

    /**
     * Remove all injected widgets
     */
    removeAllWidgets() {
        const widgets = document.querySelectorAll(
            '.related-content-widget, .you-might-like-widget, .contextual-recommendations'
        );
        widgets.forEach(widget => widget.remove());
    }

    /**
     * Update widgets when content changes
     */
    updateWidgets() {
        this.removeAllWidgets();
        this.autoInjectWidgets();
    }
}

// Export for use in other modules
window.RelatedContentComponents = RelatedContentComponents;