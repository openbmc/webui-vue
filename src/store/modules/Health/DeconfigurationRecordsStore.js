import api from '@/store/api';

const DeconfigurationRecordsStore = {
  namespaced: true,
  state: {
    deconfigRecords: [],
  },
  getters: {
    deconfigRecords: (state) => state.deconfigRecords,
  },
  mutations: {
    setDeconfigurationRecordInfo: (state, deconfigRecords) =>
      (state.deconfigRecords = deconfigRecords),
  },
  actions: {
    async getDeconfigurationRecordInfo({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/LogServices')
        .then(() => {
          // Todo: remove when redfish data becomes available
          const deconfigRecords = [
            {
              type: 'Manually deconfigured',
              date: '2021-03-12T06:40:26+00:00',
              reference: 'B1111111',
              resource: 'Processor 1',
              errorType: '0x123ABC45',
              severity: 'Critical',
            },
            {
              type: 'Manually deconfigured',
              date: '2021-03-12T06:40:26+00:00',
              reference: 'B2222222',
              resource: 'Processor 2',
              errorType: '0x123ABC45',
              severity: 'Error',
            },
            {
              type: 'Manually deconfigured',
              date: '2021-03-12T06:40:26+00:00',
              reference: 'B3333333',
              resource: 'Processor 3',
              errorType: '0x123ABC45',
              severity: 'Critical',
            },
          ];
          commit('setDeconfigurationRecordInfo', deconfigRecords);
        })
        .catch((error) => console.log(error));
    },
  },
};

export default DeconfigurationRecordsStore;
