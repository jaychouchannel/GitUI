/**
 * Example usage of GitUI core modules
 * This file demonstrates how to use the various managers to interact with Git repositories
 */

import { RepoManager } from './src/core/managers/RepoManager';
import { BranchManager } from './src/core/managers/BranchManager';
import { CommitManager } from './src/core/managers/CommitManager';
import { RemoteManager } from './src/core/managers/RemoteManager';
import { DiffManager } from './src/core/managers/DiffManager';

/**
 * Main example function
 */
async function main() {
  console.log('=== GitUI Example Usage ===\n');

  // Example 1: Open a repository
  console.log('1. Opening repository...');
  const repoManager = new RepoManager();
  
  try {
    // Replace with your actual repository path
    const repoPath = process.cwd();
    const repo = await repoManager.openRepository(repoPath);
    console.log(`   ✓ Opened repository: ${repo.name}`);
    console.log(`   Current branch: ${repo.currentBranch}`);
    
    // Example 2: Get repository status
    console.log('\n2. Getting repository status...');
    const status = await repoManager.getStatus();
    console.log(`   Staged files: ${status.staged.length}`);
    console.log(`   Unstaged files: ${status.unstaged.length}`);
    console.log(`   Untracked files: ${status.untracked.length}`);
    console.log(`   Conflicts: ${status.conflicts.length}`);
    
    // Example 3: List branches
    console.log('\n3. Listing branches...');
    const branchManager = new BranchManager(repo.path);
    const branches = await branchManager.listBranches();
    console.log(`   Total branches: ${branches.length}`);
    branches.slice(0, 5).forEach(branch => {
      const marker = branch.isCurrent ? '* ' : '  ';
      console.log(`   ${marker}${branch.name}`);
    });
    
    // Example 4: Get commit history
    console.log('\n4. Getting commit history...');
    const commitManager = new CommitManager(repo.path);
    const commits = await commitManager.getCommitHistory(5);
    console.log(`   Recent commits:`);
    commits.forEach(commit => {
      console.log(`   - ${commit.shortHash}: ${commit.message}`);
      console.log(`     Author: ${commit.author} <${commit.authorEmail}>`);
      console.log(`     Date: ${commit.date.toLocaleDateString()}`);
    });
    
    // Example 5: List remotes
    console.log('\n5. Listing remote repositories...');
    const remoteManager = new RemoteManager(repo.path);
    const remotes = await remoteManager.listRemotes();
    if (remotes.length > 0) {
      console.log(`   Remote repositories:`);
      remotes.forEach(remote => {
        console.log(`   - ${remote.name}: ${remote.url}`);
      });
    } else {
      console.log('   No remote repositories found');
    }
    
    // Example 6: Get diff for unstaged files
    console.log('\n6. Getting diff for changes...');
    const diffManager = new DiffManager(repo.path);
    const diffs = await diffManager.getDiff();
    if (diffs.length > 0) {
      console.log(`   Files with changes:`);
      diffs.forEach(diff => {
        console.log(`   - ${diff.file}: +${diff.additions} -${diff.deletions}`);
      });
    } else {
      console.log('   No changes detected');
    }
    
    console.log('\n=== Example completed successfully! ===');
    
  } catch (error) {
    console.error('\n❌ Error:', (error as Error).message);
    console.error('Make sure you run this example in a Git repository directory.');
  }
}

// Run the example
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main };
