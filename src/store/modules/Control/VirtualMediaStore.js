import api from '../../api';
import i18n from '@/i18n';

const VirtualMediaStore = {
  namespaced: true,
  state: {
    proxyDevices: [],
    legacyDevices: [],
    connections: []
  },
  getters: {
    proxyDevices: state => state.proxyDevices,
    legacyDevices: state => state.legacyDevices
  },
  mutations: {
    setProxyDevicesData: (state, deviceData) =>
      (state.proxyDevices = deviceData),
    setLegacyDevicesData: (state, deviceData) =>
      (state.legacyDevices = deviceData)
  },
  actions: {
    async getData({ commit }) {
      const virtualMediaListEnabled =
        process.env.VUE_APP_VIRTUAL_MEDIA_LIST_ENABLED === 'true'
          ? true
          : false;
      if (!virtualMediaListEnabled) {
        const device = {
          id: i18n.t('pageVirtualMedia.defaultDeviceName'),
          websocket: '/vm/0/0',
          file: null,
          transferProtocolType: 'OEM',
          isActive: false
        };
        commit('setProxyDevicesData', [device]);
        return;
      }

      return await api
        .get('/redfish/v1/Managers/bmc/VirtualMedia')
        .then(response =>
          response.data.Members.map(virtualMedia => virtualMedia['@odata.id'])
        )
        .then(devices => api.all(devices.map(device => api.get(device))))
        .then(devices => {
          const deviceData = devices.map(device => {
            return {
              id: device.data?.Id,
              transferProtocolType: device.data?.TransferProtocolType,
              websocket: device.data?.Oem?.OpenBMC?.WebSocketEndpoint
            };
          });
          console.log(deviceData);
          const proxyDevices = deviceData
            .filter(d => d.transferProtocolType === 'OEM')
            .map(device => {
              return {
                ...device,
                file: null,
                isActive: false
              };
            });
          const legacyDevices = deviceData
            .filter(d => !d.transferProtocolType)
            .map(device => {
              return {
                ...device,
                address: ''
              };
            });
          commit('setProxyDevicesData', proxyDevices);
          commit('setLegacyDevicesData', legacyDevices);
        })
        .catch(error => {
          console.log('Virtual Media:', error);
        });
    }
  }
};

export default VirtualMediaStore;
