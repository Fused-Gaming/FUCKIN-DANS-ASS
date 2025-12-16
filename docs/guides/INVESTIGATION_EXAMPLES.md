# Forensic Investigation Examples

## Example 1: Tracking a DeFi Exploit

### Scenario
A DeFi protocol was exploited for $10M. The exploiter address is known: `0x1234...`

### Investigation Steps

```javascript
// Step 1: Tag the exploiter address
const { tagAddress, CATEGORIES, RISK_LEVELS } = require('./forensics/attribution-manager');

tagAddress(
  '0x1234567890123456789012345678901234567890',
  'evm',
  'XYZ DeFi Exploiter',
  {
    category: CATEGORIES.EXPLOIT,
    riskLevel: RISK_LEVELS.CRITICAL,
    description: 'Exploited flash loan vulnerability in XYZ Protocol',
    source: 'Protocol team disclosure + blockchain analysis'
  }
);

// Step 2: Collect transaction history
const { collectAddressHistory } = require('./forensics/transaction-fetcher');

await collectAddressHistory(
  '0x1234567890123456789012345678901234567890',
  process.env.ETH_MAINNET_RPC,
  'Ethereum Mainnet',
  { maxCount: 5000 }
);

// Step 3: Analyze timeline to find where funds went
const { displayTimeline } = require('./forensics/timeline-analyzer');

displayTimeline(['0x1234567890123456789012345678901234567890']);

// Step 4: Identify and tag intermediary addresses
// (Based on timeline analysis, assume funds went to 0xABCD...)

tagAddress(
  '0xABCDEF1234567890123456789012345678901234',
  'evm',
  'XYZ Exploit Intermediary Wallet #1',
  {
    category: CATEGORIES.INTERMEDIARY,
    riskLevel: RISK_LEVELS.HIGH,
    description: 'Received stolen funds from XYZ exploiter, 2 hours after exploit',
    source: 'Transaction flow analysis'
  }
);

// Step 5: Collect history for intermediary
await collectAddressHistory(
  '0xABCDEF1234567890123456789012345678901234',
  process.env.ETH_MAINNET_RPC,
  'Ethereum Mainnet',
  { maxCount: 5000 }
);

// Step 6: Create address cluster
const { createCluster } = require('./forensics/attribution-manager');

createCluster(
  'XYZ DeFi Exploit Cluster',
  [
    '0x1234567890123456789012345678901234567890',
    '0xABCDEF1234567890123456789012345678901234',
    // Add more addresses as discovered
  ],
  'evm',
  {
    confidenceScore: 0.95,
    evidence: 'Direct fund transfers from primary exploiter within 24 hours of exploit'
  }
);

// Step 7: Register the event
const { registerEvent } = require('./forensics/attribution-manager');

registerEvent('XYZ DeFi Flash Loan Exploit', {
  eventType: 'exploit',
  eventDate: '2024-01-15T14:30:00Z',
  chainName: 'Ethereum Mainnet',
  description: 'Flash loan attack exploiting reentrancy vulnerability in XYZ lending protocol',
  estimatedLoss: '$10,000,000',
  primaryAddress: '0x1234567890123456789012345678901234567890',
  referenceUrl: 'https://twitter.com/XYZProtocol/status/...'
});

// Step 8: Generate comprehensive report
const { exportAllFormats } = require('./forensics/report-exporter');

exportAllFormats(
  [
    '0x1234567890123456789012345678901234567890',
    '0xABCDEF1234567890123456789012345678901234'
  ],
  './forensic-reports',
  {
    caseId: 'CASE-2024-XYZ-EXPLOIT',
    title: 'XYZ DeFi Protocol Exploit Investigation',
    investigator: 'Security Team'
  }
);
```

## Example 2: Identifying a Phishing Campaign

### Scenario
Multiple users reported sending funds to a phishing address posing as a legitimate project.

