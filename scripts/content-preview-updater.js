#!/usr/bin/env node

/**
 * Content Preview Update Automation
 * Automatically updates homepage content previews when documentation changes
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ContentPreviewUpdater {
    constructor() {
        this.config = {
            docsPath: '_docs',
            homepagePath: 'index.html',
            includesPath: 'includes',
            cacheFile: '.content-preview-cache.json',
            previewMappings: {
                'installation.md': {
                    homepageSection: 'download-section',
                    previewId: 'installation-preview',
                    maxLength: 200,
                    linkText: 'View Installation Guide'
                },
                'quick-start.md': {
                    homepageSection: 'how-to-section',
                    previewId: 'quickstart-preview',
                    maxLength: 250,
                    linkText: 'See Quick Start Guide'
                },
                'addon-api.md': {
                    homepageSection: 'features-section',
                    previewId: 'api-preview',
                    maxLength: 180,
                    linkText: 'Explore API Documentation'
                },
                'addon-development.md': {
                    homepageSection: 'features-section',
                    previewId: 'development-preview',
                    maxLength: 200,
                    linkText: 'Learn Addon Development'
                },
                'smart-floater-example.md': {
                    homepageSection: 'features-section',
                    previewId: 'example-preview',
                    maxLength: 150,
                    linkText: 'View Example Implementation'
                },
                'package-structure.md': {
                    homepageSection: 'download-section',
                    previewId: 'structure-preview',
                    maxLength: 180,
                    linkText: 'Understand Package Structure'
                }
            }
        };
        
        this.cache = this.loadCache();
    }

    /**
     * Main update process
     */
    async updatePreviews() {
        console.log('🔄 Starting content preview updates...');
        
        const results = {
            updated: [],
            skipped: [],
            errors: [],
            timestamp: new Date().toISOString()
        };

        for (const [docFile, config] of Object.entries(this.config.previewMappings)) {
            try {
                const docPath = path.join(this.config.docsPath, docFile);
                
                if (!fs.existsSync(docPath)) {
                    results.errors.push({ file: docFile, error: 'Documentation file not found' });
                    continue;
                }

                const needsUpdate = await this.checkIfUpdateNeeded(docPath, docFile);
                
                if (needsUpdate) {
                    const preview = await this.generatePreview(docPath, config);
                    await this.updateHomepagePreview(config, preview, docFile);
                    
                    results.updated.push({
                        file: docFile,
                        section: config.homepageSection,
                        previewLength: preview.length
                    });
                    
                    // Update cache
                    this.updateCache(docFile, docPath);
                } else {
                    results.skipped.push({ file: docFile, reason: 'No changes detected' });
                }

            } catch (error) {
                results.errors.push({ file: docFile, error: error.message });
                console.error(`❌ Error updating preview for ${docFile}:`, error.message);
            }
        }

        this.saveCache();
        this.logResults(results);
        
        console.log(`✅ Preview update completed. Updated: ${results.updated.length}, Skipped: ${results.skipped.length}, Errors: ${results.errors.length}`);
        
        return results;
    }

    /**
     * Check if a documentation file needs preview update
     */
    async checkIfUpdateNeeded(docPath, docFile) {
        try {
            const stats = fs.statSync(docPath);
            const currentHash = await this.getFileHash(docPath);
            
            const cached = this.cache[docFile];
            if (!cached) return true;
            
            return cached.hash !== currentHash || cached.lastModified !== stats.mtime.toISOString();
        } catch (error) {
            return true; // Update if we can't determine
        }
    }

    /**
     * Generate preview content from documentation
     */
    async generatePreview(docPath, config) {
        const content = fs.readFileSync(docPath, 'utf8');
        
        // Remove markdown formatting
        let cleanContent = content
            .replace(/^#{1,6}\s+.*$/gm, '') // Remove headers
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .replace(/`([^`]+)`/g, '$1') // Remove inline code formatting
            .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold formatting
            .replace(/\*([^*]+)\*/g, '$1') // Remove italic formatting
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
            .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
            .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
            .trim();

        // Extract meaningful content (skip empty lines and very short lines)
        const paragraphs = cleanContent
            .split('\n\n')
            .map(p => p.replace(/\n/g, ' ').trim())
            .filter(p => p.length > 30);

        if (paragraphs.length === 0) {
            return 'Documentation content available. Click to read more.';
        }

        // Get the first substantial paragraph
        let preview = paragraphs[0];
        
        // Truncate to specified length
        if (preview.length > config.maxLength) {
            preview = preview.substring(0, config.maxLength);
            // Try to end at a word boundary
            const lastSpace = preview.lastIndexOf(' ');
            if (lastSpace > config.maxLength * 0.8) {
                preview = preview.substring(0, lastSpace);
            }
            preview += '...';
        }

        return preview;
    }

    /**
     * Update homepage with new preview content
     */
    async updateHomepagePreview(config, preview, docFile) {
        const homepagePath = this.config.homepagePath;
        
        if (!fs.existsSync(homepagePath)) {
            throw new Error('Homepage file not found');
        }

        let homepageContent = fs.readFileSync(homepagePath, 'utf8');
        
        // Create preview HTML
        const previewHTML = this.createPreviewHTML(config, preview, docFile);
        
        // Find and replace existing preview or insert new one
        const previewRegex = new RegExp(
            `<!--\\s*${config.previewId}\\s*start\\s*-->[\\s\\S]*?<!--\\s*${config.previewId}\\s*end\\s*-->`,
            'i'
        );

        if (previewRegex.test(homepageContent)) {
            // Replace existing preview
            homepageContent = homepageContent.replace(previewRegex, previewHTML);
        } else {
            // Insert new preview in appropriate section
            const sectionInserted = this.insertPreviewInSection(homepageContent, config, previewHTML);
            if (sectionInserted) {
                homepageContent = sectionInserted;
            } else {
                console.warn(`⚠️  Could not find section ${config.homepageSection} to insert preview`);
                return;
            }
        }

        // Write updated homepage
        fs.writeFileSync(homepagePath, homepageContent);
        console.log(`📝 Updated preview for ${docFile} in ${config.homepageSection}`);
    }

    /**
     * Create preview HTML
     */
    createPreviewHTML(config, preview, docFile) {
        const docLink = `docs/${docFile.replace('.md', '/')}`; // Convert to HTML path
        
        return `<!-- ${config.previewId} start -->
<div class="content-preview" data-source="${docFile}">
    <div class="preview-content">
        <p>${preview}</p>
    </div>
    <div class="preview-actions">
        <a href="${docLink}" class="preview-link" aria-label="${config.linkText}">
            ${config.linkText} <span class="link-arrow">→</span>
        </a>
    </div>
</div>
<!-- ${config.previewId} end -->`;
    }

    /**
     * Insert preview in appropriate homepage section
     */
    insertPreviewInSection(homepageContent, config, previewHTML) {
        // Look for section markers or IDs
        const sectionPatterns = [
            new RegExp(`id=["']${config.homepageSection}["'][^>]*>([\\s\\S]*?)(?=<(?:section|div)[^>]*id=|$)`, 'i'),
            new RegExp(`class=["'][^"']*${config.homepageSection}[^"']*["'][^>]*>([\\s\\S]*?)(?=<(?:section|div)[^>]*class=|$)`, 'i'),
            new RegExp(`<!--\\s*${config.homepageSection}\\s*-->([\\s\\S]*?)(?=<!--\\s*\\w+\\s*-->|$)`, 'i')
        ];

        for (const pattern of sectionPatterns) {
            if (pattern.test(homepageContent)) {
                return homepageContent.replace(pattern, (match, sectionContent) => {
                    // Insert preview at the end of the section content
                    const insertPoint = sectionContent.lastIndexOf('</div>');
                    if (insertPoint !== -1) {
                        return match.replace(sectionContent, 
                            sectionContent.substring(0, insertPoint) + 
                            '\n    ' + previewHTML + '\n' +
                            sectionContent.substring(insertPoint)
                        );
                    } else {
                        return match + '\n' + previewHTML;
                    }
                });
            }
        }

        return null;
    }

    /**
     * Get file hash for change detection
     */
    async getFileHash(filePath) {
        const content = fs.readFileSync(filePath);
        return crypto.createHash('md5').update(content).digest('hex');
    }

    /**
     * Load cache from file
     */
    loadCache() {
        try {
            if (fs.existsSync(this.config.cacheFile)) {
                return JSON.parse(fs.readFileSync(this.config.cacheFile, 'utf8'));
            }
        } catch (error) {
            console.warn('⚠️  Could not load cache, starting fresh');
        }
        return {};
    }

    /**
     * Save cache to file
     */
    saveCache() {
        try {
            fs.writeFileSync(this.config.cacheFile, JSON.stringify(this.cache, null, 2));
        } catch (error) {
            console.error('❌ Could not save cache:', error.message);
        }
    }

    /**
     * Update cache entry
     */
    updateCache(docFile, docPath) {
        const stats = fs.statSync(docPath);
        this.cache[docFile] = {
            hash: this.getFileHash(docPath),
            lastModified: stats.mtime.toISOString(),
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Log update results
     */
    logResults(results) {
        const logDir = 'maintenance-logs';
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const logFile = path.join(logDir, `content-preview-update-${Date.now()}.log`);
        const logContent = `
Content Preview Update Log
=========================
Timestamp: ${results.timestamp}

UPDATED PREVIEWS (${results.updated.length}):
${results.updated.map(item => `- ${item.file} → ${item.section} (${item.previewLength} chars)`).join('\n')}

SKIPPED (${results.skipped.length}):
${results.skipped.map(item => `- ${item.file}: ${item.reason}`).join('\n')}

ERRORS (${results.errors.length}):
${results.errors.map(item => `- ${item.file}: ${item.error}`).join('\n')}

END OF LOG
=========
`;

        fs.writeFileSync(logFile, logContent);
    }

    /**
     * Watch for documentation changes and auto-update
     */
    watchForChanges() {
        console.log('👀 Watching for documentation changes...');
        
        if (!fs.existsSync(this.config.docsPath)) {
            console.error(`❌ Documentation path ${this.config.docsPath} not found`);
            return;
        }

        fs.watch(this.config.docsPath, { recursive: true }, (eventType, filename) => {
            if (filename && filename.endsWith('.md')) {
                console.log(`📄 Detected change in ${filename}`);
                
                // Debounce updates
                clearTimeout(this.updateTimeout);
                this.updateTimeout = setTimeout(() => {
                    this.updatePreviews().catch(console.error);
                }, 2000);
            }
        });

        console.log('✅ File watcher started. Press Ctrl+C to stop.');
    }
}

// CLI interface
if (require.main === module) {
    const updater = new ContentPreviewUpdater();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'update':
            updater.updatePreviews().catch(console.error);
            break;
        case 'watch':
            updater.watchForChanges();
            break;
        default:
            console.log(`
Usage: node scripts/content-preview-updater.js <command>

Commands:
  update  - Update all content previews once
  watch   - Watch for changes and auto-update previews

Examples:
  node scripts/content-preview-updater.js update
  node scripts/content-preview-updater.js watch
            `);
    }
}

module.exports = ContentPreviewUpdater;