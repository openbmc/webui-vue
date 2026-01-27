# Privilege Checking

This project implements a Redfish-compliant privilege checking system that
enables secure, privilege-aware UI components while maintaining the strict
resource constraints required for embedded BMC firmware.

## Overview

The privilege system uses DMTF Redfish PrivilegeRegistry mappings to determine
what operations a user can perform. It combines:

- **Client state (Pinia):** Session roles from login
- **Server state (Vue Query):** Role definitions from AccountService
- **Static mappings:** DMTF privilege requirements per entity/method

## Quick Start

### Check if User Can Perform an Operation

For dynamically discovered endpoints (like firmware upload):

```typescript
import { canCallEntity } from '@/api/privilege/endpointPrivileges';

// Returns a reactive boolean
const canUpdateFirmware = canCallEntity('UpdateService', 'POST');
```

For generated endpoint functions:

```typescript
import { canCall } from '@/api/privilege/endpointPrivileges';
import { patchAccountServiceAccountById } from '@/api/endpoints/redfish.gen';

const canEditAccount = canCall(patchAccountServiceAccountById);
```

### Show Why User Cannot Perform an Operation

Use the full privilege check to get missing privileges:

```vue
<script setup>
import { usePrivilegeCheckEntity } from '@/api/privilege/endpointPrivileges';

const privilegeCheck = usePrivilegeCheckEntity('UpdateService', 'POST');
</script>

<template>
  <b-alert v-if="!privilegeCheck.allowed" variant="warning" :model-value="true">
    <strong>{{ $t('global.status.insufficientPrivileges') }}</strong>
    {{
      $t('pageFirmware.alert.missingPrivileges', {
        privileges: privilegeCheck.missingPrivileges.join(', '),
      })
    }}
  </b-alert>
</template>
```

### Check Specific Privileges Directly

For checking individual privileges without an endpoint:

```typescript
import { computed } from 'vue';
import { useSessionPrivileges } from '@/api/composables/useSessionPrivileges';

const privileges = useSessionPrivileges();
const canConfigureUsers = computed(() =>
  privileges.value.includes('ConfigureUsers'),
);
const isAdmin = computed(
  () =>
    privileges.value.includes('ConfigureManager') &&
    privileges.value.includes('ConfigureUsers'),
);
```

## Available Functions

| Function                                  | Returns                             | Use Case                          |
| ----------------------------------------- | ----------------------------------- | --------------------------------- |
| `canCall(endpointFn)`                     | `ComputedRef<boolean>`              | Generated endpoints               |
| `canCallEntity(entity, method)`           | `ComputedRef<boolean>`              | Dynamic endpoints                 |
| `usePrivilegeCheck(endpointFn)`           | `ComputedRef<PrivilegeCheckResult>` | Full result with missing privs    |
| `usePrivilegeCheckEntity(entity, method)` | `ComputedRef<PrivilegeCheckResult>` | Full result for dynamic endpoints |
| `useSessionPrivileges()`                  | `ComputedRef<string[]>`             | Raw privilege array               |

### PrivilegeCheckResult Interface

```typescript
interface PrivilegeCheckResult {
  allowed: boolean;
  requiredPrivilegeSets: string[][]; // OR of ANDs
  missingPrivileges: string[]; // What user needs
}
```

## Redfish Privilege Model

The DMTF Redfish specification defines five standard privileges:

| Privilege             | Description                        |
| --------------------- | ---------------------------------- |
| `Login`               | Can log in and read most resources |
| `ConfigureManager`    | Can configure BMC settings         |
| `ConfigureUsers`      | Can manage user accounts           |
| `ConfigureComponents` | Can configure system components    |
| `ConfigureSelf`       | Can modify own account             |

### OR of ANDs Logic

Privilege requirements use "OR of ANDs" logic. For example:

```json
{
  "GET": [
    { "Privilege": ["ConfigureManager"] },
    { "Privilege": ["ConfigureUsers"] },
    { "Privilege": ["ConfigureSelf"] }
  ]
}
```

