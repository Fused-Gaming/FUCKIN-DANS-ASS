// Main forensics CLI tool
require('dotenv').config();
const prompts = require('prompts');
const {
  collectAddressHistory,
  collectSolanaAddressHistory,
  traceFundFlow
} = require('./transaction-fetcher');
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
const {
  importAllIntelligence,
  exportIntelligence,
  validateIntelligenceFile
} = require('./intelligence-importer');
const {
  importAddressLabels,
  importBulkLabels,
  importLabelsFromFile,
  importAllPrivateTags,
  ETHERSCAN_ENDPOINTS
} = require('./etherscan-label-importer');
const {
  createInvestigation,
  getAllInvestigations,
  getInvestigation,
  updateInvestigation,
  addInvestigationAddress,
  getInvestigationAddresses,
  addInvestigationEvidence,
  addInvestigationTimelineEvent,
  closeInvestigation
} = require('../database/db');
const { generateInvestigationReport } = require('./investigation-reporter');

const SUPPORTED_CHAINS = [
  { title: 'Ethereum Mainnet', value: 'ETH_MAINNET_RPC', type: 'evm' },
  { title: 'Polygon Mainnet', value: 'POLYGON_MAINNET_RPC', type: 'evm' },
  { title: 'Arbitrum One', value: 'ARB_MAINNET_RPC', type: 'evm' },
  { title: 'Optimism Mainnet', value: 'OPT_MAINNET_RPC', type: 'evm' },
  { title: 'Base Mainnet', value: 'BASE_MAINNET_RPC', type: 'evm' },
  { title: 'Solana Mainnet', value: 'SOL_MAINNET_RPC', type: 'solana' },
  { title: 'Solana Devnet', value: 'SOL_DEVNET_RPC', type: 'solana' }
];

const CHAIN_TYPE_CHOICES = [
  { title: 'EVM (0x...)', value: 'evm' },
  { title: 'Solana (base58)', value: 'solana' }
];

function isEvmAddress(addr) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr || '');
}

function isSolanaAddress(addr) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr || '');
}

function addressValidatorFor(chainType) {
  return value => {
    if (chainType === 'solana') {
      return isSolanaAddress(value) || 'Invalid Solana address';
    }
    return isEvmAddress(value) || 'Invalid Ethereum address';
  };
}

