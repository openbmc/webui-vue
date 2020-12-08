<template>
  <b-modal id="reset-hypevisor-settings" ref="modal" centered>
    <template #modal-title>
      {{ $t('pageFactoryReset.modal.resetHypevisorSettings.modalTitle') }}
    </template>
    <div>
      <h5>
        {{ $t('pageFactoryReset.modal.resetHypevisorSettings.subTitle') }}
      </h5>
      <p>{{ $t('pageFactoryReset.modal.resetHypevisorSettings.message1') }}</p>
      <div class="mb-3">
        <b-form-checkbox
          id="systemStatus"
          v-model="systemStatus"
          :state="getValidationState($v.checkboxValidationStatus)"
        >
          {{ $t('pageFactoryReset.modal.resetHypevisorSettings.condition') }}
        </b-form-checkbox>
        <b-form-invalid-feedback
          :state="getValidationState($v.checkboxValidationStatus)"
          role="alert"
        >
          {{ $t('global.form.confirmField') }}
        </b-form-invalid-feedback>
      </div>
      <p>{{ $t('pageFactoryReset.modal.resetHypevisorSettings.message2') }}</p>
    </div>
    <template #modal-footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button type="submit" variant="primary" @click="resetHypevisorSettings">
        {{
          $t(
            'pageFactoryReset.modal.resetHypevisorSettings.resetHypevisorSettingsBtn'
          )
        }}
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
    checkboxValidationStatus() {
      return this.systemStatus === true ? true : '';
    },
  },
  methods: {
    resetHypevisorSettings() {
      this.$v.$touch();
    },
  },
};
</script>
