import api from '@/store/api';
import i18n from '@/i18n';

const SecuritySettingsStore = {
  namespaced: true,
  state: {
    sshProtocolEnabled: false,
    ipmiProtocolEnabled: false,
  },
  getters: {
    sshProtocolEnabled: (state) => state.sshProtocolEnabled,
    ipmiProtocolEnabled: (state) => state.ipmiProtocolEnabled,
  },
  mutations: {
    setSshProtocolEnabled: (state, sshProtocolEnabled) =>
      (state.sshProtocolEnabled = sshProtocolEnabled),
    setIpmiProtocolEnabled: (state, ipmiProtocolEnabled) =>
      (state.ipmiProtocolEnabled = ipmiProtocolEnabled),
  },
  actions: {
    async getNetworkProtocolStatus({ commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc/NetworkProtocol')
        .then((response) => {
          const sshProtocol = response.data.SSH.ProtocolEnabled;
          const ipmiProtocol = response.data.IPMI.ProtocolEnabled;
          commit('setSshProtocolEnabled', sshProtocol);
          commit('setIpmiProtocolEnabled', ipmiProtocol);
        })
        .catch((error) => console.log(error));
    },
    async saveIpmiProtocolState({ commit }, protocolState) {
      commit('setIpmiProtocolEnabled', protocolState);
      const ipmi = {
        IPMI: {
          ProtocolEnabled: protocolState,
        },
      };
      return await api
        .patch('/redfish/v1/Managers/bmc/NetworkProtocol', ipmi)
        .then(() => {
          if (protocolState) {
            return i18n.t('pageSecuritySettings.toast.successIpmiEnabled');
          } else {
            return i18n.t('pageSecuritySettings.toast.successIpmiDisabled');
          }
        })
        .catch((error) => {
          console.log(error);
          commit('setIpmiProtocolEnabled', !protocolState);
          if (protocolState) {
            throw new Error(
              i18n.t('pageSecuritySettings.toast.errorIpmiEnabled')
            );
          } else {
            throw new Error(
              i18n.t('pageSecuritySettings.toast.errorIpmiDisabled')
            );
          }
        });
    },
    async saveSshProtocolState({ commit }, protocolState) {
      commit('setSshProtocolEnabled', protocolState);
      const ssh = {
        SSH: {
          ProtocolEnabled: protocolState,
        },
      };
      return await api
        .patch('/redfish/v1/Managers/bmc/NetworkProtocol', ssh)
        .then(() => {
          if (protocolState) {
            return i18n.t('pageSecuritySettings.toast.successSshEnabled');
          } else {
            return i18n.t('pageSecuritySettings.toast.successSshDisabled');
          }
        })
        .catch((error) => {
          console.log(error);
          commit('setSshProtocolEnabled', !protocolState);
          if (protocolState) {
            throw new Error(
              i18n.t('pageSecuritySettings.toast.errorSshEnabled')
            );
          } else {
            throw new Error(
              i18n.t('pageSecuritySettings.toast.errorSshDisabled')
            );
          }
        });
    },
  },
};

export default SecuritySettingsStore;
