<template>
  <b-container fluid="xl">
    <page-title />
    <b-row v-if="isServerPowerOffRequired">
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
                  <status-icon v-if="showBackupImageStatus" status="danger" />
                  <span v-if="showBackupImageStatus" class="sr-only">
                    {{ backupFirmwareStatus }}
                  </span>
                  {{ backupFirmwareVersion }}
                </dd>
              </dl>
              <b-btn
                v-b-modal.modal-switch-to-running
                data-test-id="firmware-button-switchToRunning"
                variant="link"
                size="sm"
                class="py-0 px-1 mt-2"
                :disabled="isPageDisabled || !isRebootFromBackupAvailable"
              >
                <icon-switch class="d-none d-sm-inline-block" />
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
                v-if="isTftpUploadAvailable"
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
              <b-btn
                data-test-id="firmware-button-startUpdate"
                type="submit"
                variant="primary"
                :disabled="isPageDisabled"
              >
                {{ $t('pageFirmware.singleFileUpload.startUpdate') }}
              </b-btn>
              <alert
                v-if="isServerPowerOffRequired && !isHostOff"
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
    next();
  },
  data() {
    return {
      isWorkstationSelected: true,
      file: null,
      tftpFileAddress: null,
      timeoutId: null,
      loading,
      isServerPowerOffRequired:
        process.env.VUE_APP_SERVER_OFF_REQUIRED === 'true',
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
      'isTftpUploadAvailable',
    ]),
    isPageDisabled() {
      if (this.isServerPowerOffRequired) {
        return !this.isHostOff || this.loading || this.isOperationInProgress;
      }
      return this.loading || this.isOperationInProgress;
    },
    showBackupImageStatus() {
      return (
        this.backupFirmwareStatus === 'Critical' ||
        this.backupFirmwareStatus === 'Warning'
      );
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
    this.$store.dispatch('firmwareSingleImage/getUpdateServiceSettings');
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
      this.setRebootTimeout(360000, () => {
        this.infoToast(
          this.$t('pageFirmware.singleFileUpload.toast.verifyUpdateMessage'),
          {
            title: this.$t('pageFirmware.singleFileUpload.toast.verifyUpdate'),
            refreshAction: true,
          }
        );
      });
      this.infoToast(
        this.$t('pageFirmware.singleFileUpload.toast.updateStartedMessage'),
        {
          title: this.$t('pageFirmware.singleFileUpload.toast.updateStarted'),
          timestamp: true,
        }
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
        .catch(({ message }) => {
          this.errorToast(message);
          this.clearRebootTimeout();
        });
    },
    switchToRunning() {
      this.setRebootTimeout(60000, () => {
        this.infoToast(
          this.$t('pageFirmware.singleFileUpload.toast.verifySwitchMessage'),
          {
            title: this.$t('pageFirmware.singleFileUpload.toast.verifySwitch'),
            refreshAction: true,
          }
        );
      });
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
          this.clearRebootTimeout();
        });
    },
    setRebootTimeout(timeoutMs = 60000, callback) {
      // Set a timeout to disable page interactions
      // during a BMC reboot
      this.startLoader();
      this.timeoutId = setTimeout(() => {
        this.endLoader();
        if (callback) callback();
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
