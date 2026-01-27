/**
 * Unit tests for Redfish privilege checking logic.
 *
 * Tests the core checkPrivilege function and public API functions.
 */
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

vi.mock('@/api/composables/useSessionPrivileges', async () => {
  const { computed, ref } = await import('vue');
  const sessionPrivilegesRef = ref([]);
  const useSessionPrivileges = vi.fn(() =>
    computed(() => sessionPrivilegesRef.value),
  );

  return {
    __setSessionPrivileges: (next) => {
      sessionPrivilegesRef.value = next;
    },
    useSessionPrivileges,
  };
});

let canCallEntity;
let usePrivilegeCheck;
let usePrivilegeCheckEntity;
let setSessionPrivileges;

describe('Privilege Checking Logic', () => {
  beforeAll(async () => {
    const mockModule = await import('@/api/composables/useSessionPrivileges');
    setSessionPrivileges = mockModule.__setSessionPrivileges;

    const mod = await import('@/api/privilege/endpointPrivileges');
    canCallEntity = mod.canCallEntity;
    usePrivilegeCheck = mod.usePrivilegeCheck;
    usePrivilegeCheckEntity = mod.usePrivilegeCheckEntity;
  });

  beforeEach(() => {
    setSessionPrivileges([]);
    vi.clearAllMocks();
  });

  describe('OR-of-ANDs Logic', () => {
    it('allows when user has all privileges in any set (OR)', () => {
      setSessionPrivileges(['Login', 'ConfigureSelf']);

      const allowed = canCallEntity('ManagerAccount', 'GET').value;

      expect(allowed).toBe(true);
    });

    it('denies when user lacks privileges for all sets', () => {
      setSessionPrivileges(['Login']);

      const result = usePrivilegeCheckEntity('ManagerAccount', 'PATCH').value;

      expect(result.allowed).toBe(false);
      expect(result.missingPrivileges).toEqual(['ConfigureUsers']);
    });
  });

  describe('Unknown Operations (Graceful Fallback)', () => {
    it('allows unknown entity/method by default', () => {
      setSessionPrivileges([]);

      const result = usePrivilegeCheckEntity('UnknownEntity', 'POST').value;

      expect(result.allowed).toBe(true);
      expect(result.requiredPrivilegeSets).toEqual([]);
    });
  });

  describe('Property Overrides', () => {
    it('allows password change with ConfigureSelf', () => {
      setSessionPrivileges(['Login', 'ConfigureSelf']);

      const result = usePrivilegeCheckEntity(
        'ManagerAccount',
        'PATCH',
        'Password',
      ).value;

      expect(result.allowed).toBe(true);
    });
  });

  describe('Endpoint Metadata', () => {
    it('allows endpoints with no metadata by default', () => {
      setSessionPrivileges([]);
      const endpointFn = () => undefined;

      const result = usePrivilegeCheck(endpointFn).value;

      expect(result.allowed).toBe(true);
    });

    it('uses endpoint metadata when present', () => {
      setSessionPrivileges(['Login', 'ConfigureUsers']);

      const endpointFn = () => undefined;
      endpointFn.privilegeMetadata = { entity: 'ManagerAccount', method: 'PATCH' };

      const result = usePrivilegeCheck(endpointFn).value;

      expect(result.allowed).toBe(true);
    });
  });
});
