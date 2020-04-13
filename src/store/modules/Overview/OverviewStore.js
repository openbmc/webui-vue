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
        .get('/redfish/v1/Systems/system')
        .then(response => {
          const serverInfo = response.data;
          if (serverInfo.Model) {
            commit('setServerModel', serverInfo.Model);
          }
          if (serverInfo.SerialNumber) {
            commit('setServerSerialNumber', serverInfo.SerialNumber);
          }
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
