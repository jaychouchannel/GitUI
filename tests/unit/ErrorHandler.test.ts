import { ErrorHandler } from '../../src/git/ErrorHandler';

describe('ErrorHandler', () => {
  let handler: ErrorHandler;

  beforeEach(() => {
    handler = new ErrorHandler();
  });

  describe('handleError', () => {
    it('should handle "not a git repository" error', () => {
      const error = new Error('fatal: not a git repository');
      const result = handler.handleError(error);
      expect(result.title).toBe('Not a Git Repository');
      expect(result.solutions.length).toBeGreaterThan(0);
    });

    it('should handle merge conflict error', () => {
      const error = new Error('CONFLICT (content): Merge conflict in file.ts');
      const result = handler.handleError(error);
      expect(result.title).toBe('Merge Conflict');
      expect(result.solutions).toContain('Resolve conflicts in the affected files');
    });

    it('should handle nothing to commit error', () => {
      const error = new Error('nothing to commit, working tree clean');
      const result = handler.handleError(error);
      expect(result.title).toBe('Nothing to Commit');
    });

    it('should handle uncommitted changes error', () => {
      const error = new Error('Please commit your changes or stash them before you merge');
      const result = handler.handleError(error);
      expect(result.title).toBe('Uncommitted Changes');
      expect(result.solutions).toContain('Commit your changes first');
    });

    it('should handle push failed error', () => {
      const error = new Error('failed to push some refs');
      const result = handler.handleError(error);
      expect(result.title).toBe('Push Failed');
      expect(result.solutions).toContain('Pull the latest changes first');
    });

    it('should handle authentication error', () => {
      const error = new Error('Authentication failed');
      const result = handler.handleError(error);
      expect(result.title).toBe('Authentication Failed');
      expect(result.solutions).toContain('Check your credentials');
    });

    it('should handle remote already exists error', () => {
      const error = new Error('fatal: remote origin already exists');
      const result = handler.handleError(error);
      expect(result.title).toBe('Remote Already Exists');
    });

    it('should handle file not found error', () => {
      const error = new Error("pathspec 'file.ts' did not match any files");
      const result = handler.handleError(error);
      expect(result.title).toBe('File Not Found');
    });

    it('should handle branch already exists error', () => {
      const error = new Error('fatal: A branch named feature already exists');
      const result = handler.handleError(error);
      expect(result.title).toBe('Branch Already Exists');
    });

    it('should handle generic error', () => {
      const error = new Error('Some unknown error');
      const result = handler.handleError(error);
      expect(result.title).toBe('Git Error');
      expect(result.message).toBe('Some unknown error');
    });

    it('should use stderr if provided', () => {
      const error = new Error('Original error');
      const stderr = 'fatal: not a git repository';
      const result = handler.handleError(error, stderr);
      expect(result.title).toBe('Not a Git Repository');
    });
  });

  describe('suggestSolution', () => {
    it('should return solutions for an error', () => {
      const error = new Error('fatal: not a git repository');
      const solutions = handler.suggestSolution(error);
      expect(solutions).toBeInstanceOf(Array);
      expect(solutions.length).toBeGreaterThan(0);
    });
  });

  describe('isRecoverable', () => {
    it('should return false for "not a git repository" error', () => {
      const error = new Error('fatal: not a git repository');
      expect(handler.isRecoverable(error)).toBe(false);
    });

    it('should return false for authentication error', () => {
      const error = new Error('Authentication failed');
      expect(handler.isRecoverable(error)).toBe(false);
    });

    it('should return false for permission denied error', () => {
      const error = new Error('Permission denied');
      expect(handler.isRecoverable(error)).toBe(false);
    });

    it('should return true for merge conflict error', () => {
      const error = new Error('CONFLICT: Merge conflict');
      expect(handler.isRecoverable(error)).toBe(true);
    });

    it('should return true for generic error', () => {
      const error = new Error('Some recoverable error');
      expect(handler.isRecoverable(error)).toBe(true);
    });
  });
});
