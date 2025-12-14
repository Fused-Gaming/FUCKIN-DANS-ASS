# Database Tools & SQL Browser

## Overview

The forensics toolkit uses SQLite (via better-sqlite3) to store all blockchain forensic data. This directory contains tools and utilities for browsing and querying the database.

## Database File

- **Location**: `k:\git\alchemy-api\database\alchemy-queries.db`
- **Type**: SQLite 3
- **Size**: Dynamic (grows with data)

## Quick Start

### 1. Interactive SQL Browser (Recommended)

Launch the interactive CLI browser:

```bash
npm run db
```

Features:
- 📊 Quick statistics and table summaries
- 📋 Browse any table with pagination
- 🔍 Search addresses across all tables
- ⏰ View recent activity (transactions, tags, etc.)
- 🚨 Pre-built forensic analysis queries
- 💻 Execute custom SQL queries
- 🎨 Color-coded output with proper formatting

### 2. VSCode SQLite Extension

We've configured VSCode to work seamlessly with the database:

1. **Install recommended extension**:
   - Open Command Palette (Ctrl+Shift+P)
   - Type "Extensions: Show Recommended Extensions"
   - Install "SQLite" by alexcvzz

2. **Open database**:
   - Right-click `database/alchemy-queries.db` in Explorer
   - Select "Open Database"
   - Browse tables in the SQLite Explorer panel

3. **Run queries**:
   - Create a `.sql` file or use [USEFUL_QUERIES.sql](./USEFUL_QUERIES.sql)
   - Right-click and select "Run Query"

### 3. Command Line SQLite

Direct SQLite CLI access:

```bash
sqlite3 database/alchemy-queries.db
```

Common commands:
```sql
.tables                    -- List all tables
.schema table_name         -- Show table structure
.mode column              -- Format output
.headers on               -- Show column headers
```

## Database Schema

### Core Tables

#### 1. **transactions**
Stores blockchain transaction history for forensic analysis.

```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY,
  tx_hash TEXT UNIQUE NOT NULL,
  chain_name TEXT NOT NULL,
  block_number INTEGER,
  timestamp DATETIME,
  from_address TEXT NOT NULL,
  to_address TEXT,
  value TEXT,
  gas_used TEXT,
  gas_price TEXT,
  input_data TEXT,
  contract_address TEXT,
  status INTEGER,
  method_id TEXT
);
```

**Key Indexes**: tx_hash, from_address, to_address, timestamp

#### 2. **address_attributions**
Labels and tags for addresses (includes Etherscan imports).

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

**Key Fields**:
- `risk_level`: critical, high, medium, low, info
- `category`: hack, exploit, scam, mixer, exchange, etc.
- `source`: Etherscan, Etherscan Private Tag, manual, etc.

#### 3. **known_events**
Catalog of security events (hacks, exploits, frauds).

```sql
CREATE TABLE known_events (
  id INTEGER PRIMARY KEY,
  event_name TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATETIME,
  chain_name TEXT,
  description TEXT,
  estimated_loss TEXT,
  primary_address TEXT,
  reference_url TEXT,
  date_added DATETIME
);
```

#### 4. **address_clusters**
Groups of related addresses.

```sql
CREATE TABLE address_clusters (
  id INTEGER PRIMARY KEY,
  cluster_name TEXT NOT NULL,
  address TEXT NOT NULL,
  chain_type TEXT NOT NULL,
  confidence_score REAL,
  evidence TEXT,
  date_added DATETIME
);
```

#### 5. **queries**
History of wallet/contract queries.

```sql
CREATE TABLE queries (
  id INTEGER PRIMARY KEY,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  chain_name TEXT NOT NULL,
  chain_type TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  rpc_url TEXT NOT NULL
);
```

## Common Use Cases

### 1. Check Recent Etherscan Imports

```bash
npm run db
# Select: Recent Activity > Recent Address Tags
```

Or SQL:
```sql
SELECT address, label, category, source, date_added
FROM address_attributions
WHERE source LIKE '%Etherscan%'
ORDER BY date_added DESC
LIMIT 20;
```

### 2. Find High-Risk Addresses

```bash
npm run db
# Select: Forensic Queries > High Risk Addresses
```

Or SQL:
```sql
SELECT address, label, category, risk_level, description
FROM address_attributions
WHERE risk_level IN ('critical', 'high')
ORDER BY date_added DESC;
```

### 3. Search for Specific Address

```bash
npm run db
# Select: Search Addresses
# Enter: 0x742d35...
```

Or SQL:
```sql
SELECT * FROM address_attributions
WHERE address LIKE '%0x742d35%';

SELECT * FROM transactions
WHERE from_address LIKE '%0x742d35%' OR to_address LIKE '%0x742d35%'
ORDER BY timestamp DESC;
```

### 4. Transaction Timeline for Address

```sql
SELECT
    tx_hash,
    timestamp,
    CASE
        WHEN from_address = 'YOUR_ADDRESS' THEN 'SENT'
        ELSE 'RECEIVED'
    END as direction,
    CASE
        WHEN from_address = 'YOUR_ADDRESS' THEN to_address
        ELSE from_address
    END as counterparty,
    value,
    chain_name
FROM transactions
WHERE from_address = 'YOUR_ADDRESS' OR to_address = 'YOUR_ADDRESS'
ORDER BY timestamp ASC;
```

