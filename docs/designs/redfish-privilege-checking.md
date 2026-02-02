# Redfish Privilege Checking for WebUI-Vue

Author: Jason Westover (Discord: jasonwestover)

Other contributors: None

Created: January 27, 2026

## Problem Description

The OpenBMC WebUI-Vue lacks a Redfish-compliant privilege checking system.
Currently, the UI either shows all features to all users or uses a simplistic
role-name comparison that discards all but the first role and doesn't reflect
actual Redfish privileges. This creates a poor user experience where users may
attempt operations they cannot perform, and it doesn't align with the DMTF
Redfish security model.

Goals:

- Implement client-side privilege checking following DMTF PrivilegeRegistry
- Disable/hide UI elements for operations the user cannot perform
- Show meaningful messages indicating which privileges are missing
- Minimize firmware footprint for embedded BMC constraints

Non-goals:

- Server-side privilege enforcement (BMC already does this)

## Background and References

The DMTF Redfish specification defines a privilege-based access control model:

- **Redfish Privilege Model**: Five standard privileges (Login,
  ConfigureManager, ConfigureUsers, ConfigureComponents, ConfigureSelf) control
  access to operations on resources. See: DMTF DSP0266 - Redfish Specification

- **PrivilegeRegistry**: The DMTF publishes a JSON registry mapping Redfish
  entities and HTTP methods to required privileges. Operations use "OR of ANDs"
  logic - user needs ALL privileges in at least ONE privilege set. See:
  https://redfish.dmtf.org/registries/

- **Session-Based Authentication**: Redfish Sessions include a `Roles[]` array.
  Each role's privileges are defined in `/redfish/v1/AccountService/Roles`. See:
  DMTF DSP0266 Section 13 - Security

- **Vue 3 State Management**: Pinia is the official Vue 3 state management
  library, replacing Vuex. Vue Query (TanStack Query) handles server state with
  caching and automatic refresh.

Current WebUI issues:

- Uses Vuex (legacy) with mixed client/server state
- Stores only `Roles[0]` as a string, discarding additional roles
- Checks role names, not actual privileges
- No privilege-to-operation mapping

## Requirements

### Users

- **End Users**: BMC administrators and operators using the web interface
- **Developers**: Engineers adding new pages/features to WebUI-Vue

### Functional Requirements

1. **Privilege Computation**: Combine session roles with AccountService role
   definitions to compute user's actual privileges.

2. **Operation Checking**: Determine if user can perform specific Redfish
   operations (GET/POST/PATCH/DELETE on entities).

3. **Property-Level Granularity**: Support property-specific overrides (e.g.,
   users can change their own password via ConfigureSelf).

4. **Dynamic Endpoints**: Support privilege checks for dynamically discovered
   URIs like `UpdateService.HttpPushUri` for firmware updates.

5. **UI Feedback**: Provide missing privilege information for user-friendly
   error messages.

### Non-Functional Requirements

1. **Firmware Size**: PrivilegeRegistry.json (~1MB) need NOT ship to firmware.
   Only extracted mappings (~5KB) should be bundled. Read-only operations
   (requiring only `Login` privilege) need not be mapped since that is the
   assumed default for authenticated users.

2. **Reactive Updates**: Privilege checks must react to session changes without
   page reload.

3. **Graceful Fallback**: Unknown operations should allow access by default
   since the BMC backend enforces all privilege checks server-side. Denying
   unmapped operations would create poor UX for users who do have the required
   privileges.

4. **Redfish Compliance**: Use DMTF PrivilegeRegistry as the source of truth.

### Configuration

This feature falls into the "runtime optional" category per OpenBMC optionality
guidelines. The privilege checking system is always present but has no runtime
configuration. It uses standard Redfish endpoints that all compliant BMCs must
implement.

## Proposed Design

The design separates concerns using modern Vue 3 patterns:

