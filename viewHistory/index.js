// View query history and statistics from database
require('dotenv').config();
const prompts = require('prompts');
const {
  getQueryHistory,
  getEvmContractsForQuery,
  getSolanaWalletForQuery,
  getStatistics,
  getWalletTimeline
} = require('../database/db');

async function main() {
  const choice = await prompts({
    type: 'select',
    name: 'action',
    message: 'What would you like to view?',
    choices: [
      { title: 'Recent Query History', value: 'history' },
      { title: 'Statistics', value: 'stats' },
      { title: 'Wallet Timeline', value: 'timeline' },
      { title: 'View Specific Query', value: 'query' }
    ]
  });

  if (!choice.action) {
    console.log('Operation cancelled');
    process.exit(0);
  }

  switch (choice.action) {
    case 'history':
      await showHistory();
      break;
    case 'stats':
      await showStatistics();
      break;
    case 'timeline':
      await showWalletTimeline();
      break;
    case 'query':
      await showSpecificQuery();
      break;
  }
}

async function showHistory() {
  const limitResponse = await prompts({
    type: 'number',
    name: 'limit',
    message: 'How many recent queries to show?',
    initial: 20,
    min: 1,
    max: 1000
  });

  const limit = limitResponse.limit || 20;
  const history = getQueryHistory(limit);

  if (history.length === 0) {
    console.log('\nNo query history found.');
    return;
  }

  console.log(`\n${'='.repeat(100)}`);
  console.log(`Recent ${history.length} Queries:`);
  console.log(`${'='.repeat(100)}`);

  history.forEach((query) => {
    const date = new Date(query.timestamp);
    console.log(`\nID: ${query.id}`);
    console.log(`Timestamp: ${date.toLocaleString()}`);
    console.log(`Chain: ${query.chain_name} (${query.chain_type})`);
    console.log(`Wallet: ${query.wallet_address}`);
  });

  console.log(`\n${'='.repeat(100)}`);
}

async function showStatistics() {
  const stats = getStatistics();

  console.log(`\n${'='.repeat(80)}`);
  console.log('Query Statistics');
  console.log(`${'='.repeat(80)}`);
  console.log(`\nTotal Queries: ${stats.totalQueries}`);

  console.log('\nQueries by Chain Type:');
  stats.byType.forEach((item) => {
    console.log(`  ${item.chain_type.toUpperCase()}: ${item.count}`);
  });

  console.log('\nTop Chains Queried:');
  stats.byChain.slice(0, 10).forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.chain_name}: ${item.count}`);
  });

  console.log(`\n${'='.repeat(80)}`);
}

async function showWalletTimeline() {
  const addressResponse = await prompts({
    type: 'text',
    name: 'address',
    message: 'Enter wallet address to view timeline:'
  });

  if (!addressResponse.address) {
    console.log('Operation cancelled');
    return;
  }

  const timeline = getWalletTimeline(addressResponse.address);

  if (timeline.length === 0) {
    console.log(`\nNo queries found for wallet: ${addressResponse.address}`);
    return;
  }

  console.log(`\n${'='.repeat(100)}`);
  console.log(`Timeline for wallet: ${addressResponse.address}`);
  console.log(`${'='.repeat(100)}`);

  timeline.forEach((entry) => {
    const date = new Date(entry.timestamp);
    console.log(`\n[${date.toLocaleString()}] Query ID: ${entry.id}`);
    console.log(`Chain: ${entry.chain_name}`);

    if (entry.chain_type === 'evm') {
      console.log(`Contracts Found: ${entry.contract_count}`);
    } else if (entry.chain_type === 'solana') {
      console.log(`SOL Balance: ${entry.sol_balance ? entry.sol_balance.toFixed(9) : 'N/A'} SOL`);
      console.log(`Token Accounts: ${entry.token_account_count || 0}`);
    }
  });

  console.log(`\n${'='.repeat(100)}`);
}

async function showSpecificQuery() {
  const idResponse = await prompts({
    type: 'number',
    name: 'id',
    message: 'Enter query ID to view details:',
    min: 1
  });

  if (!idResponse.id) {
    console.log('Operation cancelled');
    return;
  }

  const queryId = idResponse.id;

  // First get the query basic info from history
  const history = getQueryHistory(10000);
  const query = history.find(q => q.id === queryId);

  if (!query) {
    console.log(`\nQuery ID ${queryId} not found.`);
    return;
  }

  const date = new Date(query.timestamp);
  console.log(`\n${'='.repeat(100)}`);
  console.log(`Query Details - ID: ${queryId}`);
  console.log(`${'='.repeat(100)}`);
  console.log(`Timestamp: ${date.toLocaleString()}`);
  console.log(`Chain: ${query.chain_name} (${query.chain_type})`);
  console.log(`Wallet: ${query.wallet_address}`);

  if (query.chain_type === 'evm') {
    const contracts = getEvmContractsForQuery(queryId);
    console.log(`\nContracts Found: ${contracts.length}`);

    if (contracts.length > 0) {
      console.log('\nContract Addresses:');
      contracts.forEach((contract) => {
        console.log(`  ${contract.position}. ${contract.contract_address}`);
      });
    }
  } else if (query.chain_type === 'solana') {
    const { wallet, tokens } = getSolanaWalletForQuery(queryId);

    if (wallet) {
      console.log(`\nSOL Balance: ${wallet.sol_balance.toFixed(9)} SOL`);
      console.log(`Token Accounts: ${wallet.token_account_count}`);
    }

    if (tokens && tokens.length > 0) {
      console.log('\nToken Details:');
      tokens.forEach((token, index) => {
        console.log(`\n  ${index + 1}. Token Mint: ${token.token_mint}`);
        console.log(`     Amount: ${token.token_amount} (Decimals: ${token.token_decimals})`);
        console.log(`     Account: ${token.account_pubkey}`);
      });
    }
  }

  console.log(`\n${'='.repeat(100)}`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
