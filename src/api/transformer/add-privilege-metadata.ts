/**
 * Build-Time Privilege Metadata Transformer
 *
 * Post-processes generated endpoint files to attach privilege metadata
 * to each endpoint function. This metadata enables runtime privilege
 * checking without shipping the full PrivilegeRegistry.json to firmware.
 *
 * Run as part of the API generation pipeline after Orval generates code.
 *
 * Usage: npx tsx src/api/transformer/add-privilege-metadata.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '../../..');

// Paths
const ENDPOINTS_FILE = resolve(
  projectRoot,
  'src/api/endpoints/redfish.gen.ts',
);
const DIST_ENDPOINTS_FILE = resolve(
  projectRoot,
  'src/api/endpoints/redfish.dist.ts',
);

/**
 * Extract entity name and HTTP method from an endpoint function name.
 *
 * Naming convention: <method><Entity><Action?>
 * Examples:
 *   getUpdateService -> { entity: 'UpdateService', method: 'GET' }
 *   postUpdateServiceSimpleUpdate -> { entity: 'UpdateService', method: 'POST' }
 *   patchManagerAccountById -> { entity: 'ManagerAccount', method: 'PATCH' }
 *   deleteSessionServiceSessionById -> { entity: 'Session', method: 'DELETE' }
 */
function parseEndpointName(
  fnName: string,
): { entity: string; method: string } | null {
  // Match HTTP method prefix
  const methodPrefixes: Record<string, string> = {
    get: 'GET',
    post: 'POST',
    patch: 'PATCH',
    put: 'PUT',
    delete: 'DELETE',
  };

  for (const [prefix, method] of Object.entries(methodPrefixes)) {
    if (fnName.startsWith(prefix)) {
      const rest = fnName.slice(prefix.length);
      if (!rest) continue;

      // Extract entity - the first PascalCase segment after the method
      // Handle common patterns:
      // - getUpdateService -> UpdateService
      // - postUpdateServiceSimpleUpdate -> UpdateService
      // - patchManagerAccountById -> ManagerAccount
      // - deleteSessionServiceSessionById -> Session (special case)

      // Special case: SessionService sessions are Session entities
      if (rest.startsWith('SessionServiceSession')) {
        return { entity: 'Session', method };
      }
      if (rest === 'SessionServiceSessions') {
        return { entity: 'SessionCollection', method };
      }
      if (rest.startsWith('SessionService')) {
        return { entity: 'SessionService', method };
      }

      // Special case: AccountService accounts are ManagerAccount entities
      if (rest.startsWith('AccountServiceAccount')) {
        return { entity: 'ManagerAccount', method };
      }
      if (rest === 'AccountServiceAccounts') {
        return { entity: 'ManagerAccountCollection', method };
      }

      // Extract base entity name (before action verbs or 'By' suffix)
      const entityMatch = rest.match(
        /^([A-Z][a-z]+(?:[A-Z][a-z]+)*?)(?:Collection|By|Activate|SimpleUpdate|StartUpdate|$)/,
      );

      if (entityMatch) {
        let entity = entityMatch[1];

        // Check if it ends with 'Collection'
        if (rest.includes('Collection') || rest.endsWith('s')) {
          // Could be a collection endpoint
          if (!entity.endsWith('Collection')) {
            entity = entity + 'Collection';
          }
        }

        // Remove trailing 'Service' for service entities that aren't the service itself
        if (entity.endsWith('Service') && rest !== entity) {
          // Keep as-is for now, let the static mappings handle it
        }

        return { entity, method };
      }

      // Fallback: use the whole rest as entity
      return { entity: rest, method };
    }
  }

  return null;
}

/**
 * Remove any previously generated privilege metadata block.
 */
function stripPrivilegeMetadata(content: string): string {
  const startMarker = '// ========== Privilege Metadata (auto-generated) ==========';
  const startIndex = content.indexOf(startMarker);
  if (startIndex === -1) return content;

  // Drop everything from the marker to the end of the file.
  return content.slice(0, startIndex).trimEnd() + '\n';
}

