#!/usr/bin/env node
/**
 * pre-commit helper: when package.json or package-lock.json are part of the
 * staged change, regenerate the OSS license manifest and stage the resulting
 * artifacts so they ride along in the same commit (and the prepare-commit-msg
 * hook can summarize the license delta).
 *
 * Skipped (fast no-op) for commits that don't touch the dependency manifests.
 */

import { execFileSync } from 'node:child_process';

const ARTIFACTS = ['bom.json', 'oss-licenses.json', 'THIRD_PARTY_LICENSES.md', 'oss-licenses.csv'];

function staged() {
  try {
    return execFileSync('git', ['diff', '--cached', '--name-only'], { encoding: 'utf8' })
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

const files = staged();
if (files.includes('package.json') || files.includes('package-lock.json')) {
  execFileSync('node', ['scripts/gen-oss-licenses.mjs'], { stdio: 'inherit' });
  execFileSync('git', ['add', ...ARTIFACTS], { stdio: 'inherit' });
}
