import api from '@/store/api';
import i18n from '@/i18n';

const PoliciesStore = {
  namespaced: true,
  state: {
    sshProtocolEnabled: false,
    ipmiProtocolEnabled: false,
    rtadEnabled: 'Disabled',
    vtpmEnabled: 'Disabled',
    sessionTimeoutValue: null,
    basicAuthEnabled: false,
  },
  getters: {
    sshProtocolEnabled: (state) => state.sshProtocolEnabled,
    ipmiProtocolEnabled: (state) => state.ipmiProtocolEnabled,
    rtadEnabled: (state) => state.rtadEnabled,
    vtpmEnabled: (state) => state.vtpmEnabled,
    getSessionTimeoutValue: (state) => state.sessionTimeoutValue,
    basicAuthEnabledGetter: (state) => state.basicAuthEnabled,
  },
  mutations: {
    setSshProtocolEnabled: (state, sshProtocolEnabled) =>
      (state.sshProtocolEnabled = sshProtocolEnabled),
    setIpmiProtocolEnabled: (state, ipmiProtocolEnabled) =>
      (state.ipmiProtocolEnabled = ipmiProtocolEnabled),
    setRtadEnabled: (state, rtadEnabled) => (state.rtadEnabled = rtadEnabled),
    setVtpmEnabled: (state, vtpmEnabled) => (state.vtpmEnabled = vtpmEnabled),
    setBasicAuthEnabled: (state, basicAuthEnabled) =>
      (state.basicAuthEnabled = basicAuthEnabled),
    setSessionTimeoutValue(state, sessionTimeoutValue) {
      state.sessionTimeoutValue = sessionTimeoutValue;
    },
  },
  actions: {
    async getNetworkProtocolStatus({ commit }) {
      return await api
        .get(`${await this.dispatch('global/getBmcPath')}/NetworkProtocol`)
        .then((response) => {
          const sshProtocol = response.data.SSH.ProtocolEnabled;
          const ipmiProtocol = response.data.IPMI.ProtocolEnabled;
          commit('setSshProtocolEnabled', sshProtocol);
          commit('setIpmiProtocolEnabled', ipmiProtocol);
        })
        .catch((error) => console.log(error));
    },
    async getBasicAuth({ commit }) {
      return await api
        .get('/redfish/v1/AccountService')
        .then((response) => {
          if (response?.data?.HTTPBasicAuth !== undefined) {
            commit(
              'setBasicAuthEnabled',
              response.data.HTTPBasicAuth === 'Enabled',
            );
            return true;
          }
          return false;
        })
        .catch((error) => {
          console.log(error);
          return false;
        });
    },
    async getBiosStatus({ commit }) {
      return await api
        .get(`${await this.dispatch('global/getSystemPath')}/Bios`)
        .then((response) => {
          commit('setRtadEnabled', response.data.Attributes.pvm_rtad);
          commit('setVtpmEnabled', response.data.Attributes.pvm_vtpm);
        })
        .catch((error) => console.log(error));
    },
    async getSessionTimeout({ commit }) {
      return await api
        .get('/redfish/v1/SessionService')
        .then((response) => {
          const sessionTimeoutValue = response.data.SessionTimeout;
          commit('setSessionTimeoutValue', sessionTimeoutValue);
        })
        .catch((error) => console.log(error));
    },
    async saveBasicAuthEnabled({ commit }, updatedBasicAuth) {
      const basicAuthEnabled = updatedBasicAuth === 'Enabled';
      commit('setBasicAuthEnabled', basicAuthEnabled);
      return await api
        .patch('/redfish/v1/AccountService', {
          HTTPBasicAuth: updatedBasicAuth,
        })
        .then(() => {
          if (basicAuthEnabled) {
            return i18n.global.t('pagePolicies.toast.successBasicAuthEnabled');
          } else {
            return i18n.global.t('pagePolicies.toast.successBasicAuthDisabled');
          }
        })
        .catch((error) => {
          console.log(error);
          commit('setBasicAuthEnabled', !basicAuthEnabled);
          if (basicAuthEnabled) {
            throw new Error(
              i18n.global.t('pagePolicies.toast.errorBasicAuthEnabled'),
            );
          } else {
            throw new Error(
              i18n.global.t('pagePolicies.toast.errorBasicAuthDisabled'),
            );
          }
        });
    },
    async saveIpmiProtocolState({ commit }, protocolEnabled) {
      commit('setIpmiProtocolEnabled', protocolEnabled);
      const ipmi = {
        IPMI: {
          ProtocolEnabled: protocolEnabled,
        },
      };
      return await api
        .patch(
          `${await this.dispatch('global/getBmcPath')}/NetworkProtocol`,
          ipmi,
        )
        .then(() => {
          if (protocolEnabled) {
            return i18n.global.t('pagePolicies.toast.successIpmiEnabled');
          } else {
            return i18n.global.t('pagePolicies.toast.successIpmiDisabled');
          }
        })
        .catch((error) => {
          console.log(error);
          commit('setIpmiProtocolEnabled', !protocolEnabled);
          if (protocolEnabled) {
            throw new Error(
              i18n.global.t('pagePolicies.toast.errorIpmiEnabled'),
            );
          } else {
            throw new Error(
              i18n.global.t('pagePolicies.toast.errorIpmiDisabled'),
            );
          }
        });
    },
    async saveSshProtocolState({ commit }, protocolEnabled) {
      commit('setSshProtocolEnabled', protocolEnabled);
      const ssh = {
        SSH: {
          ProtocolEnabled: protocolEnabled,
        },
      };
      return await api
        .patch(
          `${await this.dispatch('global/getBmcPath')}/NetworkProtocol`,
          ssh,
        )
        .then(() => {
          if (protocolEnabled) {
            return i18n.global.t('pagePolicies.toast.successSshEnabled');
          } else {
            return i18n.global.t('pagePolicies.toast.successSshDisabled');
          }
        })
        .catch((error) => {
          console.log(error);
          commit('setSshProtocolEnabled', !protocolEnabled);
          if (protocolEnabled) {
            throw new Error(
              i18n.global.t('pagePolicies.toast.errorSshEnabled'),
            );
          } else {
            throw new Error(
              i18n.global.t('pagePolicies.toast.errorSshDisabled'),
            );
          }
        });
    },
    async saveRtadState({ commit }, updatedRtad) {
      commit('setRtadEnabled', updatedRtad);
      return await api
        .patch(`${await this.dispatch('global/getSystemPath')}/Bios/Settings`, {
          Attributes: {
            pvm_rtad: updatedRtad,
          },
        })
        .then(() => {
          if (updatedRtad === 'Enabled') {
            return i18n.global.t('pagePolicies.toast.successRtadEnabled');
          } else {
            return i18n.global.t('pagePolicies.toast.successRtadDisabled');
          }
        })
        .catch((error) => {
          console.log(error);
          if (updatedRtad === 'Enabled') {
            throw new Error(
              i18n.global.t('pagePolicies.toast.errorRtadEnabled'),
            );
          } else {
            throw new Error(
              i18n.global.t('pagePolicies.toast.errorRtadDisabled'),
            );
          }
        });
    },
    async saveVtpmState({ commit }, updatedVtpm) {
      commit('setVtpmEnabled', updatedVtpm);
      return await api
        .patch(`${await this.dispatch('global/getSystemPath')}/Bios/Settings`, {
          Attributes: {
            pvm_vtpm: updatedVtpm,
          },
        })
        .then(() => {
          if (updatedVtpm === 'Enabled') {
            return i18n.global.t('pagePolicies.toast.successVtpmEnabled');
          } else {
            return i18n.global.t('pagePolicies.toast.successVtpmDisabled');
          }
        })
        .catch((error) => {
          console.log(error);
          if (updatedVtpm === 'Enabled') {
            throw new Error(
              i18n.global.t('pagePolicies.toast.errorVtpmEnabled'),
            );
          } else {
            throw new Error(
              i18n.global.t('pagePolicies.toast.errorVtpmDisabled'),
            );
          }
        });
    },
    async saveSessionTimeoutValue({ dispatch }, sessionTimeoutNewValue) {
      const sessionValue = {
        SessionTimeout: sessionTimeoutNewValue,
      };
      return await api
        .patch('/redfish/v1/SessionService', sessionValue)
        .then(() => dispatch('getSessionTimeout'))
        .then(() => {
          return i18n.global.t('pagePolicies.toast.successSessionTimeout');
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.global.t('pagePolicies.toast.errorSessionTimeout'),
          );
        });
    },
  },
};

export default PoliciesStore;
