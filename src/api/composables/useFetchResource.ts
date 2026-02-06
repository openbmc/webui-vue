import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import api from '@/store/api';
import {
  useRedfishRoot,
  supportsExpandQuery,
  supportsSelectQuery,
} from './useRedfishRoot';
import { discoverParentsWithSubResource } from './useAllSubResources';

/**
 * Function that doesn't retry on 4xx client errors.
 * Mirrors the behavior from useAllSubResources.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  if (status && status >= 400 && status < 500) {
    return false;
  }
  return failureCount < 3;
}

/**
 * This reuses the same discovery logic and $expand / $select capabilities
 * as useAllSubResources, but returns a single resource (first matching parent).
 */
export function useFetchResource<T>(
  parentCollectionPath: string,
  subResourceName: string,
) {
  const queryClient = useQueryClient();
  const { data: serviceRoot } = useRedfishRoot();

  const canExpand = computed(() => supportsExpandQuery(serviceRoot.value));
  const canSelect = computed(() => supportsSelectQuery(serviceRoot.value));

  return useQuery({
    queryKey: [
      'redfish',
      'resource',
      parentCollectionPath,
      subResourceName,
    ],
    enabled: computed(() => !!serviceRoot.value),
    staleTime: 30000,
    gcTime: 300000,
    retry: shouldRetry,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
    queryFn: async () => {
      // Discover parents that actually expose the sub-resource
      const parentUris = await discoverParentsWithSubResource(
        parentCollectionPath,
        subResourceName,
        canSelect.value,
      );

      if (!parentUris.length) {
        return null;
      }

      // For now, pick the first matching parent.
      // Callers can layer additional selection logic if needed.
      const parentUri = parentUris[0];
      const subResourcePath = `${parentUri}/${subResourceName}`;

      // Try with $expand first to mirror useAllSubResources auto-expand behavior
      if (canExpand.value) {
        try {
          const { data } = await api.get<T>(
            `${subResourcePath}?$expand=.($levels=1)`,
          );
          // Cache by full resource path to help any future callers
          queryClient.setQueryData(
            ['redfish', 'resource', subResourcePath],
            data,
          );
          return data;
        } catch (error) {
          // Fall back to basic GET below
          console.warn(
            `Expand query failed for ${subResourcePath}, falling back to basic fetch`,
          );
        }
      }

      const { data } = await api.get<T>(subResourcePath);
      return data;
    },
  });
}

