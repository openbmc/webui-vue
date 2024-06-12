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
          DHCPv6,
          HostName,
          IPv4Addresses,
          IPv4StaticAddresses,
          IPv6Addresses,
          IPv6StaticAddresses,
          LinkStatus,
          MACAddress,
          IPv6DefaultGateway,
        } = data;
        return {
          defaultGateway: IPv4StaticAddresses[0]?.Gateway, //First static gateway is the default gateway
          ipv6DefaultGateway: IPv6DefaultGateway,
          dhcpAddress: IPv4Addresses.filter(
            (ipv4) => ipv4.AddressOrigin === 'DHCP',
          ),
          dhcpv6Address: IPv6Addresses.filter(
            (ipv6) =>
              ipv6.AddressOrigin === 'SLAAC' || ipv6.AddressOrigin === 'DHCPv6',
          ),
          dhcpEnabled: DHCPv4.DHCPEnabled,
          dhcp6Enabled: DHCPv6.OperatingMode,
          hostname: HostName,
          macAddress: MACAddress,
          linkStatus: LinkStatus,
          staticAddress: IPv4StaticAddresses[0]?.Address, // Display first static address on overview page
          ipv6StaticAddress: IPv6StaticAddresses[0]?.Address,
          useDnsEnabled: DHCPv4.UseDNSServers,
          useDomainNameEnabled: DHCPv4.UseDomainName,
          useNtpEnabled: DHCPv4.UseNTPServers,
          useDnsEnabledIpv6: DHCPv6.UseDNSServers,
          useDomainNameEnabledIpv6: DHCPv6.UseDomainName,
          useNtpEnabledIpv6: DHCPv6.UseNTPServers,
        };
      });
    },
    setNtpState: (state, ntpState) => (state.ntpState = ntpState),
    setDomainNameStateIpv6: (state, domainState) =>
      (state.domainStateIpv6 = domainState),
    setDnsStateIpv6: (state, dnsState) => (state.dnsStateIpv6 = dnsState),
    setNtpStateIpv6: (state, ntpState) => (state.ntpStateIpv6 = ntpState),
    setSelectedInterfaceId: (state, selectedInterfaceId) =>
      (state.selectedInterfaceId = selectedInterfaceId),
    setSelectedInterfaceIndex: (state, selectedInterfaceIndex) =>
      (state.selectedInterfaceIndex = selectedInterfaceIndex),
  },
  actions: {
    async getEthernetData({ commit }) {
      return await api
        .get(`${await this.dispatch('global/getBmcPath')}/EthernetInterfaces`)
        .then((response) =>
          response.data.Members.map(
            (ethernetInterface) => ethernetInterface['@odata.id'],
          ),
        )
        .then((ethernetInterfaceIds) =>
          api.all(
            ethernetInterfaceIds.map((ethernetInterface) =>
              api.get(ethernetInterface),
            ),
          ),
        )
        .then((ethernetInterfaces) => {
          const ethernetData = ethernetInterfaces.map(
            (ethernetInterface) => ethernetInterface.data,
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
    async saveDhcpEnabledState({ state, dispatch }, dhcpState) {
      const data = {
        DHCPv4: {
          DHCPEnabled: dhcpState,
        },
      };
      return api
        .patch(
          `${await this.dispatch('global/getBmcPath')}/EthernetInterfaces/${state.selectedInterfaceId}`,
          data,
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.dhcp'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.dhcp'),
            }),
          );
        });
    },
    async saveDhcp6EnabledState({ state, dispatch }, dhcpState) {
      const data = {
        DHCPv6: {
          OperatingMode: dhcpState ? 'Enabled' : 'Disabled',
        },
      };
      return api
        .patch(
          `${await this.dispatch('global/getBmcPath')}/EthernetInterfaces/${state.selectedInterfaceId}`,
          data,
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.dhcp6'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.dhcp6'),
            }),
          );
        });
    },
    async saveDomainNameState({ commit, state }, { domainState, ipVersion }) {
      var data;
      if (ipVersion === 'IPv4') {
        commit('setDomainNameState', domainState);
        data = {
          DHCPv4: {
            UseDomainName: domainState,
          },
        };
      } else if (ipVersion === 'IPv6') {
        commit('setDomainNameStateIpv6', domainState);
        data = {
          DHCPv6: {
            UseDomainName: domainState,
          },
        };
      }
      // Saving to the first interface automatically updates DHCPv4 and DHCPv6
      // on all interfaces
      return api
        .patch(
          `${await this.dispatch('global/getBmcPath')}/EthernetInterfaces/${state.firstInterfaceId}`,
          data,
        )
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.domainName'),
          });
        })
        .catch((error) => {
          console.log(error);
          if (ipVersion === 'IPv4') commit('setDomainNameState', !domainState);
          else if (ipVersion === 'IPv6')
            commit('setDomainNameStateIpv6', !domainState);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.domainName'),
            }),
          );
        });
    },
    async saveDnsState({ commit, state }, { dnsState, ipVersion }) {
      var data;
      if (ipVersion === 'IPv4') {
        commit('setDnsState', dnsState);
        data = {
          DHCPv4: {
            UseDNSServers: dnsState,
          },
        };
      } else if (ipVersion === 'IPv6') {
        commit('setDnsStateIpv6', dnsState);
        data = {
          DHCPv6: {
            UseDNSServers: dnsState,
          },
        };
      }
      // Saving to the first interface automatically updates DHCPv4 and DHCPv6
      // on all interfaces
      return api
        .patch(
          `${await this.dispatch('global/getBmcPath')}/EthernetInterfaces/${state.firstInterfaceId}`,
          data,
        )
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.dns'),
          });
        })
        .catch((error) => {
          console.log(error);
          if (ipVersion === 'IPv4') commit('setDnsState', !dnsState);
          else if (ipVersion === 'IPv6') commit('setDnsStateIpv6', !dnsState);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.dns'),
            }),
          );
        });
    },
    async saveNtpState({ commit, state }, { ntpState, ipVersion }) {
      var data;
      if (ipVersion === 'IPv4') {
        commit('setNtpState', ntpState);
        data = {
          DHCPv4: {
            UseNTPServers: ntpState,
          },
        };
      } else if (ipVersion === 'IPv6') {
        commit('setNtpStateIpv6', ntpState);
        data = {
          DHCPv6: {
            UseNTPServers: ntpState,
          },
        };
      }
      // Saving to the first interface automatically updates DHCPv4 and DHCPv6
      // on all interfaces
      return api
        .patch(
          `${await this.dispatch('global/getBmcPath')}/EthernetInterfaces/${state.firstInterfaceId}`,
          data,
        )
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.ntp'),
          });
        })
        .catch((error) => {
          console.log(error);
          if (ipVersion === 'IPv4') commit('setNtpState', !ntpState);
          else if (ipVersion === 'IPv6') commit('setNtpStateIpv6', !ntpState);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.ntp'),
            }),
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
          `${await this.dispatch('global/getBmcPath')}/EthernetInterfaces/${state.selectedInterfaceId}`,
          { IPv4StaticAddresses: originalAddresses.concat(newAddress) },
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
            }),
          );
        });
    },
    async saveIpv6Address({ dispatch, state }, ipv6Form) {
      const originalAddresses = state.ethernetData[
        state.selectedInterfaceIndex
      ].IPv6StaticAddresses.map((ipv6) => {
        const { Address, PrefixLength } = ipv6;
        return {
          Address,
          PrefixLength,
        };
      });
      const newAddress = [ipv6Form];
      return api
        .patch(
          `${await this.dispatch('global/getBmcPath')}/EthernetInterfaces/${state.selectedInterfaceId}`,
          { IPv6StaticAddresses: originalAddresses.concat(newAddress) },
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.ipv6'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.ipv6'),
            }),
          );
        });
    },
    async editIpv4Address({ dispatch, state }, ipv4TableData) {
      return api
        .patch(
          `${await this.dispatch('global/getBmcPath')}/EthernetInterfaces/${state.selectedInterfaceId}`,
          { IPv4StaticAddresses: ipv4TableData },
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
            }),
          );
        });
    },
    async editIpv6Address({ dispatch, state }, ipv6TableData) {
      return api
        .patch(
          `${await this.dispatch('global/getBmcPath')}/EthernetInterfaces/${state.selectedInterfaceId}`,
          { IPv6StaticAddresses: ipv6TableData },
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.ipv6'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.ipv6'),
            }),
          );
        });
    },
    async saveSettings({ state, dispatch }, interfaceSettingsForm) {
      return api
        .patch(
          `${await this.dispatch('global/getBmcPath')}/EthernetInterfaces/${state.selectedInterfaceId}`,
          interfaceSettingsForm,
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
            }),
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
          `${await this.dispatch('global/getBmcPath')}/EthernetInterfaces/${state.selectedInterfaceId}`,
          { StaticNameServers: newDnsArray },
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
            }),
          );
        });
    },
    async editDnsAddress({ dispatch, state }, dnsTableData) {
      return api
        .patch(
          `${await this.dispatch('global/getBmcPath')}/EthernetInterfaces/${state.selectedInterfaceId}`,
          { StaticNameServers: dnsTableData },
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
            }),
          );
        });
    },
  },
};

export default NetworkStore;
