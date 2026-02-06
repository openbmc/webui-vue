import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { ComputedRef } from 'vue';
import api from '@/store/api';
import { useRedfishRoot } from '@/api/composables/useRedfishRoot';
import { useRedfishCollection } from '@/api/composables/useRedfishCollection';
import { shouldRetry } from '@/api/composables/useAllSubResources';
import type { Chassis, EnvironmentMetrics } from '@/api/types/redfish';

export const powerControlQueryKey = ['redfish', 'environmentMetrics'] as const;

export interface UsePowerControlReturn {
  powerConsumptionValue: ComputedRef<number | null>;
  powerCapMin: ComputedRef<number | null>;
  powerCapMax: ComputedRef<number | null>;
  /** EnvironmentMetrics from Redfish; use data.PowerLimitWatts?.SetPoint etc. */
  environmentMetrics: ComputedRef<EnvironmentMetrics | null>;
  submitPowerControl: (
    powerCapValue: number | null,
    isPowerCapEnabled: boolean,
  ) => Promise<void>;
  metricsQuery: ReturnType<typeof useQuery<EnvironmentMetrics | null, unknown>>;
  mutation: ReturnType<
    typeof useMutation<
      string,
      unknown,
      {
        powerCapValue: number | null;
        isPowerCapEnabled: boolean;
      },
      unknown
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
    queryFn: async ({ signal }) => {
      const uri = environmentMetricsUri.value;
      if (!uri) return null;
      const { data } = await api.get<EnvironmentMetrics>(uri, { signal });
      return data;
    },
    enabled: computed(() => !!environmentMetricsUri.value),
    staleTime: 30000, // 30 seconds - allow periodic refresh of power consumption
    gcTime: 300000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    placeholderData: (prev) => prev,
    retry: shouldRetry,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const mutation = useMutation<
    string,
    unknown,
    {
      powerCapValue: number | null;
      isPowerCapEnabled: boolean;
    },
    unknown
  >({
    mutationFn: async ({
      powerCapValue,
      isPowerCapEnabled,
    }: {
      powerCapValue: number | null;
      isPowerCapEnabled: boolean;
    }) => {
      const data = metricsQuery.data.value;
      const metricsUri = data?.['@odata.id'];
      if (!metricsUri) {
        throw new Error('Power control not loaded or not available');
      }
      const controlMode = isPowerCapEnabled ? 'Automatic' : 'Disabled';
      
      // Build the patch payload - omit SetPoint when disabling to avoid sending invalid 0 value
      const patchPayload: {
        PowerLimitWatts: {
          ControlMode: 'Automatic' | 'Disabled' | 'Manual' | 'Override';
          SetPoint?: number;
        };
      } = {
        PowerLimitWatts: {
          ControlMode: controlMode,
        },
      };
      
      // Only include SetPoint when enabling and value is provided
      if (isPowerCapEnabled && powerCapValue !== null) {
        patchPayload.PowerLimitWatts.SetPoint = powerCapValue;
      }
      
      await api.patch(metricsUri, patchPayload);
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
            
            const updatedPowerLimitWatts: typeof old.PowerLimitWatts = {
              ...old.PowerLimitWatts,
              ControlMode: controlMode,
            };
            
            // Only update SetPoint when enabling and value is provided
            if (variables.isPowerCapEnabled && variables.powerCapValue !== null) {
              updatedPowerLimitWatts.SetPoint = variables.powerCapValue;
            }
            
            return {
              ...old,
              PowerLimitWatts: updatedPowerLimitWatts,
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
    powerCapValue: number | null,
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
