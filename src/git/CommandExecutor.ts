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
      
      const process = spawn(cmd, args, {
        cwd: options.cwd || process.cwd(),
        env: { ...process.env, ...options.env },
        timeout: options.timeout,
      });

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code || 0,
          success: code === 0,
        });
      });

      process.on('error', (error) => {
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
      
      const process = spawn(cmd, args, {
        cwd: options.cwd || process.cwd(),
        env: { ...process.env, ...options.env },
        timeout: options.timeout,
      });

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        callback(output, false);
      });

      process.stderr?.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        callback(output, true);
      });

      process.on('close', (code) => {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code || 0,
          success: code === 0,
        });
      });

      process.on('error', (error) => {
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