```javascript
const {
  tagAddress,
  bulkTagAddresses,
  createCluster,
  CATEGORIES,
  RISK_LEVELS
} = require('./forensics/attribution-manager');

// Step 1: Tag the main phishing address
tagAddress(
  '0xPHISHER1234567890123456789012345678901234',
  'evm',
  'ABC Token Phishing Scam',
  {
    category: CATEGORIES.PHISHING,
    riskLevel: RISK_LEVELS.HIGH,
    description: 'Impersonating official ABC Token airdrop',
    source: 'Community reports + website analysis'
  }
);

// Step 2: Collect transaction history
const { collectAddressHistory } = require('./forensics/transaction-fetcher');

await collectAddressHistory(
  '0xPHISHER1234567890123456789012345678901234',
  process.env.ETH_MAINNET_RPC,
  'Ethereum Mainnet',
  { maxCount: 10000 }
);

// Step 3: Analyze patterns to find victim addresses and additional scammer wallets
const { detectSuspiciousPatterns, displayTimeline } = require('./forensics/timeline-analyzer');

// Look for rapid incoming transfers (victims sending funds)
const patterns = detectSuspiciousPatterns('0xPHISHER1234567890123456789012345678901234');

displayTimeline(['0xPHISHER1234567890123456789012345678901234']);

// Step 4: Tag victim addresses
const victimAddresses = [
  '0xVICTIM1...',
  '0xVICTIM2...',
  '0xVICTIM3...'
  // Identified from timeline
];

bulkTagAddresses(
  victimAddresses,
  'evm',
  'ABC Phishing Victim',
  {
    category: CATEGORIES.VICTIM,
    riskLevel: RISK_LEVELS.INFO,
    description: 'Sent funds to ABC Token phishing address',
    source: 'Transaction analysis'
  }
);

// Step 5: Identify where scammer moved funds
// (Assume funds went to exchange deposit addresses)

tagAddress(
  '0xEXCHANGE_DEPOSIT...',
  'evm',
  'Exchange Deposit - ABC Phishing Funds',
  {
    category: CATEGORIES.INTERMEDIARY,
    riskLevel: RISK_LEVELS.MEDIUM,
    description: 'Exchange address received funds from ABC phishing wallet',
    source: 'Fund flow analysis'
  }
);

// Step 6: Register the event
const { registerEvent } = require('./forensics/attribution-manager');

registerEvent('ABC Token Phishing Campaign Jan 2024', {
  eventType: 'phishing',
  eventDate: '2024-01-20',
  chainName: 'Ethereum Mainnet',
  description: 'Phishing campaign impersonating ABC Token airdrop, affecting 50+ users',
  estimatedLoss: '$150,000',
  primaryAddress: '0xPHISHER1234567890123456789012345678901234',
  referenceUrl: 'https://twitter.com/ABCToken/status/...'
});

// Step 7: Generate victim notification report
exportAllFormats(
  ['0xPHISHER1234567890123456789012345678901234', ...victimAddresses],
  './forensic-reports',
  {
    caseId: 'CASE-2024-ABC-PHISHING',
    title: 'ABC Token Phishing Campaign Analysis',
    investigator: 'Community Safety Team'
  }
);
```

## Example 3: Tracing Stolen NFTs

### Scenario
High-value NFTs stolen from a wallet, tracking their movement across addresses.

```javascript
const {
  collectAddressHistory,
  traceFundFlow
} = require('./forensics/transaction-fetcher');
const {
  tagAddress,
  createCluster,
  CATEGORIES,
  RISK_LEVELS
} = require('./forensics/attribution-manager');
const { traceFundPath } = require('./forensics/timeline-analyzer');

// Step 1: Tag victim's wallet
tagAddress(
  '0xVICTIM_WALLET...',
  'evm',
  'NFT Theft Victim - Jan 2024',
  {
    category: CATEGORIES.VICTIM,
    riskLevel: RISK_LEVELS.INFO,
    description: '5 BAYC stolen via compromised private key',
    source: 'Victim report'
  }
);

// Step 2: Tag thief's wallet
tagAddress(
  '0xTHIEF_WALLET...',
  'evm',
  'NFT Thief - BAYC Theft Jan 2024',
  {
    category: CATEGORIES.HACK,
    riskLevel: RISK_LEVELS.CRITICAL,
    description: 'Transferred 5 BAYC from victim wallet within minutes',
    source: 'Transaction analysis'
  }
);

// Step 3: Collect history for both addresses
await collectAddressHistory('0xVICTIM_WALLET...', process.env.ETH_MAINNET_RPC, 'Ethereum Mainnet');
await collectAddressHistory('0xTHIEF_WALLET...', process.env.ETH_MAINNET_RPC, 'Ethereum Mainnet');

// Step 4: Trace where NFTs went (multiple hops)
const nftPath = [
  '0xVICTIM_WALLET...',
  '0xTHIEF_WALLET...',
  '0xINTERMEDIARY1...',
  '0xINTERMEDIARY2...',
  '0xFINAL_DESTINATION...'
];

// Collect history for entire path
for (const address of nftPath) {
  await collectAddressHistory(address, process.env.ETH_MAINNET_RPC, 'Ethereum Mainnet');
}

// Trace the path
traceFundPath(nftPath);

// Step 5: Tag all intermediaries
tagAddress('0xINTERMEDIARY1...', 'evm', 'NFT Laundering Intermediary #1', {
  category: CATEGORIES.INTERMEDIARY,
  riskLevel: RISK_LEVELS.HIGH,
  description: 'Received stolen BAYC from primary thief',
  source: 'NFT transfer tracking'
});

tagAddress('0xINTERMEDIARY2...', 'evm', 'NFT Laundering Intermediary #2', {
  category: CATEGORIES.INTERMEDIARY,
  riskLevel: RISK_LEVELS.HIGH,
  description: 'Second hop in stolen BAYC laundering chain',
  source: 'NFT transfer tracking'
});

// Step 6: Create cluster
createCluster(
  'BAYC Theft Jan 2024 Cluster',
  nftPath,
  'evm',
  {
    confidenceScore: 0.98,
    evidence: 'Direct NFT transfers forming chain from victim to final holder'
  }
);

// Step 7: Generate report with evidence for marketplace reporting
const { exportAllFormats } = require('./forensics/report-exporter');

exportAllFormats(
  nftPath,
  './forensic-reports',
  {
    caseId: 'CASE-2024-BAYC-THEFT',
    title: 'Stolen BAYC NFT Movement Analysis',
    investigator: 'Victim + Community'
  }
);

// This report can be submitted to OpenSea, LooksRare, etc. to flag the stolen NFTs
```

