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
import { watch, computed, ref } from 'vue';
import OverviewCard from './OverviewCard';
import { usePowerControl } from '@/components/Composables/usePowerControl';
import eventBus from '@/eventBus';

const { powerConsumptionValue, environmentMetrics, metricsQuery } =
  usePowerControl();

const displayPowerCapValue = computed(() => {
  const data = environmentMetrics.value;
  if (!data) return null;
  
  const controlMode = data.PowerLimitWatts?.ControlMode;
  // Show power cap value for active control modes: Automatic, Manual, and Override
  const isActiveMode =
    controlMode === 'Automatic' ||
    controlMode === 'Manual' ||
    controlMode === 'Override';
  
  if (!isActiveMode) return null;
  return data.PowerLimitWatts?.SetPoint ?? null;
});

// Track if we've already emitted the completion event to prevent multiple emissions
const emitted = ref(false);

watch(
  () => [
    metricsQuery.isFetching.value,
    metricsQuery.isLoading.value,
    metricsQuery.isFetched.value,
    metricsQuery.fetchStatus.value,
  ],
  ([isFetching, isLoading, isFetched, fetchStatus]) => {
    const settled =
      !isFetching && (isFetched || (fetchStatus === 'idle' && !isLoading));
    if (settled && !emitted.value) {
      emitted.value = true;
      eventBus.$emit('overview-power-complete');
    }
  },
  { immediate: true },
);
</script>
