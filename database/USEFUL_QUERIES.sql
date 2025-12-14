-- ============================================================================
-- USEFUL SQL QUERIES FOR BLOCKCHAIN FORENSICS DATABASE
-- ============================================================================

-- ============================================================================
-- BASIC TABLE INSPECTION
-- ============================================================================

-- Show all tables in database
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;

-- Get row counts for all tables
SELECT
    'queries' as table_name, COUNT(*) as row_count FROM queries
UNION ALL SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL SELECT 'address_attributions', COUNT(*) FROM address_attributions
UNION ALL SELECT 'known_events', COUNT(*) FROM known_events
UNION ALL SELECT 'address_clusters', COUNT(*) FROM address_clusters
UNION ALL SELECT 'evm_contracts', COUNT(*) FROM evm_contracts
UNION ALL SELECT 'solana_wallets', COUNT(*) FROM solana_wallets;

-- ============================================================================
-- ADDRESS ATTRIBUTION QUERIES
-- ============================================================================

-- Find all tagged addresses with their labels
SELECT address, label, category, risk_level, source, date_added
FROM address_attributions
ORDER BY date_added DESC
LIMIT 50;

-- Search for specific address (replace ADDRESS with actual address)
SELECT * FROM address_attributions
WHERE address LIKE '%ADDRESS%';

-- Get addresses by risk level
SELECT risk_level, COUNT(*) as count
FROM address_attributions
GROUP BY risk_level
ORDER BY
    CASE risk_level
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
        ELSE 5
    END;

-- Find all high-risk addresses
SELECT address, label, category, description, source
FROM address_attributions
WHERE risk_level IN ('critical', 'high')
ORDER BY
    CASE risk_level WHEN 'critical' THEN 1 ELSE 2 END,
    date_added DESC;

-- Get addresses from Etherscan labels (public + private)
SELECT address, label, category, risk_level, description
FROM address_attributions
WHERE source LIKE '%Etherscan%'
ORDER BY date_added DESC;

-- Get only private Etherscan tags
SELECT address, label, description
FROM address_attributions
WHERE source = 'Etherscan Private Tag'
ORDER BY date_added DESC;

-- Count tags by category
SELECT category, COUNT(*) as tag_count, COUNT(DISTINCT address) as unique_addresses
FROM address_attributions
GROUP BY category
ORDER BY tag_count DESC;

-- Find addresses with multiple labels
SELECT address, COUNT(*) as label_count, GROUP_CONCAT(label, ', ') as labels
FROM address_attributions
GROUP BY address
HAVING COUNT(*) > 1
ORDER BY label_count DESC;

-- ============================================================================
-- TRANSACTION QUERIES
-- ============================================================================

-- Recent transactions (last 50)
SELECT tx_hash, chain_name, from_address, to_address, value, timestamp
FROM transactions
ORDER BY timestamp DESC
LIMIT 50;

-- Find transactions for specific address
SELECT * FROM transactions
WHERE from_address = 'ADDRESS' OR to_address = 'ADDRESS'
ORDER BY timestamp DESC;

-- Transaction flow between two addresses
SELECT * FROM transactions
WHERE from_address = 'ADDRESS_A' AND to_address = 'ADDRESS_B'
ORDER BY timestamp ASC;

-- Most active addresses (by transaction count)
SELECT
    address,
    SUM(sent_count) as total_sent,
    SUM(received_count) as total_received,
    SUM(sent_count + received_count) as total_txs
FROM (
    SELECT from_address as address, COUNT(*) as sent_count, 0 as received_count
    FROM transactions
    GROUP BY from_address
    UNION ALL
    SELECT to_address as address, 0 as sent_count, COUNT(*) as received_count
    FROM transactions
    GROUP BY to_address
)
GROUP BY address
ORDER BY total_txs DESC
LIMIT 50;

-- Transactions by chain
SELECT chain_name, COUNT(*) as tx_count
FROM transactions
GROUP BY chain_name
ORDER BY tx_count DESC;

-- Failed transactions
SELECT tx_hash, chain_name, from_address, to_address, timestamp
FROM transactions
WHERE status = 0
ORDER BY timestamp DESC
LIMIT 50;

-- Transactions with contract interactions
SELECT tx_hash, chain_name, from_address, contract_address, method_id, timestamp
FROM transactions
WHERE contract_address IS NOT NULL
ORDER BY timestamp DESC
LIMIT 50;

-- ============================================================================
-- FORENSIC ANALYSIS QUERIES
-- ============================================================================

