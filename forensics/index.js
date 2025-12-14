// Main forensics CLI tool
require('dotenv').config();
const prompts = require('prompts');
const { collectAddressHistory, traceFundFlow } = require('./transaction-fetcher');
const {
  tagAddress,
  bulkTagAddresses,
  generateReputationReport,
  registerEvent,
  listKnownEvents,
  createCluster,
  RISK_LEVELS,
  CATEGORIES
} = require('./attribution-manager');
const {
  displayTimeline,
  traceFundPath,
  detectSuspiciousPatterns
} = require('./timeline-analyzer');
const { exportAllFormats } = require('./report-exporter');

const SUPPORTED_CHAINS = [
  { title: 'Ethereum Mainnet', value: 'ETH_MAINNET_RPC', type: 'evm' },
  { title: 'Polygon Mainnet', value: 'POLYGON_MAINNET_RPC', type: 'evm' },
  { title: 'Arbitrum One', value: 'ARB_MAINNET_RPC', type: 'evm' },
  { title: 'Optimism Mainnet', value: 'OPT_MAINNET_RPC', type: 'evm' },
  { title: 'Base Mainnet', value: 'BASE_MAINNET_RPC', type: 'evm' }
];

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║   BLOCKCHAIN FORENSIC ANALYSIS SYSTEM            ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  const action = await prompts({
    type: 'select',
    name: 'value',
    message: 'Select forensic operation:',
    choices: [
      { title: '🔍 Collect Transaction History', value: 'collect' },
      { title: '📊 Analyze Timeline', value: 'timeline' },
      { title: '🏷️  Tag/Attribute Address', value: 'tag' },
      { title: '📋 Check Address Reputation', value: 'reputation' },
      { title: '🔗 Trace Fund Flow Path', value: 'trace' },
      { title: '⚠️  Detect Suspicious Patterns', value: 'patterns' },
      { title: '📁 Register Known Event', value: 'event' },
      { title: '📚 List Known Events', value: 'list-events' },
      { title: '📄 Generate Forensic Report', value: 'report' }
    ]
  });

  if (!action.value) {
    console.log('Operation cancelled');
    process.exit(0);
  }

  switch (action.value) {
    case 'collect':
      await collectHistory();
      break;
    case 'timeline':
      await analyzeTimeline();
      break;
    case 'tag':
      await tagAddressFlow();
      break;
    case 'reputation':
      await checkReputation();
      break;
    case 'trace':
      await traceFunds();
      break;
    case 'patterns':
      await detectPatterns();
      break;
    case 'event':
      await registerEventFlow();
      break;
    case 'list-events':
      listKnownEvents();
      break;
    case 'report':
      await generateReport();
      break;
  }
}

async function collectHistory() {
  const chain = await prompts({
    type: 'select',
    name: 'value',
    message: 'Select blockchain:',
    choices: SUPPORTED_CHAINS
  });

  if (!chain.value) return;

  const rpcUrl = process.env[chain.value];
  if (!rpcUrl) {
    console.error(`Error: ${chain.value} not configured in .env file`);
    return;
  }

  const chainName = SUPPORTED_CHAINS.find(c => c.value === chain.value).title;

  const address = await prompts({
    type: 'text',
    name: 'value',
    message: 'Enter address to investigate:',
    validate: addr => /^0x[a-fA-F0-9]{40}$/.test(addr) || 'Invalid Ethereum address'
  });

  if (!address.value) return;

  const maxCount = await prompts({
    type: 'number',
    name: 'value',
    message: 'Maximum transactions to fetch:',
    initial: 1000,
    min: 1,
    max: 10000
  });

  await collectAddressHistory(address.value, rpcUrl, chainName, {
    maxCount: maxCount.value || 1000
  });

  console.log('\nTransaction history collection complete!');
}

async function analyzeTimeline() {
  const addressInput = await prompts({
    type: 'text',
    name: 'value',
    message: 'Enter addresses to analyze (comma-separated):'
  });

  if (!addressInput.value) return;

  const addresses = addressInput.value.split(',').map(a => a.trim());

  displayTimeline(addresses);
}

