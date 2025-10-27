import React, { useState, useEffect } from 'react';
import { Conflict } from '../../types';
import './ConflictViewer.css';

interface ConflictViewerProps {
  conflicts: Conflict[];
  onResolve: (file: string, resolution: 'ours' | 'theirs' | 'base') => Promise<void>;
  onResolveCustom: (file: string, content: string) => Promise<void>;
  onAbortMerge: () => Promise<void>;
  onContinueMerge: (message?: string) => Promise<void>;
  onClose?: () => void;
}

/**
 * Component for resolving merge conflicts
 */
export const ConflictViewer: React.FC<ConflictViewerProps> = ({
  conflicts,
  onResolve,
  onResolveCustom,
  onAbortMerge,
  onContinueMerge,
  onClose,
}) => {
  const [selectedConflict, setSelectedConflict] = useState<number>(0);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>('');
  const [commitMessage, setCommitMessage] = useState<string>('');

  useEffect(() => {
    if (conflicts.length > 0 && selectedConflict >= conflicts.length) {
      setSelectedConflict(0);
    }
  }, [conflicts, selectedConflict]);

  if (conflicts.length === 0) {
    return (
      <div className="conflict-viewer">
        <div className="conflict-viewer-header">
          <h3>Conflict Resolver</h3>
          {onClose && (
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          )}
        </div>
        <div className="conflict-viewer-empty">
          <p>No conflicts to resolve</p>
          <button className="btn btn-primary" onClick={() => onContinueMerge()}>
            Continue Merge
          </button>
        </div>
      </div>
    );
  }

  const currentConflict = conflicts[selectedConflict];

  const handleResolve = async (resolution: 'ours' | 'theirs' | 'base') => {
    await onResolve(currentConflict.file, resolution);
    // Move to next conflict if available
    if (selectedConflict < conflicts.length - 1) {
      setSelectedConflict(selectedConflict + 1);
    }
  };

  const handleEditResolve = async () => {
    await onResolveCustom(currentConflict.file, editedContent);
    setEditMode(false);
    setEditedContent('');
    // Move to next conflict if available
    if (selectedConflict < conflicts.length - 1) {
      setSelectedConflict(selectedConflict + 1);
    }
  };

  const handleAbortMerge = async () => {
    if (confirm('Are you sure you want to abort the merge? All changes will be lost.')) {
      await onAbortMerge();
    }
  };

  const handleContinueMerge = async () => {
    await onContinueMerge(commitMessage || undefined);
  };

  return (
    <div className="conflict-viewer">
      <div className="conflict-viewer-header">
        <h3>Conflict Resolver ({conflicts.length} conflicts)</h3>
        <div className="conflict-viewer-actions">
          <button className="btn btn-danger" onClick={handleAbortMerge}>
            Abort Merge
          </button>
          {onClose && (
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          )}
        </div>
      </div>

      <div className="conflict-viewer-body">
        <div className="conflict-file-list">
          {conflicts.map((conflict, index) => (
            <div
              key={conflict.file}
              className={`conflict-file-item ${index === selectedConflict ? 'active' : ''}`}
              onClick={() => setSelectedConflict(index)}
            >
              <div className="conflict-file-name">{conflict.file}</div>
              <div className="conflict-file-type">{conflict.type}</div>
            </div>
          ))}
        </div>

        <div className="conflict-content">
          <div className="conflict-content-header">
            <span className="conflict-content-filename">{currentConflict.file}</span>
            <span className="conflict-content-type">Type: {currentConflict.type}</span>
          </div>

          {!editMode ? (
            <div className="conflict-resolution-options">
              {currentConflict.type === 'content' && (
                <>
                  <div className="conflict-version-panel">
                    <div className="conflict-version-header">
                      <h4>Ours (Current Branch)</h4>
                      <button className="btn btn-small" onClick={() => handleResolve('ours')}>
                        Use This
                      </button>
                    </div>
                    <pre className="conflict-version-content">
                      {currentConflict.ours || 'No content'}
                    </pre>
                  </div>

                  <div className="conflict-version-panel">
                    <div className="conflict-version-header">
                      <h4>Theirs (Incoming Branch)</h4>
                      <button className="btn btn-small" onClick={() => handleResolve('theirs')}>
                        Use This
                      </button>
                    </div>
                    <pre className="conflict-version-content">
                      {currentConflict.theirs || 'No content'}
                    </pre>
                  </div>

                  {currentConflict.base && (
                    <div className="conflict-version-panel">
                      <div className="conflict-version-header">
                        <h4>Base (Common Ancestor)</h4>
                        <button className="btn btn-small" onClick={() => handleResolve('base')}>
                          Use This
                        </button>
                      </div>
                      <pre className="conflict-version-content">{currentConflict.base}</pre>
                    </div>
                  )}

                  <div className="conflict-custom-edit">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditMode(true);
                        setEditedContent(currentConflict.ours || currentConflict.theirs || '');
                      }}
                    >
                      Edit Manually
                    </button>
                  </div>
                </>
              )}

              {currentConflict.type === 'delete' && (
                <div className="conflict-delete-panel">
                  <p>
                    This file was deleted in one branch and modified in another. Choose how to
                    resolve:
                  </p>
                  <div className="conflict-delete-actions">
                    <button className="btn btn-danger" onClick={() => handleResolve('theirs')}>
                      Keep Deleted
                    </button>
                    <button className="btn btn-primary" onClick={() => handleResolve('ours')}>
                      Keep File
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="conflict-edit-mode">
              <div className="conflict-edit-header">
                <h4>Edit Resolution</h4>
                <div>
                  <button className="btn btn-small" onClick={() => setEditMode(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-small btn-primary" onClick={handleEditResolve}>
                    Save Resolution
                  </button>
                </div>
              </div>
              <textarea
                className="conflict-edit-textarea"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="conflict-viewer-footer">
        <div className="conflict-commit-message">
          <label>Merge Commit Message (Optional):</label>
          <input
            type="text"
            placeholder="Enter commit message..."
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
          />
        </div>
        <button
          className="btn btn-success"
          onClick={handleContinueMerge}
          disabled={conflicts.length > 0}
        >
          Complete Merge
        </button>
      </div>
    </div>
  );
};
