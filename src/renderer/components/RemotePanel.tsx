import React, { useState, useEffect } from 'react';
import { Remote } from '../../types';
import './RemotePanel.css';

interface RemotePanelProps {
  remotes: Remote[];
  currentBranch: string;
  onAddRemote: (name: string, url: string) => Promise<void>;
  onRemoveRemote: (name: string) => Promise<void>;
  onUpdateRemoteUrl: (name: string, newUrl: string) => Promise<void>;
  onRenameRemote: (oldName: string, newName: string) => Promise<void>;
  onFetch: (remote: string, prune: boolean) => Promise<void>;
  onPull: (remote: string, branch: string, rebase: boolean) => Promise<void>;
  onPush: (remote: string, branch: string, force: boolean) => Promise<void>;
  onRefresh: () => void;
}

/**
 * Component for managing remote repositories
 */
export const RemotePanel: React.FC<RemotePanelProps> = ({
  remotes,
  currentBranch,
  onAddRemote,
  onRemoveRemote,
  onUpdateRemoteUrl,
  onRenameRemote,
  onFetch,
  onPull,
  onPush,
  onRefresh,
}) => {
  const [showAddRemote, setShowAddRemote] = useState(false);
  const [newRemoteName, setNewRemoteName] = useState('');
  const [newRemoteUrl, setNewRemoteUrl] = useState('');
  const [selectedRemote, setSelectedRemote] = useState<string>('');
  const [editingRemote, setEditingRemote] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (remotes.length > 0 && !selectedRemote) {
      setSelectedRemote(remotes[0].name);
    }
  }, [remotes, selectedRemote]);

  const handleAddRemote = async () => {
    if (newRemoteName && newRemoteUrl) {
      await onAddRemote(newRemoteName, newRemoteUrl);
      setNewRemoteName('');
      setNewRemoteUrl('');
      setShowAddRemote(false);
      onRefresh();
    }
  };

  const handleRemoveRemote = async (name: string) => {
    if (confirm(`Are you sure you want to remove remote '${name}'?`)) {
      await onRemoveRemote(name);
      if (selectedRemote === name) {
        setSelectedRemote('');
      }
      onRefresh();
    }
  };

  const handleUpdateRemote = async (name: string) => {
    if (editUrl) {
      await onUpdateRemoteUrl(name, editUrl);
      setEditingRemote(null);
      onRefresh();
    }
    if (editName && editName !== name) {
      await onRenameRemote(name, editName);
      setSelectedRemote(editName);
      setEditingRemote(null);
      onRefresh();
    }
  };

  const handleFetch = async (prune: boolean = false) => {
    if (selectedRemote) {
      await onFetch(selectedRemote, prune);
      onRefresh();
    }
  };

  const handlePull = async (rebase: boolean = false) => {
    if (selectedRemote) {
      await onPull(selectedRemote, currentBranch, rebase);
      onRefresh();
    }
  };

  const handlePush = async (force: boolean = false) => {
    if (selectedRemote) {
      if (force && !confirm('Force push may overwrite remote changes. Continue?')) {
        return;
      }
      await onPush(selectedRemote, currentBranch, force);
      onRefresh();
    }
  };

  const startEdit = (remote: Remote) => {
    setEditingRemote(remote.name);
    setEditUrl(remote.url);
    setEditName(remote.name);
  };

  const cancelEdit = () => {
    setEditingRemote(null);
    setEditUrl('');
    setEditName('');
  };

  return (
    <div className="remote-panel">
      <div className="remote-panel-header">
        <h3>Remote Repositories</h3>
        <div className="remote-panel-actions">
          <button className="btn btn-small" onClick={onRefresh}>
            Refresh
          </button>
          <button className="btn btn-small btn-primary" onClick={() => setShowAddRemote(true)}>
            Add Remote
          </button>
        </div>
      </div>

      {showAddRemote && (
        <div className="remote-add-form">
          <h4>Add New Remote</h4>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              placeholder="origin"
              value={newRemoteName}
              onChange={(e) => setNewRemoteName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>URL:</label>
            <input
              type="text"
              placeholder="https://github.com/user/repo.git"
              value={newRemoteUrl}
              onChange={(e) => setNewRemoteUrl(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button className="btn btn-small" onClick={() => setShowAddRemote(false)}>
              Cancel
            </button>
            <button className="btn btn-small btn-primary" onClick={handleAddRemote}>
              Add
            </button>
          </div>
        </div>
      )}

      <div className="remote-panel-body">
        {remotes.length === 0 ? (
          <div className="remote-panel-empty">
            <p>No remote repositories configured</p>
            <button className="btn btn-primary" onClick={() => setShowAddRemote(true)}>
              Add Remote
            </button>
          </div>
        ) : (
          <>
            <div className="remote-list">
              {remotes.map((remote) => (
                <div
                  key={remote.name}
                  className={`remote-item ${selectedRemote === remote.name ? 'active' : ''}`}
                >
                  {editingRemote === remote.name ? (
                    <div className="remote-edit-form">
                      <div className="form-group">
                        <label>Name:</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>URL:</label>
                        <input
                          type="text"
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                        />
                      </div>
                      <div className="form-actions">
                        <button className="btn btn-small" onClick={cancelEdit}>
                          Cancel
                        </button>
                        <button
                          className="btn btn-small btn-primary"
                          onClick={() => handleUpdateRemote(remote.name)}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="remote-item-info"
                        onClick={() => setSelectedRemote(remote.name)}
                      >
                        <div className="remote-item-name">{remote.name}</div>
                        <div className="remote-item-url">{remote.url}</div>
                      </div>
                      <div className="remote-item-actions">
                        <button
                          className="btn-icon"
                          onClick={() => startEdit(remote)}
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleRemoveRemote(remote.name)}
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {selectedRemote && (
              <div className="remote-operations">
                <h4>Operations for '{selectedRemote}'</h4>
                <p className="remote-operations-branch">Current branch: {currentBranch}</p>

                <div className="remote-operation-section">
                  <h5>Fetch</h5>
                  <p className="operation-description">
                    Download changes from remote without merging
                  </p>
                  <div className="operation-buttons">
                    <button className="btn" onClick={() => handleFetch(false)}>
                      Fetch
                    </button>
                    <button className="btn" onClick={() => handleFetch(true)}>
                      Fetch with Prune
                    </button>
                  </div>
                </div>

                <div className="remote-operation-section">
                  <h5>Pull</h5>
                  <p className="operation-description">
                    Download and merge changes from remote
                  </p>
                  <div className="operation-buttons">
                    <button className="btn btn-primary" onClick={() => handlePull(false)}>
                      Pull
                    </button>
                    <button className="btn" onClick={() => handlePull(true)}>
                      Pull with Rebase
                    </button>
                  </div>
                </div>

                <div className="remote-operation-section">
                  <h5>Push</h5>
                  <p className="operation-description">Upload local changes to remote</p>
                  <div className="operation-buttons">
                    <button className="btn btn-success" onClick={() => handlePush(false)}>
                      Push
                    </button>
                    <button className="btn btn-danger" onClick={() => handlePush(true)}>
                      Force Push
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
