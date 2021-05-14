import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';
const DumpsStore = {
  namespaced: true,
  state: {
    allDumps: [],
  },
  getters: {
    allDumps: (state) => state.allDumps,
  },
  mutations: {
    setAllDumps: (state, dumps) => {
      state.allDumps = dumps.map((dump) => ({
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
        .all([
          api.get('/redfish/v1/Managers/bmc/LogServices/Dump/Entries'),
          api.get('/redfish/v1/Systems/system/LogServices/Dump/Entries'),
        ])
        .then((response) => {
          const systemMockDump = [
            {
              '@odata.id':
                '/redfish/v1/Systems/system/LogServices/Dump/Entries/Resource_1',
              '@odata.type': '#LogEntry.v1_7_0.LogEntry',
              AdditionalDataSizeBytes: 0,
              AdditionalDataURI:
                '/redfish/v1/Systems/system/LogServices/Dump/attachment/Resource_1',
              Created: '1970-01-01T00:00:00+00:00',
              DiagnosticDataType: 'OEM',
              EntryType: 'Event',
              Id: 'Resource_1',
              Name: 'Resource Dump Entry',
              OEMDiagnosticDataType: 'Resource',
            },
            {
              '@odata.id':
                '/redfish/v1/Systems/system/LogServices/Dump/Entries/Resource_2',
              '@odata.type': '#LogEntry.v1_7_0.LogEntry',
              AdditionalDataSizeBytes: 0,
              AdditionalDataURI:
                '/redfish/v1/Systems/system/LogServices/Dump/attachment/Resource_2',
              Created: '1970-01-01T00:00:00+00:00',
              DiagnosticDataType: 'OEM',
              EntryType: 'Event',
              Id: 'Resource_2',
              Name: 'Resource Dump Entry',
              OEMDiagnosticDataType: 'Resource',
            },
            {
              '@odata.id':
                '/redfish/v1/Systems/system/LogServices/Dump/Entries/Resource_3',
              '@odata.type': '#LogEntry.v1_7_0.LogEntry',
              AdditionalDataSizeBytes: 0,
              AdditionalDataURI:
                '/redfish/v1/Systems/system/LogServices/Dump/attachment/Resource_3',
              Created: '1970-01-01T00:00:00+00:00',
              DiagnosticDataType: 'OEM',
              EntryType: 'Event',
              Id: 'Resource_3',
              Name: 'Resource Dump Entry',
              OEMDiagnosticDataType: 'Resource',
            },
          ];

          const bmcDumps = response[0].data?.Members || [];
          const systemDumps = response[1].data?.Members || [];
          const resourceDumps = systemMockDump;
          const allDumps = bmcDumps.concat(systemDumps, resourceDumps);
          commit('setAllDumps', allDumps);
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
          '/redfish/v1/Systems/system/LogServices/Dump/Actions/LogService.CollectDiagnosticData',
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
    async getBmcDump({ commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc/LogServices/Dump/Entries')
        .then(({ data = {} }) => {
          commit('setBmcDump', data.Members || []);
        })
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageDumps.toast.errorStartSystemDump'));
        });
    },
    async getResourceDump({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/LogServices/Dump/Entries')
        .then(({ data = {} }) => {
          commit('setResourceDump', data.Members || []);
        })
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageDumps.toast.errorStartSystemDump'));
        });
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
          dispatch('getAllDumps');
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
      const totalDumpCount = state.allDumps.length;
      return await api
        .post(
          '/redfish/v1/Managers/bmc/LogServices/Dump/Actions/LogService.ClearLog'
        )
        .then(() => {
          commit('setAllDumps', []);
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
