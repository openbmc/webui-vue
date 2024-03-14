import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';

const authProtocols = {
  'xyz.openbmc_project.Network.Security.SNMP.Settings.AuthProtocols.SHA': 'SHA',
};

const encryptProtocols = {
  'xyz.openbmc_project.Network.Security.SNMP.Settings.PrivProtocols.AES': 'AES',
};

const EventSettingsStore = {
  namespaced: true,
  state: {
    syslogIp: '',
    syslogPort: '',
    subscriptions: [],
    smtpServiceEnabled: false,
    smtpIp: '',
    smtpPort: '',
    smtpMailFrom: '',
    smtpAuthentication: null,
    smtpUsername: null,
    smtpConnectionProtocol: null,
    snmpProtocol: null,
    snmpEngineId: null,
    snmpUsername: null,
    smtpPasswordSet: null,
    securityLevel: null,
    snmpAuthProtocol: null,
    snmpEncryptProtocol: null,
  },
  getters: {
    getSyslogIp: (state) => state.syslogIp,
    getSyslogPort: (state) => state.syslogPort,
    getSmtpServiceEnabled: (state) => state.smtpServiceEnabled,
    getSmtpIp: (state) => state.smtpIp,
    getSmtpPort: (state) => state.smtpPort,
    getSmtpMailFrom: (state) => state.smtpMailFrom,
    getSmtpAuthentication: (state) => state.smtpAuthentication,
    getSmtpUsername: (state) => state.smtpUsername,
    getSmtpConnectionProtocol: (state) => state.smtpConnectionProtocol,
    getSmtpPasswordSet: (state) => state.smtpPasswordSet,
    subscriptions: (state) => state.subscriptions,
    getSnmpProtocol: (state) => state.snmpProtocol,
    getSnmpEngineId: (state) => state.snmpEngineId,
    getSnmpUsername: (state) => state.snmpUsername,
    getSnmpSecurityLevel: (state) => state.securityLevel,
    getSnmpAuthProtocol: (state) => state.snmpAuthProtocol,
    getSnmpEncryptProtocol: (state) => state.snmpEncryptProtocol,
  },
  mutations: {
    setSyslogIp: (state, syslogIp) => (state.syslogIp = syslogIp),
    setSyslogPort: (state, syslogPort) => (state.syslogPort = syslogPort),
    setSmtpServiceEnabled: (state, smtpServiceEnabled) =>
      (state.smtpServiceEnabled = smtpServiceEnabled),
    setSmtpIp: (state, smtpIp) => (state.smtpIp = smtpIp),
    setSmtpPort: (state, smtpPort) => (state.smtpPort = smtpPort),
    setSmtpMailFrom: (state, smtpMailFrom) =>
      (state.smtpMailFrom = smtpMailFrom),
    setSmtpAuthentication: (state, smtpAuthentication) =>
      (state.smtpAuthentication = smtpAuthentication),
    setSmtpUsername: (state, smtpUsername) =>
      (state.smtpUsername = smtpUsername),
    setSmtpPasswordSet: (state, smtpPasswordSet) =>
      (state.smtpPasswordSet = smtpPasswordSet),
    setSmtpConnectionProtocol: (state, smtpConnectionProtocol) =>
      (state.smtpConnectionProtocol = smtpConnectionProtocol),
    setSnmpProtocol: (state, protocol) => (state.snmpProtocol = protocol),
    setSnmpEngineId: (state, engineId) => (state.snmpEngineId = engineId),
    setSnmpUsername: (state, username) => (state.snmpUsername = username),
    setSnmpAuthProtocol: (state, protocol) =>
      (state.snmpAuthProtocol = protocol),
    setSnmpSecurityLevel: (state, level) => (state.securityLevel = level),
    setSnmpEncryptProtocol: (state, protocol) =>
      (state.snmpEncryptProtocol = protocol),
    setSubscriptionsInfo: (state, data) => {
      state.subscriptions = data.map((subscription) => {
        let data = {
          id: subscription.Id || 'Syslog',
          protocol: subscription.Protocol,
          destination: subscription.Destination,
          name: subscription.Name,
          lowestSeverity:
            subscription.Protocol === 'SMTP'
              ? subscription.SyslogFilters[0].LowestSeverity
              : 'All',
        };
        return data;
      });
    },
  },
  actions: {
    async getSyslogData({ commit }) {
      return await api
        .get('/redfish/v1/EventService/Subscriptions/Syslog')
        .then((response) => {
          const data = response.data;
          var syslogIp = '';
          var syslogPort = '';
          if (data != '') {
            const portAndAddress = data.Destination.split('//')[1].split(':');
            syslogIp = portAndAddress[0];
            syslogPort = portAndAddress[1];
          }
          commit('setSyslogIp', syslogIp);
          commit('setSyslogPort', syslogPort);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async getSmtpSettings({ commit }) {
      return await api
        .get('/redfish/v1/EventService')
        .then((response) => {
          const smtp = response.data.SMTP;
          commit('setSmtpServiceEnabled', smtp.ServiceEnabled);
          commit('setSmtpIp', smtp.ServerAddress);
          commit('setSmtpPort', smtp.Port);
          commit('setSmtpMailFrom', smtp.FromAddress);
          commit('setSmtpAuthentication', smtp.Authentication);
          commit('setSmtpUsername', smtp.Username);
          commit('setSmtpPasswordSet', smtp.PasswordSet);
          commit('setSmtpConnectionProtocol', smtp.ConnectionProtocol);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async updateSmtpSettings({ dispatch }, settings) {
      let data = {
        SMTP: {
          FromAddress: settings.mailFrom,
          Port: settings.port,
          ServerAddress: settings.ip,
          ServiceEnabled: settings.serviceEnabled,
          Authentication: settings.authentication,
          ConnectionProtocol: settings.connectionProtocol,
        },
      };
      if (settings.authentication === 'Plain') {
        data.SMTP.Username = settings.login;
        data.SMTP.Password = settings.password;
      }

      return await api
        .patch('/redfish/v1/EventService', data)
        .then(() => {
          dispatch('getSmtpSettings');
          return i18n.t('pageEventSettings.successSaveEventSettings');
        })
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageEventSettings.errorSaveEventSettings'));
        });
    },
    async genSNMPUserData({ commit }) {
      return await api
        .get('/redfish/v1/AccountService/Accounts')
        .then((response) =>
          response.data.Members.map((user) => user['@odata.id']),
        )
        .then((userIds) => api.all(userIds.map((user) => api.get(user))))
        .then((users) => {
          const userData = users.map((user) => user.data);
          userData.forEach((user) => {
            if (user.SNMP) {
              commit('setSnmpUsername', user.UserName);
              commit(
                'setSnmpAuthProtocol',
                authProtocols[user.SNMP.AuthenticationProtocol],
              );
              commit(
                'setSnmpEncryptProtocol',
                encryptProtocols[user.SNMP.EncryptionProcotol],
              );
              let securityLevel = 'noAuthNoPriv';
              if (user.SNMP.AuthenticationKeySet === true) {
                securityLevel = 'authNoPriv';
                if (user.SNMP.EncryptionKeySet === true)
                  securityLevel = 'authPriv';
              }
              commit('setSnmpSecurityLevel', securityLevel);
            }
          });
        });
    },
    async getSnmpSettings({ dispatch, commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc/NetworkProtocol')
        .then((response) => {
          const data = response.data;

          if (data.SNMP) {
            commit(
              'setSnmpProtocol',
              data.SNMP.EnableSNMPv3 ? 'SNMPv3' : 'SNMPv2c',
            );
            commit('setSnmpEngineId', data.SNMP.EngineId.PrivateEnterpriseId);
            dispatch('genSNMPUserData');
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async updateSnmpSettings({ commit }, snmpSettingsForm) {
      let data = {
        SNMP: { ProtocolEnabled: true },
      };
      if (snmpSettingsForm.protocol === 'SNMPv3') {
        data.SNMP.EngineId = { PrivateEnterpriseId: snmpSettingsForm.engineId };
        commit('setSnmpUsername', snmpSettingsForm.username);
        commit('setSnmpEngineId', snmpSettingsForm.engineId);
        data.SNMP.EnableSNMPv3 = true;
      } else data.SNMP.EnableSNMPv2c = true;

      return await api
        .patch('/redfish/v1/Managers/bmc/NetworkProtocol', data)
        .then(() => {
          commit('setSnmpProtocol', snmpSettingsForm.protocol);
          if (snmpSettingsForm.protocol === 'SNMPv3') {
            let config = {
              UserName: snmpSettingsForm.username,
              Password: '',
              AccountTypes: ['SNMP'],
              SNMP: {},
            };

            if (snmpSettingsForm.authProtocol) {
              config.SNMP.AuthenticationProtocol =
                snmpSettingsForm.authProtocol;
              commit('setSnmpAuthProtocol', snmpSettingsForm.authProtocol);
            }
            if (snmpSettingsForm.authKey != null)
              config.SNMP.AuthenticationKey = snmpSettingsForm.authKey;

            if (snmpSettingsForm.encryptProtocol) {
              config.SNMP.EncryptionProtocol = snmpSettingsForm.encryptProtocol;
              commit(
                'setSnmpEncryptProtocol',
                snmpSettingsForm.encryptProtocol,
              );
            }
            if (snmpSettingsForm.encryptKey != null)
              config.SNMP.EncryptionKey = snmpSettingsForm.encryptKey;

            commit('setSnmpSecurityLevel', snmpSettingsForm.lvl);

            return api
              .post('/redfish/v1/AccountService/Accounts', config)
              .then(() => i18n.t('pageEventSettings.successSaveEventSettings'));
          }
          return i18n.t('pageEventSettings.successSaveEventSettings');
        })
        .catch(() => {
          throw new Error(i18n.t('pageEventSettings.errorSaveEventSettings'));
        });
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
      if (data.Protocol == 'SMTP') {
        data.SyslogFilters = {
          LowestSeverity: subscriptionForm.lowestSeverity,
        };
      }
      return await api
        .post('/redfish/v1/EventService/Subscriptions', data)
        .then(() => {
          dispatch('getSubscriptions');
          if (subscriptionForm.protocol == 'SyslogTCP')
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
          if (subscription.protocol == 'SyslogTCP') dispatch('getSyslogData');
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
