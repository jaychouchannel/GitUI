/**
 * Core type definitions for GitUI
 */

/**
 * Represents a Git repository
 */
export interface Repository {
  /** Absolute path to the repository */
  path: string;
  /** Repository name (usually the folder name) */
  name: string;
  /** Current active branch name */
  currentBranch: string;
  /** Current repository status */
  status: RepoStatus;
}

/**
 * Repository status information
 */
export interface RepoStatus {
  /** Files in the staging area */
  staged: string[];
  /** Modified but unstaged files */
  unstaged: string[];
  /** Untracked files */
  untracked: string[];
  /** Files with merge conflicts */
  conflicts: string[];
}

/**
 * Represents a Git branch
 */
export interface Branch {
  /** Branch name */
  name: string;
  /** Whether this is a remote branch */
  isRemote: boolean;
  /** Whether this is the current branch */
  isCurrent: boolean;
  /** Hash of the last commit on this branch */
  lastCommit: string;
}

/**
 * Represents a Git commit
 */
export interface Commit {
  /** Commit hash (SHA-1) */
  hash: string;
  /** Short commit hash (first 7 characters) */
  shortHash: string;
  /** Author name */
  author: string;
  /** Author email */
  authorEmail: string;
  /** Commit date */
  date: Date;
  /** Commit message */
  message: string;
  /** Parent commit hashes */
  parents: string[];
  /** Files changed in this commit */
  files: string[];
}

/**
 * Represents a remote repository
 */
export interface Remote {
  /** Remote name (e.g., 'origin') */
  name: string;
  /** Remote URL */
  url: string;
  /** Fetch URL (may differ from push URL) */
  fetchUrl?: string;
  /** Push URL */
  pushUrl?: string;
}

/**
 * Represents a file diff
 */
export interface Diff {
  /** File path */
  file: string;
  /** Number of lines added */
  additions: number;
  /** Number of lines deleted */
  deletions: number;
  /** Diff hunks */
  hunks: DiffHunk[];
}

/**
 * Represents a single hunk in a diff
 */
export interface DiffHunk {
  /** Starting line number in old file */
  oldStart: number;
  /** Number of lines in old file */
  oldLines: number;
  /** Starting line number in new file */
  newStart: number;
  /** Number of lines in new file */
  newLines: number;
  /** Header text */
  header: string;
  /** Lines in this hunk */
  lines: DiffLine[];
}

/**
 * Represents a single line in a diff
 */
export interface DiffLine {
  /** Line type */
  type: 'add' | 'delete' | 'context';
  /** Line content */
  content: string;
  /** Line number (in the respective file) */
  lineNumber: number;
}

/**
 * Represents a merge conflict
 */
export interface Conflict {
  /** File path with conflict */
  file: string;
  /** Conflict type */
  type: 'content' | 'delete' | 'rename';
  /** Ours version content */
  ours?: string;
  /** Theirs version content */
  theirs?: string;
  /** Base version content */
  base?: string;
}

/**
 * Command execution result
 */
export interface CommandResult {
  /** Standard output */
  stdout: string;
  /** Standard error */
  stderr: string;
  /** Exit code */
  exitCode: number;
  /** Whether the command succeeded */
  success: boolean;
}

/**
 * Options for Git commands
 */
export interface CommandOptions {
  /** Working directory */
  cwd?: string;
  /** Environment variables */
  env?: Record<string, string>;
  /** Timeout in milliseconds */
  timeout?: number;
}

/**
 * User-friendly error representation
 */
export interface UserFriendlyError {
  /** Error title */
  title: string;
  /** Error message */
  message: string;
  /** Suggested solutions */
  solutions: string[];
  /** Original error */
  originalError?: Error;
}

/**
 * Git tag
 */
export interface Tag {
  /** Tag name */
  name: string;
  /** Commit hash that the tag points to */
  commit: string;
  /** Tag message (for annotated tags) */
  message?: string;
  /** Whether this is an annotated tag */
  isAnnotated: boolean;
}

/**
 * Stash entry
 */
export interface Stash {
  /** Stash index */
  index: number;
  /** Stash description */
  description: string;
  /** Branch name when stash was created */
  branch: string;
  /** Date when stash was created */
  date: Date;
}
