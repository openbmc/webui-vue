<template>
  <div class="page-title">
    <h1>{{ title }}</h1>
    <p v-if="description">{{ description }}</p>
  </div>
</template>

<script>
import { getRoutePageTitle } from '@/i18n';

export default {
  name: 'PageTitle',
  props: {
    description: {
      type: String,
      default: '',
    },
  },
  computed: {
    title() {
      return getRoutePageTitle(this.$route, this.$t, this.$te);
    },
  },
};
</script>

<style lang="scss" scoped>
.page-title {
  margin-bottom: $spacer * 2;
}
p {
  max-width: 72ch;
}
</style>
