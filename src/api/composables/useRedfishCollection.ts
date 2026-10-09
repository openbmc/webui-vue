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
 * OData Query Parameters for Redfish API
 */
export interface RedfishQueryParameters {
  $expand?:
    | string
    | {
        $levels?: number;
        $noLinks?: boolean;
        $expandAll?: boolean;
        $links?: string;
      };
  $filter?: string;
  $select?: string | string[];
  $top?: number;
  $skip?: number;
  only?: boolean;
  excerpt?: boolean;
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
 * Builds a Redfish API URL with OData query parameters
 *
 * Handles proper encoding and formatting of OData directives:
 * - $expand with nested options like .($levels=2)
 * - $select with multiple properties
 * - $filter, $top, $skip for pagination and filtering
 * - Custom Redfish parameters like 'only' and 'excerpt'
 *
 * @param path - Base path (e.g., '/redfish/v1/Chassis')
 * @param params - OData query parameters
 * @returns Complete URL with query string
 *
 * @example
 * buildQuery('/redfish/v1/Chassis', { $expand: '*' })
 * // Returns: '/redfish/v1/Chassis?$expand=*'
 *
 * @example
 * buildQuery('/redfish/v1/Systems', {
 *   $expand: { $levels: 2, $noLinks: true }
 * })
 * // Returns: '/redfish/v1/Systems?$expand=.($levels=2;$noLinks=true)'
 */
export function buildQuery(
  path: string,
  params?: RedfishQueryParameters,
): string {
  if (!params) return path;

  const pairs: string[] = [];

  // Handle $expand parameter
  if (params.$expand) {
    if (typeof params.$expand === 'string') {
      // Simple string expand (e.g., '*' or 'Members')
      // Do not encode $ directives inside the value
      pairs.push(`$expand=${params.$expand}`);
    } else {
      // Complex expand with options
      const expandParts: string[] = [];

      if (params.$expand.$levels !== undefined) {
        expandParts.push(`$levels=${params.$expand.$levels}`);
      }
      if (params.$expand.$noLinks !== undefined) {
        expandParts.push(`$noLinks=${params.$expand.$noLinks}`);
      }
      if (params.$expand.$expandAll !== undefined) {
        expandParts.push(`$expandAll=${params.$expand.$expandAll}`);
      }
      if (params.$expand.$links !== undefined) {
        expandParts.push(`$links=${params.$expand.$links}`);
      }

      // Build .(options) without encoding the $ directives
      // Use ';' between options per OData specification
      const opts = expandParts.join(';');
      pairs.push(`$expand=.(${opts})`);
    }
  }

  // Handle $filter parameter
  if (params.$filter) {
    pairs.push(`$filter=${encodeURIComponent(params.$filter)}`);
  }

  // Handle $select parameter
  if (params.$select) {
    const sel = Array.isArray(params.$select)
      ? params.$select.join(',')
      : params.$select;
    pairs.push(`$select=${encodeURIComponent(sel)}`);
  }

  // Handle $top parameter (pagination)
  if (params.$top !== undefined) {
    pairs.push(`$top=${encodeURIComponent(String(params.$top))}`);
  }

  // Handle $skip parameter (pagination)
  if (params.$skip !== undefined) {
    pairs.push(`$skip=${encodeURIComponent(String(params.$skip))}`);
  }

  // Handle 'only' parameter (Redfish-specific).
  // Redfish defines 'only' as a valueless flag — emit "only" without "=".
  if (params.only) {
    pairs.push('only');
  }

  // Handle 'excerpt' parameter (Redfish-specific)
  if (params.excerpt !== undefined) {
    pairs.push(`excerpt=${encodeURIComponent(String(params.excerpt))}`);
  }

  const qs = pairs.join('&');
  return qs ? `${path}?${qs}` : path;
}

/**
 * Normalizes Redfish query parameters for cache stability
 *
 * Ensures consistent query keys by:
 * - Sorting array values (like $select)
 * - Freezing the result to prevent mutations
 * - Handling undefined values consistently
 *
 * @param params - Query parameters to normalize
 * @returns Normalized and frozen parameters, or undefined if input is undefined
 */
function normalizeRedfishQueryParameters(
  params?: RedfishQueryParameters,
): Readonly<RedfishQueryParameters> | undefined {
  if (!params) return undefined;

  const normalizedSelect =
    params.$select === undefined
      ? undefined
      : Array.isArray(params.$select)
        ? [...params.$select].sort()
        : params.$select;

  const normalizedExpand =
    params.$expand === undefined
      ? undefined
      : typeof params.$expand === 'string'
        ? params.$expand
        : {
            $levels: params.$expand.$levels,
            $noLinks: params.$expand.$noLinks,
            $expandAll: params.$expand.$expandAll,
            $links: params.$expand.$links,
          };

  return Object.freeze({
    $expand: normalizedExpand,
    $filter: params.$filter,
    $select: normalizedSelect,
    $top: params.$top,
    $skip: params.$skip,
    only: params.only,
    excerpt: params.excerpt,
  });
}

/**
 * Returns true when `member` is a fully-expanded Redfish object (i.e. it
 * carries more than just the stub `{ '@odata.id' }` key).
 *
 * Used by both `fetchCollection` and `fetchRedfishCollection` to detect BMCs
 * that silently ignore `$expand` and return stubs instead of full objects.
 */
function isMemberExpanded(member: unknown): boolean {
  return (
    member !== undefined &&
    member !== null &&
    typeof member === 'object' &&
    '@odata.id' in (member as object) &&
    Object.keys(member as object).length > 1
  );
}

/**
 * Fetches each member in `stubs` individually, discarding members that fail.
 *
 * @param stubs - Array of collection member stubs (each has `@odata.id`)
 * @returns Array of fully populated members (failed fetches are omitted)
 */
async function fetchAllMembers<T>(stubs: CollectionMember[]): Promise<T[]> {
  const results = (await Promise.all(
    stubs.map((member: CollectionMember) =>
      api
        .get<T>(member['@odata.id'])
        .then((res: { data: T }) => res.data)
        .catch((error: unknown) => {
          console.error(`Error fetching member ${member['@odata.id']}:`, error);
          return null;
        }),
    ),
  )) as (T | null)[];
  return results.filter((m): m is T => m !== null);
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

  // Build query parameters using the reusable buildQuery function
  const queryParams: RedfishQueryParameters = {};

  if (expand && supportsExpand) {
    queryParams.$expand = { $levels: expandLevels };
  }

  if (select && select.length > 0) {
    queryParams.$select = select;
  }

  if (filter) {
    queryParams.$filter = filter;
  }

  const url = buildQuery(path, queryParams);

  try {
    const { data } = await api.get<RedfishCollection<T>>(url);

    if (
      expand &&
      supportsExpand &&
      data.Members &&
      Array.isArray(data.Members)
    ) {
      // Guard against a BMC that silently ignores $expand and returns stubs.
      // A fully-expanded member has more keys than just { '@odata.id' }.
      if (isMemberExpanded(data.Members[0])) {
        return data.Members;
      }

      // Server accepted the request but returned stubs — fetch individually.
      return fetchAllMembers<T>(data.Members as unknown as CollectionMember[]);
    }

    if (data.Members && Array.isArray(data.Members)) {
      return fetchAllMembers<T>(data.Members as unknown as CollectionMember[]);
    }

    return [];
  } catch (error) {
    // If OData query failed, try without parameters
    const hasQueryParams = url !== path;
    if (hasQueryParams) {
      console.warn(
        `OData query failed for ${path}, falling back to basic fetch`,
      );
      try {
        const { data } =
          await api.get<RedfishCollection<CollectionMember>>(path);

        if (data.Members && Array.isArray(data.Members)) {
          return fetchAllMembers<T>(data.Members);
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
 * Fetches a Redfish collection at `collectionPath`, attempting `$expand` for a
 * single round-trip and falling back to individual member fetches when the BMC
 * does not support expansion.
 *
 * Usable outside of a reactive query, e.g. for per-chassis sensor fetches
 * inside `useQueries`.
 *
 * @param collectionPath - Collection path (e.g., '/redfish/v1/Chassis/chassis0/Sensors')
 * @param expandLevels - $levels value used for the $expand attempt
 * @returns Array of fully populated collection members
 */
export async function fetchRedfishCollection<T>(
  collectionPath: string,
  expandLevels = 1,
): Promise<T[]> {
  const url = buildQuery(collectionPath, {
    $expand: { $levels: expandLevels },
  });

  try {
    const { data } = await api.get<RedfishCollection<T>>(url);

    // Empty collection — nothing to fetch.
    if (!data.Members || data.Members.length === 0) {
      return [];
    }

    // A fully-expanded member has more than just the stub { '@odata.id' } key.
    if (isMemberExpanded(data.Members[0])) {
      return data.Members;
    }

    // BMC accepted the request but silently ignored $expand and returned stubs.
    // Reuse the stubs we already have — no need to re-fetch the collection.
    return fetchAllMembers<T>(data.Members as unknown as CollectionMember[]);
  } catch (error) {
    // Only fall back when the BMC explicitly signals that $expand is
    // unsupported (HTTP 400 or 501).  Network errors, timeouts, and any
    // other failure have an undefined or different status and must be
    // re-thrown so the caller can surface or retry them.
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    if (status !== 400 && status !== 501) {
      throw error;
    }
  }

  // Fall back: the BMC returned 400/501 for the $expand request.
  // Fetch the plain collection, then fetch each member individually.
  try {
    const { data: collection } =
      await api.get<RedfishCollection<CollectionMember>>(collectionPath);

    if (!collection.Members || !Array.isArray(collection.Members)) {
      return [];
    }

    return fetchAllMembers<T>(collection.Members);
  } catch (fallbackError) {
    console.error(
      `Failed to fetch collection ${collectionPath}:`,
      fallbackError,
    );
    throw fallbackError;
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

  // Build query parameters for normalization
  const queryParams: RedfishQueryParameters = {};

  if (options.expand) {
    queryParams.$expand = { $levels: options.expandLevels || 1 };
  }

  if (options.select && options.select.length > 0) {
    queryParams.$select = options.select;
  }

  if (options.filter) {
    queryParams.$filter = options.filter;
  }

  // Normalize query parameters for stable cache keys
  const normalizedParams = normalizeRedfishQueryParameters(queryParams);

  return useQuery({
    queryKey: ['redfish', 'collection', path, normalizedParams],
    queryFn: () => fetchCollection<T>(path, options, canExpand.value),
    enabled: computed(() => !!serviceRoot.value),
    refetchOnMount: false, // Don't refetch when component remounts
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
