<template>
  <transition name="fade">
    <b-progress v-if="!isLoadingComplete">
      <b-progress-bar
        striped
        animated
        :value="loadingIndicatorValue"
        :aria-label="$t('global.ariaLabel.progressBar')"
      />
    </b-progress>
  </transition>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useIsFetching, useIsMutating } from '@tanstack/vue-query';

import eventBus from '@/eventBus';

const loadingIndicatorValue = ref(0);
const isLoadingComplete = ref(true);

let loadingIntervalId: ReturnType<typeof setInterval> | null = null;
let timeoutId: ReturnType<typeof setTimeout> | null = null;

// Manual loading (legacy) can be triggered via the event bus.
const manualLoadingCount = ref(0);

const isFetchingCount = useIsFetching();
const isMutatingCount = useIsMutating();

const isBusy = computed(
  () =>
    manualLoadingCount.value > 0 ||
    isFetchingCount.value > 0 ||
    isMutatingCount.value > 0,
);

function clearLoadingInterval() {
  if (loadingIntervalId) clearInterval(loadingIntervalId);
  loadingIntervalId = null;
}

function clearHideTimeout() {
  if (timeoutId) globalThis.clearTimeout(timeoutId);
  timeoutId = null;
}

function startLoadingInterval() {
  clearLoadingInterval();
  clearHideTimeout();
  loadingIndicatorValue.value = 0;
  isLoadingComplete.value = false;
  loadingIntervalId = setInterval(() => {
    loadingIndicatorValue.value += 1;
    if (loadingIndicatorValue.value > 100) clearLoadingInterval();
  }, 100);
}

function endLoadingInterval() {
  clearLoadingInterval();
  clearHideTimeout();
  loadingIndicatorValue.value = 100;
  timeoutId = setTimeout(() => {
    // Let animation complete before hiding the loading bar
    isLoadingComplete.value = true;
  }, 1000);
}

function hideLoadingBar() {
  clearLoadingInterval();
  clearHideTimeout();
  loadingIndicatorValue.value = 0;
  isLoadingComplete.value = true;
}

const handleLoaderStart = () => {
  manualLoadingCount.value += 1;
};
const handleLoaderEnd = () => {
  manualLoadingCount.value = Math.max(0, manualLoadingCount.value - 1);
};
const handleLoaderHide = () => {
  manualLoadingCount.value = 0;
  hideLoadingBar();
};

onMounted(() => {
  eventBus.on('loader-start', handleLoaderStart);
  eventBus.on('loader-end', handleLoaderEnd);
  eventBus.on('loader-hide', handleLoaderHide);
});

onBeforeUnmount(() => {
  eventBus.off('loader-start', handleLoaderStart);
  eventBus.off('loader-end', handleLoaderEnd);
  eventBus.off('loader-hide', handleLoaderHide);
});

watch(
  isBusy,
  (nowBusy, wasBusy) => {
    if (nowBusy && !wasBusy) startLoadingInterval();
    if (!nowBusy && wasBusy) endLoadingInterval();
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.progress {
  position: relative;
  top: 0px;
  left: 0;
  right: 0;
  bottom: -0.4rem;
  opacity: 1;
  transition: opacity $duration--moderate-01 $standard-easing--productive;
  height: 0.4rem;

  &.fade-enter, // Remove this vue2 based only class when switching to vue3
  &.fade-enter-from, // This is vue3 based only class modified from 'fade-enter'
  &.fade-leave-to {
    opacity: 0;
  }
}
.progress-bar {
  background-color: $loading-color;
}
</style>
