# Blockchain Forensic Analysis System

## Overview

This toolkit provides comprehensive blockchain forensic capabilities for investigating on-chain activity, attributing addresses to known entities/events, analyzing transaction timelines, and generating investigation reports with provable blockchain evidence.

## Features

- **Transaction History Collection**: Fetch complete transaction history for any address across multiple chains
- **Address Attribution**: Tag and label addresses with known entities, hacks, exploits, or fraudulent activity
- **Timeline Analysis**: Chronological analysis of transaction activity with flagged address detection
- **Fund Flow Tracing**: Track fund movement between multiple addresses
- **Pattern Detection**: Identify suspicious behavioral patterns (rapid transfers, high-value txs, etc.)
- **Event Registry**: Catalog known security events with associated addresses
- **Address Clustering**: Group related addresses together with confidence scores
- **Report Generation**: Export comprehensive forensic reports in JSON, CSV, and Markdown formats

## Quick Start

### Installation

```bash
npm install
```

### Configuration

Ensure your `.env` file contains Alchemy RPC URLs for the chains you want to investigate:

```
ALCHEMY_API_KEY=your_api_key_here
ETH_MAINNET_RPC=https://eth-mainnet.g.alchemy.com/v2/your_api_key
POLYGON_MAINNET_RPC=https://polygon-mainnet.g.alchemy.com/v2/your_api_key
ARB_MAINNET_RPC=https://arb-mainnet.g.alchemy.com/v2/your_api_key
```

### Run Forensic Tool

```bash
npm run forensics
```

## Usage Guide

### 1. Collect Transaction History

Fetches all transactions (incoming and outgoing) for a target address and stores them in the database.

**Process:**
1. Select "Collect Transaction History"
2. Choose blockchain
3. Enter target address
4. Specify max transaction count
5. System fetches and stores all transactions

**Use Case:** Building a complete transaction history for an address suspected of involvement in a hack or fraud.

### 2. Tag/Attribute Addresses

Label addresses with attribution information for tracking known bad actors, victims, or intermediaries.

**Categories:**
- `exploit` - Exploit-related address
- `hack` - Confirmed hack/theft
- `fraud` - Fraudulent activity
- `scam` - Scam operation
- `phishing` - Phishing attack
- `mixer` - Mixing service
- `exchange` - CEX/DEX
- `sanctioned` - Sanctioned entity
- `known-attacker` - Known attacker
- `victim` - Victim address
- `intermediary` - Intermediary wallet

**Risk Levels:**
- `critical` - Immediate threat
- `high` - High risk
- `medium` - Moderate risk
- `low` - Low risk
- `info` - Informational only

**Example:**
```javascript
tagAddress(
  '0x1234...',
  'evm',
  'Ronin Bridge Exploiter',
  {
    category: 'hack',
    riskLevel: 'critical',
    description: 'Primary exploiter address from Ronin Bridge hack March 2022',
    source: 'Public disclosure + blockchain analysis'
  }
);
```

### 3. Check Address Reputation

Instantly check if an address has been flagged or attributed.

**Returns:**
- All attributions for the address
- Cluster memberships
- Overall risk assessment

### 4. Analyze Timeline

Displays chronological transaction activity for one or more addresses with attribution context.

**Features:**
- Shows transactions in chronological order
- Highlights flagged address interactions
- Activity statistics per address
- Date range filtering

**Use Case:** Understanding the sequence of events in a multi-step exploit or fund laundering operation.

### 5. Trace Fund Flow Path

Track funds moving through a chain of addresses.

**Input:** Comma-separated list of addresses representing the path
**Example:** `0xAAA,0xBBB,0xCCC`

**Output:**
- Direct transactions between each address pair
- Total value transferred
- Transaction count and timestamps

**Use Case:** Following stolen funds through multiple hops to their destination.

### 6. Detect Suspicious Patterns

Automated detection of unusual behavioral patterns:

- **Rapid Transfers**: Transactions < 1 minute apart
- **High-Value Transactions**: Transfers > 1 ETH
- **Contract Interactions**: Smart contract calls
- **Failed Transactions**: Unsuccessful attempts
- **Identical Values**: Repeated identical transfer amounts (automation indicator)

**Use Case:** Identifying automated bot behavior or coordinated attack patterns.

### 7. Register Known Events

Catalog major security events in the database for cross-referencing.

**Event Types:**
- hack
- exploit
- fraud
- scam
- phishing
- rug-pull

