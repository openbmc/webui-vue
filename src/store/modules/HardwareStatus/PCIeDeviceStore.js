import api from '@/store/api';

const PCIeDeviceStore = {
  namespaced: true,
  state: {
    pcieDevices: [],
  },
  getters: {
    pcieDevices: (state) => state.pcieDevices,
  },
  mutations: {
    setPCIeDevicesInfo: (state, data) => {
      state.pcieDevices = data.map((pcieDevice) => {
        const { Id, DeviceType, Manufacturer, Name } = pcieDevice;
        return {
          id: Id,
          deviceType: DeviceType,
          manufacturer: Manufacturer,
          name: Name,
          revisionId: '',
          deviceClass: '',
          deviceId: '',
          subsystemId: '',
        };
      });
    },
    setPCIeDeviceFuncInfo: (state, payload) => {
      const deviceId = payload.deviceId;
      const data = payload.data;
      const pcieDevice = state.pcieDevices.find(
        (device) => device.id === deviceId
      );
      pcieDevice.revisionId = data.RevisionId;
      pcieDevice.deviceClass = data.DeviceClass;
      pcieDevice.deviceId = data.DeviceId;
      pcieDevice.subsystemId = data.SubsystemId;
    },
  },
  actions: {
    async getPCIeDeviceFuncInfo({ commit }, deviceId) {
      return await api
        .get(
          '/redfish/v1/Systems/system/PCIeDevices/' +
            deviceId +
            '/PCIeFunctions/0'
        )
        .then((response) => {
          commit('setPCIeDeviceFuncInfo', {
            deviceId: deviceId,
            data: response.data,
          });
          return response.data;
        })
        .catch((error) => console.log(error));
    },
    async getPCIeDevicesInfo({ commit, dispatch }) {
      return await api
        .get('/redfish/v1/Systems/system/PCIeDevices/')
        .then(({ data: { Members = [] } }) =>
          Members.map((member) => api.get(member['@odata.id']))
        )
        .then((promises) => api.all(promises))
        .then((response) => {
          const devicesData = response.map(({ data }) => data);
          commit('setPCIeDevicesInfo', devicesData);
          devicesData.map((member) =>
            dispatch('getPCIeDeviceFuncInfo', member.Id)
          );
        })
        .catch((error) => console.log(error));
    },
  },
};

export default PCIeDeviceStore;
