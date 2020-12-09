<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    assetTag() {
      return this.$store.getters['global/assetTag'];
    },
  },
  watch: {
    assetTag: function (value) {
      if (value) {
        document.title =
          `${value} - ${this.$route.meta.title}` || 'Page is missing title';
      }
    },
    $route: function (to) {
      document.title = to.meta.title || 'Page is missing title';
      if (this.assetTag) {
        document.title =
          `${this.assetTag} - ${to.meta.title}` || 'Page is missing title';
      }
    },
  },
  created() {
    document.title = this.$route.meta.title || 'Page is missing title';
  },
};
</script>

<style lang="scss">
@import '@/assets/styles/_obmc-custom';
</style>
