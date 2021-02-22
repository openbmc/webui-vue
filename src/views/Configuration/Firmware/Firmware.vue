<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageFirmware.pageDescription')" />
    <b-row class="mb-4">
      <b-col md="10" lg="12" xl="8" class="pr-xl-4">
        <!-- Firmware on BMC -->
        <page-section :section-title="$t('pageFirmware.firmwareOnBmc')">
          <b-card-group deck>
            <!-- Current FW -->
            <b-card header-bg-variant="success">
              <template #header>
                <dl class="mb-0">
                  <dt>{{ $t('pageFirmware.current') }}</dt>
                  <dd class="mb-0">{{ bmcFirmwareCurrentVersion }}</dd>
                </dl>
              </template>
              <dl class="my-0">
                <dt>{{ $t('pageFirmware.state') }}:</dt>
                <dd>{{ bmcFirmwareCurrentState }}</dd>
              </dl>
              <template #footer></template>
            </b-card>

            <!-- Backup FW -->
            <b-card footer-class="p-0">
              <template #header>
                <dl class="mb-0">
                  <dt>{{ $t('pageFirmware.backup') }}</dt>
                  <dd class="mb-0">{{ bmcFirmwareBackupVersion }}</dd>
                </dl>
              </template>
              <dl class="my-0">
                <dt>{{ $t('pageFirmware.state') }}:</dt>
                <dd>{{ bmcFirmwareBackupState }}</dd>
              </dl>
              <template #footer>
                <b-btn
                  v-b-modal.modal-reboot-backup-bmc
                  :disabled="!bmcFirmwareBackupVersion"
                  variant="link"
                  size="sm"
                >
                  <icon-switch class="d-none d-sm-inline-block" />
                  {{ $t('pageFirmware.makeCurrentVersion') }}</b-btn
                >
              </template>
            </b-card>
          </b-card-group>
        </page-section>

        <!-- Firmware on Host -->
        <page-section :section-title="$t('pageFirmware.firmwareOnHost')">
          <b-card-group deck>
            <!-- Current FW -->
            <b-card header-bg-variant="success">
              <template #header>
                <dl class="mb-0">
                  <dt>{{ $t('pageFirmware.current') }}</dt>
                  <dd class="mb-0">{{ hostFirmwareCurrentVersion }}</dd>
                </dl>
              </template>
              <!-- State -->
              <dl class="my-0">
                <dt>{{ $t('pageFirmware.state') }}:</dt>
                <dd>{{ hostFirmwareCurrentState }}</dd>
              </dl>
            </b-card>

            <!-- Backup FW -->
            <b-card>
              <template #header>
                <dl class="mb-0">
                  <dt>{{ $t('pageFirmware.backup') }}</dt>
                  <dd class="mb-0">{{ hostFirmwareBackupVersion }}</dd>
                </dl>
              </template>
              <!-- State -->
              <dl class="my-0">
                <dt>{{ $t('pageFirmware.state') }}:</dt>
                <dd>{{ hostFirmwareBackupState }}</dd>
              </dl>
            </b-card>
          </b-card-group>
        </page-section>
      </b-col>

      <!-- Update code -->
      <b-col sm="8" xl="4" class="update-code pl-xl-4">
        <page-section :section-title="$t('pageFirmware.updateCode')">
          <b-form @submit.prevent="onSubmitUpload">
            <b-form-group
              v-if="tftpUploadEnabled"
              :label="$t('pageFirmware.form.uploadLocation')"
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
              <b-form-group :label="$t('pageFirmware.form.imageFile')">
                <b-form-text id="image-file-help-block">
                  {{ $t('pageFirmware.form.onlyTarFilesAccepted') }}
                </b-form-text>
                <form-file
                  id="image-file"
                  accept=".tar"
                  :state="getValidationState($v.file)"
                  aria-describedby="image-file-help-block"
                  @input="onFileUpload($event)"
                >
                  <template #invalid>
                    <b-form-invalid-feedback role="alert">
                      {{ $t('global.form.required') }}
                    </b-form-invalid-feedback>
                  </template>
                </form-file>
              </b-form-group>
            </template>

            <!-- TFTP Server Upload -->
            <template v-else-if="tftpUploadEnabled">
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
              <p>{{ $t('pageFirmware.alert.updateProcessInfo') }}</p>
            </alert>

            <b-btn type="submit" variant="primary">
              {{ $t('pageFirmware.form.uploadAndRebootBmcOrHost') }}
            </b-btn>
          </b-form>
        </page-section>
      </b-col>
    </b-row>

    <!-- Modals -->
    <modal-upload @ok="uploadFirmware" />
    <modal-reboot-backup-bmc
      :current="bmcFirmwareCurrentVersion || '--'"
      :backup="bmcFirmwareBackupVersion || '--'"
      @ok="switchBmcFirmware"
    />
  </b-container>
