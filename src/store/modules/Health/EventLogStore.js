import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';

const eventLogDataLimit = 1000;
const cancelTokens = {
  getEvents: [],
};

const getHealthStatus = (events, loadedEvents) => {
  let status = loadedEvents ? 'OK' : '';
  for (const event of events) {
    if (event.severity === 'Warning') {
      status = 'Warning';
    }
    if (event.severity === 'Critical') {
      status = 'Critical';
      break;
    }
  }
  return status;
};

/**
 * gets logs data
 * @param {*} parameters object {$top?: number, $skip?: number}
 * @returns promise
 */
const getLogsData = async (cancelToken, parameters) => {
  cancelTokens.getEvents.push(cancelToken);
  const url = '/redfish/v1/Systems/system/LogServices/EventLog/Entries';
  return await api.get(url, parameters, cancelToken).then(({ data }) => {
    const eventLogs = data.Members.map((log) => {
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

    return { eventLogs, total: data['Members@odata.count'] };
  });
};

const getEventLogDataParameters = (total, pageCount) => {
  const result = [];
  const pages = Math.floor(1 + total / pageCount);
  for (let i = 0; i < pages; ++i) {
    result.push({ $top: pageCount, $skip: i * pageCount });
  }
  return result;
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
    async clearEventLogData({ commit }) {
      commit('setAllEvents', []);
    },
    async getEventLogData({ commit }) {
      const totalData = await getLogsData(api.getCancelTokenSource(), {
        $top: 1,
      });
      const parameters = getEventLogDataParameters(
        totalData.total,
        eventLogDataLimit
      );
      if (Array.isArray(cancelTokens.getEvents)) {
        cancelTokens.getEvents.forEach((t) => t.cancel('Stop getting events'));
      }

      const promises = parameters.map((p) =>
        getLogsData(api.getCancelTokenSource(), p)
      );
      const responses = await api.all(promises);
      const logs = [];
      responses.forEach(({ eventLogs }) => logs.push(...eventLogs));
      commit('setAllEvents', logs);
    },
    async deleteAllEventLogs({ dispatch }, data) {
      return await api
        .post(
          '/redfish/v1/Systems/system/LogServices/EventLog/Actions/LogService.ClearLog'
        )
        .then(() => dispatch('getEventLogData'))
        .then(() => i18n.tc('pageEventLogs.toast.successDelete', data.length))
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.tc('pageEventLogs.toast.errorDelete', data.length)
          );
        });
    },
    async deleteEventLogs({ dispatch }, uris = []) {
      const promises = uris.map((uri) =>
        api.delete(uri).catch((error) => {
          console.log(error);
          return error;
        })
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
              const message = i18n.tc(
                'pageEventLogs.toast.successDelete',
                successCount
              );
              toastMessages.push({ type: 'success', message });
            }

            if (errorCount) {
              const message = i18n.tc(
                'pageEventLogs.toast.errorDelete',
                errorCount
              );
              toastMessages.push({ type: 'error', message });
            }

            return toastMessages;
          })
        );
    },
    async resolveEventLogs({ dispatch }, logs) {
      const promises = logs.map((log) =>
        api.patch(log.uri, { Resolved: true }).catch((error) => {
          console.log(error);
          return error;
        })
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
              const message = i18n.tc(
                'pageEventLogs.toast.successResolveLogs',
                successCount
              );
              toastMessages.push({ type: 'success', message });
            }
            if (errorCount) {
              const message = i18n.tc(
                'pageEventLogs.toast.errorResolveLogs',
                errorCount
              );
              toastMessages.push({ type: 'error', message });
            }
            return toastMessages;
          })
        );
    },
    async unresolveEventLogs({ dispatch }, logs) {
      const promises = logs.map((log) =>
        api.patch(log.uri, { Resolved: false }).catch((error) => {
          console.log(error);
          return error;
        })
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
              const message = i18n.tc(
                'pageEventLogs.toast.successUnresolveLogs',
                successCount
              );
              toastMessages.push({ type: 'success', message });
            }
            if (errorCount) {
              const message = i18n.tc(
                'pageEventLogs.toast.errorUnresolveLogs',
                errorCount
              );
              toastMessages.push({ type: 'error', message });
            }
            return toastMessages;
          })
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
            return i18n.tc('pageEventLogs.toast.successResolveLogs', 1);
          } else {
            return i18n.tc('pageEventLogs.toast.successUnresolveLogs', 1);
          }
        })
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageEventLogs.toast.errorLogStatusUpdate'));
        });
    },
  },
};

export default EventLogStore;
