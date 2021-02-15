import api from '@/store/api';
import i18n from '@/i18n';

const FactoryResetStore = {
  namespaced: true,
  actions: {
    async resetToDefaults() {
      return await api
        .post('/redfish/v1/Managers/bmc/Actions/Manager.ResetToDefaults', {
          ResetToDefaultsType: 'ResetAll',
        })
        .catch((error) => {
          console.log('Factory Reset: ', error);
          throw new Error(
            i18n.t('pageFactoryReset.toast.resetToDefaultsError')
          );
        });
    },
    async resetBios() {
      return await api
        .post('/redfish/v1/Systems/system/Bios/Actions/Bios.ResetBios')
        .then(() => i18n.t('pageFactoryReset.toast.resetBiosSuccess'))
        .catch((error) => {
          console.log('Factory Reset: ', error);
          throw new Error(i18n.t('pageFactoryReset.toast.resetBiosError'));
        });
    },
  },
};

export default FactoryResetStore;
