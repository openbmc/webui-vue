<template>
  <b-modal id="reset-bmc-hypevisor-settings" ref="modal" centered>
    <template v-if="this.hostStatus" #modal-title>
      {{ $t('pageFactoryReset.modal.modalTitle') }}
    </template>
    <template v-else #modal-title>
      {{ $t('global.status.warning') }}
    </template>
    <h5>
      {{ $t('pageFactoryReset.modal.subTitle') }}
    </h5>
    <div v-if="this.hostStatus">
      <p>{{ $t('pageFactoryReset.modal.message1') }}</p>
      <div class="mb-3">
        <b-form-checkbox
          id="systemStatus"
          v-model="systemStatus"
          :state="getValidationState($v.checkboxValidationStatus)"
        >
          {{ $t('pageFactoryReset.modal.condition') }}
        </b-form-checkbox>
        <b-form-invalid-feedback
          :state="getValidationState($v.checkboxValidationStatus)"
          role="alert"
        >
          {{ $t('global.form.confirmField') }}
        </b-form-invalid-feedback>
      </div>
    </div>
    <p>{{ $t('pageFactoryReset.modal.message2') }}</p>

    <template #modal-footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button type="submit" variant="primary" @click="resetAllSettings">
        {{ $t('pageFactoryReset.modal.resetAllSettingsBtn') }}
      </b-button>
    </template>
  </b-modal>
</template>
<script>
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import { required } from 'vuelidate/lib/validators';
export default {
  mixins: [VuelidateMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      systemStatus: '',
    };
  },
  validations: {
    checkboxValidationStatus: { required },
  },
  computed: {
    hostStatus() {
      return this.$store.getters['global/hostStatus'];
    },
    checkboxValidationStatus() {
      return this.systemStatus === true ? true : '';
    },
  },
  methods: {
    resetAllSettings() {
      this.$v.$touch();
    },
  },
};
</script>
