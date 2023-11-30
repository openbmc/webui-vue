<template>
  <b-row class="mt-3">
    <b-col sm="6">
      <dl>
        <dt>{{ t('pageOverview.model') }}</dt>
        <dd>{{ serverModel }}</dd>
        <dt>{{ t('pageOverview.serialNumber') }}</dt>
        <dd>{{ serverSerialNumber }}</dd>
      </dl>
    </b-col>
    <b-col sm="6">
      <dl>
        <dt>{{ t('pageOverview.serverManufacturer') }}</dt>
        <dd>{{ serverManufacturer }}</dd>
      </dl>
    </b-col>
  </b-row>
</template>

<script>
import { AuthenticationStore } from '../../store/modules/Authentication/AuthenticationStore'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
export default {
  name: 'OverviewServer',
  setup() {
    const Authentication = AuthenticationStore()
    const { t } = useI18n()
    const { systems } = Authentication 
    const serverModel = computed(() => {
      return systems?.model;
})
    const serverSerialNumber = computed(() => {
      return systems?.serialNumber;
})
    const serverManufacturer = computed(() => {
      return systems?.manufacturer;
})
    Authentication.getSystem().finally(() => {
      console.log('getSystem call success')
    })

    return {
      t,
      serverModel,
      serverSerialNumber,
      serverManufacturer
    }
  }
}
</script>
