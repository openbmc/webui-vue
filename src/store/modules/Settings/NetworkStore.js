import api from '@/store/api';
import i18n from '@/i18n';
import { defineStore } from 'pinia';

export const NetworkStore = defineStore('network', {
  state: () => ({
    ethernetData: [],
    firstInterfaceId: '', //used for setting global DHCP settings
    globalNetworkSettings: [],
    selectedInterfaceId: '', // which tab is selected
    selectedInterfaceIndex: 0, // which tab is selected
  }),
  getters: {
    getEthernetDatathernetData: (state) => state.ethernetData,
    getFirstInterfaceId: (state) => state.firstInterfaceId,
    getGlobalNetworkSettings: (state) => state.globalNetworkSettings,
    getSelectedInterfaceId: (state) => state.selectedInterfaceId,
    getSelectedInterfaceIndex: (state) => state.selectedInterfaceIndex,
  },
  actions: {
    async setGlobalNetworkSettings(data) {
      this.globalNetworkSettings = data.map(({ data }) => {
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
          dhcpEnabled: DHCPv4.DHCPEnabled,
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
    async getEthernetData() {
      return await api
        .get('api/redfish/v1/Managers/bmc/EthernetInterfaces')
        .then((response) =>
          response.data.Members.map(
            (ethernetInterface) => 'api' + ethernetInterface['@odata.id']
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

          this.ethernetData = ethernetData;
          this.firstInterfaceId = firstInterfaceId;
          this.selectedInterfaceId = firstInterfaceId;
          this.setGlobalNetworkSettings(ethernetInterfaces);
        })
        .catch((error) => {
          console.log('Network Data:', error);
        });
    },
    async saveDhcpEnabledState(dhcpState) {
      const data = {
        DHCPv4: {
          DHCPEnabled: dhcpState,
        },
      };
      return api
        .patch(
          `api/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          data
        )
        .then(this.getEthernetData())
        .then(() => {
          return i18n.global.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.global.t('pageNetwork.dhcp'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.global.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.global.t('pageNetwork.dhcp'),
            })
          );
        });
    },
    async saveDomainNameState(domainState) {
      this.domainState = domainState;
      const data = {
        DHCPv4: {
          UseDomainName: domainState,
        },
      };
      // Saving to the first interface automatically updates DHCPv4 and DHCPv6
      // on all interfaces
      return api
        .patch(
          `api/redfish/v1/Managers/bmc/EthernetInterfaces/${this.firstInterfaceId}`,
          data
        )
        .then(() => {
          return i18n.global.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.global.t('pageNetwork.domainName'),
          });
        })
        .catch((error) => {
          console.log(error);
          this.domainState = !domainState;
          throw new Error(
            i18n.global.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.global.t('pageNetwork.domainName'),
            })
          );
        });
    },
    async saveDnsState(dnsState) {
      this.dnsState = dnsState;
      const data = {
        DHCPv4: {
          UseDNSServers: dnsState,
        },
      };
      // Saving to the first interface automatically updates DHCPv4 and DHCPv6
      // on all interfaces
      return api
        .patch(
          `api/redfish/v1/Managers/bmc/EthernetInterfaces/${this.firstInterfaceId}`,
          data
        )
        .then(() => {
          return i18n.global.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.global.t('pageNetwork.dns'),
          });
        })
        .catch((error) => {
          console.log(error);
          this.dnsState = !dnsState;
          throw new Error(
            i18n.global.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.global.t('pageNetwork.dns'),
            })
          );
        });
    },
    async saveNtpState(ntpState) {
      this.ntpState = ntpState;
      const data = {
        DHCPv4: {
          UseNTPServers: ntpState,
        },
      };
      // Saving to the first interface automatically updates DHCPv4 and DHCPv6
      // on all interfaces
      return api
        .patch(
          `api/redfish/v1/Managers/bmc/EthernetInterfaces/${this.firstInterfaceId}`,
          data
        )
        .then(() => {
          return i18n.global.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.global.t('pageNetwork.ntp'),
          });
        })
        .catch((error) => {
          console.log(error);
          this.ntpState = !ntpState;
          throw new Error(
            i18n.global.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.global.t('pageNetwork.ntp'),
            })
          );
        });
    },
    async setSelectedTabIndex(tabIndex) {
      this.selectedInterfaceIndex = tabIndex;
    },
    async setSelectedTabId(tabId) {
      this.selectedInterfaceId = tabId;
    },
    async saveIpv4Address(ipv4Form) {
      const originalAddresses = this.ethernetData[
        this.selectedInterfaceIndex
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
          `api/redfish/v1/Managers/bmc/EthernetInterfaces/${this.selectedInterfaceId}`,
          { IPv4StaticAddresses: originalAddresses.concat(newAddress) }
        )
        .then(this.getEthernetData())
        .then(() => {
          return i18n.global.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.global.t('pageNetwork.ipv4'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.global.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.global.t('pageNetwork.ipv4'),
            })
          );
        });
    },
    async editIpv4Address(ipv4TableData) {
      return api
        .patch(
          `api/redfish/v1/Managers/bmc/EthernetInterfaces/${this.selectedInterfaceId}`,
          { IPv4StaticAddresses: ipv4TableData }
        )
        .then(this.getEthernetData())
        .then(() => {
          return i18n.global.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.global.t('pageNetwork.ipv4'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.global.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.global.t('pageNetwork.ipv4'),
            })
          );
        });
    },
    async saveSettings(interfaceSettingsForm) {
      return api
        .patch(
          `api/redfish/v1/Managers/bmc/EthernetInterfaces/${this.selectedInterfaceId}`,
          interfaceSettingsForm
        )
        .then(this.getEthernetData())
        .then(() => {
          return i18n.global.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.global.t('pageNetwork.network'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.global.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.global.t('pageNetwork.network'),
            })
          );
        });
    },
    async saveDnsAddress(dnsForm) {
      const newAddress = dnsForm;
      const originalAddresses =
        this.ethernetData[this.selectedInterfaceIndex].StaticNameServers;
      const newDnsArray = originalAddresses.concat(newAddress);
      return api
        .patch(
          `api/v1/Managers/bmc/EthernetInterfaces/${this.selectedInterfaceId}`,
          { StaticNameServers: newDnsArray }
        )
        .then(this.getEthernetData())
        .then(() => {
          return i18n.global.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.global.t('pageNetwork.dns'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.global.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.global.t('pageNetwork.dns'),
            })
          );
        });
    },
    async editDnsAddress(dnsTableData) {
      return api
        .patch(
          `api/v1/Managers/bmc/EthernetInterfaces/${this.selectedInterfaceId}`,
          { StaticNameServers: dnsTableData }
        )
        .then(this.getEthernetData())
        .then(() => {
          return i18n.global.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.global.t('pageNetwork.dns'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.global.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.global.t('pageNetwork.dns'),
            })
          );
        });
    },
  },
});

export default NetworkStore;
