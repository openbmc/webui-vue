<template>
  <b-modal
    id="modal-add-ipv6"
    ref="modal"
    :title="$t('pageNetwork.table.addIpv6Address')"
    @hidden="resetForm"
  >
    <b-form id="form-ipv6" @submit.prevent="handleSubmit">
      <b-row>
        <b-col sm="6">
          <b-form-group
            :label="$t('pageNetwork.modal.ipAddress')"
            label-for="ipAddress"
          >
            <b-form-input
              id="ipAddress"
              v-model="form.ipAddress"
              type="text"
              :state="getValidationState(v$.form.ipAddress)"
              @input="v$.form.ipAddress.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              <template v-if="v$.form.ipAddress.required.$invalid">
                {{ $t('global.form.fieldRequired') }}
              </template>
              <template v-if="v$.form.ipAddress.validateIpv6.$invalid">
                {{ $t('global.form.invalidFormat') }}
              </template>
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
        <b-col sm="6">
          <b-form-group
            :label="$t('pageNetwork.modal.prefixLength')"
            label-for="prefixLength"
          >
            <b-form-input
              id="prefixLength"
              v-model="form.prefixLength"
              type="text"
              :state="getValidationState(v$.form.prefixLength)"
              @input="v$.form.prefixLength.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              <template v-if="v$.form.prefixLength.required.$invalid">
                {{ $t('global.form.fieldRequired') }}
              </template>
              <template
                v-if="v$.form.prefixLength.validatePrefixLength.$invalid"
              >
                {{ $t('global.form.invalidFormat') }}
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
      <b-button form="form-ipv6" type="submit" variant="primary" @click="onOk">
        {{ $t('global.action.add') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import { required } from '@vuelidate/validators';
import { helpers } from 'vuelidate/lib/validators';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';

const validateIpv6 = helpers.regex(
  'validateIpv6',
  /^((?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}|(?:[a-fA-F0-9]{1,4}:){1,7}:|(?:[a-fA-F0-9]{1,4}:){1,6}:[a-fA-F0-9]{1,4}|(?:[a-fA-F0-9]{1,4}:){1,5}(?::[a-fA-F0-9]{1,4}){1,2}|(?:[a-fA-F0-9]{1,4}:){1,4}(?::[a-fA-F0-9]{1,4}){1,3}|(?:[a-fA-F0-9]{1,4}:){1,3}(?::[a-fA-F0-9]{1,4}){1,4}|(?:[a-fA-F0-9]{1,4}:){1,2}(?::[a-fA-F0-9]{1,4}){1,5}|[a-fA-F0-9]{1,4}:(?::[a-fA-F0-9]{1,4}){1,6}|:(?::[a-fA-F0-9]{1,4}){1,7}|::|(?:[a-fA-F0-9]{1,4}:){6}(?:[0-9]{1,3}\.){3}[0-9]{1,3}|::(?:[a-fA-F0-9]{1,4}:){0,5}(?:[0-9]{1,3}\.){3}[0-9]{1,3}|(?:[a-fA-F0-9]{1,4}:){1,5}:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|(?:[a-fA-F0-9]{1,4}:){1,4}:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|(?:[a-fA-F0-9]{1,4}:){1,3}:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|(?:[a-fA-F0-9]{1,4}:){1,2}:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|[a-fA-F0-9]{1,4}:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|::(?:[0-9]{1,3}\.){3}[0-9]{1,3})$/,
);

const validatePrefixLength = helpers.regex(
  'validatePrefixLength',
  /^(12[0-8]|1[0-9]|[1-9][0-9]|[0-9])$/,
);

export default {
  mixins: [VuelidateMixin],
  setup() {
    return {
      v$: useVuelidate(),
    };
  },
  data() {
    return {
      $t: useI18n().t,
      form: {
        ipAddress: '',
        prefixLength: '',
      },
    };
  },
  validations() {
    return {
      form: {
        ipAddress: {
          required,
          validateIpv6,
        },
        prefixLength: {
          required,
          validatePrefixLength,
        },
      },
    };
  },
  methods: {
    handleSubmit() {
      this.v$.$touch();
      if (this.v$.$invalid) return;
      this.$emit('ok', {
        Address: this.form.ipAddress,
        PrefixLength: parseInt(this.form.prefixLength),
      });
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
      this.form.ipAddress = null;
      this.form.prefixLength = null;
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
