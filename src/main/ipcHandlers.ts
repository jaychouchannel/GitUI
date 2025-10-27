import { ipcMain, dialog } from 'electron';
import { RepoManager } from '../core/managers/RepoManager';
import { CommitManager } from '../core/managers/CommitManager';
import { BranchManager } from '../core/managers/BranchManager';
import { DiffManager } from '../core/managers/DiffManager';
import { RemoteManager } from '../core/managers/RemoteManager';
import { MergeResolver } from '../core/managers/MergeResolver';

/**
 * Setup IPC handlers for communication between main and renderer process
 */
export function setupIpcHandlers(): void {
  // Repository operations
  ipcMain.handle('repo:open', async (_event, path: string) => {
    try {
      const manager = new RepoManager();
      const repo = await manager.openRepository(path);
      return { success: true, data: repo };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  ipcMain.handle('repo:status', async (_event, repoPath: string) => {
    try {
      const manager = new RepoManager();
      await manager.openRepository(repoPath);
      const status = await manager.getStatus();
      return { success: true, data: status };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  ipcMain.handle('repo:stage', async (_event, repoPath: string, files: string[]) => {
    try {
      const manager = new RepoManager();
      await manager.openRepository(repoPath);
      await manager.stageFiles(files);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  ipcMain.handle('repo:unstage', async (_event, repoPath: string, files: string[]) => {
    try {
      const manager = new RepoManager();
      await manager.openRepository(repoPath);
      await manager.unstageFiles(files);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  // Commit operations
  ipcMain.handle('commit:history', async (_event, repoPath: string, limit?: number) => {
    try {
      const manager = new CommitManager(repoPath);
      const commits = await manager.getCommitHistory(limit);
      return { success: true, data: commits };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  ipcMain.handle('commit:create', async (_event, repoPath: string, message: string) => {
    try {
      const manager = new CommitManager(repoPath);
      await manager.createCommit(message);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  // Branch operations
  ipcMain.handle('branch:list', async (_event, repoPath: string) => {
    try {
      const manager = new BranchManager(repoPath);
      const branches = await manager.listBranches();
      return { success: true, data: branches };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  ipcMain.handle('branch:create', async (_event, repoPath: string, name: string) => {
    try {
      const manager = new BranchManager(repoPath);
      await manager.createBranch(name);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  ipcMain.handle('branch:switch', async (_event, repoPath: string, name: string) => {
    try {
      const manager = new BranchManager(repoPath);
      await manager.switchBranch(name);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  // Dialog operations
  ipcMain.handle('dialog:openDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: '选择 Git 仓库',
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false };
    }

    return { success: true, data: result.filePaths[0] };
  });

  // Diff operations
  ipcMain.handle('diff:get', async (_event, repoPath: string, files: string[]) => {
    try {
      const manager = new DiffManager(repoPath);
      const diff = await manager.getDiff(files);
      return { success: true, data: diff };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  ipcMain.handle('diff:staged', async (_event, repoPath: string) => {
    try {
      const manager = new DiffManager(repoPath);
      const diff = await manager.getStagedDiff();
      return { success: true, data: diff };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  ipcMain.handle('diff:commit', async (_event, repoPath: string, commitHash: string) => {
    try {
      const manager = new DiffManager(repoPath);
      const diff = await manager.getCommitDiff(commitHash);
      return { success: true, data: diff };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  // Remote operations
  ipcMain.handle('remote:list', async (_event, repoPath: string) => {
    try {
      const manager = new RemoteManager(repoPath);
      const remotes = await manager.listRemotes();
      return { success: true, data: remotes };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  ipcMain.handle('remote:add', async (_event, repoPath: string, name: string, url: string) => {
    try {
      const manager = new RemoteManager(repoPath);
      await manager.addRemote(name, url);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  ipcMain.handle('remote:remove', async (_event, repoPath: string, name: string) => {
    try {
      const manager = new RemoteManager(repoPath);
      await manager.removeRemote(name);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  ipcMain.handle('remote:updateUrl', async (_event, repoPath: string, name: string, newUrl: string) => {
    try {
      const manager = new RemoteManager(repoPath);
      await manager.updateRemoteUrl(name, newUrl);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  ipcMain.handle('remote:rename', async (_event, repoPath: string, oldName: string, newName: string) => {
    try {
      const manager = new RemoteManager(repoPath);
      await manager.renameRemote(oldName, newName);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  ipcMain.handle('remote:fetch', async (_event, repoPath: string, remote: string, prune: boolean) => {
    try {
      const manager = new RemoteManager(repoPath);
      await manager.fetch(remote, prune);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  ipcMain.handle('remote:pull', async (_event, repoPath: string, remote: string, branch: string, rebase: boolean) => {
    try {
      const manager = new RemoteManager(repoPath);
      await manager.pull(remote, branch, rebase);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  ipcMain.handle('remote:push', async (_event, repoPath: string, remote: string, branch: string, force: boolean) => {
    try {
      const manager = new RemoteManager(repoPath);
      await manager.push(remote, branch, force);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  // Merge/Conflict resolution operations
  ipcMain.handle('merge:detectConflicts', async (_event, repoPath: string) => {
    try {
      const resolver = new MergeResolver(repoPath);
      const conflicts = await resolver.detectConflicts();
      return { success: true, data: conflicts };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  ipcMain.handle('merge:resolveConflict', async (_event, repoPath: string, file: string, resolution: 'ours' | 'theirs' | 'base') => {
    try {
      const resolver = new MergeResolver(repoPath);
      await resolver.resolveConflict(file, resolution);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  ipcMain.handle('merge:resolveWithContent', async (_event, repoPath: string, file: string, content: string) => {
    try {
      const resolver = new MergeResolver(repoPath);
      await resolver.resolveWithContent(file, content);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  ipcMain.handle('merge:abort', async (_event, repoPath: string) => {
    try {
      const resolver = new MergeResolver(repoPath);
      await resolver.abortMerge();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  ipcMain.handle('merge:continue', async (_event, repoPath: string, message?: string) => {
    try {
      const resolver = new MergeResolver(repoPath);
      await resolver.continueMerge(message);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  ipcMain.handle('merge:isMerging', async (_event, repoPath: string) => {
    try {
      const resolver = new MergeResolver(repoPath);
      const isMerging = await resolver.isMerging();
      return { success: true, data: isMerging };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });
}
