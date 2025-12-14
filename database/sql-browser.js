// SQL Browser CLI - Interactive database viewer
const { db } = require('./db');
const prompts = require('prompts');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m'
};

function formatValue(value) {
  if (value === null) return `${colors.yellow}NULL${colors.reset}`;
  if (typeof value === 'number') return `${colors.cyan}${value}${colors.reset}`;
  if (typeof value === 'string' && value.startsWith('0x')) return `${colors.magenta}${value}${colors.reset}`;
  return value;
}

function printTable(rows, title = null) {
  if (rows.length === 0) {
    console.log(`${colors.yellow}No results found.${colors.reset}\n`);
    return;
  }

  if (title) {
    console.log(`\n${colors.bright}${colors.green}${title}${colors.reset}`);
    console.log('='.repeat(title.length));
  }

  const columns = Object.keys(rows[0]);
  const widths = {};

  // Calculate column widths
  columns.forEach(col => {
    widths[col] = Math.max(
      col.length,
      ...rows.map(row => String(row[col] || '').length)
    );
  });

  // Print header
  console.log('\n' + columns.map(col =>
    `${colors.bright}${col.padEnd(widths[col])}${colors.reset}`
  ).join(' | '));

  console.log(columns.map(col => '-'.repeat(widths[col])).join('-+-'));

  // Print rows
  rows.forEach(row => {
    console.log(columns.map(col =>
      String(formatValue(row[col]) || '').padEnd(widths[col] + 10) // Extra padding for ANSI codes
    ).join(' | '));
  });

  console.log(`\n${colors.cyan}Total: ${rows.length} row(s)${colors.reset}\n`);
}

