# GitUI API 参考文档

本文档详细说明了 GitUI 各个核心模块的 API。

## 目录

- [Git 命令层](#git-命令层)
  - [CommandBuilder](#commandbuilder)
  - [CommandExecutor](#commandexecutor)
  - [OutputParser](#outputparser)
  - [ErrorHandler](#errorhandler)
- [业务逻辑层](#业务逻辑层)
  - [RepoManager](#repomanager)
  - [BranchManager](#branchmanager)
  - [CommitManager](#commitmanager)
  - [RemoteManager](#remotemanager)
  - [DiffManager](#diffmanager)

---

## Git 命令层

### CommandBuilder

构建 Git 命令的工具类。

#### 方法

##### `build(operation: string, args?: string[], options?): string[]`
构建基础 Git 命令。

**参数:**
- `operation`: Git 操作名称 (如 'commit', 'push')
- `args`: 命令参数数组
- `options`: 命令选项对象

**返回:** 命令数组

##### `buildStatus(porcelain?: boolean): string[]`
构建 status 命令。

##### `buildListBranches(includeRemote?: boolean): string[]`
构建列出分支的命令。

##### `buildCommit(message: string, options?): string[]`
构建 commit 命令。

##### `buildLog(limit?: number, format?: string): string[]`
构建 log 命令。

##### 其他方法
- `buildAdd(files: string[])`
- `buildReset(files: string[])`
- `buildDiff(files?: string[], staged?: boolean)`
- `buildCheckout(branch: string, createNew?: boolean)`
- `buildMerge(branch: string, options?)`
- `buildPull(remote: string, branch: string, rebase?: boolean)`
- `buildPush(remote: string, branch: string, force?: boolean)`

---

### CommandExecutor

执行 Git 命令的工具类。

#### 方法

##### `execute(command: string[], options?): Promise<CommandResult>`
同步执行 Git 命令。

**参数:**
- `command`: 命令数组
- `options`: 执行选项 (cwd, env, timeout)

**返回:** Promise<CommandResult>

##### `executeAsync(command: string[], callback, options?): Promise<CommandResult>`
异步执行 Git 命令，支持实时输出回调。

##### `isGitAvailable(): Promise<boolean>`
检查 Git 是否可用。

##### `getGitVersion(): Promise<string | null>`
获取 Git 版本。

---

### OutputParser

解析 Git 命令输出的工具类。

#### 方法

##### `parseStatus(output: string): RepoStatus`
解析 `git status --porcelain` 输出。

##### `parseBranches(output: string): Branch[]`
解析分支列表输出。

##### `parseCommits(output: string): Commit[]`
解析提交历史输出。

##### `parseRemotes(output: string): Remote[]`
解析远程仓库列表输出。

##### `parseDiff(output: string): Diff[]`
解析 diff 输出。

---

### ErrorHandler

处理错误并提供用户友好信息的工具类。

#### 方法

##### `handleError(error: Error, stderr?: string): UserFriendlyError`
转换错误为用户友好的错误对象。

##### `suggestSolution(error: Error, stderr?: string): string[]`
为错误提供解决方案建议。

##### `isRecoverable(error: Error, stderr?: string): boolean`
判断错误是否可恢复。

---

## 业务逻辑层

### RepoManager

管理 Git 仓库的核心类。

#### 构造函数

```typescript
new RepoManager()
```

#### 方法

##### `openRepository(path: string): Promise<Repository>`
打开指定路径的 Git 仓库。

**参数:**
- `path`: 仓库路径

**返回:** Promise<Repository>

**异常:** 如果路径不是有效的 Git 仓库，抛出错误

**示例:**
```typescript
const repo = await repoManager.openRepository('/path/to/repo');
console.log(`Opened: ${repo.name}`);
```

##### `closeRepository(): void`
关闭当前打开的仓库。

##### `getCurrentRepository(): Repository | null`
获取当前打开的仓库。

##### `getStatus(): Promise<RepoStatus>`
获取当前仓库的状态。

**返回:** Promise<RepoStatus>

##### `refreshRepository(): Promise<void>`
刷新仓库数据。

##### `initRepository(path: string, bare?: boolean): Promise<Repository>`
初始化新的 Git 仓库。

**参数:**
- `path`: 仓库路径
- `bare`: 是否创建裸仓库 (默认 false)

##### `cloneRepository(url: string, directory: string, options?): Promise<Repository>`
克隆远程仓库。

**参数:**
- `url`: 远程仓库 URL
- `directory`: 本地目录
- `options.depth`: 克隆深度 (可选)
- `options.branch`: 指定分支 (可选)

##### `stageFiles(files: string[]): Promise<void>`
暂存文件。

**参数:**
- `files`: 文件路径数组

##### `unstageFiles(files: string[]): Promise<void>`
取消暂存文件。

##### `discardChanges(files: string[]): Promise<void>`
丢弃文件的更改 (危险操作)。

---

### BranchManager

管理 Git 分支的核心类。

#### 构造函数

```typescript
new BranchManager(repoPath: string)
```

**参数:**
- `repoPath`: 仓库路径

#### 方法

##### `listBranches(includeRemote?: boolean): Promise<Branch[]>`
列出所有分支。

**参数:**
- `includeRemote`: 是否包含远程分支 (默认 false)

**返回:** Promise<Branch[]>

##### `createBranch(name: string, checkout?: boolean): Promise<void>`
创建新分支。

**参数:**
- `name`: 分支名称
- `checkout`: 是否立即切换到新分支 (默认 false)

##### `deleteBranch(name: string, force?: boolean): Promise<void>`
删除分支。

**参数:**
- `name`: 分支名称
- `force`: 是否强制删除 (默认 false)

##### `switchBranch(name: string): Promise<void>`
切换到指定分支。

##### `mergeBranch(name: string, options?): Promise<void>`
合并分支到当前分支。

**参数:**
- `name`: 要合并的分支名称
- `options.noFf`: 不使用 fast-forward (可选)
- `options.squash`: 压缩合并 (可选)

##### `renameBranch(oldName: string, newName: string): Promise<void>`
重命名分支。

##### `getCurrentBranch(): Promise<string>`
获取当前分支名称。

---

### CommitManager

管理 Git 提交的核心类。

#### 构造函数

```typescript
new CommitManager(repoPath: string)
```

#### 方法

##### `getCommitHistory(limit?: number): Promise<Commit[]>`
获取提交历史。

**参数:**
- `limit`: 限制返回的提交数量 (默认 50)

**返回:** Promise<Commit[]>

##### `createCommit(message: string, options?): Promise<void>`
创建新提交。

**参数:**
- `message`: 提交信息
- `options.amend`: 修改最后一次提交 (可选)
- `options.all`: 自动暂存所有已跟踪文件 (可选)

##### `amendCommit(message: string): Promise<void>`
修改最后一次提交。

##### `revertCommit(commitHash: string): Promise<void>`
回退指定提交。

##### `cherryPickCommit(commitHash: string): Promise<void>`
Cherry-pick 指定提交。

##### `getCommitDetails(commitHash: string): Promise<Commit | null>`
获取提交详情。

##### `resetToCommit(commitHash: string, mode?): Promise<void>`
重置到指定提交。

**参数:**
- `commitHash`: 提交哈希
- `mode`: 重置模式 ('soft' | 'mixed' | 'hard')，默认 'mixed'

---

### RemoteManager

管理远程仓库的核心类。

#### 构造函数

```typescript
new RemoteManager(repoPath: string)
```

#### 方法

##### `listRemotes(): Promise<Remote[]>`
列出所有远程仓库。

##### `addRemote(name: string, url: string): Promise<void>`
添加远程仓库。

##### `removeRemote(name: string): Promise<void>`
删除远程仓库。

##### `fetch(remote: string, prune?: boolean): Promise<void>`
从远程仓库获取更新。

**参数:**
- `remote`: 远程仓库名称
- `prune`: 是否清理已删除的远程分支 (默认 false)

##### `pull(remote: string, branch: string, rebase?: boolean): Promise<void>`
拉取远程分支。

**参数:**
- `remote`: 远程仓库名称
- `branch`: 分支名称
- `rebase`: 是否使用 rebase (默认 false)

##### `push(remote: string, branch: string, force?: boolean): Promise<void>`
推送到远程分支。

**参数:**
- `remote`: 远程仓库名称
- `branch`: 分支名称
- `force`: 是否强制推送 (默认 false)

##### `updateRemoteUrl(name: string, newUrl: string): Promise<void>`
更新远程仓库 URL。

##### `renameRemote(oldName: string, newName: string): Promise<void>`
重命名远程仓库。

---

### DiffManager

管理文件差异对比的核心类。

#### 构造函数

```typescript
new DiffManager(repoPath: string)
```

#### 方法

##### `getDiff(files?: string[]): Promise<Diff[]>`
获取工作区文件的差异。

**参数:**
- `files`: 文件路径数组 (可选，默认所有文件)

##### `getStagedDiff(): Promise<Diff[]>`
获取暂存区的差异。

##### `getCommitDiff(commitHash: string): Promise<Diff[]>`
获取指定提交的差异。

##### `getCommitRangeDiff(fromCommit: string, toCommit: string): Promise<Diff[]>`
获取两个提交之间的差异。

##### `getDiffStats(files?: string[]): Promise<string>`
获取差异统计信息。

---

## 数据类型

所有数据类型定义在 `src/types/index.ts`，包括：

- `Repository`: 仓库信息
- `RepoStatus`: 仓库状态
- `Branch`: 分支信息
- `Commit`: 提交信息
- `Remote`: 远程仓库信息
- `Diff`: 差异信息
- `CommandResult`: 命令执行结果
- `UserFriendlyError`: 用户友好的错误信息

详细的类型定义请查看源代码。
