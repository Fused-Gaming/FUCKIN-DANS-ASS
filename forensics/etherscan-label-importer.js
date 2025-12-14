// Etherscan Label Importer for Forensic Analysis
require('dotenv').config();
const { bulkTagAddresses } = require('./attribution-manager');

/**
 * Etherscan API endpoints for different chains
 */
const ETHERSCAN_ENDPOINTS = {
  'ETH_MAINNET': 'https://api.etherscan.io/api',
  'POLYGON_MAINNET': 'https://api.polygonscan.com/api',
  'ARB_MAINNET': 'https://api.arbiscan.io/api',
  'OPT_MAINNET': 'https://api-optimistic.etherscan.io/api',
  'BASE_MAINNET': 'https://api.basescan.org/api',
  'BSC_MAINNET': 'https://api.bscscan.com/api',
  'AVALANCHE_MAINNET': 'https://api.snowtrace.io/api'
};

/**
 * Get API key for specific chain
 */
function getApiKey(chain) {
  // Try chain-specific key first, fall back to ETHERSCAN_API_KEY
  const chainKey = `${chain}_ETHERSCAN_API_KEY`;
  return process.env[chainKey] || process.env.ETHERSCAN_API_KEY;
}

/**
 * Map Etherscan categories to our internal categories
 */
function mapCategory(etherscanLabel) {
  const label = (etherscanLabel || '').toLowerCase();

  if (label.includes('hack') || label.includes('exploit') || label.includes('attacker')) {
    return 'hack';
  }
  if (label.includes('phish')) {
    return 'phishing';
  }
  if (label.includes('scam') || label.includes('fraud')) {
    return 'scam';
  }
  if (label.includes('mixer') || label.includes('tornado')) {
    return 'mixer';
  }
  if (label.includes('exchange') || label.includes('cex')) {
    return 'exchange';
  }
  if (label.includes('dex') || label.includes('swap')) {
    return 'dex';
  }
  if (label.includes('bridge')) {
    return 'bridge';
  }
  if (label.includes('sanction')) {
    return 'sanctioned';
  }
  if (label.includes('defi') || label.includes('protocol')) {
    return 'defi-protocol';
  }

  return 'info';
}

/**
 * Determine risk level based on label
 */
function determineRiskLevel(label) {
  const lowerLabel = (label || '').toLowerCase();

  if (lowerLabel.includes('hack') ||
      lowerLabel.includes('exploit') ||
      lowerLabel.includes('attacker') ||
      lowerLabel.includes('sanction')) {
    return 'critical';
  }
  if (lowerLabel.includes('phish') ||
      lowerLabel.includes('scam') ||
      lowerLabel.includes('fraud')) {
    return 'high';
  }
  if (lowerLabel.includes('mixer') ||
      lowerLabel.includes('suspicious')) {
    return 'medium';
  }
  if (lowerLabel.includes('exchange') ||
      lowerLabel.includes('dex') ||
      lowerLabel.includes('bridge') ||
      lowerLabel.includes('defi')) {
    return 'low';
  }

  return 'info';
}

/**
 * Fetch address tags from Etherscan API v2
 * @param {string} address - Ethereum address to lookup
 * @param {string} chain - Chain identifier (default: ETH_MAINNET)
 * @returns {Promise<Object>} Tag information
 */
async function fetchEtherscanTags(address, chain = 'ETH_MAINNET') {
  const apiKey = getApiKey(chain);
  const endpoint = ETHERSCAN_ENDPOINTS[chain];

  if (!apiKey) {
    throw new Error(`Etherscan API key not found. Please set ETHERSCAN_API_KEY in .env file`);
  }

  if (!endpoint) {
    throw new Error(`Unsupported chain: ${chain}. Supported chains: ${Object.keys(ETHERSCAN_ENDPOINTS).join(', ')}`);
  }

  console.log(`Fetching labels for ${address} from ${chain}...`);

  // API v2 uses the addresslabel endpoint
  const url = `${endpoint}?module=account&action=addresslabel&address=${address}&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    let tag = null;
    let labels = [];

    // API v2 returns result as an object with 'result' array
    if (data.status === '1' && data.result) {
      // v2 can return multiple labels
      if (Array.isArray(data.result)) {
        labels = data.result.map(item => ({
          label: item.name || item.nameTag || item.label,
          type: item.type || 'unknown',
          labels: item.labels || []
        }));
        tag = labels[0]?.label || null;
      } else if (typeof data.result === 'string') {
        tag = data.result;
        labels = [{ label: tag, type: 'tag', labels: [] }];
      } else if (data.result.name || data.result.nameTag) {
        tag = data.result.name || data.result.nameTag;
        labels = [{
          label: tag,
          type: data.result.type || 'tag',
          labels: data.result.labels || []
        }];
      }
    }

    // Also try to get contract information if available
    const contractUrl = `${endpoint}?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`;
    const contractResponse = await fetch(contractUrl);
    const contractData = await contractResponse.json();

    return {
      address,
      chain,
      tag,
      labels,
      contractInfo: contractData.status === '1' ? contractData.result[0] : null
    };
  } catch (error) {
    console.error(`Error fetching from Etherscan: ${error.message}`);
    return null;
  }
}

/**
 * Fetch private name tags for an address (requires API key with private access)
 * @param {string} address - Ethereum address to lookup
 * @param {string} chain - Chain identifier
 * @returns {Promise<Object>} Private tag information
 */
async function fetchPrivateNameTags(address, chain = 'ETH_MAINNET') {
  const apiKey = getApiKey(chain);
  const endpoint = ETHERSCAN_ENDPOINTS[chain];

  if (!apiKey || !endpoint) {
    return null;
  }

  // API v2 private name tag endpoint
  const url = `${endpoint}?module=account&action=addresstagnote&address=${address}&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === '1' && data.result) {
      return {
        address,
        privateTag: data.result.tag || data.result.name || data.result.nameTag || null,
        note: data.result.note || null,
        timestamp: data.result.timestamp || new Date().toISOString()
      };
    }

    return null;
  } catch (error) {
    // Private tags might not be available or API key might not have access
    return null;
  }
}

