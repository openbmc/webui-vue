import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { ComputedRef } from 'vue';
import api from '@/store/api';
import i18n from '@/i18n';
import { shouldRetry } from '@/api/composables/useAllSubResources';
import type { System, PowerRestorePolicyTypes } from '@/api/types/redfish';

export const powerRestorePolicyQueryKey = [
  'redfish',
  'powerRestorePolicy',
] as const;

export interface PolicyOption {
  value: string;
  text: string;
}

export interface UsePowerRestorePolicyReturn {
  /** Currently configured power restore policy value */
  currentPolicy: ComputedRef<string | null>;
  /** Available policy options for display in a radio group */
  policyOptions: ComputedRef<PolicyOption[]>;
  /** Set a new power restore policy */
  setPolicy: (policy: string) => Promise<void>;
  isLoading: ComputedRef<boolean>;
  isError: ComputedRef<boolean>;
  isSaving: ComputedRef<boolean>;
}

/**
 * Composable for Power Restore Policy data fetching and mutations.
 *
 * Available policies are sourced from the Redfish ComputerSystem JsonSchema
 * (`/redfish/v1/JsonSchemas/ComputerSystem`). The current policy and PATCH
 * target both use the first entry in `/redfish/v1/Systems`.
 */
export function usePowerRestorePolicy(): UsePowerRestorePolicyReturn {
  const queryClient = useQueryClient();

  // Fetch the System resource — resolves /redfish/v1/Systems to its first
  // member and fetches it in a single query, matching the useRebootBmc pattern.
  const systemQuery = useQuery<System | null, unknown>({
    queryKey: [...powerRestorePolicyQueryKey, 'system'],
    queryFn: async ({ signal }) => {
      const { data: collection } = await api.get<{
        Members?: { '@odata.id': string }[];
      }>('/redfish/v1/Systems', { signal });
      const systemUri = collection.Members?.[0]?.['@odata.id'];
      if (!systemUri) return null;
      const { data } = await api.get<System>(systemUri, { signal });
      return data;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: shouldRetry,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch available policy enum values from the ComputerSystem JsonSchema.
  // Label format matches the original store: translated name + " - " + Redfish description.
  const schemaPoliciesQuery = useQuery<PolicyOption[], unknown>({
    queryKey: [...powerRestorePolicyQueryKey, 'schemaOptions'],
    queryFn: async ({ signal }) => {
      const { data: index } = await api.get<{
        Location?: { Uri?: string }[];
      }>('/redfish/v1/JsonSchemas/ComputerSystem', { signal });

      const schemaUri = index.Location?.[0]?.Uri;
      if (!schemaUri) return [];

      const { data: schema } = await api.get<{
        definitions?: { PowerRestorePolicyTypes?: PowerRestorePolicyTypes };
      }>(schemaUri, { signal });

      const policyTypes = schema.definitions?.PowerRestorePolicyTypes;
      if (!policyTypes?.enum) return [];

      return policyTypes.enum.map((value) => ({
        value,
        text: `${i18n.global.t(`pagePowerRestorePolicy.policies.${value}`)} - ${policyTypes.enumDescriptions?.[value] ?? ''}`,
      }));
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: shouldRetry,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const mutation = useMutation<void, unknown, string, unknown>({
    mutationFn: async (policy: string) => {
      const uri = systemQuery.data.value?.['@odata.id'];
      if (!uri) throw new Error('System resource not available');
      await api.patch<void>(uri, { PowerRestorePolicy: policy });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: powerRestorePolicyQueryKey });
    },
  });

  const currentPolicy = computed<string | null>(
    () => systemQuery.data.value?.PowerRestorePolicy ?? null,
  );

  const policyOptions = computed<PolicyOption[]>(
    () => schemaPoliciesQuery.data.value ?? [],
  );

  const isLoading = computed<boolean>(
    () => systemQuery.isLoading.value || schemaPoliciesQuery.isLoading.value,
  );

  const isError = computed<boolean>(
    () => systemQuery.isError.value || schemaPoliciesQuery.isError.value,
  );

  const isSaving = computed<boolean>(() => mutation.isPending.value);

  async function setPolicy(policy: string): Promise<void> {
    await mutation.mutateAsync(policy);
  }

  return {
    currentPolicy,
    policyOptions,
    setPolicy,
    isLoading,
    isError,
    isSaving,
  };
}
