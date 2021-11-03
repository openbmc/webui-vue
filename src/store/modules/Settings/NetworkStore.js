import api from '@/store/api';
import i18n from '@/i18n';

const NetworkStore = {
  namespaced: true,
  state: {
    ethernetData: [],
    firstInterfaceId: '', //used for setting global DHCP settings
    isDnsEnabled: false,
    isDomainNameEnabled: false,
    isNtpEnabled: false,
    selectedInterfaceId: '',
    selectedInterfaceIndex: '',
  },
  getters: {
    ethernetData: (state) => state.ethernetData,
    firstInterfaceId: (state) => state.firstInterfaceId,
    isDnsEnabled: (state) => state.isDnsEnabled,
    isDomainNameEnabled: (state) => state.isDomainNameEnabled,
    isNtpEnabled: (state) => state.isNtpEnabled,
    selectedInterfaceId: (state) => state.selectedInterfaceId,
    selectedInterfaceIndex: (state) => state.selectedInterfaceIndex,
  },
  mutations: {
    setEthernetData: (state, ethernetData) =>
      (state.ethernetData = ethernetData),
    setFirstInterfaceId: (state, firstInterfaceId) =>
      (state.firstInterfaceId = firstInterfaceId),
    setDnsState: (state, isDnsEnabled) => (state.isDnsEnabled = isDnsEnabled),
    setDomainNameState: (state, isDomainNameEnabled) =>
      (state.isDomainNameEnabled = isDomainNameEnabled),
    setNtpState: (state, isNtpEnabled) => (state.isNtpEnabled = isNtpEnabled),
    setSelectedInterfaceId: (state, selectedInterfaceId) =>
      (state.selectedInterfaceId = selectedInterfaceId),
    setSelectedInterfaceIndex: (state, selectedInterfaceIndex) =>
      (state.selectedInterfaceIndex = selectedInterfaceIndex),
  },
  actions: {
    async getEthernetData({ commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc/EthernetInterfaces')
        .then((response) =>
          response.data.Members.map(
            (ethernetInterface) => ethernetInterface['@odata.id']
          )
        )
        .then((ethernetInterfaceIds) =>
          api.all(
            ethernetInterfaceIds.map((ethernetInterface) =>
              api.get(ethernetInterface)
            )
          )
        )
        .then((ethernetInterfaces) => {
          const ethernetData = ethernetInterfaces.map(
            (ethernetInterface) => ethernetInterface.data
          );
          const firstInterfaceId = ethernetData[0].Id;
          const dnsState = ethernetData[0].DHCPv4.UseDNSServers;
          const domainNameState = ethernetData[0].DHCPv4.UseDomainName;
          const ntpState = ethernetData[0].DHCPv4.UseNTPServers;

          commit('setEthernetData', ethernetData);
          commit('setFirstInterfaceId', firstInterfaceId);
          commit('setDnsState', dnsState);
          commit('setDomainNameState', domainNameState);
          commit('setNtpState', ntpState);
        })
        .catch((error) => {
          console.log('Network Data:', error);
        });
    },
    async saveDomainNameState({ commit, state }, domainState) {
      commit('setDomainNameState', domainState);
      const data = {
        DHCPv4: {
          UseDomainName: domainState,
        },
      };
      // Saving to the first interface automatically updates DHCPv4 and DHCPv6
      // on all interfaces
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.firstInterfaceId}`,
          data
        )
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.domainName'),
          });
        })
        .catch((error) => {
          console.log(error);
          commit('setDomainNameState', !domainState);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.domainName'),
            })
          );
        });
    },
    async saveDnsState({ commit, state }, dnsState) {
      commit('setDnsState', dnsState);
      const data = {
        DHCPv4: {
          UseDNSServers: dnsState,
        },
      };
      // Saving to the first interface automatically updates DHCPv4 and DHCPv6
      // on all interfaces
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.firstInterfaceId}`,
          data
        )
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.dns'),
          });
        })
        .catch((error) => {
          console.log(error);
          commit('setDnsState', !dnsState);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.dns'),
            })
          );
        });
    },
    async saveNtpState({ commit, state }, ntpState) {
      commit('setNtpState', ntpState);
      const data = {
        DHCPv4: {
          UseDNSServers: ntpState,
        },
      };
      // Saving to the first interface automatically updates DHCPv4 and DHCPv6
      // on all interfaces
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.firstInterfaceId}`,
          data
        )
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.ntp'),
          });
        })
        .catch((error) => {
          console.log(error);
          commit('setNtpState', !ntpState);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.ntp'),
            })
          );
        });
    },
    async saveIpv4Address({ state }, ipv4Form) {
      const updatedAddress = [ipv4Form];
      const originalAddresses =
        state.ethernetData[state.selectedInterfaceIndex].IPv4StaticAddresses;
      const newStaticIpv4Array = originalAddresses.concat(updatedAddress);
      console.log(newStaticIpv4Array);
      // return api
      //   .patch(
      //     `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
      //     newStaticIpv4Array
      //   )
      //   .then(() => {
      //     return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
      //       setting: i18n.t('pageNetwork.ipv4'),
      //     });
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //     throw new Error(
      //       i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
      //         setting: i18n.t('pageNetwork.ipv4'),
      //       })
      //     );
      //   });
    },
    async saveDnsAddress(_, dnsForm) {
      const data = dnsForm;
      console.log('store', data);
      // TODO: patch static DNS
    },
  },
};

export default NetworkStore;
