# Mintlify Documentation Deployment

This repository is configured with Mintlify for beautiful, searchable documentation.

## Quick Start

### 1. Install Mintlify CLI

```bash
npm install -g mintlify
```

### 2. Preview Documentation Locally

```bash
mintlify dev
```

This will start a local server at `http://localhost:3000` where you can preview the documentation.

### 3. Deploy to Mintlify

#### Option A: Connect GitHub Repository

1. Go to [Mintlify Dashboard](https://dashboard.mintlify.com)
2. Click "New Docs"
3. Connect your GitHub repository: `Fused-Gaming/FUCKIN-DANS-ASS`
4. Mintlify will automatically detect the `mint.json` configuration
5. Deploy!

#### Option B: Manual Deployment

```bash
mintlify deploy
```

## Documentation Structure

The documentation is organized into the following sections:

### Getting Started
- **Introduction** - Overview and welcome page
- **Installation** - Step-by-step installation guide
- **Quick Start** - Fast-track guide
- **Database Setup** - Database configuration

### User Guides
- **Forensics Guide** - Comprehensive forensic analysis workflows
- **Investigation Examples** - Real-world scenarios
- **Private Tags** - Address attribution system
- **Intelligence System** - Threat intelligence management
- **Test Report** - Sample investigation report
- **Voice Guide** - Voice interface commands

### Integrations
- **MCP Integration** - Model Context Protocol / AI features
- **Etherscan Auto Import** - Automatic data import
- **Etherscan API V2** - API V2 integration guide

### API Reference
- **Commands** - Complete CLI command reference

### Development
- **Contributing** - Contribution guidelines
- **Code of Conduct** - Community standards
- **Security** - Security policies
- **Distribution** - Package distribution guide
- **Publishing** - NPM publishing workflow
- **PNPM Support** - Package manager support
- **Expansion Plan** - Future roadmap

## Configuration Files

### mint.json
Main Mintlify configuration file that defines:
- Navigation structure
- Branding (colors, logos)
- Tabs and sections
- Anchors and social links
- Search and analytics

### docs.json
Comprehensive documentation inventory with:
- All 27 documentation files organized by category
- Metadata and categorization
- Audience targeting
- Quick links
- Search index

## Customization

### Update Branding

Edit `mint.json` to customize:

```json
{
  "colors": {
    "primary": "#3B82F6",
    "light": "#60A5FA",
    "dark": "#1E40AF"
  },
  "logo": {
    "dark": "/docs/assets/logo-dark.svg",
    "light": "/docs/assets/logo-light.svg"
  }
}
```

### Add New Documentation

1. Create your markdown file in the appropriate `docs/` subdirectory
2. Add it to `mint.json` navigation
3. Update `docs.json` inventory
4. Commit and push

Example:
```json
{
  "group": "User Guides",
  "pages": [
    "docs/guides/YOUR_NEW_GUIDE"
  ]
}
```

### Update Logo Assets

Replace the placeholder logos:
- `docs/assets/logo-light.svg` - Logo for light mode
- `docs/assets/logo-dark.svg` - Logo for dark mode
- `docs/assets/favicon.png` - Browser favicon

## Analytics

### Google Analytics

Update `mint.json` with your Google Analytics measurement ID:

```json
{
  "analytics": {
    "ga4": {
      "measurementId": "G-XXXXXXXXXX"
    }
  }
}
```

## Features Enabled

- ✅ **Search** - Full-text documentation search
- ✅ **Dark Mode** - Automatic light/dark mode switching
- ✅ **Mobile Responsive** - Optimized for all devices
- ✅ **Feedback** - Thumbs up/down rating system
- ✅ **Edit Suggestions** - "Suggest Edit" on GitHub
- ✅ **Issue Reporting** - "Raise Issue" integration
- ✅ **Syntax Highlighting** - Code blocks with language detection
- ✅ **Navigation Tabs** - Organized into logical sections
- ✅ **Social Links** - GitHub, NPM, Discord integration

## Deployment URLs

Once deployed, your documentation will be available at:
- **Mintlify**: `https://blockchain-forensic-toolkit.mintlify.app` (or custom domain)
- **Local Dev**: `http://localhost:3000`

## Continuous Deployment

Mintlify automatically redeploys when you push to the main branch. Changes to:
- `mint.json`
- Any `docs/**/*.md` files
- `docs/**/*.mdx` files

Will trigger an automatic rebuild and deployment.

## Support

- **Mintlify Docs**: https://mintlify.com/docs
- **Mintlify Discord**: https://discord.gg/mintlify
- **GitHub Issues**: https://github.com/Fused-Gaming/FUCKIN-DANS-ASS/issues

## Version

Current documentation version: **2.5.2**
Last updated: **2025-12-16**
