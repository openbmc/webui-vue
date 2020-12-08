<template>
  <b-modal id="reset-hypevisor-settings" ref="modal" centered>
    <template #modal-title>
      {{ $t('pageFactoryReset.modal.resetHypevisorSettings.modalTitle1') }}
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
          :state="getValidationState($v.systemStatus)"
        >
          {{ $t('pageFactoryReset.modal.resetHypevisorSettings.condition1') }}
        </b-form-checkbox>
        <b-form-invalid-feedback role="alert">
          <template v-if="!$v.systemStatus.required">
            {{ $t('global.form.fieldRequired') }}
          </template>
        </b-form-invalid-feedback>
      </div>
      <p>{{ $t('pageFactoryReset.modal.resetHypevisorSettings.message2') }}</p>
    </div>
    <template #modal-footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button type="submit" variant="primary" @click="resetHypevisorSettings">
        {{ $t('pageFactoryReset.modal.resetHypevisorSettings.resetBtn') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import { requiredIf } from 'vuelidate/lib/validators';

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
    systemStatus: {
      required: requiredIf(function () {
        return this.systemStatus;
      }),
    },
  },
  methods: {
    resetHypevisorSettings() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
    },
  },
};
</script>
