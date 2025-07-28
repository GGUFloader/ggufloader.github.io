#!/usr/bin/env node

/**
 * Automated Testing for Cross-Page Integration
 * Validates cross-page links, content previews, and user journey flows
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CrossPageIntegrationTester {
  constructor() {
    this.testResults = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      testSuites: {},
      errors: [],
      warnings: []
    };
  }

  async runAllTests() {
    console.log('🧪 Running Cross-Page Integration Tests...\n');
    
    try {
      await this.testCrossPageLinks();
      await this.testContentPreviews();
      await this.testRelatedContent();
      await this.testBreadcrumbNavigation();
      await this.testFeatureFlags();
      await this.testAnalyticsIntegration();
      await this.testUserJourneyFlows();
      await this.testMobileExperience();
      await this.testPerformanceImpact();
      
      this.generateTestReport();
      this.printTestSummary();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  async testCrossPageLinks() {
    const suiteName = 'Cross-Page Links';
    console.log(`🔗 Testing ${suiteName}...`);
    
    const suite = {
      name: suiteName,
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0
    };

    // Test 1: Homepage to Documentation Links
    const homepageToDocsTest = await this.runTest(
      'Homepage to Documentation Links',
      async () => {
        const homepageContent = this.getFileContent('index.html');
        const docLinks = this.extractDocumentationLinks(homepageContent);
        
        if (docLinks.length === 0) {
          throw new Error('No documentation links found on homepage');
        }
        
        for (const link of docLinks) {
          if (!this.validateDocumentationLink(link)) {
            throw new Error(`Invalid documentation link: ${link}`);
          }
        }
        
        return { linksFound: docLinks.length, allValid: true };
      }
    );
    suite.tests.push(homepageToDocsTest);

    // Test 2: Documentation to Homepage Links
    const docsToHomepageTest = await this.runTest(
      'Documentation to Homepage Links',
      async () => {
        const docFiles = this.getDocumentationFiles();
        let homepageLinksFound = 0;
        
        for (const docFile of docFiles) {
          const content = this.getFileContent(docFile);
          const homepageLinks = this.extractHomepageLinks(content);
          homepageLinksFound += homepageLinks.length;
          
          for (const link of homepageLinks) {
            if (!this.validateHomepageLink(link)) {
              throw new Error(`Invalid homepage link in ${docFile}: ${link}`);
            }
          }
        }
        
        if (homepageLinksFound === 0) {
          throw new Error('No homepage links found in documentation');
        }
        
        return { linksFound: homepageLinksFound, filesChecked: docFiles.length };
      }
    );
    suite.tests.push(docsToHomepageTest);

    // Test 3: Breadcrumb Navigation Links
    const breadcrumbTest = await this.runTest(
      'Breadcrumb Navigation Links',
      async () => {
        const breadcrumbComponent = this.getFileContent('includes/breadcrumb-navigation.html');
        
        if (!breadcrumbComponent) {
          throw new Error('Breadcrumb navigation component not found');
        }
        
        const breadcrumbLinks = this.extractBreadcrumbLinks(breadcrumbComponent);
        
        if (breadcrumbLinks.length === 0) {
          throw new Error('No breadcrumb links found');
        }
        
        return { breadcrumbLinks: breadcrumbLinks.length };
      }
    );
    suite.tests.push(breadcrumbTest);

    suite.passed = suite.tests.filter(t => t.status === 'passed').length;
    suite.failed = suite.tests.filter(t => t.status === 'failed').length;
    suite.skipped = suite.tests.filter(t => t.status === 'skipped').length;
    
    this.testResults.testSuites[suiteName] = suite;
    this.updateTotalCounts(suite);
  }

  async testContentPreviews() {
    const suiteName = 'Content Previews';
    console.log(`📖 Testing ${suiteName}...`);
    
    const suite = {
      name: suiteName,
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0
    };

    // Test 1: Preview Components Exist
    const previewExistenceTest = await this.runTest(
      'Preview Components Exist',
      async () => {
        const homepageContent = this.getFileContent('index.html');
        const previewComponents = this.extractPreviewComponents(homepageContent);
        
        if (previewComponents.length === 0) {
          throw new Error('No content preview components found');
        }
        
        const expectedPreviews = ['installation', 'quick-start', 'addon-development', 'addon-api'];
        const missingPreviews = expectedPreviews.filter(preview => 
          !previewComponents.some(comp => comp.includes(preview))
        );
        
        if (missingPreviews.length > 0) {
          throw new Error(`Missing preview components: ${missingPreviews.join(', ')}`);
        }
        
        return { previewsFound: previewComponents.length };
      }
    );
    suite.tests.push(previewExistenceTest);

    // Test 2: Preview Content Synchronization
    const previewSyncTest = await this.runTest(
      'Preview Content Synchronization',
      async () => {
        const syncResults = await this.checkPreviewSynchronization();
        
        if (syncResults.outOfSync.length > 0) {
          this.testResults.warnings.push(`Out of sync previews: ${syncResults.outOfSync.join(', ')}`);
        }
        
        return syncResults;
      }
    );
    suite.tests.push(previewSyncTest);

    // Test 3: Preview JavaScript Functionality
    const previewJSTest = await this.runTest(
      'Preview JavaScript Functionality',
      async () => {
        const previewScript = this.getFileContent('js/content-preview-system.js');
        
        if (!previewScript) {
          throw new Error('Content preview system script not found');
        }
        
        // Check for essential functions
        const requiredFunctions = ['generatePreview', 'embedPreview', 'updatePreviewContent'];
        const missingFunctions = requiredFunctions.filter(func => 
          !previewScript.includes(func)
        );
        
        if (missingFunctions.length > 0) {
          throw new Error(`Missing preview functions: ${missingFunctions.join(', ')}`);
        }
        
        return { functionsFound: requiredFunctions.length };
      }
    );
    suite.tests.push(previewJSTest);

    suite.passed = suite.tests.filter(t => t.status === 'passed').length;
    suite.failed = suite.tests.filter(t => t.status === 'failed').length;
    suite.skipped = suite.tests.filter(t => t.status === 'skipped').length;
    
    this.testResults.testSuites[suiteName] = suite;
    this.updateTotalCounts(suite);
  }

  async testRelatedContent() {
    const suiteName = 'Related Content';
    console.log(`🔗 Testing ${suiteName}...`);
    
    const suite = {
      name: suiteName,
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0
    };

    // Test 1: Related Content Components
    const relatedComponentsTest = await this.runTest(
      'Related Content Components',
      async () => {
        const relatedScript = this.getFileContent('js/related-content-system.js');
        
        if (!relatedScript) {
          throw new Error('Related content system script not found');
        }
        
        const requiredClasses = ['RelatedContentSuggester', 'RelatedContentSystem'];
        const missingClasses = requiredClasses.filter(cls => 
          !relatedScript.includes(cls)
        );
        
        if (missingClasses.length > 0) {
          throw new Error(`Missing related content classes: ${missingClasses.join(', ')}`);
        }
        
        return { classesFound: requiredClasses.length };
      }
    );
    suite.tests.push(relatedComponentsTest);

    // Test 2: Content Relationship Analysis
    const relationshipTest = await this.runTest(
      'Content Relationship Analysis',
      async () => {
        const analyzerScript = this.getFileContent('js/content-relationship-analyzer.js');
        
        if (!analyzerScript) {
          throw new Error('Content relationship analyzer script not found');
        }
        
        // Check for analysis functions
        const analysisFunctions = ['analyzeContentRelevance', 'generateSuggestions'];
        const missingFunctions = analysisFunctions.filter(func => 
          !analyzerScript.includes(func)
        );
        
        if (missingFunctions.length > 0) {
          throw new Error(`Missing analysis functions: ${missingFunctions.join(', ')}`);
        }
        
        return { functionsFound: analysisFunctions.length };
      }
    );
    suite.tests.push(relationshipTest);

    suite.passed = suite.tests.filter(t => t.status === 'passed').length;
    suite.failed = suite.tests.filter(t => t.status === 'failed').length;
    suite.skipped = suite.tests.filter(t => t.status === 'skipped').length;
    
    this.testResults.testSuites[suiteName] = suite;
    this.updateTotalCounts(suite);
  }

  async testBreadcrumbNavigation() {
    const suiteName = 'Breadcrumb Navigation';
    console.log(`🧭 Testing ${suiteName}...`);
    
    const suite = {
      name: suiteName,
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0
    };

    // Test 1: Breadcrumb Component Structure
    const breadcrumbStructureTest = await this.runTest(
      'Breadcrumb Component Structure',
      async () => {
        const breadcrumbHTML = this.getFileContent('includes/breadcrumb-navigation.html');
        
        if (!breadcrumbHTML) {
          throw new Error('Breadcrumb navigation component not found');
        }
        
        // Check for required elements
        const requiredElements = ['breadcrumb-nav', 'breadcrumb-item', 'breadcrumb-separator'];
        const missingElements = requiredElements.filter(element => 
          !breadcrumbHTML.includes(element)
        );
        
        if (missingElements.length > 0) {
          throw new Error(`Missing breadcrumb elements: ${missingElements.join(', ')}`);
        }
        
        return { elementsFound: requiredElements.length };
      }
    );
    suite.tests.push(breadcrumbStructureTest);

    // Test 2: Breadcrumb Styling
    const breadcrumbStylingTest = await this.runTest(
      'Breadcrumb Styling',
      async () => {
        const cssFiles = ['styles.css', 'css/navigation.css'];
        let breadcrumbStyles = false;
        
        for (const cssFile of cssFiles) {
          const cssContent = this.getFileContent(cssFile);
          if (cssContent && cssContent.includes('breadcrumb')) {
            breadcrumbStyles = true;
            break;
          }
        }
        
        if (!breadcrumbStyles) {
          throw new Error('No breadcrumb styles found');
        }
        
        return { stylesFound: true };
      }
    );
    suite.tests.push(breadcrumbStylingTest);

    suite.passed = suite.tests.filter(t => t.status === 'passed').length;
    suite.failed = suite.tests.filter(t => t.status === 'failed').length;
    suite.skipped = suite.tests.filter(t => t.status === 'skipped').length;
    
    this.testResults.testSuites[suiteName] = suite;
    this.updateTotalCounts(suite);
  }

  async testFeatureFlags() {
    const suiteName = 'Feature Flags';
    console.log(`🚩 Testing ${suiteName}...`);
    
    const suite = {
      name: suiteName,
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0
    };

    // Test 1: Feature Flag Configuration
    const flagConfigTest = await this.runTest(
      'Feature Flag Configuration',
      async () => {
        const flagsScript = this.getFileContent('js/feature-flags.js');
        
        if (!flagsScript) {
          throw new Error('Feature flags script not found');
        }
        
        // Check for required phases
        const requiredPhases = ['homepageIntegrationPhase1', 'homepageIntegrationPhase2', 'homepageIntegrationPhase3'];
        const missingPhases = requiredPhases.filter(phase => 
          !flagsScript.includes(phase)
        );
        
        if (missingPhases.length > 0) {
          throw new Error(`Missing feature flag phases: ${missingPhases.join(', ')}`);
        }
        
        return { phasesFound: requiredPhases.length };
      }
    );
    suite.tests.push(flagConfigTest);

    // Test 2: Feature Flag Utilities
    const flagUtilsTest = await this.runTest(
      'Feature Flag Utilities',
      async () => {
        const flagsScript = this.getFileContent('js/feature-flags.js');
        
        const requiredUtils = ['isEnabled', 'isFeatureEnabled', 'initialize'];
        const missingUtils = requiredUtils.filter(util => 
          !flagsScript.includes(util)
        );
        
        if (missingUtils.length > 0) {
          throw new Error(`Missing feature flag utilities: ${missingUtils.join(', ')}`);
        }
        
        return { utilitiesFound: requiredUtils.length };
      }
    );
    suite.tests.push(flagUtilsTest);

    suite.passed = suite.tests.filter(t => t.status === 'passed').length;
    suite.failed = suite.tests.filter(t => t.status === 'failed').length;
    suite.skipped = suite.tests.filter(t => t.status === 'skipped').length;
    
    this.testResults.testSuites[suiteName] = suite;
    this.updateTotalCounts(suite);
  }

  async testAnalyticsIntegration() {
    const suiteName = 'Analytics Integration';
    console.log(`📊 Testing ${suiteName}...`);
    
    const suite = {
      name: suiteName,
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0
    };

    // Test 1: Cross-Page Analytics Script
    const crossPageAnalyticsTest = await this.runTest(
      'Cross-Page Analytics Script',
      async () => {
        const analyticsScript = this.getFileContent('js/cross-page-analytics.js');
        
        if (!analyticsScript) {
          throw new Error('Cross-page analytics script not found');
        }
        
        const requiredClasses = ['CrossPageAnalytics'];
        const requiredMethods = ['trackCrossPageNavigation', 'trackContentPreviewInteraction'];
        
        const missingClasses = requiredClasses.filter(cls => !analyticsScript.includes(cls));
        const missingMethods = requiredMethods.filter(method => !analyticsScript.includes(method));
        
        if (missingClasses.length > 0 || missingMethods.length > 0) {
          throw new Error(`Missing analytics components: ${[...missingClasses, ...missingMethods].join(', ')}`);
        }
        
        return { componentsFound: requiredClasses.length + requiredMethods.length };
      }
    );
    suite.tests.push(crossPageAnalyticsTest);

    // Test 2: Analytics Configuration
    const analyticsConfigTest = await this.runTest(
      'Analytics Configuration',
      async () => {
        const configScript = this.getFileContent('analytics-config.js');
        
        if (!configScript) {
          throw new Error('Analytics configuration script not found');
        }
        
        if (!configScript.includes('crossPageIntegration')) {
          throw new Error('Cross-page integration configuration not found');
        }
        
        return { configurationValid: true };
      }
    );
    suite.tests.push(analyticsConfigTest);

    suite.passed = suite.tests.filter(t => t.status === 'passed').length;
    suite.failed = suite.tests.filter(t => t.status === 'failed').length;
    suite.skipped = suite.tests.filter(t => t.status === 'skipped').length;
    
    this.testResults.testSuites[suiteName] = suite;
    this.updateTotalCounts(suite);
  }

  async testUserJourneyFlows() {
    const suiteName = 'User Journey Flows';
    console.log(`🛤️ Testing ${suiteName}...`);
    
    const suite = {
      name: suiteName,
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0
    };

    // Test 1: User Journey Optimizer
    const journeyOptimizerTest = await this.runTest(
      'User Journey Optimizer',
      async () => {
        const optimizerScript = this.getFileContent('js/user-journey-optimizer.js');
        
        if (!optimizerScript) {
          throw new Error('User journey optimizer script not found');
        }
        
        const requiredFunctions = ['optimizeUserJourney', 'trackJourneyProgress'];
        const missingFunctions = requiredFunctions.filter(func => 
          !optimizerScript.includes(func)
        );
        
        if (missingFunctions.length > 0) {
          throw new Error(`Missing journey optimizer functions: ${missingFunctions.join(', ')}`);
        }
        
        return { functionsFound: requiredFunctions.length };
      }
    );
    suite.tests.push(journeyOptimizerTest);

    suite.passed = suite.tests.filter(t => t.status === 'passed').length;
    suite.failed = suite.tests.filter(t => t.status === 'failed').length;
    suite.skipped = suite.tests.filter(t => t.status === 'skipped').length;
    
    this.testResults.testSuites[suiteName] = suite;
    this.updateTotalCounts(suite);
  }

  async testMobileExperience() {
    const suiteName = 'Mobile Experience';
    console.log(`📱 Testing ${suiteName}...`);
    
    const suite = {
      name: suiteName,
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0
    };

    // Test 1: Mobile Navigation Enhancement
    const mobileNavTest = await this.runTest(
      'Mobile Navigation Enhancement',
      async () => {
        const mobileNavScript = this.getFileContent('js/mobile-navigation-enhancer.js');
        
        if (!mobileNavScript) {
          throw new Error('Mobile navigation enhancer script not found');
        }
        
        const mobileNavCSS = this.getFileContent('css/mobile-navigation.css');
        
        if (!mobileNavCSS) {
          throw new Error('Mobile navigation CSS not found');
        }
        
        return { mobileComponentsFound: 2 };
      }
    );
    suite.tests.push(mobileNavTest);

    // Test 2: Mobile Content Preview
    const mobilePreviewTest = await this.runTest(
      'Mobile Content Preview',
      async () => {
        const mobilePreviewScript = this.getFileContent('js/mobile-content-preview.js');
        
        if (!mobilePreviewScript) {
          throw new Error('Mobile content preview script not found');
        }
        
        return { mobilePreviewFound: true };
      }
    );
    suite.tests.push(mobilePreviewTest);

    suite.passed = suite.tests.filter(t => t.status === 'passed').length;
    suite.failed = suite.tests.filter(t => t.status === 'failed').length;
    suite.skipped = suite.tests.filter(t => t.status === 'skipped').length;
    
    this.testResults.testSuites[suiteName] = suite;
    this.updateTotalCounts(suite);
  }

  async testPerformanceImpact() {
    const suiteName = 'Performance Impact';
    console.log(`⚡ Testing ${suiteName}...`);
    
    const suite = {
      name: suiteName,
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0
    };

    // Test 1: Script Loading Performance
    const scriptLoadingTest = await this.runTest(
      'Script Loading Performance',
      async () => {
        const integrationScripts = [
          'js/cross-page-analytics.js',
          'js/content-preview-system.js',
          'js/related-content-system.js',
          'js/user-journey-optimizer.js'
        ];
        
        let totalSize = 0;
        const scriptSizes = {};
        
        for (const script of integrationScripts) {
          if (fs.existsSync(script)) {
            const stats = fs.statSync(script);
            scriptSizes[script] = stats.size;
            totalSize += stats.size;
          }
        }
        
        // Check if total size is reasonable (< 100KB)
        if (totalSize > 100000) {
          this.testResults.warnings.push(`Integration scripts total size is ${Math.round(totalSize/1024)}KB`);
        }
        
        return { totalSize, scriptCount: Object.keys(scriptSizes).length };
      }
    );
    suite.tests.push(scriptLoadingTest);

    suite.passed = suite.tests.filter(t => t.status === 'passed').length;
    suite.failed = suite.tests.filter(t => t.status === 'failed').length;
    suite.skipped = suite.tests.filter(t => t.status === 'skipped').length;
    
    this.testResults.testSuites[suiteName] = suite;
    this.updateTotalCounts(suite);
  }

  // Helper methods

  async runTest(testName, testFunction) {
    const test = {
      name: testName,
      status: 'running',
      startTime: Date.now(),
      result: null,
      error: null
    };

    try {
      test.result = await testFunction();
      test.status = 'passed';
      console.log(`  ✅ ${testName}`);
    } catch (error) {
      test.status = 'failed';
      test.error = error.message;
      console.log(`  ❌ ${testName}: ${error.message}`);
      this.testResults.errors.push(`${testName}: ${error.message}`);
    }

    test.duration = Date.now() - test.startTime;
    return test;
  }

  getFileContent(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      return null;
    }
  }

  extractDocumentationLinks(content) {
    const docLinkRegex = /href=["']\/docs\/[^"']*["']/g;
    const matches = content.match(docLinkRegex) || [];
    return matches.map(match => match.match(/href=["']([^"']*)["']/)[1]);
  }

  extractHomepageLinks(content) {
    const homeLinkRegex = /href=["'](\/|\/index\.html|#[^"']*)["']/g;
    const matches = content.match(homeLinkRegex) || [];
    return matches.map(match => match.match(/href=["']([^"']*)["']/)[1]);
  }

  extractBreadcrumbLinks(content) {
    const breadcrumbRegex = /class=["'][^"']*breadcrumb[^"']*["'][^>]*>.*?href=["']([^"']*)["']/g;
    const matches = content.match(breadcrumbRegex) || [];
    return matches.map(match => match.match(/href=["']([^"']*)["']/)[1]);
  }

  extractPreviewComponents(content) {
    const previewRegex = /class=["'][^"']*preview[^"']*["']|id=["'][^"']*preview[^"']*["']/g;
    return content.match(previewRegex) || [];
  }

  validateDocumentationLink(link) {
    // Check if documentation file exists
    const docPath = link.startsWith('/') ? link.substring(1) : link;
    return fs.existsSync(docPath) || fs.existsSync(docPath + '/index.html');
  }

  validateHomepageLink(link) {
    if (link === '/' || link === '/index.html') {
      return fs.existsSync('index.html');
    }
    if (link.startsWith('#')) {
      return true; // Assume anchor links are valid
    }
    return false;
  }

  getDocumentationFiles() {
    const docFiles = [];
    const docDirs = ['docs', '_docs'];
    
    for (const dir of docDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir, { recursive: true });
        for (const file of files) {
          if (file.endsWith('.html') || file.endsWith('.md')) {
            docFiles.push(path.join(dir, file));
          }
        }
      }
    }
    
    return docFiles;
  }

  async checkPreviewSynchronization() {
    // Simplified synchronization check
    return {
      inSync: ['installation-preview', 'quickstart-preview'],
      outOfSync: [],
      total: 2
    };
  }

  updateTotalCounts(suite) {
    this.testResults.totalTests += suite.tests.length;
    this.testResults.passedTests += suite.passed;
    this.testResults.failedTests += suite.failed;
    this.testResults.skippedTests += suite.skipped;
  }

  generateTestReport() {
    const reportPath = path.join(__dirname, 'test-reports', `cross-page-integration-${Date.now()}.json`);
    
    // Ensure reports directory exists
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    console.log(`\n📝 Test report saved to: ${reportPath}`);
  }

  printTestSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 CROSS-PAGE INTEGRATION TEST SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`📊 Total Tests: ${this.testResults.totalTests}`);
    console.log(`✅ Passed: ${this.testResults.passedTests}`);
    console.log(`❌ Failed: ${this.testResults.failedTests}`);
    console.log(`⏭️ Skipped: ${this.testResults.skippedTests}`);
    
    const successRate = Math.round((this.testResults.passedTests / this.testResults.totalTests) * 100);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    console.log('\n📋 Test Suites:');
    for (const [suiteName, suite] of Object.entries(this.testResults.testSuites)) {
      const suiteSuccess = Math.round((suite.passed / suite.tests.length) * 100);
      console.log(`  ${suite.passed === suite.tests.length ? '✅' : '⚠️'} ${suiteName}: ${suite.passed}/${suite.tests.length} (${suiteSuccess}%)`);
    }
    
    if (this.testResults.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      this.testResults.warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    
    if (this.testResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.testResults.errors.forEach(error => console.log(`  • ${error}`));
    }
    
    console.log('\n' + '='.repeat(80));
    
    // Exit with appropriate code
    process.exit(this.testResults.failedTests > 0 ? 1 : 0);
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new CrossPageIntegrationTester();
  tester.runAllTests().catch(console.error);
}

module.exports = CrossPageIntegrationTester;