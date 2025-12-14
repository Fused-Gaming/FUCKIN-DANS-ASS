# Contributing to Blockchain Forensic Analysis Toolkit

Thank you for your interest in contributing to this project! We welcome contributions from the security research and blockchain investigation community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Contribution Guidelines](#contribution-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Community](#community)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### 🔗 Add Blockchain Support

Help expand coverage to additional networks:

1. Add RPC endpoint to `.env.example`
2. Update `SUPPORTED_CHAINS` array in relevant scripts
3. Test transaction fetching and attribution
4. Document any chain-specific quirks
5. Submit PR with examples

**Example chains to add:**
- Avalanche C-Chain
- BNB Smart Chain
- Fantom Opera
- Gnosis Chain
- Celo

### 🧠 Improve Pattern Detection

Enhance the anomaly detection algorithms:

- New suspicious behavior patterns
- Machine learning integration
- Statistical anomaly detection
- Graph analysis for address clustering
- Timing analysis improvements

### 📊 Enhance Reporting

Improve evidence generation:

- Additional export formats (PDF, HTML)
- Visualizations (graphs, charts, timelines)
- Template customization
- Multi-language support
- Automated evidence packaging

### 🗄️ Contribute Intelligence

Build the attribution database:

- Known bad actor addresses
- Hack/exploit event details
- Mixer and tumbler addresses
- Exchange hot wallet addresses
- Sanctioned entity lists

**Format for submissions:**
```javascript
{
  address: "0x...",
  chainType: "evm",
  label: "XYZ Hack Exploiter",
  category: "hack",
  riskLevel: "critical",
  description: "Primary exploiter address from XYZ Protocol hack",
  source: "Protocol team disclosure",
  referenceUrl: "https://..."
}
```

### 📚 Improve Documentation

Help make the toolkit more accessible:

- Tutorial videos or screencasts
- Additional investigation examples
- Translations to other languages
- API documentation
- Architecture diagrams

### 🐛 Report Bugs

Found a bug? Help us fix it:

1. **Check existing issues** - Search to avoid duplicates
2. **Create detailed report** - Include:
   - Steps to reproduce
   - Expected vs actual behavior
   - System information (OS, Node version)
   - Error messages and stack traces
   - Screenshots if applicable
3. **Label appropriately** - Use `bug` label

### 💡 Request Features

Have an idea for improvement?

1. **Check existing issues** - See if already requested
2. **Describe the use case** - Explain the problem it solves
3. **Propose solution** - Outline your suggested approach
4. **Consider alternatives** - What other approaches exist?
5. **Label appropriately** - Use `enhancement` label

## Development Setup

### Prerequisites

- Node.js v16.0.0+
- npm v7.0.0+
- Git
- Alchemy API key

### Initial Setup

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR-USERNAME/FUCKIN-DANS-ASS.git
cd FUCKIN-DANS-ASS

# Add upstream remote
git remote add upstream https://github.com/Fused-Gaming/FUCKIN-DANS-ASS.git

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your ALCHEMY_API_KEY to .env

# Verify setup
npm run forensics
```

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# ...

# Test your changes
npm run forensics
npm run getContracts
npm run viewHistory

# Commit with descriptive message
git add .
git commit -m "feat: add support for Avalanche C-Chain"

# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### Keep Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge into your main branch
git checkout master
git merge upstream/master

# Update your fork
git push origin master
```

## Contribution Guidelines

### Before Starting

1. **Check existing PRs** - Someone may already be working on it
2. **Open an issue** - Discuss major changes before implementing
3. **One feature per PR** - Keep changes focused and reviewable
4. **Follow coding standards** - See below

### Code Quality

- **Test thoroughly** - Ensure all features work across supported chains
- **Handle errors gracefully** - Provide helpful error messages
- **Document new features** - Update relevant documentation
- **Keep it simple** - Prefer clarity over cleverness
- **Maintain consistency** - Follow existing code patterns

### Commit Messages

Use conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(forensics): add Avalanche C-Chain support

- Add RPC endpoint configuration
- Update SUPPORTED_CHAINS array
- Test transaction fetching
- Add documentation

Closes #123
```

```
fix(attribution): handle null timestamp in transactions

Previously crashed when timestamp was null.
Now gracefully handles missing timestamps.

Fixes #456
```

## Pull Request Process

### Before Submitting

- [ ] Code follows project style
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] Branch is up-to-date with master
- [ ] Self-review completed

### Submission

1. **Create Pull Request** on GitHub
2. **Fill out template** - Describe changes thoroughly
3. **Link related issues** - Use `Closes #123` syntax
4. **Request review** - Tag relevant maintainers
5. **Be responsive** - Address feedback promptly

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests (if applicable)

## Related Issues
Closes #123
```

### Review Process

1. **Maintainer review** - Usually within 3-5 days
2. **Address feedback** - Make requested changes
3. **Re-review** - Once changes are made
4. **Merge** - Maintainer merges when approved

## Coding Standards

### JavaScript Style

```javascript
// Use const/let, not var
const API_KEY = process.env.ALCHEMY_API_KEY;
let transactionCount = 0;

// Descriptive variable names
const primaryExploiterAddress = '0x...';
const victimWalletAddresses = [];

// Arrow functions for callbacks
transactions.map(tx => tx.hash);

// Async/await over promises
async function fetchTransactions(address) {
  try {
    const data = await fetch(rpcUrl, options);
    return data.result;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

// JSDoc comments for public functions
/**
 * Fetch transaction history for an address
 * @param {string} address - Wallet address to query
 * @param {string} rpcUrl - RPC endpoint URL
 * @param {string} chainName - Human-readable chain name
 * @returns {Promise<Array>} Array of transaction objects
 */
async function fetchTransactionHistory(address, rpcUrl, chainName) {
  // ...
}
```

### Database Queries

```javascript
// Use prepared statements
const stmt = db.prepare(`
  SELECT * FROM transactions
  WHERE from_address = ? OR to_address = ?
  ORDER BY timestamp DESC
`);

const results = stmt.all(address, address);
```

### Error Handling

```javascript
// Provide context in error messages
if (!rpcUrl) {
  throw new Error(`RPC URL not configured for ${chainName}`);
}

// Log errors with enough detail for debugging
catch (error) {
  console.error(`Failed to fetch transactions for ${address}:`, error.message);
  console.error('Stack trace:', error.stack);
}
```

### File Organization

```
module/
├── index.js           # Main entry point
├── submodule.js       # Supporting functionality
└── README.md          # Module documentation
```

## Community

### Communication Channels

- **GitHub Issues** - Bug reports, feature requests
- **GitHub Discussions** - General questions, ideas
- **Pull Requests** - Code contributions

### Getting Help

- Read the [documentation](docs/)
- Search [existing issues](https://github.com/Fused-Gaming/FUCKIN-DANS-ASS/issues)
- Ask in [discussions](https://github.com/Fused-Gaming/FUCKIN-DANS-ASS/discussions)

### Recognition

Contributors are recognized in:
- Git commit history
- Pull request credits
- Future release notes
- Project acknowledgments

## License

By contributing, you agree that your contributions will be licensed under the ISC License.

---

**Thank you for contributing to blockchain forensics and helping expose financial crimes!** 🔍
