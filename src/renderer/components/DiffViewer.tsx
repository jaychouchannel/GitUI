import React, { useState, useEffect } from 'react';
import { Diff, DiffHunk, DiffLine } from '../../types';
import './DiffViewer.css';

interface DiffViewerProps {
  diff: Diff[];
  onClose?: () => void;
}

/**
 * Component for displaying file diffs
 */
export const DiffViewer: React.FC<DiffViewerProps> = ({ diff, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');

  useEffect(() => {
    if (diff.length > 0 && selectedFile >= diff.length) {
      setSelectedFile(0);
    }
  }, [diff, selectedFile]);

  if (diff.length === 0) {
    return (
      <div className="diff-viewer">
        <div className="diff-viewer-header">
          <h3>Diff Viewer</h3>
          {onClose && (
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          )}
        </div>
        <div className="diff-viewer-empty">No changes to display</div>
      </div>
    );
  }

  const currentDiff = diff[selectedFile];

  return (
    <div className="diff-viewer">
      <div className="diff-viewer-header">
        <h3>Diff Viewer</h3>
        <div className="diff-viewer-controls">
          <select
            className="view-mode-selector"
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'unified' | 'split')}
          >
            <option value="unified">Unified View</option>
            <option value="split">Split View</option>
          </select>
          {onClose && (
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          )}
        </div>
      </div>

      <div className="diff-viewer-body">
        <div className="diff-file-list">
          {diff.map((d, index) => (
            <div
              key={d.file}
              className={`diff-file-item ${index === selectedFile ? 'active' : ''}`}
              onClick={() => setSelectedFile(index)}
            >
              <div className="diff-file-name">{d.file}</div>
              <div className="diff-file-stats">
                <span className="additions">+{d.additions}</span>
                <span className="deletions">-{d.deletions}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="diff-content">
          <div className="diff-content-header">
            <span className="diff-content-filename">{currentDiff.file}</span>
            <span className="diff-content-stats">
              +{currentDiff.additions} -{currentDiff.deletions}
            </span>
          </div>

          {viewMode === 'unified' ? (
            <UnifiedDiffView hunks={currentDiff.hunks} />
          ) : (
            <SplitDiffView hunks={currentDiff.hunks} />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Unified diff view (traditional diff view)
 */
const UnifiedDiffView: React.FC<{ hunks: DiffHunk[] }> = ({ hunks }) => {
  return (
    <div className="diff-unified">
      {hunks.map((hunk, hunkIndex) => (
        <div key={hunkIndex} className="diff-hunk">
          <div className="diff-hunk-header">{hunk.header}</div>
          {hunk.lines.map((line, lineIndex) => (
            <div key={lineIndex} className={`diff-line diff-line-${line.type}`}>
              <span className="diff-line-number old">{getOldLineNumber(line, hunk)}</span>
              <span className="diff-line-number new">{getNewLineNumber(line, hunk)}</span>
              <span className="diff-line-indicator">{getLineIndicator(line.type)}</span>
              <span className="diff-line-content">{line.content}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Split diff view (side-by-side)
 */
const SplitDiffView: React.FC<{ hunks: DiffHunk[] }> = ({ hunks }) => {
  return (
    <div className="diff-split">
      {hunks.map((hunk, hunkIndex) => (
        <div key={hunkIndex} className="diff-hunk">
          <div className="diff-hunk-header">{hunk.header}</div>
          <div className="diff-split-container">
            <div className="diff-split-side diff-split-old">
              {hunk.lines.map((line, lineIndex) => {
                if (line.type === 'add') {
                  return <div key={lineIndex} className="diff-line diff-line-empty"></div>;
                }
                return (
                  <div key={lineIndex} className={`diff-line diff-line-${line.type}`}>
                    <span className="diff-line-number">{getOldLineNumber(line, hunk)}</span>
                    <span className="diff-line-content">{line.content}</span>
                  </div>
                );
              })}
            </div>
            <div className="diff-split-side diff-split-new">
              {hunk.lines.map((line, lineIndex) => {
                if (line.type === 'delete') {
                  return <div key={lineIndex} className="diff-line diff-line-empty"></div>;
                }
                return (
                  <div key={lineIndex} className={`diff-line diff-line-${line.type}`}>
                    <span className="diff-line-number">{getNewLineNumber(line, hunk)}</span>
                    <span className="diff-line-content">{line.content}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper functions
function getLineIndicator(type: 'add' | 'delete' | 'context'): string {
  switch (type) {
    case 'add':
      return '+';
    case 'delete':
      return '-';
    case 'context':
      return ' ';
  }
}

function getOldLineNumber(line: DiffLine, hunk: DiffHunk): string {
  if (line.type === 'add') return '';
  return line.lineNumber.toString();
}

function getNewLineNumber(line: DiffLine, hunk: DiffHunk): string {
  if (line.type === 'delete') return '';
  return line.lineNumber.toString();
}
