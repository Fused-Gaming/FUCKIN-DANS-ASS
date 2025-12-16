#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.npm.env' });

async function npmLogin() {
  const username = process.env.NPM_USERNAME;
  const password = process.env.NPM_PASSWORD;
  const email = process.env.NPM_EMAIL;
  
  if (!username || !password || !email) {
    console.error('❌ Missing npm credentials in .npm.env file');
    process.exit(1);
  }
  
  console.log('🔐 Logging into npm with provided credentials...');
  
  try {
    // Use echo to pipe credentials to npm login
    const loginCommand = `echo "${username}\\n${password}\\n${email}" | npm login`;
    
    // Execute npm login with credentials
    execSync(loginCommand, { 
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true 
    });
    
    console.log('✅ Successfully logged into npm!');
    
    // Verify login
    const whoami = execSync('npm whoami', { encoding: 'utf8' }).trim();
    console.log(`👤 Logged in as: ${whoami}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    
    // Try alternative method if pipe method fails
    console.log('🔄 Trying alternative login method...');
    
    try {
      // Interactive login with pre-filled values
      process.env.NPM_USERNAME = username;
      process.env.NPM_PASSWORD = password;
      process.env.NPM_EMAIL = email;
      
      console.log('📧 Please complete two-factor authentication if required...');
      console.log('🌐 Open URL provided by npm to complete login');
      
      execSync('npm login', { stdio: 'inherit' });
      
      const whoami = execSync('npm whoami', { encoding: 'utf8' }).trim();
      console.log(`✅ Successfully logged in as: ${whoami}`);
      
      return true;
      
    } catch (secondError) {
      console.error('❌ Alternative login method also failed:', secondError.message);
      return false;
    }
  }
}

// Command line interface
if (require.main === module) {
  npmLogin()
    .then(success => {
      if (success) {
        console.log('🎉 Ready to publish package to npm!');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = npmLogin;
