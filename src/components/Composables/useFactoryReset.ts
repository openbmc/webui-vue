import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, type ComputedRef } from 'vue';
import api from '@/store/api';
import { useRedfishRoot } from '@/api/composables/useRedfishRoot';
import { shouldRetry } from '@/api/composables/useAllSubResources';
import type { Manager, System } from '@/api/types/redfish';

export const factoryResetQueryKey = ['redfish', 'factoryReset'] as const;

export interface UseFactoryResetReturn {
  isServerOff: ComputedRef<boolean>;
  resetToDefaults: () => Promise<void>;
  resetBios: () => Promise<void>;
  isBusy: ComputedRef<boolean>;
  isError: ComputedRef<boolean>;
  isLoading: ComputedRef<boolean>;
}

/**
 * Resolve the first manager URI at call time (used in mutations).
 * Checks ManagerProvidingService first, falls back to Managers collection.
 */
async function resolveManagerUri(): Promise<string> {
  const { data: root } = await api.get<{
    ManagerProvidingService?: { '@odata.id': string };
    Managers?: { '@odata.id': string };
  }>('/redfish/v1/');

  const direct = root.ManagerProvidingService?.['@odata.id'];
  if (direct) return direct;

  const collectionUri = root.Managers?.['@odata.id'];
  if (!collectionUri) throw new Error('No manager URI found in service root');

  const { data: collection } = await api.get<{
    Members?: { '@odata.id': string }[];
  }>(collectionUri);
  const uri = collection.Members?.[0]?.['@odata.id'];
  if (!uri) throw new Error('No manager members found');
  return uri;
}

/**
 * Resolve the first system URI at call time (used in mutations).
 */
async function resolveSystemUri(): Promise<string> {
  const { data: root } = await api.get<{
    Systems?: { '@odata.id': string };
  }>('/redfish/v1/');

  const collectionUri = root.Systems?.['@odata.id'];
  if (!collectionUri) throw new Error('No systems URI found in service root');

  const { data: collection } = await api.get<{
    Members?: { '@odata.id': string }[];
  }>(collectionUri);
  const uri = collection.Members?.[0]?.['@odata.id'];
  if (!uri) throw new Error('No system members found');
  return uri;
}

/**
 * Composable for Factory Reset operations (Reset BIOS and Reset to Defaults).
 *
 * Query cache settings:
 * - staleTime: Infinity, gcTime: Infinity because system and manager action
 *   endpoints only change on BMC/System reconfiguration, not autonomously.
 * - refetchOnMount: true, refetchOnReconnect: true to show fresh status.
 * - refetchOnWindowFocus: false to avoid unnecessary traffic.
 *
 * Mutation strategy:
 * - Mutations resolve URIs at call time (like the original Vuex actions did)
 *   rather than reading from query cache. This guarantees the POST is always
 *   attempted even when the background queries haven't finished yet, and avoids
 *   "resource not available" errors caused by cache race conditions.
 */
export function useFactoryReset(): UseFactoryResetReturn {
  const queryClient = useQueryClient();
  const { data: serviceRoot, isLoading: rootLoading } = useRedfishRoot();

  const managerProvidingServiceUri = computed<string | null>(
    () => serviceRoot.value?.ManagerProvidingService?.['@odata.id'] ?? null,
  );
  const managersCollectionUri = computed<string | null>(
    () => serviceRoot.value?.Managers?.['@odata.id'] ?? null,
  );
  const systemsCollectionUri = computed<string | null>(
    () => serviceRoot.value?.Systems?.['@odata.id'] ?? null,
  );

  // Background queries used for display state (isServerOff, isLoading, isError)
  const managerQuery = useQuery<Manager | null, unknown>({
    queryKey: computed(() => [
      ...factoryResetQueryKey,
      'manager',
      managerProvidingServiceUri.value ?? managersCollectionUri.value,
    ]),
    queryFn: async ({ signal }) => {
      let managerUri = managerProvidingServiceUri.value;
      if (!managerUri) {
        const collectionUri = managersCollectionUri.value;
        if (!collectionUri) return null;
        const { data: collection } = await api.get<{
          Members?: { '@odata.id': string }[];
        }>(collectionUri, { signal });
        managerUri = collection.Members?.[0]?.['@odata.id'] ?? null;
      }
      if (!managerUri) return null;
      const { data } = await api.get<Manager>(managerUri, { signal });
      return data;
    },
    enabled: computed(
      () => !!managerProvidingServiceUri.value || !!managersCollectionUri.value,
    ),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: shouldRetry,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const systemQuery = useQuery<System | null, unknown>({
    queryKey: computed(() => [
      ...factoryResetQueryKey,
      'system',
      systemsCollectionUri.value,
    ]),
    queryFn: async ({ signal }) => {
      const collectionUri = systemsCollectionUri.value;
      if (!collectionUri) return null;
      const { data: collection } = await api.get<{
        Members?: { '@odata.id': string }[];
      }>(collectionUri, { signal });
      const systemUri = collection.Members?.[0]?.['@odata.id'] ?? null;
      if (!systemUri) return null;
      const { data } = await api.get<System>(systemUri, { signal });
      return data;
    },
    enabled: computed(() => !!systemsCollectionUri.value),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: shouldRetry,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const resetToDefaultsMutation = useMutation<void, unknown, void, unknown>({
    mutationFn: async () => {
      // Resolve manager URI at call time — do not rely on cached query data
      const managerUri = await resolveManagerUri();
      const { data: manager } = await api.get<Manager>(managerUri);
      const resetTarget =
        manager.Actions?.['#Manager.ResetToDefaults']?.target ??
        `${managerUri}/Actions/Manager.ResetToDefaults`;
      await api.post(resetTarget, { ResetType: 'ResetAll' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: factoryResetQueryKey });
    },
  });

  const resetBiosMutation = useMutation<void, unknown, void, unknown>({
    mutationFn: async () => {
      // Resolve system URI at call time — do not rely on cached query data
      const systemUri = await resolveSystemUri();
      // Check if the system resource has an explicit Bios link; fall back to convention
      const { data: system } = await api.get<System>(systemUri);
      const resetTarget = system.Bios?.['@odata.id']
        ? `${system.Bios['@odata.id']}/Actions/Bios.ResetBios`
        : `${systemUri}/Bios/Actions/Bios.ResetBios`;
      await api.post(resetTarget);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: factoryResetQueryKey });
    },
  });

  const isServerOff = computed<boolean>(() => {
    const powerState = systemQuery.data.value?.PowerState;
    return powerState ? powerState.toLowerCase() === 'off' : false;
  });

  const isBusy = computed<boolean>(
    () =>
      resetToDefaultsMutation.isPending.value ||
      resetBiosMutation.isPending.value,
  );
  const isError = computed<boolean>(
    () => managerQuery.isError.value || systemQuery.isError.value,
  );
  const isLoading = computed<boolean>(
    () =>
      rootLoading.value ||
      managerQuery.isLoading.value ||
      systemQuery.isLoading.value,
  );

  async function resetToDefaults(): Promise<void> {
    await resetToDefaultsMutation.mutateAsync();
  }

  async function resetBios(): Promise<void> {
    await resetBiosMutation.mutateAsync();
  }

  return {
    isServerOff,
    resetToDefaults,
    resetBios,
    isBusy,
    isError,
    isLoading,
  };
}
