import api from '../../api';

const NetworkSettingsStore = {
  namespaced: true,
  state: {
    networkData: null,
    interfaceName: '--',
    ipAddress: '--',
    macAddress: '--'
  },
  getters: {
    networkData: state => state.networkData,
    interfaceName: state => state.interfaceName,
    ipAddress: state => state.ipAddress,
    macAddress: state => state.macAddress
  },
  mutations: {
    setNetworkData: (state, networkData) => (state.networkData = networkData),
    setInterfaceName: (state, interfaceName) =>
      (state.interfaceName = interfaceName),
    setIpAddress: (state, ipAddress) => (state.ipAddress = ipAddress),
    setMacAddress: (state, macAddress) => (state.macAddress = macAddress)
  },
  actions: {
    getNetworkData({ commit }) {
      api
        .get('/xyz/openbmc_project/network/enumerate')
        .then(response => {
          const networkData = response.data.data;
          const ipAddresses = [];
          const interfaceId = /eth[0-9]/;
          for (let key in networkData) {
            if (key.match(interfaceId)) {
              if (networkData[key].InterfaceName !== undefined) {
                commit('setInterfaceName', networkData[key].InterfaceName);
              }
              if (key.includes('ipv4')) {
                ipAddresses.push(networkData[key].Address);
                commit('setIpAddress', ipAddresses);
              }
              if (networkData[key].MACAddress !== undefined) {
                commit('setMacAddress', networkData[key].MACAddress);
              }
            }
          }
        })
        .catch(error => {
          console.log('Network Data:', error);
        });
    }
  }
};

export default NetworkSettingsStore;
