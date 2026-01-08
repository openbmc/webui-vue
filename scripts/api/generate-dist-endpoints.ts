/**
 * Generate a minimal "dist" endpoints file containing only the endpoints
 * actually used by the application.
 *
 * Also tracks imported model types and updates .gitignore to include them.
 *
 * Strategy: Find used hooks, then extract them and all their dependencies
 * using line-range extraction between exports.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as ts from 'typescript';

const rootDir = path.resolve(import.meta.dirname, '../..');
const srcDir = path.join(rootDir, 'src');
const fullEndpointsFile = path.join(srcDir, 'api/endpoints/redfish.gen.ts');
const distEndpointsFile = path.join(srcDir, 'api/endpoints/redfish.dist.ts');
const gitignoreFile = path.join(rootDir, '.gitignore');

interface ScanResult {
  hooks: Set<string>;
  models: Set<string>;
}

function findUsedImports(): ScanResult {
  const hooks = new Set<string>();
  const models = new Set<string>();

  function scanFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');

    if (!content.includes('@/api') && !content.includes('/api')) return;

    // Find all use* hook imports from API endpoints
    const endpointImportRegex =
      /import\s*\{([^}]+)\}\s*from\s*['"](?:@\/api\/endpoints|@\/api)[^'"]*['"]/g;
    let match;
    while ((match = endpointImportRegex.exec(content)) !== null) {
      const imports = match[1].split(',');
      for (const imp of imports) {
        const name = imp.split(/\s+as\s+/)[0].trim();
        // Only track actual hooks (use* pattern)
        if (name && name.startsWith('use') && !name.includes('Client')) {
          hooks.add(name);
        }
      }
    }

    // Find model imports: import type { Foo } from '@/api/model/Foo'
    const modelImportRegex =
      /import\s+type\s*\{[^}]+\}\s*from\s*['"]@\/api\/model\/([^'"]+)['"]/g;
    while ((match = modelImportRegex.exec(content)) !== null) {
      const modelName = match[1];
      models.add(modelName);
    }

    // Also check for non-type imports from model
    const modelImportRegex2 =
      /import\s*\{[^}]+\}\s*from\s*['"]@\/api\/model\/([^'"]+)['"]/g;
    while ((match = modelImportRegex2.exec(content)) !== null) {
      const modelName = match[1];
      models.add(modelName);
    }
  }

  function scanDirectory(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (
        fullPath.includes('/api/endpoints') ||
        fullPath.includes('/api/model') ||
        fullPath.includes('/api/schema')
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (/\.(vue|js|ts)$/.test(entry.name)) {
        scanFile(fullPath);
      }
    }
  }

  scanDirectory(srcDir);
  return { hooks, models };
}

function updateGitignore(models: Set<string>): void {
  let content = fs.readFileSync(gitignoreFile, 'utf-8');

  // Remove old model exceptions (lines starting with !src/api/model/)
  const lines = content.split('\n');
  const filteredLines = lines.filter(
    (line) => !line.startsWith('!src/api/model/'),
  );

  // Find where to insert (after src/api/model/ ignore line)
  const modelIgnoreIdx = filteredLines.findIndex((line) =>
    line.includes('src/api/model/'),
  );

  if (modelIgnoreIdx === -1) {
    console.log('   ⚠️  Could not find src/api/model/ in .gitignore');
    return;
  }

  // Insert new exceptions after the model ignore line
  const exceptions = [...models]
    .sort()
    .map((m) => `!src/api/model/${m}.ts`);

  filteredLines.splice(modelIgnoreIdx + 1, 0, ...exceptions);

  // Ensure file ends with newline
  const newContent = filteredLines.join('\n').trimEnd() + '\n';

  if (newContent !== content) {
    fs.writeFileSync(gitignoreFile, newContent);
    console.log(`   ✅ Updated .gitignore with ${models.size} model exceptions`);
  } else {
    console.log(`   ℹ️  .gitignore already up to date`);
  }
}

interface ExportLocation {
  name: string;
  startLine: number;
  endLine: number;
}

function findExportLocations(lines: string[]): Map<string, ExportLocation> {
  const exports = new Map<string, ExportLocation>();
  const exportStarts: { name: string; line: number }[] = [];

  // Find all export start lines
  const exportPattern = /^export\s+(?:const|function|type|interface)\s+(\w+)/;
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(exportPattern);
    if (match) {
      exportStarts.push({ name: match[1], line: i });
    }
  }

  // Each export ends where the next one starts (or EOF)
  for (let i = 0; i < exportStarts.length; i++) {
    const start = exportStarts[i];
    const endLine =
      i + 1 < exportStarts.length ? exportStarts[i + 1].line : lines.length;

    exports.set(start.name, {
      name: start.name,
      startLine: start.line,
      endLine: endLine,
    });
  }

  return exports;
}

function findDependencies(
  hookName: string,
  exports: Map<string, ExportLocation>,
): string[] {
  // For a hook like useGetAccountService, we need:
  // - The base function (getAccountService)
  // - The query/mutation options (getGetAccountServiceQueryOptions)
  // - Type exports (GetAccountServiceQueryResult, etc.)
  //
  // Infinite-query helpers are only included if the Infinite hook is explicitly imported.

  const deps: string[] = [];

  // Parse hook name: useGetAccountService -> method=Get, resource=AccountService
  // Or: usePatchAccountService -> method=Patch, resource=AccountService
  // Or: useGetAccountServiceInfinite -> method=Get, resource=AccountService, isInfinite=true
  const hookMatch = hookName.match(/^use(Get|Patch|Post|Delete|Put)?(.+?)(Infinite)?$/);
  if (!hookMatch) return deps;

  const method = hookMatch[1] || 'Get'; // Default to Get for queries
  const resource = hookMatch[2];
  const isInfinite = !!hookMatch[3];

  // Base dependencies (always needed)
  const potentialDeps = [
    // Base API function: getAccountService, patchAccountService, etc.
    `${method.toLowerCase()}${resource}`,
  ];

  if (isInfinite) {
    // Infinite query dependencies
    potentialDeps.push(
      `get${method}${resource}InfiniteQueryOptions`,
      `get${method}${resource}InfiniteQueryKey`,
    );
  } else if (method === 'Get') {
    // Regular query dependencies (GET only)
    potentialDeps.push(
      `get${method}${resource}QueryOptions`,
      `get${method}${resource}QueryKey`,
      `${method}${resource}QueryResult`,
      `${method}${resource}QueryError`,
    );
  } else {
    // Mutation dependencies (PATCH/POST/DELETE/PUT)
    potentialDeps.push(
      `get${method}${resource}MutationOptions`,
      `${method}${resource}MutationResult`,
      `${method}${resource}MutationBody`,
      `${method}${resource}MutationError`,
    );
  }

  for (const dep of potentialDeps) {
    if (exports.has(dep)) {
      deps.push(dep);
    }
  }

  return deps;
}

async function main() {
  console.log('\n🔍 Scanning source files for API imports...');

  if (!fs.existsSync(fullEndpointsFile)) {
    console.error('❌ Full endpoints file not found:', fullEndpointsFile);
    console.error('   Run "npm run generate-api" first.');
    process.exit(1);
  }

  // Find used hooks and models
  const { hooks: usedHooks, models: usedModels } = findUsedImports();
  console.log(`   Found ${usedHooks.size} hooks in use:`);
  for (const hook of [...usedHooks].sort()) {
    console.log(`     - ${hook}`);
  }
  console.log(`   Found ${usedModels.size} models in use:`);
  for (const model of [...usedModels].sort()) {
    console.log(`     - ${model}`);
  }

  // Read and parse the full file
  console.log('\n📄 Parsing full endpoints file...');
  const content = fs.readFileSync(fullEndpointsFile, 'utf-8');
  const lines = content.split('\n');
  console.log(`   ${lines.length} lines, ${(content.length / 1024 / 1024).toFixed(1)} MB`);

  // Find all export locations
  const exportLocations = findExportLocations(lines);
  console.log(`   Found ${exportLocations.size} exports`);

  // Collect all exports we need (hooks + their dependencies)
  const neededExports = new Set<string>();
  for (const hook of usedHooks) {
    if (exportLocations.has(hook)) {
      neededExports.add(hook);
    }

    // Add dependencies
    const deps = findDependencies(hook, exportLocations);
    for (const dep of deps) {
      if (exportLocations.has(dep)) {
        neededExports.add(dep);
      }
    }
  }

  console.log(`\n📦 Collecting ${neededExports.size} exports (hooks + dependencies):`);
  for (const name of [...neededExports].sort()) {
    console.log(`     - ${name}`);
  }

  // Find where exports start (after imports)
  let importsEndLine = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('export ')) {
      importsEndLine = i;
      break;
    }
  }

  // Extract needed sections
  const extractedSections: string[] = [];

  // Sort exports by line number to maintain order
  const sortedExports = [...neededExports].sort((a, b) => {
    const locA = exportLocations.get(a)!;
    const locB = exportLocations.get(b)!;
    return locA.startLine - locB.startLine;
  });

  for (const name of sortedExports) {
    const loc = exportLocations.get(name)!;
    const section = lines.slice(loc.startLine, loc.endLine).join('\n');
    extractedSections.push(section);
  }

  // Build dist file
  const distContent = [
    '/**',
    ' * Minimal endpoints file - contains only exports used by the app.',
    ' *',
    ' * Generated by: scripts/api/generate-dist-endpoints.ts',
    ` * Hooks: ${usedHooks.size}`,
    ` * Total exports: ${neededExports.size}`,
    ' *',
    ' * For full API, use redfish.gen.ts (development only)',
    ' */',
    '',
    // Import section from original
    lines.slice(0, importsEndLine).join('\n'),
    '',
    // Extracted exports
    ...extractedSections,
    '',
  ].join('\n');

  fs.writeFileSync(distEndpointsFile, distContent);

  const distSize = fs.statSync(distEndpointsFile).size;
  const fullSize = fs.statSync(fullEndpointsFile).size;
  const savings = ((1 - distSize / fullSize) * 100).toFixed(1);

  console.log(`\n✅ Generated: ${distEndpointsFile}`);
  console.log(`   📊 Size: ${(distSize / 1024).toFixed(1)} KB`);
  console.log(`   📉 Reduction: ${savings}% smaller than full file`);

  // Verify the file compiles
  console.log('\n🔍 Verifying TypeScript compilation...');
  try {
    // Use the project's tsconfig.json to avoid default-TS settings.
    // Without this, `tsc` defaults (target ES5, skipLibCheck=false) can produce
    // spurious errors from node_modules (e.g., TS18028 for #private fields).
    const tsconfigPath = path.join(rootDir, 'tsconfig.json');
    const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    if (configFile.error) {
      throw new Error(
        ts.formatDiagnosticsWithColorAndContext([configFile.error], {
          getCanonicalFileName: (f) => f,
          getCurrentDirectory: () => rootDir,
          getNewLine: () => '\n',
        }),
      );
    }

    const parsed = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      rootDir,
      // Ensure we do not emit during validation
      { noEmit: true },
      tsconfigPath,
    );

    const program = ts.createProgram([distEndpointsFile], parsed.options);
    const diagnostics = ts.getPreEmitDiagnostics(program);
    const errors = diagnostics.filter(
      (d) => d.category === ts.DiagnosticCategory.Error,
    );

    if (errors.length > 0) {
      const formatted = ts.formatDiagnosticsWithColorAndContext(errors, {
        getCanonicalFileName: (f) => f,
        getCurrentDirectory: () => rootDir,
        getNewLine: () => '\n',
      });
      throw new Error(formatted);
    }

    console.log('   ✅ TypeScript compilation OK');
  } catch (error: any) {
    console.log('   ⚠️  TypeScript errors:');
    const msg = typeof error?.message === 'string' ? error.message : String(error);
    console.log(msg.slice(0, 1500));
  }

  // Update .gitignore to include used models
  if (usedModels.size > 0) {
    console.log('\n📝 Updating .gitignore for model files...');
    updateGitignore(usedModels);
  }

  console.log('');
}

main().catch(console.error);
