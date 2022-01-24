import api from '@/store/api';
import i18n from '@/i18n';

const NetworkStore = {
  namespaced: true,
  state: {
    ethernetData: [],
    firstInterfaceId: '', //used for setting global DHCP settings
    globalNetworkSettings: [],
    selectedInterfaceId: '', // which tab is selected
    selectedInterfaceIndex: 0, // which tab is selected
  },
  getters: {
    ethernetData: (state) => state.ethernetData,
    firstInterfaceId: (state) => state.firstInterfaceId,
    globalNetworkSettings: (state) => state.globalNetworkSettings,
    selectedInterfaceId: (state) => state.selectedInterfaceId,
    selectedInterfaceIndex: (state) => state.selectedInterfaceIndex,
  },
  mutations: {
    setDomainNameState: (state, domainState) =>
      (state.domainState = domainState),
    setDnsState: (state, dnsState) => (state.dnsState = dnsState),
    setEthernetData: (state, ethernetData) =>
      (state.ethernetData = ethernetData),
    setFirstInterfaceId: (state, firstInterfaceId) =>
      (state.firstInterfaceId = firstInterfaceId),
    setGlobalNetworkSettings: (state, data) => {
      state.globalNetworkSettings = data.map(({ data }) => {
        const {
          DHCPv4,
          HostName,
          IPv4Addresses,
          IPv4StaticAddresses,
          LinkStatus,
          MACAddress,
        } = data;
        return {
          defaultGateway: IPv4StaticAddresses[0]?.Gateway, //First static gateway is the default gateway
          dhcpAddress: IPv4Addresses.filter(
            (ipv4) => ipv4.AddressOrigin === 'DHCP'
          ),
          hostname: HostName,
          macAddress: MACAddress,
          linkStatus: LinkStatus,
          staticAddress: IPv4StaticAddresses[0]?.Address, // Display first static address on overview page
          useDnsEnabled: DHCPv4.UseDNSServers,
          useDomainNameEnabled: DHCPv4.UseDomainName,
          useNtpEnabled: DHCPv4.UseNTPServers,
        };
      });
    },
    setNtpState: (state, ntpState) => (state.ntpState = ntpState),
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

          commit('setEthernetData', ethernetData);
          commit('setFirstInterfaceId', firstInterfaceId);
          commit('setSelectedInterfaceId', firstInterfaceId);
          commit('setGlobalNetworkSettings', ethernetInterfaces);
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
          UseNTPServers: ntpState,
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
    async setSelectedTabIndex({ commit }, tabIndex) {
      commit('setSelectedInterfaceIndex', tabIndex);
    },
    async setSelectedTabId({ commit }, tabId) {
      commit('setSelectedInterfaceId', tabId);
    },
    async saveIpv4Address({ dispatch, state }, ipv4Form) {
      const originalAddresses = state.ethernetData[
        state.selectedInterfaceIndex
      ].IPv4StaticAddresses.map((ipv4) => {
        const { Address, SubnetMask, Gateway } = ipv4;
        return {
          Address,
          SubnetMask,
          Gateway,
        };
      });
      const newAddress = [ipv4Form];
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          { IPv4StaticAddresses: originalAddresses.concat(newAddress) }
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.ipv4'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.ipv4'),
            })
          );
        });
    },
    async editIpv4Address({ dispatch, state }, ipv4TableData) {
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          { IPv4StaticAddresses: ipv4TableData }
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.ipv4'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.ipv4'),
            })
          );
        });
    },
    async saveSettings({ state, dispatch }, interfaceSettingsForm) {
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          interfaceSettingsForm
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.network'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.network'),
            })
          );
        });
    },
    async saveDnsAddress({ dispatch, state }, dnsForm) {
      const newAddress = dnsForm;
      const originalAddresses =
        state.ethernetData[state.selectedInterfaceIndex].StaticNameServers;
      const newDnsArray = originalAddresses.concat(newAddress);
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          { StaticNameServers: newDnsArray }
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.dns'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.dns'),
            })
          );
        });
    },
    async editDnsAddress({ dispatch, state }, dnsTableData) {
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          { StaticNameServers: dnsTableData }
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.dns'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.dns'),
            })
          );
        });
    },
  },
};

export default NetworkStore;
