<template>
  <div>
    <div class="form-background p-3">
      <b-form @submit.prevent="onSubmitUpload">
        <b-form-group
          v-if="isFileAddressUploadAvailable"
          :label="$t('pageFirmware.form.updateFirmware.fileSource')"
          :disabled="isPageDisabled"
        >
          <b-form-radio
            id="upload-file-source-local"
            v-model="fileSource"
            name="upload-file-source"
            value="LOCAL"
          >
            {{ $t('pageFirmware.form.updateFirmware.workstation') }}
          </b-form-radio>
          <b-form-radio
            v-for="action in allowableActions"
            :id="'upload-file-source-' + action.toLowerCase()"
            :key="action"
            v-model="fileSource"
            name="upload-file-source"
            :value="action"
          >
            {{ action }} {{ $t('pageFirmware.form.updateFirmware.server') }}
          </b-form-radio>
        </b-form-group>

        <!-- Local File Upload -->
        <template v-if="isLocalSelected">
          <b-form-group
            :label="$t('pageFirmware.form.updateFirmware.imageFile')"
            label-for="image-file"
          >
            <form-file
              id="image-file"
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

        <!-- SCP/HTTP/HTTPS/... Server File Upload -->
        <template v-else>
          <b-form-group
            :label="$t('pageFirmware.form.updateFirmware.fileAddress')"
            label-for="file-address"
          >
            <b-form-input
              id="file-address"
              v-model="fileAddress"
              type="text"
              :state="getValidationState($v.fileAddress)"
              :disabled="isPageDisabled"
              @input="$v.fileAddress.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              {{ $t('global.form.fieldRequired') }}
            </b-form-invalid-feedback>
          </b-form-group>
          <b-form-group
            v-if="isUsernameNeeded"
            :label="$t('pageFirmware.form.updateFirmware.username')"
            label-for="username"
          >
            <b-form-input
              id="username"
              v-model="username"
              type="text"
              :state="getValidationState($v.username)"
              :disabled="isPageDisabled"
              @input="$v.username.$touch()"
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
          {{ $t('pageFirmware.form.updateFirmware.startUpdate') }}
        </b-btn>
      </b-form>
    </div>

    <!-- Modals -->
    <modal-update-firmware @ok="updateFirmware" />
  </div>
</template>

<script>
import { requiredIf } from 'vuelidate/lib/validators';

import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

import FormFile from '@/components/Global/FormFile';
import ModalUpdateFirmware from './FirmwareModalUpdateFirmware';

export default {
  components: { FormFile, ModalUpdateFirmware },
  mixins: [BVToastMixin, LoadingBarMixin, VuelidateMixin],
  props: {
    isPageDisabled: {
      required: true,
      type: Boolean,
      default: false,
    },
    isServerOff: {
      required: true,
      type: Boolean,
    },
  },
  data() {
    return {
      loading,
      fileSource: 'LOCAL',
      file: null,
      fileAddress: null,
      username: null,
      isServerPowerOffRequired:
        process.env.VUE_APP_SERVER_OFF_REQUIRED === 'true',
    };
  },
  computed: {
    allowableActions() {
      return this.$store.getters['firmware/allowableActions'];
    },
    isFileAddressUploadAvailable() {
      return this.allowableActions.length > 0;
    },
    isLocalSelected() {
      return this.fileSource === 'LOCAL';
    },
    isUsernameNeeded() {
      return this.fileSource === 'SCP';
    },
  },
  watch: {
    fileSource: function () {
      this.$v.$reset();
      this.file = null;
      this.fileAddress = null;
      this.username = null;
    },
  },
  validations() {
    return {
      file: {
        required: requiredIf(function () {
          return this.isLocalSelected;
        }),
      },
      fileAddress: {
        required: requiredIf(function () {
          return !this.isLocalSelected;
        }),
      },
      username: {
        required: requiredIf(function () {
          return this.isUsernameNeeded;
        }),
      },
    };
  },
  created() {
    this.$store.dispatch('firmware/getUpdateServiceSettings');
  },
  methods: {
    updateFirmware() {
      this.startLoader();
      const timerId = setTimeout(() => {
        this.endLoader();
        this.infoToast(this.$t('pageFirmware.toast.verifyUpdateMessage'), {
          title: this.$t('pageFirmware.toast.verifyUpdate'),
          refreshAction: true,
        });
      }, 360000);
      this.infoToast(this.$t('pageFirmware.toast.updateStartedMessage'), {
        title: this.$t('pageFirmware.toast.updateStarted'),
        timestamp: true,
      });
      if (this.fileSource === 'LOCAL') {
        this.dispatchLocalFileUpload(timerId);
      } else {
        this.dispatchFileAddressUpload(timerId);
      }
    },
    dispatchLocalFileUpload(timerId) {
      this.$store
        .dispatch('firmware/uploadFirmware', {
          image: this.file,
        })
        .catch(({ message }) => {
          this.endLoader();
          this.errorToast(message);
          clearTimeout(timerId);
        });
    },
    dispatchFileAddressUpload(timerId) {
      this.$store
        .dispatch('firmware/uploadFirmwareSimpleUpdate', {
          protocol: this.fileSource,
          fileAddress: this.fileAddress,
          username: this.username,
        })
        .catch(({ message }) => {
          this.endLoader();
          this.errorToast(message);
          clearTimeout(timerId);
        });
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
