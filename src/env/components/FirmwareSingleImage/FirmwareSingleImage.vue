<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageFirmware.pageDescriptionSingleImage')" />
    <!-- Operation in progress alert -->
    <alert v-if="isOperationInProgress" variant="info" class="mb-5">
      <p>
        {{ $t('pageFirmware.alert.operationInProgress') }}
      </p>
    </alert>
    <!-- Shutdown server warning alert -->
    <alert v-else-if="!isHostOff" variant="warning" class="mb-5">
      <p class="font-weight-bold mb-1">
        {{ $t('pageFirmware.alert.serverShutdownRequiredBeforeUpdate') }}
      </p>
      {{ $t('pageFirmware.alert.serverShutdownRequiredInfo') }}
      <template #action>
        <b-btn variant="link" class="text-nowrap" @click="onClickShutDown">
          {{ $t('pageFirmware.alert.shutDownServer') }}
        </b-btn>
      </template>
    </alert>
    <b-row class="mb-4">
      <!-- Firmware on system -->
      <b-col md="10" lg="12" xl="8" class="pr-xl-4">
        <page-section :section-title="$t('pageFirmware.firmwareOnSystem')">
          <b-card-group deck>
            <!-- Current FW -->
            <b-card header-bg-variant="success">
              <template #header>
                <dl class="mb-0">
                  <dt>{{ $t('pageFirmware.current') }}</dt>
                  <dd class="mb-0">{{ systemFirmwareVersion }}</dd>
                </dl>
              </template>
              <b-row>
                <b-col xs="6">
                  <dl class="my-0">
                    <dt>{{ $t('pageFirmware.bmcStatus') }}</dt>
                    <dd>{{ $t('pageFirmware.running') }}</dd>
                  </dl>
                </b-col>
                <b-col xs="6">
                  <dl class="my-0">
                    <dt>{{ $t('pageFirmware.hostStatus') }}</dt>
                    <dd v-if="hostStatus === 'on'">
                      {{ $t('global.status.on') }}
                    </dd>
                    <dd v-else-if="hostStatus === 'off'">
                      {{ $t('global.status.off') }}
                    </dd>
                    <dd v-else>
                      {{ $t('global.status.notAvailable') }}
                    </dd>
                  </dl>
                </b-col>
              </b-row>
            </b-card>

            <!-- Backup FW -->
            <b-card>
              <template #header>
                <dl class="mb-0">
                  <dt>{{ $t('pageFirmware.backup') }}</dt>
                  <dd class="mb-0">{{ backupFirmwareVersion }}</dd>
                </dl>
              </template>
              <b-row>
                <b-col xs="6">
                  <dl class="my-0">
                    <dt>{{ $t('pageFirmware.state') }}</dt>
                    <dd>{{ backupFirmwareStatus }}</dd>
                  </dl>
                </b-col>
              </b-row>
            </b-card>
          </b-card-group>
        </page-section>

        <!-- Change to backup image -->
        <page-section :section-title="$t('pageFirmware.changeToBackupImage')">
          <dl class="mb-5">
            <dt>
              {{ $t('pageFirmware.backupImage') }}
            </dt>
            <dd>{{ backupFirmwareVersion }}</dd>
          </dl>
          <b-btn
            v-b-modal.modal-reboot-backup
            type="button"
            variant="primary"
            :disabled="isPageDisabled || !isRebootFromBackupAvailable"
          >
            {{ $t('pageFirmware.changeAndRebootBmc') }}
          </b-btn>
        </page-section>
      </b-col>

      <!-- Update code -->
      <b-col sm="8" xl="4" class="update-code pl-xl-4">
        <page-section :section-title="$t('pageFirmware.updateCode')">
          <b-form @submit.prevent="onSubmitUpload">
            <b-form-group
              :label="$t('pageFirmware.form.uploadLocation')"
              :disabled="isPageDisabled"
            >
              <b-form-radio v-model="isWorkstationSelected" :value="true">
                {{ $t('pageFirmware.form.workstation') }}
              </b-form-radio>
              <b-form-radio v-model="isWorkstationSelected" :value="false">
                {{ $t('pageFirmware.form.tftpServer') }}
              </b-form-radio>
            </b-form-group>

            <!-- Workstation Upload -->
            <template v-if="isWorkstationSelected">
              <b-form-group
                :label="$t('pageFirmware.form.imageFile')"
                label-for="image-file"
              >
                <b-form-text id="image-file-help-block">
                  {{ $t('pageFirmware.form.onlyTarFilesAccepted') }}
                </b-form-text>
                <b-form-file
                  id="image-file"
                  v-model="file"
                  accept=".tar"
                  aria-describedby="image-file-help-block"
                  :browse-text="$t('global.fileUpload.browseText')"
                  :drop-placeholder="$t('global.fileUpload.dropPlaceholder')"
                  :placeholder="$t('global.fileUpload.placeholder')"
                  :disabled="isPageDisabled"
                  :state="getValidationState($v.file)"
                  @input="$v.file.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  {{ $t('global.form.required') }}
                </b-form-invalid-feedback>
              </b-form-group>
            </template>

            <!-- TFTP Server Upload -->
            <template v-else>
              <b-form-group
                :label="$t('pageFirmware.form.tftpServerAddress')"
                label-for="tftp-ip"
              >
                <b-form-text id="server-address-help-block">
                  {{ $t('pageFirmware.form.tftpServerAddressHelper') }}
                </b-form-text>
                <b-form-input
                  id="tftp-id"
                  v-model="tftpIpAddress"
                  type="text"
                  :state="getValidationState($v.tftpIpAddress)"
                  :disabled="isPageDisabled"
                  aria-describedby="server-address-help-block"
                  @input="$v.tftpIpAddress.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  {{ $t('global.form.fieldRequired') }}
                </b-form-invalid-feedback>
              </b-form-group>
              <b-form-group
                :label="$t('pageFirmware.form.imageFileName')"
                label-for="tftp-file-name"
              >
                <b-form-input
                  id="tftp-file-name"
                  v-model="tftpFileName"
                  type="text"
                  :state="getValidationState($v.tftpFileName)"
                  :disabled="isPageDisabled"
                  @input="$v.tftpFileName.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  {{ $t('global.form.fieldRequired') }}
                </b-form-invalid-feedback>
              </b-form-group>
            </template>

            <!-- Info alert -->
            <alert variant="info" class="mt-4 mb-5">
              <p class="font-weight-bold mb-1">
                {{ $t('pageFirmware.alert.updateProcess') }}
              </p>
              <p>{{ $t('pageFirmware.alert.updateProcessInfoSingleImage') }}</p>
            </alert>
            <b-form-group>
              <b-btn type="submit" variant="primary" :disabled="isPageDisabled">
                {{ $t('pageFirmware.form.uploadAndRebootBmc') }}
              </b-btn>
            </b-form-group>
          </b-form>
        </page-section>
      </b-col>
    </b-row>

    <!-- Modals -->
    <modal-upload @ok="uploadFirmware" />
    <modal-reboot-backup
      :current="systemFirmwareVersion"
      :backup="backupFirmwareVersion"
      @ok="rebootFromBackup"
    />
  </b-container>
