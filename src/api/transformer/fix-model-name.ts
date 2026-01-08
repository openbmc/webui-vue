/**
 * Orval transformer: remove embedded version markers from schema keys and string values,
 * de-duplicate adjacent name parts, and ensure schema names start with capital letters.
 * Example: "Certificate_v1_8_1_Certificate" => "CertificateCertificate" => "Certificate".
 *   - Model name becomes "Certificate"
 *   - Version "1.8.1" is extracted and added to the model as
 *     @version 1.8.1
 */

/** Regex to match version markers like _v1_8_1_ */
const VERSION_REGEX = /_v(\d+)_(\d+)_(\d+)_/;

/**
 * Extract version string from a schema name.
 * @param name Schema name like "Certificate_v1_8_1_Certificate"
 * @returns Version string like "1.8.1" or null if not found
 */
function extractVersion(name: string): string | null {
  const match = name.match(VERSION_REGEX);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}`;
  }
  return null;
}

export default function fixModelName<TSchema extends Record<string, unknown>>(
  inputSchema: TSchema,
): TSchema {
  /**
   * Extract versions from schema names and inject into descriptions.
   * This adds @Redfish.version JSDoc annotation to each schema.
   */
  function injectVersionsIntoSchemas(schema: any): any {
    if (!schema?.components?.schemas) return schema;

    const schemas = schema.components.schemas;
    const newSchemas: Record<string, any> = {};

    for (const [key, value] of Object.entries(schemas)) {
      const version = extractVersion(key);
      if (version && typeof value === "object" && value !== null) {
        const schemaObj = value as Record<string, any>;
        const existingDesc = schemaObj.description || "";
        // Append version annotation to description
        // Using inline format since Orval doesn't add JSDoc prefixes for multi-line
        newSchemas[key] = {
          ...schemaObj,
          description: existingDesc
            ? `${existingDesc}\n@version ${version}`
            : `@version ${version}`,
        };
      } else {
        newSchemas[key] = value;
      }
    }

    return {
      ...schema,
      components: {
        ...schema.components,
        schemas: newSchemas,
      },
    };
  }

  /**
   * Strip version markers and de-duplicate adjacent parts.
   * Handles both schema names and $ref paths.
   */
  function stripVersion(value: string): string {
    // Pattern to match version markers with preceding name part that may be duplicated after
    // e.g., "Certificate_v1_8_1_Certificate" -> "Certificate"
    const dupeRegex = /([A-Za-z\d]+)_v\d+_\d+_\d+_([A-Za-z\d]*)/g;

    return value.replace(dupeRegex, (_match, p1: string, p2: string) => {
      // If the text after version starts with the same text before version, skip the first part
      if (p2.startsWith(p1)) {
        return p2;
      }
      // Otherwise keep both parts
      return p1 + p2;
    });
  }

  /**
   * Recursively process all values in the schema using JSON serialization.
   * This avoids stack overflow from deep recursion.
   */
  function replaceAll(regex: RegExp, replaceWith: string, target: any): any {
    // Use JSON.stringify with a replacer to transform strings
    const jsonStr = JSON.stringify(target, (key, value) => {
      if (typeof value === "string" && regex.test(value)) {
        return stripVersion(value);
      }
      return value;
    });

    // Parse back and also fix object keys
    const parsed = JSON.parse(jsonStr);

    // Now we need to fix object keys - do a shallow pass on components.schemas
    if (parsed?.components?.schemas) {
      const oldSchemas = parsed.components.schemas;
      const newSchemas: Record<string, any> = {};

      for (const [key, value] of Object.entries(oldSchemas)) {
        const newKey = stripVersion(key);
        newSchemas[newKey] = value;
      }

      parsed.components.schemas = newSchemas;
    }

    return parsed;
  }

  // 1. Extract versions and inject into schema descriptions (before stripping)
  const withVersions = injectVersionsIntoSchemas(inputSchema);

  // 2. Strip version markers like _v1_2_3_ from names
  return replaceAll(/_v\d+_\d+_\d+_/g, "", withVersions);
}
