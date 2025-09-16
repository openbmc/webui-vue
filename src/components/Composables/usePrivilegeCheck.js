/**
 * Composable for checking user privileges
 *
 * This is used for UX improvements to disable UI elements based on user roles.
 * Note: This does NOT provide backend security - all operations are validated
 * by the backend (bmcweb) according to Redfish privilege rules.
 *
 * This helps users understand when they lack permissions for specific actions
 * based on their current session role.
 */

import { computed } from 'vue';
import { useStore } from 'vuex';
import { privilegesId } from '@/store/modules/GlobalStore';

/**
 * Check if user has read-only privileges
 * @returns {ComputedRef<boolean>} True if user has read-only role
 */
export function usePrivilegeCheck() {
  const store = useStore();

  const userPrivilege = computed(() => store.getters['global/userPrivilege']);

  const isReadOnly = computed(() => {
    return (
      userPrivilege.value != null &&
      userPrivilege.value === privilegesId.readOnly
    );
  });

  const hasOperatorOrAbove = computed(() => {
    return (
      userPrivilege.value != null &&
      (userPrivilege.value === privilegesId.operator ||
        userPrivilege.value === privilegesId.admin)
    );
  });

  const hasAdminPrivilege = computed(() => {
    return (
      userPrivilege.value != null &&
      userPrivilege.value === privilegesId.admin
    );
  });

  return {
    userPrivilege,
    isReadOnly,
    hasOperatorOrAbove,
    hasAdminPrivilege,
  };
}
