import api from '@/store/api';
import { uniqBy } from 'lodash';

/**
 * Fetches the chassis collection from Redfish API
 * @returns {Promise<string[]>} Array of chassis URIs
 */
export async function getChassisCollection() {
  try {
    const { data } = await api.get('/redfish/v1/Chassis');
    return data.Members.map((member) => member['@odata.id']);
  } catch (error) {
    console.error('Error fetching chassis collection:', error);
    throw error;
  }
}

/**
 * Checks if the Redfish service supports expand query parameters
 * @returns {Promise<boolean>}
 */
export async function supportsExpandQuery() {
  try {
    const { data } = await api.get('/redfish/v1/');
    return data?.ProtocolFeaturesSupported?.ExpandQuery?.MaxLevels > 0;
  } catch (error) {
    console.error('Error checking expand query support:', error);
    return false;
  }
}

/**
 * Transforms sensor data to a consistent format
 * @param {Object} sensor - Raw sensor data from API
 * @returns {Object} Formatted sensor data
 */
function transformSensorData(sensor) {
  return {
    name: sensor.Name,
    status: sensor.Status?.Health,
    currentValue:
      sensor.Reading || sensor.ReadingCelsius || sensor.ReadingVolts,
    lowerCaution:
      sensor.Thresholds?.LowerCaution?.Reading ||
      sensor.LowerThresholdNonCritical,
    upperCaution:
      sensor.Thresholds?.UpperCaution?.Reading ||
      sensor.UpperThresholdNonCritical,
    lowerCritical:
      sensor.Thresholds?.LowerCritical?.Reading ||
      sensor.LowerThresholdCritical,
    upperCritical:
      sensor.Thresholds?.UpperCritical?.Reading ||
      sensor.UpperThresholdCritical,
    units:
      sensor.ReadingUnits || (sensor.ReadingCelsius !== undefined ? '℃' : 'V'),
  };
}

/**
 * Fetches sensors using expand query parameters (more efficient)
 * @param {string} chassisId - Chassis URI
 * @returns {Promise<Object[]>} Array of sensor data
 */
export async function getSensorsWithExpand(chassisId) {
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
 * Fetches sensors without expand query (fallback method)
 * @param {string} chassisId - Chassis URI
 * @returns {Promise<Object[]>} Array of sensor data
 */
export async function getSensorsWithoutExpand(chassisId) {
  try {
    const { data } = await api.get(`${chassisId}/Sensors`);
    const sensors = data.Members || [];

    const promises = sensors.map((sensor) =>
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
 * @param {string} chassisId - Chassis URI
 * @returns {Promise<Object[]>} Array of all sensor data for the chassis
 */
export async function getAllSensorsForChassis(chassisId) {
  const supportsExpand = await supportsExpandQuery();

  const [sensors, thermalSensors, powerSensors] = await Promise.all([
    supportsExpand
      ? getSensorsWithExpand(chassisId)
      : getSensorsWithoutExpand(chassisId),
  ]);

  // Combine and deduplicate sensors by name
  const allSensors = [...sensors, ...thermalSensors, ...powerSensors];
  return uniqBy(allSensors, 'name');
}

/**
 * Fetches all sensors from all chassis
 * @returns {Promise<Object[]>} Array of all sensor data
 */
export async function getAllSensors() {
  try {
    const chassisCollection = await getChassisCollection();

    const sensorPromises = chassisCollection.map((chassisId) =>
      getAllSensorsForChassis(chassisId),
    );

    const sensorArrays = await Promise.all(sensorPromises);
    const allSensors = sensorArrays.flat();

    // Deduplicate by name across all chassis
    return uniqBy(allSensors, 'name');
  } catch (error) {
    console.error('Error fetching all sensors:', error);
    throw error;
  }
}
