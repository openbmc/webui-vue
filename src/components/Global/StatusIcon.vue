<template>
  <span :class="['status-icon', status]">
    <icon-success v-if="status === 'success'" />
    <icon-danger v-else-if="status === 'danger'" />
    <icon-secondary v-else />
  </span>
</template>

<script>
import IconCheckmark from '@carbon/icons-vue/es/checkmark--filled/20';
import IconWarning from '@carbon/icons-vue/es/warning--filled/20';
import IconError from '@carbon/icons-vue/es/error--filled/20';

export default {
  name: 'StatusIcon',
  components: {
    iconSuccess: IconCheckmark,
    iconDanger: IconWarning,
    iconSecondary: IconError
  },
  props: {
    status: {
      type: String,
      default: ''
    }
  }
};
</script>

<style lang="scss" scoped>
.status-icon {
  vertical-align: text-bottom;
  &.success {
    fill: $success;
  }
  &.danger {
    fill: $danger;
  }
  &.secondary {
    fill: $secondary;
  }
}
</style>
