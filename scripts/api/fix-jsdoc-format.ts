import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelDir = path.join(__dirname, '../../src/api/model');
const endpointsDir = path.join(__dirname, '../../src/api/endpoints');

/**
 * Fix JSDoc comments that have lines without the " * " prefix.
 * This happens when descriptions contain newlines that Orval doesn't format.
 */
function fixJsDocInContent(content: string): string {
  // Match JSDoc comments: /** ... */
  return content.replace(/\/\*\*[\s\S]*?\*\//g, (jsDocComment) => {
    const lines = jsDocComment.split('\n');
    const fixedLines = lines.map((line, index) => {
      // Skip first line (/**) and last line (*/)
      if (index === 0 || index === lines.length - 1) {
        return line;
      }
      // If line doesn't start with " * " (after trimming leading spaces), add it
      const trimmed = line.trimStart();
      if (trimmed && !trimmed.startsWith('* ') && !trimmed.startsWith('*/')) {
        // Preserve the original indentation pattern
        const indent = line.match(/^(\s*)/)?.[1] || '';
        return `${indent} * ${trimmed}`;
      }
      return line;
    });
    return fixedLines.join('\n');
  });
}

/**
 * Process all TypeScript files in a directory.
 */
function processDirectory(dir: string): number {
  if (!fs.existsSync(dir)) {
    return 0;
  }

  let fixedCount = 0;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fixedCount += processDirectory(filePath);
    } else if (file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const fixed = fixJsDocInContent(content);

      if (fixed !== content) {
        fs.writeFileSync(filePath, fixed);
        fixedCount++;
      }
    }
  }

  return fixedCount;
}

async function main(): Promise<void> {
  let totalFixed = 0;

  totalFixed += processDirectory(modelDir);
  totalFixed += processDirectory(endpointsDir);

  console.log(`Fixed JSDoc formatting in ${totalFixed} files`);
}

void main();
