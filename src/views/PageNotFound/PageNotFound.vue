<template>
  <b-container fluid="xl">
    <page-title :description="$t('pagePageNotFound.description')" />
  </b-container>
</template>
<script>
import PageTitle from '@/components/Global/PageTitle';
export default {
  name: 'PageNotFound',
  components: { PageTitle },
};
</script>
