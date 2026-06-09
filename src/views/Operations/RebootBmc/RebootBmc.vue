<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col md="8" lg="8" xl="6">
        <page-section>
          <b-row>
            <b-col>
              <dl>
                <dt>
                  {{ $t('pageRebootBmc.lastReboot') }}
                </dt>
                <dd v-if="lastBmcRebootTime">
                  {{ $filters.formatDate(lastBmcRebootTime) }}
                  {{ $filters.formatTime(lastBmcRebootTime) }}
                </dd>
                <dd v-else>--</dd>
              </dl>
            </b-col>
          </b-row>
          {{ $t('pageRebootBmc.rebootInformation') }}
          <b-button
            variant="primary"
            class="d-block mt-5"
            data-test-id="rebootBmc-button-reboot"
            @click="onClick"
          >
            {{ $t('pageRebootBmc.rebootBmc') }}
          </b-button>
        </page-section>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import i18n from '@/i18n';
import { useModal } from 'bootstrap-vue-next';

export default {
  name: 'RebootBmc',
  components: { PageTitle, PageSection },
  mixins: [BVToastMixin, LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    clearTimeout(this._rebootTimer);
    next();
  },
  setup() {
    const bvModal = useModal();
    return { bvModal };
  },
  computed: {
    lastBmcRebootTime() {
      return this.$store.getters['controls/lastBmcRebootTime'];
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('controls/getLastBmcRebootTime')
      .finally(() => this.endLoader());
  },
  methods: {
    onClick() {
      this.$confirm(i18n.global.t('pageRebootBmc.modal.confirmMessage'), {
        title: i18n.global.t('pageRebootBmc.modal.confirmTitle'),
        okTitle: i18n.global.t('global.action.confirm'),
        cancelTitle: i18n.global.t('global.action.cancel'),
        autoFocusButton: 'ok',
      }).then((confirmed) => {
        if (confirmed) this.rebootBmc();
      });
    },
    rebootBmc() {
      this.startLoader();
      this.$store
        .dispatch('controls/rebootBmc')
        .then((message) => {
          // Start checking for BMC reboot completion
          this.checkBmcRebootCompletion(message);
        })
        .catch(({ message }) => {
          this.errorToast(message);
          this.endLoader();
        });
    },
    checkBmcRebootCompletion(message) {
      this.infoToast(message);

      // Phase 1: Wait for the BMC to go offline (requests start failing).
      // The reboot command was just issued but the BMC is still alive for a
      // few seconds, so a reachability check would succeed as a false
      // positive if polled immediately. Poll until a request *fails* first.
      const waitForOffline = (attempts = 0) => {
        if (attempts > 60) {
          // BMC never went offline — surface an error and stop.
          this.endLoader();
          return this.errorToast(
            i18n.global.t('pageRebootBmc.toast.errorRebootStart')
          );
        }
        this.$store
          .dispatch('global/getSystemInfo')
          .then(() => {
            // Still online — check again after 1s.
            this._rebootTimer = setTimeout(
              () => waitForOffline(attempts + 1),
              1000
            );
          })
          .catch(() => {
            // BMC is now offline — start polling for recovery.
            waitForOnline();
          });
      };

      // Phase 2: Poll until the BMC responds again (BMC is back online).
      const waitForOnline = (attempts = 0) => {
        if (attempts > 10) {
          this.endLoader();
          return this.errorToast(
            i18n.global.t('pageRebootBmc.toast.errorRebootStart')
          );
        }
        this.$store
          .dispatch('global/getSystemInfo')
          .then(() => {
            this.infoToast(
              i18n.global.t('pageRebootBmc.toast.successRebootCompleted')
            );
            this.endLoader();
          })
          .catch(() => {
            // Still offline — retry after 1 minute.
            this._rebootTimer = setTimeout(
              () => waitForOnline(attempts + 1),
              60000
            );
          });
      };

      waitForOffline();
    },
  },
};
</script>

<style lang="scss" scoped></style>