## Example 4: Mixer/Tornado Cash Flow Analysis

### Scenario
Tracking funds that went through Tornado Cash to understand deposit/withdrawal patterns.

```javascript
const {
  collectAddressHistory
} = require('./forensics/transaction-fetcher');
const {
  tagAddress,
  CATEGORIES,
  RISK_LEVELS
} = require('./forensics/attribution-manager');
const {
  detectSuspiciousPatterns,
  displayTimeline
} = require('./forensics/timeline-analyzer');

// Step 1: Tag known Tornado Cash addresses
const tornadoAddresses = [
  '0x12D66f87A04A9E220743712cE6d9bB1B5616B8Fc', // 0.1 ETH
  '0x47CE0C6eD5B0Ce3d3A51fdb1C52DC66a7c3c2936', // 1 ETH
  '0x910Cbd523D972eb0a6f4cAe4618aD62622b39DbF'  // 10 ETH
];

tornadoAddresses.forEach(addr => {
  tagAddress(addr, 'evm', 'Tornado Cash Mixer', {
    category: CATEGORIES.MIXER,
    riskLevel: RISK_LEVELS.HIGH,
    description: 'Tornado Cash mixing contract (OFAC sanctioned)',
    source: 'OFAC sanctions list'
  });
});

// Step 2: Track suspicious address that used Tornado Cash
const suspectAddress = '0xSUSPECT...';

await collectAddressHistory(
  suspectAddress,
  process.env.ETH_MAINNET_RPC,
  'Ethereum Mainnet',
  { maxCount: 10000 }
);

// Step 3: Detect pattern of Tornado Cash usage
const patterns = detectSuspiciousPatterns(suspectAddress);

// Look for:
// - Identical deposit amounts (common in Tornado Cash)
// - Timing patterns between deposits and withdrawals
// - Multiple interactions with mixer contracts

// Step 4: Analyze timeline to correlate deposits/withdrawals
displayTimeline([suspectAddress, ...tornadoAddresses]);

// Step 5: Tag the suspect appropriately
tagAddress(suspectAddress, 'evm', 'Tornado Cash User - Suspicious Activity', {
  category: CATEGORIES.INTERMEDIARY,
  riskLevel: RISK_LEVELS.MEDIUM,
  description: 'Multiple interactions with OFAC-sanctioned Tornado Cash contracts',
  source: 'Transaction pattern analysis'
});
```

## Example 5: Exchange Hack Fund Recovery

### Scenario
Major exchange was hacked. Tracking attacker's fund distribution to freeze assets.

