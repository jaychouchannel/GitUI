import React, { useEffect, useState } from 'react';
import { ipcApi } from '../utils/ipc';
import { RepoStatus } from '@types/index';
import './RepositoryView.css';

interface RepositoryViewProps {
  repoPath: string | null;
}

/**
 * Repository view component showing file status
 */
const RepositoryView: React.FC<RepositoryViewProps> = ({ repoPath }) => {
  const [status, setStatus] = useState<RepoStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!repoPath) {
      setStatus(null);
      return;
    }

    loadStatus();
  }, [repoPath]);

  const loadStatus = async () => {
    if (!repoPath) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await ipcApi.getStatus(repoPath);
      if (result.success) {
        setStatus(result.data);
      } else {
        setError(result.error || '加载仓库状态失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载仓库状态失败');
    } finally {
      setLoading(false);
    }
  };

  if (!repoPath) {
    return (
      <div className="repository-view">
        <div className="empty-state">
          <p>请先打开一个 Git 仓库</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="repository-view">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="repository-view">
        <div className="error">{error}</div>
        <button className="retry-btn" onClick={loadStatus}>
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="repository-view">
      <div className="section">
        <div className="section-header">
          <h3>暂存的更改 ({status?.staged?.length || 0})</h3>
        </div>
        <div className="file-list scrollable">
          {status?.staged?.length ? (
            status.staged.map((file) => (
              <div key={file} className="file-item staged">
                <span className="file-status">A</span>
                <span className="file-name">{file}</span>
              </div>
            ))
          ) : (
            <div className="empty-list">没有暂存的文件</div>
          )}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h3>未暂存的更改 ({status?.unstaged?.length || 0})</h3>
        </div>
        <div className="file-list scrollable">
          {status?.unstaged?.length ? (
            status.unstaged.map((file) => (
              <div key={file} className="file-item unstaged">
                <span className="file-status">M</span>
                <span className="file-name">{file}</span>
              </div>
            ))
          ) : (
            <div className="empty-list">没有未暂存的文件</div>
          )}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h3>未跟踪的文件 ({status?.untracked?.length || 0})</h3>
        </div>
        <div className="file-list scrollable">
          {status?.untracked?.length ? (
            status.untracked.map((file) => (
              <div key={file} className="file-item untracked">
                <span className="file-status">?</span>
                <span className="file-name">{file}</span>
              </div>
            ))
          ) : (
            <div className="empty-list">没有未跟踪的文件</div>
          )}
        </div>
      </div>

      {status?.conflicts && status.conflicts.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h3>冲突文件 ({status.conflicts.length})</h3>
          </div>
          <div className="file-list scrollable">
            {status.conflicts.map((file) => (
              <div key={file} className="file-item conflict">
                <span className="file-status">!</span>
                <span className="file-name">{file}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositoryView;
