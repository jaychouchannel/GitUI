import { Diff } from '../../types';
import { CommandBuilder } from '../../git/CommandBuilder';
import { CommandExecutor } from '../../git/CommandExecutor';
import { OutputParser } from '../../git/OutputParser';
import { ErrorHandler } from '../../git/ErrorHandler';

/**
 * Manages Git diff operations
 */
export class DiffManager {
  private commandBuilder: CommandBuilder;
  private commandExecutor: CommandExecutor;
  private outputParser: OutputParser;
  private errorHandler: ErrorHandler;

  constructor(private repoPath: string) {
    this.commandBuilder = new CommandBuilder();
    this.commandExecutor = new CommandExecutor();
    this.outputParser = new OutputParser();
    this.errorHandler = new ErrorHandler();
  }

  /**
   * Get diff for specific files
   */
  async getDiff(files: string[] = []): Promise<Diff[]> {
    try {
      const command = this.commandBuilder.buildDiff(files, false);
      const result = await this.commandExecutor.execute(command, { cwd: this.repoPath });

      if (!result.success) {
        throw new Error(result.stderr);
      }

      return this.outputParser.parseDiff(result.stdout);
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }

  /**
   * Get diff for staged files
   */
  async getStagedDiff(): Promise<Diff[]> {
    try {
      const command = this.commandBuilder.buildDiff([], true);
      const result = await this.commandExecutor.execute(command, { cwd: this.repoPath });

      if (!result.success) {
        throw new Error(result.stderr);
      }

      return this.outputParser.parseDiff(result.stdout);
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }

  /**
   * Get diff for a specific commit
   */
  async getCommitDiff(commitHash: string): Promise<Diff[]> {
    try {
      const command = this.commandBuilder.build('show', [commitHash]);
      const result = await this.commandExecutor.execute(command, { cwd: this.repoPath });

      if (!result.success) {
        throw new Error(result.stderr);
      }

      return this.outputParser.parseDiff(result.stdout);
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }

  /**
   * Get diff between two commits
   */
  async getCommitRangeDiff(fromCommit: string, toCommit: string): Promise<Diff[]> {
    try {
      const command = this.commandBuilder.build('diff', [`${fromCommit}..${toCommit}`]);
      const result = await this.commandExecutor.execute(command, { cwd: this.repoPath });

      if (!result.success) {
        throw new Error(result.stderr);
      }

      return this.outputParser.parseDiff(result.stdout);
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }

  /**
   * Get diff statistics
   */
  async getDiffStats(files: string[] = []): Promise<string> {
    try {
      const command = this.commandBuilder.build('diff', files, { stat: true });
      const result = await this.commandExecutor.execute(command, { cwd: this.repoPath });

      if (!result.success) {
        throw new Error(result.stderr);
      }

      return result.stdout;
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }
}
