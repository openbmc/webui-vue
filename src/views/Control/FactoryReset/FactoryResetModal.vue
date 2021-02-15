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
    <ul class="pl-3 mb-4">
      <li
        v-for="(item, index) in $t(
          `pageFactoryReset.modal.${resetType}SettingsList`
        )"
        :key="index"
        class="mt-1 mb-1"
      >
        {{ $t(item) }}
      </li>
    </ul>

    <!-- Warning message -->
    <p v-if="!isHostOff" class="d-flex mb-2">
      <status-icon status="danger" />
      <span id="reset-to-default-warning" class="ml-1">
        {{ $t(`pageFactoryReset.modal.resetWarningMessage`) }}"
      </span>
    </p>
    <b-form-checkbox
      v-if="!isHostOff"
      v-model="confirm"
      aria-describedby="reset-to-default-warning"
      @input="$v.confirm.$touch()"
    >
      {{ $t(`pageFactoryReset.modal.resetWarningCheckLabel`) }}
    </b-form-checkbox>
    <b-form-invalid-feedback
      v-if="!isHostOff"
      role="alert"
      :state="getValidationState($v.confirm)"
    >
      {{ $t('global.form.fieldRequired') }}
    </b-form-invalid-feedback>

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
        @click="handleConfirm()"
      >
        {{ $t(`pageFactoryReset.modal.${resetType}SubmitText`) }}
      </b-button>
    </template>
  </b-modal>
</template>
<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import StatusIcon from '@/components/Global/StatusIcon';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';

export default {
  components: { StatusIcon },
  mixins: [BVToastMixin, VuelidateMixin],
  props: {
    resetType: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      confirm: false,
    };
  },
  computed: {
    hostStatus() {
      return this.$store.getters['global/hostStatus'];
    },
    isHostOff() {
      return this.hostStatus === 'off' ? true : false;
    },
  },
  validations: {
    confirm: { mustBeTrue: (value) => value === true },
  },
  methods: {
    isFormValid() {
      let isValid = true;
      if (!this.isHostOff) {
        this.$v.$touch();
        isValid = !this.$v.$invalid;
      }
      return isValid;
    },
    handleConfirm() {
      const isFormValid = this.isFormValid();
      if (isFormValid) {
        this.$emit('okConfirm');
        this.$nextTick(() => this.$refs.modal.hide());
        this.resetConfirm();
      }
    },
    resetConfirm() {
      this.confirm = false;
      this.$v.$reset();
    },
  },
};
</script>
