import api from '../../api';

const EVENT_SEVERITY = {
  emergency: 'xyz.openbmc_project.Logging.Entry.Level.Emergency',
  alert: 'xyz.openbmc_project.Logging.Entry.Level.Alert',
  critical: 'xyz.openbmc_project.Logging.Entry.Level.Critical',
  error: 'xyz.openbmc_project.Logging.Entry.Level.Error',
  warning: 'xyz.openbmc_project.Logging.Entry.Level.Warning',
  notice: 'xyz.openbmc_project.Logging.Entry.Level.Notice',
  informational: 'xyz.openbmc_project.Logging.Entry.Level.Informational',
  debug: 'xyz.openbmc_project.Logging.Entry.Level.Debug'
};

const priorityMapper = severity => {
  switch (severity) {
    case EVENT_SEVERITY.emergency:
    case EVENT_SEVERITY.alert:
    case EVENT_SEVERITY.critical:
    case EVENT_SEVERITY.error:
      return 'high';
    case EVENT_SEVERITY.warning:
      return 'medium';
    case EVENT_SEVERITY.notice:
    case EVENT_SEVERITY.debug:
    case EVENT_SEVERITY.informational:
      return 'low';
    default:
      return '';
  }
};

const EventLogStore = {
  namespaced: true,
  state: {
    allEvents: [],
    highPriorityEvents: [],
    isGoodHealth: true
  },
  getters: {
    allEvents: state => state.allEvents,
    highPriorityEvents: state => state.highPriorityEvents,
    isGoodHealth: state => state.isGoodHealth
  },
  mutations: {
    setAllEvents: (state, allEvents) => (state.allEvents = allEvents),
    setHighPriorityEvents: (state, highPriorityEvents) =>
      (state.highPriorityEvents = highPriorityEvents),
    setGoodHealth: (state, isGoodHealth) => (state.isGoodHealth = isGoodHealth)
  },
  actions: {
    getEventLogData({ commit }) {
      api
        .get('/xyz/openbmc_project/logging/enumerate')
        .then(response => {
          const responseData = response.data.data;
          const eventLogs = [];
          for (const key in responseData) {
            const event = responseData[key];
            const { Id } = event;
            if (responseData.hasOwnProperty(key) && Id) {
              const { EventID, Description, Timestamp, Severity } = event;
              eventLogs.push({
                logId: Id,
                priority: priorityMapper(Severity),
                timestamp: Timestamp,
                eventID: EventID,
                description: Description,
                ...event
              });
            }
          }

          const highPriorityEvents = eventLogs.filter(
            ({ priority, Resolved }) => priority === 'high' && !Resolved
          );

          commit('setAllEvents', eventLogs);
          commit('setHighPriorityEvents', highPriorityEvents);
          if (highPriorityEvents.length > 0) {
            commit('setGoodHealth', false);
          } else {
            commit('setGoodHealth', true);
          }
        })
        .catch(error => {
          console.log('Event Log Data:', error);
        });
    },
    checkHealth({ commit }, interfaces) {
      for (const key in interfaces) {
        const event = interfaces[key];
        const eventPriority = priorityMapper(event.Severity);
        const isEventResolved = event.Resolved;
        if (eventPriority === 'high' && !isEventResolved) {
          commit('setGoodHealth', false);
        }
      }
    }
  }
};

export default EventLogStore;
