/**
 * Related Content System Integration
 * Integrates content relationship analysis, related content components, and user journey optimization
 * Provides a unified system for cross-page content recommendations and user guidance
 */

class RelatedContentSystem {
    constructor() {
        this.analyzer = null;
        this.components = null;
        this.journeyOptimizer = null;
        this.initialized = false;
        this.config = {
            enableAnalytics: true,
            enableJourneyTracking: true,
            enablePersonalization: true,
            autoInject: true,
            debugMode: false
        };
    }

    /**
     * Initialize the complete related content system
     */
    async initialize(config = {}) {
        if (this.initialized) return;
        
        try {
            // Merge configuration
            this.config = { ...this.config, ...config };
            
            if (this.config.debugMode) {
                console.log('Initializing Related Content System with config:', this.config);
            }
            
            // Initialize core components
            this.analyzer = new ContentRelationshipAnalyzer();
            this.components = new RelatedContentComponents(this.analyzer);
            this.journeyOptimizer = new UserJourneyOptimizer(this.analyzer, this.components);
            
            // Initialize all components
            await this.analyzer.initialize();
            await this.components.initialize();
            await this.journeyOptimizer.initialize();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Auto-inject components if enabled
            if (this.config.autoInject) {
                this.autoInjectAllComponents();
            }
            
            this.initialized = true;
            
            if (this.config.debugMode) {
                console.log('Related Content System initialized successfully');
                this.logSystemStatus();
            }
            
        } catch (error) {
            console.error('Failed to initialize Related Content System:', error);
            throw error;
        }
    }

