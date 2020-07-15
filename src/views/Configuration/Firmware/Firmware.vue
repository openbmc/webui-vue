<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageFirmware.pageDescription')" />
    <!-- Shutdown server warning alert -->
    <alert v-if="!isHostOff" variant="warning" class="mb-5">
      <p class="font-weight-bold mb-1">
        {{ $t('pageFirmware.alert.serverShutdownRequiredBeforeUpdate') }}
      </p>
      {{ $t('pageFirmware.alert.serverShutdownRequiredInfo') }}
      <template v-slot:action>
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
              <template v-slot:header>
                <dl class="mb-0">
                  <dt>{{ $t('pageFirmware.current') }}</dt>
                  <dd class="mb-0">{{ currentFirmwareVersion }}</dd>
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
                    <dd v-if="!isHostOff">{{ $t('pageFirmware.running') }}</dd>
                    <dd v-else>{{ $t('pageFirmware.na') }}</dd>
                  </dl>
                </b-col>
              </b-row>
            </b-card>

            <!-- Backup FW -->
            <b-card>
              <template v-slot:header>
                <dl class="mb-0">
                  <dt>{{ $t('pageFirmware.backup') }}</dt>
                  <dd class="mb-0">{{ backupFirmwareVersion }}</dd>
                </dl>
              </template>
              <b-row>
                <b-col xs="6">
                  <dl class="my-0">
                    <dt>{{ $t('pageFirmware.bmcStatus') }}</dt>
                    <dd>{{ $t('pageFirmware.na') }}</dd>
                  </dl>
                </b-col>
                <b-col xs="6">
                  <dl class="my-0">
                    <dt>{{ $t('pageFirmware.hostStatus') }}</dt>
                    <dd>{{ $t('pageFirmware.na') }}</dd>
                  </dl>
                </b-col>
              </b-row>
            </b-card>
          </b-card-group>
        </page-section>

        <!-- Switch image -->
        <page-section :section-title="$t('pageFirmware.switchAndRebootTitle')">
          <dl class="mb-5">
            <dt>{{ $t('pageFirmware.switchImage') }}</dt>
            <dd>{{ backupFirmwareVersion }}</dd>
          </dl>
          <!-- TODO: Disable button if no backup version-->
          <b-btn
            v-b-modal.modal-reboot-backup
            type="button"
            variant="primary"
            :disabled="!isHostOff"
          >
            {{ $t('pageFirmware.switchAndRebootBmc') }}
          </b-btn>
        </page-section>
      </b-col>

      <!-- Update code -->
      <b-col sm="8" xl="4" class="update-code pl-xl-4">
        <page-section :section-title="$t('pageFirmware.updateCode')">
          <b-form @submit.prevent="onSubmitUpload">
            <b-form-group
              :label="$t('pageFirmware.form.uploadLocation')"
              :disabled="!isHostOff"
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
                  :disabled="!isHostOff"
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
                :label="$t('pageFirmware.form.tftpServerIpAddress')"
                label-for="tftp-ip"
              >
                <b-form-input
                  id="tftp-id"
                  v-model="tftpIpAddress"
                  type="text"
                  :state="getValidationState($v.tftpIpAddress)"
                  :disabled="!isHostOff"
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
                  :disabled="!isHostOff"
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
            <b-form-group>
              <b-btn type="submit" variant="primary" :disabled="!isHostOff">
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
      :current="currentFirmwareVersion"
      :backup="backupFirmwareVersion"
      @ok="rebootFromBackup"
    />
  </b-container>
</template>

<script>
import { requiredIf } from 'vuelidate/lib/validators';

import PageSection from '@/components/Global/PageSection';
import PageTitle from '@/components/Global/PageTitle';
import Alert from '@/components/Global/Alert';
import ModalUpload from './FirmwareModalUpload';
import ModalRebootBackup from './FirmwareModalRebootBackup';

import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'Firmware',
  components: { Alert, ModalRebootBackup, ModalUpload, PageSection, PageTitle },
  mixins: [LoadingBarMixin, VuelidateMixin],
  data() {
    return {
      isWorkstationSelected: true,
      file: null,
      tftpIpAddress: null,
      tftpFileName: null
    };
  },
  computed: {
    hostStatus() {
      return this.$store.getters['global/hostStatus'];
    },
    isHostOff() {
      return this.hostStatus === 'off' ? true : false;
    },
    backupFirmwareVersion() {
      return this.$store.getters['firmware/backupFirmwareVersion'];
    },
    currentFirmwareVersion() {
      return this.$store.getters['firmware/systemFirmwareVersion'];
    }
  },
  watch: {
    isWorkstationSelected: function() {
      this.$v.$reset();
      this.file = null;
      this.tftpIpAddress = null;
      this.tftpFileName = null;
    }
  },
  created() {
    this.startLoader();
    this.$store.dispatch('firmware/getUpdateServiceApplyTime');
    Promise.all([
      this.$store.dispatch('global/getHostStatus'),
      this.$store.dispatch('firmware/getSystemFirwareVersion')
    ]).finally(() => this.endLoader());
  },
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  validations() {
    return {
      file: {
        required: requiredIf(function() {
          return this.isWorkstationSelected;
        })
      },
      tftpIpAddress: {
        required: requiredIf(function() {
          return !this.isWorkstationSelected;
        })
      },
      tftpFileName: {
        required: requiredIf(function() {
          return !this.isWorkstationSelected;
        })
      }
    };
  },
  methods: {
    // TODO: should disable form with a timeout
    uploadFirmware() {
      if (this.isWorkstationSelected) {
        // dispatch action for workstation upload
        this.$store.dispatch('firmware/uploadFirmware', this.file);
      } else {
        // dispatch action for TFTP upload
        const data = {
          address: this.tftpIpAddress,
          filename: this.tftpFileName
        };
        this.$store.dispatch('firmware/uploadFirmwareTFTP', data);
      }
    },
    rebootFromBackup() {
      this.$store.dispatch('firmware/switchFirmwareAndReboot');
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
          okVariant: 'danger'
        })
        .then(shutdownConfirmed => {
          if (shutdownConfirmed)
            this.$store.dispatch('controls/hostSoftPowerOff');
        });
    }
  }
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
