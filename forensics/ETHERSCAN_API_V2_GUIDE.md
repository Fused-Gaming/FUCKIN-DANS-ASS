# Etherscan API v2 Label Import Guide

## Overview

The Etherscan label importer now uses API v2, which provides enhanced label information and supports multiple labels per address.

## API v2 Features

### 1. Private Name Tags Support
Import your private name tags saved in your Etherscan account:
- Individual address private tags
- Batch import all private tags from your account
- Includes notes/descriptions you've added
- Requires API key with private tag access

### 2. Multiple Labels Support
API v2 can return multiple labels for a single address, providing more comprehensive attribution:

```javascript
// Example response structure
{
  address: "0x...",
  labels: [
    {
      label: "Binance",
      type: "exchange",
      labels: ["CEX", "Hot Wallet"]
    },
    {
      label: "High Volume",
      type: "activity",
      labels: []
    }
  ]
}
```

### 3. Label Types
Labels can have different types:
- `exchange` - Centralized exchange
- `dex` - Decentralized exchange
- `defi` - DeFi protocol
- `bridge` - Cross-chain bridge
- `hack` - Known hack/exploit
- `scam` - Scam/fraud
- `tag` - General tag
- `private` - Private name tag (from your account)

### 4. Label Cloud (v2 Pro)
Optional endpoint that provides a comprehensive view of all labels associated with an address across different sources.

## API Endpoints Used

### Primary Endpoints
1. **Address Label** (v2)
   - Endpoint: `module=account&action=addresslabel`
   - Returns: Primary labels and sub-labels for an address

2. **Private Name Tag** (v2)
   - Endpoint: `module=account&action=addresstagnote`
   - Returns: Private tag and note for a specific address
   - Requires: API key with private tag access

3. **Private Tag List** (v2)
   - Endpoint: `module=account&action=addresstaglist`
   - Returns: All private tags saved in your Etherscan account
   - Requires: API key with private tag access

4. **Label Cloud** (v2 Pro - Optional)
   - Endpoint: `module=account&action=addresslabelcloud`
   - Returns: Comprehensive label aggregation

5. **Contract Source**
   - Endpoint: `module=contract&action=getsourcecode`
   - Returns: Contract verification and name information

6. **Transaction List**
   - Endpoint: `module=account&action=txlist`
   - Returns: Transaction history for first/last seen dates

## Configuration

### Environment Variables

Add your Etherscan API key to `.env`:

```bash
# Default API key (used for all chains)
ETHERSCAN_API_KEY=your_api_key_here

# Optional: Chain-specific keys for better rate limits
ETH_MAINNET_ETHERSCAN_API_KEY=your_key_here
POLYGON_MAINNET_ETHERSCAN_API_KEY=your_key_here
ARB_MAINNET_ETHERSCAN_API_KEY=your_key_here
OPT_MAINNET_ETHERSCAN_API_KEY=your_key_here
BASE_MAINNET_ETHERSCAN_API_KEY=your_key_here
```

### Supported Chains

- Ethereum Mainnet (`ETH_MAINNET`)
- Polygon (`POLYGON_MAINNET`)
- Arbitrum (`ARB_MAINNET`)
- Optimism (`OPT_MAINNET`)
- Base (`BASE_MAINNET`)
- BSC (`BSC_MAINNET`)
- Avalanche (`AVALANCHE_MAINNET`)

## Usage

### Via CLI

1. Run the forensics tool:
   ```bash
   npm run forensics
   ```

2. Select "Import Labels from Etherscan"

3. Choose import type:
   - Single Address
   - Multiple Addresses
   - Import from File
   - Import All Private Tags from Account

### Programmatic Usage

```javascript
const {
  importAddressLabels,
  importBulkLabels,
  importLabelsFromFile,
  importAllPrivateTags
} = require('./forensics/etherscan-label-importer');

// Import single address with private tags
const result = await importAddressLabels(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  'ETH_MAINNET',
  {
    includePrivateTags: true,
    includeTransactionData: true,
    autoTag: true
  }
);

// Import multiple addresses
const results = await importBulkLabels(
  ['0x...', '0x...'],
  'ETH_MAINNET',
  {
    includePrivateTags: true,
    includeTransactionData: true,
    autoTag: true,
    delayMs: 200 // Rate limiting
  }
);

// Import from file
const fileResults = await importLabelsFromFile(
  './addresses.txt',
  'ETH_MAINNET',
  {
    includePrivateTags: true,
    includeTransactionData: true,
    autoTag: true,
    delayMs: 200
  }
);

// Import all private tags from your Etherscan account
const privateTagsResult = await importAllPrivateTags(
  'ETH_MAINNET',
  {
    autoTag: true
  }
);
```

