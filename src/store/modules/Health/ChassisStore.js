import api from '@/store/api';

const ChassisStore = {
  namespaced: true,
  state: {
    chassis: null
  },
  getters: {
    chassis: state => state.chassis
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
    }
  },
  actions: {
    async getChassisInfo({ commit }) {
      return await api
        .get('/redfish/v1/Chassis/chassis')
        .then(({ data }) => commit('setChassisInfo', data))
        .catch(error => console.log(error));
    }
  }
};

export default ChassisStore;
