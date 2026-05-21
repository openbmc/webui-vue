<template>
  <b-row class="d-flex">
    <b-col sm="6">
      <alert variant="danger" :small="true" class="mt-4">
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
};
</script>
