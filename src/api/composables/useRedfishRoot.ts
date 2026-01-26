/**
 * ServiceRoot composable for accessing Redfish capabilities.
 *
 * ProtocolFeaturesSupported is static - describes the BMC's Redfish
 * implementation capabilities and doesn't change during a session.
 */
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';

import { apiInstance } from '@/api/mutator/axios-instance';
import type { ServiceRoot } from '@/api/model/ServiceRoot';

/**
 * Smart retry function that doesn't retry on 4xx client errors.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status && status >= 400 && status < 500) return false;
  return failureCount < 3;
}

/**
 * Fetch ServiceRoot from /redfish/v1/
 */
async function getServiceRoot(): Promise<ServiceRoot> {
  return apiInstance<ServiceRoot>({
    url: '/redfish/v1/',
    method: 'GET',
  });
}

/**
 * Composable for accessing ServiceRoot and ProtocolFeaturesSupported.
 */
export function useRedfishRoot() {
  const {
    data: ServiceRoot,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['redfish', 'v1', 'ServiceRoot'] as const,
    queryFn: getServiceRoot,
    retry: shouldRetry,
    // Expect ServiceRoot can change (e.g., after BMC updates/config changes).
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });

  const ProtocolFeatures = computed(
    () => ServiceRoot.value?.ProtocolFeaturesSupported,
  );

  const supportsExpand = computed(
    () => (ProtocolFeatures.value?.ExpandQuery?.MaxLevels ?? 0) > 0,
  );

  return {
    ServiceRoot,
    ProtocolFeatures,
    supportsExpand,
    isLoading,
    error,
  };
}
