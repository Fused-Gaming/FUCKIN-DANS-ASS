#!/usr/bin/env node

/**
 * Version Bump Script
 *
 * Automatically bumps version across VERSION.md and package.json
 * Usage: node scripts/bump-version.js [major|minor|patch]
 */

const fs = require('fs');
const path = require('path');

const versionType = process.argv[2] || 'patch';

if (!['major', 'minor', 'patch'].includes(versionType)) {
  console.error('Usage: node scripts/bump-version.js [major|minor|patch]');
  process.exit(1);
}

// Read current version from package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const currentVersion = packageJson.version;

// Parse version
const [major, minor, patch] = currentVersion.split('.').map(Number);

// Calculate new version
let newVersion;
switch (versionType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

console.log(`Bumping version from ${currentVersion} to ${newVersion}`);

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✓ Updated package.json');

// Update VERSION.md
const versionMdPath = path.join(__dirname, '..', 'VERSION.md');
let versionMd = fs.readFileSync(versionMdPath, 'utf8');

// Update current version line
versionMd = versionMd.replace(
  /Current Version: \*\*[\d.]+\*\*/,
  `Current Version: **${newVersion}**`
);

// Add new version section to history
const today = new Date().toISOString().split('T')[0];
const newVersionSection = `### v${newVersion} (Current)
- [Add your changes here]

`;

versionMd = versionMd.replace(
  /## Version History\n\n/,
  `## Version History\n\n${newVersionSection}`
);

// Mark previous version as no longer current
versionMd = versionMd.replace(
  /### v[\d.]+ \(Current\)\n/g,
  (match, offset) => {
    // Only remove (Current) from versions that aren't the new one
    if (!match.includes(newVersion)) {
      return match.replace(' (Current)', '');
    }
    return match;
  }
);

fs.writeFileSync(versionMdPath, versionMd);
console.log('✓ Updated VERSION.md');

console.log(`\nVersion bumped to ${newVersion}`);
console.log('\nNext steps:');
console.log('1. Update VERSION.md with changelog for this version');
console.log('2. Update CHANGELOG.md if it exists');
console.log('3. Commit changes: git add -A && git commit -m "chore: bump version to ' + newVersion + '"');
console.log('4. Create PR and merge to trigger release');
