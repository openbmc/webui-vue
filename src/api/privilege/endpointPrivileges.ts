/**
 * Endpoint Privilege Checking
 *
 * Provides reactive privilege checking for Redfish endpoints.
 * Uses static privilege mappings extracted from DMTF PrivilegeRegistry.json
 * at build time (registry file is NOT shipped to firmware).
 *
 * Two patterns supported:
 * 1. canCall(endpointFn) - For generated endpoints with attached metadata
 * 2. canCallEntity(entity, method) - For dynamically discovered URIs
 */
import type { ComputedRef } from 'vue';
import { computed } from 'vue';
import { useSessionPrivileges } from '@/api/composables/useSessionPrivileges';

/**
 * Endpoint function with privilege metadata attached at build time
 */
interface EndpointWithPrivileges extends Function {
  privilegeMetadata?: { entity: string; method: string };
}

/**
 * Static privilege mappings extracted from PrivilegeRegistry.json at build time.
 * These are bundled into firmware - PrivilegeRegistry.json is NOT shipped.
 *
 * Structure: Entity -> Method -> Array of privilege sets (OR of ANDs)
 * Example: UpdateService.POST requires [['ConfigureComponents']]
 *          ManagerAccount.GET requires [['ConfigureManager'], ['ConfigureUsers'], ['ConfigureSelf']]
 */
const PRIVILEGE_MAPPINGS: Record<string, Record<string, string[][]>> = {
  // Account management
  ManagerAccount: {
    GET: [['ConfigureManager'], ['ConfigureUsers'], ['ConfigureSelf']],
    PATCH: [['ConfigureUsers']],
    POST: [['ConfigureUsers']],
    DELETE: [['ConfigureUsers']],
  },
  ManagerAccountCollection: {
    GET: [['ConfigureManager'], ['ConfigureUsers'], ['ConfigureSelf']],
    POST: [['ConfigureUsers']],
  },

  // Session management
  Session: {
    GET: [['Login']],
    DELETE: [['ConfigureManager'], ['ConfigureSelf']],
  },
  SessionCollection: {
    GET: [['Login']],
    POST: [['Login']],
  },
  SessionService: {
    GET: [['Login']],
    PATCH: [['ConfigureManager']],
  },

  // Firmware/Update service - for dynamically discovered endpoints (HttpPushUri, MultipartHttpPushUri)
  UpdateService: {
    GET: [['Login']],
    PATCH: [['ConfigureComponents']],
    POST: [['ConfigureComponents']], // Firmware upload requires this
    PUT: [['ConfigureComponents']],
    DELETE: [['ConfigureComponents']],
  },

  // Certificate management
  Certificate: {
    GET: [['Login']],
    DELETE: [['ConfigureManager']],
  },
  CertificateCollection: {
    GET: [['Login']],
    POST: [['ConfigureManager']],
  },

  // Power management
  Power: {
    GET: [['Login']],
    PATCH: [['ConfigureComponents']],
  },

  // Chassis/System
  Chassis: {
    GET: [['Login']],
    PATCH: [['ConfigureComponents']],
  },
  ComputerSystem: {
    GET: [['Login']],
    PATCH: [['ConfigureComponents']],
    DELETE: [['ConfigureComponents']],
  },

  // Manager
  Manager: {
    GET: [['Login']],
    PATCH: [['ConfigureManager']],
  },

  // Network configuration
  EthernetInterface: {
    GET: [['Login']],
    PATCH: [['ConfigureManager']],
  },

  // Event/Log management
  EventDestination: {
    GET: [['Login']],
    PATCH: [['ConfigureManager']],
    DELETE: [['ConfigureManager']],
  },
  EventDestinationCollection: {
    GET: [['Login']],
    POST: [['ConfigureManager']],
  },
  LogEntry: {
    GET: [['Login']],
    DELETE: [['ConfigureManager']],
  },
  LogService: {
    GET: [['Login']],
    PATCH: [['ConfigureManager']],
  },

  // LDAP
  ExternalAccountProvider: {
    GET: [['Login']],
    PATCH: [['ConfigureManager']],
  },

  // Role management
  Role: {
    GET: [['Login']],
    PATCH: [['ConfigureManager']],
  },
  RoleCollection: {
    GET: [['Login']],
  },

  // Default fallback for common operations
  // Add mappings as components use them...
};

/**
 * Property-specific privilege overrides.
 * Some properties require different privileges than the resource itself.
 */
const PROPERTY_OVERRIDES: Record<
  string,
  Record<string, Record<string, string[][]>>
> = {
  ManagerAccount: {
    // Password can be changed by the user themselves
    Password: { PATCH: [['ConfigureUsers'], ['ConfigureSelf']] },
  },
};

