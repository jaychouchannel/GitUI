# GitUI Phase 2 Development - UI Components

## 已完成功能 (Completed Features)

Phase 2 的所有核心功能已经实现：

### 1. Electron 应用框架 ✓
- 主进程配置 (`src/main/index.ts`)
- IPC 通信层 (`src/main/ipcHandlers.ts`)
- 渲染进程和主进程间的通信桥接

### 2. 主界面组件 ✓
- **MainLayout** - 主窗口布局
  - 顶部标题栏显示应用名称和当前仓库路径
  - 工具栏提供快捷操作按钮（刷新、拉取、推送、暂存、提交）
  - 打开/关闭仓库功能
  
### 3. 仓库视图 ✓
- **RepositoryView** - 文件状态视图
  - 显示已暂存的文件 (Staged files)
  - 显示未暂存的更改 (Unstaged changes)
  - 显示未跟踪的文件 (Untracked files)
  - 显示冲突文件 (Conflict files)
  - 每个文件状态都有对应的图标和颜色标识

### 4. 提交历史界面 ✓
- **CommitHistory** - 提交历史视图
  - 显示最近 50 条提交记录
  - 提交列表显示：
    - 短哈希值
    - 提交时间（相对时间和绝对时间）
    - 提交信息
    - 作者信息
  - 提交详情面板显示：
    - 完整哈希值
    - 作者和日期
    - 完整提交信息
    - 修改的文件列表

### 5. 分支管理界面 ✓ (额外功能)
- **BranchPanel** - 分支管理面板
  - 显示当前分支
  - 列出所有本地分支
  - 列出所有远程分支
  - 切换分支功能
  - 创建新分支功能

## 项目结构

```
src/
├── main/                        # Electron 主进程
│   ├── index.ts                # 应用入口点
│   └── ipcHandlers.ts          # IPC 消息处理器
├── renderer/                    # 渲染进程 (UI)
│   ├── components/             # React 组件
│   │   ├── MainLayout.tsx     # 主布局组件
│   │   ├── MainLayout.css
│   │   ├── RepositoryView.tsx # 仓库视图组件
│   │   ├── RepositoryView.css
│   │   ├── CommitHistory.tsx  # 提交历史组件
│   │   ├── CommitHistory.css
│   │   ├── BranchPanel.tsx    # 分支面板组件
│   │   └── BranchPanel.css
│   ├── styles/                 # 全局样式
│   │   ├── global.css         # 全局 CSS 变量和基础样式
│   │   └── App.css            # App 组件样式
│   ├── utils/                  # 工具函数
│   │   └── ipc.ts             # IPC API 封装
│   ├── App.tsx                 # 根组件
│   ├── index.tsx               # 渲染进程入口
│   └── index.html              # HTML 模板
├── core/                        # 核心业务逻辑 (Phase 1)
├── git/                         # Git 命令层 (Phase 1)
└── types/                       # TypeScript 类型定义
```

## 技术栈

- **Electron** - 跨平台桌面应用框架
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **CSS Variables** - 样式主题系统

## 运行和构建

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
这会启动两个进程：
- Vite 开发服务器 (端口 5173)
- Electron 应用

### 构建应用
```bash
npm run build
```
生成的文件在 `dist/` 目录：
- `dist/main/` - 主进程代码
- `dist/renderer/` - 渲染进程代码

### 运行构建后的应用
```bash
npm run dev:main
```

## IPC 通信架构

渲染进程和主进程通过 IPC (Inter-Process Communication) 通信：

### 渲染进程 → 主进程
使用 `src/renderer/utils/ipc.ts` 中的 API：

```typescript
// 打开仓库
const result = await ipcApi.openRepository(path);

// 获取状态
const status = await ipcApi.getStatus(repoPath);

// 获取提交历史
const commits = await ipcApi.getCommitHistory(repoPath, 50);

// 列出分支
const branches = await ipcApi.listBranches(repoPath);
```

### 主进程处理器
在 `src/main/ipcHandlers.ts` 中定义：

```typescript
ipcMain.handle('repo:open', async (_event, path: string) => {
  // 处理打开仓库请求
});

ipcMain.handle('repo:status', async (_event, repoPath: string) => {
  // 处理获取状态请求
});
```

## UI 设计特点

### 1. 响应式布局
- 左侧面板可调整大小（200px - 500px）
- 右侧面板自适应剩余空间

### 2. 标签式导航
- 文件视图和分支视图通过标签切换
- 保持 UI 整洁不拥挤

### 3. 状态指示
- 文件状态用颜色和图标区分：
  - 绿色 (A) - 已暂存
  - 黄色 (M) - 已修改
  - 灰色 (?) - 未跟踪
  - 红色 (!) - 冲突

### 4. 相对时间显示
- "2 小时前"、"昨天"、"3 天前"
- 鼠标悬停显示完整时间戳

### 5. 主题系统
使用 CSS 变量定义主题：
```css
--primary-color: #0366d6;
--background-color: #ffffff;
--text-primary: #24292e;
```

## 下一步工作 (Phase 3)

Phase 2 已全部完成，接下来是 Phase 3 的功能：

- [ ] 差异查看器 (DiffViewer)
- [ ] 冲突解决界面 (ConflictResolver)
- [ ] 远程仓库操作面板
- [ ] 设置和配置界面

## 已知限制

1. **暂存/取消暂存** - UI 显示了文件，但点击操作还未实现
2. **创建提交** - 需要添加提交消息输入框
3. **刷新功能** - 工具栏按钮还未连接功能
4. **文件差异** - 点击文件还不能查看差异

这些功能的业务逻辑层已在 Phase 1 完成，只需要连接到 UI 即可。

## 测试

目前还未添加 UI 组件测试。建议使用：
- **Jest** + **React Testing Library** - 单元测试
- **Playwright** - E2E 测试

## 贡献

欢迎贡献代码！请确保：
1. 遵循现有的代码风格
2. 更新相关文档
3. 添加必要的注释
4. 测试你的更改
