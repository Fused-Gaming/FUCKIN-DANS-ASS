// Intelligence database importer for known events and addresses
const fs = require('fs');
const path = require('path');
const {
  addAddressAttribution,
  addKnownEvent,
  RISK_LEVELS,
  CATEGORIES
} = require('./attribution-manager');

/**
 * Import known events from JSON file
 */
function importKnownEvents(filePath) {
  console.log(`\nImporting known events from ${filePath}...`);

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    console.log(`Intelligence Database Version: ${data.version}`);
    console.log(`Last Updated: ${data.lastUpdated}`);
    console.log(`Total Events: ${data.events.length}\n`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const event of data.events) {
      try {
        addKnownEvent(
          event.eventName,
          {
            eventType: event.eventType,
            eventDate: event.eventDate,
            chainName: event.chainName,
            description: event.description,
            estimatedLoss: event.estimatedLoss,
            primaryAddress: event.primaryAddress,
            referenceUrl: event.referenceUrl
          }
        );

        console.log(`✓ Imported: ${event.eventName} (${event.estimatedLoss})`);
        imported++;
      } catch (error) {
        if (error.message.includes('UNIQUE constraint')) {
          console.log(`⊘ Skipped: ${event.eventName} (already exists)`);
          skipped++;
        } else {
          console.error(`✗ Error importing ${event.eventName}:`, error.message);
          errors++;
        }
      }
    }

    console.log(`\n═══════════════════════════════════════════════════`);
    console.log(`Import Complete:`);
    console.log(`  Imported: ${imported}`);
    console.log(`  Skipped:  ${skipped}`);
    console.log(`  Errors:   ${errors}`);
    console.log(`═══════════════════════════════════════════════════\n`);

    return { imported, skipped, errors };
  } catch (error) {
    console.error('Failed to import events:', error.message);
    throw error;
  }
}

/**
 * Import known addresses from JSON file
 */
function importKnownAddresses(filePath) {
  console.log(`\nImporting known addresses from ${filePath}...`);

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    console.log(`Intelligence Database Version: ${data.version}`);
    console.log(`Last Updated: ${data.lastUpdated}`);
    console.log(`Total Addresses: ${data.addresses.length}\n`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const addr of data.addresses) {
      try {
        addAddressAttribution(
          addr.address,
          addr.chainType,
          addr.label,
          addr.category,
          addr.riskLevel,
          addr.description,
          addr.source
        );

        const riskEmoji = getRiskEmoji(addr.riskLevel);
        console.log(`✓ ${riskEmoji} ${addr.label} - ${addr.address.substring(0, 10)}...`);
        imported++;
      } catch (error) {
        if (error.message.includes('UNIQUE constraint')) {
          console.log(`⊘ Skipped: ${addr.label} (already exists)`);
          skipped++;
        } else {
          console.error(`✗ Error importing ${addr.label}:`, error.message);
          errors++;
        }
      }
    }

    console.log(`\n═══════════════════════════════════════════════════`);
    console.log(`Import Complete:`);
    console.log(`  Imported: ${imported}`);
    console.log(`  Skipped:  ${skipped}`);
    console.log(`  Errors:   ${errors}`);
    console.log(`═══════════════════════════════════════════════════\n`);

    return { imported, skipped, errors };
  } catch (error) {
    console.error('Failed to import addresses:', error.message);
    throw error;
  }
}

/**
 * Import all intelligence from default locations
 */
function importAllIntelligence() {
  const intelligenceDir = path.join(__dirname, '..', 'intelligence');

  const eventsFile = path.join(intelligenceDir, 'known-events.json');
  const addressesFile = path.join(intelligenceDir, 'known-addresses.json');

  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║     IMPORTING THREAT INTELLIGENCE DATABASE       ║');
  console.log('╚═══════════════════════════════════════════════════╝');

  const results = {
    events: null,
    addresses: null
  };

  // Import events
  if (fs.existsSync(eventsFile)) {
    results.events = importKnownEvents(eventsFile);
  } else {
    console.log(`⚠ Events file not found: ${eventsFile}`);
  }

  // Import addresses
  if (fs.existsSync(addressesFile)) {
    results.addresses = importKnownAddresses(addressesFile);
  } else {
    console.log(`⚠ Addresses file not found: ${addressesFile}`);
  }

  // Summary
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║           INTELLIGENCE IMPORT SUMMARY             ║');
  console.log('╚═══════════════════════════════════════════════════╝');

  if (results.events) {
    console.log(`\nKnown Events:`);
    console.log(`  ✓ Imported: ${results.events.imported}`);
    console.log(`  ⊘ Skipped:  ${results.events.skipped}`);
    console.log(`  ✗ Errors:   ${results.events.errors}`);
  }

  if (results.addresses) {
    console.log(`\nKnown Addresses:`);
    console.log(`  ✓ Imported: ${results.addresses.imported}`);
    console.log(`  ⊘ Skipped:  ${results.addresses.skipped}`);
    console.log(`  ✗ Errors:   ${results.addresses.errors}`);
  }

  const totalImported =
    (results.events?.imported || 0) +
    (results.addresses?.imported || 0);

  console.log(`\n${'='.repeat(53)}`);
  console.log(`Total Intelligence Imported: ${totalImported} entries`);
  console.log(`${'='.repeat(53)}\n`);

  return results;
}

