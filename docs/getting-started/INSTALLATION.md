# 📦 Installation Guide

## Quick Start

### 🟢 Recommended: npm Global Installation
```bash
npm install -g blockchain-forensic-toolkit
forensics setup
forensics
```

### 🟡 Windows: winget Package Manager
```bash
winget install Fused-Gaming.blockchain-forensic-toolkit
forensics
```

### 🟢 Development: pnpm
```bash
pnpm add -g blockchain-forensic-toolkit
forensics
```

---

## 🎯 Choose Your Installation Method

### For Most Users
| Method | Command | Best For |
|--------|---------|----------|
| **npm Global** | `npm install -g blockchain-forensic-toolkit` | Quick setup, all platforms |
| **winget** | `winget install Fused-Gaming.blockchain-forensic-toolkit` | Windows systems, IT admins |

### For Developers & DevOps
| Method | Command | Best For |
|--------|---------|----------|
| **pnpm** | `pnpm add -g blockchain-forensic-toolkit` | Development, CI/CD, performance |
| **Source** | `git clone` + `npm run quickstart` | Latest features, customization |

### For Enterprise/Air-Gapped
| Method | Command | Best For |
|--------|---------|----------|
| **Download ZIP** | GitHub releases → manual install | Offline environments |
| **Private Registry** | Custom npm registry | Corporate environments |

---

## 📋 Detailed Installation Instructions

### 🟢 npm (Recommended)

#### Prerequisites
- **Node.js** 18.0.0 or higher
- **npm** 7.0.0 or higher
- **Etherscan API Key** (free)

#### Installation Steps
```bash
# 1. Install globally
npm install -g blockchain-forensic-toolkit

# 2. Verify installation
forensics --version

# 3. Run setup wizard
forensics setup

# 4. Edit configuration
# Edit ~/.forensics/.env with your API keys

# 5. Validate installation
forensics validate

# 6. Start investigating
forensics
```

#### Configuration Files
```
~/.forensics/
├── .env                    # API keys and settings
├── investigations/         # Investigation database
├── reports/               # Generated reports
└── logs/                  # Application logs
```

---

### 🟡 winget (Windows)

#### Prerequisites
- **Windows 10/11** with winget (built-in on recent versions)
- **Administrator privileges** (optional, recommended)

#### Installation Steps
```powershell
# 1. Install via winget
winget install Fused-Gaming.blockchain-forensic-toolkit

# 2. Verify PATH setup
forensics --version

# 3. Follow setup wizard
forensics setup

# 4. Configure API keys
# The setup wizard will guide you through this
```

#### Windows-Specific Features
- ✅ Automatic PATH configuration
- ✅ Registry integration
- ✅ Windows security signing
- ✅ Add/Remove Programs support
- ✅ Automatic updates via winget

---

### 🟢 pnpm (Performance Optimized)

#### Prerequisites
- **Node.js** 18.0.0 or higher
- **pnpm** 8.0.0 or higher
- **Etherscan API Key** (free)

#### Installation Steps
```bash
# 1. Install pnpm (if not already installed)
npm install -g pnpm

# 2. Install toolkit
pnpm add -g blockchain-forensic-toolkit

# 3. Verify installation
forensics --version

# 4. Setup and configure
forensics setup
forensics validate

# 5. Start using
forensics
```

#### Performance Benefits
- 🚀 **3x faster** installations
- 💾 **50% less** disk space
- 🔒 **Stricter** dependency security
- 🏗️ **Better** for monorepos and CI/CD

---

### 📁 Source Installation

#### Prerequisites
- **Node.js** 18.0.0 or higher
- **npm** 7.0.0 or higher
- **Git** (for cloning)

#### Installation Steps
```bash
# 1. Clone repository
git clone https://github.com/Fused-Gaming/blockchain-forensic-toolkit.git
cd blockchain-forensic-toolkit

# 2. Run quickstart setup
npm run quickstart

# 3. Follow the interactive setup
# The setup will:
#   - Install dependencies
#   - Setup MCP integration
#   - Create environment file
#   - Validate installation

# 4. Start using
npm run forensics
# or
node .\forensics.js  # Local execution
```

#### Advantages of Source Install
- 🌟 **Latest features** and bug fixes
- 🛠️ **Full source code** access
- 🔧 **Easy customization** possible
- 👥 **Contribution ready**

---

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Required for core functionality
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Required for investigation reports
INVESTIGATOR_NAME=Your Full Name
INVESTIGATOR_EMAIL=your.email@organization.com
INVESTIGATOR_ORGANIZATION=Your Organization
INVESTIGATOR_TITLE=Blockchain Forensic Investigator

# Optional: Additional block explorers
POLYGONSCAN_API_KEY=your_polygonscan_key
ARBISCAN_API_KEY=your_arbiscan_key

# Optional: MCP AI integration
ELEVENLABS_API_KEY=your_elevenlabs_key  # For voice features
```

### Database Location
```bash
# Default location: ~/.forensics/investigations.db
# Custom location (environment variable):
FORENSICS_DB_PATH=/path/to/your/investigations.db

# Export in shell (Linux/macOS):
export FORENSICS_DB_PATH="/data/forensics/investigations.db"

