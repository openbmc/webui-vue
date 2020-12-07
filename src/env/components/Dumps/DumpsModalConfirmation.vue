<template>
  <b-modal
    id="modal-confirmation"
    ref="modal"
    :title="$t('pageDumps.modal.initiateSystemDump')"
    @hidden="resetForm"
  >
    <p>
      <strong>
        {{ $t('pageDumps.modal.initiateSystemDumpMessage1') }}
      </strong>
    </p>
    <p>
      {{ $t('pageDumps.modal.initiateSystemDumpMessage2') }}
    </p>
    <p>
      <status-icon status="danger" />
      {{ $t('pageDumps.modal.initiateSystemDumpMessage3') }}
    </p>
    <b-form-checkbox v-model="confirmed" @input="$v.confirmed.$touch()">
      {{ $t('pageDumps.modal.initiateSystemDumpMessage4') }}
    </b-form-checkbox>
    <b-form-invalid-feedback
      :state="getValidationState($v.confirmed)"
      role="alert"
    >
      {{ $t('global.form.required') }}
    </b-form-invalid-feedback>
    <template #modal-footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button variant="danger" @click="handleSubmit">
        {{ $t('pageDumps.form.initiateDump') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import StatusIcon from '@/components/Global/StatusIcon';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

export default {
  components: { StatusIcon },
  mixins: [VuelidateMixin],
  data() {
    return {
      confirmed: false,
    };
  },
  validations: {
    confirmed: {
      mustBeTrue: (value) => value === true,
    },
  },
  methods: {
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.$emit('ok');
      this.closeModal();
    },
    resetForm() {
      this.confirmed = false;
      this.$v.$reset();
    },
  },
};
</script>
