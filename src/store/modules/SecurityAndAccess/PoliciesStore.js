import api from '@/store/api';
import i18n from '@/i18n';

const PoliciesStore = {
  namespaced: true,
  state: {
    sshProtocolEnabled: false,
    ipmiProtocolEnabled: false,
    tpmPolicyEnabled: false,
  },
  getters: {
    sshProtocolEnabled: (state) => state.sshProtocolEnabled,
    ipmiProtocolEnabled: (state) => state.ipmiProtocolEnabled,
    tpmPolicyEnabled: (state) => state.tpmPolicyEnabled,
  },
  mutations: {
    setSshProtocolEnabled: (state, sshProtocolEnabled) =>
      (state.sshProtocolEnabled = sshProtocolEnabled),
    setIpmiProtocolEnabled: (state, ipmiProtocolEnabled) =>
      (state.ipmiProtocolEnabled = ipmiProtocolEnabled),
    setTpmPolicyEnabled: (state, tpmPolicyEnabled) =>
      (state.tpmPolicyEnabled = tpmPolicyEnabled),
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
    async getTpmPolicy({ commit }) {
      // TODO: remove hardcoded endpoint when fix is available
      return await api
        .get('/redfish/v1/Systems/system')
        .then((response) => {
          const tpmState = response.data.Boot.TrustedModuleRequiredToBoot;
          commit('setTpmPolicyEnabled', tpmState === 'Required');
        })
        .catch((error) => console.log(error));
    },
    async saveTpmPolicy({ commit }, protocolEnabled) {
      commit('setTpmPolicyEnabled', protocolEnabled);
      const data = {
        Boot: {
          TrustedModuleRequiredToBoot: protocolEnabled,
        },
      };
      // TODO: waiting for
      // https://gerrit.openbmc-project.xyz/c/openbmc/bmcweb/+/46928 to merge in
      // order to test patch
      // TODO: remove hardcoded endpoint when fix is available
      return api
        .patch('/redfish/v1/Systems/system', data)
        .then(() => {
          return i18n.t('pagePolicies.toast.successNetworkPolicyUpdate', {
            policy: i18n.t('pagePolicies.hostTpm'),
          });
        })
        .catch((error) => {
          console.log(error);
          commit('setTpmPolicyEnabled', !protocolEnabled);
          throw new Error(
            i18n.t('pagePolicies.toast.errorNetworkPolicyUpdate', {
              policy: i18n.t('pagePolicies.hostTpm'),
            })
          );
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
        .patch('/redfish/v1/Managers/bmc/NetworkProtocol', ipmi)
        .then(() => {
          return i18n.t('pagePolicies.toast.successNetworkPolicyUpdate', {
            policy: i18n.t('pagePolicies.ipmi'),
          });
        })
        .catch((error) => {
          console.log(error);
          commit('setTpmPolicyEnabled', !protocolEnabled);
          throw new Error(
            i18n.t('pagePolicies.toast.errorNetworkPolicyUpdate', {
              policy: i18n.t('pagePolicies.ipmi'),
            })
          );
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
          return i18n.t('pagePolicies.toast.successNetworkPolicyUpdate', {
            policy: i18n.t('pagePolicies.ssh'),
          });
        })
        .catch((error) => {
          console.log(error);
          commit('setTpmPolicyEnabled', !protocolEnabled);
          throw new Error(
            i18n.t('pagePolicies.toast.errorNetworkPolicyUpdate', {
              policy: i18n.t('pagePolicies.ssh'),
            })
          );
        });
    },
  },
};

export default PoliciesStore;
