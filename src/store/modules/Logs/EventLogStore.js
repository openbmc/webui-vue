import { defineStore } from 'pinia'
import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';
import { ref, onMounted, computed } from 'vue';

export const getHealthStatus = (events, loadedEvents) => {
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

export const getHighPriorityEvents = (events) =>
  events.filter(({ severity }) => severity === 'Critical');

export const EventLogStore = defineStore('eventLog', () => {
  const allEvents = ref([]);
  const loadedEvents = ref(false);

  const getAllEvents = () => allEvents.value;
  const getHighPriorityEvents = computed(() => getHighPriorityEvents(allEvents.value));
  const getHealthStatus = computed(() => getHealthStatus(allEvents.value, loadedEvents.value));

  const setAllEvents = (events) => {
    allEvents.value = events;
    loadedEvents.value = true;
  };
  const getEventLogData = async () => {
    try {
      const { data: { Members = [] } = {} } = await api.get('api/redfish/v1/Systems/system/LogServices/EventLog/Entries');
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
          status: Resolved,
          additionalDataUri: AdditionalDataURI,
        };
      });
      setAllEvents(eventLogs);
    } catch (error) {
      console.log('Event Log Data:', error);
    }
  };
  const deleteAllEventLogs = async (data) => {
    try {
      await api.post('api/redfish/v1/Systems/system/LogServices/EventLog/Actions/LogService.ClearLog');
      await getEventLogData();
      return i18n.tc('pageEventLogs.toast.successDelete', data.length);
    } catch (error) {
      console.log(error);
      throw new Error(i18n.tc('pageEventLogs.toast.errorDelete', data.length));
    }
  };
  const deleteEventLogs = async (uris = []) => {
    const promises = uris.map((uri) =>
      api.delete(uri).catch((error) => {
        console.log(error);
        return error;
      })
    );

    try {
      const response = await api.all(promises);
      await getEventLogData();

      const { successCount, errorCount } = getResponseCount(response);
      const toastMessages = [];

      if (successCount) {
        const message = i18n.tc('pageEventLogs.toast.successDelete', successCount);
        toastMessages.push({ type: 'success', message });
      }

      if (errorCount) {
        const message = i18n.tc('pageEventLogs.toast.errorDelete', errorCount);
        toastMessages.push({ type: 'error', message });
      }

      return toastMessages;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to delete event logs');
    }
  };
  const resolveEventLogs = async (logs) => {
    const promises = logs.map((log) =>
      api.patch(log.uri, { Resolved: true }).catch((error) => {
        console.log(error);
        return error;
      })
    );
    return await api
      .all(promises)
      .then((response) => {
        getEventLogData();
        return response;
      })
      .then(
        api.spread((...responses) => {
          const { successCount, errorCount } = getResponseCount(responses);
          const toastMessages = [];
          if (successCount) {
            const message = i18n.tc('pageEventLogs.toast.successResolveLogs', successCount);
            toastMessages.push({ type: 'success', message });
          }
          if (errorCount) {
            const message = i18n.tc('pageEventLogs.toast.errorResolveLogs', errorCount);
            toastMessages.push({ type: 'error', message });
          }
          return toastMessages;
        })
      );
  };
  const unresolveEventLogs = async (logs) => {
    const promises = logs.map((log) =>
      api.patch(log.uri, { Resolved: false }).catch((error) => {
        console.log(error);
        return error;
      })
    );
    return await api
      .all(promises)
      .then((response) => {
        getEventLogData();
        return response;
      })
      .then(
        api.spread((...responses) => {
          const { successCount, errorCount } = getResponseCount(responses);
          const toastMessages = [];
          if (successCount) {
            const message = i18n.tc('pageEventLogs.toast.successUnresolveLogs', successCount);
            toastMessages.push({ type: 'success', message });
          }
          if (errorCount) {
            const message = i18n.tc('pageEventLogs.toast.errorUnresolveLogs', errorCount);
            toastMessages.push({ type: 'error', message });
          }
          return toastMessages;
        })
      );
  };
  const updateEventLogStatus = async (log) => {
    const updatedEventLogStatus = log.status;
    try {
      await api.patch(log.uri, { Resolved: updatedEventLogStatus });
      getEventLogData();

      if (log.status) {
        return i18n.tc('pageEventLogs.toast.successResolveLogs', 1);
      } else {
        return i18n.tc('pageEventLogs.toast.successUnresolveLogs', 1);
      }
    } catch (error) {
      console.log(error);
      throw new Error(i18n.t('pageEventLogs.toast.errorLogStatusUpdate'));
    }
  };
  onMounted(() => {
    getEventLogData();
  });
  return {
    getAllEvents,
    getHighPriorityEvents,
    getHealthStatus,
    getEventLogData,
    deleteAllEventLogs,
    deleteEventLogs,
    resolveEventLogs,
    unresolveEventLogs,
    updateEventLogStatus,
  };
});

export default EventLogStore;