/**
 * Fetch all private name tags from user's account
 * @param {string} chain - Chain identifier
 * @returns {Promise<Array>} List of all private name tags
 */
async function fetchAllPrivateNameTags(chain = 'ETH_MAINNET') {
  const apiKey = getApiKey(chain);
  const endpoint = ETHERSCAN_ENDPOINTS[chain];

  if (!apiKey || !endpoint) {
    return [];
  }

  // API v2 endpoint to get all private name tags
  const url = `${endpoint}?module=account&action=addresstaglist&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === '1' && data.result && Array.isArray(data.result)) {
      return data.result.map(item => ({
        address: item.address,
        tag: item.tag || item.name || item.nameTag,
        note: item.note || null,
        timestamp: item.timestamp || null
      }));
    }

    return [];
  } catch (error) {
    console.error(`Error fetching private name tags: ${error.message}`);
    return [];
  }
}

/**
 * Fetch address label cloud (API v2) - provides all labels associated with an address
 * @param {string} address - Ethereum address to lookup
 * @param {string} chain - Chain identifier
 * @returns {Promise<Object>} Label cloud data
 */
async function fetchAddressLabelCloud(address, chain = 'ETH_MAINNET') {
  const apiKey = getApiKey(chain);
  const endpoint = ETHERSCAN_ENDPOINTS[chain];

  if (!apiKey || !endpoint) {
    return null;
  }

  // API v2 label cloud endpoint (if available)
  const url = `${endpoint}?module=account&action=addresslabelcloud&address=${address}&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === '1' && data.result) {
      return {
        address,
        labelCloud: data.result,
        timestamp: new Date().toISOString()
      };
    }

    return null;
  } catch (error) {
    // This endpoint might not be available on all chains, so fail silently
    return null;
  }
}

/**
 * Fetch transaction list to gather additional context
 * @param {string} address - Ethereum address
 * @param {string} chain - Chain identifier
 * @param {number} limit - Maximum number of transactions to fetch
 * @returns {Promise<Array>} Transaction list with timestamps
 */
