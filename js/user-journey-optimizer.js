/**
 * User Journey Optimizer
 * Creates logical pathways that guide users from homepage through documentation
 * Adds progress indicators and personalized suggestions based on user behavior
 */

class UserJourneyOptimizer {
    constructor(analyzer, components) {
        this.analyzer = analyzer;
        this.components = components;
        this.userProfile = this.loadUserProfile();
        this.journeyPaths = this.defineJourneyPaths();
        this.currentJourney = null;
        this.initialized = false;
    }

    /**
     * Initialize the user journey optimizer
     */
    async initialize() {
        if (this.initialized) return;
        
        try {
            await this.analyzer.initialize();
            await this.components.initialize();
            this.createStylesheet();
            this.trackUserBehavior();
            this.initialized = true;
            console.log('User Journey Optimizer initialized');
        } catch (error) {
            console.error('Failed to initialize User Journey Optimizer:', error);
        }
    }

    /**
     * Define predefined user journey paths
     */
    defineJourneyPaths() {
        return {
            'getting-started': {
                name: 'Getting Started Journey',
                description: 'Perfect for new users who want to get up and running quickly',
                icon: '🚀',
                steps: [
                    { path: '/', section: 'hero', title: 'Welcome to GGUF Loader', description: 'Learn what GGUF Loader can do' },
                    { path: '/#features', section: 'features', title: 'Explore Features', description: 'Discover key capabilities' },
                    { path: '/docs/installation/', title: 'Install GGUF Loader', description: 'Set up on your system' },
                    { path: '/docs/quick-start/', title: 'Quick Start Guide', description: 'Get running in minutes' },
                    { path: '/#how-to', section: 'how-to', title: 'See It In Action', description: 'Watch demonstrations' }
                ],
                estimatedTime: '15 minutes',
                difficulty: 'Beginner'
            },
            'developer': {
                name: 'Developer Journey',
                description: 'For developers who want to extend GGUF Loader with custom addons',
                icon: '👨‍💻',
                steps: [
                    { path: '/', section: 'hero', title: 'GGUF Loader Overview', description: 'Understand the platform' },
                    { path: '/docs/package-structure/', title: 'Architecture Overview', description: 'Learn the technical structure' },
                    { path: '/docs/addon-development/', title: 'Addon Development', description: 'Create custom extensions' },
                    { path: '/docs/addon-api/', title: 'API Reference', description: 'Detailed technical documentation' },
                    { path: '/docs/smart-floater-example/', title: 'Study Examples', description: 'Learn from real implementations' }
                ],
                estimatedTime: '45 minutes',
                difficulty: 'Advanced'
            },
            'power-user': {
                name: 'Power User Journey',
                description: 'For users who want to master all features and capabilities',
                icon: '⚡',
                steps: [
                    { path: '/#features', section: 'features', title: 'All Features', description: 'Comprehensive feature overview' },
                    { path: '/docs/installation/', title: 'Advanced Installation', description: 'GPU acceleration and optimization' },
                    { path: '/docs/quick-start/', title: 'Master the Basics', description: 'Essential workflows' },
                    { path: '/#models', section: 'models', title: 'Model Selection', description: 'Choose the right models' },
                    { path: '/docs/smart-floater-example/', title: 'Advanced Usage', description: 'Maximize productivity' }
                ],
                estimatedTime: '30 minutes',
                difficulty: 'Intermediate'
            },
            'troubleshooting': {
                name: 'Help & Support Journey',
                description: 'Get help with issues and find solutions to common problems',
                icon: '🛠️',
                steps: [
                    { path: '/#faq', section: 'faq', title: 'Common Questions', description: 'Quick answers to frequent issues' },
                    { path: '/docs/installation/', title: 'Installation Help', description: 'Solve setup problems' },
                    { path: '/docs/quick-start/', title: 'Basic Troubleshooting', description: 'Common usage issues' },
                    { path: '/#contact', section: 'contact', title: 'Get Support', description: 'Contact for additional help' }
                ],
                estimatedTime: '10 minutes',
                difficulty: 'Beginner'
            }
        };
    }

