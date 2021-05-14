import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';
const DumpsStore = {
  namespaced: true,
  state: {
    bmcDumps: [],
  },
  getters: {
    bmcDumps: (state) => state.bmcDumps,
  },
  mutations: {
    setBmcDumps: (state, dumps) => {
      state.bmcDumps = dumps.map((dump) => ({
        data: dump.AdditionalDataURI,
        dateTime: new Date(dump.Created),
        dumpType: dump.Name,
        id: dump.Id,
        location: dump['@odata.id'],
        size: dump.AdditionalDataSizeBytes,
      }));
    },
  },
  actions: {
    async getAllDumps({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/LogServices/')
        .then(({ data = {} }) => {
          console.log('data', data);
          commit('setBmcDumps', data.Members || []);
        })
        .catch((error) => console.log(error));
    },
    async createBmcDump() {
      return await api
        .post(
          '/redfish/v1/Managers/bmc/LogServices/Dump/Actions/LogService.CollectDiagnosticData',
          {
            DiagnosticDataType: 'Manager',
            OEMDiagnosticDataType: '',
          }
        )
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageDumps.toast.errorStartBmcDump'));
        });
    },
    async createSystemDump() {
      return await api
        .post(
          '/redfish/v1/Systems/system/LogServices/Dump/Actions/LogService.CollectDiagnosticData',
          {
            DiagnosticDataType: 'OEM',
            OEMDiagnosticDataType: 'System',
          }
        )
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageDumps.toast.errorStartSystemDump'));
        });
    },
    async createResourceDump() {
      return await api
        .post(
          '/redfish/v1/Systems/system/LogServices/Dump/Actions/Oem/OemLogService.CollectDiagnosticData',
          {
            DiagnosticDataType: 'OEM',
            OEMDiagnosticDataType: 'Resource_vsp_password',
          }
        )
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageDumps.toast.errorStartSystemDump'));
        });
    },
    // Start
    async getResourceDump({ commit }) {
      return await api
        .get('redfish/v1/Systems/system/LogServices/Dump')
        .then(() => {
          let attri = {
            pvm_system_power_off_policy: 'Automatic',
            pvm_default_os_type: 'AIX',
            pvm_power_on_st: 'AutoStart',
            pvm_rpa_boot_mode: 'SavedList',
            pvm_system_operating_mode: 'Normal',
            pvm_fw_boot_side: 'A (Boot from disk using copy A)',
          };
          const filteredAttribute = Object.keys(attri)
            .filter((key) =>
              Object.keys(this.state.hostBootSettings.attributeKeys).includes(
                key
              )
            )
            .reduce((obj, key) => {
              return {
                ...obj,
                [key]: attri[key],
              };
            }, {});
          commit('setBiosAttributes', filteredAttribute);
        })
        .catch((error) => console.log(error));
    },

    saveBiosSettings(_, biosSettings) {
      return api
        .patch('/redfish/v1/Systems/system/Bios/Settings', {
          Attributes: biosSettings,
        })
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
          return error;
        });
    },
    // End
    async deleteDumps({ dispatch }, dumps) {
      const promises = dumps.map(({ location }) =>
        api.delete(location).catch((error) => {
          console.log(error);
          return error;
        })
      );
      return await api
        .all(promises)
        .then((response) => {
          dispatch('getBmcDumps');
          return response;
        })
        .then(
          api.spread((...responses) => {
            const { successCount, errorCount } = getResponseCount(responses);
            const toastMessages = [];
            if (successCount) {
              const message = i18n.tc(
                'pageDumps.toast.successDeleteDump',
                successCount
              );
              toastMessages.push({ type: 'success', message });
            }
            if (errorCount) {
              const message = i18n.tc(
                'pageDumps.toast.errorDeleteDump',
                errorCount
              );
              toastMessages.push({ type: 'error', message });
            }
            return toastMessages;
          })
        );
    },
    async deleteAllDumps({ commit, state }) {
      const totalDumpCount = state.bmcDumps.length;
      return await api
        .post(
          '/redfish/v1/Managers/bmc/LogServices/Dump/Actions/LogService.ClearLog'
        )
        .then(() => {
          commit('setBmcDumps', []);
          return i18n.tc('pageDumps.toast.successDeleteDump', totalDumpCount);
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.tc('pageDumps.toast.errorDeleteDump', totalDumpCount)
          );
        });
    },
  },
};
export default DumpsStore;