async function fetchAddressTransactions(address, chain = 'ETH_MAINNET', limit = 100) {
  const apiKey = getApiKey(chain);
  const endpoint = ETHERSCAN_ENDPOINTS[chain];

  if (!apiKey || !endpoint) {
    return [];
  }

  const url = `${endpoint}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=asc&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === '1' && data.result) {
      return data.result.map(tx => ({
        hash: tx.hash,
        timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
        from: tx.from,
        to: tx.to,
        value: tx.value,
        blockNumber: tx.blockNumber
      }));
    }

    return [];
  } catch (error) {
    console.error(`Error fetching transactions: ${error.message}`);
    return [];
  }
}

/**
 * Import labels for a single address from Etherscan
 * @param {string} address - Ethereum address to import labels for
 * @param {string} chain - Chain identifier (default: ETH_MAINNET)
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Import result
 */
async function importAddressLabels(address, chain = 'ETH_MAINNET', options = {}) {
  const {
    includeTransactionData = true,
    autoTag = true,
    includePrivateTags = true,
    silent = false
  } = options;

  if (!silent) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`IMPORTING LABELS FOR: ${address}`);
    console.log(`${'='.repeat(80)}\n`);
  }

  // Fetch tag information
  const tagInfo = await fetchEtherscanTags(address, chain);

  if (!tagInfo) {
    if (!silent) console.log('Failed to fetch tag information from Etherscan.');
    return { success: false, address, chain, imported: 0 };
  }

  const result = {
    success: true,
    address,
    chain,
    labels: [],
    contractInfo: null,
    transactions: [],
    firstSeen: null,
    lastSeen: null,
    labelCloud: null,
    privateTag: null,
    privateNote: null,
    imported: 0
  };

  // Fetch private name tags if enabled
  if (includePrivateTags) {
    const privateTagInfo = await fetchPrivateNameTags(address, chain);
    if (privateTagInfo && privateTagInfo.privateTag) {
      result.privateTag = privateTagInfo.privateTag;
      result.privateNote = privateTagInfo.note;
      if (!silent) {
        console.log(`✓ Found private tag: ${privateTagInfo.privateTag}`);
        if (privateTagInfo.note) {
          console.log(`  Note: ${privateTagInfo.note}`);
        }
      }

      // Add private tag to labels
      result.labels.push({
        label: privateTagInfo.privateTag,
        source: 'Etherscan Private Tag',
        category: mapCategory(privateTagInfo.privateTag),
        riskLevel: determineRiskLevel(privateTagInfo.privateTag),
        note: privateTagInfo.note
      });
      result.imported++;
    }
  }

  // Try to fetch label cloud (API v2 feature)
  const labelCloud = await fetchAddressLabelCloud(address, chain);
  if (labelCloud) {
    result.labelCloud = labelCloud.labelCloud;
    if (!silent) console.log(`✓ Retrieved label cloud data`);
  }

  // Process tag information (API v2 can return multiple labels)
  if (tagInfo.labels && tagInfo.labels.length > 0) {
    if (!silent) console.log(`✓ Found ${tagInfo.labels.length} Etherscan label(s):`);

    for (const labelItem of tagInfo.labels) {
      const labelText = labelItem.label;
      if (!silent) console.log(`  - ${labelText}${labelItem.type ? ` (${labelItem.type})` : ''}`);

      // Add any sub-labels if present
      const allLabels = [labelText];
      if (labelItem.labels && labelItem.labels.length > 0) {
        allLabels.push(...labelItem.labels);
        if (!silent) {
          labelItem.labels.forEach(subLabel => {
            console.log(`    → ${subLabel}`);
          });
        }
      }

      // Add to result labels (combine all labels)
      allLabels.forEach(lbl => {
        result.labels.push({
          label: lbl,
          source: `Etherscan (${labelItem.type || 'tag'})`,
          category: mapCategory(lbl),
          riskLevel: determineRiskLevel(lbl)
        });
        result.imported++;
      });
    }
  } else if (tagInfo.tag) {
    if (!silent) console.log(`✓ Found Etherscan tag: ${tagInfo.tag}`);
    result.labels.push({
      label: tagInfo.tag,
      source: 'Etherscan',
      category: mapCategory(tagInfo.tag),
      riskLevel: determineRiskLevel(tagInfo.tag)
    });
    result.imported++;
  } else {
    if (!silent) console.log('No public tag found on Etherscan.');
  }

  // Process contract information
  if (tagInfo.contractInfo && tagInfo.contractInfo.ContractName) {
    const contractName = tagInfo.contractInfo.ContractName;
    if (!silent) console.log(`✓ Contract Name: ${contractName}`);

    result.contractInfo = {
      name: contractName,
      compiler: tagInfo.contractInfo.CompilerVersion,
      verified: tagInfo.contractInfo.SourceCode ? true : false,
      creationDate: null // Not available in this endpoint
    };

    result.labels.push({
      label: `Contract: ${contractName}`,
      source: 'Etherscan Contract',
      category: 'defi-protocol',
      riskLevel: 'info'
    });
    result.imported++;
  }

  // Fetch transaction data if requested
  if (includeTransactionData) {
    if (!silent) console.log('\nFetching transaction history...');
    const transactions = await fetchAddressTransactions(address, chain, 100);

    if (transactions.length > 0) {
      result.transactions = transactions;
      result.firstSeen = transactions[0].timestamp;
      result.lastSeen = transactions[transactions.length - 1].timestamp;

      if (!silent) {
        console.log(`✓ First transaction: ${new Date(result.firstSeen).toLocaleDateString()}`);
        console.log(`✓ Last transaction: ${new Date(result.lastSeen).toLocaleDateString()}`);
        console.log(`✓ Total transactions analyzed: ${transactions.length}`);
      }
    }
  }

  // Auto-tag if enabled and labels found
  if (autoTag && result.labels.length > 0) {
    if (!silent) console.log('\nAuto-tagging address in forensics database...');

    for (const labelInfo of result.labels) {
      const description = [
        labelInfo.label,
        labelInfo.note || null,
        result.contractInfo ? `Verified Contract: ${result.contractInfo.verified}` : null,
        result.firstSeen ? `First Seen: ${new Date(result.firstSeen).toLocaleDateString()}` : null
      ].filter(Boolean).join(' | ');

      bulkTagAddresses(
        [address],
        'evm',
        labelInfo.label,
        {
          category: labelInfo.category,
          riskLevel: labelInfo.riskLevel,
          description,
          source: labelInfo.source
        }
      );
    }

    if (!silent) console.log('✓ Address tagged successfully!');
  }

  if (!silent) console.log(`\n${'='.repeat(80)}\n`);

  return result;
}

/**
 * Import labels for multiple addresses
 * @param {Array<string>} addresses - Array of addresses to import
 * @param {string} chain - Chain identifier
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} Import results
 */
async function importBulkLabels(addresses, chain = 'ETH_MAINNET', options = {}) {
  const { delayMs = 200 } = options; // Rate limiting

  console.log(`\nImporting labels for ${addresses.length} addresses from ${chain}...`);
  console.log(`Note: Adding ${delayMs}ms delay between requests to respect API rate limits.\n`);

  const results = [];

  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];
    console.log(`[${i + 1}/${addresses.length}] Processing ${address}...`);

    const result = await importAddressLabels(address, chain, options);
    results.push(result);

    // Rate limiting
    if (i < addresses.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  const withLabels = results.filter(r => r.labels && r.labels.length > 0).length;

  console.log(`\n${'='.repeat(80)}`);
  console.log('BULK IMPORT SUMMARY');
  console.log(`${'='.repeat(80)}`);
  console.log(`Total addresses processed: ${addresses.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`With labels: ${withLabels}`);
  console.log(`${'='.repeat(80)}\n`);

  return results;
}

