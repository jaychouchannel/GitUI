# GitUI 项目架构设计

## 项目概述
GitUI 是一款图形化的 Git 工具，旨在为用户提供友好的图形界面，将用户在界面上的操作转换为 Git 命令自动执行，消除用户直接使用命令行的需求。

## 架构设计原则
1. **分层架构**: 界面层、业务逻辑层、Git 命令执行层分离
2. **模块化**: 各功能模块独立，易于维护和扩展
3. **可扩展性**: 支持插件机制，方便添加新功能
4. **跨平台**: 支持 Windows、macOS、Linux
5. **性能优先**: 异步执行命令，避免界面卡顿

## 技术栈选型

### 前端/界面层
- **Electron** (推荐) 或 **Qt/PyQt**
  - Electron: 使用 Web 技术栈，开发快速，跨平台支持好
  - Qt: 原生性能好，资源占用少
- **UI 框架**: React/Vue.js (Electron) 或 Qt Widgets
- **样式**: CSS/Tailwind CSS 或 Qt StyleSheets

### 后端/业务逻辑层
- **语言**: TypeScript/JavaScript (Electron) 或 Python (PyQt)
- **进程管理**: Node.js child_process 或 Python subprocess
- **状态管理**: Redux/MobX 或自定义状态管理器

### Git 命令执行层
- **Git 调用方式**:
  - 直接调用系统 Git 命令 (简单直接)
  - 使用 Git 库: nodegit (Node.js)、libgit2 (C/C++)、GitPython (Python)

## 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                    用户界面层 (UI Layer)                   │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ 仓库视图  │ │ 提交历史  │ │ 分支管理  │ │ 远程仓库  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ 文件对比  │ │ 冲突解决  │ │ 暂存管理  │ │ 设置面板  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              业务逻辑层 (Business Logic Layer)             │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │   仓库管理器      │  │   分支管理器      │           │
│  │ (RepoManager)    │  │ (BranchManager)  │           │
│  └──────────────────┘  └──────────────────┘           │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │   提交管理器      │  │   远程管理器      │           │
│  │ (CommitManager)  │  │ (RemoteManager)  │           │
│  └──────────────────┘  └──────────────────┘           │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │   冲突解决器      │  │   差异比较器      │           │
│  │ (MergeResolver)  │  │ (DiffManager)    │           │
│  └──────────────────┘  └──────────────────┘           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│            Git 命令执行层 (Git Execution Layer)            │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │   命令构建器      │  │   命令执行器      │           │
│  │ (CommandBuilder) │  │ (CommandExecutor)│           │
│  └──────────────────┘  └──────────────────┘           │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │   输出解析器      │  │   错误处理器      │           │
│  │ (OutputParser)   │  │ (ErrorHandler)   │           │
│  └──────────────────┘  └──────────────────┘           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Git 命令行工具 (Git CLI)                  │
└─────────────────────────────────────────────────────────┘
```

## 核心模块设计

### 1. 用户界面层 (UI Layer)

#### 主要组件:
- **MainWindow**: 主窗口，包含菜单栏、工具栏、状态栏
- **RepositoryView**: 仓库文件树视图
- **CommitHistory**: 提交历史时间线
- **BranchPanel**: 分支列表和管理面板
- **DiffViewer**: 文件差异对比视图
- **StageArea**: 暂存区管理界面
- **RemotePanel**: 远程仓库管理面板
- **SettingsDialog**: 设置对话框

### 2. 业务逻辑层 (Business Logic Layer)

#### RepoManager (仓库管理器)
```typescript
interface RepoManager {
  openRepository(path: string): Promise<Repository>;
  closeRepository(): void;
  getStatus(): Promise<RepoStatus>;
  refreshRepository(): Promise<void>;
}
```

#### BranchManager (分支管理器)
```typescript
interface BranchManager {
  listBranches(): Promise<Branch[]>;
  createBranch(name: string): Promise<void>;
  deleteBranch(name: string): Promise<void>;
  switchBranch(name: string): Promise<void>;
  mergeBranch(name: string): Promise<void>;
}
```

#### CommitManager (提交管理器)
```typescript
interface CommitManager {
  getCommitHistory(limit?: number): Promise<Commit[]>;
  createCommit(message: string, files: string[]): Promise<void>;
  amendCommit(message: string): Promise<void>;
  revertCommit(commitHash: string): Promise<void>;
  cherryPickCommit(commitHash: string): Promise<void>;
}
```

#### RemoteManager (远程管理器)
```typescript
interface RemoteManager {
  listRemotes(): Promise<Remote[]>;
  addRemote(name: string, url: string): Promise<void>;
  removeRemote(name: string): Promise<void>;
  fetch(remote: string): Promise<void>;
  pull(remote: string, branch: string): Promise<void>;
  push(remote: string, branch: string): Promise<void>;
}
```

#### DiffManager (差异比较器)
```typescript
interface DiffManager {
  getDiff(file: string): Promise<Diff>;
  getCommitDiff(commitHash: string): Promise<Diff[]>;
  getStagedDiff(): Promise<Diff[]>;
}
```

#### MergeResolver (冲突解决器)
```typescript
interface MergeResolver {
  detectConflicts(): Promise<Conflict[]>;
  resolveConflict(file: string, resolution: string): Promise<void>;
  abortMerge(): Promise<void>;
  continueMerge(): Promise<void>;
}
```

### 3. Git 命令执行层 (Git Execution Layer)

#### CommandBuilder (命令构建器)
负责根据参数构建 Git 命令字符串
```typescript
class CommandBuilder {
  buildCommand(operation: string, options: CommandOptions): string;
}

