import { Commit } from '../types';
import { CommandBuilder } from '../git/CommandBuilder';
import { CommandExecutor } from '../git/CommandExecutor';
import { OutputParser } from '../git/OutputParser';
import { ErrorHandler } from '../git/ErrorHandler';

/**
 * Manages Git commit operations
 */
export class CommitManager {
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
   * Get commit history
   */
  async getCommitHistory(limit: number = 50): Promise<Commit[]> {
    try {
      // Format: hash, short hash, author name, author email, timestamp, subject, parents
      const format = '%H%n%h%n%an%n%ae%n%at%n%s%n%P%n--END--';
      const command = this.commandBuilder.buildLog(limit, format);
      const result = await this.commandExecutor.execute(command, { cwd: this.repoPath });

      if (!result.success) {
        throw new Error(result.stderr);
      }

      return this.outputParser.parseCommits(result.stdout);
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }

  /**
   * Create a new commit
   */
  async createCommit(message: string, options: { amend?: boolean; all?: boolean } = {}): Promise<void> {
    try {
      const command = this.commandBuilder.buildCommit(message, options);
      const result = await this.commandExecutor.execute(command, { cwd: this.repoPath });

      if (!result.success) {
        throw new Error(result.stderr);
      }
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }

  /**
   * Amend the last commit
   */
  async amendCommit(message: string): Promise<void> {
    return this.createCommit(message, { amend: true });
  }

  /**
   * Revert a commit
   */
  async revertCommit(commitHash: string): Promise<void> {
    try {
      const command = this.commandBuilder.build('revert', [commitHash]);
      const result = await this.commandExecutor.execute(command, { cwd: this.repoPath });

      if (!result.success) {
        throw new Error(result.stderr);
      }
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }

  /**
   * Cherry-pick a commit
   */
  async cherryPickCommit(commitHash: string): Promise<void> {
    try {
      const command = this.commandBuilder.build('cherry-pick', [commitHash]);
      const result = await this.commandExecutor.execute(command, { cwd: this.repoPath });

      if (!result.success) {
        throw new Error(result.stderr);
      }
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }

  /**
   * Get details of a specific commit
   */
  async getCommitDetails(commitHash: string): Promise<Commit | null> {
    try {
      const format = '%H%n%h%n%an%n%ae%n%at%n%s%n%P%n--END--';
      const command = this.commandBuilder.build('show', [commitHash], { format });
      const result = await this.commandExecutor.execute(command, { cwd: this.repoPath });

      if (!result.success) {
        throw new Error(result.stderr);
      }

      const commits = this.outputParser.parseCommits(result.stdout);
      return commits[0] || null;
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }

  /**
   * Reset to a specific commit
   */
  async resetToCommit(commitHash: string, mode: 'soft' | 'mixed' | 'hard' = 'mixed'): Promise<void> {
    try {
      const command = this.commandBuilder.build('reset', [commitHash], { [mode]: true });
      const result = await this.commandExecutor.execute(command, { cwd: this.repoPath });

      if (!result.success) {
        throw new Error(result.stderr);
      }
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }
}