```
+-------------------------------------------------------------+
|                     Build Time                               |
|  PrivilegeRegistry.json --> add-privilege-metadata.ts        |
|         (DMTF)              --> Extracts static mappings     |
+-------------------------------------------------------------+
                                   |
                                   v
+-------------------------------------------------------------+
|                      Runtime                                 |
|                                                              |
|  +---------------+     +-----------------------------+       |
|  |  Pinia Store  |     |  Vue Query                  |       |
|  |  (authStore)  |     |  (AccountService/Roles)     |       |
|  |  Session.Roles|     |  Role.AssignedPrivileges[]  |       |
|  +------+--------+     +-------------+---------------+       |
|         |                            |                       |
|         +------------+---------------+                       |
|                      v                                       |
|          +-----------------------+                           |
|          | useSessionPrivileges()|                           |
|          | Computes actual privs |                           |
|          +----------+------------+                           |
|                     |                                        |
|                     v                                        |
|          +-----------------------+                           |
|          | canCall() /           |                           |
|          | canCallEntity()       |                           |
|          | Checks DMTF mappings  |                           |
|          +-----------------------+                           |
+-------------------------------------------------------------+
```

### Key Components

**1. Pinia Auth Store (`src/stores/auth.ts`)**

Client-side state for authentication. Holds the Session object including
`Roles[]` array. Provides `login()` and `logout()` actions.

```typescript
const Session = ref<Session | null>(null);
const Roles = computed(() => Session.value?.Roles ?? []);
```

**2. Session Privileges Composable
(`src/api/composables/useSessionPrivileges.ts`)**

Combines Pinia client state with Vue Query server state to compute actual
privileges:

```typescript
export function useSessionPrivileges(): ComputedRef<string[]> {
  const authStore = useAuthStore();
  const { data: RolesData } = useRedfishCollection<Role>(
    '/redfish/v1/AccountService/Roles',
  );
  return computed(() => {
    // Map session role names to AssignedPrivileges from AccountService
    // Falls back to standard defaults for common roles
  });
}
```

Example usage in a component:

> **Note**: Hardcoding privilege names in UI components (e.g.,
> `privileges.value.includes('ConfigureUsers')`) is discouraged because
> privilege requirements can vary by vendor or BMC implementation. Prefer using
> `canCall()` or `canCallEntity()` which use the dynamic DMTF mappings. Direct
> privilege checks should only be used for coarse-grained UI decisions like
> showing/hiding admin panels, not for specific operations.

```vue
<script setup>
import { computed } from 'vue';
import { useSessionPrivileges } from '@/api/composables/useSessionPrivileges';

const privileges = useSessionPrivileges();

// Check for specific privileges
const canConfigureUsers = computed(() =>
  privileges.value.includes('ConfigureUsers'),
);
const isAdmin = computed(
  () =>
    privileges.value.includes('ConfigureManager') &&
    privileges.value.includes('ConfigureUsers'),
);
</script>

<template>
  <div v-if="isAdmin" class="admin-panel">
    <!-- Admin-only content -->
  </div>
  <b-button v-if="canConfigureUsers" @click="manageUsers">
    Manage Users
  </b-button>
</template>
```

**3. Endpoint Privileges (`src/api/privilege/endpointPrivileges.ts`)**

Core privilege checking logic with static mappings extracted from
PrivilegeRegistry at build time:

```typescript
// Static mappings bundled at build time (NOT the full registry)
const PRIVILEGE_MAPPINGS = {
  UpdateService: {
    POST: [['ConfigureComponents']], // Firmware upload
    GET: [['Login']],
  },
  ManagerAccount: {
    PATCH: [['ConfigureUsers']],
    GET: [['ConfigureManager'], ['ConfigureUsers'], ['ConfigureSelf']],
  },
  // ... other entities
};

// Simple boolean check
export function canCallEntity(entity, method): ComputedRef<boolean>;

// Full result with missing privileges
export function usePrivilegeCheckEntity(
  entity,
  method,
): ComputedRef<PrivilegeCheckResult>;
```

