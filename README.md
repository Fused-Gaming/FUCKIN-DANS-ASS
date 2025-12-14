# Blockchain Forensic Analysis Toolkit

A comprehensive toolkit for blockchain forensic investigations, transaction analysis, and on-chain attribution using Alchemy's API across multiple networks.


## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and add your Alchemy API key:

```bash
cp .env.example .env
```

Edit `.env` and replace `your_api_key_here` with your actual Alchemy API key:

```env
ALCHEMY_API_KEY=your_actual_api_key_here
```

All RPC endpoints will automatically use your API key.

## Core Features

### Forensic Analysis System (NEW!)

Professional-grade blockchain forensic toolkit for investigating hacks, exploits, fraud, and tracking stolen funds.

```bash
npm run forensics
```

**Capabilities:**
- Transaction History Collection - Gather complete on-chain history for any address
- Address Attribution & Tagging - Label addresses with known entities/events
- Timeline Analysis - Chronological investigation of transaction sequences
- Fund Flow Tracing - Track stolen funds through multiple hops
- Pattern Detection - Identify suspicious behaviors and automation
- Event Registry - Catalog known hacks, exploits, and fraud events
- Address Clustering - Group related addresses with confidence scoring
- Report Generation - Export forensic reports in JSON, CSV, and Markdown

**Perfect for:**
- Security researchers investigating breaches
- Tracking stolen NFTs or funds
- Identifying phishing/scam operations
- Building evidence for law enforcement
- Exchange fraud detection
- DeFi exploit analysis

See **[FORENSICS_GUIDE.md](docs/FORENSICS_GUIDE.md)** for complete documentation.

---

## Available Scripts

### Get Wallet Contracts & Token Info

Query wallet information across multiple blockchain networks. The script automatically detects the chain type and provides relevant data:

- **EVM Chains**: Find all contracts deployed by a wallet address
- **Solana**: View wallet balance and token accounts

All queries are automatically saved to a local SQLite database with timestamps for historical tracking and analysis.

```bash
npm run getContracts
```

#### Supported Blockchains

**Ethereum:**
- Ethereum Mainnet
- Ethereum Sepolia (Testnet)
- Ethereum Holesky (Testnet)

**Layer 2 Networks:**
- Polygon Mainnet & Amoy Testnet
- Arbitrum One & Sepolia Testnet
- Optimism Mainnet & Sepolia Testnet
- Base Mainnet & Sepolia Testnet
- zkSync Era & Sepolia Testnet
- Blast Mainnet & Sepolia Testnet

**Other Networks:**
- Astar zkEVM Mainnet
- Zetachain Mainnet & Testnet

**Solana:**
- Solana Mainnet
- Solana Devnet

#### Usage

1. Run the command:
   ```bash
   npm run getContracts
   ```

2. Select your blockchain using arrow keys and press Enter

3. Enter the wallet address:
   - **EVM chains**: Valid Ethereum address (0x + 40 hex characters)
   - **Solana chains**: Valid Solana address (32-44 base58 characters)

4. View the results:
   - **EVM chains**: All contracts deployed by that address
   - **Solana chains**: SOL balance and token accounts owned by the wallet
   - Query is automatically saved to the database

### View Query History

Access your historical query data, statistics, and wallet timelines.

```bash
npm run viewHistory
```

#### Features

- **Recent Query History**: View your most recent queries with timestamps
- **Statistics**: See total queries, queries by chain type, and top queried chains
- **Wallet Timeline**: Track changes over time for specific wallet addresses
- **View Specific Query**: Look up detailed results from any past query by ID

#### Use Cases

- **Track Wallet Growth**: Monitor how many contracts a wallet deploys over time
- **Token Balance History**: See how Solana token holdings change
- **Cross-Chain Analysis**: Compare activity across different blockchains
- **Data Export**: All data stored in SQLite format for easy export and graphing

#### Database Schema

The SQLite database stores:
- **Queries Table**: Basic query info (timestamp, chain, wallet address)
- **EVM Contracts Table**: Contract addresses found for each query
- **Solana Wallets Table**: SOL balance and token account counts
- **Solana Token Accounts Table**: Detailed SPL token information

## Database & Data Storage

All query results are automatically saved to a local SQLite database (`database/alchemy-queries.db`). This allows you to:

- Track historical queries with precise timestamps
- Build timelines showing wallet activity over time
- Export data for graphing and analysis
- Compare results across different chains and time periods

The database file is excluded from git (`.gitignore`) to keep your query history private.

### Accessing the Database

You can access the SQLite database directly for custom analysis:

