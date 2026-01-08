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
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const genFile = resolve(rootDir, 'src/api/endpoints/redfish.gen.ts');
const distFile = 'src/api/endpoints/redfish.dist.ts';
const gitignoreFile = resolve(rootDir, '.gitignore');
const modelDir = resolve(rootDir, 'src/api/model');

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

function gitAdd(file, { force = false } = {}) {
  spawnSync('git', force ? ['add', '-f', file] : ['add', file], {
    cwd: rootDir,
    stdio: 'pipe',
  });
}

function buildModelBasenameMap() {
  // Map lowercased basename -> actual basename (case-preserving).
  // This avoids macOS case-insensitivity hiding bad import casing.
  const map = new Map();
  try {
    const entries = readdirSync(modelDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const ext = extname(entry.name);
      if (ext !== '.ts') continue;
      const basename = entry.name.slice(0, -ext.length);
      map.set(basename.toLowerCase(), basename);
    }
  } catch {
    // If modelDir doesn't exist, just return empty map.
  }
  return map;
}

function resolveModelImportToPath(importSpecifier, basenameMap) {
  // Only support same-directory imports like "./OdataV4Id" or "./odataV4Id"
  if (!importSpecifier.startsWith('./')) return undefined;
  const raw = importSpecifier.slice(2);
  const ext = extname(raw);
  const basename = ext ? raw.slice(0, -ext.length) : raw;
  const actualBasename = basenameMap.get(basename.toLowerCase()) ?? basename;
  const rel = `src/api/model/${actualBasename}.ts`;
  return existsSync(resolve(rootDir, rel)) ? rel : undefined;
}

function parseRelativeModelImports(source) {
  // Matches both `import ... from './X'` and `export ... from './X'`
  const imports = new Set();
  const re = /\bfrom\s+['"](\.\/[^'"]+)['"]/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    imports.add(m[1]);
  }
  return [...imports];
}

function collectModelDependencyClosure(entryFiles) {
  const basenameMap = buildModelBasenameMap();
  const visited = new Set();
  const queue = [];

  for (const entry of entryFiles) {
    if (!entry.startsWith('src/api/model/')) continue;
    if (!entry.endsWith('.ts')) continue;
    if (!existsSync(resolve(rootDir, entry))) continue;
    visited.add(entry);
    queue.push(entry);
  }

  while (queue.length > 0) {
    const file = queue.shift();
    let content = '';
    try {
      content = readFileSync(resolve(rootDir, file), 'utf-8');
    } catch {
      continue;
    }

    const relImports = parseRelativeModelImports(content);
    for (const spec of relImports) {
      const resolved = resolveModelImportToPath(spec, basenameMap);
      if (!resolved) continue;
      if (visited.has(resolved)) continue;
      visited.add(resolved);
      queue.push(resolved);
    }
  }

  return visited;
}

// Find model files to stage by parsing .gitignore exceptions
const gitignoreContent = readFileSync(gitignoreFile, 'utf-8');
const modelExceptions = gitignoreContent
  .split('\n')
  .filter((line) => line.startsWith('!src/api/model/'))
  .map((line) => line.slice(1)); // Remove the '!' prefix

// Files to stage
const filesToStage = [distFile, '.gitignore', ...modelExceptions];

// Also stage the minimal dependency model files required by the kept models.
// These are staged with `-f` to allow committing even if still git-ignored.
const modelDeps = collectModelDependencyClosure(modelExceptions);

// Stage files (ignore errors for files that don't exist)
for (const file of filesToStage) {
  gitAdd(file);
}

for (const dep of modelDeps) {
  // Don't duplicate staging of the explicitly kept models.
  if (filesToStage.includes(dep)) continue;
  gitAdd(dep, { force: true });
}

process.exit(0);
