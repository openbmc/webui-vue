import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { ComputedRef } from 'vue';
import api from '@/store/api';
import { useRedfishRoot } from '@/api/composables/useRedfishRoot';
import { useRedfishCollection } from '@/api/composables/useRedfishCollection';
import {
  redfishResourceQueryKey,
  useRedfishResource,
} from '@/api/composables/useRedfishResource';
import type { Chassis, EnvironmentMetrics } from '@/api/types/redfish';

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
  metricsQuery: ReturnType<typeof useRedfishResource<EnvironmentMetrics>>;
  mutation: ReturnType<
    typeof useMutation<
      void,
      unknown,
      {
        powerCapValue: number | null;
        isPowerCapEnabled: boolean;
      },
      unknown
    >
  >;
  chassisQuery: ReturnType<typeof useRedfishCollection<Chassis>>;
  environmentMetricsUri: ComputedRef<string | null>;
}

/**
 * Composable for power control data fetching and mutations.
 * Focuses on query/mutation logic only - form state management is left to consuming components.
 * This maintains unidirectional data flow: query → component state → edit → mutation.
 *
 * Note: This implementation uses the first Chassis with EnvironmentMetrics.
 * In multi-chassis systems, only the first chassis with power metrics will be controlled.
 * This is intentional for the current use case but could be extended to support
 * chassis selection if needed in the future.
 */
export function usePowerControl(): UsePowerControlReturn {
  const queryClient = useQueryClient();

  // Ensure ServiceRoot is cached; useRedfishCollection uses it internally
  useRedfishRoot();
  const chassisQuery = useRedfishCollection<Chassis>(
    '/redfish/v1/Chassis',
    { expand: true, expandLevels: 2 },
  );
  const chassisMembers = chassisQuery.data;

  const environmentMetricsUri = computed(() => {
    const members = chassisMembers.value;
    if (!members?.length) return null;
    const firstWithMetrics = members.find(
      (c: Chassis) => c.EnvironmentMetrics?.['@odata.id'],
    );
    return firstWithMetrics?.EnvironmentMetrics?.['@odata.id'] ?? null;
  });

  const metricsQuery = useRedfishResource<EnvironmentMetrics>(
    environmentMetricsUri,
    {
      staleTime: 30000,
      refetchInterval: 30000,
      refetchIntervalInBackground: false,
      gcTime: 300000,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      placeholderData: (previous) => previous,
    },
  );

  const mutation = useMutation<
    void,
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
      // UI allows toggling between enabled/disabled.
      // When enabling: preserve the original mode if it was Manual/Override,
      // otherwise default to Automatic.
      // When disabling: always use Disabled.
      const originalMode = data?.PowerLimitWatts?.ControlMode ?? 'Disabled';
      const controlMode = isPowerCapEnabled
        ? originalMode === 'Disabled'
          ? 'Automatic'
          : originalMode
        : 'Disabled';
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
    },
    onSuccess: () => {
      // Invalidate queries to refetch fresh data from server
      // This ensures we get the actual server state after mutation
      queryClient.invalidateQueries({
        queryKey: [...redfishResourceQueryKey, environmentMetricsUri.value],
      });
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
    chassisQuery,
    environmentMetricsUri,
  };
}
