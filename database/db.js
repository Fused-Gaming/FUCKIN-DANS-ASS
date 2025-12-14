// Database module for storing query results
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'alchemy-queries.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
function initializeDatabase() {
  // Queries table - stores basic query information
  db.exec(`
    CREATE TABLE IF NOT EXISTS queries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      chain_name TEXT NOT NULL,
      chain_type TEXT NOT NULL,
      wallet_address TEXT NOT NULL,
      rpc_url TEXT NOT NULL
    )
  `);

  // EVM Contracts table - stores deployed contracts for EVM chains
  db.exec(`
    CREATE TABLE IF NOT EXISTS evm_contracts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query_id INTEGER NOT NULL,
      contract_address TEXT NOT NULL,
      position INTEGER NOT NULL,
      FOREIGN KEY (query_id) REFERENCES queries(id) ON DELETE CASCADE
    )
  `);

  // Solana Accounts table - stores Solana wallet information
  db.exec(`
    CREATE TABLE IF NOT EXISTS solana_wallets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query_id INTEGER NOT NULL,
      sol_balance REAL,
      token_account_count INTEGER,
      FOREIGN KEY (query_id) REFERENCES queries(id) ON DELETE CASCADE
    )
  `);

  // Solana Token Accounts table - stores SPL token accounts
  db.exec(`
    CREATE TABLE IF NOT EXISTS solana_token_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query_id INTEGER NOT NULL,
      token_mint TEXT NOT NULL,
      token_amount REAL,
      token_decimals INTEGER,
      account_pubkey TEXT NOT NULL,
      FOREIGN KEY (query_id) REFERENCES queries(id) ON DELETE CASCADE
    )
  `);

  // Transaction History table - stores individual transactions for forensic analysis
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tx_hash TEXT NOT NULL UNIQUE,
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
    )
  `);

  // Address Attribution table - tag addresses with known entities/events
  db.exec(`
    CREATE TABLE IF NOT EXISTS address_attributions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      address TEXT NOT NULL,
      chain_type TEXT NOT NULL,
      label TEXT NOT NULL,
      category TEXT,
      risk_level TEXT,
      description TEXT,
      source TEXT,
      date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(address, chain_type, label)
    )
  `);

  // Known Events table - catalog of known hacks, exploits, fraud events
  db.exec(`
    CREATE TABLE IF NOT EXISTS known_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_name TEXT NOT NULL UNIQUE,
      event_type TEXT NOT NULL,
      event_date DATETIME,
      chain_name TEXT,
      description TEXT,
      estimated_loss TEXT,
      primary_address TEXT,
      reference_url TEXT,
      date_added DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Address Clusters table - group related addresses
  db.exec(`
    CREATE TABLE IF NOT EXISTS address_clusters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cluster_name TEXT NOT NULL,
      address TEXT NOT NULL,
      chain_type TEXT NOT NULL,
      confidence_score REAL,
      evidence TEXT,
      date_added DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_queries_timestamp ON queries(timestamp);
    CREATE INDEX IF NOT EXISTS idx_queries_wallet ON queries(wallet_address);
    CREATE INDEX IF NOT EXISTS idx_queries_chain ON queries(chain_name);
    CREATE INDEX IF NOT EXISTS idx_evm_query ON evm_contracts(query_id);
    CREATE INDEX IF NOT EXISTS idx_solana_query ON solana_wallets(query_id);
    CREATE INDEX IF NOT EXISTS idx_tx_hash ON transactions(tx_hash);
    CREATE INDEX IF NOT EXISTS idx_tx_from ON transactions(from_address);
    CREATE INDEX IF NOT EXISTS idx_tx_to ON transactions(to_address);
    CREATE INDEX IF NOT EXISTS idx_tx_timestamp ON transactions(timestamp);
    CREATE INDEX IF NOT EXISTS idx_attribution_address ON address_attributions(address);
    CREATE INDEX IF NOT EXISTS idx_cluster_name ON address_clusters(cluster_name);
  `);
}

// Save EVM query results
function saveEvmQuery(chainName, chainType, walletAddress, rpcUrl, contracts) {
  const insertQuery = db.prepare(`
    INSERT INTO queries (chain_name, chain_type, wallet_address, rpc_url)
    VALUES (?, ?, ?, ?)
  `);

  const insertContract = db.prepare(`
    INSERT INTO evm_contracts (query_id, contract_address, position)
    VALUES (?, ?, ?)
  `);

  const transaction = db.transaction((chainName, chainType, walletAddress, rpcUrl, contracts) => {
    const result = insertQuery.run(chainName, chainType, walletAddress, rpcUrl);
    const queryId = result.lastInsertRowid;

    contracts.forEach((contract, index) => {
      insertContract.run(queryId, contract, index + 1);
    });

    return queryId;
  });

  return transaction(chainName, chainType, walletAddress, rpcUrl, contracts);
}

