# Private Name Tags Feature

## Overview

The Etherscan label importer now supports importing **private name tags** that you've saved to your Etherscan account. This allows you to bring your personal address labels and notes into the forensics toolkit.

## What Are Private Name Tags?

Private name tags are custom labels you create on Etherscan for addresses you want to track. Unlike public labels, these are:
- **Personal to your account** - Only you can see them
- **Editable** - You can update them anytime on Etherscan
- **Include notes** - Add detailed descriptions/reminders
- **Cross-chain** - Available on all Etherscan network explorers

## Features

### 1. Import Private Tags for Individual Addresses

When importing any address, the tool will automatically check if you have a private tag saved for it:

```javascript
await importAddressLabels(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  'ETH_MAINNET',
  {
    includePrivateTags: true  // Default: true
  }
);
```

### 2. Bulk Import All Private Tags

Import all private tags from your Etherscan account in one operation:

```javascript
await importAllPrivateTags('ETH_MAINNET', {
  autoTag: true  // Automatically tag in forensics database
});
```

## Use Cases

### Personal Investigation Tracking
Keep track of addresses you're investigating:
- "Suspect Wallet A - Main address"
- "Victim Exchange Address"
- "Money Laundering Intermediary #3"

### Compliance & Monitoring
Label addresses for ongoing monitoring:
- "High Risk Customer - Enhanced DD Required"
- "VIP Client - Whale Wallet"
- "Sanctioned Entity - DO NOT PROCESS"

### Team Collaboration
Share investigation context:
- "Case #12345 - Primary Suspect"
- "Related to Operation XYZ"
- "Flagged by AML Team on 2025-01-15"

### Contract & Protocol Tracking
Label important contracts:
- "Our DEX Router v2"
- "Competitor Protocol"
- "Critical Infrastructure Contract"

## How to Use

### Via CLI

1. Run forensics tool:
   ```bash
   npm run forensics
   ```

2. Select "Import Labels from Etherscan"

3. Choose one of:
   - **Single Address** - Will include private tag if available
   - **Multiple Addresses** - Will check each for private tags
   - **Import from File** - Checks all addresses
   - **Import All Private Tags from Account** - Batch import all private tags

4. Confirm "Include private name tags?" (default: Yes)

### Programmatic Usage

```javascript
const {
  importAddressLabels,
  importAllPrivateTags
} = require('./forensics/etherscan-label-importer');

// Import single address with private tag
const result = await importAddressLabels(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  'ETH_MAINNET',
  { includePrivateTags: true }
);

if (result.privateTag) {
  console.log(`Private tag: ${result.privateTag}`);
  console.log(`Note: ${result.privateNote}`);
}

// Import all private tags
const allTags = await importAllPrivateTags('ETH_MAINNET');
console.log(`Imported ${allTags.count} private tags`);
```

## Data Structure

Private tags include:
- **Tag**: The label text
- **Note**: Optional description/reminder
- **Timestamp**: When the tag was created (if available)
- **Address**: The Ethereum address

Example result:
```javascript
{
  address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  privateTag: "My Exchange Wallet",
  privateNote: "Main withdrawal address - monitor for large outflows",
  labels: [
    {
      label: "My Exchange Wallet",
      source: "Etherscan Private Tag",
      category: "exchange",
      riskLevel: "info",
      note: "Main withdrawal address - monitor for large outflows"
    }
  ]
}
```

## Requirements

### API Key Access

Your Etherscan API key must have access to private tags:
1. Log into your Etherscan account
2. Go to "My Name Tags" section
3. Verify you can see your private tags
4. Use the API key from "API-KEYs" section