/**
 * Result of privilege check - includes required privileges for UI feedback
 */
export interface PrivilegeCheckResult {
  /** Whether the user has sufficient privileges */
  allowed: boolean;
  /** All privilege sets that would grant access (OR of ANDs) */
  requiredPrivilegeSets: string[][];
  /** Privileges user is missing from the first matching set */
  missingPrivileges: string[];
}

/**
 * Check privileges for a generated endpoint function (has attached metadata).
 * Returns reactive result with required privileges for UI feedback.
 *
 * @param endpointFn - Generated endpoint function with privilegeMetadata
 * @param propertyName - Optional property name for property-specific overrides
 * @returns Reactive PrivilegeCheckResult
 */
export function usePrivilegeCheck<T extends EndpointWithPrivileges>(
  endpointFn: T,
  propertyName?: string,
): ComputedRef<PrivilegeCheckResult> {
  const sessionPrivileges = useSessionPrivileges();

  return computed(() => {
    if (!endpointFn.privilegeMetadata) {
      // No metadata = allow by default (BMC validates server-side)
      // Only warn in development to help developers identify missing mappings
      if (import.meta.env.DEV) {
        console.warn(`[Privilege] No metadata for ${endpointFn.name} - allowing by default`);
      }
      return { allowed: true, requiredPrivilegeSets: [], missingPrivileges: [] };
    }

    const { entity, method } = endpointFn.privilegeMetadata;
    return checkPrivilege(sessionPrivileges.value, entity, method, propertyName);
  });
}

/**
 * Check privileges for dynamically discovered endpoints (e.g., HttpPushUri).
 * Returns reactive result with required privileges for UI feedback.
 *
 * Use this when the endpoint URL is discovered at runtime from Redfish responses
 * rather than being a generated endpoint function.
 *
 * @param entity - Redfish entity name (e.g., 'UpdateService')
 * @param method - HTTP method (e.g., 'POST')
 * @param propertyName - Optional property name for property-specific overrides
 * @returns Reactive PrivilegeCheckResult
 */
export function usePrivilegeCheckEntity(
  entity: string,
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  propertyName?: string,
): ComputedRef<PrivilegeCheckResult> {
  const sessionPrivileges = useSessionPrivileges();

  return computed(() => {
    return checkPrivilege(sessionPrivileges.value, entity, method, propertyName);
  });
}

/**
 * Simple boolean check - shorthand for usePrivilegeCheck().value.allowed
 *
 * @param endpointFn - Generated endpoint function with privilegeMetadata
 * @param propertyName - Optional property name for property-specific overrides
 * @returns Reactive boolean
 */
export function canCall<T extends EndpointWithPrivileges>(
  endpointFn: T,
  propertyName?: string,
): ComputedRef<boolean> {
  const check = usePrivilegeCheck(endpointFn, propertyName);
  return computed(() => check.value.allowed);
}

/**
 * Simple boolean check - shorthand for usePrivilegeCheckEntity().value.allowed
 *
 * @param entity - Redfish entity name (e.g., 'UpdateService')
 * @param method - HTTP method (e.g., 'POST')
 * @param propertyName - Optional property name for property-specific overrides
 * @returns Reactive boolean
 */
export function canCallEntity(
  entity: string,
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  propertyName?: string,
): ComputedRef<boolean> {
  const check = usePrivilegeCheckEntity(entity, method, propertyName);
  return computed(() => check.value.allowed);
}

/**
 * Core privilege checking logic.
 * Implements DMTF privilege model: OR of ANDs.
 * User needs ALL privileges in at least ONE set.
 */
function checkPrivilege(
  userPrivileges: string[],
  entity: string,
  method: string,
  propertyName?: string,
): PrivilegeCheckResult {
  // Check property-specific overrides first
  const requiredSets = propertyName
    ? PROPERTY_OVERRIDES[entity]?.[propertyName]?.[method]
    : PRIVILEGE_MAPPINGS[entity]?.[method];

  // Unknown operations allow by default - BMC enforces privileges server-side.
  // Denying unmapped operations would create poor UX for users who have the privilege.
  if (!requiredSets || requiredSets.length === 0) {
    return { allowed: true, requiredPrivilegeSets: [], missingPrivileges: [] };
  }

  // OR of ANDs: user needs ALL privileges in at least ONE set
  const allowed = requiredSets.some((set) =>
    set.every((priv) => userPrivileges.includes(priv)),
  );

  // Calculate missing privileges from the first set (for UI feedback)
  const missingPrivileges = requiredSets[0].filter(
    (priv) => !userPrivileges.includes(priv),
  );

  return {
    allowed,
    requiredPrivilegeSets: requiredSets,
    missingPrivileges: allowed ? [] : missingPrivileges,
  };
}
