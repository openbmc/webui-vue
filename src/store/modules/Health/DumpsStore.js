import api from '@/store/api';

const DumpsStore = {
  namespaced: true,
  state: {
    bmcDumps: [],
  },
  getters: {
    allDumps: (state) => state.bmcDumps,
  },
  mutations: {
    setBmcDumps: (state, dumps) => {
      state.bmcDumps = dumps.map((dump) => ({
        dateTime: new Date(dump.Created),
        dumpType: dump.Name,
        id: dump.Id,
        size: dump.AdditionalDataSizeBytes,
        data: dump.AdditionalDataURI,
      }));
    },
  },
  actions: {
    async getBmcDumps({ commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc/LogServices/Dump/Entries')
        .then(({ data = {} }) => commit('setBmcDumps', data.Members || []))
        .catch((error) => console.log(error));
    },
  },
};

export default DumpsStore;
