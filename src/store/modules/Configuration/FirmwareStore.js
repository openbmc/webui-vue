import api from '../../api';

const FirmwareStore = {
  namespaced: true,
  state: {
    firmwareInfo: null,
    bmcActiveVersion: '--',
    hostActiveVersion: '--'
  },
  getters: {
    firmwareInfo: state => state.firmwareInfo,
    bmcActiveVersion: state => state.bmcActiveVersion,
    hostActiveVersion: state => state.hostActiveVersion
  },
  mutations: {
    setFirmwareInfo: (state, firmwareInfo) =>
      (state.firmwareInfo = firmwareInfo),
    setBmcActiveVersion: (state, bmcActiveVersion) =>
      (state.bmcActiveVersion = bmcActiveVersion),
    setHostActiveVersion: (state, hostActiveVersion) =>
      (state.hostActiveVersion = hostActiveVersion)
  },
  actions: {
    getFirmwareInfo({ commit }) {
      api
        .get('/xyz/openbmc_project/software/enumerate')
        .then(response => {
          const firmwareInfo = response.data.data;
          const functionalImages =
            firmwareInfo['/xyz/openbmc_project/software/functional'].endpoints;
          for (let key in firmwareInfo) {
            /**
             * If "Functional" activation status is
             * functional, else it is "activation"
             * github.com/openbmc/phosphor-dbus-interfaces/blob/master/xyz/openbmc_project/Software/Activation.interface.yaml
             */
            if (firmwareInfo[key].hasOwnProperty('Version')) {
              let activationStatus = '';
              const imageType = firmwareInfo[key].Purpose.split('.').pop();
              if (functionalImages.includes(key)) {
                activationStatus = 'Functional';
              }
              // Get BMC and Host active Versions
              if (activationStatus == 'Functional' && imageType == 'BMC') {
                commit('setBmcActiveVersion', firmwareInfo[key].Version);
              }
              if (activationStatus == 'Functional' && imageType == 'Host') {
                commit('setHostActiveVersion', firmwareInfo[key].Version);
              }
            }
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
};

export default FirmwareStore;
