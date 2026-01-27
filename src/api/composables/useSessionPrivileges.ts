/**
 * Session Privileges Composable
 *
 * Combines Pinia client state (Session.Roles) with Vue Query server state
 * (AccountService Role definitions) to compute the user's actual privileges.
 */
import { computed, type ComputedRef } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRedfishCollection } from '@/api/composables/useRedfishCollection';
import type { Role } from '@/api/model/Role';

/**
 * Fallback: static role-to-privilege mappings for common Redfish roles.
 * Used when Role definitions haven't been fetched yet or when the
 * BMC doesn't support the AccountService Roles endpoint.
 *
 * These defaults align with DMTF Redfish standard role definitions.
 */
const DEFAULT_ROLE_PRIVILEGES: Record<string, string[]> = {
  Administrator: [
    'Login',
    'ConfigureManager',
    'ConfigureUsers',
    'ConfigureComponents',
    'ConfigureSelf',
  ],
  Operator: ['Login', 'ConfigureComponents', 'ConfigureSelf'],
  ReadOnly: ['Login', 'ConfigureSelf'],
  // Common alternative names used by various BMC implementations
  ReadOnlyUser: ['Login', 'ConfigureSelf'],
  User: ['Login', 'ConfigureSelf'],
};

/**
 * Options for useSessionPrivileges composable.
 */
export interface UseSessionPrivilegesOptions {
  /**
   * If true, use only static role defaults without fetching from AccountService.
   * Useful for pages that don't need precise privilege checking and want to
   * avoid the network request overhead.
   * @default false
   */
  staticOnly?: boolean;
}

/**
 * Reactive composable that computes the current session's privileges.
 *
 * Data flow:
 * 1. Client state: Session.Roles[] from Pinia authStore (set on login)
 * 2. Server state: Role definitions from /redfish/v1/AccountService/Roles (via Vue Query)
 * 3. Combine: For each role name in Session.Roles, lookup AssignedPrivileges
 *
 * @param options - Optional configuration
 * @param options.staticOnly - Skip server fetch, use only static role defaults
 * @returns Reactive array of privilege names (e.g., ['Login', 'ConfigureUsers'])
 *
 * @example
 * // Full privilege checking (fetches role definitions from server)
 * const privileges = useSessionPrivileges();
 *
 * @example
 * // Quick static check (no network request, uses defaults)
 * const privileges = useSessionPrivileges({ staticOnly: true });
 */
export function useSessionPrivileges(
  options?: UseSessionPrivilegesOptions,
): ComputedRef<string[]> {
  const authStore = useAuthStore();
  const staticOnly = options?.staticOnly ?? false;

  // Server state: Fetch Role definitions via Vue Query (unless staticOnly)
  // Uses $expand to get full Role objects with AssignedPrivileges
  // When staticOnly is true, we pass an empty path to disable the query
  const { data: RolesData } = useRedfishCollection<Role>(
    staticOnly ? '' : '/redfish/v1/AccountService/Roles',
    { $expand: '.' },
  );

  return computed(() => {
    // Client state: Session roles from Pinia
    const SessionRoles = authStore.Roles;
    if (SessionRoles.length === 0) return [];

    const AllPrivileges = new Set<string>();
    const Roles = staticOnly ? [] : (RolesData.value?.Members ?? []);

    for (const RoleName of SessionRoles) {
      // Try dynamic lookup from AccountService Roles (match by Id or RoleId)
      const RoleDefinition = Roles.find(
        (R) => R.Id === RoleName || R.RoleId === RoleName,
      );

      if (RoleDefinition?.AssignedPrivileges) {
        // Use actual privileges from server (handles OEM/custom roles)
        for (const P of RoleDefinition.AssignedPrivileges) {
          if (P) AllPrivileges.add(P);
        }
      } else {
        // Fallback to static defaults for common roles
        const Defaults = DEFAULT_ROLE_PRIVILEGES[RoleName];
        if (Defaults) {
          Defaults.forEach((P) => AllPrivileges.add(P));
        }
      }
    }

    return Array.from(AllPrivileges);
  });
}
