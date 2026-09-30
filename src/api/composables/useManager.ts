import { useQuery, useMutation } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import type { ComputedRef, MaybeRefOrGetter } from 'vue';
import api from '@/store/api';
import { shouldRetry } from '@/api/composables/useAllSubResources';
import { useRedfishCollection } from '@/api/composables/useRedfishCollection';
import { useRedfishResource } from '@/api/composables/useRedfishResource';
import { useRedfishRoot } from '@/api/composables/useRedfishRoot';
import type {
  CollectionMember,
  Manager,
  RedfishCollection,
} from '@/api/types/redfish';

const serviceManagerQueryKey = ['redfish', 'serviceManager'] as const;

export interface UseManagerOptions {
  /** Manager to load. Defaults to ManagerProvidingService. */
  managerUri?: MaybeRefOrGetter<string | null | undefined>;
  /** Manager.Reset ResetType. Defaults to GracefulRestart. */
  ResetType?: MaybeRefOrGetter<string | null | undefined>;
}

export interface UseManagerReturn {
  Manager: ComputedRef<Manager | null>;
  lastRebootTime: ComputedRef<Date | null>;
  reset: () => Promise<void>;
  isBusy: ComputedRef<boolean>;
  isError: ComputedRef<boolean>;
  isLoading: ComputedRef<boolean>;
  canReset: ComputedRef<boolean>;
  allowableResetTypes: () => string[];
}

function resourcePath(uri: string): string {
  try {
    const path = uri.includes('://') ? new URL(uri).pathname : uri;
    return path.replace(/\/+$/, '');
  } catch {
    return uri.replace(/\/+$/, '');
  }
}

function sameManager(
  Manager: Manager | null | undefined,
  uri: string | null,
): Manager is Manager {
  if (!uri || !Manager) return false;
  const canonical = Manager['@odata.id'];
  if (!canonical) return true;
  return resourcePath(canonical) === resourcePath(uri);
}

/**
 * URI of the manager that provides this Redfish service.
 *
 * Same choice as GlobalStore.getBmcPath: ManagerProvidingService from
 * ServiceRoot, otherwise the first member of /redfish/v1/Managers.
 */
