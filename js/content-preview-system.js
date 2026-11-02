/**
 * Content Preview System for GGUF Loader Homepage
 * Extracts and displays documentation content previews
 */

class ContentPreviewSystem {
    constructor() {
        this.documentationContent = new Map();
        this.previewCache = new Map();
        this.initialized = false;
        
        // Configuration
        this.config = {
            maxPreviewLength: 200,
            expandedPreviewLength: 500,
            fadeInDuration: 300,
            cacheExpiry: 5 * 60 * 1000 // 5 minutes
        };
        
        this.init();
    }
    
    async init() {
        if (this.initialized) return;
        
        try {
            await this.loadDocumentationContent();
            this.setupEventListeners();
            this.initialized = true;
            console.log('Content Preview System initialized');
        } catch (error) {
            console.error('Failed to initialize Content Preview System:', error);
        }
    }
    
    /**
     * Load documentation content from various sources
     */
    async loadDocumentationContent() {
        const documentationPages = [
            {
                id: 'installation',
                url: 'docs/installation/',
                title: 'Installation Guide',
                description: 'Complete guide to installing GGUF Loader on Windows, macOS, and Linux systems'
            },
            {
                id: 'quick-start',
                url: 'docs/quick-start/',
                title: 'Quick Start Guide',
                description: 'Get up and running with GGUF Loader in just a few minutes'
            },
            {
                id: 'addon-api',
                url: 'docs/addon-api/',
                title: 'Addon API Reference',
                description: 'Complete API reference for developing GGUF Loader addons'
            },
            {
                id: 'addon-development',
                url: 'docs/addon-development/',
                title: 'Addon Development Guide',
                description: 'Learn to create custom addons for GGUF Loader with examples and best practices'
            },
            {
                id: 'floating-chat-example',
                url: 'docs/floating-chat-example/',
                title: 'Floating Chat Example',
                description: 'Complete example of the Floating Chat addon'
            },
            {
                id: 'package-structure',
                url: 'docs/package-structure/',
                title: 'Package Structure',
                description: 'Technical documentation of GGUF Loader\'s architecture'
            }
        ];
        
        // Load content for each documentation page
        for (const page of documentationPages) {
            try {
                const content = await this.extractDocumentationContent(page);
                this.documentationContent.set(page.id, content);
            } catch (error) {
                console.warn(`Failed to load content for ${page.id}:`, error);
                // Create fallback content
                this.documentationContent.set(page.id, {
                    ...page,
                    sections: [],
                    keyPoints: [page.description],
                    codeExamples: []
                });
            }
        }
    }
    
