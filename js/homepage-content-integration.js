/**
 * Homepage Content Integration
 * Integrates documentation content previews into homepage sections
 */

class HomepageContentIntegration {
    constructor() {
        this.contentPreviewSystem = null;
        this.initialized = false;
        this.previewMappings = this.createPreviewMappings();
        
        this.init();
    }
    
    async init() {
        if (this.initialized) return;
        
        try {
            // Wait for content preview system to be available
            await this.waitForContentPreviewSystem();
            
            // Initialize content previews
            this.initializeContentPreviews();
            
            // Setup interaction handlers
            this.setupInteractionHandlers();
            
            this.initialized = true;
            console.log('Homepage Content Integration initialized');
        } catch (error) {
            console.error('Failed to initialize Homepage Content Integration:', error);
        }
    }
    
    /**
     * Wait for the content preview system to be available
     */
    async waitForContentPreviewSystem() {
        return new Promise((resolve, reject) => {
            const checkSystem = () => {
                if (window.contentPreviewSystem && window.contentPreviewSystem.initialized) {
                    this.contentPreviewSystem = window.contentPreviewSystem;
                    resolve();
                } else {
                    setTimeout(checkSystem, 100);
                }
            };
            
            checkSystem();
            
            // Timeout after 10 seconds
            setTimeout(() => {
                if (!this.contentPreviewSystem) {
                    reject(new Error('Content Preview System not available'));
                }
            }, 10000);
        });
    }
    
    /**
     * Create mappings between homepage sections and documentation
     */
    createPreviewMappings() {
        return {
            // Core Features Section
            'multi-model-preview': {
                docId: 'quick-start',
                options: {
                    showCodeExample: false,
                    showKeyPoints: true,
                    showSections: true,
                    expandable: true
                }
            },
            'offline-operation-preview': {
                docId: 'installation',
                options: {
                    showCodeExample: false,
                    showKeyPoints: true,
                    showSections: false,
                    expandable: true
                }
            },
            'user-friendly-preview': {
                docId: 'quick-start',
                options: {
                    showCodeExample: true,
                    showKeyPoints: true,
                    showSections: false,
                    expandable: true
                }
            },
            'optimized-performance-preview': {
                docId: 'installation',
                options: {
                    showCodeExample: false,
                    showKeyPoints: true,
                    showSections: true,
                    expandable: true
                }
            },
            'privacy-centric-preview': {
                docId: 'installation',
                options: {
                    showCodeExample: false,
                    showKeyPoints: true,
                    showSections: false,
                    expandable: true
                }
            },
            'zero-configuration-preview': {
                docId: 'installation',
                options: {
                    showCodeExample: true,
                    showKeyPoints: true,
                    showSections: false,
                    expandable: true
                }
            },
            
            // Advanced Features Section
            'smart-floating-assistant-preview': {
                docId: 'smart-floater-example',
                options: {
                    showCodeExample: true,
                    showKeyPoints: true,
                    showSections: true,
                    expandable: true
                }
            },
            'extensible-addon-system-preview': {
                docId: 'addon-development',
                options: {
                    showCodeExample: true,
                    showKeyPoints: true,
                    showSections: true,
                    expandable: true
                }
            },
            
            // How-To Guides Section
            'mistral-guide-preview': {
                docId: 'quick-start',
                options: {
                    showCodeExample: true,
                    showKeyPoints: false,
                    showSections: true,
                    expandable: true
                }
            },
            'deepseek-guide-preview': {
                docId: 'quick-start',
                options: {
                    showCodeExample: false,
                    showKeyPoints: true,
                    showSections: true,
                    expandable: true
                }
            },
            'tinyllama-guide-preview': {
                docId: 'installation',
                options: {
                    showCodeExample: false,
                    showKeyPoints: true,
                    showSections: true,
                    expandable: true
                }
            },
            'no-python-guide-preview': {
                docId: 'installation',
                options: {
                    showCodeExample: true,
                    showKeyPoints: true,
                    showSections: false,
                    expandable: true
                }
            },
            'ai-assistant-guide-preview': {
                docId: 'addon-development',
                options: {
                    showCodeExample: true,
                    showKeyPoints: true,
                    showSections: true,
                    expandable: true
                }
            }
        };
    }
    
    /**
     * Initialize content previews for all mapped containers
     */
    initializeContentPreviews() {
        Object.entries(this.previewMappings).forEach(([containerId, config]) => {
            this.embedPreviewWithDelay(containerId, config, Math.random() * 1000);
        });
    }
    
    /**
     * Embed preview with a delay for staggered loading
     */
    embedPreviewWithDelay(containerId, config, delay) {
        setTimeout(() => {
            try {
                this.contentPreviewSystem.embedPreview(containerId, config.docId, config.options);
                this.addPreviewInteractions(containerId);
            } catch (error) {
                console.warn(`Failed to embed preview for ${containerId}:`, error);
                this.createFallbackPreview(containerId, config);
            }
        }, delay);
    }
    
    /**
     * Create fallback preview when main system fails
     */
    createFallbackPreview(containerId, config) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const fallbackContent = `
            <div class="content-preview fallback">
                <div class="preview-header">
                    <h4 class="preview-title">Documentation Available</h4>
                    <p class="preview-description">Detailed guides and examples are available in our documentation.</p>
                </div>
                <div class="preview-actions">
                    <a href="docs/${config.docId}/" class="read-more-btn">
                        📚 Read Documentation
                    </a>
                </div>
            </div>
        `;
        
