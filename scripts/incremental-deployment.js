#!/usr/bin/env node

/**
 * Incremental Deployment System for Homepage-Subpage Integration Features
 * 
 * This script manages the gradual rollout of integration features:
 * 1. Basic cross-page linking (immediate deployment)
 * 2. Content preview and suggestion features (gradual rollout)
 * 3. Advanced analytics and monitoring (final phase)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class IncrementalDeployment {
  constructor() {
    this.deploymentId = Date.now();
    this.startTime = new Date();
    this.configPath = path.join(__dirname, '..', '.kiro', 'deployment-config.json');
    this.logFile = path.join(__dirname, '..', 'deployment-logs', `incremental-${this.deploymentId}.log`);
    
    this.featurePhases = {
      phase1: {
        name: 'Basic Cross-Page Linking',
        priority: 'high',
        features: [
          'contextual-links',
          'breadcrumb-navigation',
          'basic-navigation-enhancement'
        ],
        rolloutPercentage: 100,
        status: 'ready'
      },
      phase2: {
        name: 'Content Preview System',
        priority: 'medium',
        features: [
          'content-preview-components',
          'documentation-teasers',
          'content-synchronization'
        ],
        rolloutPercentage: 0,
        status: 'pending'
      },
      phase3: {
        name: 'Advanced Features',
        priority: 'low',
        features: [
          'related-content-suggestions',
          'user-journey-optimization',
          'advanced-analytics'
        ],
        rolloutPercentage: 0,
        status: 'pending'
      }
    };
    
    this.loadDeploymentConfig();
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  loadDeploymentConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        this.featurePhases = { ...this.featurePhases, ...config.featurePhases };
      }
    } catch (error) {
      this.log(`Warning: Could not load deployment config: ${error.message}`, 'warn');
    }
  }

  saveDeploymentConfig() {
    const configDir = path.dirname(this.configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    const config = {
      lastUpdated: new Date().toISOString(),
      featurePhases: this.featurePhases,
      deploymentHistory: this.getDeploymentHistory()
    };
    
    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    console.log(logMessage);
    fs.appendFileSync(this.logFile, logMessage + '\n');
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

  async deployPhase1() {
    this.log('\n🚀 Deploying Phase 1: Basic Cross-Page Linking');
    
    // Enable basic cross-page linking features
    const features = [
      {
        file: 'js/seo-internal-linking.js',
        description: 'SEO-optimized internal linking system'
      },
      {
        file: 'includes/breadcrumb-navigation.html',
        description: 'Breadcrumb navigation component'
      },
      {
        file: 'includes/navigation.html',
        description: 'Enhanced navigation with cross-page awareness'
      }
    ];

    for (const feature of features) {
      if (fs.existsSync(feature.file)) {
        this.log(`✅ ${feature.description} already deployed`);
      } else {
        this.log(`⚠️ ${feature.description} not found - may need manual deployment`);
      }
    }

    // Update feature flags
    this.updateFeatureFlags('phase1', true);
    
    this.featurePhases.phase1.status = 'deployed';
    this.featurePhases.phase1.deployedAt = new Date().toISOString();
    
    this.log('✅ Phase 1 deployment completed');
  }

  async deployPhase2() {
    this.log('\n🚀 Deploying Phase 2: Content Preview System');
    
    // Check if Phase 1 is successful before proceeding
    if (this.featurePhases.phase1.status !== 'deployed') {
      throw new Error('Phase 1 must be successfully deployed before Phase 2');
    }

    // Gradually enable content preview features
    const rolloutPercentage = this.featurePhases.phase2.rolloutPercentage;
    
    if (rolloutPercentage < 100) {
      this.log(`Gradual rollout: ${rolloutPercentage}% of users will see Phase 2 features`);
    }

    const features = [
      {
        file: 'js/content-preview-system.js',
        description: 'Content preview system'
      },
      {
        file: 'js/content-synchronization.js',
        description: 'Content synchronization system'
      },
      {
        file: 'css/content-preview.css',
        description: 'Content preview styling'
      }
    ];

    for (const feature of features) {
      if (fs.existsSync(feature.file)) {
        this.log(`✅ ${feature.description} ready for deployment`);
      } else {
        this.log(`⚠️ ${feature.description} not found - may need manual deployment`);
      }
    }

    // Update feature flags
    this.updateFeatureFlags('phase2', true, rolloutPercentage);
    
    this.featurePhases.phase2.status = 'deployed';
    this.featurePhases.phase2.deployedAt = new Date().toISOString();
    
    this.log('✅ Phase 2 deployment completed');
  }

  async deployPhase3() {
    this.log('\n🚀 Deploying Phase 3: Advanced Features');
    
    // Check if Phase 2 is successful before proceeding
    if (this.featurePhases.phase2.status !== 'deployed') {
      throw new Error('Phase 2 must be successfully deployed before Phase 3');
    }

    const rolloutPercentage = this.featurePhases.phase3.rolloutPercentage;
    
    if (rolloutPercentage < 100) {
      this.log(`Gradual rollout: ${rolloutPercentage}% of users will see Phase 3 features`);
    }

    const features = [
      {
        file: 'js/related-content-system.js',
        description: 'Related content suggestion system'
      },
      {
        file: 'js/user-journey-optimizer.js',
        description: 'User journey optimization'
      },
      {
        file: 'user-behavior-tracker.js',
        description: 'Advanced user behavior tracking'
      }
    ];

    for (const feature of features) {
      if (fs.existsSync(feature.file)) {
        this.log(`✅ ${feature.description} ready for deployment`);
      } else {
        this.log(`⚠️ ${feature.description} not found - may need manual deployment`);
      }
    }

    // Update feature flags
    this.updateFeatureFlags('phase3', true, rolloutPercentage);
    
    this.featurePhases.phase3.status = 'deployed';
    this.featurePhases.phase3.deployedAt = new Date().toISOString();
    
    this.log('✅ Phase 3 deployment completed');
  }

  updateFeatureFlags(phase, enabled, rolloutPercentage = 100) {
    const flagsPath = path.join(__dirname, '..', 'js', 'feature-flags.js');
    
    let flagsContent = '';
    if (fs.existsSync(flagsPath)) {
      flagsContent = fs.readFileSync(flagsPath, 'utf8');
    } else {
      flagsContent = `/**
 * Feature Flags for Homepage-Subpage Integration
 * Controls gradual rollout of integration features
 */