Example using `canCallEntity()` to disable a button:

```vue
<script setup>
import { canCallEntity } from '@/api/privilege/endpointPrivileges';

// Check if user can upload firmware (dynamically discovered HttpPushUri)
const canUploadFirmware = canCallEntity('UpdateService', 'POST');
</script>

<template>
  <b-button :disabled="!canUploadFirmware" @click="uploadFirmware">
    Upload Firmware
  </b-button>
</template>
```

Example using `usePrivilegeCheckEntity()` to show missing privileges:

```vue
<script setup>
import { usePrivilegeCheckEntity } from '@/api/privilege/endpointPrivileges';

// Get full privilege check result for firmware upload
const firmwarePrivCheck = usePrivilegeCheckEntity('UpdateService', 'POST');
</script>

<template>
  <b-alert
    v-if="!firmwarePrivCheck.allowed"
    variant="warning"
    :model-value="true"
  >
    <strong>{{ $t('global.status.insufficientPrivileges') }}</strong>
    {{
      $t('pageFirmware.alert.missingPrivileges', {
        privileges: firmwarePrivCheck.missingPrivileges.join(', '),
      })
    }}
  </b-alert>

  <b-button :disabled="!firmwarePrivCheck.allowed" @click="uploadFirmware">
    Upload Firmware
  </b-button>
</template>
```

**4. Build-Time Transformer (`src/api/transformer/add-privilege-metadata.ts`)**

Reads PrivilegeRegistry.json during `npm run generate-api` and extracts only the
required mappings. The full registry (~1MB) is not shipped.

### API Functions

| Function                   | Returns                 | Use Case               |
| -------------------------- | ----------------------- | ---------------------- |
| `canCall(endpointFn)`      | `ComputedRef<boolean>`  | Generated endpoints    |
| `canCallEntity(entity, m)` | `ComputedRef<boolean>`  | Dynamic endpoints      |
| `usePrivilegeCheck(...)`   | `PrivilegeCheckResult`  | Full result w/ missing |
| `useSessionPrivileges()`   | `ComputedRef<string[]>` | Raw privilege array    |

### The Power of `canCall()` - Schema-Generated Privilege Checks

The `canCall()` function demonstrates the key value of generating API endpoints
from the OpenAPI schema. During the build process, the transformer attaches
privilege metadata directly to each generated endpoint function. This means
developers can simply pass the endpoint function to `canCall()` - no need to
manually specify entity names or HTTP methods.

**How it works:**

1. Orval generates endpoint functions from the OpenAPI schema
2. The `add-privilege-metadata.ts` transformer parses function names to extract
   the Redfish entity and HTTP method (e.g., `patchManagerAccount` → entity:
   `ManagerAccount`, method: `PATCH`)
3. It attaches a `privilegeMetadata` property to each function with the required
   privileges from the DMTF PrivilegeRegistry
4. **Tree-shaking at build time**: Only endpoints actually imported and used in
   the WebUI are included in the final bundle. The full generated file is ~25MB
   with 33,000+ exports, but the dist bundle includes only the endpoints in use
   (~22KB uncompressed). Unused endpoints and their related models are
   eliminated.
5. At runtime, `canCall()` reads this metadata and checks against the user's
   session privileges

**Example - User account editing with property-level override:**

