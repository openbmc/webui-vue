import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import api from '@/store/api';
import {
  useRedfishRoot,
  supportsExpandQuery,
  supportsSelectQuery,
} from './useRedfishRoot';
import type { CollectionMember } from './useRedfishCollection';

/**
 * Generic Redfish resource with sub-resource collection
 */
interface ResourceWithCollection {
  '@odata.id': string;
  [key: string]: unknown;
}

/**
 * Fetches all parent resources and checks which have the sub-resource
 * Uses $select for efficiency if supported
 *
 * @param parentCollectionPath - Path to parent collection (e.g., '/redfish/v1/Chassis')
 * @param subResourceName - Name of sub-resource (e.g., 'Sensors')
 * @param canUseSelect - Whether BMC supports $select
 * @returns Array of parent resource URIs that have the sub-resource
 */
async function discoverParentsWithSubResource(
  parentCollectionPath: string,
  subResourceName: string,
  canUseSelect: boolean,
): Promise<string[]> {
  try {
    const selectParam = canUseSelect ? `?$select=${subResourceName}` : '';
    const { data } = await api.get(`${parentCollectionPath}${selectParam}`);

    if (!data.Members || !Array.isArray(data.Members)) {
      // Check if this is a single resource with the sub-resource
      if (data['@odata.id'] && data[subResourceName]) {
        return [data['@odata.id']];
      }
      return [];
    }

    if (
      canUseSelect &&
      data.Members.length > 0 &&
      data.Members[0][subResourceName]
    ) {
      return data.Members.filter(
        (member: ResourceWithCollection) => member[subResourceName],
      ).map((member: ResourceWithCollection) => member['@odata.id']);
    }

    const checkPromises = data.Members.map(async (member: CollectionMember) => {
      try {
        const { data: parentData } = await api.get<ResourceWithCollection>(
          member['@odata.id'],
        );
        return parentData[subResourceName] ? member['@odata.id'] : null;
      } catch (error) {
        console.error(
          `Error checking ${member['@odata.id']} for ${subResourceName}:`,
          error,
        );
        return null;
      }
    });

    const results = await Promise.all(checkPromises);
    const foundParents = results.filter(
      (uri: String): uri is string => uri !== null,
    );
    return foundParents;
  } catch (error) {
    console.error(`Error discovering parents with ${subResourceName}:`, error);
    return [];
  }
}

/**
 * Fetches sub-resources from a single parent
 * Uses $expand if supported, falls back to individual fetches
 *
 * @param parentUri - Parent resource URI
 * @param subResourceName - Name of sub-resource collection
 * @param canExpand - Whether BMC supports $expand
 * @param queryClient - TanStack Query client for incremental updates
 * @param queryKey - Query key for cache updates
 * @returns Array of sub-resources
 */
async function fetchSubResourcesFromParent<T>(
  parentUri: string,
  subResourceName: string,
  canExpand: boolean,
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey: unknown[],
): Promise<T[]> {
  const subResourcePath = `${parentUri}/${subResourceName}`;

  try {
    if (canExpand) {
      const { data } = await api.get(`${subResourcePath}?$expand=.($levels=1)`);

      if (data.Members && Array.isArray(data.Members)) {
        queryClient.setQueryData(queryKey, (oldData: T[] = []) => [
          ...oldData,
          ...data.Members,
        ]);
        return data.Members;
      }
    }

    const { data: collection } = await api.get(subResourcePath);

    if (!collection.Members || !Array.isArray(collection.Members)) {
      return [];
    }

    const memberPromises = collection.Members.map(
      async (member: CollectionMember) => {
        try {
          const { data: memberData } = await api.get<T>(member['@odata.id']);
          queryClient.setQueryData(queryKey, (oldData: T[] = []) => [
            ...oldData,
            memberData,
          ]);
          return memberData;
        } catch (error) {
          console.error(`Error fetching ${member['@odata.id']}:`, error);
          return null;
        }
      },
    );

    const members = await Promise.all(memberPromises);
    return members.filter((m: T | null): m is T => m !== null);
  } catch (error) {
    // Silently handle 404 - sub-resource may not exist on this parent
    if (
      (error as { response?: { status?: number } }).response?.status !== 404
    ) {
      console.error(
        `Error fetching ${subResourceName} from ${parentUri}:`,
        error,
      );
    }
    return [];
  }
}