async function showTableInfo() {
  const tables = db.prepare(`
    SELECT name, sql FROM sqlite_master
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all();

  console.log(`\n${colors.bright}${colors.green}DATABASE SCHEMA${colors.reset}`);
  console.log('='.repeat(50) + '\n');

  for (const table of tables) {
    console.log(`${colors.bright}${colors.blue}${table.name}${colors.reset}`);

    // Get row count
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
    console.log(`  Rows: ${colors.cyan}${count.count}${colors.reset}`);

    // Get columns
    const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
    console.log(`  Columns:`);
    columns.forEach(col => {
      const pk = col.pk ? `${colors.yellow} [PRIMARY KEY]${colors.reset}` : '';
      const notNull = col.notnull ? `${colors.red} NOT NULL${colors.reset}` : '';
      console.log(`    - ${colors.cyan}${col.name}${colors.reset} (${col.type})${pk}${notNull}`);
    });
    console.log('');
  }
}

async function quickStats() {
  console.log(`\n${colors.bright}${colors.green}DATABASE STATISTICS${colors.reset}`);
  console.log('='.repeat(50) + '\n');

  // Total records
  const stats = [
    { table: 'Queries', count: db.prepare('SELECT COUNT(*) as count FROM queries').get().count },
    { table: 'Transactions', count: db.prepare('SELECT COUNT(*) as count FROM transactions').get().count },
    { table: 'Address Attributions', count: db.prepare('SELECT COUNT(*) as count FROM address_attributions').get().count },
    { table: 'Known Events', count: db.prepare('SELECT COUNT(*) as count FROM known_events').get().count },
    { table: 'Address Clusters', count: db.prepare('SELECT COUNT(*) as count FROM address_clusters').get().count },
    { table: 'Investigations', count: db.prepare('SELECT COUNT(*) as count FROM investigations').get().count },
    { table: 'Investigation Addresses', count: db.prepare('SELECT COUNT(*) as count FROM investigation_addresses').get().count },
    { table: 'Investigation Evidence', count: db.prepare('SELECT COUNT(*) as count FROM investigation_evidence').get().count }
  ];

  stats.forEach(stat => {
    console.log(`${colors.bright}${stat.table}:${colors.reset} ${colors.cyan}${stat.count}${colors.reset}`);
  });

  console.log('');
}

async function browseTable() {
  const tables = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all();

  const choice = await prompts({
    type: 'select',
    name: 'table',
    message: 'Select table to browse:',
    choices: tables.map(t => ({ title: t.name, value: t.name }))
  });

  if (!choice.table) return;

  const limit = await prompts({
    type: 'number',
    name: 'value',
    message: 'Number of rows to display:',
    initial: 10,
    min: 1,
    max: 1000
  });

  const rows = db.prepare(`SELECT * FROM ${choice.table} LIMIT ?`).all(limit.value || 10);
  printTable(rows, `Table: ${choice.table}`);
}

async function searchAddresses() {
  const input = await prompts({
    type: 'text',
    name: 'address',
    message: 'Enter address to search (partial match):',
    validate: value => value.length > 3 || 'Enter at least 4 characters'
  });

  if (!input.address) return;

  console.log(`\n${colors.bright}${colors.green}SEARCH RESULTS FOR: ${input.address}${colors.reset}`);
  console.log('='.repeat(50));

  // Search in attributions
  const attributions = db.prepare(`
    SELECT * FROM address_attributions
    WHERE address LIKE ?
    ORDER BY date_added DESC
  `).all(`%${input.address}%`);

  if (attributions.length > 0) {
    printTable(attributions, 'Address Attributions');
  }

  // Search in transactions
  const transactions = db.prepare(`
    SELECT * FROM transactions
    WHERE from_address LIKE ? OR to_address LIKE ?
    ORDER BY timestamp DESC
    LIMIT 20
  `).all(`%${input.address}%`, `%${input.address}%`);

  if (transactions.length > 0) {
    printTable(transactions, 'Recent Transactions (max 20)');
  }

  if (attributions.length === 0 && transactions.length === 0) {
    console.log(`${colors.yellow}\nNo results found for "${input.address}"${colors.reset}\n`);
  }
}

async function recentActivity() {
  const choice = await prompts({
    type: 'select',
    name: 'type',
    message: 'Show recent:',
    choices: [
      { title: 'Recent Transactions', value: 'transactions' },
      { title: 'Recent Address Tags', value: 'attributions' },
      { title: 'Recent Queries', value: 'queries' },
      { title: 'Recent Events', value: 'events' }
    ]
  });

  if (!choice.type) return;

  const limit = await prompts({
    type: 'number',
    name: 'value',
    message: 'Number of records:',
    initial: 20,
    min: 1,
    max: 100
  });

  let rows, title;

  switch (choice.type) {
    case 'transactions':
      rows = db.prepare('SELECT * FROM transactions ORDER BY timestamp DESC LIMIT ?').all(limit.value);
      title = 'Recent Transactions';
      break;
    case 'attributions':
      rows = db.prepare('SELECT * FROM address_attributions ORDER BY date_added DESC LIMIT ?').all(limit.value);
      title = 'Recent Address Attributions';
      break;
    case 'queries':
      rows = db.prepare('SELECT * FROM queries ORDER BY timestamp DESC LIMIT ?').all(limit.value);
      title = 'Recent Queries';
      break;
    case 'events':
      rows = db.prepare('SELECT * FROM known_events ORDER BY event_date DESC LIMIT ?').all(limit.value);
      title = 'Recent Known Events';
      break;
  }

  if (rows) {
    printTable(rows, title);
  }
}

async function customQuery() {
  console.log(`\n${colors.yellow}Enter SQL query (or press Ctrl+C to cancel):${colors.reset}`);
  console.log(`${colors.cyan}Tip: Start with SELECT to avoid modifying data${colors.reset}\n`);

  const input = await prompts({
    type: 'text',
    name: 'query',
    message: 'SQL>',
    validate: value => {
      if (!value.trim()) return 'Query cannot be empty';
      if (!value.toLowerCase().trim().startsWith('select')) {
        return 'Only SELECT queries are allowed for safety';
      }
      return true;
    }
  });

  if (!input.query) return;

  try {
    const rows = db.prepare(input.query).all();
    printTable(rows, 'Query Results');
  } catch (error) {
    console.log(`${colors.red}Error: ${error.message}${colors.reset}\n`);
  }
}

async function forensicQueries() {
  const choice = await prompts({
    type: 'select',
    name: 'type',
    message: 'Select forensic query:',
    choices: [
      { title: 'High Risk Addresses', value: 'high_risk' },
      { title: 'Most Active Addresses', value: 'active' },
      { title: 'Addresses by Risk Level', value: 'risk_summary' },
      { title: 'Cluster Analysis', value: 'clusters' },
      { title: 'Transaction Volume by Address', value: 'volume' },
      { title: 'Tagged Addresses Summary', value: 'tags_summary' },
      { title: 'Active Investigations', value: 'investigations' },
      { title: 'Etherscan Imports (Public vs Private)', value: 'etherscan_imports' },
      { title: 'Database Views Summary', value: 'views' }
    ]
  });

  if (!choice.type) return;

  let rows, title;

  switch (choice.type) {
    case 'high_risk':
      rows = db.prepare(`
        SELECT address, label, category, risk_level, source, date_added
        FROM address_attributions
        WHERE risk_level IN ('critical', 'high')
        ORDER BY
          CASE risk_level
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
          END,
          date_added DESC
      `).all();
      title = 'High Risk Addresses';
      break;

    case 'active':
      rows = db.prepare(`
        SELECT
          COALESCE(from_address, to_address) as address,
          COUNT(*) as tx_count,
          MIN(timestamp) as first_seen,
          MAX(timestamp) as last_seen
        FROM (
          SELECT from_address, NULL as to_address, timestamp FROM transactions
          UNION ALL
          SELECT NULL as from_address, to_address, timestamp FROM transactions
        )
        WHERE address IS NOT NULL
        GROUP BY address
        ORDER BY tx_count DESC
        LIMIT 50
      `).all();
      title = 'Most Active Addresses (Top 50)';
      break;

    case 'risk_summary':
      rows = db.prepare(`
        SELECT risk_level, COUNT(*) as count, COUNT(DISTINCT address) as unique_addresses
        FROM address_attributions
        GROUP BY risk_level
        ORDER BY
          CASE risk_level
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
            WHEN 'info' THEN 5
          END
      `).all();
      title = 'Addresses by Risk Level';
      break;

    case 'clusters':
      rows = db.prepare(`
        SELECT cluster_name, COUNT(*) as address_count, AVG(confidence_score) as avg_confidence
        FROM address_clusters
        GROUP BY cluster_name
        ORDER BY address_count DESC
      `).all();
      title = 'Address Cluster Analysis';
      break;

    case 'volume':
      rows = db.prepare(`
        SELECT
          from_address as address,
          COUNT(*) as outgoing_tx,
          SUM(CAST(value AS REAL)) as total_value_sent
        FROM transactions
        WHERE from_address IS NOT NULL
        GROUP BY from_address
        ORDER BY outgoing_tx DESC
        LIMIT 50
      `).all();
      title = 'Transaction Volume by Address (Top 50)';
      break;

    case 'tags_summary':
      rows = db.prepare(`
        SELECT category, COUNT(*) as tag_count, COUNT(DISTINCT address) as unique_addresses
        FROM address_attributions
        GROUP BY category
        ORDER BY tag_count DESC
      `).all();
      title = 'Tagged Addresses Summary';
      break;

    case 'investigations':
      rows = db.prepare(`
        SELECT case_id, case_name, case_status, priority, investigator_name,
               date_created,
               (SELECT COUNT(*) FROM investigation_addresses WHERE investigation_id = investigations.id) as address_count,
               (SELECT COUNT(*) FROM investigation_evidence WHERE investigation_id = investigations.id) as evidence_count
        FROM investigations
        ORDER BY date_created DESC
      `).all();
      title = 'All Investigations';
      break;

    case 'etherscan_imports':
      rows = db.prepare(`
        SELECT
          CASE
            WHEN source = 'Etherscan Private Tag' THEN 'Private'
            WHEN source LIKE 'Etherscan%' THEN 'Public'
            ELSE 'Other'
          END as import_type,
          COUNT(*) as count,
          COUNT(DISTINCT address) as unique_addresses
        FROM address_attributions
        WHERE source LIKE '%Etherscan%'
        GROUP BY import_type
      `).all();
      title = 'Etherscan Imports Summary';
      break;

    case 'views':
      rows = db.prepare(`
        SELECT name, sql FROM sqlite_master
        WHERE type='view'
        ORDER BY name
      `).all();
      title = 'Database Views';
      break;
  }

  if (rows) {
    printTable(rows, title);
  }
}

async function main() {
  console.log(`\n${colors.bright}${colors.blue}╔═══════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}║        SQL DATABASE BROWSER                       ║${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}╚═══════════════════════════════════════════════════╝${colors.reset}\n`);

  while (true) {
    const action = await prompts({
      type: 'select',
      name: 'value',
      message: 'Select action:',
      choices: [
        { title: '📊 Quick Statistics', value: 'stats' },
        { title: '📋 Show Database Schema', value: 'schema' },
        { title: '🔍 Browse Table', value: 'browse' },
        { title: '🔎 Search Addresses', value: 'search' },
        { title: '⏰ Recent Activity', value: 'recent' },
        { title: '🚨 Forensic Queries', value: 'forensic' },
        { title: '💻 Custom SQL Query', value: 'custom' },
        { title: '🚪 Exit', value: 'exit' }
      ]
    });

    if (!action.value || action.value === 'exit') {
      console.log(`\n${colors.green}Goodbye!${colors.reset}\n`);
      process.exit(0);
    }

    switch (action.value) {
      case 'stats':
        await quickStats();
        break;
      case 'schema':
        await showTableInfo();
        break;
      case 'browse':
        await browseTable();
        break;
      case 'search':
        await searchAddresses();
        break;
      case 'recent':
        await recentActivity();
        break;
      case 'forensic':
        await forensicQueries();
        break;
      case 'custom':
        await customQuery();
        break;
    }
  }
}

main().catch(error => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});
