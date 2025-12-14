// Investigation Report Generator - PDF and ZIP exports
const fs = require('fs');
const path = require('path');
const { getInvestigationComplete } = require('../database/db');

/**
 * Generate investigation report in multiple formats
 * @param {string} caseId - Investigation case ID
 * @param {string} outputDir - Output directory for reports
 * @param {Object} options - Report options
 * @returns {Object} Generated report files
 */
async function generateInvestigationReport(caseId, outputDir = './investigation-reports', options = {}) {
  const {
    formats = ['txt', 'json', 'csv', 'html'],
    includeTransactions = true,
    includeEvidence = true,
    includeTimeline = true,
    createZip = true
  } = options;

  // Get complete investigation data
  const investigation = getInvestigationComplete(caseId);
  if (!investigation) {
    throw new Error(`Investigation ${caseId} not found`);
  }

  // Create output directory
  const reportDir = path.join(outputDir, `investigation-${caseId}-${Date.now()}`);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  console.log(`\nGenerating investigation report for case: ${investigation.case_name}`);
  console.log(`Output directory: ${reportDir}\n`);

  const generatedFiles = [];

  // Generate reports in requested formats
  if (formats.includes('txt')) {
    const txtFile = await generateTextReport(investigation, reportDir, options);
    generatedFiles.push(txtFile);
  }

  if (formats.includes('json')) {
    const jsonFile = await generateJsonReport(investigation, reportDir);
    generatedFiles.push(jsonFile);
  }

  if (formats.includes('csv')) {
    const csvFiles = await generateCsvReports(investigation, reportDir);
    generatedFiles.push(...csvFiles);
  }

  if (formats.includes('html')) {
    const htmlFile = await generateHtmlReport(investigation, reportDir, options);
    generatedFiles.push(htmlFile);
  }

  // Create ZIP archive if requested
  let zipFile = null;
  if (createZip) {
    zipFile = await createZipArchive(reportDir, caseId);
    generatedFiles.push(zipFile);
  }

  console.log(`\n✅ Report generation complete!`);
  console.log(`📁 Files generated: ${generatedFiles.length}`);
  generatedFiles.forEach(file => console.log(`   - ${path.basename(file)}`));

  return {
    caseId,
    reportDir,
    files: generatedFiles,
    zipFile
  };
}

/**
 * Generate text format report
 */