// Save Solana query results
function saveSolanaQuery(chainName, chainType, walletAddress, rpcUrl, balance, tokenAccounts) {
  const insertQuery = db.prepare(`
    INSERT INTO queries (chain_name, chain_type, wallet_address, rpc_url)
    VALUES (?, ?, ?, ?)
  `);

  const insertWallet = db.prepare(`
    INSERT INTO solana_wallets (query_id, sol_balance, token_account_count)
    VALUES (?, ?, ?)
  `);

  const insertTokenAccount = db.prepare(`
    INSERT INTO solana_token_accounts (query_id, token_mint, token_amount, token_decimals, account_pubkey)
    VALUES (?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((chainName, chainType, walletAddress, rpcUrl, balance, tokenAccounts) => {
    const result = insertQuery.run(chainName, chainType, walletAddress, rpcUrl);
    const queryId = result.lastInsertRowid;

    insertWallet.run(queryId, balance, tokenAccounts.length);

    tokenAccounts.forEach((account) => {
      const tokenAmount = account.account?.data?.parsed?.info?.tokenAmount;
      const mint = account.account?.data?.parsed?.info?.mint;

      if (tokenAmount && mint) {
        insertTokenAccount.run(
          queryId,
          mint,
          tokenAmount.uiAmount || 0,
          tokenAmount.decimals || 0,
          account.pubkey
        );
      }
    });

    return queryId;
  });

  return transaction(chainName, chainType, walletAddress, rpcUrl, balance, tokenAccounts);
}

// Get query history
function getQueryHistory(limit = 50) {
  const stmt = db.prepare(`
    SELECT id, timestamp, chain_name, chain_type, wallet_address
    FROM queries
    ORDER BY timestamp DESC
    LIMIT ?
  `);

  return stmt.all(limit);
}

// Get EVM contracts for a specific query
function getEvmContractsForQuery(queryId) {
  const stmt = db.prepare(`
    SELECT contract_address, position
    FROM evm_contracts
    WHERE query_id = ?
    ORDER BY position
  `);

  return stmt.all(queryId);
}

// Get Solana wallet info for a specific query
function getSolanaWalletForQuery(queryId) {
  const walletStmt = db.prepare(`
    SELECT sol_balance, token_account_count
    FROM solana_wallets
    WHERE query_id = ?
  `);

  const tokenStmt = db.prepare(`
    SELECT token_mint, token_amount, token_decimals, account_pubkey
    FROM solana_token_accounts
    WHERE query_id = ?
  `);

  const wallet = walletStmt.get(queryId);
  const tokens = tokenStmt.all(queryId);

  return { wallet, tokens };
}

// Get statistics
function getStatistics() {
  const totalQueries = db.prepare('SELECT COUNT(*) as count FROM queries').get();
  const queryByChain = db.prepare(`
    SELECT chain_name, COUNT(*) as count
    FROM queries
    GROUP BY chain_name
    ORDER BY count DESC
  `).all();

  const queryByType = db.prepare(`
    SELECT chain_type, COUNT(*) as count
    FROM queries
    GROUP BY chain_type
  `).all();

  return {
    totalQueries: totalQueries.count,
    byChain: queryByChain,
    byType: queryByType
  };
}

// Get wallet query timeline (for graphing)
function getWalletTimeline(walletAddress) {
  const stmt = db.prepare(`
    SELECT
      q.id,
      q.timestamp,
      q.chain_name,
      q.chain_type,
      (SELECT COUNT(*) FROM evm_contracts WHERE query_id = q.id) as contract_count,
      sw.sol_balance,
      sw.token_account_count
    FROM queries q
    LEFT JOIN solana_wallets sw ON q.id = sw.query_id
    WHERE q.wallet_address = ?
    ORDER BY q.timestamp DESC
  `);

  return stmt.all(walletAddress);
}

// Initialize database on module load
initializeDatabase();

// Save transaction
function saveTransaction(txData) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO transactions (
      tx_hash, chain_name, block_number, timestamp, from_address, to_address,
      value, gas_used, gas_price, input_data, contract_address, status, method_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(
    txData.hash,
    txData.chainName,
    txData.blockNumber,
    txData.timestamp,
    txData.from,
    txData.to,
    txData.value,
    txData.gasUsed,
    txData.gasPrice,
    txData.input,
    txData.contractAddress,
    txData.status,
    txData.methodId
  );
}

// Batch save transactions
function saveTransactionsBatch(transactions) {
  const transaction = db.transaction((txs) => {
    for (const tx of txs) {
      saveTransaction(tx);
    }
  });

  return transaction(transactions);
}

// Add address attribution
function addAddressAttribution(address, chainType, label, category, riskLevel, description, source) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO address_attributions (
      address, chain_type, label, category, risk_level, description, source
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(address, chainType, label, category, riskLevel, description, source);
}

// Get attributions for an address
function getAddressAttributions(address) {
  const stmt = db.prepare(`
    SELECT * FROM address_attributions WHERE address = ? ORDER BY date_added DESC
  `);
  return stmt.all(address);
}

// Add known event
function addKnownEvent(eventName, eventType, eventDate, chainName, description, estimatedLoss, primaryAddress, referenceUrl) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO known_events (
      event_name, event_type, event_date, chain_name, description, estimated_loss, primary_address, reference_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(eventName, eventType, eventDate, chainName, description, estimatedLoss, primaryAddress, referenceUrl);
}

// Get all known events
function getKnownEvents(limit = 100) {
  const stmt = db.prepare(`
    SELECT * FROM known_events ORDER BY event_date DESC LIMIT ?
  `);
  return stmt.all(limit);
}

// Get transactions for an address with optional time range
function getAddressTransactions(address, startDate = null, endDate = null) {
  let query = `
    SELECT * FROM transactions
    WHERE from_address = ? OR to_address = ?
  `;

  const params = [address, address];

  if (startDate) {
    query += ` AND timestamp >= ?`;
    params.push(startDate);
  }

  if (endDate) {
    query += ` AND timestamp <= ?`;
    params.push(endDate);
  }

  query += ` ORDER BY timestamp DESC`;

  const stmt = db.prepare(query);
  return stmt.all(...params);
}

// Add address to cluster
function addAddressToCluster(clusterName, address, chainType, confidenceScore, evidence) {
  const stmt = db.prepare(`
    INSERT INTO address_clusters (cluster_name, address, chain_type, confidence_score, evidence)
    VALUES (?, ?, ?, ?, ?)
  `);

  return stmt.run(clusterName, address, chainType, confidenceScore, evidence);
}

// Get cluster addresses
function getClusterAddresses(clusterName) {
  const stmt = db.prepare(`
    SELECT * FROM address_clusters WHERE cluster_name = ? ORDER BY confidence_score DESC
  `);
  return stmt.all(clusterName);
}

// Get all unique clusters
function getAllClusters() {
  const stmt = db.prepare(`
    SELECT DISTINCT cluster_name, COUNT(*) as address_count
    FROM address_clusters
    GROUP BY cluster_name
    ORDER BY address_count DESC
  `);
  return stmt.all();
}

// Forensic analysis: Find transaction flow between addresses
function getTransactionFlow(fromAddress, toAddress) {
  const stmt = db.prepare(`
    SELECT * FROM transactions
    WHERE from_address = ? AND to_address = ?
    ORDER BY timestamp ASC
  `);
  return stmt.all(fromAddress, toAddress);
}

// Get transaction timeline for forensic report
function getForensicTimeline(addresses, startDate = null, endDate = null) {
  const placeholders = addresses.map(() => '?').join(',');
  let query = `
    SELECT t.*,
           af.label as from_label,
           at.label as to_label
    FROM transactions t
    LEFT JOIN address_attributions af ON t.from_address = af.address
    LEFT JOIN address_attributions at ON t.to_address = at.address
    WHERE (t.from_address IN (${placeholders}) OR t.to_address IN (${placeholders}))
  `;

  const params = [...addresses, ...addresses];

  if (startDate) {
    query += ` AND t.timestamp >= ?`;
    params.push(startDate);
  }

  if (endDate) {
    query += ` AND t.timestamp <= ?`;
    params.push(endDate);
  }

  query += ` ORDER BY t.timestamp ASC`;

  const stmt = db.prepare(query);
  return stmt.all(...params);
}

module.exports = {
  db,
  saveEvmQuery,
  saveSolanaQuery,
  getQueryHistory,
  getEvmContractsForQuery,
  getSolanaWalletForQuery,
  getStatistics,
  getWalletTimeline,
  saveTransaction,
  saveTransactionsBatch,
  addAddressAttribution,
  getAddressAttributions,
  addKnownEvent,
  getKnownEvents,
  getAddressTransactions,
  addAddressToCluster,
  getClusterAddresses,
  getAllClusters,
  getTransactionFlow,
  getForensicTimeline
};
