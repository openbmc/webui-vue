import api from '@/store/api';
import i18n from '@/i18n';

const ProcessorStore = {
  namespaced: true,
  state: {
    processors: [],
  },
  getters: {
    processors: (state) => state.processors,
  },
  mutations: {
    setProcessorsInfo: (state, data) => {
      state.processors = data.map((processor) => {
        const {
          Id,
          Status = {},
          PartNumber,
          SerialNumber,
          SparePartNumber,
          InstructionSet,
          Manufacturer,
          Model,
          Name,
          ProcessorArchitecture,
          ProcessorType,
          Version,
          AssetTag,
          MinSpeedMHz,
          MaxSpeedMHz,
          TotalCores,
          TotalThreads,
          LocationNumber,
          LocationIndicatorActive,
        } = processor;
        return {
          id: Id,
          health: Status.Health,
          healthRollup: Status.HealthRollup,
          partNumber: PartNumber,
          sparePartNumber: SparePartNumber,
          serialNumber: SerialNumber,
          statusState: Status.State,
          instructionSet: InstructionSet,
          manufacturer: Manufacturer,
          model: Model,
          name: Name,
          processorArchitecture: ProcessorArchitecture,
          processorType: ProcessorType,
          version: Version,
          assetTag: AssetTag,
          minSpeedMHz: MinSpeedMHz,
          maxSpeedMHz: MaxSpeedMHz,
          totalCores: TotalCores,
          totalThreads: TotalThreads,
          locationNumber: LocationNumber,
          identifyLed: LocationIndicatorActive,
          uri: processor['@odata.id'],
        };
      });
    },
  },
  actions: {
    async getProcessorsInfo({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/Processors')
        .then(({ data: { Members = [] } }) =>
          Members.map((member) => api.get(member['@odata.id']))
        )
        .then((promises) => api.all(promises))
        .then((response) => {
          const data = response.map(({ data }) => data);
          commit('setProcessorsInfo', data);
        })
        .catch((error) => console.log(error));
    },
    async updateIdentifyLedValue({ dispatch }, led) {
      const uri = led.uri;
      const updatedIdentifyLedValue = {
        LocationIndicatorActive: led.identifyLed,
      };
      return await api
        .patch(uri, updatedIdentifyLedValue)
        .then(() => dispatch('getProcessorsInfo'))
        .catch((error) => {
          dispatch('getProcessorsInfo');
          console.log('error', error);
          if (led.identifyLed) {
            throw new Error(
              i18n.t('pageHardwareStatus.toast.errorTurnOnIdentifyLed')
            );
          } else {
            throw new Error(
              i18n.t('pageHardwareStatus.toast.errorTurnOffIdentifyLed')
            );
          }
        });
    },
  },
};

export default ProcessorStore;
