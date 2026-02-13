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
import Cookies from 'js-cookie';

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
    setTimeout(() => {
      if (
        Cookies.get('XSRF-TOKEN') &&
        Cookies.get('loginSessionSuccess') === 'false' &&
        window.location.href.indexOf('/redfish/v1') != -1
      ) {
        this.$bvModal.msgBoxOk(
          this.$tc('global.action.same_session_running_infomation'),
        );
      }
    }, 2000); // wait to read the XSRF-TOKEN
  },
  beforeUnmount() {
    window.removeEventListener('beforeunload', this.handleRefresh);
  },
  methods: {
    // Perform logout or any other actions needed before unload
    // This function will be called before the page is unloaded or refreshed
    handleRefresh(event) {
      if (
        window.location.href.indexOf('/redfish/v1') != -1
      ) {
        if (event.srcElement.URL.indexOf('login') == -1) {
          console.log('event:', event);
          store.dispatch('authentication/logout');
          //Due to firefox browser behaviour keep busy the browser to logout
          if (
            window.navigator.userAgent.toLowerCase().indexOf('firefox') != -1
          ) {
            for (let i = 0; i <= 1000; i++) {
              console.log();
            }
          }
        }
      }
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/styles/_obmc-custom';
</style>
