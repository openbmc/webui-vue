<template>
  <b-modal
    id="modal-reset-bios"
    ref="modal"
    :title="$t('pageFactoryReset.modal.resetBiosTitle')"
    title-tag="h2"
    @hidden="resetConfirm"
  >
    <p class="mb-2">
      <strong>{{ $t('pageFactoryReset.modal.resetBiosHeader') }}</strong>
    </p>
    <ul class="pl-3 mb-4">
      <li
        v-for="(item, index) in $t(
          'pageFactoryReset.modal.resetBiosSettingsList'
        )"
        :key="index"
        class="mt-1 mb-1"
      >
        {{ $t(item) }}
      </li>
    </ul>
    <p class="d-flex mb-2">
      <status-icon status="danger" />
      <span id="reset-bios-warning" class="ml-1">
        {{ $t('pageFactoryReset.modal.resetWarningMessage') }}"
      </span>
    </p>
    <b-form-checkbox
      v-if="!isHostOff"
      v-model="confirm"
      aria-describedby="reset-bios-warning"
      @input="$v.confirm.$touch()"
    >
      {{ $t('pageFactoryReset.modal.resetWarningCheckLabel') }}
    </b-form-checkbox>
    <b-form-invalid-feedback
      role="alert"
      :state="getValidationState($v.confirm)"
    >
      {{ $t('global.form.fieldRequired') }}
    </b-form-invalid-feedback>

    <template #modal-footer="{ cancel }">
      <b-button
        variant="secondary"
        data-test-id="factoryResetBios-button-cancel"
        @click="cancel()"
      >
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button
        type="sumbit"
        variant="primary"
        data-test-id="factoryResetBios-button-confirm"
        @click="handleConfirm()"
      >
        {{ $t('pageFactoryReset.modal.resetBiosSubmitText') }}
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
    handleConfirm() {
      this.$v.$touch();
      if (this.$v.$invalid) return;

      this.$emit('okConfirm');
      this.$nextTick(() => this.$refs.modal.hide());
      this.resetConfirm();
    },
    resetConfirm() {
      this.confirm = false;
      this.$v.$reset();
    },
  },
};
</script>
