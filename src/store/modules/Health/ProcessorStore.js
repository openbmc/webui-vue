import api from '@/store/api';

const ProcessorStore = {
  namespaced: true,
  state: {
    processors: [],
  },
  getters: {
    processors: (state) => state.processors,
  },
  mutations: {
    setProcessorsInfo: (state, data) => {
      state.processors = data.map((processor) => {
        const {
          Id,
          Status = {},
          PartNumber,
          SerialNumber,
          InstructionSet,
          Manufacturer,
          Model,
          Name,
          ProcessorArchitecture,
          ProcessorType,
          TotalCores,
        } = processor;
        return {
          id: Id,
          health: Status.Health,
          partNumber: PartNumber,
          serialNumber: SerialNumber,
          statusState: Status.State,
          instructionSet: InstructionSet,
          manufacturer: Manufacturer,
          model: Model,
          name: Name,
          processorArchitecture: ProcessorArchitecture,
          processorType: ProcessorType,
          totalCores: TotalCores,
        };
      });
    },
  },
  actions: {
    async getProcessorsInfo({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/Processors')
        .then(({ data: { Members = [] } }) =>
          Members.map((member) => api.get(member['@odata.id']))
        )
        .then((promises) => api.all(promises))
        .then((response) => {
          const data = response.map(({ data }) => data);
          commit('setProcessorsInfo', data);
        })
        .catch((error) => console.log(error));
    },
  },
};

export default ProcessorStore;
