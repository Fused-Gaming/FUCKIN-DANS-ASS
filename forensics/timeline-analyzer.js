// Forensic timeline analysis tool
const {
  getForensicTimeline,
  getAddressTransactions,
  getTransactionFlow,
  getAddressAttributions
} = require('../database/db');

/**
 * Analyze transaction timeline for a set of addresses
 */
function analyzeTimeline(addresses, options = {}) {
  const {
    startDate = null,
    endDate = null,
    includeAttributions = true
  } = options;

  console.log(`\nAnalyzing timeline for ${addresses.length} address(es)...`);

  if (startDate) console.log(`Start Date: ${startDate}`);
  if (endDate) console.log(`End Date: ${endDate}`);

  const timeline = getForensicTimeline(addresses, startDate, endDate);

  if (timeline.length === 0) {
    console.log('No transactions found in database for the specified addresses and time range.');
    return [];
  }

  console.log(`Found ${timeline.length} transactions.\n`);

  // Group by date for analysis
  const byDate = {};
  const addressStats = {};

  timeline.forEach(tx => {
    const date = tx.timestamp ? tx.timestamp.split('T')[0] : 'unknown';

    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(tx);

    // Track per-address stats
    if (!addressStats[tx.from_address]) {
      addressStats[tx.from_address] = { sent: 0, received: 0, totalValue: 0 };
    }
    if (!addressStats[tx.to_address]) {
      addressStats[tx.to_address] = { sent: 0, received: 0, totalValue: 0 };
    }

    addressStats[tx.from_address].sent++;
    addressStats[tx.to_address].received++;

    const value = parseFloat(tx.value) || 0;
    addressStats[tx.from_address].totalValue += value;
  });

  return {
    timeline,
    byDate,
    addressStats,
    totalTransactions: timeline.length,
    dateRange: {
      earliest: timeline[0]?.timestamp,
      latest: timeline[timeline.length - 1]?.timestamp
    }
  };
}

/**
 * Display timeline in chronological order with attribution context
 */
function displayTimeline(addresses, options = {}) {
  const analysis = analyzeTimeline(addresses, options);

  if (analysis.length === 0) return;

  const { timeline, byDate, addressStats, totalTransactions, dateRange } = analysis;

  console.log(`\n${'='.repeat(100)}`);
  console.log(`FORENSIC TIMELINE ANALYSIS`);
  console.log(`${'='.repeat(100)}`);

  console.log(`\nTotal Transactions: ${totalTransactions}`);
  console.log(`Date Range: ${dateRange.earliest || 'N/A'} to ${dateRange.latest || 'N/A'}`);

  console.log(`\nAddress Activity Summary:`);
  Object.entries(addressStats).forEach(([addr, stats]) => {
    console.log(`  ${addr}`);
    console.log(`    Sent: ${stats.sent} | Received: ${stats.received}`);

    // Show attributions if any
    const attributions = getAddressAttributions(addr);
    if (attributions.length > 0) {
      console.log(`    FLAGGED: ${attributions.map(a => a.label).join(', ')}`);
    }
  });

  console.log(`\n${'='.repeat(100)}`);
  console.log(`CHRONOLOGICAL TRANSACTION LOG`);
  console.log(`${'='.repeat(100)}`);

  // Display by date
  Object.keys(byDate).sort().forEach(date => {
    const txs = byDate[date];
    console.log(`\n[${date}] - ${txs.length} transaction(s)`);

    txs.forEach((tx, i) => {
      const time = tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString() : 'N/A';
      console.log(`\n  ${i + 1}. [${time}] TX: ${tx.tx_hash.substring(0, 16)}...`);
      console.log(`     From: ${tx.from_address}${tx.from_label ? ` [${tx.from_label}]` : ''}`);
      console.log(`     To: ${tx.to_address || 'CONTRACT CREATION'}${tx.to_label ? ` [${tx.to_label}]` : ''}`);
      console.log(`     Value: ${tx.value} wei`);
      console.log(`     Chain: ${tx.chain_name}`);
      console.log(`     Block: ${tx.block_number}`);

      if (tx.method_id) {
        console.log(`     Method: ${tx.method_id}`);
      }

      if (tx.contract_address) {
        console.log(`     Contract: ${tx.contract_address}`);
      }

      console.log(`     Status: ${tx.status === 1 ? 'SUCCESS' : 'FAILED'}`);
    });
  });

  console.log(`\n${'='.repeat(100)}`);

  return analysis;
}

/**
 * Trace fund flow between multiple addresses
 */
