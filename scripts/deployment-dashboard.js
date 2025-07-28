#!/usr/bin/env node

/**
 * Deployment Dashboard for GGUF Loader Website
 * 
 * This script creates a simple dashboard showing deployment status,
 * performance metrics, and maintenance history.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class DeploymentDashboard {
  constructor() {
    this.baseDir = path.join(__dirname, '..');
    this.deploymentLogsDir = path.join(this.baseDir, 'deployment-logs');
    this.maintenanceLogsDir = path.join(this.baseDir, 'maintenance-logs');
    this.monitoringReportsDir = path.join(this.baseDir, 'monitoring-reports');
  }

  async generateDashboard() {
    console.log('📊 GGUF Loader Website - Deployment Dashboard');
    console.log('='.repeat(60));
    
    await this.showCurrentStatus();
    await this.showRecentDeployments();
    await this.showPerformanceMetrics();
    await this.showMaintenanceHistory();
    await this.showHealthChecks();
    
    console.log('\n' + '='.repeat(60));
    console.log('Dashboard generated at:', new Date().toISOString());
  }

  async showCurrentStatus() {
    console.log('\n🌐 Current Site Status');
    console.log('-'.repeat(30));
    
    try {
      // Check site availability
      const startTime = Date.now();
      await this.makeRequest('https://ggufloader.github.io');
      const responseTime = Date.now() - startTime;
      
      console.log(`✅ Site Status: ONLINE`);
      console.log(`⚡ Response Time: ${responseTime}ms`);
      console.log(`🌐 URL: https://ggufloader.github.io`);
      
      // Check critical pages
      const criticalPages = [
        '/docs/',
        '/docs/installation/',
        '/docs/quick-start/',
        '/docs/addon-development/'
      ];
      
      let pagesOnline = 0;
      for (const page of criticalPages) {
        try {
          await this.makeRequest(`https://ggufloader.github.io${page}`);
          pagesOnline++;
        } catch (error) {
          console.log(`❌ ${page}: OFFLINE`);
        }
      }
      
      console.log(`📄 Critical Pages: ${pagesOnline}/${criticalPages.length} online`);
      
    } catch (error) {
      console.log(`❌ Site Status: OFFLINE`);
      console.log(`💥 Error: ${error.message}`);
    }
  }

  async showRecentDeployments() {
    console.log('\n🚀 Recent Deployments');
    console.log('-'.repeat(30));
    
    try {
      if (!fs.existsSync(this.deploymentLogsDir)) {
        console.log('No deployment logs found');
        return;
      }
      
      const deploymentFiles = fs.readdirSync(this.deploymentLogsDir)
        .filter(file => file.startsWith('deployment-report-'))
        .sort()
        .reverse()
        .slice(0, 5);
      
      if (deploymentFiles.length === 0) {
        console.log('No recent deployments found');
        return;
      }
      
      for (const file of deploymentFiles) {
        try {
          const reportPath = path.join(this.deploymentLogsDir, file);
          const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
          
          const status = report.status === 'success' ? '✅' : '❌';
          const duration = Math.round(report.duration / 1000);
          const timestamp = new Date(report.endTime).toLocaleString();
          
          console.log(`${status} ${timestamp} (${duration}s) - ID: ${report.deploymentId}`);
          
          if (report.errors.length > 0) {
            console.log(`   Errors: ${report.errors.length}`);
          }
          if (report.warnings.length > 0) {
            console.log(`   Warnings: ${report.warnings.length}`);
          }
          
        } catch (error) {
          console.log(`⚠️ Error reading deployment report: ${file}`);
        }
      }
      
    } catch (error) {
      console.log(`Error reading deployment logs: ${error.message}`);
    }
  }

  async showPerformanceMetrics() {
    console.log('\n⚡ Performance Metrics');
    console.log('-'.repeat(30));
    
    try {
      const latestMonitoringPath = path.join(this.monitoringReportsDir, 'latest.json');
      
      if (fs.existsSync(latestMonitoringPath)) {
        const report = JSON.parse(fs.readFileSync(latestMonitoringPath, 'utf8'));
        
        if (report.metrics && report.metrics.performance) {
          const perf = report.metrics.performance;
          console.log(`📊 LCP: ${Math.round(perf.lcp)}ms (target: <2500ms)`);
          console.log(`📊 FID: ${Math.round(perf.fid)}ms (target: <100ms)`);
          console.log(`📊 CLS: ${perf.cls.toFixed(3)} (target: <0.1)`);
        }
        
        if (report.metrics.responseTime) {
          console.log(`📊 Response Time: ${report.metrics.responseTime}ms`);
        }
        
        console.log(`📅 Last Updated: ${new Date(report.timestamp).toLocaleString()}`);
        
      } else {
        console.log('No recent performance data available');
      }
      
    } catch (error) {
      console.log(`Error reading performance metrics: ${error.message}`);
    }
  }

  async showMaintenanceHistory() {
    console.log('\n🔧 Maintenance History');
    console.log('-'.repeat(30));
    
    try {
      if (!fs.existsSync(this.maintenanceLogsDir)) {
        console.log('No maintenance logs found');
        return;
      }
      
      const maintenanceFiles = fs.readdirSync(this.maintenanceLogsDir)
        .filter(file => file.startsWith('maintenance-report-'))
        .sort()
        .reverse()
        .slice(0, 5);
      
      if (maintenanceFiles.length === 0) {
        console.log('No recent maintenance found');
        return;
      }
      
      for (const file of maintenanceFiles) {
        try {
          const reportPath = path.join(this.maintenanceLogsDir, file);
          const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
          
          const status = report.status === 'success' ? '✅' : '❌';
          const duration = Math.round(report.duration / 1000);
          const timestamp = new Date(report.endTime).toLocaleString();
          const tasksCompleted = Object.keys(report.tasks).length;
          
          console.log(`${status} ${report.type.toUpperCase()} - ${timestamp} (${duration}s)`);
          console.log(`   Tasks: ${tasksCompleted}, Errors: ${report.errors.length}, Warnings: ${report.warnings.length}`);
          
        } catch (error) {
          console.log(`⚠️ Error reading maintenance report: ${file}`);
        }
      }
      
    } catch (error) {
      console.log(`Error reading maintenance logs: ${error.message}`);
    }
  }

  async showHealthChecks() {
    console.log('\n🏥 Health Checks');
    console.log('-'.repeat(30));
    
    try {
      // Check if monitoring reports exist
      if (fs.existsSync(this.monitoringReportsDir)) {
        const reports = fs.readdirSync(this.monitoringReportsDir)
          .filter(file => file.endsWith('.json'))
          .length;
        console.log(`📊 Monitoring Reports: ${reports} available`);
      }
      
      // Check deployment logs
      if (fs.existsSync(this.deploymentLogsDir)) {
        const deployments = fs.readdirSync(this.deploymentLogsDir)
          .filter(file => file.startsWith('deployment-'))
          .length;
        console.log(`🚀 Deployment Records: ${deployments} available`);
      }
      
      // Check maintenance logs
      if (fs.existsSync(this.maintenanceLogsDir)) {
        const maintenance = fs.readdirSync(this.maintenanceLogsDir)
          .filter(file => file.startsWith('maintenance-'))
          .length;
        console.log(`🔧 Maintenance Records: ${maintenance} available`);
      }
      
      // Show next recommended actions
      console.log('\n📋 Recommended Actions:');
      
      const now = new Date();
      const lastMaintenance = this.getLastMaintenanceDate();
      
      if (!lastMaintenance || (now - lastMaintenance) > 24 * 60 * 60 * 1000) {
        console.log('  • Run daily maintenance: npm run maintenance:daily');
      }
      
      if (!lastMaintenance || (now - lastMaintenance) > 7 * 24 * 60 * 60 * 1000) {
        console.log('  • Run weekly maintenance: npm run maintenance:weekly');
      }
      
      console.log('  • Monitor performance: npm run monitor:performance');
      console.log('  • Check security: npm audit');
      
    } catch (error) {
      console.log(`Error in health checks: ${error.message}`);
    }
  }

  getLastMaintenanceDate() {
    try {
      const latestPath = path.join(this.maintenanceLogsDir, 'latest-maintenance.json');
      if (fs.existsSync(latestPath)) {
        const latest = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
        return new Date(latest.timestamp);
      }
    } catch (error) {
      // Ignore errors
    }
    return null;
  }

  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'GGUF-Loader-Dashboard/1.0'
        }
      }, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          }
        });
      });
      
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
      
      request.on('error', (error) => {
        reject(error);
      });
    });
  }
}

// Run dashboard if called directly
if (require.main === module) {
  const dashboard = new DeploymentDashboard();
  dashboard.generateDashboard().catch(console.error);
}

module.exports = DeploymentDashboard;