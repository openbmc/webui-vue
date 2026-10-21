/**
 * Reactive Redfish privileges for the current session.
 *
 * Session.Roles (Vuex) names the roles. AccountService/Roles supplies
 * AssignedPrivileges when the BMC publishes them. Static defaults in
 * rolePrivileges.ts cover the DMTF roles and the IBM service account.
 */
import { computed, type ComputedRef } from 'vue';
import { useStore } from 'vuex';
import { useRedfishCollection } from '@/api/composables/useRedfishCollection';
import {
  isPrivilegeResolutionPending,
  privilegesForRoles,
  type RoleDefinition,
} from '@/api/privilege/rolePrivileges';

export interface SessionPrivileges {
  sessionRoles: ComputedRef<string[]>;
  privileges: ComputedRef<string[]>;
  pending: ComputedRef<boolean>;
}

export function useSessionPrivileges(): SessionPrivileges {
  const store = useStore();

  const sessionRoles = computed<string[]>(() => {
    const roles = store.getters['global/sessionRoles'];
    if (Array.isArray(roles) && roles.length > 0) {
      return roles.filter((role): role is string => typeof role === 'string');
    }
    const role = store.getters['global/userPrivilege'];
    return typeof role === 'string' && role ? [role] : [];
  });

  const rolesQuery = useRedfishCollection<RoleDefinition>(
    '/redfish/v1/AccountService/Roles',
    { expand: true },
  );

  const privileges = computed(() =>
    privilegesForRoles(sessionRoles.value, rolesQuery.data.value ?? []),
  );

  const pending = computed(() =>
    isPrivilegeResolutionPending(
      sessionRoles.value,
      rolesQuery.data.value,
      rolesQuery.isFetched.value,
      rolesQuery.isError.value,
    ),
  );

  return { sessionRoles, privileges, pending };
}
