import { ipcMain, dialog } from 'electron';
import { RepoManager } from '../core/managers/RepoManager';
import { CommitManager } from '../core/managers/CommitManager';
import { BranchManager } from '../core/managers/BranchManager';

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
}