</template>

<script>
import { requiredIf } from 'vuelidate/lib/validators';
import { mapGetters } from 'vuex';
import IconSwitch from '@carbon/icons-vue/es/arrows--horizontal/20';

import PageSection from '@/components/Global/PageSection';
import PageTitle from '@/components/Global/PageTitle';
import Alert from '@/components/Global/Alert';
import ModalUpload from './FirmwareModalUpload';
import ModalRebootBackupBmc from './FirmwareModalRebootBackupBmc';
import FormFile from '@/components/Global/FormFile';

import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

export default {
  name: 'Firmware',
  components: {
    Alert,
    IconSwitch,
    ModalRebootBackupBmc,
    ModalUpload,
    PageSection,
    PageTitle,
    FormFile,
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
      tftpUploadEnabled:
        process.env.VUE_APP_FIRMWARE_TFTP === 'false' ? false : true,
      timeoutId: null,
      loading: loading,
    };
  },
  computed: {
    ...mapGetters('firmware', [
      'bmcFirmwareCurrentVersion',
      'bmcFirmwareCurrentState',
      'bmcFirmwareBackupVersion',
      'bmcFirmwareBackupState',
      'hostFirmwareCurrentVersion',
      'hostFirmwareCurrentState',
      'hostFirmwareBackupVersion',
      'hostFirmwareBackupState',
    ]),
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
    this.$store.dispatch('firmware/getUpdateServiceApplyTime');
    this.$store
      .dispatch('firmware/getFirmwareInformation')
      .finally(() => this.endLoader());
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
    onFileUpload(file) {
      this.file = file;
      this.$v.file.$touch();
    },
    uploadFirmware() {
      const startTime = this.$options.filters.formatTime(new Date());
      this.setRebootTimeout(360000); //6 minute timeout
      this.infoToast(
        this.$t('pageFirmware.toast.infoUploadStartTimeMessage', { startTime }),
        { title: this.$t('pageFirmware.toast.infoUploadStartTimeTitle') }
      );
      if (this.isWorkstationSelected || !this.tftpUploadEnabled) {
        this.dispatchWorkstationUpload();
      } else {
        this.dispatchTftpUpload();
      }
    },
    dispatchWorkstationUpload() {
      this.$store
        .dispatch('firmware/uploadFirmware', this.file)
        .then((success) =>
          this.infoToast(success, {
            title: this.$t('pageFirmware.toast.successUploadTitle'),
          })
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
        .dispatch('firmware/uploadFirmwareTFTP', data)
        .then((success) =>
          this.infoToast(success, {
            title: this.$t('pageFirmware.toast.successUploadTitle'),
          })
        )
        .catch(({ message }) => {
          this.errorToast(message);
          this.clearRebootTimeout();
        });
    },
    switchBmcFirmware() {
      this.setRebootTimeout();
      this.$store
        .dispatch('firmware/switchBmcFirmware')
        .then((success) =>
          this.infoToast(success, { title: this.$t('global.status.success') })
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
          {
            title: this.$t('pageFirmware.toast.infoRefreshApplicationTitle'),
            refreshAction: true,
          }
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
.card-footer {
  height: 40px;
}
.card-body {
  padding: 0.75rem 1.25rem;
}
</style>
