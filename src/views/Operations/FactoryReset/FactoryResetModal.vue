<template>
  <b-modal
    id="modal-reset"
    ref="modal"
    :title="$t(`pageFactoryReset.modal.${resetType}Title`)"
    title-tag="h2"
    @hidden="resetConfirm"
  >
    <p class="mb-2">
      <strong>{{ $t(`pageFactoryReset.modal.${resetType}Header`) }}</strong>
    </p>
    <ul v-if="resetType == 'resetBios'" class="pl-3 mb-4">
      <li class="mt-1 mb-1">
        {{ $t('pageFactoryReset.modal.resetBiosSettingsList.item1') }}
      </li>
      <li class="mt-1 mb-1">
        {{ $t('pageFactoryReset.modal.resetBiosSettingsList.item2') }}
      </li>
    </ul>
    <ul v-else-if="resetType == 'resetToDefaults'" class="pl-3 mb-4">
      <li class="mt-1 mb-1">
        {{ $t('pageFactoryReset.modal.resetToDefaultsSettingsList.item1') }}
      </li>
      <li class="mt-1 mb-1">
        {{ $t('pageFactoryReset.modal.resetToDefaultsSettingsList.item2') }}
      </li>
      <li class="mt-1 mb-1">
        {{ $t('pageFactoryReset.modal.resetToDefaultsSettingsList.item3') }}
      </li>
      <li class="mt-1 mb-1">
        {{ $t('pageFactoryReset.modal.resetToDefaultsSettingsList.item4') }}
      </li>
    </ul>

    <!-- Warning message -->
    <template v-if="!isServerOff">
      <p class="d-flex mb-2">
        <status-icon status="danger" />
        <span id="reset-to-default-warning" class="ml-1">
          {{ $t(`pageFactoryReset.modal.resetWarningMessage`) }}
        </span>
      </p>
      <b-form-checkbox
        v-model="confirm"
        aria-describedby="reset-to-default-warning"
        @input="v$.confirm.$touch()"
      >
        {{ $t(`pageFactoryReset.modal.resetWarningCheckLabel`) }}
      </b-form-checkbox>
      <b-form-invalid-feedback
        role="alert"
        :state="getValidationState(v$.confirm)"
      >
        {{ $t('global.form.fieldRequired') }}
      </b-form-invalid-feedback>
    </template>

    <template #modal-footer="{ cancel }">
      <b-button
        variant="secondary"
        data-test-id="factoryReset-button-cancel"
        @click="cancel()"
      >
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button
        type="sumbit"
        variant="primary"
        data-test-id="factoryReset-button-confirm"
        @click="handleConfirm"
      >
        {{ $t(`pageFactoryReset.modal.${resetType}SubmitText`) }}
      </b-button>
    </template>
  </b-modal>
</template>
<script>
import StatusIcon from '@/components/Global/StatusIcon';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';

export default {
  components: { StatusIcon },
  mixins: [VuelidateMixin],
  props: {
    resetType: {
      type: String,
      default: null,
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
      confirm: false,
    };
  },
  computed: {
    serverStatus() {
      return this.$store.getters['global/serverStatus'];
    },
    isServerOff() {
      return this.serverStatus === 'off' ? true : false;
    },
  },
  validations: {
    confirm: {
      mustBeTrue: function (value) {
        return this.isServerOff || value === true;
      },
    },
  },
  methods: {
    handleConfirm() {
      this.v$.$touch();
      if (this.v$.$invalid) return;
      this.$emit('okConfirm');
      this.$nextTick(() => this.$refs.modal.hide());
      this.resetConfirm();
    },
    resetConfirm() {
      this.confirm = false;
      this.v$.$reset();
    },
  },
};
</script>
