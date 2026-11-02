/**
 * Mobile Content Preview System
 * Extends the existing content preview system with mobile-optimized layouts,
 * touch interactions, and mobile-specific content prioritization
 */

class MobileContentPreview {
    constructor(basePreviewSystem) {
        this.baseSystem = basePreviewSystem || window.contentPreviewSystem;
        this.isMobile = window.innerWidth <= 768;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.isInitialized = false;
        
        // Mobile-specific configuration
        this.mobileConfig = {
            maxPreviewLength: 150, // Shorter for mobile
            expandedPreviewLength: 300,
            touchThreshold: 10,
            swipeThreshold: 50,
            animationDuration: 250,
            priorityContent: ['keyPoints', 'sections'], // Show these first on mobile
            collapsedHeight: 120,
            expandedHeight: 'auto'
        };
        
        this.activePreview = null;
        this.previewQueue = [];
    }

    /**
     * Initialize mobile content preview system
     */
    async initialize() {
        if (this.isInitialized || !this.isMobile) return;
        
        try {
            // Wait for base system to be ready
            if (!this.baseSystem || !this.baseSystem.initialized) {
                await this.waitForBaseSystem();
            }
            
            this.createMobileStyles();
            this.setupMobileTouchHandlers();
            this.setupMobileGestures();
            this.setupIntersectionObserver();
            this.optimizeExistingPreviews();
            
            // Listen for orientation changes
            window.addEventListener('orientationchange', () => this.handleOrientationChange());
            window.addEventListener('resize', () => this.handleResize());
            
            this.isInitialized = true;
            console.log('Mobile Content Preview System initialized');
            
        } catch (error) {
            console.error('Failed to initialize Mobile Content Preview System:', error);
        }
    }

    /**
     * Wait for base system to be ready
     */
    waitForBaseSystem() {
        return new Promise((resolve) => {
            const checkSystem = () => {
                if (window.contentPreviewSystem && window.contentPreviewSystem.initialized) {
                    this.baseSystem = window.contentPreviewSystem;
                    resolve();
                } else {
                    setTimeout(checkSystem, 100);
                }
            };
            checkSystem();
        });
    }

