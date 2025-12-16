# 📋 Command Reference

## 🚀 Quick Start Commands

### For New Users
```bash
npm run quickstart        # Install everything + start forensic analysis
npm run help              # Show all available commands
```

### For Existing Installations
```bash
npm run validate          # Verify everything works
npm run forensics         # Launch forensic interface
```

---

## 📊 Core Forensics Commands

| Command | Description |
|---------|-------------|
| `npm run forensics` | Launch main forensic analysis interface |
| `npm run db` | Open database browser for SQL queries |
| `npm run db:browser` | Alternative database browser |

---

## 🤖 MCP (AI Integration) Commands

| Command | Description |
|---------|-------------|
| `npm run mcp:test` | Test Etherscan MCP server connectivity |
| `npm run mcp:setup` | Complete MCP installation and setup |
| `npm run mcp:build` | Build MCP server from TypeScript source |
| `npm run mcp:start` | Start MCP server manually (for debugging) |
| `npm run mcp:install` | Install MCP server dependencies |

---

## 🔧 Setup & Testing Commands

| Command | Description |
|---------|-------------|
| `npm run setup` | Install main project + setup MCP server |
| `npm run validate` | Run all test suites (MCP + forensics) |
| `npm run investigation:test` | Test investigation management system |

---

## 📋 Legacy Commands

| Command | Description |
|---------|-------------|
| `npm run getContracts` | Get wallet contract information |
| `npm run viewHistory` | View transaction history |

---

## 🎯 Workflows & Examples

### Complete New User Setup
```bash
git clone https://github.com/Fused-Gaming/blockchain-forensic-toolkit.git
cd blockchain-forensic-toolkit
cp .env.example .env
# Edit .env with your ETHERSCAN_API_KEY and investigator info
npm run quickstart
```

### Verify Your Installation
```bash
npm run validate
# Expected: All tests pass with ✅ FULLY OPERATIONAL status
```

### Test AI Integration Only
```bash
npm run mcp:test
# Expected: 3/3 MCP tests pass with real blockchain data
```

### Debug MCP Server
```bash
npm run mcp:build   # Ensure latest build
npm run mcp:start   # Start server manually
# Server will stay running for debugging
```

---

## 📖 Command Categories

### 🔍 Investigation Workflow
1. `npm run forensics` - Start investigation
2. `npm run db` - Query investigation data
3. Generate reports and evidence

### 🤖 AI-Powered Analysis  
1. `npm run mcp:setup` - Setup AI integration
2. Configure AI client (Claude Desktop, VSCode)
3. Use AI assistants for blockchain queries

### 🛠️ Development & Testing
1. `npm run validate` - Full system test
2. `npm run mcp:test` - AI integration test
3. `npm run investigation:test` - Forensics test

---

## 🚨 Troubleshooting

### MCP Issues
```bash
npm run mcp:test          # Test connectivity
npm run mcp:build && npm run mcp:test  # Rebuild + test
```

### Investigation Issues
```bash
npm run investigation:test  # Test forensics system
npm run db                   # Check database integrity
```

### Full Reset
```bash
rm -rf node_modules/ mcp-etherscan-server/node_modules/
npm run setup               # Reinstall everything
```

---

## 📚 Additional Resources

- [MCP Integration Guide](MCP_INTEGRATION.md)
- [Database Documentation](database/README.md) 
- [Quick Start Guide](DATABASE_SETUP.md)
- [Full Documentation](docs/)