async function generateTextReport(investigation, outputDir, options) {
  const filePath = path.join(outputDir, 'investigation-report.txt');
  const lines = [];

  // Header
  lines.push('═'.repeat(80));
  lines.push('BLOCKCHAIN FORENSIC INVESTIGATION REPORT');
  lines.push('═'.repeat(80));
  lines.push('');

  // Investigation details
  lines.push('INVESTIGATION DETAILS');
  lines.push('-'.repeat(80));
  lines.push(`Case ID:            ${investigation.case_id}`);
  lines.push(`Case Name:          ${investigation.case_name}`);
  lines.push(`Status:             ${investigation.case_status.toUpperCase()}`);
  lines.push(`Priority:           ${investigation.priority.toUpperCase()}`);
  lines.push(`Case Type:          ${investigation.case_type || 'N/A'}`);
  lines.push(`Date Created:       ${new Date(investigation.date_created).toLocaleString()}`);
  lines.push(`Date Updated:       ${new Date(investigation.date_updated).toLocaleString()}`);
  if (investigation.date_closed) {
    lines.push(`Date Closed:        ${new Date(investigation.date_closed).toLocaleString()}`);
  }
  lines.push('');

  // Investigator information
  lines.push('INVESTIGATOR INFORMATION');
  lines.push('-'.repeat(80));
  lines.push(`Name:               ${investigation.investigator_name || 'N/A'}`);
  lines.push(`Email:              ${investigation.investigator_email || 'N/A'}`);
  lines.push(`Organization:       ${investigation.investigator_organization || 'N/A'}`);
  lines.push('');

  // Description
  if (investigation.description) {
    lines.push('CASE DESCRIPTION');
    lines.push('-'.repeat(80));
    lines.push(investigation.description);
    lines.push('');
  }

  // Addresses under investigation
  if (investigation.addresses && investigation.addresses.length > 0) {
    lines.push('ADDRESSES UNDER INVESTIGATION');
    lines.push('-'.repeat(80));
    investigation.addresses.forEach((addr, i) => {
      lines.push(`\n${i + 1}. ${addr.address}`);
      lines.push(`   Chain Type:      ${addr.chain_type}`);
      if (addr.role) lines.push(`   Role:            ${addr.role}`);
      if (addr.label) lines.push(`   Label:           ${addr.label}`);
      if (addr.category) lines.push(`   Category:        ${addr.category}`);
      if (addr.risk_level) lines.push(`   Risk Level:      ${addr.risk_level.toUpperCase()}`);
      if (addr.notes) lines.push(`   Notes:           ${addr.notes}`);
      lines.push(`   Date Added:      ${new Date(addr.date_added).toLocaleString()}`);
    });
    lines.push('');
  }

  // Evidence
  if (investigation.evidence && investigation.evidence.length > 0 && options.includeEvidence) {
    lines.push('EVIDENCE COLLECTED');
    lines.push('-'.repeat(80));
    investigation.evidence.forEach((ev, i) => {
      lines.push(`\n${i + 1}. ${ev.title}`);
      lines.push(`   Type:            ${ev.evidence_type}`);
      if (ev.description) lines.push(`   Description:     ${ev.description}`);
      if (ev.file_path) lines.push(`   File Path:       ${ev.file_path}`);
      if (ev.url) lines.push(`   URL:             ${ev.url}`);
      if (ev.hash) lines.push(`   Hash:            ${ev.hash}`);
      lines.push(`   Date Added:      ${new Date(ev.date_added).toLocaleString()}`);
    });
    lines.push('');
  }

  // Timeline
  if (investigation.timeline && investigation.timeline.length > 0 && options.includeTimeline) {
    lines.push('INVESTIGATION TIMELINE');
    lines.push('-'.repeat(80));
    investigation.timeline.forEach((event, i) => {
      lines.push(`\n${new Date(event.event_date).toLocaleString()}`);
      lines.push(`   Event Type:      ${event.event_type}`);
      lines.push(`   Description:     ${event.event_description}`);
      if (event.created_by) lines.push(`   Created By:      ${event.created_by}`);
    });
    lines.push('');
  }

  // Transaction summary
  if (investigation.transactions && investigation.transactions.length > 0 && options.includeTransactions) {
    lines.push('TRANSACTION SUMMARY');
    lines.push('-'.repeat(80));
    lines.push(`Total Transactions: ${investigation.transactions.length}`);
    lines.push(`Chains:             ${[...new Set(investigation.transactions.map(t => t.chain_name))].join(', ')}`);
    lines.push(`Date Range:         ${new Date(Math.min(...investigation.transactions.map(t => new Date(t.timestamp)))).toLocaleDateString()} - ${new Date(Math.max(...investigation.transactions.map(t => new Date(t.timestamp)))).toLocaleDateString()}`);
    lines.push('');
  }

  // Notes
  if (investigation.notes) {
    lines.push('INVESTIGATOR NOTES');
    lines.push('-'.repeat(80));
    lines.push(investigation.notes);
    lines.push('');
  }

  // Footer
  lines.push('═'.repeat(80));
  lines.push(`Report Generated: ${new Date().toLocaleString()}`);
  lines.push('Generated by: Blockchain Forensic Analysis Toolkit');
  lines.push('https://github.com/anthropics/claude-code');
  lines.push('═'.repeat(80));

  fs.writeFileSync(filePath, lines.join('\n'));
  console.log(`✓ Text report: investigation-report.txt`);
  return filePath;
}

/**
 * Generate JSON format report
 */
async function generateJsonReport(investigation, outputDir) {
  const filePath = path.join(outputDir, 'investigation-data.json');

  const report = {
    meta: {
      reportGenerated: new Date().toISOString(),
      toolkit: 'Blockchain Forensic Analysis Toolkit',
      version: '1.0.0'
    },
    investigation: {
      ...investigation,
      // Clean up for JSON export
      transactions: investigation.transactions?.map(t => ({
        hash: t.tx_hash,
        chain: t.chain_name,
        from: t.from_address,
        to: t.to_address,
        value: t.value,
        timestamp: t.timestamp,
        blockNumber: t.block_number,
        status: t.status
      }))
    }
  };

  fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  console.log(`✓ JSON report: investigation-data.json`);
  return filePath;
}

/**
 * Generate CSV format reports
 */
