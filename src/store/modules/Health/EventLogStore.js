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

const getHealthStatus = allEvents => {
  let status = 'good';
  for (const event of allEvents) {
    if (!event.Resolved && event.priority === 'medium') {
      status = 'warning';
    }
    if (!event.Resolved && event.priority === 'high') {
      status = 'critical';
      break;
    }
  }
  return status;
};

const EventLogStore = {
  namespaced: true,
  state: {
    allEvents: [],
    highPriorityEvents: [],
    healthStatus: null
  },
  getters: {
    allEvents: state => state.allEvents,
    highPriorityEvents: state => state.highPriorityEvents,
    healthStatus: state => state.healthStatus
  },
  mutations: {
    setAllEvents: (state, allEvents) => (state.allEvents = allEvents),
    setHighPriorityEvents: (state, highPriorityEvents) =>
      (state.highPriorityEvents = highPriorityEvents),
    setHealthStatus: (state, status) => (state.healthStatus = status)
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
              const { Description, Timestamp, Severity } = event;
              eventLogs.push({
                logId: Id,
                priority: priorityMapper(Severity),
                timestamp: Timestamp,
                description: Description,
                ...event
              });
            }
          }

          const healthStatus = getHealthStatus(eventLogs);
          const highPriorityEvents = eventLogs.filter(
            ({ priority, Resolved }) => priority === 'high' && !Resolved
          );

          commit('setAllEvents', eventLogs);
          commit('setHighPriorityEvents', highPriorityEvents);
          commit('setHealthStatus', healthStatus);
        })
        .catch(error => {
          console.log('Event Log Data:', error);
        });
    },
    checkHealth({ commit, getters }, interfaces) {
      if (getters['healthStatus'] === 'critical') return;
      for (const key in interfaces) {
        const event = interfaces[key];
        const eventPriority = priorityMapper(event.Severity);
        const isEventResolved = event.Resolved;
        if (!isEventResolved) {
          if (eventPriority === 'high') {
            commit('setHealthStatus', 'critical');
            break;
          }
          if (eventPriority === 'medium') commit('setHealthStatus', 'warning');
        }
      }
    }
  }
};

export default EventLogStore;
