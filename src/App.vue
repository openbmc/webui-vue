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
  },
  watch: {
    assetTag: function (tag) {
      if (tag) {
        document.title = `${tag} - ${this.$route.meta.title}`;
      }
    },
    $route: function (to) {
      document.title = to.meta.title || 'Page is missing title';
      if (this.assetTag) {
        document.title = `${this.assetTag} - ${to.meta.title}`;
      }
    },
  },
  getters: {},
  created() {
    document.title = '';
    //document.title = this.$route.meta.title || 'Page is missing title';
  },
};
</script>

<style lang="scss">
@import '@/assets/styles/_obmc-custom';
</style>
