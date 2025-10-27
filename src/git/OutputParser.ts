import { RepoStatus, Branch, Commit, Remote, Diff, DiffHunk, DiffLine } from '../types';

/**
 * Parses Git command output into structured data
 */
export class OutputParser {
  /**
   * Parse git status --porcelain output
   */
  parseStatus(output: string): RepoStatus {
    const status: RepoStatus = {
      staged: [],
      unstaged: [],
      untracked: [],
      conflicts: [],
    };

    if (!output) {
      return status;
    }

    const lines = output.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const x = line[0]; // Staged status
      const y = line[1]; // Unstaged status
      const file = line.substring(3);

      // Check for conflicts
      if (x === 'U' || y === 'U' || (x === 'A' && y === 'A') || (x === 'D' && y === 'D')) {
        status.conflicts.push(file);
        continue;
      }

      // Staged changes
      if (x !== ' ' && x !== '?') {
        status.staged.push(file);
      }

      // Unstaged changes
      if (y !== ' ' && y !== '?') {
        status.unstaged.push(file);
      }

      // Untracked files
      if (x === '?' && y === '?') {
        status.untracked.push(file);
      }
    }

    return status;
  }

  /**
   * Parse git branch output
   */
  parseBranches(output: string): Branch[] {
    const branches: Branch[] = [];

    if (!output) {
      return branches;
    }

    const lines = output.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const isCurrent = line.startsWith('*');
      const isRemote = line.includes('remotes/');
      
      // Extract branch name and commit hash
      // Remove the leading '*' marker (only present for current branch)
      const parts = line.replace(/^\*/, '').trim().split(/\s+/);
      const name = parts[0];
      const lastCommit = parts[1] || '';

      branches.push({
        name: isRemote ? name.replace('remotes/', '') : name,
        isRemote,
        isCurrent,
        lastCommit,
      });
    }

    return branches;
  }

  /**
   * Parse git log output
   * Expected format: %H%n%h%n%an%n%ae%n%at%n%s%n%P%n--END--
   */
  parseCommits(output: string): Commit[] {
    const commits: Commit[] = [];

    if (!output) {
      return commits;
    }

    const commitBlocks = output.split('--END--').filter(block => block.trim());

    for (const block of commitBlocks) {
      // Trim the block and split by newlines
      const lines = block.trim().split('\n');
      
      // We expect 7 lines: hash, shortHash, author, authorEmail, timestamp, message, parents
      // If we have 6 lines, the parents line is missing (empty)
      if (lines.length < 6) continue;
      
      // Pad with empty string if parents line is missing
      if (lines.length === 6) {
        lines.push('');
      }

      const [hash, shortHash, author, authorEmail, timestamp, message, parents] = lines;

      commits.push({
        hash,
        shortHash,
        author,
        authorEmail,
        date: new Date(parseInt(timestamp) * 1000),
        message,
        parents: parents && parents.trim() ? parents.split(' ').filter(p => p) : [],
        files: [],
      });
    }

    return commits;
  }

  /**
   * Parse git remote -v output
   */
  parseRemotes(output: string): Remote[] {
    const remotes: Map<string, Remote> = new Map();

    if (!output) {
      return [];
    }

    const lines = output.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const parts = line.split(/\s+/);
      if (parts.length < 2) continue;

      const name = parts[0];
      const url = parts[1];
      const type = parts[2]; // (fetch) or (push)

      if (!remotes.has(name)) {
        remotes.set(name, {
          name,
          url,
        });
      }

      const remote = remotes.get(name)!;
      if (type === '(fetch)') {
        remote.fetchUrl = url;
      } else if (type === '(push)') {
        remote.pushUrl = url;
      }
    }

    return Array.from(remotes.values());
  }

  /**
   * Parse git diff output
   */
  parseDiff(output: string): Diff[] {
    const diffs: Diff[] = [];

    if (!output) {
      return diffs;
    }

    const fileBlocks = output.split(/^diff --git /m).filter(block => block.trim());

    for (const block of fileBlocks) {
      const lines = block.split('\n');
      
      // Extract file path from the first line
      const firstLine = lines[0];
      const match = firstLine.match(/a\/(.*?) b\/(.*?)$/);
      if (!match) continue;

      const file = match[2];
      let additions = 0;
      let deletions = 0;
      const hunks: DiffHunk[] = [];
      let currentHunk: DiffHunk | null = null;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];

        // Parse hunk header
        if (line.startsWith('@@')) {
          const hunkMatch = line.match(/@@ -(\d+),?(\d+)? \+(\d+),?(\d+)? @@(.*)/);
          if (hunkMatch) {
            if (currentHunk) {
              hunks.push(currentHunk);
            }

            currentHunk = {
              oldStart: parseInt(hunkMatch[1]),
              oldLines: parseInt(hunkMatch[2] || '1'),
              newStart: parseInt(hunkMatch[3]),
              newLines: parseInt(hunkMatch[4] || '1'),
              header: hunkMatch[5].trim(),
              lines: [],
            };
          }
        } else if (currentHunk) {
          // Parse diff lines
          let type: 'add' | 'delete' | 'context' = 'context';
          let content = line;
          let lineNumber = 0;

          if (line.startsWith('+')) {
            type = 'add';
            content = line.substring(1);
            additions++;
            lineNumber = currentHunk.newStart + currentHunk.lines.filter(l => l.type !== 'delete').length;
          } else if (line.startsWith('-')) {
            type = 'delete';
            content = line.substring(1);
            deletions++;
            lineNumber = currentHunk.oldStart + currentHunk.lines.filter(l => l.type !== 'add').length;
          } else if (line.startsWith(' ')) {
            content = line.substring(1);
            lineNumber = currentHunk.newStart + currentHunk.lines.filter(l => l.type !== 'delete').length;
          }

          currentHunk.lines.push({
            type,
            content,
            lineNumber,
          });
        }
      }

      if (currentHunk) {
        hunks.push(currentHunk);
      }

      diffs.push({
        file,
        additions,
        deletions,
        hunks,
      });
    }

    return diffs;
  }

  /**
   * Parse current branch name from git branch output
   */
  parseCurrentBranch(output: string): string {
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.startsWith('*')) {
        return line.substring(2).trim();
      }
    }
    return 'unknown';
  }

  /**
   * Parse tag list from git tag output
   */
  parseTags(output: string): string[] {
    if (!output) {
      return [];
    }
    return output.split('\n').filter(tag => tag.trim());
  }
}
