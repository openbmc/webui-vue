<template>
  <overview-card
    :title="t('pageOverview.inventory')"
    :to="`/hardware-status/inventory`"
  >
    <BRow class="mt-3">
      <BCol sm="6">
        <dl sm="6">
          <dt>{{ t('pageOverview.systemIdentifyLed') }}</dt>
          <dd>
            <BFormCheckbox
              id="identifyLedSwitch"
              v-model="systems.locationIndicatorActive"
              data-test-id="overviewInventory-checkbox-identifyLed"
              switch
              @change="toggleIdentifyLedSwitch"
            >
              <span v-if="systems.locationIndicatorActive">
                {{ t('global.status.on') }}
              </span>
              <span v-else>{{ t('global.status.off') }}</span>
            </BFormCheckbox>
          </dd>
        </dl>
      </BCol>
    </BRow>
  </overview-card>
</template>

<script setup>
import { computed } from 'vue';
import OverviewCard from './OverviewCard.vue';
import SystemStore from '../../store/modules/HardwareStatus/SystemStore';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const systemStore = SystemStore();
systemStore.getSystem();
const systems = computed(() => {
  let systemData = systemStore.systems[0];
  return systemData ? systemData : {};
});
const toggleIdentifyLedSwitch = (state) => {
  systemStore.changeIdentifyLedState(state).catch(({ message }) => {
    console.log(message);
    // this.errorToast(message);
  });
};
</script>
