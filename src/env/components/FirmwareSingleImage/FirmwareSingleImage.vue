<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col xl="10">
        <!-- Operation in progress alert -->
        <alert v-if="isOperationInProgress" variant="info" class="mb-5">
          <p>
            {{ $t('pageFirmware.singleFileUpload.alert.operationInProgress') }}
          </p>
        </alert>
        <!-- Power off server warning alert -->
        <alert v-else-if="!isHostOff" variant="warning" class="mb-5">
          <p class="mb-0">
            {{
              $t('pageFirmware.singleFileUpload.alert.serverMustBePoweredOffTo')
            }}
          </p>
          <ul class="m-0">
            <li>
              {{
                $t(
                  'pageFirmware.singleFileUpload.alert.switchRunningAndBackupImages'
                )
              }}
            </li>
            <li>
              {{ $t('pageFirmware.singleFileUpload.alert.updateFirmware') }}
            </li>
          </ul>
          <template #action>
            <b-link to="/control/server-power-operations">
              {{
                $t(
                  'pageFirmware.singleFileUpload.alert.viewServerPowerOperations'
                )
              }}
            </b-link>
          </template>
        </alert>
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="10">
        <page-section>
          <b-card-group deck>
            <!-- Running image -->
            <b-card>
              <template #header>
                <p class="font-weight-bold m-0">
                  {{ $t('pageFirmware.singleFileUpload.runningImage') }}
                </p>
              </template>
              <dl class="mb-0">
                <dt>{{ $t('pageFirmware.singleFileUpload.bmcAndServer') }}</dt>
                <dd class="mb-0">{{ systemFirmwareVersion }}</dd>
              </dl>
            </b-card>

            <!-- Backup image -->
            <b-card>
              <template #header>
                <p class="font-weight-bold m-0">
                  {{ $t('pageFirmware.singleFileUpload.backupImage') }}
                </p>
              </template>
              <dl>
                <dt>
                  {{ $t('pageFirmware.singleFileUpload.bmcAndServer') }}
                </dt>
                <dd>
                  <status-icon
                    v-if="backupFirmwareStatus === 'Critical'"
                    status="danger"
                  />
                  <span
                    v-if="backupFirmwareStatus === 'Critical'"
                    class="sr-only"
                    >{{ backupFirmwareStatus }}</span
                  >
                  {{ backupFirmwareVersion }}
                </dd>
              </dl>
              <b-btn
                v-b-modal.modal-switch-to-running
                variant="link"
                size="sm"
                class="py-0 px-1 mt-2"
                :disabled="isPageDisabled || !isRebootFromBackupAvailable"
              >
                <icon-switch />
                {{ $t('pageFirmware.singleFileUpload.switchToRunning') }}
              </b-btn>
            </b-card>
          </b-card-group>
        </page-section>
      </b-col>
    </b-row>
    <b-row>
      <!-- Update firmware -->
      <b-col sm="8" md="6" xl="4">
        <page-section
          :section-title="$t('pageFirmware.singleFileUpload.updateFirmware')"
        >
          <div class="form-background p-3">
            <b-form @submit.prevent="onSubmitUpload">
              <b-form-group
                :label="$t('pageFirmware.singleFileUpload.fileSource')"
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
                  <form-file
                    id="image-file"
                    accept=".tar"
                    :disabled="isPageDisabled"
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
              <template v-else>
                <b-form-group
                  :label="$t('pageFirmware.singleFileUpload.fileAddress')"
                  label-for="tftp-address"
                >
                  <b-form-input
                    id="tftp-address"
                    v-model="tftpFileAddress"
                    type="text"
                    :state="getValidationState($v.tftpFileAddress)"
                    :disabled="isPageDisabled"
                    @input="$v.tftpFileAddress.$touch()"
                  />
                  <b-form-invalid-feedback role="alert">
                    {{ $t('global.form.fieldRequired') }}
                  </b-form-invalid-feedback>
                </b-form-group>
              </template>
              <b-btn type="submit" variant="primary" :disabled="isPageDisabled">
                {{ $t('pageFirmware.singleFileUpload.startUpdate') }}
              </b-btn>
              <alert
                v-if="!isHostOff"
                variant="warning"
                :small="true"
                class="mt-4"
              >
                <p class="col-form-label">
                  {{
                    $t(
                      'pageFirmware.singleFileUpload.alert.serverMustBePoweredOffToUpdateFirmware'
                    )
                  }}
                </p>
              </alert>
            </b-form>
          </div>
        </page-section>
      </b-col>
    </b-row>

    <!-- Modals -->
    <modal-update-firmware
      :running="systemFirmwareVersion"
      :backup="backupFirmwareVersion"
      @ok="updateFirmware"
    />
    <modal-switch-to-running
      :backup="backupFirmwareVersion"
      @ok="switchToRunning"
    />

    <!-- Toasts -->
    <b-toast id="switch-images" variant="info" solid :no-auto-hide="true">
      <template #toast-title>
        <status-icon status="info" class="toast-icon" />
        <strong>{{
          $t('pageFirmware.singleFileUpload.toast.verifySwitch')
        }}</strong>
      </template>
      <p>
        {{ $t('pageFirmware.singleFileUpload.toast.verifySwitchMessage') }}
      </p>
      <b-link>{{ $t('global.action.refresh') }}</b-link>
    </b-toast>
  </b-container>
</template>

<script>
import { requiredIf } from 'vuelidate/lib/validators';
import { mapGetters } from 'vuex';
import IconSwitch from '@carbon/icons-vue/es/arrows--horizontal/20';

import PageSection from '@/components/Global/PageSection';
import PageTitle from '@/components/Global/PageTitle';
import Alert from '@/components/Global/Alert';
import FormFile from '@/components/Global/FormFile';
import StatusIcon from '@/components/Global/StatusIcon';
import ModalUpdateFirmware from './FirmwareSingleImageModalUpdateFirmware';
import ModalSwitchToRunning from './FirmwareSingleImageModalSwitchToRunning';

import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

export default {
  name: 'FirmwareSingleImage',
  components: {
    Alert,
    FormFile,
    IconSwitch,
    ModalSwitchToRunning,
    ModalUpdateFirmware,
    PageSection,
    PageTitle,
    StatusIcon,
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
      tftpFileAddress: null,
      timeoutId: null,
      loading,
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
      this.tftpFileAddress = null;
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
      tftpFileAddress: {
        required: requiredIf(function () {
          return !this.isWorkstationSelected;
        }),
      },
    };
  },
  methods: {
    updateFirmware() {
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
      this.$store
        .dispatch(
          'firmwareSingleImage/uploadFirmwareTFTP',
          this.tftpFileAddress
        )
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
    switchToRunning() {
      this.setRebootTimeout(60000, 'switch-images');
      this.$store
        .dispatch('firmwareSingleImage/switchFirmwareAndReboot')
        .catch(({ message }) => {
          this.errorToast(message);
          this.clearRebootTimeout();
        });
    },
    setRebootTimeout(timeoutMs = 60000, toastId) {
      // Set a timeout to disable page interactions while
      // during BMC reboot
      this.startLoader();
      this.timeoutId = setTimeout(() => {
        this.endLoader();
        if (toastId) {
          this.$bvToast.show(toastId);
        }
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
      this.$bvModal.show('modal-update-firmware');
    },
    onFileUpload(file) {
      this.file = file;
      this.$v.file.$touch();
    },
  },
};
</script>