async function generateCsvReports(investigation, outputDir) {
  const files = [];

  // Addresses CSV
  if (investigation.addresses && investigation.addresses.length > 0) {
    const addressesFile = path.join(outputDir, 'addresses.csv');
    const headers = 'Address,Chain Type,Role,Label,Category,Risk Level,Notes,Date Added\n';
    const rows = investigation.addresses.map(a =>
      `"${a.address}","${a.chain_type}","${a.role || ''}","${a.label || ''}","${a.category || ''}","${a.risk_level || ''}","${a.notes || ''}","${a.date_added}"`
    ).join('\n');
    fs.writeFileSync(addressesFile, headers + rows);
    files.push(addressesFile);
    console.log(`✓ CSV report: addresses.csv`);
  }

  // Transactions CSV
  if (investigation.transactions && investigation.transactions.length > 0) {
    const txFile = path.join(outputDir, 'transactions.csv');
    const headers = 'Hash,Chain,Block,Timestamp,From,To,Value,Status\n';
    const rows = investigation.transactions.map(t =>
      `"${t.tx_hash}","${t.chain_name}","${t.block_number || ''}","${t.timestamp}","${t.from_address}","${t.to_address || ''}","${t.value || ''}","${t.status}"`
    ).join('\n');
    fs.writeFileSync(txFile, headers + rows);
    files.push(txFile);
    console.log(`✓ CSV report: transactions.csv`);
  }

  // Evidence CSV
  if (investigation.evidence && investigation.evidence.length > 0) {
    const evidenceFile = path.join(outputDir, 'evidence.csv');
    const headers = 'Type,Title,Description,File Path,URL,Hash,Date Added\n';
    const rows = investigation.evidence.map(e =>
      `"${e.evidence_type}","${e.title}","${e.description || ''}","${e.file_path || ''}","${e.url || ''}","${e.hash || ''}","${e.date_added}"`
    ).join('\n');
    fs.writeFileSync(evidenceFile, headers + rows);
    files.push(evidenceFile);
    console.log(`✓ CSV report: evidence.csv`);
  }

  return files;
}

/**
 * Generate HTML format report
 */
