<template>
  <b-modal
    id="modal-reset"
    ref="modal"
    v-model="isModalVisible"
    :title="modalTitle"
    title-tag="h2"
    @hidden="resetConfirm"
  >
    <p class="mb-2">
      <strong>{{ modalHeader }}</strong>
    </p>
    <ul v-if="resetType == 'resetBios'" class="ps-3 mb-4">
      <li class="mt-1 mb-1">
        {{ t('pageFactoryReset.modal.resetBiosSettingsList.item1') }}
      </li>
      <li class="mt-1 mb-1">
        {{ t('pageFactoryReset.modal.resetBiosSettingsList.item2') }}
      </li>
    </ul>
    <ul v-else-if="resetType == 'resetToDefaults'" class="ps-3 mb-4">
      <li class="mt-1 mb-1">
        {{ t('pageFactoryReset.modal.resetToDefaultsSettingsList.item1') }}
      </li>
      <li class="mt-1 mb-1">
        {{ t('pageFactoryReset.modal.resetToDefaultsSettingsList.item2') }}
      </li>
      <li class="mt-1 mb-1">
        {{ t('pageFactoryReset.modal.resetToDefaultsSettingsList.item3') }}
      </li>
      <li class="mt-1 mb-1">
        {{ t('pageFactoryReset.modal.resetToDefaultsSettingsList.item4') }}
      </li>
    </ul>

    <!-- Warning message -->
    <template v-if="!isServerOff">
      <p class="d-flex mb-2">
        <status-icon status="danger" />
        <span id="reset-to-default-warning" class="ms-1">
          {{ t(`pageFactoryReset.modal.resetWarningMessage`) }}
        </span>
      </p>
      <b-form-checkbox
        v-model="confirm"
        aria-describedby="reset-to-default-warning"
        @change="v$.confirm.$touch()"
      >
        {{ t(`pageFactoryReset.modal.resetWarningCheckLabel`) }}
      </b-form-checkbox>
      <b-form-invalid-feedback
        role="alert"
        :state="getValidationState(v$.confirm)"
      >
        {{ t('global.form.fieldRequired') }}
      </b-form-invalid-feedback>
    </template>

    <template #footer="{ cancel }">
      <b-button
        variant="secondary"
        data-test-id="factoryReset-button-cancel"
        @click="cancel()"
      >
        {{ t('global.action.cancel') }}
      </b-button>
      <b-button
        type="sumbit"
        variant="primary"
        data-test-id="factoryReset-button-confirm"
        @click="handleConfirm"
      >
        {{ modalSubmitText }}
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
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['okConfirm', 'update:modelValue'],
  setup() {
    return {
      v$: useVuelidate(),
    };
  },
  data() {
    return {
      t: useI18n().t,
      confirm: false,
    };
  },
  computed: {
    isModalVisible: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
    serverStatus() {
      return this.$store.getters['global/serverStatus'];
    },
    isServerOff() {
      return this.serverStatus === 'off' ? true : false;
    },
    modalTitle() {
      return this.t(`pageFactoryReset.modal.${this.resetType}Title`);
    },
    modalHeader() {
      return this.t(`pageFactoryReset.modal.${this.resetType}Header`);
    },
    modalSubmitText() {
      return this.t(`pageFactoryReset.modal.${this.resetType}SubmitText`);
    },
  },
  validations() {
    return {
      confirm: {
        mustBeTrue: function (value) {
          return this.isServerOff || value === true;
        },
      },
    };
  },
  watch: {
    isServerOff: {
      handler(newValue) {
        // Touch validation when server is on to show required message immediately
        if (!newValue) {
          this.$nextTick(() => {
            this.v$.confirm.$touch();
          });
        }
      },
      immediate: true,
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
