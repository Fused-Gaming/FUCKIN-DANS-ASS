#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

class ForensicsCLI {
  constructor() {
    this.rootPath = __dirname;
    // For installed packages, package.json is in parent of bin/
    this.packagePath = path.join(this.rootPath, '..', 'package.json');
    this.version = this.getVersion();
  }

  getVersion() {
    try {
      const packageJson = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
      return packageJson.version;
    } catch (error) {
      return 'unknown';
    }
  }

  showBanner() {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║ 🔍 Blockchain Forensic Analysis Toolkit v${this.version.padEnd(11)} ║
╚═══════════════════════════════════════════════════════════════════╝
`);
  }

  showUsage() {
    console.log(`Usage: forensics [command] [options]

Commands:
  forensics                    Launch interactive forensic interface
  forensics help               Show detailed help menu  
  forensics version            Show version information
  forensics setup              Run initial setup wizard
  forensics validate           Validate installation
  
Examples:
  forensics                    # Start investigation
  forensics help               # Interactive help menu
  forensics setup              # First-time setup
  
For more help: forensics help`);
  }

  showVersion() {
    console.log(`Blockchain Forensic Analysis Toolkit v${this.version}`);
    console.log(`Node.js: ${process.version}`);
    console.log(`Platform: ${process.platform} (${process.arch})`);
    console.log(`Installation: ${this.rootPath}`);
  }

  runMainApp() {
    const mainScript = path.join(this.rootPath, 'forensics', 'index.js');
    
    if (!fs.existsSync(mainScript)) {
      console.error('❌ Error: Main forensic interface not found');
      console.error('Please ensure the package is properly installed.');
      process.exit(1);
    }

    // Run main forensics application in this process
    try {
      require(mainScript);
    } catch (error) {
      console.error('❌ Error starting forensic application:', error.message);
      process.exit(1);
    }
  }

  runSetup() {
    console.log('🔧 Running setup...');
    this.validateEnvironment();
    
    try {
      execSync('npm run setup', { 
        stdio: 'inherit', 
        cwd: this.rootPath
      });
      console.log('✅ Setup completed successfully!');
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  runValidate() {
    console.log('🧪 Validating installation...');
    
    try {
      execSync('npm run validate', { 
        stdio: 'inherit', 
        cwd: this.rootPath
      });
      console.log('✅ Installation validated successfully!');
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  }

  validateEnvironment() {
    const envFile = path.join(this.rootPath, '.env');
    
    if (!fs.existsSync(envFile)) {
      console.log('📝 Creating environment file from template...');
      
      const envExample = path.join(this.rootPath, '.env.example');
      if (fs.existsSync(envExample)) {
        fs.copyFileSync(envExample, envFile);
        console.log('✅ Environment file created successfully!');
        console.log('⚠️  Please edit .env file and add your API keys before proceeding.');
      }
    }
  }

  runHelp() {
    const helpScript = path.join(this.rootPath, '..', 'scripts', 'help.js');
    
    if (fs.existsSync(helpScript)) {
      require(helpScript);
    } else {
      console.log('Full help system not available. Showing basic usage:');
      this.showUsage();
    }
  }

  async handleCommand(command, args) {
    switch (command) {
      case 'help':
      case '--help':
      case '-h':
        this.runHelp();
        break;
        
      case 'version':
      case '--version':
      case '-v':
        this.showVersion();
        break;
        
      case 'setup':
        this.runSetup();
        break;
        
      case 'validate':
      case '--validate':
        this.runValidate();
        break;
        
      case '':
      case undefined:
        this.showBanner();
        this.validateEnvironment();
        this.runMainApp();
        break;
        
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('');
        this.showUsage();
        process.exit(1);
    }
  }
}

// Handle process signals gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye!');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Goodbye!');
  process.exit(0);
});

// Main execution
async function main() {
  const cli = new ForensicsCLI();
  const [command, ...args] = process.argv.slice(2);
  
  try {
    await cli.handleCommand(command, args);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ForensicsCLI;
