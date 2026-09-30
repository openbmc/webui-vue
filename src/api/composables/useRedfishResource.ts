import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import api from '@/store/api';
import { shouldRetry } from '@/api/composables/useAllSubResources';

export const redfishResourceQueryKey = ['redfish', 'resource'] as const;

export interface UseRedfishResourceOptions<T> {
  staleTime?: number;
  gcTime?: number;
  refetchOnMount?: boolean | 'always';
  refetchOnWindowFocus?: boolean | 'always';
  refetchOnReconnect?: boolean | 'always';
  refetchInterval?: number | false;
  refetchIntervalInBackground?: boolean;
  placeholderData?: (previous: T | undefined) => T | undefined;
}

/**
 * Fetch one Redfish resource by URI.
 *
 * A null or empty URI disables the query. Callers that share a URI share the
 * cache entry ['redfish', 'resource', uri].
 *
 * @param uri - Resource @odata.id
 * @param [options] - Cache and refetch policy for this observer
 */
export function useRedfishResource<T extends { '@odata.id'?: string }>(
  uri: MaybeRefOrGetter<string | null | undefined>,
  options: UseRedfishResourceOptions<T> = {},
) {
  const resourceUri = computed(() => toValue(uri) || null);

  return useQuery<T>({
    queryKey: computed(() => [...redfishResourceQueryKey, resourceUri.value]),
    queryFn: async ({ signal }) => {
      const current = resourceUri.value;
      if (!current) throw new Error('Redfish resource not available');
      const { data } = await api.get<T>(current, { signal });
      return data;
    },
    enabled: computed(() => !!resourceUri.value),
    retry: shouldRetry,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    refetchOnMount: options.refetchOnMount,
    refetchOnWindowFocus: options.refetchOnWindowFocus,
    refetchOnReconnect: options.refetchOnReconnect,
    refetchInterval: options.refetchInterval,
    refetchIntervalInBackground: options.refetchIntervalInBackground,
    // TanStack's placeholder type excludes function-shaped data. T is a resource.
    placeholderData: options.placeholderData as never,
  });
}