// 示例:
// buildCommand('commit', { message: 'Initial commit', files: ['.'] })
// => 'git commit -m "Initial commit" .'
```

#### CommandExecutor (命令执行器)
负责执行 Git 命令并返回结果
```typescript
class CommandExecutor {
  execute(command: string): Promise<CommandResult>;
  executeAsync(command: string, callback: (output: string) => void): void;
}
```

#### OutputParser (输出解析器)
解析 Git 命令的输出为结构化数据
```typescript
class OutputParser {
  parseStatus(output: string): RepoStatus;
  parseBranches(output: string): Branch[];
  parseCommits(output: string): Commit[];
  parseDiff(output: string): Diff;
}
```

#### ErrorHandler (错误处理器)
处理 Git 命令执行过程中的错误
```typescript
class ErrorHandler {
  handleError(error: Error): UserFriendlyError;
  suggestSolution(error: Error): string[];
}
```

## 数据模型

### Repository (仓库)
```typescript
interface Repository {
  path: string;
  name: string;
  currentBranch: string;
  status: RepoStatus;
}
```

### RepoStatus (仓库状态)
```typescript
interface RepoStatus {
  staged: string[];      // 已暂存文件
  unstaged: string[];    // 未暂存修改
  untracked: string[];   // 未跟踪文件
  conflicts: string[];   // 冲突文件
}
```

### Branch (分支)
```typescript
interface Branch {
  name: string;
  isRemote: boolean;
  isCurrent: boolean;
  lastCommit: string;
}
```

### Commit (提交)
```typescript
interface Commit {
  hash: string;
  author: string;
  date: Date;
  message: string;
  parents: string[];
  files: string[];
}
```

### Diff (差异)
```typescript
interface Diff {
  file: string;
  additions: number;
  deletions: number;
  hunks: DiffHunk[];
}

interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

