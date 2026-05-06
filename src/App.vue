<template>
  <div id="app">
    <router-view />
    <confirm-modal />
    <b-orchestrator />
  </div>
</template>

<script>
import ConfirmModal from '@/components/Global/ConfirmModal.vue';
import { BOrchestrator } from 'bootstrap-vue-next';

export default {
  name: 'App',
  components: { ConfirmModal, BOrchestrator },
  computed: {
    assetTag() {
      return '';
      //return this.$store.getters['global/assetTag'];
    },
    currentLocale() {
      return this.$i18n.locale;
    },
  },
  watch: {
    assetTag: function (tag) {
      if (tag) {
        this.updateDocumentTitle();
      }
    },
    $route: function () {
      this.updateDocumentTitle();
    },
    currentLocale() {
      this.updateDocumentTitle();
    },
  },
  created() {
    this.updateDocumentTitle();
  },
  methods: {
    updateDocumentTitle() {
      const routeName = this.$route.name;
      let title = '';
      // Convert route name to translation key (kebab-case to camelCase)
      if (routeName) {
        const camelCaseName = routeName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        const translationKey = `appPageTitle.${camelCaseName}`;
        if (this.$te(translationKey)) {
          title = this.$t(translationKey);
        } else {
          title = this.$route.meta.title || 'Page is missing title';
        }
      } else {
        title = this.$route.meta.title || 'Page is missing title';
      }
      if (this.assetTag) {
        document.title = `${this.assetTag} - ${title}`;
      } else {
        document.title = title;
      }
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/styles/_obmc-custom';
</style>
