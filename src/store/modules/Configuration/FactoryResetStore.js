// import api from '@/store/api';
import i18n from '@/i18n';

const FactoryResetStore = {
  namespaced: true,
  actions: {
    async resetHostFirmwareSettings() {
      // Todo waiting for API availabilty
      // return await api.post(
      //   '/redfish/v1/Systems/system/Bios/Actions/Bios.ResetBios'
      // );
      return new Promise((resolve) => setTimeout(resolve, 2000)).then(() =>
        i18n.t('pageFactoryReset.toast.successHostFirmwareSettings')
      );
    },
    async resetBmcHostFirmwareSettings() {
      // Todo waiting for API availabilty
      // return await api.post(
      //   '/redfish/v1/Managers/bmc/Actions/Manager.ResetToDefaults'
      // );
      return new Promise((resolve) => setTimeout(resolve, 2000)).then(() =>
        i18n.t('pageFactoryReset.toast.successBmcReboot')
      );
    },
  },
};

export default FactoryResetStore;
