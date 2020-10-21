<template>
  <span :class="['status-icon', status]">
    <icon-info v-if="status === 'info'" />
    <icon-success v-else-if="status === 'success'" />
    <icon-warning v-else-if="status === 'warning'" />
    <icon-danger v-else-if="status === 'danger'" />
    <icon-secondary v-else />
  </span>
</template>

<script>
import IconInfo from '@carbon/icons-vue/es/information--filled/20';
import IconCheckmark from '@carbon/icons-vue/es/checkmark--filled/20';
import IconWarning from '@carbon/icons-vue/es/warning--filled/20';
import IconError from '@carbon/icons-vue/es/error--filled/20';
import IconMisuse from '@carbon/icons-vue/es/misuse/20';

export default {
  name: 'StatusIcon',
  components: {
    IconInfo: IconInfo,
    iconSuccess: IconCheckmark,
    iconDanger: IconMisuse,
    iconSecondary: IconError,
    iconWarning: IconWarning,
  },
  props: {
    status: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>
.status-icon {
  vertical-align: text-bottom;

  &.info {
    color: theme-color('info');
  }
  &.success {
    color: theme-color('success');
  }
  &.danger {
    color: theme-color('danger');
  }
  &.secondary {
    color: gray('600');
    transform: rotate(-45deg);
  }
  &.warning {
    color: theme-color('warning');
  }

  svg {
    fill: currentColor;
  }
}
</style>
