import { Remote } from '../../types';
import { CommandBuilder } from '../../git/CommandBuilder';
import { CommandExecutor } from '../../git/CommandExecutor';
import { OutputParser } from '../../git/OutputParser';
import { ErrorHandler } from '../../git/ErrorHandler';

/**
 * Manages Git remote repository operations
 */
export class RemoteManager {
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
   * List all remotes
   */
  async listRemotes(): Promise<Remote[]> {
    try {
      const command = this.commandBuilder.buildListRemotes();
      const result = await this.commandExecutor.execute(command, { cwd: this.repoPath });

      if (!result.success) {
        throw new Error(result.stderr);
      }

      return this.outputParser.parseRemotes(result.stdout);
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }

  /**
   * Add a new remote
   */
  async addRemote(name: string, url: string): Promise<void> {
    try {
      const command = this.commandBuilder.buildAddRemote(name, url);
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
   * Remove a remote
   */
  async removeRemote(name: string): Promise<void> {
    try {
      const command = this.commandBuilder.buildRemoveRemote(name);
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
   * Fetch from a remote
   */
  async fetch(remote: string, prune: boolean = false): Promise<void> {
    try {
      const command = this.commandBuilder.buildFetch(remote, prune);
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
   * Pull from a remote branch
   */
  async pull(remote: string, branch: string, rebase: boolean = false): Promise<void> {
    try {
      const command = this.commandBuilder.buildPull(remote, branch, rebase);
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
   * Push to a remote branch
   */
  async push(remote: string, branch: string, force: boolean = false): Promise<void> {
    try {
      const command = this.commandBuilder.buildPush(remote, branch, force);
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
   * Update remote URL
   */
  async updateRemoteUrl(name: string, newUrl: string): Promise<void> {
    try {
      const command = this.commandBuilder.build('remote', ['set-url', name, newUrl]);
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
   * Rename a remote
   */
  async renameRemote(oldName: string, newName: string): Promise<void> {
    try {
      const command = this.commandBuilder.build('remote', ['rename', oldName, newName]);
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
