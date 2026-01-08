import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, '../../src/api/schema/openapi.json');
const outputPath = path.join(__dirname, '../../src/api/schema/openapi.processed.json');

/**
 * Fix x-enumDescriptions format for Orval compatibility.
 *
 * Redfish uses object format: { "Value1": "Description1", "Value2": "Description2" }
 * Orval 7.18+ expects array format: ["Description1", "Description2"]
 *
 * This converts the object format to array format, ordered by the enum values.
 */
function fixEnumDescriptions(obj: any): void {
  if (obj === null || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      fixEnumDescriptions(item);
    }
    return;
  }

  // Check for x-enumDescriptions or x-enumLongDescriptions that are objects
  for (const key of ['x-enumDescriptions', 'x-enumLongDescriptions']) {
    if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      // If we have an enum array, convert descriptions to match order
      if (Array.isArray(obj.enum)) {
        const descMap = obj[key] as Record<string, string>;
        obj[key] = obj.enum.map((enumVal: any) => {
          // Convert to string for object key lookup (handles numbers, etc.)
          const enumKey = String(enumVal);
          return descMap[enumKey] || '';
        });
      } else {
        // No enum array to match, just convert to array of values
        obj[key] = Object.values(obj[key]);
      }
    }
  }

  // Recurse into nested objects
  for (const value of Object.values(obj)) {
    fixEnumDescriptions(value);
  }
}

/**
 * Check if a schema item represents null (either { "enum": [null] } or { "type": "null" })
 */
function isNullSchema(item: any): boolean {
  if (!item || typeof item !== 'object') return false;

  // { "enum": [null] }
  if (Array.isArray(item.enum) && item.enum.length === 1 && item.enum[0] === null) {
    return true;
  }

  // { "type": "null" }
  if (item.type === 'null') {
    return true;
  }

  return false;
}

/**
 * Fix Redfish's nullable patterns for OpenAPI 3.0 / Orval v7 compatibility.
 *
 * ## Background
 * OpenAPI 3.1 uses { "type": "null" } or { "enum": [null] } in oneOf/anyOf.
 * OpenAPI 3.0 (which Orval v7 validates against) uses { "nullable": true } instead.
 * Redfish schemas mix both patterns, causing Orval to emit warnings and generate
 * incorrect types.
 *
 * ## What this function does
 * 1. Removes null schemas from oneOf/anyOf arrays
 * 2. Adds `nullable: true` to the parent schema
 * 3. Simplifies oneOf/anyOf with single remaining item to just that item
 *
 * ## Known limitation: $ref with sibling keywords
 * When collapsing a oneOf/anyOf to a single $ref, we add `nullable: true` as a
 * sibling to $ref. Strictly speaking, OpenAPI 3.0 does not allow sibling keywords
 * with $ref (they're ignored). However:
 *
 * - Orval specifically handles the `nullable` + `$ref` pattern correctly
 * - OpenAPI 3.1 relaxed this restriction, allowing sibling keywords with $ref
 * - Most modern tooling accepts this pattern
 *
 * ## Risk
 * Strict OpenAPI 3.0 validators may reject these schemas. If you encounter issues:
 * - Check if the consuming tool supports OpenAPI 3.1 or the nullable+$ref pattern
 * - Consider wrapping nullable $refs in allOf: [{ $ref: "..." }] if needed
 *
 * @see https://github.com/OAI/OpenAPI-Specification/issues/1368
 */
function fixNullablePatterns(obj: any): void {
  if (obj === null || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      fixNullablePatterns(item);
    }
    return;
  }

  // Process oneOf/anyOf arrays
  for (const key of ['oneOf', 'anyOf']) {
    if (Array.isArray(obj[key])) {
      const hasNullOption = obj[key].some(isNullSchema);

      if (hasNullOption) {
        // Remove null schemas from the array
        obj[key] = obj[key].filter((item: any) => !isNullSchema(item));

        // Mark parent as nullable (OpenAPI 3.0 style)
        obj.nullable = true;

        // If only one item left, unwrap the oneOf/anyOf
        if (obj[key].length === 1) {
          const remaining = obj[key][0];
          delete obj[key];

          // Merge the remaining schema into the parent
          if (remaining.$ref) {
            // Add $ref alongside nullable (see function docs for trade-offs).
            // This produces { "$ref": "...", "nullable": true } which is
            // technically invalid in strict OpenAPI 3.0 but handled by Orval.
            obj.$ref = remaining.$ref;
          } else {
            // For inline schemas, merge all properties (but preserve nullable)
            const { nullable, ...rest } = remaining;
            Object.assign(obj, rest);
          }
        } else if (obj[key].length === 0) {
          // All items were null, remove the empty array
          delete obj[key];
        }
      }
    }
  }

  // Recurse into nested objects
  for (const value of Object.values(obj)) {
    fixNullablePatterns(value);
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

  // Step 1: Fix nullable patterns for OpenAPI 3.0 compatibility (required for Orval v7)
  console.log('Fixing nullable patterns for OpenAPI 3.0...');
  fixNullablePatterns(schema);

  // Step 2: Fix enum descriptions format (Redfish uses objects, Orval expects arrays)
  console.log('Fixing enum descriptions format...');
  fixEnumDescriptions(schema);

  // Step 3: Add version annotations to schema descriptions
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

  // Step 4: Convert to string and replace all version markers in values
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

  // Step 5: Parse back and fix schema keys
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

    // Step 6: De-duplicate repeated prefixes in schema names
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

    // Step 7: Update $ref values to use deduplicated names
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

  // Step 8: Write output
  console.log('Writing processed schema...');
  fs.writeFileSync(outputPath, JSON.stringify(processed));

  console.log(`Processed schema written to ${outputPath}`);
}

void main();