    /**
     * Set up event listeners for system integration
     */
    setupEventListeners() {
        // Listen for page navigation changes
        window.addEventListener('popstate', () => {
            this.handlePageChange();
        });
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            this.handlePageChange();
        });
        
        // Listen for dynamic content changes
        if (window.MutationObserver) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        // Check if significant content was added
                        const hasSignificantContent = Array.from(mutation.addedNodes).some(node => 
                            node.nodeType === Node.ELEMENT_NODE && 
                            (node.tagName === 'SECTION' || node.tagName === 'ARTICLE' || node.classList?.contains('content'))
                        );
                        
                        if (hasSignificantContent) {
                            setTimeout(() => this.refreshComponents(), 1000);
                        }
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    /**
     * Handle page changes
     */
    handlePageChange() {
        if (this.config.debugMode) {
            console.log('Page change detected:', window.location.pathname + window.location.hash);
        }
        
        // Update user journey tracking
        if (this.config.enableJourneyTracking && this.journeyOptimizer) {
            this.journeyOptimizer.trackPageVisit();
            this.journeyOptimizer.completeCurrentStep();
        }
        
        // Refresh components after a short delay to allow page to load
        setTimeout(() => {
            this.refreshComponents();
        }, 500);
    }

    /**
     * Auto-inject all components based on current page
     */
    autoInjectAllComponents() {
        try {
            // Inject related content components
            if (this.components) {
                this.components.autoInjectWidgets();
            }
            
            // Inject journey optimization components
            if (this.journeyOptimizer && this.config.enablePersonalization) {
                this.journeyOptimizer.autoInjectComponents();
            }
            
        } catch (error) {
            console.error('Failed to auto-inject components:', error);
        }
    }

    /**
     * Refresh all components
     */
    refreshComponents() {
        try {
            if (this.components) {
                this.components.updateWidgets();
            }
            
            if (this.journeyOptimizer && this.config.enablePersonalization) {
                // Update journey progress if user has an active journey
                if (this.journeyOptimizer.currentJourney) {
                    this.journeyOptimizer.showProgressIndicator();
                }
            }
            
        } catch (error) {
            console.error('Failed to refresh components:', error);
        }
    }

    /**
     * Get related content for current page
     */
    getRelatedContent(maxResults = 5) {
        if (!this.analyzer) {
            console.warn('Analyzer not initialized');
            return [];
        }
        
        const currentPath = this.getCurrentPath();
        return this.analyzer.getRelatedContent(currentPath, maxResults);
    }

    /**
     * Get content suggestions based on keywords
     */
    getContentSuggestions(keywords, maxResults = 5) {
        if (!this.analyzer) {
            console.warn('Analyzer not initialized');
            return [];
        }
        
        const currentPath = this.getCurrentPath();
        return this.analyzer.getContentSuggestions(keywords, currentPath, maxResults);
    }

    /**
     * Manually add related content widget to element
     */
    addRelatedContentWidget(element, options = {}) {
        if (!this.components) {
            console.warn('Components not initialized');
            return null;
        }
        
        const currentPath = this.getCurrentPath();
        return this.components.addWidgetToElement(element, 'related', currentPath, options);
    }

    /**
     * Manually add "You Might Like" widget to element
     */
    addYouMightLikeWidget(element, options = {}) {
        if (!this.components) {
            console.warn('Components not initialized');
            return null;
        }
        
        const currentPath = this.getCurrentPath();
        return this.components.addWidgetToElement(element, 'youMightLike', currentPath, options);
    }

    /**
     * Manually add contextual recommendations widget
     */
    addContextualWidget(element, keywords, options = {}) {
        if (!this.components) {
            console.warn('Components not initialized');
            return null;
        }
        
        const currentPath = this.getCurrentPath();
        return this.components.addWidgetToElement(element, 'contextual', currentPath, {
            ...options,
            keywords
        });
    }

    /**
     * Start a specific user journey
     */
    startJourney(journeyKey) {
        if (!this.journeyOptimizer) {
            console.warn('Journey optimizer not initialized');
            return false;
        }
        
        this.journeyOptimizer.selectJourney(journeyKey);
        return true;
    }

    /**
     * Get available journey paths
     */
    getAvailableJourneys() {
        if (!this.journeyOptimizer) {
            return {};
        }
        
        return this.journeyOptimizer.journeyPaths;
    }

    /**
     * Get user profile information
     */
    getUserProfile() {
        if (!this.journeyOptimizer) {
            return null;
        }
        
        return this.journeyOptimizer.userProfile;
    }

    /**
     * Reset user journey and profile
     */
    resetUserData() {
        if (this.journeyOptimizer) {
            this.journeyOptimizer.resetJourney();
            
            // Clear user profile
            this.journeyOptimizer.userProfile = {
                visitedPages: [],
                interests: [],
                currentJourney: null,
                completedSteps: [],
                preferences: {},
                lastVisit: null
            };
            this.journeyOptimizer.saveUserProfile();
        }
        
        // Refresh components
        this.refreshComponents();
    }

    /**
     * Enable or disable specific features
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        if (this.config.debugMode) {
            console.log('Config updated:', this.config);
        }
        
        // Apply configuration changes
        if (!this.config.autoInject) {
            this.removeAllComponents();
        } else {
            this.autoInjectAllComponents();
        }
    }

    /**
     * Remove all injected components
     */
    removeAllComponents() {
        if (this.components) {
            this.components.removeAllWidgets();
        }
        
        // Remove journey components
        const journeyComponents = document.querySelectorAll(
            '.journey-selector, .journey-progress-indicator, .personalized-suggestions'
        );
        journeyComponents.forEach(component => component.remove());
    }

    /**
     * Get system analytics data
     */
    getAnalytics() {
        if (!this.config.enableAnalytics) {
            return null;
        }
        
        const userProfile = this.getUserProfile();
        const contentMap = this.analyzer ? this.analyzer.getContentMap() : new Map();
        
        return {
            userProfile,
            contentAnalysis: {
                totalContent: contentMap.size,
                homepageContent: Array.from(contentMap.keys()).filter(k => k.startsWith('homepage-')).length,
                documentationContent: Array.from(contentMap.keys()).filter(k => k.startsWith('/docs/')).length
            },
            systemStatus: {
                initialized: this.initialized,
                analyzerReady: this.analyzer?.initialized || false,
                componentsReady: this.components?.initialized || false,
                journeyOptimizerReady: this.journeyOptimizer?.initialized || false
            },
            config: this.config
        };
    }

    /**
     * Log system status for debugging
     */
    logSystemStatus() {
        if (!this.config.debugMode) return;
        
        console.group('Related Content System Status');
        console.log('Initialized:', this.initialized);
        console.log('Analyzer ready:', this.analyzer?.initialized || false);
        console.log('Components ready:', this.components?.initialized || false);
        console.log('Journey optimizer ready:', this.journeyOptimizer?.initialized || false);
        console.log('Content map size:', this.analyzer?.getContentMap()?.size || 0);
        console.log('User profile:', this.getUserProfile());
        console.log('Current config:', this.config);
        console.groupEnd();
    }

    /**
     * Get current page path
     */
    getCurrentPath() {
        return window.location.pathname + window.location.hash;
    }

    /**
     * Initialize system when DOM is ready
     */
    static initializeOnReady(config = {}) {
        const system = new RelatedContentSystem();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                system.initialize(config);
            });
        } else {
            system.initialize(config);
        }
        
        return system;
    }

    /**
     * Create a global instance for easy access
     */
    static createGlobalInstance(config = {}) {
        if (window.relatedContentSystem) {
            console.warn('Related Content System already exists globally');
            return window.relatedContentSystem;
        }
        
        window.relatedContentSystem = RelatedContentSystem.initializeOnReady(config);
        return window.relatedContentSystem;
    }
}

// Export for use in other modules
window.RelatedContentSystem = RelatedContentSystem;

// Auto-initialize if not in a module environment
if (typeof module === 'undefined') {
    // Check if auto-initialization is enabled (can be disabled by setting window.disableAutoInit = true)
    if (!window.disableAutoInit) {
        RelatedContentSystem.createGlobalInstance({
            debugMode: window.location.search.includes('debug=true')
        });
    }
}