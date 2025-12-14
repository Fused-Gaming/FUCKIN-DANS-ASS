// Address attribution and tagging system for forensic analysis
const {
  addAddressAttribution,
  getAddressAttributions,
  addKnownEvent,
  getKnownEvents,
  addAddressToCluster,
  getClusterAddresses,
  getAllClusters
} = require('../database/db');

/**
 * Risk levels for address attribution
 */
const RISK_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info'
};

/**
 * Common categories for address labeling
 */
const CATEGORIES = {
  EXPLOIT: 'exploit',
  HACK: 'hack',
  FRAUD: 'fraud',
  SCAM: 'scam',
  PHISHING: 'phishing',
  MIXER: 'mixer',
  EXCHANGE: 'exchange',
  DEX: 'dex',
  DEFI_PROTOCOL: 'defi-protocol',
  BRIDGE: 'bridge',
  SANCTIONED: 'sanctioned',
  KNOWN_ATTACKER: 'known-attacker',
  VICTIM: 'victim',
  INTERMEDIARY: 'intermediary'
};

/**
 * Tag an address with attribution information
 */
function tagAddress(address, chainType, label, options = {}) {
  const {
    category = CATEGORIES.INFO,
    riskLevel = RISK_LEVELS.INFO,
    description = '',
    source = 'manual'
  } = options;

  console.log(`Tagging address ${address} as "${label}" (${riskLevel})`);

  return addAddressAttribution(
    address,
    chainType,
    label,
    category,
    riskLevel,
    description,
    source
  );
}

/**
 * Bulk tag multiple addresses (e.g., all addresses from a known hack)
 */
function bulkTagAddresses(addresses, chainType, label, options = {}) {
  console.log(`Bulk tagging ${addresses.length} addresses...`);

  const results = [];
  for (const address of addresses) {
    try {
      const result = tagAddress(address, chainType, label, options);
      results.push({ address, success: true, result });
    } catch (error) {
      results.push({ address, success: false, error: error.message });
    }
  }

  const successful = results.filter(r => r.success).length;
  console.log(`Successfully tagged ${successful}/${addresses.length} addresses.`);

  return results;
}

/**
 * Check if an address is attributed/flagged
 */
function checkAddressReputation(address) {
  const attributions = getAddressAttributions(address);

  if (attributions.length === 0) {
    return {
      address,
      flagged: false,
      riskLevel: RISK_LEVELS.INFO,
      attributions: []
    };
  }

  // Determine highest risk level
  const riskPriority = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
    info: 0
  };

  const highestRisk = attributions.reduce((max, attr) => {
    const attrLevel = riskPriority[attr.risk_level] || 0;
    const maxLevel = riskPriority[max] || 0;
    return attrLevel > maxLevel ? attr.risk_level : max;
  }, RISK_LEVELS.INFO);

  return {
    address,
    flagged: true,
    riskLevel: highestRisk,
    attributions: attributions
  };
}

/**
 * Register a known security event (hack, exploit, etc.)
 */
function registerEvent(eventName, options = {}) {
  const {
    eventType = 'hack',
    eventDate = new Date().toISOString(),
    chainName = null,
    description = '',
    estimatedLoss = null,
    primaryAddress = null,
    referenceUrl = null
  } = options;

  console.log(`Registering event: ${eventName}`);

  return addKnownEvent(
    eventName,
    eventType,
    eventDate,
    chainName,
    description,
    estimatedLoss,
    primaryAddress,
    referenceUrl
  );
}

/**
 * Create an address cluster for related addresses
 */
function createCluster(clusterName, addresses, chainType, options = {}) {
  const { confidenceScore = 0.8, evidence = '' } = options;

  console.log(`Creating cluster "${clusterName}" with ${addresses.length} addresses...`);

  const results = [];
  for (const address of addresses) {
    try {
      const result = addAddressToCluster(
        clusterName,
        address,
        chainType,
        confidenceScore,
        evidence
      );
      results.push({ address, success: true, result });
    } catch (error) {
      results.push({ address, success: false, error: error.message });
    }
  }

  return results;
}

/**
 * Find if an address belongs to any known cluster
 */
function findAddressClusters(address) {
  const allClusters = getAllClusters();
  const addressClusters = [];

  for (const cluster of allClusters) {
    const members = getClusterAddresses(cluster.cluster_name);
    const isMember = members.some(m => m.address.toLowerCase() === address.toLowerCase());

    if (isMember) {
      addressClusters.push({
        name: cluster.cluster_name,
        totalAddresses: cluster.address_count,
        members: members
      });
    }
  }

  return addressClusters;
}

/**
 * Generate a reputation report for an address
 */
function generateReputationReport(address) {
  const reputation = checkAddressReputation(address);
  const clusters = findAddressClusters(address);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`REPUTATION REPORT: ${address}`);
  console.log(`${'='.repeat(80)}`);

  if (!reputation.flagged && clusters.length === 0) {
    console.log('\nStatus: CLEAN');
    console.log('No attributions or cluster memberships found for this address.');
  } else {
    console.log(`\nStatus: FLAGGED`);
    console.log(`Risk Level: ${reputation.riskLevel.toUpperCase()}`);

    if (reputation.attributions.length > 0) {
      console.log(`\nAttributions (${reputation.attributions.length}):`);
      reputation.attributions.forEach((attr, i) => {
        console.log(`\n  ${i + 1}. ${attr.label}`);
        console.log(`     Category: ${attr.category}`);
        console.log(`     Risk: ${attr.risk_level}`);
        if (attr.description) console.log(`     Description: ${attr.description}`);
        if (attr.source) console.log(`     Source: ${attr.source}`);
        console.log(`     Date Added: ${new Date(attr.date_added).toLocaleString()}`);
      });
    }

    if (clusters.length > 0) {
      console.log(`\nCluster Memberships (${clusters.length}):`);
      clusters.forEach((cluster, i) => {
        console.log(`\n  ${i + 1}. ${cluster.name}`);
        console.log(`     Total Addresses: ${cluster.totalAddresses}`);
      });
    }
  }

  console.log(`\n${'='.repeat(80)}`);

  return { reputation, clusters };
}

/**
 * List all known events
 */
function listKnownEvents(limit = 50) {
  const events = getKnownEvents(limit);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`KNOWN SECURITY EVENTS (${events.length})`);
  console.log(`${'='.repeat(80)}`);

  events.forEach((event, i) => {
    console.log(`\n${i + 1}. ${event.event_name}`);
    console.log(`   Type: ${event.event_type}`);
    if (event.event_date) console.log(`   Date: ${new Date(event.event_date).toLocaleDateString()}`);
    if (event.chain_name) console.log(`   Chain: ${event.chain_name}`);
    if (event.estimated_loss) console.log(`   Est. Loss: ${event.estimated_loss}`);
    if (event.primary_address) console.log(`   Primary Address: ${event.primary_address}`);
    if (event.description) console.log(`   Description: ${event.description}`);
    if (event.reference_url) console.log(`   Reference: ${event.reference_url}`);
  });

  console.log(`\n${'='.repeat(80)}`);

  return events;
}

module.exports = {
  RISK_LEVELS,
  CATEGORIES,
  tagAddress,
  bulkTagAddresses,
  checkAddressReputation,
  registerEvent,
  createCluster,
  findAddressClusters,
  generateReputationReport,
  listKnownEvents
};
