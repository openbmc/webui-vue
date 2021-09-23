import api from '@/store/api';
import StoreModule from '@/store/StoreModule';
import UpdateLedStatusError from '../../../utilities/UpdateLedStatusError';

/**
 * @type {SystemStoreState}
 */
const state = {
  systems: [],
};

/**
 * @type {SystemGetters}
 */
const gettersEnum = {
  systems: 'systems',
};

/**
 * @readonly
 * @enum {string}
 */
const mutationsEnum = {
  setSystemInfo: 'setSystemInfo',
};

/**
 * @type {SystemActions}
 */
export const actionsEnum = {
  getSystem: 'getSystem',
  changeIdentifyLedState: 'changeIdentifyLedState',
};

/**
 * @type {SystemStore}
 */
const store = {
  namespaced: true,
  state,
  getters: {
    [gettersEnum.systems]: (state) => state.systems,
  },
  mutations: {
    [mutationsEnum.setSystemInfo]: (state, data) => {
      const system = {};
      system.assetTag = data.AssetTag;
      system.description = data.Description;
      system.firmwareVersion = data.BiosVersion;
      system.hardwareType = data.Name;
      system.health = data.Status?.Health;
      system.id = data.Id;
      system.locationIndicatorActive = data.LocationIndicatorActive;
      system.locationNumber = data.LocationNumber;
      system.manufacturer = data.Manufacturer;
      system.memorySummaryHealth = data.MemorySummary?.Status.Health;
      system.memorySummaryHealthRollup =
        data.MemorySummary?.Status?.HealthRollup;
      system.memorySummaryState = data.MemorySummary?.Status?.State;
      system.model = data.Model;
      system.processorSummaryCount = data.ProcessorSummary?.Count;
      system.processorSummaryHealth = data.ProcessorSummary?.Status?.Health;
      system.processorSummaryHealthRoll =
        data.ProcessorSummary?.Status.HealthRollup;
      system.processorSummaryState = data.ProcessorSummary?.Status?.State;
      system.powerState = data.PowerState;
      system.serialNumber = data.SerialNumber;
      system.healthRollup = data.Status?.HealthRollup;
      system.subModel = data.SubModel;
      system.statusState = data.Status?.State;
      system.systemType = data.SystemType;
      state.systems = [system];
    },
  },
  actions: {
    async [actionsEnum.getSystem]({ commit }, uri) {
      const response = await api.get(uri);
      commit(mutationsEnum.setSystemInfo, response.data);
    },
    async [actionsEnum.changeIdentifyLedState](
      { commit, state, rootState },
      ledState
    ) {
      try {
        const uri = rootState.systemUri;
        await api.patch(uri, {
          LocationIndicatorActive: ledState,
        });
      } catch (err) {
        commit(mutationsEnum.setSystemInfo, state.system.systems[0]);
        throw new UpdateLedStatusError(ledState);
      }
    },
  },
};

/**
 * @type {SystemStoreModule}
 */
const SystemStore = new StoreModule('system', store, gettersEnum, actionsEnum);

export default SystemStore;
