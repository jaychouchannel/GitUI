import { Repository, RepoStatus } from '../../types';
import { CommandBuilder } from '../../git/CommandBuilder';
import { CommandExecutor } from '../../git/CommandExecutor';
import { OutputParser } from '../../git/OutputParser';
import { ErrorHandler } from '../../git/ErrorHandler';

/**
 * Manages Git repository operations
 */
export class RepoManager {
  private commandBuilder: CommandBuilder;
  private commandExecutor: CommandExecutor;
  private outputParser: OutputParser;
  private errorHandler: ErrorHandler;
  private currentRepository: Repository | null = null;

  constructor() {
    this.commandBuilder = new CommandBuilder();
    this.commandExecutor = new CommandExecutor();
    this.outputParser = new OutputParser();
    this.errorHandler = new ErrorHandler();
  }

  /**
   * Open a repository at the specified path
   */
  async openRepository(path: string): Promise<Repository> {
    try {
      // Verify it's a git repository
      const statusCommand = this.commandBuilder.buildStatus();
      const statusResult = await this.commandExecutor.execute(statusCommand, { cwd: path });

      if (!statusResult.success) {
        throw new Error(statusResult.stderr);
      }

      // Get current branch
      const branchCommand = this.commandBuilder.build('branch', [], { 'show-current': true });
      const branchResult = await this.commandExecutor.execute(branchCommand, { cwd: path });
      const currentBranch = branchResult.stdout || 'unknown';

      // Parse status
      const status = this.outputParser.parseStatus(statusResult.stdout);

      // Extract repository name from path
      const name = path.split('/').pop() || 'unknown';

      this.currentRepository = {
        path,
        name,
        currentBranch,
        status,
      };

      return this.currentRepository;
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }

  /**
   * Close the current repository
   */
  closeRepository(): void {
    this.currentRepository = null;
  }

  /**
   * Get the current repository
   */
  getCurrentRepository(): Repository | null {
    return this.currentRepository;
  }

  /**
   * Get repository status
   */
  async getStatus(): Promise<RepoStatus> {
    if (!this.currentRepository) {
      throw new Error('No repository is currently open');
    }

    try {
      const command = this.commandBuilder.buildStatus();
      const result = await this.commandExecutor.execute(command, {
        cwd: this.currentRepository.path,
      });

      if (!result.success) {
        throw new Error(result.stderr);
      }

      const status = this.outputParser.parseStatus(result.stdout);
      this.currentRepository.status = status;
      return status;
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }

  /**
   * Refresh repository data
   */
  async refreshRepository(): Promise<void> {
    if (!this.currentRepository) {
      throw new Error('No repository is currently open');
    }

    await this.getStatus();
  }

  /**
   * Initialize a new Git repository
   */
  async initRepository(path: string, bare: boolean = false): Promise<Repository> {
    try {
      const command = this.commandBuilder.buildInit(path, bare);
      const result = await this.commandExecutor.execute(command);

      if (!result.success) {
        throw new Error(result.stderr);
      }

      return this.openRepository(path);
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }

  /**
   * Clone a repository
   */
  async cloneRepository(
    url: string,
    directory: string,
    options: { depth?: number; branch?: string } = {}
  ): Promise<Repository> {
    try {
      const command = this.commandBuilder.buildClone(url, directory, options);
      const result = await this.commandExecutor.execute(command);

      if (!result.success) {
        throw new Error(result.stderr);
      }

      return this.openRepository(directory);
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }

  /**
   * Stage files
   */
  async stageFiles(files: string[]): Promise<void> {
    if (!this.currentRepository) {
      throw new Error('No repository is currently open');
    }

    try {
      const command = this.commandBuilder.buildAdd(files);
      const result = await this.commandExecutor.execute(command, {
        cwd: this.currentRepository.path,
      });

      if (!result.success) {
        throw new Error(result.stderr);
      }

      await this.refreshRepository();
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }

  /**
   * Unstage files
   */
  async unstageFiles(files: string[]): Promise<void> {
    if (!this.currentRepository) {
      throw new Error('No repository is currently open');
    }

    try {
      const command = this.commandBuilder.buildReset(files);
      const result = await this.commandExecutor.execute(command, {
        cwd: this.currentRepository.path,
      });

      if (!result.success) {
        throw new Error(result.stderr);
      }

      await this.refreshRepository();
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }

  /**
   * Discard changes to files
   */
  async discardChanges(files: string[]): Promise<void> {
    if (!this.currentRepository) {
      throw new Error('No repository is currently open');
    }

    try {
      const command = this.commandBuilder.build('checkout', ['--', ...files]);
      const result = await this.commandExecutor.execute(command, {
        cwd: this.currentRepository.path,
      });

      if (!result.success) {
        throw new Error(result.stderr);
      }

      await this.refreshRepository();
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }
}