    /**
     * Create CSS stylesheet for journey components
     */
    createStylesheet() {
        const style = document.createElement('style');
        style.textContent = `
            .journey-selector {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 12px;
                padding: 25px;
                margin: 30px 0;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            }

            .journey-selector-title {
                font-size: 1.4rem;
                font-weight: 700;
                margin: 0 0 20px 0;
                text-align: center;
            }

            .journey-paths {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
                margin-top: 20px;
            }

            .journey-path {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                border: 2px solid transparent;
                backdrop-filter: blur(10px);
            }

            .journey-path:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-2px);
                border-color: rgba(255, 255, 255, 0.3);
            }

            .journey-path.selected {
                border-color: #ffd700;
                background: rgba(255, 215, 0, 0.2);
            }

            .journey-path-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
            }

            .journey-path-icon {
                font-size: 1.5rem;
            }

            .journey-path-name {
                font-weight: 600;
                font-size: 1.1rem;
                margin: 0;
            }

            .journey-path-description {
                font-size: 0.9rem;
                opacity: 0.9;
                line-height: 1.4;
                margin: 0 0 10px 0;
            }

            .journey-path-meta {
                display: flex;
                justify-content: space-between;
                font-size: 0.8rem;
                opacity: 0.8;
            }

            .journey-progress-indicator {
                position: fixed;
                top: 50%;
                right: 20px;
                transform: translateY(-50%);
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                max-width: 300px;
                border: 1px solid #e9ecef;
            }

            .journey-progress-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #e9ecef;
            }

            .journey-progress-title {
                font-weight: 600;
                color: #2c3e50;
                margin: 0;
                font-size: 0.9rem;
            }

            .journey-progress-close {
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                color: #6c757d;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
            }

            .journey-progress-close:hover {
                background: #f8f9fa;
                color: #495057;
            }

            .journey-steps {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .journey-step {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                margin-bottom: 12px;
                padding: 8px;
                border-radius: 6px;
                transition: all 0.2s ease;
            }

            .journey-step.current {
                background: #e3f2fd;
                border-left: 3px solid #0078d4;
            }

            .journey-step.completed {
                opacity: 0.7;
            }

            .journey-step-number {
                background: #e9ecef;
                color: #495057;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                font-weight: 600;
                flex-shrink: 0;
                margin-top: 2px;
            }

            .journey-step.current .journey-step-number {
                background: #0078d4;
                color: white;
            }

            .journey-step.completed .journey-step-number {
                background: #28a745;
                color: white;
            }

            .journey-step.completed .journey-step-number::before {
                content: "✓";
            }

            .journey-step-content {
                flex: 1;
            }

            .journey-step-title {
                font-weight: 600;
                color: #2c3e50;
                margin: 0 0 2px 0;
                font-size: 0.85rem;
            }

            .journey-step.current .journey-step-title {
                color: #0078d4;
            }

            .journey-step-description {
                color: #6c757d;
                font-size: 0.75rem;
                line-height: 1.3;
                margin: 0;
            }

            .journey-step-link {
                text-decoration: none;
                color: inherit;
                display: block;
            }

            .journey-step-link:hover .journey-step {
                background: #f8f9fa;
            }

            .journey-navigation {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #e9ecef;
                display: flex;
                gap: 10px;
            }

            .journey-nav-button {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #0078d4;
                background: white;
                color: #0078d4;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.8rem;
                font-weight: 500;
                transition: all 0.2s ease;
            }

            .journey-nav-button:hover {
                background: #0078d4;
                color: white;
            }

            .journey-nav-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .journey-nav-button.primary {
                background: #0078d4;
                color: white;
            }

            .journey-nav-button.primary:hover {
                background: #106ebe;
            }

            .personalized-suggestions {
                background: #fff8e1;
                border: 1px solid #ffcc02;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                position: relative;
            }

            .personalized-suggestions::before {
                content: "🎯";
                position: absolute;
                top: -10px;
                left: 20px;
                background: #fff8e1;
                padding: 0 5px;
                font-size: 1.2rem;
            }

            .personalized-title {
                font-size: 1.1rem;
                font-weight: 600;
                color: #f57c00;
                margin: 0 0 15px 0;
            }

            .personalized-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
            }

            .personalized-item {
                background: white;
                padding: 12px;
                border-radius: 6px;
                border: 1px solid #ffcc02;
                transition: all 0.2s ease;
            }

            .personalized-item:hover {
                box-shadow: 0 2px 8px rgba(255, 204, 2, 0.2);
                transform: translateY(-1px);
            }

            .personalized-link {
                text-decoration: none;
                color: inherit;
                display: block;
            }

            .personalized-item-title {
                font-weight: 600;
                color: #f57c00;
                margin: 0 0 4px 0;
                font-size: 0.9rem;
            }

            .personalized-item-reason {
                color: #6c757d;
                font-size: 0.8rem;
                line-height: 1.3;
                margin: 0;
            }

            @media (max-width: 768px) {
                .journey-progress-indicator {
                    position: static;
                    transform: none;
                    margin: 20px 0;
                    right: auto;
                }

                .journey-paths {
                    grid-template-columns: 1fr;
                }

                .journey-navigation {
                    flex-direction: column;
                }

                .personalized-grid {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 1024px) {
                .journey-progress-indicator {
                    right: 10px;
                    max-width: 250px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Load user profile from localStorage
     */
    loadUserProfile() {
        try {
            const stored = localStorage.getItem('gguf-loader-user-profile');
            return stored ? JSON.parse(stored) : {
                visitedPages: [],
                interests: [],
                currentJourney: null,
                completedSteps: [],
                preferences: {},
                lastVisit: null
            };
        } catch (error) {
            console.warn('Failed to load user profile:', error);
            return {
                visitedPages: [],
                interests: [],
                currentJourney: null,
                completedSteps: [],
                preferences: {},
                lastVisit: null
            };
        }
    }

    /**
     * Save user profile to localStorage
     */
    saveUserProfile() {
        try {
            localStorage.setItem('gguf-loader-user-profile', JSON.stringify(this.userProfile));
        } catch (error) {
            console.warn('Failed to save user profile:', error);
        }
    }

    /**
     * Track user behavior
     */
    trackUserBehavior() {
        // Track page visits
        this.trackPageVisit();
        
        // Track scroll behavior
        this.trackScrollBehavior();
        
        // Track link clicks
        this.trackLinkClicks();
        
        // Track time spent on page
        this.trackTimeOnPage();
    }

    /**
     * Track page visits
     */
    trackPageVisit() {
        const currentPath = this.getCurrentPath();
        const now = Date.now();
        
        // Add to visited pages
        if (!this.userProfile.visitedPages.some(visit => visit.path === currentPath)) {
            this.userProfile.visitedPages.push({
                path: currentPath,
                timestamp: now,
                visits: 1
            });
        } else {
            const visit = this.userProfile.visitedPages.find(v => v.path === currentPath);
            visit.visits++;
            visit.lastVisit = now;
        }
        
        this.userProfile.lastVisit = now;
        this.saveUserProfile();
    }

    /**
     * Track scroll behavior to infer interest
     */
    trackScrollBehavior() {
        let maxScroll = 0;
        let scrollTimer = null;
        
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            maxScroll = Math.max(maxScroll, scrollPercent);
            
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                if (maxScroll > 70) {
                    this.inferInterestFromPage();
                }
            }, 2000);
        });
    }

    /**
     * Track link clicks to understand user interests
     */
    trackLinkClicks() {
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link && link.href) {
                const href = link.getAttribute('href');
                if (href) {
                    this.inferInterestFromLink(href, link.textContent);
                }
            }
        });
    }

    /**
     * Track time spent on page
     */
    trackTimeOnPage() {
        const startTime = Date.now();
        
        window.addEventListener('beforeunload', () => {
            const timeSpent = Date.now() - startTime;
            if (timeSpent > 30000) { // More than 30 seconds
                this.inferInterestFromTimeSpent(timeSpent);
            }
        });
    }

    /**
     * Infer user interests from current page
     */
    inferInterestFromPage() {
        const currentPath = this.getCurrentPath();
        let interests = [];
        
        if (currentPath.includes('installation')) {
            interests.push('setup', 'getting-started');
        } else if (currentPath.includes('addon')) {
            interests.push('development', 'customization', 'advanced');
        } else if (currentPath.includes('quick-start')) {
            interests.push('tutorial', 'beginner', 'learning');
        } else if (currentPath.includes('api')) {
            interests.push('development', 'technical', 'reference');
        }
        
        this.addInterests(interests);
    }

    /**
     * Infer interests from link clicks
     */
    inferInterestFromLink(href, text) {
        let interests = [];
        
        if (href.includes('docs')) {
            interests.push('documentation', 'learning');
        }
        if (href.includes('github')) {
            interests.push('development', 'source-code');
        }
        if (text.toLowerCase().includes('download')) {
            interests.push('installation', 'getting-started');
        }
        
        this.addInterests(interests);
    }

    /**
     * Infer interests from time spent
     */
    inferInterestFromTimeSpent(timeSpent) {
        const currentPath = this.getCurrentPath();
        
        if (timeSpent > 120000) { // More than 2 minutes
            if (currentPath.includes('addon')) {
                this.addInterests(['development', 'advanced']);
            } else if (currentPath.includes('docs')) {
                this.addInterests(['documentation', 'thorough-reader']);
            }
        }
    }

    /**
     * Add interests to user profile
     */
    addInterests(interests) {
        interests.forEach(interest => {
            const existing = this.userProfile.interests.find(i => i.name === interest);
            if (existing) {
                existing.weight++;
            } else {
                this.userProfile.interests.push({
                    name: interest,
                    weight: 1,
                    timestamp: Date.now()
                });
            }
        });
        
        this.saveUserProfile();
    }

    /**
     * Create journey selector widget
     */
    createJourneySelector() {
        const widget = document.createElement('div');
        widget.className = 'journey-selector';
        
        const title = document.createElement('h3');
        title.className = 'journey-selector-title';
        title.textContent = 'Choose Your Learning Path';
        
        const pathsContainer = document.createElement('div');
        pathsContainer.className = 'journey-paths';
        
        Object.entries(this.journeyPaths).forEach(([key, journey]) => {
            const pathElement = document.createElement('div');
            pathElement.className = 'journey-path';
            pathElement.dataset.journeyKey = key;
            
            const header = document.createElement('div');
            header.className = 'journey-path-header';
            
            const icon = document.createElement('span');
            icon.className = 'journey-path-icon';
            icon.textContent = journey.icon;
            
            const name = document.createElement('h4');
            name.className = 'journey-path-name';
            name.textContent = journey.name;
            
            header.appendChild(icon);
            header.appendChild(name);
            
            const description = document.createElement('p');
            description.className = 'journey-path-description';
            description.textContent = journey.description;
            
            const meta = document.createElement('div');
            meta.className = 'journey-path-meta';
            meta.innerHTML = `
                <span>${journey.estimatedTime}</span>
                <span>${journey.difficulty}</span>
            `;
            
            pathElement.appendChild(header);
            pathElement.appendChild(description);
            pathElement.appendChild(meta);
            
            pathElement.addEventListener('click', () => {
                this.selectJourney(key);
            });
            
            pathsContainer.appendChild(pathElement);
        });
        
        widget.appendChild(title);
        widget.appendChild(pathsContainer);
        
        return widget;
    }

    /**
     * Select a journey path
     */
    selectJourney(journeyKey) {
        this.currentJourney = journeyKey;
        this.userProfile.currentJourney = journeyKey;
        this.saveUserProfile();
        
        // Update UI
        document.querySelectorAll('.journey-path').forEach(path => {
            path.classList.remove('selected');
        });
        document.querySelector(`[data-journey-key="${journeyKey}"]`).classList.add('selected');
        
        // Show progress indicator
        this.showProgressIndicator();
        
        // Navigate to first step if not already there
        const journey = this.journeyPaths[journeyKey];
        const currentPath = this.getCurrentPath();
        const firstStep = journey.steps[0];
        
        if (currentPath !== firstStep.path) {
            setTimeout(() => {
                window.location.href = firstStep.path;
            }, 1000);
        }
    }

    /**
     * Show progress indicator
     */
    showProgressIndicator() {
        // Remove existing indicator
        const existing = document.querySelector('.journey-progress-indicator');
        if (existing) {
            existing.remove();
        }
        
        if (!this.currentJourney) return;
        
        const journey = this.journeyPaths[this.currentJourney];
        const currentPath = this.getCurrentPath();
        const currentStepIndex = journey.steps.findIndex(step => 
            step.path === currentPath || (step.section && currentPath.includes(step.section))
        );
        
        const indicator = document.createElement('div');
        indicator.className = 'journey-progress-indicator';
        
        const header = document.createElement('div');
        header.className = 'journey-progress-header';
        
        const title = document.createElement('h4');
        title.className = 'journey-progress-title';
        title.textContent = journey.name;
        
        const closeButton = document.createElement('button');
        closeButton.className = 'journey-progress-close';
        closeButton.innerHTML = '×';
        closeButton.addEventListener('click', () => {
            indicator.remove();
        });
        
        header.appendChild(title);
        header.appendChild(closeButton);
        
        const stepsList = document.createElement('ol');
        stepsList.className = 'journey-steps';
        
        journey.steps.forEach((step, index) => {
            const stepElement = document.createElement('li');
            stepElement.className = 'journey-step';
            
            if (index < currentStepIndex) {
                stepElement.classList.add('completed');
            } else if (index === currentStepIndex) {
                stepElement.classList.add('current');
            }
            
            const link = document.createElement('a');
            link.href = step.path;
            link.className = 'journey-step-link';
            
            const stepNumber = document.createElement('div');
            stepNumber.className = 'journey-step-number';
            if (!stepElement.classList.contains('completed')) {
                stepNumber.textContent = index + 1;
            }
            
            const stepContent = document.createElement('div');
            stepContent.className = 'journey-step-content';
            
            const stepTitle = document.createElement('div');
            stepTitle.className = 'journey-step-title';
            stepTitle.textContent = step.title;
            
            const stepDescription = document.createElement('div');
            stepDescription.className = 'journey-step-description';
            stepDescription.textContent = step.description;
            
            stepContent.appendChild(stepTitle);
            stepContent.appendChild(stepDescription);
            
            link.appendChild(stepNumber);
            link.appendChild(stepContent);
            stepElement.appendChild(link);
            stepsList.appendChild(stepElement);
        });
        
        const navigation = document.createElement('div');
        navigation.className = 'journey-navigation';
        
        const prevButton = document.createElement('button');
        prevButton.className = 'journey-nav-button';
        prevButton.textContent = 'Previous';
        prevButton.disabled = currentStepIndex <= 0;
        
        const nextButton = document.createElement('button');
        nextButton.className = 'journey-nav-button primary';
        nextButton.textContent = 'Next';
        nextButton.disabled = currentStepIndex >= journey.steps.length - 1;
        
        if (!prevButton.disabled) {
            prevButton.addEventListener('click', () => {
                window.location.href = journey.steps[currentStepIndex - 1].path;
            });
        }
        
        if (!nextButton.disabled) {
            nextButton.addEventListener('click', () => {
                window.location.href = journey.steps[currentStepIndex + 1].path;
            });
        }
        
        navigation.appendChild(prevButton);
        navigation.appendChild(nextButton);
        
        indicator.appendChild(header);
        indicator.appendChild(stepsList);
        indicator.appendChild(navigation);
        
        document.body.appendChild(indicator);
    }

    /**
     * Create personalized suggestions based on user profile
     */
    createPersonalizedSuggestions() {
        const suggestions = this.generatePersonalizedSuggestions();
        
        if (suggestions.length === 0) {
            return null;
        }
        
        const widget = document.createElement('div');
        widget.className = 'personalized-suggestions';
        
        const title = document.createElement('h3');
        title.className = 'personalized-title';
        title.textContent = 'Personalized for You';
        
        const grid = document.createElement('div');
        grid.className = 'personalized-grid';
        
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'personalized-item';
            
            const link = document.createElement('a');
            link.href = suggestion.url;
            link.className = 'personalized-link';
            
            const itemTitle = document.createElement('h4');
            itemTitle.className = 'personalized-item-title';
            itemTitle.textContent = suggestion.title;
            
            const reason = document.createElement('p');
            reason.className = 'personalized-item-reason';
            reason.textContent = suggestion.reason;
            
            link.appendChild(itemTitle);
            link.appendChild(reason);
            item.appendChild(link);
            grid.appendChild(item);
        });
        
        widget.appendChild(title);
        widget.appendChild(grid);
        
        return widget;
    }

    /**
     * Generate personalized suggestions based on user behavior
     */
    generatePersonalizedSuggestions() {
        const suggestions = [];
        const topInterests = this.userProfile.interests
            .sort((a, b) => b.weight - a.weight)
            .slice(0, 3);
        
        topInterests.forEach(interest => {
            const suggestion = this.getSuggestionForInterest(interest.name);
            if (suggestion) {
                suggestions.push(suggestion);
            }
        });
        
        // Add suggestions based on visited pages
        const unvisitedImportantPages = this.getUnvisitedImportantPages();
        unvisitedImportantPages.forEach(page => {
            suggestions.push({
                title: page.title,
                url: page.url,
                reason: page.reason
            });
        });
        
        return suggestions.slice(0, 4);
    }

    /**
     * Get suggestion for specific interest
     */
    getSuggestionForInterest(interest) {
        const suggestionMap = {
            'development': {
                title: 'Addon Development Guide',
                url: '/docs/addon-development/',
                reason: 'Based on your interest in development'
            },
            'getting-started': {
                title: 'Quick Start Guide',
                url: '/docs/quick-start/',
                reason: 'Perfect for getting started quickly'
            },
            'advanced': {
                title: 'Package Structure',
                url: '/docs/package-structure/',
                reason: 'Advanced technical details'
            },
            'tutorial': {
                title: 'Smart Floater Example',
                url: '/docs/smart-floater-example/',
                reason: 'Hands-on learning experience'
            }
        };
        
        return suggestionMap[interest] || null;
    }

    /**
     * Get unvisited important pages
     */
    getUnvisitedImportantPages() {
        const importantPages = [
            {
                url: '/docs/installation/',
                title: 'Installation Guide',
                reason: 'Essential for getting started'
            },
            {
                url: '/docs/quick-start/',
                title: 'Quick Start',
                reason: 'Get up and running quickly'
            },
            {
                url: '/#features',
                title: 'Features Overview',
                reason: 'Discover what GGUF Loader can do'
            }
        ];
        
        const visitedPaths = this.userProfile.visitedPages.map(v => v.path);
        
        return importantPages.filter(page => 
            !visitedPaths.some(visited => visited.includes(page.url))
        );
    }

    /**
     * Auto-inject journey components
     */
    autoInjectComponents() {
        const currentPath = this.getCurrentPath();
        
        // Show journey selector on homepage
        if (currentPath === '/' || currentPath === '') {
            const heroSection = document.querySelector('.hero, .hero-section');
            if (heroSection) {
                const selector = this.createJourneySelector();
                heroSection.parentNode.insertBefore(selector, heroSection.nextSibling);
            }
        }
        
        // Show progress indicator if user has selected a journey
        if (this.userProfile.currentJourney) {
            this.currentJourney = this.userProfile.currentJourney;
            this.showProgressIndicator();
        }
        
        // Show personalized suggestions
        const personalizedWidget = this.createPersonalizedSuggestions();
        if (personalizedWidget) {
            const mainContent = document.querySelector('main, .content, article, body');
            if (mainContent) {
                mainContent.appendChild(personalizedWidget);
            }
        }
    }

    /**
     * Get current page path
     */
    getCurrentPath() {
        return window.location.pathname + window.location.hash;
    }

    /**
     * Initialize when DOM is ready
     */
    initializeOnReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initialize().then(() => {
                    this.autoInjectComponents();
                });
            });
        } else {
            this.initialize().then(() => {
                this.autoInjectComponents();
            });
        }
    }

    /**
     * Reset user journey
     */
    resetJourney() {
        this.currentJourney = null;
        this.userProfile.currentJourney = null;
        this.userProfile.completedSteps = [];
        this.saveUserProfile();
        
        const indicator = document.querySelector('.journey-progress-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Complete current step
     */
    completeCurrentStep() {
        if (!this.currentJourney) return;
        
        const currentPath = this.getCurrentPath();
        const journey = this.journeyPaths[this.currentJourney];
        const currentStep = journey.steps.find(step => 
            step.path === currentPath || (step.section && currentPath.includes(step.section))
        );
        
        if (currentStep && !this.userProfile.completedSteps.includes(currentStep.path)) {
            this.userProfile.completedSteps.push(currentStep.path);
            this.saveUserProfile();
        }
    }
}

// Export for use in other modules
window.UserJourneyOptimizer = UserJourneyOptimizer;