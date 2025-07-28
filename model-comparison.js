/**
 * Model Comparison Tool
 * Interactive tool for comparing GGUF models based on system specifications
 */

class ModelComparisonTool {
    constructor(container) {
        this.container = container;
        this.models = [];
        this.filteredModels = [];
        this.userSpecs = {};
        this.init();
    }

    async init() {
        try {
            await this.loadModelData();
            this.createInterface();
            this.bindEvents();
            this.showAllModels(); // Show all models initially
        } catch (error) {
            console.error('Failed to initialize model comparison tool:', error);
            this.showError('Failed to load model data. Please try again later.');
        }
    }

    async loadModelData() {
        try {
            const response = await fetch('/data/models.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.models = data.models || [];
            this.categories = data.categories || [];
            this.systemRequirements = data.systemRequirements || {};
        } catch (error) {
            console.error('Error loading model data:', error);
            throw error;
        }
    }

    createInterface() {
        this.container.innerHTML = `
            <div class="model-comparison-tool">
                <header class="tool-header">
                    <h2>Find Your Perfect AI Model</h2>
                    <p>Compare GGUF models based on your system specifications and requirements</p>
                </header>

                <div class="tool-content">
                    <aside class="specs-panel">
                        <h3>Your System Specifications</h3>
                        <form class="specs-form" id="specs-form">
                            <div class="input-group">
                                <label for="ram-select">Available RAM (GB)</label>
                                <select id="ram-select" name="ram" required>
                                    <option value="">Select RAM</option>
                                    <option value="4">4 GB</option>
                                    <option value="8">8 GB</option>
                                    <option value="16">16 GB</option>
                                    <option value="32">32 GB</option>
                                    <option value="64">64 GB or more</option>
                                </select>
                            </div>

                            <div class="input-group">
                                <label for="vram-select">GPU VRAM (GB) - Optional</label>
                                <select id="vram-select" name="vram">
                                    <option value="0">No GPU / CPU Only</option>
                                    <option value="2">2 GB</option>
                                    <option value="4">4 GB</option>
                                    <option value="8">8 GB</option>
                                    <option value="16">16 GB</option>
                                    <option value="24">24 GB or more</option>
                                </select>
                            </div>

                            <div class="input-group">
                                <label for="cpu-select">CPU Type</label>
                                <select id="cpu-select" name="cpu">
                                    <option value="">Select CPU</option>
                                    <option value="basic">Basic x64 (Older processors)</option>
                                    <option value="modern">Modern x64 (AVX2 support)</option>
                                    <option value="high-end">High-end x64 (Latest processors)</option>
                                </select>
                            </div>

                            <div class="input-group">
                                <label for="os-select">Operating System</label>
                                <select id="os-select" name="os">
                                    <option value="">Select OS</option>
                                    <option value="windows">Windows</option>
                                    <option value="macos">macOS</option>
                                    <option value="linux">Linux</option>
                                </select>
                            </div>

                            <div class="input-group">
                                <label for="use-case-select">Primary Use Case</label>
                                <select id="use-case-select" name="useCase">
                                    <option value="">Any use case</option>
                                    <option value="general">General purpose</option>
                                    <option value="coding">Code generation</option>
                                    <option value="chat">Conversational AI</option>
                                    <option value="research">Research & Analysis</option>
                                    <option value="mobile">Mobile/Edge deployment</option>
                                </select>
                            </div>

                            <div class="button-group">
                                <button type="submit" class="find-models-btn">Find Compatible Models</button>
                                <button type="button" class="reset-btn">Reset Filters</button>
                            </div>
                        </form>

                        <div class="search-section">
                            <h4>Search Models</h4>
                            <div class="search-input-group">
                                <input type="text" 
                                       id="model-search" 
                                       placeholder="Search by name, use case, or description..." 
                                       class="search-input"
                                       aria-label="Search models">
                                <button type="button" class="search-clear-btn" id="search-clear" aria-label="Clear search">
                                    <span aria-hidden="true">✕</span>
                                </button>
                            </div>
                        </div>

                        <div class="quick-filters">
                            <h4>Quick Filters</h4>
                            <div class="filter-tags">
                                <button class="filter-tag" data-filter="beginner">Beginner Friendly</button>
                                <button class="filter-tag" data-filter="coding">Coding</button>
                                <button class="filter-tag" data-filter="fast">Fast Performance</button>
                                <button class="filter-tag" data-filter="compact">Compact Size</button>
                                <button class="filter-tag" data-filter="clear">Clear All</button>
                            </div>
                        </div>
                    </aside>

                    <main class="results-panel">
                        <div class="results-header">
                            <h3 id="results-title">All Available Models</h3>
                            <div class="results-count">
                                <span id="results-count">0</span> models found
                            </div>
                        </div>

                        <div class="results-container">
                            <div id="loading-indicator" class="loading-indicator" style="display: none;">
                                <div class="spinner"></div>
                                <p>Finding compatible models...</p>
                            </div>

                            <div id="error-message" class="error-message" style="display: none;"></div>

                            <div id="no-results" class="no-results" style="display: none;">
                                <h4>No compatible models found</h4>
                                <p>Try adjusting your system specifications or use case requirements.</p>
                            </div>

                            <div class="models-grid" id="models-grid">
                                <!-- Model cards will be populated here -->
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const form = this.container.querySelector('#specs-form');
        const resetBtn = this.container.querySelector('.reset-btn');
        const filterTags = this.container.querySelectorAll('.filter-tag');
        const searchInput = this.container.querySelector('#model-search');
        const searchClearBtn = this.container.querySelector('#search-clear');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        resetBtn.addEventListener('click', () => {
            this.resetFilters();
        });

        filterTags.forEach(tag => {
            tag.addEventListener('click', () => {
                if (tag.dataset.filter === 'clear') {
                    this.clearAllFilters();
                } else {
                    this.handleQuickFilter(tag.dataset.filter);
                }
            });
        });

        // Search functionality
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 300); // Debounce search
        });

        searchClearBtn.addEventListener('click', () => {
            searchInput.value = '';
            this.handleSearch('');
        });

        // Real-time filtering on input change
        const inputs = form.querySelectorAll('select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                if (this.hasAnySpecs()) {
                    this.handleFormSubmit();
                } else {
                    this.applyCurrentFilters();
                }
            });
        });

        // Keyboard navigation for accessibility
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                this.handleSearch('');
            }
        });
    }

    hasAnySpecs() {
        const form = this.container.querySelector('#specs-form');
        const formData = new FormData(form);
        return Array.from(formData.values()).some(value => value !== '');
    }

    handleFormSubmit() {
        const form = this.container.querySelector('#specs-form');
        const formData = new FormData(form);
        
        this.userSpecs = {
            ram: parseInt(formData.get('ram')) || 0,
            vram: parseInt(formData.get('vram')) || 0,
            cpu: formData.get('cpu') || '',
            os: formData.get('os') || '',
            useCase: formData.get('useCase') || ''
        };

        this.showLoading();
        
        // Simulate processing time for better UX
        setTimeout(() => {
            this.filterModels();
            this.displayResults();
        }, 500);
    }

    handleSearch(searchTerm) {
        this.currentSearchTerm = searchTerm.toLowerCase().trim();
        this.applyCurrentFilters();
    }

    applyCurrentFilters() {
        this.showLoading();
        
        setTimeout(() => {
            let filtered = [...this.models];
            
            // Apply search filter
            if (this.currentSearchTerm) {
                filtered = filtered.filter(model => {
                    const searchableText = [
                        model.name,
                        model.description,
                        ...model.useCase,
                        ...model.tags,
                        model.difficulty
                    ].join(' ').toLowerCase();
                    
                    return searchableText.includes(this.currentSearchTerm);
                });
            }
            
            // Apply system specs filter if any
            if (this.hasAnySpecs()) {
                const form = this.container.querySelector('#specs-form');
                const formData = new FormData(form);
                
                const specs = {
                    ram: parseInt(formData.get('ram')) || 0,
                    vram: parseInt(formData.get('vram')) || 0,
                    cpu: formData.get('cpu') || '',
                    os: formData.get('os') || '',
                    useCase: formData.get('useCase') || ''
                };
                
                filtered = filtered.filter(model => this.isModelCompatible(model, specs));
                
                // Sort by compatibility score
                filtered.sort((a, b) => {
                    const scoreA = this.calculateCompatibilityScore(a, specs);
                    const scoreB = this.calculateCompatibilityScore(b, specs);
                    return scoreB - scoreA;
                });
            }
            
            this.filteredModels = filtered;
            this.displayResults();
            
            // Update title based on active filters
            let title = 'All Available Models';
            if (this.currentSearchTerm) {
                title = `Search Results for "${this.currentSearchTerm}"`;
            } else if (this.hasAnySpecs()) {
                title = 'Compatible Models';
            }
            this.updateResultsTitle(title);
        }, 300);
    }

    handleQuickFilter(filterType) {
        // Clear search when using quick filters
        const searchInput = this.container.querySelector('#model-search');
        searchInput.value = '';
        this.currentSearchTerm = '';
        
        this.showLoading();
        
        setTimeout(() => {
            let filtered = [...this.models];
            
            switch (filterType) {
                case 'beginner':
                    filtered = filtered.filter(model => model.difficulty === 'Beginner');
                    break;
                case 'coding':
                    filtered = filtered.filter(model => 
                        model.useCase.some(use => use.toLowerCase().includes('cod'))
                    );
                    break;
                case 'fast':
                    filtered = filtered.filter(model => 
                        model.performance.speed === 'Fast' || model.performance.speed === 'Very Fast'
                    );
                    break;
                case 'compact':
                    filtered = filtered.filter(model => parseFloat(model.size) < 5);
                    break;
            }
            
            this.filteredModels = filtered;
            this.displayResults();
            this.updateResultsTitle(`${filterType.charAt(0).toUpperCase() + filterType.slice(1)} Models`);
        }, 300);
    }

    clearAllFilters() {
        // Clear search
        const searchInput = this.container.querySelector('#model-search');
        searchInput.value = '';
        this.currentSearchTerm = '';
        
        // Clear form
        const form = this.container.querySelector('#specs-form');
        form.reset();
        this.userSpecs = {};
        
        // Show all models
        this.showAllModels();
    }

    filterModels() {
        this.filteredModels = this.models.filter(model => {
            return this.isModelCompatible(model, this.userSpecs);
        });

        // Sort by compatibility score
        this.filteredModels.sort((a, b) => {
            const scoreA = this.calculateCompatibilityScore(a, this.userSpecs);
            const scoreB = this.calculateCompatibilityScore(b, this.userSpecs);
            return scoreB - scoreA;
        });
    }

    isModelCompatible(model, specs) {
        // RAM requirement check
        if (specs.ram > 0 && model.minRAM > specs.ram) {
            return false;
        }

        // CPU requirement check
        if (specs.cpu) {
            const cpuCompatible = this.checkCpuCompatibility(model.cpuRequirement, specs.cpu);
            if (!cpuCompatible) {
                return false;
            }
        }

        // OS compatibility check
        if (specs.os) {
            const osKey = specs.os.toLowerCase();
            if (!model.compatibility[osKey]) {
                return false;
            }
        }

        // Use case check
        if (specs.useCase) {
            const hasUseCase = model.useCase.some(use => 
                use.toLowerCase().includes(specs.useCase.toLowerCase())
            );
            if (!hasUseCase) {
                return false;
            }
        }

        return true;
    }

    checkCpuCompatibility(modelRequirement, userCpu) {
        const cpuLevels = {
            'basic': 1,
            'modern': 2,
            'high-end': 3
        };

        const modelLevel = modelRequirement.includes('High-end') ? 3 :
                          modelRequirement.includes('Modern') ? 2 : 1;
        
        const userLevel = cpuLevels[userCpu] || 1;
        
        return userLevel >= modelLevel;
    }

    calculateCompatibilityScore(model, specs) {
        let score = 0;

        // RAM efficiency score
        if (specs.ram > 0) {
            const ramEfficiency = specs.ram / model.recommendedRAM;
            score += Math.min(ramEfficiency * 20, 30);
        }

        // VRAM bonus
        if (specs.vram > 0 && model.recommendedVRAM > 0) {
            const vramEfficiency = specs.vram / model.recommendedVRAM;
            score += Math.min(vramEfficiency * 15, 20);
        }

        // Performance bonus
        const performanceScores = {
            'Very Fast': 25,
            'Fast': 20,
            'Medium': 15,
            'Medium-Slow': 10,
            'Slow': 5
        };
        score += performanceScores[model.performance.speed] || 10;

        // Use case match bonus
        if (specs.useCase) {
            const hasUseCase = model.useCase.some(use => 
                use.toLowerCase().includes(specs.useCase.toLowerCase())
            );
            if (hasUseCase) score += 15;
        }

        // Difficulty bonus for beginners
        if (model.difficulty === 'Beginner') {
            score += 10;
        }

        return score;
    }

    showAllModels() {
        this.filteredModels = [...this.models];
        this.displayResults();
        this.updateResultsTitle('All Available Models');
    }

    displayResults() {
        const grid = this.container.querySelector('#models-grid');
        const count = this.container.querySelector('#results-count');
        const noResults = this.container.querySelector('#no-results');
        
        this.hideLoading();
        
        count.textContent = this.filteredModels.length;

        if (this.filteredModels.length === 0) {
            grid.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';
        grid.innerHTML = this.filteredModels.map(model => this.createModelCard(model)).join('');
        
        // Add click handlers for download buttons
        grid.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.trackDownload(e.target.dataset.modelId);
            });
        });
    }

    createModelCard(model) {
        const compatibilityScore = this.userSpecs.ram ? 
            this.calculateCompatibilityScore(model, this.userSpecs) : 0;
        
        const isRecommended = compatibilityScore > 50;
        const ramStatus = this.userSpecs.ram ? 
            (this.userSpecs.ram >= model.recommendedRAM ? 'optimal' : 
             this.userSpecs.ram >= model.minRAM ? 'minimum' : 'insufficient') : 'unknown';

        return `
            <article class="model-card ${isRecommended ? 'recommended' : ''}" data-model-id="${model.id}">
                ${isRecommended ? '<div class="recommended-badge">Recommended</div>' : ''}
                
                <header class="model-header">
                    <h4 class="model-name">${model.name}</h4>
                    <div class="model-meta">
                        <span class="model-size">${model.size}</span>
                        <span class="model-difficulty difficulty-${model.difficulty.toLowerCase()}">${model.difficulty}</span>
                    </div>
                </header>

                <div class="model-description">
                    <p>${model.description}</p>
                </div>

                <div class="model-specs">
                    <div class="spec-item">
                        <span class="spec-label">RAM Required:</span>
                        <span class="spec-value ram-${ramStatus}">
                            ${model.minRAM}GB min, ${model.recommendedRAM}GB recommended
                        </span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Performance:</span>
                        <span class="spec-value">${model.performance.speed} (${model.performance.tokensPerSecond} tokens/sec)</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Context Length:</span>
                        <span class="spec-value">${model.performance.contextLength.toLocaleString()} tokens</span>
                    </div>
                </div>

                <div class="model-use-cases">
                    <span class="use-cases-label">Best for:</span>
                    <div class="use-cases-tags">
                        ${model.useCase.map(use => `<span class="use-case-tag">${use}</span>`).join('')}
                    </div>
                </div>

                <div class="model-compatibility">
                    <div class="compatibility-icons">
                        ${model.compatibility.windows ? '<span class="os-icon" title="Windows">🪟</span>' : ''}
                        ${model.compatibility.macos ? '<span class="os-icon" title="macOS">🍎</span>' : ''}
                        ${model.compatibility.linux ? '<span class="os-icon" title="Linux">🐧</span>' : ''}
                        ${model.compatibility.arm ? '<span class="arch-icon" title="ARM Compatible">💪</span>' : ''}
                    </div>
                    <div class="gpu-requirement">
                        GPU: ${model.compatibility.gpu}
                    </div>
                </div>

                <footer class="model-actions">
                    <a href="${model.downloadUrl}" 
                       class="download-btn" 
                       data-model-id="${model.id}"
                       target="_blank" 
                       rel="noopener noreferrer">
                        <span class="btn-icon">⬇️</span>
                        Download Model
                    </a>
                    <button class="info-btn" onclick="this.parentElement.parentElement.querySelector('.model-details').style.display = this.parentElement.parentElement.querySelector('.model-details').style.display === 'none' ? 'block' : 'none'">
                        <span class="btn-icon">ℹ️</span>
                        More Info
                    </button>
                </footer>

                <div class="model-details" style="display: none;">
                    <h5>Installation Instructions</h5>
                    <ol>
                        <li>Download the model file from the link above</li>
                        <li>Install GGUF Loader: <code>pip install ggufloader</code></li>
                        <li>Run: <code>ggufloader --model path/to/downloaded/model.gguf</code></li>
                    </ol>
                    
                    <h5>Technical Details</h5>
                    <ul>
                        <li><strong>Quantization:</strong> ${model.quantization}</li>
                        <li><strong>Quality:</strong> ${model.performance.quality}</li>
                        <li><strong>CPU Requirement:</strong> ${model.cpuRequirement}</li>
                        ${model.recommendedVRAM > 0 ? `<li><strong>Recommended VRAM:</strong> ${model.recommendedVRAM}GB</li>` : ''}
                    </ul>
                </div>
            </article>
        `;
    }

    updateResultsTitle(title) {
        const titleElement = this.container.querySelector('#results-title');
        titleElement.textContent = title;
    }

    showLoading() {
        const loading = this.container.querySelector('#loading-indicator');
        const grid = this.container.querySelector('#models-grid');
        const noResults = this.container.querySelector('#no-results');
        
        loading.style.display = 'block';
        grid.style.display = 'none';
        noResults.style.display = 'none';
    }

    hideLoading() {
        const loading = this.container.querySelector('#loading-indicator');
        const grid = this.container.querySelector('#models-grid');
        
        loading.style.display = 'none';
        grid.style.display = 'grid';
    }

    showError(message) {
        const error = this.container.querySelector('#error-message');
        error.textContent = message;
        error.style.display = 'block';
        this.hideLoading();
    }

    resetFilters() {
        const form = this.container.querySelector('#specs-form');
        const searchInput = this.container.querySelector('#model-search');
        
        form.reset();
        searchInput.value = '';
        this.userSpecs = {};
        this.currentSearchTerm = '';
        this.showAllModels();
        this.updateResultsTitle('All Available Models');
    }

    trackDownload(modelId) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'model_download', {
                model_id: modelId,
                page_location: window.location.href
            });
        }
        
        console.log(`Model download tracked: ${modelId}`);
    }
}

// Initialize the model comparison tool when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('model-comparison-container');
    if (container) {
        new ModelComparisonTool(container);
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModelComparisonTool;
}