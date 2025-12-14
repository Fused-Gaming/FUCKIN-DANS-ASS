# Quick Start Guide

## 5-Minute Forensic Investigation Tutorial

This guide will walk you through a complete forensic investigation workflow in under 5 minutes.

## Prerequisites

1. Alchemy API key configured in `.env`
2. Dependencies installed (`npm install`)

## Scenario: Investigating a Suspicious Address

Let's investigate the address `0x742d35Cc6634C0532925a3b844Bc454e4438f44e` (a real address on Ethereum mainnet).

### Step 1: Launch Forensic Tool

```bash
npm run forensics
```

### Step 2: Collect Transaction History

1. Select: **"🔍 Collect Transaction History"**
2. Choose chain: **Ethereum Mainnet**
3. Enter address: `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`
4. Max transactions: `1000`

The system will fetch all transactions (incoming and outgoing) and store them in the database.

**Expected output:**
```
Fetching transaction history for 0x742d35Cc6634C0532925a3b844Bc454e4438f44e on Ethereum Mainnet...
Fetched 157 outgoing transactions...
Fetched 243 incoming transactions...

Total transactions found: 400

Saving transactions to database...
Successfully saved 400 transactions.
```

### Step 3: Analyze the Timeline

1. Run `npm run forensics` again
2. Select: **"📊 Analyze Timeline"**
3. Enter address: `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`

**What you'll see:**
- Chronological list of all transactions
- Activity summary (sent vs received)
- Any flagged addresses it interacted with
- Date range of activity

### Step 4: Detect Suspicious Patterns

1. Run `npm run forensics` again
2. Select: **"⚠️ Detect Suspicious Patterns"**
3. Enter address: `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`

**The system will automatically detect:**
- Rapid transfers (< 1 minute apart)
- High-value transactions (> 1 ETH)
- Contract interactions
- Failed transactions
- Identical value patterns (automation indicator)

### Step 5: Tag the Address (Optional)

If you determine the address is suspicious:

1. Run `npm run forensics` again
2. Select: **"🏷️ Tag/Attribute Address"**
3. Enter address: `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`
4. Label: `Test Investigation Address`
5. Category: `info`
6. Risk Level: `low`
7. Description: `Practice forensic investigation`

Now this address is tagged in your database!

### Step 6: Generate Report

1. Run `npm run forensics` again
2. Select: **"📄 Generate Forensic Report"**
3. Enter address: `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`
4. Case ID: `TEST-001`
5. Title: `Test Investigation`
6. Investigator: `Your Name`

**Output files created in `./forensic-reports/`:**
- `TEST-001.json` - Complete data export
- `TEST-001.csv` - Transaction log spreadsheet
- `TEST-001.md` - Human-readable report

### Step 7: Review the Report

Open `./forensic-reports/TEST-001.md` to see:
- Executive summary
- Address attributions
- Complete transaction timeline
- Flagged interactions
- Statistics

## Advanced: Multi-Address Investigation

### Investigating a Fund Flow Path

Let's trace funds from one address to another through intermediaries.

**Example addresses:**
- Source: `0xAAA...`
- Intermediary: `0xBBB...`
- Destination: `0xCCC...`

1. Collect history for all three addresses (repeat Step 2 for each)
2. Select: **"🔗 Trace Fund Flow Path"**
3. Enter: `0xAAA...,0xBBB...,0xCCC...`

The system shows all direct transfers between each address pair.

## Real-World Example Workflow

### Investigating a Phishing Scam

```bash
# 1. Collect history for phishing address
npm run forensics
# → Collect Transaction History
# → Enter phishing address

# 2. Detect patterns
npm run forensics
# → Detect Suspicious Patterns
# → Analyze for rapid incoming transfers (victims)

# 3. Tag the phishing address
npm run forensics
# → Tag/Attribute Address
# → Label: "ABC Token Phishing"
# → Category: phishing
# → Risk Level: high

# 4. Identify where scammer moved funds
npm run forensics
# → Analyze Timeline
# → Note all outgoing transfers to identify cash-out addresses

# 5. Tag all related addresses
# Repeat tagging for:
# - Victim addresses (category: victim, risk: info)
# - Intermediary wallets (category: intermediary, risk: medium)

# 6. Generate comprehensive report
npm run forensics
# → Generate Forensic Report
# → Include: phishing address + all intermediaries
# → Export for sharing with authorities/exchanges
```

## Pro Tips

### Efficient Workflow

1. **Start with known bad addresses** - Begin with confirmed exploiters/scammers
2. **Work outward** - Follow the money to discover related addresses
3. **Tag as you go** - Don't wait until the end to tag addresses
4. **Export regularly** - Generate reports at key milestones

### Pattern Recognition

**Rapid transfers + identical values** = Likely automated bot
**Failed transactions followed by successful** = Testing then executing
**High-value transfers to exchange** = Potential cash-out attempt
**Multiple small transfers** = Possible fund splitting/laundering

### Building Your Database

Start small, build over time:
1. Tag addresses as you investigate
2. Register major known events (hacks, exploits)
3. Create clusters for related addresses
4. Export and backup your database regularly

## Common Use Cases

### Track Stolen NFTs
```
1. Tag victim wallet
2. Collect history for victim + thief
3. Trace fund path through intermediaries
4. Tag all addresses in the chain
5. Export report for OpenSea/LooksRare
```

### Investigate DeFi Exploit
```
1. Register the exploit event
2. Tag primary exploiter address
3. Collect full transaction history
4. Detect patterns (flash loans, etc.)
5. Trace fund distribution
6. Create address cluster
7. Generate report for protocol team
```

### Phishing Detection
```
1. Collect history for phishing address
2. Detect rapid incoming transfers (victims)
3. Tag phishing address + victims
4. Trace where scammer moved funds
5. Identify exchange deposits
6. Generate report for exchanges to freeze
```

## Next Steps

- Read [FORENSICS_GUIDE.md](FORENSICS_GUIDE.md) for complete documentation
- Study [INVESTIGATION_EXAMPLES.md](INVESTIGATION_EXAMPLES.md) for detailed workflows
- Build your attribution database with known addresses
- Practice on public hack addresses to build skills

## Practice Addresses

These are real addresses from known public incidents you can practice investigating:

⚠️ **Disclaimer**: These are for educational/practice purposes only.

**Ronin Bridge Hack (2022)**
- `0x098B716B8Aaf21512996dC57EB0615e2383E2f96`

**Tornado Cash (Sanctioned Mixer)**
- `0x12D66f87A04A9E220743712cE6d9bB1B5616B8Fc` (0.1 ETH pool)

Try investigating these addresses to:
- Collect their transaction history
- Analyze patterns
- Generate reports
- Practice tagging and attribution

---

**You're ready to start investigating!** 🔍

Run `npm run forensics` and explore the toolkit.