This means: User needs `ConfigureManager` OR `ConfigureUsers` OR `ConfigureSelf`
to perform a GET on this resource.

## Common Patterns

### Disable Button Based on Privileges

```vue
<script setup>
import { canCallEntity } from '@/api/privilege/endpointPrivileges';

const canSave = canCallEntity('ManagerAccount', 'PATCH');
</script>

<template>
  <b-button :disabled="!canSave" @click="save"> Save Changes </b-button>
</template>
```

### Hide Section for Unprivileged Users

```vue
<script setup>
import { useSessionPrivileges } from '@/api/composables/useSessionPrivileges';
import { computed } from 'vue';

const privileges = useSessionPrivileges();
const showAdminPanel = computed(() =>
  privileges.value.includes('ConfigureManager'),
);
</script>

<template>
  <div v-if="showAdminPanel" class="admin-panel">
    <!-- Admin-only content -->
  </div>
</template>
```

### Property-Specific Privileges

Some properties have different privilege requirements than their parent
resource. For example, users can change their own password:

```typescript
import { canCall } from '@/api/privilege/endpointPrivileges';
import { patchAccountServiceAccountById } from '@/api/endpoints/redfish.gen';

// Check if user can change password (allows ConfigureSelf)
const canChangePassword = canCall(patchAccountServiceAccountById, 'Password');

// Check if user can edit account generally (requires ConfigureUsers)
const canEditAccount = canCall(patchAccountServiceAccountById);
```

### Disable Page with Alert

```vue
<script setup>
import { computed } from 'vue';
import { usePrivilegeCheckEntity } from '@/api/privilege/endpointPrivileges';

const privilegeCheck = usePrivilegeCheckEntity('UpdateService', 'POST');

const isPageDisabled = computed(() => {
  if (!privilegeCheck.value.allowed) return true;
  // Other conditions...
  return false;
});
</script>

<template>
  <b-container>
    <b-alert
      v-if="!privilegeCheck.allowed"
      variant="warning"
      :model-value="true"
    >
      Missing privileges: {{ privilegeCheck.missingPrivileges.join(', ') }}
    </b-alert>

    <b-form :disabled="isPageDisabled">
      <!-- Form content -->
    </b-form>
  </b-container>
</template>
```

## Entity Names

When using `canCallEntity()` or `usePrivilegeCheckEntity()`, use the Redfish
schema name for the entity:

| Entity              | Common Operations       |
| ------------------- | ----------------------- |
| `UpdateService`     | Firmware upload (POST)  |
| `ManagerAccount`    | User account management |
| `Session`           | Session management      |
| `Certificate`       | Certificate management  |
| `EthernetInterface` | Network configuration   |
| `Manager`           | BMC settings            |
| `ComputerSystem`    | Server settings         |
| `Power`             | Power management        |
| `LogEntry`          | Log management          |

### How to Find the Correct Entity Name

Entity names come from the Redfish schema `@odata.type` property. There are
several ways to discover the correct entity name:

#### 1. Check the `@odata.type` in API Response

Make a GET request to the resource and look at the `@odata.type` field:

```json
{
  "@odata.id": "/redfish/v1/UpdateService",
  "@odata.type": "#UpdateService.v1_11_0.UpdateService",
  "HttpPushUri": "/redfish/v1/UpdateService/update"
}
```

The entity name is between `#` and the version: **UpdateService**

#### 2. Look at Generated Endpoint Function Names

Generated endpoints follow the pattern `<method><Entity><Action>`:

```typescript
// getUpdateService -> entity: UpdateService, method: GET
// patchManagerAccount -> entity: ManagerAccount, method: PATCH
// postSessionServiceSessions -> entity: Session (special case)
```

#### 3. Check `endpointPrivileges.ts` for Existing Mappings

Open `src/api/privilege/endpointPrivileges.ts` and look at `PRIVILEGE_MAPPINGS`:

```typescript
const PRIVILEGE_MAPPINGS = {
  UpdateService: { ... },
  ManagerAccount: { ... },
  // Your entity should be here
};
```

