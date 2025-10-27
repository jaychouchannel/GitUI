import React, { useState } from 'react';
import './SettingsDialog.css';

interface SettingsDialogProps {
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
  currentSettings: AppSettings;
}

export interface AppSettings {
  git: {
    userName: string;
    userEmail: string;
    defaultBranch: string;
    autoFetch: boolean;
    autoFetchInterval: number; // in minutes
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    showLineNumbers: boolean;
    compactMode: boolean;
  };
  editor: {
    tabSize: number;
    insertSpaces: boolean;
    wordWrap: boolean;
    fontFamily: string;
  };
  advanced: {
    maxCommitHistory: number;
    enableDebugMode: boolean;
    gitPath: string;
  };
}

/**
 * Component for application settings
 */
export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  onClose,
  onSave,
  currentSettings,
}) => {
  const [settings, setSettings] = useState<AppSettings>(currentSettings);
  const [activeTab, setActiveTab] = useState<'git' | 'ui' | 'editor' | 'advanced'>('git');

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const updateGitSettings = (key: keyof AppSettings['git'], value: any) => {
    setSettings({
      ...settings,
      git: { ...settings.git, [key]: value },
    });
  };

  const updateUiSettings = (key: keyof AppSettings['ui'], value: any) => {
    setSettings({
      ...settings,
      ui: { ...settings.ui, [key]: value },
    });
  };

  const updateEditorSettings = (key: keyof AppSettings['editor'], value: any) => {
    setSettings({
      ...settings,
      editor: { ...settings.editor, [key]: value },
    });
  };

  const updateAdvancedSettings = (key: keyof AppSettings['advanced'], value: any) => {
    setSettings({
      ...settings,
      advanced: { ...settings.advanced, [key]: value },
    });
  };

  return (
    <div className="settings-dialog-overlay" onClick={onClose}>
      <div className="settings-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="settings-dialog-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="settings-dialog-body">
          <div className="settings-tabs">
            <button
              className={`settings-tab ${activeTab === 'git' ? 'active' : ''}`}
              onClick={() => setActiveTab('git')}
            >
              Git
            </button>
            <button
              className={`settings-tab ${activeTab === 'ui' ? 'active' : ''}`}
              onClick={() => setActiveTab('ui')}
            >
              User Interface
            </button>
            <button
              className={`settings-tab ${activeTab === 'editor' ? 'active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              Editor
            </button>
            <button
              className={`settings-tab ${activeTab === 'advanced' ? 'active' : ''}`}
              onClick={() => setActiveTab('advanced')}
            >
              Advanced
            </button>
          </div>

          <div className="settings-content">
            {activeTab === 'git' && (
              <div className="settings-section">
                <h3>Git Configuration</h3>

                <div className="setting-item">
                  <label>User Name</label>
                  <input
                    type="text"
                    value={settings.git.userName}
                    onChange={(e) => updateGitSettings('userName', e.target.value)}
                    placeholder="Your Name"
                  />
                  <p className="setting-description">
                    Name to use for Git commits (git config user.name)
                  </p>
                </div>

                <div className="setting-item">
                  <label>User Email</label>
                  <input
                    type="email"
                    value={settings.git.userEmail}
                    onChange={(e) => updateGitSettings('userEmail', e.target.value)}
                    placeholder="your.email@example.com"
                  />
                  <p className="setting-description">
                    Email to use for Git commits (git config user.email)
                  </p>
                </div>

                <div className="setting-item">
                  <label>Default Branch Name</label>
                  <input
                    type="text"
                    value={settings.git.defaultBranch}
                    onChange={(e) => updateGitSettings('defaultBranch', e.target.value)}
                    placeholder="main"
                  />
                  <p className="setting-description">
                    Default branch name for new repositories
                  </p>
                </div>

                <div className="setting-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.git.autoFetch}
                      onChange={(e) => updateGitSettings('autoFetch', e.target.checked)}
                    />
                    <span>Auto-fetch from remotes</span>
                  </label>
                  <p className="setting-description">
                    Automatically fetch changes from remote repositories
                  </p>
                </div>

                {settings.git.autoFetch && (
                  <div className="setting-item">
                    <label>Auto-fetch Interval (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.git.autoFetchInterval}
                      onChange={(e) =>
                        updateGitSettings('autoFetchInterval', parseInt(e.target.value))
                      }
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ui' && (
              <div className="settings-section">
                <h3>User Interface</h3>

                <div className="setting-item">
                  <label>Theme</label>
                  <select
                    value={settings.ui.theme}
                    onChange={(e) => updateUiSettings('theme', e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                  <p className="setting-description">Color theme for the application</p>
                </div>

                <div className="setting-item">
                  <label>Font Size</label>
                  <select
                    value={settings.ui.fontSize}
                    onChange={(e) => updateUiSettings('fontSize', e.target.value)}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                  <p className="setting-description">Base font size for the UI</p>
                </div>

                <div className="setting-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.ui.showLineNumbers}
                      onChange={(e) => updateUiSettings('showLineNumbers', e.target.checked)}
                    />
                    <span>Show line numbers in diff view</span>
                  </label>
                </div>

                <div className="setting-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.ui.compactMode}
                      onChange={(e) => updateUiSettings('compactMode', e.target.checked)}
                    />
                    <span>Compact mode (reduce spacing)</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'editor' && (
              <div className="settings-section">
                <h3>Editor Settings</h3>

                <div className="setting-item">
                  <label>Tab Size</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={settings.editor.tabSize}
                    onChange={(e) => updateEditorSettings('tabSize', parseInt(e.target.value))}
                  />
                  <p className="setting-description">Number of spaces per tab</p>
                </div>

                <div className="setting-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.editor.insertSpaces}
                      onChange={(e) => updateEditorSettings('insertSpaces', e.target.checked)}
                    />
                    <span>Insert spaces instead of tabs</span>
                  </label>
                </div>

                <div className="setting-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.editor.wordWrap}
                      onChange={(e) => updateEditorSettings('wordWrap', e.target.checked)}
                    />
                    <span>Word wrap</span>
                  </label>
                </div>

                <div className="setting-item">
                  <label>Font Family</label>
                  <input
                    type="text"
                    value={settings.editor.fontFamily}
                    onChange={(e) => updateEditorSettings('fontFamily', e.target.value)}
                    placeholder="Courier New, monospace"
                  />
                  <p className="setting-description">Font family for code/diff editor</p>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="settings-section">
                <h3>Advanced Settings</h3>

                <div className="setting-item">
                  <label>Max Commit History</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={settings.advanced.maxCommitHistory}
                    onChange={(e) =>
                      updateAdvancedSettings('maxCommitHistory', parseInt(e.target.value))
                    }
                  />
                  <p className="setting-description">
                    Maximum number of commits to load in history view
                  </p>
                </div>

                <div className="setting-item">
                  <label>Git Executable Path</label>
                  <input
                    type="text"
                    value={settings.advanced.gitPath}
                    onChange={(e) => updateAdvancedSettings('gitPath', e.target.value)}
                    placeholder="git (auto-detect)"
                  />
                  <p className="setting-description">
                    Path to Git executable (leave empty for auto-detection)
                  </p>
                </div>

                <div className="setting-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.advanced.enableDebugMode}
                      onChange={(e) =>
                        updateAdvancedSettings('enableDebugMode', e.target.checked)
                      }
                    />
                    <span>Enable debug mode</span>
                  </label>
                  <p className="setting-description">
                    Show detailed logs and error messages (for debugging)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="settings-dialog-footer">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
