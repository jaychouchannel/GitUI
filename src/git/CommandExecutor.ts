import { spawn } from 'child_process';
import { CommandResult, CommandOptions } from '../types';

/**
 * Executes Git commands and returns results
 */
export class CommandExecutor {
  /**
   * Execute a Git command synchronously
   */
  async execute(command: string[], options: CommandOptions = {}): Promise<CommandResult> {
    return new Promise((resolve) => {
      const [cmd, ...args] = command;
      
      const childProcess = spawn(cmd, args, {
        cwd: options.cwd || process.cwd(),
        env: { ...process.env, ...options.env },
        timeout: options.timeout,
      });

      let stdout = '';
      let stderr = '';

      childProcess.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      childProcess.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      childProcess.on('close', (code: number | null) => {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code || 0,
          success: code === 0,
        });
      });

      childProcess.on('error', (error: Error) => {
        resolve({
          stdout: stdout.trim(),
          stderr: error.message,
          exitCode: 1,
          success: false,
        });
      });
    });
  }

  /**
   * Execute a Git command asynchronously with callback for real-time output
   */
  executeAsync(
    command: string[],
    callback: (output: string, isError: boolean) => void,
    options: CommandOptions = {}
  ): Promise<CommandResult> {
    return new Promise((resolve) => {
      const [cmd, ...args] = command;
      
      const childProcess = spawn(cmd, args, {
        cwd: options.cwd || process.cwd(),
        env: { ...process.env, ...options.env },
        timeout: options.timeout,
      });

      let stdout = '';
      let stderr = '';

      childProcess.stdout?.on('data', (data: Buffer) => {
        const output = data.toString();
        stdout += output;
        callback(output, false);
      });

      childProcess.stderr?.on('data', (data: Buffer) => {
        const output = data.toString();
        stderr += output;
        callback(output, true);
      });

      childProcess.on('close', (code: number | null) => {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code || 0,
          success: code === 0,
        });
      });

      childProcess.on('error', (error: Error) => {
        callback(error.message, true);
        resolve({
          stdout: stdout.trim(),
          stderr: error.message,
          exitCode: 1,
          success: false,
        });
      });
    });
  }

  /**
   * Check if Git is installed and accessible
   */
  async isGitAvailable(): Promise<boolean> {
    try {
      const result = await this.execute(['git', '--version']);
      return result.success;
    } catch {
      return false;
    }
  }

  /**
   * Get Git version
   */
  async getGitVersion(): Promise<string | null> {
    try {
      const result = await this.execute(['git', '--version']);
      if (result.success) {
        // Parse version from output like "git version 2.30.0"
        const match = result.stdout.match(/git version (\d+\.\d+\.\d+)/);
        return match ? match[1] : null;
      }
      return null;
    } catch {
      return null;
    }
  }
}
