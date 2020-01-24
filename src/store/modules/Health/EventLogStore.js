import api from '../../api';

const severityToPriorityMap = {
  Emergency: 'High',
  Alert: 'High',
  Critical: 'High',
  Error: 'High',
  Warning: 'Medium',
  Notice: 'Low',
  Debug: 'Low',
  Informational: 'Low'
};

const EventLogStore = {
  namespaced: true,
  state: {
    eventLogData: null
  },
  getters: {
    eventLogData: state => state.eventLogData
  },
  mutations: {
    setEventLogData: (state, eventLogData) =>
      (state.eventLogData = eventLogData)
  },
  actions: {
    getEventLogData({ commit }) {
      api
        .get('/xyz/openbmc_project/logging/enumerate')
        .then(response => {
          const eventLog = response.data.data;
          const entryNumber = /[1-9]/;
          for (let key in eventLog) {
            if (
              key.includes('entry') &&
              key.match(entryNumber) &&
              !key.includes('callout')
            ) {
              const eventKey = eventLog[key];
              const eventSeverity = eventKey.Severity.split('.').pop();
              const eventPriority = severityToPriorityMap[eventSeverity];
              const eventLogEntries = [];
              eventLogEntries.push(
                Object.assign(
                  {
                    logId: eventKey.Id,
                    priority: eventPriority,
                    timestamp: eventKey.Timestamp,
                    eventID: eventKey.EventID,
                    description: eventKey.Description
                  },
                  eventKey
                )
              );
              commit('setEventLogData', eventLogEntries);
            }
          }
        })
        .catch(error => {
          console.log('Event Log Data:', error);
        });
    }
  }
};

export default EventLogStore;