    /**
     * Create mobile-specific styles
     */
    createMobileStyles() {
        const style = document.createElement('style');
        style.id = 'mobile-content-preview-styles';
        style.textContent = `
            /* Mobile Content Preview Styles */
            @media (max-width: 768px) {
                .content-preview {
                    border-radius: 12px;
                    padding: 16px;
                    margin: 12px 0;
                    background: #ffffff;
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e9ecef;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                
                .content-preview.mobile-collapsed {
                    max-height: 120px;
                }
                
                .content-preview.mobile-expanded {
                    max-height: none;
                }
                
                .content-preview.preview-hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                }
                
                .preview-header {
                    margin-bottom: 12px;
                }
                
                .preview-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #2c3e50;
                    margin: 0 0 6px 0;
                    line-height: 1.3;
                }
                
                .preview-description {
                    font-size: 0.9rem;
                    color: #6c757d;
                    line-height: 1.4;
                    margin: 0;
                }
                
                .preview-key-points {
                    margin: 12px 0;
                }
                
                .preview-key-points h5 {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #495057;
                    margin: 0 0 8px 0;
                }
                
                .preview-key-points ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .preview-key-points li {
                    position: relative;
                    padding: 4px 0 4px 20px;
                    font-size: 0.85rem;
                    line-height: 1.4;
                    color: #495057;
                }
                
                .preview-key-points li::before {
                    content: "✓";
                    position: absolute;
                    left: 0;
                    color: #28a745;
                    font-weight: bold;
                }
                
                .preview-sections {
                    margin: 12px 0;
                }
                
                .preview-section {
                    margin-bottom: 10px;
                }
                
                .preview-section h6 {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #0078d4;
                    margin: 0 0 4px 0;
                }
                
                .preview-section p {
                    font-size: 0.8rem;
                    line-height: 1.4;
                    color: #6c757d;
                    margin: 0;
                }
                
                .preview-code-example {
                    margin: 12px 0;
                    background: #f8f9fa;
                    border-radius: 6px;
                    padding: 10px;
                    border-left: 3px solid #0078d4;
                }
                
                .preview-code-example h6 {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #495057;
                    margin: 0 0 6px 0;
                }
                
                .preview-code-example pre {
                    margin: 0;
                    font-size: 0.75rem;
                    line-height: 1.3;
                    overflow-x: auto;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
                
                .preview-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid #e9ecef;
                    flex-wrap: wrap;
                }
                
                .read-more-btn {
                    flex: 1;
                    min-width: 120px;
                    padding: 10px 16px;
                    background: #0078d4;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    text-align: center;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    min-height: 44px;
                }
                
                .read-more-btn:hover,
                .read-more-btn:focus {
                    background: #106ebe;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0, 120, 212, 0.3);
                }
                
                .read-more-btn:active {
                    transform: translateY(0);
                }
                
                .expand-preview-btn {
                    padding: 10px 16px;
                    background: transparent;
                    color: #0078d4;
                    border: 1px solid #0078d4;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    min-height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    white-space: nowrap;
                }
                
                .expand-preview-btn:hover,
                .expand-preview-btn:focus {
                    background: #0078d4;
                    color: white;
                }
                
                .expand-preview-btn:active {
                    transform: scale(0.98);
                }
                
                .expand-preview-btn.expanded {
                    background: #0078d4;
                    color: white;
                }
                
                /* Mobile swipe indicators */
                .mobile-swipe-indicator {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 4px;
                    height: 20px;
                    background: linear-gradient(to bottom, #0078d4, transparent);
                    border-radius: 2px;
                    opacity: 0.5;
                }
                
                /* Touch feedback */
                .content-preview.touch-active {
                    transform: scale(0.98);
                    transition: transform 0.1s ease;
                }
                
                /* Loading state */
                .content-preview.loading {
                    opacity: 0.6;
                    pointer-events: none;
                }
                
                .content-preview.loading::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 20px;
                    height: 20px;
                    margin: -10px 0 0 -10px;
                    border: 2px solid #f3f3f3;
                    border-top: 2px solid #0078d4;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                /* Fade in animation */
                .content-preview.fade-in {
                    animation: fadeInUp 0.3s ease forwards;
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                /* Priority content highlighting */
                .preview-priority-content {
                    background: linear-gradient(90deg, rgba(0, 120, 212, 0.05) 0%, transparent 100%);
                    border-left: 2px solid #0078d4;
                    padding-left: 10px;
                    margin: 8px 0;
                }
            }
            
            /* Touch device optimizations */
            @media (max-width: 768px) and (pointer: coarse) {
                .content-preview {
                    padding: 20px;
                    margin: 16px 0;
                }
                
                .read-more-btn,
                .expand-preview-btn {
                    min-height: 48px;
                    padding: 12px 20px;
                    font-size: 0.9rem;
                }
                
                .preview-title {
                    font-size: 1.2rem;
                }
                
                .preview-description {
                    font-size: 1rem;
                }
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .content-preview,
                .read-more-btn,
                .expand-preview-btn {
                    transition: none;
                }
                
                .content-preview.fade-in {
                    animation: none;
                }
            }
            
            /* High contrast mode */
            @media (prefers-contrast: high) {
                .content-preview {
                    border: 2px solid currentColor;
                }
                
                .read-more-btn,
                .expand-preview-btn {
                    border: 2px solid currentColor;
                }
            }
            
            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
                .content-preview {
                    background: #1a1a1a;
                    border-color: #333333;
                    color: #ffffff;
                }
                
                .preview-title {
                    color: #ffffff;
                }
                
                .preview-description,
                .preview-section p {
                    color: #cccccc;
                }
                
                .preview-code-example {
                    background: #2a2a2a;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Setup mobile touch handlers
     */
    setupMobileTouchHandlers() {
        document.addEventListener('touchstart', (e) => {
            const preview = e.target.closest('.content-preview');
            if (preview && this.isMobile) {
                this.handleTouchStart(e, preview);
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            const preview = e.target.closest('.content-preview');
            if (preview && this.isMobile) {
                this.handleTouchEnd(e, preview);
            }
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            const preview = e.target.closest('.content-preview');
            if (preview && this.isMobile) {
                this.handleTouchMove(e, preview);
            }
        }, { passive: true });
    }

    /**
     * Handle touch start
     */
    handleTouchStart(event, preview) {
        this.touchStartY = event.touches[0].clientY;
        this.touchStartTime = Date.now();
        preview.classList.add('touch-active');
        
        // Add touch ripple effect
        this.createTouchRipple(event, preview);
    }

    /**
     * Handle touch end
     */
    handleTouchEnd(event, preview) {
        preview.classList.remove('touch-active');
        
        const touchEndY = event.changedTouches[0].clientY;
        const touchDuration = Date.now() - this.touchStartTime;
        const touchDistance = Math.abs(touchEndY - this.touchStartY);
        
        // Check for tap gesture (short duration, minimal movement)
        if (touchDuration < 300 && touchDistance < this.mobileConfig.touchThreshold) {
            this.handlePreviewTap(preview);
        }
        
        // Check for swipe gesture
        if (touchDistance > this.mobileConfig.swipeThreshold) {
            if (touchEndY < this.touchStartY) {
                // Swipe up - expand preview
                this.expandPreview(preview);
            } else {
                // Swipe down - collapse preview
                this.collapsePreview(preview);
            }
        }
    }

    /**
     * Handle touch move
     */
    handleTouchMove(event, preview) {
        const touchY = event.touches[0].clientY;
        const distance = touchY - this.touchStartY;
        
        // Provide visual feedback for swipe gestures
        if (Math.abs(distance) > 20) {
            if (distance < 0) {
                // Swiping up
                preview.style.transform = `translateY(${Math.max(distance / 4, -10)}px)`;
            } else {
                // Swiping down
                preview.style.transform = `translateY(${Math.min(distance / 4, 10)}px)`;
            }
        }
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
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(0, 120, 212, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    /**
     * Handle preview tap
     */
    handlePreviewTap(preview) {
        // Toggle expansion on tap
        if (preview.classList.contains('mobile-expanded')) {
            this.collapsePreview(preview);
        } else {
            this.expandPreview(preview);
        }
    }

    /**
     * Setup mobile gesture recognition
     */
    setupMobileGestures() {
        // Double tap to expand/collapse
        let lastTap = 0;
        
        document.addEventListener('touchend', (e) => {
            const preview = e.target.closest('.content-preview');
            if (!preview || !this.isMobile) return;
            
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 500 && tapLength > 0) {
                // Double tap detected
                e.preventDefault();
                this.handleDoubleTap(preview);
            }
            
            lastTap = currentTime;
        });
    }

    /**
     * Handle double tap gesture
     */
    handleDoubleTap(preview) {
        const docId = preview.dataset.docId;
        if (!docId) return;
        
        // Navigate to full documentation on double tap
        const readMoreBtn = preview.querySelector('.read-more-btn');
        if (readMoreBtn) {
            readMoreBtn.click();
        }
    }

    /**
     * Expand preview with mobile-optimized content
     */
    expandPreview(preview) {
        const docId = preview.dataset.docId;
        if (!docId || !this.baseSystem) return;
        
        preview.classList.add('loading');
        
        // Generate mobile-optimized expanded content
        const expandedPreview = this.generateMobileExpandedPreview(docId);
        const html = this.renderMobilePreview(expandedPreview, { expanded: true });
        
        setTimeout(() => {
            preview.innerHTML = html;
            preview.classList.remove('loading', 'mobile-collapsed');
            preview.classList.add('mobile-expanded');
            preview.style.transform = '';
            
            // Smooth scroll to show expanded content
            preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, this.mobileConfig.animationDuration);
    }

    /**
     * Collapse preview to mobile-optimized summary
     */
    collapsePreview(preview) {
        const docId = preview.dataset.docId;
        if (!docId || !this.baseSystem) return;
        
        const collapsedPreview = this.generateMobilePreview(docId);
        const html = this.renderMobilePreview(collapsedPreview, { expanded: false });
        
        preview.innerHTML = html;
        preview.classList.remove('mobile-expanded');
        preview.classList.add('mobile-collapsed');
        preview.style.transform = '';
    }

    /**
     * Generate mobile-optimized preview
     */
    generateMobilePreview(docId) {
        const basePreview = this.baseSystem.generatePreview(docId, this.mobileConfig.maxPreviewLength);
        
        return {
            ...basePreview,
            keyPoints: basePreview.keyPoints.slice(0, 2), // Show only top 2 on mobile
            sections: basePreview.sections.slice(0, 1), // Show only first section
            mobileOptimized: true
        };
    }

    /**
     * Generate mobile-optimized expanded preview
     */
    generateMobileExpandedPreview(docId) {
        const basePreview = this.baseSystem.generatePreview(docId, this.mobileConfig.expandedPreviewLength);
        
        return {
            ...basePreview,
            keyPoints: basePreview.keyPoints.slice(0, 4), // Show more key points when expanded
            sections: basePreview.sections.slice(0, 3), // Show more sections when expanded
            mobileOptimized: true,
            expanded: true
        };
    }

    /**
     * Render mobile-optimized preview HTML
     */
    renderMobilePreview(preview, options = {}) {
        const { expanded = false } = options;
        
        let html = `
            <div class="content-preview ${expanded ? 'mobile-expanded' : 'mobile-collapsed'}" data-doc-id="${preview.id}">
                <div class="mobile-swipe-indicator"></div>
                <div class="preview-header">
                    <h4 class="preview-title">${preview.title}</h4>
                    <p class="preview-description">${preview.description}</p>
                </div>
        `;
        
        // Prioritize key points for mobile
        if (preview.keyPoints && preview.keyPoints.length > 0) {
            html += `
                <div class="preview-key-points preview-priority-content">
                    <h5>Key Features:</h5>
                    <ul>
                        ${preview.keyPoints.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Show sections if expanded or if no key points
        if ((expanded || !preview.keyPoints.length) && preview.sections.length > 0) {
            html += `
                <div class="preview-sections">
                    ${preview.sections.map(section => `
                        <div class="preview-section">
                            <h6>${section.title}</h6>
                            <p>${section.content}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // Show code example only when expanded
        if (expanded && preview.codeExample) {
            html += `
                <div class="preview-code-example">
                    <h6>Quick Example:</h6>
                    <pre><code class="language-${preview.codeExample.language}">${preview.codeExample.code}</code></pre>
                </div>
            `;
        }
        
        html += `
                <div class="preview-actions">
                    <a href="${preview.readMoreUrl}" class="read-more-btn" aria-label="${preview.readMoreText}">
                        📚 ${preview.readMoreText}
                    </a>
        `;
        
        if (!expanded) {
            html += `
                    <button class="expand-preview-btn" data-doc-id="${preview.id}" aria-label="Show more details">
                        ▼ More
                    </button>
            `;
        } else {
            html += `
                    <button class="expand-preview-btn expanded" data-doc-id="${preview.id}" aria-label="Show less details">
                        ▲ Less
                    </button>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }

    /**
     * Setup intersection observer for lazy loading
     */
    setupIntersectionObserver() {
        if (!window.IntersectionObserver) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const preview = entry.target;
                    preview.classList.add('fade-in');
                    observer.unobserve(preview);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        // Observe existing previews
        document.querySelectorAll('.content-preview').forEach(preview => {
            observer.observe(preview);
        });
        
        // Store observer for future use
        this.intersectionObserver = observer;
    }

    /**
     * Optimize existing previews for mobile
     */
    optimizeExistingPreviews() {
        const existingPreviews = document.querySelectorAll('.content-preview');
        
        existingPreviews.forEach(preview => {
            const docId = preview.dataset.docId;
            if (docId) {
                // Replace with mobile-optimized version
                const mobilePreview = this.generateMobilePreview(docId);
                const html = this.renderMobilePreview(mobilePreview);
                preview.outerHTML = html;
            }
        });
        
        // Re-setup intersection observer for new previews
        if (this.intersectionObserver) {
            document.querySelectorAll('.content-preview').forEach(preview => {
                this.intersectionObserver.observe(preview);
            });
        }
    }

    /**
     * Handle orientation change
     */
    handleOrientationChange() {
        setTimeout(() => {
            this.handleResize();
        }, 100);
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        if (wasMobile !== this.isMobile) {
            if (this.isMobile && !this.isInitialized) {
                this.initialize();
            } else if (!this.isMobile && this.isInitialized) {
                this.destroy();
            }
        }
    }

    /**
     * Embed mobile-optimized preview
     */
    embedMobilePreview(containerId, docId, options = {}) {
        if (!this.isMobile) {
            // Fall back to base system for non-mobile
            return this.baseSystem.embedPreview(containerId, docId, options);
        }
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }
        
        const preview = this.generateMobilePreview(docId);
        const html = this.renderMobilePreview(preview, options);
        
        container.innerHTML = html;
        
        // Add intersection observer
        if (this.intersectionObserver) {
            const previewElement = container.querySelector('.content-preview');
            if (previewElement) {
                this.intersectionObserver.observe(previewElement);
            }
        }
    }

    /**
     * Destroy mobile preview system
     */
    destroy() {
        // Remove event listeners
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        window.removeEventListener('resize', this.handleResize);
        
        // Disconnect intersection observer
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        // Remove mobile styles
        const mobileStyles = document.getElementById('mobile-content-preview-styles');
        if (mobileStyles) {
            mobileStyles.remove();
        }
        
        // Reset previews to base system
        const previews = document.querySelectorAll('.content-preview');
        previews.forEach(preview => {
            const docId = preview.dataset.docId;
            if (docId && this.baseSystem) {
                this.baseSystem.embedPreview(preview.parentElement.id, docId);
            }
        });
        
        this.isInitialized = false;
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth <= 768) {
        // Wait for base system to be ready
        const initMobile = () => {
            if (window.contentPreviewSystem && window.contentPreviewSystem.initialized) {
                const mobilePreview = new MobileContentPreview();
                mobilePreview.initialize();
                window.mobileContentPreview = mobilePreview;
            } else {
                setTimeout(initMobile, 100);
            }
        };
        initMobile();
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileContentPreview;
}

window.MobileContentPreview = MobileContentPreview;