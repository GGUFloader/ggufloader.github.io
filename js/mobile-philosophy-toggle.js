/**
 * Mobile Philosophy Section Toggle Functionality
 * Provides collapsible philosophy section for mobile devices
 */

class MobilePhilosophyToggle {
    constructor() {
        this.isExpanded = false;
        this.toggle = null;
        this.content = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Only run on mobile devices
        if (window.innerWidth > 768) {
            return;
        }

        this.createMobilePhilosophySection();
        this.bindEvents();
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    createMobilePhilosophySection() {
        const originalPhilosophy = document.querySelector('.hero-philosophy');
        if (!originalPhilosophy) {
            return;
        }

        // Get the philosophy content
        const philosophyTitle = originalPhilosophy.querySelector('.philosophy-title');
        const philosophyText = originalPhilosophy.querySelector('.philosophy-text');
        const philosophyAttribution = originalPhilosophy.querySelector('.philosophy-attribution');

        if (!philosophyTitle || !philosophyText) {
            return;
        }

        // Create mobile collapsible version
        const mobilePhilosophy = document.createElement('div');
        mobilePhilosophy.className = 'hero-philosophy mobile-collapsible mobile-philosophy-collapsible';
        
        // Create toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'philosophy-toggle';
        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.setAttribute('aria-controls', 'philosophy-content');
        toggleButton.innerHTML = `
            <span>Our Philosophy</span>
            <span class="philosophy-toggle-icon" aria-hidden="true">▼</span>
        `;

        // Create content container
        const contentContainer = document.createElement('div');
        contentContainer.className = 'philosophy-content';
        contentContainer.id = 'philosophy-content';
        contentContainer.setAttribute('aria-hidden', 'true');
        
        // Clone the content
        const titleClone = philosophyTitle.cloneNode(true);
        const textClone = philosophyText.cloneNode(true);
        
        contentContainer.appendChild(titleClone);
        contentContainer.appendChild(textClone);
        
        if (philosophyAttribution) {
            const attributionClone = philosophyAttribution.cloneNode(true);
            contentContainer.appendChild(attributionClone);
        }

        // Assemble the mobile philosophy section
        mobilePhilosophy.appendChild(toggleButton);
        mobilePhilosophy.appendChild(contentContainer);

        // Insert after the original philosophy section
        originalPhilosophy.parentNode.insertBefore(mobilePhilosophy, originalPhilosophy.nextSibling);

        // Store references
        this.toggle = toggleButton;
        this.content = contentContainer;
    }

    bindEvents() {
        if (!this.toggle || !this.content) {
            return;
        }

        // Click event
        this.toggle.addEventListener('click', (e) => this.handleToggle(e));
        
        // Keyboard events
        this.toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handleToggle(e);
            }
        });

        // Touch events for better mobile experience
        this.toggle.addEventListener('touchstart', (e) => {
            this.toggle.style.transform = 'scale(0.98)';
        });

        this.toggle.addEventListener('touchend', (e) => {
            this.toggle.style.transform = '';
        });
    }

    handleToggle(event) {
        event.preventDefault();
        
        if (this.isExpanded) {
            this.collapse();
        } else {
            this.expand();
        }
    }

    expand() {
        if (!this.toggle || !this.content) {
            return;
        }

        this.isExpanded = true;
        
        // Update ARIA attributes
        this.toggle.setAttribute('aria-expanded', 'true');
        this.content.setAttribute('aria-hidden', 'false');
        
        // Add classes for styling
        this.toggle.classList.add('expanded');
        this.content.classList.add('expanded');
        this.content.classList.remove('collapsing');
        this.content.classList.add('expanding');

        // Announce to screen readers
        this.announceToScreenReader('Philosophy section expanded');

        // Remove animation class after animation completes
        setTimeout(() => {
            this.content.classList.remove('expanding');
        }, 400);
    }

    collapse() {
        if (!this.toggle || !this.content) {
            return;
        }

        this.isExpanded = false;
        
        // Update ARIA attributes
        this.toggle.setAttribute('aria-expanded', 'false');
        this.content.setAttribute('aria-hidden', 'true');
        
        // Add classes for styling
        this.toggle.classList.remove('expanded');
        this.content.classList.remove('expanded');
        this.content.classList.remove('expanding');
        this.content.classList.add('collapsing');

        // Announce to screen readers
        this.announceToScreenReader('Philosophy section collapsed');

        // Remove animation class after animation completes
        setTimeout(() => {
            this.content.classList.remove('collapsing');
        }, 400);
    }

    handleResize() {
        // Show/hide based on screen size
        const mobilePhilosophy = document.querySelector('.mobile-philosophy-collapsible');
        const originalPhilosophy = document.querySelector('.hero-philosophy:not(.mobile-collapsible)');
        
        if (window.innerWidth <= 768) {
            if (mobilePhilosophy) {
                mobilePhilosophy.style.display = 'block';
            }
            if (originalPhilosophy) {
                originalPhilosophy.style.display = 'none';
            }
        } else {
            if (mobilePhilosophy) {
                mobilePhilosophy.style.display = 'none';
            }
            if (originalPhilosophy) {
                originalPhilosophy.style.display = 'block';
            }
        }
    }

    announceToScreenReader(message) {
        // Create a temporary element for screen reader announcements
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

// Initialize the mobile philosophy toggle
new MobilePhilosophyToggle();

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobilePhilosophyToggle;
}