**Information Stored:**
- Event name and type
- Date occurred
- Primary chain
- Estimated loss
- Primary attacker address
- Reference URL

**Example:**
```javascript
registerEvent('Ronin Bridge Hack 2022', {
  eventType: 'hack',
  eventDate: '2022-03-23',
  chainName: 'Ethereum Mainnet',
  description: 'Exploit of Ronin Network bridge resulting in $625M theft',
  estimatedLoss: '$625,000,000',
  primaryAddress: '0x098B716B8Aaf21512996dC57EB0615e2383E2f96',
  referenceUrl: 'https://example.com/ronin-bridge-hack'
});
```

### 8. Generate Forensic Report

Export comprehensive investigation reports in multiple formats.

**Report Contents:**
- Executive summary with statistics
- All target addresses with attributions
- Flagged interactions between addresses
- Complete chronological transaction log
- Chain and date range information

**Export Formats:**
- **JSON**: Machine-readable, complete data
- **CSV**: Transaction log for spreadsheet analysis
- **Markdown**: Human-readable report for documentation

**Output:** Files saved to `./forensic-reports/` directory

## Database Schema

### Tables

#### `transactions`
Stores individual blockchain transactions for forensic analysis.

- `tx_hash` - Transaction hash (unique)
- `chain_name` - Blockchain name
- `block_number` - Block number
- `timestamp` - Transaction timestamp
- `from_address` - Sender address
- `to_address` - Recipient address
- `value` - Value transferred (wei)
- `gas_used` - Gas consumed
- `gas_price` - Gas price
- `input_data` - Transaction input data
- `contract_address` - Created contract address (if any)
- `status` - Success (1) or failure (0)
- `method_id` - Function signature (first 4 bytes of input)

#### `address_attributions`
Tags and labels for addresses.

- `address` - Wallet address
- `chain_type` - evm/solana
- `label` - Human-readable label
- `category` - Category (hack, fraud, etc.)
- `risk_level` - critical/high/medium/low/info
- `description` - Detailed description
- `source` - Attribution source
- `date_added` - When added

#### `known_events`
Catalog of major security events.

- `event_name` - Event name
- `event_type` - hack/exploit/fraud/etc.
- `event_date` - When occurred
- `chain_name` - Primary blockchain
- `description` - Event description
- `estimated_loss` - Financial impact
- `primary_address` - Main attacker address
- `reference_url` - External reference

#### `address_clusters`
Groups of related addresses.

- `cluster_name` - Cluster identifier
- `address` - Member address
- `chain_type` - evm/solana
- `confidence_score` - Confidence (0-1)
- `evidence` - Supporting evidence

## API Reference

### Transaction Fetcher (`forensics/transaction-fetcher.js`)

```javascript
const { collectAddressHistory, traceFundFlow } = require('./forensics/transaction-fetcher');

// Collect complete transaction history
await collectAddressHistory(
  '0x1234...',
  rpcUrl,
  'Ethereum Mainnet',
  { maxCount: 5000 }
);

// Trace direct transfers between two addresses
await traceFundFlow('0xAAA...', '0xBBB...', rpcUrl, 'Ethereum Mainnet');
```

### Attribution Manager (`forensics/attribution-manager.js`)

```javascript
const {
  tagAddress,
  checkAddressReputation,
  registerEvent,
  createCluster,
  RISK_LEVELS,
  CATEGORIES
} = require('./forensics/attribution-manager');

// Tag an address
tagAddress('0x1234...', 'evm', 'Tornado Cash', {
  category: CATEGORIES.MIXER,
  riskLevel: RISK_LEVELS.HIGH,
  description: 'Tornado Cash mixer deposit address',
  source: 'OFAC sanctions list'
});

// Check reputation
const report = checkAddressReputation('0x1234...');

// Create address cluster
createCluster('Ronin Hack Cluster', [
  '0x098B716B8Aaf21512996dC57EB0615e2383E2f96',
  '0x...'
], 'evm', {
  confidenceScore: 0.95,
  evidence: 'All addresses received funds from primary exploiter'
});
```

### Timeline Analyzer (`forensics/timeline-analyzer.js`)

