import { defineConfig } from '@hey-api/openapi-ts';

import {
  buildOperationName,
  cleanSchemaName,
  patchDanglingSchemaRefs,
  REDFISH_QUERY_PARAMETERS,
  redfishParameterName,
  stampVersionedSchemaDescriptions,
  unlockSessionLoginFields,
} from './scripts/redfish-spec-patch';

/**
 * `@hey-api/openapi-ts` configuration for the Redfish BMC client.
 *
 * Two outputs — pick via `REDFISH_SCOPE`:
 *
 * | Command                 | `REDFISH_SCOPE` | Output dir         | Tracked? |
 * |-------------------------|-----------------|--------------------|----------|
 * | `npm run openapi-ts:scoped` | `scoped`    | `src/client/`      | Change 2+ (gitignored until then) |
 * | `npm run openapi-ts:full`   | (unset)     | `src/client.full/` | no       |
 *
 * `SCOPED_OPERATIONS` is populated in Change 2+. Until then, `openapi-ts:scoped`
 * fails fast so an unfiltered spec is not written to `src/client/`.
 * CI/build never runs codegen; only developers run `openapi-ts:*` locally.
 *
 * Once `src/client/` is committed (Change 2+), cold CI typecheck dominates
 * build time. Use `npm run build:ci` (golar ∥ vite) in Jenkins instead of
 * `npm run build`; keep `npm run typecheck` (`vue-tsc`) for local dev. See
 * `docs/guide/openapi-typecheck-ci.md`.
 *
 * Default input is local `./specs/redfish.yaml` (run `npm run fetch-spec` or
 * copy a bundled/vendored Redfish OpenAPI YAML there). Override with
 * `REDFISH_OPENAPI_INPUT` to point codegen at another local YAML path or URL.
 * `npm run openapi-ts:fetch` runs fetch-spec and then openapi-ts:full.
 * Fetch stays its own script so a vendored YAML can be copied without
 * generating, and so scoped vs full stays a separate choice.
 *
 * Codegen is not a pre-commit hook and not a CI step. The Redfish-first
 * design keeps today's CI on lint, unit tests, and `npm run build`.
 * Fetching DMTF main on every commit would make the tree depend on the
 * network and on whatever upstream published that minute. Regenerate
 * on purpose when the spec input should change. `npm run build:ci` is
 * the later typecheck split, once Change 2 commits `src/client/`.
 * https://gerrit.openbmc.org/c/openbmc/webui-vue/+/94472
 *
 * `src/client.full/` is the unfiltered local tree (gitignored). Change 2
 * commits the scoped `src/client/` tree. Views bind Redfish names from
 * those types; they do not remap into camelCase. That contract is the
 * same design. A full-client call looks like:
 *
 *   import { client } from '@/client.full/client.gen';
 *   import { getSystemById } from '@/client.full/sdk.gen';
 *   import type { ComputerSystem } from '@/client.full/types.gen';
 *
 *   client.setConfig({ baseURL: '' });
 *   const { data: ComputerSystem } = await getSystemById({
 *     path: { ComputerSystemId: 'system' },
 *   });
 *   ComputerSystem?.PowerState;
 */

/**
 * Allow-list of Redfish operations emitted into `src/client/` for the scoped
 * build. Intentionally empty in Change 1 — it is populated in Change 2+.
 *
 * While empty, two things are inert by design:
 *  - the `isScoped` guard below throws before any scoped generation runs, and
 *  - the `parser.filters` spread (`isScoped && SCOPED_OPERATIONS.length > 0`)
 *    is statically unreachable, so no `filters` block is applied yet.
 * Both come alive automatically once this array has entries.
 */
const SCOPED_OPERATIONS = [] as const;

const isScoped = process.env.REDFISH_SCOPE === 'scoped';

if (isScoped && SCOPED_OPERATIONS.length === 0) {
  throw new Error(
    '[openapi-ts] REDFISH_SCOPE=scoped but SCOPED_OPERATIONS is empty. ' +
      'Populate SCOPED_OPERATIONS in openapi-ts.config.ts (Change 2) before running ' +
      'npm run openapi-ts:scoped. Use npm run openapi-ts:full for unfiltered output.',
  );
}

export default defineConfig({
  input: process.env.REDFISH_OPENAPI_INPUT || './specs/redfish.yaml',
  logs: {
    level: 'info',
  },
  output: {
    indexFile: false,
    path: isScoped ? 'src/client' : 'src/client.full',
  },
  parser: {
    // Inert until SCOPED_OPERATIONS is populated (Change 2+): with an empty
    // allow-list this spread evaluates to `false` and contributes no `filters`.
    ...(isScoped &&
      SCOPED_OPERATIONS.length > 0 && {
        filters: {
          operations: {
            include: [...SCOPED_OPERATIONS],
          },
        },
      }),
    patch: {
      input: (spec) => {
        const s = spec as unknown as Record<string, unknown>;
        patchDanglingSchemaRefs(s);
        stampVersionedSchemaDescriptions(s);
        unlockSessionLoginFields(s);
        injectRedfishQueryParameters(s);
        s.servers = [{ url: '' }];
      },
      operations: (method, path, operation) => {
        if (!operation.operationId) {
          operation.operationId = method + buildOperationName(path);
        }
      },
    },
    transforms: {
      schemaName: cleanSchemaName,
    },
  },
  plugins: [
    '@hey-api/client-axios',
    '@hey-api/sdk',
    {
      enums: 'javascript',
      name: '@hey-api/typescript',
    },
    '@tanstack/vue-query',
  ],
});

function injectRedfishQueryParameters(spec: Record<string, unknown>): void {
  const components = (spec.components ??= {}) as Record<string, unknown>;
  const parameters = (components.parameters ??= {}) as Record<string, unknown>;
  const paths = (spec.paths ??= {}) as Record<string, unknown>;

  for (const rp of REDFISH_QUERY_PARAMETERS) {
    parameters[redfishParameterName(rp.key)] = {
      description: rp.description,
      in: 'query',
      name: rp.key,
      required: false,
      schema: rp.schema ?? { type: 'string' },
    };
  }

  for (const [pathKey, pathItem] of Object.entries(paths)) {
    if (!pathKey.startsWith('/redfish/v1') || pathKey.includes('$metadata')) continue;
    if (!pathItem || typeof pathItem !== 'object') continue;
    const getOp = (pathItem as Record<string, unknown>).get as
      | { parameters?: Array<Record<string, unknown>> }
      | undefined;
    if (!getOp) continue;
    getOp.parameters ??= [];

    for (const rp of REDFISH_QUERY_PARAMETERS) {
      const componentName = redfishParameterName(rp.key);
      const exists = getOp.parameters.some(
        (p) =>
          (p?.in === 'query' && p?.name === rp.key) ||
          (typeof p?.$ref === 'string' && (p.$ref as string).endsWith(`/${componentName}`)),
      );
      if (!exists) {
        getOp.parameters.push({ $ref: `#/components/parameters/${componentName}` });
      }
    }
  }
}
