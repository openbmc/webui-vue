#!/usr/bin/env node
/**
 * Pre-commit hook helper for API dist generation.
 * Cross-platform (works on Windows, macOS, Linux).
 *
 * This script:
 * 1. Checks if redfish.gen.ts exists (skip if not)
 * 2. Runs generate-api:dist
 * 3. Stages the dist file, .gitignore, and any un-ignored model files
 */

import { execSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const genFile = resolve(rootDir, 'src/api/endpoints/redfish.gen.ts');
const distFile = 'src/api/endpoints/redfish.dist.ts';
const gitignoreFile = resolve(rootDir, '.gitignore');

// Skip if full generated file doesn't exist (CI environment)
if (!existsSync(genFile)) {
  process.exit(0);
}

// Run generate-api:dist
try {
  execSync('npm run generate-api:dist', {
    cwd: rootDir,
    stdio: 'inherit',
  });
} catch (error) {
  console.error('generate-api:dist failed');
  process.exit(1);
}

// Find model files to stage by parsing .gitignore exceptions
const gitignoreContent = readFileSync(gitignoreFile, 'utf-8');
const modelExceptions = gitignoreContent
  .split('\n')
  .filter((line) => line.startsWith('!src/api/model/'))
  .map((line) => line.slice(1)); // Remove the '!' prefix

// Files to stage
const filesToStage = [distFile, '.gitignore', ...modelExceptions];

// Stage files (ignore errors for files that don't exist)
for (const file of filesToStage) {
  const result = spawnSync('git', ['add', file], {
    cwd: rootDir,
    stdio: 'pipe',
  });
  // Ignore errors - file might not exist or already be staged
}

process.exit(0);
