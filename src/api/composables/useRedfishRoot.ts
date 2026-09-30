import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import api from '@/store/api';
import type { ServiceRoot } from '@/api/types/redfish';

/**
 * Fetches the Redfish ServiceRoot
 * @returns {Promise<ServiceRoot>}
 */
async function fetchServiceRoot(signal?: AbortSignal): Promise<ServiceRoot> {
  const { data } = await api.get<ServiceRoot>('/redfish/v1/', { signal });
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
export function useRedfishRoot(enabled?: MaybeRefOrGetter<boolean>) {
  return useQuery({
    queryKey: ['redfish', 'serviceRoot'],
    queryFn: ({ signal }) => fetchServiceRoot(signal),
    enabled:
      enabled === undefined ? undefined : computed(() => toValue(enabled)),
    staleTime: Infinity, // ServiceRoot rarely changes, cache indefinitely
    gcTime: Infinity, // Keep in cache indefinitely (formerly cacheTime in v4)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Helper to check if OData $expand is supported
 * @param {ServiceRoot} ServiceRoot - ServiceRoot data
 * @returns {boolean}
 */
export function supportsExpandQuery(
  ServiceRoot: ServiceRoot | undefined,
): boolean {
  if (!ServiceRoot) return false;
  const maxLevels =
    ServiceRoot.ProtocolFeaturesSupported?.ExpandQuery?.MaxLevels;
  return typeof maxLevels === 'number' && maxLevels > 0;
}

/**
 * Helper to check if OData $select is supported
 * @param {ServiceRoot} ServiceRoot - ServiceRoot data
 * @returns {boolean}
 */
export function supportsSelectQuery(
  ServiceRoot: ServiceRoot | undefined,
): boolean {
  if (!ServiceRoot) return false;
  return ServiceRoot.ProtocolFeaturesSupported?.SelectQuery === true;
}

/**
 * Helper to check if OData $filter is supported
 * @param {ServiceRoot} ServiceRoot - ServiceRoot data
 * @returns {boolean}
 */
export function supportsFilterQuery(
  ServiceRoot: ServiceRoot | undefined,
): boolean {
  if (!ServiceRoot) return false;
  return ServiceRoot.ProtocolFeaturesSupported?.FilterQuery === true;
}

/**
 * Helper to get max expand levels supported
 * @param {ServiceRoot} ServiceRoot - ServiceRoot data
 * @returns {number} Max levels (0 if not supported)
 */
export function getMaxExpandLevels(
  ServiceRoot: ServiceRoot | undefined,
): number {
  if (!ServiceRoot) return 0;
  return ServiceRoot.ProtocolFeaturesSupported?.ExpandQuery?.MaxLevels || 0;
}
