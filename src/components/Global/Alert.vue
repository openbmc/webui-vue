<template>
  <b-alert :show="show" :variant="variant">
    <div v-if="variant == 'warning' || variant == 'danger'" class="alert-icon">
      <icon-warning v-if="variant === 'warning'" />
      <icon-danger v-else-if="variant === 'danger'" />
    </div>
    <div class="alert-content">
      <strong v-if="title" class="alert-title">{{ title }}</strong>
      <div class="alert-msg"><slot /></div>
    </div>
  </b-alert>
</template>

<script>
import IconWarning from '@carbon/icons-vue/es/warning--filled/20';
import IconError from '@carbon/icons-vue/es/error--filled/20';
import { BAlert } from 'bootstrap-vue';

export default {
  name: 'Alert',
  components: {
    BAlert: BAlert,
    iconDanger: IconError,
    iconWarning: IconWarning
  },
  props: {
    show: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: ''
    }
  }
};
</script>
