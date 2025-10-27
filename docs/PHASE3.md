# GitUI Phase 3 Features Documentation

## Overview

Phase 3 of GitUI introduces four major feature sets:

1. **DiffViewer** - Visual diff viewer for file changes
2. **ConflictViewer** - Interactive merge conflict resolution
3. **RemotePanel** - Remote repository management
4. **SettingsDialog** - Application configuration

## Feature Details

### 1. DiffViewer

The DiffViewer component provides a rich interface for viewing file differences.

#### Features
- Unified and split diff views
- Syntax highlighting for changes
- File list navigation
- Addition/deletion statistics
- Line number display

#### Usage

```typescript
import { DiffViewer } from './components/DiffViewer';

<DiffViewer 
  diff={diffArray} 
  onClose={() => setShowDiff(false)}
/>
```

#### IPC Handlers

- `diff:get` - Get diff for specific files
- `diff:staged` - Get diff for staged changes
- `diff:commit` - Get diff for a specific commit

### 2. ConflictViewer

The ConflictViewer provides an intuitive interface for resolving merge conflicts.

#### Features
- Side-by-side conflict comparison
- Three-way merge view (ours, theirs, base)
- Quick resolution buttons (Use Ours, Use Theirs)
- Manual editing capability
- Conflict type detection (content, delete, rename)
- Merge abort and continue options

#### Usage

```typescript
import { ConflictViewer } from './components/ConflictViewer';

<ConflictViewer
  conflicts={conflictArray}
  onResolve={handleResolve}
  onResolveCustom={handleResolveCustom}
  onAbortMerge={handleAbort}
  onContinueMerge={handleContinue}
/>
```

#### IPC Handlers

- `merge:detectConflicts` - Detect conflicts in repository
- `merge:resolveConflict` - Resolve conflict with a specific version
- `merge:resolveWithContent` - Resolve conflict with custom content
- `merge:abort` - Abort the current merge
- `merge:continue` - Continue merge after resolving conflicts
- `merge:isMerging` - Check if a merge is in progress

#### MergeResolver Manager

The `MergeResolver` class handles all merge conflict operations:

```typescript
import { MergeResolver } from './core/managers/MergeResolver';

const resolver = new MergeResolver('/path/to/repo');

// Detect conflicts
const conflicts = await resolver.detectConflicts();

// Resolve with "ours" version
await resolver.resolveConflict('file.txt', 'ours');

// Resolve with custom content
await resolver.resolveWithContent('file.txt', 'resolved content');

// Abort merge
await resolver.abortMerge();

// Continue merge
await resolver.continueMerge('Merge commit message');

// Check if merging
const isMerging = await resolver.isMerging();
```

### 3. RemotePanel

The RemotePanel component manages remote repository operations.

#### Features
- List all configured remotes
- Add/remove remote repositories
- Update remote URLs
- Rename remotes
- Fetch from remote
- Pull with/without rebase
- Push with/without force
- Visual feedback for operations

#### Usage

```typescript
import { RemotePanel } from './components/RemotePanel';

<RemotePanel
  remotes={remoteArray}
  currentBranch={currentBranch}
  onAddRemote={handleAdd}
  onRemoveRemote={handleRemove}
  onUpdateRemoteUrl={handleUpdate}
  onRenameRemote={handleRename}
  onFetch={handleFetch}
  onPull={handlePull}
  onPush={handlePush}
  onRefresh={handleRefresh}
/>
```

#### IPC Handlers

- `remote:list` - List all remotes
- `remote:add` - Add a new remote
- `remote:remove` - Remove a remote
- `remote:updateUrl` - Update remote URL
- `remote:rename` - Rename a remote
- `remote:fetch` - Fetch from remote
- `remote:pull` - Pull from remote
- `remote:push` - Push to remote

### 4. SettingsDialog

The SettingsDialog provides a comprehensive settings interface.

#### Settings Categories

**Git Settings**
- User name and email
- Default branch name
- Auto-fetch configuration
- Auto-fetch interval

**UI Settings**
- Theme (light, dark, auto)
- Font size
- Line numbers in diff view
- Compact mode

**Editor Settings**
- Tab size
- Insert spaces vs tabs
- Word wrap
- Font family

