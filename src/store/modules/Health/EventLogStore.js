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
    eventLogData: [],
    highPriorityEvents: []
  },
  getters: {
    eventLogData: state => state.eventLogData,
    highPriorityEvents: state => state.highPriorityEvents
  },
  mutations: {
    setEventLogData: (state, eventLogData) =>
      (state.eventLogData = eventLogData),
    setHighPriorityEvents: (state, highPriorityEvents) =>
      (state.highPriorityEvents = highPriorityEvents)
  },
  actions: {
    getEventLogData({ commit }) {
      api
        .get('/xyz/openbmc_project/logging/enumerate')
        .then(response => {
          const eventLog = response.data.data;
          const entryNumber = /[1-9]/;
          const eventLogEntries = [];
          /**
           * Entry log endpoints:
           * 'entry' + entry id contain event log entry information
           * 'callout' contains part number and serial number for part affected
           */
          for (let key in eventLog) {
            // Check for event log entry:
            if (
              key.includes('entry') &&
              key.match(entryNumber) &&
              !key.includes('callout')
            ) {
              const eventKey = eventLog[key];
              const eventSeverity = eventKey.Severity.split('.').pop();
              const eventPriority = severityToPriorityMap[eventSeverity];
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
            }
          }
          const highPriorityEvents = eventLogEntries.filter(
            ({ priority, Resolved }) => priority === 'High' && !Resolved
          );
          commit('setEventLogData', eventLogEntries);
          commit('setHighPriorityEvents', highPriorityEvents);
        })
        .catch(error => {
          console.log('Event Log Data:', error);
        });
    }
  }
};

export default EventLogStore;
