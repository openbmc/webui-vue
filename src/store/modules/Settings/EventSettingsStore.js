import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';

const EventSettingsStore = {
  namespaced: true,
  state: {
    syslogIp: '',
    syslogPort: '',
    syslogProtocol: '',
    subscriptions: [],
  },
  getters: {
    getSyslogIp: (state) => state.syslogIp,
    getSyslogPort: (state) => state.syslogPort,
    getSyslogProtocol: (state) => state.syslogProtocol,
    subscriptions: (state) => state.subscriptions,
  },
  mutations: {
    setSyslogIp: (state, syslogIp) => (state.syslogIp = syslogIp),
    setSyslogPort: (state, syslogPort) => (state.syslogPort = syslogPort),
    setSyslogProtocol: (state, syslogProtocol) =>
      (state.syslogProtocol = syslogProtocol),
    setSubscriptionsInfo: (state, data) => {
      state.subscriptions = data.map((subscription) => {
        let data = {
          id: subscription.Id || 'Syslog',
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
    async getSyslogData({ commit }) {
      return await api
        .get('/redfish/v1/EventService/Subscriptions/Syslog')
        .then(({ data }) => {
          commit('setSyslogIp', null);
          commit('setSyslogPort', null);
          commit('setSyslogProtocol', null);
          if (data) {
            const portAndIp = data.Destination.split('//')[1].split(':');
            commit('setSyslogIp', portAndIp[0]);
            commit('setSyslogPort', portAndIp[1]);
            commit('setSyslogProtocol', data.Protocol);
          }
        })
        .catch((error) => console.log(error));
    },
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
          dispatch('getSyslogData');
          return i18n.t('pageEventSettings.successCreateSubscription');
        })
        .catch(() => {
          throw new Error(i18n.t('pageEventSettings.errorCreateSubscription'));
        });
    },
    async deleteSubscription({ dispatch }, subscription) {
      return await api
        .delete(`/redfish/v1/EventService/Subscriptions/${subscription.id}`)
        .then(() => {
          dispatch('getSubscriptions');
          dispatch('getSyslogData');
          return i18n.t('pageEventSettings.successDeleteSubscription');
        })
        .catch(() => {
          throw new Error(i18n.t('pageEventSettings.errorDeleteSubscription'));
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
      return await api.post(
        '/redfish/v1/EventService/Actions/EventService.SubmitTestEvent',
        {
          MessageId: 'OpenBMC.0.1.TestEventLog',
          Message: 'Test message',
        },
      );
    },
  },
};

export default EventSettingsStore;
