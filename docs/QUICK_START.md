# GitUI 快速开始指南

## 安装

### 1. 克隆仓库

```bash
git clone https://github.com/jaychouchannel/GitUI.git
cd GitUI
```

### 2. 安装依赖

```bash
npm install
```

## 使用核心模块

GitUI 提供了一系列管理器来处理 Git 操作。以下是一些常见使用场景：

### 仓库操作

```typescript
import { RepoManager } from './src/core/managers/RepoManager';

const repoManager = new RepoManager();

// 打开现有仓库
const repo = await repoManager.openRepository('/path/to/your/repo');

// 初始化新仓库
const newRepo = await repoManager.initRepository('/path/to/new/repo');

// 克隆远程仓库
const clonedRepo = await repoManager.cloneRepository(
  'https://github.com/user/repo.git',
  '/path/to/clone'
);

// 获取仓库状态
const status = await repoManager.getStatus();
console.log('Staged:', status.staged);
console.log('Unstaged:', status.unstaged);
console.log('Untracked:', status.untracked);

// 暂存文件
await repoManager.stageFiles(['file1.ts', 'file2.ts']);

// 取消暂存
await repoManager.unstageFiles(['file1.ts']);
```

### 分支操作

```typescript
import { BranchManager } from './src/core/managers/BranchManager';

const branchManager = new BranchManager('/path/to/repo');

// 列出所有分支
const branches = await branchManager.listBranches();
console.log('Branches:', branches);

// 创建新分支
await branchManager.createBranch('feature/new-feature');

// 切换分支
await branchManager.switchBranch('feature/new-feature');

// 创建并切换到新分支
await branchManager.createBranch('feature/another-feature', true);

// 合并分支
await branchManager.mergeBranch('main');

// 删除分支
await branchManager.deleteBranch('old-feature');
```

### 提交操作

```typescript
import { CommitManager } from './src/core/managers/CommitManager';

const commitManager = new CommitManager('/path/to/repo');

// 创建提交
await commitManager.createCommit('feat: add new feature');

// 修改最后一次提交
await commitManager.amendCommit('feat: add new feature (updated)');

// 获取提交历史
const commits = await commitManager.getCommitHistory(20);
commits.forEach(commit => {
  console.log(`${commit.shortHash} - ${commit.message} (${commit.author})`);
});

// 获取特定提交的详情
const commit = await commitManager.getCommitDetails('abc123');

// 回退到某个提交
await commitManager.resetToCommit('abc123', 'soft');

// Cherry-pick 提交
await commitManager.cherryPickCommit('def456');
```

### 远程仓库操作

```typescript
import { RemoteManager } from './src/core/managers/RemoteManager';

const remoteManager = new RemoteManager('/path/to/repo');

// 列出远程仓库
const remotes = await remoteManager.listRemotes();
console.log('Remotes:', remotes);

// 添加远程仓库
await remoteManager.addRemote('origin', 'https://github.com/user/repo.git');

// 拉取更新
await remoteManager.fetch('origin');

// Pull 操作
await remoteManager.pull('origin', 'main');

// Push 操作
await remoteManager.push('origin', 'main');

// 更新远程 URL
await remoteManager.updateRemoteUrl('origin', 'https://github.com/user/new-repo.git');
```

### 差异对比

```typescript
import { DiffManager } from './src/core/managers/DiffManager';

const diffManager = new DiffManager('/path/to/repo');

// 查看工作区的变化
const diffs = await diffManager.getDiff(['file.ts']);
diffs.forEach(diff => {
  console.log(`File: ${diff.file}`);
  console.log(`+${diff.additions} -${diff.deletions}`);
});

// 查看暂存区的变化
const stagedDiffs = await diffManager.getStagedDiff();

// 查看某个提交的变化
const commitDiffs = await diffManager.getCommitDiff('abc123');

// 对比两个提交
const rangeDiffs = await diffManager.getCommitRangeDiff('abc123', 'def456');
```

## 完整示例

```typescript
import { RepoManager } from './src/core/managers/RepoManager';
import { BranchManager } from './src/core/managers/BranchManager';
import { CommitManager } from './src/core/managers/CommitManager';

async function main() {
  // 1. 打开仓库
  const repoManager = new RepoManager();
  const repo = await repoManager.openRepository('/path/to/repo');
  console.log(`Opened repository: ${repo.name}`);

  // 2. 创建新分支
  const branchManager = new BranchManager(repo.path);
  await branchManager.createBranch('feature/demo', true);
  console.log('Created and switched to feature/demo branch');

  // 3. 修改文件并暂存
  // (在这里你会修改一些文件)
  await repoManager.stageFiles(['.']);
  console.log('Staged all changes');

  // 4. 创建提交
  const commitManager = new CommitManager(repo.path);
  await commitManager.createCommit('feat: add demo feature');
  console.log('Created commit');

  // 5. 查看提交历史
  const commits = await commitManager.getCommitHistory(5);
  console.log('Recent commits:');
  commits.forEach(commit => {
    console.log(`  ${commit.shortHash} - ${commit.message}`);
  });
}

main().catch(console.error);
```

## 错误处理

所有管理器方法都会抛出用户友好的错误信息：

```typescript
try {
  await repoManager.openRepository('/invalid/path');
} catch (error) {
  console.error(error.message); // "The selected directory is not a Git repository."
}
```

## 下一步

- 查看 [ARCHITECTURE.md](../ARCHITECTURE.md) 了解详细的架构设计
- 探索 `src/types/index.ts` 了解所有的数据类型
- 查看各个管理器的源代码了解更多功能

## 注意事项

1. 所有异步操作都返回 Promise，请使用 `async/await` 或 `.then()/.catch()`
2. 大多数操作需要在有效的 Git 仓库路径下执行
3. 错误信息已经过处理，可以直接展示给用户
4. 命令执行失败时会抛出异常，请做好错误处理
