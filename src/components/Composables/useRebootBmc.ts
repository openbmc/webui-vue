import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { ComputedRef } from 'vue';
import api from '@/store/api';
import { useRedfishRoot } from '@/api/composables/useRedfishRoot';
import { shouldRetry } from '@/api/composables/useAllSubResources';
import type { Manager } from '@/api/types/redfish';

export const rebootBmcQueryKey = ['redfish', 'bmcManager'] as const;

export interface UseRebootBmcReturn {
  lastBmcRebootTime: ComputedRef<Date | null>;
  rebootBmc: () => Promise<void>;
  isBusy: ComputedRef<boolean>;
  isError: ComputedRef<boolean>;
  isLoading: ComputedRef<boolean>;
  isRebootEnabled: ComputedRef<boolean>;
}

export function useRebootBmc(): UseRebootBmcReturn {
  const queryClient = useQueryClient();
  const { data: serviceRoot, isLoading: rootLoading } = useRedfishRoot();

  const managersCollectionUri = computed<string | null>(
    () => serviceRoot.value?.Managers?.['@odata.id'] ?? null,
  );

  const bmcQuery = useQuery<Manager | null, unknown>({
    queryKey: computed(() => [...rebootBmcQueryKey, managersCollectionUri.value]),
    queryFn: async ({ signal }) => {
      const collectUri = managersCollectionUri.value;
      if (!collectUri) return null;
      const { data: collection } = await api.get<{
        Members?: { '@odata.id': string }[];
      }>(collectUri, { signal });
      const firstMemberUri = collection.Members?.[0]?.['@odata.id'];
      if (!firstMemberUri) return null;
      const { data } = await api.get<Manager>(firstMemberUri, { signal });
      return data;
    },
    enabled: computed(() => !!managersCollectionUri.value),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: shouldRetry,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const mutation = useMutation<void, unknown, void, unknown>({
    mutationFn: async () => {
      const manager = bmcQuery.data.value;
      if (!manager) throw new Error('Manager resource not available');
      const resetTarget =
        manager.Actions?.['#Manager.Reset']?.target ??
        `${manager['@odata.id']}/Actions/Manager.Reset`;
      await api.post(resetTarget, { ResetType: 'GracefulRestart' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rebootBmcQueryKey });
    },
  });

  const lastBmcRebootTime = computed<Date | null>(() => {
    const lastReset = bmcQuery.data.value?.LastResetTime;
    return lastReset ? new Date(lastReset) : null;
  });

  const isBusy = computed<boolean>(() => mutation.isPending.value);
  const isError = computed<boolean>(() => bmcQuery.isError.value);
  const isLoading = computed<boolean>(
    () => rootLoading.value || bmcQuery.isLoading.value,
  );
  const isRebootEnabled = computed<boolean>(
    () => !isBusy.value && !isError.value && !!bmcQuery.data.value,
  );

  async function rebootBmc(): Promise<void> {
    await mutation.mutateAsync();
  }

  return {
    lastBmcRebootTime,
    rebootBmc,
    isBusy,
    isError,
    isLoading,
    isRebootEnabled,
  };
}
