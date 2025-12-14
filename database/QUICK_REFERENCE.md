# SQL Quick Reference Card

## 🚀 Launch Database Browser

```bash
npm run db
```

## 📊 Most Common Queries

### 1. Find Address Tags

```sql
SELECT * FROM address_attributions
WHERE address LIKE '%0xYOUR_ADDRESS%';
```

### 2. View Recent Transactions

```sql
SELECT tx_hash, from_address, to_address, value, timestamp
FROM transactions
ORDER BY timestamp DESC
LIMIT 20;
```

### 3. High-Risk Addresses

```sql
SELECT address, label, risk_level, source
FROM address_attributions
WHERE risk_level IN ('critical', 'high')
ORDER BY date_added DESC;
```

### 4. Etherscan Imports (Public + Private)

```sql
SELECT address, label, description, source
FROM address_attributions
WHERE source LIKE '%Etherscan%'
ORDER BY date_added DESC;
```

### 5. Private Tags Only

```sql
SELECT address, label, description
FROM address_attributions
WHERE source = 'Etherscan Private Tag';
```

### 6. Address Transaction History

```sql
SELECT tx_hash, timestamp,
    CASE WHEN from_address = '0xYOUR_ADDRESS' THEN 'SENT' ELSE 'RECEIVED' END as type,
    CASE WHEN from_address = '0xYOUR_ADDRESS' THEN to_address ELSE from_address END as counterparty,
    value
FROM transactions
WHERE from_address = '0xYOUR_ADDRESS' OR to_address = '0xYOUR_ADDRESS'
ORDER BY timestamp ASC;
```

### 7. Most Active Addresses

```sql
SELECT address, COUNT(*) as tx_count
FROM (
    SELECT from_address as address FROM transactions
    UNION ALL
    SELECT to_address as address FROM transactions
)
GROUP BY address
ORDER BY tx_count DESC
LIMIT 50;
```

### 8. Transactions Between Two Addresses

```sql
SELECT * FROM transactions
WHERE from_address = '0xADDRESS_A' AND to_address = '0xADDRESS_B'
ORDER BY timestamp ASC;
```

### 9. Tagged Addresses Summary

```sql
SELECT category, risk_level, COUNT(*) as count
FROM address_attributions
GROUP BY category, risk_level
ORDER BY count DESC;
```

### 10. Find Addresses by Category

```sql
SELECT address, label, risk_level
FROM address_attributions
WHERE category = 'exchange'  -- or 'mixer', 'hack', 'scam', etc.
ORDER BY date_added DESC;
```

## 🎯 Forensic Analysis Queries

### Find Who Interacted with Flagged Address

```sql
SELECT DISTINCT t.to_address, aa.label, COUNT(*) as interactions
FROM transactions t
JOIN address_attributions aa ON t.from_address = aa.address
WHERE aa.risk_level = 'critical'
GROUP BY t.to_address, aa.label
ORDER BY interactions DESC;
```

### Transaction Timeline with Labels

```sql
SELECT
    t.tx_hash, t.timestamp,
    t.from_address, af.label as from_label,
    t.to_address, at.label as to_label,
    t.value
FROM transactions t
LEFT JOIN address_attributions af ON t.from_address = af.address
LEFT JOIN address_attributions at ON t.to_address = at.address
WHERE t.from_address = '0xYOUR_ADDRESS' OR t.to_address = '0xYOUR_ADDRESS'
ORDER BY t.timestamp ASC;
```

### Suspicious Pattern Detection

```sql
SELECT from_address, to_address, COUNT(*) as tx_count,
    MIN(timestamp) as first_tx, MAX(timestamp) as last_tx
FROM transactions
GROUP BY from_address, to_address
HAVING COUNT(*) >= 10
ORDER BY tx_count DESC
LIMIT 50;
```

## 📋 Table Inspection

### List All Tables

```sql
SELECT name FROM sqlite_master WHERE type='table';
```

### Row Counts

```sql
SELECT 'transactions' as table, COUNT(*) as rows FROM transactions
UNION ALL SELECT 'address_attributions', COUNT(*) FROM address_attributions
UNION ALL SELECT 'known_events', COUNT(*) FROM known_events
UNION ALL SELECT 'address_clusters', COUNT(*) FROM address_clusters;
```

### Table Schema

```sql
PRAGMA table_info(transactions);
```

## 💡 Tips

- Use `LIKE '%search%'` for partial matching
- Use `LIMIT 50` to avoid huge result sets
- Use `ORDER BY timestamp DESC` to see newest first
- Use `COUNT(DISTINCT address)` for unique addresses

## 🔧 Useful Commands (SQLite CLI)

```bash
.tables                    # List tables
.schema table_name         # Show table structure
.mode column              # Format output
.headers on               # Show headers
.output file.csv          # Export to CSV
.quit                     # Exit
```

## 🎨 Interactive Browser Menu

```
📊 Quick Statistics        → Table counts and overview
📋 Show Database Schema    → Table structures
🔍 Browse Table           → View any table
🔎 Search Addresses       → Find address data
⏰ Recent Activity        → Recent transactions/tags
🚨 Forensic Queries       → Pre-built analysis
💻 Custom SQL Query       → Execute any query
```

## 📚 More Resources

- Full documentation: `database/README.md`
- Complete queries: `database/USEFUL_QUERIES.sql`
- Quick start: `DATABASE_SETUP.md`
