import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, ref, watch } from 'vue';
import type { Ref, ComputedRef, WritableComputedRef } from 'vue';
import {
  getPowerControl,
  setPowerControl as setPowerControlApi,
  type PowerControlData,
} from '@/api/services/powerControlService';

export const powerControlQueryKey = ['powerControl'] as const;

function shouldRetry(failureCount: number, error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  if (status && status >= 400 && status < 500) {
    return false;
  }
  return failureCount < 3;
}

export interface UsePowerControlReturn {
  powerConsumptionValue: ComputedRef<number | null>;
  powerCapValue: WritableComputedRef<number | string | null>;
  isPowerCapFieldEnabled: WritableComputedRef<boolean>;
  powerCapMin: ComputedRef<number | null>;
  powerCapMax: ComputedRef<number | null>;
  powerControlData: ComputedRef<PowerControlData | null>;
  submitPowerControl: (
    powerCapValue: number | string | null,
    isPowerCapEnabled: boolean,
  ) => Promise<string>;
  query: ReturnType<typeof useQuery<PowerControlData | null, unknown>>;
  mutation: ReturnType<
    typeof useMutation<
      string,
      unknown,
      { powerCapValue: number | string | null; isPowerCapEnabled: boolean }
    >
  >;
}

/**
 * TanStack Query + Mutation composable for Power Control (EnvironmentMetrics)
 */
export function usePowerControl(): UsePowerControlReturn {
  const queryClient = useQueryClient();
  const powerCapValueRef: Ref<number | string | null> = ref(null);

  const query = useQuery({
    queryKey: powerControlQueryKey,
    queryFn: getPowerControl,
    staleTime: 30000,
    gcTime: 300000,
    refetchOnWindowFocus: true,
    retry: shouldRetry,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const mutation = useMutation({
    mutationFn: ({
      powerCapValue,
      isPowerCapEnabled,
    }: {
      powerCapValue: number | string | null;
      isPowerCapEnabled: boolean;
    }) => {
      const data = query.data.value;
      if (!data?.powerCapUri) {
        return Promise.reject(
          new Error('Power control not loaded or not available'),
        );
      }
      const controlMode: 'Disabled' | 'Automatic' = isPowerCapEnabled
        ? 'Automatic'
        : 'Disabled';
      const setPoint = isPowerCapEnabled ? Number(powerCapValue) || 0 : 0;
      return setPowerControlApi(
        { powerCapUri: data.powerCapUri },
        setPoint,
        controlMode,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: powerControlQueryKey });
    },
  });

  // Sync form state from query data: checkbox reflects ControlMode (Automatic = enabled, else disabled)
  watch(
    () => query.data.value,
    (data) => {
      if (!data) return;
      const isAutomatic = data.powerControlMode === 'Automatic';
      if (isAutomatic) {
        powerCapValueRef.value = data.powerCapValue ?? '';
      } else {
        powerCapValueRef.value = null;
      }
    },
    { immediate: true },
  );

  const powerControlData = computed<PowerControlData | null>(
    () => query.data.value ?? null,
  );

  const powerConsumptionValue = computed<number | null>(
    () => powerControlData.value?.powerConsumptionValue ?? null,
  );

  const powerCapValue = computed({
    get: () => powerCapValueRef.value,
    set: (v: number | string | null) => {
      powerCapValueRef.value = v;
    },
  });

  const isPowerCapFieldEnabled = computed({
    get: () => powerCapValueRef.value !== null,
    set: (enabled: boolean) => {
      if (enabled) {
        powerCapValueRef.value =
          powerCapValueRef.value != null ? powerCapValueRef.value : '';
      } else {
        powerCapValueRef.value = null;
      }
    },
  });

  const powerCapMin = computed<number | null>(
    () => powerControlData.value?.powerCapMin ?? null,
  );
  const powerCapMax = computed<number | null>(
    () => powerControlData.value?.powerCapMax ?? null,
  );

  function submitPowerControl(
    powerCapValue: number | string | null,
    isPowerCapEnabled: boolean,
  ): Promise<string> {
    return mutation.mutateAsync({ powerCapValue, isPowerCapEnabled });
  }

  return {
    powerConsumptionValue,
    powerCapValue,
    isPowerCapFieldEnabled,
    powerCapMin,
    powerCapMax,
    powerControlData,
    submitPowerControl,
    query,
    mutation,
  };
}
