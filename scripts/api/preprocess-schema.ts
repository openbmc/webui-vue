import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, '../../src/api/schema/openapi.json');
const outputPath = path.join(__dirname, '../../src/api/schema/openapi.processed.json');

/** Regex to match version markers like _v1_8_1_ */
const VERSION_REGEX = /_v(\d+)_(\d+)_(\d+)_/g;

/**
 * Fix Redfish's nullable pattern: { "enum": [null] }
 * This pattern in oneOf/anyOf causes Orval to generate broken types like "Type | "
 * Convert to proper nullable: { "type": "null" }
 */
function fixNullEnums(obj: any): void {
  if (obj === null || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      fixNullEnums(item);
    }
    return;
  }

  // Check for oneOf/anyOf arrays containing { "enum": [null] }
  for (const key of ['oneOf', 'anyOf']) {
    if (Array.isArray(obj[key])) {
      obj[key] = obj[key].map((item: any) => {
        // Replace { "enum": [null] } with { "type": "null" }
        if (
          item &&
          typeof item === 'object' &&
          Array.isArray(item.enum) &&
          item.enum.length === 1 &&
          item.enum[0] === null
        ) {
          return { type: 'null' };
        }
        return item;
      });
    }
  }

  // Recurse into nested objects
  for (const value of Object.values(obj)) {
    fixNullEnums(value);
  }
}

/**
 * Strip version markers and de-duplicate adjacent parts.
 */
function stripVersion(value: string): string {
  const dupeRegex = /([A-Za-z\d]+)_v\d+_\d+_\d+_([A-Za-z\d]*)/g;

  return value.replace(dupeRegex, (_match, p1: string, p2: string) => {
    if (p2.startsWith(p1)) {
      return p2;
    }
    return p1 + p2;
  });
}

/**
 * Remove duplicate prefix patterns from a name.
 * Handles both underscore-separated and direct duplicates:
 *
 * - "SecureBootDatabaseCollection_SecureBootDatabaseCollection"
 *    -> "SecureBootDatabaseCollection"
 * - "SecureBootDatabaseCollection_SecureBootDatabaseCollectionDescription"
 *    -> "SecureBootDatabaseCollectionDescription"
 * - "ResourceResource" -> "Resource" (direct duplicate)
 */
function deduplicatePrefix(name: string): string {
  // Pattern 1: Handle underscore-separated duplicates like "Name_Name" or "Name_NameSuffix"
  const underscoreMatch = name.match(/^([A-Za-z\d]+)_\1([A-Za-z\d]*)$/);
  if (underscoreMatch) {
    const [, prefix, suffix] = underscoreMatch;
    // Return "Name" or "NameSuffix"
    return prefix + suffix;
  }

  // Pattern 2: Handle direct duplicates (no underscore) like "ResourceResource"
  for (let len = 4; len <= name.length / 2; len++) {
    const prefix = name.substring(0, len);
    const rest = name.substring(len);

    // Check if the rest starts with the same prefix
    if (rest.startsWith(prefix)) {
      // Found duplicate prefix, return without the first occurrence
      return rest;
    }
  }

  return name;
}

/**
 * Extract version from a schema name.
 */
function extractVersion(name: string): string | null {
  const match = name.match(/_v(\d+)_(\d+)_(\d+)_/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}`;
  }
  return null;
}

/**
 * Build a mapping of old names to new (deduplicated) names,
 * avoiding collisions.
 */
function buildDeduplicationMap(schemaNames: string[]): Map<string, string> {
  const nameMap = new Map<string, string>();
  const usedNames = new Set<string>();

  // First pass: try to deduplicate each name
  for (const name of schemaNames) {
    const dedupedName = deduplicatePrefix(name);

    if (dedupedName !== name && !usedNames.has(dedupedName)) {
      // Successfully deduplicated and no collision
      nameMap.set(name, dedupedName);
      usedNames.add(dedupedName);
    } else {
      // Keep original name
      nameMap.set(name, name);
      usedNames.add(name);
    }
  }

  return nameMap;
}

async function main(): Promise<void> {
  console.log('Reading schema...');
  const content = fs.readFileSync(schemaPath, 'utf-8');

  console.log('Parsing JSON...');
  const schema = JSON.parse(content);

  // 1. Fix { "enum": [null] } patterns that break Orval
  console.log('Fixing null enum patterns...');
  fixNullEnums(schema);

  // 2. Add version annotations to schema descriptions
  console.log('Adding version annotations...');
  if (schema?.components?.schemas) {
    for (const [key, value] of Object.entries(schema.components.schemas)) {
      const version = extractVersion(key);
      if (version && typeof value === 'object' && value !== null) {
        const schemaObj = value as Record<string, any>;
        const existingDesc = schemaObj.description || '';
        schemaObj.description = existingDesc
          ? `${existingDesc}\n@version ${version}`
          : `@version ${version}`;
      }
    }
  }

  // 2. Convert to string and replace all version markers in values
  console.log('Stripping version markers from values...');
  let jsonStr = JSON.stringify(schema);

  // Replace version markers in $ref and other string values
  jsonStr = jsonStr.replace(
    /([A-Za-z\d]+)_v\d+_\d+_\d+_([A-Za-z\d]*)/g,
    (_match, p1: string, p2: string) => {
      if (p2.startsWith(p1)) {
        return p2;
      }
      return p1 + p2;
    },
  );

  // 3. Parse back and fix schema keys
  console.log('Fixing schema keys...');
  let processed = JSON.parse(jsonStr);

  if (processed?.components?.schemas) {
    const oldSchemas = processed.components.schemas;
    let newSchemas: Record<string, any> = {};

    // First pass: strip version markers from keys
    for (const [key, value] of Object.entries(oldSchemas)) {
      const newKey = stripVersion(key);
      newSchemas[newKey] = value;
    }

    // 4. De-duplicate repeated prefixes in schema names
    console.log('De-duplicating schema names...');
    const schemaNames = Object.keys(newSchemas);
    const dedupeMap = buildDeduplicationMap(schemaNames);

    // Count how many names were deduplicated
    let dedupedCount = 0;
    for (const [oldName, newName] of dedupeMap) {
      if (oldName !== newName) dedupedCount++;
    }
    console.log(`  De-duplicated ${dedupedCount} schema names`);

    // Apply deduplication to schema keys
    const dedupedSchemas: Record<string, any> = {};
    for (const [key, value] of Object.entries(newSchemas)) {
      const newKey = dedupeMap.get(key) || key;
      dedupedSchemas[newKey] = value;
    }

    processed.components.schemas = dedupedSchemas;

    // 5. Update $ref values to use deduplicated names
    console.log('Updating $ref values...');
    let processedStr = JSON.stringify(processed);

    for (const [oldName, newName] of dedupeMap) {
      if (oldName !== newName) {
        // Replace in $ref paths
        const oldRef = `#/components/schemas/${oldName}`;
        const newRef = `#/components/schemas/${newName}`;
        processedStr = processedStr.split(oldRef).join(newRef);
      }
    }

    processed = JSON.parse(processedStr);
  }

  // 6. Write output
  console.log('Writing processed schema...');
  fs.writeFileSync(outputPath, JSON.stringify(processed));

  console.log(`Processed schema written to ${outputPath}`);
}

void main();
