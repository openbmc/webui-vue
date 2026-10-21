/**
 * Reactive privilege check for a Redfish entity and HTTP method.
 * Client-side only: bmcweb still authorizes the request.
 */
import { computed, type ComputedRef } from 'vue';
import { useSessionPrivileges } from '@/api/composables/useSessionPrivileges';
import {
  checkPrivilege,
  type HttpMethod,
  type PrivilegeCheckResult,
} from '@/api/privilege/operationPrivileges';

export interface EndpointPrivilegeCheck extends PrivilegeCheckResult {
  /** Session roles are not loaded, or an unknown role is still being resolved. */
  pending: boolean;
  /** Resolved and the session lacks the required privileges. */
  denied: boolean;
}

export function usePrivilegeCheckEntity(
  entity: string,
  method: HttpMethod,
): ComputedRef<EndpointPrivilegeCheck> {
  const { privileges, pending } = useSessionPrivileges();

  return computed(() => {
    const result = checkPrivilege(privileges.value, entity, method);
    const isPending = pending.value;
    return {
      ...result,
      pending: isPending,
      denied: !isPending && !result.allowed,
    };
  });
}
