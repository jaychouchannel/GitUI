import React, { useState } from 'react';
import MainLayout from './components/MainLayout';
import RepositoryView from './components/RepositoryView';
import CommitHistory from './components/CommitHistory';
import './styles/App.css';

/**
 * Main application component
 * Manages the overall layout and state of the application
 */
const App: React.FC = () => {
  const [repoPath, setRepoPath] = useState<string | null>(null);

  return (
    <div className="app">
      <MainLayout 
        repoPath={repoPath}
        onRepoPathChange={setRepoPath}
      >
        <div className="content-container">
          <div className="left-panel">
            <RepositoryView repoPath={repoPath} />
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
