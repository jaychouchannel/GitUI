# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-10-27

### Added
- Phase 4: Packaging and Release Configuration
  - Added electron-builder for cross-platform packaging
  - Added packaging scripts for Windows, macOS, and Linux
  - Created comprehensive packaging and release guide (docs/PACKAGING_GUIDE.md)
  - Added GitHub Actions workflow for automated releases
  - Added build resources directory structure
  - Added icon guidelines and documentation

- Phase 3: Feature Completion
  - DiffViewer component with unified and split view modes
  - ConflictViewer component for merge conflict resolution
  - RemotePanel component for remote repository management
  - SettingsDialog component for application configuration
  - MergeResolver manager for programmatic conflict resolution
  - Comprehensive IPC handlers for all Phase 3 features

- Phase 2: UI Development
  - Electron application framework
  - Main interface components
  - Repository view implementation
  - Commit history interface

- Phase 1: MVP
  - Project architecture design
  - Basic type definitions
  - Git command layer implementation
  - Core business logic managers

### Documentation
- Complete packaging and release guide in Chinese (docs/PACKAGING_GUIDE.md)
- Quick start packaging guide in English (docs/PACKAGING_QUICK_START.md)
- Icon creation and usage guide (build/icons/README.md)
- Architecture documentation (ARCHITECTURE.md)
- API documentation (docs/API.md)
- Phase 3 documentation (docs/PHASE3.md)

### Configuration
- electron-builder configuration for multi-platform builds
- Support for NSIS installer (Windows)
- Support for DMG and ZIP (macOS - Intel and Apple Silicon)
- Support for AppImage, DEB, and RPM (Linux)
- GitHub Release publishing configuration

[Unreleased]: https://github.com/jaychouchannel/GitUI/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/jaychouchannel/GitUI/releases/tag/v0.1.0
