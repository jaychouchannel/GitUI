import { Conflict } from '../../types';
import { CommandBuilder } from '../../git/CommandBuilder';
import { CommandExecutor } from '../../git/CommandExecutor';
import { ErrorHandler } from '../../git/ErrorHandler';

/**
 * Manages Git merge conflict resolution
 */
export class MergeResolver {
  private commandBuilder: CommandBuilder;
  private commandExecutor: CommandExecutor;
  private errorHandler: ErrorHandler;

  constructor(private repoPath: string) {
    this.commandBuilder = new CommandBuilder();
    this.commandExecutor = new CommandExecutor();
    this.errorHandler = new ErrorHandler();
  }

  /**
   * Detect merge conflicts in the repository
   */
  async detectConflicts(): Promise<Conflict[]> {
    try {
      // Get list of files with conflicts
      const command = this.commandBuilder.build('diff', ['--name-only', '--diff-filter=U']);
      const result = await this.commandExecutor.execute(command, { cwd: this.repoPath });

      if (!result.success && result.exitCode !== 0) {
        // No conflicts is not an error
        return [];
      }

      const conflictFiles = result.stdout
        .trim()
        .split('\n')
        .filter((file) => file.length > 0);

      // Get conflict details for each file
      const conflicts: Conflict[] = [];
      for (const file of conflictFiles) {
        const conflict = await this.getConflictDetails(file);
        if (conflict) {
          conflicts.push(conflict);
        }
      }

      return conflicts;
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }

  /**
   * Get conflict details for a specific file
   */
  private async getConflictDetails(file: string): Promise<Conflict | null> {
    try {
      // Read the file content to determine conflict type
      const command = this.commandBuilder.build('cat-file', ['-p', `:0:${file}`]);
      const result = await this.commandExecutor.execute(command, { cwd: this.repoPath });

      // Check if file exists in merge base
      const baseResult = await this.commandExecutor.execute(
        this.commandBuilder.build('cat-file', ['-p', `:1:${file}`]),
        { cwd: this.repoPath }
      );

      // Get ours version (stage 2)
      const oursResult = await this.commandExecutor.execute(
        this.commandBuilder.build('cat-file', ['-p', `:2:${file}`]),
        { cwd: this.repoPath }
      );

      // Get theirs version (stage 3)
      const theirsResult = await this.commandExecutor.execute(
        this.commandBuilder.build('cat-file', ['-p', `:3:${file}`]),
        { cwd: this.repoPath }
      );

      const conflict: Conflict = {
        file,
        type: 'content',
        base: baseResult.success ? baseResult.stdout : undefined,
        ours: oursResult.success ? oursResult.stdout : undefined,
        theirs: theirsResult.success ? theirsResult.stdout : undefined,
      };

      // Determine conflict type
      if (!oursResult.success && theirsResult.success) {
        conflict.type = 'delete';
      } else if (oursResult.success && !theirsResult.success) {
        conflict.type = 'delete';
      }

      return conflict;
    } catch (error) {
      // If we can't get conflict details, still return basic info
      return {
        file,
        type: 'content',
      };
    }
  }

  /**
   * Resolve conflict by choosing a version
   */
  async resolveConflict(file: string, resolution: 'ours' | 'theirs' | 'base'): Promise<void> {
    try {
      let command: string[];

      if (resolution === 'ours') {
        command = this.commandBuilder.build('checkout', ['--ours', file]);
      } else if (resolution === 'theirs') {
        command = this.commandBuilder.build('checkout', ['--theirs', file]);
      } else {
        // For base, we need to checkout from merge-base
        command = this.commandBuilder.build('checkout', ['--merge', file]);
      }

      const result = await this.commandExecutor.execute(command, { cwd: this.repoPath });

      if (!result.success) {
        throw new Error(result.stderr);
      }

      // Stage the resolved file
      const stageCommand = this.commandBuilder.build('add', [file]);
      const stageResult = await this.commandExecutor.execute(stageCommand, { cwd: this.repoPath });

      if (!stageResult.success) {
        throw new Error(stageResult.stderr);
      }
    } catch (error) {
      const userError = this.errorHandler.handleError(error as Error);
      throw new Error(userError.message);
    }
  }

  /**
   * Resolve conflict with custom content
   */
  async resolveWithContent(file: string, content: string): Promise<void> {
    try {
      const fs = require('fs');
      const path = require('path');
      const fullPath = path.join(this.repoPath, file);

      // Write the resolved content
      fs.writeFileSync(fullPath, content, 'utf8');

      // Stage the resolved file
      const command = this.commandBuilder.build('add', [file]);
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
   * Abort the current merge
   */
  async abortMerge(): Promise<void> {
    try {
      const command = this.commandBuilder.build('merge', ['--abort']);
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
   * Continue merge after resolving conflicts
   */
  async continueMerge(message?: string): Promise<void> {
    try {
      const args = ['--continue'];
      if (message) {
        args.push('--message', message);
      }

      const command = this.commandBuilder.build('merge', args);
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
   * Check if there's an ongoing merge
   */
  async isMerging(): Promise<boolean> {
    try {
      const fs = require('fs');
      const path = require('path');
      const mergeHeadPath = path.join(this.repoPath, '.git', 'MERGE_HEAD');

      return fs.existsSync(mergeHeadPath);
    } catch (error) {
      return false;
    }
  }
}
