<template>
  <b-modal id="reset-hypervisor-settings" ref="modal" centered>
    <template v-if="hostStatus === 'on'" #modal-title>
      <span class="text-warning"><icon-warning-alt /></span>
      {{ $t('pageFactoryReset.modal.modalTitle') }}
    </template>
    <template v-else #modal-title>
      <span class="text-warning"><icon-warning-alt /></span>
      {{ $t('global.status.warning') }}
    </template>
    <span class="h5">
      {{ $t('pageFactoryReset.modal.subTitle') }}
    </span>
    <div v-if="hostStatus === 'on'">
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
      <b-button
        type="submit"
        variant="primary"
        @click="resetHypervisorSettings"
      >
        {{ $t('pageFactoryReset.modal.resetHypervisorSettingsBtn') }}
      </b-button>
    </template>
  </b-modal>
</template>
<script>
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import { required } from 'vuelidate/lib/validators';

import IconWarningAlt from '@carbon/icons-vue/es/warning--alt--filled/20';

export default {
  components: { IconWarningAlt },
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
    resetHypervisorSettings() {
      this.$v.$touch();
      if (this.hostStatus) {
        this.$bvModal.show('reset-confirm');
      }
    },
  },
};
</script>