```vue
<script setup>
import { canCall } from '@/api/privilege/endpointPrivileges';
import {
  patchAccountServiceAccountById,
  deleteAccountServiceAccountById,
} from '@/api/endpoints/redfish.dist';

// canCall() extracts entity="ManagerAccount", method="PATCH" from function
// Requires: ConfigureUsers
const canEditAccount = canCall(patchAccountServiceAccountById);

// Property override: Password change allows ConfigureSelf
// Requires: ConfigureUsers OR ConfigureSelf
const canChangePassword = canCall(patchAccountServiceAccountById, 'Password');

// Delete requires ConfigureUsers
const canDeleteAccount = canCall(deleteAccountServiceAccountById);
</script>

<template>
  <b-form>
    <b-form-group label="Username">
      <b-form-input :disabled="!canEditAccount" v-model="username" />
    </b-form-group>

    <b-form-group label="Password">
      <!-- Users can change their own password even without ConfigureUsers -->
      <b-form-input :disabled="!canChangePassword" v-model="password" />
    </b-form-group>

    <b-button :disabled="!canEditAccount" @click="saveChanges">
      Save Changes
    </b-button>

    <b-button
      :disabled="!canDeleteAccount"
      variant="danger"
      @click="deleteUser"
    >
      Delete User
    </b-button>
  </b-form>
</template>
```

**Why this matters:**

- **Type-safe**: Pass the actual function, not magic strings
- **Refactoring-friendly**: Rename an endpoint and privilege checks follow
- **Self-documenting**: Code shows which endpoint requires which privileges
- **Reduces errors**: No manual entity/method mapping that could get out of sync
- **Build-time validated**: Missing privilege mappings generate warnings

This approach justifies the investment in schema-based code generation. While
the build process adds complexity (minutes-long generation in development, large
output files in development), it provides compile-time guarantees that manual
privilege mappings cannot.

### Component Usage Example

```vue
<script setup>
import { usePrivilegeCheckEntity } from '@/api/privilege/endpointPrivileges';

const privilegeCheck = usePrivilegeCheckEntity('UpdateService', 'POST');
</script>

<template>
  <b-alert v-if="!privilegeCheck.allowed" variant="warning" show>
    Missing privileges: {{ privilegeCheck.missingPrivileges.join(', ') }}
  </b-alert>
  <b-button :disabled="!privilegeCheck.allowed" @click="uploadFirmware">
    Upload Firmware
  </b-button>
</template>
```

## Alternatives Considered

### 1. Runtime PrivilegeRegistry Fetch

**Approach**: Fetch PrivilegeRegistry.json from BMC at runtime.

**Rejected because**:

- Registry is ~1MB, too large for embedded firmware to host
- Adds network request latency on every page load
- BMCs don't typically serve this file

### 2. Server-Side Privilege Endpoint

**Approach**: Add a new BMC endpoint like `/redfish/v1/Privileges/Check` that
returns allowed operations for the current user.

**Rejected because**:

- Requires BMC firmware changes outside WebUI scope
- Not part of DMTF specification
- Adds latency for every privilege check

### 3. Full Vuex Migration

**Approach**: Keep all state in Vuex, add privilege checking to GlobalStore.

**Rejected because**:

- Vuex is legacy, Pinia is Vue 3 standard
- Mixes client state (session) with server state (role definitions)
- Vuex devtools are deprecated

### 4. Hardcoded Role-Based Checks

**Approach**: Check role names like `if (role === 'Administrator')`.

**Rejected because**:

- Not Redfish-compliant (privileges vary by implementation)
- Doesn't support custom roles
- Ignores multi-role scenarios

## Impacts

### API Impact

No changes to Redfish API. Uses existing standard endpoints:

- `POST /redfish/v1/SessionService/Sessions` - Login
- `GET /redfish/v1/AccountService/Roles` - Role definitions

### Security Impact

**Positive**:

- Improves UX by disabling unauthorized operations and offer explanations
- Reduces failed requests from unauthorized attempts
- Follows DMTF security model

**Neutral**:

- Client-side checks are advisory; BMC validates all operations server-side
- No new attack surface introduced

### Documentation Impact

- New developer guide: `docs/guide/quickstart/privileges.md`
- Build documentation: `src/api/privilege/BUILD.md`
- This design document

### Performance Impact

- **Build time**: +5-10 seconds for privilege metadata extraction
- **Runtime**: Minimal - computed refs only recalculate on session changes
- **Bundle size**: +5KB for static privilege mappings

