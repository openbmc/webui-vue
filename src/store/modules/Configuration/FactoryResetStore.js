import api from '@/store/api';
import i18n from '@/i18n';

const FactoryResetStore = {
  namespaced: true,
  actions: {
    async resetHostFirmwareSettings() {
      return await api
        .post('/redfish/v1/Systems/system/Bios/Actions/Bios.ResetBios')
        .then(() =>
          i18n.t('pageFactoryReset.toast.successHostFirmwareSettings')
        )
        .catch((error) => {
          console.log(error);
        });
    },
    async resetBmcHostFirmwareSettings() {
      return await api
        .post('/redfish/v1/Managers/bmc/Actions/Manager.ResetToDefaults')
        .then(() => i18n.t('pageFactoryReset.toast.successBmcReboot'))
        .catch((error) => {
          console.log(error);
        });
    },
  },
};

export default FactoryResetStore;
