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
    setSensorsDefault: (state) => {
      state.sensors = [];
    },
    setExpandQueryMaxLevels: (state, maxLevels) => {
      state.expandQueryMaxLevels = maxLevels;
    },
  },
  actions: {
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

      if (maxLevels > 1) {
        console.log('updateAllSensors: Using $expand for fetching sensors...');
        try {
          const { data: { Members = [] } = {} } = await api.get(
            `/redfish/v1/Chassis?$expand=.($levels=2)`,
          );

          console.log('updateAllSensors: Received chassis members:', Members);

          const sensorData = Members.flatMap((chassis, index) => {
            console.log(`Processing chassis ${index + 1}:`, chassis);
            const collectedSensors = [];

            const extractSensors = (source, type, unitsKey, defaultUnits) => {
              if (!source) return;
              console.log(`Chassis ${index + 1} - Found ${type}:`, source);
              source.forEach((sensor) => {
                collectedSensors.push({
                  name: sensor.Name,
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

            return collectedSensors;
          });
          console.log(
            'updateAllSensors: Final collected sensor data:',
            sensorData,
          );
          commit('setSensors', sensorData);
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

      if (maxLevels < 2) {
        const collection = await dispatch('getChassisCollection');
        if (!collection) return; // Ensure collection exists

        const promises = collection.flatMap((id) => [
          dispatch('getSensors', id),
          dispatch('getThermalSensors', id),
          dispatch('getPowerSensors', id),
        ]);

        return await Promise.all(promises); // Use Promise.all for efficiency
      } else {
        return dispatch('updateAllSensors'); // Optimized fetching
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
