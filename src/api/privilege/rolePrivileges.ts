/**
 * Session role → Redfish AssignedPrivileges.
 *
 * AccountService/Roles is the source of truth when the BMC publishes it.
 * These defaults cover the DMTF predefined roles, plus IBM OpenBMC account
 * roles whose Role resource is missing or does not list AssignedPrivileges.
 *
 * The IBM "service" account is not a DMTF role name. Its RoleId is
 * OemIBMServiceAgent (also published as Oem.IBM.ServiceAgent / ServiceAgent).
 * That account is in the priv-admin group and has full administrative access,
 * including ConfigureComponents, which firmware update requires. Without this
 * default the UI treats the role as having no privileges and blocks Firmware.
 */

export const ADMINISTRATOR_PRIVILEGES = [
  'Login',
  'ConfigureManager',
  'ConfigureUsers',
  'ConfigureComponents',
  'ConfigureSelf',
] as const;

/**
 * IBM service-account role names. Always grant administrator privileges.
 * A published Role resource may list only an OEM privilege; the account is
 * still priv-admin and can update firmware.
 */
const SERVICE_AGENT_ROLES = new Set([
  'OemIBMServiceAgent',
  'Oem.IBM.ServiceAgent',
  'ServiceAgent',
]);

/**
 * Fallback used only when the BMC does not supply AssignedPrivileges.
 * NoAccess is intentionally empty.
 */
export const DEFAULT_ROLE_PRIVILEGES: Record<string, readonly string[]> = {
  Administrator: ADMINISTRATOR_PRIVILEGES,
  Operator: ['Login', 'ConfigureComponents', 'ConfigureSelf'],
  ReadOnly: ['Login', 'ConfigureSelf'],
  ReadOnlyUser: ['Login', 'ConfigureSelf'],
  // IBM "admin" account role name when it is not the DMTF Administrator role.
  SystemAdministrator: ADMINISTRATOR_PRIVILEGES,
  OemIBMServiceAgent: ADMINISTRATOR_PRIVILEGES,
  'Oem.IBM.ServiceAgent': ADMINISTRATOR_PRIVILEGES,
  ServiceAgent: ADMINISTRATOR_PRIVILEGES,
  NoAccess: [],
};

export interface RoleDefinition {
  Id?: string | null;
  RoleId?: string | null;
  AssignedPrivileges?: Array<string | null> | null;
  OemPrivileges?: Array<string | null> | null;
}

function definedPrivileges(
  privileges: Array<string | null> | null | undefined,
): string[] {
  if (!privileges) return [];
  return privileges.filter((privilege): privilege is string =>
    Boolean(privilege),
  );
}

export function findRoleDefinition(
  roleName: string,
  roleDefinitions: RoleDefinition[] | undefined,
): RoleDefinition | undefined {
  return roleDefinitions?.find(
    (role) => role.Id === roleName || role.RoleId === roleName,
  );
}

/**
 * Privileges for one session role.
 * Service-agent roles always include the administrator set.
 * Other roles prefer a non-empty server definition, then the static default.
 */
export function privilegesForRole(
  roleName: string,
  roleDefinitions: RoleDefinition[] | undefined,
): string[] {
  const definition = findRoleDefinition(roleName, roleDefinitions);
  const fromServer = [
    ...definedPrivileges(definition?.AssignedPrivileges),
    ...definedPrivileges(definition?.OemPrivileges),
  ];

  if (SERVICE_AGENT_ROLES.has(roleName)) {
    return [...new Set([...ADMINISTRATOR_PRIVILEGES, ...fromServer])];
  }

  if (fromServer.length > 0) return [...new Set(fromServer)];

  return [...(DEFAULT_ROLE_PRIVILEGES[roleName] ?? [])];
}

export function privilegesForRoles(
  sessionRoles: string[],
  roleDefinitions: RoleDefinition[] | undefined = [],
): string[] {
  const all = new Set<string>();
  for (const roleName of sessionRoles) {
    for (const privilege of privilegesForRole(roleName, roleDefinitions)) {
      all.add(privilege);
    }
  }
  return [...all];
}

function rolePrivilegesResolved(
  roleName: string,
  roleDefinitions: RoleDefinition[] | undefined,
): boolean {
  if (Object.prototype.hasOwnProperty.call(DEFAULT_ROLE_PRIVILEGES, roleName)) {
    return true;
  }
  return privilegesForRole(roleName, roleDefinitions).length > 0;
}

/**
 * True until every session role has a static default or a server definition.
 * An empty role list is unresolved (session not loaded yet). Callers must not
 * treat that as "insufficient privileges".
 * A failed roles query is resolved: known roles keep their defaults.
 */
export function isPrivilegeResolutionPending(
  sessionRoles: string[],
  roleDefinitions: RoleDefinition[] | undefined,
  rolesFetched: boolean,
  rolesFailed: boolean,
): boolean {
  if (sessionRoles.length === 0) return true;
  if (rolesFetched || rolesFailed) return false;
  return sessionRoles.some(
    (roleName) => !rolePrivilegesResolved(roleName, roleDefinitions),
  );
}

/**
 * True when none of exclusiveToRoles is set, or one of them is in the session.
 * Does not treat an empty session role list as a match.
 */
export function roleListAllows(
  sessionRoles: string[],
  exclusiveToRoles?: string[],
): boolean {
  if (!exclusiveToRoles?.length) return true;
  return sessionRoles.some((role) => exclusiveToRoles.includes(role));
}
