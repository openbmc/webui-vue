import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import api from '@/store/api';
import { useRedfishRoot, supportsExpandQuery } from './useRedfishRoot';

/**
 * Redfish collection member reference
 */
export interface CollectionMember {
  '@odata.id': string;
}

/**
 * Redfish collection response
 */
export interface RedfishCollection<T = unknown> {
  '@odata.id': string;
  '@odata.type': string;
  Name: string;
  Members: T[];
  'Members@odata.count': number;
}

/**
 * Options for fetching a Redfish collection
 */
export interface FetchCollectionOptions {
  expand?: boolean;
  expandLevels?: number;
  select?: string[];
  filter?: string;
}

/**
 * Fetches a Redfish collection with optional OData query parameters
 * Gracefully falls back if BMC doesn't support OData features
 *
 * @param path - Collection path (e.g., '/redfish/v1/Chassis')
 * @param options - Fetch options
 * @param supportsExpand - Whether BMC supports $expand
 * @returns Promise with collection data
 */
async function fetchCollection<T>(
  path: string,
  options: FetchCollectionOptions,
  supportsExpand: boolean,
): Promise<T[]> {
  const { expand, expandLevels = 1, select, filter } = options;

  const params = new URLSearchParams();

  if (expand && supportsExpand) {
    params.append('$expand', `.($levels=${expandLevels})`);
  }

  if (select && select.length > 0) {
    params.append('$select', select.join(','));
  }

  if (filter) {
    params.append('$filter', filter);
  }

  const queryString = params.toString();
  const url = queryString ? `${path}?${queryString}` : path;

  try {
    const { data } = await api.get<RedfishCollection<T>>(url);

    if (expand && supportsExpand && data.Members) {
      return data.Members;
    }

    if (data.Members && Array.isArray(data.Members)) {
      const memberPromises = data.Members.map((member: CollectionMember) =>
        api
          .get<T>(member['@odata.id'])
          .then((res) => res.data)
          .catch((error) => {
            console.error(
              `Error fetching member ${member['@odata.id']}:`,
              error,
            );
            return null;
          }),
      );

      const members = await Promise.all(memberPromises);
      return members.filter((m): m is T => m !== null);
    }

    return [];
  } catch (error) {
    // If OData query failed, try without parameters
    if (queryString) {
      console.warn(
        `OData query failed for ${path}, falling back to basic fetch`,
      );
      try {
        const { data } =
          await api.get<RedfishCollection<CollectionMember>>(path);

        if (data.Members && Array.isArray(data.Members)) {
          const memberPromises = data.Members.map((member) =>
            api
              .get<T>(member['@odata.id'])
              .then((res) => res.data)
              .catch((err) => {
                console.error(
                  `Error fetching member ${member['@odata.id']}:`,
                  err,
                );
                return null;
              }),
          );

          const members = await Promise.all(memberPromises);
          return members.filter((m): m is T => m !== null);
        }
      } catch (fallbackError) {
        console.error(`Failed to fetch collection ${path}:`, fallbackError);
        throw fallbackError;
      }
    }

    console.error(`Failed to fetch collection ${path}:`, error);
    throw error;
  }
}

/**
 * TanStack Query hook for fetching a Redfish collection
 *
 * @param path - Collection path
 * @param options - Fetch options
 * @returns TanStack Query result
 */
export function useRedfishCollection<T>(
  path: string,
  options: FetchCollectionOptions = {},
) {
  // Get ServiceRoot to check OData support
  const { data: serviceRoot } = useRedfishRoot();

  // Compute whether expand is supported
  const canExpand = computed(() => supportsExpandQuery(serviceRoot.value));

  return useQuery({
    queryKey: ['redfish', 'collection', path, options],
    queryFn: () => fetchCollection<T>(path, options, canExpand.value),
    enabled: computed(() => !!serviceRoot.value),
    staleTime: 30000,
    gcTime: 300000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
