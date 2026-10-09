import { computed, nextTick } from 'vue';
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
 * Helper function to format the unit suffix for a sensor reading.
 * Returns a leading-space unit string (e.g. " ℃") when both the value is
 * defined and a unit string is present; returns '' otherwise.
 * The numeric value itself is rendered separately by the table cell template.
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
 * Sensors belonging to a single chassis, including fetch state so the UI
 * can show a loading / error placeholder for chassis whose query is in flight
 * or has failed.
 */
export interface ChassisSensorGroup {
  /** Chassis Id (e.g. "chassis0") */
  chassisId: string;
  /** Human-readable chassis name */
  chassisName: string;
  sensors: SensorDisplay[];
  /** True while the sensor query for this chassis is running */
  isLoading: boolean;
  /** True when the sensor query for this chassis has failed */
  isError: boolean;
  /** Error object when isError is true */
  error: Error | null;
}

// Shared query options applied to every per-chassis sensor query.
// staleTime: Infinity matches the previous useAllSubResources behaviour.
// There is no refetchInterval here, so setting a finite staleTime only
// marks the data stale without ever triggering a background refetch.
const SENSOR_QUERY_OPTIONS = {
  staleTime: Infinity,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: shouldRetry,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

/**
 * Composable for fetching sensors from all chassis, grouped by chassis.
 *
 * Fetches the Chassis collection, then runs one query per chassis that has a
 * Sensors link (in parallel). Each query uses $expand when the BMC supports it
 * and falls back to individual member fetches otherwise.
 *
 * The tab list is derived from chassisSensorPaths (known once the Chassis
 * collection loads), so every chassis appears in the tabs immediately —
 * including those whose sensor query is still loading or has errored.
 *
 * Returns:
 *  - `data`             - flat list of sensors from all chassis
 *  - `sensorsByChassis` - one ChassisSensorGroup per chassis that has a
 *    Sensors sub-resource (present as soon as chassis topology is loaded,
 *    even before individual sensor queries resolve)
 */
export function useSensors() {
  const chassisQuery = useRedfishCollection<Chassis>('/redfish/v1/Chassis', {
    expand: true,
  });

  // Known chassis paths — available as soon as the Chassis collection loads,
  // regardless of whether their per-chassis sensor queries have resolved.
  const chassisSensorPaths = computed(() =>
    (chassisQuery.data.value ?? [])
      .filter((c: Chassis) => c?.Sensors?.['@odata.id'])
      .map((c: Chassis) => ({
        chassisId: c.Id,
        chassisName: c.Name,
        sensorsPath: c.Sensors!['@odata.id'],
      })),
  );

  // One query per chassis, run in parallel.
  const perChassisQueries = useQueries({
    queries: computed(() =>
      chassisSensorPaths.value.map(({ sensorsPath }) => ({
        queryKey: ['redfish', 'sensorGroup', sensorsPath],
        queryFn: async (): Promise<SensorDisplay[]> => {
          const members = await fetchRedfishCollection<RawSensor>(sensorsPath);

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

          return sensors;
        },
        ...SENSOR_QUERY_OPTIONS,
      })),
    ),
  });

  // Derive one group per chassis from chassisSensorPaths so that tabs appear
  // for every chassis as soon as the Chassis collection loads — not only after
  // the sensor query for that chassis resolves.  Loading / error state is
  // merged in from the corresponding per-chassis query.
  // useQueries returns results in the same order as the queries, so match by
  // index: a pending or failed query has no data to match an id against.
  const sensorsByChassis = computed<ChassisSensorGroup[]>(() =>
    chassisSensorPaths.value.map(({ chassisId, chassisName }, index) => {
      const query = perChassisQueries.value[index];
      return {
        chassisId,
        chassisName,
        sensors: query?.data ?? [],
        isLoading: query ? query.isLoading : true,
        isError: query ? query.isError : false,
        error: (query?.error as Error | null) ?? null,
      };
    }),
  );

  const sensors = computed<SensorDisplay[]>(() =>
    sensorsByChassis.value.flatMap((g) => g.sensors),
  );

  // refetch() refreshes the chassis list first, waits for the per-chassis
  // queries to be rebuilt from it (so chassis that only appear in the new
  // response are included), then refetches all of them in parallel.
  // Two nextTick() awaits are used to ensure Vue has fully flushed both the
  // chassisSensorPaths computed update and the useQueries reactive rebuild
  // before the per-chassis refetch calls are dispatched.
  const refetch = async () => {
    await chassisQuery.refetch();
    await nextTick();
    await nextTick();
    await Promise.all(perChassisQueries.value.map((q) => q.refetch()));
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
    // Note: surfaces only the first errored chassis query. Callers that need
    // per-chassis granularity should use `sensorsByChassis[n].error` instead.
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
