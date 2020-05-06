import api from '../../api';

const getHealthStatus = events => {
  let status = 'OK';
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

// TODO: High priority events should also check if Log
// is resolved when the property is available in Redfish
const getHighPriorityEvents = events =>
  events.filter(({ severity }) => severity === 'Critical');

const EventLogStore = {
  namespaced: true,
  state: {
    allEvents: []
  },
  getters: {
    allEvents: state => state.allEvents,
    highPriorityEvents: state => getHighPriorityEvents(state.allEvents),
    healthStatus: state => getHealthStatus(state.allEvents)
  },
  mutations: {
    setAllEvents: (state, allEvents) => (state.allEvents = allEvents)
  },
  actions: {
    async getEventLogData({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/LogServices/EventLog/Entries')
        .then(({ data: { Members = [] } = {} }) => {
          const eventLogs = Members.map(
            ({ Id, Severity, Created, EntryType, Message }) => {
              return {
                logId: Id,
                severity: Severity,
                timestamp: new Date(Created),
                type: EntryType,
                description: Message
              };
            }
          );
          commit('setAllEvents', eventLogs);
        })
        .catch(error => {
          console.log('Event Log Data:', error);
        });
    }
  }
};

export default EventLogStore;
