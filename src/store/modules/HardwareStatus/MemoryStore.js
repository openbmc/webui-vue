import api from '@/store/api';

const MemoryStore = {
  namespaced: true,
  state: {
    dimms: [],
  },
  getters: {
    dimms: (state) => state.dimms,
  },
  mutations: {
    setMemoryInfo: (state, data) => {
      state.dimms = data.map(({ data }) => {
        const {
          Id,
          Status = {},
          PartNumber,
          SerialNumber,
          SparePartNumber,
          Description,
          MemoryType,
          Location,
        } = data;
        return {
          id: Id,
          health: Status.Health,
          partNumber: PartNumber,
          serialNumber: SerialNumber,
          statusState: Status.State,
          sparePartNumber: SparePartNumber,
          description: Description,
          memoryType: MemoryType,
          location: Location?.PartLocation?.ServiceLabel,
        };
      });
    },
  },
  actions: {
    async getDimms({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/Memory')
        .then(({ data: { Members } }) => {
          const promises = Members.map((item) => api.get(item['@odata.id']));
          return api.all(promises);
        })
        .then((response) => commit('setMemoryInfo', response))
        .catch((error) => console.log(error));
    },
  },
};

export default MemoryStore;
