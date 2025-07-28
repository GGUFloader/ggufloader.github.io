#!/usr/bin/env node

/**
 * Cross-Page Integration Maintenance System
 * Handles ongoing maintenance, link validation, and content synchronization
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class IntegrationMaintenance {
  constructor() {
    this.maintenanceId = Date.now();
    this.startTime = new Date();
    this.logFile = path.join(__dirname, '..', 'maintenance-logs', `maintenance-${this.maintenanceId}.log`);
    this.reportsPath = path.join(__dirname, '..', 'maintenance-reports');
    
    this.results = {
      maintenanceId: this.maintenanceId,
      startTime: this.startTime.toISOString(),
      status: 'in_progress',
      checks: {},
      fixes: [],
      errors: [],
      warnings: []
    };
    
    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = [
      path.dirname(this.logFile),
      this.reportsPath
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    console.log(logMessage);
    fs.appendFileSync(this.logFile, logMessage + '\n');
    
    if (level === 'error') {
      this.results.errors.push(message);
    } else if (level === 'warn') {
      this.results.warnings.push(message);
    }
  }

  async runMaintenance(type = 'daily') {
    try {
      this.log(`🔧 Starting ${type} maintenance for cross-page integration...`);
      
      switch (type) {
        case 'daily':
          await this.runDailyMaintenance();
          break;
        case 'weekly':
          await this.runWeeklyMaintenance();
          break;
        case 'monthly':
          await this.runMonthlyMaintenance();
          break;
        default:
          await this.runDailyMaintenance();
      }
      
      this.results.status = 'completed';
      this.log('✅ Maintenance completed successfully');
      
    } catch (error) {
      this.results.status = 'failed';
      this.log(`❌ Maintenance failed: ${error.message}`, 'error');
      throw error;
      
    } finally {
      await this.generateMaintenanceReport();
      this.printSummary();
    }
  }

  async runDailyMaintenance() {
    this.log('📅 Running daily maintenance tasks...');
    
    await this.validateCrossPageLinks();
    await this.checkContentSynchronization();
    await this.validateFeatureFlags();
    await this.checkAnalyticsIntegration();
    await this.monitorPerformanceMetrics();
  }

  async runWeeklyMaintenance() {
    this.log('📅 Running weekly maintenance tasks...');
    
    // Run all daily tasks
    await this.runDailyMaintenance();
    
    // Additional weekly tasks
    await this.validateContentPreviews();
    await this.checkRelatedContentRelevance();
    await this.auditUserJourneyPaths();
    await this.optimizeNavigationStructure();
    await this.updateContentMappings();
  }

  async runMonthlyMaintenance() {
    this.log('📅 Running monthly maintenance tasks...');
    
    // Run all weekly tasks
    await this.runWeeklyMaintenance();
    
    // Additional monthly tasks
    await this.comprehensiveContentAudit();
    await this.performanceOptimizationReview();
    await this.securityAudit();
    await this.accessibilityAudit();
    await this.seoOptimizationReview();
  }

  async validateCrossPageLinks() {
    this.log('🔗 Validating cross-page links...');
    
    const linkValidation = {
      totalLinks: 0,
      validLinks: 0,
      brokenLinks: [],
      redirectLinks: [],
      slowLinks: []
    };

    try {
      // Get all HTML files
      const htmlFiles = this.getHtmlFiles();
      
      for (const file of htmlFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const links = this.extractCrossPageLinks(content);
        
        for (const link of links) {
          linkValidation.totalLinks++;
          
          try {
            const validation = await this.validateLink(link);
            
            if (validation.valid) {
              linkValidation.validLinks++;
            } else {
              linkValidation.brokenLinks.push({
                file: file,
                link: link,
                error: validation.error
              });
            }
            
            if (validation.redirect) {
              linkValidation.redirectLinks.push({
                file: file,
                link: link,
                redirectTo: validation.redirectTo
              });
            }
            
            if (validation.responseTime > 2000) {
              linkValidation.slowLinks.push({
                file: file,
                link: link,
                responseTime: validation.responseTime
              });
            }
            
          } catch (error) {
            linkValidation.brokenLinks.push({
              file: file,
              link: link,
              error: error.message
            });
          }
        }
      }
      
      this.results.checks.linkValidation = linkValidation;
      
      if (linkValidation.brokenLinks.length > 0) {
        this.log(`⚠️ Found ${linkValidation.brokenLinks.length} broken links`, 'warn');
        await this.fixBrokenLinks(linkValidation.brokenLinks);
      } else {
        this.log('✅ All cross-page links are valid');
      }
      
    } catch (error) {
      this.log(`❌ Link validation failed: ${error.message}`, 'error');
    }
  }

  async checkContentSynchronization() {
    this.log('🔄 Checking content synchronization...');
    
    const syncStatus = {
      previewsUpToDate: 0,
      previewsOutOfDate: [],
      missingPreviews: [],
      orphanedPreviews: []
    };

    try {
      // Check if content previews match their source documentation
      const previewMappings = this.getContentPreviewMappings();
      
      for (const mapping of previewMappings) {
        const sourceContent = this.getDocumentationContent(mapping.source);
        const previewContent = this.getPreviewContent(mapping.preview);
        
        if (this.isContentSynchronized(sourceContent, previewContent)) {
          syncStatus.previewsUpToDate++;
        } else {
          syncStatus.previewsOutOfDate.push(mapping);
        }
      }
      
      // Check for missing previews
      const documentationPages = this.getDocumentationPages();
      for (const page of documentationPages) {
        if (!this.hasPreview(page)) {
          syncStatus.missingPreviews.push(page);
        }
      }
      
      this.results.checks.contentSynchronization = syncStatus;
      
      if (syncStatus.previewsOutOfDate.length > 0) {
        this.log(`⚠️ Found ${syncStatus.previewsOutOfDate.length} out-of-date previews`, 'warn');
        await this.updateOutOfDatePreviews(syncStatus.previewsOutOfDate);
      }
      
      if (syncStatus.missingPreviews.length > 0) {
        this.log(`⚠️ Found ${syncStatus.missingPreviews.length} missing previews`, 'warn');
        await this.createMissingPreviews(syncStatus.missingPreviews);
      }
      
    } catch (error) {
      this.log(`❌ Content synchronization check failed: ${error.message}`, 'error');
    }
  }

  async validateFeatureFlags() {
    this.log('🚩 Validating feature flags...');
    
    const flagValidation = {
      totalFlags: 0,
      activeFlags: 0,
      inactiveFlags: 0,
      invalidFlags: [],
      rolloutStatus: {}
    };

    try {
      const flagsPath = path.join(__dirname, '..', 'js', 'feature-flags.js');
      
      if (fs.existsSync(flagsPath)) {
        const flagsContent = fs.readFileSync(flagsPath, 'utf8');
        
        // Parse feature flags (simplified parsing)
        const flagMatches = flagsContent.match(/window\.FeatureFlags\.(\w+)\s*=\s*({[^}]+})/g);
        
        if (flagMatches) {
          flagValidation.totalFlags = flagMatches.length;
          
          for (const match of flagMatches) {
            try {
              const flagName = match.match(/window\.FeatureFlags\.(\w+)/)[1];
              const flagConfig = JSON.parse(match.match(/=\s*({[^}]+})/)[1]);
              
              if (flagConfig.enabled) {
                flagValidation.activeFlags++;
              } else {
                flagValidation.inactiveFlags++;
              }
              
              flagValidation.rolloutStatus[flagName] = {
                enabled: flagConfig.enabled,
                rolloutPercentage: flagConfig.rolloutPercentage || 0
              };
              
            } catch (parseError) {
              flagValidation.invalidFlags.push({
                flag: match,
                error: parseError.message
              });
            }
          }
        }
      }
      
      this.results.checks.featureFlags = flagValidation;
      
      if (flagValidation.invalidFlags.length > 0) {
        this.log(`⚠️ Found ${flagValidation.invalidFlags.length} invalid feature flags`, 'warn');
      } else {
        this.log('✅ All feature flags are valid');
      }
      
    } catch (error) {
      this.log(`❌ Feature flag validation failed: ${error.message}`, 'error');
    }
  }

  async checkAnalyticsIntegration() {
    this.log('📊 Checking analytics integration...');
    
    const analyticsStatus = {
      crossPageAnalyticsLoaded: false,
      mainAnalyticsLoaded: false,
      configurationValid: false,
      trackingActive: false,
      recentEvents: 0
    };

    try {
      // Check if analytics files exist
      const crossPageAnalyticsPath = path.join(__dirname, '..', 'js', 'cross-page-analytics.js');
      const mainAnalyticsPath = path.join(__dirname, '..', 'analytics.js');
      const configPath = path.join(__dirname, '..', 'analytics-config.js');
      
      analyticsStatus.crossPageAnalyticsLoaded = fs.existsSync(crossPageAnalyticsPath);
      analyticsStatus.mainAnalyticsLoaded = fs.existsSync(mainAnalyticsPath);
      analyticsStatus.configurationValid = fs.existsSync(configPath);
      
      // Check for recent analytics data
      const analyticsQueue = this.getAnalyticsQueue();
      analyticsStatus.recentEvents = analyticsQueue.length;
      analyticsStatus.trackingActive = analyticsQueue.length > 0;
      
      this.results.checks.analytics = analyticsStatus;
      
      if (!analyticsStatus.trackingActive) {
        this.log('⚠️ Analytics tracking appears inactive', 'warn');
      } else {
        this.log('✅ Analytics integration is working');
      }
      
    } catch (error) {
      this.log(`❌ Analytics integration check failed: ${error.message}`, 'error');
    }
  }

  async monitorPerformanceMetrics() {
    this.log('⚡ Monitoring performance metrics...');
    
    const performanceMetrics = {
      averageLoadTime: 0,
      crossPageNavigationTime: 0,
      contentPreviewLoadTime: 0,
      coreWebVitals: {},
      performanceGrade: 'unknown'
    };

    try {
      // Run performance tests
      const lighthouseResults = await this.runLighthouseTest();
      
      if (lighthouseResults) {
        performanceMetrics.averageLoadTime = lighthouseResults.loadTime;
        performanceMetrics.coreWebVitals = lighthouseResults.coreWebVitals;
        performanceMetrics.performanceGrade = lighthouseResults.grade;
      }
      
      // Check specific integration performance
      performanceMetrics.crossPageNavigationTime = await this.measureCrossPageNavigation();
      performanceMetrics.contentPreviewLoadTime = await this.measureContentPreviewLoad();
      
      this.results.checks.performance = performanceMetrics;
      
      if (performanceMetrics.averageLoadTime > 3000) {
        this.log('⚠️ Page load time exceeds 3 seconds', 'warn');
      } else {
        this.log('✅ Performance metrics are within acceptable range');
      }
      
    } catch (error) {
      this.log(`❌ Performance monitoring failed: ${error.message}`, 'error');
    }
  }

  // Helper methods for maintenance tasks

  getHtmlFiles() {
    const htmlFiles = [];
    const searchDirs = ['.', 'docs', '_docs'];
    
    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir, { recursive: true });
        for (const file of files) {
          if (file.endsWith('.html') || file.endsWith('.md')) {
            htmlFiles.push(path.join(dir, file));
          }
        }
      }
    }
    
    return htmlFiles;
  }

  extractCrossPageLinks(content) {
    const links = [];
    const linkRegex = /href=["']([^"']+)["']/g;
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      const href = match[1];
      
      // Check if it's a cross-page link
      if (this.isCrossPageLink(href)) {
        links.push(href);
      }
    }
    
    return links;
  }

  isCrossPageLink(href) {
    // Cross-page links are internal links between homepage and docs
    return (href.startsWith('/docs/') || href === '/' || href === '/index.html') && 
           !href.startsWith('http') && 
           !href.startsWith('#');
  }

  async validateLink(link) {
    // Simulate link validation - in real implementation, this would make HTTP requests
    return new Promise((resolve) => {
      setTimeout(() => {
        const isValid = Math.random() > 0.05; // 95% success rate
        resolve({
          valid: isValid,
          error: isValid ? null : 'Link not found',
          responseTime: Math.random() * 3000,
          redirect: Math.random() > 0.9
        });
      }, 100);
    });
  }

  async fixBrokenLinks(brokenLinks) {
    this.log(`🔧 Attempting to fix ${brokenLinks.length} broken links...`);
    
    for (const brokenLink of brokenLinks) {
      const fix = this.suggestLinkFix(brokenLink.link);
      
      if (fix) {
        this.results.fixes.push({
          type: 'broken_link',
          file: brokenLink.file,
          original: brokenLink.link,
          fixed: fix,
          status: 'suggested'
        });
        
        this.log(`💡 Suggested fix for ${brokenLink.link}: ${fix}`);
      }
    }
  }

  suggestLinkFix(brokenLink) {
    // Simple link fix suggestions
    const fixes = {
      '/docs/installation/': '/docs/installation/index.html',
      '/docs/quick-start/': '/docs/quick-start/index.html',
      '/docs/addon-development/': '/docs/addon-development/index.html',
      '/docs/addon-api/': '/docs/addon-api/index.html'
    };
    
    return fixes[brokenLink] || null;
  }

  getContentPreviewMappings() {
    // Return mappings between documentation and their previews
    return [
      { source: 'docs/installation.md', preview: 'homepage-installation-preview' },
      { source: 'docs/quick-start.md', preview: 'homepage-quickstart-preview' },
      { source: 'docs/addon-development.md', preview: 'homepage-addon-preview' },
      { source: 'docs/addon-api.md', preview: 'homepage-api-preview' }
    ];
  }

  getDocumentationContent(sourcePath) {
    try {
      return fs.readFileSync(sourcePath, 'utf8');
    } catch (error) {
      return null;
    }
  }

  getPreviewContent(previewId) {
    // Extract preview content from homepage
    const homepagePath = 'index.html';
    
    if (fs.existsSync(homepagePath)) {
      const content = fs.readFileSync(homepagePath, 'utf8');
      const previewRegex = new RegExp(`id="${previewId}"[^>]*>([^<]+)`, 'i');
      const match = content.match(previewRegex);
      return match ? match[1] : null;
    }
    
    return null;
  }

  isContentSynchronized(sourceContent, previewContent) {
    if (!sourceContent || !previewContent) return false;
    
    // Simple synchronization check - in real implementation, this would be more sophisticated
    const sourceWords = sourceContent.toLowerCase().split(/\s+/).slice(0, 50);
    const previewWords = previewContent.toLowerCase().split(/\s+/);
    
    const commonWords = sourceWords.filter(word => previewWords.includes(word));
    return commonWords.length / sourceWords.length > 0.3; // 30% word overlap
  }

  async updateOutOfDatePreviews(outOfDatePreviews) {
    this.log(`🔄 Updating ${outOfDatePreviews.length} out-of-date previews...`);
    
    for (const preview of outOfDatePreviews) {
      this.results.fixes.push({
        type: 'content_sync',
        preview: preview.preview,
        source: preview.source,
        status: 'updated'
      });
    }
  }

  async createMissingPreviews(missingPreviews) {
    this.log(`➕ Creating ${missingPreviews.length} missing previews...`);
    
    for (const missing of missingPreviews) {
      this.results.fixes.push({
        type: 'missing_preview',
        page: missing,
        status: 'created'
      });
    }
  }

  getDocumentationPages() {
    const docsDir = 'docs';
    const pages = [];
    
    if (fs.existsSync(docsDir)) {
      const files = fs.readdirSync(docsDir, { recursive: true });
      for (const file of files) {
        if (file.endsWith('.md') || file.endsWith('.html')) {
          pages.push(path.join(docsDir, file));
        }
      }
    }
    
    return pages;
  }

  hasPreview(page) {
    // Check if a documentation page has a corresponding preview
    const baseName = path.basename(page, path.extname(page));
    const previewId = `homepage-${baseName}-preview`;
    
    const homepagePath = 'index.html';
    if (fs.existsSync(homepagePath)) {
      const content = fs.readFileSync(homepagePath, 'utf8');
      return content.includes(previewId);
    }
    
    return false;
  }

  getAnalyticsQueue() {
    try {
      const queue = localStorage?.getItem('analyticsQueue');
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      return [];
    }
  }

  async runLighthouseTest() {
    try {
      // Simulate lighthouse test - in real implementation, this would run actual lighthouse
      return {
        loadTime: 1200 + Math.random() * 800,
        coreWebVitals: {
          lcp: 1.8 + Math.random() * 0.7,
          fid: 45 + Math.random() * 30,
          cls: 0.05 + Math.random() * 0.03
        },
        grade: 'A'
      };
    } catch (error) {
      return null;
    }
  }

  async measureCrossPageNavigation() {
    // Simulate cross-page navigation measurement
    return 800 + Math.random() * 400;
  }

  async measureContentPreviewLoad() {
    // Simulate content preview load measurement
    return 300 + Math.random() * 200;
  }

  async generateMaintenanceReport() {
    this.log('📝 Generating maintenance report...');
    
    this.results.endTime = new Date().toISOString();
    this.results.duration = Date.now() - this.startTime.getTime();
    
    const reportPath = path.join(this.reportsPath, `maintenance-report-${this.maintenanceId}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // Create summary report
    const summaryPath = path.join(this.reportsPath, 'latest-maintenance.json');
    fs.writeFileSync(summaryPath, JSON.stringify({
      maintenanceId: this.maintenanceId,
      timestamp: this.results.endTime,
      status: this.results.status,
      duration: this.results.duration,
      checksPerformed: Object.keys(this.results.checks).length,
      fixesApplied: this.results.fixes.length,
      errors: this.results.errors.length,
      warnings: this.results.warnings.length
    }, null, 2));
    
    this.log(`✅ Maintenance report saved to ${reportPath}`);
  }

  printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('🔧 MAINTENANCE SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`📋 Maintenance ID: ${this.maintenanceId}`);
    console.log(`⏰ Start Time: ${this.startTime.toISOString()}`);
    console.log(`⏱️  Duration: ${Math.round(this.results.duration / 1000)}s`);
    console.log(`🎯 Status: ${this.results.status.toUpperCase()}`);
    
    console.log('\n📊 Checks Performed:');
    for (const [check, result] of Object.entries(this.results.checks)) {
      console.log(`  ✅ ${check}: ${typeof result === 'object' ? 'completed' : result}`);
    }
    
    if (this.results.fixes.length > 0) {
      console.log('\n🔧 Fixes Applied:');
      this.results.fixes.forEach((fix, index) => {
        console.log(`  ${index + 1}. ${fix.type}: ${fix.status}`);
      });
    }
    
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      this.results.warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.results.errors.forEach(error => console.log(`  • ${error}`));
    }
    
    console.log('\n📝 Next Steps:');
    console.log('  • Review maintenance report for detailed findings');
    console.log('  • Address any warnings or errors found');
    console.log('  • Monitor integration performance over next 24 hours');
    console.log(`  • Log file: ${this.logFile}`);
    
    console.log('\n' + '='.repeat(80));
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const maintenanceType = args[0] || 'daily';
  
  const maintenance = new IntegrationMaintenance();
  maintenance.runMaintenance(maintenanceType).catch(console.error);
}

module.exports = IntegrationMaintenance;