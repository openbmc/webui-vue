import api from '@/store/api';
import i18n from '@/i18n';

const FactoryResetStore = {
  namespaced: true,
  actions: {
    async resetToDefaults() {
      return await api
        .post(
          `${await this.dispatch('global/getBmcPath')}/Actions/Manager.ResetToDefaults`,
          {
            ResetType: 'ResetAll',
          },
        )
        .then(() =>
          i18n.global.t('pageFactoryReset.toast.resetToDefaultsSuccess'),
        )
        .catch((error) => {
          console.log('Factory Reset: ', error);
          throw new Error(
            i18n.global.t('pageFactoryReset.toast.resetToDefaultsError'),
          );
        });
    },
    async resetBios() {
      return await api
        .post(
          `${await this.dispatch('global/getSystemPath')}/Bios/Actions/Bios.ResetBios`,
        )
        .then(() => i18n.global.t('pageFactoryReset.toast.resetBiosSuccess'))
        .catch((error) => {
          console.log('Factory Reset: ', error);
          throw new Error(
            i18n.global.t('pageFactoryReset.toast.resetBiosError'),
          );
        });
    },
  },
};

export default FactoryResetStore;
