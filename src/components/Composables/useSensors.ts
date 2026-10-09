import { computed } from 'vue';
import { useQueries } from '@tanstack/vue-query';
import {
  useRedfishCollection,
  fetchRedfishCollection,
} from '@/api/composables/useRedfishCollection';
import { shouldRetry } from '@/api/composables/useAllSubResources';
import type { Chassis } from '@/api/types/redfish';
import i18n from '@/i18n';

/**
 * Raw sensor data from Redfish API
 */
interface RawSensor {
  '@odata.id': string;
  Name: string;
  Status?: { Health?: string };
  Reading?: number;
  ReadingCelsius?: number;
  ReadingVolts?: number;
  ReadingUnits?: string;
  ReadingType?: string;
  Thresholds?: {
    LowerCaution?: { Reading?: number };
    UpperCaution?: { Reading?: number };
    LowerCritical?: { Reading?: number };
    UpperCritical?: { Reading?: number };
  };
  LowerThresholdNonCritical?: number;
  UpperThresholdNonCritical?: number;
  LowerThresholdCritical?: number;
  UpperThresholdCritical?: number;
}

/**
 * Sensor data format for display
 */
export interface SensorDisplay {
  name: string;
  status: string;
  currentValue: number | undefined;
  lowerCaution: number | undefined;
  upperCaution: number | undefined;
  lowerCritical: number | undefined;
  upperCritical: number | undefined;
  units: string;
  currentValueDisplay: string;
  lowerCautionDisplay: string;
  upperCautionDisplay: string;
  lowerCriticalDisplay: string;
  upperCriticalDisplay: string;
}

/**
 * Helper function to format a value with units
 * Only shows units if the value is defined
 */
function formatValueWithUnit(value: number | undefined, units: string): string {
  if (value === undefined) {
    return '';
  }
  return units ? ` ${units}` : '';
}

/**
 * Transforms raw sensor data from Redfish API to display format
 *
 * @param sensor - Raw sensor data from Redfish
 * @returns Transformed sensor data for display
 */
function transformSensorData(sensor: RawSensor): SensorDisplay {
  const currentValue =
    sensor.Reading ?? sensor.ReadingCelsius ?? sensor.ReadingVolts;
  const lowerCaution =
    sensor.Thresholds?.LowerCaution?.Reading ??
    sensor.LowerThresholdNonCritical;
  const upperCaution =
    sensor.Thresholds?.UpperCaution?.Reading ??
    sensor.UpperThresholdNonCritical;
  const lowerCritical =
    sensor.Thresholds?.LowerCritical?.Reading ?? sensor.LowerThresholdCritical;
  const upperCritical =
    sensor.Thresholds?.UpperCritical?.Reading ?? sensor.UpperThresholdCritical;

  // Determine units based on sensor type
  let units = '';
  if (sensor.ReadingUnits) {
    units = sensor.ReadingUnits;
  } else if (sensor.ReadingCelsius !== undefined) {
    units = i18n.global.t('unit.℃');
  } else if (
    sensor.ReadingType === 'Voltage' ||
    sensor.ReadingVolts !== undefined
  ) {
    units = i18n.global.t('unit.V');
  }

  return {
    name: sensor.Name,
    status: sensor.Status?.Health || 'Unknown',
    currentValue,
    lowerCaution,
    upperCaution,
    lowerCritical,
    upperCritical,
    units,
    currentValueDisplay: formatValueWithUnit(currentValue, units),
    lowerCautionDisplay: formatValueWithUnit(lowerCaution, units),
    upperCautionDisplay: formatValueWithUnit(upperCaution, units),
    lowerCriticalDisplay: formatValueWithUnit(lowerCritical, units),
    upperCriticalDisplay: formatValueWithUnit(upperCritical, units),
  };
}

/**
 * Sensors belonging to a single chassis
 */
export interface ChassisSensorGroup {
  /** Chassis Id (e.g. "chassis0") */
  chassisId: string;
  /** Human-readable chassis name */
  chassisName: string;
  sensors: SensorDisplay[];
}

/**
 * Composable for fetching sensors from all chassis, grouped by chassis.
 *
 * Fetches the Chassis collection, then runs one query per chassis that has a
 * Sensors link (in parallel). Each query uses $expand when the BMC supports it
 * and falls back to individual member fetches otherwise.
 *
 * Returns:
 *  - `data`             - flat list of sensors from all chassis
 *  - `sensorsByChassis` - one { chassisId, chassisName, sensors } per chassis
 *    that has a Sensors sub-resource
 */
export function useSensors() {
  const chassisQuery = useRedfishCollection<Chassis>('/redfish/v1/Chassis', {
    expand: true,
  });

  const chassisSensorPaths = computed(() =>
    (chassisQuery.data.value ?? [])
      .filter((c: Chassis) => c?.Sensors?.['@odata.id'])
      .map((c: Chassis) => ({
        chassisId: c.Id,
        chassisName: c.Name,
        sensorsPath: c.Sensors!['@odata.id'],
      })),
  );

  // One query per chassis, run in parallel
  const perChassisQueries = useQueries({
    queries: computed(() =>
      chassisSensorPaths.value.map(
        ({ chassisId, chassisName, sensorsPath }) => ({
          queryKey: ['redfish', 'sensors', sensorsPath],
          queryFn: async (): Promise<ChassisSensorGroup> => {
            const members =
              await fetchRedfishCollection<RawSensor>(sensorsPath);

            // Deduplicate by @odata.id and sort for stable ordering
            const seen = new Set<string>();
            const sensors = members
              .filter((s) => {
                const id = s['@odata.id'];
                if (!id) return true;
                if (seen.has(id)) return false;
                seen.add(id);
                return true;
              })
              .sort((a, b) =>
                (a['@odata.id'] || '').localeCompare(b['@odata.id'] || ''),
              )
              .map(transformSensorData);

            return { chassisId, chassisName, sensors };
          },
          staleTime: 60000,
          refetchOnMount: false,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          retry: shouldRetry,
          retryDelay: (attemptIndex: number) =>
            Math.min(1000 * 2 ** attemptIndex, 30000),
        }),
      ),
    ),
  });

  // Per-chassis grouping - only chassis whose query has resolved
  const sensorsByChassis = computed<ChassisSensorGroup[]>(() =>
    perChassisQueries.value
      .map((q) => q.data)
      .filter((g): g is ChassisSensorGroup => g != null),
  );

  const sensors = computed<SensorDisplay[]>(() =>
    sensorsByChassis.value.flatMap((g) => g.sensors),
  );

  const refetch = async () => {
    await Promise.all([
      chassisQuery.refetch(),
      ...perChassisQueries.value.map((q) => q.refetch()),
    ]);
  };

  return {
    data: sensors,
    sensorsByChassis,
    isLoading: computed(
      () =>
        chassisQuery.isLoading.value ||
        perChassisQueries.value.some((q) => q.isLoading),
    ),
    isFetching: computed(
      () =>
        chassisQuery.isFetching.value ||
        perChassisQueries.value.some((q) => q.isFetching),
    ),
    error: computed(
      () =>
        chassisQuery.error.value ??
        perChassisQueries.value.find((q) => q.error)?.error ??
        null,
    ),
    isError: computed(
      () =>
        !!chassisQuery.error.value ||
        perChassisQueries.value.some((q) => q.isError),
    ),
    refetch,
  };
}
