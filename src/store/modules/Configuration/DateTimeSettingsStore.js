import api from '../../api';
import i18n from '@/i18n';

const DateTimeStore = {
  namespaced: true,
  state: {
    ntpServers: [],
    isNtpProtocolEnabled: null
  },
  getters: {
    ntpServers: state => state.ntpServers,
    isNtpProtocolEnabled: state => state.isNtpProtocolEnabled
  },
  mutations: {
    setNtpServers: (state, ntpServers) => (state.ntpServers = ntpServers),
    setIsNtpProtocolEnabled: (state, isNtpProtocolEnabled) =>
      (state.isNtpProtocolEnabled = isNtpProtocolEnabled)
  },
  actions: {
    async getNtpData({ commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc/NetworkProtocol')
        .then(response => {
          const ntpServers = response.data.NTP.NTPServers;
          const isNtpProtocolEnabled = response.data.NTP.ProtocolEnabled;
          commit('setNtpServers', ntpServers);
          commit('setIsNtpProtocolEnabled', isNtpProtocolEnabled);
        })
        .catch(error => {
          console.log(error);
        });
    },
    async updateDateTimeSettings(_, dateTimeForm) {
      const ntpData = {
        NTP: {
          ProtocolEnabled: dateTimeForm.ntpProtocolEnabled
        }
      };

      if (dateTimeForm.ntpProtocolEnabled) {
        ntpData.NTP.NTPServers = dateTimeForm.ntpServersArray;
      }
      return await api
        .patch(`/redfish/v1/Managers/bmc/NetworkProtocol`, ntpData)
        .then(() => {
          if (!dateTimeForm.ntpProtocolEnabled) {
            const dateTimeData = {
              DateTime: dateTimeForm.updatedDateTime
            };
            api.patch(`/redfish/v1/Managers/bmc`, dateTimeData);
          }
        })
        .then(() => {
          return i18n.t(
            'pageDateTimeSettings.toast.successSaveDateTimeSettings'
          );
        })
        .catch(error => {
          console.log(error);
          throw new Error(
            i18n.t('pageDateTimeSettings.toast.errorSaveDateTimeSettings')
          );
        });
    }
  }
};

export default DateTimeStore;
