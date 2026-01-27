/**
 * Firmware Inventory Composable
 *
 * Uses useRedfishCollection to fetch firmware inventory with $expand optimization.
 * Categorizes firmware items into BMC and BIOS based on RelatedItem.
 *
 * Returns raw Redfish SoftwareInventory models - Redfish first!
 *
 * Replaces the manual API calls in FirmwareStore.getFirmwareInventory()
 * with Vue Query's automatic caching, refetching, and loading states.
 */
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { useRedfishCollection } from '@/api/composables/useRedfishCollection';
import { apiInstance } from '@/api/mutator/axios-instance';
import type { SoftwareInventory } from '@/api/model/SoftwareInventory';
// @ts-ignore - Vuex store doesn't have TypeScript declarations
import store from '@/store';

// Redfish resource types for API responses
interface Manager {
  data?: {
    Links?: {
      ActiveSoftwareImage?: { '@odata.id'?: string };
    };
  };
}

interface Bios {
  Links?: { ActiveSoftwareImage?: { '@odata.id'?: string } };
}

/**
 * Composable for fetching and categorizing firmware inventory.
 *
 * Uses $expand to fetch all firmware items in a single request (when supported).
 * Categorizes items into BMC and BIOS based on RelatedItem references.
 *
 * Returns raw SoftwareInventory models with Redfish property names:
 * - Id, Version, Status.Health, @odata.id
 *
 * @returns Reactive firmware inventory data with BMC and BIOS SoftwareInventory items
 */
export function useFirmwareInventory() {
  // Fetch firmware inventory with $expand optimization
  const { data, isLoading: isInventoryLoading, error, refetch } =
    useRedfishCollection<SoftwareInventory>(
      '/redfish/v1/UpdateService/FirmwareInventory',
      { $expand: '.' },
    );

  // Fetch active BMC firmware ID from cached Manager (via GlobalStore)
  const { data: BmcActiveFirmwareId, isLoading: isBmcActiveLoading } = useQuery({
    queryKey: ['firmware', 'activeBmc'],
    queryFn: async (): Promise<string | null> => {
      const manager = (await store.dispatch(
        'global/getManagerProvidingService',
      )) as Manager;
      const Id =
        manager?.data?.Links?.ActiveSoftwareImage?.['@odata.id']
          ?.split('/')
          .pop() ?? null;
      return Id;
    },
    retry: false,
    staleTime: 30000, // 30 seconds - prevents duplicate fetches across components
  });

  // Fetch active BIOS firmware ID from System (may not exist on all systems)
  const { data: BiosActiveFirmwareId, isLoading: isBiosActiveLoading } = useQuery({
    queryKey: ['firmware', 'activeBios'],
    queryFn: async (): Promise<string | null> => {
      try {
        const systemPath = (await store.dispatch(
          'global/getSystemPath',
        )) as string | null;
        if (!systemPath) return null;

        const response = await apiInstance<Bios>({
          url: `${systemPath}/Bios`,
          method: 'GET',
        });
        const Id =
          response?.Links?.ActiveSoftwareImage?.['@odata.id']?.split('/').pop() ?? null;
        return Id;
      } catch {
        // BIOS endpoint may not exist on all systems
        return null;
      }
    },
    retry: false,
    staleTime: 30000, // 30 seconds - prevents duplicate fetches across components
  });

  // Categorize firmware into BMC and BIOS - returns raw SoftwareInventory
  // Match BMC firmware by:
  // 1. RelatedItem pointing to a Chassis containing 'BMC' (e.g., '/redfish/v1/Chassis/BMC_0')
  // 2. Or Id containing 'BMC' but not 'HGX' 
  const BmcFirmware = computed<SoftwareInventory[]>(() => {
    const Members = data.value?.Members ?? [];
    const filtered = Members.filter((Item) => {
      const RelatedItem = Item.RelatedItem?.[0]?.['@odata.id'];
      const chassisName = RelatedItem?.split('/').pop()?.toUpperCase();
      // Match if RelatedItem points to a BMC chassis (but not HGX_BMC)
      if (chassisName?.includes('BMC') && !chassisName?.includes('HGX')) {
        return true;
      }
      // Fallback: match by Id if no RelatedItem
      if (!RelatedItem && Item.Id) {
        const id = Item.Id.toUpperCase();
        return id.includes('BMC') && !id.includes('HGX');
      }
      return false;
    });
    return filtered;
  });

  // Match BIOS/UEFI firmware by RelatedItem or Id
  const BiosFirmware = computed<SoftwareInventory[]>(() => {
    const Members = data.value?.Members ?? [];
    return Members.filter((Item) => {
      const RelatedItem = Item.RelatedItem?.[0]?.['@odata.id'];
      const chassisName = RelatedItem?.split('/').pop()?.toUpperCase();
      // Match if RelatedItem points to BIOS
      if (chassisName?.includes('BIOS')) {
        return true;
      }
      // Fallback: match by Id if it's UEFI/BIOS
      if (Item.Id) {
        const id = Item.Id.toUpperCase();
        return id === 'UEFI' || id.includes('BIOS');
      }
      return false;
    });
  });

  // Computed properties for active/backup firmware
  const isSingleFileUploadEnabled = computed(() => BiosFirmware.value.length === 0);

  // Active firmware: match by ID, or fall back to first item if ID is undefined
  const ActiveBmcFirmware = computed(() =>
    BmcFirmware.value.find((Fw) => Fw.Id === BmcActiveFirmwareId.value) ??
    BmcFirmware.value[0],
  );

  const ActiveBiosFirmware = computed(() =>
    BiosFirmware.value.find((Fw) => Fw.Id === BiosActiveFirmwareId.value) ??
    BiosFirmware.value[0],
  );

  // Backup firmware: find item that doesn't match the active firmware's Id
  // Uses the actual active firmware's Id (not the query data) to handle fallback case
  const BackupBmcFirmware = computed(() => {
    const activeId = ActiveBmcFirmware.value?.Id;
    if (!activeId) return undefined;
    return BmcFirmware.value.find((Fw) => Fw.Id !== activeId);
  });

  const BackupBiosFirmware = computed(() => {
    const activeId = ActiveBiosFirmware.value?.Id;
    if (!activeId) return undefined;
    return BiosFirmware.value.find((Fw) => Fw.Id !== activeId);
  });

  const isLoading = computed(
    () => isInventoryLoading.value || isBmcActiveLoading.value || isBiosActiveLoading.value,
  );

  return {
    // Raw SoftwareInventory collections
    BmcFirmware,
    BiosFirmware,
    BmcActiveFirmwareId,
    BiosActiveFirmwareId,
    // Computed active/backup firmware
    isSingleFileUploadEnabled,
    ActiveBmcFirmware,
    ActiveBiosFirmware,
    BackupBmcFirmware,
    BackupBiosFirmware,
    // Loading/error states
    isLoading,
    error,
    refetch,
  };
}
