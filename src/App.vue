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
    toast() {
      return this.$store.getters['toast'];
    },
  },
  watch: {
    assetTag: function (tag) {
      if (tag) {
        document.title = `${tag} - ${this.$route.meta.title}`;
      }
    },
    toast: function ({ text, options, button: { title, click } }) {
      const btn = this.$createElement(
        'b-button',
        {
          on: {
            click: () => {
              this.$bvToast.hide(options.id);
              click();
            },
          },
        },
        title
      );
      this.$bvToast.toast([text, btn], options);
    },
    $route: function (to) {
      document.title = to.meta.title || 'Page is missing title';
      if (this.assetTag) {
        document.title = `${this.assetTag} - ${to.meta.title}`;
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
