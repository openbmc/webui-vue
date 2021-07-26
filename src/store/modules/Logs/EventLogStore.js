import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';

const mutations = {
  setAllEvents: 'setAllEvents',
  setEventLogsCancelToken: 'setEventLogsCancelToken',
  setLoaded: 'setLoaded',
  setTotal: 'setTotal',
};
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

const getEventLogDataParameters = (total, pageCount, start) => {
  const result = [];
  start = start || 0;
  const pages = Math.floor(1 + total / pageCount);
  for (let i = start; i < pages; ++i) {
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
    total: 0,
    cancelTokens: {
      getEvents: null,
    },
  },
  getters: {
    allEvents: (state) => state.allEvents,
    highPriorityEvents: (state) => getHighPriorityEvents(state.allEvents),
    healthStatus: (state) =>
      getHealthStatus(state.allEvents, state.loadedEvents),
    total: (state) => state.total,
  },
  mutations: {
    [mutations.setTotal]: (state, total) => {
      state.total = total;
    },
    [mutations.setLoaded]: (state, isLoaded) => {
      state.loadedEvents = isLoaded;
    },
    [mutations.setAllEvents]: (state, allEvents) => {
      const events = [...state.allEvents, ...allEvents];
      state.allEvents = events;
    },
    [mutations.setEventLogsCancelToken]: (state, token) => {
      if (state.cancelTokens.getEvents) {
        state.cancelTokens.getEvents.cancel('Stop getting events');
      }

      state.cancelTokens.getEvents = token;
    },
  },
  actions: {
    clearEventLogData({ commit }) {
      commit(mutations.setAllEvents, []);
    },
    async getEventLogDataPage({ commit }, { token, parameters }) {
      const { eventLogs, total } = await getLogsData(token, parameters);
      commit(mutations.setAllEvents, eventLogs);
      commit(mutations.setTotal, total);
    },
    async getEventLogData({ commit, dispatch, getters }) {
      commit(mutations.setLoaded, false);
      let token = api.getCancelTokenSource();
      commit(mutations.setEventLogsCancelToken, token);

      dispatch('clearEventLogData');
      await dispatch('getEventLogDataPage', {
        token,
        parameters: { $top: eventLogDataLimit },
      });
      const allparameters = getEventLogDataParameters(
        getters['total'],
        eventLogDataLimit,
        1
      );
      for (const parameters of allparameters) {
        await dispatch('getEventLogDataPage', {
          token,
          parameters,
        });
      }

      commit(mutations.setEventLogsCancelToken, null);
      commit(mutations.setLoaded, true);
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