async function generateHtmlReport(investigation, outputDir, options) {
  const filePath = path.join(outputDir, 'investigation-report.html');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Investigation Report - ${investigation.case_id}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { border-bottom: 3px solid #2c3e50; padding-bottom: 20px; margin-bottom: 30px; }
        h1 { color: #2c3e50; font-size: 28px; margin-bottom: 10px; }
        h2 { color: #34495e; font-size: 20px; margin: 30px 0 15px; border-bottom: 2px solid #ecf0f1; padding-bottom: 10px; }
        .info-grid { display: grid; grid-template-columns: 200px 1fr; gap: 10px; margin: 20px 0; }
        .info-label { font-weight: bold; color: #555; }
        .info-value { color: #333; }
        .address-card { background: #f8f9fa; border-left: 4px solid #3498db; padding: 15px; margin: 15px 0; }
        .risk-critical { border-left-color: #e74c3c; }
        .risk-high { border-left-color: #e67e22; }
        .risk-medium { border-left-color: #f39c12; }
        .risk-low { border-left-color: #2ecc71; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 3px; font-size: 12px; font-weight: bold; }
        .badge-critical { background: #e74c3c; color: white; }
        .badge-high { background: #e67e22; color: white; }
        .badge-medium { background: #f39c12; color: white; }
        .badge-low { background: #2ecc71; color: white; }
        .badge-info { background: #3498db; color: white; }
        .badge-active { background: #2ecc71; color: white; }
        .badge-closed { background: #95a5a6; color: white; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #34495e; color: white; }
        tr:hover { background: #f8f9fa; }
        .timeline { position: relative; padding-left: 30px; }
        .timeline-item { padding: 15px; border-left: 2px solid #3498db; margin: 10px 0; position: relative; }
        .timeline-item:before { content: ''; position: absolute; left: -7px; top: 20px; width: 12px; height: 12px; border-radius: 50%; background: #3498db; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ecf0f1; text-align: center; color: #7f8c8d; }
        .mono { font-family: 'Courier New', monospace; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Blockchain Forensic Investigation Report</h1>
            <p style="color: #7f8c8d;">Case ID: ${investigation.case_id}</p>
        </div>

        <h2>Investigation Details</h2>
        <div class="info-grid">
            <div class="info-label">Case Name:</div>
            <div class="info-value"><strong>${investigation.case_name}</strong></div>
            <div class="info-label">Status:</div>
            <div class="info-value"><span class="badge badge-${investigation.case_status}">${investigation.case_status.toUpperCase()}</span></div>
            <div class="info-label">Priority:</div>
            <div class="info-value"><span class="badge badge-${investigation.priority}">${investigation.priority.toUpperCase()}</span></div>
            <div class="info-label">Case Type:</div>
            <div class="info-value">${investigation.case_type || 'N/A'}</div>
            <div class="info-label">Date Created:</div>
            <div class="info-value">${new Date(investigation.date_created).toLocaleString()}</div>
            <div class="info-label">Last Updated:</div>
            <div class="info-value">${new Date(investigation.date_updated).toLocaleString()}</div>
            ${investigation.date_closed ? `<div class="info-label">Date Closed:</div><div class="info-value">${new Date(investigation.date_closed).toLocaleString()}</div>` : ''}
        </div>

        <h2>Investigator Information</h2>
        <div class="info-grid">
            <div class="info-label">Name:</div>
            <div class="info-value">${investigation.investigator_name || 'N/A'}</div>
            <div class="info-label">Email:</div>
            <div class="info-value">${investigation.investigator_email || 'N/A'}</div>
            <div class="info-label">Organization:</div>
            <div class="info-value">${investigation.investigator_organization || 'N/A'}</div>
        </div>

        ${investigation.description ? `<h2>Case Description</h2><p>${investigation.description}</p>` : ''}

        ${investigation.addresses && investigation.addresses.length > 0 ? `
        <h2>Addresses Under Investigation (${investigation.addresses.length})</h2>
        ${investigation.addresses.map(addr => `
            <div class="address-card risk-${addr.risk_level || 'info'}">
                <div class="mono" style="font-weight: bold; margin-bottom: 10px;">${addr.address}</div>
                <div style="margin: 5px 0;">
                    <strong>Chain:</strong> ${addr.chain_type}
                    ${addr.label ? ` | <strong>Label:</strong> ${addr.label}` : ''}
                    ${addr.category ? ` | <strong>Category:</strong> ${addr.category}` : ''}
                    ${addr.risk_level ? ` | <span class="badge badge-${addr.risk_level}">${addr.risk_level.toUpperCase()}</span>` : ''}
                </div>
                ${addr.role ? `<div><strong>Role:</strong> ${addr.role}</div>` : ''}
                ${addr.notes ? `<div><strong>Notes:</strong> ${addr.notes}</div>` : ''}
                <div style="color: #7f8c8d; font-size: 12px; margin-top: 10px;">Added: ${new Date(addr.date_added).toLocaleString()}</div>
            </div>
        `).join('')}
        ` : ''}

        ${investigation.evidence && investigation.evidence.length > 0 && options.includeEvidence ? `
        <h2>Evidence Collected (${investigation.evidence.length})</h2>
        <table>
            <thead>
                <tr><th>Type</th><th>Title</th><th>Description</th><th>Date Added</th></tr>
            </thead>
            <tbody>
                ${investigation.evidence.map(ev => `
                    <tr>
                        <td>${ev.evidence_type}</td>
                        <td><strong>${ev.title}</strong></td>
                        <td>${ev.description || 'N/A'}</td>
                        <td>${new Date(ev.date_added).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}

        ${investigation.timeline && investigation.timeline.length > 0 && options.includeTimeline ? `
        <h2>Investigation Timeline (${investigation.timeline.length} Events)</h2>
        <div class="timeline">
            ${investigation.timeline.map(event => `
                <div class="timeline-item">
                    <div style="font-weight: bold; color: #3498db;">${new Date(event.event_date).toLocaleString()}</div>
                    <div><strong>${event.event_type}:</strong> ${event.event_description}</div>
                    ${event.created_by ? `<div style="font-size: 12px; color: #7f8c8d;">By: ${event.created_by}</div>` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${investigation.transactions && investigation.transactions.length > 0 && options.includeTransactions ? `
        <h2>Transaction Summary</h2>
        <div class="info-grid">
            <div class="info-label">Total Transactions:</div>
            <div class="info-value">${investigation.transactions.length}</div>
            <div class="info-label">Chains:</div>
            <div class="info-value">${[...new Set(investigation.transactions.map(t => t.chain_name))].join(', ')}</div>
            <div class="info-label">Date Range:</div>
            <div class="info-value">${new Date(Math.min(...investigation.transactions.map(t => new Date(t.timestamp)))).toLocaleDateString()} - ${new Date(Math.max(...investigation.transactions.map(t => new Date(t.timestamp)))).toLocaleDateString()}</div>
        </div>
        <p style="margin-top: 15px;"><em>Full transaction details available in transactions.csv</em></p>
        ` : ''}

        ${investigation.notes ? `<h2>Investigator Notes</h2><p style="background: #f8f9fa; padding: 15px; border-left: 4px solid #3498db;">${investigation.notes}</p>` : ''}

        <div class="footer">
            <p>Report Generated: ${new Date().toLocaleString()}</p>
            <p>Generated by: <strong>Blockchain Forensic Analysis Toolkit</strong></p>
            <p style="margin-top: 10px; font-size: 12px;">This report contains confidential investigation data. Handle according to your organization's security policies.</p>
        </div>
    </div>
</body>
</html>`;

  fs.writeFileSync(filePath, html);
  console.log(`✓ HTML report: investigation-report.html`);
  return filePath;
}

/**
 * Create ZIP archive of all report files
 */
async function createZipArchive(reportDir, caseId) {
  const archiver = require('archiver');
  const zipPath = path.join(path.dirname(reportDir), `investigation-${caseId}-report.zip`);

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`\n✓ ZIP archive created: ${path.basename(zipPath)}`);
      console.log(`  Total size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
      resolve(zipPath);
    });

    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.directory(reportDir, false);
    archive.finalize();
  });
}

module.exports = {
  generateInvestigationReport,
  generateTextReport,
  generateJsonReport,
  generateCsvReports,
  generateHtmlReport,
  createZipArchive
};
