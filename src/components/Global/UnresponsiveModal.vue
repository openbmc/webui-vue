<template>
  <div v-if="visible">
    <div
      class="modal show d-block"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
    >
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title mb-0">
              {{ $t('global.status.warning') }}
            </h2>
          </div>
          <div class="modal-body">
            <p class="mb-3">
              {{ $t('global.offline.serverUnresponsive') }}
            </p>
            <p class="mb-3">
              {{
                $t('global.offline.redirectInSeconds', {
                  seconds: countdown,
                })
              }}
            </p>
            <p class="mb-0">
              {{ $t('global.offline.okToRetryCancelToLogin') }}
            </p>
          </div>
          <div class="modal-footer">
            <b-button variant="secondary" @click="logout">
              {{ $t('global.action.logOut') }}
            </b-button>
            <b-button variant="primary" @click="retry">
              {{ $t('global.action.tryAgain') }}
            </b-button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { useI18n } from 'vue-i18n';

export default {
  name: 'UnresponsiveModal',
  data() {
    return { $t: useI18n().t };
  },
  computed: {
    ...mapState('global', [
      'unresponsiveModalVisible',
      'unresponsiveCountdownSeconds',
    ]),
    visible() {
      return this.unresponsiveModalVisible;
    },
    countdown() {
      return this.unresponsiveCountdownSeconds;
    },
  },
  methods: {
    async retry() {
      const ok = await this.$store.dispatch('global/tryReconnect');
      if (!ok) return;
    },
    logout() {
      this.$store.dispatch('authentication/logout');
    },
  },
};
</script>
