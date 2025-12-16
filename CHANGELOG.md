# Changelog

All notable changes to the Blockchain Forensic Analysis Toolkit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-12-16

### Fixed

#### Etherscan API V2 Migration
- **API Deprecation Resolution**: Complete migration from deprecated Etherscan API V1 to V2
- **Proper V2 Endpoints**: Updated all API calls to use correct `chainid=1` parameter format
- **Base URL Update**: Changed to `https://api.etherscan.io/v2/api` for V2 compatibility
- **Endpoint Standardization**: All functions now use consistent V2 API format
- **Deprecation Warnings**: Eliminated all API deprecation warnings

#### Dependency Updates
- **Security Vulnerabilities**: Patched all high and medium severity vulnerabilities
- **Latest Stable Versions**: Updated all MCP server dependencies:
  - `@modelcontextprotocol/sdk`: 1.0.0 → 1.0.4
  - `dotenv`: 16.0.0 → 16.4.5  
  - `ethers`: 6.9.0 → 6.13.2
  - `zod`: 3.0.0 → 3.23.8
  - `@types/node`: 20.0.0 → 22.9.1
  - `typescript`: 5.0.0 → 5.6.3

#### ENS Resolution
- **Provider Issues**: Fixed Infura provider authentication failures
- **API-Based ENS**: Implemented ENS lookup using Etherscan API v2 endpoints
- **Graceful Handling**: Improved error handling for addresses without ENS names
- **No External Dependencies**: Removed reliance on external JSON-RPC providers

#### MCP Server Improvements
- **Submodule Management**: Properly committed and referenced MCP server changes
- **Build Process**: Ensured clean builds after API migration
- **Error Handling**: Enhanced error reporting and debugging information
- **Performance**: Optimized API call patterns and response handling

### Improved

#### Integration Testing
- **Comprehensive Tests**: Verified all 3 core MCP functions with real data:
  - Balance checking: Fully operational with accurate ETH amounts
  - Gas price monitoring: Real-time gas price data flowing correctly  
  - ENS name resolution: Graceful handling for both found and not-found cases
- **Production Ready**: Confirmed MCP server is fully compatible with Etherscan API V2
- **Long-term Stability**: No more deprecation warnings or breaking changes

#### Documentation
- **Migration Guide**: Updated MCP_INTEGRATION.md with V2 API information
- **Troubleshooting**: Enhanced troubleshooting section for API-related issues
- **Setup Instructions**: Clarified V2 endpoint configuration requirements

### Security

#### Dependency Hygiene
- **Vulnerability Resolution**: Fixed all security issues in npm audit
- **Package Integrity**: Verified all third-party packages have valid signatures
- **Minimal Footprint**: Removed unnecessary provider dependencies

### Dependencies

#### MCP Server (mcp-etherscan-server)
- Version bump: 1.0.0 → 1.1.0
- Description updated to reflect Etherscan API V2 support
- All dependencies upgraded to latest stable versions

#### Main Toolkit
- Version bump: 2.0.0 → 2.1.0
- Updated to fix API compatibility issues

## [2.0.0] - 2025-12-14

### Added

#### Etherscan Integration
- **Auto-Import Etherscan Labels**: Automatic import of Etherscan public and private tags during transaction collection
- **Etherscan API v2 Support**: Full integration with Etherscan API v2 including multiple labels per address
- **Label Cloud Support**: Import categorized label clouds from Etherscan
- **Private Name Tags**: Import personal Etherscan name tags with notes
- **Contract Information**: Automatic import of verified contract names and details
- **Silent Mode**: Non-verbose label import for clean transaction collection output
- **Rate Limiting**: Built-in 200ms delay between API calls to respect Etherscan rate limits
- **Multi-Chain Etherscan Support**: Support for 60+ blockchain networks (Ethereum, Polygon, Arbitrum, Optimism, Base, BSC, Avalanche, etc.)

