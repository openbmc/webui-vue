<template>
  <b-modal
    id="modal-hostname"
    ref="modal"
    :title="$t('pageNetwork.modal.editHostnameTitle')"
    @hidden="resetForm"
  >
    <b-form id="hostname-settings" @submit.prevent="handleSubmit">
      <b-row>
        <b-col sm="6">
          <b-form-group
            :label="$t('pageNetwork.hostname')"
            label-for="hostname"
          >
            <b-form-input
              id="hostname"
              v-model="form.hostname"
              type="text"
              :state="getValidationState($v.form.hostname)"
              @input="$v.form.hostname.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              <template v-if="!$v.form.hostname.required">
                {{ $t('global.form.fieldRequired') }}
              </template>
              <template v-if="!$v.form.hostname.validateHostname">
                {{ $t('global.form.lengthMustBeBetween', { min: 1, max: 64 }) }}
              </template>
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
    </b-form>
    <template #modal-footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button
        form="hostname-settings"
        type="submit"
        variant="primary"
        @click="onOk"
      >
        {{ $t('global.action.add') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import { required, helpers } from 'vuelidate/lib/validators';

const validateHostname = helpers.regex('validateHostname', /^\S{0,64}$/);

export default {
  mixins: [VuelidateMixin],
  props: {
    hostname: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      form: {
        hostname: '',
      },
    };
  },
  watch: {
    hostname() {
      this.form.hostname = this.hostname;
    },
  },
  validations() {
    return {
      form: {
        hostname: {
          required,
          validateHostname,
        },
      },
    };
  },
  methods: {
    handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.$emit('ok', { HostName: this.form.hostname });
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
      this.form.hostname = this.hostname;
      this.$v.$reset();
      this.$emit('hidden');
    },
    onOk(bvModalEvt) {
      // prevent modal close
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
  },
};
</script>
