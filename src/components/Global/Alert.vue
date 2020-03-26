<template>
  <b-alert :show="show" :variant="variant" :class="{ small }">
    <div v-if="variant == 'warning' || variant == 'danger'" class="alert-icon">
      <status-icon :status="variant" />
    </div>
    <div class="alert-content">
      <div class="alert-msg"><slot /></div>
    </div>
  </b-alert>
</template>

<script>
import StatusIcon from '../Global/StatusIcon';
import { BAlert } from 'bootstrap-vue';

export default {
  name: 'Alert',
  components: {
    BAlert: BAlert,
    StatusIcon: StatusIcon
  },
  props: {
    show: {
      type: Boolean,
      default: true
    },
    variant: {
      type: String,
      default: ''
    },
    small: Boolean
  }
};
</script>

<style lang="scss" scoped>
.alert.small {
  padding: $spacer / 2;
  font-size: 1rem;
}
</style>