### Developer Workflow: Regenerating API Endpoints

When working with new Redfish endpoints, adding new privilege checks, or needing
updated TypeScript models for IDE/agent support, developers run the full API
generation pipeline. This is **optional** - only needed when the schema changes
or new endpoints are required.

```bash
npm install && npm run schema:download && npm run schema:bundle && npm run generate-api
```

**Timing breakdown** (measured on Apple M3 Pro):

| Step            | Command                   | Time        | Description                   |
| --------------- | ------------------------- | ----------- | ----------------------------- |
| Install deps    | `npm install`             | ~10s        | Install/update node_modules   |
| Download schema | `npm run schema:download` | ~3s         | Fetch OpenAPI + PrivilegeReg  |
| Bundle schema   | `npm run schema:bundle`   | ~11s        | Redocly bundles YAML → JSON   |
| Generate API    | `npm run generate-api`    | ~3m 18s     | Orval + transforms + Prettier |
| **Total**       |                           | **~3m 42s** |                               |

The `generate-api` step is the bottleneck. It:

1. Preprocesses the schema (deduplication, nullable fixes)
2. Runs Orval to generate 33,000+ endpoint functions and 1,700+ models
3. Converts model names to PascalCase for Redfish compliance
4. Fixes JSDoc formatting in 1,300+ files
5. Injects privilege metadata into endpoint functions
6. Formats all files with Prettier

**When to regenerate:**

- Adding support for new Redfish resources
- DMTF schema updates (run periodically to stay current)
- Privilege requirements changed upstream
- Need TypeScript types for new models

**Normal development does NOT require regeneration.** The generated files which
are included in webui-vue source are committed to the repository and tree-shaken
at build time.

### Developer Impact

Developers adding new features should:

1. **Use `canCall(endpointFn)`** for schema-generated endpoints - pass the
   imported function directly and privilege metadata is already attached

2. **Use `canCallEntity(entity, method)`** for dynamically discovered URIs that
   don't exist in the generated endpoints file. Examples:

   - Firmware upload: The `HttpPushUri` and `MultipartHttpPushUri` are fetched
     at runtime from the `UpdateService` resource. These URIs vary by BMC and
     aren't in the OpenAPI schema, so use
     `canCallEntity('UpdateService', 'POST')`
   - Virtual media mount URIs discovered from `VirtualMedia` resources
   - Any URI that comes from a Redfish property rather than a fixed path

3. **Use `usePrivilegeCheckEntity()`** when you need to display which privileges
   are missing (for user-friendly error messages)

### Upgradability Impact

Privilege mappings are extracted from the latest DMTF PrivilegeRegistry during
build. Updates to mappings come automatically with `npm run generate-api`.

### Organizational

- Does this proposal require a new repository? **No**
- Initial maintainers: Jason Westover
- Repositories modified: **openbmc/webui-vue** only

## Testing

### Unit Tests

- `useSessionPrivileges()`: Verify privilege computation from mock roles
- `canCallEntity()`: Verify OR-of-ANDs logic with various privilege sets
- Property overrides: Verify ConfigureSelf works for Password changes

### Integration Tests

- Login as Administrator: Verify all operations enabled
- Login as ReadOnly: Verify write operations disabled
- Login as Operator: Verify intermediate privilege level

### Manual Testing

1. Log in as different user roles
2. Navigate to Firmware page - verify upload button state matches privileges
3. Navigate to User Management - verify edit capabilities match role
4. Check browser console for privilege-related warnings

### CI Impact

No changes to CI pipeline. CI does **not** download schema files, registry
files, or run `generate-api`. These are strictly developer-side operations
performed optionally during development. The generated endpoint files (with
embedded privilege metadata) are committed to the repository and used as-is by
CI builds. Pre-commit hooks validate that generated files are up-to-date if a
developer modifies them.