</template>

<script>
import { requiredIf } from 'vuelidate/lib/validators';
import { mapGetters } from 'vuex';

import PageSection from '@/components/Global/PageSection';
import PageTitle from '@/components/Global/PageTitle';
import Alert from '@/components/Global/Alert';
import ModalUpload from './FirmwareSingleImageModalUpload';
import ModalRebootBackup from './FirmwareSingleImageModalRebootBackup';

import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

export default {
  name: 'FirmwareSingleImage',
  components: {
    Alert,
    ModalRebootBackup,
    ModalUpload,
    PageSection,
    PageTitle,
  },
  mixins: [BVToastMixin, LoadingBarMixin, VuelidateMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    this.clearRebootTimeout();
    next();
  },
  data() {
    return {
      isWorkstationSelected: true,
      file: null,
      tftpIpAddress: null,
      tftpFileName: null,
      timeoutId: null,
    };
  },
  computed: {
    hostStatus() {
      return this.$store.getters['global/hostStatus'];
    },
    isHostOff() {
      return this.hostStatus === 'off' ? true : false;
    },
    isOperationInProgress() {
      return this.$store.getters['controls/isOperationInProgress'];
    },
    ...mapGetters('firmwareSingleImage', [
      'backupFirmwareStatus',
      'backupFirmwareVersion',
      'isRebootFromBackupAvailable',
      'systemFirmwareVersion',
    ]),
    isPageDisabled() {
      return !this.isHostOff || this.loading || this.isOperationInProgress;
    },
  },
  watch: {
    isWorkstationSelected: function () {
      this.$v.$reset();
      this.file = null;
      this.tftpIpAddress = null;
      this.tftpFileName = null;
    },
  },
  created() {
    this.startLoader();
    this.$store.dispatch('firmwareSingleImage/getUpdateServiceApplyTime');
    Promise.all([
      this.$store.dispatch('global/getHostStatus'),
      this.$store.dispatch('firmwareSingleImage/getFirmwareInformation'),
    ]).finally(() => this.endLoader());
  },
  validations() {
    return {
      file: {
        required: requiredIf(function () {
          return this.isWorkstationSelected;
        }),
      },
      tftpIpAddress: {
        required: requiredIf(function () {
          return !this.isWorkstationSelected;
        }),
      },
      tftpFileName: {
        required: requiredIf(function () {
          return !this.isWorkstationSelected;
        }),
      },
    };
  },
  methods: {
    uploadFirmware() {
      const startTime = this.$options.filters.formatTime(new Date());
      this.setRebootTimeout(360000); //6 minute timeout
      this.infoToast(
        this.$t('pageFirmware.toast.infoUploadStartTimeMessage', { startTime }),
        this.$t('pageFirmware.toast.infoUploadStartTimeTitle')
      );
      if (this.isWorkstationSelected) {
        this.dispatchWorkstationUpload();
      } else {
        this.dispatchTftpUpload();
      }
    },
    dispatchWorkstationUpload() {
      this.$store
        .dispatch('firmwareSingleImage/uploadFirmware', this.file)
        .then((success) =>
          this.infoToast(
            success,
            this.$t('pageFirmware.toast.successUploadTitle')
          )
        )
        .catch(({ message }) => {
          this.errorToast(message);
          this.clearRebootTimeout();
        });
    },
    dispatchTftpUpload() {
      const data = {
        address: this.tftpIpAddress,
        filename: this.tftpFileName,
      };
      this.$store
        .dispatch('firmwareSingleImage/uploadFirmwareTFTP', data)
        .then((success) =>
          this.infoToast(
            success,
            this.$t('pageFirmware.toast.successUploadTitle')
          )
        )
        .catch(({ message }) => {
          this.errorToast(message);
          this.clearRebootTimeout();
        });
    },
    rebootFromBackup() {
      this.setRebootTimeout();
      this.$store
        .dispatch('firmwareSingleImage/switchFirmwareAndReboot')
        .then((success) =>
          this.infoToast(success, this.$t('global.status.success'))
        )
        .catch(({ message }) => {
          this.errorToast(message);
          this.clearRebootTimeout();
        });
    },
    setRebootTimeout(timeoutMs = 60000) {
      // Set a timeout to disable page interactions while
      // an upload or BMC reboot is in progress
      this.startLoader();
      this.timeoutId = setTimeout(() => {
        this.endLoader();
        this.infoToast(
          this.$t('pageFirmware.toast.infoRefreshApplicationMessage'),
          this.$t('pageFirmware.toast.infoRefreshApplicationTitle')
        );
      }, timeoutMs);
    },
    clearRebootTimeout() {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.endLoader();
      }
    },
    onSubmitUpload() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.$bvModal.show('modal-upload');
    },
    onClickShutDown() {
      this.$bvModal
        .msgBoxConfirm(this.$t('pageFirmware.modal.serverShutdownMessage'), {
          title: this.$t('pageFirmware.modal.serverShutdownWillCauseOutage'),
          okTitle: this.$t('pageFirmware.modal.shutDownServer'),
          okVariant: 'danger',
        })
        .then((shutdownConfirmed) => {
          if (shutdownConfirmed)
            this.$store.dispatch('controls/hostSoftPowerOff');
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.update-code {
  border-left: none;
  @include media-breakpoint-up(xl) {
    border-left: 1px solid gray('300');
  }
}
</style>
