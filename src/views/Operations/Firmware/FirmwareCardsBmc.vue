<template>
  <div>
    <page-section :section-title="sectionTitle">
      <b-row class="row-cols-1 row-cols-md-2">
        <!-- Running image -->
        <b-col class="mb-3">
          <b-card class="h-100">
            <template #header>
              <p class="fw-bold m-0">
                {{ $t('pageFirmware.cardTitleRunning') }}
              </p>
            </template>
            <dl class="mb-0">
              <dt>{{ $t('pageFirmware.cardBodyVersion') }}</dt>
              <dd class="mb-0">{{ runningVersion }}</dd>
            </dl>
          </b-card>
        </b-col>

        <!-- Backup image -->
        <b-col class="mb-3">
          <b-card class="h-100">
            <template #header>
              <p class="fw-bold m-0">
                {{ $t('pageFirmware.cardTitleBackup') }}
              </p>
            </template>
            <dl>
              <dt>{{ $t('pageFirmware.cardBodyVersion') }}</dt>
              <dd>
                <status-icon v-if="showBackupImageStatus" status="danger" />
                <span
                  v-if="showBackupImageStatus"
                  class="visually-hidden-focusable"
                >
                  {{ backupStatus }}
                </span>
                {{ backupVersion }}
              </dd>
            </dl>
            <b-btn
              v-if="!switchToBackupImageDisabled"
              data-test-id="firmware-button-switchToRunning"
              variant="link"
              size="sm"
              class="py-0 px-1 mt-2"
              :disabled="isPageDisabled || !backup || !isServerOff"
              @click="showSwitchToRunning = true"
            >
              <icon-switch class="d-none d-sm-inline-block" />
              {{ $t('pageFirmware.cardActionSwitchToRunning') }}
            </b-btn>
          </b-card>
        </b-col>
      </b-row>
    </page-section>
    <modal-switch-to-running
      v-model="showSwitchToRunning"
      :backup="backupVersion"
      @ok="switchToRunning"
    />
  </div>
</template>

<script>
import IconSwitch from '@carbon/icons-vue/es/arrows--horizontal/20';
import PageSection from '@/components/Global/PageSection';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

import ModalSwitchToRunning from './FirmwareModalSwitchToRunning';
import i18n from '@/i18n';

export default {
  components: { IconSwitch, ModalSwitchToRunning, PageSection },
  mixins: [BVToastMixin, LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    clearTimeout(this._switchTimer);
    next();
  },
  props: {
    isPageDisabled: {
      required: true,
      type: Boolean,
      default: false,
    },
    isServerOff: {
      required: true,
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading,
      switchToBackupImageDisabled:
        import.meta.env.VITE_SWITCH_TO_BACKUP_IMAGE_DISABLED === 'true',
      showSwitchToRunning: false,
    };
  },
  computed: {
    isSingleFileUploadEnabled() {
      return this.$store.getters['firmware/isSingleFileUploadEnabled'];
    },
    sectionTitle() {
      if (this.isSingleFileUploadEnabled) {
        return i18n.global.t('pageFirmware.sectionTitleBmcCardsCombined');
      }
      return i18n.global.t('pageFirmware.sectionTitleBmcCards');
    },
    running() {
      return this.$store.getters['firmware/activeBmcFirmware'];
    },
    backup() {
      return this.$store.getters['firmware/backupBmcFirmware'];
    },
    runningVersion() {
      return this.running?.version || '--';
    },
    backupVersion() {
      return this.backup?.version || '--';
    },
    backupStatus() {
      return this.backup?.status || null;
    },
    showBackupImageStatus() {
      return (
        this.backupStatus === 'Critical' || this.backupStatus === 'Warning'
      );
    },
  },
  methods: {
    switchToRunning() {
      this.startLoader();

      // Step 1 - Switch firmware
      const switchFirmware = () => {
        this.infoToast(
          this.$t('pageFirmware.toast.switchToRunning.step1Message'),
          {
            title: this.$t('pageFirmware.toast.switchToRunning.step1'),
            timestamp: true,
          },
        );
        this.$store
          .dispatch('firmware/switchBmcFirmwareAndReboot')
          .then(() => bmcReboot())
          .catch(({ message }) => {
            this.endLoader();
            this.errorToast(message);
          });
      };

      // Step 2 - BMC Reboot
      const bmcReboot = () => {
        this.infoToast(
          this.$t('pageFirmware.toast.switchToRunning.step2Message'),
          {
            title: this.$t('pageFirmware.toast.switchToRunning.step2'),
            timestamp: true,
          },
        );
        const fail = () => {
          this.endLoader();
          this.errorToast(this.$t('pageFirmware.toast.errorSwitchImages'));
        };

        // Phase 1: Wait for the BMC to go offline (requests start failing).
        // The reboot was just issued but the BMC is still alive for a few
        // seconds, so a reachability check would succeed as a false positive
        // if polled immediately. Poll until a request *fails* first.
        const waitForOffline = (attempts = 0) => {
          if (attempts > 60) {
            // BMC never went offline — surface an error and stop.
            return fail();
          }
          try {
            this.$store
              .dispatch('global/getSystemInfo')
              .then(() => {
                // Still online — check again after 1s.
                this._switchTimer = setTimeout(
                  () => waitForOffline(attempts + 1),
                  1000,
                );
              })
              .catch(() => {
                // BMC is now offline — start polling for recovery.
                waitForOnline();
              });
          } catch {
            // Polling itself is broken (e.g. dispatch did not return a promise).
            fail();
          }
        };

        // Phase 2: Poll until the BMC responds again (BMC is back online).
        const waitForOnline = (attempts = 0) => {
          if (attempts > 10) {
            return fail();
          }
          try {
            this.$store
              .dispatch('global/getSystemInfo')
              .then(() => step3())
              .catch(() => {
                // Still offline — retry after 1 minute.
                this._switchTimer = setTimeout(
                  () => waitForOnline(attempts + 1),
                  60000,
                );
              });
          } catch {
            fail();
          }
        };

        waitForOffline();
      };

      // Step 3 - Firmware switch complete
      const step3 = () => {
        this._switchTimer = setTimeout(() => {
          this.endLoader();
          return this.infoToast(
            this.$t('pageFirmware.toast.switchToRunning.step3Message'),
            {
              title: this.$t('pageFirmware.toast.switchToRunning.step3'),
              refreshAction: true,
              timestamp: true,
            },
          );
          // Waiting for 2 minutes for the system to come to OS ready state
        }, 120000); // 2 minutes
      };

      switchFirmware();
    },
  },
};
</script>
