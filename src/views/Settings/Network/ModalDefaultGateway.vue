<template>
  <b-modal
    id="modal-default-gateway"
    ref="modal"
    :title="$t('pageNetwork.modal.editIPv6DefaultGatewayTitle')"
    @hidden="resetForm"
  >
    <b-form id="gateway-settings" @submit.prevent="handleSubmit">
      <b-row>
        <b-col sm="6">
          <b-form-group
            :label="$t('pageNetwork.gateway')"
            label-for="defaultGateway"
          >
            <b-form-input
              id="defaultGateway"
              v-model.trim="form.defaultGateway"
              data-test-id="network-input-gateway"
              type="text"
              :state="getValidationState(v$.form.defaultGateway)"
              @change="v$.form.defaultGateway.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              <div v-if="v$.form.defaultGateway.required.$invalid">
                {{ $t('global.form.fieldRequired') }}
              </div>
              <div v-if="v$.form.defaultGateway.validateGateway.$invalid">
                {{ $t('global.form.invalidFormat') }}
              </div>
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
        form="gateway-settings"
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
import { required } from '@vuelidate/validators';
import { helpers } from 'vuelidate/lib/validators';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';

const validateGateway = helpers.regex(
  'validateGateway',
  /^((?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}|(?:[a-fA-F0-9]{1,4}:){1,7}:|(?:[a-fA-F0-9]{1,4}:){1,6}:[a-fA-F0-9]{1,4}|(?:[a-fA-F0-9]{1,4}:){1,5}(?::[a-fA-F0-9]{1,4}){1,2}|(?:[a-fA-F0-9]{1,4}:){1,4}(?::[a-fA-F0-9]{1,4}){1,3}|(?:[a-fA-F0-9]{1,4}:){1,3}(?::[a-fA-F0-9]{1,4}){1,4}|(?:[a-fA-F0-9]{1,4}:){1,2}(?::[a-fA-F0-9]{1,4}){1,5}|[a-fA-F0-9]{1,4}:(?::[a-fA-F0-9]{1,4}){1,6}|:(?::[a-fA-F0-9]{1,4}){1,7}|::|(?:[a-fA-F0-9]{1,4}:){6}(?:[0-9]{1,3}\.){3}[0-9]{1,3}|::(?:[a-fA-F0-9]{1,4}:){0,5}(?:[0-9]{1,3}\.){3}[0-9]{1,3}|(?:[a-fA-F0-9]{1,4}:){1,5}:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|(?:[a-fA-F0-9]{1,4}:){1,4}:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|(?:[a-fA-F0-9]{1,4}:){1,3}:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|(?:[a-fA-F0-9]{1,4}:){1,2}:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|[a-fA-F0-9]{1,4}:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|::(?:[0-9]{1,3}\.){3}[0-9]{1,3})$/,
);

export default {
  mixins: [VuelidateMixin],
  props: {
    defaultGateway: {
      type: String,
      default: '',
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
      form: {
        defaultGateway: '',
      },
    };
  },
  watch: {
    defaultGateway() {
      this.form.defaultGateway = this.defaultGateway;
    },
  },
  validations() {
    return {
      form: {
        defaultGateway: {
          required,
          validateGateway,
        },
      },
    };
  },
  methods: {
    handleSubmit() {
      this.v$.$touch();
      if (this.v$.$invalid) return;
      this.$emit('ok', { IPv6DefaultGateway: this.form.defaultGateway });
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
      this.form.defaultGateway = this.defaultGateway;
      this.v$.$reset();
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