/**
 * Add privilege metadata to exported functions in the endpoints file.
 *
 * Transforms:
 *   export const getUpdateService = (...) => { ... };
 *
 * To:
 *   export const getUpdateService = (...) => { ... };
 *   getUpdateService.privilegeMetadata = { entity: 'UpdateService', method: 'GET' };
 */
function addPrivilegeMetadata(content: string): string {
  const lines = content.split('\n');
  const output: string[] = [];

  // Track function declarations we've seen
  const functionDeclarations: Array<{ name: string; lineIndex: number }> = [];

  // Find all exported function declarations
  const exportPattern =
    /^export const (\w+) = (?:\([^)]*\)|async \([^)]*\)|\<[^>]+\>\([^)]*\)) =>/;
  const simpleExportPattern = /^export const (\w+) = \(/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    output.push(line);

    // Check for function export
    let match = line.match(exportPattern);
    if (!match) {
      match = line.match(simpleExportPattern);
    }

    if (match) {
      const fnName = match[1];

      // Only process actual endpoint functions (start with HTTP method prefixes)
      // Skip helper functions that aren't API endpoints:
      // - get*QueryKey, get*QueryOptions (query key/options helpers)
      // - get*MutationOptions (mutation options helpers)
      const isHelperFunction =
        /QueryKey$/.test(fnName) ||
        /QueryOptions$/.test(fnName) ||
        /MutationOptions$/.test(fnName);

      if (/^(get|post|patch|put|delete)[A-Z]/.test(fnName) && !isHelperFunction) {
        functionDeclarations.push({ name: fnName, lineIndex: output.length - 1 });
      }
    }
  }

  // Now add metadata after the function declarations
  // We need to find the closing of each function and add metadata there
  // For simplicity, we'll add a metadata assignment after the generated file's exports

  if (functionDeclarations.length > 0) {
    output.push('');
    output.push('// ========== Privilege Metadata (auto-generated) ==========');
    output.push('// This metadata enables runtime privilege checking.');
    output.push('// Generated from endpoint function names.');
    output.push('');

    for (const { name } of functionDeclarations) {
      const parsed = parseEndpointName(name);
      if (parsed) {
        output.push(
          `Object.defineProperty(${name}, 'privilegeMetadata', { value: { entity: '${parsed.entity}', method: '${parsed.method}' }, writable: false });`,
        );
      }
    }
  }

  return output.join('\n');
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  console.log('Adding privilege metadata to endpoint functions...');

  // Process redfish.gen.ts
  if (existsSync(ENDPOINTS_FILE)) {
    console.log(`  Processing: ${ENDPOINTS_FILE}`);
    const content = readFileSync(ENDPOINTS_FILE, 'utf-8');

    const stripped = stripPrivilegeMetadata(content);
    const updated = addPrivilegeMetadata(stripped);
    writeFileSync(ENDPOINTS_FILE, updated, 'utf-8');
    console.log('  ✓ Added privilege metadata to redfish.gen.ts');
  } else {
    console.log(`  ⚠ File not found: ${ENDPOINTS_FILE}`);
  }

  // Process redfish.dist.ts if it exists
  if (existsSync(DIST_ENDPOINTS_FILE)) {
    console.log(`  Processing: ${DIST_ENDPOINTS_FILE}`);
    const content = readFileSync(DIST_ENDPOINTS_FILE, 'utf-8');

    const stripped = stripPrivilegeMetadata(content);
    const updated = addPrivilegeMetadata(stripped);
    writeFileSync(DIST_ENDPOINTS_FILE, updated, 'utf-8');
    console.log('  ✓ Added privilege metadata to redfish.dist.ts');
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error('Error adding privilege metadata:', err);
  process.exit(1);
});
