// import api from '@/store/api';

const DumpsStore = {
  namespaced: true,
  state: {
    bmcDumps: [
      {
        dateTime: new Date(),
        dumpType: 'BMC Dump Entry',
        id: '1',
        size: '22756',
      },
    ],
  },
  getters: {
    allDumps: (state) => state.bmcDumps,
  },
  mutations: {},
  actions: {},
};

export default DumpsStore;
