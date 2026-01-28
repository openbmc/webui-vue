import { computed } from 'vue';
import { useAllSubResources } from '@/api/composables/useAllSubResources';

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
}

/**
 * Transforms raw sensor data from Redfish API to display format
 *
 * @param sensor - Raw sensor data from Redfish
 * @returns Transformed sensor data for display
 */
function transformSensorData(sensor: RawSensor): SensorDisplay {
  return {
    name: sensor.Name,
    status: sensor.Status?.Health || 'Unknown',
    currentValue:
      sensor.Reading ?? sensor.ReadingCelsius ?? sensor.ReadingVolts,
    lowerCaution:
      sensor.Thresholds?.LowerCaution?.Reading ??
      sensor.LowerThresholdNonCritical,
    upperCaution:
      sensor.Thresholds?.UpperCaution?.Reading ??
      sensor.UpperThresholdNonCritical,
    lowerCritical:
      sensor.Thresholds?.LowerCritical?.Reading ??
      sensor.LowerThresholdCritical,
    upperCritical:
      sensor.Thresholds?.UpperCritical?.Reading ??
      sensor.UpperThresholdCritical,
    units:
      sensor.ReadingUnits ?? (sensor.ReadingCelsius !== undefined ? '℃' : 'V'),
  };
}

/**
 * Composable for fetching all sensors from all chassis
 * Uses useAllSubResources for efficient fetching with:
 * - Automatic expand query support detection
 * - Deduplication by @odata.id
 * - Error aggregation
 * - Smart retry logic (skips 4xx errors)
 * - TanStack Query caching and state management
 *
 * @returns TanStack Query result with transformed sensor data
 */
export function useSensors() {
  const {
    data: rawSensors,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAllSubResources<RawSensor>('/redfish/v1/Chassis/chassis', 'Sensors');

  // Transform raw sensor data to display format
  const sensors = computed(() => {
    if (!rawSensors.value) return [];
    return rawSensors.value.map(transformSensorData);
  });

  return {
    data: sensors,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  };
}