-- Transaction timeline with labels (for forensic reports)
SELECT
    t.tx_hash,
    t.timestamp,
    t.from_address,
    af.label as from_label,
    t.to_address,
    at.label as to_label,
    t.value,
    t.chain_name
FROM transactions t
LEFT JOIN address_attributions af ON t.from_address = af.address
LEFT JOIN address_attributions at ON t.to_address = at.address
WHERE t.from_address IN ('ADDRESS1', 'ADDRESS2')
   OR t.to_address IN ('ADDRESS1', 'ADDRESS2')
ORDER BY t.timestamp ASC;

-- Find addresses that interacted with flagged addresses
SELECT DISTINCT
    t.to_address as address,
    aa.label as flagged_address_label,
    aa.risk_level,
    COUNT(*) as interaction_count,
    MIN(t.timestamp) as first_interaction,
    MAX(t.timestamp) as last_interaction
FROM transactions t
JOIN address_attributions aa ON t.from_address = aa.address
WHERE aa.risk_level IN ('critical', 'high')
GROUP BY t.to_address, aa.label, aa.risk_level
ORDER BY interaction_count DESC;

-- Identify potential money laundering patterns (many small transactions)
SELECT
    from_address,
    to_address,
    COUNT(*) as tx_count,
    AVG(CAST(value AS REAL)) as avg_value,
    MIN(timestamp) as first_tx,
    MAX(timestamp) as last_tx
FROM transactions
WHERE value IS NOT NULL AND CAST(value AS REAL) > 0
GROUP BY from_address, to_address
HAVING COUNT(*) >= 10 AND AVG(CAST(value AS REAL)) < 1000000000000000000
ORDER BY tx_count DESC
LIMIT 50;

-- Find addresses active during specific event timeframe
SELECT
    COALESCE(from_address, to_address) as address,
    COUNT(*) as tx_count,
    MIN(timestamp) as first_tx,
    MAX(timestamp) as last_tx
FROM (
    SELECT from_address, NULL as to_address, timestamp FROM transactions
    WHERE timestamp BETWEEN '2024-01-01' AND '2024-12-31'
    UNION ALL
    SELECT NULL, to_address, timestamp FROM transactions
    WHERE timestamp BETWEEN '2024-01-01' AND '2024-12-31'
)
WHERE address IS NOT NULL
GROUP BY address
ORDER BY tx_count DESC
LIMIT 100;

-- ============================================================================
-- CLUSTER ANALYSIS
-- ============================================================================

-- View all clusters
SELECT cluster_name, COUNT(*) as address_count, AVG(confidence_score) as avg_confidence
FROM address_clusters
GROUP BY cluster_name
ORDER BY address_count DESC;

-- Get addresses in specific cluster
SELECT address, confidence_score, evidence, date_added
FROM address_clusters
WHERE cluster_name = 'CLUSTER_NAME'
ORDER BY confidence_score DESC;

-- Find addresses in multiple clusters (potential overlap)
SELECT address, COUNT(DISTINCT cluster_name) as cluster_count, GROUP_CONCAT(cluster_name, ', ') as clusters
FROM address_clusters
GROUP BY address
HAVING COUNT(DISTINCT cluster_name) > 1;

-- ============================================================================
-- KNOWN EVENTS
-- ============================================================================

-- List all known security events
SELECT event_name, event_type, event_date, chain_name, estimated_loss
FROM known_events
ORDER BY event_date DESC;

-- Find events by type
SELECT * FROM known_events
WHERE event_type IN ('hack', 'exploit', 'fraud')
ORDER BY event_date DESC;

-- Events with associated addresses
SELECT ke.event_name, ke.event_date, ke.estimated_loss, ke.primary_address, aa.label
FROM known_events ke
LEFT JOIN address_attributions aa ON ke.primary_address = aa.address
WHERE ke.primary_address IS NOT NULL
ORDER BY ke.event_date DESC;

-- ============================================================================
-- QUERY HISTORY
-- ============================================================================

-- Recent queries
SELECT id, timestamp, chain_name, wallet_address
FROM queries
ORDER BY timestamp DESC
LIMIT 50;

-- Queries by chain
SELECT chain_name, COUNT(*) as query_count
FROM queries
GROUP BY chain_name
ORDER BY query_count DESC;

-- Most queried addresses
SELECT wallet_address, COUNT(*) as query_count, MAX(timestamp) as last_queried
FROM queries
GROUP BY wallet_address
ORDER BY query_count DESC
LIMIT 50;

-- ============================================================================
-- ADVANCED FORENSIC QUERIES
-- ============================================================================