function anyChainAddressValidator(value) {
  return (isEvmAddress(value) || isSolanaAddress(value)) || 'Invalid EVM/Solana address';
}

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
      { title: '📄 Generate Forensic Report', value: 'report' },
      { title: '📥 Import Threat Intelligence', value: 'import' },
      { title: '📤 Export Intelligence Database', value: 'export' },
      { title: '🏷️  Import Labels from Etherscan', value: 'etherscan-labels' },
      { title: '📋 Investigation Management', value: 'investigation' }
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
    case 'import':
      await importIntelligence();
      break;
    case 'export':
      await exportIntelligenceData();
      break;
    case 'etherscan-labels':
      await importEtherscanLabels();
      break;
    case 'investigation':
      await investigationMenu();
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

  const selectedChain = SUPPORTED_CHAINS.find(c => c.value === chain.value);
  const rpcUrl = process.env[chain.value];
  if (!rpcUrl) {
    console.error(`Error: ${chain.value} not configured in .env file`);
    return;
  }

  const chainName = selectedChain.title;

  const address = await prompts({
    type: 'text',
    name: 'value',
    message: 'Enter address to investigate:',
    validate: addressValidatorFor(selectedChain.type)
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

  const maxCountValue = maxCount.value || 1000;

  if (selectedChain.type === 'solana') {
    await collectSolanaAddressHistory(address.value, rpcUrl, chainName, {
      maxCount: maxCountValue
    });
  } else {
    await collectAddressHistory(address.value, rpcUrl, chainName, {
      maxCount: maxCountValue
    });
  }

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
  const chainType = await prompts({
    type: 'select',
    name: 'value',
    message: 'Select chain type:',
    choices: CHAIN_TYPE_CHOICES
  });

  if (!chainType.value) return;

  const address = await prompts({
    type: 'text',
    name: 'value',
    message: 'Enter address to tag:',
    validate: addressValidatorFor(chainType.value)
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

  tagAddress(address.value, chainType.value, label.value, {
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
    validate: anyChainAddressValidator
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
    validate: anyChainAddressValidator
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

async function importIntelligence() {
  console.log('\n📥 IMPORT THREAT INTELLIGENCE\n');

  const choice = await prompts({
    type: 'select',
    name: 'value',
    message: 'What would you like to import?',
    choices: [
      { title: 'Import All (Events + Addresses)', value: 'all' },
      { title: 'Import Events Only', value: 'events' },
      { title: 'Import Addresses Only', value: 'addresses' },
      { title: 'Import from Custom File', value: 'custom' }
    ]
  });

  if (!choice.value) return;

  if (choice.value === 'all') {
    importAllIntelligence();
  } else if (choice.value === 'custom') {
    const filePath = await prompts({
      type: 'text',
      name: 'value',
      message: 'Enter path to intelligence file:'
    });

    if (!filePath.value) return;

    const fileType = await prompts({
      type: 'select',
      name: 'value',
      message: 'File type:',
      choices: [
        { title: 'Events', value: 'events' },
        { title: 'Addresses', value: 'addresses' }
      ]
    });

    if (!fileType.value) return;

    const { importKnownEvents, importKnownAddresses } = require('./intelligence-importer');

    if (fileType.value === 'events') {
      importKnownEvents(filePath.value);
    } else {
      importKnownAddresses(filePath.value);
    }
  } else {
    const path = require('path');
    const intelligenceDir = path.join(__dirname, '..', 'intelligence');
    const { importKnownEvents, importKnownAddresses } = require('./intelligence-importer');

    if (choice.value === 'events') {
      importKnownEvents(path.join(intelligenceDir, 'known-events.json'));
    } else {
      importKnownAddresses(path.join(intelligenceDir, 'known-addresses.json'));
    }
  }
}

async function exportIntelligenceData() {
  console.log('\n📤 EXPORT INTELLIGENCE DATABASE\n');

  const outputDir = await prompts({
    type: 'text',
    name: 'value',
    message: 'Output directory:',
    initial: './intelligence-export'
  });

  if (!outputDir.value) return;

  console.log('\nExporting your intelligence database...');
  console.log('This will include all events and addresses you have tagged.\n');

  const results = exportIntelligence(outputDir.value);

  console.log('\n✅ Intelligence export complete!');
  console.log(`\nExported:`);
  console.log(`  - ${results.eventsCount} events`);
  console.log(`  - ${results.addressesCount} addresses`);
  console.log(`\nFiles saved to: ${outputDir.value}/`);
  console.log('\nYou can share these files with other investigators or');
  console.log('import them into another instance of this toolkit.');
}

async function importEtherscanLabels() {
  console.log('\n🏷️  IMPORT LABELS FROM ETHERSCAN\n');

  const importType = await prompts({
    type: 'select',
    name: 'value',
    message: 'What would you like to import?',
    choices: [
      { title: 'Single Address', value: 'single' },
      { title: 'Multiple Addresses (manual entry)', value: 'multiple' },
      { title: 'Import from File', value: 'file' },
      { title: 'Import All Private Tags from Account', value: 'all-private' }
    ]
  });

  if (!importType.value) return;

  // Handle import all private tags separately
  if (importType.value === 'all-private') {
    const supportedChains = Object.keys(ETHERSCAN_ENDPOINTS).map(key => ({
      title: key.replace('_', ' '),
      value: key
    }));

    const chain = await prompts({
      type: 'select',
      name: 'value',
      message: 'Select blockchain:',
      choices: supportedChains,
      initial: 0
    });

    if (!chain.value) return;

    const autoTag = await prompts({
      type: 'confirm',
      name: 'value',
      message: 'Automatically tag addresses in forensics database?',
      initial: true
    });

    await importAllPrivateTags(chain.value, {
      autoTag: autoTag.value
    });

    console.log('\n✅ Private tags import complete!');
    return;
  }

  // Select chain
  const supportedChains = Object.keys(ETHERSCAN_ENDPOINTS).map(key => ({
    title: key.replace('_', ' '),
    value: key
  }));

  const chain = await prompts({
    type: 'select',
    name: 'value',
    message: 'Select blockchain:',
    choices: supportedChains,
    initial: 0
  });

  if (!chain.value) return;

  // Options
  const includePrivateTags = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Include private name tags (if available)?',
    initial: true
  });

  const includeTransactions = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Include transaction history analysis?',
    initial: true
  });

  const autoTag = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Automatically tag addresses in forensics database?',
    initial: true
  });

  const options = {
    includePrivateTags: includePrivateTags.value,
    includeTransactionData: includeTransactions.value,
    autoTag: autoTag.value
  };

  if (importType.value === 'single') {
    const address = await prompts({
      type: 'text',
      name: 'value',
      message: 'Enter Ethereum address:',
      validate: value => /^0x[a-fA-F0-9]{40}$/.test(value) || 'Invalid Ethereum address'
    });

    if (!address.value) return;

    await importAddressLabels(address.value, chain.value, options);

  } else if (importType.value === 'multiple') {
    const addressInput = await prompts({
      type: 'text',
      name: 'value',
      message: 'Enter addresses (comma-separated):'
    });

    if (!addressInput.value) return;

    const addresses = addressInput.value
      .split(',')
      .map(a => a.trim())
      .filter(a => /^0x[a-fA-F0-9]{40}$/.test(a));

    if (addresses.length === 0) {
      console.log('No valid addresses found.');
      return;
    }

    const delayMs = await prompts({
      type: 'number',
      name: 'value',
      message: 'Delay between requests (ms):',
      initial: 200,
      min: 100
    });

    await importBulkLabels(addresses, chain.value, {
      ...options,
      delayMs: delayMs.value
    });

  } else if (importType.value === 'file') {
    const filePath = await prompts({
      type: 'text',
      name: 'value',
      message: 'Enter path to file (one address per line):'
    });

    if (!filePath.value) return;

    const delayMs = await prompts({
      type: 'number',
      name: 'value',
      message: 'Delay between requests (ms):',
      initial: 200,
      min: 100
    });

    try {
      await importLabelsFromFile(filePath.value, chain.value, {
        ...options,
        delayMs: delayMs.value
      });
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  }

  console.log('\n✅ Etherscan label import complete!');
}

async function investigationMenu() {
  console.log('\n📋 INVESTIGATION MANAGEMENT\n');

  const action = await prompts({
    type: 'select',
    name: 'value',
    message: 'Select investigation action:',
    choices: [
      { title: '➕ Create New Investigation', value: 'create' },
      { title: '📋 List All Investigations', value: 'list' },
      { title: '👁️  View Investigation Details', value: 'view' },
      { title: '✏️  Update Investigation', value: 'update' },
      { title: '🏷️  Add Address to Investigation', value: 'add-address' },
      { title: '📎 Add Evidence', value: 'add-evidence' },
      { title: '⏰ Add Timeline Event', value: 'add-timeline' },
      { title: '📊 Generate Investigation Report', value: 'generate-report' },
      { title: '🔒 Close Investigation', value: 'close' }
    ]
  });

  if (!action.value) return;

  switch (action.value) {
    case 'create':
      await createNewInvestigation();
      break;
    case 'list':
      await listInvestigations();
      break;
    case 'view':
      await viewInvestigationDetails();
      break;
    case 'update':
      await updateInvestigationFlow();
      break;
    case 'add-address':
      await addAddressToInvestigation();
      break;
    case 'add-evidence':
      await addEvidenceToInvestigation();
      break;
    case 'add-timeline':
      await addTimelineEvent();
      break;
    case 'generate-report':
      await generateInvestigationReportFlow();
      break;
    case 'close':
      await closeInvestigationFlow();
      break;
  }
}

async function createNewInvestigation() {
  const caseId = await prompts({
    type: 'text',
    name: 'value',
    message: 'Case ID (e.g., CASE-2025-001):',
    validate: value => value.trim().length > 0 || 'Case ID is required'
  });

  if (!caseId.value) return;

  const caseName = await prompts({
    type: 'text',
    name: 'value',
    message: 'Case Name:',
    validate: value => value.trim().length > 0 || 'Case name is required'
  });

  if (!caseName.value) return;

  const caseType = await prompts({
    type: 'select',
    name: 'value',
    message: 'Case Type:',
    choices: [
      { title: 'Fraud Investigation', value: 'fraud' },
      { title: 'Hack/Exploit Investigation', value: 'hack' },
      { title: 'Money Laundering', value: 'money-laundering' },
      { title: 'Scam Investigation', value: 'scam' },
      { title: 'Compliance Review', value: 'compliance' },
      { title: 'General Investigation', value: 'general' }
    ]
  });

  const priority = await prompts({
    type: 'select',
    name: 'value',
    message: 'Priority:',
    choices: [
      { title: 'Critical', value: 'critical' },
      { title: 'High', value: 'high' },
      { title: 'Medium', value: 'medium' },
      { title: 'Low', value: 'low' }
    ],
    initial: 2
  });

  const description = await prompts({
    type: 'text',
    name: 'value',
    message: 'Case Description:',
    initial: ''
  });

  try {
    createInvestigation(caseId.value, caseName.value, {
      caseType: caseType.value,
      priority: priority.value,
      description: description.value
    });

    addInvestigationTimelineEvent(caseId.value, 'investigation_created', `Investigation ${caseId.value} created`);

    console.log(`\n✅ Investigation created successfully!`);
    console.log(`Case ID: ${caseId.value}`);
    console.log(`Case Name: ${caseName.value}`);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

async function listInvestigations() {
  const statusFilter = await prompts({
    type: 'select',
    name: 'value',
    message: 'Filter by status:',
    choices: [
      { title: 'All Investigations', value: null },
      { title: 'Active Only', value: 'active' },
      { title: 'Closed Only', value: 'closed' }
    ]
  });

  const investigations = getAllInvestigations(statusFilter.value);

  if (investigations.length === 0) {
    console.log('\nNo investigations found.');
    return;
  }

  console.log(`\n${'='.repeat(100)}`);
  console.log('INVESTIGATIONS');
  console.log(`${'='.repeat(100)}\n`);

  investigations.forEach((inv, i) => {
    console.log(`${i + 1}. ${inv.case_id} - ${inv.case_name}`);
    console.log(`   Status: ${inv.case_status.toUpperCase()} | Priority: ${inv.priority.toUpperCase()} | Type: ${inv.case_type || 'N/A'}`);
    console.log(`   Investigator: ${inv.investigator_name || 'N/A'}`);
    console.log(`   Addresses: ${inv.address_count} | Evidence: ${inv.evidence_count} | Events: ${inv.timeline_events}`);
    console.log(`   Created: ${new Date(inv.date_created).toLocaleDateString()}`);
    console.log('');
  });
}

async function viewInvestigationDetails() {
  const caseId = await prompts({
    type: 'text',
    name: 'value',
    message: 'Enter Case ID:'
  });

  if (!caseId.value) return;

  const investigation = getInvestigation(caseId.value);
  if (!investigation) {
    console.log(`\n❌ Investigation ${caseId.value} not found.`);
    return;
  }

  const addresses = getInvestigationAddresses(caseId.value);

  console.log(`\n${'='.repeat(100)}`);
  console.log(`INVESTIGATION: ${investigation.case_name} (${investigation.case_id})`);
  console.log(`${'='.repeat(100)}\n`);

  console.log('DETAILS:');
  console.log(`  Status:        ${investigation.case_status.toUpperCase()}`);
  console.log(`  Priority:      ${investigation.priority.toUpperCase()}`);
  console.log(`  Type:          ${investigation.case_type || 'N/A'}`);
  console.log(`  Investigator:  ${investigation.investigator_name || 'N/A'}`);
  console.log(`  Email:         ${investigation.investigator_email || 'N/A'}`);
  console.log(`  Organization:  ${investigation.investigator_organization || 'N/A'}`);
  console.log(`  Created:       ${new Date(investigation.date_created).toLocaleString()}`);
  console.log(`  Updated:       ${new Date(investigation.date_updated).toLocaleString()}`);
  if (investigation.date_closed) {
    console.log(`  Closed:        ${new Date(investigation.date_closed).toLocaleString()}`);
  }

  if (investigation.description) {
    console.log(`\nDESCRIPTION:`);
    console.log(`  ${investigation.description}`);
  }

  if (addresses.length > 0) {
    console.log(`\nADDRESSES (${addresses.length}):`);
    addresses.forEach((addr, i) => {
      console.log(`  ${i + 1}. ${addr.address}`);
      console.log(`     Chain: ${addr.chain_type} | Role: ${addr.role || 'N/A'}`);
      if (addr.label) console.log(`     Label: ${addr.label} (${addr.risk_level || 'N/A'})`);
      if (addr.notes) console.log(`     Notes: ${addr.notes}`);
    });
  }

  if (investigation.notes) {
    console.log(`\nNOTES:`);
    console.log(`  ${investigation.notes}`);
  }

  console.log(`\n${'='.repeat(100)}\n`);
}

async function addAddressToInvestigation() {
  const caseId = await prompts({
    type: 'text',
    name: 'value',
    message: 'Case ID:'
  });

  if (!caseId.value) return;

  const address = await prompts({
    type: 'text',
    name: 'value',
    message: 'Address to add:',
    validate: anyChainAddressValidator
  });

  if (!address.value) return;

  const chainType = await prompts({
    type: 'select',
    name: 'value',
    message: 'Chain type:',
    choices: [
      { title: 'EVM (Ethereum, Polygon, etc.)', value: 'evm' },
      { title: 'Solana', value: 'solana' }
    ]
  });

  const role = await prompts({
    type: 'select',
    name: 'value',
    message: 'Address role:',
    choices: [
      { title: 'Suspect/Attacker', value: 'suspect' },
      { title: 'Victim', value: 'victim' },
      { title: 'Intermediary/Mixer', value: 'intermediary' },
      { title: 'Exchange', value: 'exchange' },
      { title: 'Witness/Related', value: 'witness' },
      { title: 'Unknown', value: 'unknown' }
    ]
  });

  const notes = await prompts({
    type: 'text',
    name: 'value',
    message: 'Notes (optional):',
    initial: ''
  });

  try {
    addInvestigationAddress(caseId.value, address.value, chainType.value, role.value, notes.value);
    addInvestigationTimelineEvent(caseId.value, 'address_added', `Address ${address.value} added as ${role.value}`);
    console.log('\n✅ Address added to investigation!');
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

async function addEvidenceToInvestigation() {
  const caseId = await prompts({
    type: 'text',
    name: 'value',
    message: 'Case ID:'
  });

  if (!caseId.value) return;

  const evidenceType = await prompts({
    type: 'select',
    name: 'value',
    message: 'Evidence type:',
    choices: [
      { title: 'Transaction', value: 'transaction' },
      { title: 'Document', value: 'document' },
      { title: 'Screenshot', value: 'screenshot' },
      { title: 'Log File', value: 'log' },
      { title: 'URL/Link', value: 'url' },
      { title: 'Other', value: 'other' }
    ]
  });

  const title = await prompts({
    type: 'text',
    name: 'value',
    message: 'Evidence title:',
    validate: value => value.trim().length > 0 || 'Title is required'
  });

  if (!title.value) return;

  const description = await prompts({
    type: 'text',
    name: 'value',
    message: 'Description:',
    initial: ''
  });

  const filePath = await prompts({
    type: 'text',
    name: 'value',
    message: 'File path (optional):',
    initial: ''
  });

  const url = await prompts({
    type: 'text',
    name: 'value',
    message: 'URL (optional):',
    initial: ''
  });

  try {
    addInvestigationEvidence(caseId.value, {
      evidenceType: evidenceType.value,
      title: title.value,
      description: description.value,
      filePath: filePath.value || null,
      url: url.value || null
    });
    addInvestigationTimelineEvent(caseId.value, 'evidence_added', `Evidence added: ${title.value}`);
    console.log('\n✅ Evidence added to investigation!');
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

async function addTimelineEvent() {
  const caseId = await prompts({
    type: 'text',
    name: 'value',
    message: 'Case ID:'
  });

  if (!caseId.value) return;

  const eventType = await prompts({
    type: 'select',
    name: 'value',
    message: 'Event type:',
    choices: [
      { title: 'Investigation Update', value: 'update' },
      { title: 'Finding/Discovery', value: 'finding' },
      { title: 'Interview/Communication', value: 'interview' },
      { title: 'Analysis Complete', value: 'analysis' },
      { title: 'Milestone', value: 'milestone' },
      { title: 'Other', value: 'other' }
    ]
  });

  const description = await prompts({
    type: 'text',
    name: 'value',
    message: 'Event description:',
    validate: value => value.trim().length > 0 || 'Description is required'
  });

  if (!description.value) return;

  try {
    addInvestigationTimelineEvent(caseId.value, eventType.value, description.value);
    console.log('\n✅ Timeline event added!');
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

async function generateInvestigationReportFlow() {
  const caseId = await prompts({
    type: 'text',
    name: 'value',
    message: 'Case ID:'
  });

  if (!caseId.value) return;

  const investigation = getInvestigation(caseId.value);
  if (!investigation) {
    console.log(`\n❌ Investigation ${caseId.value} not found.`);
    return;
  }

  const formats = await prompts({
    type: 'multiselect',
    name: 'value',
    message: 'Select report formats:',
    choices: [
      { title: 'Text (.txt)', value: 'txt', selected: true },
      { title: 'HTML (.html)', value: 'html', selected: true },
      { title: 'JSON (.json)', value: 'json', selected: true },
      { title: 'CSV Files (.csv)', value: 'csv', selected: true }
    ],
    min: 1
  });

  if (!formats.value || formats.value.length === 0) return;

  const createZip = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Create ZIP archive?',
    initial: true
  });

  const outputDir = await prompts({
    type: 'text',
    name: 'value',
    message: 'Output directory:',
    initial: './investigation-reports'
  });

  console.log('\n🔄 Generating investigation report...\n');

  try {
    const result = await generateInvestigationReport(caseId.value, outputDir.value, {
      formats: formats.value,
      createZip: createZip.value,
      includeTransactions: true,
      includeEvidence: true,
      includeTimeline: true
    });

    console.log(`\n📁 Report directory: ${result.reportDir}`);
    if (result.zipFile) {
      console.log(`📦 ZIP archive: ${result.zipFile}`);
    }

    addInvestigationTimelineEvent(caseId.value, 'report_generated', `Investigation report generated in ${formats.value.join(', ')} format(s)`);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

async function updateInvestigationFlow() {
  const caseId = await prompts({
    type: 'text',
    name: 'value',
    message: 'Case ID:'
  });

  if (!caseId.value) return;

  const investigation = getInvestigation(caseId.value);
  if (!investigation) {
    console.log(`\n❌ Investigation ${caseId.value} not found.`);
    return;
  }

  const field = await prompts({
    type: 'select',
    name: 'value',
    message: 'What to update?',
    choices: [
      { title: 'Case Name', value: 'case_name' },
      { title: 'Status', value: 'case_status' },
      { title: 'Priority', value: 'priority' },
      { title: 'Description', value: 'description' },
      { title: 'Notes', value: 'notes' }
    ]
  });

  let newValue;

  if (field.value === 'case_status') {
    newValue = await prompts({
      type: 'select',
      name: 'value',
      message: 'New status:',
      choices: [
        { title: 'Active', value: 'active' },
        { title: 'On Hold', value: 'on-hold' },
        { title: 'Pending Review', value: 'pending-review' }
      ]
    });
  } else if (field.value === 'priority') {
    newValue = await prompts({
      type: 'select',
      name: 'value',
      message: 'New priority:',
      choices: [
        { title: 'Critical', value: 'critical' },
        { title: 'High', value: 'high' },
        { title: 'Medium', value: 'medium' },
        { title: 'Low', value: 'low' }
      ]
    });
  } else {
    newValue = await prompts({
      type: 'text',
      name: 'value',
      message: `New ${field.value}:`,
      initial: investigation[field.value] || ''
    });
  }

  if (!newValue.value) return;

  try {
    updateInvestigation(caseId.value, { [field.value]: newValue.value });
    addInvestigationTimelineEvent(caseId.value, 'investigation_updated', `${field.value} updated`);
    console.log('\n✅ Investigation updated!');
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

async function closeInvestigationFlow() {
  const caseId = await prompts({
    type: 'text',
    name: 'value',
    message: 'Case ID to close:'
  });

  if (!caseId.value) return;

  const investigation = getInvestigation(caseId.value);
  if (!investigation) {
    console.log(`\n❌ Investigation ${caseId.value} not found.`);
    return;
  }

  if (investigation.case_status === 'closed') {
    console.log(`\n⚠️  Investigation ${caseId.value} is already closed.`);
    return;
  }

  const confirm = await prompts({
    type: 'confirm',
    name: 'value',
    message: `Close investigation "${investigation.case_name}"?`,
    initial: false
  });

  if (!confirm.value) return;

  const notes = await prompts({
    type: 'text',
    name: 'value',
    message: 'Closing notes:',
    initial: ''
  });

  try {
    closeInvestigation(caseId.value, notes.value);
    addInvestigationTimelineEvent(caseId.value, 'investigation_closed', 'Investigation closed');
    console.log('\n✅ Investigation closed successfully!');
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
