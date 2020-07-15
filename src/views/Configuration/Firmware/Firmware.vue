<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageFirmware.pageDescription')" />
    <b-row class="my-3">
      <b-col xl="8">
        <alert v-if="isHostOn" variant="warning">
          {{ $t('pageFirmware.alert.powerOffHost') }}
          <template v-slot:action>
            <b-btn variant="link" @click="onClickShutDown">
              {{ $t('pageFirmware.alert.shutDown') }}
            </b-btn>
          </template>
        </alert>
      </b-col>
    </b-row>
    <b-row class="mb-4">
      <!-- Firmware on system -->
      <b-col md="8" lg="12" xl="8">
        <page-section :section-title="$t('pageFirmware.firmwareOnSystem')">
          <b-card-group deck>
            <!-- Current FW -->
            <b-card header-bg-variant="success">
              <template v-slot:header>
                {{ $t('pageFirmware.current', { fw: firmwareVersion }) }}
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
                    <dd v-if="isHostOn">{{ $t('pageFirmware.running') }}</dd>
                    <dd v-else>{{ $t('pageFirmware.na') }}</dd>
                  </dl>
                </b-col>
              </b-row>
            </b-card>

            <!-- Backup FW -->
            <b-card>
              <template v-slot:header>
                {{ $t('pageFirmware.backup', { fw: firmwareVersion }) }}
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
      </b-col>

      <!-- Update code -->
      <b-col sm="8" md="4" lg="8" xl="4" class="update-code">
        <page-section :section-title="$t('pageFirmware.updateCode')">
          <b-form @submit.prevent="handleSubmit">
            <b-form-group
              :label="$t('pageFirmware.form.uploadLocation')"
              :disabled="isHostOn"
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
                  plain
                  aria-describedby="image-file-help-block"
                  :disabled="isHostOn"
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
                  :disabled="isHostOn"
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
                  :disabled="isHostOn"
                  @input="$v.tftpFileName.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  {{ $t('global.form.fieldRequired') }}
                </b-form-invalid-feedback>
              </b-form-group>
            </template>
            <alert variant="info" class="my-4">
              <strong>{{ $t('pageFirmware.alert.updateProcess') }}</strong>
              <br />
              {{ $t('pageFirmware.alert.updateInformation') }}
            </alert>
            <b-form-group>
              <b-btn type="submit" variant="primary" :disabled="isHostOn">
                {{ $t('pageFirmware.form.uploadAndRebootBmc') }}
              </b-btn>
            </b-form-group>
          </b-form>
        </page-section>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { requiredIf } from 'vuelidate/lib/validators';

import PageSection from '@/components/Global/PageSection';
import PageTitle from '@/components/Global/PageTitle';
import Alert from '@/components/Global/Alert';

import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

export default {
  name: 'Firmware',
  components: { Alert, PageSection, PageTitle },
  mixins: [VuelidateMixin],
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
    isHostOn() {
      return this.hostStatus === 'on' ? true : false;
    },
    firmwareVersion() {
      return '--'; //TODO: Get firmware version
    }
  },
  watch: {
    isWorkstationSelected: function() {
      this.$v.$reset();
    }
  },
  created() {
    this.$store.dispatch('global/getHostStatus');
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
    handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      // Launch confirmation modal
    },
    onClickShutDown() {
      // Launch shutdown confirm modal
    }
  }
};
</script>

<style lang="scss" scoped>
@import 'src/assets/styles/helpers';
</style>