```javascript
const {
  displayTimeline,
  traceFundPath,
  detectSuspiciousPatterns
} = require('./forensics/timeline-analyzer');

// Display transaction timeline
displayTimeline(['0x1234...', '0x5678...'], {
  startDate: '2022-01-01',
  endDate: '2022-12-31'
});

// Trace fund path through multiple addresses
traceFundPath(['0xAAA...', '0xBBB...', '0xCCC...']);

// Detect suspicious patterns
const patterns = detectSuspiciousPatterns('0x1234...', {
  startDate: '2023-01-01'
});
```

### Report Exporter (`forensics/report-exporter.js`)

```javascript
const { exportAllFormats } = require('./forensics/report-exporter');

// Generate comprehensive report in all formats
exportAllFormats(
  ['0x1234...', '0x5678...'],
  './forensic-reports',
  {
    caseId: 'CASE-2024-001',
    title: 'Investigation: Suspected Wallet Cluster',
    investigator: 'Analyst Name'
  }
);
```

## Investigation Workflow Example

### Scenario: Investigating a Suspected Hack

1. **Identify Target Addresses**
   - Start with known exploiter address: `0xExploiter...`

2. **Collect Transaction History**
   ```bash
   npm run forensics
   # Select: Collect Transaction History
   # Enter: 0xExploiter...
   ```

3. **Tag the Address**
   ```bash
   # Select: Tag/Attribute Address
   # Label: "XYZ Protocol Exploiter"
   # Category: hack
   # Risk Level: critical
   ```

4. **Analyze Timeline**
   ```bash
   # Select: Analyze Timeline
   # Addresses: 0xExploiter...
   # Review chronological activity
   ```

5. **Identify Fund Destinations**
   - Note all addresses that received funds from exploiter
   - Collect history for those addresses too

6. **Trace Fund Flow**
   ```bash
   # Select: Trace Fund Flow Path
   # Path: 0xExploiter,0xIntermediary,0xFinalDestination
   ```

7. **Detect Patterns**
   ```bash
   # Select: Detect Suspicious Patterns
   # Analyze for automation, rapid transfers, etc.
   ```

8. **Generate Report**
   ```bash
   # Select: Generate Forensic Report
   # Include all related addresses
   # Export in all formats for sharing
   ```

## Best Practices

### Attribution
- Always include source of attribution (blockchain explorer, public disclosure, etc.)
- Use appropriate risk levels based on confirmed evidence
- Update attributions as new information emerges
- Cross-reference with known events when possible

### Investigation
- Start with confirmed addresses and expand outward
- Collect transaction history before analysis
- Look for patterns that indicate coordination (identical values, timing)
- Document fund flows with screenshots/exports
- Tag intermediary addresses as you discover them

### Reporting
- Include case ID and investigator name
- Specify date ranges analyzed
- List all data sources
- Export in multiple formats for different audiences
- Keep reports factual - blockchain evidence only

## Legal and Ethical Considerations

This tool is designed for:
- ✅ Legitimate blockchain forensics and investigations
- ✅ Security research and threat intelligence
- ✅ Compliance and regulatory reporting
- ✅ Incident response and breach analysis

NOT for:
- ❌ Harassment or doxxing individuals
- ❌ Creating false evidence
- ❌ Unauthorized surveillance
- ❌ Violating privacy laws or regulations

All blockchain data queried is public and immutable. This tool simply aggregates and analyzes publicly available on-chain information.

## Supported Chains

Currently supported chains (via Alchemy):
- Ethereum Mainnet
- Polygon Mainnet
- Arbitrum One
- Optimism Mainnet
- Base Mainnet

To add more chains, update the RPC URLs in your `.env` file.

## Troubleshooting

### "No transactions found"
- Ensure you've run "Collect Transaction History" first
- Check that the address is correct
- Verify the database file exists (`database/alchemy-queries.db`)

### Rate Limiting
- Alchemy free tier has rate limits
- For large investigations, consider upgrading your Alchemy plan
- Use the `maxCount` parameter to limit fetches

### Missing Attributions
- Attributions must be manually added or imported
- Build your attribution database over time
- Consider importing known bad actor lists

## Contributing

To add new forensic capabilities:

1. Add database schema changes to `database/db.js`
2. Implement analysis functions in appropriate module
3. Add CLI menu option in `forensics/index.js`
4. Document new features in this guide

## Support

For issues or questions:
- Check the troubleshooting section above
- Review example workflows
- Ensure all environment variables are configured

---

**Remember:** This tool analyzes public blockchain data. All evidence is verifiable on-chain and immutable. Use responsibly and legally.