-- Find common counterparties between addresses
SELECT
    t1.from_address as address1,
    t2.from_address as address2,
    t1.to_address as common_counterparty,
    COUNT(*) as shared_interactions
FROM transactions t1
JOIN transactions t2 ON t1.to_address = t2.to_address
WHERE t1.from_address < t2.from_address
GROUP BY t1.from_address, t2.from_address, t1.to_address
HAVING COUNT(*) >= 3
ORDER BY shared_interactions DESC
LIMIT 50;

-- Identify potential mixing services (high in/out diversity)
SELECT
    address,
    unique_senders,
    unique_receivers,
    total_received,
    total_sent
FROM (
    SELECT
        to_address as address,
        COUNT(DISTINCT from_address) as unique_senders,
        0 as unique_receivers,
        COUNT(*) as total_received,
        0 as total_sent
    FROM transactions
    GROUP BY to_address
) incoming
JOIN (
    SELECT
        from_address as address,
        0 as unique_senders,
        COUNT(DISTINCT to_address) as unique_receivers,
        0 as total_received,
        COUNT(*) as total_sent
    FROM transactions
    GROUP BY from_address
) outgoing USING(address)
WHERE unique_senders > 100 AND unique_receivers > 100
ORDER BY unique_senders + unique_receivers DESC
LIMIT 50;

-- Transaction velocity analysis (transactions per day)
SELECT
    DATE(timestamp) as date,
    COUNT(*) as tx_count,
    COUNT(DISTINCT from_address) as unique_senders,
    COUNT(DISTINCT to_address) as unique_receivers
FROM transactions
WHERE timestamp IS NOT NULL
GROUP BY DATE(timestamp)
ORDER BY date DESC
LIMIT 90;

-- Find addresses with similar transaction patterns (clustering)
SELECT
    t1.from_address as address1,
    t2.from_address as address2,
    COUNT(*) as similar_transactions,
    GROUP_CONCAT(DISTINCT t1.to_address) as common_destinations
FROM transactions t1
JOIN transactions t2
    ON t1.to_address = t2.to_address
    AND t1.from_address != t2.from_address
    AND ABS(CAST(strftime('%s', t1.timestamp) AS INTEGER) - CAST(strftime('%s', t2.timestamp) AS INTEGER)) < 3600
GROUP BY t1.from_address, t2.from_address
HAVING COUNT(*) >= 5
ORDER BY similar_transactions DESC
LIMIT 50;

-- ============================================================================
-- REPORTING QUERIES
-- ============================================================================

-- Generate address reputation summary
SELECT
    a.address,
    a.label,
    a.category,
    a.risk_level,
    a.source,
    a.description,
    COUNT(DISTINCT t.tx_hash) as total_transactions,
    MIN(t.timestamp) as first_seen,
    MAX(t.timestamp) as last_seen
FROM address_attributions a
LEFT JOIN transactions t ON (a.address = t.from_address OR a.address = t.to_address)
WHERE a.risk_level IN ('critical', 'high')
GROUP BY a.address, a.label, a.category, a.risk_level, a.source, a.description
ORDER BY a.risk_level, total_transactions DESC;

-- Weekly activity summary
SELECT
    strftime('%Y-%W', timestamp) as week,
    COUNT(*) as tx_count,
    COUNT(DISTINCT from_address) as unique_senders,
    COUNT(DISTINCT to_address) as unique_receivers,
    SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as failed_tx
FROM transactions
WHERE timestamp >= datetime('now', '-12 weeks')
GROUP BY strftime('%Y-%W', timestamp)
ORDER BY week DESC;

-- Chain usage statistics
SELECT
    chain_name,
    COUNT(*) as tx_count,
    COUNT(DISTINCT from_address) as unique_senders,
    COUNT(DISTINCT to_address) as unique_receivers,
    MIN(timestamp) as first_tx,
    MAX(timestamp) as last_tx
FROM transactions
GROUP BY chain_name
ORDER BY tx_count DESC;

-- ============================================================================
-- MAINTENANCE QUERIES
-- ============================================================================

-- Find duplicate transactions
SELECT tx_hash, COUNT(*) as count
FROM transactions
GROUP BY tx_hash
HAVING COUNT(*) > 1;

-- Clean up old queries (older than 6 months)
-- DELETE FROM queries WHERE timestamp < datetime('now', '-6 months');

-- Vacuum database (reclaim space after deletes)
-- VACUUM;

-- Analyze database (update statistics for query optimization)
-- ANALYZE;

-- Check database integrity
-- PRAGMA integrity_check;

-- Get database file size
-- PRAGMA page_count;
-- PRAGMA page_size;
