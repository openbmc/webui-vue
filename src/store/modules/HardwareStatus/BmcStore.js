import api from '@/store/api';
import i18n from '@/i18n';

const BmcStore = {
  namespaced: true,
  state: {
    bmc: null,
  },
  getters: {
    bmc: (state) => state.bmc,
  },
  mutations: {
    setBmcInfo: (state, data) => {
      const bmc = {};
      bmc.dateTime = new Date(data.DateTime);
      bmc.description = data.Description;
      bmc.firmwareVersion = data.FirmwareVersion;
      bmc.graphicalConsoleConnectTypes =
        data.GraphicalConsole.ConnectTypesSupported;
      bmc.graphicalConsoleEnabled = data.GraphicalConsole.ServiceEnabled;
      bmc.graphicalConsoleMaxSessions =
        data.GraphicalConsole.MaxConcurrentSessions;
      bmc.health = data.Status.Health;
      bmc.healthRollup = data.Status.HealthRollup;
      bmc.id = data.Id;
      bmc.lastResetTime = new Date(data.LastResetTime);
      bmc.identifyLed = data.LocationIndicatorActive;
      bmc.locationNumber = data['Location']['PartLocation']['ServiceLabel'];
      bmc.manufacturer = data.manufacturer;
      bmc.managerType = data.ManagerType;
      bmc.model = data.Model;
      bmc.name = data.Name;
      bmc.partNumber = data.PartNumber;
      bmc.powerState = data.PowerState;
      bmc.serialConsoleConnectTypes = data.SerialConsole.ConnectTypesSupported;
      bmc.serialConsoleEnabled = data.SerialConsole.ServiceEnabled;
      bmc.serialConsoleMaxSessions = data.SerialConsole.MaxConcurrentSessions;
      bmc.serialNumber = data.SerialNumber;
      bmc.serviceEntryPointUuid = data.ServiceEntryPointUUID;
      bmc.sparePartNumber = data.SparePartNumber;
      bmc.statusState = data.Status.State;
      bmc.uuid = data.UUID;
      bmc.uri = data['@odata.id'];
      state.bmc = bmc;
    },
  },
  actions: {
    async getBmcInfo({ commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc')
        .then(({ data }) => commit('setBmcInfo', data))
        .catch((error) => console.log(error));
    },
    async updateIdentifyLedValue({ dispatch }, led) {
      const uri = led.uri;
      const updatedIdentifyLedValue = {
        LocationIndicatorActive: led.identifyLed,
      };
      return await api
        .patch(uri, updatedIdentifyLedValue)
        .then(() => dispatch('getBmcInfo'))
        .catch((error) => {
          dispatch('getBmcInfo');
          console.log('error', error);
          if (led.identifyLed) {
            throw new Error(
              i18n.t('pageInventory.toast.errorEnableIdentifyLed')
            );
          } else {
            throw new Error(
              i18n.t('pageInventory.toast.errorDisableIdentifyLed')
            );
          }
        });
    },
  },
};

export default BmcStore;
