import { CommandBuilder } from '../../src/git/CommandBuilder';

describe('CommandBuilder', () => {
  let builder: CommandBuilder;

  beforeEach(() => {
    builder = new CommandBuilder();
  });

  describe('build', () => {
    it('should build a basic git command', () => {
      const command = builder.build('status');
      expect(command).toEqual(['git', 'status']);
    });

    it('should build a command with arguments', () => {
      const command = builder.build('add', ['file1.ts', 'file2.ts']);
      expect(command).toEqual(['git', 'add', 'file1.ts', 'file2.ts']);
    });

    it('should build a command with boolean options', () => {
      const command = builder.build('status', [], { porcelain: true });
      expect(command).toEqual(['git', 'status', '--porcelain']);
    });

    it('should build a command with value options', () => {
      const command = builder.build('commit', [], { message: 'Test commit' });
      expect(command).toEqual(['git', 'commit', '--message=Test commit']);
    });

    it('should ignore false options', () => {
      const command = builder.build('status', [], { porcelain: false });
      expect(command).toEqual(['git', 'status']);
    });
  });

  describe('buildStatus', () => {
    it('should build status command with porcelain format', () => {
      const command = builder.buildStatus();
      expect(command).toContain('--porcelain');
      expect(command).toContain('--untracked-files=all');
    });
  });

  describe('buildListBranches', () => {
    it('should build branch list command without remote', () => {
      const command = builder.buildListBranches(false);
      expect(command).toEqual(['git', 'branch', '--verbose']);
    });

    it('should build branch list command with remote', () => {
      const command = builder.buildListBranches(true);
      expect(command).toContain('--all');
    });
  });

  describe('buildCommit', () => {
    it('should build commit command with message', () => {
      const command = builder.buildCommit('Test message');
      expect(command).toContain('--message=Test message');
    });

    it('should build commit command with amend option', () => {
      const command = builder.buildCommit('Test', { amend: true });
      expect(command).toContain('--amend');
    });

    it('should build commit command with all option', () => {
      const command = builder.buildCommit('Test', { all: true });
      expect(command).toContain('--all');
    });
  });

  describe('buildLog', () => {
    it('should build log command with limit', () => {
      const command = builder.buildLog(10);
      expect(command).toContain('-10');
    });

    it('should build log command with format', () => {
      const command = builder.buildLog(undefined, '%H%n%s');
      expect(command).toContain('--format=%H%n%s');
    });
  });

  describe('buildAdd', () => {
    it('should build add command', () => {
      const command = builder.buildAdd(['file1.ts', 'file2.ts']);
      expect(command).toEqual(['git', 'add', 'file1.ts', 'file2.ts']);
    });
  });

  describe('buildReset', () => {
    it('should build reset command', () => {
      const command = builder.buildReset(['file1.ts']);
      expect(command).toEqual(['git', 'reset', 'HEAD', 'file1.ts']);
    });
  });

  describe('buildDiff', () => {
    it('should build diff command for unstaged changes', () => {
      const command = builder.buildDiff(['file.ts'], false);
      expect(command).toEqual(['git', 'diff', 'file.ts']);
    });

    it('should build diff command for staged changes', () => {
      const command = builder.buildDiff([], true);
      expect(command).toContain('--cached');
    });
  });

  describe('buildCheckout', () => {
    it('should build checkout command', () => {
      const command = builder.buildCheckout('main');
      expect(command).toEqual(['git', 'checkout', 'main']);
    });

    it('should build checkout command with create option', () => {
      const command = builder.buildCheckout('feature', true);
      expect(command).toContain('--b');
    });
  });

  describe('buildMerge', () => {
    it('should build merge command', () => {
      const command = builder.buildMerge('feature');
      expect(command).toEqual(['git', 'merge', 'feature']);
    });

    it('should build merge command with no-ff option', () => {
      const command = builder.buildMerge('feature', { noFf: true });
      expect(command).toContain('--no-ff');
    });

    it('should build merge command with squash option', () => {
      const command = builder.buildMerge('feature', { squash: true });
      expect(command).toContain('--squash');
    });
  });

  describe('buildPull', () => {
    it('should build pull command', () => {
      const command = builder.buildPull('origin', 'main');
      expect(command).toEqual(['git', 'pull', 'origin', 'main']);
    });

    it('should build pull command with rebase', () => {
      const command = builder.buildPull('origin', 'main', true);
      expect(command).toContain('--rebase');
    });
  });

  describe('buildPush', () => {
    it('should build push command', () => {
      const command = builder.buildPush('origin', 'main');
      expect(command).toEqual(['git', 'push', 'origin', 'main']);
    });

    it('should build push command with force', () => {
      const command = builder.buildPush('origin', 'main', true);
      expect(command).toContain('--force');
    });
  });

  describe('buildFetch', () => {
    it('should build fetch command', () => {
      const command = builder.buildFetch('origin');
      expect(command).toEqual(['git', 'fetch', 'origin']);
    });

    it('should build fetch command with prune', () => {
      const command = builder.buildFetch('origin', true);
      expect(command).toContain('--prune');
    });
  });

  describe('buildClone', () => {
    it('should build clone command', () => {
      const command = builder.buildClone('https://github.com/user/repo.git', '/path');
      expect(command).toEqual(['git', 'clone', 'https://github.com/user/repo.git', '/path']);
    });

    it('should build clone command with depth', () => {
      const command = builder.buildClone('https://github.com/user/repo.git', '/path', { depth: 1 });
      expect(command).toContain('--depth=1');
    });

    it('should build clone command with branch', () => {
      const command = builder.buildClone('https://github.com/user/repo.git', '/path', { branch: 'main' });
      expect(command).toContain('--branch=main');
    });
  });

  describe('buildInit', () => {
    it('should build init command', () => {
      const command = builder.buildInit('/path');
      expect(command).toEqual(['git', 'init', '/path']);
    });

    it('should build init command with bare option', () => {
      const command = builder.buildInit('/path', true);
      expect(command).toContain('--bare');
    });
  });
});
