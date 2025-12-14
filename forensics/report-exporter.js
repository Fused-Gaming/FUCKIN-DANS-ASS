// Forensic report export functionality
const fs = require('fs');
const path = require('path');
const {
  getForensicTimeline,
  getAddressTransactions,
  getAddressAttributions,
  getKnownEvents,
  getClusterAddresses
} = require('../database/db');

/**
 * Generate a comprehensive forensic report for investigation
 */
function generateForensicReport(addresses, options = {}) {
  const {
    startDate = null,
    endDate = null,
    title = 'Blockchain Forensic Investigation Report',
    caseId = `CASE-${Date.now()}`,
    investigator = 'Automated System'
  } = options;

  const report = {
    metadata: {
      title,
      caseId,
      investigator,
      generatedAt: new Date().toISOString(),
      addresses: addresses,
      dateRange: {
        start: startDate,
        end: endDate
      }
    },
    addressAttributions: {},
    timeline: [],
    statistics: {
      totalTransactions: 0,
      addressCount: addresses.length,
      flaggedAddresses: 0,
      chains: new Set(),
      dateRange: { earliest: null, latest: null }
    },
    flaggedInteractions: [],
    suspiciousPatterns: []
  };

  // Gather address attributions
  addresses.forEach(addr => {
    const attributions = getAddressAttributions(addr);
    if (attributions.length > 0) {
      report.addressAttributions[addr] = attributions;
      report.statistics.flaggedAddresses++;
    }
  });

  // Gather timeline
  const timeline = getForensicTimeline(addresses, startDate, endDate);
  report.timeline = timeline;
  report.statistics.totalTransactions = timeline.length;

  // Analyze timeline
  timeline.forEach(tx => {
    report.statistics.chains.add(tx.chain_name);

    // Track date range
    if (tx.timestamp) {
      if (!report.statistics.dateRange.earliest || tx.timestamp < report.statistics.dateRange.earliest) {
        report.statistics.dateRange.earliest = tx.timestamp;
      }
      if (!report.statistics.dateRange.latest || tx.timestamp > report.statistics.dateRange.latest) {
        report.statistics.dateRange.latest = tx.timestamp;
      }
    }

    // Flag interactions between flagged addresses
    const fromFlagged = report.addressAttributions[tx.from_address];
    const toFlagged = report.addressAttributions[tx.to_address];

    if (fromFlagged || toFlagged) {
      report.flaggedInteractions.push({
        txHash: tx.tx_hash,
        timestamp: tx.timestamp,
        from: tx.from_address,
        to: tx.to_address,
        value: tx.value,
        fromLabels: fromFlagged ? fromFlagged.map(a => a.label) : [],
        toLabels: toFlagged ? toFlagged.map(a => a.label) : []
      });
    }
  });

  report.statistics.chains = Array.from(report.statistics.chains);

  return report;
}

/**
 * Export report as JSON
 */
function exportJSON(report, outputPath) {
  const json = JSON.stringify(report, null, 2);
  fs.writeFileSync(outputPath, json, 'utf8');
  console.log(`JSON report exported to: ${outputPath}`);
  return outputPath;
}

/**
 * Export report as CSV (transaction log)
 */
function exportCSV(report, outputPath) {
  const headers = [
    'Timestamp',
    'TX Hash',
    'Chain',
    'Block',
    'From Address',
    'From Labels',
    'To Address',
    'To Labels',
    'Value (wei)',
    'Status',
    'Method ID'
  ];

  let csv = headers.join(',') + '\n';

  report.timeline.forEach(tx => {
    const fromLabels = report.addressAttributions[tx.from_address]
      ? report.addressAttributions[tx.from_address].map(a => a.label).join(';')
      : '';

    const toLabels = report.addressAttributions[tx.to_address]
      ? report.addressAttributions[tx.to_address].map(a => a.label).join(';')
      : '';

    const row = [
      tx.timestamp || '',
      tx.tx_hash,
      tx.chain_name,
      tx.block_number,
      tx.from_address,
      `"${fromLabels}"`,
      tx.to_address || '',
      `"${toLabels}"`,
      tx.value,
      tx.status === 1 ? 'SUCCESS' : 'FAILED',
      tx.method_id || ''
    ];

    csv += row.join(',') + '\n';
  });

  fs.writeFileSync(outputPath, csv, 'utf8');
  console.log(`CSV report exported to: ${outputPath}`);
  return outputPath;
}

/**
 * Export report as Markdown (human-readable)
 */
