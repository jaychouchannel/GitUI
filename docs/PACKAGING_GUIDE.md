# GitUI 打包与发布指南

本指南将详细介绍如何打包和发布 GitUI 应用程序到不同平台。

## 目录

- [前置要求](#前置要求)
- [快速开始](#快速开始)
- [打包配置](#打包配置)
- [平台特定打包](#平台特定打包)
- [应用图标](#应用图标)
- [发布到 GitHub](#发布到-github)
- [CI/CD 自动化](#cicd-自动化)
- [常见问题](#常见问题)

## 前置要求

### 基础要求

- Node.js 18+ 
- npm 或 yarn
- Git 2.0+

### 平台特定要求

#### Windows 打包
- Windows 7 或更高版本
- 无需额外工具（electron-builder 会自动处理）

#### macOS 打包
- macOS 10.13 或更高版本
- Xcode Command Line Tools（用于代码签名，可选）
```bash
xcode-select --install
```

#### Linux 打包
- 任何现代 Linux 发行版
- 用于创建特定格式的工具：
  - **AppImage**: `fuse`, `libfuse2`
  - **deb**: `dpkg`, `fakeroot`
  - **rpm**: `rpm-build`

安装 Linux 工具（Ubuntu/Debian）：
```bash
sudo apt-get install fuse libfuse2 dpkg fakeroot rpm
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 构建应用

```bash
npm run build
```

这会编译主进程和渲染进程的代码。

### 3. 打包应用

#### 打包到当前平台（不创建安装包）
```bash
npm run package
```

这会在 `release` 目录下创建一个未打包的应用程序目录，用于测试。

#### 打包到当前平台（创建安装包）
```bash
# Windows
npm run package:win

# macOS
npm run package:mac

# Linux
npm run package:linux
```

#### 打包到所有平台
```bash
npm run package:all
```

**注意**: 某些平台的打包可能需要在对应的操作系统上进行。

## 打包配置

所有打包配置都在 `package.json` 的 `build` 字段中。

### 应用基础信息

```json
{
  "build": {
    "appId": "com.gitui.app",
    "productName": "GitUI",
    "directories": {
      "output": "release",
      "buildResources": "build"
    }
  }
}
```

- **appId**: 应用的唯一标识符（反向域名格式）
- **productName**: 应用显示名称
- **directories.output**: 打包文件的输出目录
- **directories.buildResources**: 构建资源（如图标）的位置

### 包含的文件

```json
{
  "files": [
    "dist/**/*",
    "package.json"
  ]
}
```

只有这些文件会被包含在最终的应用程序包中。

## 平台特定打包

### Windows 打包

GitUI 支持两种 Windows 打包格式：

#### 1. NSIS 安装程序（推荐）

NSIS 创建一个传统的 Windows 安装向导。

**特性**：
- 完整的安装/卸载体验
- 开始菜单和桌面快捷方式
- 可自定义安装目录
- 支持 64 位和 32 位

**配置**：
```json
{
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "GitUI"
  }
}
```

**打包命令**：
```bash
npm run package:win
```

**输出**：`release/GitUI Setup 0.1.0.exe`

#### 2. 便携版（Portable）

创建一个独立的可执行文件，无需安装。

**特性**：
- 无需安装
- 可从 U 盘运行
- 仅支持 64 位

**打包命令**（已包含在 package:win 中）

**输出**：`release/GitUI 0.1.0.exe`

### macOS 打包

GitUI 支持两种 macOS 打包格式：

#### 1. DMG（推荐）

DMG 是 macOS 的标准分发格式。

**特性**：
- 拖放安装体验
- 支持 Intel 和 Apple Silicon
- 美观的安装窗口

**配置**：
```json
{
  "dmg": {
    "contents": [
      { "x": 130, "y": 220 },
      { "x": 410, "y": 220, "type": "link", "path": "/Applications" }
    ]
  }
}
```

**打包命令**：
```bash
npm run package:mac
```

**输出**：
- `release/GitUI-0.1.0-arm64.dmg` (Apple Silicon)
- `release/GitUI-0.1.0-x64.dmg` (Intel)

#### 2. ZIP 存档

简单的 ZIP 文件，包含应用程序。

**特性**：
- 更小的文件大小
- 支持双架构

**输出**：
- `release/GitUI-0.1.0-arm64-mac.zip`
- `release/GitUI-0.1.0-x64-mac.zip`

#### 代码签名（可选）

要发布到 Mac App Store 或避免"未验证开发者"警告，需要代码签名。

1. 加入 Apple Developer Program
2. 获取开发者证书
3. 设置环境变量：
```bash
export CSC_LINK=/path/to/certificate.p12
export CSC_KEY_PASSWORD=certificate_password
```

### Linux 打包

GitUI 支持三种 Linux 打包格式：

#### 1. AppImage（推荐）

AppImage 是一个通用的、独立的包格式。

**特性**：
- 无需安装，直接运行
- 适用于所有主流发行版
- 无需 root 权限

**打包命令**：
```bash
npm run package:linux
```

**输出**：`release/GitUI-0.1.0.AppImage`

**使用方法**：
```bash
chmod +x GitUI-0.1.0.AppImage
./GitUI-0.1.0.AppImage
```

#### 2. DEB 包（Debian/Ubuntu）

适用于 Debian、Ubuntu 及其衍生版本。

**特性**：
- 系统集成
- 使用 apt 管理
- 自动创建菜单项

**输出**：`release/gitui_0.1.0_amd64.deb`

**安装方法**：
```bash
sudo dpkg -i gitui_0.1.0_amd64.deb
# 如果有依赖问题
sudo apt-get install -f
```

#### 3. RPM 包（Red Hat/Fedora）

适用于 Fedora、RHEL、CentOS 等。

**特性**：
- 系统集成
- 使用 yum/dnf 管理
- 自动创建菜单项

**输出**：`release/gitui-0.1.0.x86_64.rpm`

**安装方法**：
```bash
sudo rpm -i gitui-0.1.0.x86_64.rpm
# 或使用 dnf
sudo dnf install gitui-0.1.0.x86_64.rpm
```

## 应用图标

### 准备图标文件

应用图标是应用程序的视觉标识。你需要为不同平台准备不同格式的图标：

#### 文件位置

所有图标文件应放在 `build/icons/` 目录下：

```
build/
└── icons/
    ├── icon.icns    # macOS
    ├── icon.ico     # Windows
    └── icon.png     # Linux (512x512 或更大)
```

#### 创建图标

**方法 1: 使用在线工具**

1. 创建一个高分辨率的 PNG 图标（建议 1024x1024）
2. 使用在线转换器：
   - [icoconverter.com](https://www.icoconverter.com/) - 转换为 ICO
   - [cloudconvert.com](https://cloudconvert.com/png-to-icns) - 转换为 ICNS

**方法 2: 使用 ImageMagick（命令行）**

```bash
# 安装 ImageMagick
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt-get install imagemagick

# 创建 Windows ICO
convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico

# 创建 Linux PNG（调整大小）
convert icon.png -resize 512x512 icon.png
```

**方法 3: 使用 electron-icon-builder**

```bash
npm install -g electron-icon-builder
electron-icon-builder --input=./icon.png --output=./build/icons
```

### 图标设计建议

1. **简洁明了**: 图标在小尺寸下也要清晰可辨
2. **统一风格**: 保持与应用主题一致的视觉风格
3. **使用矢量**: 从矢量图形开始，确保可缩放
4. **透明背景**: 使用透明背景以适应不同主题
5. **测试各种尺寸**: 在 16x16 到 1024x1024 各种尺寸下测试

### 快速测试图标

如果你只是想快速测试打包流程，可以创建一个简单的纯色图标：

```bash
# 创建简单的蓝色背景 + 白色 "G" 字母图标
convert -size 512x512 xc:#4A90E2 -gravity center -pointsize 200 \
  -fill white -annotate +0+0 'G' build/icons/icon.png
```

## 发布到 GitHub

### 手动发布

1. **构建并打包应用**
```bash
npm run build
npm run package:all
```

2. **创建 Git 标签**
```bash
git tag v0.1.0
git push origin v0.1.0
```

3. **在 GitHub 上创建 Release**
   - 访问仓库的 Releases 页面
   - 点击 "Draft a new release"
   - 选择刚创建的标签
   - 填写发布说明
   - 上传 `release/` 目录下的安装包文件

### 自动发布

使用 electron-builder 的自动发布功能：

1. **设置 GitHub Token**

创建一个 GitHub Personal Access Token：
- 访问 GitHub Settings → Developer settings → Personal access tokens
- 生成新 token，授予 `repo` 权限
- 设置环境变量：
```bash
export GH_TOKEN=your_github_token
```

2. **配置发布设置**

package.json 中已包含发布配置：
```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "jaychouchannel",
      "repo": "GitUI"
    }
  }
}
```

3. **执行发布**
```bash
# 先创建并推送标签
git tag v0.1.0
git push origin v0.1.0

# 自动构建并发布
npm run publish
```

这会：
- 构建应用程序
- 打包所有平台
- 创建 GitHub Release
- 上传所有安装包

## CI/CD 自动化

### GitHub Actions 工作流

创建 `.github/workflows/release.yml`:

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ${{ matrix.os }}
    
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Package application
        run: |
          if [ "$RUNNER_OS" == "Windows" ]; then
            npm run package:win
          elif [ "$RUNNER_OS" == "macOS" ]; then
            npm run package:mac
          else
            npm run package:linux
          fi
        shell: bash
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: release-${{ matrix.os }}
          path: release/*
      
      - name: Release
        uses: softprops/action-gh-release@v1
        if: startsWith(github.ref, 'refs/tags/')
        with:
          files: release/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 使用 CI/CD 发布

1. **创建工作流文件**（如上所示）
2. **推送标签触发构建**
```bash
git tag v0.1.0
git push origin v0.1.0
```
3. **等待构建完成** - GitHub Actions 会自动构建所有平台并创建 Release

## 常见问题

### 1. 打包失败：缺少图标

**问题**：
```
Error: Application icon is not set
```

**解决方案**：
在 `build/icons/` 目录下添加对应平台的图标文件。参考[应用图标](#应用图标)部分。

临时解决方案（测试用）：
```bash
# 创建空图标文件
mkdir -p build/icons
touch build/icons/icon.icns
touch build/icons/icon.ico
touch build/icons/icon.png
```

### 2. macOS 上 "应用已损坏" 错误

**问题**：macOS 显示"应用已损坏，无法打开"。

**解决方案**：
这是因为应用未经过代码签名。

**临时解决**（开发测试）：
```bash
xattr -cr /Applications/GitUI.app
```

**永久解决**：
进行代码签名（需要 Apple Developer 账号）。

### 3. Linux 上 AppImage 无法运行

**问题**：
```
dlopen(): error loading libfuse.so.2
```

**解决方案**：
安装 FUSE：
```bash
# Ubuntu/Debian
sudo apt-get install libfuse2

# Fedora
sudo dnf install fuse-libs

# Arch
sudo pacman -S fuse2
```

### 4. Windows Defender 标记为威胁

**问题**：Windows Defender 或其他杀毒软件标记应用为威胁。

**原因**：未签名的 Electron 应用可能被误报。

**解决方案**：
- 使用代码签名证书签名应用
- 联系杀毒软件厂商报告误报
- 提供 VirusTotal 扫描结果

### 5. 打包体积过大

**问题**：安装包体积超过 100MB。

**解决方案**：
- 确保 `node_modules` 不被包含（已配置）
- 使用 `npm prune --production` 移除开发依赖
- 压缩资源文件
- 考虑使用 asar 打包（默认启用）

### 6. 多平台打包限制

**问题**：某些平台无法在其他系统上打包。

**限制**：
- **macOS**: 只能在 macOS 上打包 DMG 和进行代码签名
- **Windows**: 可在任何平台打包，但某些功能需要 Windows
- **Linux**: 可在任何平台打包

**解决方案**：
- 使用 CI/CD（如 GitHub Actions）在各自平台上构建
- 使用虚拟机或 Docker
- 仅打包当前平台：`npm run package:当前平台`

### 7. 依赖问题

**问题**：
```
Error: Cannot find module 'electron'
```

**解决方案**：
```bash
rm -rf node_modules package-lock.json
npm install
```

## 版本管理

### 语义化版本

遵循语义化版本规范（Semantic Versioning）：

- **主版本号（Major）**: 不兼容的 API 变更
- **次版本号（Minor）**: 向后兼容的功能新增
- **修订号（Patch）**: 向后兼容的问题修正

示例：`1.2.3` = `主.次.修订`

### 更新版本号

1. **在 package.json 中更新版本**
```json
{
  "version": "0.2.0"
}
```

2. **创建标签并发布**
```bash
git add package.json
git commit -m "Bump version to 0.2.0"
git tag v0.2.0
git push origin main
git push origin v0.2.0
```

## 最佳实践

### 发布前检查清单

- [ ] 所有测试通过
- [ ] 代码已经过 lint 检查
- [ ] 更新了 CHANGELOG.md
- [ ] 更新了版本号
- [ ] 准备了应用图标
- [ ] 在本地测试了打包
- [ ] 编写了发布说明
- [ ] 创建了 git 标签

### 构建优化

1. **使用生产模式构建**
```bash
NODE_ENV=production npm run build
```

2. **清理旧构建**
```bash
rm -rf dist release
npm run build
```

3. **验证构建产物**
```bash
# 检查 dist 目录
ls -lh dist/

# 测试打包（不创建安装包）
npm run package
```

### 安全建议

1. **不要提交私钥或证书** - 使用环境变量
2. **使用 .gitignore** - 排除敏感文件
3. **代码签名** - 为生产版本签名
4. **定期更新依赖** - 修复安全漏洞
```bash
npm audit fix
```

## 参考资源

- [Electron Builder 文档](https://www.electron.build/)
- [Electron 文档](https://www.electronjs.org/docs)
- [语义化版本](https://semver.org/lang/zh-CN/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

## 总结

通过本指南，你应该能够：

1. ✅ 配置 electron-builder 打包工具
2. ✅ 为不同平台打包应用程序
3. ✅ 创建和使用应用图标
4. ✅ 发布到 GitHub Releases
5. ✅ 设置 CI/CD 自动化发布
6. ✅ 解决常见打包问题

如有问题，请在 GitHub Issues 中提问。

---

**祝你打包愉快！** 🚀
