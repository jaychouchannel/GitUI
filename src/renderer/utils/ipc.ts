import { ipcRenderer, IpcRendererEvent } from 'electron';

/**
 * IPC response type
 */
interface IpcResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * IPC API for renderer process to communicate with main process
 */
export const ipcApi = {
  // Repository operations
  async openRepository(path: string): Promise<IpcResponse> {
    return await ipcRenderer.invoke('repo:open', path);
  },

  async getStatus(repoPath: string): Promise<IpcResponse> {
    return await ipcRenderer.invoke('repo:status', repoPath);
  },

  async stageFiles(repoPath: string, files: string[]): Promise<IpcResponse> {
    return await ipcRenderer.invoke('repo:stage', repoPath, files);
  },

  async unstageFiles(repoPath: string, files: string[]): Promise<IpcResponse> {
    return await ipcRenderer.invoke('repo:unstage', repoPath, files);
  },

  // Commit operations
  async getCommitHistory(repoPath: string, limit?: number): Promise<IpcResponse> {
    return await ipcRenderer.invoke('commit:history', repoPath, limit);
  },

  async createCommit(repoPath: string, message: string): Promise<IpcResponse> {
    return await ipcRenderer.invoke('commit:create', repoPath, message);
  },

  // Branch operations
  async listBranches(repoPath: string): Promise<IpcResponse> {
    return await ipcRenderer.invoke('branch:list', repoPath);
  },

  async createBranch(repoPath: string, name: string): Promise<IpcResponse> {
    return await ipcRenderer.invoke('branch:create', repoPath, name);
  },

  async switchBranch(repoPath: string, name: string): Promise<IpcResponse> {
    return await ipcRenderer.invoke('branch:switch', repoPath, name);
  },

  // Dialog operations
  async openDirectoryDialog(): Promise<IpcResponse> {
    return await ipcRenderer.invoke('dialog:openDirectory');
  },
};