```bash
# Using sqlite3 CLI
sqlite3 database/alchemy-queries.db

# Example queries:
# SELECT * FROM queries ORDER BY timestamp DESC LIMIT 10;
# SELECT chain_name, COUNT(*) FROM queries GROUP BY chain_name;
```

Or use the built-in history viewer: `npm run viewHistory`

## Security

- **Never commit your `.env` file** - it contains your API keys
- **Never commit your database file** - it contains your query history
- The `.env` and `*.db` files are already in `.gitignore` to prevent accidental commits
- Share the `.env.example` file with your team so they know which variables to configure

## Adding New Scripts

1. Create a new folder for your script (e.g., `myScript/`)
2. Add an `index.js` file with your logic
3. Add an npm script to `package.json`:
   ```json
   "scripts": {
     "my-script": "node myScript/index.js"
   }
   ```
4. Use `require('dotenv').config()` at the top of your script to load environment variables
5. Access environment variables with `process.env.VARIABLE_NAME`

## Contributing

When adding new blockchain networks:

1. Add the RPC endpoint to `.env`:
   ```env
   NETWORK_NAME_RPC=https://network-name.g.alchemy.com/v2/your_api_key_here
   ```

2. Add the same to `.env.example` with placeholder:
   ```env
   NETWORK_NAME_RPC=https://network-name.g.alchemy.com/v2/your_api_key_here
   ```

3. Update the `SUPPORTED_CHAINS` array in the relevant script

## Documentation

- **[Quick Start Guide](docs/QUICK_START.md)** - 5-minute tutorial to get started
- **[Forensics Guide](docs/FORENSICS_GUIDE.md)** - Complete forensic toolkit documentation
- **[Investigation Examples](docs/INVESTIGATION_EXAMPLES.md)** - Real-world investigation workflows

## Quick Start Examples

### Basic Contract Query
```bash
npm run getContracts
# Select chain → Enter address → View deployed contracts
```

### Forensic Investigation
```bash
npm run forensics
# Follow interactive prompts for:
# - Collecting transaction history
# - Tagging suspicious addresses
# - Generating investigation reports
```

### View Historical Data
```bash
npm run viewHistory
# Review past queries and statistics
```

## Project Structure

```
alchemy-api/
├── database/
│   └── db.js                 # Database schema and functions
├── forensics/                # NEW: Forensic analysis toolkit
│   ├── index.js              # Main forensic CLI
│   ├── transaction-fetcher.js
│   ├── attribution-manager.js
│   ├── timeline-analyzer.js
│   └── report-exporter.js
├── getWalletContracts/       # Wallet contract queries
│   ├── index.js
│   └── solana-handler.js
├── viewHistory/              # Query history viewer
│   └── index.js
├── docs/                     # Documentation
│   ├── FORENSICS_GUIDE.md
│   └── INVESTIGATION_EXAMPLES.md
└── .env                      # Your API keys (git-ignored)
```

## Use Cases

### Security Research
- Investigate DeFi exploits and hacks
- Track stolen funds across chains
- Identify attack patterns and methodologies
- Build evidence timelines for disclosure

### Fraud Detection
- Detect phishing and scam operations
- Track fraudulent fund flows
- Identify victim addresses
- Generate reports for law enforcement

### Asset Recovery
- Trace stolen NFTs through multiple wallets
- Monitor for exchange deposits to freeze funds
- Document complete chain of custody
- Coordinate with exchanges and authorities

### Compliance & Intelligence
- Monitor sanctioned addresses (e.g., Tornado Cash)
- Build threat intelligence databases
- Track mixer usage patterns
- Maintain attribution databases

## Legal & Ethical Use

This toolkit analyzes **public blockchain data only**. All transaction information is:
- Publicly available on-chain
- Immutable and verifiable
- Not obtained through unauthorized access

**Intended for:**
- Legitimate security research
- Authorized investigations
- Incident response
- Compliance and regulatory reporting

**Not for:**
- Harassment or doxxing
- Creating false evidence
- Unauthorized surveillance
- Privacy violations

## Performance Tips

- Use free Alchemy tier for testing
- Upgrade for large-scale investigations (rate limits)
- Collect transaction history in batches
- Export reports regularly to save progress
- Build attribution database incrementally

## Troubleshooting

**"No transactions found"**
- Run "Collect Transaction History" first
- Verify address format is correct
- Check that RPC URL is configured

**Rate Limiting**
- Reduce `maxCount` parameter
- Add delays between requests
- Upgrade Alchemy plan for higher limits

**Database Issues**
- Database auto-creates on first run
- Located at `database/alchemy-queries.db`
- Can be deleted to reset (will lose data)

## License

ISC
