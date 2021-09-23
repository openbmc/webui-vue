import api from '@/store/api';
import StoreModule from '@/store/StoreModule';
import getUri from '../../../utilities/GetUri';
import UpdateLedStatusError from '../../../utilities/UpdateLedStatusError';

/**
 * @type {BmcState}
 */
const state = {
  bmc: null,
};

/**
 * @type {BmcGetters}
 */
const getters = {
  bmc: 'bmc',
};

/**
 * Mutations enum
 * @readonly
 * @enum {string}
 */
const mutations = {
  /** Set BMC info mutation */
  setBmcInfo: 'setBmcInfo',
  /** Updates BMC info */
  updateBmcInfo: 'updateBmcInfo',
};

/**
 * Actions enum
 * @type {BmcActions}
 */
const actions = {
  getBmcInfo: 'getBmcInfo',
  updateIdentifyLedValue: 'updateIdentifyLedValue',
};

/**
 * Vuex store configuration for BMC
 * @type {StoreOptions}
 */
const store = {
  namespaced: true,
  state,
  getters: {
    [getters.bmc]: (state) => state.bmc,
  },
  mutations: {
    [mutations.setBmcInfo]: (state, data) => {
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
      bmc.locationNumber = data.LocationNumber;
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
      bmc.uri = getUri(data);
      state.bmc = bmc;
    },
    [mutations.updateBmcInfo]: (state, data) => {
      const bmc = { ...state.bmc, ...data };
      state.bmc = bmc;
    },
  },
  actions: {
    async [actions.getBmcInfo]({ commit }, uri) {
      const { data } = await api.get(uri);
      commit(mutations.setBmcInfo, data);
    },
    async [actions.updateIdentifyLedValue]({ commit }, led) {
      const uri = led.uri;
      const updatedIdentifyLedValue = {
        LocationIndicatorActive: led.identifyLed,
      };
      try {
        await api.patch(uri, updatedIdentifyLedValue);
        commit(mutations.updateBmcInfo, led);
      } catch (error) {
        commit(mutations.updateBmcInfo, {
          identifyLed: !led.identifyLed,
        });

        throw new UpdateLedStatusError(led.identifyLed);
      }
    },
  },
};

/**
 * @type {BmcStoreModule}
 */
const BmcStore = new StoreModule('bmc', store, getters, actions);

export default BmcStore;
