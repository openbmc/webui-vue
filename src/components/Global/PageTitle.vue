<template>
  <div class="page-title">
    <h1>{{ title }}</h1>
    <p v-if="description">{{ description }}</p>
  </div>
</template>

<script>
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
      // Get the route name and meta title
      const routeName = this.$route.name;
      if (routeName) {
        const camelCaseName = routeName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        const translationKey = `appPageTitle.${camelCaseName}`;
        // Check if translation exists, if so use it for reactivity
        if (this.$te(translationKey)) {
          return this.$t(translationKey);
        }
      }
      return this.$route.meta.title || routeName || '';
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
