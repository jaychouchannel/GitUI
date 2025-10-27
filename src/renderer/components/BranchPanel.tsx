import React, { useEffect, useState } from 'react';
import { ipcApi } from '../utils/ipc';
import { Branch } from '@types/index';
import './BranchPanel.css';

interface BranchPanelProps {
  repoPath: string | null;
}

/**
 * Branch panel component for managing branches
 */
const BranchPanel: React.FC<BranchPanelProps> = ({ repoPath }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  useEffect(() => {
    if (!repoPath) {
      setBranches([]);
      return;
    }

    loadBranches();
  }, [repoPath]);

  const loadBranches = async () => {
    if (!repoPath) return;

    setLoading(true);
    setError(null);

    try {
      const result = await ipcApi.listBranches(repoPath);
      if (result.success) {
        setBranches(result.data);
      } else {
        setError(result.error || '加载分支失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载分支失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchBranch = async (branchName: string) => {
    if (!repoPath) return;

    try {
      const result = await ipcApi.switchBranch(repoPath, branchName);
      if (result.success) {
        await loadBranches();
      } else {
        alert(`切换分支失败: ${result.error}`);
      }
    } catch (err) {
      alert(`切换分支失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  const handleCreateBranch = async () => {
    if (!repoPath || !newBranchName.trim()) return;

    try {
      const result = await ipcApi.createBranch(repoPath, newBranchName.trim());
      if (result.success) {
        setNewBranchName('');
        setShowCreateDialog(false);
        await loadBranches();
      } else {
        alert(`创建分支失败: ${result.error}`);
      }
    } catch (err) {
      alert(`创建分支失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  if (!repoPath) {
    return (
      <div className="branch-panel">
        <div className="empty-state">
          <p>请先打开一个 Git 仓库</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="branch-panel">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="branch-panel">
        <div className="error">{error}</div>
        <button className="retry-btn" onClick={loadBranches}>
          重试
        </button>
      </div>
    );
  }

  const currentBranch = branches.find((b) => b.isCurrent);
  const localBranches = branches.filter((b) => !b.isRemote);
  const remoteBranches = branches.filter((b) => b.isRemote);

  return (
    <div className="branch-panel">
      <div className="panel-header">
        <h3>分支</h3>
        <button
          className="create-branch-btn"
          onClick={() => setShowCreateDialog(true)}
        >
          ➕
        </button>
      </div>

      {currentBranch && (
        <div className="current-branch">
          <span className="branch-icon">🌿</span>
          <span className="branch-name">{currentBranch.name}</span>
          <span className="current-badge">当前</span>
        </div>
      )}

      <div className="branch-section">
        <h4>本地分支 ({localBranches.length})</h4>
        <div className="branch-list scrollable">
          {localBranches.map((branch) => (
            <div
              key={branch.name}
              className={`branch-item ${branch.isCurrent ? 'current' : ''}`}
              onClick={() => !branch.isCurrent && handleSwitchBranch(branch.name)}
            >
              <span className="branch-icon">
                {branch.isCurrent ? '✓' : '○'}
              </span>
              <span className="branch-name">{branch.name}</span>
              <span className="branch-commit">{branch.lastCommit.substring(0, 7)}</span>
            </div>
          ))}
        </div>
      </div>

      {remoteBranches.length > 0 && (
        <div className="branch-section">
          <h4>远程分支 ({remoteBranches.length})</h4>
          <div className="branch-list scrollable">
            {remoteBranches.map((branch) => (
              <div key={branch.name} className="branch-item remote">
                <span className="branch-icon">☁️</span>
                <span className="branch-name">{branch.name}</span>
                <span className="branch-commit">{branch.lastCommit.substring(0, 7)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCreateDialog && (
        <div className="modal-overlay" onClick={() => setShowCreateDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>创建新分支</h3>
            <input
              type="text"
              placeholder="分支名称"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateBranch()}
              autoFocus
            />
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowCreateDialog(false)}
              >
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateBranch}
                disabled={!newBranchName.trim()}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchPanel;