async function tagAddressFlow() {
  const address = await prompts({
    type: 'text',
    name: 'value',
    message: 'Enter address to tag:',
    validate: addr => /^0x[a-fA-F0-9]{40}$/.test(addr) || 'Invalid address'
  });

  if (!address.value) return;

  const label = await prompts({
    type: 'text',
    name: 'value',
    message: 'Enter label/attribution:'
  });

  if (!label.value) return;

  const category = await prompts({
    type: 'select',
    name: 'value',
    message: 'Select category:',
    choices: Object.entries(CATEGORIES).map(([key, value]) => ({
      title: key,
      value
    }))
  });

  const riskLevel = await prompts({
    type: 'select',
    name: 'value',
    message: 'Select risk level:',
    choices: Object.entries(RISK_LEVELS).map(([key, value]) => ({
      title: key,
      value
    }))
  });

  const description = await prompts({
    type: 'text',
    name: 'value',
    message: 'Description (optional):',
    initial: ''
  });

  const source = await prompts({
    type: 'text',
    name: 'value',
    message: 'Source (optional):',
    initial: 'manual investigation'
  });

  tagAddress(address.value, 'evm', label.value, {
    category: category.value,
    riskLevel: riskLevel.value,
    description: description.value,
    source: source.value
  });

  console.log('\n✅ Address tagged successfully!');
}

async function checkReputation() {
  const address = await prompts({
    type: 'text',
    name: 'value',
    message: 'Enter address to check:',
    validate: addr => /^0x[a-fA-F0-9]{40}$/.test(addr) || 'Invalid address'
  });

  if (!address.value) return;

  generateReputationReport(address.value);
}

async function traceFunds() {
  const addressInput = await prompts({
    type: 'text',
    name: 'value',
    message: 'Enter address path to trace (comma-separated):\nExample: 0xAAA,0xBBB,0xCCC'
  });

  if (!addressInput.value) return;

  const addresses = addressInput.value.split(',').map(a => a.trim());

  if (addresses.length < 2) {
    console.log('Please provide at least 2 addresses to trace fund flow.');
    return;
  }

  traceFundPath(addresses);
}

async function detectPatterns() {
  const address = await prompts({
    type: 'text',
    name: 'value',
    message: 'Enter address to analyze:',
    validate: addr => /^0x[a-fA-F0-9]{40}$/.test(addr) || 'Invalid address'
  });

  if (!address.value) return;

  detectSuspiciousPatterns(address.value);
}

async function registerEventFlow() {
  const eventName = await prompts({
    type: 'text',
    name: 'value',
    message: 'Event name (e.g., "Ronin Bridge Hack 2022"):'
  });

  if (!eventName.value) return;

  const eventType = await prompts({
    type: 'select',
    name: 'value',
    message: 'Event type:',
    choices: [
      { title: 'Hack', value: 'hack' },
      { title: 'Exploit', value: 'exploit' },
      { title: 'Fraud', value: 'fraud' },
      { title: 'Scam', value: 'scam' },
      { title: 'Phishing', value: 'phishing' },
      { title: 'Rug Pull', value: 'rug-pull' }
    ]
  });

  const eventDate = await prompts({
    type: 'date',
    name: 'value',
    message: 'Event date:',
    initial: new Date()
  });

  const chain = await prompts({
    type: 'select',
    name: 'value',
    message: 'Primary chain:',
    choices: SUPPORTED_CHAINS
  });

  const chainName = chain.value ? SUPPORTED_CHAINS.find(c => c.value === chain.value).title : null;

  const description = await prompts({
    type: 'text',
    name: 'value',
    message: 'Description:'
  });

  const loss = await prompts({
    type: 'text',
    name: 'value',
    message: 'Estimated loss (optional):'
  });

  const primaryAddress = await prompts({
    type: 'text',
    name: 'value',
    message: 'Primary attacker/exploiter address (optional):'
  });

  const referenceUrl = await prompts({
    type: 'text',
    name: 'value',
    message: 'Reference URL (optional):'
  });

  registerEvent(eventName.value, {
    eventType: eventType.value,
    eventDate: eventDate.value ? eventDate.value.toISOString() : null,
    chainName,
    description: description.value,
    estimatedLoss: loss.value,
    primaryAddress: primaryAddress.value,
    referenceUrl: referenceUrl.value
  });

  console.log('\n✅ Event registered successfully!');
}

async function generateReport() {
  const addressInput = await prompts({
    type: 'text',
    name: 'value',
    message: 'Enter addresses for report (comma-separated):'
  });

  if (!addressInput.value) return;

  const addresses = addressInput.value.split(',').map(a => a.trim());

  const caseId = await prompts({
    type: 'text',
    name: 'value',
    message: 'Case ID:',
    initial: `CASE-${Date.now()}`
  });

  const title = await prompts({
    type: 'text',
    name: 'value',
    message: 'Report title:',
    initial: 'Blockchain Forensic Investigation Report'
  });

  const investigator = await prompts({
    type: 'text',
    name: 'value',
    message: 'Investigator name:',
    initial: 'Forensic Analyst'
  });

  const outputDir = './forensic-reports';

  console.log('\nGenerating comprehensive forensic report...');

  exportAllFormats(addresses, outputDir, {
    caseId: caseId.value,
    title: title.value,
    investigator: investigator.value
  });

  console.log('\n✅ Forensic report generation complete!');
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
