#!/usr/bin/env node

/**
 * Test script to verify deployment setup
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing GGUF Loader Website Deployment Setup');
console.log('='.repeat(50));

// Test 1: Check if all required scripts exist
console.log('\n📁 Checking deployment scripts...');
const requiredScripts = [
  'scripts/deploy.js',
  'scripts/monitor-deployment.js',
  'scripts/maintenance-scheduler.js',
  'scripts/deployment-dashboard.js'
];

let scriptsOk = true;
for (const script of requiredScripts) {
  if (fs.existsSync(script)) {
    console.log(`✅ ${script}`);
  } else {
    console.log(`❌ ${script} - MISSING`);
    scriptsOk = false;
  }
}

// Test 2: Check if package.json has required scripts
console.log('\n📦 Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredNpmScripts = [
  'deploy',
  'deploy:test',
  'monitor:deployment',
  'maintenance:daily',
  'dashboard'
];

let npmScriptsOk = true;
for (const script of requiredNpmScripts) {
  if (packageJson.scripts[script]) {
    console.log(`✅ npm run ${script}`);
  } else {
    console.log(`❌ npm run ${script} - MISSING`);
    npmScriptsOk = false;
  }
}

// Test 3: Check if GitHub Actions workflow exists
console.log('\n🔄 Checking GitHub Actions workflow...');
const workflowPath = '.github/workflows/ci.yml';
if (fs.existsSync(workflowPath)) {
  console.log(`✅ ${workflowPath}`);
  
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  const requiredJobs = ['test', 'lighthouse', 'deploy', 'monitor', 'security'];
  
  for (const job of requiredJobs) {
    if (workflow.includes(`${job}:`)) {
      console.log(`✅ Job: ${job}`);
    } else {
      console.log(`⚠️ Job: ${job} - may be missing`);
    }
  }
} else {
  console.log(`❌ ${workflowPath} - MISSING`);
}

// Test 4: Check if documentation exists
console.log('\n📚 Checking deployment documentation...');
const requiredDocs = [
  'DEPLOYMENT_GUIDE.md',
  'DEPLOYMENT_CHECKLIST.md',
  'MAINTENANCE_SCHEDULE.md',
  'MAINTENANCE_GUIDE.md'
];

let docsOk = true;
for (const doc of requiredDocs) {
  if (fs.existsSync(doc)) {
    console.log(`✅ ${doc}`);
  } else {
    console.log(`❌ ${doc} - MISSING`);
    docsOk = false;
  }
}

// Test 5: Create required directories
console.log('\n📂 Checking/creating required directories...');
const requiredDirs = [
  'deployment-logs',
  'maintenance-logs',
  'monitoring-reports'
];

for (const dir of requiredDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created ${dir}/`);
  } else {
    console.log(`✅ ${dir}/ exists`);
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📋 DEPLOYMENT SETUP SUMMARY');
console.log('='.repeat(50));

const allOk = scriptsOk && npmScriptsOk && docsOk;

if (allOk) {
  console.log('✅ All deployment components are properly configured');
  console.log('\n🚀 Ready for deployment! You can now run:');
  console.log('   npm run deploy          # Full deployment process');
  console.log('   npm run dashboard       # View deployment status');
  console.log('   npm run maintenance:daily # Run daily maintenance');
} else {
  console.log('❌ Some deployment components are missing or misconfigured');
  console.log('\n🔧 Please review the missing components above');
}

console.log('\n🌐 Production URL: https://ggufloader.github.io');
console.log('📊 Monitor deployment: npm run dashboard');
console.log('🔧 Run maintenance: npm run maintenance:auto');

console.log('\n' + '='.repeat(50));