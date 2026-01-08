#!/usr/bin/env node

/**
 * Checks that the required API files have been generated.
 * Run schema:download, schema:bundle, and generate-api if they're missing.
 */

import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const requiredFiles = [
  {
    path: 'src/api/schema/openapi.yaml',
    description: 'OpenAPI schema YAML',
  },
  {
    path: 'src/api/schema/openapi.json',
    description: 'Bundled OpenAPI schema',
  },
  {
    path: 'src/api/endpoints/redfish.gen.ts',
    description: 'Generated API client',
  },
];

const missingFiles = requiredFiles.filter(
  (file) => !existsSync(resolve(projectRoot, file.path)),
);

if (missingFiles.length > 0) {
  console.error(
    '\n\x1b[31m╔══════════════════════════════════════════════════════════════════╗',
  );
  console.error(
    '║                    API FILES NOT GENERATED                       ║',
  );
  console.error(
    '╚══════════════════════════════════════════════════════════════════╝\x1b[0m\n',
  );

  console.error('The following required files are missing:\n');

  for (const file of missingFiles) {
    console.error(`  \x1b[33m✗\x1b[0m ${file.path}`);
    console.error(`    └─ ${file.description}`);
  }

  console.error('\n\x1b[36mTo generate the API files, run:\x1b[0m\n');
  console.error('  npm run schema:download');
  console.error('  npm run schema:bundle');
  console.error('  npm run generate-api');
  console.error('\n\x1b[36mOr run them all in sequence:\x1b[0m\n');
  console.error(
    '  npm run schema:download && npm run schema:bundle && npm run generate-api\n',
  );

  process.exit(1);
}

console.log('\x1b[32m✓\x1b[0m API files are present');
