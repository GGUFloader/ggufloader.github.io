/**
 * Content Synchronization System
 * Keeps homepage previews updated with documentation changes
 */

class ContentSynchronizationSystem {
    constructor() {
        this.contentPreviewSystem = null;
        this.homepageIntegration = null;
        this.syncInterval = 5 * 60 * 1000; // 5 minutes
        this.lastSyncTime = 0;
        this.syncTimer = null;
        this.documentationHashes = new Map();
        this.changeListeners = new Set();
        
        // Configuration
        this.config = {
            enableAutoSync: true,
            syncInterval: 5 * 60 * 1000, // 5 minutes
            maxRetries: 3,
            retryDelay: 1000,
            cacheExpiry: 10 * 60 * 1000, // 10 minutes
            enableChangeDetection: true,
            enablePreviewGeneration: true
        };
        
        this.init();
    }
    
    async init() {
        try {
            // Wait for dependencies
            await this.waitForDependencies();
            
            // Initialize content hashes
            await this.initializeContentHashes();
            
            // Setup synchronization
            this.setupSynchronization();
            
            // Setup change detection
            this.setupChangeDetection();
            
            console.log('Content Synchronization System initialized');
        } catch (error) {
            console.error('Failed to initialize Content Synchronization System:', error);
        }
    }
    
    /**
     * Wait for required dependencies to be available
     */
    async waitForDependencies() {
        return new Promise((resolve, reject) => {
            const checkDependencies = () => {
                if (window.contentPreviewSystem && 
                    window.contentPreviewSystem.initialized &&
                    window.homepageContentIntegration &&
                    window.homepageContentIntegration.initialized) {
                    
                    this.contentPreviewSystem = window.contentPreviewSystem;
                    this.homepageIntegration = window.homepageContentIntegration;
                    resolve();
                } else {
                    setTimeout(checkDependencies, 100);
                }
            };
            
            checkDependencies();
            
            // Timeout after 15 seconds
            setTimeout(() => {
                if (!this.contentPreviewSystem || !this.homepageIntegration) {
                    reject(new Error('Required dependencies not available'));
                }
            }, 15000);
        });
    }
    
    /**
     * Initialize content hashes for change detection
     */
    async initializeContentHashes() {
        const documentationIds = this.contentPreviewSystem.getAvailableDocumentation();
        
        for (const docId of documentationIds) {
            try {
                const hash = await this.generateContentHash(docId);
                this.documentationHashes.set(docId, {
                    hash: hash,
                    lastUpdated: Date.now(),
                    version: 1
                });
            } catch (error) {
                console.warn(`Failed to generate hash for ${docId}:`, error);
            }
        }
    }
    
    /**
     * Generate a hash for documentation content
     */
    async generateContentHash(docId) {
        try {
            // Get the current preview content
            const preview = this.contentPreviewSystem.generatePreview(docId);
            
            // Create a string representation of the content
            const contentString = JSON.stringify({
                title: preview.title,
                description: preview.description,
                keyPoints: preview.keyPoints,
                sections: preview.sections,
                codeExample: preview.codeExample
            });
            
            // Generate a simple hash
            return this.simpleHash(contentString);
        } catch (error) {
            console.error(`Error generating hash for ${docId}:`, error);
            return null;
        }
    }
    
    /**
     * Simple hash function for content comparison
     */
    simpleHash(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return hash.toString();
    }
    
