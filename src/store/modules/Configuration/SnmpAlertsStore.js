import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';

const SnmpAlertsStore = {
  namespaced: true,
  state: {
    allSnmpDetails: [],
  },
  getters: {
    allSnmpDetails(state) {
      return state.allSnmpDetails;
    },
  },
  mutations: {
    setSnmpDetails(state, allSnmpDetails) {
      state.allSnmpDetails = allSnmpDetails;
    },
  },
  actions: {
    async getSnmpDetails({ commit }) {
      return await api
        .get('/redfish/v1/EventService/Subscriptions')
        .then((response) =>
          response.data.Members.map((user) => user['@odata.id'])
        )
        .then((userIds) => api.all(userIds.map((user) => api.get(user))))
        .then((users) => {
          const snmpDetailsData = users.map((user) => user.data);
          commit('setSnmpDetails', snmpDetailsData);
        })
        .catch((error) => {
          console.log(error);
          const message = i18n.t('pageSnmpAlerts.toast.errorLoadSnmpDetails');
          throw new Error(message);
        });
    },
    async deleteDestination({ dispatch }, id) {
      return await api
        .delete(`/redfish/v1/EventService/Subscriptions/${id}`)
        .then(() => dispatch('getSnmpDetails'))
        .then(() =>
          i18n.t('pageSnmpAlerts.toast.successDeleteDestination', {
            id,
          })
        )
        .catch((error) => {
          console.log(error);
          const message = i18n.t(
            'pageSnmpAlerts.toast.errorDeleteDestination',
            {
              id,
            }
          );
          throw new Error(message);
        });
    },
    async deleteDestinations({ dispatch }, destination) {
      const promises = destination.map(({ id }) => {
        return api
          .delete(`/redfish/v1/EventService/Subscriptions/${id}`)
          .catch((error) => {
            console.log(error);
            return error;
          });
      });
      return await api
        .all(promises)
        .then((response) => {
          dispatch('getSnmpDetails');
          return response;
        })
        .then(
          api.spread((...responses) => {
            const { successCount, errorCount } = getResponseCount(responses);
            let toastMessages = [];

            if (successCount) {
              const message = i18n.tc(
                'pageSnmpAlerts.toast.successBatchDelete',
                successCount
              );
              toastMessages.push({ type: 'success', message });
            }

            if (errorCount) {
              const message = i18n.tc(
                'pageSnmpAlerts.toast.errorBatchDelete',
                errorCount
              );
              toastMessages.push({ type: 'error', message });
            }

            return toastMessages;
          })
        );
    },
    async addDestination({ dispatch }, { data }) {
      return await api
        .post('/redfish/v1/EventService/Subscriptions', data)
        .then(() => dispatch('getSnmpDetails'))
        .then(() => i18n.t('pageSnmpAlerts.toast.successAddDestination'))
        .catch((error) => {
          console.log(error);
          const message = i18n.t('pageSnmpAlerts.toast.errorAddDestination');
          throw new Error(message);
        });
    },
  },
};

export default SnmpAlertsStore;
