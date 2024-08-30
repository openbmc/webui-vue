import api from '@/store/api';
import i18n from '@/i18n';

function envInt(key, defaultValue) {
  if (process.env[key] == null) return defaultValue;
  const value = parseInt(process.env[key]);
  if (isNaN(value)) return defaultValue;
  return value;
}

const TASK_POLL_INTERVAL = envInt('VUE_APP_FIRMWARE_UPDATE_POLL_INTERVAL', 4);
const TASK_POLL_TIMEOUT = envInt('VUE_APP_FIRMWARE_UPDATE_POLL_TIMEOUT', 1200);
const MAX_TASK_POLL_TIME = TASK_POLL_TIMEOUT / TASK_POLL_INTERVAL;
const WAIT_FOR_READY_INTERVAL = envInt('VUE_APP_WAIT_FOR_READY_INTERVAL', 8);
const WAIT_FOR_READY_TIME = envInt('VUE_APP_WAIT_FOR_READY_TIME', 40);

const FirmwareStore = {
  namespaced: true,
  state: {
    bmcFirmware: [],
    hostFirmware: [],
    bmcActiveFirmwareId: null,
    hostActiveFirmwareId: null,
    applyTime: null,
    multipartHttpPushUri: null,
    httpPushUri: null,
    simpleUpdateUri: null,
    allowableActions: [],
    publicKeyExchangeUri: null,
    firmwareUpdateInfo: {
      /*  Firmware update states:
       *  null -> 'TaskStarted' -> 'TaskCompleted' -> 'Done'
       *                                           -> 'ResetFailed'
       *                                           -> 'WaitReadyFailed'
       *                        -> 'TaskFailed'
       *  TODO: try to use server-side states instead of this new client-side state machine
       */
      state: null,
      taskHandle: null,
      initiator: false,
      taskPercent: 0,
      errMsg: null,
      touch: false,
    },
  },
  getters: {
    multipartHttpPushUri: (state) => state.multipartHttpPushUri,
    simpleUpdateUri: (state) => state.simpleUpdateUri,
    allowableActions: (state) => state.allowableActions,
    sshAuthenticationMethods: (state) => {
      const methods = [];
      if (state.publicKeyExchangeUri != null) methods.push('PublicKey');
      return methods;
    },
    isSingleFileUploadEnabled: (state) => state.hostFirmware.length === 0,
    activeBmcFirmware: (state) => {
      return state.bmcFirmware.find(
        (firmware) => firmware.id === state.bmcActiveFirmwareId,
      );
    },
    activeHostFirmware: (state) => {
      return state.hostFirmware.find(
        (firmware) => firmware.id === state.hostActiveFirmwareId,
      );
    },
    backupBmcFirmware: (state) => {
      return state.bmcFirmware.find(
        (firmware) => firmware.id !== state.bmcActiveFirmwareId,
      );
    },
    backupHostFirmware: (state) => {
      return state.hostFirmware.find(
        (firmware) => firmware.id !== state.hostActiveFirmwareId,
      );
    },
    firmwareUpdateInfo: (state) => state.firmwareUpdateInfo,
    isFirmwareUpdateInProgress: (state) =>
      state.firmwareUpdateInfo.state !== null &&
      state.firmwareUpdateInfo.state !== 'Done' &&
      state.firmwareUpdateInfo.state !== 'ResetFailed' &&
      state.firmwareUpdateInfo.state !== 'WaitReadyFailed' &&
      state.firmwareUpdateInfo.state !== 'TaskFailed',
  },
  mutations: {
    setActiveBmcFirmwareId: (state, id) => (state.bmcActiveFirmwareId = id),
    setActiveHostFirmwareId: (state, id) => (state.hostActiveFirmwareId = id),
    setBmcFirmware: (state, firmware) => (state.bmcFirmware = firmware),
    setHostFirmware: (state, firmware) => (state.hostFirmware = firmware),
    setApplyTime: (state, applyTime) => (state.applyTime = applyTime),
    setHttpPushUri: (state, httpPushUri) => (state.httpPushUri = httpPushUri),
    setMultipartHttpPushUri: (state, multipartHttpPushUri) =>
      (state.multipartHttpPushUri = multipartHttpPushUri),
    setSimpleUpdateUri: (state, simpleUpdateUri) =>
      (state.simpleUpdateUri = simpleUpdateUri),
    setAllowableActions: (state, allowableActions) =>
      (state.allowableActions = allowableActions),
    setPublicKeyExchangeUri: (state, publicKeyExchangeUri) =>
      (state.publicKeyExchangeUri = publicKeyExchangeUri),
    setFirmwareUpdateTaskHandle: (state, taskHandle) => {
      state.firmwareUpdateInfo.taskHandle = taskHandle;
    },
    setFirmwareUpdateInitiator: (state, initiator) => {
      state.firmwareUpdateInfo.initiator = initiator;
      sessionStorage.setItem('firmwareUpdateInitiator', initiator);
    },
    setFirmwareUpdateState: (state, updateState) =>
      (state.firmwareUpdateInfo.state = updateState),
    setFirmwareUpdateErrMsg: (state, errMsg) =>
      (state.firmwareUpdateInfo.errMsg = errMsg),
    setFirmwareUpdateTaskPercent: (state, percent) =>
      (state.firmwareUpdateInfo.taskPercent = percent),
    setFirmwareUpdateTouch: (state) =>
      (state.firmwareUpdateInfo.touch = !state.firmwareUpdateInfo.touch),
  },
  actions: {
    async getFirmwareInformation({ dispatch }) {
      dispatch('getActiveHostFirmware');
      dispatch('getActiveBmcFirmware');
      return await dispatch('getFirmwareInventory');
    },
    async getActiveBmcFirmware({ commit }) {
      return api
        .get(`${await this.dispatch('global/getBmcPath')}`)
        .then(({ data: { Links } }) => {
          const id = Links?.ActiveSoftwareImage['@odata.id'].split('/').pop();
          commit('setActiveBmcFirmwareId', id);
        })
        .catch((error) => console.log(error));
    },
    async getActiveHostFirmware({ commit }) {
      return api
        .get(`${await this.dispatch('global/getSystemPath')}/Bios`)
        .then(({ data: { Links } }) => {
          const id = Links?.ActiveSoftwareImage['@odata.id'].split('/').pop();
          commit('setActiveHostFirmwareId', id);
        })
        .catch((error) => console.log(error));
    },
    async getFirmwareInventory({ commit }) {
      const inventoryList = await api
        .get('/redfish/v1/UpdateService/FirmwareInventory')
        .then(({ data: { Members = [] } = {} }) =>
          Members.map((item) => api.get(item['@odata.id'])),
        )
        .catch((error) => console.log(error));
      await api
        .all(inventoryList)
        .then((response) => {
          const bmcFirmware = [];
          const hostFirmware = [];
          response.forEach(({ data }) => {
            const firmwareType = data?.RelatedItem?.[0]?.['@odata.id']
              .split('/')
              .pop();
            const item = {
              version: data?.Version,
              id: data?.Id,
              location: data?.['@odata.id'],
              status: data?.Status?.Health,
            };
            if (firmwareType === 'bmc') {
              bmcFirmware.push(item);
            } else if (firmwareType === 'Bios') {
              hostFirmware.push(item);
            }
          });
          commit('setBmcFirmware', bmcFirmware);
          commit('setHostFirmware', hostFirmware);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async getUpdateServiceSettings({ commit, dispatch }) {
      api
        .get('/redfish/v1/UpdateService')
        .then(async ({ data }) => {
          const applyTime =
            data.HttpPushUriOptions.HttpPushUriApplyTime.ApplyTime;
          commit('setApplyTime', applyTime);
          const httpPushUri = data.HttpPushUri;
          commit('setHttpPushUri', httpPushUri);
          const multipartHttpPushUri = data.MultipartHttpPushUri;
          commit('setMultipartHttpPushUri', multipartHttpPushUri);
          const simpleUpdate = data?.Actions?.['#UpdateService.SimpleUpdate'];
          const simpleUpdateUri = simpleUpdate?.['target'];
          const allowableActions =
            simpleUpdate?.['TransferProtocol@Redfish.AllowableValues'];
          commit('setSimpleUpdateUri', simpleUpdateUri);
          if (allowableActions != null)
            commit('setAllowableActions', allowableActions);
          commit(
            'setPublicKeyExchangeUri',
            await dispatch('findPublicKeyExchangeUri', data?.Actions),
          );
        })
        .catch((error) => console.log(error));
    },
    async findPublicKeyExchangeUri({ dispatch }, actions) {
      if (typeof actions !== 'object') return null;
      for (const key of Object.keys(actions)) {
        if (key.startsWith('#') && key.endsWith('.PublicKeyExchange'))
          return actions[key]?.['target'];

        const uri = await dispatch('findPublicKeyExchangeUri', actions[key]);
        if (uri != null) return uri;
      }
      return null;
    },
    async uploadFirmware({ state, dispatch }, params) {
      if (state.multipartHttpPushUri != null) {
        return dispatch('uploadFirmwareMultipartHttpPush', params);
      } else if (state.httpPushUri != null) {
        return dispatch('uploadFirmwareHttpPush', params);
      } else {
        console.log('Do not support firmware push update');
      }
    },
    async uploadFirmwareHttpPush({ state, dispatch }, { image }) {
      return await api
        .post(state.httpPushUri, image, {
          headers: { 'Content-Type': 'application/octet-stream' },
        })
        .catch(async (error) => {
          console.log(error);
          throw new Error(
            await dispatch('extractResolutionForFailedCmd', error),
          );
        });
    },
    async uploadFirmwareMultipartHttpPush(
      { state, dispatch },
      { image, targets, forceUpdate },
    ) {
      const formData = new FormData();
      formData.append('UpdateFile', image);
      let params = {};
      if (targets != null && targets.length > 0) {
        params.Targets = targets;
      } else {
        // TODO: Should be OK to leave Targets out, remove this clause
        // when bmcweb is updated
        params.Targets = [`${await this.dispatch('global/getBmcPath')}`];
      }
      if (forceUpdate) params.ForceUpdate = true;
      formData.append('UpdateParameters', JSON.stringify(params));
      return await api
        .post(state.multipartHttpPushUri, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .catch(async (error) => {
          console.log(error);
          throw new Error(
            await dispatch('extractResolutionForFailedCmd', error),
          );
        });
    },
    async uploadFirmwareSimpleUpdate(
      // eslint-disable-next-line no-unused-vars
      { state, dispatch },
      { protocol, fileAddress, targets, username, forceUpdate },
    ) {
      const data = {
        TransferProtocol: protocol,
        ImageURI: fileAddress,
      };
      if (targets != null && targets.length > 0) data.Targets = targets;
      if (username != null) data.Username = username;
      if (forceUpdate) data.ForceUpdate = true;
      return await api
        .post(state.simpleUpdateUri, data)
        .catch(async (error) => {
          console.log(error);
          throw new Error(
            await dispatch('extractResolutionForFailedCmd', error),
          );
        });
    },
    // eslint-disable-next-line no-unused-vars
    extractResolutionForFailedCmd({ state }, error) {
      let resolutions = '';
      error?.response?.data?.error?.['@Message.ExtendedInfo']?.forEach(
        (msg) => {
          if (msg?.Resolution != null && msg?.Resolution !== 'None.') {
            if (resolutions.length > 0) resolutions += '; ';
            resolutions += msg?.Resolution;
          }
        },
      );

      if (resolutions.length > 0) return resolutions;
      else return i18n.t('pageFirmware.toast.errorUpdateFirmware');
    },
    initFirmwareUpdate({ commit }, { taskHandle, taskState, initiator }) {
      commit('setFirmwareUpdateTaskHandle', taskHandle);
      commit('setFirmwareUpdateState', taskState);
      commit('setFirmwareUpdateTaskPercent', 0);
      commit('setFirmwareUpdateErrMsg', null);
      initiator =
        initiator ||
        sessionStorage.getItem('firmwareUpdateInitiator') === 'true';
      commit('setFirmwareUpdateInitiator', initiator);
    },
    async setFirmwareUpdateTask(
      { state, dispatch, getters },
      { taskHandle, initiator },
    ) {
      if (getters.isFirmwareUpdateInProgress) return;
      dispatch('initFirmwareUpdate', {
        taskHandle: taskHandle,
        taskState: 'TaskStarted',
        initiator: initiator,
      });
      dispatch('pollTask', state.firmwareUpdateInfo.taskHandle);
    },
    async pollTask({ state, commit, dispatch }, taskHandle) {
      let resp = null;
      let percent = 0;
      let consecutiveFailCount = 0;
      for (let i = 0; i < MAX_TASK_POLL_TIME; i++) {
        resp = await api.get(taskHandle).catch((error) => {
          console.log(error);
        });
        percent = resp?.data?.PercentComplete;
        if (typeof percent !== 'number') {
          console.log(resp);
          percent = state.firmwareUpdateInfo.taskPercent;
          consecutiveFailCount++;
          if (consecutiveFailCount >= 3) break;
        } else {
          consecutiveFailCount = 0;
        }
        percent = percent <= 100 ? percent : 100;
        commit('setFirmwareUpdateTaskPercent', percent);
        commit('setFirmwareUpdateTouch'); // Touch it, then watch in firmware page can be triggerred
        if (percent >= 100 || resp?.data?.TaskStatus !== 'OK') break;
        await dispatch('sleep', TASK_POLL_INTERVAL);
      }

      if (
        percent < 100 ||
        resp?.data?.TaskState !== 'Completed' ||
        resp?.data?.TaskStatus !== 'OK'
      ) {
        console.log(resp);
        const errMsg = await dispatch('extractResolutionForFailedTask', resp);
        commit('setFirmwareUpdateErrMsg', errMsg);
        commit('setFirmwareUpdateState', 'TaskFailed');
        commit('setFirmwareUpdateInitiator', false);
      } else {
        commit('setFirmwareUpdateState', 'TaskCompleted');
        dispatch('waitToActive', resp);
      }
    },
    async waitToActive({ commit, dispatch }, resp) {
      if ((await dispatch('resetIfRequired', resp)) === false) {
        commit('setFirmwareUpdateState', 'ResetFailed');
        commit('setFirmwareUpdateInitiator', false);
        return;
      }

      if ((await dispatch('waitForReady', resp)) == false) {
        commit('setFirmwareUpdateState', 'WaitReadyFailed');
        commit('setFirmwareUpdateInitiator', false);
        return;
      }

      commit('setFirmwareUpdateState', 'Done');
      commit('setFirmwareUpdateInitiator', false);
    },
    async waitForReady({ dispatch }) {
      for (let i = 0; i < WAIT_FOR_READY_TIME; i++) {
        await dispatch('sleep', WAIT_FOR_READY_INTERVAL);
        if (await dispatch('isManagerStateEnabled')) return true;
      }
      return false;
    },
    async isManagerStateEnabled() {
      return await api
        .get(`${await this.dispatch('global/getBmcPath')}`)
        .then((resp) => resp?.data?.Status?.State === 'Enabled')
        .catch(() => console.log('No response yet from Manager'));
    },
    async resetIfRequired({ state, dispatch }, resp) {
      if (!state.firmwareUpdateInfo.initiator) return true;
      const resetRequired = await dispatch('extractResetRequired', resp);
      if (resetRequired == null) return true;
      const { resetUri, resetType } = resetRequired;

      let promise = null;
      if (
        resetUri ===
        `${await this.dispatch('global/getBmcPath')}/Actions/Manager.Reset`
      ) {
        promise = this.dispatch('controls/rebootBmc');
      } else {
        promise = api.post(resetUri, { ResetType: resetType });
      }

      return await promise
        .then(() => {
          return true;
        })
        .catch((error) => {
          console.log(error);
          return false;
        });
    },
    // eslint-disable-next-line no-unused-vars
    async extractResetRequired({ state }, resp) {
      let resolutionMsg = resp?.data?.Messages?.find((e) =>
        e?.MessageId?.includes('AwaitToActivate'),
      );
      if (!resolutionMsg?.Resolution?.includes('power cycle')) return null;

      const resetRequiredMsg = resp?.data?.Messages?.find((e) =>
        e?.MessageId?.includes('ResetRequired'),
      );
      const args = resetRequiredMsg?.MessageArgs;
      if (args?.length === 2) return { resetUri: args[0], resetType: args[1] };
      return null;
    },
    async findExistingUpdateTask({ state }) {
      const resp = await api
        .get('/redfish/v1/TaskService/Tasks')
        .catch((error) => {
          console.log(error);
        });

      const members = resp?.data?.Members;
      if (!(members?.length > 0)) return null;

      for (let i = members.length - 1; i >= 0; i--) {
        const taskHandle = members[i]?.['@odata.id'];
        const taskInfo = await api.get(taskHandle).catch((error) => {
          console.log(error);
        });
        const targetUri = taskInfo?.data?.Payload?.TargetUri;
        if (
          targetUri != null &&
          (targetUri === state.multipartHttpPushUri ||
            targetUri === state.simpleUpdateUri ||
            targetUri === state.httpPushUri)
        )
          return taskHandle;
      }
      return null;
    },
    async attachExistingUpdateTask({ dispatch, getters }) {
      if (getters.isFirmwareUpdateInProgress) return;
      dispatch('findExistingUpdateTask').then((taskHandle) => {
        if (taskHandle != null) {
          dispatch('setFirmwareUpdateTask', {
            taskHandle: taskHandle,
            initiator: false,
          });
        }
      });
    },
    // eslint-disable-next-line no-unused-vars
    extractResolutionForFailedTask({ state }, resp) {
      let resolutions = '';
      resp?.data?.Messages?.forEach((msg) => {
        if (msg?.Resolution != null && msg?.Resolution !== 'None.') {
          if (resolutions.length > 0) resolutions += '; ';
          resolutions += msg?.Resolution;
        }
      });

      if (resolutions.length > 0) return resolutions;
      else return i18n.t('pageFirmware.toast.errorCompleteUpdateFirmware');
    },
    // eslint-disable-next-line no-unused-vars
    sleep({ state }, seconds) {
      return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    },
    async switchBmcFirmwareAndReboot({ getters }) {
      const backupLocation = getters.backupBmcFirmware.location;
      const data = {
        Links: {
          ActiveSoftwareImage: {
            '@odata.id': backupLocation,
          },
        },
      };
      return await api
        .patch(`${await this.dispatch('global/getBmcPath')}`, data)
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageFirmware.toast.errorSwitchImages'));
        });
    },
    async exchangePublicKey(
      { dispatch, state },
      { remoteServerIp, remoteServerKey },
    ) {
      const data = {
        RemoteServerIP: remoteServerIp,
        RemoteServerKeyString: remoteServerKey,
      };
      return await api
        .post(state.publicKeyExchangeUri, data)
        .then((resp) => {
          const bmcKey =
            resp?.data?.['@Message.ExtendedInfo']?.[0]?.MessageArgs?.[0];
          if (bmcKey == null || bmcKey.length == 0) return null;
          return bmcKey;
        })
        .catch(async (error) => {
          console.log(error);
          throw new Error(
            await dispatch('extractResolutionForFailedCmd', error),
          );
        });
    },
  },
};

export default FirmwareStore;
