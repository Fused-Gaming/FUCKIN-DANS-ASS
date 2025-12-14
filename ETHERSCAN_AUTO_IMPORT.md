# Etherscan Auto-Import Feature

## Overview

The forensics toolkit now automatically imports Etherscan labels (both public tags and private tags) for all addresses discovered during transaction collection. This ensures comprehensive address attribution data is captured alongside transaction history.

## How It Works

### Automatic Import During Transaction Collection

When you collect transaction history for an address using the forensics CLI:

1. **Transaction Collection**: The system fetches all transactions for the target address
2. **Address Extraction**: Extracts unique addresses from:
   - `from_address` fields
   - `to_address` fields
   - `contractAddress` fields (for contract deployments)
3. **Label Import**: Automatically queries Etherscan API v2 for each unique address to fetch:
   - **Public Labels**: Official Etherscan tags (exchanges, protocols, known entities)
   - **Private Name Tags**: Your personal address tags from your Etherscan account
   - **Private Notes**: Associated notes you've added to addresses
   - **Contract Information**: Verified contract names and details
   - **Label Cloud**: Multiple categorized labels (API v2 feature)

### What Gets Saved

All imported data is automatically saved to the `address_attributions` table in the database:

```sql
address_attributions:
  - address: The blockchain address
  - chain_type: 'evm' or 'solana'
  - label: The tag/label name
  - category: Auto-categorized (hack, exploit, exchange, etc.)
  - risk_level: Auto-assessed (critical, high, medium, low, info)
  - description: Combined info (label + note + contract info + first seen date)
  - source: Origin of the label:
    - 'Etherscan' (public tags)
    - 'Etherscan Private Tag' (your private tags)
    - 'Etherscan Contract' (verified contracts)
    - 'Etherscan (tag)' (API v2 labeled tags)
  - date_added: Timestamp of import
```

## Configuration

### Required Environment Variables

Add these to your `.env` file:

```bash
# Etherscan API Key (REQUIRED for auto-import)
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Optional: Chain-specific keys for better rate limits
ETH_MAINNET_ETHERSCAN_API_KEY=your_eth_key
POLYGON_MAINNET_ETHERSCAN_API_KEY=your_polygon_key
ARB_MAINNET_ETHERSCAN_API_KEY=your_arbitrum_key
OPT_MAINNET_ETHERSCAN_API_KEY=your_optimism_key
BASE_MAINNET_ETHERSCAN_API_KEY=your_base_key
BSC_MAINNET_ETHERSCAN_API_KEY=your_bsc_key
AVALANCHE_MAINNET_ETHERSCAN_API_KEY=your_avalanche_key
```

### Getting API Keys

1. **Etherscan API Key**:
   - Visit https://etherscan.io/apis
   - Sign up or log in
   - Navigate to API Keys section
   - Create a new API key

2. **Chain-Specific Keys**:
   - Polygon: https://polygonscan.com/apis
   - Arbitrum: https://arbiscan.io/apis
   - Optimism: https://optimistic.etherscan.io/apis
   - Base: https://basescan.org/apis
   - BSC: https://bscscan.com/apis
   - Avalanche: https://snowtrace.io/apis

## Usage Examples

### Example 1: Collect Transaction History with Auto-Import

```bash
npm run forensics
```

Select: `🔍 Collect Transaction History`

The system will:
1. Fetch all transactions for the address
2. Save transactions to database
3. **Automatically** extract all unique addresses from transactions
4. **Automatically** import Etherscan labels for each address
5. Display: `✓ Imported 15 labels from Etherscan`

### Example 2: Check Imported Data in Database

```bash
npm run db
```

Select: `🚨 Forensic Queries > Etherscan Imports (Public vs Private)`

This shows a summary of imported labels by type:
```
import_type | count | unique_addresses
------------|-------|------------------
Private     | 5     | 5
Public      | 10    | 8
```

### Example 3: Search for Tagged Addresses

```bash
npm run db
```

Select: `🔎 Search Addresses`

Enter any part of an address to see:
- All labels associated with that address
- Source of each label (Public vs Private)
- Risk levels and categories
- Notes from private tags

### Example 4: View Recent Imports

```bash
npm run db
```

Select: `⏰ Recent Activity > Recent Address Tags`

Shows the most recently imported address attributions with full details.

## Features

### 1. Silent Mode

When auto-importing during transaction collection, the importer runs in "silent mode" to avoid cluttering output:

```javascript
// Internal implementation
await importAddressLabels(address, chainName, {
  includePrivateTags: true,
  silent: true  // No verbose output
});
```

### 2. Rate Limiting

The system includes built-in rate limiting to respect Etherscan API limits:
- 200ms delay between address label requests
- Prevents API rate limit errors
- Continues on individual address failures

### 3. Error Handling

The auto-import is resilient:
- Continues if some addresses don't have labels
- Logs errors but doesn't fail the entire transaction collection
- Skips duplicate labels (database constraint handles uniqueness)

### 4. Multi-Label Support

Etherscan API v2 can return multiple labels per address:
- Primary label
- Sub-labels
- Label cloud with categorization
- All are imported and saved separately

## Manual Import Options

You can still manually import labels without collecting transactions:

### Import Single Address

```bash
npm run forensics
```

Select: `🌐 Import from Etherscan > Import Address Labels`

### Import Multiple Addresses

Select: `🌐 Import from Etherscan > Bulk Import Address Labels`

### Import All Your Private Tags

Select: `🌐 Import from Etherscan > Import All Private Tags from Account`

This fetches ALL private name tags from your Etherscan account at once.

