# Version Management

Current Version: **2.1.0**

## Version History

### v2.1.0 (Current)
- Comprehensive CI/CD pipeline for automated releases
- Automated documentation and release notes system
- YAML syntax fixes in release workflow
- Validation test improvements
- RPC URL handling fixes

## Versioning Scheme

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., 2.1.0)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Bumping Version

To bump the version:

1. Update the version number at the top of this file
2. Update `package.json` version to match
3. Add changelog entry for the new version in `CHANGELOG.md`
4. Commit changes
5. Create PR and merge to master to trigger automated release

## Release Process

Releases are automatically created when:
1. A pull request is merged into `master`
2. The version in `package.json` doesn't have an existing git tag
3. All tests pass

The release workflow will:
- Create a git tag (e.g., `v2.1.0`)
- Generate release notes from CHANGELOG.md
- Publish release to GitHub
- Optionally publish to npm (if configured)