interface DiffLine {
  type: 'add' | 'delete' | 'context';
  content: string;
  lineNumber: number;
}
```

## 目录结构

```
GitUI/
├── src/
│   ├── main/                    # 主进程 (Electron)
│   │   ├── index.ts            # 应用入口
│   │   └── menu.ts             # 菜单定义
│   ├── renderer/                # 渲染进程 (界面)
│   │   ├── components/         # UI 组件
│   │   │   ├── RepositoryView/
│   │   │   ├── CommitHistory/
│   │   │   ├── BranchPanel/
│   │   │   ├── DiffViewer/
│   │   │   └── ...
│   │   ├── pages/              # 页面
│   │   ├── styles/             # 样式文件
│   │   └── App.tsx             # 应用根组件
│   ├── core/                    # 核心业务逻辑
│   │   ├── managers/           # 各种管理器
│   │   │   ├── RepoManager.ts
│   │   │   ├── BranchManager.ts
│   │   │   ├── CommitManager.ts
│   │   │   ├── RemoteManager.ts
│   │   │   └── ...
│   │   ├── models/             # 数据模型
│   │   └── utils/              # 工具函数
│   ├── git/                     # Git 命令层
│   │   ├── CommandBuilder.ts
│   │   ├── CommandExecutor.ts
│   │   ├── OutputParser.ts
│   │   └── ErrorHandler.ts
│   └── types/                   # TypeScript 类型定义
├── tests/                       # 测试文件
│   ├── unit/                   # 单元测试
│   └── integration/            # 集成测试
├── docs/                        # 文档
├── assets/                      # 资源文件
│   ├── icons/
│   └── images/
├── package.json
├── tsconfig.json
└── README.md
```

## 功能模块

### 核心功能
1. **仓库管理**
   - 打开/创建/克隆仓库
   - 仓库状态监控
   - 多仓库管理

2. **文件操作**
   - 文件树浏览
   - 暂存/取消暂存文件
   - 文件差异对比
   - 丢弃更改

3. **提交管理**
   - 创建提交
   - 查看提交历史
   - 提交详情查看
   - 修改最后一次提交

4. **分支管理**
   - 创建/删除分支
   - 切换分支
   - 合并分支
   - 变基操作

5. **远程仓库**
   - 添加/删除远程仓库
   - 拉取/推送代码
   - 查看远程分支

6. **冲突解决**
   - 冲突文件标识
   - 可视化冲突解决
   - 合并工具集成

### 高级功能
1. **标签管理**
2. **子模块支持**
3. **Git Flow 支持**
4. **补丁管理**
5. **Cherry-pick**
6. **交互式变基**
7. **Blame 视图**
8. **文件历史追踪**

## 开发路线图

### 第一阶段: MVP (最小可行产品)
- [x] 项目架构设计
- [ ] 基础 UI 框架搭建
- [ ] Git 命令执行层实现
- [ ] 仓库打开功能
- [ ] 文件状态查看
- [ ] 基础提交功能

### 第二阶段: 核心功能
- [ ] 分支管理
- [ ] 提交历史查看
- [ ] 文件差异对比
- [ ] 远程仓库基础操作
- [ ] 错误处理优化

### 第三阶段: 增强功能
- [ ] 冲突解决界面
- [ ] 图形化历史视图
- [ ] 搜索和过滤功能
- [ ] 性能优化

### 第四阶段: 高级功能
- [ ] 插件系统
- [ ] 主题定制
- [ ] 快捷键系统
- [ ] 多语言支持

## 技术挑战和解决方案

### 1. 性能问题
- **挑战**: 大型仓库的历史记录可能导致界面卡顿
- **解决方案**: 
  - 分页加载提交历史
  - 虚拟滚动技术
  - 后台线程执行 Git 命令
  - 缓存机制

### 2. 跨平台兼容性
- **挑战**: 不同操作系统的路径分隔符、换行符等差异
- **解决方案**:
  - 使用 Node.js path 模块处理路径
  - 统一换行符处理
  - 针对不同平台的特殊逻辑

### 3. Git 版本兼容性
- **挑战**: 不同版本的 Git 命令输出格式可能不同
- **解决方案**:
  - 检测 Git 版本
  - 使用稳定的输出格式参数 (如 --porcelain)
  - 针对不同版本的兼容性处理

### 4. 错误处理
- **挑战**: Git 命令错误信息对普通用户不友好
- **解决方案**:
  - 错误信息翻译和美化
  - 提供解决方案建议
  - 详细的日志记录

## 安全考虑

1. **敏感信息保护**
   - 不在日志中记录密码、token 等敏感信息
   - 使用系统凭据管理器存储密码

2. **命令注入防护**
   - 严格验证用户输入
   - 使用参数化的命令构建方式
   - 避免直接拼接用户输入到命令中

3. **文件系统安全**
   - 限制文件访问范围
   - 验证文件路径，防止目录遍历攻击

## 测试策略

1. **单元测试**
   - 业务逻辑层每个模块独立测试
   - Git 命令构建和解析逻辑测试

2. **集成测试**
   - 完整的 Git 操作流程测试
   - 使用临时仓库进行测试

3. **端到端测试**
   - UI 自动化测试
   - 真实场景模拟

4. **性能测试**
   - 大型仓库性能测试
   - 内存泄漏检测

## 总结

这个架构设计遵循分层原则，将界面、业务逻辑和 Git 命令执行分离，使得系统易于维护和扩展。通过模块化设计，每个功能模块可以独立开发和测试。使用 Electron 作为技术栈可以快速开发跨平台应用，同时保持良好的用户体验。
