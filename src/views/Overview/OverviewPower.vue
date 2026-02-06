<template>
  <overview-card
    :title="$t('pageOverview.powerInformation')"
    :to="`/resource-management/power`"
  >
    <b-row class="mt-3">
      <b-col sm="6">
        <dl>
          <dt>{{ $t('pageOverview.powerConsumption') }}</dt>
          <dd v-if="powerConsumptionValue == null">
            {{ $t('global.status.notAvailable') }}
          </dd>
          <dd v-else>{{ powerConsumptionValue }} W</dd>
          <dt>{{ $t('pageOverview.powerCap') }}</dt>
          <dd v-if="displayPowerCapValue == null">
            {{ $t('global.status.disabled') }}
          </dd>
          <dd v-else>{{ displayPowerCapValue }} W</dd>
        </dl>
      </b-col>
    </b-row>
  </overview-card>
</template>

<script setup>
import { watch, computed } from 'vue';
import OverviewCard from './OverviewCard';
import { usePowerControl } from '@/components/Composables/usePowerControl';
import eventBus from '@/eventBus';

const { powerConsumptionValue, powerControlData, query } = usePowerControl();

const displayPowerCapValue = computed(() => {
  const data = powerControlData.value;
  if (!data || data.powerControlMode !== 'Automatic') return null;
  return data.powerCapValue ?? null;
});

watch(
  () => query.isFetching.value,
  (isFetching) => {
    if (!isFetching) eventBus.$emit('overview-power-complete');
  },
  { immediate: true },
);
</script>
