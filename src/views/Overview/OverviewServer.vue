<template>
  <overview-card
    :title="t('pageOverview.serverInformation')"
    :to="`/hardware-status/inventory`"
  >
    <BRow class="mt-3">
      <BCol sm="6">
        <dl>
          <dt>{{ t('pageOverview.model') }}</dt>
          <dd>{{ dataFormatterGlobal.dataFormatter(serverModel) }}</dd>
          <dt>{{ t('pageOverview.serialNumber') }}</dt>
          <dd>{{ dataFormatterGlobal.dataFormatter(serverSerialNumber) }}</dd>
        </dl>
      </BCol>
      <BCol sm="6">
        <dl>
          <dt>{{ t('pageOverview.serverManufacturer') }}</dt>
          <dd>{{ dataFormatterGlobal.dataFormatter(serverManufacturer) }}</dd>
        </dl>
      </BCol>
    </BRow>
  </overview-card>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { SystemStore } from '../../store/modules/HardwareStatus/SystemStore';
import OverviewCard from './OverviewCard.vue';
// import { DataFormatterGlobal } from '@/components/Mixins/DataFormatterGlobal';
import useDataFormatterGlobal from '@/components/Composables/useDataFormatterGlobal';

const dataFormatterGlobal = useDataFormatterGlobal();
const systemStore = SystemStore();
const { t } = useI18n();
systemStore.getSystem();
const systems = computed(() => {
  return systemStore.systems[0];
});
const serverModel = computed(() => {
  return systems.value?.model;
});
const serverSerialNumber = computed(() => {
  return systems.value?.serialNumber;
});
const serverManufacturer = computed(() => {
  return systems.value?.manufacturer;
});
const serverSerial = ref(
  dataFormatterGlobal.dataFormatter(serverSerialNumber.value)
);
</script>
