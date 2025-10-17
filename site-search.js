/**
 * Site-wide Search Functionality
 * Provides search across all website content including documentation
 */

class SiteSearch {
    constructor() {
        this.searchIndex = [];
        this.isIndexed = false;
        this.searchResults = [];
        this.init();
    }

    async init() {
        try {
            await this.buildSearchIndex();
            this.createSearchInterface();
            this.bindEvents();
        } catch (error) {
            console.error('Failed to initialize site search:', error);
        }
    }

    async buildSearchIndex() {
        // Index current page content
        this.indexCurrentPage();
        
        // Index documentation pages
        await this.indexDocumentationPages();
        
        // Index model data
        await this.indexModelData();
        
        this.isIndexed = true;
        console.log(`Search index built with ${this.searchIndex.length} entries`);
    }

    indexCurrentPage() {
        // Index homepage sections with enhanced metadata
        if (window.location.pathname === '/') {
            this.indexHomepageSections();
        }

        const contentSelectors = [
            'h1, h2, h3, h4, h5, h6',
            'p',
            '.feature-card',
            '.use-case',
            '.model-category',
            '.faq-item'
        ];

        contentSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element, index) => {
                const text = element.textContent.trim();
                if (text.length > 10) { // Only index meaningful content
                    this.searchIndex.push({
                        id: `page-${selector.replace(/[^a-zA-Z]/g, '')}-${index}`,
                        title: this.extractTitle(element),
                        content: text,
                        url: window.location.pathname,
                        type: 'page-content',
                        element: element,
                        relevance: this.calculateRelevance(element)
                    });
                }
            });
        });
    }

    indexHomepageSections() {
        const sections = [
            {
                id: 'features',
                title: 'Features',
                description: 'Explore GGUF Loader features including addon system, Smart Floating Assistant, and cross-platform support.',
                keywords: ['features', 'addon system', 'smart floater', 'cross-platform', 'offline AI'],
                relatedDocs: ['/docs/addon-development/', '/docs/smart-floater-example/']
            },
            {
                id: 'how-to',
                title: 'How-To Guides',
                description: 'Step-by-step guides for installation, setup, and getting started with GGUF Loader.',
                keywords: ['how-to', 'guides', 'tutorial', 'installation', 'setup', 'getting started'],
                relatedDocs: ['/docs/installation/', '/docs/quick-start/']
            },
            {
                id: 'faq',
                title: 'Frequently Asked Questions',
                description: 'Common questions and answers about GGUF Loader, installation, and usage.',
                keywords: ['faq', 'questions', 'answers', 'help', 'support', 'troubleshooting'],
                relatedDocs: ['/docs/installation/', '/docs/quick-start/', '/docs/addon-development/']
            },
            {
                id: 'download',
                title: 'Download & Installation',
                description: 'Download GGUF Loader and get installation instructions for your platform.',
                keywords: ['download', 'install', 'installation', 'pip', 'python', 'setup'],
                relatedDocs: ['/docs/installation/', '/docs/quick-start/']
            },
            {
                id: 'model-comparison',
                title: 'Model Comparison',
                description: 'Compare different AI models supported by GGUF Loader including Mistral, LLaMA, and DeepSeek.',
                keywords: ['models', 'comparison', 'mistral', 'llama', 'deepseek', 'ai models'],
                relatedDocs: ['/docs/quick-start/', '/docs/installation/']
            }
        ];

        sections.forEach(section => {
            const element = document.getElementById(section.id);
            if (element) {
                this.searchIndex.push({
                    id: `homepage-section-${section.id}`,
                    title: section.title,
                    content: section.description,
                    url: `/#${section.id}`,
                    type: 'homepage-section',
                    keywords: section.keywords,
                    relatedDocs: section.relatedDocs,
                    searchableText: [
                        section.title,
                        section.description,
                        ...section.keywords
                    ].join(' ').toLowerCase(),
                    element: element,
                    relevance: 9 // High relevance for main sections
                });
            }
        });
    }

    async indexDocumentationPages() {
        const docPages = [
            { 
                url: '/docs/', 
                title: 'Documentation Hub',
                description: 'Complete documentation for GGUF Loader including installation, quick start, and addon development guides.',
                keywords: ['documentation', 'docs', 'guides', 'reference', 'help']
            },
            { 
                url: '/docs/installation/', 
                title: 'Installation Guide',
                description: 'Complete installation instructions for GGUF Loader on Windows, macOS, and Linux systems.',
                keywords: ['install', 'setup', 'installation', 'windows', 'macos', 'linux', 'pip', 'python']
            },
            { 
                url: '/docs/quick-start/', 
                title: 'Quick Start Guide',
                description: 'Get up and running with GGUF Loader in just a few minutes with this step-by-step guide.',
                keywords: ['quick start', 'getting started', 'tutorial', 'first steps', 'beginner']
            },
            { 
                url: '/docs/addon-development/', 
                title: 'Addon Development Guide',
                description: 'Learn to create custom addons for GGUF Loader with examples and best practices.',
                keywords: ['addon', 'development', 'create', 'build', 'custom', 'extension', 'plugin']
            },
            { 
                url: '/docs/addon-api/', 
                title: 'API Reference',
                description: 'Complete API reference documentation for GGUF Loader addon developers.',
                keywords: ['api', 'reference', 'documentation', 'methods', 'functions', 'developer']
            },
            { 
                url: '/docs/smart-floater-example/', 
                title: 'Smart Floater Example',
                description: 'Detailed example of the Smart Floating Assistant addon implementation.',
                keywords: ['smart floater', 'floating assistant', 'example', 'implementation', 'addon example']
            },
            { 
                url: '/docs/package-structure/', 
                title: 'Package Structure',
                description: 'Technical documentation of GGUF Loader architecture and package structure.',
                keywords: ['package', 'structure', 'architecture', 'technical', 'advanced']
            }
        ];

        for (const page of docPages) {
            try {
                // Add enhanced documentation entry with keywords and description
                this.searchIndex.push({
                    id: `doc-${page.url.replace(/[^a-zA-Z]/g, '')}`,
                    title: page.title,
                    content: page.description,
                    url: page.url,
                    type: 'documentation',
                    keywords: page.keywords,
                    searchableText: [
                        page.title,
                        page.description,
                        ...page.keywords
                    ].join(' ').toLowerCase(),
                    relevance: 8 // High relevance for documentation
                });

                // Try to fetch and index actual page content for better search
                const response = await fetch(page.url);
                if (response.ok) {
                    const html = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    
                    // Extract headings and sections for more granular search
                    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
                    headings.forEach((heading, index) => {
                        const section = heading.nextElementSibling;
                        const sectionContent = section ? section.textContent.trim().substring(0, 200) : '';
                        
                        this.searchIndex.push({
                            id: `doc-section-${page.url.replace(/[^a-zA-Z]/g, '')}-${index}`,
                            title: `${page.title} - ${heading.textContent.trim()}`,
                            content: sectionContent,
                            url: `${page.url}#${heading.id || heading.textContent.toLowerCase().replace(/\s+/g, '-')}`,
                            type: 'documentation-section',
                            parentPage: page.title,
                            relevance: 7
                        });
                    });
                }
            } catch (error) {
                console.warn(`Failed to index documentation page: ${page.url}`, error);
            }
        }
    }

    async indexModelData() {
        try {
            const response = await fetch('/data/models.json');
            if (response.ok) {
                const data = await response.json();
                data.models.forEach(model => {
                    const searchableText = [
                        model.name,
                        model.description,
                        ...model.useCase,
                        ...model.tags,
                        model.difficulty
                    ].join(' ');

                    this.searchIndex.push({
                        id: `model-${model.id}`,
                        title: model.name,
                        content: model.description,
                        url: '/#model-comparison',
                        type: 'model',
                        modelData: model,
                        searchableText: searchableText.toLowerCase(),
                        relevance: 7
                    });
                });
            }
        } catch (error) {
            console.warn('Failed to index model data:', error);
        }
    }

    extractTitle(element) {
        // Try to find a meaningful title
        if (element.tagName.match(/^H[1-6]$/)) {
            return element.textContent.trim();
        }
        
        const parent = element.closest('article, section, .feature-card, .use-case');
        if (parent) {
            const heading = parent.querySelector('h1, h2, h3, h4, h5, h6');
            if (heading) {
                return heading.textContent.trim();
            }
        }
        
        return 'Content';
    }

    calculateRelevance(element) {
        const tagName = element.tagName.toLowerCase();
        const relevanceMap = {
            'h1': 10,
            'h2': 9,
            'h3': 8,
            'h4': 7,
            'h5': 6,
            'h6': 5,
            'p': 4
        };
        
        let relevance = relevanceMap[tagName] || 3;
        
        // Boost relevance for certain classes
        if (element.classList.contains('hero')) relevance += 3;
        if (element.classList.contains('feature-card')) relevance += 2;
        if (element.classList.contains('use-case')) relevance += 2;
        
        return relevance;
    }

    createSearchInterface() {
        // Create search modal
        const searchModal = document.createElement('div');
        searchModal.id = 'site-search-modal';
        searchModal.className = 'search-modal';
        searchModal.innerHTML = `
            <div class="search-modal-overlay" aria-hidden="true"></div>
            <div class="search-modal-content" role="dialog" aria-labelledby="search-title" aria-modal="true">
                <header class="search-modal-header">
                    <h2 id="search-title">Search GGUF Loader</h2>
                    <button class="search-modal-close" aria-label="Close search">✕</button>
                </header>
                
                <div class="search-input-container">
                    <input type="text" 
                           id="site-search-input" 
                           placeholder="Search documentation, models, and content..." 
                           class="site-search-input"
                           aria-label="Search site content"
                           autocomplete="off">
                    <div class="search-suggestions" id="search-suggestions" role="listbox" aria-label="Search suggestions"></div>
                </div>
                
                <div class="search-results-container">
                    <div id="search-results" class="search-results" role="region" aria-live="polite" aria-label="Search results"></div>
                </div>
                
                <footer class="search-modal-footer">
                    <div class="search-shortcuts">
                        <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
                        <span><kbd>Enter</kbd> Select</span>
                        <span><kbd>Esc</kbd> Close</span>
                    </div>
                </footer>
            </div>
        `;
        
        document.body.appendChild(searchModal);

        // Create search trigger button
        const searchTrigger = document.createElement('button');
        searchTrigger.id = 'search-trigger';
        searchTrigger.className = 'search-trigger';
        searchTrigger.innerHTML = `
            <span class="search-icon" aria-hidden="true">🔍</span>
            <span class="search-text">Search</span>
            <span class="search-shortcut" aria-hidden="true">Ctrl+K</span>
        `;
        searchTrigger.setAttribute('aria-label', 'Open site search');
        searchTrigger.setAttribute('title', 'Search site content (Ctrl+K)');
        
        // Add to navigation
        const nav = document.querySelector('.nav-container');
        if (nav) {
            nav.appendChild(searchTrigger);
        }
    }

    bindEvents() {
        const modal = document.getElementById('site-search-modal');
        const trigger = document.getElementById('search-trigger');
        const closeBtn = modal.querySelector('.search-modal-close');
        const overlay = modal.querySelector('.search-modal-overlay');
        const searchInput = document.getElementById('site-search-input');
        const resultsContainer = document.getElementById('search-results');

        // Open search modal
        const openSearch = () => {
            modal.classList.add('active');
            document.body.classList.add('search-modal-open');
            searchInput.focus();
        };

        // Close search modal
        const closeSearch = () => {
            modal.classList.remove('active');
            document.body.classList.remove('search-modal-open');
            searchInput.value = '';
            resultsContainer.innerHTML = '';
        };

        // Event listeners
        trigger.addEventListener('click', openSearch);
        closeBtn.addEventListener('click', closeSearch);
        overlay.addEventListener('click', closeSearch);

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+K or Cmd+K to open search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                openSearch();
            }
            
            // Escape to close search
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeSearch();
            }
        });

        // Search input handling with suggestions
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value;
            
            // Show suggestions for short queries
            if (query.length > 0 && query.length < 3) {
                this.showSearchSuggestions(query);
            } else if (query.length >= 3) {
                this.hideSearchSuggestions();
                searchTimeout = setTimeout(() => {
                    this.performSearch(query);
                }, 300);
            } else {
                this.hideSearchSuggestions();
                this.clearSearchResults();
            }
        });

        // Keyboard navigation in search results
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateResults('down');
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateResults('up');
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.selectResult();
            }
        });
    }

    performSearch(query) {
        const resultsContainer = document.getElementById('search-results');
        
        if (!query.trim()) {
            resultsContainer.innerHTML = '';
            return;
        }

        if (!this.isIndexed) {
            resultsContainer.innerHTML = '<div class="search-loading">Building search index...</div>';
            return;
        }

        const results = this.searchContent(query);
        this.displaySearchResults(results, query);
    }

    searchContent(query) {
        const searchTerms = query.toLowerCase().trim().split(/\s+/);
        const results = [];

        this.searchIndex.forEach(item => {
            let score = 0;
            const searchableText = (item.searchableText || 
                                  `${item.title} ${item.content}`).toLowerCase();

            searchTerms.forEach(term => {
                // Exact title match gets highest score
                if (item.title.toLowerCase().includes(term)) {
                    score += item.relevance * 2;
                }
                
                // Content match
                if (searchableText.includes(term)) {
                    score += item.relevance;
                }
                
                // Boost for exact phrase matches
                if (searchableText.includes(query.toLowerCase())) {
                    score += item.relevance * 1.5;
                }
            });

            if (score > 0) {
                results.push({ ...item, score });
            }
        });

        // Sort by score and limit results
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }

    displaySearchResults(results, query) {
        const resultsContainer = document.getElementById('search-results');
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-search-results">
                    <h3>No results found</h3>
                    <p>Try different keywords or check the spelling.</p>
                    <div class="search-suggestions">
                        <h4>Popular searches:</h4>
                        <ul>
                            <li><a href="#" data-search="installation">Installation</a></li>
                            <li><a href="#" data-search="addon development">Addon Development</a></li>
                            <li><a href="#" data-search="quick start">Quick Start</a></li>
                            <li><a href="#" data-search="API reference">API Reference</a></li>
                        </ul>
                    </div>
                </div>
            `;
            
            // Add click handlers for suggestions
            resultsContainer.querySelectorAll('[data-search]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.getElementById('site-search-input').value = link.dataset.search;
                    this.performSearch(link.dataset.search);
                });
            });
            return;
        }

        // Group results by type for better organization
        const groupedResults = this.groupResultsByType(results);
        
        const resultsHTML = Object.entries(groupedResults).map(([type, typeResults]) => {
            const typeLabel = this.getTypeLabel(type);
            const typeIcon = this.getTypeIcon(type);
            
            const typeResultsHTML = typeResults.map((result, index) => {
                const highlightedTitle = this.highlightText(result.title, query);
                const highlightedContent = this.highlightText(
                    result.content.substring(0, 150) + '...', 
                    query
                );

                // Add related documentation links for homepage sections
                const relatedLinks = result.relatedDocs ? 
                    result.relatedDocs.map(docUrl => {
                        const docTitle = this.getDocumentationTitle(docUrl);
                        return `<a href="${docUrl}" class="related-doc-link" title="View ${docTitle}">${docTitle}</a>`;
                    }).join('') : '';

                return `
                    <article class="search-result-item ${index === 0 && type === Object.keys(groupedResults)[0] ? 'selected' : ''}" 
                             data-url="${result.url}" 
                             data-index="${result.globalIndex}">
                        <header class="search-result-header">
                            <h3 class="search-result-title">${highlightedTitle}</h3>
                            ${result.parentPage ? `<span class="search-result-parent">in ${result.parentPage}</span>` : ''}
                        </header>
                        <p class="search-result-content">${highlightedContent}</p>
                        ${relatedLinks ? `<div class="search-result-related">${relatedLinks}</div>` : ''}
                        <footer class="search-result-footer">
                            <span class="search-result-url">${result.url}</span>
                            <span class="search-result-score">Score: ${Math.round(result.score)}</span>
                        </footer>
                    </article>
                `;
            }).join('');

            return `
                <section class="search-results-group">
                    <header class="search-results-group-header">
                        <span class="search-results-group-icon">${typeIcon}</span>
                        <h3 class="search-results-group-title">${typeLabel}</h3>
                        <span class="search-results-group-count">${typeResults.length}</span>
                    </header>
                    <div class="search-results-group-items">
                        ${typeResultsHTML}
                    </div>
                </section>
            `;
        }).join('');

        resultsContainer.innerHTML = `
            <div class="search-results-header">
                <span class="search-results-count">${results.length} result${results.length !== 1 ? 's' : ''}</span>
                <div class="search-results-filters">
                    <button class="search-filter active" data-filter="all">All</button>
                    ${Object.keys(groupedResults).map(type => 
                        `<button class="search-filter" data-filter="${type}">${this.getTypeLabel(type)}</button>`
                    ).join('')}
                </div>
            </div>
            <div class="search-results-list">
                ${resultsHTML}
            </div>
        `;

        // Add click handlers for results
        resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                this.navigateToResult(item.dataset.url);
            });
        });

        // Add filter handlers
        resultsContainer.querySelectorAll('.search-filter').forEach(filter => {
            filter.addEventListener('click', () => {
                this.filterResults(filter.dataset.filter);
            });
        });

        // Add related doc link handlers
        resultsContainer.querySelectorAll('.related-doc-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering parent result click
            });
        });
    }

    groupResultsByType(results) {
        const grouped = {};
        
        results.forEach((result, index) => {
            result.globalIndex = index; // Store global index for navigation
            
            if (!grouped[result.type]) {
                grouped[result.type] = [];
            }
            grouped[result.type].push(result);
        });

        // Sort groups by priority
        const typeOrder = ['homepage-section', 'documentation', 'documentation-section', 'model', 'page-content'];
        const sortedGrouped = {};
        
        typeOrder.forEach(type => {
            if (grouped[type]) {
                sortedGrouped[type] = grouped[type];
            }
        });

        // Add any remaining types
        Object.keys(grouped).forEach(type => {
            if (!sortedGrouped[type]) {
                sortedGrouped[type] = grouped[type];
            }
        });

        return sortedGrouped;
    }

    filterResults(filterType) {
        const groups = document.querySelectorAll('.search-results-group');
        const filters = document.querySelectorAll('.search-filter');
        
        // Update filter buttons
        filters.forEach(filter => {
            filter.classList.toggle('active', filter.dataset.filter === filterType);
        });

        // Show/hide result groups
        groups.forEach(group => {
            const groupType = group.querySelector('.search-results-group-items .search-result-item').dataset.url.includes('#') ? 
                              'homepage-section' : 'documentation';
            
            if (filterType === 'all') {
                group.style.display = 'block';
            } else {
                group.style.display = groupType === filterType ? 'block' : 'none';
            }
        });
    }

    getDocumentationTitle(url) {
        const titles = {
            '/docs/installation/': 'Installation Guide',
            '/docs/quick-start/': 'Quick Start',
            '/docs/addon-development/': 'Addon Development',
            '/docs/addon-api/': 'API Reference',
            '/docs/smart-floater-example/': 'Smart Floater Example',
            '/docs/package-structure/': 'Package Structure'
        };
        return titles[url] || 'Documentation';
    }

    highlightText(text, query) {
        if (!query.trim()) return text;
        
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    getTypeLabel(type) {
        const labels = {
            'homepage-section': 'Homepage',
            'page-content': 'Page',
            'documentation': 'Documentation',
            'documentation-section': 'Docs Section',
            'model': 'AI Model',
            'feature': 'Feature'
        };
        return labels[type] || 'Content';
    }

    getTypeIcon(type) {
        const icons = {
            'homepage-section': '🏠',
            'page-content': '📄',
            'documentation': '📚',
            'documentation-section': '📖',
            'model': '🤖',
            'feature': '⭐'
        };
        return icons[type] || '📄';
    }

    navigateResults(direction) {
        const results = document.querySelectorAll('.search-result-item');
        const current = document.querySelector('.search-result-item.selected');
        
        if (!results.length) return;
        
        let newIndex = 0;
        if (current) {
            const currentIndex = parseInt(current.dataset.index);
            if (direction === 'down') {
                newIndex = (currentIndex + 1) % results.length;
            } else {
                newIndex = currentIndex === 0 ? results.length - 1 : currentIndex - 1;
            }
        }
        
        // Update selection
        results.forEach(item => item.classList.remove('selected'));
        results[newIndex].classList.add('selected');
        results[newIndex].scrollIntoView({ block: 'nearest' });
    }

    selectResult() {
        const selected = document.querySelector('.search-result-item.selected');
        if (selected) {
            this.navigateToResult(selected.dataset.url);
        }
    }

    showSearchSuggestions(query) {
        const suggestionsContainer = document.getElementById('search-suggestions');
        const suggestions = this.generateSearchSuggestions(query);
        
        if (suggestions.length === 0) {
            this.hideSearchSuggestions();
            return;
        }

        const suggestionsHTML = suggestions.map((suggestion, index) => `
            <div class="search-suggestion-item ${index === 0 ? 'selected' : ''}" 
                 data-suggestion="${suggestion.text}" 
                 data-index="${index}">
                <span class="search-suggestion-icon">${suggestion.icon}</span>
                <span class="search-suggestion-text">${suggestion.text}</span>
                <span class="search-suggestion-type">${suggestion.type}</span>
            </div>
        `).join('');

        suggestionsContainer.innerHTML = suggestionsHTML;
        suggestionsContainer.classList.add('active');

        // Add click handlers
        suggestionsContainer.querySelectorAll('.search-suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                document.getElementById('site-search-input').value = item.dataset.suggestion;
                this.performSearch(item.dataset.suggestion);
                this.hideSearchSuggestions();
            });
        });
    }

    hideSearchSuggestions() {
        const suggestionsContainer = document.getElementById('search-suggestions');
        suggestionsContainer.classList.remove('active');
        suggestionsContainer.innerHTML = '';
    }

    generateSearchSuggestions(query) {
        const suggestions = [
            // Homepage sections
            { text: 'features', icon: '⭐', type: 'Homepage Section' },
            { text: 'how-to guides', icon: '📋', type: 'Homepage Section' },
            { text: 'FAQ', icon: '❓', type: 'Homepage Section' },
            { text: 'download', icon: '⬇️', type: 'Homepage Section' },
            
            // Documentation
            { text: 'installation guide', icon: '⚙️', type: 'Documentation' },
            { text: 'quick start', icon: '⚡', type: 'Documentation' },
            { text: 'addon development', icon: '🔧', type: 'Documentation' },
            { text: 'API reference', icon: '📚', type: 'Documentation' },
            { text: 'smart floater example', icon: '✨', type: 'Documentation' },
            
            // Common topics
            { text: 'installation', icon: '⚙️', type: 'Topic' },
            { text: 'setup', icon: '🔧', type: 'Topic' },
            { text: 'addon', icon: '🧩', type: 'Topic' },
            { text: 'API', icon: '🔌', type: 'Topic' },
            { text: 'models', icon: '🤖', type: 'Topic' },
            { text: 'troubleshooting', icon: '🔍', type: 'Topic' }
        ];

        return suggestions
            .filter(suggestion => 
                suggestion.text.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 8); // Limit to 8 suggestions
    }

    clearSearchResults() {
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = '';
    }

    navigateToResult(url) {
        // Close search modal
        document.getElementById('site-search-modal').classList.remove('active');
        document.body.classList.remove('search-modal-open');
        
        // Navigate to result
        if (url.startsWith('#')) {
            // Scroll to anchor on current page
            const element = document.querySelector(url);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (url === window.location.pathname) {
            // Same page, scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Navigate to different page
            window.location.href = url;
        }
        
        // Track search result click
        if (typeof gtag !== 'undefined') {
            gtag('event', 'search_result_click', {
                search_term: document.getElementById('site-search-input').value,
                result_url: url
            });
        }
    }
}

// Initialize site search when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SiteSearch();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SiteSearch;
}