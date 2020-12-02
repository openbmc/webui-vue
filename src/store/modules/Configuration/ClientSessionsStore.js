import api from '@/store/api';

const ClientSessionsStore = {
  namespaced: true,
  state: {
    allConnections: [],
  },
  getters: {
    allConnections: (state) => state.allConnections,
  },
  mutations: {
    setAllConnections: (state, allConnections) =>
      (state.allConnections = allConnections),
  },
  actions: {
    async getClinetSessionsData({ commit }) {
      return await api
        .get('/redfish/v1/SessionService/Sessions')
        .then((response) =>
          response.data.Members.map((sessionLogs) => sessionLogs['@odata.id'])
        )
        .then((sessionUris) =>
          api.all(sessionUris.map((sessionUri) => api.get(sessionUri)))
        )
        .then((sessionUris) => {
          const allConnectionsData = sessionUris.map((sessionUri) => {
            return {
              clientID: sessionUri.data?.Id,
              ipAddress: sessionUri.data?.Oem?.OpenBMC.ClientID,
            };
          });
          commit('setAllConnections', allConnectionsData);
        });
    },
  },
};
export default ClientSessionsStore;