        container.innerHTML = fallbackContent;
    }
    
    /**
     * Add interactive behaviors to preview containers
     */
    addPreviewInteractions(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Add hover effects
        container.addEventListener('mouseenter', () => {
            this.handlePreviewHover(container, true);
        });
        
        container.addEventListener('mouseleave', () => {
            this.handlePreviewHover(container, false);
        });
        
        // Add click tracking
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('read-more-btn')) {
                this.trackPreviewClick(containerId, e.target.href);
            }
        });
    }
    
    /**
     * Handle preview hover effects
     */
    handlePreviewHover(container, isHovering) {
        const preview = container.querySelector('.content-preview');
        if (!preview) return;
        
        if (isHovering) {
            preview.classList.add('preview-hover');
            this.showPreviewTooltip(container);
        } else {
            preview.classList.remove('preview-hover');
            this.hidePreviewTooltip(container);
        }
    }
    
    /**
     * Show tooltip with additional information
     */
    showPreviewTooltip(container) {
        // Implementation for showing tooltips with additional context
        // This could show reading time, difficulty level, etc.
    }
    
    /**
     * Hide preview tooltip
     */
    hidePreviewTooltip(container) {
        // Implementation for hiding tooltips
    }
    
    /**
     * Track preview clicks for analytics
     */
    trackPreviewClick(containerId, href) {
        // Track which previews are most effective
        if (window.gtag) {
            window.gtag('event', 'preview_click', {
                'event_category': 'content_preview',
                'event_label': containerId,
                'value': href
            });
        }
        
        console.log(`Preview clicked: ${containerId} -> ${href}`);
    }
    
    /**
     * Setup interaction handlers for the entire page
     */
    setupInteractionHandlers() {
        // Handle scroll-based preview loading
        this.setupScrollBasedLoading();
        
        // Handle responsive behavior
        this.setupResponsiveBehavior();
        
        // Handle accessibility improvements
        this.setupAccessibilityFeatures();
    }
    
    /**
     * Setup scroll-based loading for performance
     */
    setupScrollBasedLoading() {
        const observerOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const container = entry.target;
                    const preview = container.querySelector('.content-preview');
                    
                    if (preview && !preview.classList.contains('loaded')) {
                        preview.classList.add('loaded', 'preview-fade-in');
                        observer.unobserve(container);
                    }
                }
            });
        }, observerOptions);
        
        // Observe all preview containers
        Object.keys(this.previewMappings).forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                observer.observe(container);
            }
        });
    }
    
    /**
     * Setup responsive behavior for different screen sizes
     */
    setupResponsiveBehavior() {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        
        const handleResponsiveChange = (e) => {
            const isMobile = e.matches;
            
            Object.keys(this.previewMappings).forEach(containerId => {
                const container = document.getElementById(containerId);
                if (!container) return;
                
                const preview = container.querySelector('.content-preview');
                if (!preview) return;
                
                if (isMobile) {
                    preview.classList.add('mobile-optimized');
                    this.optimizeForMobile(preview);
                } else {
                    preview.classList.remove('mobile-optimized');
                    this.optimizeForDesktop(preview);
                }
            });
        };
        
        mediaQuery.addListener(handleResponsiveChange);
        handleResponsiveChange(mediaQuery);
    }
    
    /**
     * Optimize preview for mobile display
     */
    optimizeForMobile(preview) {
        // Hide code examples on mobile by default
        const codeExample = preview.querySelector('.preview-code-example');
        if (codeExample) {
            codeExample.style.display = 'none';
        }
        
        // Limit key points to 2 on mobile
        const keyPoints = preview.querySelectorAll('.preview-key-points li');
        keyPoints.forEach((point, index) => {
            if (index >= 2) {
                point.style.display = 'none';
            }
        });
    }
    
    /**
     * Optimize preview for desktop display
     */
    optimizeForDesktop(preview) {
        // Show all elements on desktop
        const hiddenElements = preview.querySelectorAll('[style*="display: none"]');
        hiddenElements.forEach(element => {
            element.style.display = '';
        });
    }
    
    /**
     * Setup accessibility features
     */
    setupAccessibilityFeatures() {
        // Add ARIA labels and descriptions
        Object.keys(this.previewMappings).forEach(containerId => {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            container.setAttribute('role', 'complementary');
            container.setAttribute('aria-label', 'Documentation preview');
            
            // Add skip links for screen readers
            const skipLink = document.createElement('a');
            skipLink.href = `#${containerId}-end`;
            skipLink.className = 'sr-only skip-link';
            skipLink.textContent = 'Skip documentation preview';
            container.insertBefore(skipLink, container.firstChild);
            
            const endMarker = document.createElement('div');
            endMarker.id = `${containerId}-end`;
            endMarker.className = 'sr-only';
            container.appendChild(endMarker);
        });
    }
    
    /**
     * Refresh all previews (useful for dynamic content updates)
     */
    refreshPreviews() {
        if (!this.contentPreviewSystem) return;
        
        this.contentPreviewSystem.clearCache();
        this.initializeContentPreviews();
    }
    
    /**
     * Get preview statistics
     */
    getPreviewStats() {
        const stats = {
            totalPreviews: Object.keys(this.previewMappings).length,
            loadedPreviews: 0,
            failedPreviews: 0
        };
        
        Object.keys(this.previewMappings).forEach(containerId => {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            const preview = container.querySelector('.content-preview');
            if (preview) {
                if (preview.classList.contains('error')) {
                    stats.failedPreviews++;
                } else {
                    stats.loadedPreviews++;
                }
            }
        });
        
        return stats;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.homepageContentIntegration = new HomepageContentIntegration();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HomepageContentIntegration;
}