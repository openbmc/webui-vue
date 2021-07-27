import api from '@/store/api';
import i18n from '@/i18n';
import { find, remove } from 'lodash';

const NetworkSettingsStore = {
  namespaced: true,
  state: {
    ethernetData: [],
    interfaceOptions: [],
  },
  getters: {
    ethernetData: (state) => state.ethernetData,
    interfaceOptions: (state) => state.interfaceOptions,
  },
  mutations: {
    setEthernetData: (state, ethernetData) =>
      (state.ethernetData = ethernetData),
    setInterfaceOptions: (state, interfaceOptions) =>
      (state.interfaceOptions = interfaceOptions),
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
          const interfaceOptions = ethernetInterfaces.map(
            (ethernetName) => ethernetName.data.Id
          );
          commit('setEthernetData', ethernetData);
          commit('setInterfaceOptions', interfaceOptions);
        })
        .catch((error) => {
          console.log('Network Data:', error);
        });
    },

    async updateInterfaceSettings({ dispatch, state }, networkSettingsForm) {
      const data = {
        HostName: networkSettingsForm.hostname,
        MACAddress: networkSettingsForm.macAddress,
        DHCPv4: {
          DHCPEnabled: networkSettingsForm.isDhcpEnabled,
        },
        StaticNameServers: networkSettingsForm.staticNameServers,
      };

      const updatedGateway = networkSettingsForm.gateway;
      const updatedStaticIpv4Addresses = networkSettingsForm.staticIpv4;
      const originalStaticIpv4Addresses =
        state.ethernetData[networkSettingsForm.selectedInterfaceIndex]
          .IPv4StaticAddresses;

      // Compare updatedStaticIpv4Addresses changes to originalStaticIpv4Addresses
      const diffStaticIpv4Addresses = originalStaticIpv4Addresses.map(
        (item) => {
          const address = item.Address;
          const gateway = item.Gateway;
          // If updated network settings form address matches original address
          // remove it from array and replace with {}
          if (find(updatedGateway, { Gateway: gateway })) {
            remove(updatedGateway, (item) => {
              return item.Gateway === gateway;
            });
            if (find(updatedStaticIpv4Addresses, { Address: address })) {
              remove(updatedStaticIpv4Addresses, (item) => {
                return item.Address === address;
              });
              // Pass {} for no change to address
              return {};
            } else {
              // Remove address without a match
              return null;
            }
          }
        }
      );
      // If DHCP disabled, update static DNS or static ipv4
      if (!networkSettingsForm.staticIpv4.length === 0) {
        // Add new or changed addresses to end of static ipv4 array
        data.IPv4StaticAddresses = [
          ...diffStaticIpv4Addresses,
          ...updatedStaticIpv4Addresses,
        ];
      }

      return await api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${networkSettingsForm.interfaceId}`,
          data
        )
        .then(() => dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetworkSettings.toast.successSaveNetworkSettings');
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetworkSettings.toast.errorSaveNetworkSettings')
          );
        });
    },
  },
};

export default NetworkSettingsStore;