    /**
     * Extract structured content from documentation pages
     */
    async extractDocumentationContent(page) {
        // For now, we'll use predefined content extracts
        // In a real implementation, this would fetch and parse the actual documentation
        const contentExtracts = {
            'installation': {
                ...page,
                sections: [
                    {
                        title: 'Quick Installation',
                        content: 'Install GGUF Loader with a single command: pip install ggufloader. No complex setup or dependencies required.'
                    },
                    {
                        title: 'System Requirements',
                        content: 'Minimum: Python 3.8+, 4GB RAM, 2GB storage. Recommended: Python 3.10+, 16GB RAM, GPU support.'
                    },
                    {
                        title: 'GPU Acceleration',
                        content: 'Optional GPU acceleration available for NVIDIA (CUDA) and Apple Silicon (Metal) for enhanced performance.'
                    }
                ],
                keyPoints: [
                    'One-command installation: pip install ggufloader',
                    'Works on Windows, macOS, and Linux',
                    'Optional GPU acceleration for better performance',
                    'No Python knowledge required for end users'
                ],
                codeExamples: [
                    {
                        language: 'bash',
                        code: 'pip install ggufloader\nggufloader --version'
                    }
                ]
            },
            'quick-start': {
                ...page,
                sections: [
                    {
                        title: 'Launch GGUF Loader',
                        content: 'Launch GGUF Loader from your app menu (or run python main.py from source). The Floating Chat addon loads automatically with the app.'
                    },
                    {
                        title: 'Load Your First Model',
                        content: 'Download a GGUF model from Hugging Face, click "Select GGUF Model", choose your file, and wait for loading.'
                    },
                    {
                        title: 'Floating Chat',
                        content: 'Click the floating button to open a chat window connected to your loaded model. It stays on top of all windows, so you can chat from anywhere.'
                    }
                ],
                keyPoints: [
                    'Get running in under 5 minutes',
                    'No technical knowledge required',
                    'Floating Chat stays on top of all applications',
                    'Supports popular models like Mistral and LLaMA'
                ],
                codeExamples: [
                    {
                        language: 'bash',
                        code: 'python main.py'
                    }
                ]
            },
            'addon-development': {
                ...page,
                sections: [
                    {
                        title: 'Addon Architecture',
                        content: 'Addons are Python packages that extend GGUF Loader functionality with new UI components, text processing, and integrations.'
                    },
                    {
                        title: 'Creating Your First Addon',
                        content: 'Every addon needs a register() function that returns a QWidget for UI addons or None for background services.'
                    },
                    {
                        title: 'Model Integration',
                        content: 'Access the loaded GGUF model through the parent application to process text and generate AI responses.'
                    }
                ],
                keyPoints: [
                    'Extend GGUF Loader with custom functionality',
                    'Full access to AI models and UI components',
                    'Python-based development with Qt UI framework',
                    'Examples include Floating Chat'
                ],
                codeExamples: [
                    {
                        language: 'python',
                        code: 'def register(parent=None):\n    addon = MyAddon(parent)\n    return MyAddonWidget(addon)'
                    }
                ]
            },
            'addon-api': {
                ...page,
                sections: [
                    {
                        title: 'Core API',
                        content: 'The main application interface provides access to loaded models, UI components, and system integration features.'
                    },
                    {
                        title: 'Model API',
                        content: 'Direct access to GGUF models for text generation, tokenization, and response processing with full parameter control.'
                    },
                    {
                        title: 'UI API',
                        content: 'Create custom widgets, floating components, and integrate with the main application interface using PySide6.'
                    }
                ],
                keyPoints: [
                    'Complete API reference for addon developers',
                    'Model access, UI components, and system integration',
                    'Event system for addon communication',
                    'Testing utilities and best practices'
                ],
                codeExamples: [
                    {
                        language: 'python',
                        code: 'model = self.get_model()\nresponse = model(prompt, max_tokens=200)'
                    }
                ]
            },
            'floating-chat-example': {
                ...page,
                sections: [
                    {
                        title: 'Floating Chat',
                        content: 'The built-in Floating Chat addon adds a Messenger-style button that stays on top of all windows. Click it to open a chat window connected to your loaded GGUF model.'
                    },
                    {
                        title: 'Always-on-Top Button',
                        content: 'The draggable button floats above every window and remembers its position between sessions. On macOS it stays visible even when the app loses focus.'
                    },
                    {
                        title: 'Chat Window',
                        content: 'Click the button to open a chat window positioned next to it. Messages stream from your local model, with copy-all and clear controls built in.'
                    }
                ],
                keyPoints: [
                    'Stays on top of all windows (X11; limited on Wayland)',
                    'Connects to the loaded GGUF model',
                    'Remembers button position between sessions',
                    'Complete source code and implementation details'
                ],
                codeExamples: [
                    {
                        language: 'python',
                        code: 'gguf_app.model_loaded.connect(self._on_model_loaded)'
                    }
                ]
            },
            'package-structure': {
                ...page,
                sections: [
                    {
                        title: 'Architecture Overview',
                        content: 'GGUF Loader follows a modular architecture with core application, addon system, and model management components.'
                    },
                    {
                        title: 'Model Management',
                        content: 'Centralized model loading, memory management, and inference handling with support for multiple model formats.'
                    },
                    {
                        title: 'Addon System',
                        content: 'Plugin architecture that allows dynamic loading of extensions with full access to application APIs and resources.'
                    }
                ],
                keyPoints: [
                    'Modular architecture for extensibility',
                    'Efficient model loading and memory management',
                    'Plugin system for unlimited customization',
                    'Cross-platform compatibility layer'
                ],
                codeExamples: [
                    {
                        language: 'python',
                        code: 'from ggufloader.core import ModelManager\nmanager = ModelManager()'
                    }
                ]
            }
        };
        
        return contentExtracts[page.id] || page;
    }
    
    /**
     * Generate a preview snippet for a documentation page
     */
    generatePreview(docId, maxLength = null) {
        const length = maxLength || this.config.maxPreviewLength;
        const cacheKey = `${docId}_${length}`;
        
        // Check cache first
        const cached = this.previewCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.config.cacheExpiry) {
            return cached.content;
        }
        
        const doc = this.documentationContent.get(docId);
        if (!doc) {
            return this.createErrorPreview(docId);
        }
        
        const preview = {
            id: docId,
            title: doc.title,
            description: doc.description,
            keyPoints: doc.keyPoints.slice(0, 3), // Show top 3 key points
            sections: doc.sections.slice(0, 2), // Show first 2 sections
            codeExample: doc.codeExamples[0] || null,
            readMoreUrl: doc.url,
            readMoreText: `Read Full ${doc.title}`
        };
        
        // Cache the result
        this.previewCache.set(cacheKey, {
            content: preview,
            timestamp: Date.now()
        });
        