**Note**: Some free API tiers may not include private tag access. Check your plan at [https://etherscan.io/myapikey](https://etherscan.io/myapikey)

### Supported Chains

Private tags work on all supported Etherscan network explorers:
- Ethereum (etherscan.io)
- Polygon (polygonscan.com)
- Arbitrum (arbiscan.io)
- Optimism (optimistic.etherscan.io)
- Base (basescan.org)
- BSC (bscscan.com)
- Avalanche (snowtrace.io)

## Security & Privacy

### Data Handling
- Private tags are fetched directly from Etherscan API
- Never shared or sent to third parties
- Stored locally in your forensics database
- Notes and descriptions preserved exactly as entered

### API Key Security
- Keep your API key secret
- Don't commit `.env` file to version control
- Rotate keys regularly
- Use chain-specific keys for better control

### Access Control
- Private tags are only accessible with your API key
- Other team members need their own Etherscan accounts
- Consider using shared tags for team collaboration

## Best Practices

### 1. Consistent Naming
Use a consistent format for tags:
- `[Category] Description` - e.g., "Exchange - Binance Hot Wallet"
- `Case# - Role` - e.g., "CASE-001 - Suspect Primary"
- `Project: Entity` - e.g., "DeFi Protocol: Uniswap V3 Router"

### 2. Detailed Notes
Include context in notes field:
- Investigation date
- Reference links
- Risk factors
- Action items

### 3. Regular Updates
- Review and update tags periodically
- Archive old investigation tags
- Keep critical tags current

### 4. Sync with Forensics DB
- Run bulk import regularly to sync changes
- Auto-tag to keep forensics database updated
- Review imported tags for accuracy

## Workflow Example

### Forensic Investigation Workflow

1. **Initial Discovery**
   - Find suspicious address on blockchain
   - Add private tag on Etherscan: "Case-2025-001 - Suspect"
   - Add note: "Connected to phishing campaign, first seen 2025-01-10"

2. **Import to Forensics**
   ```bash
   npm run forensics
   # Select: Import Labels from Etherscan > Single Address
   # Enter address, enable private tags
   ```

3. **Analyze with Context**
   - Private tag appears in timeline analysis
   - Notes included in reputation reports
   - Exported in forensic reports

4. **Track Related Addresses**
   - Discover connected addresses
   - Tag each on Etherscan with case reference
   - Bulk import: "Import All Private Tags from Account"

5. **Generate Report**
   - Create forensic report
   - Private tags included automatically
   - Notes provide investigation context

## Troubleshooting

### No Private Tags Found

**Problem**: "No private name tags found in your Etherscan account"

**Solutions**:
1. Verify you have tags saved on Etherscan
2. Check correct chain (Ethereum vs Polygon, etc.)
3. Confirm API key has private tag access
4. Try web interface: etherscan.io > My Name Tags

### API Key Permission Issues

**Problem**: Private tags not returning even though they exist

**Solutions**:
1. Generate new API key from Etherscan dashboard
2. Verify API plan includes private tag access
3. Check for API rate limit issues
4. Ensure API key is in `.env` file

### Tags Not Auto-Importing

**Problem**: Public labels import but private tags don't

**Solutions**:
1. Ensure `includePrivateTags: true` in options
2. Check API response for errors
3. Verify address format (checksummed)
4. Try direct endpoint test

## API Endpoints Reference

### Get Private Tag for Address
```
GET https://api.etherscan.io/api?module=account&action=addresstagnote&address={ADDRESS}&apikey={API_KEY}
```

### Get All Private Tags
```
GET https://api.etherscan.io/api?module=account&action=addresstaglist&apikey={API_KEY}
```

## Future Enhancements

Planned features:
- [ ] Two-way sync (update Etherscan from forensics DB)
- [ ] Private tag analytics (most tagged categories)
- [ ] Tag template library
- [ ] Export private tags to CSV
- [ ] Search/filter by private tags
- [ ] Tag version history

## Support

For issues or questions:
- Check [ETHERSCAN_API_V2_GUIDE.md](./ETHERSCAN_API_V2_GUIDE.md)
- Review Etherscan API docs: https://docs.etherscan.io/
- File issue on GitHub

## Related Documentation

- [ETHERSCAN_API_V2_GUIDE.md](./ETHERSCAN_API_V2_GUIDE.md) - Complete API v2 documentation
- [README.md](../README.md) - Main forensics toolkit documentation
