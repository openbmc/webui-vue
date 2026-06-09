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
    bootProgress() {
      return this.$store.getters['global/bootProgress'];
    },
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
        if (!this.isReadonly) {
          this.infoToast(
            this.$t('pageFirmware.toast.switchToRunning.step1Message'),
            {
              title: this.$t('pageFirmware.toast.switchToRunning.step1'),
              timestamp: true,
            }
          );
        }
        this.$store
          .dispatch('firmware/switchBmcFirmwareAndReboot')
          .then(async () => bmcReboot())
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
          }
        );
        const timer = (checkCounter = 0) => {
          checkCounter++;

          // This counter goes up by 1 every time this function runs
          // If the function successfully goes to last toast, it won't run anymore
          // if this function runs more than 10 times, it won't run anymore
          if (checkCounter > 10) {
            this.endLoader();
            return this.errorToast(
              this.$t('pageFirmware.toast.errorSwitchImages')
            );
          }

          this.$store.dispatch('global/getBootProgress').then(() => {
            if (this.bootProgress) {
              step3();
            } else {
              setTimeout(() => {
                timer(checkCounter);
              }, 60000); // 1 minute;
            }
          });
        };
        timer();
      };

      // Step 3 - Firmware switch complete
      const step3 = () => {
        setTimeout(() => {
          this.endLoader();
          return this.infoToast(
            this.$t('pageFirmware.toast.switchToRunning.step3Message'),
            {
              title: this.$t('pageFirmware.toast.switchToRunning.step3'),
              refreshAction: true,
              timestamp: true,
            }
          );
        }, 120000); // 2 minutes
      };

      switchFirmware();
    },
  },
};
</script>
