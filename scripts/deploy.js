#!/usr/bin/env node

/**
 * Comprehensive Deployment Script for GGUF Loader Website
 * 
 * This script handles the complete deployment process including:
 * - Pre-deployment testing and validation
 * - Deployment to GitHub Pages
 * - Post-deployment monitoring and verification
 * - Performance tracking and alerting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DeploymentManager {
  constructor() {
    this.deploymentId = Date.now();
    this.startTime = new Date();
    this.logFile = path.join(__dirname, '..', 'deployment-logs', `deployment-${this.deploymentId}.log`);
    this.results = {
      deploymentId: this.deploymentId,
      startTime: this.startTime.toISOString(),
      status: 'in_progress',
      phases: {},
      errors: [],
      warnings: [],
      metrics: {}
    };
    
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
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

  async runCommand(command, description) {
    this.log(`Running: ${description}`);
    this.log(`Command: ${command}`);
    
    try {
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.log(`✅ ${description} completed successfully`);
      return output;
    } catch (error) {
      this.log(`❌ ${description} failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async runPhase(phaseName, phaseFunction) {
    this.log(`\n🚀 Starting phase: ${phaseName}`);
    const phaseStart = Date.now();
    
    try {
      await phaseFunction();
      const duration = Date.now() - phaseStart;
      
      this.results.phases[phaseName] = {
        status: 'success',
        duration: duration,
        completedAt: new Date().toISOString()
      };
      
      this.log(`✅ Phase completed: ${phaseName} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - phaseStart;
      
      this.results.phases[phaseName] = {
        status: 'failed',
        duration: duration,
        error: error.message,
        failedAt: new Date().toISOString()
      };
      
      this.log(`❌ Phase failed: ${phaseName} - ${error.message}`, 'error');
      throw error;
    }
  }

  async preDeploymentTests() {
    this.log('Running comprehensive pre-deployment tests...');
    
    // Run all test suites
    await this.runCommand('npm run test:all', 'Complete test suite');
    
    // Security audit
    try {
      await this.runCommand('npm audit --audit-level=moderate', 'Security audit');
    } catch (error) {
      this.log('Security audit found issues - review required', 'warn');
    }
    
    // Build verification
    if (fs.existsSync('_config.yml')) {
      await this.runCommand('bundle exec jekyll build', 'Jekyll build verification');
    }
    
    this.log('✅ All pre-deployment tests passed');
  }

  async deployToGitHubPages() {
    this.log('Deploying to GitHub Pages...');
    
    // Check if we're on the main branch
    try {
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      if (currentBranch !== 'main') {
        throw new Error(`Deployment must be from main branch, currently on: ${currentBranch}`);
      }
    } catch (error) {
      this.log(`Branch check failed: ${error.message}`, 'error');
      throw error;
    }
    
    // Ensure working directory is clean
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim()) {
        throw new Error('Working directory is not clean. Commit or stash changes before deployment.');
      }
    } catch (error) {
      this.log(`Git status check failed: ${error.message}`, 'error');
      throw error;
    }
    
    // Push to trigger GitHub Actions deployment
    await this.runCommand('git push origin main', 'Push to main branch for deployment');
    
    this.log('✅ Deployment triggered via GitHub Actions');
  }

  async waitForDeployment() {
    this.log('Waiting for deployment to propagate...');
    
    const maxWaitTime = 300000; // 5 minutes
    const checkInterval = 15000; // 15 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        // Check if site is accessible
        await this.runCommand('curl -f -s https://ggufloader.github.io > /dev/null', 'Site accessibility check');
        this.log('✅ Site is accessible');
        return;
      } catch (error) {
        this.log('Site not yet accessible, waiting...', 'warn');
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }
    }
    
    throw new Error('Deployment did not complete within expected time');
  }

  async postDeploymentMonitoring() {
    this.log('Running post-deployment monitoring...');
    
    // Run deployment monitoring script
    await this.runCommand('npm run monitor:deployment', 'Deployment monitoring');
    
    // Run performance checks
    await this.runCommand('npm run monitor:performance', 'Performance monitoring');
    
    // Test critical user flows
    const criticalPages = [
      'https://ggufloader.github.io',
      'https://ggufloader.github.io/docs/',
      'https://ggufloader.github.io/docs/installation/',
      'https://ggufloader.github.io/docs/quick-start/',
      'https://ggufloader.github.io/docs/addon-development/'
    ];
    
    for (const page of criticalPages) {
      await this.runCommand(`curl -f -s "${page}" > /dev/null`, `Testing ${page}`);
    }
    
    this.log('✅ Post-deployment monitoring completed');
  }

  async generateDeploymentReport() {
    this.log('Generating deployment report...');
    
    this.results.endTime = new Date().toISOString();
    this.results.duration = Date.now() - this.startTime.getTime();
    this.results.status = this.results.errors.length === 0 ? 'success' : 'failed';
    
    // Save detailed results
    const reportPath = path.join(__dirname, '..', 'deployment-logs', `deployment-report-${this.deploymentId}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // Create summary report
    const summaryPath = path.join(__dirname, '..', 'deployment-logs', 'latest-deployment.json');
    fs.writeFileSync(summaryPath, JSON.stringify({
      deploymentId: this.deploymentId,
      timestamp: this.results.endTime,
      status: this.results.status,
      duration: this.results.duration,
      errors: this.results.errors.length,
      warnings: this.results.warnings.length,
      url: 'https://ggufloader.github.io'
    }, null, 2));
    
    this.log(`✅ Deployment report saved to ${reportPath}`);
  }

  printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 DEPLOYMENT SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`📋 Deployment ID: ${this.deploymentId}`);
    console.log(`⏰ Start Time: ${this.startTime.toISOString()}`);
    console.log(`⏱️  Duration: ${Math.round(this.results.duration / 1000)}s`);
    console.log(`🎯 Status: ${this.results.status.toUpperCase()}`);
    console.log(`🌐 URL: https://ggufloader.github.io`);
    
    console.log('\n📊 Phase Results:');
    for (const [phase, result] of Object.entries(this.results.phases)) {
      const status = result.status === 'success' ? '✅' : '❌';
      const duration = Math.round(result.duration / 1000);
      console.log(`  ${status} ${phase}: ${result.status} (${duration}s)`);
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
    console.log('  • Monitor site performance for 24 hours');
    console.log('  • Check user feedback and analytics');
    console.log('  • Review deployment logs for any issues');
    console.log(`  • Log file: ${this.logFile}`);
    
    console.log('\n' + '='.repeat(80));
  }

  async deploy(options = {}) {
    try {
      this.log('🚀 Starting GGUF Loader website deployment...');
      
      await this.runPhase('Pre-deployment Tests', () => this.preDeploymentTests());
      
      // Check if incremental deployment is requested
      if (options.incremental) {
        await this.runPhase('Incremental Feature Deployment', () => this.deployIncrementalFeatures(options.phase));
      }
      
      await this.runPhase('GitHub Pages Deployment', () => this.deployToGitHubPages());
      await this.runPhase('Deployment Propagation', () => this.waitForDeployment());
      await this.runPhase('Post-deployment Monitoring', () => this.postDeploymentMonitoring());
      await this.runPhase('Report Generation', () => this.generateDeploymentReport());
      
      this.log('🎉 Deployment completed successfully!');
      
    } catch (error) {
      this.log(`💥 Deployment failed: ${error.message}`, 'error');
      this.results.status = 'failed';
      await this.generateDeploymentReport();
      
    } finally {
      this.printSummary();
      
      // Exit with appropriate code
      process.exit(this.results.status === 'success' ? 0 : 1);
    }
  }

  async deployIncrementalFeatures(phase = 'all') {
    this.log('🔄 Running incremental feature deployment...');
    
    const IncrementalDeployment = require('./incremental-deployment.js');
    const incrementalDeployment = new IncrementalDeployment();
    
    await incrementalDeployment.deploy(phase);
    
    this.log('✅ Incremental feature deployment completed');
  }
}

// Run deployment if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  if (args.includes('--incremental')) {
    options.incremental = true;
    const phaseIndex = args.indexOf('--phase');
    if (phaseIndex !== -1 && args[phaseIndex + 1]) {
      options.phase = args[phaseIndex + 1];
    }
  }
  
  const deployment = new DeploymentManager();
  deployment.deploy(options).catch(console.error);
}

module.exports = DeploymentManager;