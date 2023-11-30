<template>
  <overview-card
    :title="t('pageOverview.powerInformation')"
    :to="`/resource-management/power`"
  >
    <BRow class="mt-3">
      <BCol sm="6">
        <dl>
          <dt>{{ t('pageOverview.powerConsumption') }}</dt>
          <dd v-if="powerConsumptionValue == null">
            {{ t('global.status.notAvailable') }}
          </dd>
          <dd v-else>{{ powerConsumptionValue }} W</dd>
          <dt>{{ t('pageOverview.powerCap') }}</dt>
          <dd v-if="powerCapValue == null">
            {{ t('global.status.disabled') }}
          </dd>
          <dd v-else>{{ powerCapValue }} W</dd>
        </dl>
      </BCol>
    </BRow>
  </overview-card>
</template>

<script setup>
import { computed } from 'vue';
import OverviewCard from './OverviewCard.vue';
import PowerControlStore from '../../store/modules/ResourceManagement/PowerControlStore';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const powerControlStore = PowerControlStore();
powerControlStore.getPowerControl();
const powerCapValue = computed(() => {
  return powerControlStore.powerCapValue;
});
const powerConsumptionValue = computed(() => {
  return powerControlStore.powerConsumptionValue;
});
</script>
