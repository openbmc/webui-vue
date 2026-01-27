#!/usr/bin/env node

/**
 * API Generation Script with Progress Output
 *
 * This script orchestrates the API generation pipeline with clear progress
 * indicators since the process can take several minutes.
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '../..');

// Check for required dependencies before starting
const requiredModules = [
  { path: 'node_modules/orval', name: 'orval' },
  { path: 'node_modules/prettier', name: 'prettier' },
  { path: 'node_modules/tsx', name: 'tsx' },
];

const missingModules = requiredModules.filter(
  (mod) => !existsSync(resolve(projectRoot, mod.path)),
);

if (missingModules.length > 0) {
  console.error(
    '\n\x1b[31m╔══════════════════════════════════════════════════════════════════╗',
  );
  console.error(
    '║                  MISSING DEPENDENCIES                            ║',
  );
  console.error(
    '╚══════════════════════════════════════════════════════════════════╝\x1b[0m\n',
  );
  console.error(
    'The following required modules are missing from node_modules:\n',
  );
  for (const mod of missingModules) {
    console.error(`  \x1b[33m✗\x1b[0m ${mod.name}`);
  }
  console.error('\n\x1b[36mPlease run:\x1b[0m\n');
  console.error('  npm install\n');
  process.exit(1);
}

// Check for required schema files before starting
const requiredSchemaFiles = [
  {
    path: 'src/api/schema/openapi.json',
    description: 'Bundled OpenAPI schema',
    howToFix: 'npm run schema:download && npm run schema:bundle',
  },
];

const missingSchemaFiles = requiredSchemaFiles.filter(
  (file) => !existsSync(resolve(projectRoot, file.path)),
);

if (missingSchemaFiles.length > 0) {
  console.error(
    '\n\x1b[31m╔══════════════════════════════════════════════════════════════════╗',
  );
  console.error(
    '║                  MISSING SCHEMA FILES                            ║',
  );
  console.error(
    '╚══════════════════════════════════════════════════════════════════╝\x1b[0m\n',
  );
  console.error('The following required schema files are missing:\n');
  for (const file of missingSchemaFiles) {
    console.error(`  \x1b[33m✗\x1b[0m ${file.path}`);
    console.error(`    └─ ${file.description}`);
  }
  console.error('\n\x1b[36mTo download and bundle the schema, run:\x1b[0m\n');
  console.error('  npm run schema:download && npm run schema:bundle\n');
  console.error('\x1b[36mOr run the full setup:\x1b[0m\n');
  console.error(
    '  npm run schema:download && npm run schema:bundle && npm run generate-api\n',
  );
  process.exit(1);
}

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, total, message) {
  log(`\n[${step}/${total}] ${message}`, colors.cyan + colors.bright);
}

function logSuccess(message) {
  log(`  ✓ ${message}`, colors.green);
}

/**
 * Run a command and return a promise
 * @param {string} command - Command to run
 * @param {string[]} args - Command arguments
 * @param {object} options - Options including showDots for progress indicator
 */
function runCommand(command, args, options = {}) {
  return new Promise((onResolve, onReject) => {
    const proc = spawn(command, args, {
      cwd: projectRoot,
      stdio: options.showDots ? ['inherit', 'pipe', 'pipe'] : 'inherit',
      shell: true,
    });

    let dotInterval;
    if (options.showDots) {
      // Show dots every 2 seconds to indicate progress
      process.stdout.write('  ');
      dotInterval = setInterval(() => {
        process.stdout.write('.');
      }, 2000);

      // Capture output but don't display it (unless there's an error)
      let stderr = '';
      proc.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        clearInterval(dotInterval);
        process.stdout.write('\n');
        if (code !== 0) {
          console.error(stderr);
          onReject(new Error(`Command failed with exit code ${code}`));
        } else {
          onResolve();
        }
      });
    } else {
      proc.on('close', (code) => {
        if (code !== 0) {
          onReject(new Error(`Command failed with exit code ${code}`));
        } else {
          onResolve();
        }
      });
    }

    proc.on('error', (err) => {
      if (dotInterval) {
        clearInterval(dotInterval);
        process.stdout.write('\n');
      }
      onReject(err);
    });
  });
}

async function main() {
  const startTime = Date.now();
  const totalSteps = 7;

  log(
    '\n╔════════════════════════════════════════════════════════════════╗',
    colors.blue,
  );
  log(
    '║                   API Client Generation                        ║',
    colors.blue,
  );
  log(
    '╚════════════════════════════════════════════════════════════════╝',
    colors.blue,
  );
  log('\n⏱  This process may take 2-5 minutes. Please wait...', colors.yellow);

  try {
    // Step 1: Preprocess schema
    logStep(1, totalSteps, 'Preprocessing OpenAPI schema...');
    await runCommand('npx', ['tsx', 'scripts/api/preprocess-schema.ts']);
    logSuccess('Schema preprocessed');

    // Step 2: Generate API client with Orval
    logStep(
      2,
      totalSteps,
      'Generating API client with Orval (this is the slow part)...',
    );
    // Use npx to invoke orval (works for both v7 .js and v8 .mjs)
    // NODE_OPTIONS sets max memory for the orval process
    await runCommand(
      'npx',
      [
        '--node-options=--max-old-space-size=8192',
        'orval',
        '--project',
        'redfish',
      ],
      { showDots: true },
    );
    logSuccess('API client generated');

    // Step 3: Convert model names to PascalCase
    logStep(3, totalSteps, 'Converting model names to PascalCase...');
    await runCommand('npx', ['tsx', 'scripts/api/pascal-case-models.ts']);
    logSuccess('Model names converted');

    // Step 4: Fix JSDoc formatting
    logStep(4, totalSteps, 'Fixing JSDoc formatting...');
    await runCommand('npx', ['tsx', 'scripts/api/fix-jsdoc-format.ts']);
    logSuccess('JSDoc formatting fixed');

    // Step 5: Add privilege metadata to endpoint functions
    logStep(5, totalSteps, 'Adding privilege metadata to endpoints...');
    await runCommand('npx', [
      'tsx',
      'src/api/transformer/add-privilege-metadata.ts',
    ]);
    logSuccess('Privilege metadata added');

    // Step 6: Format model directory with Prettier
    logStep(6, totalSteps, 'Formatting model files with Prettier...');
    await runCommand(
      'node',
      [
        '--max-old-space-size=8192',
        'node_modules/prettier/bin/prettier.cjs',
        '--write',
        '--log-level',
        'silent',
        '--ignore-path',
        '/dev/null',
        'src/api/model/',
      ],
      { showDots: true },
    );
    logSuccess('Model files formatted');

    // Step 7: Format endpoints directory with Prettier
    logStep(7, totalSteps, 'Formatting endpoint files with Prettier...');
    await runCommand(
      'node',
      [
        '--max-old-space-size=8192',
        'node_modules/prettier/bin/prettier.cjs',
        '--write',
        '--log-level',
        'silent',
        '--ignore-path',
        '/dev/null',
        'src/api/endpoints/',
        'src/api/index.ts',
      ],
      { showDots: true },
    );
    logSuccess('Endpoint files formatted');

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    log(
      `\n✅ API generation complete in ${elapsed}s\n`,
      colors.green + colors.bright,
    );
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    log(`\n❌ API generation failed after ${elapsed}s`, colors.yellow);
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`   ${errorMessage}\n`, colors.dim);
    process.exit(1);
  }
}

main();
