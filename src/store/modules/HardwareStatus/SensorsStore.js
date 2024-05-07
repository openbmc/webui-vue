import api from '@/store/api';
import { uniqBy } from 'lodash';

const SensorsStore = {
  namespaced: true,
  state: {
    sensors: [],
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
  },
  actions: {
    async getAllSensors({ dispatch }) {
      const collection = await dispatch('getChassisCollection');
      if (!collection) return;
      dispatch('resetSensors');
      const promises = collection.reduce((acc, id) => {
        acc.push(dispatch('getSensors', id));
        acc.push(dispatch('getThermalSensors', id));
        acc.push(dispatch('getPowerSensors', id));
        return acc;
      }, []);
      return await api.all(promises);
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
      await api
        .get(`${id}/Sensors?$expand=.($levels=1)`)
        .then((response) => {
          let sensorData = [];
          response.data.Members.map((sensor) => {
            const oneSensordata = {
              name: sensor.Name,
              status: sensor.Status?.Health,
              currentValue: sensor.Reading,
              lowerCaution: sensor.Thresholds?.LowerCaution?.Reading,
              upperCaution: sensor.Thresholds?.UpperCaution?.Reading,
              lowerCritical: sensor.Thresholds?.LowerCritical?.Reading,
              upperCritical: sensor.Thresholds?.UpperCritical?.Reading,
              units: sensor.ReadingUnits,
            };
            sensorData.push(oneSensordata);
            commit('setSensors', sensorData);
          });
        })
        .then(() => {
          return;
        })
        .catch((error) => console.log(error));
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