## Database Queries

### Find All Etherscan Imports

```sql
SELECT * FROM address_attributions
WHERE source LIKE '%Etherscan%'
ORDER BY date_added DESC;
```

### Count Public vs Private Tags

```sql
SELECT
  CASE
    WHEN source = 'Etherscan Private Tag' THEN 'Private'
    WHEN source LIKE 'Etherscan%' THEN 'Public'
  END as type,
  COUNT(*) as count
FROM address_attributions
WHERE source LIKE '%Etherscan%'
GROUP BY type;
```

### Find High-Risk Tagged Addresses

```sql
SELECT address, label, risk_level, source, date_added
FROM address_attributions
WHERE risk_level IN ('critical', 'high')
  AND source LIKE '%Etherscan%'
ORDER BY risk_level, date_added DESC;
```

### Use Database Views

The system includes pre-built views:

```sql
-- View all Etherscan imports with type classification
SELECT * FROM v_etherscan_imports;

-- View high-risk addresses with transaction counts
SELECT * FROM v_high_risk_addresses;

-- View all tagged addresses with activity metrics
SELECT * FROM v_tagged_addresses_with_activity;
```

## Troubleshooting

### "Failed to fetch tag information"

**Cause**: Missing or invalid Etherscan API key

**Solution**:
1. Check `.env` file has `ETHERSCAN_API_KEY=...`
2. Verify the API key is valid on Etherscan
3. Ensure no extra spaces or quotes in the `.env` value

### "Rate limit exceeded"

**Cause**: Too many API requests in short time

**Solution**:
1. The system automatically adds 200ms delays
2. If using free tier, consider upgrading Etherscan API plan
3. Use chain-specific keys to increase rate limits

### "No labels imported"

**Cause**: Addresses might not have public tags or private tags

**Solution**:
- This is normal - most addresses don't have Etherscan tags
- Add your own private tags on Etherscan.io
- Known protocols, exchanges, and flagged addresses will have public tags

### Labels not showing in database

**Cause**: Auto-tag might be disabled or database connection issue

**Solution**:
1. Check that `autoTag: true` in import options
2. Verify database file exists: `database/alchemy-queries.db`
3. Run database integrity check: `sqlite3 database/alchemy-queries.db "PRAGMA integrity_check;"`

## Rate Limits

### Etherscan Free Tier
- 5 calls/second
- 100,000 calls/day

### Etherscan Standard Tier
- 10 calls/second
- Unlimited daily calls

### Our Implementation
- 200ms delay = ~5 calls/second (respects free tier)
- Silent mode reduces output overhead
- Batch operations with delay

## Best Practices

1. **Set up API keys before first use**: Ensures smooth operation
2. **Use chain-specific keys**: Better rate limits and performance
3. **Add private tags in Etherscan**: They'll auto-import during forensics
4. **Regular database backups**: `cp database/alchemy-queries.db database/backup.db`
5. **Check imported data**: Use `npm run db` to verify imports
6. **Update investigation notes**: Link imported tags to active investigations

## Integration with Investigations

The auto-imported labels integrate seamlessly with the investigation system:

1. **Link Addresses to Cases**:
   ```bash
   npm run forensics
   Select: Investigation Management > Add Address to Investigation
   ```

2. **Generate Reports**:
   Auto-imported labels appear in investigation reports with full context

3. **Risk Assessment**:
   Labels with risk levels help prioritize investigation targets

## Technical Details

### Files Modified

- `forensics/transaction-fetcher.js`: Added `importLabelsForAddresses()` function
- `forensics/etherscan-label-importer.js`: Added `silent` option and `imported` count
- `database/sql-browser.js`: Added investigation stats and Etherscan import queries

### Functions

```javascript
// In transaction-fetcher.js
async function importLabelsForAddresses(transactions, chainName) {
  // Extracts unique addresses
  // Imports labels with 200ms delay
  // Reports import count
}

// In etherscan-label-importer.js
async function importAddressLabels(address, chain, options) {
  // options.silent: Suppress console output
  // options.includePrivateTags: Fetch private tags
  // options.autoTag: Save to database
  // Returns: { imported: count, labels: [...], ... }
}
```

### Database Schema

```sql
CREATE TABLE address_attributions (
  id INTEGER PRIMARY KEY,
  address TEXT NOT NULL,
  chain_type TEXT NOT NULL,
  label TEXT NOT NULL,
  category TEXT,
  risk_level TEXT,
  description TEXT,
  source TEXT,
  date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(address, chain_type, label)
);
```

The `UNIQUE` constraint prevents duplicate imports of the same label for an address.

## Future Enhancements

Potential improvements:
- [ ] Batch API calls for multiple addresses
- [ ] Cache Etherscan responses to reduce API calls
- [ ] Support for other block explorers (Blockchair, Blockchain.com)
- [ ] Automatic label refresh (update old tags)
- [ ] Label confidence scoring
- [ ] Community-sourced label databases

## Support

For issues or questions:
1. Check this documentation
2. Review `.env.example` for configuration
3. Check database with `npm run db`
4. Review API limits on Etherscan
5. Open an issue in the repository

## Summary

The Etherscan auto-import feature:
- ✅ Automatically imports labels during transaction collection
- ✅ Supports both public and private tags
- ✅ Includes contract information and notes
- ✅ Respects API rate limits
- ✅ Saves to database automatically
- ✅ Silent mode for clean output
- ✅ Error-resilient and robust
- ✅ Integrates with investigation system
- ✅ Queryable through database browser

This makes forensic investigations more efficient by ensuring all available attribution data is captured automatically.
