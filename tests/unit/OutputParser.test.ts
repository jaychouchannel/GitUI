import { OutputParser } from '../../src/git/OutputParser';

describe('OutputParser', () => {
  let parser: OutputParser;

  beforeEach(() => {
    parser = new OutputParser();
  });

  describe('parseStatus', () => {
    it('should parse empty status', () => {
      const status = parser.parseStatus('');
      expect(status).toEqual({
        staged: [],
        unstaged: [],
        untracked: [],
        conflicts: [],
      });
    });

    it('should parse staged files', () => {
      const output = 'A  file1.ts\nM  file2.ts';
      const status = parser.parseStatus(output);
      expect(status.staged).toEqual(['file1.ts', 'file2.ts']);
      expect(status.unstaged).toEqual([]);
    });

    it('should parse unstaged files', () => {
      const output = ' M file1.ts\n M file2.ts';
      const status = parser.parseStatus(output);
      expect(status.unstaged).toEqual(['file1.ts', 'file2.ts']);
      expect(status.staged).toEqual([]);
    });

    it('should parse untracked files', () => {
      const output = '?? file1.ts\n?? file2.ts';
      const status = parser.parseStatus(output);
      expect(status.untracked).toEqual(['file1.ts', 'file2.ts']);
      expect(status.staged).toEqual([]);
      expect(status.unstaged).toEqual([]);
    });

    it('should parse conflict files', () => {
      const output = 'UU file1.ts\nAA file2.ts\nDD file3.ts';
      const status = parser.parseStatus(output);
      expect(status.conflicts).toEqual(['file1.ts', 'file2.ts', 'file3.ts']);
    });

    it('should parse mixed status', () => {
      const output = 'M  staged.ts\n M unstaged.ts\n?? untracked.ts\nUU conflict.ts';
      const status = parser.parseStatus(output);
      expect(status.staged).toEqual(['staged.ts']);
      expect(status.unstaged).toEqual(['unstaged.ts']);
      expect(status.untracked).toEqual(['untracked.ts']);
      expect(status.conflicts).toEqual(['conflict.ts']);
    });
  });

  describe('parseBranches', () => {
    it('should parse empty branch list', () => {
      const branches = parser.parseBranches('');
      expect(branches).toEqual([]);
    });

    it('should parse local branches', () => {
      const output = '* main abc123 Latest commit\n  feature def456 Feature commit';
      const branches = parser.parseBranches(output);
      expect(branches).toHaveLength(2);
      expect(branches[0]).toEqual({
        name: 'main',
        isRemote: false,
        isCurrent: true,
        lastCommit: 'abc123',
      });
      expect(branches[1]).toEqual({
        name: 'feature',
        isRemote: false,
        isCurrent: false,
        lastCommit: 'def456',
      });
    });

    it('should parse remote branches', () => {
      const output = '  remotes/origin/main abc123 Latest commit';
      const branches = parser.parseBranches(output);
      expect(branches).toHaveLength(1);
      expect(branches[0]).toEqual({
        name: 'origin/main',
        isRemote: true,
        isCurrent: false,
        lastCommit: 'abc123',
      });
    });
  });

  describe('parseCommits', () => {
    it('should parse empty commit list', () => {
      const commits = parser.parseCommits('');
      expect(commits).toEqual([]);
    });

    it('should parse single commit', () => {
      const output = 'abc123def456789\nabc123d\nJohn Doe\njohn@example.com\n1640000000\nInitial commit\n\n--END--';
      const commits = parser.parseCommits(output);
      expect(commits).toHaveLength(1);
      expect(commits[0]).toMatchObject({
        hash: 'abc123def456789',
        shortHash: 'abc123d',
        author: 'John Doe',
        authorEmail: 'john@example.com',
        message: 'Initial commit',
        parents: [],
      });
    });

    it('should parse multiple commits', () => {
      const output = `abc123\nabc123d\nJohn\njohn@test.com\n1640000000\nFirst\n\n--END--
def456\ndef456d\nJane\njane@test.com\n1640000100\nSecond\nabc123\n--END--`;
      const commits = parser.parseCommits(output);
      expect(commits).toHaveLength(2);
      expect(commits[0].message).toBe('First');
      expect(commits[1].message).toBe('Second');
      expect(commits[1].parents).toEqual(['abc123']);
    });
  });

  describe('parseRemotes', () => {
    it('should parse empty remote list', () => {
      const remotes = parser.parseRemotes('');
      expect(remotes).toEqual([]);
    });

    it('should parse single remote', () => {
      const output = 'origin https://github.com/user/repo.git (fetch)\norigin https://github.com/user/repo.git (push)';
      const remotes = parser.parseRemotes(output);
      expect(remotes).toHaveLength(1);
      expect(remotes[0]).toEqual({
        name: 'origin',
        url: 'https://github.com/user/repo.git',
        fetchUrl: 'https://github.com/user/repo.git',
        pushUrl: 'https://github.com/user/repo.git',
      });
    });

    it('should parse multiple remotes', () => {
      const output = `origin https://github.com/user/repo1.git (fetch)
origin https://github.com/user/repo1.git (push)
upstream https://github.com/org/repo2.git (fetch)
upstream https://github.com/org/repo2.git (push)`;
      const remotes = parser.parseRemotes(output);
      expect(remotes).toHaveLength(2);
      expect(remotes[0].name).toBe('origin');
      expect(remotes[1].name).toBe('upstream');
    });
  });

  describe('parseCurrentBranch', () => {
    it('should parse current branch', () => {
      const output = '  feature\n* main\n  develop';
      const branch = parser.parseCurrentBranch(output);
      expect(branch).toBe('main');
    });

    it('should return unknown if no current branch', () => {
      const output = '  feature\n  develop';
      const branch = parser.parseCurrentBranch(output);
      expect(branch).toBe('unknown');
    });
  });

  describe('parseTags', () => {
    it('should parse empty tag list', () => {
      const tags = parser.parseTags('');
      expect(tags).toEqual([]);
    });

    it('should parse tag list', () => {
      const output = 'v1.0.0\nv1.1.0\nv2.0.0';
      const tags = parser.parseTags(output);
      expect(tags).toEqual(['v1.0.0', 'v1.1.0', 'v2.0.0']);
    });
  });

  describe('parseDiff', () => {
    it('should parse empty diff', () => {
      const diffs = parser.parseDiff('');
      expect(diffs).toEqual([]);
    });

    it('should parse basic diff', () => {
      const output = `diff --git a/file.ts b/file.ts
index abc123..def456 100644
--- a/file.ts
+++ b/file.ts
@@ -1,3 +1,4 @@
 line 1
-line 2
+line 2 modified
+line 3 added
 line 4`;
      const diffs = parser.parseDiff(output);
      expect(diffs).toHaveLength(1);
      expect(diffs[0].file).toBe('file.ts');
      expect(diffs[0].additions).toBeGreaterThan(0);
      expect(diffs[0].deletions).toBeGreaterThan(0);
    });
  });
});
