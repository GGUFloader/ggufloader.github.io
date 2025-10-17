/**
 * Mobile Navigation Enhancer
 * Provides smooth transitions, touch-friendly navigation, and mobile-specific shortcuts
 * for cross-page navigation between homepage and documentation
 */

class MobileNavigationEnhancer {
    constructor() {
        this.isInitialized = false;
        this.isMobile = window.innerWidth <= 768;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.swipeThreshold = 50;
        this.navigationHistory = [];
        this.shortcuts = new Map();
        
        // Configuration
        this.config = {
            enableSwipeNavigation: true,
            enableShortcuts: true,
            enableTransitions: true,
            swipeThreshold: 50,
            transitionDuration: 300
        };
    }

    /**
     * Initialize mobile navigation enhancements
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            this.createStylesheet();
            this.enhanceExistingNavigation();
            this.setupSwipeNavigation();
            this.createNavigationShortcuts();
            this.setupPageTransitions();
            this.setupTouchFeedback();
            this.trackNavigationHistory();
            
            // Listen for orientation and resize changes
            window.addEventListener('resize', () => this.handleResize());
            window.addEventListener('orientationchange', () => this.handleOrientationChange());
            
            this.isInitialized = true;
            console.log('Mobile Navigation Enhancer initialized');
            
        } catch (error) {
            console.error('Failed to initialize Mobile Navigation Enhancer:', error);
        }
    }

    /**
     * Create additional mobile-specific styles
     */
    createStylesheet() {
        const style = document.createElement('style');
        style.id = 'mobile-nav-enhancer-styles';
        style.textContent = `
            /* Mobile navigation overlay */
            .mobile-nav-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9998;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                backdrop-filter: blur(2px);
            }
            
            .mobile-nav-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            
            /* Swipe indicator */
            .swipe-indicator {
                position: fixed;
                top: 50%;
                left: 20px;
                transform: translateY(-50%);
                background: rgba(0, 120, 212, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                z-index: 1001;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            }
            
            .swipe-indicator.show {
                opacity: 1;
            }
            
            /* Touch ripple effect */
            .touch-ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(0, 120, 212, 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            }
            
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            /* Navigation shortcuts container */
            .mobile-nav-shortcuts {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                gap: 12px;
                opacity: 0;
                transform: translateX(100px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .mobile-nav-shortcuts.show {
                opacity: 1;
                transform: translateX(0);
            }
            
            /* Page transition overlay */
            .page-transition-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: white;
                z-index: 9999;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .page-transition-overlay.active {
                opacity: 0.8;
                visibility: visible;
            }
            
            /* Loading indicator */
            .mobile-nav-loading {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .mobile-nav-loading.show {
                opacity: 1;
                visibility: visible;
            }
            
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #0078d4;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Enhance existing navigation with mobile-specific features
     */
    enhanceExistingNavigation() {
        const nav = document.querySelector('nav');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (!nav || !mobileToggle || !navMenu) return;
        
        // Create overlay for mobile menu
        const overlay = document.createElement('div');
        overlay.className = 'mobile-nav-overlay';
        document.body.appendChild(overlay);
        
        // Enhanced mobile menu toggle
        mobileToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMobileMenu();
        });
        
        // Close menu when clicking overlay
        overlay.addEventListener('click', () => {
            this.closeMobileMenu();
        });
        
        // Enhanced keyboard navigation
        this.setupKeyboardNavigation(navMenu);
        
        // Add touch feedback to navigation items
        this.addTouchFeedback(navMenu);
    }

    /**
     * Toggle mobile menu with enhanced animations
     */
    toggleMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const overlay = document.querySelector('.mobile-nav-overlay');
        
        if (!mobileToggle || !navMenu || !overlay) return;
        
        const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        
        mobileToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active', !isExpanded);
        overlay.classList.toggle('active', !isExpanded);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = !isExpanded ? 'hidden' : '';
        
        // Focus management
        if (!isExpanded) {
            // Focus first menu item when opening
            setTimeout(() => {
                const firstLink = navMenu.querySelector('a');
                if (firstLink) firstLink.focus();
            }, 300);
        } else {
            // Return focus to toggle button when closing
            mobileToggle.focus();
        }
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const overlay = document.querySelector('.mobile-nav-overlay');
        
        if (!mobileToggle || !navMenu || !overlay) return;
        
        mobileToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Setup swipe navigation for mobile
     */
    setupSwipeNavigation() {
        if (!this.config.enableSwipeNavigation || !this.isMobile) return;
        
        let startX = 0;
        let startY = 0;
        let isSwipeActive = false;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwipeActive = true;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!isSwipeActive) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = startX - currentX;
            const diffY = startY - currentY;
            
            // Check if it's a horizontal swipe
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > this.swipeThreshold) {
                if (diffX > 0) {
                    // Swipe left - next page or forward navigation
                    this.handleSwipeLeft();
                } else {
                    // Swipe right - previous page or back navigation
                    this.handleSwipeRight();
                }
                isSwipeActive = false;
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            isSwipeActive = false;
        }, { passive: true });
    }

    /**
     * Handle swipe left gesture
     */
    handleSwipeLeft() {
        // Show swipe indicator
        this.showSwipeIndicator('Next →');
        
        // Determine next logical page
        const currentPath = window.location.pathname;
        let nextPath = null;
        
        if (currentPath === '/') {
            nextPath = '/docs/';
        } else if (currentPath.includes('/docs/installation/')) {
            nextPath = '/docs/quick-start/';
        } else if (currentPath.includes('/docs/quick-start/')) {
            nextPath = '/docs/addon-development/';
        }
        
        if (nextPath) {
            setTimeout(() => {
                this.navigateWithTransition(nextPath);
            }, 500);
        }
    }

    /**
     * Handle swipe right gesture
     */
    handleSwipeRight() {
        // Show swipe indicator
        this.showSwipeIndicator('← Back');
        
        // Navigate back in history or to logical previous page
        if (this.navigationHistory.length > 1) {
            setTimeout(() => {
                window.history.back();
            }, 500);
        } else {
            // Determine previous logical page
            const currentPath = window.location.pathname;
            let prevPath = null;
            
            if (currentPath.includes('/docs/')) {
                prevPath = '/';
            }
            
            if (prevPath) {
                setTimeout(() => {
                    this.navigateWithTransition(prevPath);
                }, 500);
            }
        }
    }

    /**
     * Show swipe indicator
     */
    showSwipeIndicator(text) {
        let indicator = document.querySelector('.swipe-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'swipe-indicator';
            document.body.appendChild(indicator);
        }
        
        indicator.textContent = text;
        indicator.classList.add('show');
        
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 1500);
    }

    /**
     * Create navigation shortcuts for common pathways
     */
    createNavigationShortcuts() {
        if (!this.config.enableShortcuts || !this.isMobile) return;
        
        const shortcutsContainer = document.createElement('div');
        shortcutsContainer.className = 'mobile-nav-shortcuts';
        
        // Define shortcuts based on current page
        const currentPath = window.location.pathname;
        const shortcuts = this.getRelevantShortcuts(currentPath);
        
        shortcuts.forEach(shortcut => {
            const button = document.createElement('a');
            button.className = `nav-shortcut ${shortcut.type}`;
            button.href = shortcut.url;
            button.innerHTML = shortcut.icon;
            button.setAttribute('aria-label', shortcut.label);
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateWithTransition(shortcut.url);
            });
            
            shortcutsContainer.appendChild(button);
        });
        
        document.body.appendChild(shortcutsContainer);
        
        // Show shortcuts after a delay
        setTimeout(() => {
            shortcutsContainer.classList.add('show');
        }, 1000);
    }

    /**
     * Get relevant shortcuts based on current page
     */
    getRelevantShortcuts(currentPath) {
        const shortcuts = [];
        
        if (currentPath === '/') {
            shortcuts.push(
                { type: 'docs', url: '/docs/', icon: '📚', label: 'Documentation' },
                { type: 'docs', url: '/docs/quick-start/', icon: '🚀', label: 'Quick Start' }
            );
        } else if (currentPath.includes('/docs/')) {
            shortcuts.push(
                { type: 'home', url: '/', icon: '🏠', label: 'Homepage' }
            );
            
            if (currentPath !== '/docs/installation/') {
                shortcuts.push({ type: 'docs', url: '/docs/installation/', icon: '⚙️', label: 'Installation' });
            }
            
            if (currentPath !== '/docs/quick-start/') {
                shortcuts.push({ type: 'docs', url: '/docs/quick-start/', icon: '🚀', label: 'Quick Start' });
            }
        }
        
        // Add back button if there's navigation history
        if (this.navigationHistory.length > 1) {
            shortcuts.unshift({ type: 'back', url: 'javascript:history.back()', icon: '←', label: 'Go Back' });
        }
        
        return shortcuts;
    }

    /**
     * Setup smooth page transitions
     */
    setupPageTransitions() {
        if (!this.config.enableTransitions) return;
        
        // Create transition overlay
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        document.body.appendChild(overlay);
        
        // Create loading indicator
        const loading = document.createElement('div');
        loading.className = 'mobile-nav-loading';
        loading.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(loading);
        
        // Intercept navigation links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && this.shouldInterceptLink(link)) {
                e.preventDefault();
                this.navigateWithTransition(link.href);
            }
        });
    }

    /**
     * Check if link should be intercepted for transitions
     */
    shouldInterceptLink(link) {
        const href = link.getAttribute('href');
        
        // Skip external links, anchors, and special links
        if (!href || 
            href.startsWith('#') || 
            href.startsWith('mailto:') || 
            href.startsWith('tel:') ||
            href.startsWith('javascript:') ||
            link.target === '_blank' ||
            link.hostname !== window.location.hostname) {
            return false;
        }
        
        return true;
    }

    /**
     * Navigate with smooth transition
     */
    navigateWithTransition(url) {
        const overlay = document.querySelector('.page-transition-overlay');
        const loading = document.querySelector('.mobile-nav-loading');
        
        if (!overlay || !loading) {
            window.location.href = url;
            return;
        }
        
        // Close mobile menu if open
        this.closeMobileMenu();
        
        // Show transition overlay
        overlay.classList.add('active');
        loading.classList.add('show');
        
        // Add to navigation history
        this.navigationHistory.push(window.location.pathname);
        
        // Navigate after transition
        setTimeout(() => {
            window.location.href = url;
        }, this.config.transitionDuration);
    }

    /**
     * Setup touch feedback for interactive elements
     */
    setupTouchFeedback() {
        document.addEventListener('touchstart', (e) => {
            const target = e.target.closest('a, button, .nav-menu li');
            if (target && this.isMobile) {
                this.createTouchRipple(e, target);
            }
        }, { passive: true });
    }

    /**
     * Create touch ripple effect
     */
    createTouchRipple(event, element) {
        const ripple = document.createElement('span');
        ripple.className = 'touch-ripple';
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.touches[0].clientX - rect.left - size / 2;
        const y = event.touches[0].clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    /**
     * Add touch feedback to navigation elements
     */
    addTouchFeedback(container) {
        const links = container.querySelectorAll('a');
        
        links.forEach(link => {
            link.addEventListener('touchstart', () => {
                link.style.backgroundColor = 'rgba(0, 120, 212, 0.1)';
            }, { passive: true });
            
            link.addEventListener('touchend', () => {
                setTimeout(() => {
                    link.style.backgroundColor = '';
                }, 150);
            }, { passive: true });
        });
    }

    /**
     * Setup enhanced keyboard navigation
     */
    setupKeyboardNavigation(navMenu) {
        navMenu.addEventListener('keydown', (e) => {
            const focusableElements = navMenu.querySelectorAll('a, button');
            const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
            
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % focusableElements.length;
                    focusableElements[nextIndex].focus();
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
                    focusableElements[prevIndex].focus();
                    break;
                    
                case 'Escape':
                    this.closeMobileMenu();
                    break;
                    
                case 'Home':
                    e.preventDefault();
                    focusableElements[0].focus();
                    break;
                    
                case 'End':
                    e.preventDefault();
                    focusableElements[focusableElements.length - 1].focus();
                    break;
            }
        });
    }

    /**
     * Track navigation history for better back navigation
     */
    trackNavigationHistory() {
        // Add current page to history
        this.navigationHistory.push(window.location.pathname);
        
        // Listen for popstate events
        window.addEventListener('popstate', () => {
            // Update shortcuts when navigating back/forward
            setTimeout(() => {
                this.updateNavigationShortcuts();
            }, 100);
        });
    }

    /**
     * Update navigation shortcuts based on current page
     */
    updateNavigationShortcuts() {
        const shortcutsContainer = document.querySelector('.mobile-nav-shortcuts');
        if (!shortcutsContainer) return;
        
        // Remove existing shortcuts
        shortcutsContainer.innerHTML = '';
        
        // Add new shortcuts
        const currentPath = window.location.pathname;
        const shortcuts = this.getRelevantShortcuts(currentPath);
        
        shortcuts.forEach(shortcut => {
            const button = document.createElement('a');
            button.className = `nav-shortcut ${shortcut.type}`;
            button.href = shortcut.url;
            button.innerHTML = shortcut.icon;
            button.setAttribute('aria-label', shortcut.label);
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateWithTransition(shortcut.url);
            });
            
            shortcutsContainer.appendChild(button);
        });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        if (wasMobile !== this.isMobile) {
            // Mobile state changed, reinitialize components
            if (this.isMobile) {
                this.createNavigationShortcuts();
            } else {
                // Remove mobile-specific elements
                const shortcuts = document.querySelector('.mobile-nav-shortcuts');
                if (shortcuts) shortcuts.remove();
                
                // Close mobile menu if open
                this.closeMobileMenu();
            }
        }
    }

    /**
     * Handle orientation change
     */
    handleOrientationChange() {
        // Close mobile menu on orientation change
        this.closeMobileMenu();
        
        // Recalculate mobile state after orientation change
        setTimeout(() => {
            this.handleResize();
        }, 100);
    }

    /**
     * Get current page path
     */
    getCurrentPath() {
        return window.location.pathname + window.location.hash;
    }

    /**
     * Destroy the enhancer and clean up
     */
    destroy() {
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        
        // Remove created elements
        const elementsToRemove = [
            '.mobile-nav-overlay',
            '.mobile-nav-shortcuts',
            '.page-transition-overlay',
            '.mobile-nav-loading',
            '#mobile-nav-enhancer-styles'
        ];
        
        elementsToRemove.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) element.remove();
        });
        
        // Reset body overflow
        document.body.style.overflow = '';
        
        this.isInitialized = false;
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth <= 768) {
        const enhancer = new MobileNavigationEnhancer();
        enhancer.initialize();
        
        // Make globally available
        window.mobileNavEnhancer = enhancer;
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileNavigationEnhancer;
}

window.MobileNavigationEnhancer = MobileNavigationEnhancer;