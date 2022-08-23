import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';

const SessionsStore = {
  namespaced: true,
  state: {
    allConnections: [],
    closeCurrentSession: false,
  },
  getters: {
    allConnections: (state) => state.allConnections,
    closeCurrentSession: (state) => state.closeCurrentSession,
  },
  mutations: {
    setAllConnections: (state, allConnections) =>
      (state.allConnections = allConnections),
    setCloseCurrentSession: (state, value) =>
      (state.closeCurrentSession = value),
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
    async deleteAllSessions({ commit }) {
      // Get all the available session information to delete the
      // password changed user's sessions.
      return await api
        .get('/redfish/v1/SessionService/Sessions')
        .then((response) =>
          response.data.Members.map((sessionLogs) => sessionLogs['@odata.id'])
        )
        .then((sessionUris) => {
          let allPromise = [];
          for (let i = 1; i < sessionUris.length; i++) {
            allPromise.push(deleteMatchedSessions(sessionUris[i]));
          }
          if (allPromise.length) {
            Promise.all(allPromise).then(() => {
              api.delete(sessionUris[0]).then(() => {
                commit('setCloseCurrentSession', true);
              });
            });
          }
          function deleteMatchedSessions(url) {
            return new Promise(function (resolve) {
              api.get(url).then((response) => {
                if (
                  localStorage.getItem('storedUsername') ==
                  response.data.UserName
                ) {
                  api
                    .delete(response.data['@odata.id'])
                    .then(function () {
                      resolve();
                    })
                    .catch((error) => {
                      console.log(error);
                      return error;
                    });
                } else {
                  resolve();
                }
              });
            });
          }
        })
        .catch((error) => {
          console.log('Client Session Data:', error);
        });
    },
  },
};
export default SessionsStore;
