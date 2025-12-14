# Database Setup Complete! 🎉

## Quick Access Methods

### Method 1: Interactive CLI Browser (Easiest)

```bash
npm run db
```

This launches a beautiful interactive SQL browser with:
- Color-coded output
- Pre-built forensic queries
- Address search
- Table browsing
- Custom query execution

### Method 2: VSCode SQLite Extension

1. Install recommended extension:
   - Press `Ctrl+Shift+P`
   - Type "Show Recommended Extensions"
   - Install "SQLite" by alexcvzz

2. Open database:
   - Right-click `database/alchemy-queries.db`
   - Select "Open Database"
   - Browse tables in SQLite Explorer

### Method 3: Command Line

```bash
sqlite3 database/alchemy-queries.db
```

## Database Location

📁 **File**: `k:\git\alchemy-api\database\alchemy-queries.db`

## Quick Examples

### Check Recent Etherscan Imports

```bash
npm run db
# Select: Recent Activity > Recent Address Tags
# Or: Search Addresses > enter address
```

### Find High-Risk Addresses

```bash
npm run db
# Select: Forensic Queries > High Risk Addresses
```

### View All Tables

```bash
npm run db
# Select: Show Database Schema
```

### Browse Specific Table

```bash
npm run db
# Select: Browse Table > select table > set limit
```

## Tables in Database

1. **transactions** - All blockchain transactions
2. **address_attributions** - Tagged addresses (Etherscan imports included)
3. **known_events** - Security events catalog
4. **address_clusters** - Related address groups
5. **queries** - Query history
6. **evm_contracts** - EVM contract deployments
7. **solana_wallets** - Solana wallet info

## Useful SQL Queries

See `database/USEFUL_QUERIES.sql` for 50+ ready-to-use queries including:
- Address searches
- Transaction analysis
- Forensic patterns
- Risk assessments
- Cluster analysis
- And more!

## Documentation

📚 **Complete Guide**: [database/README.md](./database/README.md)
📝 **SQL Queries**: [database/USEFUL_QUERIES.sql](./database/USEFUL_QUERIES.sql)

## Tips

✅ Use the CLI browser for quick lookups
✅ Use VSCode extension for visual exploration
✅ Use raw SQL for complex analysis
✅ Backup database regularly: `cp database/alchemy-queries.db database/backup.db`

## Next Steps

1. Try the interactive browser: `npm run db`
2. Install VSCode SQLite extension
3. Browse your forensics data!

Happy investigating! 🔍
