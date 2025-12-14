<div align="center">

# 🔍 Blockchain Forensic Analysis Toolkit

### Professional-grade on-chain investigation framework for tracking illegal operations, fraud, and financial crimes

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![GitHub Issues](https://img.shields.io/github/issues/Fused-Gaming/FUCKIN-DANS-ASS)](https://github.com/Fused-Gaming/FUCKIN-DANS-ASS/issues)
[![GitHub Stars](https://img.shields.io/github/stars/Fused-Gaming/FUCKIN-DANS-ASS)](https://github.com/Fused-Gaming/FUCKIN-DANS-ASS/stargazers)

**[Documentation](docs/)** • **[Quick Start](docs/QUICK_START.md)** • **[Examples](docs/INVESTIGATION_EXAMPLES.md)** • **[Contributing](CONTRIBUTING.md)** • **[Security](SECURITY.md)**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Supported Blockchains](#-supported-blockchains)
- [Core Capabilities](#-core-capabilities)
- [Use Cases](#-use-cases)
- [Documentation](#-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [Security](#-security)
- [License](#-license)

---

## 🎯 Overview

A comprehensive, open-source forensic toolkit designed for investigating blockchain-based criminal activity, including illegal gambling operations, fraud networks, money laundering, and asset theft. Built with a focus on **evidence quality**, **court admissibility**, and **investigative efficiency**.

### Why This Toolkit?

Traditional blockchain explorers provide raw data. This toolkit provides **actionable intelligence**:

- 🔎 **Deep Investigation** - Multi-chain transaction analysis with pattern recognition
- 🏷️ **Attribution System** - Tag and classify addresses with risk assessment
- 📊 **Timeline Reconstruction** - Chronological event sequencing for court presentation
- 🔗 **Fund Flow Tracking** - Trace stolen assets through complex laundering chains
- 📄 **Report Generation** - Export court-ready evidence in multiple formats
- 🗄️ **Intelligence Database** - Build and maintain threat actor profiles

### Target Audience

- **Law Enforcement** - Building cases against crypto criminals
- **Security Researchers** - Investigating DeFi exploits and hacks
- **Compliance Teams** - Monitoring sanctioned addresses and suspicious activity
- **Exchanges** - Fraud detection and stolen asset freezing
- **Victims** - Tracking stolen funds for recovery efforts

---

## ✨ Key Features

### 🔍 Forensic Investigation Engine

- **Transaction History Collection** - Complete on-chain data gathering across 15+ networks
- **Address Attribution & Tagging** - Label known criminals, victims, and intermediaries
- **Timeline Analysis** - Reconstruct event sequences with millisecond precision
- **Fund Flow Tracing** - Multi-hop tracking through mixers and exchanges
- **Pattern Detection** - Automated identification of suspicious behaviors
- **Event Registry** - Catalog known hacks, scams, and fraud operations
- **Address Clustering** - Group related wallets with confidence scoring

### 📊 Evidence & Reporting

- **Multi-Format Export** - JSON (data), CSV (spreadsheet), Markdown (readable)
- **Court-Ready Reports** - Professional documentation with source citations
- **Chain-of-Custody** - Immutable blockchain verification for all evidence
- **Executive Summaries** - High-level overviews for non-technical stakeholders

### 🗄️ Intelligence Database

- **SQLite Backend** - Fast, local, and privacy-preserving
- **Persistent Attribution** - Build institutional knowledge over time
- **Query History** - Track investigations and revisit past analyses
- **Cross-Reference** - Link addresses across multiple investigations

---

## 🚀 Installation

### Prerequisites

- **Node.js** v16.0.0 or higher
- **npm** v7.0.0 or higher
- **Alchemy API Key** ([Get one free](https://www.alchemy.com/))

### Setup

```bash
# Clone the repository
git clone https://github.com/Fused-Gaming/FUCKIN-DANS-ASS.git
cd FUCKIN-DANS-ASS

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your ALCHEMY_API_KEY
```

### Verify Installation

```bash
npm run forensics
```

You should see the interactive forensic analysis menu.

---

## ⚡ Quick Start

### Run Your First Investigation

```bash
# Launch forensic toolkit
npm run forensics
```

**Example Workflow:**

1. **Select:** "🔍 Collect Transaction History"
2. **Choose Chain:** Ethereum Mainnet
3. **Enter Address:** `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`
4. **Analyze:** Review the timeline and patterns
5. **Export:** Generate a forensic report

See **[Quick Start Guide](docs/QUICK_START.md)** for a complete 5-minute tutorial.

---

## 🌐 Supported Blockchains

| Network | Mainnet | Testnets |
|---------|---------|----------|
| **Ethereum** | ✅ Mainnet | Sepolia, Holesky |
| **Polygon** | ✅ Mainnet | Amoy |
| **Arbitrum** | ✅ One | Sepolia |
| **Optimism** | ✅ Mainnet | Sepolia |
| **Base** | ✅ Mainnet | Sepolia |
| **zkSync** | ✅ Era | Sepolia |
| **Blast** | ✅ Mainnet | Sepolia |
| **Solana** | ✅ Mainnet | Devnet |
| **Astar zkEVM** | ✅ Mainnet | - |
| **Zetachain** | ✅ Mainnet | Testnet |

*Additional chains can be easily added via RPC configuration*

---

## 🛠️ Core Capabilities

### 1. Transaction History Collection

Fetch complete transaction records for any address across supported chains.

```bash
npm run forensics
# → Collect Transaction History
```

**Features:**
- Incoming + Outgoing transactions
- Smart contract interactions
- Token transfers (ERC20, ERC721, ERC1155)
- Internal transactions
- Automatic database storage

### 2. Address Attribution System

Tag addresses with intelligence labels and risk assessments.

**Categories:**
- `hack`, `exploit`, `fraud`, `scam`, `phishing`
- `mixer`, `exchange`, `sanctioned`
- `victim`, `intermediary`

**Risk Levels:** `critical`, `high`, `medium`, `low`, `info`

### 3. Timeline Analysis

Reconstruct chronological sequences of events.

```bash
npm run forensics
# → Analyze Timeline
```

**Outputs:**
- Transaction sequences with timestamps
- Flagged address interactions
- Activity patterns and anomalies
- Date-range statistics

### 4. Fund Flow Tracing

Track assets through multiple wallet hops.

```bash
npm run forensics
# → Trace Fund Flow Path
```

**Capabilities:**
- Multi-hop tracking
- Mixer identification
- Exchange deposit detection
- Volume analysis

### 5. Pattern Detection

Automated identification of suspicious behaviors.

**Detects:**
- Rapid successive transfers (< 1 minute)
- High-value transactions
- Identical transfer amounts (automation)
- Failed transaction patterns
- Contract interaction sequences

### 6. Report Generation

Export comprehensive investigation reports.

```bash
npm run forensics
# → Generate Forensic Report
```

**Export Formats:**
- **JSON** - Complete data for programmatic access
- **CSV** - Transaction log for spreadsheet analysis
- **Markdown** - Human-readable investigation summary

---

## 💼 Use Cases

### 🏛️ Law Enforcement

**Scenario:** Investigating illegal gambling operation

1. Tag known operator addresses
2. Collect transaction history
3. Identify victim deposit addresses
4. Trace fund laundering paths
5. Generate evidence report for prosecution

### 🔐 Security Research

**Scenario:** DeFi protocol exploit analysis

1. Register the exploit event
2. Tag exploiter's addresses
3. Analyze attack timeline
4. Detect attack patterns
5. Create attribution cluster
6. Share intelligence with community

### 🏢 Exchange Compliance

**Scenario:** Stolen fund detection

1. Monitor for deposits from flagged addresses
2. Check reputation on incoming transfers
3. Trace fund origins
4. Freeze and report suspicious deposits
5. Coordinate with law enforcement

### 🎯 Asset Recovery

**Scenario:** Stolen NFT tracking

1. Tag thief's wallet
2. Trace NFT movement chain
3. Identify current holder
4. Document chain-of-custody
5. Report to marketplaces for freezing

---

## 📚 Documentation

### Core Documentation

- **[Quick Start Guide](docs/QUICK_START.md)** - 5-minute tutorial for beginners
- **[Forensics Guide](docs/FORENSICS_GUIDE.md)** - Complete toolkit reference (500+ lines)
- **[Investigation Examples](docs/INVESTIGATION_EXAMPLES.md)** - 5 real-world workflows
- **[Project Summary](docs/SUMMARY.md)** - Mission and capabilities overview

### Additional Resources

- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute code or intelligence
- **[Security Policy](SECURITY.md)** - Responsible disclosure guidelines
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community standards
- **[License](LICENSE)** - ISC License details

---

## 📁 Project Structure

```
FUCKIN-DANS-ASS/
├── forensics/                    # Core forensic toolkit
│   ├── index.js                  # Interactive CLI
│   ├── transaction-fetcher.js    # On-chain data collection
│   ├── attribution-manager.js    # Address tagging system
│   ├── timeline-analyzer.js      # Event reconstruction
│   └── report-exporter.js        # Evidence generation
├── database/
│   └── db.js                     # SQLite schema & queries
├── docs/                         # Comprehensive documentation
│   ├── FORENSICS_GUIDE.md
│   ├── INVESTIGATION_EXAMPLES.md
│   ├── QUICK_START.md
│   └── SUMMARY.md
├── getWalletContracts/           # Basic wallet queries
├── viewHistory/                  # Investigation history viewer
├── voice/                        # Optional narrator system
├── .env.example                  # Environment template
├── package.json                  # Dependencies & scripts
├── README.md                     # This file
├── CONTRIBUTING.md               # Contribution guidelines
├── SECURITY.md                   # Security policy
├── CODE_OF_CONDUCT.md            # Community standards
└── LICENSE                       # ISC License
```

---

## 🤝 Contributing

We welcome contributions from the security research and blockchain investigation community!

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Contribution Areas

- 🔗 **Chain Support** - Add new blockchain integrations
- 🧠 **Pattern Detection** - Improve anomaly detection algorithms
- 📊 **Reporting** - Enhance export formats and templates
- 🗄️ **Intelligence** - Contribute known bad actor addresses
- 📚 **Documentation** - Improve guides and examples
- 🐛 **Bug Fixes** - Report and fix issues

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for detailed guidelines.

---

## 🔒 Security

### Responsible Disclosure

If you discover a security vulnerability, please follow our **[Security Policy](SECURITY.md)**.

**DO NOT** open public issues for security vulnerabilities.

### Data Privacy

- All data stored locally (SQLite database)
- No telemetry or external data transmission
- API keys stored in `.env` (git-ignored)
- Investigation data is private by default

### Best Practices

- Never commit `.env` files with API keys
- Regularly update dependencies for security patches
- Use read-only API keys when possible
- Encrypt sensitive investigation databases

---

## ⚖️ Legal & Ethical Use

### Intended Use

This toolkit is designed for **legitimate investigative purposes**:

✅ Law enforcement investigations
✅ Security research and threat intelligence
✅ Compliance and regulatory monitoring
✅ Authorized incident response
✅ Asset recovery for verified victims

### Prohibited Use

❌ Harassment, doxxing, or stalking
❌ Creating fabricated evidence
❌ Unauthorized surveillance
❌ Privacy violations
❌ Illegal or unethical activities

### Data Source

All analyzed data is **public blockchain information**:
- Publicly available on-chain
- Immutable and independently verifiable
- Not obtained through unauthorized access
- Court-admissible as evidence

**Use responsibly. Investigate legally. Report ethically.**

---

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

```
Copyright (c) 2024 Fused-Gaming

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.
```

---

## 🙏 Acknowledgments

- **Alchemy** - Multi-chain RPC infrastructure
- **Better-SQLite3** - Fast, synchronous SQLite database
- **Node.js Community** - Excellent tooling ecosystem
- **Blockchain Security Researchers** - Pioneering on-chain forensics

---

## 📞 Support & Community

- **Issues:** [GitHub Issues](https://github.com/Fused-Gaming/FUCKIN-DANS-ASS/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Fused-Gaming/FUCKIN-DANS-ASS/discussions)
- **Documentation:** [docs/](docs/)

---

<div align="center">

### ⭐ Star this repository if you find it useful!

**Built to expose financial crimes through irrefutable blockchain evidence.**

[Get Started](docs/QUICK_START.md) • [Documentation](docs/) • [Examples](docs/INVESTIGATION_EXAMPLES.md)

</div>
