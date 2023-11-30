import api from '@/store/api';
import i18n from '@/i18n';
import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

const transferProtocolType = {
  CIFS: 'CIFS',
  FTP: 'FTP',
  SFTP: 'SFTP',
  HTTP: 'HTTP',
  HTTPS: 'HTTPS',
  NFS: 'NFS',
  SCP: 'SCP',
  TFTP: 'TFTP',
  OEM: 'OEM',
};

export const VirtualMediaStore = defineStore('virtualMedia', {
  state: () => ({
    // all these properties will have their type inferred automatically
    proxyDevices: [],
    legacyDevices: [],
  }),
  actions: {
    async getData() {
      try {
        const virtualMediaListEnabled =
          import.meta.env.VITE_APP_VIRTUAL_MEDIA_LIST_ENABLED === 'true'
            ? true
            : false;
        if (!virtualMediaListEnabled) {
          const device = {
            id: i18n.global.t('pageVirtualMedia.defaultDeviceName'),
            websocket: '/vm/0/0',
            file: null,
            transferProtocolType: transferProtocolType.OEM,
            isActive: false,
          };
          this.proxyDevices = [device];
          return;
        }
        return await api
          .get('/api/redfish/v1/Managers/bmc/VirtualMedia')
          .then((response) =>
            response.data.Members.map(
              (virtualMedia) => virtualMedia['@odata.id']
            )
          )
          .then((devices) => api.all(devices.map((device) => api.get(device))))
          .then((devices) => {
            const deviceData = devices.map((device) => {
              const isActive = device.data?.Inserted === true ? true : false;
              return {
                id: device.data?.Id,
                transferProtocolType: device.data?.TransferProtocolType,
                websocket: device.data?.Oem?.OpenBMC?.WebSocketEndpoint,
                isActive: isActive,
              };
            });
            const proxyDevices = deviceData
              .filter(
                (d) => d.transferProtocolType === transferProtocolType.OEM
              )
              .map((device) => {
                return {
                  ...device,
                  file: null,
                };
              });
            const legacyDevices = deviceData
              .filter(
                (d) => d.transferProtocolType !== transferProtocolType.OEM
              )
              .map((device) => {
                return {
                  ...device,
                  serverUri: '',
                  username: '',
                  password: '',
                  isRW: false,
                };
              });
            this.proxyDevices = proxyDevices;
            this.legacyDevices = legacyDevices;
          });
      } catch (error) {
        console.error(error);
      }
    },
    async mountImage(_, { id, data }) {
      return await api
        .post(
          `/redfish/v1/Managers/bmc/VirtualMedia/${id}/Actions/VirtualMedia.InsertMedia`,
          data
        )
        .catch((error) => {
          console.log('Mount image:', error);
          throw new Error();
        });
    },
    async unmountImage(_, id) {
      return await api
        .post(
          `/redfish/v1/Managers/bmc/VirtualMedia/${id}/Actions/VirtualMedia.EjectMedia`
        )
        .catch((error) => {
          console.log('Unmount image:', error);
          throw new Error();
        });
    },
  },
});

export default VirtualMediaStore;
