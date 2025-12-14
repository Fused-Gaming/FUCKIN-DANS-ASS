# Project Summary

## FUCKIN-DANS-ASS - Blockchain Forensic Toolkit

**Target:** Illegal casino operations using "Dan" as a common alias/pseudonym in underground gambling networks.

## Mission

Build irrefutable blockchain evidence of illegal casino operations, fraud, and money laundering through comprehensive on-chain analysis and attribution.

## What Was Built

### Core Forensic System (`forensics/`)

**1. Transaction Fetcher** ([transaction-fetcher.js](../forensics/transaction-fetcher.js))
- Fetches complete transaction history for any address
- Supports all major EVM chains via Alchemy API
- Collects incoming AND outgoing transactions
- Stores in SQLite for persistent investigation

**2. Attribution Manager** ([attribution-manager.js](../forensics/attribution-manager.js))
- Tag addresses with labels (hack, fraud, scam, victim, etc.)
- Risk level classification (critical, high, medium, low, info)
- Event registry for known illegal operations
- Address clustering for related wallets
- Reputation checking system

**3. Timeline Analyzer** ([timeline-analyzer.js](../forensics/timeline-analyzer.js))
- Chronological transaction analysis
- Fund flow path tracing
- Suspicious pattern detection (rapid transfers, automation, etc.)
- Flagged address interaction tracking

**4. Report Exporter** ([report-exporter.js](../forensics/report-exporter.js))
- Generate court-ready forensic reports
- Export formats: JSON (data), CSV (transactions), Markdown (readable)
- Executive summaries with statistics
- Complete evidence documentation

**5. Main CLI** ([index.js](../forensics/index.js))
- Interactive forensic investigation interface
- 9 major investigation operations
- Guided workflows for common scenarios

### Enhanced Database Schema

**New Tables:**
- `transactions` - Complete transaction history with timestamps
- `address_attributions` - Tagged addresses with risk levels
- `known_events` - Registry of hacks, frauds, exploits
- `address_clusters` - Related address groupings

### Comprehensive Documentation

1. **[FORENSICS_GUIDE.md](FORENSICS_GUIDE.md)** - Complete toolkit manual
2. **[INVESTIGATION_EXAMPLES.md](INVESTIGATION_EXAMPLES.md)** - 5 real-world investigation workflows
3. **[QUICK_START.md](QUICK_START.md)** - 5-minute tutorial
4. **[README.md](../README.md)** - Project overview and setup

## Key Capabilities

### For Illegal Casino Investigations

1. **Address Attribution**
   - Tag known casino operator addresses
   - Mark victim wallets
   - Identify intermediary/laundering addresses
   - Build comprehensive networks

2. **Fund Flow Tracking**
   - Trace deposits to illegal casinos
   - Follow fund movements through mixers
   - Identify cash-out points (exchanges)
   - Track laundering chains

3. **Pattern Recognition**
   - Identify automated betting bots
   - Detect coordinated wallet activity
   - Find identical transfer patterns
   - Spot rapid fund movements

4. **Evidence Generation**
   - Export reports for law enforcement
   - Document complete transaction chains
   - Provide immutable blockchain proof
   - Generate court-admissible evidence

## Use Cases

### Investigation Workflow Example

```
1. Identify known casino operator wallet
2. Collect complete transaction history
3. Tag as "Illegal Casino Operator - Dan Network"
4. Analyze timeline for victim deposits
5. Tag all depositing addresses as victims
6. Trace where operator moved funds
7. Identify exchange cash-out addresses
8. Create cluster of all related addresses
9. Export comprehensive report for authorities
```

### Real-World Applications

- **Casino Operator Tracking**: Follow funds from player deposits through operations
- **Money Laundering Detection**: Track mixer usage and fund splitting patterns
- **Victim Identification**: Find all addresses that sent funds to illegal casinos
- **Asset Seizure**: Document addresses for law enforcement freezing
- **Network Mapping**: Build complete picture of illegal operation infrastructure

## Technical Stack

- **Language**: Node.js
- **Database**: SQLite (better-sqlite3)
- **API**: Alchemy (multi-chain RPC)
- **Chains**: Ethereum, Polygon, Arbitrum, Optimism, Base, Solana
- **CLI**: Prompts for interactive workflows

## Output Examples

### Reports Generated
```
forensic-reports/
├── CASE-2024-DAN-001.json      # Complete data export
├── CASE-2024-DAN-001.csv       # Transaction spreadsheet
└── CASE-2024-DAN-001.md        # Human-readable report
```

### Evidence Quality
- Every transaction is blockchain-verifiable
- Timestamps from block data (immutable)
- Complete chain of custody documented
- Attribution sources cited
- Risk assessments justified

## Installation & Usage

```bash
# Install
npm install

# Configure .env with Alchemy API key
cp .env.example .env

# Run forensic toolkit
npm run forensics
```

## Repository Structure

```
FUCKIN-DANS-ASS/
├── forensics/           # Core investigation toolkit
├── database/            # SQLite schema and functions
├── docs/                # Complete documentation
├── getWalletContracts/  # Basic wallet querying
├── viewHistory/         # Query history viewer
└── voice/               # Narrator system (optional)
```

## Legal Framework

**Legitimate Use:**
- Authorized law enforcement investigations
- Security research into illegal operations
- Compliance and regulatory reporting
- Victim asset recovery efforts

**Data Source:**
- All data is public blockchain information
- No unauthorized access required
- Immutable and verifiable evidence
- Court-admissible documentation

## Why "FUCKIN-DANS-ASS"?

"Dan" is a known alias/pseudonym used across multiple illegal casino operations. This toolkit is specifically designed to:
1. Track funds associated with Dan-operated casinos
2. Build attribution networks linking addresses
3. Generate evidence for prosecution
4. Enable asset seizure and victim recovery

The provocative name reflects the investigative target, not the tool's professionalism.

## Success Metrics

**What This Toolkit Enables:**
- ✅ Complete transaction history collection
- ✅ Multi-hop fund flow tracing
- ✅ Automated pattern detection
- ✅ Comprehensive evidence reports
- ✅ Attribution database building
- ✅ Cross-chain investigation support
- ✅ Court-ready documentation

## Next Steps for Investigators

1. **Build Attribution Database**
   - Tag known Dan-network addresses
   - Register known illegal casino events
   - Create clusters for related operations

2. **Collect Evidence**
   - Fetch transaction history for all targets
   - Trace fund flows to identify networks
   - Document patterns of illegal activity

3. **Generate Reports**
   - Export evidence in all formats
   - Share with law enforcement
   - Submit to exchanges for freezing
   - Provide to victims for recovery

4. **Continuous Monitoring**
   - Track new deposits to known casinos
   - Monitor for fund movements
   - Update attribution as operations evolve

## Contributing

This toolkit is open-source for legitimate investigative use. Contributions welcome for:
- Additional chain support
- Enhanced pattern detection algorithms
- Improved report templates
- Known bad actor address lists

## Disclaimer

This tool analyzes public blockchain data only. Use responsibly and legally. Intended for authorized investigations, security research, and compliance purposes.

---

**Built to expose and dismantle illegal casino operations through irrefutable blockchain evidence.**
