# MCP (Model Context Protocol) Integration Guide

## Overview

The Blockchain Forensic Analysis Toolkit now supports integration with Etherscan's Model Context Protocol (MCP) server, enabling AI-powered blockchain data analysis and forensic investigations through standardized interfaces.

## What is MCP?

Model Context Protocol (MCP) is a standardized protocol that allows AI models to interact with external data sources and services. By integrating Etherscan's MCP server, this toolkit can:

- Query blockchain data programmatically through AI assistants
- Automate forensic analysis workflows
- Access real-time Etherscan data within AI conversations
- Combine multiple blockchain data sources seamlessly

## Supported Etherscan MCP Server

We recommend using **@xiaok/etherscan-mcp-server** which provides:

- ✅ Balance checking for Ethereum addresses
- ✅ Transaction history retrieval
- ✅ ERC20 token transfer tracking
- ✅ Contract ABI fetching
- ✅ Real-time gas price monitoring
- ✅ ENS name resolution
- ✅ Support for 60+ blockchain networks

**Repository**: [xiaok/etherscan-mcp](https://github.com/xiaok/etherscan-mcp)
**Documentation**: [Etherscan MCP Docs](https://docs.etherscan.io/mcp)

## Installation

### Prerequisites

- Node.js 18 or higher
- Valid Etherscan API key (get one at https://etherscan.io/apis)
- Claude Desktop, VSCode with MCP support, or another MCP-compatible client

### Quick Start

The toolkit includes a pre-configured MCP setup in `.mcp.json`:

```json
{
  "mcpServers": {
    "etherscan": {
      "description": "Etherscan MCP Server for blockchain data integration",
      "command": "npx",
      "args": ["-y", "@xiaok/etherscan-mcp-server"],
      "env": {
        "ETHERSCAN_API_KEY": "${ETHERSCAN_API_KEY}"
      }
    }
  }
}
```

### Setup Steps

1. **Ensure Etherscan API Key is Configured**

   Add to your `.env` file:
   ```bash
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   ```

2. **For Claude Desktop Integration**

   Add to your Claude Desktop MCP configuration file:

   **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   **Linux**: `~/.config/Claude/claude_desktop_config.json`

   ```json
   {
     "mcpServers": {
       "etherscan": {
         "command": "npx",
         "args": ["-y", "@xiaok/etherscan-mcp-server"],
         "env": {
           "ETHERSCAN_API_KEY": "your_actual_api_key_here"
         }
       }
     }
   }
   ```

3. **For VSCode with Continue Extension**

   Add to your Continue MCP configuration:
   ```json
   {
     "mcpServers": {
       "etherscan": {
         "command": "npx",
         "args": ["-y", "@xiaok/etherscan-mcp-server"],
         "env": {
           "ETHERSCAN_API_KEY": "your_actual_api_key_here"
         }
       }
     }
   }
   ```

4. **Restart Your MCP Client**

   After configuration, restart Claude Desktop, VSCode, or your MCP client to load the Etherscan server.

## Available MCP Tools

Once configured, you can use these tools through your AI assistant:

### 1. Check Balance
```
Check the ETH balance of address 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2
```
Returns balance in both Wei and ETH formats.

### 2. Get Transaction History
```
Show me the last 10 transactions for 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2
```
Returns detailed transaction data including hashes, timestamps, values, and gas used.

### 3. Get Token Transfers
```
List ERC20 token transfers for address 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2
```
Shows all ERC20 token transfer events.

### 4. Get Contract ABI
```
Fetch the ABI for contract 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984
```
Returns the contract's Application Binary Interface in JSON format.

### 5. Get Gas Prices
```
What are the current Ethereum gas prices?
```
Returns real-time gas price estimates in Gwei (low, average, high).

### 6. Resolve ENS Name
```
What ENS name is associated with 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045?
```
Returns the ENS name if one exists for the address.

## Integration with Forensic Toolkit

### Combined Workflow Example

The MCP integration complements the existing forensic tools:

1. **Use MCP to Query Live Data**:
   ```
   Check the balance and recent transactions for suspect address 0x123...
   ```

2. **Import into Forensics Database**:
   ```bash
   npm run forensics
   # Select: Collect Transaction History
   # Enter the address
   ```

3. **MCP Auto-Tags Addresses**:
   The toolkit automatically imports Etherscan labels for discovered addresses

4. **Analyze with AI**:
   ```
   Based on the transaction patterns and Etherscan tags, what's the risk profile?
   ```

5. **Generate Investigation Report**:
   ```bash
   npm run forensics
   # Select: Investigation Management > Generate Investigation Report
   ```

### Advanced Use Cases

**Automated Triage**:
```
For each address in my investigation, check their current balance and recent activity. Flag any with suspicious patterns.
```

**Contract Analysis**:
```
Fetch the ABI for this contract and analyze the functions for potential vulnerabilities.
```

**Gas Analysis**:
```
Track gas prices over the investigation period and identify if transactions were optimized to avoid detection.
```

**ENS Correlation**:
```
Check if any addresses in this cluster have ENS names that might reveal the entity behind them.
```

## MCP Server Alternatives

If the recommended server doesn't meet your needs, consider these alternatives:

### 1. crazyrabbitLTC/mcp-etherscan-server
Repository: https://github.com/crazyrabbitLTC/mcp-etherscan-server

**Setup**:
```bash
git clone https://github.com/crazyrabbitLTC/mcp-etherscan-server
cd mcp-etherscan-server
npm install
npm run build
```

**Configuration**:
```json
{
  "mcpServers": {
    "etherscan": {
      "command": "node",
      "args": ["/path/to/mcp-etherscan-server/build/index.js"],
      "env": {
        "ETHERSCAN_API_KEY": "your_api_key"
      }
    }
  }
}
```

### 2. huahuayu/etherscan-mcp-server
Uses Etherscan API v2 endpoints.

Repository: https://github.com/huahuayu/etherscan-mcp-server

### 3. Official Etherscan MCP (Coming Soon)
Check https://docs.etherscan.io/mcp for official implementations.

## Troubleshooting

### MCP Server Not Starting

**Symptom**: Server doesn't appear in Claude Desktop or throws errors

**Solutions**:
1. Verify Node.js version: `node --version` (should be 18+)
2. Check API key is valid and has quota remaining
3. Ensure `npx` is available: `npx --version`
4. Check MCP client logs for detailed errors

### API Key Errors

**Symptom**: "Invalid API Key" or "Unauthorized" errors

**Solutions**:
1. Verify `.env` file has correct `ETHERSCAN_API_KEY`
2. Ensure no extra spaces or quotes in the API key
3. Check API key status on Etherscan dashboard
4. Verify API key permissions (some keys are limited to specific endpoints)

### Rate Limiting

**Symptom**: "Rate limit exceeded" errors

**Solutions**:
1. Free tier: 5 calls/second, 100,000 calls/day
2. Upgrade to Standard tier for higher limits
3. Use chain-specific API keys to distribute load
4. Add delays between requests in bulk operations

### Commands Not Available

**Symptom**: MCP tools don't appear in AI assistant

**Solutions**:
1. Restart MCP client after configuration changes
2. Verify `.mcp.json` or config file syntax is valid JSON
3. Check that environment variables are properly substituted
4. Try `npx -y @xiaok/etherscan-mcp-server` manually to test

## Best Practices

### 1. Security
- Never commit API keys to version control
- Use environment variables for sensitive data
- Rotate API keys periodically
- Monitor API key usage on Etherscan dashboard

### 2. Performance
- Cache frequently accessed data
- Use batch operations when possible
- Respect rate limits to avoid API blocks
- Use chain-specific keys for better throughput

### 3. Integration
- Combine MCP queries with local database for comprehensive analysis
- Use MCP for real-time data, database for historical analysis
- Tag and categorize MCP results for investigation tracking
- Export MCP findings to investigation reports

### 4. Workflow
- Start with MCP for initial reconnaissance
- Import detailed data into forensics database
- Use database tools for deep analysis
- Reference MCP for validation and updates
- Generate final reports with combined insights

## Supported Chains

The Etherscan MCP server supports 60+ blockchain networks including:

- **Ethereum**: Mainnet, Sepolia, Goerli, Holesky
- **Polygon**: Mainnet, Amoy Testnet
- **Arbitrum**: One, Nova, Sepolia
- **Optimism**: Mainnet, Sepolia
- **Base**: Mainnet, Sepolia
- **BSC**: Mainnet, Testnet
- **Avalanche**: C-Chain, Fuji
- **Fantom**: Mainnet, Testnet
- And many more...

Full list: https://docs.etherscan.io/etherscan-v2/getting-started/supported-chains

## API Rate Limits by Chain

Each chain explorer has its own API rate limits. Common limits:

| Chain | Free Tier | Standard Tier |
|-------|-----------|---------------|
| Ethereum | 5/sec, 100k/day | 10/sec, unlimited |
| Polygon | 5/sec, 100k/day | 10/sec, unlimited |
| Arbitrum | 5/sec, 100k/day | 10/sec, unlimited |
| Optimism | 5/sec, 100k/day | 10/sec, unlimited |
| Base | 5/sec, 100k/day | 10/sec, unlimited |

## Resources

- **Official MCP Documentation**: https://docs.etherscan.io/mcp
- **Etherscan API Docs**: https://docs.etherscan.io/
- **MCP Specification**: https://modelcontextprotocol.io/
- **Claude Desktop MCP Guide**: https://modelcontextprotocol.io/quickstart/client
- **Supported Chains**: https://docs.etherscan.io/etherscan-v2/getting-started/supported-chains

## Contributing

If you develop additional MCP integrations or improvements:

1. Test thoroughly with multiple chains
2. Document configuration and usage
3. Submit pull requests with examples
4. Share workflows and use cases

## Examples

### Example 1: Investigating a Suspicious Address

```
AI: I'll help you investigate this address using the Etherscan MCP.

1. Checking current balance...
   Address 0x123... has 45.7 ETH

2. Fetching recent transactions...
   Found 156 transactions in the last 30 days
   Most recent: Large transfer of 50 ETH 2 hours ago

3. Checking ERC20 transfers...
   Transferred 10,000 USDT to 0xabc... yesterday

4. Resolving ENS...
   No ENS name associated

5. Checking gas patterns...
   Using high gas prices consistently (possible urgency)

Recommendation: This address shows high-value recent activity.
Let me import this into the forensics database for deeper analysis.
```

### Example 2: Contract Verification

```
AI: Let me analyze this smart contract using MCP.

1. Fetching contract ABI...
   Contract is verified on Etherscan

2. Analyzing functions...
   - Found 12 public functions
   - Identified potential reentrancy in withdraw()
   - No emergency pause mechanism

3. Checking deployment...
   Deployed 30 days ago
   Creator address: 0xdef...

4. Transaction volume...
   347 interactions in 30 days
   Total value locked: 2,500 ETH

Recommendation: Import contract address and all interactions
for comprehensive forensic analysis.
```

## Future Enhancements

Planned MCP integrations:

- [ ] Multi-chain correlation across MCP servers
- [ ] Automated risk scoring using MCP data
- [ ] Real-time monitoring with MCP webhooks
- [ ] Graph analysis combining MCP and local data
- [ ] Custom MCP tools for specialized forensics

## Support

For MCP-specific issues:
- Check official MCP documentation
- Review Etherscan API status
- Verify client configuration
- Test with `npx` command manually

For toolkit integration:
- See main README.md
- Check ETHERSCAN_AUTO_IMPORT.md
- Review database documentation
- Open GitHub issue with details
