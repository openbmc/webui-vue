<template>
  <div>
    <page-section :section-title="sectionTitle">
      <b-card-group deck>
        <!-- Running image -->
        <b-card>
          <template #header>
            <p class="font-weight-bold m-0">
              {{ $t('pageFirmware.singleFileUpload.cardTitleRunning') }}
            </p>
          </template>
          <dl class="mb-0">
            <dt>{{ $t('pageFirmware.singleFileUpload.cardBodyVersion') }}</dt>
            <dd class="mb-0">{{ runningVersion }}</dd>
          </dl>
        </b-card>

        <!-- Backup image -->
        <b-card>
          <template #header>
            <p class="font-weight-bold m-0">
              {{ $t('pageFirmware.singleFileUpload.cardTitleBackup') }}
            </p>
          </template>
          <dl>
            <dt>{{ $t('pageFirmware.singleFileUpload.cardBodyVersion') }}</dt>
            <dd>
              <status-icon v-if="showBackupImageStatus" status="danger" />
              <span v-if="showBackupImageStatus" class="sr-only">
                {{ backupStatus }}
              </span>
              {{ backupVersion }}
            </dd>
          </dl>
          <b-btn
            v-b-modal.modal-switch-to-running
            data-test-id="firmware-button-switchToRunning"
            variant="link"
            size="sm"
            class="py-0 px-1 mt-2"
            :disabled="isPageDisabled || !backup"
          >
            <icon-switch class="d-none d-sm-inline-block" />
            {{ $t('pageFirmware.singleFileUpload.cardActionSwitchToRunning') }}
          </b-btn>
        </b-card>
      </b-card-group>
    </page-section>
    <modal-switch-to-running :backup="backupVersion" @ok="switchToRunning" />
  </div>
</template>

<script>
import IconSwitch from '@carbon/icons-vue/es/arrows--horizontal/20';
import PageSection from '@/components/Global/PageSection';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

import ModalSwitchToRunning from './FirmwareModalSwitchToRunning';

export default {
  components: { IconSwitch, ModalSwitchToRunning, PageSection },
  mixins: [BVToastMixin, LoadingBarMixin],
  props: {
    isPageDisabled: {
      required: true,
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading,
    };
  },
  computed: {
    isSingleFileUploadEnabled() {
      return this.$store.getters[
        'firmwareSingleImage/isSingleFileUploadEnabled'
      ];
    },
    sectionTitle() {
      if (this.isSingleFileUploadEnabled) {
        return this.$t(
          'pageFirmware.singleFileUpload.sectionTitleBmcCardsCombined'
        );
      }
      return this.$t('pageFirmware.singleFileUpload.sectionTitleBmcCards');
    },
    running() {
      return this.$store.getters['firmwareSingleImage/activeBmcFirmware'];
    },
    backup() {
      return this.$store.getters['firmwareSingleImage/backupBmcFirmware'];
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
      const timerId = setTimeout(() => {
        this.endLoader();
        this.infoToast(
          this.$t('pageFirmware.singleFileUpload.toast.verifySwitchMessage'),
          {
            title: this.$t('pageFirmware.singleFileUpload.toast.verifySwitch'),
            refreshAction: true,
          }
        );
      }, 60000);

      this.$store
        .dispatch('firmwareSingleImage/switchFirmwareAndReboot')
        .then(() =>
          this.infoToast(
            this.$t('pageFirmware.singleFileUpload.toast.rebootStartedMessage'),
            {
              title: this.$t(
                'pageFirmware.singleFileUpload.toast.rebootStarted'
              ),
            }
          )
        )
        .catch(({ message }) => {
          this.errorToast(message);
          clearTimeout(timerId);
          this.endLoader();
        });
    },
  },
};
</script>
