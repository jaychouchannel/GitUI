/**
 * Example usage of Phase 3 components
 * This file demonstrates how to integrate all the new Phase 3 features
 */

import React, { useState, useEffect } from 'react';
import { DiffViewer } from './src/renderer/components/DiffViewer';
import { ConflictViewer } from './src/renderer/components/ConflictViewer';
import { RemotePanel } from './src/renderer/components/RemotePanel';
import { SettingsDialog, AppSettings } from './src/renderer/components/SettingsDialog';
import { Diff, Conflict, Remote } from './src/types';

/**
 * Example component showing Phase 3 integration
 */
export function Phase3Example() {
  const [repoPath, setRepoPath] = useState<string>('/path/to/repo');
  const [currentBranch, setCurrentBranch] = useState<string>('main');
  
  // State for DiffViewer
  const [diffs, setDiffs] = useState<Diff[]>([]);
  const [showDiffViewer, setShowDiffViewer] = useState(false);
  
  // State for ConflictViewer
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [showConflictViewer, setShowConflictViewer] = useState(false);
  
  // State for RemotePanel
  const [remotes, setRemotes] = useState<Remote[]>([]);
  const [showRemotePanel, setShowRemotePanel] = useState(false);
  
  // State for SettingsDialog
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    git: {
      userName: 'Your Name',
      userEmail: 'your.email@example.com',
      defaultBranch: 'main',
      autoFetch: false,
      autoFetchInterval: 5,
    },
    ui: {
      theme: 'light',
      fontSize: 'medium',
      showLineNumbers: true,
      compactMode: false,
    },
    editor: {
      tabSize: 4,
      insertSpaces: true,
      wordWrap: true,
      fontFamily: 'Courier New, monospace',
    },
    advanced: {
      maxCommitHistory: 100,
      enableDebugMode: false,
      gitPath: 'git',
    },
  });

  // Load diffs for a file or staged changes
  const loadDiffs = async () => {
    try {
      // Example using IPC to get diffs
      const result = await window.electronAPI.invoke('diff:get', repoPath, []);
      if (result.success) {
        setDiffs(result.data);
        setShowDiffViewer(true);
      }
    } catch (error) {
      console.error('Failed to load diffs:', error);
    }
  };

  // Load conflicts
  const loadConflicts = async () => {
    try {
      const result = await window.electronAPI.invoke('merge:detectConflicts', repoPath);
      if (result.success) {
        setConflicts(result.data);
        setShowConflictViewer(true);
      }
    } catch (error) {
      console.error('Failed to load conflicts:', error);
    }
  };

  // Load remotes
  const loadRemotes = async () => {
    try {
      const result = await window.electronAPI.invoke('remote:list', repoPath);
      if (result.success) {
        setRemotes(result.data);
        setShowRemotePanel(true);
      }
    } catch (error) {
      console.error('Failed to load remotes:', error);
    }
  };

  // Handle conflict resolution
  const handleResolveConflict = async (file: string, resolution: 'ours' | 'theirs' | 'base') => {
    try {
      const result = await window.electronAPI.invoke('merge:resolveConflict', repoPath, file, resolution);
      if (result.success) {
        // Reload conflicts
        await loadConflicts();
      }
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    }
  };

  // Handle custom conflict resolution
  const handleResolveCustom = async (file: string, content: string) => {
    try {
      const result = await window.electronAPI.invoke('merge:resolveWithContent', repoPath, file, content);
      if (result.success) {
        await loadConflicts();
      }
    } catch (error) {
      console.error('Failed to resolve conflict with custom content:', error);
    }
  };

  // Handle abort merge
  const handleAbortMerge = async () => {
    try {
      const result = await window.electronAPI.invoke('merge:abort', repoPath);
      if (result.success) {
        setShowConflictViewer(false);
        setConflicts([]);
      }
    } catch (error) {
      console.error('Failed to abort merge:', error);
    }
  };

  // Handle continue merge
  const handleContinueMerge = async (message?: string) => {
    try {
      const result = await window.electronAPI.invoke('merge:continue', repoPath, message);
      if (result.success) {
        setShowConflictViewer(false);
        setConflicts([]);
      }
    } catch (error) {
      console.error('Failed to continue merge:', error);
    }
  };

  // Remote operations
  const handleAddRemote = async (name: string, url: string) => {
    try {
      const result = await window.electronAPI.invoke('remote:add', repoPath, name, url);
      if (result.success) {
        await loadRemotes();
      }
    } catch (error) {
      console.error('Failed to add remote:', error);
    }
  };

  const handleRemoveRemote = async (name: string) => {
    try {
      const result = await window.electronAPI.invoke('remote:remove', repoPath, name);
      if (result.success) {
        await loadRemotes();
      }
    } catch (error) {
      console.error('Failed to remove remote:', error);
    }
  };

  const handleUpdateRemoteUrl = async (name: string, newUrl: string) => {
    try {
      const result = await window.electronAPI.invoke('remote:updateUrl', repoPath, name, newUrl);
      if (result.success) {
        await loadRemotes();
      }
    } catch (error) {
      console.error('Failed to update remote URL:', error);
    }
  };

  const handleRenameRemote = async (oldName: string, newName: string) => {
    try {
      const result = await window.electronAPI.invoke('remote:rename', repoPath, oldName, newName);
      if (result.success) {
        await loadRemotes();
      }
    } catch (error) {
      console.error('Failed to rename remote:', error);
    }
  };

  const handleFetch = async (remote: string, prune: boolean) => {
    try {
      const result = await window.electronAPI.invoke('remote:fetch', repoPath, remote, prune);
      if (result.success) {
        console.log('Fetch completed successfully');
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    }
  };

  const handlePull = async (remote: string, branch: string, rebase: boolean) => {
    try {
      const result = await window.electronAPI.invoke('remote:pull', repoPath, remote, branch, rebase);
      if (result.success) {
        console.log('Pull completed successfully');
      }
    } catch (error) {
      console.error('Failed to pull:', error);
    }
  };

  const handlePush = async (remote: string, branch: string, force: boolean) => {
    try {
      const result = await window.electronAPI.invoke('remote:push', repoPath, remote, branch, force);
      if (result.success) {
        console.log('Push completed successfully');
      }
    } catch (error) {
      console.error('Failed to push:', error);
    }
  };

  // Handle settings save
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    // In a real application, you would persist these settings
    localStorage.setItem('gitui-settings', JSON.stringify(newSettings));
    console.log('Settings saved:', newSettings);
  };

  return (
    <div className="phase3-example">
      <h1>GitUI Phase 3 - Feature Demonstration</h1>
      
      <div className="controls">
        <button onClick={loadDiffs}>View Diffs</button>
        <button onClick={loadConflicts}>View Conflicts</button>
        <button onClick={loadRemotes}>Manage Remotes</button>
        <button onClick={() => setShowSettings(true)}>Settings</button>
      </div>

      {/* DiffViewer Component */}
      {showDiffViewer && (
        <DiffViewer 
          diff={diffs} 
          onClose={() => setShowDiffViewer(false)}
        />
      )}

      {/* ConflictViewer Component */}
      {showConflictViewer && (
        <ConflictViewer
          conflicts={conflicts}
          onResolve={handleResolveConflict}
          onResolveCustom={handleResolveCustom}
          onAbortMerge={handleAbortMerge}
          onContinueMerge={handleContinueMerge}
          onClose={() => setShowConflictViewer(false)}
        />
      )}

      {/* RemotePanel Component */}
      {showRemotePanel && (
        <RemotePanel
          remotes={remotes}
          currentBranch={currentBranch}
          onAddRemote={handleAddRemote}
          onRemoveRemote={handleRemoveRemote}
          onUpdateRemoteUrl={handleUpdateRemoteUrl}
          onRenameRemote={handleRenameRemote}
          onFetch={handleFetch}
          onPull={handlePull}
          onPush={handlePush}
          onRefresh={loadRemotes}
        />
      )}

      {/* SettingsDialog Component */}
      {showSettings && (
        <SettingsDialog
          currentSettings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

/**
 * Example of programmatic usage without UI components
 */
export class Phase3API {
  constructor(private repoPath: string) {}

  // Diff operations
  async getDiff(files: string[] = []): Promise<Diff[]> {
    const result = await window.electronAPI.invoke('diff:get', this.repoPath, files);
    return result.success ? result.data : [];
  }

  async getStagedDiff(): Promise<Diff[]> {
    const result = await window.electronAPI.invoke('diff:staged', this.repoPath);
    return result.success ? result.data : [];
  }

  async getCommitDiff(commitHash: string): Promise<Diff[]> {
    const result = await window.electronAPI.invoke('diff:commit', this.repoPath, commitHash);
    return result.success ? result.data : [];
  }

  // Conflict resolution
  async detectConflicts(): Promise<Conflict[]> {
    const result = await window.electronAPI.invoke('merge:detectConflicts', this.repoPath);
    return result.success ? result.data : [];
  }

  async resolveConflict(file: string, resolution: 'ours' | 'theirs' | 'base'): Promise<boolean> {
    const result = await window.electronAPI.invoke('merge:resolveConflict', this.repoPath, file, resolution);
    return result.success;
  }

  async resolveWithContent(file: string, content: string): Promise<boolean> {
    const result = await window.electronAPI.invoke('merge:resolveWithContent', this.repoPath, file, content);
    return result.success;
  }

  async abortMerge(): Promise<boolean> {
    const result = await window.electronAPI.invoke('merge:abort', this.repoPath);
    return result.success;
  }

  async continueMerge(message?: string): Promise<boolean> {
    const result = await window.electronAPI.invoke('merge:continue', this.repoPath, message);
    return result.success;
  }

  async isMerging(): Promise<boolean> {
    const result = await window.electronAPI.invoke('merge:isMerging', this.repoPath);
    return result.success ? result.data : false;
  }

  // Remote operations
  async listRemotes(): Promise<Remote[]> {
    const result = await window.electronAPI.invoke('remote:list', this.repoPath);
    return result.success ? result.data : [];
  }

  async addRemote(name: string, url: string): Promise<boolean> {
    const result = await window.electronAPI.invoke('remote:add', this.repoPath, name, url);
    return result.success;
  }

  async removeRemote(name: string): Promise<boolean> {
    const result = await window.electronAPI.invoke('remote:remove', this.repoPath, name);
    return result.success;
  }

  async fetch(remote: string, prune: boolean = false): Promise<boolean> {
    const result = await window.electronAPI.invoke('remote:fetch', this.repoPath, remote, prune);
    return result.success;
  }

  async pull(remote: string, branch: string, rebase: boolean = false): Promise<boolean> {
    const result = await window.electronAPI.invoke('remote:pull', this.repoPath, remote, branch, rebase);
    return result.success;
  }

  async push(remote: string, branch: string, force: boolean = false): Promise<boolean> {
    const result = await window.electronAPI.invoke('remote:push', this.repoPath, remote, branch, force);
    return result.success;
  }
}

// Type declaration for window.electronAPI (would normally be in a .d.ts file)
declare global {
  interface Window {
    electronAPI: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
  }
}
