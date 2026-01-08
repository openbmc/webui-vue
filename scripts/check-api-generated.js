#!/usr/bin/env node

/**
 * Checks that the required API files are present.
 *
 * In production (CI): Only the dist file is needed (committed to git)
 * In development: Full generated files are needed for IDE visibility
 *
 * Set NODE_ENV=production to check for dist file only.
 */

import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const isProduction = process.env.NODE_ENV === 'production';

// In production, we only need the committed dist file
// In development, we need the full generated files
const requiredFiles = isProduction
  ? [
      {
        path: 'src/api/endpoints/redfish.dist.ts',
        description: 'Minimal API client (committed)',
      },
    ]
  : [
      {
        path: 'src/api/endpoints/redfish.gen.ts',
        description: 'Full generated API client',
        alternative: 'src/api/endpoints/redfish.dist.ts',
        alternativeDescription: 'Minimal API client (for production builds)',
      },
    ];

const missingFiles = requiredFiles.filter(
  (file) =>
    !existsSync(resolve(projectRoot, file.path)) &&
    (!file.alternative || !existsSync(resolve(projectRoot, file.alternative))),
);

if (missingFiles.length > 0) {
  // Check if dist file exists (can still build with it)
  const distExists = existsSync(
    resolve(projectRoot, 'src/api/endpoints/redfish.dist.ts'),
  );

  if (distExists && !isProduction) {
    console.log(
      '\x1b[33m⚠\x1b[0m Full API file not found, using dist file for build',
    );
    console.log('  Run "npm run generate-api" for full IDE support\n');
    process.exit(0);
  }

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

  if (isProduction) {
    console.error('\n\x1b[36mThe dist file should be committed to git.\x1b[0m');
    console.error('Run "npm run generate-api:dist" to regenerate it.\n');
  } else {
    console.error('\n\x1b[36mTo generate the API files, run:\x1b[0m\n');
    console.error('  npm run schema:download');
    console.error('  npm run schema:bundle');
    console.error('  npm run generate-api');
    console.error('\n\x1b[36mOr run them all in sequence:\x1b[0m\n');
    console.error(
      '  npm run schema:download && npm run schema:bundle && npm run generate-api\n',
    );
  }

  process.exit(1);
}

console.log('\x1b[32m✓\x1b[0m API files are present');
