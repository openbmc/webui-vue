/**
 * Post-processing script to ensure model files and imports use PascalCase.
 *
 * Orval 7.x has inconsistent behavior with `namingConvention: 'PascalCase'` -
 * it may generate PascalCase filenames but camelCase exports in index.ts.
 * This script ensures everything is PascalCase.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsDir = path.join(__dirname, '../../src/api/model');

function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildBasenameMap(files: string[]): Map<string, string> {
  // Map lowercased basename -> actual basename, e.g. "capacityactions" -> "CapacityActions"
  const map = new Map<string, string>();
  for (const file of files) {
    if (!file.endsWith('.ts') || file === 'index.ts') continue;
    const base = file.slice(0, -3);
    map.set(base.toLowerCase(), base);
  }
  return map;
}

function fixRelativeImportCasing(
  content: string,
  basenameMap: Map<string, string>,
): { updated: string; fixedCount: number } {
  let fixedCount = 0;

  // Fix: import ... from './fooBar' or export ... from "./fooBar"
  const updated = content.replace(
    /\bfrom\s+(['"])\.\/([^'"]+)\1/g,
    (match, quote, spec) => {
      // Ignore subpaths like ./foo/bar (shouldn't happen in Orval models)
      if (spec.includes('/')) return match;

      const base = spec.endsWith('.ts') ? spec.slice(0, -3) : spec;
      const desired = basenameMap.get(base.toLowerCase());
      if (!desired) return match;

      // Preserve extensionless style used by Orval
      const replacement = `${quote}./${desired}${quote}`;
      const current = `${quote}./${spec}${quote}`;
      if (current !== replacement) fixedCount++;
      return `from ${replacement}`;
    },
  );

  return { updated, fixedCount };
}

async function main(): Promise<void> {
  if (!fs.existsSync(modelsDir)) {
    console.log('Model directory not found, skipping PascalCase fix.');
    return;
  }

  const files = fs.readdirSync(modelsDir);

  // Step 0: Detect case collisions (e.g., both Foo.ts and foo.ts exist)
  // This can happen on case-sensitive filesystems and causes issues on case-insensitive ones
  const lowerCaseMap = new Map<string, string[]>();
  for (const file of files) {
    if (!file.endsWith('.ts') || file === 'index.ts') continue;
    const lower = file.toLowerCase();
    if (!lowerCaseMap.has(lower)) {
      lowerCaseMap.set(lower, []);
    }
    lowerCaseMap.get(lower)!.push(file);
  }

  const collisions = [...lowerCaseMap.entries()].filter(
    ([, names]) => names.length > 1,
  );
  if (collisions.length > 0) {
    console.error('❌ Case collision detected in model files:');
    for (const [lower, names] of collisions) {
      console.error(`   ${lower}: ${names.join(', ')}`);
    }
    console.error(
      'This will cause issues on case-insensitive filesystems (macOS, Windows).',
    );
    console.error('Please report this as a bug in the schema or Orval config.');
    process.exit(1);
  }

  // Step 1: Rename any camelCase files to PascalCase
  let renamedCount = 0;

  for (const file of files) {
    if (!file.endsWith('.ts') || file === 'index.ts') continue;

    const pascalName = toPascalCase(file);

    if (file === pascalName) continue;

    const oldPath = path.join(modelsDir, file);
    const newPath = path.join(modelsDir, pascalName);

    // Handle case-insensitive file systems (macOS)
    const tempPath = path.join(modelsDir, `_temp_${Date.now()}_${file}`);
    fs.renameSync(oldPath, tempPath);
    fs.renameSync(tempPath, newPath);

    renamedCount++;
  }

  console.log(`Renamed ${renamedCount} model files to PascalCase`);

  // Refresh file list after renames
  const updatedFiles = fs.readdirSync(modelsDir);
  const basenameMap = buildBasenameMap(updatedFiles);

  // Step 2: Fix index.ts to ensure all exports use PascalCase
  const indexPath = path.join(modelsDir, 'index.ts');
  if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf-8');
    let fixedCount = 0;

    // Match export * from './someName' and ensure first char is uppercase
    const updatedContent = indexContent.replace(
      /export \* from '\.\/([a-z][^']*?)'/g,
      (match, moduleName) => {
        const pascalName = toPascalCase(moduleName);
        if (moduleName !== pascalName) {
          fixedCount++;
          return `export * from './${pascalName}'`;
        }
        return match;
      },
    );

    if (fixedCount > 0) {
      fs.writeFileSync(indexPath, updatedContent);
      console.log(`Fixed ${fixedCount} exports in index.ts to PascalCase`);
    }
  }

  // Step 3: Fix internal relative import casing in all model files.
  // This prevents TS1149 errors on case-insensitive filesystems when Orval
  // emits lowercased import specifiers (e.g. './capacityActions') but the file
  // is actually 'CapacityActions.ts' after PascalCase normalization.
  let importFixCount = 0;
  let filesTouched = 0;
  for (const file of updatedFiles) {
    if (!file.endsWith('.ts')) continue;
    const fullPath = path.join(modelsDir, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const { updated, fixedCount } = fixRelativeImportCasing(content, basenameMap);
    if (fixedCount > 0) {
      fs.writeFileSync(fullPath, updated);
      importFixCount += fixedCount;
      filesTouched++;
    }
  }
  console.log(
    `Fixed ${importFixCount} relative import paths in ${filesTouched} files`,
  );
}

void main();
