import api from '../../api';

const NetworkSettingsStore = {
  namespaced: true,
  state: {
    networkData: null,
    ipAddress: '--',
    macAddress: '--'
  },
  getters: {
    networkData: state => state.networkData,
    ipAddress: state => state.ipAddress,
    macAddress: state => state.macAddress
  },
  mutations: {
    setNetworkData: (state, networkData) => (state.networkData = networkData),
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
            if (key.includes('ipv4')) {
              ipAddresses.push(networkData[key].Address);
            }
            if (
              key.match(interfaceId) &&
              networkData[key].MACAddress !== undefined
            ) {
              commit('setMacAddress', networkData[key].MACAddress);
            }
          }
          commit('setIpAddress', ipAddresses);
        })
        .catch(error => {
          console.log('Network Data:', error);
        });
    }
  }
};

export default NetworkSettingsStore;