/**
 * Deduplicates resources by @odata.id
 * Prevents duplicate entries when the same resource is referenced by multiple parents
 *
 * @param items - Array of resources to deduplicate
 * @returns Deduplicated array
 */
function deduplicateByOdataId<T>(items: T[]): T[] {
  if (items.length === 0) return items;

  const seen = new Set<string>();
  const deduplicated: T[] = [];

  for (const item of items) {
    const id = (item as any)['@odata.id'];
    if (id) {
      if (seen.has(id)) continue;
      seen.add(id);
    }
    deduplicated.push(item);
  }

  return deduplicated;
}

/**
 * Fetches all sub-resources from all parent resources
 *
 * @param parentUris - Array of parent resource URIs
 * @param subResourceName - Name of sub-resource collection
 * @param canExpand - Whether BMC supports $expand
 * @param queryClient - TanStack Query client
 * @param queryKey - Query key for cache updates
 * @returns Array of all sub-resources (deduplicated by @odata.id)
 * @throws Error if all requests fail and no data is retrieved
 */
async function fetchAllSubResources<T>(
  parentUris: string[],
  subResourceName: string,
  canExpand: boolean,
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey: unknown[],
): Promise<T[]> {
  queryClient.setQueryData(queryKey, []);

  const fetchPromises = parentUris.map((parentUri) =>
    fetchSubResourcesFromParent<T>(
      parentUri,
      subResourceName,
      canExpand,
      queryClient,
      queryKey,
    ).catch((error) => {
      // Return empty array on failure but track the error
      console.error(
        `Failed to fetch ${subResourceName} from ${parentUri}:`,
        error,
      );
      return [] as T[];
    }),
  );

  const results = await Promise.all(fetchPromises);
  const flattened = results.flat();

  // Track failed requests (those that returned empty arrays)
  const failed = results.filter((result) => result.length === 0);

  // If all requests failed and we have no data, throw an error
  if (flattened.length === 0 && failed.length > 0) {
    const error = new Error(
      `Failed to fetch ${subResourceName} collections (${failed.length}/${results.length} requests failed).`,
    );
    throw error;
  }

  // Deduplicate by @odata.id to prevent duplicate entries
  // when the same resource is referenced by multiple parents
  return deduplicateByOdataId(flattened);
}

/**
 * Smart retry function that doesn't retry on 4xx client errors.
 * 4xx errors (like 404 Not Found) won't succeed on retry.
 *
 * @param failureCount - Number of times the request has failed
 * @param error - The error object from the failed request
 * @returns Whether to retry the request
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  // Don't retry on 4xx client errors (bad request, not found, unauthorized, etc.)
  if (status && status >= 400 && status < 500) {
    return false;
  }
  // Retry up to 3 times for other errors (network issues, 5xx server errors)
  return failureCount < 3;
}

/**
 * Generic composable for fetching all sub-resources from a collection
 *
 * @param parentCollectionPath - Path to parent collection
 * @param subResourceName - Name of sub-resource collection
 * @returns TanStack Query result with all sub-resources
 */
export function useAllSubResources<T>(
  parentCollectionPath: string,
  subResourceName: string,
) {
  const queryClient = useQueryClient();
  const { data: serviceRoot } = useRedfishRoot();

  const canExpand = computed(() => supportsExpandQuery(serviceRoot.value));
  const canSelect = computed(() => supportsSelectQuery(serviceRoot.value));

  // Query key for this specific sub-resource fetch
  const queryKey = [
    'redfish',
    'allSubResources',
    parentCollectionPath,
    subResourceName,
  ];

  return useQuery({
    queryKey,
    queryFn: async () => {
      // Always perform discovery on each query execution
      // This ensures fresh data and proper cache behavior
      const parentUris = await discoverParentsWithSubResource(
        parentCollectionPath,
        subResourceName,
        canSelect.value,
      );

      return fetchAllSubResources<T>(
        parentUris,
        subResourceName,
        canExpand.value,
        queryClient,
        queryKey,
      );
    },
    enabled: computed(() => !!serviceRoot.value),
    staleTime: Infinity, // Data never becomes stale automatically
    gcTime: 300000, // Keep in cache for 5 minutes after component unmount
    refetchOnMount: false, // Don't refetch when component remounts
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false, // Don't refetch on network reconnect
    placeholderData: (prev) => prev,
    retry: shouldRetry,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
