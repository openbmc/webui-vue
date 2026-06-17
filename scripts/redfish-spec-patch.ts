/**
 * Spec-patching helpers for the DMTF Redfish OpenAPI document.
 *
 * Redfish ships a single multi-schema bundle that needs a handful of light
 * transforms before it can produce a clean TypeScript client:
 *
 *  - Versioned schema names (`Foo_v1_2_3_Foo`) collapse to `Foo`.
 *  - Dangling `$ref`s left behind by `$RefParser.bundle()` get filled with
 *    empty stubs so generation does not blow up.
 *  - The well-known Redfish query parameters (`$expand`, `$select`, …) are
 *    injected into every Redfish `GET` so the SDK signatures expose them.
 *  - Most paths have no `operationId`, so we synthesise an Orval-style name
 *    from the path itself (e.g. `getSystemById`).
 */

import pluralize from 'pluralize';

export type RedfishQueryParameter = {
  description: string;
  key: string;
  schema?: Record<string, unknown>;
};

export const REDFISH_QUERY_PARAMETERS: ReadonlyArray<RedfishQueryParameter> = [
  {
    description: 'Expand related resources per OData URL conventions.',
    key: '$expand',
  },
  {
    description: 'Select a subset of properties to include in the response.',
    key: '$select',
  },
  {
    description: 'Filter collection members using an OData filter expression.',
    key: '$filter',
  },
  {
    description: 'Limit the number of collection members returned.',
    key: '$top',
    schema: { minimum: 0, type: 'integer' },
  },
  {
    description: 'Skip a number of collection members before returning results.',
    key: '$skip',
    schema: { minimum: 0, type: 'integer' },
  },
  {
    description: 'Redfish query option to request only selected payload sections.',
    key: 'only',
  },
  {
    description: 'Redfish query option to request an excerpted payload.',
    key: 'excerpt',
  },
  {
    description: 'Include origin-of-condition data when returning condition information.',
    key: 'includeoriginofcondition',
  },
];

export function redfishParameterName(paramName: string): string {
  return `RedfishQueryParam_${paramName.replace(/[^A-Za-z0-9]/g, '_')}`;
}

export function patchDanglingSchemaRefs(spec: Record<string, unknown>): void {
  const components = (spec.components ??= {}) as Record<string, unknown>;
  const schemas = (components.schemas ??= {}) as Record<string, unknown>;
  const visited = new WeakSet<object>();
  let patched = 0;

  function walk(node: unknown): void {
    if (!node || typeof node !== 'object') return;
    if (visited.has(node as object)) return;
    visited.add(node as object);

    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }

    const obj = node as Record<string, unknown>;
    const ref = obj.$ref;

    if (typeof ref === 'string') {
      if (ref.startsWith('#/components/schemas/')) {
        const name = ref.slice('#/components/schemas/'.length);
        if (!(name in schemas)) {
          schemas[name] = { type: 'object' };
          patched++;
        }
      } else if (!ref.startsWith('#')) {
        // Any external $ref (absolute `http(s)://…` or a relative document path
        // like `Sensor.yaml#/components/schemas/…`) that survives bundling is
        // unresolvable at generation time. $RefParser.bundle() logs "Skipping
        // unresolvable $ref" for some chained external refs (e.g. Redfish 2026.1
        // Sensor excerpt stubs) but leaves the $ref in place; the parser then
        // hard-fails on full generation. Inline-stub them the same way we handle
        // dangling internals. Internal non-schema refs (`#/components/…`) start
        // with `#` and are left untouched so they keep resolving.
        // See hey-api/openapi-ts#3412 (sibling hoisting) and the bundle-vs-parse
        // follow-on for Redfish 2026.1; DMTF/Redfish-Tools#534 (Sensor excerpt chain).
        delete obj.$ref;
        obj.type = 'object';
        patched++;
      }
    }

    for (const value of Object.values(obj)) walk(value);
  }

  walk(spec);

  if (patched > 0) {
    console.log(
      `[openapi-ts] patched ${patched} dangling or external $ref(s) with empty object stubs`,
    );
  }
}

/**
 * The DMTF Redfish schema marks `UserName`, `Password`, and `Token` on the
 * `Session` resource as `readonly`, which causes openapi-ts to strip them
 * from the generated `SessionWritable` request-body type. Drop the `readOnly`
 * flag on Session schema versions so generated types match the login flow.
 */
export function unlockSessionLoginFields(spec: Record<string, unknown>): void {
  const components = (spec.components as Record<string, unknown> | undefined) ?? {};
  const schemas = components.schemas as Record<string, unknown> | undefined;
  if (!schemas) return;

  const loginFields = new Set(['UserName', 'Password', 'Token']);

  for (const [name, value] of Object.entries(schemas)) {
    if (!name.startsWith('Session_v')) continue;
    if (!value || typeof value !== 'object') continue;

    const properties = (value as { properties?: Record<string, unknown> }).properties;
    if (!properties) continue;

    for (const field of loginFields) {
      const prop = properties[field];
      if (prop && typeof prop === 'object' && 'readOnly' in prop) {
        delete (prop as Record<string, unknown>).readOnly;
      }
    }
  }
}

export function stampVersionedSchemaDescriptions(spec: Record<string, unknown>): void {
  const components = (spec.components as Record<string, unknown> | undefined) ?? {};
  const schemas = components.schemas as Record<string, unknown> | undefined;
  if (!schemas) return;

  for (const [key, value] of Object.entries(schemas)) {
    const match = key.match(/_v(\d+)_(\d+)_(\d+)_/);
    if (!match || typeof value !== 'object' || value === null) continue;

    const schema = value as Record<string, unknown>;
    const version = `${match[1]}.${match[2]}.${match[3]}`;
    const existing = typeof schema.description === 'string' ? schema.description : '';
    schema.description = existing ? `${existing}\n@version ${version}` : `@version ${version}`;
  }
}

/**
 * Build an Orval-style operation name from a Redfish path.
 */
export function buildOperationName(pathKey: string): string {
  if (/^\/redfish\/v1\/?$/.test(pathKey)) return 'ServiceRoot';

  const segments = pathKey
    .replace(/^\/redfish\/v1\//, '')
    .replace(/\/Actions\/[\w\d]*\.*(\w+)$/, '/$1')
    .split('/');

  const parts: string[] = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    const isParam = seg.startsWith('{') && seg.endsWith('}');
    const isLast = i === segments.length - 1;

    if (isParam && isLast) {
      parts.push('ById');
    } else if (isParam) {
      // intermediate path params are dropped; preceding segment is singularised.
    } else {
      const nextIsParam = segments[i + 1]?.startsWith('{');
      parts.push(nextIsParam ? pluralize.singular(seg) : seg);
    }
  }

  return parts.join('');
}

/** Collapse versioned Redfish schema names like `Foo_v1_2_3_Foo` into `Foo`. */
export function cleanSchemaName(name: string): string {
  let clean = name;
  let prev: string;
  do {
    prev = clean;
    clean = clean.replace(
      /([A-Za-z\d]+)_v\d+_\d+_\d+_([A-Za-z\d]*)/g,
      (_, p1: string, p2: string) => (p2.startsWith(p1) ? p2 : p1 + p2),
    );
  } while (clean !== prev);

  const collapsed = clean.match(/^([A-Za-z\d]+)_\1([A-Za-z\d]*)$/);
  return collapsed ? collapsed[1]! + collapsed[2]! : clean;
}
