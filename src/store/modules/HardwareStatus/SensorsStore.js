import api from '@/store/api';
import { uniqBy } from 'lodash';

const SensorsStore = {
  namespaced: true,
  state: {
    sensors: [],
    expandQueryMaxLevels: null, // Store ExpandQuery MaxLevels here
  },
  getters: {
    sensors: (state) => state.sensors,
  },
  mutations: {
    setSensors: (state, sensors) => {
      state.sensors = uniqBy([...sensors, ...state.sensors], 'name');
    },
    updateSensor: (state, updatedSensor) => {
      const index = state.sensors.findIndex(
        (s) => s.name === updatedSensor.name,
      );
      if (index !== -1) {
        state.sensors[index] = updatedSensor; // Directly update the sensor in state
      }
    },
    setSensorsDefault: (state) => {
      state.sensors = [];
    },
    setExpandQueryMaxLevels: (state, maxLevels) => {
      state.expandQueryMaxLevels = maxLevels;
    },
  },
  actions: {
    async initSSEhandler({ state }) {
      console.log('Initializing SSE for Redfish events...');
      const hostname = window.location.hostname;
      const baseURL = `https://${hostname}`;
      const eventUrl = `${baseURL}/redfish/v1/EventService/SSE`;
      const eventSource = new EventSource(eventUrl, { withCredentials: true });

      eventSource.onmessage = (event) => {
        try {
          const eventData = JSON.parse(event.data);
          if (!eventData?.MetricValues?.[0]?.MetricValue) return;

          const receivedId = eventData.Id.replace(/_/g, ' '); // Convert underscores to spaces
          const metricValue = parseFloat(eventData.MetricValues[0].MetricValue);

          // Find sensor reference directly from state (no cloning)
          const sensor = state.sensors.find((s) => s.name === receivedId);
          if (sensor) {
            sensor.currentValue = metricValue; // Update value directly
            //commit('updateSensor', sensor); // Commit only this sensor
            console.log(`✅ Updated sensor: ${receivedId} → ${metricValue}`);
          }
        } catch (error) {
          console.error('❌ Error processing SSE event:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        eventSource.close();
      };
    },
    async fetchExpandQueryMaxLevels({ commit, state }) {
      if (state.expandQueryMaxLevels !== null)
        return state.expandQueryMaxLevels; // Avoid redundant calls

      try {
        const { data } = await api.get('/redfish/v1/');
        const maxLevels =
          data?.ProtocolFeaturesSupported?.ExpandQuery?.MaxLevels || 0;
        console.log(
          `fetchExpandQueryMaxLevels: Detected MaxLevels = ${maxLevels}`,
        );
        commit('setExpandQueryMaxLevels', maxLevels);
        return maxLevels;
      } catch (error) {
        console.error(
          'fetchExpandQueryMaxLevels: Error fetching MaxLevels',
          error,
        );
        commit('setExpandQueryMaxLevels', 0);
        return 0;
      }
    },
    async updateAllSensors({ commit, dispatch, state }) {
      console.log('updateAllSensors: Checking expandQueryMaxLevels...');

      const maxLevels =
        state.expandQueryMaxLevels !== null
          ? state.expandQueryMaxLevels
          : await dispatch('fetchExpandQueryMaxLevels');

      if (maxLevels > 2) {
        console.log('updateAllSensors: Using $expand for fetching sensors...');
        try {
          const { data: { Members = [] } = {} } = await api.get(
            `/redfish/v1/Chassis?$expand=.($levels=3)`,
          );

          console.log('updateAllSensors: Received chassis members:', Members);

          const sensorData = [];

          Members.forEach((chassis, index) => {
            console.log(`Processing chassis ${index + 1}:`, chassis);

            const extractSensors = (source, type, unitsKey, defaultUnits) => {
              if (!source) return;
              console.log(`Chassis ${index + 1} - Found ${type}:`, source);
              source.forEach((sensor) => {
                const odataId = sensor['@odata.id'];
                if (!odataId) {
                  console.warn(
                    `Warning: Missing @odata.id for ${type} sensor`,
                    sensor,
                  );
                  return;
                }

                sensorData.push({
                  name: sensor.Name,
                  odataId: odataId, // Store individual sensor's @odata.id
                  status: sensor.Status?.Health,
                  currentValue: sensor[unitsKey],
                  lowerCaution: sensor.LowerThresholdNonCritical,
                  upperCaution: sensor.UpperThresholdNonCritical,
                  lowerCritical: sensor.LowerThresholdCritical,
                  upperCritical: sensor.UpperThresholdCritical,
                  units: defaultUnits || sensor.ReadingUnits,
                });
              });
            };

            extractSensors(chassis.Sensors?.Members, 'Sensors', 'Reading');
            extractSensors(chassis.Thermal?.Fans, 'Fan Sensors', 'Reading');
            extractSensors(
              chassis.Thermal?.Temperatures,
              'Temperature Sensors',
              'ReadingCelsius',
              '℃',
            );
            extractSensors(
              chassis.Power?.Voltages,
              'Voltage Sensors',
              'ReadingVolts',
              'V',
            );
          });

          console.log(
            'updateAllSensors: Final collected sensor data:',
            sensorData,
          );

          commit('setSensors', sensorData);

          // Step 1: Check if TelemetryService is enabled
          try {
            const telemetryResponse = await api.get(
              '/redfish/v1/TelemetryService',
            );

            if (telemetryResponse.data?.Status?.State !== 'Enabled') {
              console.error(
                'Error: TelemetryService is not enabled. Aborting metric registration.',
                telemetryResponse,
              );
              //return; // Exit the function early to avoid unnecessary calls
            }

            console.log(
              'TelemetryService is enabled. Proceeding with metric registration...',
            );
          } catch (error) {
            console.error('Failed to fetch TelemetryService status:', error);
            return;
          }

          // Step 2: Get existing MetricReportDefinitions
          console.log('Fetching existing MetricReportDefinitions...');
          const metricReports = await api.get(
            '/redfish/v1/TelemetryService/MetricReportDefinitions/',
          );
          const existingMetrics = new Set();

          for (const member of metricReports.data.Members) {
            const metricDetail = await api.get(member['@odata.id']);
            metricDetail.data.Metrics.forEach((metric) => {
              metric.MetricProperties.forEach((property) => {
                existingMetrics.add(property);
              });
            });
          }

          console.log('Existing registered MetricProperties:', existingMetrics);

          // Step 3: Register new metric reports concurrently
          const hostname = window.location.hostname;
          const url = `https://${hostname}/redfish/v1/TelemetryService/MetricReportDefinitions/`;

          const registrationPromises = sensorData
            .filter((sensor) => !existingMetrics.has(sensor.odataId)) // Filter only new sensors
            .map((sensor) => {
              const payload = {
                Id: sensor.name.replace(/\s+/g, '_'),
                Metrics: [{ MetricProperties: [sensor.odataId] }],
                MetricReportDefinitionType: 'OnChange',
                ReportActions: ['RedfishEvent'],
                ReportUpdates: 'Overwrite',
              };

              return api
                .post(url, payload, {
                  headers: { 'Content-Type': 'application/json' },
                })
                .then((response) => ({
                  sensor: sensor.name,
                  status: 'Success',
                  data: response.data,
                }))
                .catch((error) => ({
                  sensor: sensor.name,
                  status: 'Error',
                  error: error.response?.data || error,
                }));
            });

          console.log(
            `Registering ${registrationPromises.length} new metric reports concurrently...`,
          );

          const results = await Promise.allSettled(registrationPromises);

          // Log results
          results.forEach((result) => {
            if (result.status === 'fulfilled') {
              console.log(`✅ Registered: ${result.value.sensor}`);
            } else {
              console.error(
                `❌ Failed: ${result.reason.sensor}`,
                result.reason.error,
              );
            }
          });
          dispatch('initSSEhandler');
        } catch (error) {
          console.error('updateAllSensors: Error fetching chassis data', error);
        }
      } else {
        console.log('updateAllSensors: expand not supported.');
      }
    },
    async getAllSensors({ dispatch, state }) {
      dispatch('resetSensors'); // Reset before fetching

      const maxLevels =
        state.expandQueryMaxLevels !== null
          ? state.expandQueryMaxLevels
          : await dispatch('fetchExpandQueryMaxLevels');

      if (maxLevels < 3) {
        const collection = await dispatch('getChassisCollection');
        if (!collection) return; // Ensure collection exists

        const promises = collection.flatMap((id) => [
          dispatch('getSensors', id),
          dispatch('getThermalSensors', id),
          dispatch('getPowerSensors', id),
        ]);

        return await Promise.all(promises);
      } else {
        return dispatch('updateAllSensors'); // optimized fetching using expand query.
      }
    },
    async getChassisCollection() {
      return await api
        .get('/redfish/v1/Chassis')
        .then(({ data: { Members } }) =>
          Members.map((member) => member['@odata.id']),
        )
        .catch((error) => console.log(error));
    },
    async resetSensors({ commit }) {
      commit('setSensorsDefault');
    },
    async getSensors({ commit }, id) {
      const sensors = await api
        .get(`${id}/Sensors`)
        .then((response) => response.data.Members)
        .catch((error) => console.log(error));
      if (!sensors) return;
      const promises = sensors.map((sensor) => {
        return api.get(sensor['@odata.id']).catch((error) => {
          console.log(error);
          return error;
        });
      });
      return await api.all(promises).then((responses) => {
        const sensorData = [];
        responses.forEach((response) => {
          if (response.data) {
            sensorData.push({
              name: response.data.Name,
              status: response.data.Status?.Health,
              currentValue: response.data.Reading,
              lowerCaution: response.data.Thresholds?.LowerCaution?.Reading,
              upperCaution: response.data.Thresholds?.UpperCaution?.Reading,
              lowerCritical: response.data.Thresholds?.LowerCritical?.Reading,
              upperCritical: response.data.Thresholds?.UpperCritical?.Reading,
              units: response.data.ReadingUnits,
            });
          }
        });
        commit('setSensors', sensorData);
      });
    },
    async getThermalSensors({ commit }, id) {
      return await api
        .get(`${id}/Thermal`)
        .then(({ data: { Fans = [], Temperatures = [] } }) => {
          const sensorData = [];
          Fans.forEach((sensor) => {
            sensorData.push({
              name: sensor.Name,
              status: sensor.Status.Health,
              currentValue: sensor.Reading,
              lowerCaution: sensor.LowerThresholdNonCritical,
              upperCaution: sensor.UpperThresholdNonCritical,
              lowerCritical: sensor.LowerThresholdCritical,
              upperCritical: sensor.UpperThresholdCritical,
              units: sensor.ReadingUnits,
            });
          });
          Temperatures.forEach((sensor) => {
            sensorData.push({
              name: sensor.Name,
              status: sensor.Status.Health,
              currentValue: sensor.ReadingCelsius,
              lowerCaution: sensor.LowerThresholdNonCritical,
              upperCaution: sensor.UpperThresholdNonCritical,
              lowerCritical: sensor.LowerThresholdCritical,
              upperCritical: sensor.UpperThresholdCritical,
              units: '℃',
            });
          });
          commit('setSensors', sensorData);
        })
        .catch((error) => console.log(error));
    },
    async getPowerSensors({ commit }, id) {
      return await api
        .get(`${id}/Power`)
        .then(({ data: { Voltages = [] } }) => {
          const sensorData = Voltages.map((sensor) => {
            return {
              name: sensor.Name,
              status: sensor.Status.Health,
              currentValue: sensor.ReadingVolts,
              lowerCaution: sensor.LowerThresholdNonCritical,
              upperCaution: sensor.UpperThresholdNonCritical,
              lowerCritical: sensor.LowerThresholdCritical,
              upperCritical: sensor.UpperThresholdCritical,
              units: 'V',
            };
          });
          commit('setSensors', sensorData);
        })
        .catch((error) => console.log(error));
    },
  },
};

export default SensorsStore;
