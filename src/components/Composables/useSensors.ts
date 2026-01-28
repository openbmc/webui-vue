import { useQuery } from '@tanstack/vue-query';
import api from '@/store/api';
import { uniqBy } from 'lodash';

/**
 * Sensor data format
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
 * Fetches the chassis collection
 */
async function getChassisCollection(): Promise<string[]> {
  try {
    const { data } = await api.get('/redfish/v1/Chassis');
    return data.Members.map(
      (member: { '@odata.id': string }) => member['@odata.id'],
    );
  } catch (error) {
    console.error('Error fetching chassis collection:', error);
    throw error;
  }
}

/**
 * Checks if expand query is supported
 */
async function supportsExpandQuery(): Promise<boolean> {
  try {
    const { data } = await api.get('/redfish/v1/');
    return data?.ProtocolFeaturesSupported?.ExpandQuery?.MaxLevels > 0;
  } catch (error) {
    console.error('Error checking expand query support:', error);
    return false;
  }
}

/**
 * Transforms sensor data to display format
 */
function transformSensorData(sensor: {
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
}): SensorDisplay {
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
 * Fetches sensors with expand query
 */
async function getSensorsWithExpand(
  chassisId: string,
): Promise<SensorDisplay[]> {
  try {
    const { data } = await api.get(`${chassisId}/Sensors?$expand=.($levels=1)`);
    return data.Members.map(transformSensorData);
  } catch (error) {
    console.error(
      `Error fetching sensors with expand for ${chassisId}:`,
      error,
    );
    return [];
  }
}

/**
 * Fetches sensors without expand query
 */
async function getSensorsWithoutExpand(
  chassisId: string,
): Promise<SensorDisplay[]> {
  try {
    const { data } = await api.get(`${chassisId}/Sensors`);
    const sensors = data.Members || [];

    const promises = sensors.map((sensor: { '@odata.id': string }) =>
      api.get(sensor['@odata.id']).catch((error) => {
        console.error(`Error fetching sensor ${sensor['@odata.id']}:`, error);
        return null;
      }),
    );

    const responses = await Promise.all(promises);
    return responses
      .filter((response) => response?.data)
      .map((response) => transformSensorData(response.data));
  } catch (error) {
    console.error(
      `Error fetching sensors without expand for ${chassisId}:`,
      error,
    );
    return [];
  }
}

/**
 * Fetches all sensors for a single chassis
 * Only uses the modern Sensors collection endpoint
 */
async function getAllSensorsForChassis(
  chassisId: string,
): Promise<SensorDisplay[]> {
  const supportsExpand = await supportsExpandQuery();

  const sensors = supportsExpand
    ? await getSensorsWithExpand(chassisId)
    : await getSensorsWithoutExpand(chassisId);

  return uniqBy(sensors, 'name');
}

/**
 * Fetches all sensors from all chassis
 */
async function getAllSensors(): Promise<SensorDisplay[]> {
  try {
    const chassisCollection = await getChassisCollection();

    const sensorPromises = chassisCollection.map((chassisId) =>
      getAllSensorsForChassis(chassisId),
    );

    const sensorArrays = await Promise.all(sensorPromises);
    const allSensors = sensorArrays.flat();

    return uniqBy(allSensors, 'name');
  } catch (error) {
    console.error('Error fetching all sensors:', error);
    throw error;
  }
}

/**
 * Composable for fetching all sensors
 * Uses TanStack Query for caching and state management
 */
export function useSensors() {
  return useQuery({
    queryKey: ['sensors'],
    queryFn: getAllSensors,
    staleTime: 30000,
    gcTime: 300000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
