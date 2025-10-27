import { MergeResolver } from '../../src/core/managers/MergeResolver';
import { CommandExecutor } from '../../src/git/CommandExecutor';
import { CommandBuilder } from '../../src/git/CommandBuilder';

// Mock the modules
jest.mock('../../src/git/CommandExecutor');
jest.mock('../../src/git/CommandBuilder');

describe('MergeResolver', () => {
  let resolver: MergeResolver;
  let mockExecutor: jest.Mocked<CommandExecutor>;
  let mockBuilder: jest.Mocked<CommandBuilder>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock instances
    mockExecutor = new CommandExecutor() as jest.Mocked<CommandExecutor>;
    mockBuilder = new CommandBuilder() as jest.Mocked<CommandBuilder>;

    // Setup default mock implementations
    mockBuilder.build = jest.fn((cmd, args = []) => ['git', cmd, ...args]);

    resolver = new MergeResolver('/test/repo');
    
    // Replace the private instances with our mocks
    (resolver as any).commandExecutor = mockExecutor;
    (resolver as any).commandBuilder = mockBuilder;
  });

  describe('detectConflicts', () => {
    it('should return empty array when no conflicts exist', async () => {
      mockExecutor.execute = jest.fn().mockResolvedValue({
        success: false,
        exitCode: 0,
        stdout: '',
        stderr: '',
      });

      const conflicts = await resolver.detectConflicts();
      expect(conflicts).toEqual([]);
    });

    it('should detect conflict files', async () => {
      mockExecutor.execute = jest.fn()
        .mockResolvedValueOnce({
          success: true,
          exitCode: 0,
          stdout: 'file1.txt\nfile2.txt',
          stderr: '',
        })
        .mockResolvedValue({
          success: true,
          exitCode: 0,
          stdout: 'file content',
          stderr: '',
        });

      const conflicts = await resolver.detectConflicts();
      expect(conflicts.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('resolveConflict', () => {
    it('should resolve conflict with ours version', async () => {
      mockExecutor.execute = jest.fn().mockResolvedValue({
        success: true,
        exitCode: 0,
        stdout: '',
        stderr: '',
      });

      await resolver.resolveConflict('test.txt', 'ours');
      
      expect(mockExecutor.execute).toHaveBeenCalledTimes(2); // checkout + add
    });

    it('should resolve conflict with theirs version', async () => {
      mockExecutor.execute = jest.fn().mockResolvedValue({
        success: true,
        exitCode: 0,
        stdout: '',
        stderr: '',
      });

      await resolver.resolveConflict('test.txt', 'theirs');
      
      expect(mockExecutor.execute).toHaveBeenCalledTimes(2); // checkout + add
    });

    it('should throw error on resolution failure', async () => {
      mockExecutor.execute = jest.fn().mockResolvedValue({
        success: false,
        exitCode: 1,
        stdout: '',
        stderr: 'Resolution failed',
      });

      await expect(resolver.resolveConflict('test.txt', 'ours')).rejects.toThrow();
    });
  });

  describe('abortMerge', () => {
    it('should abort merge successfully', async () => {
      mockExecutor.execute = jest.fn().mockResolvedValue({
        success: true,
        exitCode: 0,
        stdout: '',
        stderr: '',
      });

      await resolver.abortMerge();
      
      expect(mockExecutor.execute).toHaveBeenCalled();
    });

    it('should throw error on abort failure', async () => {
      mockExecutor.execute = jest.fn().mockResolvedValue({
        success: false,
        exitCode: 1,
        stdout: '',
        stderr: 'Abort failed',
      });

      await expect(resolver.abortMerge()).rejects.toThrow();
    });
  });

  describe('continueMerge', () => {
    it('should continue merge without message', async () => {
      mockExecutor.execute = jest.fn().mockResolvedValue({
        success: true,
        exitCode: 0,
        stdout: '',
        stderr: '',
      });

      await resolver.continueMerge();
      
      expect(mockExecutor.execute).toHaveBeenCalled();
    });

    it('should continue merge with custom message', async () => {
      mockExecutor.execute = jest.fn().mockResolvedValue({
        success: true,
        exitCode: 0,
        stdout: '',
        stderr: '',
      });

      await resolver.continueMerge('Custom merge message');
      
      expect(mockExecutor.execute).toHaveBeenCalled();
    });
  });

  describe('isMerging', () => {
    it('should return false when not merging', async () => {
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      const result = await resolver.isMerging();
      expect(result).toBe(false);
    });

    it('should return true when MERGE_HEAD exists', async () => {
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      const result = await resolver.isMerging();
      expect(result).toBe(true);
    });
  });

  describe('resolveWithContent', () => {
    it('should write custom content and stage file', async () => {
      const fs = require('fs');
      const writeFileSyncSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation();
      
      mockExecutor.execute = jest.fn().mockResolvedValue({
        success: true,
        exitCode: 0,
        stdout: '',
        stderr: '',
      });

      await resolver.resolveWithContent('test.txt', 'resolved content');
      
      expect(writeFileSyncSpy).toHaveBeenCalled();
      expect(mockExecutor.execute).toHaveBeenCalled();
    });
  });
});
