/**
 * Composable for checking session privileges
 *
 * This is used for UX improvements to conditionally render UI elements based
 * on the session role. Note: This does NOT provide backend security —
 * all operations are validated by the backend (bmcweb) according to Redfish
 * privilege rules.
 *
 * Authorization comes from Session.Roles, not from the user account directly.
 * LDAP and certificate sessions may have Roles without a corresponding
 * AccountService user.
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
  const sessionRole = computed(() => store.getters['global/sessionRole']);

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

  const hasAdminPrivilege = computed(() => {
    return (
      sessionRole.value != null &&
      sessionRole.value === privilegesId.admin
    );
  });

  return {
    sessionRole,
    isReadOnly,
    hasOperatorOrAbove,
    hasAdminPrivilege,
  };
}
