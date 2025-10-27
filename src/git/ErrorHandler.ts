import { UserFriendlyError } from '../types';

/**
 * Handles Git command errors and provides user-friendly messages
 */
export class ErrorHandler {
  /**
   * Convert a raw error into a user-friendly error
   */
  handleError(error: Error, stderr?: string): UserFriendlyError {
    const errorMessage = stderr || error.message;

    // Check for common Git errors
    if (errorMessage.includes('not a git repository')) {
      return {
        title: 'Not a Git Repository',
        message: 'The selected directory is not a Git repository.',
        solutions: [
          'Initialize a new repository with "git init"',
          'Clone an existing repository',
          'Select a different directory that contains a Git repository',
        ],
        originalError: error,
      };
    }

    if (errorMessage.includes('fatal: refusing to merge unrelated histories')) {
      return {
        title: 'Unrelated Histories',
        message: 'The branches have unrelated commit histories.',
        solutions: [
          'Use the --allow-unrelated-histories flag if this is intentional',
          'Verify you are merging the correct branches',
        ],
        originalError: error,
      };
    }

    if (errorMessage.includes('CONFLICT')) {
      return {
        title: 'Merge Conflict',
        message: 'There are conflicts that need to be resolved.',
        solutions: [
          'Resolve conflicts in the affected files',
          'Stage the resolved files',
          'Complete the merge with a commit',
          'Abort the merge with "git merge --abort" if needed',
        ],
        originalError: error,
      };
    }

    if (errorMessage.includes('nothing to commit')) {
      return {
        title: 'Nothing to Commit',
        message: 'There are no changes to commit.',
        solutions: [
          'Make changes to files in the repository',
          'Stage files using "git add"',
        ],
        originalError: error,
      };
    }

    if (errorMessage.includes('Please commit your changes or stash them')) {
      return {
        title: 'Uncommitted Changes',
        message: 'You have uncommitted changes that would be overwritten.',
        solutions: [
          'Commit your changes first',
          'Stash your changes with "git stash"',
          'Discard your changes (warning: this is irreversible)',
        ],
        originalError: error,
      };
    }

    if (errorMessage.includes('failed to push')) {
      return {
        title: 'Push Failed',
        message: 'Failed to push commits to the remote repository.',
        solutions: [
          'Pull the latest changes first',
          'Check your network connection',
          'Verify you have permission to push to this repository',
          'Use force push if you are certain (warning: this can overwrite history)',
        ],
        originalError: error,
      };
    }

    if (errorMessage.includes('Authentication failed') || errorMessage.includes('Permission denied')) {
      return {
        title: 'Authentication Failed',
        message: 'Unable to authenticate with the remote repository.',
        solutions: [
          'Check your credentials',
          'Verify your SSH key is configured correctly',
          'Ensure you have access to the repository',
        ],
        originalError: error,
      };
    }

    if (errorMessage.includes('fatal: remote') && errorMessage.includes('already exists')) {
      return {
        title: 'Remote Already Exists',
        message: 'A remote with this name already exists.',
        solutions: [
          'Use a different remote name',
          'Remove the existing remote first',
          'Update the existing remote URL',
        ],
        originalError: error,
      };
    }

    if (errorMessage.includes("pathspec") && errorMessage.includes("did not match")) {
      return {
        title: 'File Not Found',
        message: 'The specified file or path does not exist.',
        solutions: [
          'Check the file path for typos',
          'Verify the file exists in the repository',
        ],
        originalError: error,
      };
    }

    if (errorMessage.includes('branch') && errorMessage.includes('already exists')) {
      return {
        title: 'Branch Already Exists',
        message: 'A branch with this name already exists.',
        solutions: [
          'Use a different branch name',
          'Switch to the existing branch',
          'Delete the existing branch first (warning: this will lose the branch)',
        ],
        originalError: error,
      };
    }

    // Generic error
    return {
      title: 'Git Error',
      message: errorMessage,
      solutions: [
        'Check the error message for details',
        'Consult Git documentation',
        'Check the repository status',
      ],
      originalError: error,
    };
  }

  /**
   * Suggest solutions for a specific error
   */
  suggestSolution(error: Error, stderr?: string): string[] {
    const friendlyError = this.handleError(error, stderr);
    return friendlyError.solutions;
  }

  /**
   * Check if an error is recoverable
   */
  isRecoverable(error: Error, stderr?: string): boolean {
    const errorMessage = stderr || error.message;

    // Non-recoverable errors
    const nonRecoverablePatterns = [
      'not a git repository',
      'Authentication failed',
      'Permission denied',
    ];

    for (const pattern of nonRecoverablePatterns) {
      if (errorMessage.includes(pattern)) {
        return false;
      }
    }

    return true;
  }
}