        return preview;
    }
    
    /**
     * Create an expanded preview with more content
     */
    generateExpandedPreview(docId) {
        return this.generatePreview(docId, this.config.expandedPreviewLength);
    }
    
    /**
     * Create error preview for missing documentation
     */
    createErrorPreview(docId) {
        return {
            id: docId,
            title: 'Documentation Not Available',
            description: 'This documentation section is currently being updated.',
            keyPoints: ['Documentation is being updated', 'Check back soon for new content'],
            sections: [],
            codeExample: null,
            readMoreUrl: '#',
            readMoreText: 'Learn More'
        };
    }
    
    /**
     * Render a preview as HTML
     */
    renderPreview(preview, options = {}) {
        const {
            showCodeExample = true,
            showKeyPoints = true,
            showSections = true,
            expandable = true
        } = options;
        
        let html = `
            <div class="content-preview" data-doc-id="${preview.id}">
                <div class="preview-header">
                    <h4 class="preview-title">${preview.title}</h4>
                    <p class="preview-description">${preview.description}</p>
                </div>
        `;
        
        if (showKeyPoints && preview.keyPoints.length > 0) {
            html += `
                <div class="preview-key-points">
                    <h5>Key Points:</h5>
                    <ul>
                        ${preview.keyPoints.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (showSections && preview.sections.length > 0) {
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
        
        if (showCodeExample && preview.codeExample) {
            html += `
                <div class="preview-code-example">
                    <h6>Example:</h6>
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
        
        if (expandable) {
            html += `
                    <button class="expand-preview-btn" data-doc-id="${preview.id}" aria-label="Show more details">
                        ▼ Show More
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
     * Setup event listeners for interactive previews
     */
    setupEventListeners() {
        // Handle expand/collapse buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('expand-preview-btn')) {
                this.handleExpandPreview(e.target);
            }
        });
        
        // Handle preview hover effects
        document.addEventListener('mouseenter', (e) => {
            if (e.target.classList.contains('content-preview')) {
                this.handlePreviewHover(e.target, true);
            }
        }, true);
        
        document.addEventListener('mouseleave', (e) => {
            if (e.target.classList.contains('content-preview')) {
                this.handlePreviewHover(e.target, false);
            }
        }, true);
    }
    
    /**
     * Handle expand/collapse preview functionality
     */
    handleExpandPreview(button) {
        const docId = button.dataset.docId;
        const previewContainer = button.closest('.content-preview');
        const isExpanded = button.classList.contains('expanded');
        
        if (isExpanded) {
            // Collapse
            const preview = this.generatePreview(docId);
            previewContainer.innerHTML = this.renderPreview(preview);
            button.textContent = '▼ Show More';
            button.classList.remove('expanded');
        } else {
            // Expand
            const expandedPreview = this.generateExpandedPreview(docId);
            const expandedHtml = this.renderPreview(expandedPreview, { expandable: false });
            
            // Smooth transition
            previewContainer.style.opacity = '0.7';
            setTimeout(() => {
                previewContainer.innerHTML = expandedHtml;
                
                // Add collapse button
                const actionsDiv = previewContainer.querySelector('.preview-actions');
                const collapseBtn = document.createElement('button');
                collapseBtn.className = 'expand-preview-btn expanded';
                collapseBtn.dataset.docId = docId;
                collapseBtn.textContent = '▲ Show Less';
                collapseBtn.setAttribute('aria-label', 'Show less details');
                actionsDiv.appendChild(collapseBtn);
                
                previewContainer.style.opacity = '1';
            }, this.config.fadeInDuration / 2);
        }
    }
    
    /**
     * Handle preview hover effects
     */
    handlePreviewHover(previewElement, isHovering) {
        if (isHovering) {
            previewElement.classList.add('preview-hover');
        } else {
            previewElement.classList.remove('preview-hover');
        }
    }
    
    /**
     * Embed a preview into a specific container
     */
    embedPreview(containerId, docId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }
        
        const preview = this.generatePreview(docId);
        const html = this.renderPreview(preview, options);
        
        container.innerHTML = html;
        
        // Add fade-in animation
        const previewElement = container.querySelector('.content-preview');
        if (previewElement) {
            previewElement.style.opacity = '0';
            setTimeout(() => {
                previewElement.style.opacity = '1';
            }, 50);
        }
    }
    
    /**
     * Get available documentation IDs
     */
    getAvailableDocumentation() {
        return Array.from(this.documentationContent.keys());
    }
    
    /**
     * Clear preview cache
     */
    clearCache() {
        this.previewCache.clear();
    }
    
    /**
     * Clear cache for specific document
     */
    clearCacheForDocument(docId) {
        const keysToDelete = [];
        this.previewCache.forEach((value, key) => {
            if (key.startsWith(docId + '_')) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(key => this.previewCache.delete(key));
    }
    
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.previewCache.size,
            keys: Array.from(this.previewCache.keys()),
            memoryUsage: JSON.stringify(Array.from(this.previewCache.entries())).length
        };
    }
}

// Initialize the content preview system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.contentPreviewSystem = new ContentPreviewSystem();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentPreviewSystem;
}