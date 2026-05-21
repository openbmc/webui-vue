/**
 * Composable for checking user privileges
 *
 * This is used for UX improvements to conditionally render UI elements based
 * on the user's session role. Note: This does NOT provide backend security —
 * all operations are validated by the backend (bmcweb) according to Redfish
 * privilege rules.
 *
 * Note: sessionRole reflects the *first* entry in the Session's Roles array.
 * It is a role name (e.g. 'Administrator'), not a Redfish AssignedPrivilege.
 */

import { computed } from 'vue';
import { useStore } from 'vuex';
import { privilegesId } from '@/store/modules/GlobalStore';

export function usePrivilegeCheck() {
  const store = useStore();

  // First entry from the Session's Roles array (e.g. 'Administrator')
  const sessionRole = computed(() => store.getters['global/userPrivilege']);

  // All role names from the Session's Roles array
  const sessionRoles = computed(() => store.getters['global/sessionRoles']);

  // AssignedPrivileges and OemPrivileges per role name, fetched once after login
  const rolePrivileges = computed(() => store.getters['global/rolePrivileges']);

  const isReadOnly = computed(() => {
    return (
      sessionRole.value != null &&
      sessionRole.value === privilegesId.readOnly
    );
  });

  const hasOperatorOrAbove = computed(() => {
    return (
      sessionRole.value != null &&
      (sessionRole.value === privilegesId.operator ||
        sessionRole.value === privilegesId.admin)
    );
  });

  // NOTE: This uses the first Session Role name for a fast synchronous check.
  // rolePrivileges (above) contains the actual Redfish AssignedPrivileges and
  // can be used for more granular checks once async loading completes.
  const hasAdminPrivilege = computed(() => {
    return (
      sessionRole.value != null &&
      sessionRole.value === privilegesId.admin
    );
  });

  return {
    sessionRole,
    sessionRoles,
    rolePrivileges,
    isReadOnly,
    hasOperatorOrAbove,
    hasAdminPrivilege,
  };
}
