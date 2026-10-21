/**
 * Privileges required for Redfish operations the UI actually gates.
 *
 * Add a mapping when a page starts checking that operation. This is not the
 * DMTF PrivilegeRegistry: that file is large, is not used at runtime, and is
 * not committed. Unmapped operations are allowed here; bmcweb still enforces
 * them.
 *
 * Each method maps to an OR of ANDs. The user needs every privilege in at
 * least one set.
 */

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

type PrivilegeSets = Partial<Record<HttpMethod, string[][]>>;

const PRIVILEGE_MAPPINGS: Record<string, PrivilegeSets> = {
  // Firmware upload uses UpdateService HttpPushUri / MultipartHttpPushUri.
  UpdateService: {
    POST: [['ConfigureComponents']],
  },
  // Host power and reset actions.
  ComputerSystem: {
    POST: [['ConfigureComponents']],
  },
};

export interface PrivilegeCheckResult {
  allowed: boolean;
  requiredPrivilegeSets: string[][];
  missingPrivileges: string[];
}

export function checkPrivilege(
  userPrivileges: string[],
  entity: string,
  method: HttpMethod,
): PrivilegeCheckResult {
  const requiredSets = PRIVILEGE_MAPPINGS[entity]?.[method];

  if (!requiredSets || requiredSets.length === 0) {
    return {
      allowed: true,
      requiredPrivilegeSets: [],
      missingPrivileges: [],
    };
  }

  const allowed = requiredSets.some((set) =>
    set.every((privilege) => userPrivileges.includes(privilege)),
  );

  const missingPrivileges = requiredSets[0].filter(
    (privilege) => !userPrivileges.includes(privilege),
  );

  return {
    allowed,
    requiredPrivilegeSets: requiredSets,
    missingPrivileges: allowed ? [] : missingPrivileges,
  };
}
