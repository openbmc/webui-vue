import api from '../../api';
import i18n from '../../../i18n';

const ControlStore = {
  namespaced: true,
  actions: {
    async rebootBmc() {
      const data = { ResetType: 'GracefulRestart' };
      return await api
        .post('/redfish/v1/Managers/bmc/Actions/Manager.Reset', data)
        .then(() => i18n.t('pageRebootBmc.toast.successRebootStart'))
        .catch(error => {
          console.log(error);
          throw new Error(i18n.t('pageRebootBmc.toast.errorRebootStart'));
        });
    }
  }
};

export default ControlStore;
