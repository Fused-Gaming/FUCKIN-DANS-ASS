#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class HelpSystem {
  constructor() {
    this.version = require('../package.json').version;
    this.description = require('../package.json').description;
  }

  // Color codes for terminal output
  get colors() {
    return {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      dim: '\x1b[2m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      gray: '\x1b[90m'
    };
  }

  // Helper to color text
  colorize(text, color) {
    return `${this.colors[color]}${text}${this.colors.reset}`;
  }

  // Display main header
  showHeader() {
    console.log(`
${this.colorize('╔═══════════════════════════════════════════════════════════════════╗', 'cyan')}
${this.colorize('║', 'cyan')} ${this.colorize('🔍 Blockchain Forensic Analysis Toolkit CLI Help', 'bright')} ${' '.repeat(50)} ${this.colorize('║', 'cyan')}
${this.colorize('╚═══════════════════════════════════════════════════════════════════╝', 'cyan')}
${this.colorize(`📦 Version: ${this.version}`, 'green')}
${this.colorize(`📝 ${this.description}`, 'dim')}
`);
  }

  // Show main menu categories
  showMainMenu() {
    console.log(`${this.colorize('📋 Main Menu Categories:', 'yellow')}`);
    console.log(`
  ${this.colorize('1.', 'cyan')} ${this.colorize('Core Forensics', 'bright')}         - Main investigation tools
  ${this.colorize('2.', 'cyan')} ${this.colorize('AI Integration (MCP)', 'bright')}  - Model Context Protocol features  
  ${this.colorize('3.', 'cyan')} ${this.colorize('Database Tools', 'bright')}        - Database management and queries
  ${this.colorize('4.', 'cyan')} ${this.colorize('Setup & Installation', 'bright')}  - Installation and configuration
  ${this.colorize('5.', 'cyan')} ${this.colorize('Testing & Validation', 'bright')}   - System testing and diagnostics
  ${this.colorize('6.', 'cyan')} ${this.colorize('Examples & Tutorials', 'bright')}   - Usage examples and guides
  ${this.colorize('7.', 'cyan')} ${this.colorize('Troubleshooting', 'bright')}        - Common issues and solutions
  ${this.colorize('8.', 'cyan')} ${this.colorize('Distribution', 'bright')}           - Package managers and installation
  ${this.colorize('q.', 'cyan')} ${this.colorize('Quit', 'bright')}                  - Exit help system

${this.colorize('Select a category (1-8) or type a command name:', 'dim')}
`);
  }

  // Show core forensics commands
  showCoreForensics() {
    console.log(`${this.colorize('🔍 Core Forensics Commands', 'bright')}`);
    console.log(this.colorize('═'.repeat(60), 'cyan'));
    console.log(`
${this.colorize('Main Interface:', 'yellow')}
  ${this.colorize('npm run forensics', 'green')}
    → Launch the interactive forensic analysis interface
    → Choose from: Transaction Collection, Timeline Analysis, 
      Pattern Detection, Investigation Management, Reports

${this.colorize('Database Management:', 'yellow')}
  ${this.colorize('npm run db', 'green')}            ${this.colorize('or', 'dim')}  ${this.colorize('npm run db:browser', 'green')}
    → Open the SQL database browser
    → Run forensic queries, manage investigations
    → Access pre-built views and custom queries

${this.colorize('Legacy Tools:', 'yellow')}
  ${this.colorize('npm run getContracts', 'green')}
    → Get contract information from wallet addresses
    
  ${this.colorize('npm run viewHistory', 'green')}
    → View transaction history for addresses
`);
    this.askToContinue();
  }

  // Show AI/MCP commands  
  showAIIntegration() {
    console.log(`${this.colorize('🤖 AI Integration (MCP)', 'bright')}`);
    console.log(this.colorize('═'.repeat(60), 'cyan'));
    console.log(`
${this.colorize('Setup and Testing:', 'yellow')}
  ${this.colorize('npm run mcp:setup', 'green')}
    → Complete MCP server installation and configuration
    → Installs dependencies, builds server, runs tests
    
  ${this.colorize('npm run mcp:test', 'green')}
    → Test Etherscan MCP server functionality
    → Verifies balance checks, gas prices, ENS resolution
    → Returns real blockchain data if working correctly

${this.colorize('Development & Management:', 'yellow')}
  ${this.colorize('npm run mcp:build', 'green')}
    → Build MCP server from TypeScript source
    
  ${this.colorize('npm run mcp:start', 'green')}
    → Start MCP server manually (for development/debugging)
    
  ${this.colorize('npm run mcp:install', 'green')}
    → Install MCP server dependencies only

${this.colorize('AI Integration Requirements:', 'dim')}
  • Node.js 18+ (required for MCP)
  • Etherscan API key (in .env file)  
  • MCP client (Claude Desktop, VSCode, etc.)
  • See MCP_INTEGRATION.md for complete setup guide
`);
    this.askToContinue();
  }

  // Show database commands
  showDatabaseTools() {
    console.log(`${this.colorize('📊 Database Tools', 'bright')}`);
    console.log(this.colorize('═'.repeat(60), 'cyan'));
    console.log(`
${this.colorize('Database Browser:', 'yellow')}
  ${this.colorize('npm run db', 'green')}              ${this.colorize('or', 'dim')}  ${this.colorize('npm run db:browser', 'green')}
    → Interactive SQL database browser
    → Execute forensic SQL queries
    → Browse investigations, addresses, transactions

${this.colorize('Pre-built Views Available:', 'dim')}
  • v_high_risk_addresses       - High-risk addresses with metrics
  • v_address_activity          - Address activity summary  
  • v_tagged_addresses_with_activity - Tagged addresses
  • v_investigation_summary     - Investigation overview
  • v_etherscan_imports         - Etherscan import history

${this.colorize('Useful SQL Queries:', 'dim')}
  SELECT * FROM investigations WHERE status = 'active';
  SELECT * FROM address_attributions ORDER BY created_at DESC LIMIT 10;
  SELECT * FROM v_high_risk_addresses WHERE total_transactions > 100;
`);
    this.askToContinue();
  }

  // Show setup commands
  showSetup() {
    console.log(`${this.colorize('🔧 Setup & Installation', 'bright')}`);
    console.log(this.colorize('═'.repeat(60), 'cyan'));
    console.log(`
${this.colorize('Quick Start (Recommended):', 'yellow')}
  ${this.colorize('npm run quickstart', 'green')}
    → Complete setup for new users
    → Installs dependencies, sets up MCP, launches interface

${this.colorize('Step-by-Step Installation:', 'yellow')}
  1. ${this.colorize('npm install', 'green')}           # Install main dependencies
  2. ${this.colorize('cp .env.example .env', 'green')}   # Copy environment template
  3. Edit ${this.colorize('.env', 'cyan')} file:
     • ETHERSCAN_API_KEY=your_key_here
     • INVESTIGATOR_NAME=Your Name
     • INVESTIGATOR_EMAIL=your@email.com
  4. ${this.colorize('npm run mcp:setup', 'green')}       # Setup AI integration
  5. ${this.colorize('npm run validate', 'green')}        # Verify installation

${this.colorize('Prerequisites:', 'dim')}
  • Node.js 18.0.0 or higher
  • npm 7.0.0 or higher  
  • Etherscan API key (free tier available)
  • 100MB disk space minimum
  • 2GB RAM recommended

${this.colorize('Optional for AI Features:', 'dim')}
  • MCP client (Claude Desktop, VSCode with Continue)
  • See MCP_INTEGRATION.md for AI setup
`);
    this.askToContinue();
  }

  // Show testing commands
  showTesting() {
    console.log(`${this.colorize('🧪 Testing & Validation', 'bright')}`);
    console.log(this.colorize('═'.repeat(60), 'cyan'));
    console.log(`
${this.colorize('System Validation:', 'yellow')}
  ${this.colorize('npm run validate', 'green')}
    → Run complete test suite
    → Tests both MCP server and forensics system
    → Recommended after installation or updates

${this.colorize('Individual Components:', 'yellow')}
  ${this.colorize('npm run mcp:test', 'green')}
    → Test Etherscan MCP server only
    → 3 tests: balance, gas prices, ENS resolution
    
  ${this.colorize('npm run investigation:test', 'green')}
    → Test forensic investigation system
    → Tests database, tagging, reporting features

${this.colorize('Expected Test Results:', 'dim')}
  ✅ MCP Integration Status: FULLY OPERATIONAL
  ✅ Successful: 3/3 MCP tests  
  📊 Total Technologies: 9 systems tested
  🎯 All components should show green checkmarks
`);
    this.askToContinue();
  }

  // Show examples
  showExamples() {
    console.log(`${this.colorize('📚 Examples & Tutorials', 'bright')}`);
    console.log(this.colorize('═'.repeat(60), 'cyan'));
    console.log(`
${this.colorize('Example 1: First Investigation', 'yellow')}
  npm run forensics
  → Select "1. 🔍 Collect Transaction History"
  → Enter address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2
  → Review collected data with Etherscan tags

${this.colorize('Example 2: Investigation Management', 'yellow')}
  npm run forensics
  → Select "7. 📋 Investigation Management"
  → Create new investigation case
  → Associate addresses with roles (victim, suspect, etc.)
  → Generate professional report

${this.colorize('Example 3: AI-Assisted Analysis', 'yellow')}
  # Setup AI integration first:
  npm run mcp:setup
  
  # In Claude Desktop or VSCode with Continue:
  "Check the ETH balance and recent transactions for 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2"
  → AI queries blockchain data using MCP server

${this.colorize('Example 4: Database Query', 'yellow')}
  npm run db
  → Select "🔎 Forensic Queries"
  → Try "High Risk Addresses with >100 transactions"
`);
    this.askToContinue();
  }

  // Show troubleshooting
  showTroubleshooting() {
    console.log(`${this.colorize('🚨 Troubleshooting', 'bright')}`);
    console.log(this.colorize('═'.repeat(60), 'cyan'));
    console.log(`
${this.colorize('Common Issues & Solutions:', 'yellow')}

${this.colorize('❌ MCP Server Not Working', 'red')}
  npm run mcp:test
  ${this.colorize('If tests fail:', 'dim')}
  → Check ETHERSCAN_API_KEY in .env file
  → Run: npm run mcp:build && npm run mcp:test
  → Verify Node.js 18+ is installed

${this.colorize('❌ Database Issues', 'red')}
  npm run db
  ${this.colorize('If browser fails:', 'dim')}
  → Delete 'blockchain-forensics.db' and restart
  → Check disk space (>100MB required)
  → Verify no other process uses the database

${this.colorize('❌ Permission Errors', 'red')}
  npm run setup
  ${this.colorize('If installation fails:', 'dim')}
  → Windows: Run terminal as Administrator
  → macOS/Linux: Use sudo or fix file permissions
  → Check antivirus isn't blocking Node.js

${this.colorize('❌ Missing API Keys', 'red')}
  cat .env
  ${this.colorize('Required keys:', 'dim')}
  → ETHERSCAN_API_KEY=your_actual_key_here
  → INVESTIGATOR_NAME=Your Full Name
  → INVESTIGATOR_EMAIL=your@email.com

${this.colorize('💡 General Debugging:', 'yellow')}
  npm run validate    # Check all systems
  npm run help        # This help menu
  See LOGS.md or GitHub Issues for detailed solutions
`);
    this.askToContinue();
  }

  // Show distribution info
  showDistribution() {
    console.log(`${this.colorize('📦 Package Distribution', 'bright')}`);
    console.log(this.colorize('═'.repeat(60), 'cyan'));
    console.log(`
${this.colorize('Installation Methods:', 'yellow')}

${this.colorize('🟢 npm (Recommended)', 'green')}
  npm i -g blockchain-forensic-toolkit
  → Global installation across all systems
  → Auto-updates with npm update
  → Works on Windows, macOS, Linux

${this.colorize('🟡 winget (Windows)', 'yellow')}
  winget install Fused-Gaming.blockchain-forensic-toolkit
  → Windows Package Manager integration
  → System-wide installation with PATH setup
  → Windows 10/11 with winget installed

${this.colorize('🟢 pnpm', 'green')}
  pnpm add -g blockchain-forensic-toolkit
  → Fast, disk space efficient installation
  → Same commands as npm version
  → Great for development environments

${this.colorize('📁 Source Install', 'dim')}
  git clone https://github.com/Fused-Gaming/blockchain-forensic-toolkit.git
  cd blockchain-forensic-toolkit
  npm run quickstart
  → Latest features and development version
  → Full source code access

${this.colorize('Version Information:', 'cyan')}
  Current: v${this.version}
  Check for updates: npm outdated blockchain-forensic-toolkit
  
${this.colorize('See INSTALLATION.md for detailed setup guides', 'dim')}
`);
    this.askToContinue();
  }

  // Ask user to continue
  askToContinue() {
    console.log(`\n${this.colorize('Press Enter to return to main menu, or type "q" to quit...', 'dim')}`);
  }

  // Handle user input
  async handleInput() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askQuestion = (query) => {
      return new Promise(resolve => rl.question(query, resolve));
    };

    while (true) {
      this.showMainMenu();
      const answer = await askQuestion('Choice: ').then(ans => ans.toLowerCase().trim());

      switch(answer) {
        case '1':
          this.showCoreForensics();
          await askQuestion('');
          break;
        case '2':
          this.showAIIntegration();
          await askQuestion('');
          break;
        case '3':
          this.showDatabaseTools();
          await askQuestion('');
          break;
        case '4':
          this.showSetup();
          await askQuestion('');
          break;
        case '5':
          this.showTesting();
          await askQuestion('');
          break;
        case '6':
          this.showExamples();
          await askQuestion('');
          break;
        case '7':
          this.showTroubleshooting();
          await askQuestion('');
          break;
        case '8':
          this.showDistribution();
          await askQuestion('');
          break;
        case 'q':
        case 'quit':
        case 'exit':
          rl.close();
          console.log(`\n${this.colorize('👋 Good luck with your investigations!', 'green')}`);
          return;
        default:
          console.log(`${this.colorize('❌ Invalid choice. Please select 1-8 or q to quit.', 'red')}`);
          break;
      }
    }
  }

  // Show quick help for specific commands
  showCommandHelp(command) {
    const commands = {
      'forensics': `${this.colorize('🔍 Launch Main Interface', 'yellow')}
    npm run forensics
    → Interactive forensic analysis interface
    → Choose investigation operations from menu
    → Supports 15+ blockchain networks`,
      
      'mcp:test': `${this.colorize('🤖 Test MCP Server', 'yellow')}
    npm run mcp:test
    → Tests Etherscan MCP integration
    → Verifies AI assistant connectivity
    → Should show: "FULLY OPERATIONAL"`,
      
      'setup': `${this.colorize('🔧 Complete Setup', 'yellow')}
    npm run setup
    → One-command installation for new users
    → Installs dependencies + MCP integration
    → Runs validation tests`,
      
      'validate': `${this.colorize('🧪 System Validation', 'yellow')}
    npm run validate
    → Tests all toolkit functions
    → Verifies MCP + forensics systems
    → Required for troubleshooting`,
      
      'help': `${this.colorize('📋 Help System', 'yellow')}
    npm run help
    → Interactive help menu
    → Detailed command descriptions
    → Examples and troubleshooting`
    };

    if (commands[command]) {
      console.log(commands[command]);
    } else {
      console.log(`${this.colorize(`❌ Unknown command: ${command}`, 'red')}`);
      console.log(`${this.colorize('Available commands:', 'dim')} ${Object.keys(commands).join(', ')}`);
      console.log(`${this.colorize('Run "npm run help" for full menu', 'green')}`);
    }
  }
}

// Main execution
async function main() {
  const help = new HelpSystem();
  
  // Check for command line arguments
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Show help for specific command
    help.showCommandHelp(args[0]);
  } else {
    // Show interactive help menu
    help.showHeader();
    await help.handleInput();
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error(`${help.colors.red}❌ Help system error: ${error.message}`);
  process.exit(1);
});

if (require.main === module) {
  main();
}

module.exports = HelpSystem;
