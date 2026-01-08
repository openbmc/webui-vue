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

async function main(): Promise<void> {
  if (!fs.existsSync(modelsDir)) {
    console.log('Model directory not found, skipping PascalCase fix.');
    return;
  }

  // Step 1: Rename any camelCase files to PascalCase
  const files = fs.readdirSync(modelsDir);
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
}

void main();