#### 4. Reference the DMTF PrivilegeRegistry

The DMTF PrivilegeRegistry defines all standard entity privilege mappings:
[DMTF Registries](https://redfish.dmtf.org/registries/)

### Adding New Entity Mappings

If your entity isn't mapped, add it to `PRIVILEGE_MAPPINGS`:

```typescript
const PRIVILEGE_MAPPINGS: Record<string, Record<string, string[][]>> = {
  // ... existing mappings

  // Add new entity
  YourEntity: {
    GET: [['Login']],
    PATCH: [['ConfigureComponents']],
    POST: [['ConfigureComponents']],
    DELETE: [['ConfigureComponents']],
  },
};
```

Privilege sets use "OR of ANDs" logic. For example:

- `[['ConfigureManager'], ['ConfigureUsers']]` = ConfigureManager OR
  ConfigureUsers
- `[['ConfigureManager', 'ConfigureUsers']]` = ConfigureManager AND
  ConfigureUsers

## Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                     Build Time                                  │
│  PrivilegeRegistry.json ──► Static PRIVILEGE_MAPPINGS           │
│         (DMTF)              (embedded in endpointPrivileges.ts) │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Runtime                                    │
│                                                                 │
│  ┌─────────────────┐     ┌─────────────────────────────────┐    │
│  │  Pinia Store    │     │  Vue Query                      │    │
│  │  (authStore)    │     │  (AccountService/Roles)         │    │
│  │  Session.Roles[]│     │  Role.AssignedPrivileges[]      │    │
│  └────────┬────────┘     └────────────────┬────────────────┘    │
│           │                               │                     │
│           └───────────────┬───────────────┘                     │
│                           ▼                                     │
│               ┌───────────────────────┐                         │
│               │ useSessionPrivileges()│                         │
│               │ Computes actual privs │                         │
│               └───────────┬───────────┘                         │
│                           │                                     │
│                           ▼                                     │
│               ┌───────────────────────┐                         │
│               │ canCall() /           │                         │
│               │ canCallEntity()       │                         │
│               │ Checks DMTF mappings  │                         │
│               └───────────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

### Key Files

| File                                          | Purpose                       |
| --------------------------------------------- | ----------------------------- |
| `src/api/privilege/endpointPrivileges.ts`     | Core privilege checking logic |
| `src/api/composables/useSessionPrivileges.ts` | Computes user privileges      |
| `src/stores/auth.ts`                          | Pinia store for session state |
| `src/api/registries/PrivilegeRegistry.json`   | DMTF privilege definitions    |

## Security Model

- **Client-side advisory:** Privilege checks hide/disable UI elements
- **Server validation required:** BMC always validates operations server-side
- **Fail-safe defaults:** Unknown endpoints return `false` (deny access)
- **Redfish compliant:** Uses Session.Roles and AccountService definitions

## i18n Support

Add these keys to your locale files for privilege-related messages:

```json
{
  "global": {
    "status": {
      "insufficientPrivileges": "Insufficient Privileges"
    }
  },
  "pageYourPage": {
    "alert": {
      "missingPrivileges": "Required privileges: {privileges}"
    }
  }
}
```

## Troubleshooting

### Privilege Check Always Returns False

1. Verify the user is logged in (session exists)
2. Check that AccountService/Roles endpoint is accessible
3. Verify the entity name matches Redfish schema exactly
4. Check browser console for warnings about missing metadata

### Privileges Not Updating After Login

The Pinia auth store must be updated with session data. Check that
`AuthenticanStore.js` syncs session to Pinia on login.

### Adding New Entity Mappings

Edit `src/api/privilege/endpointPrivileges.ts` and add the entity to
`PRIVILEGE_MAPPINGS`:

```typescript
const PRIVILEGE_MAPPINGS: Record<string, Record<string, string[][]>> = {
  // Existing mappings...

  // Add new entity
  YourEntity: {
    GET: [['Login']],
    PATCH: [['ConfigureComponents']],
    POST: [['ConfigureComponents']],
    DELETE: [['ConfigureComponents']],
  },
};
```