function exportMarkdown(report, outputPath) {
  let md = `# ${report.metadata.title}\n\n`;

  md += `**Case ID:** ${report.metadata.caseId}\n\n`;
  md += `**Investigator:** ${report.metadata.investigator}\n\n`;
  md += `**Generated:** ${new Date(report.metadata.generatedAt).toLocaleString()}\n\n`;
  md += `---\n\n`;

  md += `## Executive Summary\n\n`;
  md += `- **Total Transactions:** ${report.statistics.totalTransactions}\n`;
  md += `- **Addresses Analyzed:** ${report.statistics.addressCount}\n`;
  md += `- **Flagged Addresses:** ${report.statistics.flaggedAddresses}\n`;
  md += `- **Chains Involved:** ${report.statistics.chains.join(', ')}\n`;
  md += `- **Date Range:** ${report.statistics.dateRange.earliest || 'N/A'} to ${report.statistics.dateRange.latest || 'N/A'}\n\n`;

  md += `---\n\n`;

  // Target Addresses
  md += `## Target Addresses\n\n`;
  report.metadata.addresses.forEach((addr, i) => {
    md += `${i + 1}. \`${addr}\`\n`;

    const attributions = report.addressAttributions[addr];
    if (attributions && attributions.length > 0) {
      md += `   - **FLAGGED**\n`;
      attributions.forEach(attr => {
        md += `     - **${attr.label}** (${attr.risk_level}) - ${attr.category}\n`;
        if (attr.description) {
          md += `       ${attr.description}\n`;
        }
      });
    }
  });

  md += `\n---\n\n`;

  // Flagged Interactions
  if (report.flaggedInteractions.length > 0) {
    md += `## Flagged Interactions\n\n`;
    md += `Found ${report.flaggedInteractions.length} transaction(s) involving flagged addresses.\n\n`;

    report.flaggedInteractions.forEach((interaction, i) => {
      md += `### ${i + 1}. Transaction ${interaction.txHash.substring(0, 16)}...\n\n`;
      md += `- **Timestamp:** ${interaction.timestamp || 'Unknown'}\n`;
      md += `- **From:** \`${interaction.from}\``;
      if (interaction.fromLabels.length > 0) {
        md += ` **[${interaction.fromLabels.join(', ')}]**`;
      }
      md += `\n`;
      md += `- **To:** \`${interaction.to}\``;
      if (interaction.toLabels.length > 0) {
        md += ` **[${interaction.toLabels.join(', ')}]**`;
      }
      md += `\n`;
      md += `- **Value:** ${interaction.value} wei\n\n`;
    });

    md += `---\n\n`;
  }

  // Transaction Timeline
  md += `## Transaction Timeline\n\n`;

  if (report.timeline.length === 0) {
    md += `No transactions found in the specified time range.\n\n`;
  } else {
    md += `| Timestamp | TX Hash | From | To | Value | Status |\n`;
    md += `|-----------|---------|------|----|---------|\n`;

    report.timeline.slice(0, 100).forEach(tx => {
      const timestamp = tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'N/A';
      const txHash = `\`${tx.tx_hash.substring(0, 12)}...\``;
      const from = `\`${tx.from_address.substring(0, 10)}...\``;
      const to = tx.to_address ? `\`${tx.to_address.substring(0, 10)}...\`` : 'CONTRACT';
      const status = tx.status === 1 ? '✅' : '❌';

      md += `| ${timestamp} | ${txHash} | ${from} | ${to} | ${tx.value} | ${status} |\n`;
    });

    if (report.timeline.length > 100) {
      md += `\n*Showing first 100 of ${report.timeline.length} transactions*\n\n`;
    }
  }

  md += `\n---\n\n`;

  md += `## Conclusion\n\n`;
  md += `This report documents on-chain activity for the addresses under investigation. `;
  md += `All transaction data is verifiable on the blockchain and immutable.\n\n`;

  md += `*Report generated by Blockchain Forensic Analysis System*\n`;

  fs.writeFileSync(outputPath, md, 'utf8');
  console.log(`Markdown report exported to: ${outputPath}`);
  return outputPath;
}

/**
 * Export comprehensive report in all formats
 */
function exportAllFormats(addresses, outputDir, options = {}) {
  const report = generateForensicReport(addresses, options);

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const baseName = options.caseId || `case-${Date.now()}`;

  const exports = {
    json: exportJSON(report, path.join(outputDir, `${baseName}.json`)),
    csv: exportCSV(report, path.join(outputDir, `${baseName}.csv`)),
    markdown: exportMarkdown(report, path.join(outputDir, `${baseName}.md`))
  };

  console.log(`\nForensic report exported in 3 formats:`);
  console.log(`  JSON: ${exports.json}`);
  console.log(`  CSV: ${exports.csv}`);
  console.log(`  Markdown: ${exports.markdown}`);

  return exports;
}

module.exports = {
  generateForensicReport,
  exportJSON,
  exportCSV,
  exportMarkdown,
  exportAllFormats
};
