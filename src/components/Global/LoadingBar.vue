<template>
  <BTransition name="fade">
    <BProgress v-if="!isLoadingComplete.value">
      <BProgressBar
        :value="loadingIndicatorValue.value"
        aria-label="Loading Progress"
        animated
      />
    </BProgress>
  </BTransition>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, defineEmits, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import event from "../../EventBus";

const loadingIndicatorValue = ref(0);
const isLoadingComplete = ref(false);
const loadingIntervalId = ref(null);
const timeoutId = ref(null);
const emit = defineEmits();


const { t } = useI18n();

onMounted(() => {
  console.log('on mounted')
 event.on('loader-start', (payload) => {
  startLoadingInterval
  });
 event.on('loader-end', (payload) => {
  endLoadingInterval
  });
 event.on('loader-hide', (payload) => {
  hideLoadingBar
  });
});

const clearLoadingInterval = () => {
  if (loadingIntervalId.value) clearInterval(loadingIntervalId.value);
  loadingIntervalId.value = null;
};

const clearTimeout = () => {
  if (timeoutId.value) clearTimeout(timeoutId.value);
  timeoutId.value = null;
};

const startLoadingInterval = () => {
  console.log('started');
  clearLoadingInterval();
  clearTimeout();
  loadingIndicatorValue.value = 0;
  isLoadingComplete.value = false;
  event.emit('checkLoadingStatus', isLoadingComplete.value);
  loadingIntervalId.value = setInterval(() => {
    loadingIndicatorValue.value += 1;
    if (loadingIndicatorValue.value > 100) clearLoadingInterval();
  }, 100);
};

const endLoadingInterval = () => {
  console.log('ended');
  clearLoadingInterval();
  clearTimeout();
  loadingIndicatorValue.value = 100;
  timeoutId.value = setTimeout(() => {
    // Let animation complete before hiding
    // the loading bar
    isLoadingComplete.value = true;
    event.emit('checkLoadingStatus', isLoadingComplete.value);
  }, 1000);
};

const hideLoadingBar = () => {
  console.log('Hidden');
  clearLoadingInterval();
  clearTimeout();
  loadingIndicatorValue.value = 0;
  isLoadingComplete.value = true;
};

</script>
<style lang="scss" scoped>
.progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.4rem;
  opacity: 1;
  transition: opacity $duration--moderate-01 $standard-easing--productive;
  height: 0.4rem;

//   &.fade-enter-from, // This is vue3 based only class modified from 'fade-enter'
//   &.fade-leave-to {
//     opacity: 0;
//   }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
}
.progress-bar {
  background-color: $loading-color;
}
</style>