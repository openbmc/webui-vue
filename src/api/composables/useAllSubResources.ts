import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, ref } from 'vue';
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
    return results.filter((uri): uri is string => uri !== null);
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
    return members.filter((m): m is T => m !== null);
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
 * Fetches all sub-resources from all parent resources
 *
 * @param parentUris - Array of parent resource URIs
 * @param subResourceName - Name of sub-resource collection
 * @param canExpand - Whether BMC supports $expand
 * @param queryClient - TanStack Query client
 * @param queryKey - Query key for cache updates
 * @returns Array of all sub-resources
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
    ),
  );

  const results = await Promise.all(fetchPromises);
  return results.flat();
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

  const parentUris = ref<string[]>([]);
  const discoveryComplete = ref(false);

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
      if (!discoveryComplete.value) {
        parentUris.value = await discoverParentsWithSubResource(
          parentCollectionPath,
          subResourceName,
          canSelect.value,
        );
        discoveryComplete.value = true;
      }

      return fetchAllSubResources<T>(
        parentUris.value,
        subResourceName,
        canExpand.value,
        queryClient,
        queryKey,
      );
    },
    enabled: computed(() => !!serviceRoot.value),
    staleTime: 30000,
    gcTime: 300000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