/**
 * Import labels from a file containing addresses
 * @param {string} filePath - Path to file with addresses (one per line)
 * @param {string} chain - Chain identifier
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} Import results
 */
async function importLabelsFromFile(filePath, chain = 'ETH_MAINNET', options = {}) {
  const fs = require('fs');
  const path = require('path');

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const addresses = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line.startsWith('0x'))
    .filter((addr, index, self) => self.indexOf(addr) === index); // Remove duplicates

  if (addresses.length === 0) {
    throw new Error('No valid addresses found in file');
  }

  console.log(`Found ${addresses.length} unique addresses in ${path.basename(filePath)}`);

  return await importBulkLabels(addresses, chain, options);
}

/**
 * Import all private name tags from user's Etherscan account
 * @param {string} chain - Chain identifier
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Import result
 */
async function importAllPrivateTags(chain = 'ETH_MAINNET', options = {}) {
  const { autoTag = true } = options;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`IMPORTING ALL PRIVATE TAGS FROM ${chain}`);
  console.log(`${'='.repeat(80)}\n`);

  const privateTags = await fetchAllPrivateNameTags(chain);

  if (privateTags.length === 0) {
    console.log('No private name tags found in your Etherscan account.');
    console.log('Note: Make sure your API key has access to private tags.');
    return { success: false, count: 0, tags: [] };
  }

  console.log(`✓ Found ${privateTags.length} private name tag(s)\n`);

  const results = [];

  for (const tagInfo of privateTags) {
    console.log(`Address: ${tagInfo.address}`);
    console.log(`  Tag: ${tagInfo.tag}`);
    if (tagInfo.note) {
      console.log(`  Note: ${tagInfo.note}`);
    }
    console.log('');

    if (autoTag) {
      const description = [
        tagInfo.tag,
        tagInfo.note ? `Note: ${tagInfo.note}` : null,
        tagInfo.timestamp ? `Added: ${new Date(tagInfo.timestamp).toLocaleDateString()}` : null
      ].filter(Boolean).join(' | ');

      bulkTagAddresses(
        [tagInfo.address],
        'evm',
        tagInfo.tag,
        {
          category: mapCategory(tagInfo.tag),
          riskLevel: determineRiskLevel(tagInfo.tag),
          description,
          source: 'Etherscan Private Tag'
        }
      );
    }

    results.push({
      address: tagInfo.address,
      tag: tagInfo.tag,
      note: tagInfo.note,
      timestamp: tagInfo.timestamp
    });
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`IMPORT COMPLETE`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Total private tags imported: ${privateTags.length}`);
  if (autoTag) {
    console.log(`All addresses have been tagged in the forensics database.`);
  }
  console.log(`${'='.repeat(80)}\n`);

  return {
    success: true,
    count: privateTags.length,
    tags: results
  };
}

module.exports = {
  fetchEtherscanTags,
  fetchPrivateNameTags,
  fetchAllPrivateNameTags,
  fetchAddressLabelCloud,
  fetchAddressTransactions,
  importAddressLabels,
  importBulkLabels,
  importLabelsFromFile,
  importAllPrivateTags,
  ETHERSCAN_ENDPOINTS
};
