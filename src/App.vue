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
import { getRoutePageTitle } from '@/i18n';

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
      const title = getRoutePageTitle(
        this.$route,
        this.$t,
        this.$te,
        this.$t('global.pageTitle.missing'),
      );
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
