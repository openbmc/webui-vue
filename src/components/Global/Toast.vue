<template>
  <BToast
    v-model:show="showToast"
    :variant="statusPassed"
    class="toast-top-right"
    autoHideDelay="3000"
    :autoHide="autoHide"
  >
    <template #title>
      <div class="d-flex align-items-center">
        <status-icon :status="statusPassed" /> 
        <strong class='toast-icon'>{{ title }}</strong>
      </div>
    </template>
    <template #default> 
        <p class='mb-0'>{{ body }} </p>
        <p v-if="timestamp" class='mt-3 mb-0'>{{ formattedTimestamp }}</p>
        <p v-if="refreshAction">
          <BLink class="d-inline-block mt-3" @click="handleRefresh">
            {{ i18n.global.t('global.action.refresh') }}
          </BLink>
        </p>
    </template>
  </BToast>
</template>

<script setup>
import { ref, defineProps, computed } from 'vue';
import i18n from '@/i18n';
import StatusIcon from './StatusIcon.vue';
import { shortTimeZone, formatDate, formatTime } from '../utilities/dateFilter';

const { title, body, statusPassed, autoHide, timestamp, refreshAction } = defineProps({
  title: String,
  body: String,
  statusPassed: String,
  autoHide: Boolean,
  timestamp: Boolean,
  refreshAction: Boolean
});

const showToast = ref(false);


const formattedTimestamp = computed(() => {
  if (timestamp) {
    return formatTime(new Date());
  }
});

const handleRefresh = () => {
  $root.$emit('refresh-application');
};

</script>

<style scoped lang="scss">
@import '../../../node_modules/bootstrap/scss/_functions.scss';
@import '../../../node_modules/bootstrap/scss/_variables.scss';
@import '../../../node_modules/bootstrap/scss/_variables-dark.scss';
@import '../../../node_modules/bootstrap/scss/mixins';
.toast-top-right {
  top: 1rem;
  right: 1rem;
}
</style>
