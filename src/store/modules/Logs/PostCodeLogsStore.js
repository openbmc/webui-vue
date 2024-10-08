import api from '@/store/api';
import i18n from '@/i18n';

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
        .get(
          `${await this.dispatch('global/getSystemPath')}/LogServices/PostCodes/Entries`,
        )
        .then(({ data: { Members = [] } = {} }) => {
          const postCodeLogs = Members.map((log) => {
            const { Created, MessageArgs, AdditionalDataURI } = log;
            return {
              date: new Date(Created),
              bootCount: MessageArgs[0],
              timeStampOffset: MessageArgs[1],
              postCode: MessageArgs[2],
              uri: AdditionalDataURI,
            };
          });
          commit('setAllPostCodes', postCodeLogs);
        })
        .catch((error) => {
          console.log('POST Codes Log Data:', error);
        });
    },
    async deleteAllPostCodeLogs({ dispatch }, data) {
      return await api
        .post(
          `${await this.dispatch('global/getSystemPath')}/LogServices/PostCodes/Actions/LogService.ClearLog`,
        )
        .then(() => dispatch('getPostCodesLogData'))
        .then(() =>
          i18n.global.t('pagePostCodeLogs.toast.successDelete', data.length),
        )
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.global.t('pagePostCodeLogs.toast.errorDelete', data.length),
          );
        });
    },
  },
};

export default PostCodeLogsStore;
