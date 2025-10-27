import React from 'react';
import { ipcApi } from '../utils/ipc';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
  repoPath: string | null;
  onRepoPathChange: (path: string | null) => void;
}

/**
 * Main layout component with header and toolbar
 */
const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  repoPath, 
  onRepoPathChange 
}) => {
  const handleOpenRepository = async () => {
    const result = await ipcApi.openDirectoryDialog();
    if (result.success && result.data) {
      onRepoPathChange(result.data);
    }
  };

  const handleCloseRepository = () => {
    onRepoPathChange(null);
  };

  return (
    <div className="main-layout">
      <header className="header">
        <div className="header-left">
          <h1 className="app-title">GitUI</h1>
          {repoPath && (
            <span className="repo-path">{repoPath}</span>
          )}
        </div>
        <div className="header-right">
          {!repoPath ? (
            <button 
              className="btn btn-primary"
              onClick={handleOpenRepository}
            >
              打开仓库
            </button>
          ) : (
            <button 
              className="btn btn-secondary"
              onClick={handleCloseRepository}
            >
              关闭仓库
            </button>
          )}
        </div>
      </header>
      <div className="toolbar">
        <button className="toolbar-btn" disabled={!repoPath} title="刷新">
          🔄
        </button>
        <button className="toolbar-btn" disabled={!repoPath} title="拉取">
          ⬇️
        </button>
        <button className="toolbar-btn" disabled={!repoPath} title="推送">
          ⬆️
        </button>
        <div className="toolbar-divider" />
        <button className="toolbar-btn" disabled={!repoPath} title="暂存所有">
          ➕
        </button>
        <button className="toolbar-btn" disabled={!repoPath} title="提交">
          ✅
        </button>
      </div>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