**Advanced Settings**
- Max commit history
- Git executable path
- Debug mode

#### Usage

```typescript
import { SettingsDialog, AppSettings } from './components/SettingsDialog';

<SettingsDialog
  currentSettings={settings}
  onSave={handleSave}
  onClose={() => setShowSettings(false)}
/>
```

## Architecture

### Component Hierarchy

```
Phase 3 Components
├── DiffViewer
│   ├── UnifiedDiffView
│   └── SplitDiffView
├── ConflictViewer
│   ├── ConflictFileList
│   ├── ConflictResolutionOptions
│   └── ConflictEditMode
├── RemotePanel
│   ├── RemoteList
│   └── RemoteOperations
└── SettingsDialog
    ├── SettingsTabs
    └── SettingsContent
```

### Manager Layer

```
Business Logic Managers
├── DiffManager (existing)
│   ├── getDiff()
│   ├── getStagedDiff()
│   └── getCommitDiff()
├── RemoteManager (existing)
│   ├── listRemotes()
│   ├── addRemote()
│   ├── fetch()
│   ├── pull()
│   └── push()
└── MergeResolver (new)
    ├── detectConflicts()
    ├── resolveConflict()
    ├── resolveWithContent()
    ├── abortMerge()
    └── continueMerge()
```

## Testing

### Unit Tests

Tests are provided for the MergeResolver manager:

```bash
npm test tests/unit/MergeResolver.test.ts
```

Test coverage includes:
- Conflict detection
- Conflict resolution (ours, theirs, base)
- Custom content resolution
- Merge abort
- Merge continuation
- Merge state checking

### Integration Testing

To test the components in isolation, use the provided example file:

```bash
# See phase3-example.tsx for integration examples
```

## Best Practices

### Error Handling

All Phase 3 components and managers implement proper error handling:

```typescript
try {
  const conflicts = await resolver.detectConflicts();
  // Handle conflicts
} catch (error) {
  // User-friendly error messages are provided
  console.error('Failed to detect conflicts:', error.message);
}
```

### IPC Communication

Always check for success before accessing data:

```typescript
const result = await window.electronAPI.invoke('merge:detectConflicts', repoPath);
if (result.success) {
  setConflicts(result.data);
} else {
  console.error(result.error);
}
```

### State Management

Components are designed to be controlled:

```typescript
// Parent component manages state
const [conflicts, setConflicts] = useState<Conflict[]>([]);
const [showConflictViewer, setShowConflictViewer] = useState(false);

// Component receives state and callbacks
<ConflictViewer
  conflicts={conflicts}
  onResolve={async (file, resolution) => {
    await resolveConflict(file, resolution);
    await reloadConflicts(); // Update state
  }}
/>
```

## Performance Considerations

### DiffViewer
- Uses virtualization for large diffs
- Lazy loading of file contents
- Debounced view mode switching

### ConflictViewer
- Only loads visible conflict content
- Efficient diff comparison
- Optimized re-rendering

### RemotePanel
- Async operations with loading states
- Optimistic UI updates
- Error recovery mechanisms

## Future Enhancements

Potential improvements for Phase 4:

1. **DiffViewer**
   - Inline comments
   - Syntax highlighting
   - Image diff support

2. **ConflictViewer**
   - Three-way merge editor
   - Smart conflict detection
   - Conflict resolution suggestions

3. **RemotePanel**
   - Progress indicators for long operations
   - Batch operations
   - Remote branch management

4. **SettingsDialog**
   - Import/export settings
   - Per-repository settings
   - Plugin configuration

## Migration Guide

If upgrading from previous versions:

1. Update IPC handler imports in main process
2. Add new manager imports where needed
3. Update component usage to match new props
4. Update type definitions if customized

## Troubleshooting

### Common Issues

**DiffViewer not showing content**
- Ensure diff data is properly formatted
- Check if files exist in repository

**ConflictViewer not detecting conflicts**
- Verify repository is in merging state
- Check MERGE_HEAD file exists

**RemotePanel operations failing**
- Verify network connectivity
- Check Git credentials
- Ensure remote URLs are correct

**Settings not persisting**
- Implement localStorage or file-based persistence
- Ensure settings object structure matches AppSettings interface

## Support

For issues and feature requests, please refer to the main GitUI repository.
