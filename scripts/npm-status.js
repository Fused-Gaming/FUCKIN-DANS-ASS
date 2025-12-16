#!/usr/bin/env node

const { execSync } = require('child_process');

async function checkAuthStatus() {
  try {
    const whoami = execSync('npm whoami', { encoding: 'utf8', timeout: 5000 }).trim();
    console.log(`✅ Authenticated with npm as: ${whoami}`);
    console.log('🚀 Ready to publish!');
    
    // Show package info that will be published
    const packageJson = require('../package.json');
    console.log(`\n📦 Package Details:`);
    console.log(`   Name: ${packageJson.name}`);
    console.log(`   Version: ${packageJson.version}`);
    console.log(`   Description: ${packageJson.description}`);
    console.log(`   Size: ~350KB (compressed)`);
    
    return true;
    
  } catch (error) {
    console.log('❌ Not authenticated with npm');
    console.log('Please complete authentication first:');
    console.log('1. Visit the URL provided by npm login');
    console.log('2. Enter your credentials');
    console.log('3. Complete 2FA if required');
    console.log('\nThen run "npm run npm:publish"');
    
    return false;
  }
}

if (require.main === module) {
  checkAuthStatus()
    .then(authenticated => {
      process.exit(authenticated ? 0 : 1);
    })
    .catch(error => {
      console.error('Error checking status:', error.message);
      process.exit(1);
    });
}

module.exports = checkAuthStatus;