### 5. Find Addresses Interacting with Tagged Entities

```sql
SELECT DISTINCT
    t.to_address as address,
    aa.label as interacted_with,
    aa.risk_level,
    COUNT(*) as interaction_count
FROM transactions t
JOIN address_attributions aa ON t.from_address = aa.address
WHERE aa.risk_level IN ('critical', 'high')
GROUP BY t.to_address, aa.label, aa.risk_level
ORDER BY interaction_count DESC;
```

## Useful Queries Reference

See [USEFUL_QUERIES.sql](./USEFUL_QUERIES.sql) for a comprehensive collection of queries including:

- Basic table inspection
- Address attribution searches
- Transaction analysis
- Forensic pattern detection
- Cluster analysis
- Reporting queries
- Maintenance operations

## SQL Browser Features

### Main Menu

1. **📊 Quick Statistics**
   - Table row counts
   - Database overview

2. **📋 Show Database Schema**
   - Table structures
   - Column definitions
   - Indexes

3. **🔍 Browse Table**
   - Select any table
   - Paginated results
   - Formatted output

4. **🔎 Search Addresses**
   - Partial address matching
   - Searches attributions and transactions
   - Shows all related data

5. **⏰ Recent Activity**
   - Recent transactions
   - Recent address tags
   - Recent queries
   - Recent events

6. **🚨 Forensic Queries**
   - High-risk addresses
   - Most active addresses
   - Risk level summary
   - Cluster analysis
   - Transaction volume
   - Tag summaries

7. **💻 Custom SQL Query**
   - Execute any SELECT query
   - Safety: Only SELECT queries allowed
   - Formatted results

## Tips & Tricks

### 1. Export Query Results

```bash
# From SQLite CLI
sqlite3 database/alchemy-queries.db
.mode csv
.output results.csv
SELECT * FROM address_attributions WHERE risk_level = 'critical';
.quit
```

### 2. Backup Database

```bash
# Simple copy
cp database/alchemy-queries.db database/alchemy-queries.backup.db

# Or use SQLite backup
sqlite3 database/alchemy-queries.db ".backup database/backup-$(date +%Y%m%d).db"
```

### 3. Optimize Database

```sql
-- Update statistics
ANALYZE;

-- Reclaim unused space
VACUUM;
```

### 4. Check Database Size

```bash
ls -lh database/alchemy-queries.db

# Or in SQL
SELECT page_count * page_size / 1024.0 / 1024.0 as size_mb
FROM pragma_page_count(), pragma_page_size();
```

### 5. Find Slow Queries

Add `EXPLAIN QUERY PLAN` before your query:

```sql
EXPLAIN QUERY PLAN
SELECT * FROM transactions WHERE from_address = '0x...';
```

## Performance Tips

1. **Use Indexes**: The database has indexes on commonly queried fields
2. **Limit Results**: Use `LIMIT` for large result sets
3. **Filter Early**: Put WHERE clauses before JOINs when possible
4. **Use EXPLAIN**: Check query plans for complex queries

## Troubleshooting

### Database Locked Error

SQLite allows one writer at a time. If you get "database is locked":
1. Close any other connections to the database
2. Check for background processes using the database
3. Wait a moment and retry

### Corrupted Database

```sql
-- Check integrity
PRAGMA integrity_check;

-- If corrupted, restore from backup
cp database/alchemy-queries.backup.db database/alchemy-queries.db
```

### Out of Memory

For very large result sets:
1. Use `LIMIT` to paginate
2. Export to CSV instead of viewing in terminal
3. Filter data before selecting

## VSCode Extensions

Recommended extensions (automatically suggested):

1. **SQLite** (alexcvzz.vscode-sqlite)
   - Browse database visually
   - Execute queries inline
   - View table structures

2. **SQLTools** (mtxr.sqltools)
   - Database management
   - Query execution
   - Multiple connections

3. **SQLTools SQLite Driver** (mtxr.sqltools-driver-sqlite)
   - Driver for SQLTools
   - Enhanced SQLite support

## Programmatic Access

Use the database module in your code:

```javascript
const { db, getAddressAttributions } = require('./database/db');

// Raw query
const results = db.prepare('SELECT * FROM address_attributions WHERE risk_level = ?').all('critical');

// Use helper functions
const attributions = getAddressAttributions('0x742d35...');
```

## Integration with Forensics Tools

All forensics operations automatically save to the database:

- ✅ Transaction collection → `transactions` table
- ✅ Address tagging → `address_attributions` table
- ✅ Event registration → `known_events` table
- ✅ Cluster creation → `address_clusters` table
- ✅ Etherscan imports → `address_attributions` table

## Security Notes

- Database file contains sensitive investigation data
- Keep backups in secure location
- Don't commit `.db` files to version control
- Consider encrypting backups for long-term storage

## Further Reading

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
- [SQL Tutorial](https://www.sqlitetutorial.net/)
