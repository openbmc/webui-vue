import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { ComputedRef } from 'vue';
import api from '@/store/api';
import { useRedfishRoot } from '@/api/composables/useRedfishRoot';
import { useRedfishCollection } from '@/api/composables/useRedfishCollection';
import type { Chassis, EnvironmentMetrics } from '@/api/types/redfish';

export const powerControlQueryKey = ['redfish', 'environmentMetrics'] as const;

export interface UsePowerControlReturn {
  powerConsumptionValue: ComputedRef<number | null>;
  powerCapMin: ComputedRef<number | null>;
  powerCapMax: ComputedRef<number | null>;
  /** EnvironmentMetrics from Redfish; use data.PowerLimitWatts?.SetPoint etc. */
  environmentMetrics: ComputedRef<EnvironmentMetrics | null>;
  submitPowerControl: (
    powerCapValue: number | string | null,
    isPowerCapEnabled: boolean,
  ) => Promise<void>;
  metricsQuery: ReturnType<typeof useQuery<EnvironmentMetrics | null, unknown>>;
  mutation: ReturnType<
    typeof useMutation<
      string,
      unknown,
      {
        powerCapValue: number | string | null;
        isPowerCapEnabled: boolean;
      }
    >
  >;
}

/**
 * Composable for power control data fetching and mutations.
 * Focuses on query/mutation logic only - form state management is left to consuming components.
 * This maintains unidirectional data flow: query → component state → edit → mutation.
 */
export function usePowerControl(): UsePowerControlReturn {
  const queryClient = useQueryClient();

  // Ensure ServiceRoot is cached; useRedfishCollection uses it internally
  useRedfishRoot();
  const { data: chassisMembers } = useRedfishCollection<Chassis>(
    '/redfish/v1/Chassis',
    { expand: true, expandLevels: 2 },
  );

  const environmentMetricsUri = computed(() => {
    const members = chassisMembers.value;
    if (!members?.length) return null;
    const firstWithMetrics = members.find(
      (c: Chassis) => c.EnvironmentMetrics?.['@odata.id'],
    );
    return firstWithMetrics?.EnvironmentMetrics?.['@odata.id'] ?? null;
  });

  const metricsQuery = useQuery({
    queryKey: computed(() => [
      ...powerControlQueryKey,
      environmentMetricsUri.value,
    ]),
    queryFn: async () => {
      const uri = environmentMetricsUri.value;
      if (!uri) return null;
      const { data } = await api.get<EnvironmentMetrics>(uri);
      return data;
    },
    enabled: computed(() => !!environmentMetricsUri.value),
    staleTime: Infinity,
    gcTime: 300000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (prev) => prev,
    retry: (failureCount: number, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status && status >= 400 && status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const mutation = useMutation({
    mutationFn: async ({
      powerCapValue,
      isPowerCapEnabled,
    }: {
      powerCapValue: number | string | null;
      isPowerCapEnabled: boolean;
    }) => {
      const data = metricsQuery.data.value;
      const metricsUri = data?.['@odata.id'];
      if (!metricsUri) {
        throw new Error('Power control not loaded or not available');
      }
      const controlMode: 'Disabled' | 'Automatic' = isPowerCapEnabled
        ? 'Automatic'
        : 'Disabled';
      const setPoint = isPowerCapEnabled ? Number(powerCapValue) || 0 : 0;
      await api.patch(metricsUri, {
        PowerLimitWatts: {
          ControlMode: controlMode,
          SetPoint: setPoint,
        },
      });
      return metricsUri;
    },
    onSuccess: (metricsUri, variables) => {
      if (metricsUri) {
        queryClient.setQueryData<EnvironmentMetrics | null>(
          [...powerControlQueryKey, metricsUri],
          (old) => {
            if (!old) return old;
            const controlMode = variables.isPowerCapEnabled
              ? 'Automatic'
              : 'Disabled';
            const setPoint = variables.isPowerCapEnabled
              ? Number(variables.powerCapValue) || 0
              : undefined;
            return {
              ...old,
              PowerLimitWatts: {
                ...old.PowerLimitWatts,
                ControlMode: controlMode,
                ...(setPoint !== undefined && { SetPoint: setPoint }),
              },
            };
          },
        );
      }
      queryClient.invalidateQueries({ queryKey: powerControlQueryKey });
    },
  });

  const environmentMetrics = computed<EnvironmentMetrics | null>(
    () => metricsQuery.data.value ?? null,
  );

  const powerConsumptionValue = computed<number | null>(
    () => environmentMetrics.value?.PowerWatts?.Reading ?? null,
  );

  const powerCapMin = computed<number | null>(
    () => environmentMetrics.value?.PowerLimitWatts?.AllowableMin ?? null,
  );
  const powerCapMax = computed<number | null>(
    () => environmentMetrics.value?.PowerLimitWatts?.AllowableMax ?? null,
  );

  async function submitPowerControl(
    powerCapValue: number | string | null,
    isPowerCapEnabled: boolean,
  ): Promise<void> {
    await mutation.mutateAsync({
      powerCapValue,
      isPowerCapEnabled,
    });
  }

  return {
    powerConsumptionValue,
    powerCapMin,
    powerCapMax,
    environmentMetrics,
    submitPowerControl,
    metricsQuery,
    mutation,
  };
}
