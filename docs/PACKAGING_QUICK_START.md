# GitUI Packaging and Release Guide

Quick guide for packaging and releasing GitUI.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Application
```bash
npm run build
```

### 3. Package for Your Platform

**Test packaging (no installer):**
```bash
npm run package
```

**Create installer for current platform:**
```bash
# Windows
npm run package:win

# macOS  
npm run package:mac

# Linux
npm run package:linux
```

**Package for all platforms:**
```bash
npm run package:all
```

## Output Files

Packaged files will be in the `release/` directory:

### Windows
- `GitUI Setup 0.1.0.exe` - NSIS installer
- `GitUI 0.1.0.exe` - Portable version

### macOS
- `GitUI-0.1.0-arm64.dmg` - Apple Silicon DMG
- `GitUI-0.1.0-x64.dmg` - Intel DMG
- `GitUI-0.1.0-arm64-mac.zip` - Apple Silicon ZIP
- `GitUI-0.1.0-x64-mac.zip` - Intel ZIP

### Linux
- `GitUI-0.1.0.AppImage` - Universal AppImage
- `gitui_0.1.0_amd64.deb` - Debian/Ubuntu package
- `gitui-0.1.0.x86_64.rpm` - Red Hat/Fedora package

## Application Icons

Place icon files in `build/icons/`:
- `icon.icns` - macOS icon
- `icon.ico` - Windows icon  
- `icon.png` - Linux icon (512x512 or larger)

See `build/icons/README.md` for details on creating icons.

## Publishing to GitHub

### Manual Release

1. Build and package:
```bash
npm run build
npm run package:all
```

2. Create a git tag:
```bash
git tag v0.1.0
git push origin v0.1.0
```

3. Create a GitHub Release and upload files from `release/`

### Automatic Release

1. Set GitHub token:
```bash
export GH_TOKEN=your_github_token
```

2. Create and push tag:
```bash
git tag v0.1.0
git push origin v0.1.0
```

3. Publish:
```bash
npm run publish
```

## Configuration

All packaging configuration is in `package.json` under the `build` field.

## For More Information

See [docs/PACKAGING_GUIDE.md](./PACKAGING_GUIDE.md) for the complete guide (in Chinese).

## Common Issues

### Missing Icons
If you get icon errors, create placeholder files:
```bash
mkdir -p build/icons
touch build/icons/icon.icns build/icons/icon.ico build/icons/icon.png
```

### "App is damaged" on macOS
For testing, bypass Gatekeeper:
```bash
xattr -cr /Applications/GitUI.app
```

For production, sign your app with an Apple Developer certificate.

### AppImage won't run on Linux
Install FUSE:
```bash
sudo apt-get install libfuse2  # Ubuntu/Debian
sudo dnf install fuse-libs     # Fedora
```

## Resources

- [Electron Builder Documentation](https://www.electron.build/)
- [Electron Documentation](https://www.electronjs.org/docs)
- Full Guide: [docs/PACKAGING_GUIDE.md](./PACKAGING_GUIDE.md)
