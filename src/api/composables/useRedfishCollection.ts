/**
 * Generic Redfish collection fetcher with $expand query support.
 *
 * Adapted from nvbmc pattern - tries $expand first for efficient single-call
 * fetching, falls back to individual member fetches if not supported.
 */
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import type { MaybeRef } from 'vue';
import { computed, unref } from 'vue';

import { apiInstance } from '@/api/mutator/axios-instance';
import type { ServiceRoot } from '@/api/model/ServiceRoot';

/**
 * Smart retry function that doesn't retry on 4xx client errors.
 * 4xx errors (like 404 Not Found) won't succeed on retry.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response?.status;
  // Don't retry on 4xx client errors
  if (status && status >= 400 && status < 500) {
    return false;
  }
  // Retry up to 3 times for other errors (network issues, 5xx server errors)
  return failureCount < 3;
}

/**
 * Redfish OData query parameters (Redfish-first naming)
 */
export interface RedfishQueryParameters {
  $expand?:
    | string
    | {
        $levels?: number;
        $noLinks?: boolean;
        $expandAll?: boolean;
        $links?: boolean;
      };
  $filter?: string;
  $select?: string | string[];
  $top?: number;
  $skip?: number;
  only?: boolean;
  excerpt?: number;
}

/**
 * Build OData query string from RedfishQueryParameters
 */
export function buildQuery(
  path: string,
  params?: RedfishQueryParameters,
): string {
  if (!params) return path;

  const pairs: string[] = [];

  if (params.$expand) {
    if (typeof params.$expand === 'string') {
      // Do not encode $ directives inside the value (e.g., .($levels=2), *)
      pairs.push(`$expand=${params.$expand}`);
    } else {
      const expandParts: string[] = [];
      if (params.$expand.$levels !== undefined)
        expandParts.push(`$levels=${params.$expand.$levels}`);
      if (params.$expand.$noLinks !== undefined)
        expandParts.push(`$noLinks=${params.$expand.$noLinks}`);
      if (params.$expand.$expandAll !== undefined)
        expandParts.push(`$expandAll=${params.$expand.$expandAll}`);
      if (params.$expand.$links !== undefined)
        expandParts.push(`$links=${params.$expand.$links}`);
      // Build .(options) without encoding the $ directives; use ';' between options per OData
      const opts = expandParts.join(';');
      pairs.push(`$expand=.(${opts})`);
    }
  }

  if (params.$filter) pairs.push(`$filter=${encodeURIComponent(params.$filter)}`);

  if (params.$select) {
    const sel = Array.isArray(params.$select)
      ? params.$select.join(',')
      : params.$select;
    pairs.push(`$select=${encodeURIComponent(sel)}`);
  }

  if (params.$top !== undefined)
    pairs.push(`$top=${encodeURIComponent(String(params.$top))}`);
  if (params.$skip !== undefined)
    pairs.push(`$skip=${encodeURIComponent(String(params.$skip))}`);
  if (params.only) pairs.push('only=');
  if (params.excerpt !== undefined)
    pairs.push(`excerpt=${encodeURIComponent(String(params.excerpt))}`);

  const qs = pairs.join('&');
  return qs ? `${path}?${qs}` : path;
}

/**
 * Normalize query params for stable Vue Query keys.
 * - Ensures consistent key presence/order.
 * - Normalizes `$select` arrays into a stable, sorted list.
 * - Normalizes structured `$expand` into a stable object with fixed keys.
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
 * Fetch collection members individually when $expand is not supported.
 * Takes a collection listing with @odata.id refs and fetches each member.
 */
async function fetchMembersIndividually<T>(listing: {
  Members?: Array<{ '@odata.id'?: string } | T>;
  [key: string]: unknown;
}): Promise<{ Members: T[]; [key: string]: unknown }> {
  const refs = listing?.Members ?? [];
  if (!Array.isArray(refs) || refs.length === 0) {
    return { ...listing, Members: [] as T[] };
  }

  const fetched = await Promise.all(
    refs.map(async (r) => {
      const odataId = (r as { '@odata.id'?: string })?.['@odata.id'];
      if (odataId) {
        return apiInstance<T>({ url: odataId, method: 'GET' });
      }
      return r as T;
    }),
  );

  return {
    ...listing,
    Members: fetched,
    'Members@odata.count': refs.length,
  };
}

