# Threat Intelligence Database

This directory contains curated threat intelligence for blockchain forensic investigations.

## 📁 Files

### known-events.json
Catalog of major blockchain security incidents including:
- Hacks and exploits
- DeFi protocol attacks
- Exchange compromises
- Bridge vulnerabilities
- Governance attacks

**Structure:**
```json
{
  "version": "1.0.0",
  "lastUpdated": "YYYY-MM-DD",
  "events": [
    {
      "eventName": "Name of incident",
      "eventType": "hack|exploit|fraud|scam",
      "eventDate": "YYYY-MM-DD",
      "chainName": "Blockchain name",
      "description": "Detailed description",
      "estimatedLoss": "$XXX,XXX,XXX",
      "primaryAddress": "0x...",
      "referenceUrl": "https://..."
    }
  ]
}
```

### known-addresses.json
Database of flagged addresses including:
- Confirmed hackers and exploiters
- Mixing services (Tornado Cash, etc.)
- Known scammers and phishers
- Sanctioned entities
- Money laundering intermediaries

**Structure:**
```json
{
  "version": "1.0.0",
  "lastUpdated": "YYYY-MM-DD",
  "addresses": [
    {
      "address": "0x... or Solana address",
      "chainType": "evm|solana",
      "label": "Human-readable label",
      "category": "hack|exploit|fraud|scam|phishing|mixer|sanctioned|etc",
      "riskLevel": "critical|high|medium|low|info",
      "description": "Detailed description with evidence",
      "source": "Attribution source",
      "relatedEvent": "Event name (optional)",
      "dateTagged": "YYYY-MM-DD"
    }
  ]
}
```

## 🔄 Importing Intelligence

### Option 1: Import from CLI

```bash
npm run forensics
# Select: "📥 Import Threat Intelligence"
# Choose: "Import All (Events + Addresses)"
```

### Option 2: Import Programmatically

```javascript
const { importAllIntelligence } = require('./forensics/intelligence-importer');

// Import everything
importAllIntelligence();

// Or import specific files
const { importKnownEvents, importKnownAddresses } = require('./forensics/intelligence-importer');
importKnownEvents('./path/to/events.json');
importKnownAddresses('./path/to/addresses.json');
```

## 📤 Exporting Your Intelligence

Share your tagged addresses and registered events:

```bash
npm run forensics
# Select: "📤 Export Intelligence Database"
# Specify output directory
```

This exports:
- `exported-events.json` - All events you've registered
- `exported-addresses.json` - All addresses you've tagged

## 🔍 Current Intelligence

### Known Events (10 major incidents)
1. **Ronin Bridge Hack** - $625M (March 2022)
2. **Poly Network Hack** - $611M (August 2021)
3. **FTX Exchange Hack** - $477M (November 2022)
4. **Wormhole Bridge Exploit** - $325M (February 2022)
5. **Nomad Bridge Hack** - $190M (August 2022)
6. **Beanstalk Governance Attack** - $182M (April 2022)
7. **Euler Finance Hack** - $197M (March 2023)
8. **Mango Markets Exploit** - $116M (October 2022)
9. **Harmony Bridge Hack** - $100M (June 2022)
10. **BitMart Exchange Hack** - $196M (December 2021)

### Known Addresses (15 flagged addresses)
- Primary hacker addresses from major incidents
- Tornado Cash mixing contracts (OFAC sanctioned)
- Known phishing operations
- Money laundering intermediaries

## 🤝 Contributing Intelligence

### Adding New Events

1. Research and verify the incident
2. Collect evidence (transaction hashes, official disclosures, etc.)
3. Add to `known-events.json` following the structure
4. Submit pull request with sources cited

### Adding New Addresses

1. **Verify attribution** - Ensure evidence is solid
2. **Cite sources** - Reference blockchain explorers, security firms, official disclosures
3. **Appropriate risk level** - Be conservative with critical/high ratings
4. **Complete description** - Provide context and evidence
5. **Add to** `known-addresses.json`
6. **Submit PR** with attribution sources

## ⚠️ Important Notes

### Data Quality
- All intelligence should be **verified** and **sourced**
- Prefer official disclosures from affected protocols
- Cross-reference with multiple security firms
- When uncertain, use lower risk levels

### Legal Considerations
- All addresses are from **public blockchain data**
- Attributions based on **publicly available evidence**
- Sources should be **reputable** (Chainalysis, Elliptic, official disclosures)
- Avoid unverified claims or speculation

### Accuracy
- Regular updates as new information emerges
- Corrections when better evidence surfaces
- Version tracking for accountability
- Clear source attribution

## 📚 Sources

### Security Firms
- [Chainalysis](https://www.chainalysis.com/)
- [Elliptic](https://www.elliptic.co/)
- [PeckShield](https://peckshield.com/)
- [SlowMist](https://www.slowmist.com/)
- [BlockSec](https://blocksec.com/)
- [Certora](https://www.certora.com/)

### Official Lists
- [OFAC Sanctions](https://home.treasury.gov/policy-issues/financial-sanctions/specially-designated-nationals-and-blocked-persons-list-sdn-human-readable-lists)
- [Scam Sniffer](https://scamsniffer.io/)

### Blockchain Explorers
- [Etherscan](https://etherscan.io/)
- [Solscan](https://solscan.io/)
- [Polygonscan](https://polygonscan.com/)

## 🔐 Validation

Before importing custom intelligence files:

```javascript
const { validateIntelligenceFile } = require('./forensics/intelligence-importer');

// Validate events file
validateIntelligenceFile('./custom-events.json', 'events');

// Validate addresses file
validateIntelligenceFile('./custom-addresses.json', 'addresses');
```

## 📊 Statistics

**Current Database:**
- Total Events: 10 major incidents
- Total Addresses: 15 flagged addresses
- Combined Loss: $3.2+ Billion
- Chains Covered: Ethereum, Solana, Polygon, Arbitrum, BSC

**Last Updated:** 2024-12-13

---

**Help grow the intelligence database!** Submit verified intelligence via pull requests.
