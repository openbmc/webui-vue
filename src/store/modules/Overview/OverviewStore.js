import api from '../../api';

const OverviewStore = {
  namespaced: true,
  state: {
    serverInfo: null,
    serverModel: '--',
    serverManufacturer: '--',
    serverSerialNumber: '--'
  },
  getters: {
    serverInfo: state => state.serverInfo,
    serverModel: state => state.serverModel,
    serverManufacturer: state => state.serverManufacturer,
    serverSerialNumber: state => state.serverSerialNumber
  },
  mutations: {
    setServerInfo: (state, serverInfo) => (state.serverInfo = serverInfo),
    setServerModel: (state, serverModel) => (state.serverModel = serverModel),
    setServerManufacturer: (state, serverManufacturer) =>
      (state.serverManufacturer = serverManufacturer),
    setServerSerialNumber: (state, serverSerialNumber) =>
      (state.serverSerialNumber = serverSerialNumber)
  },
  actions: {
    getServerInfo({ commit }) {
      api
        .get('/xyz/openbmc_project/inventory/system')
        .then(response => {
          const serverInfo = response.data.data;
          commit('setServerModel', serverInfo.Model);
          commit('setServerSerialNumber', serverInfo.SerialNumber);
          if (serverInfo.Manufacturer) {
            commit('setServerManufacturer', serverInfo.Manufacturer);
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
};

export default OverviewStore;
