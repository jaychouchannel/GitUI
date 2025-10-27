import React, { useEffect, useState } from 'react';
import { ipcApi } from '../utils/ipc';
import { Commit } from '@types/index';
import './CommitHistory.css';

interface CommitHistoryProps {
  repoPath: string | null;
}

/**
 * Commit history component showing list of commits
 */
const CommitHistory: React.FC<CommitHistoryProps> = ({ repoPath }) => {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);

  useEffect(() => {
    if (!repoPath) {
      setCommits([]);
      setSelectedCommit(null);
      return;
    }

    loadCommits();
  }, [repoPath]);

  const loadCommits = async () => {
    if (!repoPath) return;

    setLoading(true);
    setError(null);

    try {
      const result = await ipcApi.getCommitHistory(repoPath, 50);
      if (result.success) {
        setCommits(result.data);
        if (result.data.length > 0) {
          setSelectedCommit(result.data[0]);
        }
      } else {
        setError(result.error || '加载提交历史失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载提交历史失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `${diffMinutes} 分钟前`;
      }
      return `${diffHours} 小时前`;
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays} 天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  const truncateMessage = (message: string, maxLength: number = 60): string => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  const shortenHash = (hash: string): string => {
    return hash.substring(0, 7);
  };

  if (!repoPath) {
    return (
      <div className="commit-history">
        <div className="empty-state">
          <p>请先打开一个 Git 仓库</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="commit-history">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="commit-history">
        <div className="error">{error}</div>
        <button className="retry-btn" onClick={loadCommits}>
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="commit-history">
      <div className="commit-list-container">
        <div className="commit-list-header">
          <h3>提交历史 ({commits.length})</h3>
          <button className="refresh-btn" onClick={loadCommits}>
            🔄
          </button>
        </div>
        <div className="commit-list scrollable">
          {commits.length === 0 ? (
            <div className="empty-list">没有提交记录</div>
          ) : (
            commits.map((commit) => (
              <div
                key={commit.hash}
                className={`commit-item ${
                  selectedCommit?.hash === commit.hash ? 'selected' : ''
                }`}
                onClick={() => setSelectedCommit(commit)}
              >
                <div className="commit-header">
                  <span className="commit-hash">{shortenHash(commit.hash)}</span>
                  <span className="commit-date">{formatDate(commit.date)}</span>
                </div>
                <div className="commit-message">
                  {truncateMessage(commit.message)}
                </div>
                <div className="commit-author">{commit.author}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedCommit && (
        <div className="commit-details">
          <div className="details-header">
            <h3>提交详情</h3>
          </div>
          <div className="details-content scrollable">
            <div className="detail-row">
              <span className="detail-label">提交哈希:</span>
              <span className="detail-value commit-hash-full">
                {selectedCommit.hash}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">作者:</span>
              <span className="detail-value">{selectedCommit.author}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">日期:</span>
              <span className="detail-value">
                {selectedCommit.date.toLocaleString('zh-CN')}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">提交信息:</span>
            </div>
            <div className="commit-message-full">
              {selectedCommit.message}
            </div>
            {selectedCommit.files && selectedCommit.files.length > 0 && (
              <>
                <div className="detail-row">
                  <span className="detail-label">
                    更改的文件 ({selectedCommit.files.length}):
                  </span>
                </div>
                <div className="file-changes">
                  {selectedCommit.files.map((file, index) => (
                    <div key={index} className="changed-file">
                      {file}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitHistory;
