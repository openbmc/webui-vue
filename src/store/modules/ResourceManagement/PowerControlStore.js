import api from '@/store/api';
import i18n from '@/i18n';
import { defineStore } from 'pinia';

export const PowerControlStore = defineStore('powerControl', {
  state: () => ({
    powerCapValue: null,
    powerCapUri: '',
    powerConsumptionValue: null,
  }),
  actions: {
    async getChassisCollection() {
      return await api
        .get('/redfish/v1/')
        .then((response) => api.get(response.data.Chassis['@odata.id']))
        .then(({ data: { Members } }) =>
          Members.map((member) => member['@odata.id'])
        )
        .catch((error) => console.log(error));
    },
    async getPowerControl() {
      const collection = await this.getChassisCollection();
      if (!collection || collection.length === 0) return;
      return await api
        .get(`${collection[0]}`)
        .then((response) => api.get(response.data.Power['@odata.id']))
        .then((response) => {
          const powerControl = response.data.PowerControl;
          if (!powerControl || powerControl.length === 0) return;
          const powerCapUri = response.data['@odata.id'];
          const powerCap = powerControl[0].PowerLimit.LimitInWatts;
          // If system is powered off, power consumption does not exist in the PowerControl
          const powerConsumption = powerControl[0].PowerConsumedWatts || null;
          this.powerCapUri = powerCapUri;
          this.powerCapValue = powerCap;
          this.powerConsumptionValue = powerConsumption;
        })
        .catch((error) => {
          console.log('Power control', error);
        });
    },
    async setPowerControl(powerCapValue) {
      const data = {
        PowerControl: [{ PowerLimit: { LimitInWatts: powerCapValue } }],
      };
      return await api
        .patch(this.powerCapUri, data)
        .then(() =>
          i18n.t('pageServerPowerOperations.toast.successSaveSettings')
        )
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageServerPowerOperations.toast.errorSaveSettings')
          );
        });
    },
  },
});

export default PowerControlStore;
