import { describe, expect, it } from 'vitest';
import { checkPrivilege } from '@/api/privilege/operationPrivileges';
import {
  isPrivilegeResolutionPending,
  privilegesForRole,
  privilegesForRoles,
  roleListAllows,
} from '@/api/privilege/rolePrivileges';

describe('role privileges', () => {
  it('gives Administrator ConfigureComponents', () => {
    expect(privilegesForRole('Administrator', [])).toContain(
      'ConfigureComponents',
    );
  });

  it('does not give ReadOnly ConfigureComponents', () => {
    expect(privilegesForRole('ReadOnly', [])).not.toContain(
      'ConfigureComponents',
    );
  });

  it('gives the IBM service account administrator privileges', () => {
    for (const roleName of [
      'OemIBMServiceAgent',
      'Oem.IBM.ServiceAgent',
      'ServiceAgent',
    ]) {
      const privileges = privilegesForRole(roleName, []);
      expect(privileges).toEqual(
        expect.arrayContaining([
          'Login',
          'ConfigureManager',
          'ConfigureUsers',
          'ConfigureComponents',
          'ConfigureSelf',
        ]),
      );
    }
  });

  it('keeps administrator privileges when the service role omits them', () => {
    const privileges = privilegesForRole('OemIBMServiceAgent', [
      {
        Id: 'OemIBMServiceAgent',
        RoleId: 'OemIBMServiceAgent',
        AssignedPrivileges: ['Login'],
        OemPrivileges: ['Oem.IBM.ProvideService'],
      },
    ]);
    expect(privileges).toContain('ConfigureComponents');
    expect(privileges).toContain('Oem.IBM.ProvideService');
  });

  it('uses server AssignedPrivileges for other roles', () => {
    const privileges = privilegesForRole('CustomOperator', [
      {
        Id: 'CustomOperator',
        RoleId: 'CustomOperator',
        AssignedPrivileges: ['Login', 'ConfigureComponents'],
      },
    ]);
    expect(privileges).toEqual(['Login', 'ConfigureComponents']);
  });

  it('lets a published role definition replace the static default', () => {
    const privileges = privilegesForRole('Operator', [
      {
        Id: 'Operator',
        RoleId: 'Operator',
        AssignedPrivileges: ['Login'],
      },
    ]);
    expect(privileges).toEqual(['Login']);
  });

  it('unions privileges from every session role', () => {
    expect(privilegesForRoles(['ReadOnly', 'Operator'], [])).toEqual(
      expect.arrayContaining(['Login', 'ConfigureSelf', 'ConfigureComponents']),
    );
  });

  it('stays pending until an unknown role is resolved', () => {
    expect(isPrivilegeResolutionPending([], [], false, false)).toBe(true);
    expect(
      isPrivilegeResolutionPending(['OemIBMServiceAgent'], [], false, false),
    ).toBe(false);
    expect(
      isPrivilegeResolutionPending(['CustomOperator'], [], false, false),
    ).toBe(true);
    expect(
      isPrivilegeResolutionPending(['CustomOperator'], [], true, false),
    ).toBe(false);
    expect(
      isPrivilegeResolutionPending(['CustomOperator'], undefined, false, true),
    ).toBe(false);
  });

  it('matches any session role against a route allow list', () => {
    expect(roleListAllows(['OemIBMServiceAgent'], undefined)).toBe(true);
    expect(
      roleListAllows(
        ['OemIBMServiceAgent', 'Administrator'],
        ['Administrator'],
      ),
    ).toBe(true);
    expect(roleListAllows(['ReadOnly'], ['Administrator'])).toBe(false);
    expect(roleListAllows([], ['Administrator'])).toBe(false);
  });
});

describe('operation privileges', () => {
  const admin = privilegesForRole('Administrator', []);
  const operator = privilegesForRole('Operator', []);
  const readOnly = privilegesForRole('ReadOnly', []);
  const service = privilegesForRole('OemIBMServiceAgent', []);

  it('allows firmware update for administrator, operator, and service', () => {
    expect(checkPrivilege(admin, 'UpdateService', 'POST').allowed).toBe(true);
    expect(checkPrivilege(operator, 'UpdateService', 'POST').allowed).toBe(
      true,
    );
    expect(checkPrivilege(service, 'UpdateService', 'POST').allowed).toBe(true);
  });

  it('denies firmware update for ReadOnly and names the missing privilege', () => {
    const result = checkPrivilege(readOnly, 'UpdateService', 'POST');
    expect(result.allowed).toBe(false);
    expect(result.missingPrivileges).toEqual(['ConfigureComponents']);
  });

  it('allows unmapped operations', () => {
    expect(checkPrivilege(readOnly, 'Chassis', 'GET').allowed).toBe(true);
  });
});
