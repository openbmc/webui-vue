import api from '@/store/api';
import i18n from '@/i18n';
import { find, remove } from 'lodash';

const NetworkStore = {
  namespaced: true,
  state: {
    defaultGateway: '',
    ethernetData: [],
    interfaceOptions: [],
    globalNetworkSettings: [],
  },
  getters: {
    defaultGateway: (state) => state.defaultGateway,
    ethernetData: (state) => state.ethernetData,
    interfaceOptions: (state) => state.interfaceOptions,
    globalNetworkSettings: (state) => state.globalNetworkSettings,
  },
  mutations: {
    setDefaultGateway: (state, defaultGateway) =>
      (state.defaultGateway = defaultGateway),
    setEthernetData: (state, ethernetData) =>
      (state.ethernetData = ethernetData),
    setInterfaceOptions: (state, interfaceOptions) =>
      (state.interfaceOptions = interfaceOptions),
    setGlobalNetworkSettings: (state, data) => {
      state.globalNetworkSettings = data.map(({ data }) => {
        const {
          HostName,
          LinkStatus,
          IPv4StaticAddresses,
          IPv4Addresses,
        } = data;
        return {
          hostname: HostName,
          linkStatus: LinkStatus,
          staticAddress: IPv4StaticAddresses[0]?.Address,
          dhcpAddress: IPv4Addresses.filter(
            (ipv4) => ipv4.AddressOrigin === 'DHCP'
          ),
        };
      });
    },
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
          const addresses = ethernetData[0].IPv4StaticAddresses;

          // Default gateway manually set to first gateway saved on the first interface. Default gateway property is WIP on backend
          const defaultGateway = addresses.map((ipv4) => {
            return ipv4.Gateway;
          });

          commit('setGlobalNetworkSettings', ethernetInterfaces);
          commit('setDefaultGateway', defaultGateway[0]);
          commit('setEthernetData', ethernetData);
          commit('setInterfaceOptions', interfaceOptions);
        })
        .catch((error) => {
          console.log('Network Data:', error);
        });
    },

    async updateInterfaceSettings({ dispatch, state }, networkSettingsForm) {
      const updatedAddresses = networkSettingsForm.staticIpv4;
      const originalAddresses =
        state.ethernetData[networkSettingsForm.selectedInterfaceIndex]
          .IPv4StaticAddresses;

      const addressArray = originalAddresses.map((item) => {
        const address = item.Address;
        if (find(updatedAddresses, { Address: address })) {
          remove(updatedAddresses, (item) => {
            return item.Address === address;
          });
          return {};
        } else {
          return null;
        }
      });

      const data = {
        HostName: networkSettingsForm.hostname,
        MACAddress: networkSettingsForm.macAddress,
        DHCPv4: {
          DHCPEnabled: networkSettingsForm.isDhcpEnabled,
        },
      };

      // If DHCP disabled, update static DNS or static ipv4
      if (!networkSettingsForm.isDhcpEnabled) {
        data.IPv4StaticAddresses = [...addressArray, ...updatedAddresses];
        data.StaticNameServers = networkSettingsForm.staticNameServers;
      }

      return await api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${networkSettingsForm.interfaceId}`,
          data
        )
        .then(() => dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings');
        })
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageNetwork.toast.errorSaveNetworkSettings'));
        });
    },
  },
};

export default NetworkStore;
