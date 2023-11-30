<template>
  <overview-card
    :title="t('pageOverview.firmwareInformation')"
    :to="`/operations/firmware`"
  >
    <BRow class="mt-3">
      <BCol sm="6">
        <dl>
          <dt>{{ t('pageOverview.runningVersion') }}</dt>
          <dd>{{ dataFormatterGlobal.dataFormatter(runningVersion) }}</dd>
          <dt>{{ t('pageOverview.backupVersion') }}</dt>
          <dd>{{ dataFormatterGlobal.dataFormatter(backupVersion) }}</dd>
        </dl>
      </BCol>
      <BCol sm="6">
        <dl>
          <dt>{{ t('pageOverview.firmwareVersion') }}</dt>
          <dd>{{ dataFormatterGlobal.dataFormatter(firmwareVersion) }}</dd>
        </dl>
      </BCol>
    </BRow>
  </overview-card>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import OverviewCard from './OverviewCard.vue';
import DataFormatterGlobal from '@/components/Mixins/DataFormatterGlobal';
import FirmwareStore from '../../store/modules/Operations/FirmwareStore';
import SystemStore from '../../store/modules/HardwareStatus/SystemStore';

const { t } = useI18n();
const firmwareStore = FirmwareStore();
const systemStore = SystemStore();
const dataFormatterGlobal = DataFormatterGlobal;
firmwareStore.getFirmwareInformation();
const systems = computed(() => {
  return systemStore.systems[0];
});
const backupBmcFirmware = computed(() => {
  return firmwareStore.backupBmcFirmware;
});

const backupVersion = computed(() => {
  return backupBmcFirmware.value?.version;
});
const activeBmcFirmware = computed(() => {
  return firmwareStore.activeBmcFirmware;
});
const firmwareVersion = computed(() => {
  return systems.value?.firmwareVersion;
});

const runningVersion = computed(() => {
  return activeBmcFirmware.value?.version;
});
</script>
