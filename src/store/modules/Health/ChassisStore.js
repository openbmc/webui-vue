import api from '@/store/api';

const ChassisStore = {
  namespaced: true,
  state: {
    chassis: null,
    motherboard: null
  },
  getters: {
    chassis: state => state.chassis,
    motherboard: state => state.motherboard
  },
  mutations: {
    setChassisInfo: (state, data) => {
      const chassis = {};
      chassis.id = data.Id;
      chassis.health = data.Status.Health;
      chassis.partNumber = data.PartNumber || '';
      chassis.serialNumber = data.SerialNumber || '';
      chassis.chassisType = data.ChassisType;
      chassis.powerState = data.PowerState;
      chassis.statusState = data.Status.State;
      chassis.healthRollup = data.Status.HealthRollup;
      state.chassis = chassis;
    },
    setMotherboardInfo: (state, data) => {
      const motherboard = {};
      motherboard.id = data.Id;
      motherboard.health = data.Status.Health;
      motherboard.partNumber = data.PartNumber || '';
      motherboard.serialNumber = data.SerialNumber || '';
      motherboard.chassisType = data.ChassisType;
      motherboard.manufacturer = data.Manufacturer;
      motherboard.powerState = data.PowerState;
      motherboard.statusState = data.Status.State;
      motherboard.healthRollup = data.Status.HealthRollup;
      state.motherboard = motherboard;
    }
  },
  actions: {
    async getChassisInfo({ commit }) {
      return await api
        .get('/redfish/v1/Chassis/chassis')
        .then(({ data }) => commit('setChassisInfo', data))
        .catch(error => console.log(error));
    },
    async getMotherboardInfo({ commit }) {
      return await api
        .get('/redfish/v1/Chassis/motherboard')
        .then(({ data }) => commit('setMotherboardInfo', data))
        .catch(error => console.log(error));
    }
  }
};

export default ChassisStore;
