# Automated Publishing Setup

This document describes the automated npm publishing workflow for the blockchain-forensic-toolkit package.

## Overview

The package is automatically published to npm whenever a new version tag is pushed to GitHub. The workflow uses GitHub Actions and requires proper configuration of npm authentication.

## Prerequisites

1. **npm Account**: You need an npm account with publishing rights to the `blockchain-forensic-toolkit` package
2. **npm Access Token**: A valid npm access token with publish permissions
3. **GitHub Repository Access**: Admin access to configure repository secrets

## Setup Instructions

### 1. Generate npm Access Token

1. Log in to [npmjs.com](https://www.npmjs.com)
2. Click on your profile picture → Access Tokens
3. Click "Generate New Token" → "Classic Token"
4. Select "Automation" type (recommended for CI/CD)
5. Copy the generated token (starts with `npm_`)

### 2. Add Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token
6. Click "Add secret"

### 3. Publishing Process

The workflow automatically triggers on:

- **Tag Push**: When you push a tag starting with `v` (e.g., `v2.1.0`)
- **Manual Trigger**: Through the Actions tab in GitHub

#### Publishing a New Version

```bash
# Update version in package.json
npm version patch  # or minor, or major

# Push the version commit and tag
git push origin master --tags
```

#### Manual Publishing

1. Go to Actions tab in GitHub
2. Select "Publish to npm" workflow
3. Click "Run workflow"
4. Select the branch and click "Run workflow"

## Workflow Details

The workflow ([.github/workflows/publish.yml](.github/workflows/publish.yml)) performs:

1. Checks out the code
2. Sets up Node.js 18
3. Installs dependencies
4. Builds the MCP server
5. Runs validation tests
6. Publishes to npm with provenance

### Provenance

The workflow uses `--provenance` flag which:
- Links the published package to the source code
- Provides transparency about where and how the package was built
- Enhances supply chain security

## Troubleshooting

### Token Expiration

If publishing fails with authentication errors:
1. Check if your npm token has expired
2. Generate a new token
3. Update the `NPM_TOKEN` secret in GitHub

### Permission Errors

If you get permission errors:
1. Verify you have publishing rights to the package
2. Ensure the token has "Automation" or "Publish" permissions
3. Check if 2FA is required (use automation token to bypass)

### Build Failures

If the build fails:
1. Check the Actions logs for specific errors
2. Ensure all dependencies are correctly specified
3. Test the build locally: `npm ci && npm run mcp:build`

## Version Management

### Semantic Versioning

Follow semantic versioning (semver):
- **PATCH** (2.1.0 → 2.1.1): Bug fixes
- **MINOR** (2.1.0 → 2.2.0): New features, backwards compatible
- **MAJOR** (2.1.0 → 3.0.0): Breaking changes

### Version Commands

```bash
npm version patch -m "fix: bug description"
npm version minor -m "feat: new feature"
npm version major -m "breaking: breaking change"

git push origin master --tags
```

## Security Best Practices

1. **Never commit npm tokens** to the repository
2. **Use Automation tokens** for CI/CD (bypass 2FA)
3. **Rotate tokens regularly** (every 90 days recommended)
4. **Monitor package downloads** for unusual activity
5. **Enable 2FA** on your npm account

## Package Distribution

The published package includes:
- CLI binaries (`forensics`, `blockchain-forensics`)
- Core forensics tools
- Database browser
- MCP server integration
- Complete documentation

See [package.json](../package.json) `files` field for complete distribution list.

## References

- [npm Access Tokens Documentation](https://docs.npmjs.com/about-access-tokens)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [npm Provenance](https://docs.npmjs.com/generating-provenance-statements)