#### Investigation Management System
- **Case Tracking**: Complete investigation management with case IDs, names, and status
- **Investigation Addresses**: Link addresses to investigations with roles and notes
- **Evidence Management**: Attach files, URLs, and hashes to investigations
- **Timeline Tracking**: Track investigation events with timestamps
- **Investigator Information**: Configure investigator credentials in environment variables
- **Case Status**: Track investigations as active, pending, or closed

#### Report Generation
- **Multi-Format Reports**: Generate TXT, HTML, JSON, and CSV reports
- **ZIP Archives**: Create comprehensive ZIP packages of investigation reports
- **Professional HTML Reports**: Styled HTML reports with investigator information
- **Evidence Documentation**: Include all addresses, transactions, evidence, and timeline in reports
- **Investigator Attribution**: Automatic inclusion of investigator name, organization, contact info in reports

#### Database Enhancements
- **Investigation Tables**: New tables for investigations, addresses, evidence, and timeline
- **Database Views**: 5 pre-built views for common forensic queries:
  - `v_high_risk_addresses` - High-risk addresses with transaction counts
  - `v_address_activity` - Address activity summary
  - `v_tagged_addresses_with_activity` - Tagged addresses with metrics
  - `v_investigation_summary` - Investigation overview
  - `v_etherscan_imports` - Etherscan import classification
- **Enhanced SQL Browser**: Investigation tracking and Etherscan import queries in database browser
- **Database Documentation**: Comprehensive documentation in DATABASE_SETUP.md and database/README.md

#### Model Context Protocol (MCP) Integration
- **MCP Configuration**: Pre-configured .mcp.json for Etherscan MCP server
- **AI-Powered Analysis**: Enable AI assistants to query blockchain data via MCP
- **MCP Documentation**: Complete setup guide in MCP_INTEGRATION.md
- **Supported Tools**: Balance checking, transaction history, token transfers, contract ABIs, gas prices, ENS resolution

#### Documentation
- **MCP_INTEGRATION.md**: Complete guide to setting up and using MCP with the toolkit
- **ETHERSCAN_AUTO_IMPORT.md**: Comprehensive auto-import feature documentation
- **DATABASE_SETUP.md**: Quick start guide for database browser
- **database/README.md**: Complete database schema and query documentation
- **database/USEFUL_QUERIES.sql**: 50+ pre-built SQL queries for forensic analysis
- **Updated README.md**: Enhanced with all new features and capabilities

### Changed

- **Package Name**: Renamed from `alchemy-api` to `blockchain-forensic-toolkit`
- **Version Bump**: Major version upgrade from 1.0.0 to 2.0.0
- **Transaction Collection**: Now automatically imports Etherscan labels for all discovered addresses
- **Address Attribution**: Enhanced with Etherscan source tracking and note support
- **Database Browser Statistics**: Now includes investigation table counts
- **Forensics Menu**: Added Investigation Management submenu with 9 operations

### Improved

- **Error Handling**: Resilient Etherscan import continues on individual address failures
- **Performance**: Optimized database queries with new views
- **User Experience**: Silent mode for cleaner output during auto-import
- **Documentation**: Comprehensive guides for all new features
- **Workflow Integration**: Seamless integration between transaction collection, labeling, and investigations

### Fixed

- **Missing Data**: Resolved issue where EVM addresses, transactions, labels, notes, and dates weren't being persisted
- **Database Integration**: Ensured all Etherscan imports are properly saved to address_attributions table
- **Label Tracking**: Fixed missing `imported` count in label import results

### Security

- **Environment Variables**: Etherscan API keys and investigator information stored securely in .env
- **No Telemetry**: All data remains local, no external transmission
- **API Key Protection**: .env files excluded from version control

### Dependencies

- **archiver**: Added ^7.0.1 for ZIP archive creation in investigation reports

## [1.0.0] - 2024-12-XX

### Added

- Initial release of Blockchain Forensic Analysis Toolkit
- Transaction history collection for Ethereum and Solana
- Address attribution and tagging system
- Timeline analysis and reconstruction
- Fund flow tracing
- Pattern detection
- Event registry
- Address clustering
- Multi-format report export (JSON, CSV, Markdown)
- SQLite database for persistent storage
- Interactive forensics CLI
- Support for 15+ blockchain networks
- Basic Alchemy API integration