/**
 * Export current database to JSON format (for sharing intelligence)
 */
function exportIntelligence(outputDir) {
  const {
    getKnownEvents,
    db
  } = require('../database/db');

  console.log(`\nExporting intelligence to ${outputDir}...`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Export events
  const events = getKnownEvents(1000);
  const eventsExport = {
    version: "1.0.0",
    lastUpdated: new Date().toISOString().split('T')[0],
    description: "Exported threat intelligence - known security events",
    events: events.map(e => ({
      eventName: e.event_name,
      eventType: e.event_type,
      eventDate: e.event_date?.split('T')[0],
      chainName: e.chain_name,
      description: e.description,
      estimatedLoss: e.estimated_loss,
      primaryAddress: e.primary_address,
      referenceUrl: e.reference_url
    }))
  };

  fs.writeFileSync(
    path.join(outputDir, 'exported-events.json'),
    JSON.stringify(eventsExport, null, 2)
  );
  console.log(`✓ Exported ${events.length} events`);

  // Export addresses
  const addressStmt = db.prepare(`
    SELECT * FROM address_attributions
    ORDER BY date_added DESC
  `);
  const addresses = addressStmt.all();

  const addressesExport = {
    version: "1.0.0",
    lastUpdated: new Date().toISOString().split('T')[0],
    description: "Exported threat intelligence - known addresses",
    addresses: addresses.map(a => ({
      address: a.address,
      chainType: a.chain_type,
      label: a.label,
      category: a.category,
      riskLevel: a.risk_level,
      description: a.description,
      source: a.source,
      dateTagged: a.date_added?.split('T')[0]
    }))
  };

  fs.writeFileSync(
    path.join(outputDir, 'exported-addresses.json'),
    JSON.stringify(addressesExport, null, 2)
  );
  console.log(`✓ Exported ${addresses.length} addresses`);

  console.log(`\nExport complete! Files saved to ${outputDir}/`);

  return {
    eventsCount: events.length,
    addressesCount: addresses.length
  };
}

/**
 * Helper function to get emoji for risk level
 */
function getRiskEmoji(riskLevel) {
  const emojis = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
    info: '🔵'
  };
  return emojis[riskLevel] || '⚪';
}

/**
 * Validate intelligence file format
 */
function validateIntelligenceFile(filePath, type) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Check required fields
    if (!data.version || !data.lastUpdated) {
      throw new Error('Missing version or lastUpdated fields');
    }

    if (type === 'events') {
      if (!Array.isArray(data.events)) {
        throw new Error('events field must be an array');
      }

      // Validate each event
      data.events.forEach((event, index) => {
        const required = ['eventName', 'eventType', 'eventDate'];
        required.forEach(field => {
          if (!event[field]) {
            throw new Error(`Event ${index}: missing required field '${field}'`);
          }
        });
      });
    } else if (type === 'addresses') {
      if (!Array.isArray(data.addresses)) {
        throw new Error('addresses field must be an array');
      }

      // Validate each address
      data.addresses.forEach((addr, index) => {
        const required = ['address', 'chainType', 'label', 'category', 'riskLevel'];
        required.forEach(field => {
          if (!addr[field]) {
            throw new Error(`Address ${index}: missing required field '${field}'`);
          }
        });

        // Validate Ethereum address format
        if (addr.chainType === 'evm' && !/^0x[a-fA-F0-9]{40}$/.test(addr.address)) {
          throw new Error(`Address ${index}: invalid Ethereum address format`);
        }
      });
    }

    console.log(`✓ Validation passed: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`✗ Validation failed: ${error.message}`);
    return false;
  }
}

module.exports = {
  importKnownEvents,
  importKnownAddresses,
  importAllIntelligence,
  exportIntelligence,
  validateIntelligenceFile
};
