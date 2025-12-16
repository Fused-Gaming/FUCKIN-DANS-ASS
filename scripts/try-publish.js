#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

function checkAndPublish() {
  console.log('🔍 Checking npm authentication status...');
  
  try {
    const whoami = execSync('npm whoami', { encoding: 'utf8', timeout: 3000 }).trim();
    console.log(`✅ Authenticated as: ${whoami}`);
    
    console.log('\n🚀 Publishing to npm...');
    
    try {
      execSync('npm publish --access public', { stdio: 'inherit' });
      
      console.log('\n🎉 SUCCESS! Package published to npm!');
      console.log('📦 Users can now install with:');
      console.log('   npm install -g blockchain-forensic-toolkit');
      console.log('   forensics --version');
      
    } catch (publishError) {
      console.error('❌ Publishing failed:', publishError.message);
      return false;
    }
    
    return true;
    
  } catch (authError) {
    console.log('❌ Still not authenticated');
    console.log('Please complete browser authentication first.\n');
    return false;
  }
}

// Try publishing now
let attempts = 0;
const maxAttempts = 3;

function tryPublish() {
  attempts++;
  console.log(`\n📋 Attempt ${attempts}/${maxAttempts} to check authentication and publish...`);
  
  if (checkAndPublish()) {
    console.log('✅ Publishing workflow completed!');
  } else if (attempts < maxAttempts) {
    console.log('⏳ Waiting 10 seconds before retrying...\n');
    setTimeout(tryPublish, 10000);
  } else {
    console.log('❌ Maximum attempts reached. Please manually run:');
    console.log('   npm run npm:status');
    console.log('   npm run npm:publish');
  }
}

console.log('🔄 Starting authentication check and publish workflow...');
tryPublish();
