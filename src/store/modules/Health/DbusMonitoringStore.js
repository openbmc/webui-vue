import api from '@/store/api';
import i18n from '@/i18n';
import { has, sortBy } from 'lodash';

function pairEvents(events) {
  for (let i = 0; i < events.length; i++) {
    const replyEvent = events[i];
    if (has(replyEvent, 'reply_cookie')) {
      for (let j = i; j >= 0; j--) {
        const mainEvent = events[j];
        if (replyEvent.reply_cookie == mainEvent.cookie) {
          mainEvent['reply_event'] = replyEvent;
        }
      }
    }
  }
}

const DbusMonitoringStore = {
  namespaced: true,
  state: {
    allEvents: [],
    isCapturing: null,
    captureStartTime: null,
    captureStopTime: null,
    filterCriteria: [],
    beginTimeStamp: '',
    endTimeStamp: ''
  },
  getters: {
    allEvents: state => state.allEvents,
    isCapturing: state => state.isCapturing,
    captureStartTime: state => state.captureStartTime,
    captureStopTime: state => state.captureStopTime,
    filterCriteria: state => state.filterCriteria,
    beginTimeStamp: state => state.beginTimeStamp,
    endTimeStamp: state => state.endTimeStamp
  },
  mutations: {
    setAllEvents: (state, allEvents) => (state.allEvents = allEvents),
    setCaptureStatus: (state, isCapturing) => (state.isCapturing = isCapturing),
    setCaptureStartTime: (state, captureStartTime) =>
      (state.captureStartTime = captureStartTime),
    setCaptureStopTime: (state, captureStopTime) =>
      (state.captureStopTime = captureStopTime),
    setFilterCriteria: (state, filterCriteria) => {
      state.filterCriteria = filterCriteria;
    },
    setBeginTimeStamp: (state, timeStamp) => {
      state.beginTimeStamp = timeStamp;
    },
    setEndTimeStamp: (state, timeStamp) => {
      state.endTimeStamp = timeStamp;
    }
  },
  actions: {
    async getDbusCaptureDump({ commit }) {
      await api
        .get('/dbus_capture.json')
        .then(res => {
          let events = JSON.parse(`[${res.data.trim().slice(0, -1)}]`);
          events = sortBy(events, event => event.time);
          pairEvents(events);
          commit('setAllEvents', events);
        })
        .catch(error => {
          console.log('Could not get dbus dumps:', error);
        });
    },
    async clearCaptureDump() {
      await api
        .get('/redfish/v1/Systems/dbus/DBusCapture/Actions/DbusCapture.Clear/')
        .catch(error => {
          console.log(error);
          i18n.t('pageDbusMonitoring.toast.errorStart');
        });
    },
    async getDbusCaptureStatus({ commit }) {
      return api
        .get('/redfish/v1/Systems/dbus/DBusCapture/')
        .then(response => {
          commit('setCaptureStatus', response.data.isCapturing);
          // commit("setCaptureStartTime", response.data.captureStartTime); TODO uncomment
          // commit("setCaptureStopTime", response.data.captureStopTime); TOOD uncomment
        })
        .catch(error => console.log(error));
    },
    async startDbusCapture({ dispatch, commit }) {
      await api
        .get(
          '/redfish/v1/Systems/dbus/DBusCapture/Actions/DbusCapture.StartCapture/'
        )
        .then(() => dispatch('getDbusCaptureStatus'))
        // remove after BmcWeb Changes are accepted
        .then(() => commit('setCaptureStatus', true))
        // remove after BmcWeb Changes are accepted
        .then(() => commit('setCaptureStartTime', Date.now()))
        .then(() => i18n.t('pageDbusMonitoring.toast.successStart'))
        .catch(error => {
          console.log(error);
          i18n.t('pageDbusMonitoring.toast.errorStart');
        });
    },
    async stopDbusCapture({ dispatch, commit }) {
      await api
        .get(
          '/redfish/v1/Systems/dbus/DBusCapture/Actions/DbusCapture.StopCapture/'
        )
        .then(() => dispatch('getDbusCaptureStatus'))
        // remove after BmcWeb Changes are accepted
        .then(() => commit('setCaptureStatus', false))
        // remove after BmcWeb Changes are accepted
        .then(() => commit('setCaptureStopTime', Date.now()))
        .then(() => i18n.t('pageDbusMonitoring.toast.successStop'))
        .catch(error => {
          console.log(error);
          i18n.t('pageDbusMonitoring.toast.errorStop');
        });
    }
  }
};

export default DbusMonitoringStore;
