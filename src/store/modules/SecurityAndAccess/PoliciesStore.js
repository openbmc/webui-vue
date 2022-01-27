import api from '@/store/api';
import i18n from '@/i18n';

const PoliciesStore = {
  namespaced: true,
  state: {
    sshProtocolEnabled: false,
    ipmiProtocolEnabled: false,
    rtadEnabled: 'Disabled',
    vtpmEnabled: 'Disabled',
  },
  getters: {
    sshProtocolEnabled: (state) => state.sshProtocolEnabled,
    ipmiProtocolEnabled: (state) => state.ipmiProtocolEnabled,
    rtadEnabled: (state) => state.rtadEnabled,
    vtpmEnabled: (state) => state.vtpmEnabled,
  },
  mutations: {
    setSshProtocolEnabled: (state, sshProtocolEnabled) =>
      (state.sshProtocolEnabled = sshProtocolEnabled),
    setIpmiProtocolEnabled: (state, ipmiProtocolEnabled) =>
      (state.ipmiProtocolEnabled = ipmiProtocolEnabled),
    setRtadEnabled: (state, rtadEnabled) => (state.rtadEnabled = rtadEnabled),
    setVtpmEnabled: (state, vtpmEnabled) => (state.vtpmEnabled = vtpmEnabled),
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
    async getBiosStatus({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/Bios')
        .then((response) => {
          const rtad = response.data.Attributes.pvm_rtad;
          const vtpm = response.data.Attributes.pvm_vtpm;
          commit('setRtadEnabled', rtad);
          commit('setVtpmEnabled', vtpm);
        })
        .catch((error) => console.log(error));
    },
    async saveIpmiProtocolState({ commit }, protocolEnabled) {
      commit('setIpmiProtocolEnabled', protocolEnabled);
      const ipmi = {
        IPMI: {
          ProtocolEnabled: protocolEnabled,
        },
      };
      return await api
        .patch('/redfish/v1/Managers/bmc/NetworkProtocol', ipmi)
        .then(() => {
          if (protocolEnabled) {
            return i18n.t('pagePolicies.toast.successIpmiEnabled');
          } else {
            return i18n.t('pagePolicies.toast.successIpmiDisabled');
          }
        })
        .catch((error) => {
          console.log(error);
          commit('setIpmiProtocolEnabled', !protocolEnabled);
          if (protocolEnabled) {
            throw new Error(i18n.t('pagePolicies.toast.errorIpmiEnabled'));
          } else {
            throw new Error(i18n.t('pagePolicies.toast.errorIpmiDisabled'));
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
        .patch('/redfish/v1/Managers/bmc/NetworkProtocol', ssh)
        .then(() => {
          if (protocolEnabled) {
            return i18n.t('pagePolicies.toast.successSshEnabled');
          } else {
            return i18n.t('pagePolicies.toast.successSshDisabled');
          }
        })
        .catch((error) => {
          console.log(error);
          commit('setSshProtocolEnabled', !protocolEnabled);
          if (protocolEnabled) {
            throw new Error(i18n.t('pagePolicies.toast.errorSshEnabled'));
          } else {
            throw new Error(i18n.t('pagePolicies.toast.errorSshDisabled'));
          }
        });
    },
    async saveRtadState({ commit }, rtadEnabled) {
      commit('setRtadEnabled', rtadEnabled);
      return await api
        .patch('/redfish/v1/Systems/system/Bios/Settings', {
          Attributes: {
            pvm_rtad: rtadEnabled,
          },
        })
        .then(() => {
          if (rtadEnabled === i18n.t('global.status.enabled')) {
            return i18n.t('pagePolicies.toast.successRtadEnabled');
          } else {
            return i18n.t('pagePolicies.toast.successRtadDisabled');
          }
        })
        .catch((error) => {
          console.log(error);
          if (rtadEnabled === i18n.t('global.status.enabled')) {
            throw new Error(i18n.t('pagePolicies.toast.errorRtadEnabled'));
          } else {
            throw new Error(i18n.t('pagePolicies.toast.errorRtadDisabled'));
          }
        });
    },
    async saveVtpmState({ commit }, vtpmEnabled) {
      commit('setVtpmEnabled', vtpmEnabled);
      return await api
        .patch('/redfish/v1/Systems/system/Bios/Settings', {
          Attributes: {
            pvm_vtpm: vtpmEnabled,
          },
        })
        .then(() => {
          if (vtpmEnabled === i18n.t('global.status.enabled')) {
            return i18n.t('pagePolicies.toast.successVtpmEnabled');
          } else {
            return i18n.t('pagePolicies.toast.successVtpmDisabled');
          }
        })
        .catch((error) => {
          console.log(error);
          if (vtpmEnabled === i18n.t('global.status.enabled')) {
            throw new Error(i18n.t('pagePolicies.toast.errorVtpmEnabled'));
          } else {
            throw new Error(i18n.t('pagePolicies.toast.errorVtpmDisabled'));
          }
        });
    },
  },
};

export default PoliciesStore;