    /**
     * Setup automatic synchronization
     */
    setupSynchronization() {
        if (!this.config.enableAutoSync) return;
        
        // Initial sync
        this.performSync();
        
        // Setup periodic sync
        this.syncTimer = setInterval(() => {
            this.performSync();
        }, this.config.syncInterval);
        
        // Setup visibility change sync
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && Date.now() - this.lastSyncTime > this.config.syncInterval) {
                this.performSync();
            }
        });
        
        // Setup focus sync
        window.addEventListener('focus', () => {
            if (Date.now() - this.lastSyncTime > this.config.syncInterval) {
                this.performSync();
            }
        });
    }
    
    /**
     * Setup change detection mechanisms
     */
    setupChangeDetection() {
        if (!this.config.enableChangeDetection) return;
        
        // Monitor for DOM changes that might indicate content updates
        const observer = new MutationObserver((mutations) => {
            let shouldSync = false;
            
            mutations.forEach((mutation) => {
                // Check if any documentation-related content changed
                if (mutation.target.classList && 
                    (mutation.target.classList.contains('content-preview') ||
                     mutation.target.classList.contains('documentation-preview-container'))) {
                    shouldSync = true;
                }
            });
            
            if (shouldSync) {
                this.scheduleSync();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'data-doc-id']
        });
    }
    
    /**
     * Perform synchronization check and update
     */
    async performSync() {
        try {
            console.log('Performing content synchronization...');
            
            const changes = await this.detectChanges();
            
            if (changes.length > 0) {
                await this.updateChangedContent(changes);
                this.notifyChangeListeners(changes);
            }
            
            this.lastSyncTime = Date.now();
            
            // Update cache management
            this.manageCaches();
            
            console.log(`Sync completed. ${changes.length} changes detected.`);
        } catch (error) {
            console.error('Sync failed:', error);
            this.scheduleRetry();
        }
    }
    
    /**
     * Detect changes in documentation content
     */
    async detectChanges() {
        const changes = [];
        const documentationIds = this.contentPreviewSystem.getAvailableDocumentation();
        
        for (const docId of documentationIds) {
            try {
                const currentHash = await this.generateContentHash(docId);
                const storedData = this.documentationHashes.get(docId);
                
                if (!storedData || storedData.hash !== currentHash) {
                    changes.push({
                        docId: docId,
                        type: storedData ? 'updated' : 'new',
                        oldHash: storedData ? storedData.hash : null,
                        newHash: currentHash,
                        timestamp: Date.now()
                    });
                    
                    // Update stored hash
                    this.documentationHashes.set(docId, {
                        hash: currentHash,
                        lastUpdated: Date.now(),
                        version: storedData ? storedData.version + 1 : 1
                    });
                }
            } catch (error) {
                console.warn(`Failed to check changes for ${docId}:`, error);
            }
        }
        
        return changes;
    }
    
    /**
     * Update content that has changed
     */
    async updateChangedContent(changes) {
        for (const change of changes) {
            try {
                await this.updateDocumentationPreview(change.docId);
                
                // Log the change
                console.log(`Updated preview for ${change.docId} (${change.type})`);
            } catch (error) {
                console.error(`Failed to update preview for ${change.docId}:`, error);
            }
        }
    }
    
    /**
     * Update a specific documentation preview
     */
    async updateDocumentationPreview(docId) {
        // Clear cache for this document
        this.contentPreviewSystem.clearCache();
        
        // Find all containers that use this documentation
        const previewMappings = this.homepageIntegration.previewMappings;
        const containersToUpdate = [];
        
        Object.entries(previewMappings).forEach(([containerId, config]) => {
            if (config.docId === docId) {
                containersToUpdate.push({ containerId, config });
            }
        });
        
        // Update each container
        for (const { containerId, config } of containersToUpdate) {
            try {
                await this.updatePreviewContainer(containerId, config);
            } catch (error) {
                console.error(`Failed to update container ${containerId}:`, error);
            }
        }
    }
    
    /**
     * Update a specific preview container
     */
    async updatePreviewContainer(containerId, config) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Add updating indicator
        container.classList.add('updating');
        
        try {
            // Generate new preview
            const preview = this.contentPreviewSystem.generatePreview(config.docId);
            const html = this.contentPreviewSystem.renderPreview(preview, config.options);
            
            // Smooth transition
            const currentPreview = container.querySelector('.content-preview');
            if (currentPreview) {
                currentPreview.style.opacity = '0.5';
                
                setTimeout(() => {
                    container.innerHTML = html;
                    
                    const newPreview = container.querySelector('.content-preview');
                    if (newPreview) {
                        newPreview.style.opacity = '0';
                        setTimeout(() => {
                            newPreview.style.opacity = '1';
                        }, 50);
                    }
                    
                    container.classList.remove('updating');
                }, 200);
            } else {
                container.innerHTML = html;
                container.classList.remove('updating');
            }
            
            // Re-add interactions
            this.homepageIntegration.addPreviewInteractions(containerId);
            
        } catch (error) {
            container.classList.remove('updating');
            throw error;
        }
    }
    
    /**
     * Schedule a sync with debouncing
     */
    scheduleSync() {
        if (this.scheduledSyncTimeout) {
            clearTimeout(this.scheduledSyncTimeout);
        }
        
        this.scheduledSyncTimeout = setTimeout(() => {
            this.performSync();
        }, 1000); // 1 second debounce
    }
    
    /**
     * Schedule a retry after failure
     */
    scheduleRetry() {
        if (this.retryCount >= this.config.maxRetries) {
            console.error('Max sync retries reached');
            return;
        }
        
        this.retryCount = (this.retryCount || 0) + 1;
        
        setTimeout(() => {
            this.performSync();
        }, this.config.retryDelay * this.retryCount);
    }
    
    /**
     * Manage caches and cleanup
     */
    manageCaches() {
        // Clear expired preview cache
        this.contentPreviewSystem.clearCache();
        
        // Clean up old hash data
        const now = Date.now();
        this.documentationHashes.forEach((data, docId) => {
            if (now - data.lastUpdated > this.config.cacheExpiry) {
                this.documentationHashes.delete(docId);
            }
        });
    }
    
    /**
     * Add change listener
     */
    addChangeListener(listener) {
        this.changeListeners.add(listener);
    }
    
    /**
     * Remove change listener
     */
    removeChangeListener(listener) {
        this.changeListeners.delete(listener);
    }
    
    /**
     * Notify change listeners
     */
    notifyChangeListeners(changes) {
        this.changeListeners.forEach(listener => {
            try {
                listener(changes);
            } catch (error) {
                console.error('Change listener error:', error);
            }
        });
    }
    
    /**
     * Force sync all content
     */
    async forceSyncAll() {
        console.log('Forcing full content synchronization...');
        
        // Clear all caches
        this.contentPreviewSystem.clearCache();
        this.documentationHashes.clear();
        
        // Reinitialize
        await this.initializeContentHashes();
        
        // Refresh all previews
        this.homepageIntegration.refreshPreviews();
        
        this.lastSyncTime = Date.now();
    }
    
    /**
     * Get synchronization status
     */
    getSyncStatus() {
        return {
            lastSyncTime: this.lastSyncTime,
            nextSyncTime: this.lastSyncTime + this.config.syncInterval,
            documentationCount: this.documentationHashes.size,
            isAutoSyncEnabled: this.config.enableAutoSync,
            changeListenerCount: this.changeListeners.size
        };
    }
    
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Restart sync timer if interval changed
        if (newConfig.syncInterval && this.syncTimer) {
            clearInterval(this.syncTimer);
            this.setupSynchronization();
        }
    }
    
    /**
     * Stop synchronization
     */
    stop() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
        
        if (this.scheduledSyncTimeout) {
            clearTimeout(this.scheduledSyncTimeout);
            this.scheduledSyncTimeout = null;
        }
        
        console.log('Content synchronization stopped');
    }
    
    /**
     * Start synchronization
     */
    start() {
        if (!this.syncTimer && this.config.enableAutoSync) {
            this.setupSynchronization();
            console.log('Content synchronization started');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.contentSynchronizationSystem = new ContentSynchronizationSystem();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentSynchronizationSystem;
}