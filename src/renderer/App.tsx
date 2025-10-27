import React, { useState } from 'react';
import MainLayout from './components/MainLayout';
import RepositoryView from './components/RepositoryView';
import CommitHistory from './components/CommitHistory';
import BranchPanel from './components/BranchPanel';
import './styles/App.css';

type TabType = 'files' | 'commits' | 'branches';

/**
 * Main application component
 * Manages the overall layout and state of the application
 */
const App: React.FC = () => {
  const [repoPath, setRepoPath] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('files');

  return (
    <div className="app">
      <MainLayout 
        repoPath={repoPath}
        onRepoPathChange={setRepoPath}
      >
        <div className="content-container">
          <div className="left-panel">
            <div className="tab-bar">
              <button 
                className={`tab ${activeTab === 'files' ? 'active' : ''}`}
                onClick={() => setActiveTab('files')}
              >
                📁 文件
              </button>
              <button 
                className={`tab ${activeTab === 'branches' ? 'active' : ''}`}
                onClick={() => setActiveTab('branches')}
              >
                🌿 分支
              </button>
            </div>
            <div className="tab-content">
              {activeTab === 'files' && <RepositoryView repoPath={repoPath} />}
              {activeTab === 'branches' && <BranchPanel repoPath={repoPath} />}
            </div>
          </div>
          <div className="right-panel">
            <CommitHistory repoPath={repoPath} />
          </div>
        </div>
      </MainLayout>
    </div>
  );
};

export default App;