## Data Collected

For each address, the importer collects:

### Labels
- Primary label/name
- Label type
- Sub-labels (additional tags)
- Source attribution

### Private Tags (if available)
- Private name tag from your account
- Notes/descriptions you've added
- Timestamp when tag was created

### Contract Information
- Contract name
- Compiler version
- Verification status

### Transaction Data (Optional)
- First transaction timestamp
- Last transaction timestamp
- Total transaction count analyzed

### Label Cloud (v2 Pro - Optional)
- Aggregated labels from multiple sources
- Label frequency/confidence

## Automatic Categorization

Labels are automatically mapped to internal categories:

| Keywords | Category | Risk Level |
|----------|----------|------------|
| hack, exploit, attacker | hack | critical |
| phish | phishing | high |
| scam, fraud | scam | high |
| mixer, tornado | mixer | medium |
| sanction | sanctioned | critical |
| exchange, cex | exchange | low |
| dex, swap | dex | low |
| bridge | bridge | low |
| defi, protocol | defi-protocol | low |

## Rate Limiting

To respect Etherscan API rate limits:
- Default delay: 200ms between requests
- Configurable via `delayMs` option
- Recommended: 200-500ms for bulk imports

## Error Handling

The importer handles:
- Missing API keys
- Invalid addresses
- Rate limit errors
- Network timeouts
- Unsupported chains

## Example Output

### Single Address Import with Private Tags
```
================================================================================
IMPORTING LABELS FOR: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
================================================================================

Fetching labels for 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb from ETH_MAINNET...
✓ Found private tag: My Exchange Wallet
  Note: Main withdrawal address - monitor closely
✓ Retrieved label cloud data
✓ Found 2 Etherscan label(s):
  - Binance (exchange)
    → CEX
    → Hot Wallet
  - High Volume Trader (activity)
✓ Contract Name: Not a contract
✓ First transaction: 1/15/2022
✓ Last transaction: 12/14/2025
✓ Total transactions analyzed: 100

Auto-tagging address in forensics database...
✓ Address tagged successfully!

================================================================================
```

### Import All Private Tags
```
================================================================================
IMPORTING ALL PRIVATE TAGS FROM ETH_MAINNET
================================================================================

✓ Found 15 private name tag(s)

Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
  Tag: My Exchange Wallet
  Note: Main withdrawal address - monitor closely

Address: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
  Tag: USDC Contract
  Note: Primary stablecoin

Address: 0xdAC17F958D2ee523a2206206994597C13D831ec7
  Tag: Tether

...

================================================================================
IMPORT COMPLETE
================================================================================
Total private tags imported: 15
All addresses have been tagged in the forensics database.
================================================================================
```

## Troubleshooting

### "API key not found" Error
- Ensure `ETHERSCAN_API_KEY` is set in `.env`
- Check for typos in the key

### "No data found" Response
- Address may not have public labels
- Try different chains (e.g., check Polygonscan for Polygon addresses)

### Rate Limit Errors
- Increase `delayMs` to 500-1000ms
- Use chain-specific API keys for higher limits
- Consider upgrading to Etherscan Pro API

### Empty Labels
- Not all addresses have public labels
- Contract addresses more likely to have labels
- Check if address is active on the selected chain

### Private Tags Not Importing
- Verify your API key has access to private tags
- Log into Etherscan and check "My Name Tags" section
- Some API plans may not include private tag access
- Make sure you're using the correct chain (Etherscan vs Polygonscan, etc.)

## API Documentation

For detailed API documentation, visit:
- [Etherscan API Documentation](https://docs.etherscan.io/)
- [Etherscan Account APIs](https://docs.etherscan.io/api-endpoints/accounts)