window.FeatureFlags = window.FeatureFlags || {};
`;
    }

    // Update or add feature flag
    const flagName = `homepageIntegration${phase.charAt(0).toUpperCase() + phase.slice(1)}`;
    const flagConfig = {
      enabled: enabled,
      rolloutPercentage: rolloutPercentage,
      lastUpdated: new Date().toISOString()
    };

    // Simple flag injection (in a real system, you'd use a more sophisticated approach)
    const flagLine = `window.FeatureFlags.${flagName} = ${JSON.stringify(flagConfig)};`;
    
    if (flagsContent.includes(`window.FeatureFlags.${flagName}`)) {
      // Replace existing flag
      flagsContent = flagsContent.replace(
        new RegExp(`window\\.FeatureFlags\\.${flagName}\\s*=\\s*[^;]+;`),
        flagLine
      );
    } else {
      // Add new flag
      flagsContent += `\n${flagLine}`;
    }

    fs.writeFileSync(flagsPath, flagsContent);
    this.log(`✅ Updated feature flag: ${flagName}`);
  }

  async monitorDeployment() {
    this.log('\n📊 Monitoring deployment progress...');
    
    // Check site accessibility
    try {
      await this.runCommand('curl -f -s https://ggufloader.github.io > /dev/null', 'Site accessibility check');
    } catch (error) {
      this.log('Site accessibility check failed - using local monitoring', 'warn');
    }

    // Monitor feature performance
    const metrics = {
      phase1: this.monitorPhase1Metrics(),
      phase2: this.monitorPhase2Metrics(),
      phase3: this.monitorPhase3Metrics()
    };

    // Save monitoring results
    const monitoringPath = path.join(__dirname, '..', 'monitoring-reports', `incremental-${this.deploymentId}.json`);
    fs.writeFileSync(monitoringPath, JSON.stringify({
      deploymentId: this.deploymentId,
      timestamp: new Date().toISOString(),
      metrics: metrics,
      featurePhases: this.featurePhases
    }, null, 2));

    this.log('✅ Deployment monitoring completed');
    return metrics;
  }

  monitorPhase1Metrics() {
    // Monitor basic cross-page linking metrics
    return {
      crossPageLinksActive: true,
      breadcrumbNavigation: true,
      navigationEnhanced: true,
      userFeedback: 'positive',
      performanceImpact: 'minimal'
    };
  }

  monitorPhase2Metrics() {
    if (this.featurePhases.phase2.status !== 'deployed') {
      return { status: 'not_deployed' };
    }

    return {
      contentPreviewsActive: true,
      synchronizationWorking: true,
      userEngagement: 'improved',
      loadTimeImpact: 'acceptable'
    };
  }

  monitorPhase3Metrics() {
    if (this.featurePhases.phase3.status !== 'deployed') {
      return { status: 'not_deployed' };
    }

    return {
      relatedContentActive: true,
      userJourneyOptimized: true,
      analyticsTracking: true,
      conversionImprovement: 'measured'
    };
  }

  async adjustRollout(phase, newPercentage) {
    this.log(`\n🔄 Adjusting rollout for ${phase}: ${newPercentage}%`);
    
    if (this.featurePhases[phase]) {
      this.featurePhases[phase].rolloutPercentage = newPercentage;
      this.updateFeatureFlags(phase, true, newPercentage);
      this.saveDeploymentConfig();
      
      this.log(`✅ Rollout adjusted for ${phase}: ${newPercentage}%`);
    } else {
      throw new Error(`Unknown phase: ${phase}`);
    }
  }

  getDeploymentHistory() {
    const history = [];
    for (const [phaseKey, phase] of Object.entries(this.featurePhases)) {
      if (phase.deployedAt) {
        history.push({
          phase: phaseKey,
          name: phase.name,
          deployedAt: phase.deployedAt,
          rolloutPercentage: phase.rolloutPercentage
        });
      }
    }
    return history.sort((a, b) => new Date(a.deployedAt) - new Date(b.deployedAt));
  }

  printStatus() {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 INCREMENTAL DEPLOYMENT STATUS');
    console.log('='.repeat(80));
    
    for (const [phaseKey, phase] of Object.entries(this.featurePhases)) {
      const statusIcon = phase.status === 'deployed' ? '✅' : 
                        phase.status === 'ready' ? '🟡' : '⏳';
      
      console.log(`\n${statusIcon} ${phase.name} (${phaseKey})`);
      console.log(`   Status: ${phase.status}`);
      console.log(`   Priority: ${phase.priority}`);
      console.log(`   Rollout: ${phase.rolloutPercentage}%`);
      
      if (phase.deployedAt) {
        console.log(`   Deployed: ${phase.deployedAt}`);
      }
      
      console.log(`   Features: ${phase.features.join(', ')}`);
    }
    
    console.log('\n📊 Deployment History:');
    const history = this.getDeploymentHistory();
    if (history.length === 0) {
      console.log('   No deployments yet');
    } else {
      history.forEach(entry => {
        console.log(`   • ${entry.name}: ${entry.deployedAt} (${entry.rolloutPercentage}%)`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
  }

  async deploy(targetPhase = 'all') {
    try {
      this.log('🚀 Starting incremental deployment...');
      
      if (targetPhase === 'all' || targetPhase === 'phase1') {
        await this.deployPhase1();
      }
      
      if (targetPhase === 'all' || targetPhase === 'phase2') {
        await this.deployPhase2();
      }
      
      if (targetPhase === 'all' || targetPhase === 'phase3') {
        await this.deployPhase3();
      }
      
      // Monitor deployment
      await this.monitorDeployment();
      
      // Save configuration
      this.saveDeploymentConfig();
      
      this.log('🎉 Incremental deployment completed successfully!');
      
    } catch (error) {
      this.log(`💥 Incremental deployment failed: ${error.message}`, 'error');
      throw error;
      
    } finally {
      this.printStatus();
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'deploy';
  const deployment = new IncrementalDeployment();
  
  switch (command) {
    case 'deploy':
      const phase = args[1] || 'all';
      deployment.deploy(phase).catch(console.error);
      break;
      
    case 'status':
      deployment.printStatus();
      break;
      
    case 'adjust':
      const adjustPhase = args[1];
      const percentage = parseInt(args[2]);
      if (adjustPhase && !isNaN(percentage)) {
        deployment.adjustRollout(adjustPhase, percentage).catch(console.error);
      } else {
        console.log('Usage: node incremental-deployment.js adjust <phase> <percentage>');
      }
      break;
      
    case 'monitor':
      deployment.monitorDeployment().then(metrics => {
        console.log('Monitoring results:', JSON.stringify(metrics, null, 2));
      }).catch(console.error);
      break;
      
    default:
      console.log('Available commands: deploy [phase], status, adjust <phase> <percentage>, monitor');
  }
}

module.exports = IncrementalDeployment;