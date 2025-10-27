import { CommandOptions } from '../types';

/**
 * Builds Git commands from operations and parameters
 */
export class CommandBuilder {
  /**
   * Build a Git command string
   */
  build(operation: string, args: string[] = [], options: Record<string, any> = {}): string[] {
    const command = ['git', operation];

    // Add options (flags)
    for (const [key, value] of Object.entries(options)) {
      if (value === true) {
        // Boolean flag
        command.push(`--${key}`);
      } else if (value !== false && value !== null && value !== undefined) {
        // Key-value option
        command.push(`--${key}=${value}`);
      }
    }

    // Add arguments
    command.push(...args);

    return command;
  }

  /**
   * Build status command
   */
  buildStatus(porcelain: boolean = true): string[] {
    return this.build('status', [], { porcelain, 'untracked-files': 'all' });
  }

  /**
   * Build branch list command
   */
  buildListBranches(includeRemote: boolean = false): string[] {
    const options: Record<string, any> = { verbose: true };
    if (includeRemote) {
      options.all = true;
    }
    return this.build('branch', [], options);
  }

  /**
   * Build commit command
   */
  buildCommit(message: string, options: { amend?: boolean; all?: boolean } = {}): string[] {
    return this.build('commit', [], { message, ...options });
  }

  /**
   * Build log command
   */
  buildLog(limit?: number, format?: string): string[] {
    const options: Record<string, any> = {};
    if (format) {
      options.format = format;
    }
    const args: string[] = [];
    if (limit) {
      args.push(`-${limit}`);
    }
    return this.build('log', args, options);
  }

  /**
   * Build add command
   */
  buildAdd(files: string[]): string[] {
    return this.build('add', files);
  }

  /**
   * Build reset command
   */
  buildReset(files: string[]): string[] {
    return this.build('reset', ['HEAD', ...files]);
  }

  /**
   * Build diff command
   */
  buildDiff(files: string[] = [], staged: boolean = false): string[] {
    const options: Record<string, any> = {};
    if (staged) {
      options.cached = true;
    }
    return this.build('diff', files, options);
  }

  /**
   * Build checkout command
   */
  buildCheckout(branch: string, createNew: boolean = false): string[] {
    const options: Record<string, any> = {};
    if (createNew) {
      options.b = true;
    }
    return this.build('checkout', [branch], options);
  }

  /**
   * Build merge command
   */
  buildMerge(branch: string, options: { noFf?: boolean; squash?: boolean } = {}): string[] {
    const opts: Record<string, any> = {};
    if (options.noFf) {
      opts['no-ff'] = true;
    }
    if (options.squash) {
      opts.squash = true;
    }
    return this.build('merge', [branch], opts);
  }

  /**
   * Build pull command
   */
  buildPull(remote: string, branch: string, rebase: boolean = false): string[] {
    const options: Record<string, any> = {};
    if (rebase) {
      options.rebase = true;
    }
    return this.build('pull', [remote, branch], options);
  }

  /**
   * Build push command
   */
  buildPush(remote: string, branch: string, force: boolean = false): string[] {
    const options: Record<string, any> = {};
    if (force) {
      options.force = true;
    }
    return this.build('push', [remote, branch], options);
  }

  /**
   * Build fetch command
   */
  buildFetch(remote: string, prune: boolean = false): string[] {
    const options: Record<string, any> = {};
    if (prune) {
      options.prune = true;
    }
    return this.build('fetch', [remote], options);
  }

  /**
   * Build remote list command
   */
  buildListRemotes(verbose: boolean = true): string[] {
    return this.build('remote', [], { verbose });
  }

  /**
   * Build remote add command
   */
  buildAddRemote(name: string, url: string): string[] {
    return this.build('remote', ['add', name, url]);
  }

  /**
   * Build remote remove command
   */
  buildRemoveRemote(name: string): string[] {
    return this.build('remote', ['remove', name]);
  }

  /**
   * Build clone command
   */
  buildClone(url: string, directory: string, options: { depth?: number; branch?: string } = {}): string[] {
    const opts: Record<string, any> = {};
    if (options.depth) {
      opts.depth = options.depth;
    }
    if (options.branch) {
      opts.branch = options.branch;
    }
    return this.build('clone', [url, directory], opts);
  }

  /**
   * Build init command
   */
  buildInit(directory: string, bare: boolean = false): string[] {
    const options: Record<string, any> = {};
    if (bare) {
      options.bare = true;
    }
    return this.build('init', [directory], options);
  }

  /**
   * Build tag command
   */
  buildTag(name?: string, annotated: boolean = false, message?: string): string[] {
    const args: string[] = [];
    const options: Record<string, any> = {};
    
    if (name) {
      args.push(name);
      if (annotated && message) {
        options.a = true;
        options.m = message;
      }
    } else {
      options.l = true; // List tags
    }
    
    return this.build('tag', args, options);
  }
}
