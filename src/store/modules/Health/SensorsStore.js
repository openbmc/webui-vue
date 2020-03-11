import api from '../../api';
import { uniqBy } from 'lodash';

const SensorsStore = {
  namespaced: true,
  state: {
    sensors: []
  },
  getters: {
    sensors: state => state.sensors
  },
  mutations: {
    setSensors: (state, sensors) => {
      state.sensors = uniqBy([...state.sensors, ...sensors], 'name');
    }
  },
  actions: {
    getSensors({ commit }) {
      api
        .get('/redfish/v1/Chassis/chassis/Sensors')
        .then(({ data: { Members } }) => {
          const promises = Members.map(sensor => api.get(sensor['@odata.id']));
          api.all(promises).then(
            api.spread((...responses) => {
              const sensorData = responses.map(({ data }) => {
                return {
                  name: data.Name,
                  status: data.Status.Health,
                  current: data.Reading,
                  lowerCaution: data.Thresholds.LowerCaution.Reading,
                  upperCaution: data.Thresholds.UpperCaution.Reading,
                  lowerCritical: data.Thresholds.LowerCritical.Reading,
                  upperCritical: data.Thresholds.UpperCritical.Reading,
                  units: data.ReadingUnits
                };
              });
              commit('setSensors', sensorData);
            })
          );
        })
        .catch(error => console.log(error));
      api
        .get('/redfish/v1/Chassis/chassis/Thermal')
        .then(({ data: { Fans, Temperatures } }) => {
          const sensorData = [];
          Fans.forEach(sensor => {
            sensorData.push({
              // TODO: add upper/lower threshold
              name: sensor.Name,
              status: sensor.Status.Health,
              current: sensor.Reading,
              units: sensor.ReadingUnits
            });
          });
          Temperatures.forEach(sensor => {
            sensorData.push({
              name: sensor.Name,
              status: sensor.Status.Health,
              current: sensor.ReadingCelsius,
              lowerCaution: sensor.LowerThresholdNonCritical,
              upperCaution: sensor.UpperThresholdNonCritical,
              lowerCritical: sensor.LowerThresholdCritical,
              upperCritical: sensor.UpperThresholdCritical,
              units: '℃'
            });
          });
          commit('setSensors', sensorData);
        })
        .catch(error => console.log(error));
      api
        .get('/redfish/v1/Chassis/chassis/Power')
        .then(({ data: { Voltages } }) => {
          const sensorData = Voltages.map(sensor => {
            return {
              name: sensor.Name,
              status: sensor.Status.Health,
              current: sensor.ReadingVolts,
              lowerCaution: sensor.LowerThresholdNonCritical,
              upperCaution: sensor.UpperThresholdNonCritical,
              lowerCritical: sensor.LowerThresholdCritical,
              upperCritical: sensor.UpperThresholdCritical,
              units: 'Volts'
            };
          });
          commit('setSensors', sensorData);
        })
        .catch(error => console.log(error));
    }
  }
};

export default SensorsStore;