/**
 * Get ServiceRoot with caching
 */
async function getServiceRoot(
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<ServiceRoot | null> {
  // Use a dedicated "static" cache key so other parts of the app can
  // refresh ServiceRoot without affecting collection-fetch capability checks.
  // The ServiceRoot capabilities are treated as load-once here.
  const cacheKey = ['redfish', 'v1', 'ServiceRoot', 'static'] as const;

  // Check if ServiceRoot is already cached
  const cached = queryClient.getQueryData<ServiceRoot>(cacheKey);

  if (cached) return cached;

  // Fetch ServiceRoot and cache it
  try {
    return await queryClient.fetchQuery({
      queryKey: cacheKey,
      queryFn: () =>
        apiInstance<ServiceRoot>({ url: '/redfish/v1/', method: 'GET' }),
      staleTime: Infinity,
      gcTime: Infinity,
    });
  } catch {
    return null;
  }
}

/**
 * Check if the BMC supports $expand based on ServiceRoot ProtocolFeaturesSupported.
 */
async function checkExpandSupport(
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<boolean> {
  const serviceRoot = await getServiceRoot(queryClient);
  return (serviceRoot?.ProtocolFeaturesSupported?.ExpandQuery?.MaxLevels ?? 0) > 0;
}

/**
 * Check if the BMC supports $select based on ServiceRoot ProtocolFeaturesSupported.
 */
/**
 * Get ProtocolFeaturesSupported from ServiceRoot.
 * Exported for use in other composables.
 */
export async function getProtocolFeatures(
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<ServiceRoot['ProtocolFeaturesSupported'] | undefined> {
  const serviceRoot = await getServiceRoot(queryClient);
  return serviceRoot?.ProtocolFeaturesSupported;
}

/**
 * Smart collection fetcher: tries $expand first, falls back to individual fetches.
 *
 * @param path - Redfish collection path (e.g., /redfish/v1/Chassis/chassis/Sensors)
 * @param params - Optional OData query parameters
 * @param queryClient - Vue Query client for checking $expand support
 * @returns Collection with embedded Members
 */
export async function fetchRedfishCollection<T>(
  path: string,
  params: RedfishQueryParameters | undefined,
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<{ Members: T[]; [key: string]: unknown }> {
  const supportsExpand = await checkExpandSupport(queryClient);

  if (supportsExpand) {
    try {
      // Try $expand - use provided expand or default to '.'
      const url = buildQuery(path, { ...params, $expand: params?.$expand ?? '.' });
      const expanded = await apiInstance<{ Members?: T[]; [key: string]: unknown }>({
        url,
        method: 'GET',
      });

      const members = expanded?.Members;

      // If Members is an array, the $expand request succeeded
      // Empty array is valid - the collection has no members
      // Only fall through if members are NOT expanded (only have @odata.id refs)
      if (Array.isArray(members)) {
        // Empty array = valid, return it
        if (members.length === 0) {
          return expanded as { Members: T[]; [key: string]: unknown };
        }

        // Check if members are expanded (have more than just @odata.id)
        const hasExpandedMembers = members.some(
          (m) => m && typeof m === 'object' && Object.keys(m).length > 2,
        );

        if (hasExpandedMembers) {
          return expanded as { Members: T[]; [key: string]: unknown };
        }
        // If members only have @odata.id, $expand wasn't applied - fall through
      }
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      // 400/501 = $expand not supported by this endpoint, fallback
      if (!(err?.response?.status === 400 || err?.response?.status === 501)) {
        throw e;
      }
    }
  }

  // Fallback: list collection then fetch each member individually
  const paramsWithoutExpand = params ? { ...params, $expand: undefined } : undefined;
  const listing = await apiInstance<{
    Members?: Array<{ '@odata.id'?: string }>;
    [key: string]: unknown;
  }>({
    url: buildQuery(path, paramsWithoutExpand),
    method: 'GET',
  });

  return await fetchMembersIndividually<T>(listing);
}

/**
 * Vue Query hook for fetching any Redfish collection with $expand optimization.
 *
 * @param path - Redfish collection path (can be a ref for reactivity)
 * @param params - Optional OData query parameters
 * @returns Vue Query result with collection data
 */
export function useRedfishCollection<T>(
  path: MaybeRef<string>,
  params?: RedfishQueryParameters,
) {
  const pathValue = computed(() => unref(path));
  const queryClient = useQueryClient();
  const normalizedParams = normalizeRedfishQueryParameters(params);

  return useQuery({
    queryKey: computed(
      () => ['redfish-collection', pathValue.value, normalizedParams] as const,
    ),
    queryFn: () =>
      fetchRedfishCollection<T>(pathValue.value, params, queryClient),
    enabled: computed(() => !!pathValue.value),
    retry: shouldRetry,
  });
}

// ============================================================================
// Generic Sub-Resource Collection Fetcher
// ============================================================================

/**
 * Fetch all URIs for a sub-resource from all members of a collection.
 *
 * Optimization strategy:
 * 1. If SelectQuery supported: Use $select=Members/{subResource}
 *    This returns only members that have the sub-resource, then append /{subResource}
 * 2. If SelectQuery not supported: Fall back to fetching each member individually
 *    to check if they have the sub-resource link
 *
 * @param collectionPath - Parent collection path (e.g., "/redfish/v1/Chassis")
 * @param subResource - Name of the sub-resource property (e.g., "Sensors")
 * @param queryClient - Vue Query client
 * @returns Array of sub-resource URIs (e.g., ["/redfish/v1/Chassis/BMC_0/Sensors", ...])
 */
export async function fetchAllSubResourceUris(
  collectionPath: string,
  subResource: string,
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<string[]> {
  const features = await getProtocolFeatures(queryClient);
  const supportsSelect = features?.SelectQuery === true;

  // Strategy 1: Use $select=Members/{subResource} to get only members with the sub-resource
  if (supportsSelect) {
    try {
      const result = await apiInstance<{
        Members?: Array<{ '@odata.id'?: string }>;
      }>({
        url: `${collectionPath}?$select=Members/${subResource}`,
        method: 'GET',
      });

      // $select filters to only members that have the sub-resource
      const subResourceUris = result?.Members
        ?.map((m) => m['@odata.id'])
        .filter((uri): uri is string => !!uri)
        .map((memberUri) => `${memberUri}/${subResource}`) ?? [];

      if (subResourceUris.length > 0) {
        return subResourceUris;
      }
    } catch {
      // Fall through to fallback
    }
  }

  // Strategy 2: Get collection, then fetch each member to get sub-resource links
  const collection = await apiInstance<{
    Members?: Array<{ '@odata.id'?: string }>;
  }>({
    url: collectionPath,
    method: 'GET',
  });

  const memberUris = collection?.Members
    ?.map((m) => m['@odata.id'])
    .filter((uri): uri is string => !!uri) ?? [];

  if (memberUris.length === 0) return [];

  // Fetch each member to check for sub-resource link
  const results = await Promise.all(
    memberUris.map(async (uri) => {
      try {
        const member = await apiInstance<Record<string, unknown>>({
          url: uri,
          method: 'GET',
        });
        const subResourceLink = member?.[subResource] as { '@odata.id'?: string } | undefined;
        return subResourceLink?.['@odata.id'];
      } catch {
        return undefined;
      }
    }),
  );

  return results.filter((uri): uri is string => !!uri);
}

/**
 * Fetch all items from a sub-resource across all members of a parent collection.
 *
 * Example: Fetch all Sensors from all Chassis
 *   fetchAllSubResources<Sensor>("/redfish/v1/Chassis", "Sensors", queryClient)
 *
 * Uses optimized fetching:
 * 1. Gets sub-resource URIs using $select optimization (if supported)
 * 2. Fetches each sub-resource collection using $expand optimization (if supported)
 *
 * @param collectionPath - Parent collection path (e.g., "/redfish/v1/Chassis")
 * @param subResource - Name of the sub-resource property (e.g., "Sensors")
 * @param queryClient - Vue Query client
 * @returns Flat array of all sub-resource items
 */
export async function fetchAllSubResources<
  T extends { Name?: string; Id?: string; '@odata.id'?: string },
>(
  collectionPath: string,
  subResource: string,
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey?: readonly unknown[],
): Promise<T[]> {
  function mergeInto(existing: T[], incoming: T[]): T[] {
    if (incoming.length === 0) return existing;

    const seen = new Set<string>();
    const merged: T[] = [];

    // Seed with existing first, deduping by @odata.id where possible
    for (const item of existing) {
      const id = item['@odata.id'];
      if (id) {
        if (seen.has(id)) continue;
        seen.add(id);
      }
      merged.push(item);
    }

    // Append incoming, deduping by @odata.id where possible
    for (const item of incoming) {
      const id = item['@odata.id'];
      if (id) {
        if (seen.has(id)) continue;
        seen.add(id);
      }
      merged.push(item);
    }

    return merged;
  }

  // Step 1: Get all sub-resource URIs
  const subResourceUris = await fetchAllSubResourceUris(collectionPath, subResource, queryClient);

  if (subResourceUris.length === 0) return [];

  // Seed cache with existing data so the UI can render while fetching
  if (queryKey) {
    const existing = queryClient.getQueryData<T[]>(queryKey) ?? [];
    queryClient.setQueryData(queryKey, existing);
  }

  // Step 2: Fetch all sub-resource collections in parallel using $expand optimization.
  // As each sub-resource resolves, push partial results into the cache so the UI updates
  // incrementally (rather than waiting for all requests to finish).
  const results = await Promise.all(
    subResourceUris.map(async (uri) => {
      try {
        const collection = await fetchRedfishCollection<T>(
          uri,
          { $expand: '.' },
          queryClient,
        );
        const Members = (collection.Members ?? []) as T[];

        if (queryKey) {
          queryClient.setQueryData<T[]>(queryKey, (old) =>
            mergeInto(old ?? [], Members),
          );
        }

        return { uri, Members, error: undefined as unknown };
      } catch (error: unknown) {
        return { uri, Members: [] as T[], error };
      }
    }),
  );

  const items = mergeInto([], results.flatMap((r) => r.Members));

  // If every sub-resource fetch failed and we ended up with no data, surface an error
  // instead of misleadingly returning an empty array.
  const failed = results.filter((r) => r.error !== undefined);
  if (items.length === 0 && failed.length > 0) {
    const error = new Error(
      `Failed to fetch ${subResource} collections (${failed.length}/${results.length} requests failed).`,
    );
    (error as { cause?: unknown }).cause = failed[0]?.error;
    throw error;
  }

  return items;
}

/**
 * Vue Query hook for fetching all items from a sub-resource across all members
 * of a parent collection.
 *
 * Example: Fetch all Sensors from all Chassis
 *   useAllSubResources<Sensor>("/redfish/v1/Chassis", "Sensors")
 *
 * @param collectionPath - Parent collection path (e.g., "/redfish/v1/Chassis")
 * @param subResource - Name of the sub-resource property (e.g., "Sensors")
 * @returns Vue Query result with flat array of all sub-resource items
 */
export function useAllSubResources<
  T extends { Name?: string; Id?: string; '@odata.id'?: string },
>(
  collectionPath: string,
  subResource: string,
) {
  const queryClient = useQueryClient();
  const queryKey = ['redfish', 'allSubResources', collectionPath, subResource] as const;

  return useQuery({
    queryKey,
    queryFn: () =>
      fetchAllSubResources<T>(collectionPath, subResource, queryClient, queryKey),
    retry: shouldRetry,
    staleTime: 30000,
    placeholderData: (prev) => prev,
  });
}