function traceFundPath(addressChain) {
  console.log(`\nTracing fund flow through ${addressChain.length} addresses...`);

  const flows = [];

  for (let i = 0; i < addressChain.length - 1; i++) {
    const from = addressChain[i];
    const to = addressChain[i + 1];

    const transactions = getTransactionFlow(from, to);

    if (transactions.length > 0) {
      flows.push({
        from,
        to,
        transactions,
        count: transactions.length
      });
    }
  }

  console.log(`\n${'='.repeat(100)}`);
  console.log(`FUND FLOW PATH ANALYSIS`);
  console.log(`${'='.repeat(100)}`);

  if (flows.length === 0) {
    console.log('\nNo direct fund flows found between the specified addresses.');
    return flows;
  }

  flows.forEach((flow, i) => {
    console.log(`\n${i + 1}. ${flow.from} → ${flow.to}`);
    console.log(`   Direct Transactions: ${flow.count}`);

    let totalValue = 0;
    flow.transactions.forEach(tx => {
      totalValue += parseFloat(tx.value) || 0;
      const date = tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : 'Unknown';
      console.log(`   - ${date}: ${tx.value} wei (TX: ${tx.tx_hash.substring(0, 16)}...)`);
    });

    console.log(`   Total Value: ${totalValue} wei`);
  });

  console.log(`\n${'='.repeat(100)}`);

  return flows;
}

/**
 * Identify suspicious patterns in transaction history
 */
function detectSuspiciousPatterns(address, options = {}) {
  const { startDate = null, endDate = null } = options;

  console.log(`\nAnalyzing suspicious patterns for ${address}...`);

  const transactions = getAddressTransactions(address, startDate, endDate);

  if (transactions.length === 0) {
    console.log('No transactions found.');
    return {};
  }

  const patterns = {
    rapidTransfers: [],
    highValueTransactions: [],
    contractInteractions: [],
    failedTransactions: [],
    identicalValues: {}
  };

  // Detect rapid successive transfers (< 1 minute apart)
  for (let i = 1; i < transactions.length; i++) {
    const prev = transactions[i - 1];
    const curr = transactions[i];

    if (prev.timestamp && curr.timestamp) {
      const timeDiff = Math.abs(new Date(curr.timestamp) - new Date(prev.timestamp)) / 1000;

      if (timeDiff < 60) {
        patterns.rapidTransfers.push({
          tx1: prev.tx_hash,
          tx2: curr.tx_hash,
          timeDiff: `${timeDiff.toFixed(2)}s`
        });
      }
    }
  }

  // Detect high-value transactions (> 1 ETH = 1e18 wei)
  const highValueThreshold = '1000000000000000000';
  transactions.forEach(tx => {
    if (BigInt(tx.value || '0') > BigInt(highValueThreshold)) {
      patterns.highValueTransactions.push(tx);
    }
  });

  // Detect contract interactions
  transactions.forEach(tx => {
    if (tx.contract_address || (tx.input_data && tx.input_data.length > 10)) {
      patterns.contractInteractions.push(tx);
    }
  });

  // Detect failed transactions
  transactions.forEach(tx => {
    if (tx.status === 0) {
      patterns.failedTransactions.push(tx);
    }
  });

  // Detect identical value transfers (potential automated behavior)
  transactions.forEach(tx => {
    const value = tx.value || '0';
    if (value !== '0') {
      if (!patterns.identicalValues[value]) {
        patterns.identicalValues[value] = [];
      }
      patterns.identicalValues[value].push(tx);
    }
  });

  // Filter to only show repeated values
  Object.keys(patterns.identicalValues).forEach(value => {
    if (patterns.identicalValues[value].length < 3) {
      delete patterns.identicalValues[value];
    }
  });

  // Display results
  console.log(`\n${'='.repeat(100)}`);
  console.log(`SUSPICIOUS PATTERN DETECTION`);
  console.log(`${'='.repeat(100)}`);

  console.log(`\nRapid Transfers (< 1 min): ${patterns.rapidTransfers.length}`);
  if (patterns.rapidTransfers.length > 0) {
    patterns.rapidTransfers.slice(0, 5).forEach(p => {
      console.log(`  ${p.tx1.substring(0, 16)}... → ${p.tx2.substring(0, 16)}... (${p.timeDiff})`);
    });
    if (patterns.rapidTransfers.length > 5) {
      console.log(`  ... and ${patterns.rapidTransfers.length - 5} more`);
    }
  }

  console.log(`\nHigh-Value Transactions (> 1 ETH): ${patterns.highValueTransactions.length}`);
  if (patterns.highValueTransactions.length > 0) {
    patterns.highValueTransactions.slice(0, 5).forEach(tx => {
      const ethValue = (BigInt(tx.value) / BigInt(1e18)).toString();
      console.log(`  ${tx.tx_hash.substring(0, 16)}... - ${ethValue} ETH`);
    });
  }

  console.log(`\nContract Interactions: ${patterns.contractInteractions.length}`);

  console.log(`\nFailed Transactions: ${patterns.failedTransactions.length}`);

  const identicalValueCount = Object.keys(patterns.identicalValues).length;
  console.log(`\nIdentical Value Patterns: ${identicalValueCount}`);
  if (identicalValueCount > 0) {
    Object.entries(patterns.identicalValues).slice(0, 3).forEach(([value, txs]) => {
      console.log(`  ${value} wei - repeated ${txs.length} times`);
    });
  }

  console.log(`\n${'='.repeat(100)}`);

  return patterns;
}

module.exports = {
  analyzeTimeline,
  displayTimeline,
  traceFundPath,
  detectSuspiciousPatterns
};
