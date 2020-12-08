<template>
  <b-modal id="modal-reset-settings" ref="modal" centered @hidden="resetForm">
    <template #modal-title>
      <span class="icon text-warning d-inline-block"><icon-warning-alt /></span>
      <template v-if="hostStatus === 'on'">
        {{ $t('pageFactoryReset.modal.modalTitle') }}
      </template>
      <template v-else>
        {{ $t('global.status.warning') }}
      </template>
    </template>
    <p class="font-weight-bold">
      {{ $t('pageFactoryReset.modal.subTitle') }}
    </p>
    <div v-if="hostStatus === 'on'">
      <p>{{ $t('pageFactoryReset.modal.message1') }}</p>
      <div class="mb-3">
        <b-form-checkbox
          v-model="resetConfirmation"
          @input="$v.resetConfirmation.$touch()"
        >
          {{ $t('pageFactoryReset.modal.condition') }}
        </b-form-checkbox>
        <b-form-invalid-feedback
          :state="getValidationState($v.resetConfirmation)"
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

      <template v-if="isShowHypervisorBtn">
        <b-button
          type="submit"
          variant="primary"
          @click="resetHypervisorSettings"
        >
          {{ $t('pageFactoryReset.modal.resetHypervisorSettingsBtn') }}
        </b-button>
      </template>
      <template v-else>
        <b-button type="submit" variant="primary" @click="resetAllSettings">
          {{ $t('pageFactoryReset.modal.resetAllSettingsBtn') }}
        </b-button>
      </template>
    </template>
  </b-modal>
</template>
<script>
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

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
      resetConfirmation: false,
      isShowHypervisorBtn: false,
    };
  },
  validations: {
    resetConfirmation: {
      mustBeTrue: (value) => value === true,
    },
  },
  computed: {
    hostStatus() {
      return this.$store.getters['global/hostStatus'];
    },
  },
  methods: {
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    hideBtn(value) {
      this.isShowHypervisorBtn = value;
    },
    resetHypervisorSettings() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.closeModal();
    },
    resetAllSettings() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.closeModal();
    },
    resetForm() {
      this.resetConfirmation = false;
      this.$v.$reset();
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-title .icon {
  vertical-align: text-top;
}
</style>
