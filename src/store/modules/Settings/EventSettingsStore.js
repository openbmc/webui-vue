import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';

const EventSettingsStore = {
  namespaced: true,
  state: {
    subscriptions: [],
  },
  getters: {
    subscriptions: (state) => state.subscriptions,
  },
  mutations: {
    setSubscriptionsInfo: (state, data) => {
      state.subscriptions = data.map((subscription) => {
        let data = {
          id: subscription.Id,
          protocol: subscription.Protocol,
          destination: subscription.Destination,
          name: subscription.Name,
          lowestSeverity: 'All',
        };
        return data;
      });
    },
  },
  actions: {
    async getSubscriptions({ commit }) {
      return await api
        .get('/redfish/v1/EventService/Subscriptions')
        .then(({ data: { Members = [] } }) =>
          Members.map((member) => api.get(member['@odata.id'])),
        )
        .then((promises) => api.all(promises))
        .then((response) => {
          const data = response.map(({ data }) => data);
          commit('setSubscriptionsInfo', data);
        })
        .catch((error) => console.log(error));
    },
    async createSubscription({ dispatch }, subscriptionForm) {
      const data = {
        Destination: subscriptionForm.destination,
        Protocol: subscriptionForm.protocol,
      };
      return await api
        .post('/redfish/v1/EventService/Subscriptions', data)
        .then(() => {
          dispatch('getSubscriptions');
          return i18n.t('pageEventSettings.toast.successCreateSubscription');
        })
        .catch(() => {
          throw new Error(
            i18n.t('pageEventSettings.toast.errorCreateSubscription'),
          );
        });
    },
    async deleteSubscription({ dispatch }, subscription) {
      return await api
        .delete(`/redfish/v1/EventService/Subscriptions/${subscription.id}`)
        .then(() => {
          dispatch('getSubscriptions');
          return i18n.t('pageEventSettings.toast.successDeleteSubscription');
        })
        .catch(() => {
          throw new Error(
            i18n.t('pageEventSettings.toast.errorDeleteSubscription'),
          );
        });
    },
    async deleteSubscriptions({ dispatch }, subscriptions) {
      const promises = subscriptions.map((subscription) => {
        return api
          .delete(`/redfish/v1/EventService/Subscriptions/${subscription.id}`)
          .catch((error) => error);
      });

      return await api
        .all(promises)
        .then((response) => {
          dispatch('getSubscriptions');
          return response;
        })
        .then(
          api.spread((...responses) => {
            const { successCount, errorCount } = getResponseCount(responses);
            let toastMessages = [];

            if (successCount) {
              const message = i18n.tc(
                'pageEventSettings.toast.successBatchDelete',
                successCount,
              );
              toastMessages.push({ type: 'success', message });
            }

            if (errorCount) {
              const message = i18n.tc(
                'pageEventSettings.toast.errorBatchDelete',
                errorCount,
              );
              toastMessages.push({ type: 'error', message });
            }

            return toastMessages;
          }),
        );
    },
    async sentTestMessage() {
      return await api
        .post('/redfish/v1/EventService/Actions/EventService.SubmitTestEvent', {
          MessageId: 'OpenBMC.0.1.TestEventLog',
          Message: 'Test message',
        })
        .then(() => i18n.t('pageEventSettings.toast.successTestMessage'))
        .catch(() => {
          throw new Error(i18n.t('pageEventSettings.toast.errorTestMessage'));
        });
    },
  },
};

export default EventSettingsStore;