### Core Features

- Transaction fetching via Alchemy API
- Address tagging with risk levels and categories
- Chronological timeline reconstruction
- Suspicious pattern detection
- Cross-chain support (Ethereum, Polygon, Arbitrum, Optimism, Base, Solana)
- Report generation in multiple formats
- Database query system

---

## Upgrade Guide

### From 1.x to 2.0

#### Required Actions

1. **Update Environment Variables**

   Add to your `.env` file:
   ```bash
   # Etherscan API Key (required for auto-import)
   ETHERSCAN_API_KEY=your_etherscan_api_key_here

   # Investigator Information (required for reports)
   INVESTIGATOR_NAME=Your Full Name
   INVESTIGATOR_EMAIL=your.email@organization.com
   INVESTIGATOR_ORGANIZATION=Your Organization Name
   INVESTIGATOR_TITLE=Blockchain Forensic Investigator
   INVESTIGATOR_LICENSE=License Number (if applicable)
   INVESTIGATOR_PHONE=+1-555-0123
   INVESTIGATOR_ADDRESS=123 Main St, City, State, ZIP
   ```

2. **Install New Dependencies**

   ```bash
   npm install
   ```

3. **Database Migration**

   The database will automatically create new tables on first run:
   - `investigations`
   - `investigation_addresses`
   - `investigation_evidence`
   - `investigation_timeline`
   - Database views (v_high_risk_addresses, etc.)

#### New Features to Try

1. **Etherscan Auto-Import**
   ```bash
   npm run forensics
   # Select: Collect Transaction History
   # Labels will auto-import for all discovered addresses
   ```

2. **Investigation Management**
   ```bash
   npm run forensics
   # Select: Investigation Management
   # Create new investigation, add addresses, evidence, generate reports
   ```

3. **Database Browser**
   ```bash
   npm run db
   # Try: Forensic Queries > Etherscan Imports
   # Try: Forensic Queries > Active Investigations
   ```

4. **MCP Integration** (Optional)
   ```bash
   # See MCP_INTEGRATION.md for setup instructions
   ```

#### Breaking Changes

- **Package Name**: If you reference the package name in scripts, update from `alchemy-api` to `blockchain-forensic-toolkit`
- **Database Schema**: New tables added (backward compatible with existing data)
- **API Requirements**: Etherscan API key now required for auto-import feature

#### Deprecations

None in this release.

---

## Versioning Strategy

- **MAJOR** version (X.0.0): Incompatible API changes or major feature overhauls
- **MINOR** version (0.X.0): New features in a backward-compatible manner
- **PATCH** version (0.0.X): Backward-compatible bug fixes

---

## Release Notes Format

Each release includes:
- **Added**: New features and capabilities
- **Changed**: Changes to existing functionality
- **Improved**: Enhancements and optimizations
- **Fixed**: Bug fixes
- **Security**: Security-related changes
- **Dependencies**: New or updated dependencies
- **Deprecated**: Features planned for removal
- **Removed**: Removed features

---

## Links

- [Documentation](docs/)
- [Contributing Guide](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)
- [License](LICENSE)

---

## Unreleased

Changes that are in development but not yet released will be documented here.

### In Progress

- [ ] Additional blockchain network support
- [ ] Enhanced pattern detection algorithms
- [ ] PDF report generation
- [ ] GraphQL API for programmatic access
- [ ] Web-based investigation dashboard

### Planned Features

- [ ] Multi-chain transaction correlation
- [ ] Advanced graph analysis
- [ ] Real-time monitoring capabilities
- [ ] Custom MCP tools for specialized forensics
- [ ] Integration with additional block explorers
- [ ] Community threat intelligence feed
- [ ] Automated risk scoring
- [ ] Machine learning for pattern detection

---

**For detailed feature documentation, see:**
- [MCP Integration Guide](MCP_INTEGRATION.md)
- [Etherscan Auto-Import](ETHERSCAN_AUTO_IMPORT.md)
- [Database Documentation](database/README.md)
- [Forensics Guide](docs/FORENSICS_GUIDE.md)
