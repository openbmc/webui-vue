# API Client

This project uses [Orval](https://orval.dev/) to generate a type-safe API client
from the OpenAPI (Redfish) schema. The generated client integrates with
[Vue Query](https://tanstack.com/query/latest/docs/vue/overview) for automatic
caching, loading states, and error handling.

## Two Build Paths

The API client supports two build paths to balance developer experience with
CI/CD efficiency:

### Path 1: Full Generation (Development)

Developers who need to work with new or uncommitted API endpoints generate the
complete API client locally. This provides full IDE visibility of all available
endpoints.

```sh
# Download and bundle the OpenAPI schema
npm run schema:download && npm run schema:bundle

# Generate the full API client (takes 2-5 minutes)
npm run generate-api
```

This creates:

| File/Directory                          | Size        | Description                                |
| --------------------------------------- | ----------- | ------------------------------------------ |
| `src/api/schema/openapi.yaml`           | ~5.6 MB     | Downloaded OpenAPI schema from DMTF        |
| `src/api/schema/openapi.json`           | ~12 MB      | Bundled JSON schema                        |
| `src/api/schema/openapi.processed.json` | ~7 MB       | Preprocessed schema for Orval              |
| `src/api/endpoints/redfish.gen.ts`      | ~24 MB      | Full endpoints file (~775K lines)          |
| `src/api/model/*.ts`                    | ~1800 files | TypeScript types for all Redfish resources |
| `src/api/index.ts`                      | -           | Barrel export file                         |

**Note:** These files are in `.gitignore` and are not committed.

### Path 2: Minimal Dist (CI/Production)

CI builds and developers who don't need new endpoints use pre-committed minimal
files that contain only the endpoints and models actually used by the
application.

```sh
# No API generation needed - just install and build
npm install
npm run build
```

This uses:

- `src/api/endpoints/redfish.dist.ts` - Minimal endpoints file (~20 KB source)
- `src/api/model/*.ts` - Used model types (optional, for IDE support)

**Note:** Model files use `import type` syntax which is erased at compile time.
Builds succeed without model files - they're committed only for IDE type hints
and optional `tsc --noEmit` type checking in CI.

## File Structure

```sh
src/api/
├── index.ts                # Barrel export (gitignored - DO NOT USE)
├── endpoints/
│   ├── redfish.gen.ts      # Full generated file (gitignored, dev only)
│   └── redfish.dist.ts     # Minimal file (committed)
├── model/
│   ├── index.ts            # Model barrel (gitignored - DO NOT USE)
│   ├── AccountService.ts   # Used model (committed, optional for builds)
│   └── *.ts                # Other models (gitignored)
├── mutator/
│   └── axios-instance.ts   # Custom Axios instance with caching
├── operation-name/
│   └── operationName.ts    # Custom operation name transformer
└── schema/
    ├── openapi.yaml        # Downloaded schema (gitignored)
    └── openapi.json        # Bundled schema (gitignored)
```

**Important notes:**

1. **Barrel exports** (`index.ts` files) are gitignored and only work in
   development. Always use explicit import paths.

2. **Model files** are committed for IDE type support but are **not required for
   builds** - `import type` statements are erased at compile time.

3. **Gitignore pattern:** Uses `src/api/model/*` (not `src/api/model/`) to allow
   file-level exceptions like `!src/api/model/AccountService.ts`.

## How It Works

### Vite Alias Resolution

Vite automatically resolves imports based on the build mode:

- **Production build:** `@/api/endpoints/redfish.gen` → `redfish.dist.ts`
- **Development (full file exists):** `@/api/endpoints/redfish.gen` →
  `redfish.gen.ts`
- **Development (no full file):** Falls back to `redfish.dist.ts`

This means your imports always use the same path:

```ts
import { useGetAccountService } from '@/api/endpoints/redfish.gen';
```

### Pre-commit Hook

When you commit changes, the pre-commit hook automatically:

1. Runs ESLint on staged files
2. Scans source files for API imports
3. Regenerates `redfish.dist.ts` with only used endpoints
4. Updates `.gitignore` to un-ignore used model files
5. Stages all changes

This ensures the committed dist files always match actual usage.

## Adding New API Endpoints

### Step 1: Generate Full API (if not already done)

```sh
npm run schema:download && npm run schema:bundle && npm run generate-api
```

### Step 2: Import and Use the Endpoint

**Important:** Always use explicit import paths, not the barrel export:

```ts
// ✅ Correct - explicit paths work in both dev and production
import { useGetSomething } from '@/api/endpoints/redfish.gen';
import type { Something } from '@/api/model/Something';

// ❌ Wrong - barrel export only works in development
import { useGetSomething, Something } from '@/api';
```

```vue
<script setup lang="ts">
import {
  useGetSomething,
  usePatchSomething,
} from '@/api/endpoints/redfish.gen';
import type { Something } from '@/api/model/Something';

// Query - automatic caching and loading states
const { data, isLoading, error } = useGetSomething();

// Mutation - for POST/PATCH/DELETE operations
const mutation = usePatchSomething();
</script>
```

### Step 3: Commit Your Changes

The pre-commit hook will automatically:

- Add the new endpoints to `redfish.dist.ts`
- Add `!src/api/model/Something.ts` to `.gitignore`
- Stage the updated files

## Available Scripts

| Script                      | Description                              |
| --------------------------- | ---------------------------------------- |
| `npm run schema:download`   | Download latest OpenAPI schema from DMTF |
| `npm run schema:bundle`     | Bundle YAML schema into JSON             |
| `npm run generate-api`      | Generate full API client from schema     |
| `npm run generate-api:dist` | Generate minimal dist file from usage    |
| `npm run check-api`         | Verify required API files exist          |

## Example Usage

### Query (GET requests)

```ts
import { useGetAccountService } from '@/api/endpoints/redfish.gen';

// Returns reactive refs for data, loading, and error states
const { data, isLoading, isRefetching, error, refetch } =
  useGetAccountService();
```

### Mutation (PATCH/POST/DELETE requests)

The generated API provides both raw functions and Vue Query hooks for mutations.

**Raw function** - Direct API call, you handle loading/error states:

```ts
import { patchAccountService } from '@/api/endpoints/redfish.gen';
import type { AccountService } from '@/api/model/AccountService';

async function save() {
  await patchAccountService({ AccountLockoutThreshold: 5 } as AccountService);
}
```

**Vue Query hook** - Provides reactive `isPending`, `isError`, `isSuccess`
states and automatic retry/error handling:

```ts
import { usePatchAccountService } from '@/api/endpoints/redfish.gen';
import type { AccountService } from '@/api/model/AccountService';

const updateAccountService = usePatchAccountService();

// Check state reactively
const isSaving = updateAccountService.isPending;

// Execute the mutation
async function save() {
  await updateAccountService.mutateAsync({
    data: { AccountLockoutThreshold: 5 } as AccountService,
  });
}
```

### Cache Invalidation

```ts
import { useQueryClient } from '@tanstack/vue-query';
import { getGetAccountServiceQueryKey } from '@/api/endpoints/redfish.gen';

const queryClient = useQueryClient();

// Invalidate cache after mutation
queryClient.invalidateQueries({ queryKey: getGetAccountServiceQueryKey() });
```

## Troubleshooting

### "MISSING SCHEMA FILES" Error

```sh
npm run schema:download && npm run schema:bundle
```

### "Full endpoints file not found" Error

This is expected in CI or when you haven't generated the full API. The build
will use `redfish.dist.ts` instead.

### Import Not Found in IDE

If your IDE shows import errors for `@/api/endpoints/redfish.gen`:

1. Ensure you've run `npm run generate-api` locally
2. Or the endpoint may not be in `redfish.dist.ts` yet (add and commit to
   include it)

### "Cannot find module '@/api'" in Production

The barrel export (`@/api` or `@/api/index.ts`) is **development-only** and not
committed. Always use explicit import paths:

```ts
// Use this:
import { useGetAccountService } from '@/api/endpoints/redfish.gen';
import type { AccountService } from '@/api/model/AccountService';

// Not this:
import { useGetAccountService, AccountService } from '@/api';
```

### Pre-commit Hook Skipped

The hook only runs `generate-api:dist` if `redfish.gen.ts` exists. This is
intentional - CI environments don't have the full file and don't need to
regenerate.

## Architecture Rationale

This dual-path approach optimizes for:

1. **Developer Experience:** Full API visibility in IDE during development
2. **CI Speed:** No 5-minute generation step in CI pipelines
3. **Bundle Size:** Production uses tree-shaken minimal file
4. **Embedded Systems:** Small footprint for resource-constrained BMC targets
