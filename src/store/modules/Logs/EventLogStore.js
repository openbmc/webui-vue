import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';

const getHealthStatus = (events, loadedEvents) => {
  let status = loadedEvents ? 'OK' : '';
  for (const event of events) {
    if (event.filterByStatus === 'Unresolved') {
      if (event.severity === 'Warning') {
        status = 'Warning';
      }
      if (event.severity === 'Critical') {
        status = 'Critical';
        break;
      }
    }
  }
  return status;
};

// TODO: High priority events should also check if Log
// is resolved when the property is available in Redfish
const getHighPriorityEvents = (events) =>
  events.filter(({ severity }) => severity === 'Critical');

const EventLogStore = {
  namespaced: true,
  state: {
    allEvents: [],
    loadedEvents: false,
  },
  getters: {
    allEvents: (state) => state.allEvents,
    highPriorityEvents: (state) => getHighPriorityEvents(state.allEvents),
    healthStatus: (state) =>
      getHealthStatus(state.allEvents, state.loadedEvents),
  },
  mutations: {
    setAllEvents: (state, allEvents) => (
      (state.allEvents = allEvents), (state.loadedEvents = true)
    ),
  },
  actions: {
    async getEventLogData({ commit }) {
      return await api
        .get(
          `${await this.dispatch('global/getSystemPath')}/LogServices/EventLog/Entries`,
        )
        .then(({ data: { Members = [] } = {} }) => {
          const eventLogs = Members.map((log) => {
            const {
              Id,
              Severity,
              Created,
              EntryType,
              Message,
              Name,
              Modified,
              Resolved,
              AdditionalDataURI,
            } = log;
            return {
              id: Id,
              severity: Severity,
              date: new Date(Created),
              type: EntryType,
              description: Message,
              name: Name,
              modifiedDate: new Date(Modified),
              uri: log['@odata.id'],
              filterByStatus: Resolved ? 'Resolved' : 'Unresolved',
              status: Resolved, //true or false
              additionalDataUri: AdditionalDataURI,
            };
          });
          commit('setAllEvents', eventLogs);
        })
        .catch((error) => {
          console.log('Event Log Data:', error);
        });
    },
    async deleteAllEventLogs({ dispatch }, data) {
      return await api
        .post(
          `${await this.dispatch('global/getSystemPath')}/LogServices/EventLog/Actions/LogService.ClearLog`,
        )
        .then(() => dispatch('getEventLogData'))
        .then(() =>
          i18n.global.t('pageEventLogs.toast.successDelete', data.length),
        )
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.global.t('pageEventLogs.toast.errorDelete', data.length),
          );
        });
    },
    async deleteEventLogs({ dispatch }, uris = []) {
      const promises = uris.map((uri) =>
        api.delete(uri).catch((error) => {
          console.log(error);
          return error;
        }),
      );
      return await api
        .all(promises)
        .then((response) => {
          dispatch('getEventLogData');
          return response;
        })
        .then(
          api.spread((...responses) => {
            const { successCount, errorCount } = getResponseCount(responses);
            const toastMessages = [];

            if (successCount) {
              const message = i18n.global.t(
                'pageEventLogs.toast.successDelete',
                successCount,
              );
              toastMessages.push({ type: 'success', message });
            }

            if (errorCount) {
              const message = i18n.global.t(
                'pageEventLogs.toast.errorDelete',
                errorCount,
              );
              toastMessages.push({ type: 'error', message });
            }

            return toastMessages;
          }),
        );
    },
    async resolveEventLogs({ dispatch }, logs) {
      const promises = logs.map((log) =>
        api.patch(log.uri, { Resolved: true }).catch((error) => {
          console.log(error);
          return error;
        }),
      );
      return await api
        .all(promises)
        .then((response) => {
          dispatch('getEventLogData');
          return response;
        })
        .then(
          api.spread((...responses) => {
            const { successCount, errorCount } = getResponseCount(responses);
            const toastMessages = [];
            if (successCount) {
              const message = i18n.global.t(
                'pageEventLogs.toast.successResolveLogs',
                successCount,
              );
              toastMessages.push({ type: 'success', message });
            }
            if (errorCount) {
              const message = i18n.global.t(
                'pageEventLogs.toast.errorResolveLogs',
                errorCount,
              );
              toastMessages.push({ type: 'error', message });
            }
            return toastMessages;
          }),
        );
    },
    async unresolveEventLogs({ dispatch }, logs) {
      const promises = logs.map((log) =>
        api.patch(log.uri, { Resolved: false }).catch((error) => {
          console.log(error);
          return error;
        }),
      );
      return await api
        .all(promises)
        .then((response) => {
          dispatch('getEventLogData');
          return response;
        })
        .then(
          api.spread((...responses) => {
            const { successCount, errorCount } = getResponseCount(responses);
            const toastMessages = [];
            if (successCount) {
              const message = i18n.global.t(
                'pageEventLogs.toast.successUnresolveLogs',
                successCount,
              );
              toastMessages.push({ type: 'success', message });
            }
            if (errorCount) {
              const message = i18n.global.t(
                'pageEventLogs.toast.errorUnresolveLogs',
                errorCount,
              );
              toastMessages.push({ type: 'error', message });
            }
            return toastMessages;
          }),
        );
    },
    // Single log entry
    async updateEventLogStatus({ dispatch }, log) {
      const updatedEventLogStatus = log.status;
      return await api
        .patch(log.uri, { Resolved: updatedEventLogStatus })
        .then(() => {
          dispatch('getEventLogData');
        })
        .then(() => {
          if (log.status) {
            return i18n.global.t('pageEventLogs.toast.successResolveLogs', 1);
          } else {
            return i18n.global.t('pageEventLogs.toast.successUnresolveLogs', 1);
          }
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.global.t('pageEventLogs.toast.errorLogStatusUpdate'),
          );
        });
    },
    async downloadEntry(_, uri) {
      return await api
        .get(uri, {
          headers: {
            Accept: 'application/octet-stream',
          },
        })
        .then((response) => {
          const blob = new Blob([response.data], {
            type: response.headers['content-type'],
          });
          return blob;
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.global.t('pageEventLogs.toast.errorDownloadEventEntry'),
          );
        });
    },
  },
};

export default EventLogStore;
