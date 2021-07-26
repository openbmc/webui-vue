import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';

const SessionsStore = {
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
    async getSessionsData({ commit }) {
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
              clientID: sessionUri.data?.Oem?.OpenBMC.ClientID,
              username: sessionUri.data?.UserName,
              ipAddress: sessionUri.data?.ClientOriginIPAddress,
              uri: sessionUri.data['@odata.id'],
            };
          });
          commit('setAllConnections', allConnectionsData);
        })
        .catch((error) => {
          console.log('Client Session Data:', error);
        });
    },
    async disconnectSessions({ dispatch }, uris = []) {
      const promises = uris.map((uri) =>
        api.delete(uri).catch((error) => {
          console.log(error);
          return error;
        })
      );
      return await api
        .all(promises)
        .then((response) => {
          dispatch('getSessionsData');
          return response;
        })
        .then(
          api.spread((...responses) => {
            const { successCount, errorCount } = getResponseCount(responses);
            const toastMessages = [];

            if (successCount) {
              const message = i18n.tc(
                'pageSessions.toast.successDelete',
                successCount
              );
              toastMessages.push({ type: 'success', message });
            }

            if (errorCount) {
              const message = i18n.tc(
                'pageSessions.toast.errorDelete',
                errorCount
              );
              toastMessages.push({ type: 'error', message });
            }
            return toastMessages;
          })
        );
    },
  },
};
export default SessionsStore;
