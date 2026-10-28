<template>
  <alert variant="danger" role="alert" data-test-id="query-error-state">
    {{ $t('global.queryError.loadFailed') }}
  </alert>
</template>

<script>
import Alert from '@/components/Global/Alert';

export default {
  name: 'QueryErrorState',
  components: { Alert },
};
</script>