# Set in Windows PowerShell:
$env:FORENSICS_DB_PATH="C:\Forensics\investigations.db"
```

### MCP Configuration
```bash
# Auto-configured during setup
# MCP server location: ~/.forensics/mcp-etherscan-server/
# Configuration file: ~/.forensics/.mcp.json

# Manual MCP setup (after installation):
forensics mcp:setup
```

---

## 🧪 Validation & Testing

### Pre-Installation Check
```bash
# Verify Node.js version
node --version  # Should be 18.0.0+

# Verify npm/pnpm version
npm --version  # Should be 7.0.0+
# or
pnpm --version  # Should be 8.0.0+
```

### Post-Installation Validation
```bash
# Run comprehensive validation
forensics validate

# Expected output:
# ✅ MCP Integration Status: FULLY OPERATIONAL
# ✅ Successful: 3/3 MCP tests
# ✅ Investigation system: OK
# ✅ Database connection: OK
# 🎯 Installation validated successfully!
```

### Test AI Integration
```bash
# Test MCP server specifically
forensics mcp:test

# Test investigation features
forensics investigation:test
```

---

## 🚨 Troubleshooting

### Common Installation Issues

#### ❌ "command not found: forensics"
```bash
# Try these solutions:
npm list -g | grep forensics          # Check if installed
npm uninstall -g blockchain-forensic-toolkit
npm install -g blockchain-forensic-toolkit

# Check PATH (Windows):
echo %PATH% | findstr npm

# Check PATH (Linux/macOS):
echo $PATH | tr ':' '\n' | grep npm
```

#### ❌ "EACCES: permission denied"
```bash
# Linux/macOS:
sudo npm install -g blockchain-forensic-toolkit

# Windows (run as Administrator):
npm install -g blockchain-forensic-toolkit

# Alternative: Fix npm permissions:
npm config set prefix ~/.npm-global
export PATH="~/.npm-global/bin:$PATH"
```

#### ❌ "MCP tests failing"
```bash
# Check API key configuration:
forensics config:show  # Displays current config

# Rebuild MCP server:
forensics mcp:build && forensics mcp:test

# Reset and reconfigure:
forensics setup --reset
```

#### ❌ "Database connection failed"
```bash
# Reset database:
forensics db:reset

# Check permissions:
ls -la ~/.forensics/

# Manual database location:
forensics --help  # Shows config options
```

### Platform-Specific Issues

#### Windows
```powershell
# Clear npm cache and retry:
npm cache clean --force
npm install -g blockchain-forensic-toolkit

# Check antivirus isn't blocking:
# Add Node.js and forensics to antivirus exceptions

# PowerShell execution policy:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### macOS
```bash
# XCode command line tools (required for some dependencies):
xcode-select --install

# If Homebrew Node.js issues:
brew uninstall node
brew install node
npm install -g blockchain-forensic-toolkit
```

#### Linux
```bash
# Debian/Ubuntu dependencies:
sudo apt-get update
sudo apt-get install -y nodejs npm build-essential

# CentOS/RHEL dependencies:
sudo yum install -y nodejs npm gcc-c++ make

# Arch Linux:
sudo pacman -S nodejs npm
```

---

## 🔄 Updates & Upgrades

### npm Updates
```bash
# Update to latest version
npm update -g blockchain-forensic-toolkit

# Check for available updates
npm outdated -g blockchain-forensic-toolkit

# Reinstall (if issues)
npm uninstall -g blockchain-forensic-toolkit
npm install -g blockchain-forensic-toolkit
```

### winget Updates
```powershell
# Update via winget
winget upgrade Fused-Gaming.blockchain-forensic-toolkit

# List upgradable packages
winget list
```

### pnpm Updates
```bash
# Update global package
pnpm update -g blockchain-forensic-toolkit

# Update pnpm itself
pnpm add -g pnpm@latest
```

### Source Updates
```bash
# Pull latest changes
git pull origin main
npm run validate
```

---

## 📚 Next Steps

After successful installation:

1. **Run the help system**: `forensics help`
2. **Start your first investigation**: `forensics`
3. **Read the documentation**: `MCP_INTEGRATION.md`
4. **Join the community**: GitHub Discussions

### Quick Start Investigation
```bash
# Launch the interface
forensics

# Select: "1. 🔍 Collect Transaction History"
# Enter address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2
# View the collected data with Etherscan tags
# Generate your first investigation report
```

### AI Integration Setup (Optional)
```bash
# Configure MCP for AI assistance
forensics mcp:setup

# Test with Claude Desktop or VSCode:
# "Check the ETH balance for 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2"
```

---

## 🆘 Support & Help

### Getting Help
- **Interactive help**: `forensics help`
- **Command help**: `forensics help <command>`
- **Installation guide**: This document
- **Full documentation**: `docs/` directory

### Community Support
- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Community questions and help
- **Documentation**: Comprehensive guides in `docs/`

### Professional Support
- **Enterprise**: Custom installation and training
- **Government**: Air-gapped deployment guidance
- **Academic**: Research collaboration and licenses

---

**Happy investigating! 🕵️‍♂️**
