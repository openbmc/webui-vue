<template>
  <div>
    <div class="form-background p-3">
      <b-form @submit.prevent="onSubmitUpload">
        <!-- Workstation Upload -->
        <b-form-group
          :label="$t('pageFirmware.form.updateFirmware.imageFile')"
          label-for="image-file"
          class="mb-3"
        >
          <form-file
            id="image-file"
            :disabled="isPageDisabled"
            :state="getValidationState(v$.file)"
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
    <modal-update-firmware v-model="showUpdateModal" @ok="updateFirmware" />
  </div>
</template>

<script>
import { required } from '@vuelidate/validators';
import { useVuelidate } from '@vuelidate/core';

import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

import FormFile from '@/components/Global/FormFile';
import ModalUpdateFirmware from './FirmwareModalUpdateFirmware';
import { useI18n } from 'vue-i18n';
import i18n from '@/i18n';

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
  setup() {
    return {
      v$: useVuelidate(),
    };
  },
  data() {
    return {
      $t: useI18n().t,
      loading,
      showUpdateModal: false,
      file: null,
      isServerPowerOffRequired:
        process.env.VUE_APP_SERVER_OFF_REQUIRED === 'true',
    };
  },
  validations() {
    return {
      file: {
        required,
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
        this.infoToast(
          i18n.global.t('pageFirmware.toast.verifyUpdateMessage'),
          {
            title: i18n.global.t('pageFirmware.toast.verifyUpdate'),
            refreshAction: true,
          },
        );
      }, 360000);
      this.infoToast(i18n.global.t('pageFirmware.toast.updateStartedMessage'), {
        title: i18n.global.t('pageFirmware.toast.updateStarted'),
        timestamp: true,
      });
      this.dispatchWorkstationUpload(timerId);
    },
    dispatchWorkstationUpload(timerId) {
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
    onSubmitUpload() {
      this.v$.$touch();
      if (this.v$.$invalid) return;
      this.showUpdateModal = true;
    },
    onFileUpload(file) {
      this.file = file;
      this.v$.file.$touch();
    },
  },
};
</script>
