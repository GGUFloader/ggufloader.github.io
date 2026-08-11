/**
 * Version Updates Section Enhancement
 * Adds interactive features and animations to the version 2.0.0 updates section
 */

document.addEventListener('DOMContentLoaded', function() {
    initVersionUpdates();
});

function initVersionUpdates() {
    // Initialize intersection observer for animations
    initScrollAnimations();
    
    // Add interactive features to update cards
    initUpdateCards();
    
    // Add version badge animation
    initVersionBadge();
    
    // Add stats counter animation
    initStatsCounter();
}

/**
 * Initialize scroll-based animations
 */
function initScrollAnimations() {
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe update cards
        const updateCards = document.querySelectorAll('.update-card');
        updateCards.forEach(card => {
            observer.observe(card);
        });

        // Observe CTA section
        const ctaSection = document.querySelector('.updates-cta');
        if (ctaSection) {
            observer.observe(ctaSection);
        }
    }
}

/**
 * Add interactive features to update cards
 */
function initUpdateCards() {
    const updateCards = document.querySelectorAll('.update-card');
    
    updateCards.forEach(card => {
        // Add hover sound effect (optional)
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Add click interaction for mobile
        card.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                this.classList.toggle('mobile-expanded');
            }
        });
        
        // Add keyboard navigation
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

/**
 * Initialize version badge animation
 */
function initVersionBadge() {
    const versionBadge = document.querySelector('.version-badge');
    if (versionBadge) {
        // Add click interaction
        versionBadge.addEventListener('click', function() {
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = 'pulse 2s infinite';
            }, 100);
        });
        
        // Add accessibility
        versionBadge.setAttribute('role', 'button');
        versionBadge.setAttribute('aria-label', 'New version 2.0.0 available');
    }
}

/**
 * Initialize stats counter animation
 */
function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStatNumber(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => {
        observer.observe(stat);
    });
}

/**
 * Animate stat numbers
 */
function animateStatNumber(element) {
    const text = element.textContent;
    const isVersion = text.includes('2.0.0');
    const isDate = text.includes('Jan');
    const isNumber = text.includes('+');
    
    if (isVersion) {
        // Animate version number
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'scale(1.1)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 300);
        }, 200);
    } else if (isDate) {
        // Animate date
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.color = '#4ecdc4';
            setTimeout(() => {
                element.style.color = '#ff6b6b';
            }, 500);
        }, 400);
    } else if (isNumber) {
        // Animate number counting
        const finalNumber = parseInt(text.replace('+', ''));
        let currentNumber = 0;
        const increment = finalNumber / 20;
        
        const counter = setInterval(() => {
            currentNumber += increment;
            if (currentNumber >= finalNumber) {
                currentNumber = finalNumber;
                clearInterval(counter);
                element.textContent = finalNumber + '+';
            } else {
                element.textContent = Math.floor(currentNumber) + '+';
            }
        }, 50);
    }
}

/**
 * Add smooth scrolling to CTA buttons
 */
document.addEventListener('DOMContentLoaded', function() {
    const ctaButtons = document.querySelectorAll('.updates-cta .cta-button');
    
    ctaButtons.forEach(button => {
        if (button.getAttribute('href') === '#download') {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const downloadSection = document.getElementById('download');
                if (downloadSection) {
                    downloadSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
    });
});

/**
 * Add feature tag interactions
 */
document.addEventListener('DOMContentLoaded', function() {
    const featureTags = document.querySelectorAll('.feature-tag');
    
    featureTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.background = 'rgba(255, 255, 255, 0.3)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.background = 'rgba(255, 255, 255, 0.2)';
        });
    });
});

/**
 * Add parallax effect to background (optional)
 */
function initParallaxEffect() {
    const versionSection = document.querySelector('.version-updates');
    
    if (versionSection && window.innerWidth > 768) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const sectionTop = versionSection.offsetTop;
            const sectionHeight = versionSection.offsetHeight;
            
            if (scrolled > sectionTop - window.innerHeight && scrolled < sectionTop + sectionHeight) {
                const parallaxSpeed = 0.5;
                const yPos = -(scrolled - sectionTop) * parallaxSpeed;
                versionSection.style.backgroundPosition = `center ${yPos}px`;
            }
        });
    }
}

// Initialize parallax effect if supported
if (window.innerWidth > 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    initParallaxEffect();
}

/**
 * Add accessibility enhancements
 */
document.addEventListener('DOMContentLoaded', function() {
    // Add ARIA labels to interactive elements
    const updateCards = document.querySelectorAll('.update-card');
    updateCards.forEach((card, index) => {
        const title = card.querySelector('h3').textContent;
        card.setAttribute('aria-label', `Feature update: ${title}`);
        card.setAttribute('role', 'article');
    });
    
    // Add focus management
    const versionSection = document.querySelector('.version-updates');
    if (versionSection) {
        versionSection.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                // Ensure proper tab order
                const focusableElements = versionSection.querySelectorAll(
                    'a, button, [tabindex]:not([tabindex="-1"])'
                );
                
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }
});

/**
 * Performance optimization - lazy load animations
 */
function optimizeAnimations() {
    // Disable animations on low-end devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        const style = document.createElement('style');
        style.textContent = `
            .update-card { animation: none !important; }
            .version-badge { animation: none !important; }
        `;
        document.head.appendChild(style);
    }
    
    // Reduce animations on battery saver mode
    if ('getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            if (!battery.charging && battery.level < 0.2) {
                document.body.classList.add('reduce-animations');
            }
        });
    }
}

// Initialize performance optimizations
optimizeAnimations();