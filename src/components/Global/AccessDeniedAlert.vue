<template>
  <b-row class="d-flex">
    <b-col sm="6">
      <alert
        variant="danger"
        :small="true"
        class="mt-4"
        v-bind="ariaLabel ? { 'aria-label': ariaLabel } : {}"
      >
        <p class="col-form-label">
          {{ $t('global.accessDeniedAlert.message') }}
        </p>
      </alert>
    </b-col>
  </b-row>
</template>

<script>
import Alert from '@/components/Global/Alert';

export default {
  name: 'AccessDeniedAlert',
  components: {
    Alert,
  },
  props: {
    // Optional label for screen readers to provide page-specific context,
    // e.g. "Serial Over LAN access denied".
    ariaLabel: {
      type: String,
      default: null,
    },
  },
};
</script>
