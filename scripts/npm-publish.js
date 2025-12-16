#!/usr/bin/env node

const { execSync } = require('child_process');
require('dotenv').config({ path: '.npm.env' });

async function checkNpmAuth() {
  try {
    const whoami = execSync('npm whoami', { encoding: 'utf8', timeout: 5000 }).trim();
    console.log(`✅ Already logged in as: ${whoami}`);
    return true;
  } catch (error) {
    console.log('❌ Not logged in to npm');
    console.log('🔐 Please authenticate first:');
    console.log('   npm run npm:login');
    console.log('   Manual login URL will be provided');
    return false;
  }
}

async function publishToNpm() {
  console.log('📦 Preparing to publish blockchain-forensic-toolkit@2.1.0 to npm...\n');
  
  // Check authentication
  const isLoggedIn = await checkNpmAuth();
  if (!isLoggedIn) {
    console.log('\n⏸️  Publishing paused. Please complete authentication first.');
    console.log('After authentication, run: npm run npm:publish');
    return false;
  }
  
  console.log('🧪 Running final validation before publishing...\n');
  
  try {
    // Run final validation
    execSync('npm run validate', { stdio: 'inherit' });
    console.log('✅ Validation passed!\n');
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return false;
  }
  
  console.log('📤 Publishing to npm registry...\n');
  
  try {
    // Publish the package
    execSync('npm publish --access public', { stdio: 'inherit' });
    
    console.log('\n🎉 Successfully published blockchain-forensic-toolkit@2.1.0 to npm!');
    console.log('📦 Users can now install with: npm install -g blockchain-forensic-toolkit');
    console.log('🚀 Next steps: npm run npm:verify');
    
    return true;
    
  } catch (error) {
    console.error('❌ Publishing failed:', error.message);
    
    // Common publishing errors and solutions
    if (error.message.includes('403')) {
      console.log('💡 Solution: You may not have publishing rights for this package name');
      console.log('    Try a different package name or contact package owner');
    }
    if (error.message.includes('E402')) {
      console.log('💡 Solution: Package name is already taken');
      console.log('    Update package.json with a unique name');
    }
    if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Solution: Network or registry connection issue');
      console.log('    Check internet connection and npm registry status');
    }
    
    return false;
  }
}

// Command line interface
if (require.main === module) {
  publishToNpm()
    .then(success => {
      if (success) {
        console.log('\n✅ Publishing workflow completed successfully!');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Fatal error during publishing:', error);
      process.exit(1);
    });
}

module.exports = publishToNpm;
