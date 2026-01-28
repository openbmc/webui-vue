import { useQuery } from '@tanstack/vue-query';
import api from '@/store/api';

/**
 * Redfish ServiceRoot response interface
 */
export interface ServiceRoot {
  '@odata.id': string;
  '@odata.type': string;
  Id: string;
  Name: string;
  RedfishVersion: string;
  UUID?: string;
  Systems?: { '@odata.id': string };
  Chassis?: { '@odata.id': string };
  Managers?: { '@odata.id': string };
  SessionService?: { '@odata.id': string };
  AccountService?: { '@odata.id': string };
  EventService?: { '@odata.id': string };
  UpdateService?: { '@odata.id': string };
  ProtocolFeaturesSupported?: {
    ExpandQuery?: {
      ExpandAll?: boolean;
      Levels?: boolean;
      Links?: boolean;
      MaxLevels?: number;
      NoLinks?: boolean;
    };
    FilterQuery?: boolean;
    SelectQuery?: boolean;
    OnlyMemberQuery?: boolean;
  };
}

/**
 * Fetches the Redfish ServiceRoot
 * @returns {Promise<ServiceRoot>}
 */
async function fetchServiceRoot(): Promise<ServiceRoot> {
  const { data } = await api.get('/redfish/v1/');
  return data;
}

/**
 * TanStack Query hook for fetching and caching Redfish ServiceRoot
 *
 * @returns {Object} TanStack Query result
 * @property {ServiceRoot} data - ServiceRoot data
 * @property {boolean} isLoading - Loading state
 * @property {boolean} isError - Error state
 * @property {Error} error - Error object
 */
export function useRedfishRoot() {
  return useQuery({
    queryKey: ['redfish', 'serviceRoot'],
    queryFn: fetchServiceRoot,
    staleTime: Infinity, // ServiceRoot rarely changes, cache indefinitely
    gcTime: Infinity, // Keep in cache indefinitely (formerly cacheTime in v4)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Helper to check if OData $expand is supported
 * @param {ServiceRoot} serviceRoot - ServiceRoot data
 * @returns {boolean}
 */
export function supportsExpandQuery(
  serviceRoot: ServiceRoot | undefined,
): boolean {
  if (!serviceRoot) return false;
  const maxLevels =
    serviceRoot.ProtocolFeaturesSupported?.ExpandQuery?.MaxLevels;
  return typeof maxLevels === 'number' && maxLevels > 0;
}

/**
 * Helper to check if OData $select is supported
 * @param {ServiceRoot} serviceRoot - ServiceRoot data
 * @returns {boolean}
 */
export function supportsSelectQuery(
  serviceRoot: ServiceRoot | undefined,
): boolean {
  if (!serviceRoot) return false;
  return serviceRoot.ProtocolFeaturesSupported?.SelectQuery === true;
}

/**
 * Helper to check if OData $filter is supported
 * @param {ServiceRoot} serviceRoot - ServiceRoot data
 * @returns {boolean}
 */
export function supportsFilterQuery(
  serviceRoot: ServiceRoot | undefined,
): boolean {
  if (!serviceRoot) return false;
  return serviceRoot.ProtocolFeaturesSupported?.FilterQuery === true;
}

/**
 * Helper to get max expand levels supported
 * @param {ServiceRoot} serviceRoot - ServiceRoot data
 * @returns {number} Max levels (0 if not supported)
 */
export function getMaxExpandLevels(
  serviceRoot: ServiceRoot | undefined,
): number {
  if (!serviceRoot) return 0;
  return serviceRoot.ProtocolFeaturesSupported?.ExpandQuery?.MaxLevels || 0;
}
