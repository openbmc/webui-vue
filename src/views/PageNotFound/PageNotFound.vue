<template>
  <b-container fluid="xl">
    <page-title :description="$t('pagePageNotFound.description')" />
  </b-container>
</template>
<script>
import PageTitle from '@/components/Global/PageTitle';
import { useI18n } from 'vue-i18n';

export default {
  name: 'PageNotFound',
  components: { PageTitle },
  data() {
    return {
      $t: useI18n().t,
    };
  },
};
</script>