function useServiceManagerUri(enabled: ComputedRef<boolean>) {
  const ServiceRootQuery = useRedfishRoot(enabled);
  const ServiceRoot = computed(() => ServiceRootQuery.data.value);
  const providingUri = computed(
    () => ServiceRoot.value?.ManagerProvidingService?.['@odata.id'] ?? null,
  );
  const rootSettled = computed(
    () => ServiceRootQuery.isSuccess.value || ServiceRootQuery.isError.value,
  );
  const fallback = useQuery({
    queryKey: serviceManagerQueryKey,
    queryFn: async ({ signal }) => {
      const { data } = await api.get<RedfishCollection<CollectionMember>>(
        '/redfish/v1/Managers',
        { signal },
      );
      return data.Members?.[0]?.['@odata.id'] ?? null;
    },
    enabled: computed(
      () => enabled.value && rootSettled.value && !providingUri.value,
    ),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: shouldRetry,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  const managerUri = computed(
    () => providingUri.value ?? fallback.data.value ?? null,
  );

  return {
    managerUri,
    isLoading: computed(() => {
      if (!enabled.value || providingUri.value) return false;
      if (!rootSettled.value) return true;
      return fallback.isPending.value || fallback.isFetching.value;
    }),
    isError: computed(() => {
      if (!enabled.value || managerUri.value) return false;
      if (!rootSettled.value || fallback.isPending.value) return false;
      return ServiceRootQuery.isError.value || fallback.isError.value;
    }),
  };
}

/**
 * A Redfish Manager and its Reset action.
 *
 * A view talks only to this composable. It does not choose a collection URL
 * or resolve ManagerProvidingService.
 *
 * useManager() is the service manager. useManager.Managers() is the
 * collection, from ServiceRoot.Managers. useManager({ managerUri }) is one
 * member of that collection. A null managerUri disables the manager request
 * until the collection supplies an @odata.id.
 *
 * @example
 * const { data: Managers } = useManager.Managers();
 * const managerUri = computed(
 *   () =>
 *     Managers.value?.find((Manager) => Manager.Id === 'hmc')?.['@odata.id'] ??
 *     null,
 * );
 *
 * const { lastRebootTime, reset, canReset } = useManager();
 * const hmc = useManager({ managerUri });
 *
 * LastResetTime updates only after that manager finishes resetting, which is
 * later than the Reset POST. The manager query stays stale so each visit
 * refetches. Reset does not invalidate: that GET would race the reboot and
 * keep the pre-reset timestamp for the rest of the session.
 *
 * @param {UseManagerOptions} [options]
 * @param {MaybeRefOrGetter<string>} [options.managerUri] Manager to load.
 *   Defaults to ManagerProvidingService. Pass a URI for another manager,
 *   such as an HMC.
 * @param {MaybeRefOrGetter<string>} [options.ResetType] ResetType sent to
 *   Manager.Reset. Defaults to GracefulRestart.
 * @returns {UseManagerReturn}
 */
export function useManager(options: UseManagerOptions = {}): UseManagerReturn {
  const explicitUri = options.managerUri !== undefined;
  const serviceManager = useServiceManagerUri(computed(() => !explicitUri));
  const managerUri = computed(() => {
    if (options.managerUri !== undefined) {
      return toValue(options.managerUri) ?? null;
    }
    return serviceManager.managerUri.value;
  });
  const ResetType = computed(
    () => toValue(options.ResetType) || 'GracefulRestart',
  );
  const pathLoading = computed(() =>
    explicitUri ? false : serviceManager.isLoading.value,
  );
  const pathError = computed(() =>
    explicitUri ? false : serviceManager.isError.value,
  );

  const managerQuery = useRedfishResource<Manager>(managerUri, {
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const ManagerReset = useMutation<void, unknown, void, unknown>({
    mutationFn: async () => {
      const uri = managerUri.value;
      const Manager = managerQuery.data.value;
      if (
        !uri ||
        !sameManager(Manager, uri) ||
        !allowsResetType(ResetType.value)
      ) {
        throw new Error('Manager resource not available');
      }
      const resetTarget =
        Manager.Actions?.['#Manager.Reset']?.target ||
        `${resourcePath(Manager['@odata.id'] || uri)}/Actions/Manager.Reset`;
      await api.post(resetTarget, { ResetType: ResetType.value });
    },
  });

  const Manager = computed<Manager | null>(() => {
    const data = managerQuery.data.value;
    return sameManager(data, managerUri.value) ? data : null;
  });

  function allowableResetTypes(): string[] {
    const Reset = Manager.value?.Actions?.['#Manager.Reset'];
    return Reset?.['ResetType@Redfish.AllowableValues'] ?? [];
  }

  function allowsResetType(type: string): boolean {
    const allowed = allowableResetTypes();
    if (!allowed.length) return true;
    return allowed.includes(type);
  }
  const isBusy = computed<boolean>(() => ManagerReset.isPending.value);
  const isError = computed<boolean>(
    () => pathError.value || managerQuery.isError.value,
  );
  const isLoading = computed<boolean>(
    () => pathLoading.value || managerQuery.isLoading.value,
  );
  const lastRebootTime = computed<Date | null>(() => {
    const LastResetTime = Manager.value?.LastResetTime;
    if (!LastResetTime) return null;
    const date = new Date(LastResetTime);
    return Number.isNaN(date.getTime()) ? null : date;
  });
  const canReset = computed<boolean>(
    () =>
      !isBusy.value &&
      !isError.value &&
      Manager.value !== null &&
      allowsResetType(ResetType.value),
  );

  async function reset(): Promise<void> {
    await ManagerReset.mutateAsync();
  }

  return {
    Manager,
    lastRebootTime,
    reset,
    isBusy,
    isError,
    isLoading,
    canReset,
    allowableResetTypes,
  };
}

export namespace useManager {
  /** Members of the Managers collection, expanded when the service allows it. */
  export function Managers() {
    const { data: ServiceRoot } = useRedfishRoot();
    const path = computed(
      () =>
        ServiceRoot.value?.Managers?.['@odata.id'] || '/redfish/v1/Managers',
    );
    return useRedfishCollection<Manager>(path, { expand: true });
  }
}
