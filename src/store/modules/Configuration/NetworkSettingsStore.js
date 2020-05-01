import api from '../../api';

const NetworkSettingsStore = {
  namespaced: true,
  state: {
    ethernetData: []
  },
  getters: {
    ethernetData: state => state.ethernetData
  },
  mutations: {
    setEthernetData: (state, ethernetData) =>
      (state.ethernetData = ethernetData)
  },
  actions: {
    async getEthernetData({ commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc/EthernetInterfaces')
        .then(response =>
          response.data.Members.map(
            ethernetInterface => ethernetInterface['@odata.id']
          )
        )
        .then(ethernetInterfaceIds =>
          api.all(
            ethernetInterfaceIds.map(ethernetInterface =>
              api.get(ethernetInterface)
            )
          )
        )
        .then(ethernetInterfaces => {
          const ethernetData = ethernetInterfaces.map(
            ethernetInterface => ethernetInterface.data
          );
          commit('setEthernetData', ethernetData);
        })
        .catch(error => {
          console.log('Network Data:', error);
        });
    }
  }
};

export default NetworkSettingsStore;
