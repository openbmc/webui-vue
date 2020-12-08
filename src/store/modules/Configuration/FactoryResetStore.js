// import api from '@/store/api';

const FactoryResetStore = {
  namespaced: true,
  state: {
    resetConfirmation: '',
  },
  getters: {
    // getResetConfirmationValue: (state) => state.resetConfirmation,
  },
  mutations: {
    // setResetConfirmationValue(state, resetConfirmation) {
    //   state.resetConfirmation = resetConfirmation;
    // },
  },
  actions: {
    // async getResetConfirmationValue({ commit }) {
    //   return await api
    //     .get('/redfish/v1/Systems/system/Bios/Actions/Bios.ResetBios')
    //     .then((response) => {
    //       commit('setResetConfirmationValue', response);
    //     })
    //     .catch((error) => console.log(error));
    // },
  },
};

export default FactoryResetStore;
