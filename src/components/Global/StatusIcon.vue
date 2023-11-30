<template>
  <span :class="['status-icon', status]">
    <icon-info v-if="status === 'info'" />
    <icon-success v-else-if="status === 'success'" />
    <icon-warning v-else-if="status === 'warning'" />
    <icon-danger v-else-if="status === 'danger'" />
    <icon-secondary v-else />
  </span>
</template>

<script setup>
import IconInfo from '@carbon/icons-vue/es/information--filled/20';
import IconSuccess from '@carbon/icons-vue/es/checkmark--filled/20';
import IconWarning from '@carbon/icons-vue/es/warning--filled/20';
import IconSecondary from '@carbon/icons-vue/es/error--filled/20';
import IconDanger from '@carbon/icons-vue/es/misuse/20';

const props = defineProps(['status']);
</script>

<style lang="scss" scoped>
.status-icon {
  vertical-align: text-bottom;

  &.info {
    color: #2d60e5;
  }
  &.success {
    color: #0a7d06;
  }
  &.danger {
    color: #da1416;
  }
  &.secondary {
    color: gray('600');
    transform: rotate(-45deg);
  }
  &.warning {
    color: #efc100;
  }

  svg {
    fill: currentColor;
  }
}
</style>