```javascript
const {
  collectAddressHistory
} = require('./forensics/transaction-fetcher');
const {
  tagAddress,
  bulkTagAddresses,
  createCluster,
  registerEvent,
  CATEGORIES,
  RISK_LEVELS
} = require('./forensics/attribution-manager');
const {
  traceFundPath,
  displayTimeline
} = require('./forensics/timeline-analyzer');
const {
  exportAllFormats
} = require('./forensics/report-exporter');

// Step 1: Register the hack event
registerEvent('BigExchange Hack - Feb 2024', {
  eventType: 'hack',
  eventDate: '2024-02-10T08:15:00Z',
  chainName: 'Ethereum Mainnet',
  description: 'Hot wallet compromise leading to $100M theft from exchange',
  estimatedLoss: '$100,000,000',
  primaryAddress: '0xHACKER_PRIMARY...',
  referenceUrl: 'https://bigexchange.com/security-incident'
});

// Step 2: Tag primary attacker address
tagAddress('0xHACKER_PRIMARY...', 'evm', 'BigExchange Hacker - Primary', {
  category: CATEGORIES.HACK,
  riskLevel: RISK_LEVELS.CRITICAL,
  description: 'Primary address that received stolen funds from BigExchange hot wallet',
  source: 'Exchange security team + blockchain analysis'
});

// Step 3: Collect full transaction history
await collectAddressHistory(
  '0xHACKER_PRIMARY...',
  process.env.ETH_MAINNET_RPC,
  'Ethereum Mainnet',
  { maxCount: 50000 }
);

// Step 4: Analyze timeline to identify fund distribution
displayTimeline(['0xHACKER_PRIMARY...']);

// Step 5: Identify all addresses that received funds (from timeline analysis)
const fundRecipients = [
  '0xDISTRIBUTION_1...',
  '0xDISTRIBUTION_2...',
  '0xDISTRIBUTION_3...',
  // ... dozens more
];

// Step 6: Bulk tag all recipient addresses
bulkTagAddresses(
  fundRecipients,
  'evm',
  'BigExchange Hack - Fund Recipient',
  {
    category: CATEGORIES.INTERMEDIARY,
    riskLevel: RISK_LEVELS.CRITICAL,
    description: 'Received portion of stolen BigExchange funds',
    source: 'Fund distribution analysis'
  }
);

// Step 7: Collect history for all recipients
for (const address of fundRecipients) {
  await collectAddressHistory(address, process.env.ETH_MAINNET_RPC, 'Ethereum Mainnet');
}

// Step 8: Create comprehensive cluster
createCluster(
  'BigExchange Hack Feb 2024',
  ['0xHACKER_PRIMARY...', ...fundRecipients],
  'evm',
  {
    confidenceScore: 1.0,
    evidence: 'Direct fund transfers from confirmed attacker wallet'
  }
);

// Step 9: Generate report for law enforcement and exchanges
exportAllFormats(
  ['0xHACKER_PRIMARY...', ...fundRecipients],
  './forensic-reports',
  {
    caseId: 'CASE-2024-BIGEXCHANGE-HACK',
    title: 'BigExchange Security Incident - Asset Tracking Report',
    investigator: 'BigExchange Security + Law Enforcement'
  }
);

// Step 10: Monitor for fund movement to exchanges for freezing
// (Export CSV to share with other exchanges for freezing deposits)
```

## Tips for Effective Investigations

### 1. Start Broad, Then Narrow
- Begin with known addresses
- Collect full transaction history first
- Analyze patterns to identify related addresses
- Expand the investigation based on findings

### 2. Use Clusters Effectively
- Group all related addresses into named clusters
- Update confidence scores as evidence strengthens
- Document the evidence linking addresses

### 3. Timeline Analysis is Key
- Chronological order reveals the sequence of events
- Look for timing patterns (coordinated actions)
- Identify key moments (exploit, initial distribution, cashing out)

### 4. Tag Everything
- Tag addresses as soon as you identify them
- Include detailed descriptions
- Always cite your source
- Update tags as new information emerges

### 5. Export Reports Regularly
- Generate reports at key investigation milestones
- Share reports with relevant parties (law enforcement, exchanges)
- Keep reports updated as investigation progresses

### 6. Cross-Chain Tracking
- Many attackers bridge funds across chains
- Check the same address on multiple chains
- Look for bridge contract interactions in transaction history

### 7. Pattern Recognition
- Identical transfer amounts often indicate automation
- Rapid sequential transfers suggest scripted behavior
- Failed transactions might indicate testing or mistakes
- High-value transactions warrant extra scrutiny

---

These examples demonstrate real-world forensic investigation workflows using this toolkit. Adapt these patterns to your specific investigation needs.
