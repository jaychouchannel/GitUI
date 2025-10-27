# Application Icons

This directory contains the application icons used for packaging GitUI.

## Required Icon Files

For complete cross-platform packaging, you need the following icon files:

### macOS
- **icon.icns** - macOS application icon
  - Required sizes: 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024
  - Format: ICNS (Apple Icon Image format)

### Windows
- **icon.ico** - Windows application icon
  - Required sizes: 16x16, 24x24, 32x32, 48x48, 64x64, 128x128, 256x256
  - Format: ICO (Windows Icon format)

### Linux
- **icon.png** - Linux application icon
  - Recommended size: 512x512 or 1024x1024
  - Format: PNG with transparency

## Creating Icons

### Option 1: Online Tools
Use online icon generators like:
- https://www.icoconverter.com/ (for ICO)
- https://cloudconvert.com/png-to-icns (for ICNS)
- https://www.img2go.com/ (general image conversion)

### Option 2: Design Tools
Use design tools like:
- **Adobe Photoshop/Illustrator** - Professional design
- **GIMP** - Free open-source alternative
- **Inkscape** - Vector graphics editor
- **Figma** - Web-based design tool

### Option 3: Command Line Tools
Use command-line tools:

**For ICNS (macOS):**
```bash
# Using iconutil (macOS only)
mkdir icon.iconset
# Add images named: icon_16x16.png, icon_32x32.png, etc.
iconutil -c icns icon.iconset -o icon.icns
```

**For ICO (Windows):**
```bash
# Using ImageMagick
convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

**For PNG (Linux):**
```bash
# Using ImageMagick to resize
convert icon.png -resize 512x512 icon.png
```

## Icon Design Guidelines

1. **Simple and Clear**: Keep the icon simple and recognizable at small sizes
2. **Vector-Based**: Start with vector graphics for scalability
3. **Transparent Background**: Use transparency for better integration
4. **Brand Colors**: Use consistent colors that match your brand
5. **Test at Multiple Sizes**: Ensure the icon looks good at 16x16 and 1024x1024

## Default Icon Placeholder

If you don't provide custom icons, electron-builder will use default Electron icons during development. However, for production releases, you should always provide custom icons that represent your application.

## Quick Start Icon

For quick testing, you can use a simple colored square:

```bash
# Create a simple 512x512 PNG icon
convert -size 512x512 xc:#4A90E2 -gravity center -pointsize 200 -fill white \
  -annotate +0+0 'G' icon.png
```

Then convert it to other formats as needed.
