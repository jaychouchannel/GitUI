import { Branch } from '../types';
import { CommandBuilder } from '../git/CommandBuilder';
import { CommandExecutor } from '../git/CommandExecutor';
import { OutputParser } from '../git/OutputParser';
import { ErrorHandler } from '../git/ErrorHandler';

/**
 * Manages Git branch operations
 */
export class BranchManager {
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
   * List all branches
   */
  async listBranches(includeRemote: boolean = false): Promise<Branch[]> {
    try {
      const command = this.commandBuilder.buildListBranches(includeRemote);
      const result = await this.commandExecutor.execute(command, { cwd: this.repoPath });

      if (!result.success) {
        throw new Error(result.stderr);
      }

      return this.outputParser.parseBranches(result.stdout);
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }

  /**
   * Create a new branch
   */
  async createBranch(name: string, checkout: boolean = false): Promise<void> {
    try {
      const command = checkout
        ? this.commandBuilder.buildCheckout(name, true)
        : this.commandBuilder.build('branch', [name]);

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
   * Delete a branch
   */
  async deleteBranch(name: string, force: boolean = false): Promise<void> {
    try {
      const option = force ? 'D' : 'd';
      const command = this.commandBuilder.build('branch', [`-${option}`, name]);
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
   * Switch to a branch
   */
  async switchBranch(name: string): Promise<void> {
    try {
      const command = this.commandBuilder.buildCheckout(name);
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
   * Merge a branch into the current branch
   */
  async mergeBranch(name: string, options: { noFf?: boolean; squash?: boolean } = {}): Promise<void> {
    try {
      const command = this.commandBuilder.buildMerge(name, options);
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
   * Rename a branch
   */
  async renameBranch(oldName: string, newName: string): Promise<void> {
    try {
      const command = this.commandBuilder.build('branch', ['-m', oldName, newName]);
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
   * Get current branch name
   */
  async getCurrentBranch(): Promise<string> {
    try {
      const command = this.commandBuilder.build('branch', [], { 'show-current': true });
      const result = await this.commandExecutor.execute(command, { cwd: this.repoPath });

      if (!result.success) {
        throw new Error(result.stderr);
      }

      return result.stdout.trim();
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }
}
