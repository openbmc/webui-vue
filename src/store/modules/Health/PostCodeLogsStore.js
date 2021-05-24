import api from '@/store/api';

const PostCodeLogsStore = {
  namespaced: true,
  state: {
    allPostCodes: [],
  },
  getters: {
    allPostCodes: (state) => state.allPostCodes,
  },
  mutations: {
    setAllPostCodes: (state, allPostCodes) =>
      (state.allPostCodes = allPostCodes),
  },
  actions: {
    async getPostCodesLogData({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/LogServices/PostCodes/Entries')
        .then(({ data: { Members = [] } = {} }) => {
          const postCodeLogs = Members.map((log) => {
            const { Created, MessageArgs, AdditionalDataURI } = log;
            return {
              date: new Date(Created),
              bootCount: MessageArgs[0],
              timeStampOffset: MessageArgs[1],
              postCode: MessageArgs[2],
              data: AdditionalDataURI,
            };
          });
          commit('setAllPostCodes', postCodeLogs);
        })
        .catch((error) => {
          console.log('POST Codes Log Data:', error);
        });
    },
  },
};

export default PostCodeLogsStore;
