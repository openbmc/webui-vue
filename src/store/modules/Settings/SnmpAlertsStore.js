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
    async getSnmpAlertUrl() {
      return await api
        .get('/redfish/v1/')
        .then((response) => api.get(response.data.EventService['@odata.id']))
        .then((response) => api.get(response.data.Subscriptions['@odata.id']))
        .then((response) => response.data['@odata.id'])
        .catch((error) => console.log('Error', error));
    },
    async getSnmpDetails({ commit, dispatch }) {
      const snmpAlertUrl = await dispatch('getSnmpAlertUrl');
      return await api
        .get(snmpAlertUrl)
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
      const snmpAlertUrl = await dispatch('getSnmpAlertUrl');
      return await api
        .delete(`${snmpAlertUrl}/${id}`)
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
    async deleteMultipleDestinations({ dispatch }, destination) {
      const snmpAlertUrl = await dispatch('getSnmpAlertUrl');
      const promises = destination.map(({ id }) => {
        return api.delete(`${snmpAlertUrl}/${id}`).catch((error) => {
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
      const snmpAlertUrl = await dispatch('getSnmpAlertUrl');
      return await api
        .post(snmpAlertUrl, data)
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
