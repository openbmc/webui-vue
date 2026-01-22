import { defineStore } from 'pinia';
import api from '@/store/api';
import { uniqBy } from 'lodash';

export const SensorsStore = defineStore('sensors', {
  state: () => ({
    sensors: [],
  }),

  getters: {
    getSensors: (state) => state.sensors,
  },

  actions: {
    async getAllSensors() {
      const collection = await this.getChassisCollection();
      if (!collection) return;
      this.resetSensors();
      const promises = collection.reduce((acc, id) => {
        acc.push(this.fetchSensors(id));
        acc.push(this.getThermalSensors(id));
        acc.push(this.getPowerSensors(id));
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

    resetSensors() {
      this.sensors = [];
    },

    async fetchSensors(id) {
      await api
        .get('/redfish/v1/')
        .then(({ data }) => {
          if (data?.ProtocolFeaturesSupported?.ExpandQuery?.MaxLevels > 0) {
            return this.getSensorsUsingQueryParams(id);
          } else {
            return this.getSensorsWithoutQueryParams(id);
          }
        })
        .catch((error) => console.log(error));
    },

    async getSensorsWithoutQueryParams(id) {
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
        this.setSensors(sensorData);
      });
    },

    async getSensorsUsingQueryParams(id) {
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
            this.setSensors(sensorData);
          });
        })
        .then(() => {
          return;
        })
        .catch((error) => console.log(error));
    },

    async getThermalSensors(id) {
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
          this.setSensors(sensorData);
        })
        .catch((error) => console.log(error));
    },

    async getPowerSensors(id) {
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
          this.setSensors(sensorData);
        })
        .catch((error) => console.log(error));
    },

    setSensors(sensors) {
      this.sensors = uniqBy([...sensors, ...this.sensors], 'name');
    },
  },
});
