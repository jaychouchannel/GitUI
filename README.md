# GitUI

一个现代化的图形化 Git 工具，为用户提供友好的界面来管理 Git 仓库。

## 项目简介

GitUI 是一款跨平台的图形化 Git 客户端，旨在简化 Git 操作。用户无需记忆复杂的命令行指令，通过直观的图形界面即可完成所有 Git 操作。应用程序会自动将用户的操作转换为相应的 Git 命令并执行。

### 核心特性

- 🎨 **直观的用户界面**: 清晰的视图展示仓库状态、提交历史、分支等信息
- 🚀 **快速操作**: 通过点击和拖拽完成常见的 Git 操作
- 🔄 **实时同步**: 自动检测仓库变化并更新界面
- 🌿 **分支管理**: 可视化分支结构，轻松创建、切换和合并分支
- 📝 **提交历史**: 图形化展示提交历史和文件变化
- 🔍 **差异对比**: 内置差异查看器，清晰展示文件变化
- 🌐 **远程操作**: 简化推送、拉取和同步操作
- ⚡ **性能优化**: 支持大型仓库，快速响应

## 技术架构

GitUI 采用分层架构设计，具体包括：

- **用户界面层**: 使用 Electron + React 构建跨平台桌面应用
- **业务逻辑层**: TypeScript 实现的核心业务逻辑
- **Git 命令层**: 封装 Git 命令的构建、执行和解析

详细的架构设计请参考 [ARCHITECTURE.md](./ARCHITECTURE.md)

## 项目结构

```
GitUI/
├── src/
│   ├── main/              # 主进程 (Electron)
│   ├── renderer/          # 渲染进程 (UI 组件)
│   ├── core/              # 核心业务逻辑
│   │   └── managers/      # 各种管理器
│   ├── git/               # Git 命令层
│   └── types/             # TypeScript 类型定义
├── tests/                 # 测试文件
├── docs/                  # 文档
├── ARCHITECTURE.md        # 架构设计文档
└── package.json
```

## 开始使用

### 前置要求

- Node.js 18+ 
- Git 2.0+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建应用

```bash
npm run build
```

### 运行测试

```bash
npm test
```

## 核心模块

### 1. Git 命令层

- **CommandBuilder**: 构建 Git 命令
- **CommandExecutor**: 执行 Git 命令
- **OutputParser**: 解析命令输出
- **ErrorHandler**: 错误处理和用户友好的错误信息

### 2. 业务逻辑层

- **RepoManager**: 仓库管理 (打开、关闭、状态查询)
- **BranchManager**: 分支管理 (创建、删除、切换、合并)
- **CommitManager**: 提交管理 (创建、查看历史、回退)
- **RemoteManager**: 远程仓库管理 (拉取、推送、同步)
- **DiffManager**: 差异比较 (文件对比、提交对比)

### 3. 用户界面层

- **RepositoryView**: 仓库文件树
- **CommitHistory**: 提交历史时间线
- **BranchPanel**: 分支列表和管理
- **DiffViewer**: 文件差异查看器
- **StageArea**: 暂存区管理
- **RemotePanel**: 远程仓库管理

## 使用示例

```typescript
import { RepoManager } from './src/core/managers/RepoManager';

// 创建仓库管理器实例
const repoManager = new RepoManager();

// 打开仓库
const repo = await repoManager.openRepository('/path/to/repo');

// 获取状态
const status = await repoManager.getStatus();
console.log('Staged files:', status.staged);
console.log('Unstaged files:', status.unstaged);

// 暂存文件
await repoManager.stageFiles(['file1.ts', 'file2.ts']);

// 创建提交
const commitManager = new CommitManager(repo.path);
await commitManager.createCommit('Initial commit');
```

## 开发计划

### 第一阶段 - MVP (✓ 已完成)
- [x] 项目架构设计
- [x] 基础类型定义
- [x] Git 命令层实现
- [x] 核心业务逻辑管理器

### 第二阶段 - UI 开发 (进行中)
- [ ] Electron 应用框架搭建
- [ ] 主界面组件开发
- [ ] 仓库视图实现
- [ ] 提交历史界面

### 第三阶段 - 功能完善
- [ ] 差异查看器
- [ ] 冲突解决界面
- [ ] 远程仓库操作
- [ ] 设置和配置

### 第四阶段 - 优化和发布
- [ ] 性能优化
- [ ] 测试覆盖
- [ ] 文档完善
- [ ] 打包和发布

## 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 添加适当的注释和文档
- 编写单元测试

## 许可证

MIT License

## 致谢

感谢所有为这个项目做出贡献的开发者！

---

**注意**: 本项目目前处于开发阶段，部分功能尚未完成。