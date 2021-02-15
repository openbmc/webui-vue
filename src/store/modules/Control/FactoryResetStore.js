/* eslint-disable no-unused-vars */
import api from '@/store/api';
import i18n from '@/i18n';

const testPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('confirmed');
    // reject('failed');
  }, 300);
});

const FactoryResetStore = {
  namespaced: true,
  actions: {
    async resetToDefaults() {
      return await testPromise.catch((error) => {
        console.log('Factory Reset: ', error);
        throw new Error(i18n.t('pageFactoryReset.toast.resetToDefaultsError'));
      });
      // return await api
      //   .post('/redfish/v1/Managers/bmc/Actions/Manager.ResetToDefaults')
      //   .catch((error) => {
      //     console.log('Factory Reset: ', error);
      //     throw new Error(i18n.t('pageFactoryReset.toast.resetToDefaultsError'));
      //   });
    },
    async resetBios() {
      return await testPromise.catch((error) => {
        console.log('Factory Reset: ', error);
        throw new Error(i18n.t('pageFactoryReset.toast.resetBiosError'));
      });
      // return await api
      //   .post('/redfish/v1/Managers/bmc/Actions/Bios.ResetBios')
      //   .then(() => i18n.t('pageFactoryReset.toast.resetBiosSuccess'))
      //   .catch((error) => {
      //     console.log('Factory Reset: ', error);
      //     throw new Error(i18n.t('pageFactoryReset.toast.resetBiosError'));
      //   });
    },
  },
};

export default FactoryResetStore;
