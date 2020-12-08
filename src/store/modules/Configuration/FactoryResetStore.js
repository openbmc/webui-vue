// import api from '@/store/api';

const FactoryResetStore = {
  namespaced: true,
  state: {
    systemStatus: '',
  },
  getters: {
    // getSystemStatusValue: (state) => state.systemStatus,
  },
  mutations: {
    // setSystemStatusValue(state, systemStatus) {
    //   state.systemStatus = systemStatus;
    // },
  },
  actions: {
    // async getSystemStatusValue({ commit }) {
    //   return await api
    //     .get('/redfish/v1/Systems/system/Bios/Actions/Bios.ResetBios')
    //     .then((response) => {
    //       console.log(response);
    //       commit('setSystemStatusValue', response);
    //     })
    //     .catch((error) => console.log(error));
    // },
  },
};

export default FactoryResetStore;
